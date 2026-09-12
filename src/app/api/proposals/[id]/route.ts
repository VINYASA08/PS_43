import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validateCsrfRequest } from "@/lib/csrf";
import { logAuditEvent } from "@/lib/rbac";
import { UserRole } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const proposal = await prisma.proposal.findFirst({
      where: {
        OR: [{ id }, { proposalRef: id }],
      },
      include: {
        challenge: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
            organization: true,
            designation: true,
            email: true,
          },
        },
        fundingCommitments: {
          include: {
            industryUser: {
              select: {
                id: true,
                name: true,
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error("[Proposal Detail GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch proposal details." }, { status: 500 });
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
    const existing = await prisma.proposal.findFirst({
      where: {
        OR: [{ id }, { proposalRef: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const isGov = session.role === UserRole.GOV;
    const isOwner = session.userId === existing.submittedById;

    if (!isGov && !isOwner) {
      return NextResponse.json({ error: "Unauthorized to update this proposal." }, { status: 403 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.title && isOwner) updateData.title = body.title;
    if (body.abstract && isOwner) updateData.abstract = body.abstract;
    if (body.methodology && isOwner) updateData.methodology = body.methodology;
    if (typeof body.budget === "number" && isOwner) updateData.budget = body.budget;
    if (body.budgetItems && isOwner) updateData.budgetItems = JSON.stringify(body.budgetItems);
    if (body.riskAssessment && isOwner) updateData.riskAssessment = body.riskAssessment;
    if (body.timelineMonths && isOwner) updateData.timelineMonths = body.timelineMonths;
    if (body.stage) updateData.stage = body.stage;
    if (body.status && (isGov || isOwner)) updateData.status = body.status;

    const updated = await prisma.proposal.update({
      where: { id: existing.id },
      data: updateData,
    });

    await logAuditEvent(
      session.userId,
      "PROPOSAL_UPDATED",
      "Proposal",
      existing.id,
      req,
      { status: existing.status },
      updateData,
      existing.challengeId
    );

    return NextResponse.json({
      success: true,
      proposal: updated,
      message: "Proposal updated successfully.",
    });
  } catch (error) {
    console.error("[Proposal Detail PUT Error]:", error);
    return NextResponse.json({ error: "Failed to update proposal." }, { status: 500 });
  }
}

export { PUT as PATCH };
