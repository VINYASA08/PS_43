"use client";

import React, { useMemo } from "react";
import { StateHeatmap, DistrictMetric } from "@/app/dashboard/state/components/StateHeatmap";
import { JHARKHAND_DISTRICTS } from "@/lib/constants";

export interface HeatmapProps {
  districts?: DistrictMetric[];
  title?: string;
  subtitle?: string;
  onSelectDistrict?: (districtName: string) => void;
  isLoading?: boolean;
}

export function Heatmap({
  districts,
  title = "Jharkhand 24-District Societal GIS Heatmap",
  subtitle = "Real-time geographic distribution of societal challenges, triage speed, and CSR deployment across Jharkhand.",
  onSelectDistrict,
  isLoading = false,
}: HeatmapProps) {
  // Synthesize default 24-district metrics if none provided
  const activeDistricts = useMemo(() => {
    if (districts && districts.length > 0) return districts;

    return JHARKHAND_DISTRICTS.map((name, index) => {
      const challenges = 10 + ((index * 7 + 13) % 45);
      const density: "critical" | "high" | "medium" | "low" =
        challenges > 40 ? "critical" : challenges > 25 ? "high" : challenges > 15 ? "medium" : "low";

      return {
        id: dist-,
        name,
        division: index < 5 ? "South Chotanagpur" : index < 10 ? "North Chotanagpur" : index < 15 ? "Santhal Pargana" : index < 20 ? "Kolhan" : "Palamu",
        challenges,
        density,
        avgResolutionDays: 14 + (index % 12),
        triageHours: 6 + (index % 18),
        activeBuilds: 2 + (index % 6),
        csrDeployedCr: 1.2 + (index % 5) * 0.8,
        civicBacklogCount: 3 + (index % 8),
        complaintsLogged: challenges * 2,
        complaintsResolved: Math.floor(challenges * 1.6),
        nodalOfficer: {
          name: Nodal Officer ,
          designation: "District Innovation Nodal Officer",
          email: 
odal.@jharkhand.gov.in,
          phone: +91 94311 ,
          dscVerified: true,
        },
      } as DistrictMetric;
    });
  }, [districts]);

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

      <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)]">
        <StateHeatmap
          districts={activeDistricts}
          onSelectDistrictForOverride={onSelectDistrict}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default Heatmap;
