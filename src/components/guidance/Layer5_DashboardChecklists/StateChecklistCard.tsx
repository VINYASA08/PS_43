"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileCheck,
  Zap,
  Bot,
  Building2
} from "lucide-react";
import Link from "next/link";
import { useGuidanceStore } from "../store";
import { GUIDANCE_STORAGE_KEYS } from "../types";

export interface StateChecklistItem {
  id: string;
  title: string;
  description: string;
  statutoryRef: string;
  actionLabel?: string;
  actionHref?: string;
  actionType?: "modal_tour" | "link";
}

const STATE_CHECKLIST_ITEMS: StateChecklistItem[] = [
  {
    id: "state_triage_sla",
    title: "48-Hour Triage SLA Compliance",
    description:
      "Verify all pending citizen dockets across all 24 districts are reviewed and triaged within statutory 48 hours.",
    statutoryRef: "State DNO Directives §5.6",
    actionLabel: "DNO Directives",
    actionType: "modal_tour",
  },
  {
    id: "state_line_sla",
    title: "Line Department SLA Oversight",
    description:
      "Escalate breached municipal/PWD tickets (>7 days unacknowledged) directly to the District Magistrate.",
    statutoryRef: "Rapid Redressal SLA §6.2",
    actionLabel: "SLA Matrix",
    actionHref: "/guidelines",
    actionType: "link",
  },
  {
    id: "state_valley_death",
    title: "Valley of Death Monitoring",
    description:
      "Identify and intervene in academic innovation projects flagged as stalled for >14 days without prototype advancement.",
    statutoryRef: "State Innovation Protocol §7.4",
    actionLabel: "Oversight Directives",
    actionType: "modal_tour",
  },
  {
    id: "state_dual_escrow",
    title: "Dual Escrow Authorization",
    description:
      "Authorize milestone-locked Tranche 1/2/3 releases with dual cryptographic signatures from District Technology Officer (DTO) and PI.",
    statutoryRef: "CCA / MeitY Class 3 DSC",
    actionLabel: "Escrow Rules",
    actionHref: "/guidelines",
    actionType: "link",
  },
  {
    id: "state_swec_clearance",
    title: "Single Window Clearance (SWEC)",
    description:
      "Fast-track inter-departmental statutory clearances (Forestry, Mining, Water Resources) within 30 days for priority challenges.",
    statutoryRef: "Single Window Clearance Act",
    actionLabel: "Clearance SOP",
    actionHref: "/guidelines",
    actionType: "link",
  },
  {
    id: "state_ai_audit",
    title: "AI Categorization Audit",
    description:
      "Review pgvector deduplication precision, bias mitigation reports, and NLP dialect transcription telemetry.",
    statutoryRef: "Responsible AI Framework §4.3",
    actionLabel: "AI Standards",
    actionHref: "/guidelines",
    actionType: "link",
  },
  {
    id: "state_corporate_onboarding",
    title: "Corporate Onboarding Review",
    description:
      "Adjudicate pending corporate CSR registrations, verify MCA CIN / DPIIT credentials, and authorize platform access.",
    statutoryRef: "MCA CIN Gatekeeper SOP",
    actionLabel: "Gov Directives",
    actionType: "modal_tour",
  },
];

const CARD_KEY = GUIDANCE_STORAGE_KEYS.CHECKLIST_GOV;

export function StateChecklistCard() {
  const checklistState = useGuidanceStore((state) => state.checklistStates[CARD_KEY] || {});
  const isCollapsed = useGuidanceStore((state) => !!state.collapsedCards[CARD_KEY]);
  const toggleItem = useGuidanceStore((state) => state.toggleChecklistItem);
  const resetChecklist = useGuidanceStore((state) => state.resetChecklist);
  const toggleCollapse = useGuidanceStore((state) => state.toggleCardCollapse);
  const openOnboarding = useGuidanceStore((state) => state.openOnboarding);

  const completedCount = STATE_CHECKLIST_ITEMS.filter(
    (item) => !!checklistState[item.id]
  ).length;
  const totalCount = STATE_CHECKLIST_ITEMS.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const isAllCompleted = completedCount === totalCount;

  const handleActionClick = (item: StateChecklistItem) => {
    if (item.actionType === "modal_tour") {
      openOnboarding("government");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Card Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50/70 via-white to-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-600/20">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                Layer 5 Compliance
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Statewide Governance &amp; Oversight
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Statewide Governance &amp; Statutory Oversight Checklist
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Administrative Directives for District Nodal Officers &amp; State Innovation Council
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => openOnboarding("government")}
            className="px-3 py-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open Oversight Directives Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Oversight</span> Guide
          </button>

          <button
            type="button"
            onClick={() => resetChecklist(CARD_KEY)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Reset checklist progress"
            aria-label="Reset checklist"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleCollapse(CARD_KEY)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label={isCollapsed ? "Expand checklist" : "Collapse checklist"}
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Progress Ribbon */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">
            {completedCount} of {totalCount} Statutory Mandates Completed ({percentage}%)
          </span>
          {isAllCompleted && (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Statutory Compliance: Fully Satisfied
            </span>
          )}
        </div>

        <div className="w-full sm:w-56 bg-slate-200 h-2.5 rounded-full overflow-hidden shrink-0">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              isAllCompleted
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : "bg-gradient-to-r from-amber-500 to-amber-600"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Collapsible Checklist Items */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-slate-100 overflow-hidden"
          >
            {STATE_CHECKLIST_ITEMS.map((item, index) => {
              const isChecked = !!checklistState[item.id];
              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 transition-colors ${
                    isChecked ? "bg-slate-50/50" : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleItem(CARD_KEY, item.id)}
                      className="mt-0.5 text-slate-400 hover:text-amber-600 transition-colors shrink-0 cursor-pointer"
                      aria-label={`Toggle requirement: ${item.title}`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-amber-500" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          0{index + 1}.
                        </span>
                        <h3
                          onClick={() => toggleItem(CARD_KEY, item.id)}
                          className={`text-sm font-bold cursor-pointer transition-colors ${
                            isChecked
                              ? "text-slate-500 line-through decoration-slate-300"
                              : "text-slate-900 hover:text-amber-600"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.statutoryRef}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          isChecked ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Link/Trigger */}
                  {item.actionLabel && (
                    <div className="shrink-0 pt-0.5">
                      {item.actionType === "link" && item.actionHref ? (
                        <Link
                          href={item.actionHref}
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          {item.actionLabel}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActionClick(item)}
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          {item.actionLabel}
                          <Sparkles className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
