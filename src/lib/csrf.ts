import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const CSRF_COOKIE_NAME = "sih_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

function getCsrfSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CSRF_SECRET environment variable is missing in production");
    }
    return "dev-local-csrf-secret-key-32-chars-long";
  }
  return secret;
}

/**
 * Generate a cryptographically secure signed CSRF token
 * Format: `<randomHex>.<timestamp>.<hmacSignature>`
 */
export function generateCsrfToken(): string {
  const secret = getCsrfSecret();
  const rawId = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${rawId}.${timestamp}`)
    .digest("hex");

  return `${rawId}.${timestamp}.${signature}`;
}

/**
 * Validate a CSRF token
 */
export function verifyCsrfToken(token: string, maxAgeMs = 24 * 60 * 60 * 1000): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [rawId, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
    return false; // Expired
  }

  const secret = getCsrfSecret();
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rawId}.${timestampStr}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

/**
 * Validates the CSRF token on an incoming NextRequest
 */
export function validateCsrfRequest(req: NextRequest): { valid: boolean; reason?: string } {
  // Safe HTTP methods do not require CSRF token
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return { valid: true };
  }

  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken) {
    return { valid: false, reason: "Missing X-CSRF-Token header" };
  }

  // Verify HMAC signature of the header token
  if (!verifyCsrfToken(headerToken)) {
    return { valid: false, reason: "Invalid or expired CSRF token" };
  }

  // If cookie exists, verify match (Double Submit Cookie defense)
  if (cookieToken && cookieToken !== headerToken) {
    return { valid: false, reason: "CSRF token mismatch between header and cookie" };
  }

  return { valid: true };
}

/**
 * Attaches the CSRF token to an outgoing response cookie
 */
export function attachCsrfCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false, // Accessible to JavaScript so client can send in X-CSRF-Token header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
  });
}
