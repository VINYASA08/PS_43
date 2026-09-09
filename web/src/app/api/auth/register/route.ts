import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signTempToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimiter";
import { createAndStoreOtp } from "@/lib/otp";
import { generateBase32Secret } from "@/lib/totp";
import {
  signupCitizenSchema,
  signupUniversitySchema,
  signupIndustrySchema,
  signupGovSchema,
} from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": rate.retryAfterSeconds.toString() } }
      );
    }

    const body = await req.json();
    const role = (body.role || body.tier || "").toUpperCase();

    if (role === "CITIZEN") {
      const parsed = signupCitizenSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
      }

      const { phone, name, district } = parsed.data;

      // Check if user exists
      let user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        // Create user with default dummy password
        const passwordHash = await hashPassword("Citizen@2026!");
        user = await prisma.user.create({
          data: {
            phone,
            name,
            district,
            role: "CITIZEN",
            status: "ACTIVE",
            passwordHash,
          },
        });
      }

      const otp = createAndStoreOtp(phone, "register");
      console.log(`[SMS/WhatsApp OTP to ${phone}]: ${otp}`);

      return NextResponse.json({
        success: true,
        requireOtp: true,
        identifier: phone,
        message: "Verification code sent to your mobile number.",
        expiresInSeconds: 600,
      });
    }

    if (role === "UNIVERSITY") {
      const parsed = signupUniversitySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
      }

      const { email, password, name, organization, designation, district } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }

      const passwordHash = await hashPassword(password);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          organization,
          designation,
          district,
          role: "UNIVERSITY",
          status: "ACTIVE",
        },
      });

      const otp = createAndStoreOtp(email, "register");
      console.log(`[Email OTP to ${email}]: ${otp}`);

      return NextResponse.json({
        success: true,
        requireOtp: true,
        identifier: email,
        message: "Verification code sent to your institutional email.",
        expiresInSeconds: 600,
      });
    }

    if (role === "INDUSTRY") {
      const parsed = signupIndustrySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
      }

      const { email, password, name, organization, designation, district } = parsed.data;

      // Ensure not a free public email
      const freeProviders = ["gmail.com", "yahoo.com", "yahoo.co.in", "outlook.com", "hotmail.com", "icloud.com", "zoho.com"];
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain && freeProviders.includes(domain)) {
        return NextResponse.json({ error: "Corporate email required. Free webmail providers are not permitted." }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "An account with this corporate email already exists." }, { status: 409 });
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          organization,
          designation,
          district,
          role: "INDUSTRY",
          status: "PENDING", // Pending statutory Gov Nodal Officer approval
        },
      });

      return NextResponse.json(
        {
          success: true,
          status: "PENDING",
          userId: user.id,
          message: "Corporate registration submitted. Your account is pending Government Admin verification.",
        },
        { status: 201 }
      );
    }

    if (role === "GOV") {
      const parsed = signupGovSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
      }

      const { email, password, name, organization, designation, district } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "An official account with this government email already exists." }, { status: 409 });
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          organization,
          designation,
          district,
          role: "GOV",
          status: "ACTIVE",
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Government profile registered. Please log in.",
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Invalid role specified. Must be CITIZEN, UNIVERSITY, INDUSTRY, or GOV." }, { status: 400 });
  } catch (error) {
    console.error("[Register API Error]:", error);
    return NextResponse.json({ error: "Internal registration error" }, { status: 500 });
  }
}
