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
        if (!allowedRoles.includes(session.role)) {
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
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60_000);
}

// -----------------------------------------------------------------------------
// AUDIT LOGGING
// -----------------------------------------------------------------------------

async function logAuthFailure(
  userId: string | null,
  action: string,
  req: NextRequest,
  details: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource: "Auth",
        resourceId: "N/A",
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        newState: JSON.stringify({ details, url: req.nextUrl.pathname }),
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write auth failure log:", err);
  }
}

export async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  req: NextRequest,
  oldState?: Record<string, unknown>,
  newState?: Record<string, unknown>,
  challengeId?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        challengeId,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        oldState: oldState ? JSON.stringify(oldState) : null,
        newState: newState ? JSON.stringify(newState) : null,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}
