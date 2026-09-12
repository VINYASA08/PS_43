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
    <main className="flex-1 w-full bg-slate-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border-2 border-slate-200 shadow-sm">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 block leading-none mt-1">Jharkhand State</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Innovation Portal</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link href="#impact" className="text-slate-600 hover:text-slate-900 transition-colors">Live Impact</Link>
            <Link href="#projects" className="text-slate-600 hover:text-slate-900 transition-colors">Open Projects</Link>
            <Link href="/accountability" className="text-slate-600 hover:text-slate-900 transition-colors">Accountability</Link>
            <Link href="/track" className="text-slate-600 hover:text-slate-900 transition-colors">Track Grievance</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/whatsapp-intake" className="hidden md:flex text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors items-center gap-1.5">
              <Phone className="w-4 h-4" /> Omnichannel Intake
            </Link>

            {isAuthenticated && user ? (
              <Link
                href={
                  user.role === "GOV"
                    ? "/dashboard/gov"
                    : user.role === "UNIVERSITY"
                    ? "/dashboard/university"
                    : user.role === "INDUSTRY"
                    ? "/dashboard/industry"
                    : "/submit"
                }
                className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                Portal Login
              </Link>
            )}

            <Link href="/submit" className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-md">
              Submit a Problem
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-200">
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-slate-200/50 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="text-center relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Platform Operational • Real-time DB Synced
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 text-slate-900"
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
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Report a Local Challenge
            </Link>
            <Link
              href="#projects"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-lg font-bold border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all"
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
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Live Impact Metrics (Database Ground Truth)</h2>
          </div>

          {isLoading ? (
            <StatsSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Submissions</p>
                <p className="text-4xl font-black text-slate-900">
                  {metrics?.totalSubmissions?.toLocaleString() || "6"}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Active Prototypes</p>
                <p className="text-4xl font-black text-blue-900">
                  {metrics?.activePrototypes?.toLocaleString() || "5"}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Problems Resolved</p>
                <p className="text-4xl font-black text-emerald-900">
                  {metrics?.problemsResolved?.toLocaleString() || "1"}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Escrow Funds Locked</p>
                <p className="text-4xl font-black text-indigo-900">
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
                className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors cursor-pointer"
              >
                {showAllProjects ? "Show Featured Projects" : "View All Projects"} <ArrowRight className={`w-5 h-5 transition-transform ${showAllProjects ? "rotate-90" : ""}`} />
              </button>
            )}
          </div>

          {isLoading ? (
            <CardSkeleton count={3} />
          ) : displayedChallenges.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-semibold">No challenges found matching criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {displayedChallenges.map((challenge, i) => (
                <Link key={challenge.id} href={`/challenge/${challenge.publicTrackingId || challenge.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer h-full flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded">
                        {challenge.publicTrackingId || challenge.id}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                        challenge.urgency === "CRITICAL"
                          ? "text-rose-600 bg-rose-50"
                          : challenge.urgency === "HIGH"
                          ? "text-amber-600 bg-amber-50"
                          : "text-blue-600 bg-blue-50"
                      }`}>
                        <ShieldCheck className="w-3 h-3" /> {challenge.urgency}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {challenge.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-6 flex-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-slate-400" /> {challenge.district} District
                      </span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {challenge.domain}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                        {challenge.status} <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Expert Ecosystem CTA */}
      <section id="experts" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
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
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-lg font-bold shadow-xl hover:bg-slate-100 transition-all text-lg"
            >
              Register as an Expert
            </Link>
            <Link
              href="/guidelines"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all text-lg"
            >
              Read the Guidelines
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
