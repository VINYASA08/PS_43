"use client";

import React, { useState } from "react";
import { 
  FileText, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  ChevronRight,
  Info
} from "lucide-react";
import { WORKFLOW_LIFECYCLE_STAGES } from "./helpData";

export function HelpWorkflowDiagram() {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const activeStage = WORKFLOW_LIFECYCLE_STAGES[activeStageIndex];

  const stageIcons = [
    <FileText key="s1" className="w-5 h-5 text-emerald-600" />,
    <ShieldCheck key="s2" className="w-5 h-5 text-blue-600" />,
    <GraduationCap key="s3" className="w-5 h-5 text-indigo-600" />,
    <Briefcase key="s4" className="w-5 h-5 text-amber-600" />,
    <Award key="s5" className="w-5 h-5 text-purple-600" />,
  ];

  const stageColors = [
    { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-800", activeRing: "ring-emerald-500", bar: "bg-emerald-500" },
    { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800", activeRing: "ring-blue-500", bar: "bg-blue-500" },
    { bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-800", activeRing: "ring-indigo-500", bar: "bg-indigo-500" },
    { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", activeRing: "ring-amber-500", bar: "bg-amber-500" },
    { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-800", activeRing: "ring-purple-500", bar: "bg-purple-500" },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden my-8">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <Scale className="w-3.5 h-3.5" />
              Statutory 21-Day Resolution & Technology Transfer Lifecycle
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              End-to-End Problem Resolution & Innovation Pipeline
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              From grassroots citizen reporting to AI deduplication, academic research DPRs, corporate CSR escrow, and sovereign state-wide deployment.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Info className="w-4 h-4 text-blue-600" />
            Click any stage to view deliverables & statutory SLAs
          </div>
        </div>
      </div>

      {/* Interactive Step Ribbon */}
      <div className="p-6 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
        <div className="min-w-[760px] flex items-center justify-between relative">
          {/* Connector bar behind nodes */}
          <div className="absolute top-6 left-8 right-8 h-1 bg-slate-200 -z-0" />
          <div 
            className="absolute top-6 left-8 h-1 bg-blue-600 transition-all duration-300 -z-0"
            style={{ width: `${(activeStageIndex / (WORKFLOW_LIFECYCLE_STAGES.length - 1)) * 100}%` }}
          />

          {WORKFLOW_LIFECYCLE_STAGES.map((stg, idx) => {
            const isSelected = activeStageIndex === idx;
            const isPassed = idx < activeStageIndex;
            const color = stageColors[idx];

            return (
              <button
                key={stg.stageNumber}
                onClick={() => setActiveStageIndex(idx)}
                className={`relative z-10 flex flex-col items-center group cursor-pointer text-left transition-transform duration-150 ${
                  isSelected ? "scale-105" : "hover:scale-102"
                }`}
              >
                {/* Node circle */}
                <div
                  className={`w-12 h-12 rounded-md flex items-center justify-center border-2 transition-all duration-200 ${
                    isSelected
                      ? `bg-white shadow-lg ring-4 ${color.activeRing} ${color.border}`
                      : isPassed
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white border-slate-300 text-slate-400 group-hover:border-slate-400"
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    stageIcons[idx]
                  )}
                </div>

                {/* Stage labels */}
                <div className="mt-3 text-center w-36">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {`Stage ${stg.stageNumber}`}
                  </span>
                  <span className={`block text-xs font-semibold leading-snug mt-0.5 ${
                    isSelected ? "text-slate-900 font-bold" : "text-slate-600"
                  }`}>
                    {stg.title.split("&")[0]}
                  </span>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs">
                    {stg.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Drawer */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Stage Information */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${stageColors[activeStageIndex].bg} ${stageColors[activeStageIndex].text} border ${stageColors[activeStageIndex].border}`}>
                {`Stage ${activeStage.stageNumber} of 5`}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Statutory Timeline: <strong className="text-slate-800">{activeStage.timeline}</strong>
              </div>
            </div>

            <h4 className="text-xl font-bold text-slate-900">
              {activeStage.title}
            </h4>

            <p className="text-sm text-slate-600 leading-relaxed">
              {activeStage.description}
            </p>

            {/* Deliverable Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Verified Statutory Deliverable
              </span>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-slate-800">
                  {activeStage.deliverable}
                </span>
              </div>
            </div>
          </div>

          {/* Actor & Next Actions Card */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Primary Authorized Actor
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {activeStage.actor}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Stage Transition
              </span>
              {activeStageIndex < WORKFLOW_LIFECYCLE_STAGES.length - 1 ? (
                <button
                  onClick={() => setActiveStageIndex(activeStageIndex + 1)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Next: Stage {activeStageIndex + 2}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Full Lifecycle Completed
                </div>
              )}
            </div>

            {activeStageIndex > 0 && (
              <button
                onClick={() => setActiveStageIndex(activeStageIndex - 1)}
                className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
              >
                ← View Previous Stage
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
