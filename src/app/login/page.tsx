"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuthStore, getRoleRedirect } from "@/stores/authStore";
import { UserRole } from "@/lib/types";

interface DemoPreset {
  key: string;
  title: string;
  role: UserRole;
  email: string;
  password: string;
  badge: string;
  redirect: string;
  color: string;
  accent: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    key: "gov",
    title: "Gov Nodal Officer",
    role: UserRole.GOV,
    email: "nodal.innovation@jharkhand.gov.in",
    password: "Jharkhand@2026!",
    badge: "Dept. Higher & Tech Edu",
    redirect: "/dashboard/gov",
    color: "border-blue-200 hover:border-blue-500 bg-blue-50/60 hover:bg-blue-50",
    accent: "text-blue-700",
  },
  {
    key: "university",
    title: "University SPOC",
    role: UserRole.UNIVERSITY,
    email: "pi.water@iitism.ac.in",
    password: "Jharkhand@2026!",
    badge: "IIT (ISM) Dhanbad",
    redirect: "/dashboard/university",
    color: "border-purple-200 hover:border-purple-500 bg-purple-50/60 hover:bg-purple-50",
    accent: "text-purple-700",
  },
  {
    key: "industry",
    title: "Industry Partner",
    role: UserRole.INDUSTRY,
    email: "csr.director@tatasteel.com",
    password: "Jharkhand@2026!",
    badge: "Tata Steel CSR",
    redirect: "/dashboard/industry",
    color: "border-emerald-200 hover:border-emerald-500 bg-emerald-50/60 hover:bg-emerald-50",
    accent: "text-emerald-700",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeFastLogin, setActiveFastLogin] = useState<string | null>(null);

  const executeLogin = async (
    targetEmail: string,
    targetPassword: string,
    targetRole: UserRole,
    fastLoginKey?: string,
    forcedRedirect?: string
  ) => {
    setEmail(targetEmail);
    setPassword(targetPassword);
    setRole(targetRole);
    setError("");
    setIsLoading(true);
    if (fastLoginKey) setActiveFastLogin(fastLoginKey);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || "Invalid credentials");
      }

      // Enforce selected role matching account role
      if (data.user?.role !== targetRole) {
        throw new Error("Invalid role selected for this account.");
      }

      setUser(data.user);

      const destination = forcedRedirect || data.redirectUrl || getRoleRedirect(data.user.role);
      router.push(destination);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred during authentication.";
      setError(message);
    } finally {
      setIsLoading(false);
      setActiveFastLogin(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) {
      setError("Please fill in all fields and select a role.");
      return;
    }
    await executeLogin(email, password, role as UserRole);
  };

  return (
    <div
      className="flex-1 w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-10 px-4 sm:px-6 bg-slate-50 relative"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%23cbd5e1' stroke-width='1' stroke-opacity='0.35'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34' fill='none' stroke='%23cbd5e1' stroke-width='1' stroke-opacity='0.35'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    >
      {/* Announcement Banner */}
      <div className="w-full max-w-xl text-center mb-6 sm:mb-8 z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal text-red-600 tracking-wider text-center uppercase leading-tight">
          PRAGATI REGISTRATIONS ARE NOW<br className="hidden sm:inline" /> OPEN
        </h1>
      </div>

      {/* Crisp, Flat White Card with Subtle Borders */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 sm:p-8 w-full max-w-md z-10">
        {error && (
          <div
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="sr-only">
              Email Address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-sm text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-[#13528A] focus:ring-1 focus:ring-[#13528A] transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="sr-only">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-sm text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-[#13528A] focus:ring-1 focus:ring-[#13528A] transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="login-role" className="sr-only">
              User Role
            </label>
            <select
              id="login-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-sm text-sm text-slate-900 bg-white focus:outline-none focus:border-[#13528A] focus:ring-1 focus:ring-[#13528A] transition-colors"
              required
            >
              <option value="" disabled>
                Please Select User Role
              </option>
              <option value={UserRole.STATE_ADMIN}>State Admin</option>
              <option value={UserRole.GOV}>District Nodal Officer</option>
              <option value={UserRole.UNIVERSITY}>College/Institute SPOC</option>
              <option value={UserRole.INDUSTRY}>Industry Partner</option>
              <option value={UserRole.EXPERT}>Review Committee Personnel</option>
              <option value={UserRole.CITIZEN}>Citizen</option>
            </select>
          </div>

          <div className="flex justify-start">
            <Link
              href="/help"
              className="text-xs sm:text-sm text-[#13528A] hover:underline focus:outline-none focus:ring-2 focus:ring-[#13528A]/30 rounded-xs"
            >
              Forgot Your Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-[#4ca64c] hover:bg-[#439643] text-white font-semibold text-sm rounded-sm transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && !activeFastLogin ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              "Submit"
            )}
          </button>

          <div className="text-center pt-2 text-xs sm:text-sm text-slate-600">
            Don&apos;t Have Account?{" "}
            <Link
              href="/guidelines"
              className="text-[#13528A] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#13528A]/30 rounded-xs"
            >
              Register Now as SPOC
            </Link>
          </div>
        </form>

        {/* Demo / Fast Login Section */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Demo / Fast Login
            </span>
            <span className="text-[11px] text-[#13528A] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-medium">
              1-Click Evaluator Sign-In
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {DEMO_PRESETS.map((preset) => {
              const isCurrentLoading = activeFastLogin === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    executeLogin(
                      preset.email,
                      preset.password,
                      preset.role,
                      preset.key,
                      preset.redirect
                    )
                  }
                  className={`w-full flex items-center justify-between p-2.5 rounded-sm border text-left transition-all ${preset.color} ${
                    isLoading ? "opacity-60 cursor-not-allowed" : "hover:shadow-xs cursor-pointer"
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${preset.accent}`}>
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 truncate">
                        {preset.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-mono truncate">
                      {preset.email}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center">
                    {isCurrentLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#13528A]" />
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 hover:text-slate-800">
                        1-Click →
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
