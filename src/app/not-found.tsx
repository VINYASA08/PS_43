import Link from "next/link";
import { Compass, Home, LayoutDashboard, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm shadow-md">
              JH
            </div>
            <span>Jharkhand Societal Innovation Portal</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Public Portal
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center mx-auto text-blue-600 shadow-inner">
            <Compass className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">
              Error 404 • Resource Not Found
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Page Lost in State Network
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              The statutory ledger record, citizen grievance, or dashboard view you are attempting to reach does not exist or has been archived.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm text-left space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Suggested Navigation Pathways
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <Link
                href="/"
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold border border-transparent hover:border-slate-200 transition-all"
              >
                <Home className="w-4 h-4 text-slate-400" /> Public Homepage
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold border border-transparent hover:border-slate-200 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" /> Authorized Dashboard
              </Link>
              <Link
                href="/track"
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold border border-transparent hover:border-slate-200 transition-all"
              >
                <Search className="w-4 h-4 text-emerald-600" /> Track Grievance
              </Link>
              <Link
                href="/guidelines"
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold border border-transparent hover:border-slate-200 transition-all"
              >
                <Compass className="w-4 h-4 text-indigo-600" /> State Gazette & FAQs
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Portal Home
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all text-center"
            >
              Open Workspace
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        Government of Jharkhand • Department of Higher, Technical Education & Skill Development
      </footer>
    </div>
  );
}
