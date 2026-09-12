import { NextResponse } from "next/server";
import { removeSessionCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  removeSessionCookie(res);
  return res;
}
