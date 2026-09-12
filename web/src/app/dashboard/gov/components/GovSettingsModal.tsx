"use client";

import { useState } from "react";
import { DistrictData } from "../types";
import { Settings, Shield, UserCheck, KeyRound, LogOut, CheckCircle2, AlertCircle, X, Search, Edit3 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface GovSettingsModalProps {
  districts: DistrictData[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateOfficer: (districtId: string, officerName: string, email: string, phone: string) => void;
}

export function GovSettingsModal({ districts, isOpen, onClose, onUpdateOfficer }: GovSettingsModalProps) {
  const { logout } = useAuthStore();
  const [search, setSearch] = useState("");
  const [editingDistrict, setEditingDistrict] = useState<DistrictData | null>(null);
  const [officerName, setOfficerName] = useState("");
  const [officerEmail, setOfficerEmail] = useState("");
  const [officerPhone, setOfficerPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  if (!isOpen) return null;

  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.nodalOfficer.name.toLowerCase().includes(search.toLowerCase()) ||
    d.nodalOfficer.email.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (d: DistrictData) => {
    setEditingDistrict(d);
    setOfficerName(d.nodalOfficer.name);
    setOfficerEmail(d.nodalOfficer.email);
    setOfficerPhone(d.nodalOfficer.phone);
    setErrorMsg("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistrict) return;

    // Validate government email (.gov.in or .nic.in)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)?(gov\.in|nic\.in)$/i;
    if (!emailRegex.test(officerEmail.trim())) {
      setErrorMsg("Official email must belong to a valid .gov.in or .nic.in domain.");
      return;
    }

    if (!officerName.trim() || officerName.length < 3) {
      setErrorMsg("Please enter a valid officer name.");
      return;
    }

    onUpdateOfficer(editingDistrict.id, officerName.trim(), officerEmail.trim(), officerPhone.trim());
    setSuccessToast(`DNO credentials updated for ${editingDistrict.name} District.`);
    setEditingDistrict(null);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-500/30 rounded-2xl">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  State Administration
                </span>
                <span className="text-xs text-slate-400 font-mono">24 Districts Config</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                DNO Credential Management & Security Settings
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successToast}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Editing Drawer / Box if open */}
          {editingDistrict && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Reassign District Nodal Officer: <span className="text-blue-700">{editingDistrict.name}</span>
                  </h4>
                </div>
                <button
                  onClick={() => setEditingDistrict(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Officer Full Name</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Official NIC / GOV Email</label>
                  <input
                    type="email"
                    value={officerEmail}
                    onChange={(e) => setOfficerEmail(e.target.value)}
                    placeholder="officer@jharkhand.gov.in"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={officerPhone}
                    onChange={(e) => setOfficerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDistrict(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
                  >
                    Save & Issue DSC Credentials
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DNO List Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Authorized District Nodal Officers (24 Monitored Districts)
              </h4>
              <p className="text-xs text-slate-500">
                Nodal officers hold statutory triage authority to route citizen challenges to municipal departments or academic lab hubs.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search district or officer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Assigned Nodal Officer</th>
                  <th className="px-4 py-3">Official Email</th>
                  <th className="px-4 py-3">DSC Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDistricts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {d.name}
                      <span className="block text-[10px] font-normal text-slate-400">{d.division} Division</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{d.nodalOfficer.name}</div>
                      <div className="text-[10px] text-slate-500">{d.nodalOfficer.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {d.nodalOfficer.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <KeyRound className="w-3 h-3 text-emerald-600" />
                        DSC Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => startEdit(d)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-[11px] transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Session Sign Out Box */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-rose-950">Security Session Termination</h5>
                <p className="text-[11px] text-rose-700">
                  Terminates all administrative cookies, clears DSC keycache, and logs statutory exit event.
                </p>
              </div>
            </div>

            {showSignoutConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-900">Confirm sign out?</span>
                <button
                  onClick={() => logout()}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowSignoutConfirm(false)}
                  className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 text-xs rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSignoutConfirm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Admin Session
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
