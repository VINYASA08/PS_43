import { Suspense } from "react";
import type { Metadata } from "next";
import { HelpCenterClient } from "@/components/guidance/Layer3_HelpCenter/HelpCenterClient";

export const metadata: Metadata = {
  title: "Help Center & Statutory Operating Manual | PRAGATI / JSICP",
  description:
    "Official guidance, procedural SOPs, statutory FAQ matrix, IP transfer rules, and emergency help desk directory for citizens, universities, corporate sponsors, and government departments in Jharkhand.",
  keywords: [
    "PRAGATI Help Center",
    "JSICP FAQs",
    "Jharkhand Innovation Policy 2025",
    "DPDP Act 2023",
    "Section 135 Companies Act CSR",
    "NISP 2019 Royalty Split",
    "Civic Grievance Redressal",
    "District Nodal Triage",
  ],
};

function HelpCenterFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Loading Help Center & Operating Manual...</p>
        <p className="text-xs text-slate-400">Government of Jharkhand — Department of Higher & Technical Education</p>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={<HelpCenterFallback />}>
      <HelpCenterClient />
    </Suspense>
  );
}
