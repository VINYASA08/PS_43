import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, logAuditEvent } from "@/lib/rbac";
import { validateCsrfRequest } from "@/lib/csrf";
import { UserRole } from "@/lib/types";

async function handleChallengeOverride(req: NextRequest, session: any) {
  try {
    const csrf = validateCsrfRequest(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    const {
      challengeId,
      newStatus,
      overrideReason,
      reason,
      assignedUniversityId,
      assignedInstitute,
      targetUniversity,
      targetGovBody,
      forceReroute,
      action,
      escalationLevel,
    } = body;

    if (!challengeId) {
      return NextResponse.json({ error: "challengeId is required." }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
    }

    const effectiveReason = overrideReason || reason || "State Admin Master Override executed";
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // 1. Force status change if specified
    if (newStatus) {
      updateData.status = newStatus;
    }

    // 2. Handle target institute / force assignment
    const effectiveInstitute = assignedInstitute || targetUniversity;
    if (effectiveInstitute || action === "FORCE_ASSIGN") {
      if (effectiveInstitute) {
        updateData.assignedInstitute = effectiveInstitute;
        updateData.claimedInstitute = effectiveInstitute;
      }
      if (assignedUniversityId) {
        updateData.assignedToId = assignedUniversityId;
        updateData.claimedById = assignedUniversityId;
      }
      updateData.nodalStatus = "routed_to_academia";
      if (!newStatus) {
        updateData.status = "IN_PROGRESS";
      }
      updateData.claimedAt = new Date();
    }

    // 3. Handle diversion to Gov line department
    if (action === "DIVERT_GOV" || targetGovBody) {
      updateData.nodalStatus = "diverted_to_gov";
      updateData.divertedTarget = targetGovBody || "State Line Department";
      updateData.divertedAt = new Date();
    }

    // 4. Handle force re-route to academia
    if (action === "RE_ROUTE_ACADEMIA" || forceReroute) {
      updateData.nodalStatus = "routed_to_academia";
      if (!newStatus) {
        updateData.status = "OPEN_FOR_PROPOSALS";
      }
    }

    // 5. Escalation level
    if (escalationLevel !== undefined) {
      updateData.escalationLevel = Number(escalationLevel);
    } else if (action === "ESCALATE") {
      updateData.escalationLevel = 3; // Apex Chief Secretary level
    }

    // Record review metadata
    updateData.nodalReviewedAt = new Date();
    updateData.rejectionReason = null; // Clear any previous rejection upon override

    // Execute atomic update
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: updateData,
    });

    // Log to Audit Trail
    await logAuditEvent(
      session.userId,
      "STATE_ADMIN_MASTER_OVERRIDE",
      "Challenge",
      challengeId,
      req,
      {
        previousStatus: challenge.status,
        previousNodalStatus: challenge.nodalStatus,
        previousAssigned: challenge.assignedInstitute,
        previousEscalation: challenge.escalationLevel,
      },
      {
        newStatus: updatedChallenge.status,
        newNodalStatus: updatedChallenge.nodalStatus,
        newAssigned: updatedChallenge.assignedInstitute,
        newEscalation: updatedChallenge.escalationLevel,
        reason: effectiveReason,
        action: action || "STATE_OVERRIDE",
      },
      challengeId
    );

    return NextResponse.json({
      success: true,
      challenge: updatedChallenge,
      message: "Master override applied successfully",
    });
  } catch (error) {
    console.error("[State Challenge Override Error]:", error);
    return NextResponse.json(
      { error: "Failed to apply master override on challenge." },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleChallengeOverride, [UserRole.STATE_ADMIN, UserRole.GOV]);
export const PUT = withAuth(handleChallengeOverride, [UserRole.STATE_ADMIN, UserRole.GOV]);
