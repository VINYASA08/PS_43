import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, verifyTempToken } from "@/lib/auth";
import { generateBase32Secret, generateTotpQrCode } from "@/lib/totp";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    let email = "user@jharkhand.gov.in";

    // 1. Try session first
    const session = await getSession(req);
    if (session) {
      userId = session.userId;
      if (session.email) email = session.email;
    } else {
      // 2. Try tempToken from body or Authorization header
      const body = await req.json().catch(() => ({}));
      const tempToken = body.tempToken || req.headers.get("authorization")?.replace("Bearer ", "");
      if (tempToken) {
        const decoded = await verifyTempToken(tempToken);
        if (decoded) {
          userId = decoded.userId;
          if (decoded.email) email = decoded.email;
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to configure Two-Factor Authentication." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User record not found." }, { status: 404 });
    }

    // Generate new TOTP Base32 secret
    const secret = generateBase32Secret(20);

    // Save secret (not yet enabled until verified)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    const qrCodeUrl = await generateTotpQrCode(user.email || email, secret);

    // Format secret with spaces for manual entry (e.g. JBSW Y3DP EHPK 3PXP)
    const manualEntryKey = secret.match(/.{1,4}/g)?.join(" ") || secret;

    return NextResponse.json({
      success: true,
      secret,
      qrCodeUrl,
      manualEntryKey,
      issuer: "Jharkhand State Innovation Council",
    });
  } catch (error) {
    console.error("[TOTP Setup Error]:", error);
    return NextResponse.json({ error: "Failed to initialize 2FA setup." }, { status: 500 });
  }
}
