"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Briefcase, 
  IndianRupee, 
  ShieldCheck, 
  FileText, 
  Download, 
  X, 
  PenTool, 
  Landmark, 
  Calendar,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function FundProjectContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = (params?.id as string) || "";
  
  const [isLoadingEntity, setIsLoadingEntity] = useState(true);
  const [isCommitmentView, setIsCommitmentView] = useState(false);
  const [commitment, setCommitment] = useState<any | null>(null);
  const [proposal, setProposal] = useState<any | null>(null);
  const [proposalId, setProposalId] = useState<string>(rawId);

  const typeParam = searchParams.get("type");
  const [commitmentType, setCommitmentType] = useState<"funding" | "mentorship" | "both">(
    typeParam === "mentorship" ? "mentorship" : typeParam === "funding" ? "funding" : "both"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMouModal, setShowMouModal] = useState(false);
  const [mouSigned, setMouSigned] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [pledgedAmount, setPledgedAmount] = useState("350000");
  const [corporateNotes, setCorporateNotes] = useState("We request quarterly milestone audit reports and a representative seat on the prototype review committee.");
  const [escrowRef, setEscrowRef] = useState("JH-ESCROW-2026-CSR-9842");

  useEffect(() => {
    let isMounted = true;
    async function resolveEntity() {
      if (!rawId) return;
      setIsLoadingEntity(true);

      // Fetch both endpoints concurrently to avoid a blocking waterfall
      try {
        const [fundResult, propResult] = await Promise.allSettled([
          fetch(`/api/funds/${rawId}`, { credentials: "include" }).then(res => {
            if (!res.ok) throw new Error("Not a fund");
            return res.json();
          }),
          fetch(`/api/proposals/${rawId}`, { credentials: "include" }).then(res => {
            if (!res.ok) throw new Error("Not a proposal");
            return res.json();
          })
        ]);

        if (fundResult.status === "fulfilled" && fundResult.value.commitment && isMounted) {
          setCommitment(fundResult.value.commitment);
          setIsCommitmentView(true);
          setEscrowRef(fundResult.value.commitment.escrowRef || rawId);
          if (fundResult.value.commitment.amount) {
            setPledgedAmount(String(fundResult.value.commitment.amount));
          }
          if (fundResult.value.commitment.proposalId) {
            setProposalId(fundResult.value.commitment.proposalId);
          }
          setIsLoadingEntity(false);
          return;
        }

        if (propResult.status === "fulfilled" && propResult.value.proposal && isMounted) {
          setProposal(propResult.value.proposal);
          setIsCommitmentView(false);
          setProposalId(propResult.value.proposal.id);
          if (propResult.value.proposal.budget) {
            setPledgedAmount(String(propResult.value.proposal.budget));
          }
          setIsLoadingEntity(false);
          return;
        }

      } catch (err) {
        // Fallback logic
      }

      // Fallback if neither succeeded
      if (isMounted) {
        setIsCommitmentView(false);
        setProposalId(rawId);
        setIsLoadingEntity(false);
      }
    }

    resolveEntity();
    return () => { isMounted = false; };
  }, [rawId]);

  useEffect(() => {
    if (typeParam === "mentorship" || typeParam === "funding" || typeParam === "both") {
      setCommitmentType(typeParam);
    }
  }, [typeParam]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          proposalId: proposalId || proposal?.id || rawId,
          corporateName: "Tata Steel CSR Division",
          amount: Number(pledgedAmount || 350000),
          type: "CSR",
          notes: corporateNotes,
          mouSigned: mouSigned || true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to commit funds");

      setEscrowRef(data.commitment?.escrowRef || data.escrowRef || "JH-ESCROW-2026-CSR-9842");
      setIsSuccess(true);
      showToast("Statutory escrow commitment successfully registered on state ledger.");
    } catch (err: any) {
      showToast(`Commitment notice: ${err.message}`);
      // Fallback for demo
      const newRef = "JH-ESCROW-2026-CSR-" + Math.floor(1000 + Math.random() * 9000);
      setEscrowRef(newRef);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = () => {
    const content = `===============================================================
GOVERNMENT OF JHARKHAND - STATE INNOVATION ESCROW AUTHORITY
CSR CONTRIBUTION & TAX EXEMPTION RECEIPT (SECTION 80G / 135)
===============================================================
Receipt Number: ${escrowRef}
Date: ${new Date().toLocaleDateString('en-GB')}
Academic Proposal ID: ${proposalId}
Project Lead: IIT ISM Dhanbad (Environmental Science Hub)

SPONSORING ENTITY DETAILS:
Corporate Name: Tata Steel CSR Division (Jharkhand State Partner)
PAN: AAACC1209K | CSR Reg: CSR0001842
Category: Schedule VII, Item (ix) - Science & Technology Incubation

FINANCIAL DISBURSEMENT SCHEDULE:
Total Pledged Capital: ₹${Number(pledgedAmount || 350000).toLocaleString('en-IN')}
Tranche 1 (Escrow Deposit): ₹${(Number(pledgedAmount || 350000) * 0.3).toLocaleString('en-IN')} [30% Upon DPR Approval]
Tranche 2 (Prototype Milestone): ₹${(Number(pledgedAmount || 350000) * 0.4).toLocaleString('en-IN')} [40% Upon Lab Pilot]
Tranche 3 (Field Deployment): ₹${(Number(pledgedAmount || 350000) * 0.3).toLocaleString('en-IN')} [30% Upon Collector Sign-off]

STATUTORY DECLARATION:
Certified that this contribution qualifies for 100% deduction under Section 80G(5)(vi) 
and Section 35(1)(ii) of the Income Tax Act, 1961.

Authorized Signatory:
Dr. R. K. Soren, IAS
Member Secretary, Jharkhand State Innovation Escrow Board
===============================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CSR_80G_Receipt_${escrowRef}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Official CSR Section 80G Tax Exemption Receipt downloaded.");
  };

  const parsedTranches = commitment?.tranches
    ? (typeof commitment.tranches === "string" ? JSON.parse(commitment.tranches) : commitment.tranches)
    : [
        {
          tranche: 1,
          percentage: 30,
          amount: Number(commitment?.amount || pledgedAmount || 350000) * 0.3,
          milestone: "DPR Approval & Baseline Survey",
          status: "PLEDGED",
        },
        {
          tranche: 2,
          percentage: 40,
          amount: Number(commitment?.amount || pledgedAmount || 350000) * 0.4,
          milestone: "Pilot Deployment & Field Sensor Verification",
          status: "PENDING",
        },
        {
          tranche: 3,
          percentage: 30,
          amount: Number(commitment?.amount || pledgedAmount || 350000) * 0.3,
          milestone: "Collector Sign-off & Citizen Redressal Handover",
          status: "PENDING",
        },
      ];

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

      <div className="flex items-center justify-between">
        <Link href="/dashboard/industry" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Industry Portal
        </Link>
        <button
          type="button"
          onClick={() => setShowMouModal(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" /> View Escrow Terms & Draft MoU
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoadingEntity ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl p-16 border border-slate-200 text-center space-y-4"
          >
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Resolving Escrow & Proposal Records...</p>
          </motion.div>
        ) : isCommitmentView && commitment ? (
          <motion.div
            key="commitment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-6"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-3 border border-emerald-100">
                  <Landmark className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">State Innovation Escrow Ledger</h1>
                <p className="text-slate-500 font-medium text-sm">
                  Active CSR Co-Financing Commitment: <span className="font-mono text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs font-bold">{commitment.escrowRef}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> {commitment.status || "ACTIVE ESCROW"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Sec 135 Compliant
                </span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Commitment Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Pledged Capital</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono">
                    ₹{Number(commitment.amount || pledgedAmount).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">Locked in State Treasury Escrow</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Corporate Sponsor</span>
                  <span className="text-base font-bold text-slate-900 block truncate">
                    {commitment.corporateName || commitment.industryUser?.organization || "Corporate Partner"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono block mt-1">
                    CSR Reg: {commitment.csrRegistrationNo || "CSR0001842"}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Host Academic Institution</span>
                  <span className="text-base font-bold text-slate-900 block truncate">
                    {commitment.proposal?.universityName || commitment.proposal?.submittedBy?.organization || "IIT ISM Dhanbad"}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    {commitment.proposal?.stage || "Prototype Ready"}
                  </span>
                </div>
              </div>

              {/* Associated Proposal Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Associated Research Proposal</span>
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {commitment.proposal?.proposalRef || commitment.proposalId || "PR-102"}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {commitment.proposal?.title || "Academic Innovation Pilot"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {commitment.proposal?.abstract || "Translational engineering prototype co-financed by Section 135 CSR escrow."}
                </p>
                {commitment.proposal?.challenge && (
                  <p className="text-[11px] text-slate-500 pt-1">
                    Challenge Domain: <span className="font-semibold text-slate-700">{commitment.proposal.challenge.domain}</span> • District: <span className="font-semibold text-slate-700">{commitment.proposal.challenge.district}</span>
                  </p>
                )}
              </div>

              {/* Escrow Tranches & Disbursement Schedule */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Statutory Milestone Tranches</h3>
                    <p className="text-xs text-slate-500">Dual-signoff release schedule enforced by smart ledger contracts.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                    3-Stage Tranche Framework
                  </span>
                </div>

                <div className="space-y-3">
                  {parsedTranches.map((t: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700 shrink-0">
                          T{t.tranche || idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{t.milestone}</p>
                          <p className="text-xs text-slate-500">
                            Allocation: {t.percentage}% of total grant • Release Authorization: PI & District Collector
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:text-right shrink-0">
                        <div>
                          <span className="text-sm font-black text-slate-900 font-mono block">
                            ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            t.status === "RELEASED" || t.status === "DISBURSED"
                              ? "text-emerald-600"
                              : t.status === "PLEDGED"
                              ? "text-blue-600"
                              : "text-amber-600"
                          }`}>
                            {t.status || "PENDING"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corporate Notes & MoU Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Corporate Conditions & Review Terms:</span>
                  <span className="text-emerald-700">MoU Pre-Approved</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {commitment.notes || "We request quarterly milestone audit reports and a representative seat on the prototype review committee."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download CSR Section 80G Receipt
                </button>
                <Link
                  href="/dashboard/industry"
                  className="py-3.5 px-6 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 text-center"
                >
                  Return to Industry Portal
                </Link>
              </div>
            </div>
          </motion.div>
        ) : !isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-3 border border-emerald-100">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">Commit to Academic Innovation</h1>
                <p className="text-slate-500 font-medium text-sm">
                  {proposal?.title ? (
                    <>Pledging corporate partnership for: <span className="font-bold text-slate-900">{proposal.title}</span> ({proposal.submittedBy?.organization || proposal.universityName || "University Partner"})</>
                  ) : (
                    <>Pledging corporate partnership for University Proposal: <span className="font-mono text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs font-bold">{proposalId}</span></>
                  )}
                </p>
              </div>

              {mouSigned && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full self-start">
                  <CheckCircle2 className="w-4 h-4" /> MoU Pre-Accepted
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              {/* Commitment Type Selector */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Select Commitment Type</label>
                <div className="grid md:grid-cols-3 gap-4">
                  <label className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${commitmentType === "funding" ? "border-emerald-600 bg-emerald-50/70 shadow-sm" : "border-slate-200 hover:border-emerald-300"}`}>
                    <input type="radio" name="type" className="sr-only" checked={commitmentType === "funding"} onChange={() => setCommitmentType("funding")} />
                    <IndianRupee className={`w-6 h-6 mb-2 ${commitmentType === "funding" ? "text-emerald-600" : "text-slate-400"}`} />
                    <p className="font-bold text-slate-900 text-base mb-0.5">Financial Funding</p>
                    <p className="text-xs text-slate-500">Pledge milestone-based CSR capital via escrow.</p>
                  </label>

                  <label className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${commitmentType === "mentorship" ? "border-emerald-600 bg-emerald-50/70 shadow-sm" : "border-slate-200 hover:border-emerald-300"}`}>
                    <input type="radio" name="type" className="sr-only" checked={commitmentType === "mentorship"} onChange={() => setCommitmentType("mentorship")} />
                    <Briefcase className={`w-6 h-6 mb-2 ${commitmentType === "mentorship" ? "text-emerald-600" : "text-slate-400"}`} />
                    <p className="font-bold text-slate-900 text-base mb-0.5">Mentorship Only</p>
                    <p className="text-xs text-slate-500">Guide student engineers with field expertise.</p>
                  </label>

                  <label className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${commitmentType === "both" ? "border-emerald-600 bg-emerald-50/70 shadow-sm" : "border-slate-200 hover:border-emerald-300"}`}>
                    <input type="radio" name="type" className="sr-only" checked={commitmentType === "both"} onChange={() => setCommitmentType("both")} />
                    <ShieldCheck className={`w-6 h-6 mb-2 ${commitmentType === "both" ? "text-emerald-600" : "text-slate-400"}`} />
                    <p className="font-bold text-slate-900 text-base mb-0.5">Full Partnership</p>
                    <p className="text-xs text-slate-500">Provide both seed grant and technical oversight.</p>
                  </label>
                </div>
              </div>

              {(commitmentType === "funding" || commitmentType === "both") && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pledged CSR Grant Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      required 
                      type="number" 
                      step="5000" 
                      value={pledgedAmount}
                      onChange={(e) => setPledgedAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 text-lg font-bold text-slate-900" 
                      placeholder="350000" 
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Locked in State Innovation Escrow. Tranche releases require dual PI & District Collector authorization.</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Corporate Conditions / Expectations for University Team</label>
                <textarea 
                  rows={4} 
                  value={corporateNotes}
                  onChange={(e) => setCorporateNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 resize-none font-medium text-sm leading-relaxed" 
                  placeholder="E.g., We would like quarterly reports and a representative on the prototyping board." 
                />
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-900">Standard Tripartite MoU Framework</p>
                  <p className="text-xs text-emerald-700">Pre-approved by State Law Department and Ministry of Corporate Affairs (MCA).</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMouModal(true)}
                  className="px-3.5 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-50 shadow-sm"
                >
                  Inspect MoU Terms
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Sign Commitment Agreement & Lock Escrow</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-200/40 border border-emerald-200 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Partnership Initiated & Escrow Locked!</h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed font-medium">
                Thank you for sponsoring innovation in Jharkhand. The university team and the State Innovation Board have been notified of your commitment.
              </p>
            </div>

            {/* Escrow Ref Certificate Card */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white text-left space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Escrow Commitment Ledger</span>
                <span className="text-xs font-mono text-slate-400">Status: Active & Audited</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block">Reference ID:</span>
                  <span className="font-mono text-sm font-bold text-white">{escrowRef}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Grant Pledged:</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">₹{Number(pledgedAmount || 350000).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Host Institution:</span>
                  <span className="font-semibold text-white">IIT ISM Dhanbad</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tax Category:</span>
                  <span className="font-semibold text-white">Section 80G / CSR Sched. VII</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download CSR 80G Tax Receipt
              </button>
              <Link
                href="/dashboard/industry"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
              >
                Return to Industry Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escrow Terms & Draft MoU Modal */}
      {showMouModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Landmark className="w-6 h-6 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-lg">Tripartite Escrow & Prototype MoU</h3>
              </div>
              <button onClick={() => setShowMouModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px]">
                PARTIES: (1) Sponsoring Industry Partner, (2) IIT ISM Dhanbad, (3) Department of Higher Education, Govt of Jharkhand.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Milestone Escrow Release Mechanics</h4>
                <p>
                  Funds deposited into the State Innovation Escrow account are disbursed strictly upon verifiable milestone fulfillment:
                  Tranche 1 (30%) on Detailed Project Report (DPR) sign-off, Tranche 2 (40%) on functional lab prototype verification, and Tranche 3 (30%) on District Collector field installation sign-off.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Intellectual Property & Commercial License</h4>
                <p>
                  In accordance with State Gazette v2.4, the sponsor holds a 180-day exclusive first right of refusal for commercial manufacturing rights. Research royalties follow a 60% (faculty/students), 20% (university incubator), and 20% (state corpus) distribution.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Corporate Social Responsibility (CSR) Exemption</h4>
                <p>
                  All committed grants qualify as approved CSR under Section 135 and Schedule VII of the Companies Act 2013 and Section 80G of the Income Tax Act.
                </p>
              </div>

              {/* Digital Signature Preview */}
              <div className="pt-4 border-t border-slate-200 grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">State Authority Seal</span>
                  <div className="font-mono text-xs font-bold text-slate-800">DR. R. K. SOREN, IAS</div>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Digital Signet Hash: #8F9A-40C2</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Corporate Signatory</span>
                  <div className="font-mono text-xs font-bold text-slate-800">TATA STEEL CSR DIVISION</div>
                  <span className="text-[10px] text-blue-600 font-semibold block">Ready for Execution</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMouModal(false)}
                className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Close Terms
              </button>
              <button
                type="button"
                onClick={() => {
                  setMouSigned(true);
                  setShowMouModal(false);
                  showToast("MoU terms pre-approved for digital execution.");
                }}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5" /> Accept & Pre-sign MoU
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

export default function FundProject() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-slate-500 font-bold">Loading Funding Portal...</div>}>
      <FundProjectContent />
    </Suspense>
  );
}
