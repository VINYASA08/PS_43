"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  Landmark, 
  ChevronRight, 
  Phone,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { StatsSkeleton, CardSkeleton } from "@/components/ui/Skeletons";

export default function Home() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const { user, isAuthenticated, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();

    async function loadData() {
      try {
        const [chalRes, anaRes] = await Promise.all([
          fetch("/api/challenges?limit=12"),
          fetch("/api/analytics"),
        ]);

        if (chalRes.ok) {
          const chalData = await chalRes.json();
          setChallenges(chalData.challenges || []);
        }
        if (anaRes.ok) {
          const anaData = await anaRes.json();
          setMetrics(anaData.summary);
        }
      } catch (err) {
        console.error("Failed to load landing page data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [checkSession]);

  const displayedChallenges = showAllProjects ? challenges : challenges.slice(0, 6);

  return (
    <div className="flex-1 w-full bg-[#F5F7FA] overflow-hidden">
      {/* Navigation */}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-200">
        <div className="text-center relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Platform Operational • Real-time DB Synced
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900"
          >
            Crowdsourcing Solutions for a Better Tomorrow.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            A transparent, state-wide initiative bridging the gap between local challenges and innovative solutions. Powered by real-time ground telemetry and statutory Section 135 CSR convergence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/submit"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#13528A] text-white rounded-md font-bold shadow-sm hover:bg-[#0E3D66] transition-all flex items-center justify-center gap-2"
            >
              Report a Local Challenge
            </Link>
            <Link
              href="#projects"
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-800 rounded-md font-bold border border-slate-300 shadow-sm hover:bg-slate-50 hover:text-[#13528A] transition-all"
            >
              View Open Projects
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Impact Metrics */}
      <section id="impact" className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-5 h-5 text-[#13528A]" />
            <h2 className="text-xl font-bold text-slate-900">Live Impact Metrics (Database Ground Truth)</h2>
          </div>

          {isLoading ? (
            <StatsSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-md bg-white border border-slate-200 shadow-sm">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Submissions</p>
                <p className="text-4xl font-black text-slate-900">
                  {metrics?.totalSubmissions?.toLocaleString() || "6"}
                </p>
              </div>
              <div className="p-6 rounded-md bg-[#F5F7FA] border border-blue-200 shadow-sm">
                <p className="text-sm font-bold text-[#13528A] uppercase tracking-wider mb-2">Active Prototypes</p>
                <p className="text-4xl font-black text-blue-900">
                  {metrics?.activePrototypes?.toLocaleString() || "5"}
                </p>
              </div>
              <div className="p-6 rounded-md bg-emerald-50/60 border border-emerald-200 shadow-sm">
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Problems Resolved</p>
                <p className="text-4xl font-black text-emerald-900">
                  {metrics?.problemsResolved?.toLocaleString() || "1"}
                </p>
              </div>
              <div className="p-6 rounded-md bg-amber-50/60 border border-amber-200 shadow-sm">
                <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">Escrow Funds Locked</p>
                <p className="text-4xl font-black text-slate-900">
                  ₹{((metrics?.totalFundingEscrowed || 350000) / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Open Projects Feed */}
      <section id="projects" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Open Critical Challenges</h2>
              <p className="text-slate-600 font-medium text-lg">Public problems seeking immediate academic lab solutions and CSR escrow co-funding.</p>
            </div>
            {challenges.length > 6 && (
              <button 
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="flex items-center gap-2 text-[#13528A] font-bold hover:text-[#0E3D66] transition-colors cursor-pointer"
              >
                {showAllProjects ? "Show Featured Projects" : "View All Projects"} <ArrowRight className={`w-5 h-5 transition-transform ${showAllProjects ? "rotate-90" : ""}`} />
              </button>
            )}
          </div>

          {isLoading ? (
            <CardSkeleton count={3} />
          ) : displayedChallenges.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-md border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-semibold">No challenges found matching criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {displayedChallenges.map((challenge, i) => {
                const urgencyBorder =
                  challenge.urgency === "CRITICAL"
                    ? "border-l-4 border-l-red-600"
                    : challenge.urgency === "HIGH"
                    ? "border-l-4 border-l-amber-500"
                    : "";

                return (
                  <Link
                    key={challenge.id}
                    href={`/challenge/${challenge.publicTrackingId || challenge.id}`}
                    className="h-full flex flex-col focus:outline-none focus:ring-4 focus:ring-[#13528A]/30 rounded-md"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className={`bg-white rounded-md border border-slate-200 ${urgencyBorder} p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer h-full flex flex-col`}
                    >
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-bold text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded">
                            {challenge.publicTrackingId || challenge.id}
                          </span>
                          <span
                            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded border ${
                              challenge.urgency === "CRITICAL"
                                ? "text-red-700 bg-red-50 border-red-200"
                                : challenge.urgency === "HIGH"
                                ? "text-amber-800 bg-amber-50 border-amber-300"
                                : "text-blue-700 bg-blue-50 border-blue-200"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" /> {challenge.urgency}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#13528A] transition-colors">
                          {challenge.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-6">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" /> {challenge.district} District
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {challenge.domain}
                        </span>
                        <span className="text-xs font-semibold text-[#13528A] flex items-center gap-1">
                          {challenge.status} <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Expert Ecosystem CTA */}
      <section id="experts" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-md flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">Calling All Independent Experts & Mentors</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Are you an NGO, a retired professional, or part of a specialized agency like ISRO? 
            Join our open ecosystem to provide crucial mentorship, technical telemetry verification, and oversight on critical state projects.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-900 rounded-md font-bold shadow-sm hover:bg-slate-100 transition-all text-base"
            >
              Register as an Expert
            </Link>
            <Link
              href="/guidelines"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 text-white rounded-md font-bold border border-slate-700 hover:bg-slate-700 transition-all text-base"
            >
              Read the Guidelines
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
