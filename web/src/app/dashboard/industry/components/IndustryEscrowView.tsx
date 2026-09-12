"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  Eye,
  DollarSign,
  AlertTriangle,
  X
} from "lucide-react";
import { EscrowTranche, BomReceipt, Project } from "./types";

interface IndustryEscrowViewProps {
  project: Project;
  tranches: EscrowTranche[];
  bomReceipts: BomReceipt[];
  onAuthorizeTranche: (trancheId: string) => void;
}

export function IndustryEscrowView({
  project,
  tranches,
  bomReceipts,
  onAuthorizeTranche,
}: IndustryEscrowViewProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<BomReceipt | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "Sensors & Transducers", "Embedded Microcontrollers", "Mechanical Packaging", "Power Electronics", "RF Communications"];

  const filteredReceipts = selectedCategory === "ALL"
    ? bomReceipts
    : bomReceipts.filter((r) => r.category === selectedCategory);

  const totalSpent = bomReceipts.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Corporate CSR Escrow Trust Account (MCA Section 135 Compliant)
            </div>
            <h2 className="text-xl font-black tracking-tight">{project.title}</h2>
            <p className="text-xs text-blue-200 mt-1">
              Host Lab: {project.institution} • Corporate Sponsor: {project.sponsor}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-200">Total Committed CSR Grant</div>
            <div className="text-3xl font-black text-emerald-400">
              ₹{(project.totalPledged / 100000).toFixed(2)} Lakh
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
              <span>Total Pledged</span>
              <DollarSign className="w-4 h-4 text-blue-300" />
            </div>
            <div className="text-xl font-bold text-white">₹{project.totalPledged.toLocaleString("en-IN")}</div>
            <div className="text-[10px] text-blue-300 mt-0.5">100% of sanction order</div>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-emerald-200 mb-1">
              <span>Disbursed to Lab</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">₹{project.disbursed.toLocaleString("en-IN")}</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">
              {((project.disbursed / project.totalPledged) * 100).toFixed(1)}% released
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-amber-200 mb-1">
              <span>Locked in Escrow</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400">₹{project.escrowLocked.toLocaleString("en-IN")}</div>
            <div className="text-[10px] text-amber-300 mt-0.5">Awaiting milestone sign-off</div>
          </div>
        </div>
      </div>

      {/* Milestone Payment Tranche Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" /> Milestone Payment Tranches
            </h3>
            <p className="text-xs text-slate-500">
              Tranches are legally bound to objective TRL stage gates and technical milestone verification.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Escrow Trustee: State Bank of India (Gov/CSR Escrow Desk)
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {tranches.map((tranche) => {
            const isDisbursed = tranche.status === "DISBURSED";
            const isLocked = tranche.status === "LOCKED_IN_ESCROW";
            return (
              <div
                key={tranche.id}
                className={`p-4 rounded-xl border transition-all ${
                  isLocked
                    ? "border-amber-300 bg-amber-50/20 shadow-xs"
                    : isDisbursed
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-slate-200 bg-slate-50/50 opacity-80"
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{tranche.title}</span>
                      {isDisbursed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Disbursed
                        </span>
                      )}
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Lock className="w-3 h-3" /> Locked in Escrow
                        </span>
                      )}
                      {tranche.status === "PENDING_VERIFICATION" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          <Clock className="w-3 h-3" /> Pending Gate 3
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{tranche.condition}</p>
                    {tranche.disbursedDate && (
                      <div className="text-[11px] text-emerald-700 font-medium">
                        Released on {tranche.disbursedDate} • Approved by {tranche.approvedBy}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 self-end lg:self-center">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Tranche Amount</div>
                      <div className="text-lg font-black text-slate-900">
                        ₹{tranche.amount.toLocaleString("en-IN")}
                      </div>
                    </div>

                    {isLocked ? (
                      <button
                        onClick={() => onAuthorizeTranche(tranche.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Authorize Release
                      </button>
                    ) : isDisbursed ? (
                      <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                        Voucher Issued
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold">
                        Stage Locked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* University Expenditure & Bill of Materials (BOM) Auditing */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> University Expenditure & Bill of Materials (BOM)
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                {bomReceipts.length} Invoices Audited
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Mentor verification of hardware sensor purchases, microcontroller boards, and test bench components.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Total Audited Spend</div>
            <div className="text-base font-black text-slate-900">
              ₹{totalSpent.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Item & Specifications</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Vendor</th>
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Audit Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{receipt.itemName}</div>
                    <div className="text-[11px] text-slate-500 font-mono line-clamp-1">{receipt.specifications}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{receipt.category}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">{receipt.vendor}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">{receipt.invoiceNumber}</td>
                  <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                    ₹{receipt.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {receipt.status === "VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Pending Audit
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReceipt(receipt)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Inspection Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">Tax Invoice & BOM Receipt</h4>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-400">Vendor Organization</div>
                  <div className="font-bold text-sm text-slate-900">{selectedReceipt.vendor}</div>
                  <div className="text-[11px] text-slate-500">GSTIN: 20AABCT3921Q1Z4</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Invoice Number</div>
                  <div className="font-mono text-xs font-bold text-blue-600">{selectedReceipt.invoiceNumber}</div>
                  <div className="text-[11px] text-slate-500">Date: {selectedReceipt.date}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{selectedReceipt.itemName}</span>
                  <span className="font-black text-slate-900">₹{selectedReceipt.amount.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{selectedReceipt.specifications}</p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Category: {selectedReceipt.category}</span>
                  <span>GST (18% inclusive): ₹{((selectedReceipt.amount * 0.18) / 1.18).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Tamper-evident hash logged to state CSR ledger. Verified against university PO #BIT-ECE-2026-092.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Downloaded audited invoice ${selectedReceipt.invoiceNumber}.pdf`);
                  setSelectedReceipt(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
