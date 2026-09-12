"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, MapPin, Calendar, ShieldCheck, Camera, 
  BrainCircuit, Users, AlertTriangle, PlaySquare, 
  ChevronRight, Share2, CheckCircle2, X, Play, ArrowRight,
  Clock, DollarSign
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { DetailSkeleton } from "@/components/ui/Skeletons";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

export default function ChallengeDetail() {
  const params = useParams();
  const rawId = params.id as string;

  const { user } = useAuthStore();
  const [challenge, setChallenge] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showCollabModal, setShowCollabModal] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Collab form
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantOrg, setApplicantOrg] = useState("");
  const [applicantNotes, setApplicantNotes] = useState("");
  const [isSubmittingCollab, setIsSubmittingCollab] = useState(false);
  const [collabSuccess, setCollabSuccess] = useState(false);

  // University Claim State
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimToast, setClaimToast] = useState<{ text: string; isError: boolean } | null>(null);

  const handleClaimChallenge = async () => {
    if (!challenge) return;
    setIsClaiming(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId: user?.id,
          universityName: user?.organization || user?.name || "Empanelled University PI",
        }),
      });

      const data = await res.json();
      if (res.status === 200 && data.success) {
        setClaimToast({ text: "🎉 Challenge successfully claimed and locked!", isError: false });
        setChallenge((prev: any) => ({
          ...prev,
          claimedInstitute: data.claimedInstitute,
          claimedAt: data.claimedAt,
          assignedInstitute: data.claimedInstitute,
        }));
      } else if (res.status === 409) {
        setClaimToast({ text: `⚠️ ${data.message || "Challenge already claimed by another university"}`, isError: true });
        if (data.claimedInstitute) {
          setChallenge((prev: any) => ({ ...prev, claimedInstitute: data.claimedInstitute }));
        }
      } else {
        setClaimToast({ text: data.error || "Claim request failed", isError: true });
      }
    } catch {
      setClaimToast({ text: "Network error submitting claim", isError: true });
    } finally {
      setIsClaiming(false);
      setTimeout(() => setClaimToast(null), 4000);
    }
  };

  useEffect(() => {
    async function fetchChallenge() {
      try {
        const data = await apiFetch<any>(`/api/challenges/${rawId}`);
        setChallenge(data.challenge);
      } catch (err) {
        console.error("Challenge detail fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (rawId) {
      fetchChallenge();
    }
  }, [rawId]);

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://innovate.jharkhand.gov.in/challenge/${rawId}`;
    navigator.clipboard.writeText(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  const handleCollabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCollab(true);

    try {
      await apiFetch(`/api/challenges/${rawId}/apply`, {
        method: "POST",
        body: {
          name: applicantName || user?.name || "Expert Contributor",
          email: applicantEmail || user?.email || "expert@jharkhand.org",
          phone: applicantPhone || user?.phone,
          organization: applicantOrg || user?.organization,
          proposalSummary: applicantNotes,
        },
      });
      setCollabSuccess(true);
      setTimeout(() => {
        setShowCollabModal(false);
        setCollabSuccess(false);
      }, 2500);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmittingCollab(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 pt-24 max-w-6xl mx-auto">
        <DetailSkeleton />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Challenge Not Found</h2>
        <p className="text-slate-500 text-sm mb-4">No challenge record matches ID: {rawId}</p>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
          Return to Portal
        </Link>
      </div>
    );
  }

  // Parse evidence
  let evidenceData: any = {};
  if (challenge.evidence) {
    try {
      evidenceData = JSON.parse(challenge.evidence);
    } catch {
      evidenceData = { raw: challenge.evidence };
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 font-semibold text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Challenge public link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Challenges
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Record
            </button>
            <Link
              href={`/apply/${challenge.publicTrackingId || challenge.id}`}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" /> Collaborate / Mentor
            </Link>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
              {challenge.publicTrackingId || challenge.id}
            </span>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
              {challenge.domain}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
              challenge.urgency === "CRITICAL"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {challenge.urgency} Urgency
            </span>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">
              Status: {challenge.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {challenge.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium pt-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {challenge.location}, {challenge.district} District
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Reported: {new Date(challenge.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              SLA Deadline: {challenge.slaDeadline ? new Date(challenge.slaDeadline).toLocaleDateString() : "21 Days Standard"}
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Problem Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Problem Description & Ground Context</h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                {challenge.description}
              </p>
            </div>

            {/* Ground Telemetry & Evidence */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Ground Telemetry & Physical Evidence</h2>
              </div>

              {Object.keys(evidenceData).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {evidenceData.turbidity && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Turbidity</span>
                      <span className="text-base font-black text-slate-900">{evidenceData.turbidity}</span>
                    </div>
                  )}
                  {evidenceData.dissolvedIron && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dissolved Iron</span>
                      <span className="text-base font-black text-slate-900">{evidenceData.dissolvedIron}</span>
                    </div>
                  )}
                  {evidenceData.ph && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Measured pH</span>
                      <span className="text-base font-black text-slate-900">{evidenceData.ph}</span>
                    </div>
                  )}
                  {evidenceData.leadPpb && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Heavy Metals (Pb)</span>
                      <span className="text-base font-black text-rose-700">{evidenceData.leadPpb}</span>
                    </div>
                  )}
                  {evidenceData.nitrogenDeficit && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Nitrogen Deficit</span>
                      <span className="text-base font-black text-amber-700">{evidenceData.nitrogenDeficit}</span>
                    </div>
                  )}
                  {evidenceData.arsenicPpb && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Arsenic Level</span>
                      <span className="text-base font-black text-rose-700">{evidenceData.arsenicPpb}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No sensor telemetry attached.</p>
              )}
            </div>

            {/* Submitted Academic Proposals for this Challenge */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Submitted Academic Solutions ({challenge.proposals?.length || 0})</h2>
                <Link
                  href={`/dashboard/university/proposal/${challenge.id}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  Submit Proposal <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {(!challenge.proposals || challenge.proposals.length === 0) ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 font-medium">No university lab has submitted a DPR solution yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {challenge.proposals.map((p: any) => (
                    <div key={p.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {p.proposalRef}
                        </span>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Budget: ₹{p.budget?.toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                      <p className="text-xs text-slate-500">{p.abstract}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Institution: {p.universityName || "IIT ISM Dhanbad"}
                        </span>
                        <Link
                          href={`/dashboard/industry/fund/${p.id}`}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" /> Co-Fund via CSR Escrow
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Metadata & Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Assignment & Triage</h3>
              
              <div className="space-y-3 text-xs">
                {/* Nodal Triage State */}
                <div>
                  <span className="text-slate-400 block font-semibold">District Nodal Status</span>
                  <div className="mt-1">
                    {challenge.nodalStatus === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> Pending Review
                      </span>
                    )}
                    {challenge.nodalStatus === "routed_to_academia" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Routed to Academia
                      </span>
                    )}
                    {challenge.nodalStatus === "diverted_to_gov" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200">
                        Diverted: {challenge.divertedTarget || "State Department"}
                      </span>
                    )}
                    {challenge.nodalStatus === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 font-bold border border-rose-200">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold">Assigned Academic Institute</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">
                    {challenge.claimedInstitute || challenge.assignedInstitute || "Pending Academic Claim"}
                  </span>
                </div>

                {/* Claim Action or Locked Badge */}
                {challenge.nodalStatus === "routed_to_academia" && (
                  <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900">Academic Claim Status</span>
                      {challenge.claimedInstitute ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          🔒 Locked
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          ⚡ Open Race
                        </span>
                      )}
                    </div>

                    {challenge.claimedInstitute ? (
                      <p className="text-[11px] text-slate-600">
                        Claimed and locked exclusively by <span className="font-bold text-slate-900">{challenge.claimedInstitute}</span>.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[11px] text-slate-600">
                          Open to 3 AI-matched universities. First to claim secures project.
                        </p>
                        <button
                          onClick={handleClaimChallenge}
                          disabled={isClaiming}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-lg shadow transition-all disabled:opacity-50"
                        >
                          {isClaiming ? "Locking Claim..." : "⚡ Claim This Challenge"}
                        </button>
                      </div>
                    )}

                    {claimToast && (
                      <div className={`p-2 rounded text-[11px] font-semibold ${claimToast.isError ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {claimToast.text}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <span className="text-slate-400 block font-semibold">Ground Corroboration</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified by {challenge.verifiedByCount || 42} Citizen Monitors
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold">Statutory SLA Escalation</span>
                  <span className="font-bold text-slate-800">
                    Level {challenge.escalationLevel || 0} ({challenge.escalationLevel === 1 ? "District Nodal Officer" : challenge.escalationLevel === 2 ? "District Collector" : "Normal Velocity"})
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href={`/track?id=${challenge.publicTrackingId || challenge.id}`}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  View Public Telemetry Ledger
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Collaborate on this Challenge</h3>
              <button onClick={() => setShowCollabModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {collabSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900">Application Registered!</h4>
                <p className="text-xs text-slate-500">Your expertise proposal has been routed to the Nodal Officer.</p>
              </div>
            ) : (
              <form onSubmit={handleCollabSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Dr. A. K. Sen"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="mentor@isro-alumni.res.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Affiliation / Organization</label>
                  <input
                    type="text"
                    value={applicantOrg}
                    onChange={(e) => setApplicantOrg(e.target.value)}
                    placeholder="Independent / ISRO Alumni / NGO"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Technical Oversight / Support Summary</label>
                  <textarea
                    rows={3}
                    value={applicantNotes}
                    onChange={(e) => setApplicantNotes(e.target.value)}
                    placeholder="Describe how you can advise on remote sensing, hydrology, or field deployment..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCollabModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCollab}
                    className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmittingCollab ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
