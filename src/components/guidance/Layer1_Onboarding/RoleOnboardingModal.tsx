"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Landmark,
  Building2,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Lock,
  FileCheck,
  ShieldCheck,
  Scale,
  Award,
  Zap,
  Users,
  Coins,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Info,
  MapPin,
  QrCode,
  MessageSquare
} from "lucide-react";
import { useGuidanceStore } from "../store";
import { GuidanceRole } from "../types";

interface StepDetail {
  step: number;
  badge: string;
  heading: string;
  subheading: string;
  body: string;
  points: { title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[];
  callout?: string;
}

interface RoleConfig {
  role: GuidanceRole;
  displayName: string;
  title: string;
  subtitle: string;
  statutoryAuthority: string;
  themeColor: string;
  accentBg: string;
  accentBorder: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: StepDetail[];
}

const ROLE_CONFIGS: Record<Exclude<GuidanceRole, "citizen">, RoleConfig> = {
  university: {
    role: "university",
    displayName: "University",
    title: "Academic R&D & Innovation Cell Workstation Guide",
    subtitle: "Higher Education Institutes (HEIs) & Interdisciplinary Research Teams",
    statutoryAuthority: "Jharkhand Student Research and Innovation Policy, 2025 & NISP 2019",
    themeColor: "indigo",
    accentBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    accentBorder: "border-indigo-500/40",
    icon: GraduationCap,
    steps: [
      {
        step: 1,
        badge: "STEP 1 OF 3 • ELIGIBILITY & CLAIM RACE",
        heading: "Institutional Eligibility & AI Match Claiming",
        subheading: "Accredited Higher Education Institutes across 24 Districts",
        body: "Under the Jharkhand Student Research and Innovation Policy 2025, 22 university cells are connected to a ₹1,280 Cr initiative. Institutions with NAAC 'A' or NIRF Top 200 ranking hold exclusive access to civic challenge dockets.",
        points: [
          {
            title: "NIRF / NAAC Accreditation Validation",
            desc: "Only accredited institutions with verified research laboratory facilities and registered institutional domains (.ac.in / .edu.in) may claim research dockets.",
            icon: Award,
          },
          {
            title: "72-Hour AI Match Priority Window",
            desc: "High-priority citizen grievances are semantically matched to the top 3 best-suited universities based on faculty patents and lab capacity.",
            icon: Zap,
          },
          {
            title: "Atomic Claim Condition Lock",
            desc: "The first eligible university whose Principal Investigator clicks 'Claim' locks exclusive research rights to the challenge docket.",
            icon: Lock,
          },
          {
            title: "Conflict of Interest (Form F-02)",
            desc: "Faculty PIs must execute mandatory statutory COI declarations affirming zero undisclosed commercial ties prior to grant release.",
            icon: FileCheck,
          },
        ],
        callout: "Mandate: Each university must not exceed 5 concurrently active challenge claims to ensure rigorous milestone delivery.",
      },
      {
        step: 2,
        badge: "STEP 2 OF 3 • TEAMS & MILESTONES",
        heading: "Multidisciplinary Teams & 30-40-30 Escrow",
        subheading: "NEP 2020 Academic Bank of Credits & Tranche Scheduling",
        body: "Projects require interdisciplinary collaboration connecting Engineering, Social Sciences, and Design faculties. Grants are disbursed through milestone-locked escrow tranches.",
        points: [
          {
            title: "NEP 2020 Academic Credits (ABC)",
            desc: "Enrolled student researchers earn formal academic credits toward graduation via the Academic Bank of Credits framework.",
            icon: Users,
          },
          {
            title: "Tranche 1 (30%) — DPR Approval",
            desc: "Unlocked upon submission and technical sanction of the Detailed Project Report, engineering blueprints, and testing protocols.",
            icon: Coins,
          },
          {
            title: "Tranche 2 (40%) — Working Lab Prototype",
            desc: "Released following verified laboratory demonstration advancing technology readiness to TRL 4-6 with Industry Mentor sign-off.",
            icon: TrendingUp,
          },
          {
            title: "Tranche 3 (30%) — Field Pilot & Deployment",
            desc: "Disbursed after real-world field deployment, citizen satisfaction inspection, and documented Gram Sabha consent in rural blocks.",
            icon: CheckCircle2,
          },
        ],
        callout: "Governance: Funds are held in state-supervised escrow and released exclusively upon verified milestone benchmarks.",
      },
      {
        step: 3,
        badge: "STEP 3 OF 3 • IP RIGHTS & CO-OWNERSHIP",
        heading: "Statutory 60-20-20 Royalty Split & Inventorship",
        subheading: "Indian Patents Act 1970 & NISP 2019 Technology Transfer",
        body: "All gross commercial licensing revenues and royalties earned by the university adhere to the mandatory 60-20-20 statutory distribution model.",
        points: [
          {
            title: "60% — Inventing Research Team",
            desc: "Allocated as: 30% to Faculty Principal Investigator (PI), 20% to Student Researchers, and 10% to Technical Staff.",
            icon: Award,
          },
          {
            title: "20% — University R&D Incubator Corpus",
            desc: "Reinvested directly into institutional laboratory facilities, patent attorney prosecution fees, and future student seed grants.",
            icon: Building2,
          },
          {
            title: "20% — State Innovation Escrow Fund",
            desc: "Returned to the statewide innovation pool to fund future grassroots civic challenges across under-resourced districts.",
            icon: Landmark,
          },
          {
            title: "True & First Student Inventorship",
            desc: "Per Indian Patent Act Section 6, student researchers and faculty guides must be legally designated as Inventors on all official patent filings.",
            icon: Scale,
          },
        ],
        callout: "Public Good License: The State Government retains a perpetual, royalty-free license to deploy patented civic solutions across Jharkhand.",
      },
    ],
  },
  industry: {
    role: "industry",
    displayName: "Industry Partner",
    title: "Corporate CSR & Technology Transfer Portal Guide",
    subtitle: "Startups, MSMEs, and Corporate Industry Sponsors",
    statutoryAuthority: "Section 135 & Schedule VII Item (ix)(a), Companies Act 2013",
    themeColor: "emerald",
    accentBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    accentBorder: "border-emerald-500/40",
    icon: Briefcase,
    steps: [
      {
        step: 1,
        badge: "STEP 1 OF 3 • CORPORATE VERIFICATION",
        heading: "MCA CIN Validation & 30-Day Priority Gate",
        subheading: "Corporate Registration & Public Challenge Discovery",
        body: "Registered corporate entities, MSMEs, and DPIIT-recognized startups partner with Jharkhand universities to sponsor prototypes and license breakthrough civic innovations.",
        points: [
          {
            title: "Corporate CIN & DPIIT Validation",
            desc: "All corporate sponsor accounts undergo verification of Ministry of Corporate Affairs CIN or active Udyam certificates by State Government Admins.",
            icon: Award,
          },
          {
            title: "30-Day Public Priority Window",
            desc: "Civic challenges undergo a 30-day academic incubation phase before commercial industry sponsorship matching unlocks.",
            icon: Clock,
          },
          {
            title: "Filter by District, Domain & TRL",
            desc: "Explore verified problem statements filtered by technology readiness level (TRL 1-9), district urgency, and funding capital requirements.",
            icon: Zap,
          },
          {
            title: "Designated Technical Mentorship",
            desc: "Assign senior corporate engineers to mentor student research teams and conduct monthly technical design reviews on lab Kanban boards.",
            icon: Users,
          },
        ],
        callout: "Statutory Shield: All corporate participation is governed by Schedule VII of the Companies Act 2013.",
      },
      {
        step: 2,
        badge: "STEP 2 OF 3 • SPONSORSHIP TIERS & ESCROW",
        heading: "3-Tier Sponsorship Matrix & Form CSR-1",
        subheading: "Section 135 & 80G 100% Tax Exemption Guarantees",
        body: "Choose the sponsorship tier aligned with your CSR budget or infrastructure resources. All funds are deposited into state-monitored escrow accounts.",
        points: [
          {
            title: "Tier 1: Mentorship Only (Zero Capital)",
            desc: "Provide >=10 advisory hours/month. 0% IP claim; priority campus recruitment and official Government CSR Advisory Citation.",
            icon: Users,
          },
          {
            title: "Tier 2: In-Kind Lab Equipment Access",
            desc: "Supply specialized cleanroom, testing, or compute resources. 15% to 30% negotiated commercial licensing rights.",
            icon: Building2,
          },
          {
            title: "Tier 3: Direct CSR Capital Sponsorship",
            desc: "Full prototype and pilot funding (₹1 Lakh to ₹50+ Lakhs). Default 50/50 commercial royalty co-ownership (negotiable to 60/40).",
            icon: Coins,
          },
          {
            title: "Automated Form CSR-1 Tax Filing",
            desc: "Platform auto-generates statutory Form CSR-1 filings for MCA audit compliance with 100% tax deduction under Section 80G.",
            icon: FileText,
          },
        ],
        callout: "Escrow Safety: Sponsor funds are released in 30-40-30 tranches strictly upon dual digital sign-off from University PI and District Technology Officer.",
      },
      {
        step: 3,
        badge: "STEP 3 OF 3 • 180-DAY COMMERCIAL ROFR",
        heading: "180-Day Exclusive ROFR & Licensing Window",
        subheading: "Commercialization Rights and Patent Maintenance Protocols",
        body: "Sponsoring industry partners hold exclusive priority to commercialize resulting patents before third-party non-exclusive licensing is permitted.",
        points: [
          {
            title: "180-Day Right of First Refusal (ROFR)",
            desc: "Exclusive window from prototype validation date to execute commercial manufacturing, sales, and distribution licenses.",
            icon: Clock,
          },
          {
            title: "Patent Prosecution & Annuities",
            desc: "Corporate sponsors acquiring commercial licenses cover 100% of patent attorney drafting and annual statutory maintenance fees.",
            icon: FileCheck,
          },
          {
            title: "24-Month March-In Commercial Clause",
            desc: "If the commercial licensee fails to manufacture or deploy within 24 months, rights revert to the university for non-exclusive licensing.",
            icon: AlertTriangle,
          },
          {
            title: "Civic Open-Source Reversion",
            desc: "Civic algorithms and software models revert to permissive open-source (MIT/Apache 2.0) after 24 months to prevent vendor lock-in.",
            icon: Scale,
          },
        ],
        callout: "Sovereign Public Good: Public schools, health clinics, and municipal utilities receive free lifetime deployment of all platform technologies.",
      },
    ],
  },
  government: {
    role: "government",
    displayName: "Government Official",
    title: "Statewide Governance & District Triage Directives",
    subtitle: "District Nodal Officers & State Innovation Council Administrators",
    statutoryAuthority: "Department of Higher & Technical Education, Government of Jharkhand",
    themeColor: "amber",
    accentBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    accentBorder: "border-amber-500/40",
    icon: Landmark,
    steps: [
      {
        step: 1,
        badge: "STEP 1 OF 3 • AUTHENTICATION & TRIAGE SLA",
        heading: "NIC Domain Verification & 48-Hour Triage SLA",
        subheading: "District Nodal Officers (DNO) Statutory Responsibilities",
        body: "District Nodal Officers serve as the frontline gatekeepers for civic dockets across Jharkhand's 24 districts, enforcing rapid administrative triage.",
        points: [
          {
            title: "NIC Domain & TOTP 2FA Enforcement",
            desc: "Administrative access requires verified .gov.in or .nic.in official emails with mandatory time-based one-time password (TOTP) 2FA.",
            icon: Lock,
          },
          {
            title: "48-Hour Statutory Triage SLA",
            desc: "All citizen submissions must be reviewed, verified for jurisdiction, and triaged within 48 hours of initial ledger timestamp.",
            icon: Clock,
          },
          {
            title: "Ground Evidence Inspection",
            desc: "Review fuzzed 500m GPS pins, photos, and AI Whisper audio transcripts to confirm genuine community infrastructure requirements.",
            icon: ShieldCheck,
          },
          {
            title: "Class 3 DSC Registration",
            desc: "District Technology Officers must register Class 3 Digital Signature Certificates to authorize statutory escrow disbursements.",
            icon: FileCheck,
          },
        ],
        callout: "SLA Warning: Unassigned dockets exceeding 48 hours trigger automated red alerts on the State Apex Command Center.",
      },
      {
        step: 2,
        badge: "STEP 2 OF 3 • TRI-TRACK TRIAGE GATES",
        heading: "Tri-Track Triage Decision Gates & 24-District GIS",
        subheading: "Routing to Academia, Line Departments, or Formal Rejection",
        body: "DNOs operate three statutory decision gates to ensure appropriate routing of citizen challenges.",
        points: [
          {
            title: "Route to Academia (Track A)",
            desc: "Complex engineering, clean water, or clean tech challenges dispatched to the 3-way university AI match queue.",
            icon: GraduationCap,
          },
          {
            title: "Divert to Line Department (Track B/C)",
            desc: "Routine municipal or PWD maintenance routed immediately to Urban Local Bodies with Day 0-3-7 SLA tracking.",
            icon: Building2,
          },
          {
            title: "Statutory Rejection Gate",
            desc: "Requires mandatory written legal justification (frivolous, outside district boundaries, or duplicate).",
            icon: AlertTriangle,
          },
          {
            title: "24-District GIS Telemetry Heatmap",
            desc: "Real-time visualization of problem density, active university teams, and funding distribution across all 24 districts.",
            icon: MapPin,
          },
        ],
        callout: "Automated Escalation: Municipal tickets unaddressed after 7 days automatically escalate directly to the District Magistrate.",
      },
      {
        step: 3,
        badge: "STEP 3 OF 3 • OVERSIGHT & REGISTRY",
        heading: "Valley of Death Intervention & Innovation Registry",
        subheading: "Inter-Department Clearances & Sovereign Master Overrides",
        body: "State Innovation Council administrators exercise master oversight authority to clear bottlenecks and archive legal agreements.",
        points: [
          {
            title: "Valley of Death Monitoring (>14 Days)",
            desc: "Automated telemetry flags any academic project stalled for >14 days without lab milestones for state panel intervention.",
            icon: AlertTriangle,
          },
          {
            title: "Single Window Clearance (SWEC)",
            desc: "High-priority societal projects receive inter-departmental statutory clearances (Forestry, Mining, Water) within 30 days.",
            icon: Zap,
          },
          {
            title: "State Registry Archival (JSICP-REG-2026)",
            desc: "Executed bilateral IP agreements and Class 3 DSC hashes are permanently archived under immutable state registry identifiers.",
            icon: FileCheck,
          },
          {
            title: "Corporate KYC Adjudication",
            desc: "Review and approve pending corporate CSR sponsor accounts before active challenge bidding is permitted.",
            icon: Award,
          },
        ],
        callout: "Registry ID: Format JSICP-REG-2026-XXXX provides immutable audit compliance for Comptroller and Auditor General (CAG) inspection.",
      },
    ],
  },
  local_body: {
    role: "local_body",
    displayName: "Local Body / Line Dept",
    title: "Rapid Civic Redressal: Local Body Integration Guide",
    subtitle: "Urban Local Bodies (ULBs), PRIs & Line Departments (PWD, Municipal Corp)",
    statutoryAuthority: "Department of Urban Development & Panchayati Raj, Government of Jharkhand",
    themeColor: "teal",
    accentBg: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    accentBorder: "border-teal-500/40",
    icon: Building2,
    steps: [
      {
        step: 1,
        badge: "STEP 1 OF 3 • ZERO-DASHBOARD REDRESSAL",
        heading: "WhatsApp Cloud API & Email Ticket Delivery",
        subheading: "Lightweight Field Worker Operations Without Desktop Software",
        body: "Field linemen, municipal engineers, and water sanitation squads do not need desktop dashboards or software training to resolve civic dockets.",
        points: [
          {
            title: "WhatsApp Cloud API Dispatches",
            desc: "Field supervisors receive work orders directly via WhatsApp with problem description, fuzzed location, and citizen photos.",
            icon: MessageSquare,
          },
          {
            title: "One-Word Closure: 'DONE' + Photo",
            desc: "Field workers reply directly to the WhatsApp message with 'DONE' and a photo of the completed repair to close the ticket.",
            icon: CheckCircle2,
          },
          {
            title: "Structured Executive Email Dockets",
            desc: "Executive Engineers receive structured daily action manifests with direct one-click status update buttons.",
            icon: FileText,
          },
          {
            title: "Printable QR-Code Work Orders",
            desc: "Supervisors can print physical PDF work orders with cryptographic QR codes for field inspection crews.",
            icon: QrCode,
          },
        ],
        callout: "Simplicity First: Field personnel focus on physical repairs while automated webhooks update the citizen tracking ledger.",
      },
      {
        step: 2,
        badge: "STEP 2 OF 3 • STATUTORY SLA LADDER",
        heading: "Day 0-3-7 SLA Ladder & DM Escalation",
        subheading: "Automated Statutory Enforcement for Track C Civic Redressal",
        body: "Strict statutory deadlines govern municipal and public works tickets to prevent bureaucratic stalling.",
        points: [
          {
            title: "Day 0: Ticket Assignment",
            desc: "Ticket dispatched to the jurisdictional Urban Local Body or Panchayat line department within 2 hours of DNO triage.",
            icon: Clock,
          },
          {
            title: "Day 3: Automated Reminder",
            desc: "Automated SMS and email reminders sent to Executive Engineer if ticket remains unacknowledged.",
            icon: Info,
          },
          {
            title: "Day 7: SLA Breach & DM Escalation",
            desc: "Automatic escalation to District Magistrate with amber alert if physical work has not commenced.",
            icon: AlertTriangle,
          },
          {
            title: "Day 14: State Nodal Officer Escalation",
            desc: "Critical escalation to State Secretariat Nodal Officer; highlighted in statewide Valley of Death telemetry.",
            icon: ShieldCheck,
          },
        ],
        callout: "Accountability: Ticket resolution times are publicly tracked on the State Civic Accountability Index.",
      },
      {
        step: 3,
        badge: "STEP 3 OF 3 • TRIBAL & RURAL CONSENT",
        heading: "Gram Sabha Consent Protocol & Scheduled Areas",
        subheading: "PESA Act 1996 & Tribal Community Consultation Guarantees",
        body: "Physical infrastructure works in rural and Scheduled Tribe villages require formal community consensus before implementation.",
        points: [
          {
            title: "Gram Sabha Council Resolution",
            desc: "Documented written resolution from the village Gram Sabha council must be uploaded prior to starting field construction.",
            icon: FileCheck,
          },
          {
            title: "Community Traditional Rights Shield",
            desc: "Civic installations must respect traditional forest rights, sacred groves (Sarna Sthal), and community water rights.",
            icon: ShieldCheck,
          },
          {
            title: "Bilingual Citizen Feedback",
            desc: "Upon repair completion, citizens receive automated WhatsApp/SMS satisfaction polls in regional dialects.",
            icon: Users,
          },
          {
            title: "Photographic Proof Verification",
            desc: "Before-and-after photo comparisons are inspected by the District Technology Cell before ticket status marks 'Resolved'.",
            icon: Award,
          },
        ],
        callout: "Tribal Accord: Adherence to Panchayats (Extension to Scheduled Areas) Act, 1996 is strictly enforced.",
      },
    ],
  },
};

export function RoleOnboardingModal() {
  const isOpen = useGuidanceStore(
    (state) => state.isOnboardingOpen && state.activeOnboardingRole !== "citizen"
  );
  const activeRole = useGuidanceStore((state) => state.activeOnboardingRole);
  const openOnboarding = useGuidanceStore((state) => state.openOnboarding);
  const completeOnboarding = useGuidanceStore((state) => state.completeOnboarding);
  const closeOnboarding = useGuidanceStore((state) => state.closeOnboarding);

  const [currentStep, setCurrentStep] = useState(1);

  // Safe fallback to university if role is invalid or citizen
  const effectiveRole: Exclude<GuidanceRole, "citizen"> =
    activeRole !== "citizen" && activeRole in ROLE_CONFIGS
      ? (activeRole as Exclude<GuidanceRole, "citizen">)
      : "university";

  const config = ROLE_CONFIGS[effectiveRole];

  // Reset step when modal or role changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen, activeRole]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleDismiss = () => {
    completeOnboarding(effectiveRole);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSelectRole = (role: Exclude<GuidanceRole, "citizen">) => {
    openOnboarding(role);
    setCurrentStep(1);
  };

  const activeData = config.steps[currentStep - 1];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-slate-950/85 transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-onboarding-title"
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/90 rounded-lg shadow-lg overflow-hidden z-10 text-white"
          >
            {/* Top Bar with Role Switcher */}
            <div className="px-5 sm:px-8 py-4 border-b border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 ${config.accentBg}`}
                >
                  <config.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                      Orientation Guide
                    </span>
                    <span className="text-xs text-slate-400 hidden md:inline font-mono">
                      {config.statutoryAuthority}
                    </span>
                  </div>
                  <h2
                    id="role-onboarding-title"
                    className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5"
                  >
                    {config.title}
                  </h2>
                </div>
              </div>

              {/* Role Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
                {(Object.keys(ROLE_CONFIGS) as Array<Exclude<GuidanceRole, "citizen">>).map(
                  (roleKey) => {
                    const rCfg = ROLE_CONFIGS[roleKey];
                    const isSelected = effectiveRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => handleSelectRole(roleKey)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-sm border border-slate-700"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {rCfg.displayName}
                      </button>
                    );
                  }
                )}
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-1 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 shrink-0 flex">
              <div
                className="bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
              {/* Step Header */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400 font-mono">
                  {activeData.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeData.heading}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-300">
                  {activeData.subheading}
                </p>
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed pt-1">
                  {activeData.body}
                </p>
              </div>

              {/* 4 Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {activeData.points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <pt.icon className="w-4 h-4 shrink-0 text-amber-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                        {pt.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300/90 leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Statutory Callout Box */}
              {activeData.callout && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {activeData.callout}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="px-5 sm:px-8 py-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
              {/* Dots indicator */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((stepNum) => (
                  <button
                    key={stepNum}
                    type="button"
                    onClick={() => setCurrentStep(stepNum)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentStep === stepNum
                        ? "w-6 bg-amber-500"
                        : "w-2 bg-slate-700 hover:bg-slate-600"
                    }`}
                    aria-label={`Go to step ${stepNum}`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    Complete Orientation <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
