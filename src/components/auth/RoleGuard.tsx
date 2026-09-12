"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/lib/types";
import { SkeletonPage } from "@/components/ui/Skeletons";

interface RoleGuardProps {
  allowedRoles?: (UserRole | string)[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        router.replace(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      }
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRoleNormalized = (user.role || "").toUpperCase();
      // STATE_ADMIN has god-mode privileges and is whitelisted across all administrative resources
      const isAllowed =
        userRoleNormalized === "STATE_ADMIN" ||
        allowedRoles.some((r) => r.toUpperCase() === userRoleNormalized);

      if (!isAllowed) {
        // Redirect to authorized home based on role
        if (userRoleNormalized === "STATE_ADMIN") {
          router.replace("/dashboard/state");
        } else if (userRoleNormalized === "GOV") {
          router.replace("/dashboard/gov");
        } else if (userRoleNormalized === "UNIVERSITY") {
          router.replace("/dashboard/university");
        } else if (userRoleNormalized === "INDUSTRY") {
          router.replace("/dashboard/industry");
        } else {
          router.replace("/submit");
        }
      }
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, router]);

  if (isLoading || !isAuthenticated || !user) {
    return <SkeletonPage />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleNormalized = (user.role || "").toUpperCase();
    const isAllowed =
      userRoleNormalized === "STATE_ADMIN" ||
      allowedRoles.some((r) => r.toUpperCase() === userRoleNormalized);
    if (!isAllowed) {
      return <SkeletonPage />;
    }
  }

  return <>{children}</>;
}
