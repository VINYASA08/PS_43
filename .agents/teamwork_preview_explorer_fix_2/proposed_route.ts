import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorizeProblemWithAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { challengeId, sarpanchId, nodalOfficerId } = await req.json();

    const officerId = nodalOfficerId || sarpanchId;

    if (!challengeId || !officerId) {
      return NextResponse.json({ error: "Missing challengeId or officerId" }, { status: 400 });
    }

    // Verify official (supports test-nodal-id, legacy test-sarpanch-id, or valid GOV user)
    let officer = null;
    if (officerId === "test-sarpanch-id" || officerId === "test-nodal-id") {
      officer = await prisma.user.findFirst({ where: { role: "GOV" } });
    } else {
      officer = await prisma.user.findUnique({ where: { id: officerId } });
    }

    if (!officer || officer.role !== "GOV") {
      return NextResponse.json({ error: "Unauthorized. Must be a verified Government official." }, { status: 403 });
    }

    // Fetch challenge
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // 1. Mark as verified by District Nodal Officer
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { status: "CITIZEN_VERIFIED" },
    });

    // 2. Trigger AI Categorization, Translation, and Deduplication pipeline!
    const categorization = await categorizeProblemWithAI({
      title: challenge.title,
      description: challenge.description,
      district: challenge.district,
      location: challenge.location,
      evidenceNotes: "Verified by District Nodal Officer.",
    });

    // 3. Handle Deduplication Logic
    if (categorization.isDuplicate && categorization.duplicateOfId) {
      // It's a duplicate! Link it and increment the canonical issue's count.
      await prisma.$transaction([
        prisma.challenge.update({
          where: { id: challengeId },
          data: {
            duplicateOfId: categorization.duplicateOfId,
            status: "CLOSED",
          },
        }),
        prisma.challenge.update({
          where: { id: categorization.duplicateOfId },
          data: {
            verifiedByCount: { increment: 1 },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Marked as duplicate of existing canonical issue.",
        duplicateOfTrackingId: categorization.duplicateOfTrackingId,
      });
    }

    // 4. Update the challenge with AI metadata and route to appropriate track entity
    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        domain: categorization.domain,
        urgency: categorization.urgency,
        track: categorization.track,
        trackRouting: categorization.trackRouting,
        triageReasoning: categorization.triageReasoning,
        triageConfidence: categorization.triageConfidence,
        targetEntityLevel: categorization.targetEntityLevel,
        aiConfidence: categorization.confidence,
        aiReasoning: categorization.reasoning,
        assignedInstitute: categorization.suggestedInstitute,
        slaDeadline: categorization.slaDeadline,
        status: "UNDER_REVIEW",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "GOV_VERIFIED_AND_AI_ROUTED",
        resource: "Challenge",
        resourceId: challengeId,
        challengeId: challengeId,
        userId: officer.id,
        newState: JSON.stringify({
          verifiedBy: "District Nodal Officer",
          domain: updated.domain,
          track: updated.track,
          trackRouting: updated.trackRouting,
          institute: updated.assignedInstitute,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      challengeId: updated.id,
      trackingId: updated.publicTrackingId,
      track: updated.track,
      trackRouting: updated.trackRouting,
      status: updated.status,
      verifiedAt: new Date().toISOString(),
      message: "Challenge locally verified and successfully routed via AI.",
      routing: categorization,
    });
  } catch (error: any) {
    console.error("[Mobile Verify Error]:", error);
    return NextResponse.json({ error: "Failed to verify challenge" }, { status: 500 });
  }
}
