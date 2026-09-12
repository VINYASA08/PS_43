import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * GET /api/challenges/[id]/claim
 * Returns the claiming status of the challenge.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const challengeId = params.id;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: {
        id: true,
        publicTrackingId: true,
        title: true,
        domain: true,
        district: true,
        nodalStatus: true,
        matchedUniversities: true,
        claimedById: true,
        claimedInstitute: true,
        claimedAt: true,
        status: true,
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const isClaimed = challenge.claimedAt !== null || challenge.claimedById !== null;
    const isAvailableForClaim = challenge.nodalStatus === "routed_to_academia" && !isClaimed;

    let matched = [];
    if (challenge.matchedUniversities) {
      try {
        matched = JSON.parse(challenge.matchedUniversities);
      } catch {
        matched = [];
      }
    }

    return NextResponse.json({
      success: true,
      challengeId: challenge.id,
      trackingId: challenge.publicTrackingId,
      nodalStatus: challenge.nodalStatus,
      isClaimed,
      isAvailableForClaim,
      claimedInstitute: challenge.claimedInstitute,
      claimedAt: challenge.claimedAt,
      matchedUniversities: matched,
    });
  } catch (error: any) {
    console.error("[Challenge Claim GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch claim status" }, { status: 500 });
  }
}

/**
 * POST /api/challenges/[id]/claim
 * University Race-Condition Claim Endpoint:
 * Enforces atomic mutual exclusion at the database layer.
 * Returns HTTP 200 to the first university to claim.
 * Returns HTTP 409 Conflict to any subsequent or competing claims.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const challengeId = params.id;

    if (!challengeId) {
      return NextResponse.json({ error: "Challenge ID is required in URL parameters" }, { status: 400 });
    }

    // Parse request body if present
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Extract university identity from session or explicit payload
    let effectiveUniversityId = body.universityId;
    let effectiveUniversityName = body.universityName;

    const session = await getSession(req);
    if (session) {
      if (session.role !== UserRole.UNIVERSITY && session.role !== UserRole.GOV) {
        return NextResponse.json(
          { error: "Unauthorized. Only University accounts can claim academic challenges." },
          { status: 403 }
        );
      }
      effectiveUniversityId = effectiveUniversityId || session.userId;
      effectiveUniversityName = effectiveUniversityName || session.organization || session.name;
    }

    // If still missing, check if universityId was supplied in body and lookup organization
    if (effectiveUniversityId && !effectiveUniversityName) {
      const user = await prisma.user.findUnique({ where: { id: effectiveUniversityId } });
      if (user) {
        effectiveUniversityName = user.organization || user.name;
      }
    }

    if (!effectiveUniversityId || !effectiveUniversityName) {
      return NextResponse.json(
        { error: "Missing required university details: universityId and universityName must be provided" },
        { status: 400 }
      );
    }

    // Verify challenge existence
    const existing = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Check if challenge is routed to academia
    if (existing.nodalStatus !== "routed_to_academia") {
      return NextResponse.json(
        {
          error: "Challenge has already been claimed or is not open for claiming",
          nodalStatus: existing.nodalStatus,
          message: `Challenge is currently in '${existing.nodalStatus}' state, not open for academic claims.`,
        },
        { status: 409 }
      );
    }

    // STRICT ATOMIC RACE CONDITION LOCKING
    // Using Prisma updateMany with atomic conditional predicate:
    // WHERE id = challengeId AND nodalStatus = 'routed_to_academia' AND claimedAt IS NULL
    const claimTimestamp = new Date();
    const result = await prisma.challenge.updateMany({
      where: {
        id: challengeId,
        nodalStatus: "routed_to_academia",
        claimedAt: null, // Strict atomic lock predicate: must be unclaimed!
      },
      data: {
        claimedById: effectiveUniversityId,
        claimedInstitute: effectiveUniversityName,
        claimedAt: claimTimestamp,
        assignedToId: effectiveUniversityId,
        assignedInstitute: effectiveUniversityName,
        status: "IN_PROGRESS",
      },
    });

    // If result.count === 1: Exactly one row was modified -> WINNER
    if (result.count === 1) {
      // Record audit log entry
      await prisma.auditLog.create({
        data: {
          action: "CHALLENGE_CLAIMED_BY_UNIVERSITY",
          resource: "Challenge",
          resourceId: challengeId,
          challengeId: challengeId,
          userId: effectiveUniversityId,
          newState: JSON.stringify({
            claimedInstitute: effectiveUniversityName,
            claimedById: effectiveUniversityId,
            claimedAt: claimTimestamp.toISOString(),
            status: "IN_PROGRESS",
          }),
        },
      });

      return NextResponse.json(
        {
          success: true,
          challengeId,
          claimedInstitute: effectiveUniversityName,
          claimedById: effectiveUniversityId,
          claimedAt: claimTimestamp.toISOString(),
          message: "Challenge successfully claimed",
        },
        { status: 200 }
      );
    }

    // If result.count === 0: Lock was NOT acquired -> CONFLICT / LOCKOUT
    // Re-query to provide detailed lock context
    const current = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { claimedInstitute: true, claimedAt: true, nodalStatus: true },
    });

    return NextResponse.json(
      {
        error: "Challenge has already been claimed or is not open for claiming",
        claimedInstitute: current?.claimedInstitute || null,
        claimedAt: current?.claimedAt ? current.claimedAt.toISOString() : null,
        nodalStatus: current?.nodalStatus,
        message: "Race condition lockout: Another university has already acquired the lock on this challenge.",
      },
      { status: 409 }
    );
  } catch (error: any) {
    console.error("[Challenge Claim POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during challenge claim" },
      { status: 500 }
    );
  }
}
