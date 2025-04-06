import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export const verifyToken = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error({ error });
    throw new Error("Invalid or expired token");
  }
};
