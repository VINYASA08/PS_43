"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Users, 
  Target, 
  ArrowRight,
  Search,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { TableSkeleton, StatsSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

function UniversityDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "CRITICAL" | "HIGH">("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const err = searchParams?.get("error");
    if (err === "unauthorized") {
      showToast("Access restricted: You were redirected to your authorized workspace.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) return;

    const userRole = (user.role || "").toUpperCase();
    if (userRole !== "UNIVERSITY") {
      showToast("Access restricted: Redirecting to your assigned dashboard...");
      if (userRole === "GOV") router.replace("/dashboard/gov");
      else if (userRole === "UNIVERSITY") router.replace("/dashboard/university");
      else if (userRole === "INDUSTRY") router.replace("/dashboard/industry");
      else router.replace("/submit?error=unauthorized");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [chalData, propData] = await Promise.all([
          apiFetch<any>("/api/challenges?limit=50"),
          apiFetch<any>("/api/proposals"),
        ]);
        setChallenges(chalData.challenges || []);
        setProposals(propData.proposals || []);
      } catch (err) {
        console.error("University dashboard load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (!isAuthLoading && user && (user.role || "").toUpperCase() === "UNIVERSITY") {
      loadData();
    }
  }, [isAuthLoading, user]);

  const filteredChallenges = challenges.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      c.title.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      (c.publicTrackingId && c.publicTrackingId.toLowerCase().includes(q)) ||
      c.district.toLowerCase().includes(q);

    const matchesPriority =
      priorityFilter === "All" || c.urgency === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  if (isAuthLoading || !user || (user.role || "").toUpperCase() !== "UNIVERSITY") {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <StatsSkeleton count={3} />
      </div>
    );
  }

  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaimChallenge = async (challengeId: string) => {
    setClaimingId(challengeId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId: user?.id,
          universityName: user?.organization || user?.name || "Empanelled University PI",
        }),
      });

      const data = await res.json();
      if (res.status === 200 && data.success) {
        showToast("🎉 Challenge successfully claimed! Exclusive project rights locked to your university.");
        // Refresh challenge data
        const chalData = await apiFetch<any>("/api/challenges?limit=50");
        setChallenges(chalData.challenges || []);
      } else if (res.status === 409) {
        showToast(`⚠️ Lockout: ${data.message || "Another university has already claimed this challenge."}`);
        // Refresh challenge data to update locked badges
        const chalData = await apiFetch<any>("/api/challenges?limit=50");
        setChallenges(chalData.challenges || []);
      } else {
        showToast(data.error || "Failed to claim challenge");
      }
    } catch (err: any) {
      showToast("Network error submitting claim request");
    } finally {
      setClaimingId(null);
    }
  };

  // Matched challenges routed to academia by Nodal Officer
  const matchedChallenges = challenges.filter(
    (c) => c.nodalStatus === "routed_to_academia"
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Research & Innovation Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {user.organization || user.name || "University Partner Portal"}
          </h1>
          <p className="text-xs text-slate-500">
            {user.designation || "Lead Principal Investigator"} • {user.district ? `${user.district} District` : "Jharkhand State"}
          </p>
        </div>

        <Link
          href="/guidelines"
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors shrink-0 self-start sm:self-auto flex items-center gap-1.5"
        >
          View Research Guidelines <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Matched Opportunities (AI 3-Way Claim Race) */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md space-y-4 border border-indigo-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>AI 3-Way Academic Match Queue</span>
            </div>
            <h2 className="text-xl font-black">Open Problems Dispatched by District Nodal Officers</h2>
            <p className="text-indigo-200/90 text-xs max-w-2xl">
              These challenges have been approved for academic innovation and matched to your institution. Claims operate on a strict first-come-first-served race condition lock.
            </p>
          </div>
          <span className="text-xs font-bold bg-indigo-800 text-indigo-200 px-3 py-1 rounded-full border border-indigo-700 shrink-0 self-start sm:self-auto">
            {matchedChallenges.length} Matched Challenges
          </span>
        </div>

        {matchedChallenges.length === 0 ? (
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center text-xs text-indigo-200">
            No challenges currently waiting in the 3-way match queue. Check back as Nodal Officers triage incoming grievances.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {matchedChallenges.map((mc) => {
              const isClaimed = !!(mc.claimedAt || mc.claimedById);
              const isClaimedByMe = mc.claimedById === user.id;

              return (
                <div
                  key={mc.id}
                  className="p-5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold bg-white/15 px-2 py-0.5 rounded text-indigo-200">
                        {mc.publicTrackingId || mc.id.slice(0, 10)}
                      </span>
                      <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                        {mc.domain}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white line-clamp-1">{mc.title}</h3>
                    <p className="text-xs text-indigo-200/80 line-clamp-2">{mc.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-indigo-300">{mc.district} District</span>

                    {isClaimed ? (
                      isClaimedByMe ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Claimed by Your Team
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                          🔒 Locked ({mc.claimedInstitute || "Another Institute"})
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => handleClaimChallenge(mc.id)}
                        disabled={claimingId === mc.id}
                        className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-lg shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {claimingId === mc.id ? "Locking..." : "⚡ Claim Challenge"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Metric Cards */}
      {isLoading ? (
        <StatsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open RFP Challenges</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{challenges.length}</div>
            <p className="text-xs text-slate-500">Live societal problems from Jharkhand districts</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Solutions</span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{proposals.length}</div>
            <p className="text-xs text-slate-500">Active university R&D proposals under review</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Funded & Approved</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {proposals.filter((p) => p.status === "APPROVED" || p.status === "FUNDED").length}
            </div>
            <p className="text-xs text-slate-500">Proposals with CSR escrow co-financing</p>
          </div>
        </div>
      )}

      {/* Active University Proposals List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Our Submitted R&D Solution Proposals</h2>
          </div>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
            {proposals.length} Proposals
          </span>
        </div>

        {proposals.length === 0 ? (
          <EmptyState
            title="No Proposals Submitted Yet"
            description="Browse open challenges below and submit your lab's technical proposal."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {proposals.map((p) => (
              <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      {p.proposalRef}
                    </span>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {p.universityName}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      p.status === "APPROVED" || p.status === "FUNDED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-500">
                    Budget: ₹{p.budget?.toLocaleString()} • Timeline: {p.timelineMonths} months • Stage: {p.stage}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/university/proposal/${p.id}`}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    Edit / View DPR <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Browse Open Opportunities Table */}
      <div id="opportunities" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Available Societal Challenges (Open RFPs)</h2>
            <p className="text-xs text-slate-500">Select any problem to formulate an academic solution proposal.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challenges..."
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => {
                setPriorityFilter(priorityFilter === "All" ? "CRITICAL" : "All");
                showToast(priorityFilter === "All" ? "Filtered to Critical" : "Showing all priorities");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                priorityFilter !== "All"
                  ? "bg-rose-50 border-rose-300 text-rose-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {priorityFilter !== "All" ? "Critical Only" : "All Priorities"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredChallenges.length === 0 ? (
          <EmptyState
            title="No Open Challenges Found"
            description="No challenges match your search filters."
          />
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredChallenges.map((c) => (
              <div key={c.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-xl transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {c.publicTrackingId || c.id}
                    </span>
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {c.domain}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      c.urgency === "CRITICAL" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {c.urgency}
                    </span>
                    <span className="text-xs text-slate-500">{c.district} District</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/challenge/${c.publicTrackingId || c.id}`}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/dashboard/university/proposal/${c.id}`}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                  >
                    Draft Solution <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UniversityDashboard() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto space-y-6"><StatsSkeleton count={3} /></div>}>
      <UniversityDashboardContent />
    </Suspense>
  );
}
