import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("hub.challenge");
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({
    status: "ok",
    service: "WhatsApp Omnichannel Intake Listener",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, domain = "Water Management", district = "Dhanbad", location = "Borewell #03, Block XYZ, Village 4", phone = "+919708099999" } = body;

    // Find or create citizen user for this phone
    let user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: "WhatsApp Contributor",
          role: "CITIZEN",
          status: "ACTIVE",
          passwordHash: "N/A",
          district,
        },
      });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `IN-GR-2026-${randomNum}`;

    const challenge = await prisma.challenge.create({
      data: {
        publicTrackingId: trackingId,
        title: "Omnichannel WhatsApp Report: " + (message?.slice(0, 60) || "Water Contamination Issue"),
        description: message || "Field issue reported via Jharkhand State WhatsApp AI Intake Channel.",
        domain,
        district,
        location,
        urgency: "CRITICAL",
        evidence: JSON.stringify({
          source: "WhatsApp Omnichannel Chatbot",
          phone,
          mediaUrl: "/evidence/whatsapp_borewell_sample.jpg",
        }),
        reportedById: user.id,
        status: "REPORTED",
        citizenVerified: false,
        escalationLevel: 0,
        slaDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await logAuditEvent(
      user.id,
      "WHATSAPP_GRIEVANCE_INGESTED",
      "Challenge",
      challenge.id,
      req,
      undefined,
      { publicTrackingId: challenge.publicTrackingId, channel: "WhatsApp" },
      challenge.id
    );

    return NextResponse.json({
      success: true,
      trackingId,
      challengeId: challenge.id,
      message: "Omnichannel grievance registered in state ledger.",
    });
  } catch (error) {
    console.error("[WhatsApp Intake API Error]:", error);
    return NextResponse.json(
      { error: "Failed to process WhatsApp submission", trackingId: "IN-GR-2026-9842" },
      { status: 500 }
    );
  }
}
