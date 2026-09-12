import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";
import { UserRole, UserStatus } from "./types";

const BCRYPT_SALT_ROUNDS = 12;
const COOKIE_NAME = "sih_session";
const SESSION_EXPIRATION = "7d";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is missing in production");
    }
    return new TextEncoder().encode("jharkhand-portal-default-dev-secret-minimum-32-chars-key");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  role: UserRole;
  status: UserStatus;
  organization?: string | null;
  district?: string | null;
}

// -----------------------------------------------------------------------------
// PASSWORD HASHING
// -----------------------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// -----------------------------------------------------------------------------
// JWT TOKEN MANAGEMENT
// -----------------------------------------------------------------------------
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: (payload.email as string) || null,
      phone: (payload.phone as string) || null,
      name: payload.name as string,
      role: payload.role as UserRole,
      status: payload.status as UserStatus,
      organization: (payload.organization as string) || null,
      district: (payload.district as string) || null,
    };
  } catch {
    return null;
  }
}

export async function signTempToken(payload: { userId: string; email?: string; scope: string }): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret);
}

export async function verifyTempToken(token: string): Promise<{ userId: string; email?: string; scope: string } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string | undefined,
      scope: payload.scope as string,
    };
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// SESSION RETRIEVAL & COOKIE HANDLING
// -----------------------------------------------------------------------------
export async function getSession(req?: NextRequest | Request): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req && "cookies" in req && typeof req.cookies.get === "function") {
    // NextRequest
    token = req.cookies.get(COOKIE_NAME)?.value;
  } else if (req && req.headers) {
    // Standard Request headers
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
      if (match) token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Not in Server Component / Route context with cookies()
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

export function attachSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function removeSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// -----------------------------------------------------------------------------
// ACCOUNT LOCKOUT MANAGEMENT
// -----------------------------------------------------------------------------
export function checkAccountLockout(user: {
  failedLoginAttempts: number;
  lockoutUntil: Date | null;
}): { isLocked: boolean; remainingMinutes: number } {
  if (user.lockoutUntil) {
    const now = new Date();
    if (user.lockoutUntil > now) {
      const remainingMs = user.lockoutUntil.getTime() - now.getTime();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      return { isLocked: true, remainingMinutes };
    }
  }
  return { isLocked: false, remainingMinutes: 0 };
}

export async function recordFailedLogin(userId: string): Promise<{
  isLocked: boolean;
  remainingMinutes: number;
  attempts: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true },
  });

  const newAttempts = (user?.failedLoginAttempts || 0) + 1;
  const isNowLocked = newAttempts >= MAX_FAILED_ATTEMPTS;
  const lockoutUntil = isNowLocked ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: newAttempts,
      lockoutUntil: lockoutUntil,
      status: isNowLocked ? "LOCKED" : undefined,
    },
  });

  return {
    isLocked: isNowLocked,
    remainingMinutes: isNowLocked ? 30 : 0,
    attempts: newAttempts,
  };
}

export async function resetFailedLogins(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockoutUntil: null,
      status: "ACTIVE",
    },
  });
}
