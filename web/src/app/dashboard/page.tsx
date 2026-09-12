"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  ExternalLink,
  Layers,
  FileCheck
} from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeletons";

export default function CentralDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentChallenges, setRecentChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [anaRes, chalRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/challenges?limit=5"),
        ]);

        if (anaRes.ok) {
          const anaData = await anaRes.json();
          setMetrics(anaData.summary);
        }

        if (chalRes.ok) {
          const chalData = await chalRes.json();
          setRecentChallenges(chalData.challenges || []);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const portals = [
    {
      id: "gov",
      title: "Government Portal",
      subtitle: "State Administrative Console",
      description: "Monitor state-wide challenge intake, oversee AI triage clustering, track SLA resolution velocity, and coordinate inter-departmental clearances.",
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      href: "/dashboard/gov",
      roleBadge: "State Nodal Authority",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      accentBg: "bg-blue-50/70 border-blue-200 hover:border-blue-400",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
      stats: [
        { label: "Total Intake", value: metrics?.totalSubmissions || "6" },
        { label: "Active Triages", value: metrics?.activePrototypes || "5" },
        { label: "SLA Adherence", value: `${metrics?.slaCompliance || 94.2}%` },
        { label: "Districts", value: "24" },
      ],
    },
    {
      id: "university",
      title: "University Portal",
      subtitle: "Academic & R&D Innovation Hub",
      description: "Review AI-routed citizen problems, form interdisciplinary faculty-student teams, submit technical solution proposals, and request prototype funding.",
      icon: <GraduationCap className="w-8 h-8 text-indigo-600" />,
      href: "/dashboard/university",
      roleBadge: "Higher Education & Labs",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      accentBg: "bg-indigo-50/70 border-indigo-200 hover:border-indigo-400",
      btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
      stats: [
        { label: "Open RFPs", value: metrics?.totalSubmissions || "6" },
        { label: "Submitted Proposals", value: metrics?.activeProposals || "4" },
        { label: "Lead Center", value: "IIT ISM" },
        { label: "Partner Labs", value: "8" },
      ],
    },
    {
      id: "industry",
      title: "Industry Portal",
      subtitle: "Corporate CSR & Mentorship Hub",
      description: "Discover verified academic prototypes, pledge milestone-locked CSR grants through state escrow, and mentor young engineers.",
      icon: <Briefcase className="w-8 h-8 text-emerald-600" />,
      href: "/dashboard/industry",
      roleBadge: "Corporate & Mentors",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      accentBg: "bg-emerald-50/70 border-emerald-200 hover:border-emerald-400",
      btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
      stats: [
        { label: "Open Proposals", value: metrics?.activeProposals || "4" },
        { label: "CSR Committed", value: `₹${((metrics?.totalFundingEscrowed || 350000) / 100000).toFixed(1)}L` },
        { label: "Active Mentors", value: metrics?.engagedExperts || "89" },
        { label: "Section 135", value: "Schedule VII" },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Top Welcome & Navigation Router Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-100/60 via-indigo-100/30 to-transparent rounded-bl-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5 text-indigo-600" /> Platform Multi-Tenant Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Central Innovation Console
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-3xl font-medium leading-relaxed mb-6">
            Welcome to the Jharkhand State Innovation Portal router. Select your designated operational portal below or review live throughput metrics synchronized with the state database.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors border border-slate-200"
            >
              <Search className="w-4 h-4 text-blue-600" />
              Citizen Issue Tracker
            </Link>
            <Link
              href="/guidelines"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors border border-slate-200"
            >
              <FileCheck className="w-4 h-4 text-indigo-600" />
              IP & Escrow Guidelines
            </Link>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors border border-slate-200"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Platform Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Operating Portal</h2>
            <p className="text-sm text-slate-500 font-medium">Switch roles or dive into designated functional workspace</p>
          </div>
        </div>

        {isLoading ? (
          <CardSkeleton count={3} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {portals.map((portal, index) => (
              <motion.div
                key={portal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-3xl border p-7 flex flex-col justify-between transition-all duration-200 bg-white hover:shadow-xl ${portal.accentBg}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-slate-100">
                      {portal.icon}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${portal.badgeColor}`}>
                      {portal.roleBadge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-0.5">{portal.title}</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{portal.subtitle}</p>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6">
                    {portal.description}
                  </p>

                  {/* Quick stats mini-grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white/80 border border-slate-200/80 mb-6">
                    {portal.stats.map((stat, i) => (
                      <div key={i} className="px-2 py-1">
                        <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">{stat.label}</span>
                        <span className="text-base font-black text-slate-900">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={portal.href}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${portal.btnColor}`}
                >
                  Launch {portal.title} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Active Challenges Summary Feed */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Active High-Priority Challenges Across Portals</h2>
          </div>
          <Link href="/#projects" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View Public Board <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentChallenges.map((challenge) => (
            <Link
              key={challenge.id}
              href={`/challenge/${challenge.publicTrackingId || challenge.id}`}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50 px-3 -mx-3 rounded-xl transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {challenge.publicTrackingId || challenge.id}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    challenge.urgency === "CRITICAL"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {challenge.urgency}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {challenge.domain}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {challenge.title}
                </h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 font-semibold">
                  {challenge.assignedInstitute || challenge.district || "Pending Assignment"}
                </span>
                <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Examine <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
