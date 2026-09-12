import React from "react";

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="w-10 h-10 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-8 bg-slate-200 rounded w-32" />
          <div className="h-3 bg-slate-100 rounded w-44" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className="h-5 bg-slate-200 rounded w-28" />
            <div className="h-5 bg-slate-100 rounded w-16" />
          </div>
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="p-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="h-4 bg-slate-100 rounded flex-1"
                style={{ width: `${60 + ((colIdx * 17) % 35)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex gap-2">
          <div className="h-6 bg-slate-200 rounded-full w-24" />
          <div className="h-6 bg-slate-200 rounded-full w-20" />
        </div>
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="h-6 bg-slate-200 rounded w-40" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
          <div className="aspect-video bg-slate-200 rounded-2xl w-full" />
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-36" />
            <div className="h-12 bg-slate-100 rounded-xl w-full" />
            <div className="h-12 bg-slate-100 rounded-xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">
      <div className="h-8 bg-slate-200 rounded w-64 animate-pulse" />
      <StatsSkeleton count={4} />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
