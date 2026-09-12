"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Building2,
  GraduationCap,
  AlertTriangle,
  RefreshCw,
  Search,
  MapPin,
  Clock,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  User,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import NotificationBell from "@/components/ui/NotificationBell";

const GOV_DEPARTMENTS = [
  "Road Construction Department (RCD) / State PWD",
  "Ranchi Municipal Corporation (RMC)",
  "Dhanbad Municipal Corporation (DMC)",
  "Jamshedpur Notified Area Committee (JNAC)",
  "Drinking Water & Sanitation Department (DWSD)",
  "Jharkhand Urja Vikas Nigam Limited (JUVNL)",
  "Department of Health, Medical Education & Family Welfare",
  "Water Resources Department (WRD)",
  "Department of School Education & Literacy (DSE&L)",
  "Minor Irrigation & Ground Water Directorate",
];

export default function NodalDashboardPage() {
  const { user } = useAuthStore();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    pending: 0,
    routedToAcademia: 0,
    divertedToGov: 0,
    rejected: 0,
    total: 0,
  });
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal States
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<"reject" | "divert" | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [divertedTarget, setDivertedTarget] = useState<string>(GOV_DEPARTMENTS[0]);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Slide-in Side Panel State
  const [panelChallenge, setPanelChallenge] = useState<any | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchTriageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/nodal/triage`);
      const data = await res.json();
      if (data.success) {
        setChallenges(data.data || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        showToast(data.error || "Failed to load triage queue", "error");
      }
    } catch (err: any) {
      showToast("Error connecting to triage API", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTriageData();
  }, [fetchTriageData]);

  // Handle Route to Academia directly
  const handleRouteToAcademia = async (challenge: any) => {
    setIsSubmittingAction(true);
    try {
      const res = await fetch("/api/nodal/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          action: "route_to_academia",
          nodalOfficerId: user?.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Challenge "${challenge.title}" routed to 3 universities. Emails dispatched!`);
        fetchTriageData();
      } else {
        showToast(data.error || "Failed to route to academia", "error");
      }
    } catch (err: any) {
      showToast("Error submitting triage action", "error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleResolve = async (challengeId: string) => {
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Challenge Resolved! Final 30% escrow tranche released.");
        if (panelChallenge && panelChallenge.id === challengeId) {
          setPanelChallenge({ ...panelChallenge, status: "RESOLVED" });
        }
        fetchTriageData();
      } else {
        showToast(data.error || "Failed to resolve challenge", "error");
      }
    } catch (err: any) {
      showToast("Error resolving challenge", "error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Submit Modal Action (Reject or Divert)
  const submitModalAction = async () => {
    if (!selectedChallenge || !modalAction) return;

    if (modalAction === "reject" && rejectionReason.trim().length < 5) {
      showToast("Rejection reason must be at least 5 characters", "error");
      return;
    }

    setIsSubmittingAction(true);
    try {
      const payload: any = {
        challengeId: selectedChallenge.id,
        action: modalAction === "reject" ? "reject" : "divert_to_gov",
        nodalOfficerId: user?.id,
      };

      if (modalAction === "reject") {
        payload.rejectionReason = rejectionReason.trim();
      } else {
        payload.divertedTarget = divertedTarget;
      }

      const res = await fetch("/api/nodal/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Triage decision recorded successfully!");
        setModalAction(null);
        setSelectedChallenge(null);
        setRejectionReason("");
        fetchTriageData();
      } else {
        showToast(data.error || "Triage submission failed", "error");
      }
    } catch (err: any) {
      showToast("Network error submitting decision", "error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const filteredChallenges = challenges.filter((ch) => {
    const matchesTab =
      activeTab === "all" ? true : (ch.nodalStatus || "pending") === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ch.publicTrackingId && ch.publicTrackingId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium text-white ${
              toastMessage.type === "error" ? "bg-rose-600" : "bg-emerald-700"
            }`}
          >
            {toastMessage.type === "error" ? (
              <AlertTriangle className="w-5 h-5 text-white" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-white" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold tracking-wide uppercase mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>State & District Administrative Authority</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              District Nodal Officer Triage Console
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Authoritative review gate for citizen-reported societal issues. Cancel invalid entries, divert standard infrastructure issues to State Departments, or push innovation challenges to 3-way AI Academic Matching.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={fetchTriageData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
            <Link
              href="/dashboard/gov"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <span>Gov Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`p-5 rounded-2xl border text-left transition-all ${
              activeTab === "pending"
                ? "bg-amber-50 border-amber-400 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Pending Review</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats.pending}</div>
            <div className="text-xs text-slate-500 mt-1">Awaiting Nodal triage</div>
          </button>

          <button
            onClick={() => setActiveTab("routed_to_academia")}
            className={`p-5 rounded-2xl border text-left transition-all ${
              activeTab === "routed_to_academia"
                ? "bg-indigo-50 border-indigo-400 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">Routed to Academia</span>
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats.routedToAcademia}</div>
            <div className="text-xs text-slate-500 mt-1">3-Way matching active</div>
          </button>

          <button
            onClick={() => setActiveTab("diverted_to_gov")}
            className={`p-5 rounded-2xl border text-left transition-all ${
              activeTab === "diverted_to_gov"
                ? "bg-blue-50 border-blue-400 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">Diverted to Gov</span>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats.divertedToGov}</div>
            <div className="text-xs text-slate-500 mt-1">Sent to line departments</div>
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`p-5 rounded-2xl border text-left transition-all ${
              activeTab === "rejected"
                ? "bg-rose-50 border-rose-400 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">Rejected</span>
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats.rejected}</div>
            <div className="text-xs text-slate-500 mt-1">Grievances with documented rationale</div>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Records ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab("routed_to_academia")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "routed_to_academia"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Routed to Academia ({stats.routedToAcademia})
            </button>
            <button
              onClick={() => setActiveTab("diverted_to_gov")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "diverted_to_gov"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Diverted to Gov ({stats.divertedToGov})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "rejected"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, domain, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Triage Challenges List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Loading District Triage Queue...</p>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No challenges in this queue</h3>
              <p className="text-slate-500 text-xs mt-1">
                {activeTab === "pending"
                  ? "All citizen submissions have been triaged by the District Nodal Officer."
                  : "No challenges match the active filter criteria."}
              </p>
            </div>
          ) : (
            filteredChallenges.map((ch) => {
              const nodalStatus = ch.nodalStatus || "pending";
              let matchedList = [];
              if (ch.matchedUniversities) {
                try {
                  matchedList = JSON.parse(ch.matchedUniversities);
                } catch {
                  matchedList = [];
                }
              }

              return (
                <div
                  key={ch.id}
                  onClick={() => setPanelChallenge(ch)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                          {ch.publicTrackingId || ch.id.slice(0, 10)}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                          {ch.domain}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {ch.district}
                        </span>
                        {/* Status Badges */}
                        {nodalStatus === "pending" && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                        {nodalStatus === "routed_to_academia" && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            Routed to Academia
                          </span>
                        )}
                        {nodalStatus === "diverted_to_gov" && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            Diverted to Gov
                          </span>
                        )}
                        {nodalStatus === "rejected" && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                        {/* AI Confidence Badge */}
                        {ch.aiConfidence == null ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                            AI: Unscored
                          </span>
                        ) : ch.aiConfidence >= 0.8 ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                            AI: {Math.round(ch.aiConfidence * 100)}% ✓
                          </span>
                        ) : ch.aiConfidence >= 0.5 ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                            AI: {Math.round(ch.aiConfidence * 100)}%
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">
                            AI: {Math.round(ch.aiConfidence * 100)}% ⚠
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{ch.title}</h3>
                    </div>

                    {/* Action Buttons for Pending Triage */}
                    {nodalStatus === "pending" ? (
                      <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChallenge(ch);
                            setModalAction("reject");
                            setRejectionReason("");
                          }}
                          className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors text-xs font-semibold flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChallenge(ch);
                            setModalAction("divert");
                          }}
                          className="px-3.5 py-2 rounded-xl border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>Divert to Gov Body</span>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleRouteToAcademia(ch); }}
                          disabled={isSubmittingAction}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white hover:from-emerald-800 hover:to-teal-800 transition-all text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Route to Academia</span>
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={`/challenge/${ch.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 underline underline-offset-4"
                      >
                        <span>View Public Ledger</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">{ch.description}</p>

                  {/* Feature 3: AI Categorization Suggestions for Nodal Officer */}
                  {nodalStatus === "pending" && (
                    <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>AI Categorization Suggestions</span>
                        {ch.aiConfidence && (
                          <span className="ml-auto px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                            {typeof ch.aiConfidence === 'number' && ch.aiConfidence < 1
                              ? Math.round(ch.aiConfidence * 100)
                              : ch.aiConfidence}% Confidence
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Suggested Domain</span>
                          <span className="text-xs font-bold text-slate-900">{ch.domain || "—"}</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Suggested Priority</span>
                          <span className={`text-xs font-bold ${
                            ch.urgency === "CRITICAL" ? "text-rose-700" :
                            ch.urgency === "HIGH" ? "text-amber-700" :
                            ch.urgency === "MEDIUM" ? "text-blue-700" : "text-slate-700"
                          }`}>{ch.urgency || "MEDIUM"}</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Suggested Track</span>
                          <span className="text-xs font-bold text-slate-900">
                            {ch.track === "TRACK_A_INNOVATION" ? "Innovation R&D" :
                             ch.track === "TRACK_B_STANDARD" ? "Standard Public Works" :
                             ch.track === "TRACK_C_CIVIC" ? "Civic/Rapid" : ch.track || "Innovation R&D"}
                          </span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Target Entity</span>
                          <span className="text-xs font-bold text-slate-900">
                            {ch.targetEntityLevel === "ACADEMIC_RESEARCH" ? "Academic Research" :
                             ch.targetEntityLevel === "STATE_DEPARTMENT" ? "State Department" :
                             ch.targetEntityLevel === "MUNICIPAL_ULB" ? "Municipal ULB" :
                             ch.targetEntityLevel === "GRAM_PANCHAYAT" ? "Gram Panchayat" :
                             ch.targetEntityLevel || "Academic Research"}
                          </span>
                        </div>
                      </div>
                      {ch.triageReasoning && (
                        <div className="text-xs text-indigo-800 bg-white p-2.5 rounded-lg border border-indigo-100">
                          <span className="font-bold">AI Reasoning:</span> {ch.triageReasoning}
                        </div>
                      )}
                      {ch.aiReasoning && !ch.triageReasoning && (
                        <div className="text-xs text-indigo-800 bg-white p-2.5 rounded-lg border border-indigo-100">
                          <span className="font-bold">AI Reasoning:</span> {ch.aiReasoning}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contextual Action Feedback Panels */}
                  {nodalStatus === "rejected" && ch.rejectionReason && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Rejection Reason:</span> {ch.rejectionReason}
                      </div>
                    </div>
                  )}

                  {nodalStatus === "diverted_to_gov" && ch.divertedTarget && (
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Diverted To Line Department:</span> {ch.divertedTarget}
                      </div>
                    </div>
                  )}

                  {nodalStatus === "routed_to_academia" && (
                    <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-indigo-700" />
                          <span>AI 3-Way Matched Universities (Simulated Claim Race)</span>
                        </div>
                        {ch.claimedInstitute ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                            🔒 Claimed by {ch.claimedInstitute}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                            ⚡ Open for Claim Race
                          </span>
                        )}
                      </div>

                      {matchedList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                          {matchedList.map((m: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-white rounded-lg border border-indigo-100 shadow-2xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 truncate">{m.name}</span>
                                <span className="text-indigo-600 font-bold">{m.matchScore}%</span>
                              </div>
                              <div className="text-slate-500 text-[11px] truncate">{m.department}</div>
                              <div className="text-slate-400 font-mono text-[10px] truncate">{m.email}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-indigo-700">3 institutions notified via simulated email.</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Modal (Reject or Divert) */}
      <AnimatePresence>
        {modalAction && selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-5"
            >
              {modalAction === "reject" ? (
                <>
                  <div className="flex items-center gap-3 text-rose-600">
                    <div className="p-2.5 bg-rose-100 rounded-xl">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Reject Citizen Challenge</h3>
                      <p className="text-xs text-slate-500">Provide official rationale for closing this entry</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                    <div className="font-semibold text-slate-900">{selectedChallenge.title}</div>
                    <div className="text-slate-500 mt-0.5">{selectedChallenge.district} &bull; {selectedChallenge.domain}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Rejection Reason (Mandatory, min 5 chars)
                    </label>
                    <textarea
                      rows={4}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Duplicate grievance already addressed under local municipal ward budget; insufficient evidence provided."
                      className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setModalAction(null);
                        setSelectedChallenge(null);
                      }}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitModalAction}
                      disabled={isSubmittingAction || rejectionReason.trim().length < 5}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingAction ? "Rejecting..." : "Confirm Rejection"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Divert to Government Body</h3>
                      <p className="text-xs text-slate-500">Route standard civic/infrastructure issue to responsible state department</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                    <div className="font-semibold text-slate-900">{selectedChallenge.title}</div>
                    <div className="text-slate-500 mt-0.5">{selectedChallenge.district} &bull; {selectedChallenge.domain}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Select Government Line Department or Civic Body
                    </label>
                    <select
                      value={divertedTarget}
                      onChange={(e) => setDivertedTarget(e.target.value)}
                      className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {GOV_DEPARTMENTS.map((dept, i) => (
                        <option key={i} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setModalAction(null);
                        setSelectedChallenge(null);
                      }}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitModalAction}
                      disabled={isSubmittingAction}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingAction ? "Diverting..." : "Confirm Diversion"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-in Side Panel */}
      <AnimatePresence>
        {panelChallenge && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 z-40 md:hidden"
              onClick={() => setPanelChallenge(null)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-screen w-full max-w-[480px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col overflow-hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                <div>
                  <span className="font-mono text-xs text-slate-500">
                    {panelChallenge.publicTrackingId || panelChallenge.id.slice(0, 10)}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 leading-tight mt-0.5 pr-4">
                    {panelChallenge.title}
                  </h2>
                </div>
                <button
                  onClick={() => setPanelChallenge(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Body — scrollable */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                    {panelChallenge.domain}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {panelChallenge.district}
                  </span>
                  {/* Urgency */}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    panelChallenge.urgency === "CRITICAL" ? "bg-red-100 text-red-800" :
                    panelChallenge.urgency === "HIGH" ? "bg-orange-100 text-orange-800" :
                    panelChallenge.urgency === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {panelChallenge.urgency || "MEDIUM"}
                  </span>
                  {/* AI Confidence badge */}
                  {panelChallenge.aiConfidence == null ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                      AI: Unscored
                    </span>
                  ) : panelChallenge.aiConfidence >= 0.8 ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      AI: {Math.round(panelChallenge.aiConfidence * 100)}% ✓
                    </span>
                  ) : panelChallenge.aiConfidence >= 0.5 ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                      AI: {Math.round(panelChallenge.aiConfidence * 100)}%
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">
                      AI: {Math.round(panelChallenge.aiConfidence * 100)}% ⚠
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-slate-700 leading-relaxed">{panelChallenge.description}</p>
                </div>

                {/* AI Reasoning */}
                {(panelChallenge.aiReasoning || panelChallenge.triageReasoning) && (
                  <div className="p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Reasoning</span>
                    </div>
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      {panelChallenge.triageReasoning || panelChallenge.aiReasoning}
                    </p>
                  </div>
                )}

                {/* Submitted-by citizen info */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Submitted By</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    {panelChallenge.submitterName && (
                      <div><span className="font-semibold">Name:</span> {panelChallenge.submitterName}</div>
                    )}
                    {panelChallenge.submitterPhone && (
                      <div><span className="font-semibold">Phone:</span> {panelChallenge.submitterPhone}</div>
                    )}
                    {panelChallenge.submitterEmail && (
                      <div><span className="font-semibold">Email:</span> {panelChallenge.submitterEmail}</div>
                    )}
                    {panelChallenge.createdAt && (
                      <div><span className="font-semibold">Submitted:</span> {new Date(panelChallenge.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    )}
                  </div>
                </div>

                {/* Final Handover & Resolution */}
                {["OPEN_FOR_PROPOSALS", "IN_PROGRESS", "RESOLVED"].includes(panelChallenge.status) && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Final Handover & Resolution</span>
                    </div>
                    {panelChallenge.status === "RESOLVED" ? (
                      <div className="text-xs text-emerald-700 font-medium">
                        This challenge has been successfully resolved. Final escrow tranche has been released.
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-emerald-700">
                          Review the final implementation milestone. Upon approval, the final 30% escrow tranche will be released and the citizen will be notified.
                        </div>
                        <button
                          onClick={() => handleResolve(panelChallenge.id)}
                          disabled={isSubmittingAction}
                          className="w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Final Milestone & Resolve
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Panel Footer — action buttons */}
              {(panelChallenge.nodalStatus || "pending") === "pending" && (
                <div className="border-t border-slate-100 p-5 space-y-3 shrink-0">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Triage Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedChallenge(panelChallenge);
                        setModalAction("reject");
                        setRejectionReason("");
                        setPanelChallenge(null);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors text-xs font-semibold flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setSelectedChallenge(panelChallenge);
                        setModalAction("divert");
                        setPanelChallenge(null);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Divert to Gov
                    </button>
                    <button
                      onClick={() => {
                        handleRouteToAcademia(panelChallenge);
                        setPanelChallenge(null);
                      }}
                      disabled={isSubmittingAction}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white hover:from-emerald-800 hover:to-teal-800 transition-all text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Route to Academia
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
