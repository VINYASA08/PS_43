import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, logAuditEvent } from "@/lib/rbac";
import { validateCsrfRequest } from "@/lib/csrf";
import { UserRole } from "@/lib/types";

async function handleRevokeFunding(req: NextRequest, session: any) {
  try {
    const csrf = validateCsrfRequest(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    const { fundingId, commitmentId, proposalId, reason, breachReason, reopenProposal = true } = body;

    const targetId = commitmentId || fundingId;
    const revocationReason = reason || breachReason || "Compliance breach under statutory review";

    let commitment = null;

    if (targetId) {
      commitment = await prisma.fundingCommitment.findUnique({
        where: { id: targetId },
        include: { proposal: true },
      });
    } else if (proposalId) {
      commitment = await prisma.fundingCommitment.findFirst({
        where: {
          proposalId,
          status: { in: ["PLEDGED", "ESCROWED", "DISBURSED"] },
        },
        include: { proposal: true },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!commitment && !proposalId) {
      return NextResponse.json(
        { error: "A valid commitmentId, fundingId, or proposalId is required." },
        { status: 400 }
      );
    }

    const effectiveProposalId = commitment?.proposalId || proposalId;

    // Use transaction to atomically update commitment, proposal, and audit log
    const result = await prisma.$transaction(async (tx) => {
      let updatedCommitment = null;

      if (commitment) {
        updatedCommitment = await tx.fundingCommitment.update({
          where: { id: commitment.id },
          data: {
            status: "CANCELLED",
            notes: commitment.notes
              ? `${commitment.notes} | [REVOKED BY STATE_ADMIN]: ${revocationReason}`
              : `[REVOKED BY STATE_ADMIN]: ${revocationReason}`,
          },
        });
      }

      let updatedProposal = null;
      if (effectiveProposalId) {
        const prop = await tx.proposal.findUnique({ where: { id: effectiveProposalId } });
        if (prop) {
          updatedProposal = await tx.proposal.update({
            where: { id: effectiveProposalId },
            data: {
              status: prop.status === "FUNDED" ? "APPROVED" : prop.status,
              industryClaimStatus: reopenProposal ? "OPEN" : prop.industryClaimStatus,
              claimedIndustryId: reopenProposal ? null : prop.claimedIndustryId,
              claimedIndustryName: reopenProposal ? null : prop.claimedIndustryName,
            },
          });
        }
      }

      return { updatedCommitment, updatedProposal };
    });

    await logAuditEvent(
      session.userId,
      "STATE_ADMIN_REVOKE_FUNDING",
      "FundingCommitment",
      commitment ? commitment.id : (effectiveProposalId || "N/A"),
      req,
      {
        previousStatus: commitment?.status || "UNKNOWN",
        proposalId: effectiveProposalId,
      },
      {
        newStatus: "CANCELLED",
        reason: revocationReason,
        reopened: reopenProposal,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Funding revoked and returned to escrow",
      commitment: result.updatedCommitment,
      proposal: result.updatedProposal,
    });
  } catch (error) {
    console.error("[State Revoke Funding Error]:", error);
    return NextResponse.json(
      { error: "Failed to revoke funding commitment." },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleRevokeFunding, [UserRole.STATE_ADMIN, UserRole.GOV]);
export const PUT = withAuth(handleRevokeFunding, [UserRole.STATE_ADMIN, UserRole.GOV]);
