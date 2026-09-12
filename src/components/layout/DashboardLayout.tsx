"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Building2, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  ShieldAlert, 
  HelpCircle 
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { GovernmentHeader } from "./GovernmentHeader";
import { GovernmentFooter } from "./GovernmentFooter";

export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  role?: string;
  navigation?: NavItem[];
  showGlobalHeaderFooter?: boolean;
}

export function DashboardLayout({
  children,
  title,
  role,
  navigation,
  showGlobalHeaderFooter = false,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const activeRole = (role || user?.role || "GOV").toUpperCase();

  const defaultNavigation: Record<string, NavItem[]> = {
    STATE_ADMIN: [
      { name: "Apex Command Center", href: "/dashboard/state", icon: LayoutDashboard },
      { name: "GIS Heatmap", href: "/dashboard/state?tab=heatmap", icon: Building2 },
      { name: "Help Center", href: "/help", icon: HelpCircle },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
    GOV: [
      { name: "Command Center", href: "/gov/command", icon: LayoutDashboard },
      { name: "Nodal Queue", href: "/dashboard/nodal", icon: ShieldCheck },
      { name: "Ledger", href: "/dashboard/gov", icon: Briefcase },
      { name: "Help Center", href: "/help", icon: HelpCircle },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
    UNIVERSITY: [
      { name: "R&D Overview", href: "/university/dashboard", icon: LayoutDashboard },
      { name: "Research DPRs", href: "/dashboard/university", icon: GraduationCap },
      { name: "Help Center", href: "/help", icon: HelpCircle },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
    INDUSTRY: [
      { name: "Pipeline Overview", href: "/industry/pipeline", icon: LayoutDashboard },
      { name: "CSR Escrow", href: "/dashboard/industry", icon: Briefcase },
      { name: "Help Center", href: "/help", icon: HelpCircle },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  };

  const navItems = navigation || defaultNavigation[activeRole] || defaultNavigation["GOV"];
  const displayTitle = title || ${activeRole.replace("_", " ")} Portal;
  const displayTitle = title || `${activeRole.replace("_", " ")} Portal`;

  const content = (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-[var(--color-border)] sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[#13528A] flex items-center justify-center text-white text-xs font-bold shadow">
            JH
          </div>
          <span>{displayTitle}</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={sidebarOpen}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius-md)] p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-[rgba(19,82,138,0.3)]"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        aria-label="Dashboard Sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-[var(--color-border)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-[var(--color-border)]">
          <Link 
            href="/" 
            className="flex items-center gap-3 font-bold text-lg text-slate-900 dark:text-white group focus:outline-none focus:ring-4 focus:ring-[rgba(19,82,138,0.3)] rounded-[var(--radius-md)] p-1"
          >
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-tr from-[#13528A] to-[#0E3D66] flex items-center justify-center text-white text-sm font-bold shadow-md">
              JH
            </div>
            <div>
              <div className="leading-tight">PRAGATI</div>
              <div className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">Govt of Jharkhand</div>
            </div>
          </Link>
        </div>

        {/* User Identity Banner */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
              {user?.name || "State Official"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#13528A]/10 text-[#13528A] dark:text-blue-300">
              {activeRole}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {user?.organization || user?.email || "Higher & Technical Education"}
          </p>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Role Navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon || LayoutDashboard;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[rgba(19,82,138,0.3)] ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[var(--color-border)] mt-auto">
          <button
            type="button"
            onClick={() => logout()}
            className="min-h-[44px] w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors focus:outline-none focus:ring-4 focus:ring-[rgba(19,82,138,0.3)]"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <section className="flex-1 overflow-x-hidden p-4 md:p-8">
        {children}
      </section>
    </div>
  );

  if (showGlobalHeaderFooter) {
    return (
      <div className="flex flex-col min-h-screen">
        <GovernmentHeader />
        <div className="flex-1">{content}</div>
        <GovernmentFooter />
      </div>
    );
  }

  return content;
}

export default DashboardLayout;
