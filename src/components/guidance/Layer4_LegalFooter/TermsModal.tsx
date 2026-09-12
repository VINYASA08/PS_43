"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Scale, 
  FileCheck2, 
  AlertTriangle, 
  Building, 
  Coins, 
  Award
} from "lucide-react";
import { useGuidanceStore } from "../store";

export function TermsModal() {
  const isOpen = useGuidanceStore((state) => state.isTermsModalOpen);
  const closeModal = useGuidanceStore((state) => state.closeTermsModal);

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

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-modal-title"
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-lg shadow-lg overflow-hidden z-10 text-white"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                      Platform Governance
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                      JH-SIC-ORD-2026/894
                    </span>
                  </div>
                  <h2 id="terms-modal-title" className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Terms of Platform Use & Code of Governance
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close terms modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm text-slate-300">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-xs text-slate-300">
                  By accessing or utilizing the PRAGATI / JSICP platform, citizens, academic researchers, corporate sponsors, and nodal officials agree to adhere to these statutory governance directives established by the Department of Higher & Technical Education, Government of Jharkhand.
                </p>
              </div>

              {/* 1. Scope & Statutory Authority */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Building className="w-4 h-4 text-blue-400" />
                  <h4>1. Statutory Authority & Jurisdiction</h4>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">
                  The PRAGATI platform operates under the sovereign authority of the Government of Jharkhand pursuant to the Jharkhand Student Research and Innovation Policy 2025 and Central legislation including the DPDP Act 2023, Indian Patents Act 1970, and Companies Act 2013 Section 135. All disputes are subject to the exclusive administrative jurisdiction of the State Innovation Council, Ranchi.
                </p>
              </section>

              {/* 2. Civic Reporting Directives */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4>2. Grassroots Reporting & Fair Usage Policy</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Citizen reports must represent authentic grassroots civic, infrastructural, or environmental challenges.</li>
                  <li>Frivolous submissions, defamatory remarks against individuals, commercial advertisements, or falsified multimedia evidence will lead to docket dismissal and account restriction.</li>
                  <li>All reports are authenticated through automated deduplication and District Nodal Officer review.</li>
                </ul>
              </section>

              {/* 3. Academic Research Integrity */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Award className="w-4 h-4 text-blue-400" />
                  <h4>3. Academic Research & Multidisciplinary Teams</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Higher Education Institutes (HEIs) must hold valid NAAC &apos;A&apos; grade or NIRF Top 200 ranking and have an active Institutional Innovation Cell.</li>
                  <li>Faculty Principal Investigators (PIs) and student researchers must submit Form F-02 Conflict of Interest declarations prior to grant disbursal.</li>
                  <li>Student participants are eligible for Academic Bank of Credits (ABC) awards in strict alignment with National Education Policy (NEP) 2020 guidelines.</li>
                </ul>
              </section>

              {/* 4. Corporate CSR Escrow & Form CSR-1 */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <h4>4. Corporate CSR Sponsorship & Escrow Rules</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Corporate sponsors contribute funds into the State Innovation Escrow account under Section 135 & Schedule VII Item (ix)(a) of the Companies Act 2013.</li>
                  <li>Grants are released strictly upon verified completion of the 30-40-30 milestone tranche schedule authenticated by dual Class 3 DSC signatures.</li>
                  <li>Sponsors receive auto-generated Form CSR-1 for statutory MCA compliance and 100% deduction under Section 80G.</li>
                </ul>
              </section>

              {/* 5. IP Co-Ownership & ROFR */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <h4>5. Intellectual Property & 180-Day ROFR</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>All university revenues follow the statutory 60-20-20 Royalty Split (60% Inventors, 20% University R&D Cell, 20% State Escrow).</li>
                  <li>Industry sponsors retain an exclusive 180-day Right of First Refusal (ROFR) to negotiate commercial manufacturing licenses post-prototype validation.</li>
                  <li>The State of Jharkhand retains a perpetual, royalty-free Sovereign Public Good License for deploying public interest technologies across all 24 districts.</li>
                </ul>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                Accept & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
