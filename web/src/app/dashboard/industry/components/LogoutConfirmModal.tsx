"use client";

import React from "react";
import { LogOut, ShieldAlert, Save, X } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: (saveDrafts: boolean) => void;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirmLogout,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-rose-50/70">
          <div className="flex items-center gap-2 text-rose-950">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h4 className="font-bold text-sm">Secure Session Sign-Out</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-rose-100 rounded-md text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            You are about to sign out of the <span className="font-bold text-slate-900">Industry Mentor Portal</span>.
            Would you like to preserve any unsaved rubric evaluation drafts, redline notes, and chat drafts before terminating your session?
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            Session data is encrypted with AES-GCM and will automatically restore upon your next login.
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={() => onConfirmLogout(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Discard & Exit
          </button>
          <button
            onClick={() => onConfirmLogout(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Drafts & Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
