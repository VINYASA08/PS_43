import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { categorizeProblemWithAI } from "@/lib/ai";

const mobileSubmitSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  district: z.string(),
  location: z.string(),
  reporterId: z.string().optional(),
  evidenceUrl: z.string().optional(),
  mediaUrl: z.string().optional(),
  track: z.string().optional(),
  domain: z.string().optional(),
  urgency: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = mobileSubmitSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const { title, description, district, location, reporterId, evidenceUrl, mediaUrl, track, domain, urgency } = parsed.data;

    // Resolve effective reporterId to ensure valid foreign key reference
    let effectiveReporterId: string | null = null;
    if (reporterId) {
      const existingUser = await prisma.user.findUnique({ where: { id: reporterId } });
      if (existingUser) {
        effectiveReporterId = existingUser.id;
      }
    }

    if (!effectiveReporterId) {
      const activeCitizen = await prisma.user.findFirst({
        where: { role: "CITIZEN", status: "ACTIVE" },
      });
      effectiveReporterId = activeCitizen?.id || "cmtngm5010005ugsyunbe2ich";
    }

    const media = evidenceUrl || mediaUrl;

    // Run AI multi-track triage
    let aiCategorization: any = null;
    try {
      aiCategorization = await categorizeProblemWithAI({
        title,
        description,
        district,
        location,
        evidenceNotes: media ? `Evidence Media: ${media}` : undefined,
        domain,
        urgency,
        track,
      });
    } catch (aiErr) {
      console.warn("[Mobile Submit]: AI triage caught error:", aiErr);
    }

    const finalTrack = track || aiCategorization?.track || "TRACK_A_INNOVATION";
    const finalTrackRouting = aiCategorization?.trackRouting || null;
    const finalTriageReasoning = aiCategorization?.triageReasoning || aiCategorization?.reasoning || null;
    const finalTriageConfidence = aiCategorization?.triageConfidence ?? aiCategorization?.confidence ?? null;
    const finalEntityLevel = aiCategorization?.targetEntityLevel || null;
    const finalDomain = domain || aiCategorization?.domain || "Public Service Delivery";
    const finalUrgency = urgency || aiCategorization?.urgency || "MEDIUM";
    const finalInstitute = (finalTrack === "TRACK_A_INNOVATION" ? finalTrackRouting : aiCategorization?.suggestedInstitute) || null;
    const slaDeadline = aiCategorization?.slaDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Generate Tracking ID (e.g., IN-JH-2026-103)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `IN-JH-${new Date().getFullYear()}-${randomSuffix}`;

    const challenge = await prisma.challenge.create({
      data: {
        publicTrackingId: trackingId,
        title,
        description,
        district,
        location,
        domain: finalDomain,
        urgency: finalUrgency,
        track: finalTrack,
        trackRouting: finalTrackRouting,
        triageReasoning: finalTriageReasoning,
        triageConfidence: finalTriageConfidence,
        targetEntityLevel: finalEntityLevel,
        assignedInstitute: finalInstitute,
        slaDeadline,
        status: "REPORTED",
        reportedById: effectiveReporterId,
        evidence: media ? JSON.stringify({ media }) : null,
      },
    });

    return NextResponse.json({
      success: true,
      trackingId,
      challengeId: challenge.id,
      track: challenge.track,
      trackRouting: challenge.trackRouting,
      status: challenge.status,
    });
  } catch (error: any) {
    console.error("[Mobile Submit Error]:", error);
    return NextResponse.json({ error: "Failed to submit challenge" }, { status: 500 });
  }
}
