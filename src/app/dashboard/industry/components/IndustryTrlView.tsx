"use client";

import React, { useState } from "react";
import { 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Lock, 
  FileCode, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Download,
  Filter,
  Check,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { TrlStageCriteria, TrlAuditEntry, Project } from "./types";

interface IndustryTrlViewProps {
  project: Project;
  stages: TrlStageCriteria[];
  auditLogs: TrlAuditEntry[];
}

export function IndustryTrlView({
  project,
  stages,
  auditLogs,
}: IndustryTrlViewProps) {
  const [selectedStageNumber, setSelectedStageNumber] = useState<number>(5);
  const [filterType, setFilterType] = useState<string>("ALL");

  const selectedStage = stages.find((s) => s.stage === selectedStageNumber) || stages[4];

  const filteredLogs = filterType === "ALL"
    ? auditLogs
    : auditLogs.filter((l) => l.type === filterType);

  const getLogIcon = (type: TrlAuditEntry["type"]) => {
    switch (type) {
      case "SCHEMATIC":
        return <FileCode className="w-4 h-4 text-blue-600" />;
      case "FIRMWARE":
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case "TEST_LOG":
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case "TRL_GATE":
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" /> Active TRL & Revision History
            </h2>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-200">
              Current Stage: TRL {project.trl}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Formal Technology Readiness Level progression audit compliant with Ministry of Education & DST innovation standards.
            Every schematic update, firmware release, and test bench run is cryptographically logged.
          </p>
        </div>

        <button
          onClick={() => alert(`Downloaded SHA-256 Verified Audit Manifest for ${project.title}`)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap self-end md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" /> Export TRL Audit Trail (PDF)
        </button>
      </div>

      {/* TRL 1-9 Progression Visual Scale */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Formal TRL 1-9 Progression Framework
            </h3>
            <p className="text-xs text-slate-500">
              Click any stage to inspect qualification criteria and verification status.
            </p>
          </div>
          <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Overall Readiness: {project.trlProgress}% toward TRL 6
          </div>
        </div>

        {/* 9 Stage Step Track */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {stages.map((stage) => {
            const isCompleted = stage.status === "COMPLETED";
            const isCurrent = stage.status === "CURRENT";
            const isSelected = selectedStageNumber === stage.stage;

            return (
              <button
                key={stage.stage}
                onClick={() => setSelectedStageNumber(stage.stage)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-blue-600 border-blue-600 bg-blue-50/50 shadow-xs"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50"
                    : isCurrent
                    ? "border-amber-300 bg-amber-50/60 hover:bg-amber-100/50"
                    : "border-slate-200 bg-slate-50/70 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold animate-pulse shadow-2xs">
                      {stage.stage}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-black text-slate-800">TRL {stage.stage}</span>
                <span className="text-[9px] font-semibold text-slate-500 line-clamp-1 mt-0.5">
                  {isCompleted ? "Passed" : isCurrent ? "Active" : "Locked"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Criteria Detail Box */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">{selectedStage.title}</span>
                {selectedStage.status === "COMPLETED" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Stage Sign-Off Completed
                  </span>
                )}
                {selectedStage.status === "CURRENT" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Active Review Stage
                  </span>
                )}
                {selectedStage.status === "UPCOMING" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                    Prerequisites Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">{selectedStage.shortDesc}</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Gate Ref: DST-TRL-0{selectedStage.stage}</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-700">Verification Checklist Criteria:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedStage.checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 ${
                    item.completed
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      item.completed ? "bg-emerald-600 text-white" : "border border-slate-300 bg-slate-100"
                    }`}
                  >
                    {item.completed ? "✓" : ""}
                  </div>
                  <span className="leading-snug">{item.item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Engineering Changelog */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" /> Chronological Engineering Changelog
            </h3>
            <p className="text-xs text-slate-500">
              Live audit trail of hardware modifications, firmware commits, and lab test reports.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["ALL", "SCHEMATIC", "FIRMWARE", "TEST_LOG", "TRL_GATE"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filterType === type
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-3 pt-2">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    {getLogIcon(log.type)}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900">{log.title}</span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {log.commitSha && `SHA: ${log.commitSha} • `}
                      {log.timestamp} • By {log.author}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Stage {log.trlStage}
                  </span>
                  {log.status === "PASSED" || log.status === "VERIFIED" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {log.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" /> Revision Pending
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                {log.description}
              </p>

              {/* Metrics if present */}
              {log.metrics && log.metrics.length > 0 && (
                <div className="pl-8 pt-1 flex flex-wrap gap-2">
                  {log.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-medium flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="text-slate-500">{m.name}:</span>
                      <span className="font-bold text-slate-900">{m.value}</span>
                      <span className="text-emerald-600 font-bold">✓</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
