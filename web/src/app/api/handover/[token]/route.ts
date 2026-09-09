import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleClaimHandover } from "./claim/route";

/**
 * GET /api/handover/[token]
 * Public endpoint: validates a handover invitation token and returns predecessor metadata.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const token = resolvedParams.token;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Handover token is required." },
        { status: 400 }
      );
    }

    const handoverToken = await prisma.handoverToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            designation: true,
            organization: true,
            role: true,
            district: true,
            status: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!handoverToken) {
      return NextResponse.json(
        { valid: false, error: "Handover invitation not found or invalid." },
        { status: 404 }
      );
    }

    if (handoverToken.usedAt !== null) {
      return NextResponse.json(
        {
          valid: false,
          error: "Handover invitation has already been claimed.",
          claimedAt: handoverToken.usedAt,
        },
        { status: 409 }
      );
    }

    if (new Date() > handoverToken.expiresAt) {
      return NextResponse.json(
        {
          valid: false,
          error: "Handover invitation has expired. Please request a new invitation.",
          expiresAt: handoverToken.expiresAt,
        },
        { status: 410 }
      );
    }

    if (!handoverToken.user || handoverToken.user.deletedAt !== null) {
      return NextResponse.json(
        { valid: false, error: "Predecessor account is no longer active." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      successorEmail: handoverToken.successorEmail,
      predecessor: {
        name: handoverToken.user.name,
        designation: handoverToken.user.designation || "N/A",
        organization: handoverToken.user.organization || "Gov",
        role: handoverToken.user.role,
        district: handoverToken.user.district || "N/A",
      },
      expiresAt: handoverToken.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("[Handover Validate GET Error]:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error validating handover token." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/handover/[token]
 * Convenience alias for claiming the handover directly at /api/handover/[token].
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> | { token: string } }
) {
  const resolvedParams = await Promise.resolve(context.params);
  const token = resolvedParams.token;
  return handleClaimHandover(req, token);
}
