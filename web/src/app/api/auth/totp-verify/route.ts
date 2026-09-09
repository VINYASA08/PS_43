import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getSession,
  verifyTempToken,
  signSessionToken,
  attachSessionCookie,
  resetFailedLogins,
  SessionPayload,
} from "@/lib/auth";
import { verifyTOTP } from "@/lib/totp";
import { generateCsrfToken, attachCsrfCookie } from "@/lib/csrf";
import { UserRole, UserStatus } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = (body.code || body.token || "").toString().trim();
    const tempToken = body.tempToken;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "A valid 6-digit authenticator code is required." },
        { status: 400 }
      );
    }

    let userId: string | null = null;

    // 1. Check tempToken from 2FA login step
    if (tempToken) {
      const decoded = await verifyTempToken(tempToken);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    // 2. Check existing session if setting up 2FA from settings page
    if (!userId) {
      const session = await getSession(req);
      if (session) {
        userId = session.userId;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication session or temporary token expired. Please log in again." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Two-factor authentication is not configured for this account." },
        { status: 400 }
      );
    }

    const isValid = verifyTOTP(user.twoFactorSecret, code);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid 6-digit authenticator code. Check your device clock." },
        { status: 401 }
      );
    }

    // Mark 2FA as confirmed and enabled
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
      },
    });

    await resetFailedLogins(user.id);

    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      organization: user.organization,
      district: user.district,
    };

    let redirectUrl = "/dashboard";
    if (user.role === "GOV") redirectUrl = "/dashboard/gov";
    else if (user.role === "UNIVERSITY") redirectUrl = "/dashboard/university";
    else if (user.role === "INDUSTRY") redirectUrl = "/dashboard/industry";

    const res = NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl,
      message: "Two-factor authentication verified successfully.",
    });

    const token = await signSessionToken(sessionPayload);
    attachSessionCookie(res, token);
    const csrf = generateCsrfToken();
    attachCsrfCookie(res, csrf);

    return res;
  } catch (error) {
    console.error("[TOTP Verify Error]:", error);
    return NextResponse.json({ error: "Failed to verify 2FA code." }, { status: 500 });
  }
}
