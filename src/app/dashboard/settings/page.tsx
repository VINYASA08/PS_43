"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Bell, 
  ShieldCheck, 
  Key, 
  FileCheck, 
  CheckCircle2, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Smartphone, 
  Save, 
  Laptop, 
  Lock,
  QrCode,
  X,
  Users,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  ExternalLink,
  Send
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardSettings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "api" | "compliance" | "handover">("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Client hydration safety
  const [isMounted, setIsMounted] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: user?.name || "Dr. R. K. Soren, IAS",
    organization: user?.organization || "Jharkhand State Innovation Council & Planning Dept",
    designation: user?.designation || "Principal Secretary & Nodal Officer",
    email: user?.email || "nodal.innovation@jharkhand.gov.in",
    phone: user?.phone || "+919835012345",
    district: user?.district || "Ranchi",
    bio: user?.bio || "Coordinating state-wide societal challenge escalation, institutional grants, and statutory CSR convergence.",
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    smsBroadcast: true,
    escrowDisbursements: true,
    weeklyDigest: true,
  });

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? true);
  const [showTotpSetupModal, setShowTotpSetupModal] = useState(false);
  const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);

  // Sessions State
  const [activeSessions, setActiveSessions] = useState([
    { id: "sess-1", device: "Chrome / Windows 11 (Project Building, Ranchi)", current: true, ip: "103.14.204.12", time: "Active Now" },
    { id: "sess-2", device: "Mobile Safari / iOS 17 (Secretariat Wi-Fi)", current: false, ip: "103.14.204.89", time: "2 hours ago" },
  ]);

  // API Keys State
  const [showSecret, setShowSecret] = useState(false);
  const [apiKey, setApiKey] = useState("sic_live_prod_2026_jharkhand_portal");

  // Account Handover State
  const [pendingHandover, setPendingHandover] = useState<{
    token: string;
    successorEmail: string;
    expiresAt: string;
    createdAt?: string;
    claimUrl?: string;
  } | null>(null);
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [successorEmail, setSuccessorEmail] = useState("");
  const [isInitiatingHandover, setIsInitiatingHandover] = useState(false);
  const [isCancellingHandover, setIsCancellingHandover] = useState(false);
  const [handoverError, setHandoverError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchHandoverStatus = async () => {
    setHandoverLoading(true);
    try {
      const res = await apiFetch<any>("/api/handover/initiate");
      if (res && res.hasPendingHandover && res.pendingHandover) {
        setPendingHandover(res.pendingHandover);
      } else {
        setPendingHandover(null);
      }
    } catch (err: any) {
      console.error("Failed to load handover status:", err);
    } finally {
      setHandoverLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    async function loadProfile() {
      try {
        const res = await apiFetch<any>("/api/users/profile");
        if (res.user) {
          setProfile({
            name: res.user.name || "",
            organization: res.user.organization || "",
            designation: res.user.designation || "",
            email: res.user.email || "",
            phone: res.user.phone || "",
            district: res.user.district || "",
            bio: res.user.bio || "",
          });
          setTwoFactorEnabled(res.user.twoFactorEnabled);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    }
    loadProfile();
    fetchHandoverStatus();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "handover") {
        setActiveTab("handover");
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const handleCopyClaimLink = (link: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      showToast("Handover claim link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleInitiateHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setHandoverError(null);
    const emailToSubmit = successorEmail.trim().toLowerCase();
    if (!emailToSubmit) {
      setHandoverError("Please provide a valid successor email address.");
      return;
    }
    setIsInitiatingHandover(true);
    try {
      const res = await apiFetch<any>("/api/handover/initiate", {
        method: "POST",
        body: { successorEmail: emailToSubmit },
      });
      if (res && res.success) {
        setPendingHandover({
          token: res.token,
          successorEmail: res.successorEmail || emailToSubmit,
          expiresAt: res.expiresAt,
          claimUrl: res.claimUrl,
        });
        setSuccessorEmail("");
        showToast("Handover invitation generated and dispatched!");
      } else if (res && res.error) {
        setHandoverError(res.error);
      }
    } catch (err: any) {
      setHandoverError(err.message || "Failed to initiate handover.");
    } finally {
      setIsInitiatingHandover(false);
    }
  };

  const handleCancelHandover = async () => {
    if (!window.confirm("Are you sure you want to revoke and cancel this pending handover invitation? The claim link will be invalidated immediately.")) {
      return;
    }
    setIsCancellingHandover(true);
    setHandoverError(null);
    try {
      const res = await apiFetch<any>("/api/handover/cancel", {
        method: "POST",
      });
      if (res && res.success) {
        setPendingHandover(null);
        showToast("Pending handover invitation has been cancelled.");
      } else if (res && res.error) {
        setHandoverError(res.error);
      }
    } catch (err: any) {
      setHandoverError(err.message || "Failed to cancel handover.");
    } finally {
      setIsCancellingHandover(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/users/profile", {
        method: "PUT",
        body: profile,
      });
      showToast("Profile successfully updated in state database.");
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`);
    }
  };

  const handleStartTotpSetup = async () => {
    try {
      const res = await apiFetch<any>("/api/auth/totp-setup", { method: "POST" });
      setTotpQrCode(res.qrCodeUrl);
      setTotpSecret(res.manualEntryKey || res.secret);
      setShowTotpSetupModal(true);
    } catch (err: any) {
      showToast(`2FA Setup error: ${err.message}`);
    }
  };

  const handleConfirmTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingTotp(true);
    try {
      await apiFetch("/api/auth/totp-verify", {
        method: "POST",
        body: { code: verifyCode },
      });
      setTwoFactorEnabled(true);
      setShowTotpSetupModal(false);
      setVerifyCode("");
      showToast("Two-Factor Authentication successfully activated!");
    } catch (err: any) {
      showToast(`Verification failed: ${err.message}`);
    } finally {
      setIsVerifyingTotp(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 font-semibold text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Administrative Governance
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform & Security Settings</h1>
        <p className="text-slate-500 text-sm font-medium">Manage profile, 2FA credentials, webhook integrations, and statutory compliance.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "profile" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4" /> Profile Details
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "security" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lock className="w-4 h-4" /> Security
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "notifications" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>
        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "api" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Key className="w-4 h-4" /> API Access
        </button>
        <button
          onClick={() => setActiveTab("handover")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "handover" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4" /> Account Handover
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">User Profile</h2>
              <p className="text-xs text-slate-500">Synchronized with State Innovation Registry.</p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Department</label>
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={profile.district}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Mandate Summary</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      )}

      {/* Security & 2FA Tab */}
      {activeTab === "security" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Security Settings</h2>
            <p className="text-xs text-slate-500">Manage your active cryptographic sessions and account security.</p>
          </div>

          {/* Two-Factor Authentication (TOTP) Card */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Two-Factor Authentication (TOTP)
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      twoFactorEnabled 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {twoFactorEnabled ? "Active & Enforced" : "Not Configured"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Protect your administrative actions and portal access using Google Authenticator, Microsoft Authenticator, or Apple Keychain.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartTotpSetup}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-center"
              >
                <QrCode className="w-3.5 h-3.5" />
                {twoFactorEnabled ? "Reconfigure 2FA" : "Set Up 2FA"}
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-slate-900">Active Cryptographic Sessions</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {activeSessions.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{s.device}</p>
                      <p className="text-[11px] text-slate-400">IP: {s.ip} • {s.time}</p>
                    </div>
                  </div>
                  {s.current ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Current Device
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSessions(prev => prev.filter(x => x.id !== s.id));
                        showToast("Session revoked");
                      }}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Automated Notifications</h2>
          <div className="space-y-3 divide-y divide-slate-100">
            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Critical Urgency Escalation Alerts</p>
                <p className="text-xs text-slate-500">Immediate SMS and email dispatch when ground sensors breach limits.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.criticalAlerts}
                onChange={(e) => setNotifications({ ...notifications, criticalAlerts: e.target.checked })}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
            </div>
            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">CSR Escrow Milestone Releases</p>
                <p className="text-xs text-slate-500">Notifications for dual-key disbursement sign-offs.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.escrowDisbursements}
                onChange={(e) => setNotifications({ ...notifications, escrowDisbursements: e.target.checked })}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* API Access Tab */}
      {activeTab === "api" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Developer API Keys</h2>
            <p className="text-xs text-slate-500">Integrate regional sensors and district portals via authenticated REST endpoints.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">State API Bearer Token</label>
            <div className="flex items-center gap-2">
              <input
                type={showSecret ? "text" : "password"}
                readOnly
                value={apiKey}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs bg-slate-50"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleCopy(apiKey, "API Key")}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Handover Tab */}
      {activeTab === "handover" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Users className="w-3 h-3" /> Succession Planning & Governance
              </div>
              <h2 className="text-lg font-bold text-slate-900">Official Account & Mandate Handover</h2>
              <p className="text-xs text-slate-500">
                Transfer your official post, mandates, historical submissions, and administrative authority to a designated successor.
              </p>
            </div>
            {pendingHandover && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shrink-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Pending Successor Claim
              </span>
            )}
          </div>

          {/* Error Banner */}
          {handoverError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Handover Notice</p>
                <p>{handoverError}</p>
              </div>
              <button 
                onClick={() => setHandoverError(null)}
                className="text-rose-500 hover:text-rose-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Current Mandate Profile Preview */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Account Authority & Jurisdiction Being Transferred
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Officer</span>
                <span className="font-bold text-slate-800 truncate block">{profile.name || user?.name || "Official"}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation & Org</span>
                <span className="font-bold text-slate-800 truncate block">{profile.designation || user?.designation || "Nodal Officer"} • {profile.organization || user?.organization || "Gov Dept"}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Role</span>
                <span className="font-bold text-blue-600 uppercase block">{user?.role || "GOV"}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Jurisdiction</span>
                <span className="font-bold text-slate-800 truncate block">{profile.district || user?.district || "Ranchi"}</span>
              </div>
            </div>
          </div>

          {handoverLoading ? (
            <div className="p-8 rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center space-y-3 animate-pulse">
              <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Checking pending handover status...</p>
            </div>
          ) : pendingHandover ? (
            /* Active Handover Pending State */
            <div className="p-6 rounded-2xl border-2 border-amber-200 bg-amber-50/40 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Handover Invitation Active
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Awaiting Successor
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    An official transfer invitation has been generated. The successor must open the claim link to verify their credentials and complete the handover.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-amber-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Designated Successor Email</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{pendingHandover.successorEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Invitation Expiration</span>
                  <span className="font-bold text-slate-900">
                    {isMounted ? new Date(pendingHandover.expiresAt).toLocaleString() : "48 Hours"}
                  </span>
                </div>
              </div>

              {/* Claim Link Input & Actions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Public Successor Claim Link
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={isMounted ? (pendingHandover.claimUrl || `${window.location.origin}/handover/${pendingHandover.token}`) : `/handover/${pendingHandover.token}`}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs bg-white text-slate-800 select-all pr-10 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = isMounted ? (pendingHandover.claimUrl || `${window.location.origin}/handover/${pendingHandover.token}`) : "";
                      handleCopyClaimLink(url);
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? "Copied!" : "Copy Claim Link"}
                  </button>
                  {isMounted && (
                    <a
                      href={pendingHandover.claimUrl || `/handover/${pendingHandover.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      title="Open Claim Page in New Tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Share this secure link with your designated successor. When claimed, your existing credentials and 2FA will be decommissioned.
                </p>
              </div>

              {/* Revoke Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-amber-200/60">
                <p className="text-xs text-slate-500">
                  Made a mistake or need to assign a different successor?
                </p>
                <button
                  type="button"
                  disabled={isCancellingHandover}
                  onClick={handleCancelHandover}
                  className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  {isCancellingHandover ? "Cancelling..." : "Revoke / Cancel Handover"}
                </button>
              </div>
            </div>
          ) : (
            /* Initiate New Handover Form */
            <form onSubmit={handleInitiateHandover} className="space-y-6">
              {/* Statutory Notice */}
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/60 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-900">
                  <p className="font-bold">Important Administrative Notice:</p>
                  <p className="text-amber-800 leading-relaxed">
                    Transferring your account will grant the successor full administrative access to your position, mandates, and data history. 
                    All past proposals, review actions, and challenge assignments will remain linked under this account record. 
                    Your existing password and Two-Factor Authentication credentials will be permanently deactivated upon successful claim by the successor.
                  </p>
                </div>
              </div>

              {/* Input: Successor Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Successor Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. successor.officer@jharkhand.gov.in"
                  value={successorEmail}
                  onChange={(e) => setSuccessorEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <p className="text-[11px] text-slate-500">
                  Enter the official or institutional email of the designated successor taking over this position.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isInitiatingHandover || !successorEmail.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isInitiatingHandover ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating Invitation...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Generate Handover Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TOTP Setup Modal */}
      {showTotpSetupModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Setup Two-Factor Authenticator</h3>
              </div>
              <button
                onClick={() => setShowTotpSetupModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <p>1. Open your authenticator app (Google Authenticator, Authy, etc.) and scan the QR code below:</p>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
                {totpQrCode ? (
                  <img
                    src={totpQrCode}
                    alt="Authenticator QR Code"
                    className="w-44 h-44 object-contain rounded-lg border border-slate-200 shadow-sm bg-white p-2"
                  />
                ) : (
                  <div className="w-44 h-44 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-mono text-center p-4">
                    Generating secure QR code...
                  </div>
                )}
              </div>

              {totpSecret && (
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">Or enter setup key manually:</span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2.5 bg-slate-100 rounded-xl font-mono text-xs text-slate-800 break-all select-all border border-slate-200">
                      {totpSecret}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(totpSecret, "2FA Secret Key")}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 shrink-0 cursor-pointer"
                      title="Copy Key"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleConfirmTotp} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    2. Enter 6-digit verification code from app:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 123456"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center font-mono text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTotpSetupModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingTotp || verifyCode.length < 6}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isVerifyingTotp ? "Verifying..." : "Confirm & Activate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
