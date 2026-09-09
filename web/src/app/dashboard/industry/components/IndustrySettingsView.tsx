"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Clock, 
  Tag, 
  Bell, 
  LogOut, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Save,
  AlertCircle
} from "lucide-react";
import { OfficeHourSlot } from "./types";

interface IndustrySettingsViewProps {
  officeHours: OfficeHourSlot[];
  onAddOfficeHourSlot: (slot: Omit<OfficeHourSlot, "id">) => void;
  onDeleteOfficeHourSlot: (slotId: string) => void;
  expertiseTags: string[];
  onAddExpertiseTag: (tag: string) => void;
  onRemoveExpertiseTag: (tag: string) => void;
  onTriggerLogout: () => void;
}

export function IndustrySettingsView({
  officeHours,
  onAddOfficeHourSlot,
  onDeleteOfficeHourSlot,
  expertiseTags,
  onAddExpertiseTag,
  onRemoveExpertiseTag,
  onTriggerLogout,
}: IndustrySettingsViewProps) {
  // New Slot State
  const [newDay, setNewDay] = useState("Friday");
  const [newStartTime, setNewStartTime] = useState("15:00");
  const [newEndTime, setNewEndTime] = useState("17:00");
  const [newType, setNewType] = useState<OfficeHourSlot["type"]>("Office Hours");
  const [newRecurring, setNewRecurring] = useState(true);

  // New Tag State
  const [newTagInput, setNewTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  // Notification toggles
  const [notifyMilestones, setNotifyMilestones] = useState({ email: true, sms: false, inApp: true });
  const [notifyEscrow, setNotifyEscrow] = useState({ email: true, sms: true, inApp: true });
  const [notifyChat, setNotifyChat] = useState({ email: false, sms: false, inApp: true });
  const [notifyThermalAlerts, setNotifyThermalAlerts] = useState({ email: true, sms: true, inApp: true });

  // Saved Toast
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOfficeHourSlot({
      day: newDay,
      dateNumber: Math.floor(Math.random() * 28) + 1,
      startTime: newStartTime,
      endTime: newEndTime,
      recurring: newRecurring,
      type: newType,
      attendees: ["Assigned Lab Principal Investigator"]
    });
    setSaveMessage("New availability slot scheduled and synchronized to calendar.");
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim();
    if (!tag) return;
    if (expertiseTags.includes(tag)) {
      setTagError("Tag already exists.");
      return;
    }
    onAddExpertiseTag(tag);
    setNewTagInput("");
    setTagError(null);
  };

  const handleRemoveTag = (tag: string) => {
    if (expertiseTags.length <= 1) {
      setTagError("At least 1 primary domain expertise tag is required for mentor matching.");
      return;
    }
    onRemoveExpertiseTag(tag);
    setTagError(null);
  };

  const handleSavePreferences = () => {
    setSaveMessage("Preferences and notification channels saved successfully.");
    setTimeout(() => setSaveMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" /> Mentor Settings & Office Hours Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure weekly recurring mentoring slots, domain expertise taxonomy, and real-time alert dispatch rules.
          </p>
        </div>

        {saveMessage && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {saveMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Office Hours Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Weekly Mentoring Office Hours
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              University researchers can book technical review slots during these designated blocks.
            </p>
          </div>

          {/* Existing Slots List */}
          <div className="space-y-2.5">
            {officeHours.map((slot) => (
              <div
                key={slot.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{slot.day}s</span>
                    <span className="text-blue-600 font-mono font-bold">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    {slot.recurring && (
                      <span className="px-2 py-0.2 bg-blue-100 text-blue-800 text-[9px] font-bold rounded-full">
                        Recurring
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Type: <span className="font-medium text-slate-700">{slot.type}</span> • Attendees: {slot.attendees.join(", ")}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteOfficeHourSlot(slot.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Availability Block"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Availability Slot Form */}
          <form onSubmit={handleAddSlot} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
            <span className="text-xs font-bold text-blue-900 block">Add New Availability Window</span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Day of Week</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Session Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as OfficeHourSlot["type"])}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Office Hours">General Office Hours</option>
                  <option value="Milestone Review">Milestone Review</option>
                  <option value="Lab Demonstration">Lab Demonstration</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">End Time</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRecurring}
                  onChange={(e) => setNewRecurring(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Repeat weekly throughout active milestone
              </label>

              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Window
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Expertise Tags & Notifications */}
        <div className="space-y-6">
          {/* Domain Expertise Tags */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" /> Domain Expertise Tags
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tags match your corporate specialization to incoming university R&D challenge proposals.
              </p>
            </div>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {expertiseTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 transition-colors font-black ml-1 cursor-pointer"
                    title="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {tagError && (
              <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {tagError}
              </div>
            )}

            {/* Add Tag Form */}
            <form onSubmit={handleAddTag} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Add skill tag (e.g. TinyML, PCB Layout, RTOS)..."
                className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              <button
                type="submit"
                disabled={!newTagInput.trim()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Add Tag
              </button>
            </form>
          </div>

          {/* Notification Alert Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" /> Real-Time Notification Preferences
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select communication channels for urgent lab milestones and escrow approvals.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* Event 1 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800">Milestone Submissions & CAD Uploads</span>
                  <p className="text-[11px] text-slate-500">Alerts when lab submits thermal logs or schematics</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={notifyMilestones.email}
                      onChange={(e) => setNotifyMilestones((p) => ({ ...p, email: e.target.checked }))}
                      className="rounded text-blue-600"
                    /> Email
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={notifyMilestones.inApp}
                      onChange={(e) => setNotifyMilestones((p) => ({ ...p, inApp: e.target.checked }))}
                      className="rounded text-blue-600"
                    /> In-App
                  </label>
                </div>
              </div>

              {/* Event 2 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800">Escrow Tranche Release Requests</span>
                  <p className="text-[11px] text-slate-500">Financial alerts for milestone funding authorization</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={notifyEscrow.email}
                      onChange={(e) => setNotifyEscrow((p) => ({ ...p, email: e.target.checked }))}
                      className="rounded text-blue-600"
                    /> Email
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={notifyEscrow.sms}
                      onChange={(e) => setNotifyEscrow((p) => ({ ...p, sms: e.target.checked }))}
                      className="rounded text-blue-600"
                    /> SMS
                  </label>
                </div>
              </div>

              {/* Event 3 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800">Emergency Out-of-Spec Test Alerts</span>
                  <p className="text-[11px] text-slate-500">Instant SMS if node voltage exceeds 22V or 70°C</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={notifyThermalAlerts.sms}
                      onChange={(e) => setNotifyThermalAlerts((p) => ({ ...p, sms: e.target.checked }))}
                      className="rounded text-blue-600"
                    /> SMS
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={notifyThermalAlerts.inApp}
                      onChange={(e) => setNotifyThermalAlerts((p) => ({ ...p, inApp: e.target.checked }))}
                      className="rounded text-blue-600"
                    /> In-App
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout / Exit Card */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-sm text-rose-900 flex items-center gap-2">
            <LogOut className="w-4 h-4 text-rose-600" /> Secure Session Sign-Out
          </h3>
          <p className="text-xs text-rose-700 mt-0.5">
            Safely exit your industrial mentor session. Unsaved review drafts and rubric calculations are preserved locally.
          </p>
        </div>

        <button
          onClick={onTriggerLogout}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out of Mentor Session
        </button>
      </div>
    </div>
  );
}
