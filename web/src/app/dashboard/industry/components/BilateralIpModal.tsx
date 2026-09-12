"use client";

import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Check, 
  FileText, 
  CheckCircle2, 
  Send, 
  Key, 
  Lock,
  Download,
  Building2,
  Award
} from "lucide-react";
import { Project } from "./types";

interface BilateralIpModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSaveAgreement: (uniShare: number, indShare: number) => void;
}

export function BilateralIpModal({
  isOpen,
  onClose,
  project,
  onSaveAgreement,
}: BilateralIpModalProps) {
  // Bidirectional Royalty Split
  const [uniShare, setUniShare] = useState(50);
  const indShare = 100 - uniShare;

  // Counter-Offer Desk State
  const [showCounterOfferDialog, setShowCounterOfferDialog] = useState(false);
  const [counterUniShare, setCounterUniShare] = useState(45);
  const [counterJustification, setCounterJustification] = useState("");
  const [counterOfferSuccess, setCounterOfferSuccess] = useState(false);

  // DSC Execution State
  const [showDscDialog, setShowDscDialog] = useState(false);
  const [dscPin, setDscPin] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [signedAgreement, setSignedAgreement] = useState(false);

  if (!isOpen) return null;

  const isNispCompliant = uniShare >= 30;

  const handleUniShareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(10, Math.min(90, Number(e.target.value)));
    setUniShare(val);
  };

  const handleIndShareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(10, Math.min(90, Number(e.target.value)));
    setUniShare(100 - val);
  };

  const handleCounterOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterJustification.trim()) return;
    setUniShare(counterUniShare);
    setCounterOfferSuccess(true);
    setTimeout(() => {
      setCounterOfferSuccess(false);
      setShowCounterOfferDialog(false);
    }, 2000);
  };

  const handleExecuteDsc = (e: React.FormEvent) => {
    e.preventDefault();
    if (dscPin.length < 4) return;
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setSignedAgreement(true);
      onSaveAgreement(uniShare, indShare);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Bilateral IP Assignment & Royalty Term Sheet
            </h2>
            <p className="text-xs text-slate-500">
              {project.title} • {project.institution}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* NISP Policy Compliance Verified Badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Regulatory Framework:</span>
              <span className="text-xs text-slate-500">Ministry of Education NISP 2019 Guidelines</span>
            </div>

            {isNispCompliant ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> NISP Policy Compliant (≥30% University Share)
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-bold shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> NISP Non-Compliant (&lt;30% Academic Equity)
              </div>
            )}
          </div>

          {/* Warning Banner if below 30% */}
          {!isNispCompliant && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Academic Royalty Threshold Violation:</span>
                Under National Innovation and Startup Policy (NISP) Clause 4.2, academic inventor / host university equity cannot drop below 30%. DSC Agreement execution is locked until terms comply.
              </div>
            </div>
          )}

          {/* Interactive Linked Bidirectional Sliders */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Commercial Royalty Revenue Distribution
              </h3>
              <span className="text-xs text-slate-500 font-mono">Total: 100%</span>
            </div>

            {/* University Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" /> Host University / TTO Share
                </span>
                <span className={`font-mono font-black text-base ${isNispCompliant ? "text-blue-600" : "text-rose-600"}`}>
                  {uniShare}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={uniShare}
                onChange={handleUniShareChange}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10% (Min)</span>
                <span className="text-amber-600 font-bold">30% (NISP Floor)</span>
                <span>50%</span>
                <span>75%</span>
                <span>90% (Max)</span>
              </div>
            </div>

            {/* Industry Sponsor Slider (Linked) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" /> Industry Sponsor (Tata Steel) Share
                </span>
                <span className="font-mono font-black text-base text-emerald-600">
                  {indShare}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={indShare}
                onChange={handleIndShareChange}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10%</span>
                <span>25%</span>
                <span>50%</span>
                <span>70%</span>
                <span>90%</span>
              </div>
            </div>
          </div>

          {/* Digital Signature Status */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Bilateral Digital Signature Status
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2.5">
                  {signedAgreement ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900">University TTO Sign-Off</div>
                    <div className="text-[11px] text-slate-500">BIT Mesra Intellectual Property Cell</div>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    signedAgreement ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {signedAgreement ? "DSC Signed" : "Pending TTO DSC"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Corporate Legal Sign-Off</div>
                    <div className="text-[11px] text-slate-500">Tata Steel Legal & CSR Technology Transfer</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified (Class 3 DSC)
                </span>
              </div>
            </div>
          </div>

          {signedAgreement && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bilateral IP Agreement Executed & Pushed to State Ledger
              </span>
              <button
                onClick={() => alert("Downloaded Signed Bilateral IP Agreement PDF")}
                className="px-3 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-100 cursor-pointer"
              >
                <Download className="w-3 h-3" /> Download Deed
              </button>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button
            onClick={() => setShowCounterOfferDialog(true)}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Propose Counter-Offer
          </button>

          <button
            onClick={() => setShowDscDialog(true)}
            disabled={!isNispCompliant}
            className={`flex-1 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
              isNispCompliant
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-slate-300 cursor-not-allowed text-slate-500"
            }`}
          >
            <Lock className="w-4 h-4" /> Execute Agreement with DSC
          </button>
        </div>
      </div>

      {/* COUNTER-OFFER DESK MODAL */}
      {showCounterOfferDialog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-orange-50">
              <div className="flex items-center gap-2 text-orange-950">
                <FileText className="w-4 h-4 text-orange-600" />
                <h4 className="font-bold text-sm">Propose Counter-Offer to TTO</h4>
              </div>
              <button
                onClick={() => setShowCounterOfferDialog(false)}
                className="p-1 hover:bg-orange-100 rounded-md text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {counterOfferSuccess ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-sm text-slate-900">Counter-Offer Submitted!</h5>
                <p className="text-xs text-slate-500">
                  Notification dispatched to BIT Mesra Technology Transfer Office. Terms updated on dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCounterOfferSubmit} className="p-5 space-y-4">
                <p className="text-xs text-slate-600">
                  Formulate a revised royalty allocation proposal with corporate legal justification.
                </p>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Proposed University Share</span>
                    <span className="text-blue-600 font-mono">{counterUniShare}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="70"
                    value={counterUniShare}
                    onChange={(e) => setCounterUniShare(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    Industry Sponsor Share: {100 - counterUniShare}%
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Corporate Commercial Justification *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={counterJustification}
                    onChange={(e) => setCounterJustification(e.target.value)}
                    placeholder="e.g. In exchange for absorbing 100% of pilot field tooling and BIS regulatory testing costs, industry sponsor requests a 55/45 split."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none resize-none text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCounterOfferDialog(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!counterJustification.trim()}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Counter-Proposal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DUAL DSC EXECUTION MODAL */}
      {showDscDialog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-blue-50">
              <div className="flex items-center gap-2 text-blue-950">
                <Key className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm">Execute Agreement with DSC</h4>
              </div>
              <button
                onClick={() => setShowDscDialog(false)}
                className="p-1 hover:bg-blue-100 rounded-md text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteDsc} className="p-5 space-y-4">
              <div className="text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-900">Class 3 Digital Signature Certificate</div>
                <p>Certificate Authority: eMudhra / National Informatics Centre (NIC CA)</p>
                <p>Signer: Senior Technical Mentor (Tata Steel CSR / Corporate R&D)</p>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs">
                <span className="font-bold text-blue-900 block mb-0.5">Agreement Digest:</span>
                <span className="font-mono text-[11px] text-blue-700">
                  Split: {uniShare}% Host University / {indShare}% Sponsor • Ref #BIT-IP-2026-991
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cryptographic Token PIN *
                </label>
                <input
                  type="password"
                  required
                  value={dscPin}
                  onChange={(e) => setDscPin(e.target.value)}
                  placeholder="Enter 6-digit USB Token PIN (e.g. 123456)"
                  maxLength={8}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-mono tracking-widest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDscDialog(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dscPin.length < 4 || isSigning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSigning ? (
                    <>Signing SHA-256 Digest...</>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Sign & Seal Deed
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
