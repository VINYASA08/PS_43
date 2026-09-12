import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Home,
  FilePlus,
  Search,
  MessageSquare,
  Sparkles,
  BarChart3,
  GraduationCap,
  Building2,
  Shield,
  HelpCircle,
  FileText,
  Lock,
  ExternalLink,
  MapPin,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Site Map | PRAGATI Portal (JSICP)",
  description:
    "Comprehensive site directory and navigation hierarchy for the Jharkhand Societal Innovation Collaboration Portal.",
};

interface SitemapSection {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  links: {
    title: string;
    href: string;
    description: string;
    isExternal?: boolean;
    badge?: string;
  }[];
}

const sitemapData: SitemapSection[] = [
  {
    title: "1. Citizen Engagement & Grassroots Intake",
    description: "Public portals for crowdsourcing, reporting, and tracking societal challenges.",
    icon: Compass,
    links: [
      {
        title: "Portal Home",
        href: "/",
        description: "Homepage, problem search, open challenges feed, and high-level KPIs.",
      },
      {
        title: "Report a Problem (/submit)",
        href: "/submit",
        description: "Submit grassroots issues with GPS geotagging, photos, and video evidence.",
        badge: "Intake",
      },
      {
        title: "Track Grievance Status (/track)",
        href: "/track",
        description: "Real-time SLA tracking, triaging stage, and university claim status.",
      },
      {
        title: "WhatsApp Intake Bridge (/whatsapp-intake)",
        href: "/whatsapp-intake",
        description: "Jan-Aawaz conversational simulator for low-bandwidth citizen intake.",
      },
      {
        title: "Field Solutions Showcase (/showcase)",
        href: "/showcase",
        description: "Demonstration of deployed grassroots innovations across Jharkhand districts.",
      },
      {
        title: "District Accountability Index (/accountability)",
        href: "/accountability",
        description: "Comparative resolution speed, district rankings, and block-level response rates.",
      },
    ],
  },
  {
    title: "2. Higher Education & Academic Research",
    description: "Workspaces for universities, researchers, and technical institutes.",
    icon: GraduationCap,
    links: [
      {
        title: "University R&D Desk (/dashboard/university)",
        href: "/dashboard/university",
        description: "Triage queue, claimed problems, inter-disciplinary teams, and DPR submissions.",
        badge: "Academia",
      },
      {
        title: "Submit DPR Proposal (/apply/jh-chal-001)",
        href: "/apply/jh-chal-001",
        description: "Detailed Project Report submission form with budget milestones and lab requirements.",
      },
      {
        title: "Academic Guidelines & IP Terms (/guidelines)",
        href: "/guidelines",
        description: "Statutory framework for patent rights, university royalties, and publication rights.",
      },
    ],
  },
  {
    title: "3. Industry Mentors & CSR Partners",
    description: "Funding, co-sponsorship, and technical mentorship gateways.",
    icon: Building2,
    links: [
      {
        title: "Industry CSR Pipeline (/dashboard/industry)",
        href: "/dashboard/industry",
        description: "CSR escrow fund commitments, mentor review gates, and TRL tracking Kanban.",
        badge: "Industry",
      },
      {
        title: "Escrow Co-funding Review (/dashboard/industry/fund/1)",
        href: "/dashboard/industry/fund/1",
        description: "Tranche disbursement controls, milestone verification, and co-sponsor ledger.",
      },
      {
        title: "CSR Section 135 Mandate (/guidelines)",
        href: "/guidelines",
        description: "Corporate Social Responsibility statutory guidelines and escrow provisions.",
      },
    ],
  },
  {
    title: "4. Government Oversight & District Administration",
    description: "Command and control consoles for state administrators and district nodal officers.",
    icon: Shield,
    links: [
      {
        title: "State Command Center (/dashboard/state)",
        href: "/dashboard/state",
        description: "Chief Secretary state-level analytics, GIS heatmaps, and master override console.",
        badge: "Apex Gov",
      },
      {
        title: "District Nodal Officer Triage (/dashboard/nodal)",
        href: "/dashboard/nodal",
        description: "3-Track triage system: civic diversion, standard resolution, or academia escalation.",
      },
      {
        title: "Statewide GIS Telemetry (/dashboard/gov)",
        href: "/dashboard/gov",
        description: "Spatial mapping of challenges across all 24 Jharkhand districts.",
      },
      {
        title: "Account Handover Portal (/dashboard/settings)",
        href: "/dashboard/settings",
        description: "Successor handover system ensuring administrative continuity across postings.",
      },
    ],
  },
  {
    title: "5. Statutory Disclosures & Compliance",
    description: "Official legal, regulatory, and statutory compliance documentation.",
    icon: FileText,
    links: [
      {
        title: "Comprehensive Help Center (/help)",
        href: "/help",
        description: "Role-specific guidance for Citizens, Universities, Industry, and Nodal Officers.",
      },
      {
        title: "Privacy Policy (/privacy-policy)",
        href: "/privacy-policy",
        description: "Data collection, retention, and DPDP Act 2023 statutory disclosures.",
      },
      {
        title: "National Portal of India (india.gov.in)",
        href: "https://india.gov.in",
        description: "Single-window access to information and services provided by the Government of India.",
        isExternal: true,
        badge: "National",
      },
      {
        title: "Jharkhand RTI Portal (rti.jharkhand.gov.in)",
        href: "https://rti.jharkhand.gov.in",
        description: "Right to Information online filing and tracking for Jharkhand state departments.",
        isExternal: true,
      },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-slate-500">
            <li>
              <Link href="/" className="hover:text-[#13528A] transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-slate-800" aria-current="page">
              Site Map
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#13528A]/10 rounded-md text-[#13528A]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                PRAGATI Portal Site Map
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                GIGW 3.0 / UX4G Compliant Comprehensive Information Architecture Directory
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            This directory provides a structural index of all primary portals, workflows, and statutory
            resources across the Jharkhand Societal Innovation Collaboration Portal. All links are
            verified and maintained for zero dead-ends.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="space-y-8">
          {sitemapData.map((section, idx) => {
            const SectionIcon = section.icon;
            return (
              <section
                key={idx}
                aria-labelledby={`section-heading-${idx}`}
                className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs"
              >
                <div className="flex items-start gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-700 mt-0.5">
                    <SectionIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      id={`section-heading-${idx}`}
                      className="text-lg font-bold text-slate-900 tracking-tight"
                    >
                      {section.title}
                    </h2>
                    <p className="text-xs text-slate-500">{section.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.links.map((link, linkIdx) => {
                    const isExt = link.isExternal;
                    return isExt ? (
                      <a
                        key={linkIdx}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-md border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-[#13528A]/40 hover:shadow-xs transition-all flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-[#13528A]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-sm font-bold text-slate-800 group-hover:text-[#13528A] transition-colors flex items-center gap-1.5">
                              {link.title}
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#13528A]" />
                            </span>
                            {link.badge && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {link.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {link.description}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono mt-3 pt-2 border-t border-slate-100/80">
                          External Government Link
                        </span>
                      </a>
                    ) : (
                      <Link
                        key={linkIdx}
                        href={link.href}
                        className="p-4 rounded-md border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-[#13528A]/40 hover:shadow-xs transition-all flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-[#13528A]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-sm font-bold text-slate-800 group-hover:text-[#13528A] transition-colors">
                              {link.title}
                            </span>
                            {link.badge && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#13528A]/10 text-[#13528A]">
                                {link.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {link.description}
                          </p>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-medium mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between">
                          <span>Verified Route</span>
                          <span className="text-slate-400 font-mono text-[10px]">{link.href}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
