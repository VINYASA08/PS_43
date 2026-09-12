"use client";

import { useState, useMemo } from "react";
import { CivicProject } from "../types";
import { 
  Search, 
  IndianRupee, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RotateCcw
} from "lucide-react";

interface GovProjectsViewProps {
  projects: CivicProject[];
}

export function GovProjectsView({ projects }: GovProjectsViewProps) {
  const [search, setSearch] = useState("");
  const [universityFilter, setUniversityFilter] = useState("All");
  const [sponsorFilter, setSponsorFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [trlFilter, setTrlFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [selectedProject, setSelectedProject] = useState<CivicProject | null>(null);

  // Extract unique universities and sponsors for filter dropdowns
  const universities = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.university)));
  }, [projects]);

  const sponsors = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.corporateSponsor)));
  }, [projects]);

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.summary.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.leadPi.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (universityFilter !== "All" && p.university !== universityFilter) return false;
      if (sponsorFilter !== "All" && p.corporateSponsor !== sponsorFilter) return false;
      if (deptFilter !== "All" && p.department !== deptFilter) return false;

      if (trlFilter === "1-3" && (p.trl < 1 || p.trl > 3)) return false;
      if (trlFilter === "4-6" && (p.trl < 4 || p.trl > 6)) return false;
      if (trlFilter === "7-9" && (p.trl < 7 || p.trl > 9)) return false;

      return true;
    });
  }, [projects, search, universityFilter, sponsorFilter, deptFilter, trlFilter]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = filteredProjects.slice((page - 1) * pageSize, page * pageSize);

  const resetFilters = () => {
    setSearch("");
    setUniversityFilter("All");
    setSponsorFilter("All");
    setDeptFilter("All");
    setTrlFilter("All");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
              Master Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">186 Active Statewide Builds</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Civic R&D Innovation Projects Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-university engineering solutions tackling verified municipal and district challenges across Jharkhand.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Projects</span>
            <strong className="text-lg font-black text-slate-900">186</strong>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <span className="text-[10px] text-emerald-700 uppercase font-bold block">CSR Capital</span>
            <strong className="text-lg font-black text-emerald-800">₹4.2 Cr</strong>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <span className="text-[10px] text-blue-700 uppercase font-bold block">Avg TRL</span>
            <strong className="text-lg font-black text-blue-800">5.8</strong>
          </div>
        </div>
      </div>

      {/* Multi-Parameter Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, project ID, keywords or lead faculty..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs">
          {/* University Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Host University</label>
            <select
              value={universityFilter}
              onChange={(e) => {
                setUniversityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Universities</option>
              {universities.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Sponsor Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Corporate Sponsor</label>
            <select
              value={sponsorFilter}
              onChange={(e) => {
                setSponsorFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Corporate Sponsors</option>
              {sponsors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Technology Domain</label>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Domains</option>
              <option value="Water">Drinking Water & Sanitation</option>
              <option value="Roads">Road Construction</option>
              <option value="Energy">Energy & Power</option>
              <option value="Urban">Urban Development</option>
            </select>
          </div>

          {/* TRL Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">TRL Stage</label>
            <select
              value={trlFilter}
              onChange={(e) => {
                setTrlFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Stages (TRL 1-9)</option>
              <option value="1-3">TRL 1-3: Concept & Principles</option>
              <option value="4-6">TRL 4-6: Lab & Prototype</option>
              <option value="7-9">TRL 7-9: Field Trial & Commercial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Project ID & Title</th>
                <th className="px-5 py-3.5">District & Domain</th>
                <th className="px-5 py-3.5">Host University & PI</th>
                <th className="px-5 py-3.5">Corporate Sponsor</th>
                <th className="px-5 py-3.5">TRL Level</th>
                <th className="px-5 py-3.5">Escrow Funding</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">No matching projects found.</p>
                    <p className="text-xs text-slate-400">Try adjusting your search criteria or resetting filters.</p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 space-y-1 max-w-xs">
                      <div className="font-mono text-[10px] font-bold text-blue-600">{proj.id}</div>
                      <div className="font-bold text-slate-900 leading-snug">{proj.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{proj.summary}</p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{proj.district}</div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 mt-1">
                        {proj.department}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{proj.university}</div>
                      <div className="text-[11px] text-slate-500">{proj.leadPi}</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{proj.corporateSponsor}</div>
                      <span className="text-[10px] text-emerald-600 font-medium">CSR Escrow Backed</span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-100 text-indigo-800">
                            TRL-{proj.trl}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 truncate max-w-[120px]">
                            {proj.status}
                          </span>
                        </div>
                        {/* 9-step mini progress bar */}
                        <div className="flex gap-0.5 w-24">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
                            <div
                              key={step}
                              className={`h-1.5 flex-1 rounded-xs ${
                                step <= proj.trl ? "bg-emerald-500" : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-0.5 font-bold font-mono text-emerald-700">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {proj.escrowFundingCr} Cr
                      </div>
                      <span className="text-[10px] text-slate-400">Milestone Tranches</span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedProject(proj)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing {paginatedProjects.length} of {filteredProjects.length} projects (186 total active)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative">
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  {selectedProject.id}
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  {selectedProject.district} District • {selectedProject.department}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {selectedProject.title}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h5 className="font-bold text-slate-900 text-sm">Engineering Abstract & Municipal Impact</h5>
                <p className="leading-relaxed text-slate-600">{selectedProject.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">Host Academic Institution</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedProject.university}</div>
                  <p className="text-slate-500 text-[11px]">Principal Investigator: {selectedProject.leadPi}</p>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Corporate Sponsor & Testing Desk</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedProject.corporateSponsor}</div>
                  <p className="text-slate-500 text-[11px]">Escrow Allocation: ₹{selectedProject.escrowFundingCr} Cr</p>
                </div>
              </div>

              {/* TRL Stage Visual */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Technology Readiness Level Progress</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs">
                    TRL-{selectedProject.trl}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 italic">{selectedProject.trlStage}</p>
                <div className="grid grid-cols-9 gap-1 text-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                    <div
                      key={lvl}
                      className={`p-1 rounded text-[10px] font-mono font-bold ${
                        lvl <= selectedProject.trl
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {lvl}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                <span>Last Statutory Technical Audit: <strong>{selectedProject.lastAuditDate}</strong></span>
                <span className="text-emerald-700 font-semibold">Status: {selectedProject.status}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="py-2 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-md"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
