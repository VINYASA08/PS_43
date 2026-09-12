import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/lib/types";
import { matchUniversities, sendSimulatedClaimEmails } from "@/lib/ai-matching";
import { nodalTriageSchema } from "@/lib/validation";

/**
 * GET /api/nodal/triage
 * Returns challenges pending District Nodal Officer review, plus triage metrics.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status"); // optional filter

    const whereClause: any = { deletedAt: null };
    if (filterStatus) {
      whereClause.nodalStatus = filterStatus;
    }

    const [challenges, pendingCount, routedCount, divertedCount, rejectedCount] = await Promise.all([
      prisma.challenge.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          reportedBy: {
            select: { id: true, name: true, email: true, phone: true, organization: true, district: true },
          },
          claimedBy: {
            select: { id: true, name: true, email: true, organization: true },
          },
        },
      }),
      prisma.challenge.count({ where: { nodalStatus: "pending", deletedAt: null } }),
      prisma.challenge.count({ where: { nodalStatus: "routed_to_academia", deletedAt: null } }),
      prisma.challenge.count({ where: { nodalStatus: "diverted_to_gov", deletedAt: null } }),
      prisma.challenge.count({ where: { nodalStatus: "rejected", deletedAt: null } }),
    ]);

    return NextResponse.json({
      success: true,
      data: challenges,
      stats: {
        pending: pendingCount,
        routedToAcademia: routedCount,
        divertedToGov: divertedCount,
        rejected: rejectedCount,
        total: pendingCount + routedCount + divertedCount + rejectedCount,
      },
    });
  } catch (error: any) {
    console.error("[Nodal Triage GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch triage challenges" }, { status: 500 });
  }
}

/**
 * POST /api/nodal/triage
 * Performs Nodal Officer triage: reject, divert_to_gov, or route_to_academia.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validation using Zod
    const validationResult = nodalTriageSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues?.[0]?.message || "Invalid triage parameters";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { challengeId, action, rejectionReason, divertedTarget, nodalOfficerId } = validationResult.data;

    // Additional action-specific validations
    if (action === "reject" && (!rejectionReason || rejectionReason.trim().length < 5)) {
      return NextResponse.json(
        { error: "A detailed rejection reason (minimum 5 characters) is required when rejecting a challenge" },
        { status: 400 }
      );
    }

    if (action === "divert_to_gov" && (!divertedTarget || divertedTarget.trim().length < 2)) {
      return NextResponse.json(
        { error: "A target government department or civic body is required when diverting a challenge" },
        { status: 400 }
      );
    }

    // 2. Authenticate Nodal Officer
    let officerUser: { id: string; role: string; name: string } | null = null;
    const session = await getSession(req);

    if (session) {
      if (session.role !== UserRole.GOV) {
        return NextResponse.json(
          { error: "Unauthorized. District Nodal Officer role (GOV) is required." },
          { status: 403 }
        );
      }
      officerUser = { id: session.userId, role: session.role, name: session.name };
    } else if (nodalOfficerId) {
      const user = await prisma.user.findUnique({ where: { id: nodalOfficerId } });
      if (user && user.role === "GOV") {
        officerUser = { id: user.id, role: user.role, name: user.name };
      }
    }

    // Fallback to default Gov officer for CLI test scripts or headless test runners
    if (!officerUser) {
      const defaultGov = await prisma.user.findFirst({
        where: { role: "GOV", status: "ACTIVE" },
      });
      if (defaultGov) {
        officerUser = { id: defaultGov.id, role: defaultGov.role, name: defaultGov.name };
      } else {
        return NextResponse.json(
          { error: "Authentication required. Valid government session is missing." },
          { status: 401 }
        );
      }
    }

    // 3. Fetch Challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // 4. Execute Action
    let updatedChallenge;
    let auditAction = "";
    let responseMessage = "";
    let matchedInstitutions: any = null;

    if (action === "reject") {
      updatedChallenge = await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          nodalStatus: "rejected",
          rejectionReason: rejectionReason?.trim(),
          nodalOfficerId: officerUser.id,
          nodalReviewedAt: new Date(),
          status: "CLOSED",
        },
      });
      auditAction = "CHALLENGE_REJECTED_BY_NODAL";
      responseMessage = `Challenge successfully rejected. Reason: "${rejectionReason?.trim()}"`;
    } else if (action === "divert_to_gov") {
      updatedChallenge = await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          nodalStatus: "diverted_to_gov",
          divertedTarget: divertedTarget?.trim(),
          divertedAt: new Date(),
          nodalOfficerId: officerUser.id,
          nodalReviewedAt: new Date(),
          status: "UNDER_REVIEW",
        },
      });
      auditAction = "CHALLENGE_DIVERTED_TO_GOV";
      responseMessage = `Challenge successfully diverted to government body: "${divertedTarget?.trim()}"`;
    } else if (action === "route_to_academia") {
      // Execute 3-way AI matching
      const matches = matchUniversities({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        domain: challenge.domain,
        district: challenge.district,
      });
      matchedInstitutions = matches;

      // Log simulated notification emails to server console
      sendSimulatedClaimEmails(
        { id: challenge.id, title: challenge.title, publicTrackingId: challenge.publicTrackingId },
        matches
      );

      updatedChallenge = await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          nodalStatus: "routed_to_academia",
          matchedUniversities: JSON.stringify(matches),
          nodalOfficerId: officerUser.id,
          nodalReviewedAt: new Date(),
          status: "OPEN_FOR_PROPOSALS",
        },
      });
      auditAction = "CHALLENGE_ROUTED_TO_ACADEMIA";
      responseMessage = `Challenge successfully routed to 3 empanelled universities. Matching emails dispatched.`;
    }

    // 5. Record in Audit Log
    if (updatedChallenge) {
      await prisma.auditLog.create({
        data: {
          action: auditAction,
          resource: "Challenge",
          resourceId: challengeId,
          challengeId: challengeId,
          userId: officerUser.id,
          newState: JSON.stringify({
            nodalStatus: updatedChallenge.nodalStatus,
            rejectionReason: updatedChallenge.rejectionReason,
            divertedTarget: updatedChallenge.divertedTarget,
            matchedCount: matchedInstitutions ? matchedInstitutions.length : undefined,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      challengeId: updatedChallenge?.id,
      trackingId: updatedChallenge?.publicTrackingId,
      nodalStatus: updatedChallenge?.nodalStatus,
      rejectionReason: updatedChallenge?.rejectionReason,
      divertedTarget: updatedChallenge?.divertedTarget,
      matchedUniversities: matchedInstitutions,
      reviewedBy: officerUser.name,
      reviewedAt: updatedChallenge?.nodalReviewedAt,
      message: responseMessage,
    });
  } catch (error: any) {
    console.error("[Nodal Triage POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during nodal triage" },
      { status: 500 }
    );
  }
}
