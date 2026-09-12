import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionPayload } from "./auth";
import prisma from "./prisma";
import { UserRole } from "./types";

// -----------------------------------------------------------------------------
// RBAC MIDDLEWARE WRAPPER
// Wraps API route handlers with authentication and role-based authorization
// -----------------------------------------------------------------------------

type AuthenticatedHandler = (
  req: NextRequest,
  session: SessionPayload,
  context?: any
) => Promise<NextResponse>;

/**
 * Wrap an API route handler with authentication and optional role-based access control.
 * - Returns 401 if no valid session exists.
 * - Returns 403 if the user's role is not in the allowedRoles list.
 * - Logs authorization failures to the AuditLog table.
 */
export function withAuth(
  handler: AuthenticatedHandler,
  allowedRoles?: UserRole[]
) {
  return async (
    req: NextRequest,
    context?: any
  ): Promise<NextResponse> => {
    try {
      const session = await getSession(req);

      if (!session) {
        await logAuthFailure(null, "AUTH_FAILURE", req, "No valid session");
        return NextResponse.json(
          { error: "Authentication required. Please log in." },
          { status: 401 }
        );
      }

      if (session.status !== "ACTIVE") {
        await logAuthFailure(session.userId, "AUTH_FAILURE", req, `Account status: ${session.status}`);
        return NextResponse.json(
          { error: "Your account is not active. Please contact support." },
          { status: 403 }
        );
      }

      if (allowedRoles && allowedRoles.length > 0) {
        // STATE_ADMIN has god-mode privileges across all administrative and operational routes
        const isAuthorized = session.role === UserRole.STATE_ADMIN || allowedRoles.includes(session.role);
        if (!isAuthorized) {
          await logAuthFailure(
            session.userId,
            "AUTHORIZATION_FAILURE",
            req,
            `Role ${session.role} attempted to access ${allowedRoles.join(", ")} route`
          );
          return NextResponse.json(
            { error: "You do not have permission to access this resource." },
            { status: 403 }
          );
        }
      }

      return handler(req, session, context);
    } catch (error) {
      console.error("[RBAC] Unhandled error in protected route:", error);
      return NextResponse.json(
        { error: "An internal error occurred. Please try again later." },
        { status: 500 }
      );
    }
  };
}

// -----------------------------------------------------------------------------
// RATE LIMITING (In-Memory — suitable for single-instance deployments)
// For production multi-instance, replace with Redis-based rate limiting
// -----------------------------------------------------------------------------

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

// Cleanup stale entries periodically
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60_000);
  if (typeof timer.unref === "function") {
    timer.unref();
  }
}

// -----------------------------------------------------------------------------
// AUDIT LOGGING
// -----------------------------------------------------------------------------

async function resolveValidUserId(userId?: string | null): Promise<string | null> {
  if (!userId || typeof userId !== "string") return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return user ? user.id : null;
  } catch {
    return null;
  }
}

async function logAuthFailure(
  userId: string | null,
  action: string,
  req: NextRequest,
  details: string
): Promise<void> {
  try {
    const validUserId = await resolveValidUserId(userId);
    const attemptedNote = (!validUserId && userId) ? ` [attemptedUserId: ${userId}]` : "";
    await prisma.auditLog.create({
      data: {
        userId: validUserId,
        action,
        resource: "Auth",
        resourceId: "N/A",
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        newState: JSON.stringify({ details: `${details}${attemptedNote}`, url: req.nextUrl?.pathname || "unknown" }),
      },
    });
  } catch (err: any) {
    if (err?.code === "P2003") {
      try {
        await prisma.auditLog.create({
          data: {
            userId: null,
            action,
            resource: "Auth",
            resourceId: "N/A",
            ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            newState: JSON.stringify({ details, attemptedUserId: userId, url: req.nextUrl?.pathname || "unknown" }),
          },
        });
      } catch (retryErr) {
        console.error("[AuditLog] Failed fallback auth failure log:", retryErr);
      }
    } else {
      console.error("[AuditLog] Failed to write auth failure log:", err);
    }
  }
}

export async function logAuditEvent(
  userId: string | null | undefined,
  action: string,
  resource: string,
  resourceId: string,
  req: NextRequest,
  oldState?: Record<string, unknown>,
  newState?: Record<string, unknown>,
  challengeId?: string
): Promise<void> {
  try {
    const validUserId = await resolveValidUserId(userId);
    const effectiveNewState = (!validUserId && userId)
      ? { ...(newState || {}), attemptedUserId: userId }
      : newState;

    await prisma.auditLog.create({
      data: {
        userId: validUserId,
        action,
        resource,
        resourceId,
        challengeId,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        oldState: oldState ? JSON.stringify(oldState) : null,
        newState: effectiveNewState ? JSON.stringify(effectiveNewState) : null,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2003") {
      try {
        await prisma.auditLog.create({
          data: {
            userId: null,
            action,
            resource,
            resourceId,
            challengeId,
            ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            oldState: oldState ? JSON.stringify(oldState) : null,
            newState: JSON.stringify({ ...(newState || {}), attemptedUserId: userId, fkFallback: true }),
          },
        });
      } catch (retryErr) {
        console.error("[AuditLog] Failed fallback audit log:", retryErr);
      }
    } else {
      console.error("[AuditLog] Failed to write audit log:", err);
    }
  }
}

// -----------------------------------------------------------------------------
// GOD-MODE & FINE-GRAINED ROLE PERMISSIONS
// -----------------------------------------------------------------------------

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.STATE_ADMIN]: [
    "*", // God-mode: all operations allowed
    "challenge:read",
    "challenge:create",
    "challenge:update",
    "challenge:delete",
    "challenge:override",
    "challenge:reassign",
    "challenge:force_status",
    "triage:read",
    "triage:decide",
    "triage:override",
    "funding:read",
    "funding:create",
    "funding:revoke",
    "funding:escrow_manage",
    "user:read",
    "user:approve",
    "user:reject",
    "user:manage",
    "ai:read_config",
    "ai:update_config",
    "analytics:read",
    "audit:read",
  ],
  [UserRole.GOV]: [
    "challenge:read",
    "challenge:update",
    "challenge:delete",
    "triage:read",
    "triage:decide",
    "funding:read",
    "user:read",
    "user:approve",
    "user:reject",
    "analytics:read",
    "audit:read",
  ],
  [UserRole.UNIVERSITY]: [
    "challenge:read",
    "challenge:claim",
    "proposal:create",
    "proposal:read",
    "proposal:update",
    "funding:read",
  ],
  [UserRole.INDUSTRY]: [
    "challenge:read",
    "proposal:read",
    "funding:create",
    "funding:read",
    "funding:update",
  ],
  [UserRole.CITIZEN]: [
    "challenge:create",
    "challenge:read",
  ],
  [UserRole.EXPERT]: [
    "challenge:read",
    "proposal:read",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  if (role === UserRole.STATE_ADMIN) return true;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes("*") || perms.includes(permission);
}

