"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Mic,
  WifiOff,
  X,
  ChevronRight,
  ChevronLeft,
  Lock,
  MapPin,
  FileCheck,
  Smartphone,
  CheckCircle2,
  Volume2,
  CloudOff,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { useGuidanceStore } from "../store";

export function CitizenOnboardingModal() {
  const [currentStep, setCurrentStep] = useState(1);
  const isOpen = useGuidanceStore((state) => state.isOnboardingOpen && state.activeOnboardingRole === "citizen");
  const completeOnboarding = useGuidanceStore((state) => state.completeOnboarding);
  const closeOnboarding = useGuidanceStore((state) => state.closeOnboarding);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleDismiss = () => {
    completeOnboarding("citizen");
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const steps = [
    {
      step: 1,
      badge: "STEP 1 OF 3 • LEGAL PRIVACY GUARANTEE",
      heading: "Your Privacy is Protected by Law",
      subheading: "Operating under the Digital Personal Data Protection (DPDP) Act, 2023",
      body: "The PRAGATI / JSICP platform is an authorized Data Fiduciary under Government of Jharkhand regulations. You can safely report community challenges without fear of exposure, harassment, or administrative retaliation.",
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      accentBorder: "border-emerald-500/40",
      points: [
        {
          title: "Zero Mandatory Personal Identifiers",
          desc: "No Aadhaar card, PAN number, or voter ID is ever demanded to file a grievance docket.",
          icon: Lock,
        },
        {
          title: "Geo-Privacy Obfuscation (500m Fuzzing)",
          desc: "Your exact GPS coordinates are encrypted with AES-256 and restricted to assigned resolution teams. All public dashboards and maps display only an obfuscated 500-meter radius polygon to safeguard your home or neighborhood.",
          icon: MapPin,
        },
        {
          title: "Whistleblower Immunity",
          desc: "Citizens reporting civic negligence, pollution, or corruption are protected under the Jharkhand Whistleblower Protection Act with strict non-retaliation enforcement.",
          icon: FileCheck,
        },
        {
          title: "Strict Purpose Limitation",
          desc: "Your mobile phone number (optional) is collected solely to send SMS/WhatsApp status updates and OTP verification, never shared with commercial entities.",
          icon: Smartphone,
        },
      ],
      callout:
        "Rule 3 Notice: You retain the right to withdraw your report, request data erasure upon resolution, and file complaints directly with our State Grievance Redressal Officer.",
    },
    {
      step: 2,
      badge: "STEP 2 OF 3 • MULTILINGUAL & VOICE INTAKE",
      heading: "Speak in Your Own Voice & Language",
      subheading: "AI-Powered Dialect Transcription for All 24 Districts",
      body: "You do not need to write formal English or navigate complex forms. PRAGATI is engineered so every resident—regardless of literacy level or technical background—can report issues in their mother tongue.",
      icon: Mic,
      iconBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      accentBorder: "border-blue-500/40",
      points: [
        {
          title: "Native Dialect Support",
          desc: "Record spoken voice notes in Hindi, English, Nagpuri, Santali, Mundari, or Khortha.",
          icon: Volume2,
        },
        {
          title: "AI Whisper Transcription",
          desc: "Spoken audio notes (up to 2 minutes) are automatically transcribed into structured text and translated for administrative review.",
          icon: Sparkles,
        },
        {
          title: "Multimedia Evidence Capture",
          desc: "Attach up to 5 photos and short video clips (up to 60 seconds). Our computer vision models analyze visual indicators of waterlogging, road damage, or clinic supply shortages.",
          icon: CheckCircle2,
        },
        {
          title: "Zero Literacy Barrier",
          desc: "Simply press the microphone icon, describe the problem at your location, and let the portal do the rest.",
          icon: Mic,
        },
      ],
      callout:
        "Dialect Engine: Optimized for Jharkhand linguistic diversity with phonetic models trained on rural Chota Nagpur and Santhal Pargana speech patterns.",
    },
    {
      step: 3,
      badge: "STEP 3 OF 3 • OFFLINE RESILIENCE",
      heading: "Works Everywhere — Even Without Internet",
      subheading: "Progressive Web App (PWA) with Local Device Queue",
      body: "Rural roads, forest villages, and remote mining belts often have poor mobile network coverage. PRAGATI ensures your problem reports are preserved and delivered without data loss.",
      icon: WifiOff,
      iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      accentBorder: "border-amber-500/40",
      points: [
        {
          title: "Offline Form Submission",
          desc: "You can fill the form, record voice notes, and capture photos while completely offline in the field.",
          icon: CloudOff,
        },
        {
          title: "Encrypted Local Queue (IndexedDB)",
          desc: "Unsent dockets are safely cached in your browser's local encrypted storage queue.",
          icon: Lock,
        },
        {
          title: "Automatic Background Sync",
          desc: "As soon as your device connects to mobile network or Wi-Fi, the submission synchronizes automatically and issues your unique tracking docket.",
          icon: CheckCircle2,
        },
        {
          title: "WhatsApp Helpline Alternative",
          desc: "No smartphone app? Report issues anytime via text or voice note to the official Jharkhand WhatsApp helpline (+91 94311 00000).",
          icon: Smartphone,
        },
      ],
      callout:
        "Offline Guarantee: Never lose progress when traveling through network shadows in rural panchayats or dense forest blocks.",
    },
  ];

  const activeData = steps[currentStep - 1];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-slate-950/80 transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-step-title"
            className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/90 rounded-lg shadow-lg overflow-hidden z-10 text-white"
          >
            {/* Header with Step indicator */}
            <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 ${activeData.iconBg}`}
                >
                  <activeData.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400 font-mono">
                    {activeData.badge}
                  </span>
                  <h2
                    id="onboarding-step-title"
                    className="text-base sm:text-lg font-bold text-white leading-tight"
                  >
                    Citizen Grassroots Onboarding
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Skip Tour
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 shrink-0 flex">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
              {/* Step Heading */}
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeData.heading}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-blue-400">
                  {activeData.subheading}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                  {activeData.body}
                </p>
              </div>

              {/* 4 Feature Points Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {activeData.points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-blue-400">
                      <pt.icon className="w-4 h-4 shrink-0 text-blue-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                        {pt.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300/90 leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Statutory Callout Box */}
              {activeData.callout && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-200/90 leading-relaxed italic">
                    {activeData.callout}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="px-5 sm:px-8 py-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
              {/* Dots indicator */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((stepNum) => (
                  <button
                    key={stepNum}
                    type="button"
                    onClick={() => setCurrentStep(stepNum)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentStep === stepNum
                        ? "w-6 bg-blue-500"
                        : "w-2 bg-slate-700 hover:bg-slate-600"
                    }`}
                    aria-label={`Go to step ${stepNum}`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    Get Started &amp; Report Issue <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
