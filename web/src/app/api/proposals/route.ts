import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createProposalSchema } from "@/lib/validation";
import { validateCsrfRequest } from "@/lib/csrf";
import { logAuditEvent } from "@/lib/rbac";
import { UserRole } from "@/lib/types";
import { matchIndustryPartners, sendSimulatedIndustryClaimEmails } from "@/lib/ai-matching";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");
    const status = searchParams.get("status");
    const submittedById = searchParams.get("submittedById");

    const where: Record<string, unknown> = {};
    if (challengeId) where.challengeId = challengeId;
    if (status && status !== "All" && status !== "all") where.status = status.toUpperCase();
    if (submittedById) where.submittedById = submittedById;

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        challenge: {
          select: {
            id: true,
            publicTrackingId: true,
            title: true,
            district: true,
            domain: true,
            status: true,
            urgency: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
            organization: true,
            designation: true,
          },
        },
        fundingCommitments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      proposals,
    });
  } catch (error) {
    console.error("[Proposals GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch proposals." }, { status: 500 });
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
      return NextResponse.json({ error: "Authentication required to submit proposals." }, { status: 401 });
    }

    // Role check: University, Gov or Expert
    if (session.role !== UserRole.UNIVERSITY && session.role !== UserRole.GOV && session.role !== UserRole.EXPERT) {
      return NextResponse.json(
        { error: "Only accredited University PIs and Experts may submit research proposals." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createProposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid proposal data." },
        { status: 400 }
      );
    }

    // Lookup challenge by id or publicTrackingId
    const challenge = await prisma.challenge.findFirst({
      where: {
        OR: [{ id: parsed.data.challengeId }, { publicTrackingId: parsed.data.challengeId }],
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Associated challenge not found." }, { status: 404 });
    }

    // Generate proposalRef
    const randomRef = `PR-${Math.floor(100 + Math.random() * 900)}`;

    const proposal = await prisma.proposal.create({
      data: {
        proposalRef: randomRef,
        challengeId: challenge.id,
        submittedById: session.userId,
        universityName: parsed.data.universityName || session.organization || "State Research Institution",
        title: parsed.data.title,
        abstract: parsed.data.abstract,
        methodology: parsed.data.methodology,
        budget: parsed.data.budget,
        timelineMonths: parsed.data.timelineMonths,
        stage: body.stage || "Prototype Ready",
        status: "SUBMITTED",
        attachedDocs: body.attachedDocs ? JSON.stringify(body.attachedDocs) : null,
      },
    });

    // Update challenge status to UNDER_REVIEW if still in OPEN_FOR_PROPOSALS
    if (challenge.status === "OPEN_FOR_PROPOSALS") {
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: { status: "UNDER_REVIEW" },
      });
    }

    // Feature 1: AI-to-Industry Matching
    // Simulate AI matching the proposal to 3 relevant industry partners based on CSR domain
    const matchedIndustries = matchIndustryPartners({
      title: proposal.title,
      abstract: parsed.data.abstract,
      domain: challenge.domain,
      budget: parsed.data.budget,
    });

    // Store matched industries on the proposal
    if (matchedIndustries.length > 0) {
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          matchedIndustries: JSON.stringify(matchedIndustries),
          industryClaimStatus: "OPEN",
        },
      });
    }

    // Send simulated email notifications to all 3 matched industry partners
    sendSimulatedIndustryClaimEmails(
      { id: proposal.id, title: proposal.title, proposalRef: proposal.proposalRef },
      matchedIndustries
    );

    await logAuditEvent(
      session.userId,
      "PROPOSAL_SUBMITTED",
      "Proposal",
      proposal.id,
      req,
      undefined,
      { proposalRef: proposal.proposalRef, title: proposal.title, budget: proposal.budget, matchedIndustries: matchedIndustries.length },
      challenge.id
    );

    return NextResponse.json(
      {
        success: true,
        proposal,
        message: "Translational research proposal submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Proposals POST Error]:", error);
    return NextResponse.json({ error: "Failed to submit proposal." }, { status: 500 });
  }
}
