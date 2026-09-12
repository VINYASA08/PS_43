"use client";

import { useState, useEffect } from "react";
import { IpQueueItem } from "../types";
import { ShieldCheck, CheckCircle2, Award, Download, Copy, X, Landmark, KeyRound } from "lucide-react";

interface DigiLockerModalProps {
  item: IpQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCertificateIssued: (itemId: string) => void;
}

export function DigiLockerModal({ item, isOpen, onClose, onCertificateIssued }: DigiLockerModalProps) {
  const [step, setStep] = useState<"verifying" | "generating" | "pushed">("verifying");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !item) return;

    const t1 = setTimeout(() => setStep("generating"), 600);
    const t2 = setTimeout(() => {
      setStep("pushed");
      onCertificateIssued(item.id);
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, item, onCertificateIssued]);

  if (!isOpen || !item) return null;

  const idSuffix = item.id.replace(/\D/g, "") || "8841";
  const certificateId = item.certificateId || `JH-GOV-IP-2026-${idSuffix}`;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(item.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModalClose = () => {
    setStep("verifying");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/60">
                  DigiLocker Credential Gateway
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ISO/IEC 27001</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                State Innovation Registry & Certificate Issuance
              </h3>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Pipeline */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === "verifying" ? "bg-blue-600 text-white animate-pulse" : "bg-emerald-600 text-white"
            }`}>
              {step === "verifying" ? "1" : "✓"}
            </div>
            <span className={step === "verifying" ? "font-bold text-blue-900" : "text-slate-600"}>
              Bilateral DSC Validation
            </span>
          </div>

          <div className="h-0.5 flex-1 mx-3 bg-slate-200">
            <div className={`h-full bg-emerald-500 transition-all duration-500 ${
              step === "verifying" ? "w-1/3" : step === "generating" ? "w-2/3" : "w-full"
            }`} />
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === "generating" ? "bg-blue-600 text-white animate-pulse" : step === "pushed" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
            }`}>
              {step === "pushed" ? "✓" : "2"}
            </div>
            <span className={step === "generating" ? "font-bold text-blue-900" : "text-slate-600"}>
              State Seal Generation
            </span>
          </div>

          <div className="h-0.5 flex-1 mx-3 bg-slate-200">
            <div className={`h-full bg-emerald-500 transition-all duration-500 ${
              step === "pushed" ? "w-full" : "w-0"
            }`} />
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === "pushed" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
            }`}>
              3
            </div>
            <span className={step === "pushed" ? "font-bold text-emerald-900" : "text-slate-500"}>
              DigiLocker Pushed
            </span>
          </div>
        </div>

        {/* Certificate Display Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="relative border-4 border-double border-amber-300/80 rounded-2xl p-6 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 shadow-inner">
            {/* Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <Landmark className="w-72 h-72 text-slate-900" />
            </div>

            {/* Official Header */}
            <div className="text-center space-y-1 pb-4 border-b border-amber-200/80">
              <div className="flex items-center justify-center gap-2">
                <Landmark className="w-6 h-6 text-amber-700" />
                <h4 className="text-sm font-black tracking-widest text-slate-900 uppercase">
                  Government of Jharkhand
                </h4>
              </div>
              <p className="text-[11px] font-medium text-slate-600">
                Department of Higher & Technical Education • State Innovation Council
              </p>
              <h5 className="text-base font-bold text-amber-900 pt-1 tracking-wide">
                CERTIFICATE OF MUNICIPAL INNOVATION & IP COMMENDATION
              </h5>
              <div className="inline-block px-3 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-[10px] font-mono font-bold text-amber-900 mt-1">
                Registry ID: {certificateId}
              </div>
            </div>

            {/* Certificate Content */}
            <div className="py-4 space-y-3 text-xs text-slate-700">
              <p className="leading-relaxed text-center">
                This is to officially certify that the engineering solution and research prototype titled:
              </p>
              <div className="p-3 bg-white/90 border border-slate-200 rounded-xl text-center">
                <h6 className="text-sm font-bold text-slate-900">{item.projectName}</h6>
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-1">
                  <span>Host: <strong>{item.hostUniversity}</strong></span>
                  <span>•</span>
                  <span>Corporate Sponsor: <strong>{item.corporatePartner}</strong></span>
                </div>
              </div>
              <p className="leading-relaxed text-slate-600 text-justify text-[11px]">
                Has successfully passed state-mandated municipal bench trials and field testing (TRL-{item.trl}), strictly conforming to the National Innovation and Startup Policy (NISP) framework. The intellectual property agreements and tripartite royalty splits have been registered, cryptographically hashed, and entered into the permanent records of the State of Jharkhand.
              </p>
            </div>

            {/* Signatories */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-3 text-center text-[10px]">
              <div className="space-y-1">
                <div className="h-7 border-b border-slate-300 flex items-center justify-center">
                  <span className="font-serif italic text-blue-900 font-bold">Dr. K. K. Sahu, IAS</span>
                </div>
                <p className="font-bold text-slate-800">Principal Secretary</p>
                <p className="text-slate-500">Dept of Higher & Technical Ed.</p>
              </div>
              <div className="space-y-1">
                <div className="h-7 border-b border-slate-300 flex items-center justify-center">
                  <span className="font-serif italic text-emerald-900 font-bold">Prof. Dean (R&D)</span>
                </div>
                <p className="font-bold text-slate-800">TTO Authorized Signatory</p>
                <p className="text-slate-500">{item.hostUniversity}</p>
              </div>
              <div className="space-y-1">
                <div className="h-7 border-b border-slate-300 flex items-center justify-center">
                  <span className="font-serif italic text-purple-900 font-bold">Chief Legal Officer</span>
                </div>
                <p className="font-bold text-slate-800">Corporate Partner Seal</p>
                <p className="text-slate-500">{item.corporatePartner}</p>
              </div>
            </div>
          </div>

          {/* Cryptographic Verification Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                Immutable SHA-256 Ledger Hash
              </span>
              <button
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied to Clipboard!" : "Copy Hash"}
              </button>
            </div>
            <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl break-all select-all shadow-inner">
              {item.hash}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                DigiLocker URI: <code>digilocker://in.gov.jh.he/{certificateId}</code>
              </span>
              <span>Issued: {new Date().toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pushed to Principal Investigator & Student DigiLocker vaults</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                alert(`Exporting official PDF certificate: ${certificateId}.pdf`);
              }}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Signed PDF
            </button>
            <button
              onClick={handleModalClose}
              className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Close & Update Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
