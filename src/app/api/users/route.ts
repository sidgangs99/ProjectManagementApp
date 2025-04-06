import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, id } = body;

    if (!email || !id) {
      return NextResponse.json(
        { error: "Email and ID are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        id,
      },
      select: { email: true, name: true, id: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
