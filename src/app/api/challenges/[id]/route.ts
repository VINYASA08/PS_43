import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validateCsrfRequest } from "@/lib/csrf";
import { logAuditEvent } from "@/lib/rbac";
import { UserRole } from "@/lib/types";
import { sendExternalAlert } from "@/lib/notifications";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing challenge identifier" }, { status: 400 });
    }

    // Lookup by id or publicTrackingId
    const challenge = await prisma.challenge.findFirst({
      where: {
        OR: [{ id }, { publicTrackingId: id }],
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            organization: true,
            district: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            organization: true,
          },
        },
        proposals: {
          include: {
            fundingCommitments: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error("[Challenge Detail GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch challenge details." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const csrf = validateCsrfRequest(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
    }

    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const existing = await prisma.challenge.findFirst({
      where: {
        OR: [{ id }, { publicTrackingId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Role checks: Gov has full update access; University can claim or advance prototyping; Citizen can update own
    const isGov = session.role === UserRole.GOV;
    const isOwner = session.userId === existing.reportedById;
    const isUni = session.role === UserRole.UNIVERSITY;

    if (!isGov && !isOwner && !isUni) {
      return NextResponse.json({ error: "Unauthorized to update this challenge." }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title && (isGov || isOwner)) updateData.title = body.title;
    if (body.description && (isGov || isOwner)) updateData.description = body.description;
    if (body.status) updateData.status = body.status;
    if (body.assignedInstitute && (isGov || isUni)) updateData.assignedInstitute = body.assignedInstitute;
    if (body.assignedToId && isGov) updateData.assignedToId = body.assignedToId;
    if (body.urgency && isGov) updateData.urgency = body.urgency;
    if (typeof body.citizenVerified === "boolean") updateData.citizenVerified = body.citizenVerified;
    if (typeof body.escalationLevel === "number" && isGov) updateData.escalationLevel = body.escalationLevel;
    if (body.triageReasoning) updateData.triageReasoning = body.triageReasoning;

    const updated = await prisma.challenge.update({
      where: { id: existing.id },
      data: updateData,
    });

    await logAuditEvent(
      session.userId,
      "CHALLENGE_UPDATED",
      "Challenge",
      existing.id,
      req,
      { status: existing.status, assignedInstitute: existing.assignedInstitute },
      updateData,
      existing.id
    );

    if (existing.status !== "RESOLVED" && updateData.status === "RESOLVED") {
      sendExternalAlert("CITIZEN_AND_UNIVERSITY", "CHALLENGE_RESOLVED", {
        challengeId: existing.id,
        title: existing.title,
        status: "RESOLVED",
        message: "Final 30% escrow tranche released."
      });
    }

    return NextResponse.json({
      success: true,
      challenge: updated,
      message: "Challenge updated successfully.",
    });
  } catch (error) {
    console.error("[Challenge Detail PUT Error]:", error);
    return NextResponse.json({ error: "Failed to update challenge." }, { status: 500 });
  }
}

export { PUT as PATCH };

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const csrf = validateCsrfRequest(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
    }

    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.challenge.findFirst({
      where: {
        OR: [{ id }, { publicTrackingId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const isGov = session.role === UserRole.GOV;
    const isOwner = session.userId === existing.reportedById;

    if (!isGov && !isOwner) {
      return NextResponse.json({ error: "Unauthorized to delete this challenge." }, { status: 403 });
    }

    // Soft delete via prisma query extension
    await prisma.challenge.delete({
      where: { id: existing.id },
    });

    await logAuditEvent(
      session.userId,
      "CHALLENGE_SOFT_DELETED",
      "Challenge",
      existing.id,
      req,
      { publicTrackingId: existing.publicTrackingId },
      undefined,
      existing.id
    );

    return NextResponse.json({
      success: true,
      message: "Challenge deleted successfully.",
    });
  } catch (error) {
    console.error("[Challenge Detail DELETE Error]:", error);
    return NextResponse.json({ error: "Failed to delete challenge." }, { status: 500 });
  }
}
