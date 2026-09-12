"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Contrast, Volume2, Globe, Check } from "lucide-react";

export function UtilityBar() {
  const [mounted, setMounted] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState<"small" | "normal" | "large">("normal");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [srAnnouncement, setSrAnnouncement] = useState("");

  // Hydrate preferences from localStorage safely
  useEffect(() => {
    setMounted(true);
    try {
      // Contrast
      const savedContrast = localStorage.getItem("jsicp-contrast");
      if (savedContrast === "true") {
        setHighContrast(true);
        document.documentElement.classList.add("high-contrast");
        document.body.classList.add("high-contrast");
      }

      // Font scale
      const savedScale = localStorage.getItem("jsicp-fontscale") as "small" | "normal" | "large" | null;
      if (savedScale && ["small", "normal", "large"].includes(savedScale)) {
        setFontScale(savedScale);
        const percent = savedScale === "small" ? "90%" : savedScale === "large" ? "115%" : "100%";
        document.documentElement.style.fontSize = percent;
        document.documentElement.setAttribute("data-fontscale", savedScale);
      }

      // Language
      const savedLang = localStorage.getItem("jsicp-lang") as "en" | "hi" | null;
      if (savedLang && ["en", "hi"].includes(savedLang)) {
        setLang(savedLang);
        document.documentElement.setAttribute("lang", savedLang);
      }
    } catch {
      // Incognito or restricted localStorage environment
    }
  }, []);

  const toggleHighContrast = useCallback(() => {
    const next = !highContrast;
    setHighContrast(next);
    try {
      if (next) {
        document.documentElement.classList.add("high-contrast");
        document.body.classList.add("high-contrast");
        localStorage.setItem("jsicp-contrast", "true");
        setSrAnnouncement("High contrast mode enabled");
      } else {
        document.documentElement.classList.remove("high-contrast");
        document.body.classList.remove("high-contrast");
        localStorage.setItem("jsicp-contrast", "false");
        setSrAnnouncement("High contrast mode disabled");
      }
    } catch {
      // LocalStorage access exception fallback
    }
  }, [highContrast]);

  const handleFontScale = useCallback((scale: "small" | "normal" | "large") => {
    setFontScale(scale);
    const percent = scale === "small" ? "90%" : scale === "large" ? "115%" : "100%";
    const label = scale === "small" ? "90%" : scale === "large" ? "115%" : "normal 100%";
    document.documentElement.style.fontSize = percent;
    document.documentElement.setAttribute("data-fontscale", scale);
    try {
      localStorage.setItem("jsicp-fontscale", scale);
      setSrAnnouncement(`Font size adjusted to ${label}`);
    } catch {
      // Fallback
    }
  }, []);

  const handleLanguageChange = useCallback((newLang: "en" | "hi") => {
    setLang(newLang);
    document.documentElement.setAttribute("lang", newLang);
    try {
      localStorage.setItem("jsicp-lang", newLang);
      setSrAnnouncement(`Language changed to ${newLang === "en" ? "English" : "Hindi"}`);
    } catch {
      // Fallback
    }
  }, []);

  const triggerScreenReaderMode = useCallback(() => {
    setSrAnnouncement(
      "Screen Reader Optimization active. Structured landmarks, skip links, and semantic headers are ready for assistive navigation."
    );
  }, []);

  return (
    <div
      role="region"
      aria-label="Accessibility & Utility Controls"
      className="bg-[#07152d] text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4 sm:px-6 lg:px-8 relative z-50 select-none"
    >
      {/* Skip to Main Content Link (GIGW 3.0 Mandatory) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-[#FFD700] focus:text-black focus:font-bold focus:rounded-md focus:shadow-md focus:ring-4 focus:ring-[#13528A] focus:outline-none"
      >
        Skip to Main Content
      </a>

      {/* Screen reader live region for status announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        {/* Left: Government Emblem Designation & Screen Reader helper */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300 hidden sm:inline tracking-wider uppercase text-[11px]">
            Government of Jharkhand
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={triggerScreenReaderMode}
            aria-label="Screen Reader Access"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2 py-1 rounded transition-colors focus:ring-2 focus:ring-[#13528A] focus:outline-none"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span className="text-[11px] font-medium">Screen Reader Access</span>
          </button>
        </div>

        {/* Right: Accessibility Controls (Contrast, Font Scaler, Language) */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Font Size Adjuster (A- / A / A+) */}
          <div
            role="group"
            aria-label="Text Size Adjustment"
            className="flex items-center bg-slate-900/90 rounded border border-slate-700/80 p-0.5"
          >
            <button
              type="button"
              onClick={() => handleFontScale("small")}
              aria-label="Decrease text size (90%)"
              aria-pressed={mounted && fontScale === "small"}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors focus:ring-2 focus:ring-[#13528A] focus:outline-none ${
                mounted && fontScale === "small"
                  ? "bg-[#13528A] text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => handleFontScale("normal")}
              aria-label="Normal text size (100%)"
              aria-pressed={mounted && fontScale === "normal"}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors focus:ring-2 focus:ring-[#13528A] focus:outline-none ${
                mounted && fontScale === "normal"
                  ? "bg-[#13528A] text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleFontScale("large")}
              aria-label="Increase text size (115%)"
              aria-pressed={mounted && fontScale === "large"}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors focus:ring-2 focus:ring-[#13528A] focus:outline-none ${
                mounted && fontScale === "large"
                  ? "bg-[#13528A] text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              A+
            </button>
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-label="Toggle High Contrast Mode"
            aria-pressed={mounted && highContrast}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors focus:ring-2 focus:ring-[#13528A] focus:outline-none ${
              mounted && highContrast
                ? "bg-[#FFD700] text-black border-[#FFD700] font-bold"
                : "border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white hover:border-slate-600"
            }`}
          >
            <Contrast className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="text-[11px] font-medium hidden xs:inline">
              {mounted && highContrast ? "High Contrast On" : "High Contrast"}
            </span>
          </button>

          {/* Language Switcher (English / हिन्दी) */}
          <div
            role="group"
            aria-label="Select Language"
            className="flex items-center bg-slate-900/90 rounded border border-slate-700/80 p-0.5"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5 hidden sm:inline" aria-hidden="true" />
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              aria-label="Change language to English"
              aria-pressed={mounted && lang === "en"}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors focus:ring-2 focus:ring-[#13528A] focus:outline-none ${
                mounted && lang === "en"
                  ? "bg-[#13528A] text-white font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("hi")}
              aria-label="Change language to Hindi (हिन्दी)"
              aria-pressed={mounted && lang === "hi"}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors focus:ring-2 focus:ring-[#13528A] focus:outline-none ${
                mounted && lang === "hi"
                  ? "bg-[#13528A] text-white font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UtilityBar;
