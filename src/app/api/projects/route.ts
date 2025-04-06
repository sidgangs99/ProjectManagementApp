import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("hell");
    const payload = await verifyToken(request);
    console.log({ payload });
    if (!payload?.sub) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const userId = payload.sub;
    console.log({ userId });
    const projects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
      include: {
        owner: true,
        members: true,
        tasks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
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

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyToken(request);
    if (!payload?.sub) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const requestBody = await request.json();
    const { name, description = "", memberIds = [] } = requestBody.body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required", receivedBody: requestBody },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true },
    });

    console.log(
      { user },
      payload.sub,
      await prisma.user.findMany({ select: { id: true } }),
    );
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database", userId: payload.sub },
        { status: 404 },
      );
    }

    const project = await prisma.project.create({
      data: {
        name: name,
        description: description || "",
        ownerId: payload.sub,
        members: {
          connect: [
            { id: payload.sub }, // Connect owner as member
            ...memberIds.map((id) => ({ id })), // Connect other members
          ],
        },
      },
      include: {
        owner: true,
        members: true,
      },
    });

    console.log("Project creation successful:", project);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Full error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error details:", {
        code: error.code,
        meta: error.meta,
      });

      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Project with this name already exists" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
