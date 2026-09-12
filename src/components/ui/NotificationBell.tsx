"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  userId?: string | null;
  createdAt: string;
  newState?: unknown;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
}

function formatActionMessage(action: string, resource: string): string {
  const combined = `${resource.toUpperCase()} ${action.toUpperCase()}`;
  const map: Record<string, string> = {
    "CHALLENGE REPORTED": "New challenge submitted",
    "CHALLENGE CLAIM": "Challenge claimed by university",
    "CHALLENGE REJECT": "Challenge rejected by nodal officer",
    "CHALLENGE ROUTE_TO_ACADEMIA": "Challenge routed to academia",
    "CHALLENGE DIVERT_TO_GOV": "Challenge diverted to government body",
    "CHALLENGE APPROVE": "Challenge approved",
    "PROPOSAL SUBMIT": "New proposal submitted",
    "PROPOSAL APPROVE": "Proposal approved",
    "USER APPROVE": "User account approved",
    "USER REJECT": "User account rejected",
  };
  return map[combined] || `${resource} ${action.toLowerCase()}`;
}

function NotificationItem({ log, isNew }: { log: AuditLog; isNew: boolean }) {
  const action = log.action?.toUpperCase() || "";
  let IconComponent = Info;
  let iconColor = "text-slate-400";

  if (action === "CLAIM") {
    IconComponent = CheckCircle;
    iconColor = "text-emerald-500";
  } else if (action === "REJECT" || action === "DIVERT_TO_GOV") {
    IconComponent = AlertTriangle;
    iconColor = "text-amber-500";
  }

  const message = formatActionMessage(log.action, log.resource);
  const timeStr = getRelativeTime(log.createdAt);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
        isNew ? "bg-blue-50/50" : ""
      }`}
    >
      <div className={`mt-0.5 shrink-0 ${iconColor}`}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs leading-snug text-slate-800 ${
            isNew ? "font-semibold" : "font-medium"
          }`}
        >
          {message}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">{timeStr}</p>
      </div>
      {isNew && (
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
      )}
    </div>
  );
}

const STORAGE_KEY = "pragati_notif_seen";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load lastSeen from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLastSeen(parseInt(stored, 10) || 0);
      }
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs.slice(0, 10));
      }
    } catch {
      // silently fail — bell should not break the page
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open, fetchLogs]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = logs.filter(
    (log) => new Date(log.createdAt).getTime() > lastSeen
  ).length;

  const markAllRead = () => {
    const now = Date.now();
    setLastSeen(now);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(now));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-md border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-semibold text-[#13528A] hover:text-[#0E3D66] transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Log list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {isFetching ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading…
              </div>
            ) : logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications yet
              </div>
            ) : (
              logs.map((log) => (
                <NotificationItem
                  key={log.id}
                  log={log}
                  isNew={new Date(log.createdAt).getTime() > lastSeen}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
