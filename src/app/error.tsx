"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, LayoutDashboard } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client exceptions
    console.error("[Platform Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white text-sm shadow-md">
              JH
            </div>
            <span>Jharkhand Societal Innovation Portal</span>
          </Link>
          <span className="text-xs font-mono text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full font-bold border border-rose-200">
            System Boundary Exception
          </span>
        </div>
      </header>

      {/* Main Error Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-center mx-auto text-rose-600 shadow-inner">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Temporary Platform Interruption
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              An unexpected execution error occurred while processing this component. The state exception has been logged for system administrators.
            </p>
            {error?.digest && (
              <p className="text-[11px] font-mono text-slate-400 bg-slate-100 py-1 px-3 rounded-lg inline-block">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry Component
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-400" /> Return to Portal
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        State Innovation Platform Security & Telemetry Service • Government of Jharkhand
      </footer>
    </div>
  );
}
