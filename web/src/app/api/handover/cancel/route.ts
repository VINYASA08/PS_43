import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, logAuditEvent } from "@/lib/rbac";
import { validateCsrfRequest } from "@/lib/csrf";

/**
 * POST /api/handover/cancel
 * Protected endpoint: cancels any pending/unused handover invitation for the authenticated user.
 */
export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    if (req.headers.get("x-csrf-token")) {
      const csrf = validateCsrfRequest(req);
      if (!csrf.valid) {
        return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json(
        { error: "Active account not found." },
        { status: 404 }
      );
    }

    if (user.email && session.email && user.email.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Your session is no longer valid. This account has been claimed by a successor." },
        { status: 401 }
      );
    }

    // Delete or mark expired all pending unused handover tokens for this user
    const result = await prisma.handoverToken.deleteMany({
      where: {
        userId: session.userId,
        usedAt: null,
      },
    });

    // Log statutory audit event
    await logAuditEvent(
      session.userId,
      "HANDOVER_CANCELLED",
      "User",
      session.userId,
      req,
      undefined,
      {
        cancelledCount: result.count,
        cancelledAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Pending handover invitation cancelled.",
      cancelledCount: result.count,
    });
  } catch (error) {
    console.error("[Handover Cancel Error]:", error);
    return NextResponse.json(
      { error: "Failed to cancel pending handover invitation." },
      { status: 500 }
    );
  }
});
