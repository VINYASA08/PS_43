"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2, 
  Zap,
  Filter,
  BarChart3
} from "lucide-react";

export interface DistrictBottleneck {
  district: string;
  domain: string;
  avgResolutionDays: number;
  triageHours: number;
  isSlow: boolean;
  slaStatus: "BREACHED" | "WARNING" | "COMPLIANT";
}

export interface DomainBottleneck {
  domain: string;
  avgResolutionDays: number;
  triageHours: number;
  challengeCount: number;
}

interface BottleneckAnalyticsProps {
  districtBottlenecks: DistrictBottleneck[];
  domainBottlenecks: DomainBottleneck[];
  onExpediteDistrict?: (districtName: string) => void;
}

export function BottleneckAnalytics({
  districtBottlenecks,
  domainBottlenecks,
  onExpediteDistrict,
}: BottleneckAnalyticsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [chartView, setChartView] = useState<"triage" | "resolution" | "domain">("triage");
  const [slaFilter, setSlaFilter] = useState<"all" | "breached">("all");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtered district dataset
  const displayDistricts = districtBottlenecks.filter((d) => {
    if (slaFilter === "breached") return d.isSlow || d.slaStatus === "BREACHED";
    return true;
  });

  // Slowest districts identified for the alert banner
  const slowestDistricts = [...districtBottlenecks]
    .sort((a, b) => b.triageHours - a.triageHours)
    .slice(0, 4);

  // Custom tooltip for district charts
  const CustomDistrictTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DistrictBottleneck = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-white text-xs space-y-1">
          <div className="font-bold text-amber-400 text-sm border-b border-slate-800 pb-1">
            {data.district}
          </div>
          <div className="text-slate-300">
            Primary Sector: <span className="font-medium text-white">{data.domain}</span>
          </div>
          <div className="text-slate-300">
            Triage Speed: <span className="font-semibold text-amber-300">{data.triageHours} hrs</span>
          </div>
          <div className="text-slate-300">
            Avg Resolution: <span className="font-semibold text-white">{data.avgResolutionDays} days</span>
          </div>
          <div className="pt-1 flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                data.isSlow ? "bg-rose-500" : "bg-emerald-500"
              }`}
            />
            <span
              className={`font-bold ${
                data.isSlow ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {data.isSlow ? "SLA Breached (> 4.0h)" : "Statutory Compliant"}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for domain charts
  const CustomDomainTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DomainBottleneck = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-white text-xs space-y-1">
          <div className="font-bold text-amber-400 text-sm border-b border-slate-800 pb-1">
            {data.domain}
          </div>
          <div className="text-slate-300">
            Active Submissions: <span className="font-semibold text-white">{data.challengeCount}</span>
          </div>
          <div className="text-slate-300">
            Avg Resolution Delay: <span className="font-semibold text-amber-300">{data.avgResolutionDays} days</span>
          </div>
          <div className="text-slate-300">
            Triage Time: <span className="font-semibold text-white">{data.triageHours} hrs</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Slowest Districts Sovereign Alert Banner */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border border-rose-800/60 rounded-2xl p-5 shadow-sm text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600/30 rounded-xl border border-rose-500/50 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-lg text-white">
                  Bureaucratic Bottleneck Warning: Slowest Triaging Districts
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Apex Action Required
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Districts exceeding the state statutory 4.0-hour triage threshold require immediate master re-routing or line department diversion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">State SLA Benchmark:</span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-amber-400 border border-slate-700">
              4.0 Hours Max
            </span>
          </div>
        </div>

        {/* Slowest District Callout Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {slowestDistricts.map((d, index) => (
            <div
              key={d.district}
              className="bg-slate-900/90 border border-rose-900/50 hover:border-rose-700/80 p-3.5 rounded-xl transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm">{d.district}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                  #{index + 1} Slowest
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Triage Speed:</span>
                <span className="text-base font-extrabold text-rose-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {d.triageHours} hrs
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-xs text-slate-400">
                <span>Domain:</span>
                <span className="text-slate-300 truncate max-w-[120px]">{d.domain}</span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <button
                  onClick={() => onExpediteDistrict && onExpediteDistrict(d.district)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 px-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 border border-rose-500/30 rounded-lg transition-colors cursor-pointer group-hover:border-rose-400"
                >
                  Override & Expedite
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Recharts Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
        {/* Chart Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                District & Thematic Domain Bottleneck Telemetry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-axial comparison of bureaucratic intake delays vs civic resolution cycles
              </p>
            </div>
          </div>

          {/* Chart View Selector & Filter */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setChartView("triage")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  chartView === "triage"
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                District Triage Hours
              </button>
              <button
                onClick={() => setChartView("resolution")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  chartView === "resolution"
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                District Resolution Days
              </button>
              <button
                onClick={() => setChartView("domain")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  chartView === "domain"
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Thematic Domains
              </button>
            </div>

            {chartView !== "domain" && (
              <button
                onClick={() => setSlaFilter(slaFilter === "all" ? "breached" : "all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  slaFilter === "breached"
                    ? "bg-rose-50 border-rose-300 text-rose-700"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                {slaFilter === "breached" ? "Showing Breached Only" : "Show All Districts"}
              </button>
            )}
          </div>
        </div>

        {/* Recharts Canvas */}
        {!isMounted ? (
          <div className="h-[360px] flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <span className="text-xs font-medium">Loading interactive chart engine...</span>
          </div>
        ) : chartView === "triage" ? (
          /* Chart 1: District Triage Speed vs 4.0h SLA */
          <div className="h-[380px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayDistricts}
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="district"
                  tick={{ fontSize: 11, fill: "#475569" }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  label={{ value: "Hours to Triage", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  domain={[0, 8]}
                />
                <Tooltip content={<CustomDistrictTooltip />} />
                <ReferenceLine
                  y={4.0}
                  stroke="#e11d48"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: "4.0h SLA Benchmark",
                    position: "right",
                    fill: "#e11d48",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="triageHours" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {displayDistricts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.triageHours >= 4.0 ? "#e11d48" : "#10b981"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-600" />
                SLA Breached (&gt; 4.0h)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                SLA Compliant (&le; 4.0h)
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                - - - Statutory 4.0-Hour Limit
              </span>
            </div>
          </div>
        ) : chartView === "resolution" ? (
          /* Chart 2: District Resolution Days */
          <div className="h-[380px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayDistricts}
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="district"
                  tick={{ fontSize: 11, fill: "#475569" }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  label={{ value: "Average Resolution (Days)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip content={<CustomDistrictTooltip />} />
                <ReferenceLine
                  y={10.0}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: "10-Day Resolution Target",
                    position: "right",
                    fill: "#d97706",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="avgResolutionDays" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Chart 3: Thematic Domain Delays & Challenge Count */
          <div className="h-[380px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={domainBottlenecks}
                margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="domain" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis
                  yAxisId="left"
                  label={{ value: "Resolution Days", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Active Submissions", angle: 90, position: "insideRight", fontSize: 11, fill: "#64748b" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip content={<CustomDomainTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar
                  yAxisId="left"
                  dataKey="avgResolutionDays"
                  name="Avg Resolution Delay (Days)"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="challengeCount"
                  name="Active Submissions (Count)"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#2563eb" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
