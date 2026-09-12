"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu,
  Building2,
  GraduationCap,
  Briefcase,
  UserCheck,
  ShieldCheck,
  MessageSquare,
  ListTodo,
  FileText,
  Search,
  BarChart3,
  ShieldAlert,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { RoleGuard } from "@/components/auth/RoleGuard";
import CommandPalette from "@/components/ui/CommandPalette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const userRole = (user?.role || "").toUpperCase();

  const getRoleInfo = () => {
    if (userRole === "STATE_ADMIN" || pathname.includes("/dashboard/state")) {
      return {
        title: "State Command Center",
        icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
        color: "text-amber-600",
        bg: "bg-amber-50",
      };
    }
    if (userRole === "GOV" || pathname.includes("/dashboard/gov")) {
      return {
        title: "Government Portal",
        icon: <Building2 className="w-5 h-5 text-blue-600" />,
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    }
    if (userRole === "UNIVERSITY" || pathname.includes("/dashboard/university")) {
      return {
        title: "University Portal",
        icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
      };
    }
    if (userRole === "INDUSTRY" || pathname.includes("/dashboard/industry")) {
      return {
        title: "Industry Portal",
        icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      };
    }
    return {
      title: "Innovation Portal",
      icon: <LayoutDashboard className="w-5 h-5 text-slate-600" />,
      color: "text-slate-600",
      bg: "bg-slate-50",
    };
  };

  const roleInfo = getRoleInfo();

  const getNavigation = () => {
    if (userRole === "STATE_ADMIN" || pathname.includes("/dashboard/state")) {
      return [
        { name: "Apex Command Center", href: "/dashboard/state", icon: LayoutDashboard },
        { name: "GIS Heatmap", href: "/dashboard/state?tab=heatmap", icon: Building2 },
        { name: "Bottleneck Analytics", href: "/dashboard/state?tab=bottlenecks", icon: BarChart3 },
        { name: "University Leaderboard", href: "/dashboard/state?tab=leaderboard", icon: GraduationCap },
        { name: "Master Overrides", href: "/dashboard/state?tab=override", icon: ShieldCheck },
        { name: "Industry Approvals", href: "/dashboard/state?tab=users", icon: UserCheck },
        { name: "Financial & AI Oversight", href: "/dashboard/state?tab=oversight", icon: Sliders },
        { name: "Help Center", href: "/help", icon: HelpCircle },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }
    if (userRole === "GOV" || pathname.includes("/dashboard/gov") || pathname.includes("/dashboard/nodal")) {
      return [
        { name: "Overview", href: "/dashboard/gov", icon: LayoutDashboard },
        { name: "Nodal Triage Queue", href: "/dashboard/nodal", icon: ShieldCheck },
        { name: "Challenges Ledger", href: "/dashboard/gov#ledger", icon: Briefcase },
        { name: "Open Contributor Board", href: "/dashboard/open-board", icon: ListTodo },
        { name: "Pending Approvals", href: "/dashboard/gov#pending-users", icon: UserCheck },
        { name: "Accountability Index", href: "/accountability", icon: Building2 },
        { name: "Guidelines & Gazette", href: "/guidelines", icon: Building2 },
        { name: "Help Center", href: "/help", icon: HelpCircle },
        { name: "Switch Portal", href: "/dashboard", icon: Menu },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }
    if (userRole === "UNIVERSITY" || pathname.includes("/dashboard/university")) {
      return [
        { name: "Overview", href: "/dashboard/university", icon: LayoutDashboard },
        { name: "Browse Opportunities", href: "/dashboard/university#opportunities", icon: GraduationCap },
        { name: "Open Contributor Board", href: "/dashboard/open-board", icon: ListTodo },
        { name: "Industry-University Chat", href: "/dashboard/chat", icon: MessageSquare },
        { name: "Grant Guidelines", href: "/guidelines", icon: Building2 },
        { name: "Help Center", href: "/help", icon: HelpCircle },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }
    if (userRole === "INDUSTRY" || pathname.includes("/dashboard/industry")) {
      return [
        { name: "Overview", href: "/dashboard/industry", icon: LayoutDashboard },
        { name: "CSR Escrow Commitments", href: "/dashboard/industry#projects", icon: Briefcase },
        { name: "Industry-University Chat", href: "/dashboard/chat", icon: MessageSquare },
        { name: "Open Contributor Board", href: "/dashboard/open-board", icon: ListTodo },
        { name: "CSR Rules & Section 135", href: "/guidelines", icon: Building2 },
        { name: "Help Center", href: "/help", icon: HelpCircle },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }
    return [
      { name: "Portal Gateway", href: "/dashboard", icon: LayoutDashboard },
      { name: "Report Problem", href: "/submit", icon: FileText },
      { name: "Track Grievance", href: "/track", icon: Search },
      { name: "Contributor Tasks", href: "/dashboard/open-board", icon: ListTodo },
      { name: "Public Accountability", href: "/accountability", icon: BarChart3 },
      { name: "Help Center", href: "/help", icon: HelpCircle },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];
  };

  const navigation = getNavigation();

  return (
    <RoleGuard allowedRoles={["STATE_ADMIN", "GOV", "UNIVERSITY", "INDUSTRY", "CITIZEN", "EXPERT"]}>
      <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
        {/* Mobile header */}
        <div className="md:hidden glass border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between p-4 bg-white/90">
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">
              JH
            </div>
            {roleInfo.title}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -mr-2 cursor-pointer">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm shadow-md">
                  JH
                </div>
                Portal
              </Link>

              {/* User badge */}
              {user && (
                <Link
                  href="/dashboard/settings"
                  className="block mb-6 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors group cursor-pointer"
                  title="Manage Profile & Security Settings"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[140px] group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      <ShieldCheck className="w-3 h-3" />
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user.organization || user.email || user.phone}
                  </p>
                </Link>
              )}

              <div className={`px-4 py-3 rounded-xl mb-6 flex items-center gap-3 ${roleInfo.bg}`}>
                {roleInfo.icon}
                <span className={`font-semibold text-sm ${roleInfo.color}`}>{roleInfo.title}</span>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive 
                          ? "bg-slate-100 text-slate-900 font-semibold" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-100">
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors w-full cursor-pointer text-left"
              >
                <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-600" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-x-hidden">
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/20 z-30 md:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <main className="p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette />
    </RoleGuard>
  );
}
