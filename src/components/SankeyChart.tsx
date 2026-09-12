"use client";

import React, { useState, useEffect } from "react";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";

export interface SankeyNode {
  name: string;
  color?: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color?: string;
}

export interface SankeyChartData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyChartProps {
  data?: SankeyChartData;
  title?: string;
  subtitle?: string;
  height?: number;
}

const DEFAULT_UX4G_DATA: SankeyChartData = {
  nodes: [
    // Source: Intake (0)
    { name: "Citizen Grievance Intake (100%)", color: "#13528A" },
    // Triage Branches (1, 2, 3)
    { name: "Track A: Innovation R&D (45%)", color: "#13528A" },
    { name: "Track B: Line Dept (35%)", color: "#0055A4" },
    { name: "Track C: Civic Fast-Track (20%)", color: "#F59E0B" },
    // Destinations (4, 5, 6, 7)
    { name: "University Lab DPRs", color: "#0E3D66" },
    { name: "Industry CSR Escrow", color: "#10B981" },
    { name: "Gov Engineering Works", color: "#3B82F6" },
    { name: "Panchayat Field Redressal", color: "#10B981" },
  ],
  links: [
    { source: 0, target: 1, value: 45, color: "rgba(19, 82, 138, 0.45)" },
    { source: 0, target: 2, value: 35, color: "rgba(0, 85, 164, 0.45)" },
    { source: 0, target: 3, value: 20, color: "rgba(245, 158, 11, 0.45)" },
    { source: 1, target: 4, value: 25, color: "rgba(14, 61, 102, 0.45)" },
    { source: 1, target: 5, value: 20, color: "rgba(16, 185, 129, 0.45)" },
    { source: 2, target: 6, value: 35, color: "rgba(59, 130, 246, 0.45)" },
    { source: 3, target: 7, value: 20, color: "rgba(16, 185, 129, 0.45)" },
  ],
};

// Accessible Custom Node
function CustomSankeyNode({ x, y, width, height, index, payload, containerWidth }: any) {
  const isOut = x + width + 6 > (containerWidth || 800) / 2;
  const nodeColor = payload?.color || "#13528A";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={nodeColor}
        fillOpacity="0.9"
        rx={4}
        ry={4}
        stroke="#FFFFFF"
        strokeWidth={1}
      />
      <text
        textAnchor={isOut ? "end" : "start"}
        x={isOut ? x - 6 : x + width + 6}
        y={y + height / 2}
        fontSize="12"
        fill="currentColor"
        className="text-slate-800 dark:text-slate-200 font-medium"
        dy="0.35em"
      >
        {payload.name}
      </text>
    </g>
  );
}

export function SankeyChart({
  data = DEFAULT_UX4G_DATA,
  title = "3-Track Problem Triage & Solution Flow (Sankey)",
  subtitle = "Visual representation of how citizen submissions flow through AI categorization, tri-track routing, and institutional resolution.",
  height = 360,
}: SankeyChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 shadow-sm space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Legend & Metrics Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-[#13528A]/10 text-[#13528A]">
          <span className="w-2 h-2 rounded-full bg-[#13528A]" />
          Track A: Innovation (45%)
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-[#0055A4]/10 text-[#0055A4]">
          <span className="w-2 h-2 rounded-full bg-[#0055A4]" />
          Track B: Line Dept (35%)
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B]">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          Track C: Civic Escalation (20%)
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-[#10B981]/10 text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          Resolution & Escrow
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="w-full overflow-x-auto min-h-[360px]" style={{ height }}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={data}
              node={<CustomSankeyNode />}
              nodePadding={24}
              margin={{ top: 20, right: 180, bottom: 20, left: 20 }}
              link={{ stroke: "rgba(19, 82, 138, 0.25)" }}
            >
              <Tooltip />
            </Sankey>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Loading triage flow diagram...
          </div>
        )}
      </div>
    </div>
  );
}

export default SankeyChart;
