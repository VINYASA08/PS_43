import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Refresh from DB
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        name: true,
        organization: true,
        designation: true,
        district: true,
        bio: true,
        profileUrl: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("[Auth Me API Error]:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
