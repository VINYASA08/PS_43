"use client";

import { useState, useMemo } from "react";
import { DistrictData } from "../types";
import { 
  Search, 
  KeyRound, 
  Mail, 
  Phone, 
  ExternalLink,
  Building,
  GraduationCap
} from "lucide-react";

interface GovDistrictsViewProps {
  districts: DistrictData[];
  onOpenSettings: () => void;
}

export function GovDistrictsView({ districts, onOpenSettings }: GovDistrictsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");

  // Unique divisions
  const divisions = useMemo(() => {
    return Array.from(new Set(districts.map((d) => d.division)));
  }, [districts]);

  // Aggregate metrics
  const totalComplaints = useMemo(() => {
    return districts.reduce((sum, d) => sum + d.complaintsLogged, 0);
  }, [districts]);

  const totalResolved = useMemo(() => {
    return districts.reduce((sum, d) => sum + d.complaintsResolved, 0);
  }, [districts]);

  const avgSpeed = useMemo(() => {
    const total = districts.reduce((sum, d) => sum + d.resolutionSpeedHours, 0);
    return (total / (districts.length || 1)).toFixed(1);
  }, [districts]);

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.nodalOfficer.name.toLowerCase().includes(search.toLowerCase()) ||
        d.nodalOfficer.email.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedDivision !== "All" && d.division !== selectedDivision) return false;
      return true;
    });
  }, [districts, search, selectedDivision]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Statewide Operational Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
              Statutory DNO Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">100% Administrative Desk Coverage</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            24 District Nodal Officers (DNO) Triage & Resolution Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of citizen challenge intake, municipal public works diversion, and deep-tech university lab escalations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Desks</span>
            <strong className="text-lg font-black text-slate-900">{districts.length}</strong>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <span className="text-[10px] text-emerald-700 uppercase font-bold block">Complaints Logged</span>
            <strong className="text-lg font-black text-emerald-800">{totalComplaints}</strong>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <span className="text-[10px] text-blue-700 uppercase font-bold block">Resolved</span>
            <strong className="text-lg font-black text-blue-800">{totalResolved}</strong>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
            <span className="text-[10px] text-purple-700 uppercase font-bold block">Avg Speed</span>
            <strong className="text-lg font-black text-purple-800">{avgSpeed}h</strong>
          </div>
        </div>
      </div>

      {/* Search & Division Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by district name, officer, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="All">All Administrative Divisions</option>
            {divisions.map((div) => (
              <option key={div} value={div}>{div} Division</option>
            ))}
          </select>

          <button
            onClick={onOpenSettings}
            className="whitespace-nowrap px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Manage Credentials
          </button>
        </div>
      </div>

      {/* 24 Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredDistricts.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
          >
            {/* Card Header */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {d.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{d.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{d.division} Division</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <KeyRound className="w-3 h-3 text-emerald-600" />
                  DSC Verified
                </span>
              </div>

              {/* Nodal Officer Credentials */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                <div className="font-semibold text-slate-800">{d.nodalOfficer.name}</div>
                <div className="text-[11px] text-slate-500">{d.nodalOfficer.designation}</div>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 font-mono">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {d.nodalOfficer.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {d.nodalOfficer.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Performance Metrics & Triage Speed */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Complaints</span>
                  <strong className="text-slate-800 font-bold">{d.complaintsLogged}</strong>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 block font-semibold">Resolved</span>
                  <strong className="text-emerald-800 font-bold">{d.complaintsResolved}</strong>
                </div>
                <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-[10px] text-purple-600 block font-semibold">Avg Speed</span>
                  <strong className="text-purple-800 font-bold">{d.resolutionSpeedHours}h</strong>
                </div>
              </div>

              {/* Municipal vs Academic Routing Ratio */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    Municipal: {d.triageMunicipalPercent}%
                  </span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    Academic Labs: {d.triageAcademicPercent}%
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full"
                    style={{ width: `${d.triageMunicipalPercent}%` }}
                    title={`Municipal Works: ${d.triageMunicipalPercent}%`}
                  />
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${d.triageAcademicPercent}%` }}
                    title={`Academic Engineering Labs: ${d.triageAcademicPercent}%`}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Active Builds: <strong className="text-slate-800">{d.activeBuilds} Labs</strong>
              </span>
              <button
                onClick={() => {
                  alert(`Connecting to ${d.name} Nodal Desk secure hotline: ${d.nodalOfficer.phone}`);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <span>Direct Contact</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
