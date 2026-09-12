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
  Legend,
  Cell,
} from "recharts";
import { 
  GraduationCap, 
  Trophy, 
  Award, 
  IndianRupee, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Star
} from "lucide-react";

export interface UniversityRankItem {
  rank: number;
  name: string;
  claimed: number;
  fundingSecured: number;
  successfulHandovers: number;
  graiScore: number;
}

interface UniversityLeaderboardProps {
  universities: UniversityRankItem[];
  onAssignToUniversity?: (universityName: string) => void;
}

export function UniversityLeaderboard({
  universities,
  onAssignToUniversity,
}: UniversityLeaderboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [metricView, setMetricView] = useState<"projects" | "funding">("projects");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtered universities
  const filteredUniversities = universities.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recharts custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: UniversityRankItem = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-white text-xs space-y-1.5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">
              #{data.rank}
            </span>
            <span className="font-bold text-white text-sm">{data.name}</span>
          </div>
          <div className="text-slate-300">
            Challenges Claimed: <span className="font-bold text-white">{data.claimed}</span>
          </div>
          <div className="text-slate-300">
            Successful Handovers: <span className="font-bold text-emerald-400">{data.successfulHandovers}</span>
          </div>
          <div className="text-slate-300">
            CSR Funding Secured: <span className="font-bold text-amber-400">₹{(data.fundingSecured / 100000).toFixed(1)} Lakhs</span>
          </div>
          <div className="text-slate-300">
            GRAI Score: <span className="font-bold text-indigo-400">{data.graiScore}/100</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Format funding in Indian Lakhs
  const formatLakhs = (val: number) => `₹${(val / 100000).toFixed(1)}L`;

  // Top 3 Podium
  const top1 = universities[0];
  const top2 = universities[1];
  const top3 = universities[2];

  return (
    <div className="space-y-6">
      {/* Top 3 Academic Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rank 2 (Silver) */}
        {top2 && (
          <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between order-2 md:order-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-200/40 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  Rank #2 Silver
                </span>
                <span className="text-xs font-semibold text-slate-500">GRAI {top2.graiScore}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mt-3">{top2.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Empanelled Higher Education Institute</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">Claimed</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{top2.claimed}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Delivered</div>
                <div className="font-bold text-emerald-600 text-sm mt-0.5">{top2.successfulHandovers}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Funding</div>
                <div className="font-bold text-amber-600 text-sm mt-0.5">{formatLakhs(top2.fundingSecured)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Rank 1 (Gold Apex) */}
        {top1 && (
          <div className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-400 rounded-2xl p-5 shadow-md flex flex-col justify-between order-1 md:order-2 relative overflow-hidden ring-4 ring-amber-400/20">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 shadow-xs">
                  <Trophy className="w-3.5 h-3.5" />
                  Apex Leader #1 Gold
                </span>
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  GRAI {top1.graiScore}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg mt-3">{top1.name}</h4>
              <p className="text-xs text-amber-900/80 font-medium mt-0.5">Top State Research Performer</p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-slate-500 text-[10px] font-medium">Claimed</div>
                <div className="font-extrabold text-slate-900 text-base mt-0.5">{top1.claimed}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-medium">Delivered</div>
                <div className="font-extrabold text-emerald-600 text-base mt-0.5">{top1.successfulHandovers}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-medium">CSR Deployed</div>
                <div className="font-extrabold text-amber-700 text-base mt-0.5">{formatLakhs(top1.fundingSecured)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Rank 3 (Bronze) */}
        {top3 && (
          <div className="bg-gradient-to-b from-orange-50/50 to-white border border-orange-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between order-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/40 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                  <Award className="w-3.5 h-3.5 text-orange-600" />
                  Rank #3 Bronze
                </span>
                <span className="text-xs font-semibold text-slate-500">GRAI {top3.graiScore}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mt-3">{top3.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Empanelled Technology Institute</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">Claimed</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{top3.claimed}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Delivered</div>
                <div className="font-bold text-emerald-600 text-sm mt-0.5">{top3.successfulHandovers}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Funding</div>
                <div className="font-bold text-amber-600 text-sm mt-0.5">{formatLakhs(top3.fundingSecured)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Recharts Ranking Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Empanelled University Performance Benchmark
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of claimed challenges, prototype handovers, and CSR funds deployed
              </p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setMetricView("projects")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                metricView === "projects"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Claims & Handovers
            </button>
            <button
              onClick={() => setMetricView("funding")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                metricView === "funding"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              CSR Funding Secured
            </button>
          </div>
        </div>

        {/* Recharts Canvas */}
        {!isMounted ? (
          <div className="h-[340px] flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <span className="text-xs font-medium">Loading leaderboard charts...</span>
          </div>
        ) : metricView === "projects" ? (
          <div className="h-[360px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={universities}
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#475569" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  label={{ value: "Count of Challenges", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar
                  dataKey="claimed"
                  name="Challenges Claimed"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="successfulHandovers"
                  name="Prototypes Delivered"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[360px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={universities}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#475569" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  label={{ value: "CSR Funding (₹ Lakhs)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="fundingSecured"
                  name="CSR Funding Secured"
                  fill="#d97706"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Comprehensive Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Statewide Academic Institutional Ranks
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Empanelled universities evaluated by research accountability and grassroots prototype delivery
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">University / Institute</th>
                <th className="py-3.5 px-4 text-center">Claimed</th>
                <th className="py-3.5 px-4 text-center">Handovers</th>
                <th className="py-3.5 px-4 text-right">Funding Secured</th>
                <th className="py-3.5 px-4 text-center">GRAI Score</th>
                <th className="py-3.5 px-4 text-right">Apex Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUniversities.map((uni) => (
                <tr key={uni.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                        uni.rank === 1
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : uni.rank === 2
                          ? "bg-slate-200 text-slate-800"
                          : uni.rank === 3
                          ? "bg-orange-100 text-orange-900"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {uni.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{uni.name}</div>
                    <div className="text-[11px] text-slate-400">Jharkhand State Empanelled Partner</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-900">
                    {uni.claimed}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" />
                      {uni.successfulHandovers}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                    ₹{(uni.fundingSecured / 100000).toFixed(1)} Lakhs
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 text-[11px]">
                      <ShieldCheck className="w-3 h-3" />
                      {uni.graiScore}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onAssignToUniversity && onAssignToUniversity(uni.name)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Force-Assign
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
