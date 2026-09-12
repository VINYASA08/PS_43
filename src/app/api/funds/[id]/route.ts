import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const commitment = await prisma.fundingCommitment.findFirst({
      where: {
        OR: [{ id }, { escrowRef: id }],
      },
      include: {
        proposal: {
          include: {
            challenge: true,
            submittedBy: {
              select: {
                id: true,
                name: true,
                organization: true,
                district: true,
              },
            },
          },
        },
        industryUser: {
          select: {
            id: true,
            name: true,
            organization: true,
            email: true,
          },
        },
      },
    });

    if (!commitment) {
      return NextResponse.json({ error: "Funding commitment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      commitment,
    });
  } catch (error) {
    console.error("[Fund Detail GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch funding commitment." }, { status: 500 });
  }
}
