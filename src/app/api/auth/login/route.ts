import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyPassword,
  signSessionToken,
  signTempToken,
  attachSessionCookie,
  checkAccountLockout,
  recordFailedLogin,
  resetFailedLogins,
  SessionPayload,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimiter";
import { createAndStoreOtp, verifyAndConsumeOtp } from "@/lib/otp";
import { verifyTOTP } from "@/lib/totp";
import { generateCsrfToken, attachCsrfCookie } from "@/lib/csrf";
import { UserRole, UserStatus } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 1 minute." },
        { status: 429, headers: { "Retry-After": rate.retryAfterSeconds.toString() } }
      );
    }

    const body = await req.json();
    const { email, phone, password, otp, totpCode, role: requestedRole } = body;

    // -------------------------------------------------------------------------
    // 1. CITIZEN LOGIN VIA PHONE
    // -------------------------------------------------------------------------
    if (phone) {
      const formattedPhone = phone.trim();
      let user = await prisma.user.findUnique({ where: { phone: formattedPhone } });

      // If no OTP provided, generate and send OTP
      if (!otp) {
        if (!user) {
          // Auto-provision basic citizen if not exists
          user = await prisma.user.create({
            data: {
              phone: formattedPhone,
              name: "Citizen Reporter",
              role: "CITIZEN",
              status: "ACTIVE",
              passwordHash: "N/A",
            },
          });
        }

        const newOtp = createAndStoreOtp(formattedPhone, "login");
        console.log(`[SMS/WhatsApp OTP to ${formattedPhone}]: ${newOtp}`);

        return NextResponse.json({
          success: true,
          requireOtp: true,
          identifier: formattedPhone,
          message: "One-Time Password dispatched to your mobile number.",
        });
      }

      // Verify OTP
      const otpResult = verifyAndConsumeOtp(formattedPhone, otp, "login");
      if (!otpResult.success) {
        return NextResponse.json({ error: otpResult.message }, { status: 401 });
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: formattedPhone,
            name: "Citizen Reporter",
            role: "CITIZEN",
            status: "ACTIVE",
            passwordHash: "N/A",
            phoneVerified: new Date(),
          },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: new Date() },
        });
      }

      const sessionPayload: SessionPayload = {
        userId: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role as UserRole,
        status: user.status as UserStatus,
        district: user.district,
        organization: user.organization,
      };

      const token = await signSessionToken(sessionPayload);
      const res = NextResponse.json({
        success: true,
        user: sessionPayload,
        redirectUrl: "/submit",
      });

      attachSessionCookie(res, token);
      const csrf = generateCsrfToken();
      attachCsrfCookie(res, csrf);

      return res;
    }

    // -------------------------------------------------------------------------
    // 2. EMAIL + PASSWORD LOGIN (UNIVERSITY, INDUSTRY, GOV, EXPERT)
    // -------------------------------------------------------------------------
    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide valid credentials (email and password, or mobile number)." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email address or password." }, { status: 401 });
    }

    // Check account lockout
    const lockout = checkAccountLockout({
      failedLoginAttempts: user.failedLoginAttempts,
      lockoutUntil: user.lockoutUntil,
    });

    if (lockout.isLocked) {
      return NextResponse.json(
        {
          error: "Account Locked",
          message: `Account temporarily locked due to 5 consecutive failed login attempts. Retry in ${lockout.remainingMinutes} minutes.`,
          remainingMinutes: lockout.remainingMinutes,
        },
        { status: 423 }
      );
    }

    // Check password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      const lockResult = await recordFailedLogin(user.id);
      if (lockResult.isLocked) {
        return NextResponse.json(
          {
            error: "Account Locked",
            message: "Account locked for 30 minutes due to 5 consecutive failed login attempts.",
            remainingMinutes: 30,
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: "Invalid email address or password.",
          attemptsRemaining: 5 - lockResult.attempts,
        },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === "PENDING") {
      return NextResponse.json(
        {
          error: "Account pending administrator approval",
          message: "Your corporate profile is awaiting statutory verification by the Jharkhand State Innovation Council. An email notification will be dispatched once verified.",
          status: "PENDING",
        },
        { status: 403 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Your account is currently ${user.status}. Please contact support.` },
        { status: 403 }
      );
    }

    // Reset failed logins upon full successful authentication
    await resetFailedLogins(user.id);

    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role as UserRole,
      tier: (user as any).tier || "DISTRICT",
      status: user.status as UserStatus,
      organization: user.organization,
      district: user.district,
    };

    const token = await signSessionToken(sessionPayload);

    // Determine target redirect URL
    let redirectUrl = "/dashboard";
    if (user.role === "STATE_ADMIN") redirectUrl = "/dashboard/state";
    else if (user.role === "GOV") redirectUrl = "/dashboard/gov";
    else if (user.role === "UNIVERSITY") redirectUrl = "/dashboard/university";
    else if (user.role === "INDUSTRY") redirectUrl = "/dashboard/industry";
    else if (user.role === "CITIZEN") redirectUrl = "/submit";

    const res = NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl,
    });

    attachSessionCookie(res, token);
    const csrf = generateCsrfToken();
    attachCsrfCookie(res, csrf);

    return res;
  } catch (error) {
    console.error("[Login API Error]:", error);
    return NextResponse.json({ error: "An internal error occurred during login." }, { status: 500 });
  }
}
