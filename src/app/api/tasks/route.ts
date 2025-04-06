import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        project: true,
        creator: true,
        assignees: true,
        tags: true,
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const task = await prisma.task.create({
      data: {
        title: json.title,
        description: json.description,
        status: json.status || "TODO",
        priority: json.priority || "MEDIUM",
        dueDate: json.dueDate ? new Date(json.dueDate) : null,
        projectId: json.projectId,
        creatorId: json.creatorId,
        assignees: {
          connect: json.assigneeIds?.map((id: string) => ({ id })) || [],
        },
        tags: {
          connect: json.tagIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        project: true,
        creator: true,
        assignees: true,
        tags: true,
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
