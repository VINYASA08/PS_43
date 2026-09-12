"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Users,
  GraduationCap,
  Briefcase,
  Building2,
  PhoneCall,
  Mail,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Scale,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  MapPin,
  X,
  Compass,
  AlertTriangle,
  Send
} from "lucide-react";
import {
  HelpRoleKey,
  ROLE_DOCUMENTATION,
  HELP_CONTACT_INFO,
  GRIEVANCE_LADDER,
  DIALECT_SYNONYMS,
} from "./helpData";
import { HelpFaqAccordion } from "./HelpFaqAccordion";
import { HelpWorkflowDiagram } from "./HelpWorkflowDiagram";

const VALID_ROLES: HelpRoleKey[] = ["citizens", "universities", "industry", "government", "local-body"];

export function HelpCenterClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Safely sanitize initial role from URL query param
  const rawRoleParam = searchParams.get("role");
  const normalizedInitialRole: HelpRoleKey = useMemo(() => {
    if (!rawRoleParam) return "citizens";
    const lower = rawRoleParam.toLowerCase();
    if (lower === "citizen" || lower === "citizens") return "citizens";
    if (lower === "university" || lower === "universities") return "universities";
    if (lower === "industry") return "industry";
    if (lower === "gov" || lower === "government" || lower === "state_admin") return "government";
    if (lower === "local_body" || lower === "local-body" || lower === "ulb" || lower === "pri") return "local-body";
    return "citizens"; // Safe fallback for invalid roles like "alien"
  }, [rawRoleParam]);

  const [activeRole, setActiveRole] = useState<HelpRoleKey>(normalizedInitialRole);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDialectTag, setActiveDialectTag] = useState<string | null>(null);

  // Sync state if URL query param changes externally
  useEffect(() => {
    setActiveRole(normalizedInitialRole);
  }, [normalizedInitialRole]);

  // Handle Role Tab switch and update URL param without reload
  const handleRoleChange = (newRole: HelpRoleKey) => {
    setActiveRole(newRole);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("role", newRole);
      router.replace(`/help?${params.toString()}`, { scroll: false });
    });
  };

  // Handle quick search dialect chips
  const handleDialectTagClick = (tag: string) => {
    if (activeDialectTag === tag) {
      setActiveDialectTag(null);
      setSearchQuery("");
    } else {
      setActiveDialectTag(tag);
      setSearchQuery(tag);
    }
  };

  const currentRoleDoc = ROLE_DOCUMENTATION[activeRole] || ROLE_DOCUMENTATION.citizens;

  // Dialect synonym notice if query matches vernacular
  const dialectMatch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return DIALECT_SYNONYMS[q] || null;
  }, [searchQuery]);

  const roleTabItems = [
    { key: "citizens" as HelpRoleKey, label: "Citizens", icon: Users, desc: "Reporting & Tracking" },
    { key: "universities" as HelpRoleKey, label: "Universities", icon: GraduationCap, desc: "R&D & DPR Claims" },
    { key: "industry" as HelpRoleKey, label: "Industry", icon: Briefcase, desc: "CSR Escrow & ROFR" },
    { key: "government" as HelpRoleKey, label: "Government", icon: Building2, desc: "DNO Triage & Apex" },
    { key: "local-body" as HelpRoleKey, label: "Local Body", icon: Compass, desc: "WhatsApp & Field Redressal" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* 1. Header Banner & Search Workstation */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-12 pb-16 px-4 md:px-8 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb & Statutory Authority */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">
                PRAGATI
              </Link>
              <span>/</span>
              <span className="text-blue-400 font-semibold">Help Center & Operating Manual</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{HELP_CONTACT_INFO.gazetteRef}</span>
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
              Official Guidance & Operating Manual
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Comprehensive operational procedures, statutory rights, IP transfer protocols, and emergency helpline directory for all participants in Jharkhand.
            </p>
          </div>

          {/* Search Input Box with Dialect Synonyms */}
          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search procedures, FAQs, legal rules (e.g. 'khortha', 'chapa-kal', 'ip split', 'escrow', 'rofr')..."
                className="w-full pl-12 pr-10 py-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base shadow-lg transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveDialectTag(null);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dialect synonym notice */}
            {dialectMatch && (
              <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-blue-900/60 border border-blue-700 text-xs text-blue-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  Vernacular Dialect Recognized: <strong>&ldquo;{searchQuery}&rdquo;</strong> maps to <strong>&ldquo;{dialectMatch}&rdquo;</strong> in statutory guidelines.
                </span>
              </div>
            )}

            {/* Dialect Quick Suggestion Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Quick dialect & topic tags:</span>
              {[
                { tag: "khortha", label: "Khortha (Voice)" },
                { tag: "nagpuri", label: "Nagpuri (Voice)" },
                { tag: "chapa-kal", label: "Chapa-kal (Water)" },
                { tag: "nal-jal", label: "Nal-Jal (PWD)" },
                { tag: "ip", label: "IP Split (60-20-20)" },
                { tag: "grant", label: "30-40-30 Escrow" },
                { tag: "whistleblower", label: "Whistleblower Protection" },
              ].map((item) => (
                <button
                  key={item.tag}
                  onClick={() => handleDialectTagClick(item.tag)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[11px] font-medium ${
                    searchQuery.toLowerCase() === item.tag.toLowerCase()
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-8">
        {/* 2. Emergency & State Help Desk Banner */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                    Direct Official Contact
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {HELP_CONTACT_INFO.workingHours}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  State Innovation Council & Data Protection Desk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct contact lines for grievance escalations, whistleblower assistance, and DPDP compliance queries.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
              <a
                href={`tel:${HELP_CONTACT_INFO.helplinePhone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 transition-colors group cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-[11px] font-medium text-slate-500">Helpline Phone</span>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                    {HELP_CONTACT_INFO.helplinePhone}
                  </span>
                </div>
              </a>

              <a
                href={`mailto:${HELP_CONTACT_INFO.dpoEmail}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 transition-colors group cursor-pointer"
              >
                <Mail className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-[11px] font-medium text-slate-500">Data Protection Officer</span>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate max-w-[170px]">
                    {HELP_CONTACT_INFO.dpoEmail}
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* 3. 5 Role Selector Navigation Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Select Participant Desk
            </h2>
            <span className="text-xs text-slate-400">5 Statutory Roles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {roleTabItems.map((tab) => {
              const isSelected = activeRole === tab.key;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.key}
                  onClick={() => handleRoleChange(tab.key)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <TabIcon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                  <span className={`block font-bold text-sm ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {tab.label}
                  </span>
                  <span className={`block text-xs mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Active Role Desk Overview Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentRoleDoc.badgeColor}`}>
                  {currentRoleDoc.badge}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentRoleDoc.department}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {currentRoleDoc.title}
              </h2>
            </div>
            <div className="text-right self-start md:self-auto">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Statutory Basis
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {currentRoleDoc.statutoryRef}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-4 leading-relaxed">
            {currentRoleDoc.description}
          </p>

          {/* Key Directives & Highlights */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Statutory Directives & Operational Guarantees
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentRoleDoc.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium leading-normal">
                    {h}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Procedural Step-by-Step SOPs */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Standard Operating Procedures (SOPs)
            </h4>

            <div className="space-y-4">
              {currentRoleDoc.proceduralGuides.map((guide) => (
                <div key={guide.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {guide.category}
                    </span>
                    {guide.statutoryRef && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Ref: {guide.statutoryRef}
                      </span>
                    )}
                  </div>

                  <h5 className="text-base font-bold text-slate-900 mb-1">
                    {guide.title}
                  </h5>
                  <p className="text-xs text-slate-500 mb-4">
                    {guide.summary}
                  </p>

                  <div className="space-y-2">
                    {guide.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed mt-0.5">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Visual Lifecycle Workflow Pipeline */}
        <HelpWorkflowDiagram />

        {/* 6. Master Statutory FAQ Accordion */}
        <HelpFaqAccordion activeRole={activeRole} searchQuery={searchQuery} />

        {/* 7. 3-Tier Grievance Redressal & Escalation Workflow */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Section 17 Governance Framework (Table 21)
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                3-Tier Statutory Grievance Redressal & Escalation Ladder
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                If your submission, academic RFP claim, or escrow release faces administrative delays or procedural disputes, you are protected by a statutory 3-tier escalation ladder.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {GRIEVANCE_LADDER.map((lvl) => (
              <div key={lvl.level} className="p-5 rounded-md bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      L{lvl.level}
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {lvl.slaResolution}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {lvl.name}
                  </h4>
                  <span className="block text-xs font-semibold text-slate-600 mb-2">
                    Authority: {lvl.authority}
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {lvl.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                  <strong>Trigger:</strong> {lvl.escalationTrigger}
                </div>
              </div>
            ))}
          </div>

          {/* Grievance Submission Callout */}
          <div className="mt-6 p-4 rounded-md bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Need to file a formal statutory grievance or escalation?
                </span>
                <span className="text-xs text-slate-600">
                  Email the Designated Grievance Officer at <strong>{HELP_CONTACT_INFO.grievanceEmail}</strong> quoting your tracking ID.
                </span>
              </div>
            </div>
            <a
              href={`mailto:${HELP_CONTACT_INFO.grievanceEmail}?subject=Grievance%20Escalation%20Request`}
              className="px-4 py-2 rounded-md bg-[#13528A] hover:bg-[#0E3D66] text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Grievance Memo
            </a>
          </div>
        </div>

        {/* 8. Quick Navigation Footer Banner */}
        <div className="p-6 rounded-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-white mb-1">
              Ready to take action on the PRAGATI platform?
            </h4>
            <p className="text-xs text-slate-400">
              Return to your designated portal or file a new community problem statement.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Report Civic Problem
            </Link>
            <Link
              href="/track"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Track Existing Docket
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
