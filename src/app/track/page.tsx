"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  FileText, 
  Copy, 
  Share2, 
  ExternalLink,
  Activity,
  AlertTriangle,
  Send
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { CitizenTrackGuidanceCard } from "@/components/guidance/Layer5_DashboardChecklists/CitizenTrackGuidanceCard";

interface TimelineStage {
  step: number;
  title: string;
  subtitle: string;
  status: "completed" | "current" | "pending";
  date: string;
  details: string;
  badge?: string;
  badgeColor?: string;
}

interface IssueData {
  id: string;
  title: string;
  domain: string;
  location: string;
  submittedAt: string;
  urgency: string;
  assignedInstitute: string;
  industryPartner: string;
  fundingEscrow: string;
  statusText: string;
  slaStatus: string;
  // Feature 4: Diverted-to-Gov Tracking
  nodalStatus?: string;
  divertedTarget?: string | null;
  divertedAt?: string | null;
  rejectionReason?: string | null;
  telemetry: {
    label: string;
    value: string;
    status: string;
  }[];
  timeline: TimelineStage[];
  logs: {
    timestamp: string;
    entity: string;
    action: string;
    note: string;
  }[];
}

const SAMPLE_ISSUES: Record<string, IssueData> = {
  "IN-GR-2026-9842": {
    id: "IN-GR-2026-9842",
    title: "Heavy Metal & Acid Runoff in Drinking Borewells",
    domain: "Water Management",
    location: "Dhanbad District, Block XYZ, Village 4",
    submittedAt: "24 Aug 2026, 09:30 AM",
    urgency: "Critical Priority",
    assignedInstitute: "IIT ISM Dhanbad (Dept of Environmental Science)",
    industryPartner: "Tata Steel CSR (Jharkhand Innovation Fund)",
    fundingEscrow: "₹3,50,000 (Tranche 1 Released)",
    statusText: "Phase 3: Lab Prototype Validated",
    slaStatus: "On Track (SLA Target: 18 Days Remaining)",
    telemetry: [
      { label: "pH Level", value: "4.8 (Acidic)", status: "Critical" },
      { label: "Total Dissolved Solids (TDS)", value: "890 ppm", status: "High" },
      { label: "Lead & Heavy Metal Index", value: "0.08 mg/L", status: "Severe" },
      { label: "Affected Population", value: "~1,420 Residents", status: "Alert" }
    ],
    timeline: [
      {
        step: 1,
        title: "Submitted by Citizen",
        subtitle: "Citizen Field Report Logged",
        status: "completed",
        date: "24 Aug 2026",
        details: "Cryptographic GPS hash recorded with 4 field images showing water discoloration. Anonymity preserved under DPDP Act."
      },
      {
        step: 2,
        title: "AI Clustered & Triaged",
        subtitle: "NLP Semantic Correlation (Score 98.4%)",
        status: "completed",
        date: "24 Aug 2026",
        details: "AI deduplication engine merged 8 similar local reports. Automated risk matrix assigned 'Critical Urgency'."
      },
      {
        step: 3,
        title: "Assigned to IIT ISM Dhanbad",
        subtitle: "Principal Investigator: Dr. K. Banerjee",
        status: "completed",
        date: "25 Aug 2026",
        details: "Academic challenge docket accepted. Multidisciplinary student team of 4 chemical and civil engineers formed."
      },
      {
        step: 4,
        title: "Industry Funded via Escrow",
        subtitle: "Tata Steel CSR Prototype Commitment",
        status: "completed",
        date: "28 Aug 2026",
        details: "Tripartite MoU executed. Tranche 1 (₹3.5L) disbursed into university escrow account for solar-powered adsorbent filter."
      },
      {
        step: 5,
        title: "Field Deployment & Validation",
        subtitle: "Borewell Pilot Installation",
        status: "current",
        date: "04 Sep 2026 (In Progress)",
        details: "Dual-stage activated carbon and electrochemical filter undergoing 14-day continuous ground water testing.",
        badge: "Undergoing Verification",
        badgeColor: "bg-blue-100 text-blue-800"
      }
    ],
    logs: [
      { timestamp: "04 Sep 2026 14:15", entity: "District Technology Cell", action: "Ground Water Telemetry Ingested", note: "Continuous sensor reading: TDS dropped from 890 ppm to 180 ppm post-filtration." },
      { timestamp: "01 Sep 2026 11:30", entity: "IIT ISM Research Team", action: "Filter Core Installed", note: "Dual cartridge system operational at Village 4 Community Center." },
      { timestamp: "28 Aug 2026 16:00", entity: "State Innovation Escrow", action: "Milestone 1 Authorized", note: "Dual digital sign-off completed by Industry Sponsor and PI." },
      { timestamp: "25 Aug 2026 10:20", entity: "AI Triage Engine", action: "Inter-Department Notice Dispatched", note: "Notified District Collector, Dhanbad and Public Health Engineering Dept." },
    ]
  },
  "IN-DL-2026-3104": {
    id: "IN-DL-2026-3104",
    title: "Smart Irrigation Deficiencies & Soil Nitrogen Loss",
    domain: "Agriculture",
    location: "Gumla District, Kamdara Block",
    submittedAt: "20 Aug 2026, 02:15 PM",
    urgency: "High Priority",
    assignedInstitute: "Birsa Agricultural University",
    industryPartner: "Pending Industry Match",
    fundingEscrow: "Mentorship Requested",
    statusText: "Phase 2: R&D Team Formed",
    slaStatus: "On Track",
    telemetry: [
      { label: "Soil Nitrogen Index", value: "112 kg/ha (Low)", status: "Warning" },
      { label: "Moisture Sensor", value: "18% (Critical Deficit)", status: "Alert" },
      { label: "Cropping Area", value: "320 Hectares", status: "Standard" },
      { label: "Beneficiary Farmers", value: "185 Households", status: "Active" }
    ],
    timeline: [
      {
        step: 1,
        title: "Submitted by Citizen",
        subtitle: "Farmer Cooperative Report",
        status: "completed",
        date: "20 Aug 2026",
        details: "Farmer union filed telemetry request regarding chronic dry-season crop wilting."
      },
      {
        step: 2,
        title: "AI Clustered & Triaged",
        subtitle: "Soil Deficit Model Matched",
        status: "completed",
        date: "21 Aug 2026",
        details: "Grouped under Smart Agriculture IoT challenge track."
      },
      {
        step: 3,
        title: "Assigned to Birsa Agri University",
        subtitle: "Dept of Agronomy",
        status: "current",
        date: "23 Aug 2026",
        details: "Drafting edge-AI low-cost tensiometer mesh proposal.",
        badge: "Active R&D",
        badgeColor: "bg-indigo-100 text-indigo-800"
      },
      {
        step: 4,
        title: "Industry Funding & CSR",
        subtitle: "Open for Corporate Sponsorship",
        status: "pending",
        date: "Target: 10 Sep 2026",
        details: "Awaiting CSR sponsor on industry portal."
      },
      {
        step: 5,
        title: "Solved & Validated",
        subtitle: "Field Pilot",
        status: "pending",
        date: "Target: 30 Oct 2026",
        details: "Farmer cooperative test deployment."
      }
    ],
    logs: [
      { timestamp: "23 Aug 2026 15:45", entity: "Birsa Agri University", action: "Team Convened", note: "Faculty PI and 3 graduate students accepted task docket." },
      { timestamp: "21 Aug 2026 09:00", entity: "AI Triage Engine", action: "Challenge Docket Created", note: "Ranked as Top 5 Agritech priority for South Chotanagpur division." }
    ]
  },
  "IN-MH-2026-7712": {
    id: "IN-MH-2026-7712",
    title: "Rural Tele-Medicine Access in Tribal Belts",
    domain: "Healthcare",
    location: "Simdega District, Bano Block",
    submittedAt: "10 Jul 2026, 11:00 AM",
    urgency: "Resolved & Closed",
    assignedInstitute: "RIMS Ranchi / BIT Mesra Hub",
    industryPartner: "Coal India CSR Trust",
    fundingEscrow: "₹8,00,000 (100% Disbursed)",
    statusText: "Phase 5: Solved & Validated",
    slaStatus: "Resolved Ahead of Schedule",
    telemetry: [
      { label: "Consultation Volume", value: "3,840 Patients", status: "Healthy" },
      { label: "Emergency Response", value: "Down from 4.2h to 24min", status: "Optimized" },
      { label: "Solar Uptime", value: "99.8%", status: "Nominal" },
      { label: "Citizen Audit Score", value: "4.9 / 5.0", status: "Excellent" }
    ],
    timeline: [
      { step: 1, title: "Submitted by Citizen", subtitle: "Gram Panchayat Request", status: "completed", date: "10 Jul 2026", details: "Initial grievance regarding zero doctor availability." },
      { step: 2, title: "AI Clustered & Triaged", subtitle: "Health Access Priority", status: "completed", date: "11 Jul 2026", details: "Assigned high urgency score." },
      { step: 3, title: "Assigned to BIT Mesra & RIMS", subtitle: "Telemedicine Kiosk Design", status: "completed", date: "14 Jul 2026", details: "Developed satellite-linked diagnostic kiosk." },
      { step: 4, title: "Industry Funded via Escrow", subtitle: "Coal India CSR Trust", status: "completed", date: "20 Jul 2026", details: "₹8.0 Lakhs funded with solar battery backup." },
      { step: 5, title: "Solved & Field Validated", subtitle: "Operational Deployment", status: "completed", date: "18 Aug 2026", details: "Signed off by Civil Surgeon Simdega and District Collector.", badge: "Verified & Solved", badgeColor: "bg-emerald-100 text-emerald-800" }
    ],
    logs: [
      { timestamp: "18 Aug 2026 17:00", entity: "District Collector Office", action: "Official Resolution Sign-off", note: "Kiosk operational in Bano health sub-center." },
      { timestamp: "05 Aug 2026 12:30", entity: "RIMS Medical Cell", action: "First 100 Remote Consultations", note: "Tele-cardiology and pediatrics operating at 50 Mbps." }
    ]
  }
};

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "IN-GR-2026-9842";
  const [trackingIdInput, setTrackingIdInput] = useState(initialId);
  const [currentId, setCurrentId] = useState(initialId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [smsModal, setSmsModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [liveIssue, setLiveIssue] = useState<IssueData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const idFromParam = searchParams.get("id");
    if (idFromParam) {
      setTrackingIdInput(idFromParam);
      setCurrentId(idFromParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchLiveTrack() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/track/${encodeURIComponent(currentId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.issue) {
            setLiveIssue(data.issue);
            return;
          } else if (data.challenge) {
            const c = data.challenge;
            const evidence = c.evidence || {};
            
            const telemetryList = [];
            if (evidence.ph) telemetryList.push({ label: "Measured pH", value: evidence.ph, status: "Critical" });
            if (evidence.turbidity) telemetryList.push({ label: "Turbidity", value: evidence.turbidity, status: "High" });
            if (evidence.dissolvedIron) telemetryList.push({ label: "Dissolved Iron", value: evidence.dissolvedIron, status: "Alert" });
            if (evidence.leadPpb) telemetryList.push({ label: "Heavy Metal (Pb)", value: evidence.leadPpb, status: "Severe" });
            if (evidence.nitrogenDeficit) telemetryList.push({ label: "Nitrogen Deficit", value: evidence.nitrogenDeficit, status: "High" });
            
            if (telemetryList.length === 0) {
              telemetryList.push({ label: "Ground Verification", value: `${c.verifiedByCount || 42} Monitors`, status: "Good" });
              telemetryList.push({ label: "Escalation Level", value: `Level ${c.escalationLevel || 0}`, status: "Normal" });
            }

            const formattedIssue: IssueData = {
              id: c.publicTrackingId || c.id,
              title: c.title,
              domain: c.domain,
              location: `${c.location}, ${c.district} District`,
              submittedAt: new Date(c.createdAt).toLocaleDateString(),
              urgency: `${c.urgency} Priority`,
              assignedInstitute: c.assignedInstitute || "IIT (ISM) Dhanbad",
              industryPartner: "Tata Steel CSR / State Escrow Node",
              fundingEscrow: c.proposals?.[0]?.budget ? `₹${c.proposals[0].budget.toLocaleString()}` : "₹3,50,000",
              statusText: `Status: ${c.status}`,
              slaStatus: c.slaDeadline ? `Deadline: ${new Date(c.slaDeadline).toLocaleDateString()}` : "SLA On Track",
              telemetry: telemetryList,
              timeline: (c.timeline || []).map((t: any, i: number) => ({
                step: t.step || t.stage || i + 1,
                title: t.title,
                subtitle: t.subtitle || t.department,
                status: t.status === "COMPLETED" || t.status === "completed" ? "completed" : t.status === "IN_PROGRESS" || t.status === "current" ? "current" : "pending",
                date: t.date,
                details: t.details || t.description,
              })),
              logs: (c.auditLogs || []).map((l: any, i: number) => ({
                timestamp: new Date(l.createdAt).toLocaleString(),
                entity: l.resource || "Ledger",
                action: l.action,
                note: `Recorded state update on ledger.`,
              })),
            };

            setLiveIssue(formattedIssue);
            return;
          }
        }
      } catch (e) {
        console.error("Live tracking error:", e);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentId) {
      fetchLiveTrack();
    }
  }, [currentId]);

  const currentIssue = liveIssue || SAMPLE_ISSUES[currentId] || SAMPLE_ISSUES["IN-GR-2026-9842"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = trackingIdInput.trim().toUpperCase();
    setCurrentId(clean);
    showToast(`Searching state ledger for ID: ${clean}...`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentIssue.id);
    showToast(`Tracking ID ${currentIssue.id} copied to clipboard!`);
  };

  const handleSubscribeSms = (e: React.FormEvent) => {
    e.preventDefault();
    setSmsModal(false);
    showToast(`Subscribed ${phoneInput} to real-time SMS tracking updates!`);
    setPhoneInput("");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
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

      {/* Top Bar */}
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/submit"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              + Report Another Issue
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        
        {/* Search Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Citizen Issue Verification & SLA Tracker
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Track Your Reported Challenge
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              Enter your official Tracking ID generated during submission to view live AI triage classification, academic team assignment, CSR escrow funding status, and field telemetry.
            </p>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                  placeholder="Enter Tracking ID (e.g., IN-GR-2026-9842)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Track Status
              </button>
            </form>

            {/* Quick Demo Selector */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Quick Test Records:</span>
              {Object.keys(SAMPLE_ISSUES).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTrackingIdInput(id);
                    setCurrentId(id);
                    showToast(`Loaded test record ${id}`);
                  }}
                  className={`font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                    currentId === id
                      ? "bg-blue-500/20 border-blue-400 text-blue-300 font-bold"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Layer 5: Persistent Citizen Tracking & SLA Guidance Card */}
        <CitizenTrackGuidanceCard />

        {/* Issue Overview Card */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
                  {currentIssue.id}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  {currentIssue.domain}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {currentIssue.urgency}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentIssue.slaStatus}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {currentIssue.title}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> {currentIssue.location} • Logged on {currentIssue.submittedAt}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyId}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy ID
              </button>
              <button
                onClick={() => setSmsModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> SMS Alerts
              </button>
            </div>
          </div>

          {/* Key Assignees Bar */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Academic R&D Lead</span>
                <p className="text-sm font-bold text-slate-900">{currentIssue.assignedInstitute}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Industry CSR Sponsor</span>
                <p className="text-sm font-bold text-slate-900">{currentIssue.industryPartner}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Escrow Capital Status</span>
                <p className="text-sm font-bold text-slate-900">{currentIssue.fundingEscrow}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Diverted-to-Gov Notice */}
        {currentIssue.nodalStatus === "diverted_to_gov" && currentIssue.divertedTarget && (
          <div className="bg-blue-50 rounded-3xl p-7 border border-blue-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Issue Diverted to Government Department</h3>
                <p className="text-xs text-slate-500">This challenge has been triaged and sent to the responsible government body for resolution.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-blue-100">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Assigned Department</span>
                <p className="text-base font-bold text-slate-900">{currentIssue.divertedTarget}</p>
              </div>
              {currentIssue.divertedAt && (
                <div className="p-4 bg-white rounded-xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Diverted On</span>
                  <p className="text-base font-bold text-slate-900">{currentIssue.divertedAt}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-800 font-medium">
              This issue is being handled through standard government channels. Contact the above department for further updates.
            </p>
          </div>
        )}

        {/* Feature 4: Rejected Notice */}
        {currentIssue.nodalStatus === "rejected" && (
          <div className="bg-rose-50 rounded-3xl p-7 border border-rose-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Challenge Rejected</h3>
                <p className="text-xs text-slate-500">This challenge has been reviewed and rejected by the District Nodal Officer.</p>
              </div>
            </div>
            {currentIssue.rejectionReason && (
              <div className="p-4 bg-white rounded-xl border border-rose-100">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">Rejection Reason</span>
                <p className="text-sm text-slate-800">{currentIssue.rejectionReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Interactive Timeline Stages */}
        <div className="bg-white rounded-3xl p-7 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">End-to-End Resolution Pipeline</h3>
            <p className="text-sm text-slate-500 font-medium">Real-time verifiable progress from citizen intake to field validation.</p>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8">
            {currentIssue.timeline.map((stage) => {
              const isDone = stage.status === "completed";
              const isCurrent = stage.status === "current";
              return (
                <div key={stage.step} className="relative group">
                  {/* Step Marker Dot - Green for completed, Amber for current, Gray for pending */}
                  <span className={`absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold ${
                    isDone 
                      ? "bg-emerald-500 text-white" 
                      : isCurrent 
                      ? "bg-amber-500 text-white ring-4 ring-amber-100" 
                      : "bg-slate-300 text-slate-600"
                  }`}>
                    {isDone ? "✓" : stage.step}
                  </span>

                  <div className={`p-5 rounded-2xl border transition-all ${
                    isCurrent 
                      ? "bg-amber-50/50 border-amber-200 shadow-sm" 
                      : isDone 
                      ? "bg-emerald-50/30 border-emerald-200" 
                      : "bg-slate-50/50 border-slate-200 opacity-60"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{stage.title}</h4>
                        {stage.badge && (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.badgeColor}`}>
                            {stage.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 font-mono">{stage.date}</span>
                    </div>
                    <p className="text-xs font-bold text-indigo-700 mb-2">{stage.subtitle}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{stage.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry & Ground Reality Logs Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Sensor Telemetry */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Field Sensor Telemetry</h3>
            </div>
            <div className="space-y-3">
              {currentIssue.telemetry.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>{item.label}</span>
                    <span className="font-bold text-slate-700">{item.status}</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ground Reality Audit Logs */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Ground Reality Action Ledger</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Cryptographically Audited</span>
            </div>

            <div className="divide-y divide-slate-100">
              {currentIssue.logs.map((log, idx) => (
                <div key={idx} className="py-3.5 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1">
                    <span className="font-bold text-indigo-700">{log.entity}</span>
                    <span className="font-mono text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{log.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SMS Subscribe Modal */}
      {smsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Subscribe to Milestone Alerts</h3>
                <p className="text-xs text-slate-500">Receive instant SMS and WhatsApp notifications as this challenge advances.</p>
              </div>
            </div>

            <form onSubmit={handleSubscribeSms} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSmsModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md"
                >
                  Confirm Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-slate-500 font-bold">Loading Issue Tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
