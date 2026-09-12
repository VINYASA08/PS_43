import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/rbac";
import { validateCsrfRequest } from "@/lib/csrf";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const csrf = validateCsrfRequest(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;

    const challenge = await prisma.challenge.findFirst({
      where: {
        OR: [{ id }, { publicTrackingId: id }],
        deletedAt: null,
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, phone, role, organization, proposalSummary, linkedinUrl } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const session = await getSession(req);
    const userId = session?.userId || null;

    // Record application in AuditLog
    await logAuditEvent(
      userId || "ANONYMOUS_APPLICANT",
      "EXPERT_COLLABORATION_APPLIED",
      "Challenge",
      challenge.id,
      req,
      undefined,
      {
        applicantName: name,
        applicantEmail: email,
        applicantPhone: phone,
        role: role || "EXPERT",
        organization: organization || "Independent",
        proposalSummary: proposalSummary?.slice(0, 300),
        linkedinUrl,
      },
      challenge.id
    );

    return NextResponse.json({
      success: true,
      message: `Your application to collaborate on ${challenge.publicTrackingId} has been registered with the Nodal Innovation Council.`,
    });
  } catch (error) {
    console.error("[Challenge Apply Error]:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
