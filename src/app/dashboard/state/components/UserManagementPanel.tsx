"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  UserCheck, 
  UserX, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck,
  Search,
  Check,
  X
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export interface PendingUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  designation: string | null;
  district: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export function UserManagementPanel() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [rejectModalUser, setRejectModalUser] = useState<PendingUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPendingUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; pendingUsers: PendingUser[] }>(
        "/api/admin/pending-users"
      );
      if (res && res.pendingUsers) {
        setPendingUsers(res.pendingUsers);
      }
    } catch (err: any) {
      console.error("Failed to load pending users:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to load pending registrations.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  // Handle Approve
  const handleApprove = async (user: PendingUser) => {
    setActionInProgress(user.id);
    try {
      await apiFetch("/api/admin/approve-user", {
        method: "POST",
        body: {
          userId: user.id,
          action: "approve",
        },
      });

      setNotification({
        type: "success",
        message: `Corporate account for "${user.name}" (${user.organization || "Industry"}) has been approved and activated.`,
      });
      fetchPendingUsers();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to approve account.",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Reject
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalUser) return;

    setActionInProgress(rejectModalUser.id);
    try {
      await apiFetch("/api/admin/approve-user", {
        method: "POST",
        body: {
          userId: rejectModalUser.id,
          action: "reject",
          reason: rejectReason.trim() || "Verification requirements not met",
        },
      });

      setNotification({
        type: "success",
        message: `Registration for "${rejectModalUser.name}" has been rejected/suspended.`,
      });
      setRejectModalUser(null);
      setRejectReason("");
      fetchPendingUsers();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to reject registration.",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredUsers = pendingUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.organization && u.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Corporate & Industry Onboarding Gate
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {pendingUsers.length} Pending Approvals
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory KYC and corporate entity verification under Jharkhand Societal Innovation Framework
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, company, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
            <button
              onClick={() => fetchPendingUsers()}
              disabled={isLoading}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Authorized Officer</th>
                <th className="py-3 px-4">Corporate Entity & Role</th>
                <th className="py-3 px-4">District / Location</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Verification Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Checking pending corporate registrations...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-slate-700 text-sm">
                        All Corporate Registrations Clear!
                      </span>
                      <span className="text-xs text-slate-400 max-w-sm">
                        There are currently no industry partners awaiting State Administrator review.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isBusy = actionInProgress === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {u.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {u.email}
                            </span>
                          )}
                          {u.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {u.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {u.organization || "Private Enterprise"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {u.designation || "Corporate CSR Wing"} &bull; {u.role}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.district || "Jharkhand Regional"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(u)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectModalUser(u);
                              setRejectReason("");
                            }}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Reject Corporate Registration
                </h3>
              </div>
              <button
                onClick={() => setRejectModalUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                You are about to reject the registration of{" "}
                <span className="font-bold text-slate-900">{rejectModalUser.name}</span> from{" "}
                <span className="font-bold text-slate-900">{rejectModalUser.organization || "Company"}</span>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rejection Reason (Notice to Applicant)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Incomplete CSR Registration details or invalid corporate credentials..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress === rejectModalUser.id}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {actionInProgress === rejectModalUser.id ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
