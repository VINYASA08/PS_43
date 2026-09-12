"use client";

import { useState } from "react";
import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  UserCircle2, 
  ArrowLeft, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Clock,
  Smartphone,
  Mail,
  Lock,
  Sparkles,
  QrCode
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Login() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"citizen" | "university" | "industry" | "gov">("citizen");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [phone, setPhone] = useState("+919708099999");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Jharkhand@2026!");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [district, setDistrict] = useState("Dhanbad");

  // Modal / Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpHint, setOtpHint] = useState("");

  // TOTP 2FA Modal
  const [showTotpModal, setShowTotpModal] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [tempToken, setTempToken] = useState("");

  const clearFeedback = () => {
    setErrorMessage(null);
    setPendingNotice(null);
    setLockoutMinutes(null);
  };

  // ---------------------------------------------------------------------------
  // CITIZEN FLOW (PHONE + OTP)
  // ---------------------------------------------------------------------------
  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: "citizen",
            phone,
            name: name || "Citizen Reporter",
            district: district || "Dhanbad",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        setOtpIdentifier(phone);
        setOtpHint("Check terminal server logs for [SMS/WhatsApp OTP]");
        setShowOtpModal(true);
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login initiation failed");

        setOtpIdentifier(phone);
        setOtpHint("Check terminal server logs for [SMS/WhatsApp OTP]");
        setShowOtpModal(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: otpIdentifier,
          otp: otpCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP code");

      setUser(data.user);
      setShowOtpModal(false);
      router.push(data.redirectUrl || "/submit");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // EMAIL + PASSWORD FLOW (UNIVERSITY, INDUSTRY, GOV)
  // ---------------------------------------------------------------------------
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: activeTab,
            email,
            password,
            name: name || "Test User",
            organization: organization || "State Partner",
            district,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        if (activeTab === "industry") {
          setPendingNotice(data.message || "Corporate registration pending Government Admin review.");
          setIsRegisterMode(false);
          return;
        }

        if (activeTab === "university") {
          setOtpIdentifier(email);
          setOtpHint("Check terminal server logs for [Email OTP]");
          setShowOtpModal(true);
          return;
        }

        if (activeTab === "gov") {
          setPendingNotice(data.message || "Government profile registered. Please log in.");
          setIsRegisterMode(false);
          return;
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await res.json();

        if (res.status === 423) {
          setLockoutMinutes(data.remainingMinutes || 30);
          throw new Error(data.message || "Account locked due to consecutive failed attempts.");
        }

        if (res.status === 403 && data.status === "PENDING") {
          setPendingNotice(data.message || "Account pending administrator approval.");
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || data.message || "Invalid credentials");
        }



        setUser(data.user);
        router.push(data.redirectUrl || "/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/totp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: totpCode,
          tempToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid 6-digit TOTP code.");

      setUser(data.user);
      setShowTotpModal(false);
      router.push(data.redirectUrl || "/dashboard/gov");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // QUICK DEMO PERSONA LOGINS (ONE-CLICK GENUINE LOGIN)
  // ---------------------------------------------------------------------------
  const handleQuickDemoLogin = async (persona: string) => {
    clearFeedback();
    setIsLoading(true);

    try {
      if (persona === "citizen") {
        // Quick citizen login: send OTP then auto-verify default demo OTP from server
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: "+919708099999" }),
        });
        const data = await res.json();
        setActiveTab("citizen");
        setPhone("+919708099999");
        setOtpIdentifier("+919708099999");
        setOtpHint("Simulated SMS sent. Check terminal or enter the 6-digit code.");
        setShowOtpModal(true);
      } else if (persona === "university") {
        setActiveTab("university");
        setEmail("pi.water@iitism.ac.in");
        setPassword("Jharkhand@2026!");
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: "pi.water@iitism.ac.in",
            password: "Jharkhand@2026!",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        setUser(data.user);
        router.push("/dashboard/university");
      } else if (persona === "industry") {
        setActiveTab("industry");
        setEmail("csr.director@tatasteel.com");
        setPassword("Jharkhand@2026!");
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: "csr.director@tatasteel.com",
            password: "Jharkhand@2026!",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        setUser(data.user);
        router.push("/dashboard/industry");
      } else if (persona === "industry_pending") {
        setActiveTab("industry");
        setEmail("csr.lead@coalindia.in");
        setPassword("Jharkhand@2026!");
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: "csr.lead@coalindia.in",
            password: "Jharkhand@2026!",
          }),
        });
        const data = await res.json();
        if (res.status === 403) {
          setPendingNotice(data.message || "Account pending administrator approval.");
        }
      } else if (persona === "gov") {
        setActiveTab("gov");
        setEmail("nodal.innovation@jharkhand.gov.in");
        setPassword("Jharkhand@2026!");
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: "nodal.innovation@jharkhand.gov.in",
            password: "Jharkhand@2026!",
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          router.push("/dashboard/gov");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12 relative">
      <Link href="/" className="fixed top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm z-20">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="max-w-2xl w-full relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-xl shadow-blue-500/25">
            JH
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Jharkhand Smart Study and Innovation Portal
          </h1>
          <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">
            Official statutory gateway for Citizen reports, Academic R&D, Corporate CSR, and State Nodal oversight.
          </p>
        </div>

        {/* Quick Demo Persona Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-blue-700 font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Quick Persona Logins:
            </span>
            <span>Pre-seeded test credentials</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => handleQuickDemoLogin("citizen")}
              className="px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition-all text-center cursor-pointer"
            >
              Citizen (Murmu)
            </button>
            <button
              onClick={() => handleQuickDemoLogin("university")}
              className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-all text-center cursor-pointer"
            >
              IIT ISM PI
            </button>
            <button
              onClick={() => handleQuickDemoLogin("industry")}
              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all text-center cursor-pointer"
            >
              Tata Steel CSR
            </button>
            <button
              onClick={() => handleQuickDemoLogin("industry_pending")}
              className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all text-center cursor-pointer"
            >
              Coal India (Pending)
            </button>
            <button
              onClick={() => handleQuickDemoLogin("gov")}
              className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all text-center cursor-pointer col-span-2 sm:col-span-1"
            >
              Gov IAS
            </button>
          </div>
        </div>

        {/* Notices & Error Alerts */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Authentication Error</p>
              <p className="text-xs text-rose-600 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {pendingNotice && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-sm">
            <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Account Verification Pending</p>
              <p className="text-xs text-amber-700 mt-0.5">{pendingNotice}</p>
            </div>
          </div>
        )}

        {lockoutMinutes && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
            <Lock className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold">Account Temporarily Locked</p>
              <p className="text-xs text-red-700 mt-0.5">
                5 consecutive failed login attempts recorded. Account is locked for security. Please retry after {lockoutMinutes} minutes.
              </p>
            </div>
          </div>
        )}

        {/* Interactive Tiered Login Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Tier Tabs */}
          <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("citizen"); clearFeedback(); }}
              className={`py-3.5 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "citizen"
                  ? "bg-white text-orange-600 border-b-2 border-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCircle2 className="w-4 h-4" />
              <span>Citizen</span>
            </button>
            <button
              onClick={() => { setActiveTab("university"); setEmail("pi.water@iitism.ac.in"); clearFeedback(); }}
              className={`py-3.5 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "university"
                  ? "bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>University</span>
            </button>
            <button
              onClick={() => { setActiveTab("industry"); setEmail("csr.director@tatasteel.com"); clearFeedback(); }}
              className={`py-3.5 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "industry"
                  ? "bg-white text-emerald-600 border-b-2 border-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Industry</span>
            </button>
            <button
              onClick={() => { setActiveTab("gov"); setEmail("nodal.innovation@jharkhand.gov.in"); clearFeedback(); }}
              className={`py-3.5 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "gov"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Government</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 capitalize">
                  {isRegisterMode ? `Register ${activeTab} Profile` : `Authenticate as ${activeTab}`}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeTab === "citizen" && "Fast mobile phone authentication via SMS/WhatsApp code."}
                  {activeTab === "university" && "Restricted to institutional .ac.in email addresses."}
                  {activeTab === "industry" && "Statutory corporate profile requiring Gov nodal verification."}
                  {activeTab === "gov" && "Official .gov.in/.nic.in email for secure access."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(!isRegisterMode); clearFeedback(); }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
              >
                {isRegisterMode ? "Already registered? Sign In" : "New Account? Sign Up"}
              </button>
            </div>

            {/* TAB 1: CITIZEN FORM */}
            {activeTab === "citizen" && (
              <form onSubmit={handleCitizenSubmit} className="space-y-4">
                {isRegisterMode && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Pooja Murmu"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Dhanbad"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919XXXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Format: +91 followed by 10 digits</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Dispatching..." : isRegisterMode ? "Register & Receive OTP" : "Send One-Time Password"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* TABS 2-4: EMAIL + PASSWORD FORMS */}
            {activeTab !== "citizen" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {isRegisterMode && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Dr. K. Banerjee"
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Entity</label>
                        <input
                          type="text"
                          required
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder={activeTab === "university" ? "IIT ISM Dhanbad" : activeTab === "industry" ? "Tata Steel" : "State Dept"}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {activeTab === "university" && "Institutional Email (.ac.in)"}
                    {activeTab === "industry" && "Corporate Email"}
                    {activeTab === "gov" && "Official Government Email (.gov.in / .nic.in)"}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        activeTab === "university"
                          ? "faculty@iitism.ac.in"
                          : activeTab === "industry"
                          ? "csr@tatasteel.com"
                          : "officer@jharkhand.gov.in"
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    activeTab === "university"
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                      : activeTab === "industry"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  }`}
                >
                  {isLoading ? "Authenticating..." : isRegisterMode ? "Submit Registration" : "Sign In with Credentials"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
              <Smartphone className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">Verify One-Time Password</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit verification code dispatched to <span className="font-semibold text-slate-800">{otpIdentifier}</span>.
              </p>
              {otpHint && (
                <p className="text-[11px] font-mono text-blue-600 bg-blue-50 p-2 rounded-lg mt-2">
                  {otpHint}
                </p>
              )}
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOTP 2FA Modal */}
      {showTotpModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <QrCode className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">Government 2FA Verification</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit time-based code from Google Authenticator, Microsoft Authenticator, or NIC GovKey.
              </p>
              <div className="text-[11px] bg-slate-100 text-slate-600 p-2 rounded-lg mt-2 font-mono">
                Seeded Test Secret: <span className="font-bold text-slate-900">JBSWY3DPEHPK3PXP</span>
              </div>
            </div>

            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit code"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTotpModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || totpCode.length !== 6}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify & Access Portal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
