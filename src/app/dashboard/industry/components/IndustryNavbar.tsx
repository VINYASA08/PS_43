"use client";

import React from "react";
import { 
  Home, 
  CreditCard, 
  Users, 
  ClipboardList, 
  RefreshCw, 
  Settings, 
  LogOut,
  ShieldCheck,
  Award
} from "lucide-react";
import { ActiveTab } from "./types";
import NotificationBell from "@/components/ui/NotificationBell";

interface IndustryNavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogoutClick: () => void;
  pendingReviewsCount: number;
}

export function IndustryNavbar({
  activeTab,
  onTabChange,
  onLogoutClick,
  pendingReviewsCount
}: IndustryNavbarProps) {
  const navItems = [
    { id: "home" as ActiveTab, label: "Overview", icon: Home, badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined },
    { id: "escrow" as ActiveTab, label: "Escrow Ledger", icon: CreditCard },
    { id: "teams" as ActiveTab, label: "Lab Teams", icon: Users },
    { id: "tasks" as ActiveTab, label: "Kanban Board", icon: ClipboardList },
    { id: "trl" as ActiveTab, label: "TRL Audit", icon: RefreshCw },
    { id: "settings" as ActiveTab, label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
            IM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Industry Mentor Portal</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> NISP Verified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Corporate CSR R&D Oversight & Technology Transfer Desk
            </p>
          </div>
        </div>

        {/* Right: Mentor Profile & Sign-Out */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 justify-end">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              Senior Technical Mentor
            </div>
            <div className="text-[11px] text-slate-500">Tata Steel CSR Foundation</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-xs overflow-hidden flex items-center justify-center">
            <span className="text-xs font-black text-slate-700">SM</span>
          </div>
          <button
            onClick={onLogoutClick}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
            title="Sign Out (Preserves Drafts)"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-6 flex items-center gap-1 overflow-x-auto border-t border-slate-100 py-1.5 bg-slate-50/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? "bg-white text-blue-700" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
