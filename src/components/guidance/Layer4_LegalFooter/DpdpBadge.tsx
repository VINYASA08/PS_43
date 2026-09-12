"use client";

import React from "react";
import { ShieldCheck, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import { useGuidanceStore } from "../store";

interface DpdpBadgeProps {
  variant?: "footer" | "card" | "compact";
  className?: string;
}

export function DpdpBadge({ variant = "footer", className = "" }: DpdpBadgeProps) {
  const openPrivacyPolicyModal = useGuidanceStore((state) => state.openPrivacyPolicyModal);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPrivacyPolicyModal();
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={openPrivacyPolicyModal}
        onKeyDown={handleKeyDown}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50 hover:border-emerald-400/50 transition-all cursor-pointer group shadow-sm ${className}`}
        aria-label="View DPDP Act 2023 compliance details"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span>DPDP 2023 Compliant</span>
      </button>
    );
  }

  if (variant === "card") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={openPrivacyPolicyModal}
        onKeyDown={handleKeyDown}
        className={`flex items-start gap-3 p-4 rounded-md bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-sm ${className}`}
        aria-label="Open DPDP Act 2023 Compliance & Privacy Disclosures Modal"
      >
        <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Statutory Privacy Guarantee
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Rule 3 Notice
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white mt-0.5 group-hover:text-emerald-300 transition-colors">
            DPDP Act 2023 Verified Data Fiduciary
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Zero mandatory PII • 500m Geo-Fuzzing • AES-256 Encrypted • Whistleblower Shield
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
      </div>
    );
  }

  // Default "footer" variant
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPrivacyPolicyModal}
      onKeyDown={handleKeyDown}
      className={`inline-flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-2.5 rounded-md bg-slate-900 border border-emerald-500/30 hover:border-emerald-400/60 hover:bg-slate-800 transition-all cursor-pointer group shadow-sm text-left ${className}`}
      aria-label="Click to open DPDP Act 2023 Statutory Privacy Policy Modal"
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
        <ShieldCheck className="w-4 h-4" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
            DPDP Act 2023 Compliant
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Verified Data Fiduciary
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
          <span>Zero PII</span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-slate-400" />
            AES-256 Encrypted
          </span>
          <span className="text-slate-600">•</span>
          <span>500m Geo-Fuzzing</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center pl-2 text-xs font-medium text-emerald-400 group-hover:translate-x-0.5 transition-transform">
        <span>View Notice</span>
        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
      </div>
    </div>
  );
}
