import { NextRequest, NextResponse } from "next/server";
import { withAuth, logAuditEvent } from "@/lib/rbac";
import { validateCsrfRequest } from "@/lib/csrf";
import { UserRole } from "@/lib/types";
import { getAiConfig, updateAiConfig } from "@/lib/ai-config";

export const GET = withAuth(
  async (_req: NextRequest) => {
    try {
      const config = getAiConfig();
      return NextResponse.json(config);
    } catch (error) {
      console.error("[State AI Config GET Error]:", error);
      return NextResponse.json({ error: "Failed to fetch AI configuration" }, { status: 500 });
    }
  },
  [UserRole.STATE_ADMIN, UserRole.GOV]
);

export const POST = withAuth(
  async (req: NextRequest, session) => {
    try {
      const csrf = validateCsrfRequest(req);
      if (!csrf.valid) {
        return NextResponse.json({ error: csrf.reason || "Invalid CSRF token" }, { status: 403 });
      }

      const body = await req.json();
      const rawThreshold = body.confidenceThreshold ?? body.threshold;

      if (rawThreshold === undefined || isNaN(Number(rawThreshold))) {
        return NextResponse.json(
          { error: "A valid numeric confidenceThreshold is required." },
          { status: 400 }
        );
      }

      const num = Number(rawThreshold);
      if (num < 0.70 || num > 0.95) {
        return NextResponse.json(
          { error: "confidenceThreshold must be between 0.70 and 0.95." },
          { status: 400 }
        );
      }

      const oldConfig = getAiConfig();
      const updated = updateAiConfig(num);

      await logAuditEvent(
        session.userId,
        "UPDATE_AI_CONFIDENCE_THRESHOLD",
        "SystemConfig",
        "ai_confidence_threshold",
        req,
        { previousThreshold: oldConfig.confidenceThreshold },
        { newThreshold: updated.confidenceThreshold }
      );

      return NextResponse.json({
        success: true,
        confidenceThreshold: updated.confidenceThreshold,
        minThreshold: updated.minThreshold,
        maxThreshold: updated.maxThreshold,
        lastUpdated: updated.lastUpdated,
      });
    } catch (error) {
      console.error("[State AI Config POST Error]:", error);
      return NextResponse.json({ error: "Failed to update AI configuration" }, { status: 500 });
    }
  },
  [UserRole.STATE_ADMIN, UserRole.GOV]
);
