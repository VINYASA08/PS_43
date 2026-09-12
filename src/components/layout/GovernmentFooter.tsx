"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Building2,
  HelpCircle,
  Scale,
  Clock,
} from "lucide-react";
import { useGuidanceStore } from "@/components/guidance/store";
import { DpdpBadge } from "@/components/guidance/Layer4_LegalFooter/DpdpBadge";

export function GovernmentFooter() {
  const openPrivacyPolicyModal = useGuidanceStore((state) => state.openPrivacyPolicyModal);
  const openTermsModal = useGuidanceStore((state) => state.openTermsModal);

  // Dynamic Last Updated date safely calculated client-side to prevent SSR hydration mismatch
  const [lastUpdated, setLastUpdated] = useState("September 11, 2026");

  useEffect(() => {
    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(now);
      setLastUpdated(formatted);
    } catch {
      // Fallback to default
    }
  }, []);

  return (
    <footer role="contentinfo" className="w-full bg-[#07152d] text-slate-200 border-t border-slate-800 text-sm mt-auto">
      {/* Top Statutory Apex Bar */}
      <div className="border-b border-slate-800/80 bg-[#040d1f] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="relative shrink-0 flex items-center justify-center p-1 bg-white rounded-md shadow-sm">
              <Image
                src="/assets/emblem-of-india.svg"
                alt="State Emblem of India"
                width={36}
                height={48}
                className="w-7 sm:w-8 h-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-white tracking-wide text-xs sm:text-sm uppercase">
                  Government of Jharkhand
                </span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-950/90 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  State Innovation Council
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Department of Higher &amp; Technical Education • Gazette Notification JH-SIC-ORD-2026/894
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DpdpBadge variant="footer" />
          </div>
        </div>
      </div>

      {/* Main 4-Column DBIM Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Mandate */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1 bg-white rounded-md shrink-0">
                <Image
                  src="/assets/emblem-of-india.svg"
                  alt=""
                  width={28}
                  height={38}
                  className="w-6 h-auto"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  PRAGATI <span className="text-xs font-normal text-slate-400">/ JSICP</span>
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium">
                  Societal Innovation Portal
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Jharkhand Societal Innovation Collaboration Portal — Bridging grassroots citizen challenges with academia and CSR industry partners across all 24 districts.
            </p>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Geographic Mandate</span>
              </div>
              <p className="text-xs text-slate-300">
                All 24 Districts of Jharkhand • 260+ Administrative Blocks
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F47B20] flex items-center gap-1.5">
              <span>Quick Navigation</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/"
                  className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
                  <span>Citizen Intake (/submit)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" aria-hidden="true" />
                  <span>Track Status (/track)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                  <span>Help Center (/help)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" aria-hidden="true" />
                  <span>Guidelines &amp; Gazette (/guidelines)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/accountability"
                  className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" aria-hidden="true" />
                  <span>Accountability Index (/accountability)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                  <span>Site Map (/sitemap)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Statutory & Legal Framework */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F47B20] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Legal &amp; Statutory</span>
            </h4>
            <ul className="space-y-2 text-xs">
              {/* Prominent National Portal link */}
              <li>
                <a
                  href="https://india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1"
                  aria-label="National Portal of India (india.gov.in opens in new tab)"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span className="font-medium text-white">National Portal (india.gov.in)</span>
                </a>
              </li>

              {/* DPDP Act Disclosures */}
              <li>
                <button
                  type="button"
                  onClick={openPrivacyPolicyModal}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>DPDP Act 2023 Disclosures</span>
                </button>
              </li>

              {/* Whistleblower Policy */}
              <li>
                <button
                  type="button"
                  onClick={openPrivacyPolicyModal}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Whistleblower Protection Policy</span>
                </button>
              </li>

              {/* RTI Portal */}
              <li>
                <a
                  href="https://rti.jharkhand.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span>RTI Portal (rti.jharkhand.gov.in)</span>
                </a>
              </li>

              {/* Grievance Redressal */}
              <li>
                <Link
                  href="/help"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 -ml-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Grievance Redressal Ladder</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Directorate */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F47B20] flex items-center gap-1.5">
              <span>Contact Support</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Helpdesk Email:</span>
                  <a
                    href="mailto:support-pragati@jharkhand.gov.in"
                    className="text-white hover:text-emerald-400 font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded"
                  >
                    support-pragati@jharkhand.gov.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Toll-Free Helpline:</span>
                  <span className="text-white font-mono font-semibold">1800-345-6578</span>
                  <span className="text-slate-400 text-[11px] block">/ +91 94311 00000</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Working Hours:</span>
                  <span className="text-slate-200">Monday to Friday, 9:30 AM – 5:30 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Directorate Address:</span>
                  <span className="text-slate-200">
                    Department of Higher &amp; Technical Education, Government of Jharkhand, Ranchi – 834002
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-[#040d1f] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-2.5 text-center md:text-left">
          <div className="space-y-0.5">
            <p className="font-medium text-slate-300">
              © 2026 Government of Jharkhand. All Rights Reserved.
            </p>
            <p className="text-[11px] text-slate-500">
              Department of Higher &amp; Technical Education • JSICP PRAGATI
            </p>
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-xs flex-wrap justify-center">
            <button
              type="button"
              onClick={openPrivacyPolicyModal}
              className="hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={openTermsModal}
              className="hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1"
            >
              Terms of Use
            </button>
            <span>•</span>
            <Link
              href="/sitemap"
              className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1 font-medium text-emerald-400"
            >
              Site Map
            </Link>
            <span>•</span>
            <Link
              href="/help"
              className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A] rounded px-1"
            >
              Help Center
            </Link>
            <span>•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Last Updated: {lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default GovernmentFooter;
