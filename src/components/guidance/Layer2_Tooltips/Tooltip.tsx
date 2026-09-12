"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { HelpCircle, Info } from "lucide-react";

export interface TooltipProps {
  id?: string;
  title?: string;
  content: React.ReactNode;
  constraints?: string;
  children?: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
  variant?: "dark" | "light";
}

/**
 * Layer 2: In-Context Tooltip Component (Tooltip.tsx)
 * 
 * Features:
 * 1. Accessible WAI-ARIA implementation: role="tooltip", aria-describedby linkage.
 * 2. Keyboard focus and blur listeners with Escape key dismissal.
 * 3. Mouse hover enter/leave listeners.
 * 4. Mobile touch / tap toggle with outside click detection and auto-dismiss timer.
 * 5. Dynamic viewport boundary flipping: prevents horizontal and vertical screen overflow.
 * 6. Zero-dependency custom implementation with high contrast styling.
 */
export function Tooltip({
  id: customId,
  title,
  content,
  constraints,
  children,
  position = "top",
  align = "center",
  className = "",
  variant = "dark",
}: TooltipProps) {
  const autoId = useId();
  const tooltipId = customId || `tooltip-${autoId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [computedPlacement, setComputedPlacement] = useState<{
    position: "top" | "bottom" | "left" | "right";
    align: "start" | "center" | "end";
  }>({ position, align });

  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute dynamic boundary placement on open or resize
  useEffect(() => {
    if (!isOpen) return;

    const checkViewportBounds = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 260; // Estimated max width
      const tooltipHeight = 120; // Estimated height

      let nextPos = position;
      let nextAlign = align;

      // Vertical flip check: if position is top and rect.top < tooltipHeight -> flip to bottom
      if (position === "top" && rect.top < tooltipHeight + 10) {
        nextPos = "bottom";
      } else if (position === "bottom" && viewportHeight - rect.bottom < tooltipHeight + 10) {
        nextPos = "top";
      }

      // Horizontal flip/align check: if rect.right is close to right boundary -> align end
      if (rect.left + tooltipWidth > viewportWidth - 20 || rect.right > viewportWidth - 60) {
        nextAlign = "end";
      } else if (rect.left < tooltipWidth / 2 + 20) {
        nextAlign = "start";
      }

      setComputedPlacement({ position: nextPos, align: nextAlign });
    };

    checkViewportBounds();
    window.addEventListener("resize", checkViewportBounds);
    return () => window.removeEventListener("resize", checkViewportBounds);
  }, [isOpen, position, align]);

  // Mobile touch outside dismissal & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Touch toggle with 5-second auto-dismiss
  const handleTouchToggle = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 5000);
      } else if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
      return next;
    });
  };

  const handleMouseEnter = () => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  // Compute positioning CSS classes
  const getPositionClasses = () => {
    const { position: pos, align: al } = computedPlacement;

    let posClasses = "";
    if (pos === "top") {
      posClasses = "bottom-full mb-2";
    } else if (pos === "bottom") {
      posClasses = "top-full mt-2";
    } else if (pos === "left") {
      posClasses = "right-full mr-2 top-1/2 -translate-y-1/2";
    } else if (pos === "right") {
      posClasses = "left-full ml-2 top-1/2 -translate-y-1/2";
    }

    let alignClasses = "";
    if (pos === "top" || pos === "bottom") {
      if (al === "start") alignClasses = "left-0";
      else if (al === "end") alignClasses = "right-0";
      else alignClasses = "left-1/2 -translate-x-1/2";
    }

    return `${posClasses} ${alignClasses}`;
  };

  // Render trigger element
  const renderTrigger = () => {
    if (children && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref: triggerRef,
        "aria-describedby": isOpen ? tooltipId : undefined,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onClick: handleTouchToggle,
      });
    }

    // Default info trigger button
    return (
      <button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        type="button"
        aria-label={title || "More information"}
        aria-describedby={isOpen ? tooltipId : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleTouchToggle}
        className="inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 focus:outline-none focus:text-indigo-600 transition-colors p-0.5 rounded cursor-pointer"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
    );
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {renderTrigger()}

      {isOpen && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`absolute ${getPositionClasses()} z-50 w-64 sm:w-72 bg-slate-900 text-white text-xs rounded-md shadow-md p-3 border border-slate-700 transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-auto`}
        >
          {title && (
            <div className="font-bold text-slate-100 flex items-center gap-1.5 mb-1 pb-1 border-b border-slate-800 text-[11px] tracking-wide uppercase">
              <HelpCircle className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>{title}</span>
            </div>
          )}

          <div className="text-slate-300 leading-relaxed text-[11px]">
            {content}
          </div>

          {constraints && (
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/20">
                {constraints}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-defined field tooltip definitions matching guidelines_spec.md §2.1
 */
export const SUBMIT_FIELD_TOOLTIPS = {
  title: {
    key: "field_title",
    label: "Challenge Title",
    title: "Issue Summary",
    content: "Enter a concise, descriptive title summarizing the civic or environmental issue (e.g., 'Contaminated drinking water in Ward 4 borewell' or 'Damaged culvert on NH-33 service road').",
    constraints: "Max 100 characters; single-line text input.",
  },
  description: {
    key: "field_description",
    label: "Detailed Description",
    title: "Detailed Context",
    content: "Describe what is happening, when it began, how many households are affected, and any previous attempts to resolve it. Be specific about location markers and immediate risks.",
    constraints: "Min 50 characters, max 2000 characters.",
  },
  voice: {
    key: "field_voice",
    label: "Voice Recording",
    title: "Native Dialect Voice Note",
    content: "Record a voice note up to 2 minutes in Hindi, English, Nagpuri, Santali, Mundari, or Khortha. Our AI Whisper model automatically transcribes and translates your speech for official review.",
    constraints: "Max duration 120s; WebM, WAV, MP3.",
  },
  photo: {
    key: "field_photo",
    label: "Photographic Evidence",
    title: "Visual Site Evidence",
    content: "Upload up to 5 clear, unedited photos of the affected site. Our Vision-LM AI inspects visual severity indicators and verifies geographical conditions.",
    constraints: "Max 5 photos, up to 10MB per file.",
  },
  video: {
    key: "field_video",
    label: "Video Clip",
    title: "Real-Time Video Proof",
    content: "Attach a short video demonstrating active issues like overflowing drains, toxic smoke, or structural cracks. Video evidence significantly accelerates administrative triage.",
    constraints: "Max 60 seconds; max 50MB; MP4, WebM.",
  },
  location: {
    key: "field_location",
    label: "Site Location / GPS",
    title: "Privacy-Protected Geo-Pin",
    content: "Click 'Detect My Location' or drop a pin on the map. To safeguard your privacy, exact coordinates are encrypted with AES-256; public feeds display only a fuzzed 500-meter radius polygon.",
    constraints: "AES-256 encrypted; 500m fuzz polygon.",
  },
  submit: {
    key: "field_submit",
    label: "Submit Grievance",
    title: "Docket Dispatch",
    content: "Dispatches your docket to the AI Cognitive Engine for Tri-Track triage. You will immediately receive a unique tracking ID (format: IN-JH-2026-xxxx) and real-time status tracking.",
    constraints: "Statutory 21-day resolution SLA.",
  },
} as const;
