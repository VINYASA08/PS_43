import { create } from "zustand";
import { UserRole, UserStatus } from "@/lib/types";

export interface UserProfile {
  id: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  role: UserRole;
  tier?: string | null;
  status: UserStatus;
  organization?: string | null;
  designation?: string | null;
  district?: string | null;
  bio?: string | null;
  twoFactorEnabled?: boolean;
}

export function getRoleRedirect(role: UserRole | string): string {
  const normalized = (role || "").toUpperCase();
  if (normalized === "STATE_ADMIN") return "/dashboard/state";
  if (normalized === "GOV") return "/dashboard/gov";
  if (normalized === "UNIVERSITY") return "/dashboard/university";
  if (normalized === "INDUSTRY") return "/dashboard/industry";
  return "/submit";
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;

  setUser: (user: UserProfile | null) => void;
  setSessionExpired: (expired: boolean) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionExpired: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      sessionExpired: false,
    }),

  setSessionExpired: (expired) =>
    set({
      sessionExpired: expired,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  checkSession: async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            sessionExpired: false,
          });
          return;
        }
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));
