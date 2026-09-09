import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { categorizeProblemWithAI } from "@/lib/ai";

const categorizeRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(300),
  description: z.string().min(10, "Description must be at least 10 characters").max(10000),
  district: z.string().max(100).optional(),
  location: z.string().max(300).optional(),
  evidenceNotes: z.string().max(2000).optional(),
  domain: z.string().optional(),
  urgency: z.string().optional(),
  track: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const parsed = categorizeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Validation failed.",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const categorization = await categorizeProblemWithAI({
      title: parsed.data.title,
      description: parsed.data.description,
      district: parsed.data.district,
      location: parsed.data.location,
      evidenceNotes: parsed.data.evidenceNotes,
      domain: parsed.data.domain,
      urgency: parsed.data.urgency,
      track: parsed.data.track,
    });

    return NextResponse.json({
      success: true,
      domain: categorization.domain,
      urgency: categorization.urgency,
      track: categorization.track,
      trackRouting: categorization.trackRouting,
      triageReasoning: categorization.triageReasoning,
      triageConfidence: categorization.triageConfidence,
      targetEntityLevel: categorization.targetEntityLevel,
      priorityScore: categorization.priorityScore,
      reasoning: categorization.reasoning,
      suggestedInstitute: categorization.suggestedInstitute,
      recommendedDepartment: categorization.recommendedDepartment,
      slaDays: categorization.slaDays,
      slaDeadline: categorization.slaDeadline.toISOString(),
      confidence: categorization.confidence,
      secondaryDomains: categorization.secondaryDomains,
      isDuplicate: categorization.isDuplicate,
      duplicateOfId: categorization.duplicateOfId,
      duplicateOfTrackingId: categorization.duplicateOfTrackingId,
      similarityScore: categorization.similarityScore,
      provider: categorization.provider,
      categorization: {
        domain: categorization.domain,
        urgency: categorization.urgency,
        track: categorization.track,
        trackRouting: categorization.trackRouting,
        triageReasoning: categorization.triageReasoning,
        triageConfidence: categorization.triageConfidence,
        targetEntityLevel: categorization.targetEntityLevel,
        priorityScore: categorization.priorityScore,
        reasoning: categorization.reasoning,
        suggestedInstitute: categorization.suggestedInstitute,
        recommendedDepartment: categorization.recommendedDepartment,
        slaDays: categorization.slaDays,
        slaDeadline: categorization.slaDeadline.toISOString(),
        confidence: categorization.confidence,
        secondaryDomains: categorization.secondaryDomains,
        isDuplicate: categorization.isDuplicate,
        duplicateOfId: categorization.duplicateOfId,
        duplicateOfTrackingId: categorization.duplicateOfTrackingId,
        similarityScore: categorization.similarityScore,
        provider: categorization.provider,
      },
    });
  } catch (error: any) {
    console.error("[AI Categorize API Error]:", error);
    return NextResponse.json(
      { error: "AI categorization failed.", message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
