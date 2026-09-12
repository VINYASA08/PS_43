import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/rbac";
import { UserRole } from "@/lib/types";

export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const resource = searchParams.get("resource");
      const action = searchParams.get("action");

      const where: Record<string, unknown> = {};
      if (resource) where.resource = resource;
      if (action) where.action = action;

      const logs = await prisma.auditLog.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              organization: true,
            },
          },
          challenge: {
            select: {
              id: true,
              publicTrackingId: true,
              title: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        logs,
      });
    } catch (error) {
      console.error("[Audit Logs GET Error]:", error);
      return NextResponse.json({ error: "Failed to fetch audit trail." }, { status: 500 });
    }
  },
  [UserRole.GOV]
);
