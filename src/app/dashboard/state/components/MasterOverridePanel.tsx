"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Building2, 
  GraduationCap, 
  RotateCcw, 
  FileText,
  IndianRupee,
  Layers,
  Lock,
  Unlock,
  Sliders,
  Send,
  UserCheck
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export interface ChallengeItem {
  id: string;
  publicTrackingId?: string;
  title: string;
  description?: string;
  domain?: string;
  district?: string;
  location?: string;
  urgency: string;
  status: string;
  nodalStatus?: string;
  claimedInstitute?: string;
  assignedInstitute?: string;
  createdAt: string;
  proposals?: Array<{
    id: string;
    proposalRef?: string;
    title: string;
    status: string;
    budget: number;
    universityName?: string;
  }>;
}

export interface CommitmentItem {
  id: string;
  amount: number;
  status: string;
  corporateName?: string;
  proposalId?: string;
  createdAt?: string;
  proposal?: {
    id: string;
    title?: string;
    universityName?: string;
    challenge?: {
      id: string;
      title?: string;
      district?: string;
      domain?: string;
    };
  };
  industryUser?: {
    id: string;
    name?: string;
    organization?: string;
    email?: string;
  };
}

interface MasterOverridePanelProps {
  initialDistrictFilter?: string;
}

export function MasterOverridePanel({ initialDistrictFilter = "All" }: MasterOverridePanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"challenges" | "funds">("challenges");

  // Challenges state
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrictFilter);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedUrgency, setSelectedUrgency] = useState("All");

  // Funding commitments state
  const [commitments, setCommitments] = useState<CommitmentItem[]>([]);
  const [isLoadingFunds, setIsLoadingFunds] = useState(false);

  // Modals state
  const [overrideModalChallenge, setOverrideModalChallenge] = useState<ChallengeItem | null>(null);
  const [overrideActionType, setOverrideActionType] = useState<"STATUS" | "FORCE_ASSIGN" | "DIVERT_GOV" | "ESCALATE">("STATUS");
  const [targetStatus, setTargetStatus] = useState("OPEN_FOR_PROPOSALS");
  const [targetUniversity, setTargetUniversity] = useState("BIT Mesra");
  const [targetGovBody, setTargetGovBody] = useState("Drinking Water & Sanitation Dept (DWSD)");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Revoke funding modal state
  const [revokeModalCommitment, setRevokeModalCommitment] = useState<CommitmentItem | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [reopenProposal, setReopenProposal] = useState(true);
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState(false);

  // Notification banners
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch challenges
  const fetchChallenges = useCallback(async () => {
    setIsLoadingChallenges(true);
    try {
      const params = new URLSearchParams();
      if (selectedDistrict !== "All") params.set("district", selectedDistrict);
      if (selectedStatus !== "All") params.set("status", selectedStatus);
      if (selectedUrgency !== "All") params.set("urgency", selectedUrgency);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("limit", "100");

      const res = await apiFetch<{ success: boolean; challenges: ChallengeItem[] }>(
        `/api/challenges?${params.toString()}`
      );
      if (res && res.challenges) {
        setChallenges(res.challenges);
      }
    } catch (err: any) {
      console.error("Failed to fetch challenges:", err);
      setNotification({ type: "error", message: err.message || "Failed to load challenges" });
    } finally {
      setIsLoadingChallenges(false);
    }
  }, [selectedDistrict, selectedStatus, selectedUrgency, searchQuery]);

  // Fetch funding commitments
  const fetchFunds = useCallback(async () => {
    setIsLoadingFunds(true);
    try {
      const res = await apiFetch<{ success: boolean; commitments: CommitmentItem[] }>("/api/funds");
      if (res && res.commitments) {
        setCommitments(res.commitments);
      }
    } catch (err: any) {
      console.error("Failed to fetch funds:", err);
    } finally {
      setIsLoadingFunds(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    if (activeSubTab === "funds") {
      fetchFunds();
    }
  }, [activeSubTab, fetchFunds]);

  // Handle Master Override Submit
  const handleExecuteChallengeOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalChallenge) return;

    if (!overrideReason.trim() || overrideReason.trim().length < 8) {
      setNotification({
        type: "error",
        message: "Mandatory audit justification required (at least 8 characters).",
      });
      return;
    }

    setIsSubmittingOverride(true);
    try {
      const payload: Record<string, any> = {
        challengeId: overrideModalChallenge.id,
        overrideReason: overrideReason.trim(),
      };

      if (overrideActionType === "STATUS") {
        payload.newStatus = targetStatus;
      } else if (overrideActionType === "FORCE_ASSIGN") {
        payload.action = "FORCE_ASSIGN";
        payload.assignedInstitute = targetUniversity;
        payload.targetUniversity = targetUniversity;
        payload.newStatus = "IN_PROGRESS";
      } else if (overrideActionType === "DIVERT_GOV") {
        payload.action = "DIVERT_GOV";
        payload.targetGovBody = targetGovBody;
      } else if (overrideActionType === "ESCALATE") {
        payload.action = "ESCALATE";
        payload.escalationLevel = 3;
      }

      await apiFetch("/api/state/override/challenge", {
        method: "POST",
        body: payload,
      });

      setNotification({
        type: "success",
        message: `Sovereign override executed on challenge "${overrideModalChallenge.title}". Audit logged.`,
      });
      setOverrideModalChallenge(null);
      setOverrideReason("");
      fetchChallenges();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to execute sovereign master override.",
      });
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  // Handle Funding Revocation Submit
  const handleExecuteRevokeFunding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeModalCommitment) return;

    if (!revokeReason.trim() || revokeReason.trim().length < 10) {
      setNotification({
        type: "error",
        message: "Statutory compliance breach reason required (at least 10 characters).",
      });
      return;
    }

    setIsSubmittingRevoke(true);
    try {
      await apiFetch("/api/state/override/revoke-funding", {
        method: "POST",
        body: {
          commitmentId: revokeModalCommitment.id,
          breachReason: revokeReason.trim(),
          reopenProposal,
        },
      });

      setNotification({
        type: "success",
        message: `Funding commitment revoked and returned to escrow. Proposal reopened for competitive bids.`,
      });
      setRevokeModalCommitment(null);
      setRevokeReason("");
      fetchFunds();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to revoke funding commitment.",
      });
    } finally {
      setIsSubmittingRevoke(false);
    }
  };

  const canonicalUniversities = [
    "BIT Mesra",
    "IIT (ISM) Dhanbad",
    "NIT Jamshedpur",
    "Birsa Agricultural University",
    "Central University of Jharkhand",
    "RIMS Ranchi",
    "Birsa Institute of Technology, Sindri",
  ];

  const canonicalGovBodies = [
    "Drinking Water & Sanitation Dept (DWSD)",
    "Public Works Department (PWD)",
    "Jharkhand Bijli Vitran Nigam (JUVNL)",
    "Ranchi Municipal Corporation (RMC)",
    "Dhanbad Municipal Corporation",
    "Health & Family Welfare Directorate",
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">
                Apex Sovereign Master Override Console
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                God-Mode Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Absolute statutory authority to re-route challenges, force-assign institutes, alter lifecycle states, or revoke non-compliant CSR funding.
            </p>
          </div>
        </div>

        {/* Sub-tabs toggle */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveSubTab("challenges")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeSubTab === "challenges"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Challenges Override ({challenges.length})
          </button>
          <button
            onClick={() => setActiveSubTab("funds")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeSubTab === "funds"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            Funding Revocation
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SUB-TAB 1: CHALLENGES OVERRIDE TABLE */}
      {activeSubTab === "challenges" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search challenges by title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="flex items-center flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">District:</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="All">All 24 Districts</option>
                  {[
                    "Ranchi", "Dhanbad", "East Singhbhum", "Bokaro", "Hazaribagh",
                    "Deoghar", "Giridih", "Ramgarh", "Palamu", "Saraikela Kharsawan",
                    "West Singhbhum", "Dumka", "Godda", "Sahibganj", "Pakur",
                    "Jamtara", "Chatra", "Koderma", "Latehar", "Garhwa",
                    "Lohardaga", "Gumla", "Simdega", "Khunti",
                  ].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="All">All States</option>
                  <option value="REPORTED">REPORTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="OPEN_FOR_PROPOSALS">OPEN_FOR_PROPOSALS</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <button
                onClick={() => fetchChallenges()}
                disabled={isLoadingChallenges}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingChallenges ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tracking ID & Title</th>
                  <th className="py-3 px-4">District & Domain</th>
                  <th className="py-3 px-4 text-center">Urgency</th>
                  <th className="py-3 px-4 text-center">State & Nodal Status</th>
                  <th className="py-3 px-4">Assigned Institute / Body</th>
                  <th className="py-3 px-4 text-right">Master Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingChallenges ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading challenge ledger...
                    </td>
                  </tr>
                ) : challenges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No societal challenges match current filters.
                    </td>
                  </tr>
                ) : (
                  challenges.map((ch) => (
                    <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-[10px] text-amber-700 font-bold">
                          {ch.publicTrackingId || ch.id.slice(0, 10)}
                        </div>
                        <div className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-1 max-w-[220px]">
                          {ch.title}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{ch.district || "Statewide"}</div>
                        <div className="text-[11px] text-slate-400">{ch.domain || "General Infrastructure"}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            ch.urgency === "CRITICAL"
                              ? "bg-rose-100 text-rose-800"
                              : ch.urgency === "HIGH"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ch.urgency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-100">
                          {ch.status}
                        </div>
                        {ch.nodalStatus && (
                          <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
                            {ch.nodalStatus.replace(/_/g, " ")}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium truncate max-w-[160px]">
                          {ch.assignedInstitute || ch.claimedInstitute || "Unassigned"}
                        </div>
                        {ch.proposals && ch.proposals.length > 0 && (
                          <div className="text-[10px] text-indigo-600">
                            {ch.proposals.length} proposal(s) logged
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setOverrideModalChallenge(ch);
                            setTargetStatus(ch.status);
                            setOverrideReason("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Override
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FUNDING COMMITMENTS & REVOCATION */}
      {activeSubTab === "funds" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Active Corporate CSR Commitments & Escrow Allocations
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Revoke commitments in the event of CSR Schedule VII milestone breach or corporate default
              </p>
            </div>
            <button
              onClick={() => fetchFunds()}
              disabled={isLoadingFunds}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Refresh Commitments"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingFunds ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Corporate Sponsor</th>
                  <th className="py-3 px-4">Target Proposal & Challenge</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Compliance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingFunds ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Loading escrow commitments...
                    </td>
                  </tr>
                ) : commitments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No active funding commitments recorded.
                    </td>
                  </tr>
                ) : (
                  commitments.map((com) => (
                    <tr key={com.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {com.corporateName || com.industryUser?.organization || com.industryUser?.name || "Corporate Partner"}
                        </div>
                        <div className="text-[10px] text-slate-400">{com.industryUser?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 line-clamp-1 max-w-[240px]">
                          {com.proposal?.title || "Research DPR Proposal"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {com.proposal?.universityName} &bull; {com.proposal?.challenge?.district || "Jharkhand"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">
                        ₹{(com.amount / 100000).toFixed(1)} Lakhs
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            com.status === "CANCELLED"
                              ? "bg-rose-100 text-rose-800"
                              : com.status === "DISBURSED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {com.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {com.status !== "CANCELLED" ? (
                          <button
                            onClick={() => {
                              setRevokeModalCommitment(com);
                              setRevokeReason("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Revoke Funding
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Revoked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CHALLENGE MASTER OVERRIDE */}
      {overrideModalChallenge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Master Override: {overrideModalChallenge.title}
                </h3>
              </div>
              <button
                onClick={() => setOverrideModalChallenge(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteChallengeOverride} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Override Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "STATUS", label: "Force State Change" },
                    { id: "FORCE_ASSIGN", label: "Force Assign University" },
                    { id: "DIVERT_GOV", label: "Divert to Gov Dept" },
                    { id: "ESCALATE", label: "Escalate to Chief Sec" },
                  ].map((action) => (
                    <button
                      type="button"
                      key={action.id}
                      onClick={() => setOverrideActionType(action.id as any)}
                      className={`p-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                        overrideActionType === action.id
                          ? "bg-amber-50 border-amber-500 text-amber-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {overrideActionType === "STATUS" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Target Lifecycle State
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    <option value="OPEN_FOR_PROPOSALS">OPEN_FOR_PROPOSALS (Allow University DPRs)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Under Active Research/Build)</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW (State Technical Review)</option>
                    <option value="RESOLVED">RESOLVED (Grassroots Handover Done)</option>
                    <option value="CLOSED">CLOSED (Formally Sealed)</option>
                    <option value="REPORTED">REPORTED (Reset to Initial Citizen State)</option>
                  </select>
                </div>
              )}

              {overrideActionType === "FORCE_ASSIGN" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Empanelled University
                  </label>
                  <select
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {canonicalUniversities.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
              )}

              {overrideActionType === "DIVERT_GOV" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Target Government Line Department
                  </label>
                  <select
                    value={targetGovBody}
                    onChange={(e) => setTargetGovBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {canonicalGovBodies.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
              )}

              {overrideActionType === "ESCALATE" && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  <div className="font-bold">Apex Level-3 Escalation</div>
                  <p className="text-[11px] mt-0.5">
                    This challenge will bypass local district nodal queues and be placed directly into the Chief Secretary's urgent sovereign docket.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Statutory Override Justification (Audit Logged) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State admin expedited directive reference or policy reason..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalChallenge(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingOverride ? "Executing..." : "Apply Sovereign Override"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVOKE FUNDING COMMITMENT */}
      {revokeModalCommitment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-rose-100 bg-rose-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-rose-900 text-base">
                  Revoke Corporate CSR Funding
                </h3>
              </div>
              <button
                onClick={() => setRevokeModalCommitment(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteRevokeFunding} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">Corporate Sponsor:</div>
                <div className="font-bold text-slate-900 text-sm">
                  {revokeModalCommitment.corporateName || revokeModalCommitment.industryUser?.organization}
                </div>
                <div className="text-slate-500 mt-1">Committed Capital:</div>
                <div className="font-extrabold text-amber-700">
                  ₹{(revokeModalCommitment.amount / 100000).toFixed(1)} Lakhs
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Compliance Breach Reason (Statutory Audit) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Failure to release Tranche-2 escrow beyond 60-day statutory limit under Section 135..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reopenProp"
                  checked={reopenProposal}
                  onChange={(e) => setReopenProposal(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="reopenProp" className="text-slate-700 font-medium">
                  Re-open proposal for other industry CSR sponsors
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalCommitment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevoke}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingRevoke ? "Revoking..." : "Confirm Revocation"}
                  <ShieldAlert className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
