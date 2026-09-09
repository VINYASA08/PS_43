"use client";

import { GisMapPin } from "../types";
import { GraduationCap, Building2, FlaskConical, X, CheckCircle2, IndianRupee, Users, MapPin } from "lucide-react";

interface PinDetailModalProps {
  pin: GisMapPin | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PinDetailModal({ pin, isOpen, onClose }: PinDetailModalProps) {
  if (!isOpen || !pin || pin.type === "amber_alert") return null;

  const getHeaderIcon = () => {
    switch (pin.type) {
      case "academic":
        return <GraduationCap className="w-6 h-6 text-indigo-400" />;
      case "corporate":
        return <Building2 className="w-6 h-6 text-emerald-400" />;
      case "bench_trial":
        return <FlaskConical className="w-6 h-6 text-amber-400" />;
      default:
        return <MapPin className="w-6 h-6 text-blue-400" />;
    }
  };

  const getBadgeTitle = () => {
    switch (pin.type) {
      case "academic":
        return "Academic Research Lab Hub";
      case "corporate":
        return "Corporate Sponsor & Testing Ground";
      case "bench_trial":
        return "Active Municipal Bench Trial";
      default:
        return "Telemetry Marker";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              {getHeaderIcon()}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                {getBadgeTitle()}
              </span>
              <h3 className="text-lg font-bold text-white">{pin.title}</h3>
            </div>
          </div>
          <p className="text-slate-300 text-xs flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {pin.subtitle} • {pin.district} District
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {pin.type === "academic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <span className="text-slate-500 text-[11px]">Active Lab Teams</span>
                  <div className="flex items-center gap-1 text-2xl font-bold text-indigo-900 mt-0.5">
                    <Users className="w-5 h-5 text-indigo-600" />
                    {pin.details.activeTeams || 12}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <span className="text-slate-500 text-[11px]">Department Focus</span>
                  <div className="text-sm font-bold text-emerald-900 mt-1">
                    {pin.department} Tech
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Specialized Lab Facilities
                </h5>
                <div className="space-y-1.5">
                  {pin.details.labFacilities?.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Pipeline of Deployed PoCs
                </h5>
                <div className="flex flex-wrap gap-2">
                  {pin.details.deployedPoCs?.map((poc, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200">
                      {poc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {pin.type === "corporate" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <span className="text-slate-500 text-[11px]">Pledged CSR Capital</span>
                  <div className="flex items-center gap-1 text-2xl font-bold text-emerald-900 mt-0.5">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    {pin.details.pledgedCapitalCr} Cr
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl">
                  <span className="text-slate-500 text-[11px]">Active Industry Mentors</span>
                  <div className="flex items-center gap-1 text-2xl font-bold text-blue-900 mt-0.5">
                    <Users className="w-5 h-5 text-blue-600" />
                    {pin.details.activeMentors || 6}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Municipal & Industrial Testing Grounds
                </h5>
                <div className="space-y-1.5">
                  {pin.details.testingFacilitiesOpened?.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {pin.type === "bench_trial" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Readiness Stage
                  </span>
                  <span className="px-2.5 py-1 bg-amber-600 text-white font-bold text-xs rounded-lg">
                    TRL-{pin.details.trlLevel || 5} Prototype
                  </span>
                </div>
                <div className="mt-3 text-xs text-amber-900">
                  <span className="font-semibold block mb-1">Bench Parameters & Validated Metrics:</span>
                  <p className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-amber-200 text-slate-800">
                    {pin.details.benchParameters}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
