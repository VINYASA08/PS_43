"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Building2, 
  HelpCircle, 
  FileText, 
  Scale, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Lock 
} from "lucide-react";
import { DpdpBadge } from "./DpdpBadge";
import { useGuidanceStore } from "../store";

export function LegalFooter() {
  const openPrivacyPolicyModal = useGuidanceStore((state) => state.openPrivacyPolicyModal);
  const openTermsModal = useGuidanceStore((state) => state.openTermsModal);

  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800 text-sm mt-auto">
      {/* Top Statutory Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
              झ
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white tracking-wide text-sm">
                  GOVERNMENT OF JHARKHAND
                </span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  State Innovation Council
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Department of Higher & Technical Education • Gazette Notification JH-SIC-ORD-2026/894
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DpdpBadge variant="footer" />
          </div>
        </div>
      </div>

      {/* Main 4-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Platform Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="text-emerald-400">PRAGATI</span>
              <span className="text-xs font-normal text-slate-400">/ JSICP</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Partnerships of Research & Academia for Grassroots Advancement and Technological Innovation. Connecting grassroots citizens, academic researchers across 22 universities, corporate CSR partners, and district administrators to solve Jharkhand&apos;s real-world societal challenges.
            </p>
            <div className="pt-2">
              <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-2">
                Coverage
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>All 24 Districts of Jharkhand • 260+ Blocks</span>
              </p>
            </div>
          </div>

          {/* Column 2: Portals & Workspaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Portals & Workspaces</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/submit" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Citizen Intake Portal (/submit)</span>
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Grievance Tracking Engine (/track)</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/university" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>University Innovation Desk</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/industry" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Corporate CSR & Industry Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/gov" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span>District Nodal Triage Gate</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/state" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>State Command Center</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Statutory & Legal Framework */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Statutory Framework</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={openPrivacyPolicyModal}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Privacy Policy & DPDP Disclosures</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openTermsModal}
                  className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Terms of Platform Use</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openPrivacyPolicyModal}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>DPDP Act 2023 Compliance Rule 3</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openPrivacyPolicyModal}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Jharkhand Whistleblower Protection</span>
                </button>
              </li>
              <li>
                <a 
                  href="https://rti.jharkhand.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Right to Information (RTI) Portal</span>
                </a>
              </li>
              <li>
                <Link href="/help" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Help Center & Operating Manual</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Policy Compliance Accreditations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Policy Accreditations</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-slate-200 block">NISP 2019 Compliant</span>
                <span className="text-[11px] text-slate-500">60-20-20 Royalty Distribution Model</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-slate-200 block">NEP 2020 Academic Credits</span>
                <span className="text-[11px] text-slate-500">Academic Bank of Credits (ABC) Integration</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-slate-200 block">Companies Act 2013 Sec 135</span>
                <span className="text-[11px] text-slate-500">Schedule VII Item (ix)(a) CSR 100% Tax Deductible</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-slate-200 block">Indian Patents Act 1970</span>
                <span className="text-[11px] text-slate-500">True & First Student/Faculty Inventors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency & Grievance Contact Banner */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Data Protection Officer (DPO):</span>
              <a href="mailto:dpo-pragati@jharkhand.gov.in" className="text-white hover:text-emerald-400 font-mono">
                dpo-pragati@jharkhand.gov.in
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Civic Grievance Helpline (Toll-Free):</span>
              <span className="text-white font-mono">1800-345-6578 / +91 94311 00000</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Directorate Office:</span>
              <span className="text-white">Higher & Technical Education, Ranchi – 834002</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Copyright Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            © 2026 Government of Jharkhand. All Rights Reserved. Built for Smart India Hackathon (SIH 2026) Problem Statement 26043.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <button
              type="button"
              onClick={openTermsModal}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <span>•</span>
            <Link href="/help" className="hover:text-white transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
