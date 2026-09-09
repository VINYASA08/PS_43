"use client";

import { useState } from "react";
import { IpRegistryItem } from "../types";
import { Landmark, FileCheck2, Lock, Download, Printer, Copy, Check, X, ShieldAlert, Scale } from "lucide-react";

interface LegalDeedModalProps {
  item: IpRegistryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LegalDeedModal({ item, isOpen, onClose }: LegalDeedModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(item.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl">
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Statutory Deed Ledger
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Deed No. {item.id}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Tripartite Intellectual Property Assignment Deed
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deed Document Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/50">
          <div className="bg-white border-2 border-slate-300/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 relative">
            
            {/* Deed Stamp Seal */}
            <div className="border-b-2 border-slate-800 pb-5 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Landmark className="w-8 h-8 text-slate-900" />
              </div>
              <h4 className="text-sm font-black tracking-widest text-slate-900 uppercase">
                GOVERNMENT OF JHARKHAND
              </h4>
              <p className="text-xs font-semibold text-slate-600">
                Department of Higher and Technical Education (Higher Education Directorate)
              </p>
              <h5 className="text-base font-serif font-bold text-slate-900 pt-2 tracking-wide">
                TRIPARTITE INTELLECTUAL PROPERTY REVENUE-SHARING DEED
              </h5>
              <p className="text-[11px] text-slate-500 font-mono">
                Executed under Section 135 Companies Act & National Innovation and Startup Policy (NISP)
              </p>
            </div>

            {/* Split & Status Badges */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-900">Negotiated Revenue Split:</span>
                <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-mono font-bold text-xs shadow-sm">
                  {item.negotiatedSplit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                  <Lock className="w-3 h-3" /> Registered & Locked
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] border border-blue-300">
                  <FileCheck2 className="w-3 h-3" /> {item.licenseType}
                </span>
              </div>
            </div>

            {/* Contract Parties */}
            <div className="space-y-3 text-xs">
              <h6 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Contracting Parties
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 block">Party A: Host University</span>
                  <div className="font-bold text-slate-900">{item.hostUniversity}</div>
                  <p className="text-slate-500 text-[10px]">TTO Signatory: {item.ttoSignatory}</p>
                  <span className="text-emerald-600 font-semibold text-[10px]">Share: {item.uniSharePercent}%</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Party B: Corporate Partner</span>
                  <div className="font-bold text-slate-900">{item.corporateSponsor}</div>
                  <p className="text-slate-500 text-[10px]">Corporate Legal: {item.corporateLegalOfficer}</p>
                  <span className="text-emerald-600 font-semibold text-[10px]">Share: {item.corpSharePercent}%</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">Party C: State Guarantor</span>
                  <div className="font-bold text-slate-900">Govt of Jharkhand</div>
                  <p className="text-slate-500 text-[10px]">Custodian: State Innovation Council</p>
                  <span className="text-slate-600 font-semibold text-[10px]">Enforcement: Regulatory Escrow</span>
                </div>
              </div>
            </div>

            {/* Legal Clauses */}
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <h6 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Operative Clauses
              </h6>
              <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-600 pl-1">
                <li>
                  <strong className="text-slate-800">Title and Invention:</strong> The patentable subject matter titled <em className="text-slate-900 font-medium">&ldquo;{item.title}&rdquo;</em> (Patent Application: {item.patentNumber}) shall be jointly assigned with rights governed by the State Innovation Policy.
                </li>
                <li>
                  <strong className="text-slate-800">Commercialization & Escrow:</strong> Party B retains exclusive municipal testing and commercialization rights within Jharkhand for 5 years. All commercial royalties and licensing proceeds shall be routed into the designated State Escrow Clearinghouse.
                </li>
                <li>
                  <strong className="text-slate-800">Disbursement Ratio:</strong> Net royalties shall be automatically disbursed at the locked split of {item.negotiatedSplit}. To date, cumulative distributed royalties stand at <strong>₹{item.royaltiesDistributedCr} Crore</strong>.
                </li>
                <li>
                  <strong className="text-slate-800">Jurisdiction:</strong> Any bilateral dispute arising from patent exploitation or royalty accounting shall be resolved under the sole jurisdiction of the High Court of Jharkhand at Ranchi.
                </li>
              </ol>
            </div>

            {/* Cryptographic Ledger Verification */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <Lock className="w-3.5 h-3.5" /> Immutable SHA-256 Ledger Hash
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-300 break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800 select-all">
                {item.hash}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Timestamp: {item.registrationDate} 11:24:08 IST</span>
                <span>Algorithm: FIPS PUB 180-4 SHA-256</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Tamper-evident legal deed admissible under IT Act 2000</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Deed
            </button>
            <button
              onClick={() => {
                alert(`Exporting official signed tripartite legal deed: ${item.id}.pdf`);
              }}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Legal PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
