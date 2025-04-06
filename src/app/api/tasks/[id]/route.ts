import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        creator: true,
        assignees: true,
        tags: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const json = await request.json();
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: json.title,
        description: json.description,
        status: json.status,
        priority: json.priority,
        dueDate: json.dueDate ? new Date(json.dueDate) : undefined,
        assignees: {
          set: json.assigneeIds?.map((id: string) => ({ id })) || [],
        },
        tags: {
          set: json.tagIds?.map((id: string) => ({ id })) || [],
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.task.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Task deleted successfully" });
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
