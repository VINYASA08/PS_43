"use client";

import { useState } from "react";
import { IpQueueItem } from "../types";
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Award, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { DigiLockerModal } from "./DigiLockerModal";

interface GovIpQueueProps {
  queue: IpQueueItem[];
  onCertificateIssued: (itemId: string) => void;
}

export function GovIpQueue({ queue, onCertificateIssued }: GovIpQueueProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Verified" | "Pending">("All");
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const [selectedItemForModal, setSelectedItemForModal] = useState<IpQueueItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter items
  const filteredItems = queue.filter((item) => {
    const matchesSearch =
      item.projectName.toLowerCase().includes(search.toLowerCase()) ||
      item.hostUniversity.toLowerCase().includes(search.toLowerCase()) ||
      item.corporatePartner.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "Verified") return item.status === "Bilateral DSC Verified";
    if (statusFilter === "Pending") return item.status === "Pending";
    return true;
  });

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const handleApprove = (item: IpQueueItem) => {
    setSelectedItemForModal(item);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            State IP Compliance Queue
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            NISP Policy Guardrails
          </span>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects, universities or sponsors..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            {(["All", "Verified", "Pending"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  statusFilter === filter
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
            <tr>
              <th className="px-4 py-3">Project & Bilateral Partners</th>
              <th className="px-4 py-3">DSC & NISP Alignment</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  No matching IP agreements found.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 space-y-1 max-w-xs sm:max-w-sm">
                    <div className="font-bold text-slate-900 leading-snug">
                      {item.projectName}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="text-slate-700 font-medium">{item.hostUniversity}</span>
                      <span>×</span>
                      <span className="text-slate-700 font-medium">{item.corporatePartner}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ref: {item.id} • TRL-{item.trl} • Submitted: {item.submittedDate}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      {item.registered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Registered & DigiLocker Issued
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                          item.status === "Bilateral DSC Verified"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {item.status === "Bilateral DSC Verified" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          {item.status}
                        </span>
                      )}

                      {item.compliant ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          NISP Policy Compliant
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Bilateral DSC Sign-off Pending
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {item.registered ? (
                      <button
                        onClick={() => handleApprove(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        View Certificate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={!item.compliant}
                        title={
                          !item.compliant
                            ? "Requires Bilateral DSC Sign-offs from University TTO and Corporate Legal Officer"
                            : "Approve agreement and issue State Innovation Certificate to DigiLocker"
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-xs cursor-pointer ${
                          item.compliant
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        Approve & Issue
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {paginatedItems.length} of {filteredItems.length} items
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DigiLocker Certificate Modal */}
      <DigiLockerModal
        item={selectedItemForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCertificateIssued={onCertificateIssued}
      />
    </div>
  );
}
