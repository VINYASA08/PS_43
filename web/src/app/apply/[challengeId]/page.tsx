"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Users, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

export default function ApplyExpert() {
  const params = useParams();
  const challengeId = params.challengeId as string;
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [contribution, setContribution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await apiFetch(`/api/challenges/${challengeId}/apply`, {
        method: "POST",
        body: {
          name,
          email,
          linkedinUrl,
          proposalSummary: contribution,
        },
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Application error:", err);
      setErrorMsg(err.message || "Failed to submit expert application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pt-16">
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <Link href={`/challenge/${challengeId}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Challenge
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-xl mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 mb-2">Join Project Ecosystem</h1>
                  <p className="text-slate-500 font-medium">
                    Applying as an independent expert, scientist, or mentor for challenge <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">{challengeId}</span>
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name / Org Name</label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 text-sm"
                        placeholder="Dr. A. K. Sen or NGO Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 text-sm"
                        placeholder="mentor@isro-alumni.res.in"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">LinkedIn or Professional Profile</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 text-sm"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">How can you contribute?</label>
                    <textarea
                      required
                      rows={4}
                      value={contribution}
                      onChange={(e) => setContribution(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 resize-none text-sm"
                      placeholder="Describe your domain background, telemetry verification capability, or past deployments..."
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                      {isSubmitting ? "Submitting Application..." : "Submit Application to State Board"}
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
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Application Registered on State Ledger!</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Thank you for stepping up to mentor. The State Innovation Council and assigned institute will review your proposal.
                </p>
                <div className="pt-4">
                  <Link
                    href={`/challenge/${challengeId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    Return to Challenge Detail
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
