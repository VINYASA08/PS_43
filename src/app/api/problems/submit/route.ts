import { NextRequest, NextResponse } from "next/server";
import { POST as challengePost } from "@/app/api/challenges/route";
import { generateCsrfToken } from "@/lib/csrf";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "ok",
    service: "Citizen Problem Submission Gateway",
    endpoint: "/api/problems/submit",
    target: "/api/challenges",
    methods: ["GET", "POST"],
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    // If CSRF header is missing, generate one to allow compatibility with external and mobile clients
    if (!req.headers.get("x-csrf-token")) {
      const rawBody = await req.arrayBuffer();
      const token = generateCsrfToken();
      const headers = new Headers(req.headers);
      headers.set("x-csrf-token", token);
      headers.set("content-type", req.headers.get("content-type") || "application/json");

      const delegateReq = new NextRequest(req.url, {
        method: "POST",
        headers,
        body: rawBody,
      });
      delegateReq.cookies.set("sih_csrf", token);
      return challengePost(delegateReq);
    }

    return challengePost(req);
  } catch (error) {
    console.error("[API problems/submit POST error]:", error);
    return NextResponse.json(
      { error: "Internal error processing problem submission" },
      { status: 500 }
    );
  }
}
