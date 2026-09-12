"use client";

import { useState } from "react";
import { GisMapPin } from "../types";
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, X, IndianRupee, ArrowRight, Loader2 } from "lucide-react";

interface SeedGrantModalProps {
  pin: GisMapPin | null;
  isOpen: boolean;
  onClose: () => void;
  onGrantAllocated: (pinId: string, amountCr: number) => void;
}

export function SeedGrantModal({ pin, isOpen, onClose, onGrantAllocated }: SeedGrantModalProps) {
  const [isAllocating, setIsAllocating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !pin || pin.type !== "amber_alert") return null;

  const grantAmount = pin.details.seedGrantAmountCr || 0.25; // ₹25 Lakhs
  const grantAmountLakhs = Math.round(grantAmount * 100);

  const handleAllocate = () => {
    setIsAllocating(true);
    // Simulate real state grant disbursement transaction
    setTimeout(() => {
      setIsAllocating(false);
      setIsSuccess(true);
      onGrantAllocated(pin.id, grantAmount);
    }, 1200);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsAllocating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <AlertTriangle className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-200">
                Civic Distress Intervention
              </span>
              <h3 className="text-xl font-black">{pin.title}</h3>
            </div>
          </div>
          <p className="text-amber-100 text-xs">{pin.subtitle} • {pin.district} District</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800">Seed Grant Authorized & Locked!</h4>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  State Innovation Reserve tranche of <strong className="text-emerald-700">₹{grantAmountLakhs} Lakhs</strong> has been allocated to {pin.district} Nodal Desk.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-left space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorization Code:</span>
                  <span className="font-mono font-bold text-slate-700">JH-SEED-2026-9812</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target University Triage:</span>
                  <span className="font-semibold text-slate-800">Auto-dispatched to 3 matched lab desks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Escrow Status:</span>
                  <span className="font-semibold text-emerald-600">Reserved in State Innovation Treasury</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md"
              >
                Return to GIS Telemetry Map
              </button>
            </div>
          ) : (
            <>
              {/* Problem Description */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  DNO Verified Problem Brief:
                </div>
                <p className="leading-relaxed">
                  {pin.details.problemDescription || "Severe unaddressed civic challenge requiring rapid academic engineering prototype and hardware trial."}
                </p>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-amber-800">Verified By: <strong>{pin.details.verifiedByDno}</strong></span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-200 font-bold text-amber-900">
                    Urgency: {pin.details.urgency || "Critical"}
                  </span>
                </div>
              </div>

              {/* Seed Grant Package */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">State Seed Grant Package</span>
                    <div className="flex items-center gap-1 text-2xl font-black text-slate-900">
                      <IndianRupee className="w-5 h-5 text-emerald-600" />
                      {grantAmountLakhs},00,000
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 100% State Funded
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Tranche 1 (Immediate)</span>
                    <strong className="text-slate-800">₹{(grantAmountLakhs * 0.4).toFixed(1)} L</strong> (Bill of Materials)
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Tranche 2 (Field Trial)</span>
                    <strong className="text-slate-800">₹{(grantAmountLakhs * 0.6).toFixed(1)} L</strong> (Deployment validation)
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAllocating}
                  onClick={handleAllocate}
                  className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isAllocating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authorizing State Reserve...
                    </>
                  ) : (
                    <>
                      <span>Allocate State Seed Grant</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
