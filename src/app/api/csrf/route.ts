import { NextResponse } from "next/server";
import { generateCsrfToken, attachCsrfCookie } from "@/lib/csrf";

export async function GET() {
  const token = generateCsrfToken();
  const res = NextResponse.json({
    csrfToken: token,
  });

  attachCsrfCookie(res, token);
  return res;
}
