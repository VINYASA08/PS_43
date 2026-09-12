import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validateCsrfRequest } from "@/lib/csrf";
import { logAuditEvent } from "@/lib/rbac";
import { UserRole } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get("proposalId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (proposalId) where.proposalId = proposalId;
    if (status && status !== "All" && status !== "all") where.status = status.toUpperCase();

    const commitments = await prisma.fundingCommitment.findMany({
      where,
      include: {
        proposal: {
          include: {
            challenge: {
              select: {
                id: true,
                publicTrackingId: true,
                title: true,
                district: true,
                domain: true,
              },
            },
          },
        },
        industryUser: {
          select: {
            id: true,
            name: true,
            organization: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      commitments,
    });
  } catch (error) {
    console.error("[Funds GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch funding commitments." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const csrf = validateCsrfRequest(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
    }

    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required to pledge funding." }, { status: 401 });
    }

    if (session.role !== UserRole.INDUSTRY && session.role !== UserRole.GOV) {
      return NextResponse.json({ error: "Only Industry partners and Gov administrators can commit funding." }, { status: 403 });
    }

    const body = await req.json();
    const { proposalId, challengeId, amount, type = "CSR", notes, corporateName, panNumber, csrRegistrationNo } = body;

    let targetProposalId = proposalId;

    // If challengeId was passed instead of proposalId, find first proposal for challenge
    if (!targetProposalId && challengeId) {
      const challenge = await prisma.challenge.findFirst({
        where: {
          OR: [{ id: challengeId }, { publicTrackingId: challengeId }],
        },
        include: { proposals: true },
      });
      if (challenge && challenge.proposals.length > 0) {
        targetProposalId = challenge.proposals[0].id;
      }
    }

    if (!targetProposalId) {
      return NextResponse.json({ error: "Target proposal ID is required." }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: targetProposalId },
      include: { challenge: true },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
    }

    const numAmount = parseFloat(amount) || proposal.budget || 350000;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const escrowRef = `JH-ESCROW-2026-CSR-${randomSuffix}`;

    // Standard tripartite 30-40-30 tranches
    const tranches = JSON.stringify([
      {
        tranche: 1,
        percentage: 30,
        amount: numAmount * 0.3,
        milestone: "DPR Approval & Baseline Survey",
        status: "PLEDGED",
      },
      {
        tranche: 2,
        percentage: 40,
        amount: numAmount * 0.4,
        milestone: "Pilot Deployment & Field Sensor Verification",
        status: "PENDING",
      },
      {
        tranche: 3,
        percentage: 30,
        amount: numAmount * 0.3,
        milestone: "Collector Sign-off & Citizen Redressal Handover",
        status: "PENDING",
      },
    ]);

    const commitment = await prisma.fundingCommitment.create({
      data: {
        escrowRef,
        proposalId: proposal.id,
        industryUserId: session.userId,
        corporateName: corporateName || session.organization || "Corporate CSR Partner",
        panNumber: panNumber || "AAACT1234F",
        csrRegistrationNo: csrRegistrationNo || "CSR0001842",
        amount: numAmount,
        type,
        status: "ESCROWED",
        notes: notes || "Section 135 CSR allocation locked in State Escrow Node.",
        tranches,
        mouSigned: true,
        mouSignedAt: new Date(),
      },
    });

    // Mark proposal as FUNDED
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "FUNDED" },
    });

    // Mark challenge as IN_PROGRESS
    await prisma.challenge.update({
      where: { id: proposal.challengeId },
      data: { status: "IN_PROGRESS" },
    });

    await logAuditEvent(
      session.userId,
      "ESCROW_COMMITTED",
      "FundingCommitment",
      commitment.id,
      req,
      undefined,
      { escrowRef: commitment.escrowRef, amount: commitment.amount },
      proposal.challengeId
    );

    return NextResponse.json(
      {
        success: true,
        commitment,
        message: "CSR escrow fund committed successfully. MoA digitally executed.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Funds POST Error]:", error);
    return NextResponse.json({ error: "Failed to record funding commitment." }, { status: 500 });
  }
}
