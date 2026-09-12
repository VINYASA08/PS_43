import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, logAuditEvent } from "@/lib/rbac";
import { validateCsrfRequest } from "@/lib/csrf";
import { UserRole } from "@/lib/types";

export const POST = withAuth(
  async (req: NextRequest, session) => {
    try {
      const csrf = validateCsrfRequest(req);
      if (!csrf.valid) {
        return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
      }

      const body = await req.json();
      const { userId, action, reason } = body;

      if (!userId || !action || !["approve", "reject"].includes(action)) {
        return NextResponse.json(
          { error: "Invalid request. Provide valid userId and action ('approve' or 'reject')." },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const newStatus = action === "approve" ? "ACTIVE" : "SUSPENDED";

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          status: newStatus,
        },
      });

      await logAuditEvent(
        session.userId,
        action === "approve" ? "APPROVE_INDUSTRY_USER" : "REJECT_INDUSTRY_USER",
        "User",
        userId,
        req,
        { oldStatus: user.status },
        { newStatus, reason: reason || "N/A" }
      );

      return NextResponse.json({
        success: true,
        userId: updatedUser.id,
        newStatus,
        message:
          action === "approve"
            ? `User ${updatedUser.name} approved successfully.`
            : `User ${updatedUser.name} rejected/suspended.`,
      });
    } catch (error) {
      console.error("[Admin Approve User Error]:", error);
      return NextResponse.json(
        { error: "Failed to update user approval status." },
        { status: 500 }
      );
    }
  },
  [UserRole.GOV]
);
