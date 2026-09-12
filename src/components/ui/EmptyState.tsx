import React from "react";
import Link from "next/link";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="p-12 text-center bg-white rounded-lg border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#13528A] hover:bg-[#0E3D66] text-white rounded-md text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#13528A] hover:bg-[#0E3D66] text-white rounded-md text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
