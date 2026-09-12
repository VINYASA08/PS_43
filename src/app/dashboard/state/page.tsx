"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BarChart3, 
  GraduationCap, 
  ShieldAlert, 
  UserCheck, 
  Sliders, 
  RefreshCw, 
  AlertTriangle, 
  Building2, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { StateHeatmap, DistrictMetric } from "./components/StateHeatmap";
import { BottleneckAnalytics, DistrictBottleneck, DomainBottleneck } from "./components/BottleneckAnalytics";
import { UniversityLeaderboard, UniversityRankItem } from "./components/UniversityLeaderboard";
import { FinancialCommand, SectorEscrowItem, FinancialTrendItem } from "./components/FinancialCommand";
import { MasterOverridePanel } from "./components/MasterOverridePanel";
import { UserManagementPanel } from "./components/UserManagementPanel";
import { AiOversightPanel, AiOversightData } from "./components/AiOversightPanel";
import { StateChecklistCard } from "@/components/guidance/Layer5_DashboardChecklists/StateChecklistCard";

export type StateDashboardTab = 
  | "overview" 
  | "heatmap" 
  | "bottlenecks" 
  | "leaderboard" 
  | "override" 
  | "users" 
  | "oversight";

interface StateAnalyticsResponse {
  success: boolean;
  summary: {
    totalChallenges: number;
    activeBottlenecks: number;
    totalCsrPledged: number;
    totalCsrDisbursed: number;
    escrowBalance: number;
    activeUniversities: number;
    aiRoutingAccuracy: number;
    districtsMonitored: number;
    pendingIndustryApprovals: number;
  };
  districtHeatmap: DistrictMetric[];
  bottlenecks: DistrictBottleneck[];
  domainBottlenecks: DomainBottleneck[];
  universityLeaderboard: UniversityRankItem[];
  financialEscrow: SectorEscrowItem[];
  financialTrend: FinancialTrendItem[];
  aiOversight: AiOversightData;
}

function StateDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab") as StateDashboardTab | null;
  const [activeTab, setActiveTab] = useState<StateDashboardTab>(rawTab || "overview");
  const [overrideDistrictFilter, setOverrideDistrictFilter] = useState<string>("All");

  // Keep state in sync with URL search params
  useEffect(() => {
    if (rawTab) {
      setActiveTab(rawTab);
    }
  }, [rawTab]);

  const handleTabChange = (tab: StateDashboardTab) => {
    setActiveTab(tab);
    router.push(`/dashboard/state?tab=${tab}`, { scroll: false });
  };

  // State data
  const [data, setData] = useState<StateAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<StateAnalyticsResponse>("/api/state/analytics");
      if (res && res.success) {
        setData(res);
      } else {
        throw new Error("Failed to load state analytics data.");
      }
    } catch (err: any) {
      console.error("State Dashboard Load Error:", err);
      setError(err.message || "Failed to load state analytics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigate to Master Override with preselected district
  const handleSelectDistrictForOverride = (districtName: string) => {
    setOverrideDistrictFilter(districtName);
    handleTabChange("override");
  };

  const tabs = [
    { id: "overview" as const, label: "Apex Command", icon: LayoutDashboard },
    { id: "heatmap" as const, label: "GIS Heatmap (24 Districts)", icon: MapIcon },
    { id: "bottlenecks" as const, label: "Bottleneck Analytics", icon: BarChart3 },
    { id: "leaderboard" as const, label: "University Leaderboard", icon: GraduationCap },
    { id: "override" as const, label: "Master Overrides", icon: ShieldAlert },
    { id: "users" as const, label: "Industry Approvals", icon: UserCheck, badge: data?.summary.pendingIndustryApprovals },
    { id: "oversight" as const, label: "Financial & AI Oversight", icon: Sliders },
  ];

  if (isLoading && !data) {
    return <StateDashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="p-3 bg-rose-100 text-rose-700 rounded-full w-fit mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-rose-900">Failed to Connect to State Command Center</h3>
        <p className="text-xs text-rose-700">{error}</p>
        <button
          onClick={() => fetchData()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const summary = data?.summary || {
    totalChallenges: 142,
    activeBottlenecks: 4,
    totalCsrPledged: 18500000,
    totalCsrDisbursed: 9200000,
    escrowBalance: 9300000,
    activeUniversities: 14,
    aiRoutingAccuracy: 94.6,
    districtsMonitored: 24,
    pendingIndustryApprovals: 0,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* State Apex Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 border border-slate-700/80 rounded-2xl p-6 shadow-md text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg border border-amber-300/40">
              JH
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  State-Level God-Mode Command Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 shadow-xs border border-amber-300">
                  Apex Sovereign Authority
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Chief Secretary &bull; State Innovation Council &bull; Real-time cross-district telemetry & master override gate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Sync State Telemetry
            </button>
            <button
              onClick={() => handleTabChange("override")}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              Master Override
            </button>
          </div>
        </div>

        {/* Executive Statewide KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Statewide Submissions</div>
            <div className="text-xl font-black text-white mt-0.5 flex items-baseline gap-1.5">
              {summary.totalChallenges}
              <span className="text-[10px] text-amber-400 font-semibold">24 Districts</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">SLA Bottlenecks</div>
            <div className="text-xl font-black text-rose-400 mt-0.5 flex items-baseline gap-1.5">
              {summary.activeBottlenecks}
              <span className="text-[10px] text-slate-400 font-normal">&gt; 4.0h Triage</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">CSR Capital Deployed</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              ₹{(summary.totalCsrDisbursed / 10000000).toFixed(2)} Cr
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">AI Routing Accuracy</div>
            <div className="text-xl font-black text-blue-400 mt-0.5 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              {summary.aiRoutingAccuracy}%
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">Pending Industry KYC</div>
            <div className="text-xl font-black text-amber-300 mt-0.5 flex items-baseline gap-1.5">
              {summary.pendingIndustryApprovals}
              <span className="text-[10px] text-slate-400 font-normal">Awaiting Signoff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 5: Persistent Statewide Governance & Statutory Oversight Checklist */}
      <StateChecklistCard />

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT VIEWPORTS */}

      {/* 1. APEX OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* GIS Map Preview */}
          {data && (
            <StateHeatmap
              districts={data.districtHeatmap}
              onSelectDistrictForOverride={handleSelectDistrictForOverride}
            />
          )}

          {/* Quick Dual Analytics Previews (Bottlenecks & Leaderboard) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-rose-600" />
                    Bottleneck Telemetry Preview
                  </h3>
                  <button
                    onClick={() => handleTabChange("bottlenecks")}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    Deep Analytics <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <BottleneckAnalytics
                  districtBottlenecks={data.bottlenecks}
                  domainBottlenecks={data.domainBottlenecks}
                  onExpediteDistrict={handleSelectDistrictForOverride}
                />
              </div>
            )}

            {data && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    University Leaderboard Preview
                  </h3>
                  <button
                    onClick={() => handleTabChange("leaderboard")}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    Full Rankings <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <UniversityLeaderboard
                  universities={data.universityLeaderboard}
                  onAssignToUniversity={() => handleTabChange("override")}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GIS HEATMAP TAB */}
      {activeTab === "heatmap" && data && (
        <StateHeatmap
          districts={data.districtHeatmap}
          onSelectDistrictForOverride={handleSelectDistrictForOverride}
        />
      )}

      {/* 3. BOTTLENECK ANALYTICS TAB */}
      {activeTab === "bottlenecks" && data && (
        <BottleneckAnalytics
          districtBottlenecks={data.bottlenecks}
          domainBottlenecks={data.domainBottlenecks}
          onExpediteDistrict={handleSelectDistrictForOverride}
        />
      )}

      {/* 4. UNIVERSITY LEADERBOARD TAB */}
      {activeTab === "leaderboard" && data && (
        <UniversityLeaderboard
          universities={data.universityLeaderboard}
          onAssignToUniversity={() => handleTabChange("override")}
        />
      )}

      {/* 5. MASTER OVERRIDES TAB */}
      {activeTab === "override" && (
        <MasterOverridePanel initialDistrictFilter={overrideDistrictFilter} />
      )}

      {/* 6. USER & ADMIN MANAGEMENT TAB */}
      {activeTab === "users" && <UserManagementPanel />}

      {/* 7. FINANCIAL & AI OVERSIGHT TAB */}
      {activeTab === "oversight" && data && (
        <div className="space-y-8">
          <FinancialCommand
            financialEscrow={data.financialEscrow}
            financialTrend={data.financialTrend}
            totalCsrPledged={data.summary.totalCsrPledged}
            totalCsrDisbursed={data.summary.totalCsrDisbursed}
            escrowBalance={data.summary.escrowBalance}
          />

          <AiOversightPanel initialData={data.aiOversight} />
        </div>
      )}
    </div>
  );
}

function StateDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="h-36 bg-slate-200 rounded-2xl" />
      <div className="h-12 bg-slate-200 rounded-2xl w-2/3" />
      <div className="h-96 bg-slate-200 rounded-2xl" />
    </div>
  );
}

export default function StateDashboardPage() {
  return (
    <Suspense fallback={<StateDashboardSkeleton />}>
      <StateDashboardContent />
    </Suspense>
  );
}
