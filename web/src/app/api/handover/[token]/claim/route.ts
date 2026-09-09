import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signSessionToken, attachSessionCookie, SessionPayload } from "@/lib/auth";
import { UserRole, UserStatus } from "@/lib/types";

/**
 * Shared implementation for claiming a handover token.
 */
export async function handleClaimHandover(
  req: NextRequest,
  token: string
): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON with successorName and password." },
        { status: 400 }
      );
    }

    const successorName = (body.successorName || body.name || "").toString().trim();
    const password = (body.password || "").toString();
    const confirmPassword = body.confirmPassword ? body.confirmPassword.toString() : null;

    if (!successorName || successorName.length < 2) {
      return NextResponse.json(
        { error: "Successor name is required and must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword !== null && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt cost factor 12 before transaction
    const newPasswordHash = await hashPassword(password);

    // 1. Initial lookup of token and predecessor user
    const handoverToken = await prisma.handoverToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!handoverToken) {
      return NextResponse.json(
        { success: false, error: "Handover invitation token not found." },
        { status: 404 }
      );
    }

    if (handoverToken.usedAt !== null) {
      return NextResponse.json(
        { success: false, error: "This handover invitation has already been claimed." },
        { status: 409 }
      );
    }

    if (new Date() > handoverToken.expiresAt) {
      return NextResponse.json(
        { success: false, error: "This handover invitation has expired. Please request a new invitation from your predecessor." },
        { status: 410 }
      );
    }

    if (!handoverToken.user || handoverToken.user.deletedAt !== null) {
      return NextResponse.json(
        { success: false, error: "Predecessor account is no longer active." },
        { status: 403 }
      );
    }

    // 2. Ensure no conflicting active user exists with the successor email
    const emailCollision = await prisma.user.findFirst({
      where: {
        email: handoverToken.successorEmail,
        id: { not: handoverToken.userId },
      },
    });

    if (emailCollision) {
      return NextResponse.json(
        { success: false, error: "An active account with this successor email already exists in the system." },
        { status: 400 }
      );
    }

    // 3. Strict Atomic Test-and-Set Lock on the HandoverToken
    // Single atomic SQL update statement: eliminates SQLite lock contention & Rust Quaint panic
    const claimLock = await prisma.handoverToken.updateMany({
      where: {
        id: handoverToken.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        usedAt: new Date(),
      },
    });

    // If count === 0: Another concurrent racer claimed it first -> HTTP 409 Conflict
    if (claimLock.count === 0) {
      return NextResponse.json(
        { success: false, error: "This handover invitation has already been claimed." },
        { status: 409 }
      );
    }

    // 4. Guaranteed exclusive winner: Overwrite User credentials & personal identity in-place
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: handoverToken.userId },
        data: {
          name: successorName,
          email: handoverToken.successorEmail,
          passwordHash: newPasswordHash,
          twoFactorEnabled: false, // Reset 2FA to prevent successor lockout
          twoFactorSecret: null,
          failedLoginAttempts: 0,
          lockoutUntil: null,
          emailVerified: new Date(),
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });

      // 5. Create statutory AuditLog entry
      await prisma.auditLog.create({
        data: {
          userId: updatedUser.id,
          action: "HANDOVER_CLAIMED",
          resource: "User",
          resourceId: updatedUser.id,
          ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          oldState: JSON.stringify({
            predecessorName: handoverToken.user.name,
            predecessorEmail: handoverToken.user.email,
          }),
          newState: JSON.stringify({
            successorName,
            successorEmail: handoverToken.successorEmail,
            claimedAt: new Date().toISOString(),
          }),
        },
      });
    } catch (mutationError: any) {
      // Rollback claim lock if mutation failed unexpectedly to prevent orphaning the token
      await prisma.handoverToken.updateMany({
        where: { id: handoverToken.id, usedAt: { not: null } },
        data: { usedAt: null },
      }).catch(() => {});
      throw mutationError;
    }

    // 6. Generate authenticated JWT session for the successor
    const sessionPayload: SessionPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      name: updatedUser.name,
      role: updatedUser.role as UserRole,
      status: updatedUser.status as UserStatus,
      organization: updatedUser.organization,
      district: updatedUser.district,
    };

    const sessionToken = await signSessionToken(sessionPayload);
    const roleLower = updatedUser.role.toLowerCase();
    const redirectUrl = `/dashboard/${roleLower}`;

    const response = NextResponse.json({
      success: true,
      message: "Account claimed successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      redirectUrl,
    });

    // Attach HttpOnly cookie
    attachSessionCookie(response, sessionToken);

    return response;
  } catch (error: any) {
    console.error("[Handover Claim Error]:", error);

    return NextResponse.json(
      { success: false, error: "Failed to claim account handover due to an internal server error." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/handover/[token]/claim
 * Public endpoint: allows a designated successor to claim an account using their token.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> | { token: string } }
) {
  const resolvedParams = await Promise.resolve(context.params);
  const token = resolvedParams.token;
  return handleClaimHandover(req, token);
}
