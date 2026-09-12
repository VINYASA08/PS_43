"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause, 
  Camera, 
  StickyNote, 
  Activity, 
  Sliders, 
  FileText, 
  ShieldCheck,
  Send,
  Trash2,
  Check,
  Sparkles
} from "lucide-react";
import { Project, TestPoint, CircuitAnnotation, RubricScores } from "./types";

interface MilestoneReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  testPoints: TestPoint[];
  initialAnnotations: CircuitAnnotation[];
  onAuthorizeEscrow: (rubric: RubricScores, notes: string) => void;
  onRequestRevisions: (notes: string) => void;
}

export function MilestoneReviewModal({
  isOpen,
  onClose,
  project,
  testPoints,
  initialAnnotations,
  onAuthorizeEscrow,
  onRequestRevisions,
}: MilestoneReviewModalProps) {
  // CAD Viewer Viewport Scale
  const [zoomLevel, setZoomLevel] = useState(1);
  const [annotations, setAnnotations] = useState<CircuitAnnotation[]>(initialAnnotations);
  const [selectedNote, setSelectedNote] = useState<CircuitAnnotation | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Rubric Sliders State
  const [rubric, setRubric] = useState<RubricScores>({
    technicalFeasibility: 85,
    componentDurability: 90,
    costEfficiency: 80,
  });

  const [mentorNotes, setMentorNotes] = useState(
    "The component layout and thermal dissipation are validated. Ensure the LM2596 copper heatsink plane maintains <70°C junction temperature under continuous 45°C ambient soak."
  );

  // Video Demo Simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(42);

  // Decision Gate Dialog State
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [confirmSignOffOpen, setConfirmSignOffOpen] = useState(false);

  // Compute Dynamic TRL Progress
  const computedTrlProgress = Math.round(
    0.4 * rubric.technicalFeasibility +
    0.35 * rubric.componentDurability +
    0.25 * rubric.costEfficiency
  );

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.2, z + 0.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.6, z - 0.2));
  const handleResetZoom = () => setZoomLevel(1);

  // Canvas click to place note
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingNote) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const newNote: CircuitAnnotation = {
      id: `note-${Date.now()}`,
      x: Math.round(clickX),
      y: Math.round(clickY),
      component: clickX > 60 ? "LoRa RF Section" : clickX > 35 ? "LM2596 Regulator" : "Power Input Rail",
      text: newNoteText.trim() || "Inspect thermal dissipation on this junction node.",
      author: "Senior Technical Mentor",
      timestamp: "Just now",
      resolved: false,
    };

    setAnnotations((prev) => [...prev, newNote]);
    setSelectedNote(newNote);
    setIsAddingNote(false);
    setNewNoteText("");
  };

  const handleToggleResolveNote = (noteId: string) => {
    setAnnotations((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, resolved: !n.resolved } : n))
    );
    if (selectedNote?.id === noteId) {
      setSelectedNote((n) => (n ? { ...n, resolved: !n.resolved } : null));
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setAnnotations((prev) => prev.filter((n) => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const handleSendRevisions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFeedback.trim()) return;
    onRequestRevisions(revisionFeedback.trim());
    setRevisionDialogOpen(false);
    onClose();
  };

  const handleConfirmSignOff = () => {
    onAuthorizeEscrow(rubric, mentorNotes);
    setConfirmSignOffOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-slate-900">
                  Milestone 2 Review: IoT Circuit Schematics & Thermal Logs
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                  TRL 5 Gate
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {project.title} • {project.institution}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close review desk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
          {/* Left Column: Interactive CAD & Circuit Viewer + Test Points Telemetry */}
          <div className="lg:w-7/12 flex flex-col gap-4">
            {/* CAD Viewer Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Interactive CAD & Circuit Viewer
                </h3>
                <span className="text-[11px] text-slate-500">
                  Click on components to drop sticky notes. Zoom and inspect trace layouts.
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Reset Scale"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-slate-600 px-2 font-bold">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
            </div>

            {/* Circuit Canvas Container */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 relative min-h-[320px] overflow-hidden flex flex-col justify-between shadow-inner">
              {/* Sticky Note Pinning Mode Toggle */}
              <div className="flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900">
                    CAD_Schematic_v2.2.dwg
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {annotations.length} Redline Pins
                  </span>
                </div>

                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isAddingNote
                      ? "bg-amber-500 text-slate-950 ring-2 ring-amber-300"
                      : "bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  {isAddingNote ? "Click on Canvas to Pin" : "+ Add Redline Note"}
                </button>
              </div>

              {/* Vector SVG Schematic Canvas */}
              <div className="flex-1 flex items-center justify-center overflow-hidden py-3">
                <div
                  className="transition-transform duration-200 origin-center cursor-crosshair w-full"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <svg
                    viewBox="0 0 600 240"
                    className="w-full h-56 select-none"
                    onClick={handleCanvasClick}
                  >
                    <defs>
                      <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="600" height="240" fill="url(#cadGrid)" />

                    {/* Ground and VDD Power Buses */}
                    <line x1="20" y1="20" x2="580" y2="20" stroke="#ef4444" strokeWidth="2" />
                    <text x="30" y="15" fill="#ef4444" fontSize="9" fontWeight="bold">VIN +15V BUS</text>

                    <line x1="20" y1="220" x2="580" y2="220" stroke="#3b82f6" strokeWidth="2" />
                    <text x="30" y="235" fill="#3b82f6" fontSize="9" fontWeight="bold">GND BUS (AGND / DGND ISO)</text>

                    {/* Circuit Traces */}
                    <path d="M 70 80 L 140 80 L 140 120 L 190 120" fill="none" stroke="#38bdf8" strokeWidth="2" />
                    <path d="M 270 120 L 330 120" fill="none" stroke="#34d399" strokeWidth="2" />
                    <path d="M 430 120 L 490 120" fill="none" stroke="#a78bfa" strokeWidth="2" />
                    <path d="M 380 70 L 380 20" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                    <path d="M 380 170 L 380 220" fill="none" stroke="#3b82f6" strokeWidth="1.5" />

                    {/* Block 1: Power Protection Diode & Fuse */}
                    <rect x="30" y="60" width="70" height="40" rx="4" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.5" />
                    <text x="65" y="82" fill="#bfdbfe" fontSize="9" fontWeight="bold" textAnchor="middle">PWR ISO</text>
                    <text x="65" y="94" fill="#64748b" fontSize="7" textAnchor="middle">TVS + Shottky</text>

                    {/* Block 2: LM2596 Step Down Regulator */}
                    <rect x="190" y="85" width="80" height="70" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    <text x="230" y="112" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">LM2596-5.0</text>
                    <text x="230" y="126" fill="#94a3b8" fontSize="8" textAnchor="middle">Buck Conv</text>
                    <text x="230" y="142" fill="#f59e0b" fontSize="7" textAnchor="middle">Thermal Heatsink</text>

                    {/* Test Point 1 Node */}
                    <circle cx="140" cy="80" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                    <text x="140" y="72" fill="#93c5fd" fontSize="8" fontWeight="bold" textAnchor="middle">TP1</text>

                    {/* Test Point 2 Node */}
                    <circle cx="300" cy="120" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                    <text x="300" y="112" fill="#fcd34d" fontSize="8" fontWeight="bold" textAnchor="middle">TP2</text>

                    {/* Block 3: STM32F407 MCU Main Board */}
                    <rect x="330" y="70" width="100" height="100" rx="6" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
                    <text x="380" y="105" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">STM32F407</text>
                    <text x="380" y="120" fill="#a7f3d0" fontSize="8" textAnchor="middle">168MHz Cortex-M4</text>
                    <text x="380" y="135" fill="#6ee7b7" fontSize="8" textAnchor="middle">3x ADC @ 12-bit</text>
                    <text x="380" y="150" fill="#64748b" fontSize="7" textAnchor="middle">FreeRTOS Core</text>

                    {/* Test Point 3 Node */}
                    <circle cx="430" cy="90" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                    <text x="430" y="82" fill="#a7f3d0" fontSize="8" fontWeight="bold" textAnchor="middle">TP3</text>

                    {/* Block 4: LoRa & Turbidity Interface */}
                    <rect x="490" y="85" width="80" height="70" rx="4" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1.5" />
                    <text x="530" y="112" fill="#c4b5fd" fontSize="9" fontWeight="bold" textAnchor="middle">SX1276 LoRa</text>
                    <text x="530" y="126" fill="#ddd6fe" fontSize="8" textAnchor="middle">865-867 MHz</text>
                    <text x="530" y="142" fill="#a78bfa" fontSize="7" textAnchor="middle">+20dBm Output</text>

                    {/* Test Point 4 Node */}
                    <circle cx="490" cy="120" r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />
                    <text x="490" y="140" fill="#e9d5ff" fontSize="8" fontWeight="bold" textAnchor="middle">TP4</text>

                    {/* Render Interactive Redline Pins */}
                    {annotations.map((note) => (
                      <g
                        key={note.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNote(note);
                        }}
                        className="cursor-pointer group"
                      >
                        <circle
                          cx={`${note.x}%`}
                          cy={`${note.y}%`}
                          r="7"
                          fill={note.resolved ? "#10b981" : "#f59e0b"}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <circle
                          cx={`${note.x}%`}
                          cy={`${note.y}%`}
                          r="12"
                          fill={note.resolved ? "#10b981" : "#f59e0b"}
                          fillOpacity="0.2"
                          className="animate-ping"
                        />
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Selected Redline Pin Card */}
              {selectedNote && (
                <div className="bg-amber-100 text-amber-950 p-3 rounded-xl border border-amber-300 text-xs shadow-md space-y-1.5 animate-in fade-in">
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-amber-800" />
                      Redline: {selectedNote.component}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleResolveNote(selectedNote.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedNote.resolved
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-200 text-amber-900 hover:bg-amber-300"
                        }`}
                      >
                        {selectedNote.resolved ? "Resolved ✓" : "Mark Resolved"}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        className="p-1 hover:text-rose-600 text-amber-800"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900">{selectedNote.text}</p>
                  <div className="text-[10px] text-amber-700">
                    Logged by {selectedNote.author} • {selectedNote.timestamp}
                  </div>
                </div>
              )}
            </div>

            {/* Test Points Panel & Real-Time Voltage Waveforms */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-600" /> Test Points Telemetry & Oscilloscope Waveforms
                </h4>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Live Bench Feed • 45°C Chamber
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {testPoints.map((tp) => {
                  const isWarning = tp.status === "WARNING";
                  return (
                    <div
                      key={tp.id}
                      className={`p-3 rounded-xl border space-y-2 ${
                        isWarning
                          ? "bg-amber-50/50 border-amber-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{tp.label}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isWarning
                              ? "bg-amber-200 text-amber-900"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {tp.voltage}V
                        </span>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Target: {tp.targetVoltage}V ({tp.tolerance})</span>
                        <span className={isWarning ? "text-amber-700 font-bold" : "text-emerald-700"}>
                          {isWarning ? "Ripple Spike Warning" : "Within Spec"}
                        </span>
                      </div>

                      {/* Oscilloscope Sparkline Graph */}
                      <div className="h-10 bg-slate-900 rounded-lg p-1.5 flex items-center overflow-hidden relative">
                        <svg viewBox="0 0 120 30" className="w-full h-full">
                          {/* Horizontal baseline */}
                          <line x1="0" y1="15" x2="120" y2="15" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />

                          {/* Waveform path */}
                          <path
                            d={tp.waveform
                              .map((v, i) => {
                                const x = (i / (tp.waveform.length - 1)) * 120;
                                const y = 30 - ((v - (tp.targetVoltage - 2)) / 4) * 30;
                                return `${i === 0 ? "M" : "L"} ${x} ${Math.max(2, Math.min(28, y))}`;
                              })
                              .join(" ")}
                            fill="none"
                            stroke={isWarning ? "#f59e0b" : "#34d399"}
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Rubric Criteria, Video Demo, and Dual Decision Gate */}
          <div className="lg:w-5/12 flex flex-col justify-between gap-5">
            <div className="space-y-5">
              {/* Rubric Scoring Criteria */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" /> Rubric Scoring & TRL Engine
                  </h3>
                  <span className="text-[11px] font-black text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    TRL Readiness: {computedTrlProgress}%
                  </span>
                </div>

                {/* Slider 1: Technical Feasibility */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Technical Feasibility (40% Weight)</span>
                    <span className="text-blue-600 font-mono">{rubric.technicalFeasibility}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rubric.technicalFeasibility}
                    onChange={(e) =>
                      setRubric((r) => ({ ...r, technicalFeasibility: Number(e.target.value) }))
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Slider 2: Component Durability */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Component Durability & Thermal Life (35% Weight)</span>
                    <span className="text-emerald-600 font-mono">{rubric.componentDurability}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rubric.componentDurability}
                    onChange={(e) =>
                      setRubric((r) => ({ ...r, componentDurability: Number(e.target.value) }))
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Slider 3: Cost-Efficiency */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Cost-Efficiency & BOM Optimization (25% Weight)</span>
                    <span className="text-indigo-600 font-mono">{rubric.costEfficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rubric.costEfficiency}
                    onChange={(e) =>
                      setRubric((r) => ({ ...r, costEfficiency: Number(e.target.value) }))
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Mentor Recommendations Textarea */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Formal Mentor Recommendations & Directives
                  </label>
                  <textarea
                    rows={3}
                    value={mentorNotes}
                    onChange={(e) => setMentorNotes(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900"
                    placeholder="Enter technical recommendations for the university laboratory..."
                  />
                </div>
              </div>

              {/* Lab Video Demo & Test Proof Player */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2 text-white shadow-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" /> Thermal_Stress_Test.mp4
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Verified Video Proof (6hr Soak)
                  </span>
                </div>

                <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center group border border-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                  {/* Play/Pause Button */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-xs transition-transform transform group-hover:scale-110 z-20 cursor-pointer shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                      <span>02:14</span>
                      <span>05:30</span>
                    </div>
                    {/* Scrub Bar */}
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Decision Gate Buttons (PDF Page 4) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setRevisionDialogOpen(true)}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" /> Send Revisions to Lab
              </button>

              <button
                onClick={() => setConfirmSignOffOpen(true)}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Sign-Off & Authorize Escrow Tranche
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REVISION INSTRUCTIONS DIALOG */}
      {revisionDialogOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-amber-50">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-sm">Send Revisions to Lab</h4>
              </div>
              <button
                onClick={() => setRevisionDialogOpen(false)}
                className="p-1 hover:bg-amber-100 rounded-md text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendRevisions} className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                This action will mark Milestone 2 as <span className="font-bold text-amber-700">REVISION_REQUESTED</span>, keep Tranche 2 locked in escrow, and immediately notify Dr. Ananya Mukherjee and the BIT Mesra engineering team.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Required Engineering Revisions *
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  placeholder="e.g. Node 2 ripple exceeds 30mV tolerance during LoRa bursts. Redesign decoupling ground plane and re-run 6-hour thermal soak."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRevisionDialogOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!revisionFeedback.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch Revision Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM SIGN-OFF & ESCROW RELEASE DIALOG */}
      {confirmSignOffOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-emerald-50">
              <div className="flex items-center gap-2 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm">Authorize Milestone 2 & Escrow Release</h4>
              </div>
              <button
                onClick={() => setConfirmSignOffOpen(false)}
                className="p-1 hover:bg-emerald-100 rounded-md text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-600">
              <p>
                You are about to approve <span className="font-bold text-slate-900">Milestone 2</span> and authorize the release of <span className="font-bold text-emerald-700">Tranche 2 (₹1,00,000)</span> from corporate CSR escrow to the BIT Mesra innovation account.
              </p>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="font-bold text-emerald-900">Evaluation Scorecard:</div>
                <div>• Technical Feasibility: {rubric.technicalFeasibility}%</div>
                <div>• Component Durability: {rubric.componentDurability}%</div>
                <div>• Cost-Efficiency: {rubric.costEfficiency}%</div>
                <div className="font-bold text-blue-700 pt-1">
                  • Computed TRL Progress: {computedTrlProgress}% (Advances project toward TRL 6)
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmSignOffOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignOff}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Disburse Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
