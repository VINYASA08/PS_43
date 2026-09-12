import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/rbac";
import { UserRole } from "@/lib/types";

export const GET = withAuth(
  async (_req: NextRequest) => {
    try {
      const pendingUsers = await prisma.user.findMany({
        where: {
          status: "PENDING",
        },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          organization: true,
          designation: true,
          district: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        pendingUsers,
      });
    } catch (error) {
      console.error("[Admin Pending Users Error]:", error);
      return NextResponse.json(
        { error: "Failed to fetch pending accounts." },
        { status: 500 }
      );
    }
  },
  [UserRole.GOV, UserRole.STATE_ADMIN]
);
