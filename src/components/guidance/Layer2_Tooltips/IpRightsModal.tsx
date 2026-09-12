"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Scale,
  ShieldCheck,
  Award,
  FileText,
  DollarSign,
  Lock,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Download,
  AlertCircle
} from "lucide-react";
import { useGuidanceStore } from "../store";

export function IpRightsModal() {
  const isOpen = useGuidanceStore((state) => state.isIpRightsModalOpen);
  const closeModal = useGuidanceStore((state) => state.closeIpRightsModal);
  const [activeTab, setActiveTab] = useState<"royalty" | "ownership" | "licensing" | "costs">("royalty");

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
            aria-labelledby="ip-rights-modal-title"
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-lg shadow-lg overflow-hidden z-10 text-white"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                      Statutory IP Framework
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                      Indian Patents Act 1970 • NISP 2019
                    </span>
                  </div>
                  <h2 id="ip-rights-modal-title" className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Intellectual Property (IP) &amp; Sponsorship Guidelines
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

            {/* Navigation Tabs */}
            <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("royalty")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "royalty"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>60-20-20 Royalty Split</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ownership")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "ownership"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Inventorship &amp; Tiers</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("licensing")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "licensing"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>180-Day ROFR &amp; Public Good</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("costs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "costs"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Filing &amp; Dispute Resolution</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm text-slate-300">
              {/* Tab 1: 60-20-20 Royalty Split */}
              {activeTab === "royalty" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                    <h3 className="text-sm font-bold text-white mb-1">
                      The Mandatory 60-20-20 Statutory Royalty Distribution
                    </h3>
                    <p className="text-xs text-slate-300">
                      All gross commercial licensing revenues and royalties earned by the host university from PRAGATI project solutions must follow this statutory distribution model:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 60% Research Team */}
                    <div className="p-4 rounded-xl bg-slate-800/70 border border-indigo-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-indigo-400 font-mono">60%</span>
                        <span className="text-[10px] font-bold text-indigo-300 uppercase bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                          Inventing Team
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">Research &amp; Inventing Team</h4>
                      <p className="text-[11px] text-slate-400">
                        Divided directly among project team members:
                      </p>
                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span>Faculty Mentor / PI:</span>
                          <span className="font-mono font-bold text-indigo-300">30%</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Student Researchers:</span>
                          <span className="font-mono font-bold text-indigo-300">20%</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Co-PIs &amp; Tech Staff:</span>
                          <span className="font-mono font-bold text-indigo-300">10%</span>
                        </div>
                      </div>
                    </div>

                    {/* 20% University Corpus */}
                    <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-emerald-400 font-mono">20%</span>
                        <span className="text-[10px] font-bold text-emerald-300 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                          Institution
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">University R&amp;D Incubator Corpus</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Reinvested into institutional laboratory infrastructure, patent prosecution fees, and student seed innovation grants under the Jharkhand Student Innovation Policy 2025.
                      </p>
                    </div>

                    {/* 20% State Escrow */}
                    <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-amber-400 font-mono">20%</span>
                        <span className="text-[10px] font-bold text-amber-300 uppercase bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                          State Escrow
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">State Innovation Escrow Fund</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Reinvested into statewide platform maintenance, rural research subsidies, and future grassroots problem grants administered by the Department of Higher &amp; Technical Education.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400">
                    <strong className="text-slate-200">Legal Basis:</strong> National Innovation and Startup Policy (NISP) 2019 for Higher Education Institutions (HEIs) &amp; Jharkhand State Innovation Policy 2025.
                  </div>
                </div>
              )}

              {/* Tab 2: Inventorship & Tiers */}
              {activeTab === "ownership" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span>True &amp; First Inventor Protection (Indian Patents Act 1970)</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      While the host university or sponsoring entity acts as the legal applicant/assignee on patent records, <strong className="text-white">individual faculty guides and student researchers must be officially and permanently named as Inventors</strong> on all statutory filings. This guarantees academic recognition and protects researchers from institutional expropriation.
                    </p>
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">
                    Tiered Sponsorship Allocation &amp; IP Rights
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white text-xs">Tier 1: Mentorship Only</h5>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            0% Industry / 100% University IP
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Industry partners providing technical advisory hours claim zero project IP. University retains 100% ownership. Sponsoring partner receives priority campus recruitment and an official CSR Advisory Citation.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                        2
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white text-xs">Tier 2: In-Kind Infrastructure &amp; Lab Access</h5>
                          <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            15% to 30% Commercial Rights
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Where corporate partners provide testing equipment, compute resources, or cleanroom access. Negotiated commercial licensing is capped within 15% to 30%, leaving majority ownership with the host university.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">
                        3
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white text-xs">Tier 3: Direct CSR Capital Sponsorship</h5>
                          <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-500/20">
                            50/50 Default (Clamped 50/50 to 60/40)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Full financial prototype sponsorship triggers bilateral co-ownership. Standard default is 50% Industry / 50% University, negotiable up to 60% Industry / 40% University.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: 180-Day ROFR & Public Good */}
              {activeTab === "licensing" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>180-Day Commercial Right of First Refusal (ROFR)</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The sponsoring corporate partner holds an exclusive <strong className="text-white">180-day Right of First Refusal (ROFR)</strong> from the date of formal prototype validation to execute a commercial manufacturing or deployment license. This statutory window cannot be shortened or waived.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Sovereign Public Good License (DBT IP Guidelines 2023)</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All inventions addressing municipal infrastructure, public drinking water, rural electrification, or community healthcare retain an automatic, <strong className="text-emerald-300">perpetual, royalty-free, non-exclusive license reserved for the Government of Jharkhand and Urban Local Bodies</strong> for public deployment within the home state.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>24-Month March-In Rights &amp; Open Source Reversion</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      If the commercial sponsor fails to manufacture, commercialize, or deploy the patented solution within <strong className="text-amber-300">24 months of patent grant</strong>, full commercialization rights revert to the host university. All civic software algorithms automatically transition to permissive open-source licenses (<strong className="text-white">MIT / Apache 2.0</strong>) to prevent proprietary vendor lock-in.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Filing & Dispute Resolution */}
              {activeTab === "costs" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                      <h4 className="text-xs font-bold text-white">Patent Prosecution Fees</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        The party acquiring majority commercial exploitation rights (or the industry sponsor under financial models) bears <strong className="text-slate-200">100% of the patent attorney fees, application charges, and examination costs</strong>.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                      <h4 className="text-xs font-bold text-white">Annual Maintenance Annuities</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        The sponsoring partner covers annual renewal fees during their active commercial license. If discontinued, commercial rights revert exclusively to the university.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <h4 className="text-xs font-bold text-white">Digital Execution &amp; State Innovation Registry</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Bilateral IP agreements must be digitally executed via Class 3 Digital Signature Certificates (DSC) by the University Registrar / TTO Director and Corporate Signatory. Executed agreements are logged into the State Innovation Registry (<code className="font-mono text-indigo-300">JSICP-REG-2026-XXXX</code>) for statutory audit compliance.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1 text-xs text-slate-400">
                    <strong className="text-slate-200">Administrative Mediation:</strong> In the event of an ownership or royalty dispute, the Department of Higher &amp; Technical Education, Government of Jharkhand, serves as the primary administrative mediator before any formal court arbitration.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close IP Guidelines
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
