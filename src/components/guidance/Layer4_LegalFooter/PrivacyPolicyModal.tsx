"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  MapPin, 
  Trash2, 
  AlertCircle, 
  Mail, 
  Clock, 
  ExternalLink,
  CheckCircle2,
  Building2,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useGuidanceStore } from "../store";

export function PrivacyPolicyModal() {
  const isOpen = useGuidanceStore((state) => state.isPrivacyPolicyModalOpen);
  const closeModal = useGuidanceStore((state) => state.closePrivacyPolicyModal);

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
            aria-labelledby="privacy-modal-title"
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-lg shadow-lg overflow-hidden z-10 text-white"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      Rule 3 Compliance Notice
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                      DPDP Act 2023
                    </span>
                  </div>
                  <h2 id="privacy-modal-title" className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Privacy Policy & Data Fiduciary Disclosure
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
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">
                      Zero Mandatory PII • Sovereign Privacy Shield
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Operating under Section 8 of the Digital Personal Data Protection Act, 2023.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-900/40 px-2.5 py-1 rounded border border-emerald-500/20">
                  <Lock className="w-3.5 h-3.5" />
                  <span>AES-256 Geo-Encrypted</span>
                </div>
              </div>

              {/* 1. Identity of Data Fiduciary */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <h4>1. Identity of Data Fiduciary</h4>
                </div>
                <p className="leading-relaxed text-slate-300">
                  The <strong className="text-white">Department of Higher & Technical Education, Government of Jharkhand</strong>, serves as the statutory <strong className="text-emerald-400">Data Fiduciary</strong> responsible for personal data processed through the PRAGATI / JSICP platform under State Gazette Notification <span className="font-mono text-xs text-slate-200">JH-SIC-ORD-2026/894</span>.
                </p>
              </section>

              {/* 2. Categories of Personal Data Collected */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4>2. Categories of Personal Data Collected & Data Minimization</h4>
                </div>
                <p className="leading-relaxed text-slate-300">
                  In strict adherence to the statutory principle of <strong>Data Minimization</strong> (Section 6, DPDP Act 2023), PRAGATI collects only the absolute minimum data necessary to triage and resolve community challenges:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      Optional Collected Data
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li>Mobile phone number (optional, strictly for OTP & status SMS/WhatsApp)</li>
                      <li>Voice recordings in local dialects (transcribed via Whisper AI)</li>
                      <li>Uploaded site photos & videos</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
                      Strictly Excluded Data (Never Collected)
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li>No Aadhaar numbers or copies</li>
                      <li>No PAN cards or Voter IDs</li>
                      <li>No bank accounts or biometric credentials</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 3. Purpose of Processing */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h4>3. Purpose of Data Processing</h4>
                </div>
                <p className="leading-relaxed text-slate-300">
                  Personal data is processed exclusively for the following specified purposes:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  <li>Verification of genuine grassroots grievance dockets and automated deduplication.</li>
                  <li>Dispatching real-time SMS, WhatsApp, and email tracking milestones to citizen reporters.</li>
                  <li>Enabling authorized field squads (Local Bodies) or academic research teams to inspect reported sites.</li>
                </ul>
              </section>

              {/* 4. Geo-Privacy Obfuscation Protocol (500m Fuzzing) */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <h4>4. Geo-Privacy Obfuscation Protocol (500m Geo-Fuzzing)</h4>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <p className="leading-relaxed text-xs text-slate-300">
                    Exact GPS coordinates (latitude and longitude) captured during problem reporting are encrypted at rest with <strong className="text-white">AES-256</strong>. Exact coordinates are accessible solely to assigned District Nodal Officers and vetted academic teams under statutory Non-Disclosure Agreements (NDAs).
                  </p>
                  <p className="leading-relaxed text-xs text-emerald-300 font-medium mt-2">
                    🛡️ Public feeds, public GIS maps, and open contributor boards display only an obfuscated 500-meter radius polygon, completely safeguarding individual homes and neighborhood locations.
                  </p>
                </div>
              </section>

              {/* 5. Data Retention & Mandatory Erasure */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Trash2 className="w-4 h-4 text-emerald-400" />
                  <h4>5. Data Retention & Statutory Erasure (Section 8(7))</h4>
                </div>
                <p className="leading-relaxed text-slate-300">
                  In accordance with Section 8(7) of the DPDP Act 2023, personal contact identifiers are retained only as long as necessary to satisfy the resolution purpose. Upon final grievance closure and verification, or upon explicit citizen withdrawal, personal phone numbers and direct identifiers are <strong className="text-white">permanently purged or anonymized within 30 days</strong>.
                </p>
              </section>

              {/* 6. Whistleblower Immunity */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <AlertCircle className="w-4 h-4 text-emerald-400" />
                  <h4>6. Whistleblower Immunity & Non-Retaliation</h4>
                </div>
                <p className="leading-relaxed text-slate-300">
                  Citizens reporting environmental pollution, structural hazards, or public works non-delivery are legally shielded under the <strong className="text-white">Jharkhand Whistleblower Protection Act</strong>. The platform strictly prohibits disclosure of reporter identities to contractors, local representatives, or third-party commercial entities.
                </p>
              </section>

              {/* 7. DPO & Grievance Redressal */}
              <section className="p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <h4>7. Data Protection Officer (DPO) & Statutory Grievance Redressal</h4>
                </div>
                <p className="text-xs text-slate-300">
                  Citizens retain the statutory right to request access, correction, or erasure of their personal data, or file a grievance with our designated officer:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Designated Grievance Officer:</span>
                    <strong className="text-white">State Data Protection Officer, PRAGATI / JSICP</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Official Address:</span>
                    <span className="text-white">Directorate of Higher & Technical Education, Ranchi – 834002</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Official Email:</span>
                    <a href="mailto:dpo-pragati@jharkhand.gov.in" className="text-emerald-400 hover:underline font-mono">
                      dpo-pragati@jharkhand.gov.in
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Statutory Response SLA:</span>
                    <span className="text-emerald-300 font-semibold">Initial ack: 48 hours • Resolution: 7 working days</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <Link
                href="/privacy-policy"
                onClick={closeModal}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <span>View Full Statutory Policy Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={closeModal}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                I Understand & Acknowledge
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
