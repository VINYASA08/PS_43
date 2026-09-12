import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get("proposalId");

    if (!proposalId) {
      return NextResponse.json(
        { error: "proposalId is required" },
        { status: 400 }
      );
    }

    // Optional: RBAC check - ensure user is either the submitter or has a funding commitment, 
    // or is a gov/admin. For now, checking if proposal exists.
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { fundingCommitments: true }
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const isSubmitter = proposal.submittedById === session.userId;
    const isFunder = proposal.fundingCommitments.some(f => f.industryUserId === session.userId);
    const isGov = session.role === "GOV"; // assuming GOV role has access

    if (!isSubmitter && !isFunder && !isGov) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { proposalId },
      include: {
        sender: {
          select: { id: true, name: true, role: true, organization: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("[Chat GET API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    const senderId = session?.userId;

    if (!senderId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { proposalId, content } = body;

    if (!proposalId || !content) {
      return NextResponse.json(
        { error: "proposalId and content are required" },
        { status: 400 }
      );
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { fundingCommitments: true }
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const isSubmitter = proposal.submittedById === senderId;
    const isFunder = proposal.fundingCommitments.some(f => f.industryUserId === senderId);
    const isGov = session.role === "GOV";

    if (!isSubmitter && !isFunder && !isGov) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        proposalId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true, organization: true },
        },
      },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("[Chat POST API Error]:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
