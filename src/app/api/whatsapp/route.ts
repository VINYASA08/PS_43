import { NextRequest } from "next/server";
import { POST as simulatePost, GET as simulateGet } from "@/app/api/intake/whatsapp-simulate/route";

export async function GET(req: NextRequest) {
  return simulateGet(req);
}

export async function POST(req: NextRequest) {
  return simulatePost(req);
}
