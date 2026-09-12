import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, logAuditEvent } from "@/lib/rbac";
import { validateCsrfRequest } from "@/lib/csrf";

// In-process mutex serialization map to prevent duplicate tokens for same user under concurrency
const initiateLocks = new Map<string, Promise<void>>();

async function acquireInitiateLock(userId: string): Promise<() => void> {
  while (initiateLocks.has(userId)) {
    await initiateLocks.get(userId);
  }
  let unlock!: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    unlock = resolve;
  });
  initiateLocks.set(userId, lockPromise);
  return () => {
    initiateLocks.delete(userId);
    unlock();
  };
}

/**
 * POST /api/handover/initiate
 * Authenticated endpoint: allows the current user to generate a secure handover token
 * to invite a designated successor to take ownership of their account.
 */
export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    // Optional CSRF check if provided
    if (req.headers.get("x-csrf-token")) {
      const csrf = validateCsrfRequest(req);
      if (!csrf.valid) {
        return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
      }
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON with successorEmail." },
        { status: 400 }
      );
    }

    const rawEmail = (body.successorEmail || body.email || "").toString().trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid successor email address." },
        { status: 400 }
      );
    }

    // Acquire per-user lock
    const releaseLock = await acquireInitiateLock(session.userId);

    try {
      // Fetch predecessor user profile
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (!user || user.deletedAt) {
        return NextResponse.json(
          { error: "Active predecessor user account not found." },
          { status: 404 }
        );
      }

      // Check for stale session: If user email changed in DB (transferred to successor), reject
      if (user.email && session.email && user.email.toLowerCase() !== session.email.toLowerCase()) {
        return NextResponse.json(
          { error: "Your session is no longer valid. This account has been claimed by a successor." },
          { status: 401 }
        );
      }

      // Check if successor email matches predecessor email
      if (user.email && rawEmail === user.email.toLowerCase()) {
        return NextResponse.json(
          { error: "Successor email cannot be identical to your current account email." },
          { status: 400 }
        );
      }

      // Check if successor email is already registered to another user
      const existingUser = await prisma.user.findUnique({
        where: { email: rawEmail },
      });
      if (existingUser && existingUser.id !== session.userId) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please provide an unregistered successor email." },
          { status: 400 }
        );
      }

      // Double-click deduplication check (within 1500ms for same user and successor email):
      const recentToken = await prisma.handoverToken.findFirst({
        where: {
          userId: session.userId,
          successorEmail: rawEmail,
          usedAt: null,
          createdAt: { gt: new Date(Date.now() - 1500) },
        },
      });

      if (recentToken) {
        const origin = req.nextUrl?.origin || "http://localhost:3000";
        return NextResponse.json({
          success: true,
          message: "Handover invitation initiated successfully.",
          token: recentToken.token,
          claimUrl: `${origin}/handover/${recentToken.token}`,
          expiresAt: recentToken.expiresAt.toISOString(),
          successorEmail: recentToken.successorEmail,
        });
      }

      // Invalidate/delete any prior unused handover tokens for this user
      await prisma.handoverToken.deleteMany({
        where: {
          userId: session.userId,
          usedAt: null,
        },
      });

      // Generate cryptographically secure 64-character token
      const token = crypto.randomBytes(32).toString("hex");

      // Expiration: 48 hours from now
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      // Persist HandoverToken in database
      const handoverToken = await prisma.handoverToken.create({
        data: {
          token,
          userId: session.userId,
          successorEmail: rawEmail,
          expiresAt,
        },
      });

      // Construct public claim link
      const origin = req.nextUrl?.origin || "http://localhost:3000";
      const claimLink = `${origin}/handover/${token}`;

      // Standard simulated email dispatch banner to console
      console.log(`\n================================================================================`);
      console.log(`📧 [MOCK EMAIL DISPATCH] ACCOUNT HANDOVER INVITATION`);
      console.log(`   To: ${rawEmail}`);
      console.log(`   From: ${user.name} <${user.email || user.phone || "user"}> (${user.role} - ${user.organization || "Gov"})`);
      console.log(`   Handover Claim Link: ${claimLink}`);
      console.log(`   Token Expiration: ${expiresAt.toISOString()} (48 Hours)`);
      console.log(`================================================================================\n`);

      // Log statutory audit event
      await logAuditEvent(
        session.userId,
        "HANDOVER_INITIATED",
        "User",
        session.userId,
        req,
        undefined,
        {
          successorEmail: rawEmail,
          expiresAt: expiresAt.toISOString(),
          tokenId: handoverToken.id,
        }
      );

      return NextResponse.json({
        success: true,
        message: "Handover invitation initiated successfully.",
        token,
        claimUrl: claimLink,
        expiresAt: expiresAt.toISOString(),
        successorEmail: rawEmail,
      });
    } finally {
      releaseLock();
    }
  } catch (error: any) {
    console.error("[Handover Initiate Error]:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while initiating account handover." },
      { status: 500 }
    );
  }
});

/**
 * GET /api/handover/initiate
 * Returns any pending, active handover invitation for the authenticated user.
 */
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json(
        { error: "Active predecessor user account not found." },
        { status: 404 }
      );
    }

    if (user.email && session.email && user.email.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Your session is no longer valid. This account has been claimed by a successor." },
        { status: 401 }
      );
    }

    const activeToken = await prisma.handoverToken.findFirst({
      where: {
        userId: session.userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeToken) {
      return NextResponse.json({
        hasPendingHandover: false,
        pendingHandover: null,
      });
    }

    const origin = req.nextUrl?.origin || "http://localhost:3000";
    return NextResponse.json({
      hasPendingHandover: true,
      pendingHandover: {
        token: activeToken.token,
        successorEmail: activeToken.successorEmail,
        expiresAt: activeToken.expiresAt,
        createdAt: activeToken.createdAt,
        claimUrl: `${origin}/handover/${activeToken.token}`,
      },
    });
  } catch (error) {
    console.error("[Handover Status GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to query pending handover status." },
      { status: 500 }
    );
  }
});
