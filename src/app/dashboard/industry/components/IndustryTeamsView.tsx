"use client";

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  Send,
  X,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { LabResearcher, Project } from "./types";

interface IndustryTeamsViewProps {
  project: Project;
  researchers: LabResearcher[];
  onToggleTalentFlag: (researcherId: string) => void;
  onSendMessageToResearcher: (researcherName: string, message: string) => void;
}

export function IndustryTeamsView({
  project,
  researchers,
  onToggleTalentFlag,
  onSendMessageToResearcher,
}: IndustryTeamsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  
  // Modals state
  const [activePubResearcher, setActivePubResearcher] = useState<LabResearcher | null>(null);
  const [activeMessageResearcher, setActiveMessageResearcher] = useState<LabResearcher | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sentNotification, setSentNotification] = useState<string | null>(null);

  const roles = ["ALL", "Faculty Guide", "Embedded Systems", "Thermal", "Machine Learning"];

  const filteredResearchers = researchers.filter((res) => {
    const matchesSearch = 
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      res.currentSubsystem.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = 
      roleFilter === "ALL" ||
      (roleFilter === "Faculty Guide" && res.role.includes("Faculty")) ||
      (roleFilter === "Embedded Systems" && res.role.includes("Embedded")) ||
      (roleFilter === "Thermal" && res.role.includes("Thermal")) ||
      (roleFilter === "Machine Learning" && res.role.includes("Machine Learning"));

    return matchesSearch && matchesRole;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMessageResearcher || !messageText.trim()) return;
    onSendMessageToResearcher(activeMessageResearcher.name, messageText.trim());
    setSentNotification(`Direct message sent to ${activeMessageResearcher.name}`);
    setTimeout(() => setSentNotification(null), 3500);
    setMessageText("");
    setActiveMessageResearcher(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Lab Teams & Faculty Directory
            </h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {project.institution}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Directly collaborate with university principal investigators, postgraduate researchers, and engineering leads.
            Identify standout talent for corporate fellowship and direct recruitment.
          </p>
        </div>

        {/* Feedback toast */}
        {sentNotification && (
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {sentNotification}
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search researchers, skills, subsystems..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                roleFilter === r
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Researchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredResearchers.map((res) => {
          return (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with Avatar & Flag */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={res.avatar} alt={res.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        {res.name}
                        {res.flaggedForHiring && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Corporate Flag
                          </span>
                        )}
                      </h3>
                      <div className="text-xs font-semibold text-blue-600">{res.role}</div>
                      <div className="text-[11px] text-slate-500">{res.department}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleTalentFlag(res.id)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      res.flaggedForHiring
                        ? "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-transparent"
                    }`}
                    title={res.flaggedForHiring ? "Unflag talent" : "Flag Standout Researcher for Corporate Hiring"}
                  >
                    {res.flaggedForHiring ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Degrees */}
                <div className="mb-3 space-y-1">
                  {res.degrees.map((deg, i) => (
                    <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{deg}</span>
                    </div>
                  ))}
                </div>

                {/* Subsystem Assignment */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Assigned Subsystem
                  </span>
                  <span className="font-semibold text-slate-800">{res.currentSubsystem}</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {res.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-md border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActivePubResearcher(res)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Publications ({res.publicationsCount})</span>
                </button>

                <button
                  onClick={() => setActiveMessageResearcher(res)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Publications Modal */}
      {activePubResearcher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Publications: {activePubResearcher.name}
                </h4>
              </div>
              <button
                onClick={() => setActivePubResearcher(null)}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              <p className="text-xs text-slate-500 mb-2">
                Peer-reviewed research and international conference proceedings indexed in Scopus/IEEE Xplore.
              </p>
              {activePubResearcher.publications.map((pub, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-xs text-slate-900">{pub.title}</div>
                  <div className="text-[11px] text-blue-600 font-medium">{pub.journal}</div>
                  <div className="text-[10px] text-slate-400">Year: {pub.year} • Indexed Journal</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActivePubResearcher(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Message Modal */}
      {activeMessageResearcher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Message: {activeMessageResearcher.name}
                </h4>
              </div>
              <button
                onClick={() => setActiveMessageResearcher(null)}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subject / Subsystem Topic
                </label>
                <input
                  type="text"
                  readOnly
                  value={`Ref: ${project.title} - ${activeMessageResearcher.currentSubsystem}`}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mentor Message / Inquiry
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Write technical note or scheduling inquiry for ${activeMessageResearcher.name}...`}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-800">
                Messages are routed to the researcher&apos;s institutional email ({activeMessageResearcher.email}) and logged to the project chat channel.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveMessageResearcher(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
