"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  Lock,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  Clock,
  ArrowLeft,
  Mail,
  MapPin
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function HandoverClaimPage() {
  const params = useParams();
  const rawToken = params?.token as string | undefined;
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<{
    valid: boolean;
    successorEmail: string;
    expiresAt: string;
    predecessor: {
      name: string;
      designation: string;
      organization: string;
      role: string;
      district: string;
    };
  } | null>(null);

  // Claim Form State
  const [successorName, setSuccessorName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [affirmation, setAffirmation] = useState(false);

  // Submission State
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (!rawToken) {
      setValidationError("Missing handover invitation token in URL.");
      setIsValidating(false);
      return;
    }

    async function validateToken() {
      setIsValidating(true);
      setValidationError(null);
      try {
        const res = await fetch(`/api/handover/${rawToken}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenData(data);
        } else {
          setValidationError(
            data.error ||
              "This handover invitation is invalid, has expired, or has already been claimed."
          );
        }
      } catch (err: any) {
        setValidationError(
          err.message || "Failed to reach portal servers to validate token."
        );
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [rawToken]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError(null);

    if (!successorName.trim() || successorName.trim().length < 2) {
      setClaimError("Please enter your full official name (at least 2 characters).");
      return;
    }

    if (password.length < 8) {
      setClaimError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setClaimError("Password and Confirm Password do not match.");
      return;
    }

    if (!affirmation) {
      setClaimError("Please confirm the statutory affirmation to proceed.");
      return;
    }

    setIsClaiming(true);
    try {
      const res = await fetch(`/api/handover/${rawToken}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          successorName: successorName.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setClaimSuccess(true);
        const destination = data.redirectUrl || "/dashboard";
        setRedirectUrl(destination);

        // Update auth store with the newly claimed user
        if (data.user) {
          useAuthStore.getState().setUser(data.user);
        }

        // Automatic redirect after 1.5s
        setTimeout(() => {
          router.push(destination);
        }, 1500);
      } else {
        setClaimError(data.error || "Failed to claim account handover.");
      }
    } catch (err: any) {
      setClaimError(err.message || "Network error occurred during account claim.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Header */}
      <div className="max-w-xl w-full mx-auto mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Portal Home
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            Govt. of Jharkhand • Succession Portal
          </span>
        </div>
      </div>

      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Loading Skeleton */}
        {isValidating ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-slate-200 rounded-xl" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          </div>
        ) : validationError ? (
          /* Error State Card */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-rose-200 shadow-sm p-8 space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                Handover Invitation Unavailable
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {validationError}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 text-left flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                If you believe this is an error, contact your predecessor or institutional nodal officer to issue a fresh transfer link.
              </span>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all"
              >
                Go to Portal Login
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        ) : claimSuccess ? (
          /* Success State Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-emerald-200 shadow-lg p-8 space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Mandate Successfully Transferred
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Account Transferred Successfully!
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Welcome, <strong>{successorName}</strong>. Your official credentials have been established and your administrative session is active.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Setting up your session and redirecting to your dashboard...</span>
            </div>
            <div className="pt-2">
              <Link
                href={redirectUrl || "/dashboard"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Proceed to Dashboard Immediately <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : tokenData ? (
          /* Valid Token: Predecessor Verification & Claim Form */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-slate-100">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Building2 className="w-3 h-3" /> Official Mandate Transfer
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Accept Mandate & Claim Account
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Complete this one-time verification to take over statutory responsibilities and active portal records.
              </p>
            </div>

            {/* Claim Error Banner */}
            {claimError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Claim Submission Failed</p>
                  <p>{claimError}</p>
                </div>
              </div>
            )}

            {/* Predecessor Mandate Verification Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Predecessor Mandate Verification
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                  {tokenData.predecessor.role}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Official / Predecessor</span>
                  <span className="font-bold text-slate-900 block truncate">
                    {tokenData.predecessor.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {tokenData.predecessor.designation}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Organization & District</span>
                  <span className="font-bold text-slate-900 block truncate">
                    {tokenData.predecessor.organization}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    District: {tokenData.predecessor.district}
                  </span>
                </div>
              </div>

              {/* Successor Email Notice */}
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-slate-600">Transferring account to:</span>
                  <span className="font-bold text-blue-900 font-mono truncate">{tokenData.successorEmail}</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 shrink-0">Verified</span>
              </div>
            </div>

            {/* Claim Credential Form */}
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Successor Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={successorName}
                    onChange={(e) => setSuccessorName(e.target.value)}
                    placeholder="e.g. Dr. Anand Verma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Account Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Statutory Affirmation */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-snug">
                  <input
                    type="checkbox"
                    required
                    checked={affirmation}
                    onChange={(e) => setAffirmation(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 mt-0.5 cursor-pointer"
                  />
                  <span>
                    I accept administrative ownership and statutory responsibility for this account. 
                    I acknowledge that historical records, proposals, and assignments will transition to my stewardship.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isClaiming || !affirmation}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isClaiming ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying & Claiming Account...
                    </>
                  ) : (
                    <>
                      Accept Mandate & Claim Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {/* Footer Branding */}
      <div className="max-w-xl w-full mx-auto text-center mt-8 text-[11px] text-slate-400">
        Jharkhand Societal Innovation Collaboration Portal • Official Account Mandate Transfer Service
      </div>
    </div>
  );
}
