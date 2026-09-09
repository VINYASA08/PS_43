import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * GET /api/proposals/[id]/claim-industry
 * Returns the industry claiming status of the proposal.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const proposalId = params.id;

    const proposal = await prisma.proposal.findFirst({
      where: {
        OR: [{ id: proposalId }, { proposalRef: proposalId }],
      },
      select: {
        id: true,
        proposalRef: true,
        title: true,
        status: true,
        matchedIndustries: true,
        claimedIndustryId: true,
        claimedIndustryName: true,
        industryClaimStatus: true,
        industryClaimedAt: true,
        challenge: {
          select: {
            id: true,
            domain: true,
            publicTrackingId: true,
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const isClaimed = proposal.industryClaimedAt !== null || proposal.claimedIndustryId !== null;
    const isAvailableForClaim = proposal.industryClaimStatus === "OPEN" && !isClaimed;

    let matched: unknown[] = [];
    if (proposal.matchedIndustries) {
      try {
        matched = JSON.parse(proposal.matchedIndustries);
      } catch {
        matched = [];
      }
    }

    return NextResponse.json({
      success: true,
      proposalId: proposal.id,
      proposalRef: proposal.proposalRef,
      industryClaimStatus: proposal.industryClaimStatus,
      isClaimed,
      isAvailableForClaim,
      claimedIndustryName: proposal.claimedIndustryName,
      claimedAt: proposal.industryClaimedAt,
      matchedIndustries: matched,
    });
  } catch (error: unknown) {
    console.error("[Industry Claim GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch industry claim status" }, { status: 500 });
  }
}

/**
 * POST /api/proposals/[id]/claim-industry
 * Industry Race-Condition Claim Endpoint:
 * Enforces atomic mutual exclusion at the database layer (same pattern as university claim).
 * Returns HTTP 200 to the first industry partner to claim.
 * Returns HTTP 409 Conflict to any subsequent or competing claims.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const proposalId = params.id;

    if (!proposalId) {
      return NextResponse.json({ error: "Proposal ID is required in URL parameters" }, { status: 400 });
    }

    // Parse request body if present
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Extract industry identity from session or explicit payload
    let effectiveIndustryId = body.industryId as string | undefined;
    let effectiveIndustryName = body.industryName as string | undefined;

    const session = await getSession(req);
    if (session) {
      if (session.role !== UserRole.INDUSTRY && session.role !== UserRole.GOV) {
        return NextResponse.json(
          { error: "Unauthorized. Only Industry accounts can claim proposal funding." },
          { status: 403 }
        );
      }
      effectiveIndustryId = effectiveIndustryId || session.userId;
      effectiveIndustryName = effectiveIndustryName || session.organization || session.name;
    }

    // If still missing, check if industryId was supplied in body and lookup organization
    if (effectiveIndustryId && !effectiveIndustryName) {
      const user = await prisma.user.findUnique({ where: { id: effectiveIndustryId } });
      if (user) {
        effectiveIndustryName = user.organization || user.name;
      }
    }

    if (!effectiveIndustryId || !effectiveIndustryName) {
      return NextResponse.json(
        { error: "Missing required industry details: industryId and industryName must be provided" },
        { status: 400 }
      );
    }

    // Verify proposal existence
    const existing = await prisma.proposal.findFirst({
      where: {
        OR: [{ id: proposalId }, { proposalRef: proposalId }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Check if proposal is open for industry claiming
    if (existing.industryClaimStatus !== "OPEN") {
      return NextResponse.json(
        {
          error: "Proposal has already been claimed or is not open for industry claiming",
          industryClaimStatus: existing.industryClaimStatus,
          message: `Proposal is currently in '${existing.industryClaimStatus}' state, not open for industry claims.`,
        },
        { status: 409 }
      );
    }

    // STRICT ATOMIC RACE CONDITION LOCKING
    // Using Prisma updateMany with atomic conditional predicate:
    // WHERE id = proposalId AND industryClaimStatus = 'OPEN' AND industryClaimedAt IS NULL
    const claimTimestamp = new Date();
    const result = await prisma.proposal.updateMany({
      where: {
        id: existing.id,
        industryClaimStatus: "OPEN",
        industryClaimedAt: null, // Strict atomic lock predicate: must be unclaimed!
      },
      data: {
        claimedIndustryId: effectiveIndustryId,
        claimedIndustryName: effectiveIndustryName,
        industryClaimStatus: "CLAIMED",
        industryClaimedAt: claimTimestamp,
        status: "FUNDED",
      },
    });

    // If result.count === 1: Exactly one row was modified -> WINNER
    if (result.count === 1) {
      // Record audit log entry
      await prisma.auditLog.create({
        data: {
          action: "PROPOSAL_CLAIMED_BY_INDUSTRY",
          resource: "Proposal",
          resourceId: existing.id,
          challengeId: existing.challengeId,
          userId: effectiveIndustryId,
          newState: JSON.stringify({
            claimedIndustryName: effectiveIndustryName,
            claimedIndustryId: effectiveIndustryId,
            industryClaimedAt: claimTimestamp.toISOString(),
            industryClaimStatus: "CLAIMED",
          }),
        },
      });

      return NextResponse.json(
        {
          success: true,
          proposalId: existing.id,
          proposalRef: existing.proposalRef,
          claimedIndustryName: effectiveIndustryName,
          claimedIndustryId: effectiveIndustryId,
          claimedAt: claimTimestamp.toISOString(),
          message: "Proposal funding successfully claimed. Other industry partners are locked out.",
        },
        { status: 200 }
      );
    }

    // If result.count === 0: Lock was NOT acquired -> CONFLICT / LOCKOUT
    const current = await prisma.proposal.findUnique({
      where: { id: existing.id },
      select: { claimedIndustryName: true, industryClaimedAt: true, industryClaimStatus: true },
    });

    return NextResponse.json(
      {
        error: "Proposal has already been claimed by another industry partner",
        claimedIndustryName: current?.claimedIndustryName || null,
        claimedAt: current?.industryClaimedAt ? current.industryClaimedAt.toISOString() : null,
        industryClaimStatus: current?.industryClaimStatus,
        message: "Race condition lockout: Another industry partner has already acquired the lock on this proposal.",
      },
      { status: 409 }
    );
  } catch (error: unknown) {
    console.error("[Industry Claim POST Error]:", error);
    const errMsg = error instanceof Error ? error.message : "Internal server error during industry claim";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
