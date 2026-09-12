"use client";

import { 
  LayoutDashboard, 
  FolderKanban, 
  MapPin, 
  FileSignature, 
  BarChart2, 
  Settings,
  Shield
} from "lucide-react";
import NotificationBell from "@/components/ui/NotificationBell";

interface GovNavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export function GovNavbar({ activeTab, onSelectTab, onOpenSettings }: GovNavbarProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "Live" },
    { id: "projects", label: "Civic Projects", icon: FolderKanban, badge: "186" },
    { id: "districts", label: "24 DNO Desks", icon: MapPin, badge: "24" },
    { id: "ip", label: "IP Registry", icon: FileSignature, badge: "38" },
    { id: "reports", label: "Compliance Reports", icon: BarChart2, badge: "NITI" },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Header Bar */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10 border border-slate-700/50">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  State Innovation Registry & Telemetry
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Higher & Technical Education Dept
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Government of Jharkhand • Inter-University & Corporate CSR R&D Orchestration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>DNO Credentials & Settings</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/15"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                    isActive 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" 
                      : "bg-slate-200/80 text-slate-600"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
