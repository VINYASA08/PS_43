"use client";

import { useState } from "react";
import { IpRegistryItem } from "../types";
import { 
  FileSignature, 
  Award, 
  IndianRupee, 
  Search, 
  Lock, 
  Check, 
  Copy, 
  Scale,
  Building2,
  GraduationCap
} from "lucide-react";
import { LegalDeedModal } from "./LegalDeedModal";

interface GovIpRegistryViewProps {
  ledger: IpRegistryItem[];
}

export function GovIpRegistryView({ ledger }: GovIpRegistryViewProps) {
  const [search, setSearch] = useState("");
  const [selectedDeed, setSelectedDeed] = useState<IpRegistryItem | null>(null);
  const [isDeedModalOpen, setIsDeedModalOpen] = useState(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const filteredLedger = ledger.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.hostUniversity.toLowerCase().includes(search.toLowerCase()) ||
    item.corporateSponsor.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleOpenDeed = (item: IpRegistryItem) => {
    setSelectedDeed(item);
    setIsDeedModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 3 High-Impact Summary KPI Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">38</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Total Agreements Registered
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Tripartite contracts locked in state vault</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">14</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Active Commercial Licenses
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Municipal & corporate field deployments</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-900">₹1.8 Cr</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Cumulative Royalties Distributed
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Auto-disbursed via escrow clearinghouse</p>
          </div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header & Search */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                Statutory IP Ledger
              </span>
              <span className="text-xs text-slate-400 font-mono">SHA-256 Tamper-Proof Audit</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Tripartite Legal Audit Ledger & Royalty Distribution
            </h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, university, sponsor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Deed ID & Project Title</th>
                <th className="px-5 py-3.5">Bilateral Contracting Parties</th>
                <th className="px-5 py-3.5">Negotiated Split</th>
                <th className="px-5 py-3.5">Cryptographic SHA-256 Hash</th>
                <th className="px-5 py-3.5">License Status</th>
                <th className="px-5 py-3.5 text-right">Legal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No matching tripartite agreements found.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 space-y-1 max-w-xs">
                      <div className="font-mono text-[10px] font-bold text-indigo-600">{item.id}</div>
                      <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Patent Reg: {item.patentNumber} • Executed: {item.registrationDate}
                      </div>
                    </td>

                    <td className="px-5 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate max-w-[160px]">{item.hostUniversity}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[160px]">{item.corporateSponsor}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-900 text-emerald-400">
                          {item.negotiatedSplit}
                        </span>
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Lock className="w-3 h-3 text-emerald-600" /> Registered & Locked
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <code className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-1 rounded border border-slate-200 truncate max-w-[150px]">
                          {item.hash}
                        </code>
                        <button
                          onClick={() => handleCopyHash(item.id, item.hash)}
                          title="Copy SHA-256 Hash"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {copiedHashId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Distributed: ₹{item.royaltiesDistributedCr} Cr</span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDeed(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5 text-emerald-400" />
                        View Verified Legal Deed
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Legal Deed Modal */}
      <LegalDeedModal
        item={selectedDeed}
        isOpen={isDeedModalOpen}
        onClose={() => setIsDeedModalOpen(false)}
      />
    </div>
  );
}
