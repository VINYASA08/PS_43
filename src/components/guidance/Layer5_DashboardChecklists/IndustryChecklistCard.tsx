"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Coins,
  Scale,
  Clock,
  FileText,
  Users
} from "lucide-react";
import Link from "next/link";
import { useGuidanceStore } from "../store";
import { GUIDANCE_STORAGE_KEYS } from "../types";

export interface IndustryChecklistItem {
  id: string;
  title: string;
  description: string;
  statutoryRef: string;
  actionLabel?: string;
  actionHref?: string;
  actionType?: "modal_ip" | "modal_funding" | "modal_tour" | "link";
}

const INDUSTRY_CHECKLIST_ITEMS: IndustryChecklistItem[] = [
  {
    id: "ind_cin_validation",
    title: "Corporate Verification",
    description:
      "Confirm Ministry of Corporate Affairs CIN or DPIIT Startup registration is verified by State Government Admin.",
    statutoryRef: "Companies Act 2013 §135",
    actionLabel: "Corporate Guide",
    actionType: "modal_tour",
  },
  {
    id: "ind_csr_compliance",
    title: "CSR Schedule VII Compliance",
    description:
      "Verify sponsored project qualifies under Schedule VII Item (ix)(a) of Companies Act 2013 (R&D in STEM & public health).",
    statutoryRef: "MCA CSR Rules 2014 & Schedule VII",
    actionLabel: "View CSR Rules",
    actionHref: "/guidelines",
    actionType: "link",
  },
  {
    id: "ind_csr1_archival",
    title: "Form CSR-1 Archival",
    description:
      "Download and file auto-generated Form CSR-1 for statutory MCA filing and 100% tax exemption under Section 80G.",
    statutoryRef: "Rule 4(2) Companies CSR Rules",
    actionLabel: "Funding Tiers",
    actionType: "modal_funding",
  },
  {
    id: "ind_escrow_deposit",
    title: "State Escrow Deposit",
    description:
      "Complete milestone-locked escrow tranche commitment (30-40-30 schedule) into the State Innovation Escrow account.",
    statutoryRef: "State Escrow Protocol §3.3",
    actionLabel: "Escrow Matrix",
    actionType: "modal_funding",
  },
  {
    id: "ind_mentorship_kanban",
    title: "Mentorship Task Board",
    description:
      "Conduct monthly technical advisory hours and assign tasks on the student laboratory Kanban board.",
    statutoryRef: "NISP 2019 Advisory Code",
    actionLabel: "Guidelines",
    actionHref: "/guidelines",
    actionType: "link",
  },
  {
    id: "ind_trl_audit",
    title: "TRL 1-9 Audit Sign-off",
    description:
      "Execute dual-gate verification with Faculty PI for laboratory prototype milestone completion (advancing to TRL 4-6).",
    statutoryRef: "DST TRL Assessment Benchmarks",
    actionLabel: "Audit Guide",
    actionType: "modal_tour",
  },
  {
    id: "ind_rofr_monitoring",
    title: "180-Day ROFR Monitoring",
    description:
      "Track exclusive commercialization licensing window (180 days) from prototype validation gate before third-party release.",
    statutoryRef: "IP Guidelines 2026 §4.1",
    actionLabel: "IP Framework",
    actionType: "modal_ip",
  },
];

const CARD_KEY = GUIDANCE_STORAGE_KEYS.CHECKLIST_INDUSTRY;

export function IndustryChecklistCard() {
  const checklistState = useGuidanceStore((state) => state.checklistStates[CARD_KEY] || {});
  const isCollapsed = useGuidanceStore((state) => !!state.collapsedCards[CARD_KEY]);
  const toggleItem = useGuidanceStore((state) => state.toggleChecklistItem);
  const resetChecklist = useGuidanceStore((state) => state.resetChecklist);
  const toggleCollapse = useGuidanceStore((state) => state.toggleCardCollapse);
  const openFundingTiersModal = useGuidanceStore((state) => state.openFundingTiersModal);
  const openIpRightsModal = useGuidanceStore((state) => state.openIpRightsModal);
  const openOnboarding = useGuidanceStore((state) => state.openOnboarding);

  const completedCount = INDUSTRY_CHECKLIST_ITEMS.filter(
    (item) => !!checklistState[item.id]
  ).length;
  const totalCount = INDUSTRY_CHECKLIST_ITEMS.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const isAllCompleted = completedCount === totalCount;

  const handleActionClick = (item: IndustryChecklistItem) => {
    if (item.actionType === "modal_funding") {
      openFundingTiersModal();
    } else if (item.actionType === "modal_ip") {
      openIpRightsModal();
    } else if (item.actionType === "modal_tour") {
      openOnboarding("industry");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Card Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Layer 5 Compliance
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Corporate CSR &amp; Mentorship
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Corporate CSR &amp; Mentorship Compliance Checklist
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Operating under Section 135 Companies Act 2013 &amp; State Escrow Framework
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => openOnboarding("industry")}
            className="px-3 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open Corporate Partnership Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Corporate</span> Guide
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
            {completedCount} of {totalCount} Corporate Requirements Completed ({percentage}%)
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
                : "bg-gradient-to-r from-emerald-600 to-teal-500"
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
            {INDUSTRY_CHECKLIST_ITEMS.map((item, index) => {
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
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                      aria-label={`Toggle requirement: ${item.title}`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
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
                              : "text-slate-900 hover:text-emerald-600"
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
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          {item.actionLabel}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActionClick(item)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
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
