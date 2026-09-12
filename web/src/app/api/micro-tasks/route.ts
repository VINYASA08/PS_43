import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");
    
    const where: any = {};
    if (challengeId) {
      where.challengeId = challengeId;
    }

    const microTasks = await prisma.microTask.findMany({
      where,
      include: {
        challenge: {
          select: { title: true, district: true }
        },
        createdBy: {
          select: { name: true, organization: true }
        },
        assignedTo: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, microTasks });
  } catch (error) {
    console.error("[MicroTasks GET API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch micro-tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    const createdById = session?.userId;

    if (!createdById) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, skills, challengeId } = body;

    if (!title || !description || !skills || !challengeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const microTask = await prisma.microTask.create({
      data: {
        title,
        description,
        skills,
        challengeId,
        createdById
      },
      include: {
         challenge: {
          select: { title: true, district: true }
        },
        createdBy: {
          select: { name: true, organization: true }
        }
      }
    });

    return NextResponse.json({ success: true, microTask }, { status: 201 });
  } catch (error) {
    console.error("[MicroTasks POST API Error]:", error);
    return NextResponse.json(
      { error: "Failed to create micro-task" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    const applicantId = session?.userId;

    if (!applicantId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const microTask = await prisma.microTask.findUnique({
      where: { id: taskId }
    });

    if (!microTask) {
      return NextResponse.json({ error: "MicroTask not found" }, { status: 404 });
    }

    if (microTask.status !== "OPEN") {
      return NextResponse.json({ error: "MicroTask is no longer open" }, { status: 400 });
    }

    const updatedTask = await prisma.microTask.update({
      where: { id: taskId },
      data: {
        assignedToId: applicantId,
        status: "ASSIGNED"
      },
      include: {
        assignedTo: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, microTask: updatedTask }, { status: 200 });
  } catch (error) {
    console.error("[MicroTasks PATCH API Error]:", error);
    return NextResponse.json(
      { error: "Failed to update micro-task" },
      { status: 500 }
    );
  }
}
