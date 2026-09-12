import { NextRequest, NextResponse } from "next/server";
import { withAuth, logAuditEvent } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { userProfileUpdateSchema } from "@/lib/validation";
import { validateCsrfRequest } from "@/lib/csrf";

export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        organization: true,
        designation: true,
        district: true,
        bio: true,
        role: true,
        status: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[Profile GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
});

export const PUT = withAuth(async (req: NextRequest, session) => {
  try {
    const csrf = validateCsrfRequest(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = userProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid update data" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: parsed.data,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        organization: true,
        designation: true,
        district: true,
        bio: true,
        role: true,
        status: true,
        twoFactorEnabled: true,
      },
    });

    await logAuditEvent(
      session.userId,
      "USER_PROFILE_UPDATED",
      "User",
      session.userId,
      req,
      undefined,
      parsed.data
    );

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("[Profile PUT Error]:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
});
