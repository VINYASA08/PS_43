"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight, ShieldAlert, AlertTriangle, CheckCircle } from "lucide-react";

export interface ProblemCardProps {
  id: string;
  publicTrackingId?: string;
  title: string;
  description: string;
  domain: string;
  district: string;
  location?: string;
  urgency?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  track?: "TRACK_A_INNOVATION" | "TRACK_B_STANDARD" | "TRACK_C_CIVIC" | string;
  status?: string;
  createdAt?: string | Date;
  assignedInstitute?: string | null;
  onActionClick?: (id: string) => void;
  actionLabel?: string;
  viewHref?: string;
}

export function ProblemCard({
  id,
  publicTrackingId,
  title,
  description,
  domain,
  district,
  location,
  urgency = "HIGH",
  track,
  status = "REPORTED",
  createdAt,
  assignedInstitute,
  onActionClick,
  actionLabel,
  viewHref,
}: ProblemCardProps) {
  const urgencyUpper = (urgency || "MEDIUM").toUpperCase();

  const getPriorityBadge = () => {
    switch (urgencyUpper) {
      case "CRITICAL":
        return {
          bg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800/40",
          icon: <ShieldAlert className="w-3.5 h-3.5 text-red-700 dark:text-red-300 shrink-0" />,
          label: "Critical Urgency",
        };
      case "HIGH":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300 shrink-0" />,
          label: "High Urgency",
        };
      case "LOW":
      case "MEDIUM":
      default:
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/30",
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300 shrink-0" />,
          label: `${urgencyUpper} Urgency`,
        };
    }
  };

  const getUrgencyBorderClass = () => {
    switch (urgencyUpper) {
      case "CRITICAL":
        return "border-l-4 border-l-red-600 dark:border-l-red-500";
      case "HIGH":
        return "border-l-4 border-l-amber-500 dark:border-l-amber-400";
      case "MEDIUM":
      case "LOW":
      default:
        return "";
    }
  };

  const priority = getPriorityBadge();
  const href = viewHref || `/challenge/${id}`;
  const effectiveActionLabel = actionLabel || (status ? `${status} >` : "View Challenge");

  return (
    <article
      aria-labelledby={`problem-title-${id}`}
      className={`h-full bg-white dark:bg-slate-900 border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between focus-within:ring-4 focus-within:ring-[rgba(19,82,138,0.3)] ${getUrgencyBorderClass()}`}
    >
      <div className="flex-1 flex flex-col">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-bold ${priority.bg}`}>
              {priority.icon}
              <span>{priority.label}</span>
            </span>

            {publicTrackingId && (
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-[var(--radius-sm)]">
                {publicTrackingId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {district}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 id={`problem-title-${id}`} className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer & Actions — strictly bottom aligned with mt-auto */}
      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-3 mt-auto">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-[#13528A]/10 text-[#13528A] dark:text-blue-300">
            {domain}
          </span>
          {location && (
            <span className="truncate max-w-[180px]" title={location}>
              {location}
            </span>
          )}
          {assignedInstitute && (
            <span className="text-[#13528A] font-medium truncate max-w-[140px]" title={assignedInstitute}>
              • {assignedInstitute}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onActionClick ? (
            <button
              type="button"
              onClick={() => onActionClick(id)}
              className="min-h-[44px] min-w-[44px] px-4 py-2.5 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-xs font-bold bg-[#13528A] hover:bg-[#0E3D66] text-white transition-colors focus:outline-none focus:ring-4 focus:ring-[rgba(19,82,138,0.3)] cursor-pointer"
            >
              <span>{effectiveActionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={href}
              className="min-h-[44px] min-w-[44px] px-4 py-2.5 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-xs font-bold bg-[#13528A] hover:bg-[#0E3D66] text-white transition-colors focus:outline-none focus:ring-4 focus:ring-[rgba(19,82,138,0.3)] cursor-pointer"
              aria-label={`${effectiveActionLabel}: ${title}`}
            >
              <span>{effectiveActionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProblemCard;
