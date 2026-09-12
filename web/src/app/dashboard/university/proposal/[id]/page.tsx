"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FlaskConical, FileText, Upload, X, Clock, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

export default function SubmitProposal() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id as string;
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [proposalRef, setProposalRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [targetChallengeId, setTargetChallengeId] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("Solar-Powered Dual-Stage Groundwater Filtration Pilot");
  const [abstract, setAbstract] = useState(
    "Electrochemical coagulation combined with dual-stage activated alumina adsorption to reduce turbidity from 48 NTU to < 1 NTU and heavy metals to WHO potability standards."
  );
  const [methodology, setMethodology] = useState(
    "Community scale 5000 LPH filtration unit powered by 5kW rooftop solar PV array with IoT-enabled continuous turbidity and pH telemetry backhauled via LoRaWAN to Jharkhand State Pollution Control Board dashboard."
  );
  const [timelineMonths, setTimelineMonths] = useState(6);
  const [budget, setBudget] = useState(350000);
  const [milestones, setMilestones] = useState(
    "Tranche 1 (30%): DPR & Baseline Water Quality Audit\nTranche 2 (40%): Filtration Skid Fabrication & Telemetry Sensor Installation\nTranche 3 (30%): Gram Panchayat Handover & District Collector Sign-off"
  );
  const [universityName, setUniversityName] = useState(user?.organization || "IIT ISM Dhanbad");
  const [stage, setStage] = useState("Prototype Ready");

  // Document Upload State
  const [attachedDoc, setAttachedDoc] = useState<{ name: string; size: string } | null>({
    name: "IIT_ISM_Technical_Architecture_DPR.pdf",
    size: "3.8 MB"
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rehydrate saved draft from localStorage on component mount
  useEffect(() => {
    if (typeof window === "undefined" || !rawId) return;

    try {
      const saved = localStorage.getItem(`proposal_draft_${rawId}`);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.abstract || draft.summary) setAbstract(draft.abstract || draft.summary);
        if (draft.methodology) setMethodology(draft.methodology);
        if (draft.budget !== undefined || draft.funding !== undefined) {
          setBudget(Number(draft.budget ?? draft.funding));
        }
        if (draft.milestones) setMilestones(draft.milestones);
        if (draft.timelineMonths !== undefined || draft.timeline !== undefined) {
          setTimelineMonths(Number(draft.timelineMonths ?? draft.timeline));
        }
        if (draft.stage) setStage(draft.stage);
        if (draft.universityName) setUniversityName(draft.universityName);
        if (draft.attachedDoc) {
          if (typeof draft.attachedDoc === "string") {
            setAttachedDoc({ name: draft.attachedDoc, size: "Saved in draft" });
          } else if (draft.attachedDoc.name) {
            setAttachedDoc(draft.attachedDoc);
          }
        }
      }
    } catch (err) {
      console.error("Failed to restore proposal draft from localStorage:", err);
    }
  }, [rawId]);

  useEffect(() => {
    // If rawId is an existing proposal, fetch it
    async function loadExistingProposal() {
      try {
        const res = await apiFetch<any>(`/api/proposals/${rawId}`);
        if (res.proposal) {
          const p = res.proposal;
          setTitle(p.title || "");
          setAbstract(p.abstract || "");
          setMethodology(p.methodology || "");
          setBudget(p.budget || 0);
          setTimelineMonths(p.timelineMonths || 6);
          setUniversityName(p.universityName || p.submittedBy?.organization || "IIT ISM Dhanbad");
          setStage(p.stage || "Prototype Ready");
          setProposalRef(p.proposalRef || p.id);
          setIsEditing(true);
          setTargetChallengeId(p.challengeId || p.challenge?.id || null);
        }
      } catch {
        // rawId is a challenge ID for a new proposal
        setIsEditing(false);
        setTargetChallengeId(rawId);
      }
    }

    if (rawId) {
      loadExistingProposal();
    }
  }, [rawId]);

  // Auto-save proposal draft to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !rawId || isSuccess) return;
    const timer = setTimeout(() => {
      try {
        const draftPayload = {
          title,
          abstract,
          summary: abstract,
          methodology,
          budget,
          funding: budget,
          milestones,
          timelineMonths,
          timeline: timelineMonths,
          stage,
          universityName,
          attachedDoc: attachedDoc?.name || attachedDoc,
          savedAt: new Date().toLocaleTimeString(),
        };
        localStorage.setItem(`proposal_draft_${rawId}`, JSON.stringify(draftPayload));
      } catch {
        // Ignore quota limitations
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, abstract, methodology, budget, milestones, timelineMonths, stage, universityName, attachedDoc, rawId, isSuccess]);

  const handleSaveDraft = () => {
    if (typeof window === "undefined" || !rawId) return;
    try {
      const draftPayload = {
        title,
        abstract,
        summary: abstract,
        methodology,
        budget,
        funding: budget,
        milestones,
        timelineMonths,
        timeline: timelineMonths,
        stage,
        universityName,
        attachedDoc: attachedDoc?.name || attachedDoc,
        savedAt: new Date().toLocaleTimeString(),
      };
      localStorage.setItem(`proposal_draft_${rawId}`, JSON.stringify(draftPayload));
      showToast("Proposal draft saved to browser storage.");
    } catch (err) {
      console.error("Failed to save proposal draft:", err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedDoc({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
      showToast(`Attached document: ${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEditing) {
        const res = await apiFetch<any>(`/api/proposals/${rawId}`, {
          method: "PUT",
          body: {
            title,
            abstract,
            methodology,
            budget: Number(budget),
            timelineMonths: Number(timelineMonths),
            stage,
          },
        });

        setProposalRef(res.proposal?.proposalRef || rawId);
        setIsSuccess(true);
        if (typeof window !== "undefined" && rawId) {
          try {
            localStorage.removeItem(`proposal_draft_${rawId}`);
          } catch {}
        }
        showToast("Proposal updated successfully on State Ledger.");
      } else {
        const res = await apiFetch<any>("/api/proposals", {
          method: "POST",
          body: {
            challengeId: targetChallengeId || rawId,
            title,
            abstract,
            methodology,
            budget: Number(budget),
            timelineMonths: Number(timelineMonths),
            universityName: universityName || "IIT ISM Dhanbad",
            stage,
            attachedDocs: attachedDoc ? JSON.stringify([attachedDoc]) : undefined,
          },
        });

        setProposalRef(res.proposalRef || "PR-102");
        setIsSuccess(true);
        if (typeof window !== "undefined" && rawId) {
          try {
            localStorage.removeItem(`proposal_draft_${rawId}`);
          } catch {}
        }
        showToast("Proposal registered successfully on State Ledger.");
      }
    } catch (err: any) {
      console.error("Proposal submit error:", err);
      setErrorMessage(err.message || "Failed to submit proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 font-semibold text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <Link href="/dashboard/university" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to University Hub
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <FlaskConical className="w-3.5 h-3.5" /> Detailed Project Report (DPR) Console
              </div>
              <h1 className="text-2xl font-black text-slate-900">
                {isEditing ? "Update R&D Technical Proposal" : "Submit R&D Technical Proposal"}
              </h1>
              <p className="text-slate-500 text-sm">
                {isEditing
                  ? "Update your engineering methodology, timeline, or budget allocations on the State Ledger."
                  : "Formulate an engineering methodology and request prototype co-financing from State CSR escrow."}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Host University / Lab</label>
                  <input
                    type="text"
                    required
                    value={universityName}
                    onChange={(e) => setUniversityName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Development Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Research Phase">Research Phase</option>
                    <option value="Prototype Ready">Prototype Ready</option>
                    <option value="Pilot Implementation">Pilot Implementation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Timeline (Months)</label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={timelineMonths}
                    onChange={(e) => setTimelineMonths(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Budget Allocation Request (INR ₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technical Abstract & Solution Thesis</label>
                <textarea
                  rows={3}
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deployment Methodology & Telemetry Architecture</label>
                <textarea
                  rows={4}
                  required
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Execution Milestones & Tranche Schedule</label>
                <textarea
                  rows={3}
                  value={milestones}
                  onChange={(e) => setMilestones(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-xs"
                  placeholder="Define execution milestones (e.g. 30% DPR approval, 40% prototype, 30% handover)"
                />
              </div>

              {/* Document attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attach DPR Technical Document</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                {attachedDoc ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{attachedDoc.name}</p>
                        <p className="text-[10px] text-slate-400">{attachedDoc.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedDoc(null)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Attach DPR PDF / Document
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-slate-500" /> Save Draft
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting 
                    ? (isEditing ? "Updating DPR on State Board..." : "Submitting DPR to State Board...") 
                    : (isEditing ? "Update Technical DPR Proposal" : "Submit Technical DPR Proposal")}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200 text-center space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {isEditing ? "R&D Proposal Updated Successfully!" : "R&D Proposal Submitted Successfully!"}
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Your technical DPR has been locked in the state database and made available to Section 135 CSR industry partners for co-funding.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block px-8">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Proposal Reference</span>
              <span className="font-mono text-xl font-black text-slate-900">{proposalRef || "PR-102"}</span>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/dashboard/university"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow"
              >
                Return to University Hub
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
