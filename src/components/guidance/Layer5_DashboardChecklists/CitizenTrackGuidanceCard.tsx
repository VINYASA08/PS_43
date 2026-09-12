"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
  Layers,
  HelpCircle,
  Activity,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import { useGuidanceStore } from "../store";
import { GUIDANCE_STORAGE_KEYS } from "../types";

const CARD_KEY = GUIDANCE_STORAGE_KEYS.CHECKLIST_TRACK;

export function CitizenTrackGuidanceCard() {
  const isCollapsed = useGuidanceStore((state) => !!state.collapsedCards[CARD_KEY]);
  const toggleCollapse = useGuidanceStore((state) => state.toggleCardCollapse);
  const openOnboarding = useGuidanceStore((state) => state.openOnboarding);
  const openWhatHappensModal = useGuidanceStore((state) => state.openWhatHappensModal);
  const openPrivacyModal = useGuidanceStore((state) => state.openPrivacyPolicyModal);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Card Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                Citizen SLA &amp; Privacy Shield
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline font-mono">
                DPDP Act 2023 Compliant
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Grievance Resolution &amp; Tracking Guidance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Understanding your docket status, statutory resolution SLAs, and escalation remedies
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => openOnboarding("citizen")}
            className="px-3 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Take Grassroots Reporting Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Citizen</span> Tour
          </button>

          <button
            type="button"
            onClick={() => toggleCollapse(CARD_KEY)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label={isCollapsed ? "Expand guidance card" : "Collapse guidance card"}
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 space-y-6">
              {/* 4 Guidance Feature Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pillar 1: SLA Timelines */}
                <div className="p-4 rounded-md bg-blue-50/50 border border-blue-100 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Clock className="w-5 h-5" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        21-Day Statutory SLA
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Every docket is bound by statutory timelines:
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-1 font-medium list-disc list-inside">
                      <li><strong className="text-slate-800">Track C:</strong> 7 days (Municipal)</li>
                      <li><strong className="text-slate-800">Track B:</strong> 14–30 days (PWD)</li>
                      <li><strong className="text-slate-800">Track A:</strong> 30–180 days (Academia)</li>
                    </ul>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded self-start">
                    SLA Guarantee
                  </span>
                </div>

                {/* Pillar 2: 5-Stage Lifecycle */}
                <div className="p-4 rounded-md bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Layers className="w-5 h-5" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        5-Stage Lifecycle
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Live tracking across five verified milestone stages:
                    </p>
                    <ol className="text-[11px] text-slate-600 space-y-1 font-medium list-decimal list-inside">
                      <li>AI Ingestion &amp; Triage</li>
                      <li>District Nodal Review</li>
                      <li>University DPR Claim</li>
                      <li>CSR Escrow Funding</li>
                      <li>Field Trial &amp; Resolution</li>
                    </ol>
                  </div>
                  <button
                    type="button"
                    onClick={openWhatHappensModal}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 underline self-start cursor-pointer inline-flex items-center gap-1"
                  >
                    View Stage Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pillar 3: 500m Geo-Privacy Shield */}
                <div className="p-4 rounded-md bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Lock className="w-5 h-5" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        500m Geo-Privacy Shield
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Exact GPS coordinates are encrypted with AES-256. Public dashboards and maps display only an obfuscated 500-meter radius polygon to safeguard your residence.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openPrivacyModal}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline self-start cursor-pointer inline-flex items-center gap-1"
                  >
                    DPDP Rule 3 Notice <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pillar 4: Escalation Ladder */}
                <div className="p-4 rounded-md bg-amber-50/50 border border-amber-100 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Escalation Remedies
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If an assigned authority breaches their resolution SLA:
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-1 font-medium list-disc list-inside">
                      <li><strong className="text-slate-800">Day 3:</strong> Automated reminder</li>
                      <li><strong className="text-slate-800">Day 7:</strong> District Magistrate</li>
                      <li><strong className="text-slate-800">Day 14:</strong> State Nodal Officer</li>
                    </ul>
                  </div>
                  <Link
                    href="/help"
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-900 underline self-start inline-flex items-center gap-1"
                  >
                    Grievance SOPs <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Bottom Assurance Banner */}
              <div className="p-4 rounded-md bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Whistleblower Protection Act:</strong> Your identity is legally protected against retaliation. No Aadhaar, PAN, or voter ID is required to track grievances.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/help"
                    className="px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    Help Center <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
