import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createChallengeSchema } from "@/lib/validation";
import { validateCsrfRequest } from "@/lib/csrf";
import { logAuditEvent } from "@/lib/rbac";
import { categorizeProblemWithAI } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const district = searchParams.get("district");
    const urgency = searchParams.get("urgency");
    const status = searchParams.get("status");
    const track = searchParams.get("track");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const where: Record<string, unknown> = {};

    if (track && track !== "All" && track !== "all") {
      where.track = track;
    }
    if (domain && domain !== "All" && domain !== "all") {
      where.domain = domain;
    }
    if (district && district !== "All" && district !== "all") {
      where.district = district;
    }
    if (urgency && urgency !== "All" && urgency !== "all") {
      where.urgency = urgency.toUpperCase();
    }
    if (status && status !== "All" && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { district: { contains: q } },
        { publicTrackingId: { contains: q } },
        { location: { contains: q } },
      ];
    }

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          proposals: {
            select: {
              id: true,
              proposalRef: true,
              title: true,
              status: true,
              budget: true,
              universityName: true,
            },
          },
        },
      }),
      prisma.challenge.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      challenges,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[Challenges GET API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch societal challenges." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const csrf = validateCsrfRequest(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createChallengeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    const session = await getSession(req);

    // If no session, find or create default citizen user for anonymous/public reporting
    let reporterId = session?.userId;
    if (!reporterId) {
      let defaultCitizen = await prisma.user.findFirst({
        where: { role: "CITIZEN" },
      });
      if (!defaultCitizen) {
        defaultCitizen = await prisma.user.create({
          data: {
            name: "Citizen Contributor",
            phone: "+919800000000",
            role: "CITIZEN",
            status: "ACTIVE",
            passwordHash: "N/A",
          },
        });
      }
      reporterId = defaultCitizen.id;
    }

    // Execute AI categorization, deduplication & academic routing
    let aiCategorization: any = null;
    try {
      aiCategorization = await categorizeProblemWithAI({
        title: parsed.data.title,
        description: parsed.data.description,
        district: parsed.data.district,
        location: parsed.data.location,
        evidenceNotes: parsed.data.evidence || undefined,
        domain: parsed.data.domain,
        urgency: parsed.data.urgency,
        track: parsed.data.track,
      });
    } catch (aiErr) {
      console.warn("[Challenges POST]: AI categorization caught error, continuing with submission:", aiErr);
    }

    const finalTrack = parsed.data.track || aiCategorization?.track || "TRACK_A_INNOVATION";
    const finalTrackRouting = parsed.data.trackRouting || aiCategorization?.trackRouting || parsed.data.assignedInstitute || aiCategorization?.suggestedInstitute || null;
    const finalTriageReasoning = parsed.data.triageReasoning || aiCategorization?.triageReasoning || aiCategorization?.reasoning || null;
    const finalTriageConfidence = aiCategorization?.triageConfidence ?? aiCategorization?.confidence ?? null;
    const finalEntityLevel = parsed.data.targetEntityLevel || aiCategorization?.targetEntityLevel || null;

    const finalDomain = aiCategorization?.domain || parsed.data.domain;
    const finalUrgency = (parsed.data.urgency === "CRITICAL" || aiCategorization?.urgency === "CRITICAL")
      ? "CRITICAL"
      : (aiCategorization?.urgency || parsed.data.urgency);
    const finalInstitute = parsed.data.assignedInstitute || (finalTrack === "TRACK_A_INNOVATION" ? finalTrackRouting : aiCategorization?.suggestedInstitute) || null;
    const slaDeadline = aiCategorization?.slaDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Generate unique public tracking ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingPrefix = "IN-GR-2026";
    const publicTrackingId = `${trackingPrefix}-${randomNum}`;

    const challenge = await prisma.challenge.create({
      data: {
        publicTrackingId,
        title: parsed.data.title,
        description: parsed.data.description,
        domain: finalDomain,
        district: parsed.data.district,
        location: parsed.data.location,
        urgency: finalUrgency,
        track: finalTrack,
        trackRouting: finalTrackRouting,
        triageReasoning: finalTriageReasoning,
        triageConfidence: finalTriageConfidence,
        targetEntityLevel: finalEntityLevel,
        evidence: parsed.data.evidence || null,
        reportedById: reporterId,
        assignedInstitute: finalInstitute,
        status: "REPORTED",
        citizenVerified: false,
        escalationLevel: 0,
        slaDeadline: slaDeadline,
        aiConfidence: aiCategorization?.confidence || null,
        aiReasoning: aiCategorization?.reasoning || null,
      },
    });

    await logAuditEvent(
      reporterId!,
      "CHALLENGE_CREATED",
      "Challenge",
      challenge.id,
      req,
      undefined,
      {
        publicTrackingId: challenge.publicTrackingId,
        title: challenge.title,
        track: challenge.track,
        trackRouting: challenge.trackRouting,
      },
      challenge.id
    );

    return NextResponse.json(
      {
        success: true,
        challenge,
        trackingId: challenge.publicTrackingId,
        message: "Challenge submitted successfully to State Innovation Ledger.",
        ai: aiCategorization
          ? {
              domain: aiCategorization.domain,
              urgency: aiCategorization.urgency,
              track: aiCategorization.track,
              trackRouting: aiCategorization.trackRouting,
              triageReasoning: aiCategorization.triageReasoning,
              triageConfidence: aiCategorization.triageConfidence,
              targetEntityLevel: aiCategorization.targetEntityLevel,
              priorityScore: aiCategorization.priorityScore,
              suggestedInstitute: aiCategorization.suggestedInstitute,
              recommendedDepartment: aiCategorization.recommendedDepartment,
              reasoning: aiCategorization.reasoning,
              slaDays: aiCategorization.slaDays,
              slaDeadline: aiCategorization.slaDeadline,
              confidence: aiCategorization.confidence,
              isDuplicate: aiCategorization.isDuplicate,
              duplicateOfId: aiCategorization.duplicateOfId,
              duplicateOfTrackingId: aiCategorization.duplicateOfTrackingId,
              similarityScore: aiCategorization.similarityScore,
              provider: aiCategorization.provider,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Challenges POST API Error]:", error);
    return NextResponse.json(
      { error: "Failed to create societal challenge." },
      { status: 500 }
    );
  }
}
