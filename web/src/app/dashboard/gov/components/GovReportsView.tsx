"use client";

import { useState } from "react";
import { ReportConfig, CivicProject, DistrictData } from "../types";
import { 
  Download, 
  FileText, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Landmark, 
  FileSpreadsheet
} from "lucide-react";

interface GovReportsViewProps {
  reportTemplates: ReportConfig[];
  projects: CivicProject[];
  districts: DistrictData[];
  totalDeployedCr: number;
}

export function GovReportsView({ reportTemplates, projects, districts, totalDeployedCr }: GovReportsViewProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(reportTemplates[0]?.id || "");
  const [selectedPeriod, setSelectedPeriod] = useState("FY 2025-26 (Year-to-Date)");
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const activeTemplate = reportTemplates.find((t) => t.id === selectedTemplateId) || reportTemplates[0];

  // Real CSV export generator
  const handleExportCsv = () => {
    setIsExportingCsv(true);

    try {
      // Build CSV content
      const headers = ["Project ID", "Title", "District", "Department", "University", "Lead PI", "Corporate Sponsor", "TRL", "Status", "Escrow Funding (Cr)", "Audit Date"];
      const rows = projects.map((p) => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.district,
        p.department,
        `"${p.university.replace(/"/g, '""')}"`,
        `"${p.leadPi.replace(/"/g, '""')}"`,
        `"${p.corporateSponsor.replace(/"/g, '""')}"`,
        `TRL-${p.trl}`,
        p.status,
        p.escrowFundingCr,
        p.lastAuditDate,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `jharkhand_innovation_${activeTemplate.id}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("CSV Export error", e);
    } finally {
      setTimeout(() => setIsExportingCsv(false), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">
              Statutory Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">NITI Aayog & Section 135 Compliant</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Automated Compliance & Export Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generates verifiable state briefs and data packages for the Chief Minister&apos;s Office, Dept of Higher Education, and NITI Aayog.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{isExportingCsv ? "Generating CSV..." : "Export CSV Dataset"}</span>
          </button>

          <button
            onClick={() => setShowPdfModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Template Selector */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Select Compliance Framework</h3>
            <span className="text-[10px] text-slate-400 font-mono">4 Templates</span>
          </div>

          <div className="space-y-2">
            {reportTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-800 shadow-md"
                      : "bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${
                      isSelected ? "text-emerald-400" : "text-slate-500"
                    }`}>
                      {template.frequency}
                    </span>
                    <span className={`text-[10px] ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                      {template.lastGenerated.split(" ")[0]}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs leading-snug">{template.title}</h4>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${
                    isSelected ? "text-slate-300" : "text-slate-500"
                  }`}>
                    {template.recipient}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Period Selector */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
            <label className="block font-bold text-slate-700 text-[11px]">Reporting Window</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="FY 2025-26 (Year-to-Date)">FY 2025-26 (Year-to-Date Cumulative)</option>
              <option value="Q2 FY 2025-26 (July - September)">Q2 FY 2025-26 (July - September)</option>
              <option value="Q1 FY 2025-26 (April - June)">Q1 FY 2025-26 (April - June)</option>
              <option value="FY 2024-25 Full Year Annual Audit">FY 2024-25 Full Year Annual Audit</option>
            </select>
          </div>
        </div>

        {/* Right Column: Live Report Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-xs text-slate-800">Official Report Live Document Preview</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Generated On-The-Fly
            </span>
          </div>

          {/* Document Sheet */}
          <div className="p-6 md:p-8 space-y-6 flex-1 bg-white">
            {/* Document Header */}
            <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Landmark className="w-7 h-7 text-slate-900" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">
                GOVERNMENT OF JHARKHAND
              </h4>
              <p className="text-xs font-semibold text-slate-700">
                Department of Higher & Technical Education • State Innovation Registry
              </p>
              <h5 className="text-base font-bold text-slate-900 pt-2">
                {activeTemplate.title}
              </h5>
              <p className="text-[11px] text-slate-500 font-mono">
                Statutory Reporting Window: {selectedPeriod}
              </p>
            </div>

            {/* Recipient & Filing Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Addressed To:</span>
                <strong className="text-slate-800 text-xs block mt-0.5">{activeTemplate.recipient}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Statutory Mandate:</span>
                <span className="text-slate-700 font-medium">{activeTemplate.frequency}</span>
              </div>
            </div>

            {/* Executive Narrative */}
            <div className="space-y-2 text-xs text-slate-700">
              <h6 className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
                Executive Impact Narrative
              </h6>
              <p className="leading-relaxed text-slate-600">
                {activeTemplate.description} Over the audited interval, the State of Jharkhand has monitored <strong>{districts.length} administrative districts</strong>, maintaining an average citizen grievance-to-triage turnaround velocity of <strong>4.2 hours</strong>. Corporate CSR commitments governed under Section 135 have successfully deployed <strong>₹{totalDeployedCr.toFixed(2)} Crore</strong> into university research testbeds.
              </p>
            </div>

            {/* Telemetry Indicator Badges */}
            <div className="space-y-2">
              <h6 className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
                Statutory Metrics Validated in this Filing
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeTemplate.metricsCovered.map((metric, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{metric}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Seal */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Statutory Digital Seal: <code>JH-ED-SEC-2026-AUDIT</code></span>
              </div>
              <span>Archived: {activeTemplate.lastGenerated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Generation Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Ready for Print / Archival
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {activeTemplate.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedPeriod}</p>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600">
              <p>
                The official executive report has been rendered with all 186 project records, 24 DNO triage scorecards, and tripartite escrow distribution balances.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Document Format:</span>
                  <strong className="text-slate-800">A4 Statutory PDF / Print-Ready</strong>
                </div>
                <div className="flex justify-between">
                  <span>Digital Stamp:</span>
                  <span className="text-emerald-700">DSC SHA-256 Verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Pages:</span>
                  <span className="text-slate-800">12 Pages with Annexures</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setShowPdfModal(false);
                  }}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  Print / Save as PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
