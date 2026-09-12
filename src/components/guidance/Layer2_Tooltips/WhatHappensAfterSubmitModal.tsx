"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Building2,
  GraduationCap,
  Briefcase,
  Rocket,
  ArrowRight,
  AlertTriangle,
  FileText,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useGuidanceStore } from "../store";

export function WhatHappensAfterSubmitModal() {
  const isOpen = useGuidanceStore((state) => state.isWhatHappensModalOpen);
  const closeModal = useGuidanceStore((state) => state.closeWhatHappensModal);

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
            aria-labelledby="what-happens-modal-title"
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-lg shadow-lg overflow-hidden z-10 text-white"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Rocket className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                      Statutory Resolution Lifecycle
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                      21-Day Statutory SLA
                    </span>
                  </div>
                  <h2 id="what-happens-modal-title" className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    What Happens After You Submit?
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

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm text-slate-300">
              {/* Highlight Banner */}
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">
                      The 5-Stage Journey of Your Civic Grievance
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      From Grassroots Submission to Verified Resolution on the State Innovation Ledger.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-blue-300 bg-blue-900/40 px-2.5 py-1 rounded border border-blue-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Max 21 Days to Resolution</span>
                </div>
              </div>

              {/* 5-Stage Stepper Cards */}
              <div className="space-y-4">
                {/* Stage 1 */}
                <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        AI Cognitive Intake &amp; Tri-Track Triage
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/20">
                      0 to 2 Hours • Immediate
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Upon submission, your docket is analyzed by the PRAGATI AI Cognitive Engine:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-1">
                    <li>
                      <strong className="text-slate-200">Semantic Deduplication:</strong> Vector similarity search (<code className="font-mono text-blue-300">pgvector cosine &gt; 0.92</code>) links related neighborhood reports to boost docket urgency.
                    </li>
                    <li>
                      <strong className="text-slate-200">Severity &amp; Urgency Scoring:</strong> Algorithmic urgency score (1 to 100) calculated from safety risks, affected population density, and computer vision inspection.
                    </li>
                    <li>
                      <strong className="text-slate-200">Tri-Track Routing:</strong> Classified into <span className="text-emerald-300">Track A</span> (Academic Innovation prototypes), <span className="text-amber-300">Track B</span> (Standard Public Works maintenance), or <span className="text-blue-300">Track C</span> (Civic Rapid Redressal for local field squads).
                    </li>
                  </ul>
                </div>

                {/* Stage 2 */}
                <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        District Nodal Officer Statutory Validation
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                      Within 48 Hours
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Official administrative review by the government-appointed District Nodal Officer (DNO):
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-1">
                    <li>
                      <strong className="text-slate-200">Validation:</strong> Verifies ground truth evidence, geotag coordinates, and initial AI classification.
                    </li>
                    <li>
                      <strong className="text-slate-200">Authoritative Decision Gates:</strong> Operates one of 3 statutory gates: (1) Reject with formal written justification, (2) Divert to Local Line Body (PWD, Water Board) on a strict Day 0-3-7 SLA clock, or (3) Route to Academia for competitive research adoption.
                    </li>
                  </ul>
                </div>

                {/* Stage 3 */}
                <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-400 text-xs font-bold flex items-center justify-center">
                        3
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        Academic Matching &amp; University DPR Formulation
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-500/20">
                      Days 3 to 14
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Interdisciplinary university research teams adopt the civic challenge:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-1">
                    <li>
                      <strong className="text-slate-200">AI Challenge Matching:</strong> Matches top 3 accredited HEIs based on lab accreditation and active project capacity. The first university to execute an atomic claim locks the exclusive docket.
                    </li>
                    <li>
                      <strong className="text-slate-200">Team &amp; DPR Formulation:</strong> Faculty Principal Investigator (PI) forms a multidisciplinary team. Participating students earn Academic Bank of Credits (ABC) under NEP 2020.
                    </li>
                    <li>
                      <strong className="text-slate-200">Detailed Project Report:</strong> Team drafts engineering blueprints and a milestone budget structured according to the statutory 30-40-30 escrow formula.
                    </li>
                  </ul>
                </div>

                {/* Stage 4 */}
                <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center justify-center">
                        4
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        Corporate CSR Sponsorship &amp; Escrow Funding
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                      Days 15 to 45
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Corporate industry sponsors fund and mentor the development phase:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-1">
                    <li>
                      <strong className="text-slate-200">CSR Sponsorship:</strong> Enters corporate partnership under Section 135 &amp; Schedule VII Item (ix)(a) of Companies Act 2013. Sponsoring partner deposits funds into the State Innovation Escrow.
                    </li>
                    <li>
                      <strong className="text-slate-200">Tranche 1 (30%) Disbursement:</strong> Released upon DPR approval and dual cryptographic digital signature by Faculty PI and District Technology Officer.
                    </li>
                    <li>
                      <strong className="text-slate-200">Form CSR-1 Auto-Generation:</strong> Sponsoring corporate receives an automated statutory Form CSR-1 for 100% tax exemption under Section 80G.
                    </li>
                  </ul>
                </div>

                {/* Stage 5 */}
                <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center">
                        5
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        Prototyping, Field Pilot &amp; Citizen Verification
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      Months 2 to 6 • Deployment
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Lab demonstration, rural field validation, and sovereign public good deployment:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-1">
                    <li>
                      <strong className="text-slate-200">Tranche 2 (40%):</strong> Released upon successful demonstration of a working lab prototype verified by the Corporate Industry Mentor.
                    </li>
                    <li>
                      <strong className="text-slate-200">Field Validation:</strong> Deployed at the reporting site with formal Gram Sabha council consent in scheduled tribal/rural areas.
                    </li>
                    <li>
                      <strong className="text-slate-200">Tranche 3 (30%) &amp; Public Good:</strong> Released after positive citizen verification. The Government of Jharkhand retains a perpetual, royalty-free Sovereign Public Good License across all 24 districts.
                    </li>
                    <li>
                      <strong className="text-slate-200">Citizen Rating:</strong> You receive an SMS/WhatsApp notification to inspect the outcome and submit a final satisfaction rating.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Statutory Guarantee Footer Card */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Breached SLAs (&gt;7 days unacknowledged) trigger automatic escalation to the District Magistrate.
                  </span>
                </div>
                <Link
                  href="/track"
                  onClick={closeModal}
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 shrink-0"
                >
                  Track Existing Docket <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close &amp; Return to Submission
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
