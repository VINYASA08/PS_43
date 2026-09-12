"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { 
  IndianRupee, 
  ShieldCheck, 
  TrendingUp, 
  Wallet, 
  Lock, 
  Clock,
  CheckCircle2, 
  AlertCircle, 
  PieChart, 
  FileText,
  Building2,
  ArrowUpRight
} from "lucide-react";

export interface SectorEscrowItem {
  domain: string;
  pledged: number;
  escrowed: number;
  disbursed: number;
}

export interface FinancialTrendItem {
  month: string;
  pledged: number;
  disbursed: number;
}

interface FinancialCommandProps {
  financialEscrow: SectorEscrowItem[];
  financialTrend: FinancialTrendItem[];
  totalCsrPledged: number;
  totalCsrDisbursed: number;
  escrowBalance: number;
}

export function FinancialCommand({
  financialEscrow,
  financialTrend,
  totalCsrPledged,
  totalCsrDisbursed,
  escrowBalance,
}: FinancialCommandProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [chartMode, setChartMode] = useState<"sector" | "trend">("sector");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format Crores
  const formatCrores = (val: number) => {
    const cr = val / 10000000;
    return `₹${cr.toFixed(2)} Cr`;
  };

  // Escrow Health Ratio: percentage of escrow capital successfully backed or deployed
  const escrowHealthRatio = totalCsrPledged > 0
    ? Math.round((totalCsrDisbursed / totalCsrPledged) * 100)
    : 49;

  // Custom Sector Tooltip
  const CustomSectorTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: SectorEscrowItem = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-white text-xs space-y-1">
          <div className="font-bold text-amber-400 text-sm border-b border-slate-800 pb-1">
            {data.domain}
          </div>
          <div className="text-slate-300">
            Total Pledged: <span className="font-bold text-white">{formatCrores(data.pledged)}</span>
          </div>
          <div className="text-slate-300">
            Held in Escrow: <span className="font-bold text-blue-400">{formatCrores(data.escrowed)}</span>
          </div>
          <div className="text-slate-300">
            Disbursed to Universities: <span className="font-bold text-emerald-400">{formatCrores(data.disbursed)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Trend Tooltip
  const CustomTrendTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: FinancialTrendItem = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-white text-xs space-y-1">
          <div className="font-bold text-amber-400 text-sm border-b border-slate-800 pb-1">
            {data.month} Cumulative
          </div>
          <div className="text-slate-300">
            Pledged Capital: <span className="font-bold text-amber-300">₹{data.pledged} Cr</span>
          </div>
          <div className="text-slate-300">
            Disbursed to Prototypes: <span className="font-bold text-emerald-400">₹{data.disbursed} Cr</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total CSR Pledged */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total CSR Pledged
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCrores(totalCsrPledged)}
            </div>
            <div className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Corporate Commitments under Sec 135
            </div>
          </div>
        </div>

        {/* In Escrow Balance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Held in State Escrow
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-blue-600">
              {formatCrores(escrowBalance)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Guaranteed Tranche Release Account
            </div>
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Capital Disbursed
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-600">
              {formatCrores(totalCsrDisbursed)}
            </div>
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Direct to University R&D Labs
            </div>
          </div>
        </div>

        {/* Escrow Health Ratio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Escrow Health Ratio
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-2">
              {escrowHealthRatio}%
              <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                Grade AAA
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              100% Escrow Collateral Backing
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                CSR Escrow Capital Command & Sector Flow
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory audit of corporate CSR commitments, active escrow vaults, and milestone releases
              </p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setChartMode("sector")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                chartMode === "sector"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              By Sector (Pledged vs Disbursed)
            </button>
            <button
              onClick={() => setChartMode("trend")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                chartMode === "trend"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cumulative Disbursement Trend
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        {!isMounted ? (
          <div className="h-[340px] flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <span className="text-xs font-medium">Loading financial charts...</span>
          </div>
        ) : chartMode === "sector" ? (
          <div className="h-[360px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financialEscrow}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="domain" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis
                  label={{ value: "Amount (₹)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip content={<CustomSectorTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar
                  dataKey="pledged"
                  name="CSR Pledged"
                  fill="#d97706"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="escrowed"
                  name="In Escrow Vault"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="disbursed"
                  name="Disbursed to Universities"
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
              <AreaChart
                data={financialTrend}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="pledgedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="disbursedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis
                  label={{ value: "Crores (₹ Cr)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip content={<CustomTrendTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area
                  type="monotone"
                  dataKey="pledged"
                  name="Cumulative Pledged (₹ Cr)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pledgedGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="disbursed"
                  name="Cumulative Disbursed (₹ Cr)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#disbursedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tranche Release Compliance Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              State CSR Escrow Tranche Architecture
            </h4>
          </div>
          <span className="text-xs text-slate-500">Companies Act 2013 § 135 Compliant</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                Tranche 1 (30%)
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% On-Time
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Project Kickoff & DPR Sanction</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Disbursed immediately upon tripartite signoff (DNO, University Dean, and Industry Sponsor).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Tranche 2 (40%)
              </span>
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                TRL-5 Gate
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Lab Prototype Validation</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Released upon dual mentor signoff and verified lab test report submission.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Tranche 3 (30%)
              </span>
              <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Field Handover
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Municipal Commissioning</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Disbursed when the physical solution is deployed in the target panchayat or district site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
