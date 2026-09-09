"use client";

import React, { useState } from "react";
import { 
  Briefcase, 
  Clock, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  Maximize, 
  Send, 
  Paperclip, 
  Type, 
  CheckCircle2, 
  AlertCircle, 
  Calendar as CalendarIcon,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Project, OfficeHourSlot, ChatMessage } from "./types";

interface IndustryHomeViewProps {
  projects: Project[];
  selectedProject: Project;
  onSelectProject: (proj: Project) => void;
  officeHours: OfficeHourSlot[];
  chatMessages: ChatMessage[];
  onSendMessage: (content: string, attachmentName?: string) => void;
  onOpenReviewModal: () => void;
  onOpenIpModal: () => void;
  onQuickApprove: () => void;
  onQuickReject: () => void;
}

export function IndustryHomeView({
  projects,
  selectedProject,
  onSelectProject,
  officeHours,
  chatMessages,
  onSendMessage,
  onOpenReviewModal,
  onOpenIpModal,
  onQuickApprove,
  onQuickReject,
}: IndustryHomeViewProps) {
  // Calendar State
  const [currentMonthIndex, setCurrentMonthIndex] = useState(8); // September (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<number | null>(11);

  // Chat input state
  const [inputText, setInputText] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;
    onSendMessage(inputText.trim(), attachedFile || undefined);
    setInputText("");
    setAttachedFile(null);
  };

  const activeSlot = officeHours.find((s) => s.dateNumber === selectedDate);
  const activeDays = officeHours.map((s) => s.dateNumber);

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-blue-300 transition-colors">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{projects.length}</div>
            <div className="text-xs font-semibold text-slate-500">Active Mentored Projects</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-purple-300 transition-colors">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">14</div>
            <div className="text-xs font-semibold text-slate-500">Mentoring Hours Logged</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-amber-300 transition-colors">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">2</div>
            <div className="text-xs font-semibold text-slate-500">Pending Milestone Reviews</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Projects & Scheduled Calendar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Projects Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Active Projects ({projects.length})
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">Select to inspect</span>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => {
                const isSelected = proj.id === selectedProject.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">{proj.title}</span>
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                        TRL {proj.trl}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                      {proj.institution}
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                        <span>Visual Progress</span>
                        <span className="font-bold text-blue-600">TRL {proj.trlProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${proj.trlProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheduled Office Hours Monthly Calendar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" /> Scheduled Office Hours
              </h3>
              <div className="flex items-center gap-1 text-slate-600">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 min-w-[95px] text-center">
                  {months[currentMonthIndex].slice(0, 3)} {currentYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 font-bold mb-2">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>

            {/* Calendar Grid (30 days for demo) */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                const hasSlot = activeDays.includes(dayNum);
                const isSelected = selectedDate === dayNum;

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDate(dayNum)}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      isSelected && hasSlot
                        ? "bg-blue-600 text-white shadow-xs shadow-blue-500/30 scale-105"
                        : isSelected
                        ? "bg-slate-800 text-white"
                        : hasSlot
                        ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Selected Slot Information */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              {activeSlot ? (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">{activeSlot.type}</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                      {activeSlot.startTime} - {activeSlot.endTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Day {activeSlot.dateNumber} ({activeSlot.day}): Scheduled review session with university lab leads.
                  </p>
                  <div className="text-[10px] text-slate-500 font-medium pt-1">
                    Attendees: {activeSlot.attendees.join(", ")}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-slate-400">
                  {selectedDate ? `No sessions scheduled on Sep ${selectedDate}.` : "Select a day to view slots."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Milestone Evaluation & Technical Review Desk */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2 bg-slate-50/60">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Milestone Evaluation & Technical Review Desk
              </h3>
              <p className="text-[11px] text-slate-500">
                {selectedProject.currentMilestone}
              </p>
            </div>
            {/* Direct Quick Action Decision Gates from PDF Page 1 */}
            <div className="flex items-center gap-2">
              <button
                onClick={onQuickReject}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Request revisions on current CAD schematics"
              >
                <AlertCircle className="w-3.5 h-3.5" /> Request Revisions
              </button>
              <button
                onClick={onQuickApprove}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Approve stage and sign-off on current milestone"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Stage
              </button>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col gap-5">
            {/* Schematic Preview Card with Interactive Vector Blueprint */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 relative group shadow-inner">
              <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                <button
                  onClick={onOpenReviewModal}
                  className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg backdrop-blur-xs border border-slate-700 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-blue-400" /> Inspect CAD
                </button>
                <button
                  onClick={onOpenReviewModal}
                  className="p-1 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg backdrop-blur-xs border border-slate-700 shadow-xs transition-all cursor-pointer"
                  title="Fullscreen Review"
                >
                  <Maximize className="w-3.5 h-3.5 text-slate-300" />
                </button>
              </div>

              <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* SVG Blueprint Preview */}
                <div className="w-full md:w-2/3 h-44 bg-slate-950 rounded-lg p-3 relative overflow-hidden border border-slate-800 flex items-center justify-center">
                  <svg viewBox="0 0 400 160" className="w-full h-full">
                    {/* Grid Lines */}
                    <defs>
                      <pattern id="gridHome" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="400" height="160" fill="url(#gridHome)" />

                    {/* Circuit Traces */}
                    <path d="M 40 80 L 110 80 L 110 50 L 170 50" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
                    <path d="M 110 80 L 170 80" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                    <path d="M 250 80 L 310 80 L 310 110 L 360 110" fill="none" stroke="#34d399" strokeWidth="1.5" />
                    <path d="M 250 50 L 310 50 L 310 80" fill="none" stroke="#fbbf24" strokeWidth="1.5" />

                    {/* Components */}
                    {/* Power In */}
                    <rect x="20" y="65" width="40" height="30" rx="4" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
                    <text x="40" y="83" fill="#bfdbfe" fontSize="9" fontWeight="bold" textAnchor="middle">PWR IN</text>

                    {/* LM2596 Regulator */}
                    <rect x="170" y="40" width="80" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="210" y="65" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">LM2596 BUCK</text>
                    <text x="210" y="80" fill="#94a3b8" fontSize="8" textAnchor="middle">45°C Thermal Sink</text>

                    {/* Sensor ADC */}
                    <rect x="330" y="95" width="55" height="30" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
                    <text x="357" y="113" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">OPT SEN</text>

                    {/* Redline annotation dot */}
                    <circle cx="210" cy="40" r="4" fill="#f59e0b" />
                    <circle cx="210" cy="40" r="8" fill="#f59e0b" fillOpacity="0.3" className="animate-pulse" />
                  </svg>

                  {/* Redline badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500/90 text-slate-900 text-[10px] font-bold rounded shadow-xs">
                    1 Active Sticky Redline Note
                  </div>
                </div>

                {/* File Metadata */}
                <div className="w-full md:w-1/3 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>CAD_Schematic_v2.2.dwg</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Uploaded by <span className="text-slate-200">Dr. Ananya Mukherjee</span> (Yesterday 10:30 AM)
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 text-[11px]">
                    <div className="text-slate-400">Revision Focus:</div>
                    <div className="text-emerald-400 font-semibold">LM2596 Thermal Vias & RF Decoupling</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Threaded Technical Feedback Chat */}
            <div className="flex-1 border border-slate-200 rounded-xl flex flex-col overflow-hidden bg-white shadow-2xs">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Threaded Technical Feedback Channel
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  {chatMessages.length} messages logged
                </span>
              </div>

              {/* Message List */}
              <div className="p-4 flex-1 space-y-3.5 overflow-y-auto max-h-56 bg-slate-50/30">
                {chatMessages.map((msg) => {
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${msg.isMentor ? "flex-row-reverse" : ""}`}
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 border border-slate-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.senderAvatar} alt={msg.sender} className="w-full h-full object-cover" />
                      </div>
                      <div className={`max-w-[78%] space-y-1 ${msg.isMentor ? "text-right" : ""}`}>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700">{msg.sender}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.isMentor
                              ? "bg-blue-600 text-white rounded-tr-xs shadow-xs"
                              : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs"
                          }`}
                        >
                          <p>{msg.content}</p>
                          {msg.attachment && (
                            <div
                              className={`mt-2 p-1.5 rounded-lg text-[10px] font-mono flex items-center gap-1.5 ${
                                msg.isMentor ? "bg-blue-700/80 text-blue-100" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{msg.attachment.name}</span>
                              <span className="text-[9px] opacity-70">({msg.attachment.size})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex flex-col gap-2">
                {attachedFile && (
                  <div className="flex items-center justify-between px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" /> Attached: {attachedFile}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="text-blue-600 hover:text-blue-900 font-bold ml-2"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBold(!isBold)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      isBold ? "bg-blue-100 text-blue-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                    title="Toggle Text Weight"
                  >
                    <Type className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachedFile("Thermal_Camera_Diff_Log.pdf")}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                    title="Attach Test Log / File"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type technical feedback or revision instructions..."
                    className={`flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 ${
                      isBold ? "font-bold" : "font-normal"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() && !attachedFile}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </form>
            </div>

            {/* Launchers for Modals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={onOpenReviewModal}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Open Milestone Review Desk
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>
              <button
                onClick={onOpenIpModal}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Configure Bilateral IP Agreement
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
