import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAndConsumeOtp } from "@/lib/otp";
import { signSessionToken, attachSessionCookie, SessionPayload } from "@/lib/auth";
import { generateCsrfToken, attachCsrfCookie } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rateLimiter";
import { UserRole, UserStatus } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait 1 minute." },
        { status: 429, headers: { "Retry-After": rate.retryAfterSeconds.toString() } }
      );
    }

    const body = await req.json();
    const { identifier, otp, purpose = "login" } = body;

    if (!identifier || !otp) {
      return NextResponse.json({ error: "Missing identifier or OTP code." }, { status: 400 });
    }

    const result = verifyAndConsumeOtp(identifier, otp, purpose);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    // Lookup user by phone or email
    const cleanId = identifier.trim();
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: cleanId }, { email: cleanId.toLowerCase() }],
      },
    });

    if (!user) {
      // Create user if citizen phone
      if (cleanId.startsWith("+91") || /^\d{10}$/.test(cleanId)) {
        user = await prisma.user.create({
          data: {
            phone: cleanId,
            name: "Citizen Reporter",
            role: "CITIZEN",
            status: "ACTIVE",
            passwordHash: "N/A",
            phoneVerified: new Date(),
          },
        });
      } else {
        return NextResponse.json({ error: "User account not found." }, { status: 404 });
      }
    } else {
      // Mark verified
      if (user.phone === cleanId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: new Date() },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    }

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
    else if (user.role === "CITIZEN") redirectUrl = "/submit";

    const res = NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl,
    });

    const token = await signSessionToken(sessionPayload);
    attachSessionCookie(res, token);
    const csrf = generateCsrfToken();
    attachCsrfCookie(res, csrf);

    return res;
  } catch (error) {
    console.error("[Verify OTP Error]:", error);
    return NextResponse.json({ error: "Internal OTP verification error" }, { status: 500 });
  }
}
