"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Coins,
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileCheck,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle
} from "lucide-react";
import { useGuidanceStore } from "../store";

export function FundingTiersModal() {
  const isOpen = useGuidanceStore((state) => state.isFundingTiersModalOpen);
  const closeModal = useGuidanceStore((state) => state.closeFundingTiersModal);
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(3);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-slate-950/80 transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="funding-tiers-modal-title"
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-lg shadow-lg overflow-hidden z-10 text-white"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      Corporate Sponsorship &amp; Escrow
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                      Sec 135 Companies Act 2013
                    </span>
                  </div>
                  <h2 id="funding-tiers-modal-title" className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Corporate Sponsorship Tiers &amp; Milestone-Locked Escrow System
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SIH Sandbox Banner */}
            <div className="px-6 py-2.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                SIH Demonstration Mode: Simulated UPI / Escrow Gateway enabled for sandbox testing.
              </span>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm text-slate-300">
              {/* Overview Subtitle */}
              <p className="text-xs text-slate-400">
                Operating under Section 135 Companies Act 2013 and State Innovation Escrow Protocols. Sponsoring corporate partners can choose between 3 tailored participation models with milestone-locked fund protection.
              </p>

              {/* Comparative Sponsorship Matrix */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Comparative Sponsorship Model Matrix
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Tier 1 Card */}
                  <div
                    onClick={() => setSelectedTier(1)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      selectedTier === 1
                        ? "bg-slate-800/90 border-blue-500 shadow-lg"
                        : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                        Tier 1
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                        ₹0 Capital
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Mentorship &amp; Advisory</h4>
                    <p className="text-[11px] text-slate-400">
                      Technical guidance, design reviews, and advisory hours without financial deposit.
                    </p>
                    <div className="pt-2 border-t border-slate-700/60 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Commitment:</span>
                        <span className="text-slate-200">&ge; 10 hrs / month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">IP Claim:</span>
                        <span className="text-emerald-400 font-bold">0% (100% Univ)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ROFR Window:</span>
                        <span className="text-slate-200">None (Recruitment)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Statutory Tax:</span>
                        <span className="text-slate-200">CSR Citation</span>
                      </div>
                    </div>
                  </div>

                  {/* Tier 2 Card */}
                  <div
                    onClick={() => setSelectedTier(2)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      selectedTier === 2
                        ? "bg-slate-800/90 border-indigo-500 shadow-lg"
                        : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                        Tier 2
                      </span>
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                        In-Kind Assets
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">In-Kind Infrastructure</h4>
                    <p className="text-[11px] text-slate-400">
                      Access to specialized lab testing rigs, compute clusters, cleanrooms, and licenses.
                    </p>
                    <div className="pt-2 border-t border-slate-700/60 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Commitment:</span>
                        <span className="text-slate-200">Equipment / Tools</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">IP Claim:</span>
                        <span className="text-indigo-400 font-bold">15% to 30% Share</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ROFR Window:</span>
                        <span className="text-slate-200">90 Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Statutory Form:</span>
                        <span className="text-slate-200">Contribution Memo</span>
                      </div>
                    </div>
                  </div>

                  {/* Tier 3 Card */}
                  <div
                    onClick={() => setSelectedTier(3)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      selectedTier === 3
                        ? "bg-slate-800/90 border-emerald-500 shadow-lg"
                        : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                        Tier 3 (Primary)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                        100% Budget
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Direct CSR Capital</h4>
                    <p className="text-[11px] text-slate-400">
                      Full financial sponsorship deposited into the State Innovation Escrow.
                    </p>
                    <div className="pt-2 border-t border-slate-700/60 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Commitment:</span>
                        <span className="text-slate-200">₹1L to ₹50L+ Escrow</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">IP Claim:</span>
                        <span className="text-emerald-400 font-bold">50% or 60% Share</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ROFR Window:</span>
                        <span className="text-slate-200">180 Days Exclusive</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Statutory Form:</span>
                        <span className="text-emerald-400 font-bold">Form CSR-1 (80G)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Milestone-Locked 30-40-30 Escrow Tranche System */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    The Milestone-Locked 30-40-30 Escrow Tranche System
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    Dual DSC Sign-Off Required
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Tranche 1 */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono">
                          30%
                        </span>
                        <h4 className="font-bold text-white text-xs">
                          Tranche 1: Detailed Project Report (DPR) Approval &amp; Ethical Clearance
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
                        Milestone 1
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Released when the university research team submits a vetted Detailed Project Report (DPR) containing technical schematics, bill of materials, and project milestones.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-mono pt-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Verification Gate: Dual Cryptographic Sign-Off (Faculty PI DSC + District Technology Officer DTO DSC)</span>
                    </div>
                  </div>

                  {/* Tranche 2 */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center justify-center font-mono">
                          40%
                        </span>
                        <h4 className="font-bold text-white text-xs">
                          Tranche 2: Laboratory Prototype Demonstration &amp; TRL Advancement
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
                        Milestone 2
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Released upon successful demonstration of a working prototype in the university lab advancing technology readiness level to TRL 4–6.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-blue-300 font-mono pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verification Gate: Joint Verification by Corporate Industry Mentor &amp; University TTO</span>
                    </div>
                  </div>

                  {/* Tranche 3 */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-400 text-xs font-bold flex items-center justify-center font-mono">
                          30%
                        </span>
                        <h4 className="font-bold text-white text-xs">
                          Tranche 3: Field Validation, Gram Sabha Clearance &amp; Deployment
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
                        Milestone 3
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Released following real-world pilot validation at the community reporting site with verified positive citizen feedback.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-violet-300 font-mono pt-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>Verification Gate: Gram Sabha Council Resolution (tribal/rural) or Municipal Certificate + District Collector Sign-Off</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Tax Exemption & Form CSR-1 Notice */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Tax Exemption under Section 80G &amp; Form CSR-1</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct capital sponsorship into the State Innovation Escrow qualifies as statutory Corporate Social Responsibility (CSR) expenditure under <strong className="text-white">Schedule VII, Item (ix)(a) of the Companies Act, 2013</strong>. Upon tranche deposit, the platform automatically generates an authenticated <strong className="text-emerald-300">Form CSR-1</strong> for seamless filing with the Ministry of Corporate Affairs (MCA) and 100% tax deduction under Section 80G.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Funding Tiers
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
