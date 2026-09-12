"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Home, FilePlus, Search, HelpCircle, ArrowRight, ExternalLink, LayoutDashboard, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { UtilityBar } from "./UtilityBar";

export function GovernmentHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, checkSession } = useAuthStore();
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/submit", label: "Report Problem", icon: FilePlus },
    { href: "/track", label: "Track Grievance", icon: Search },
    { href: "/help", label: "Help & Guidelines", icon: HelpCircle },
  ];

  const searchSuggestions = [
    { title: "Fluoride Adsorbent Filter (Palamu)", type: "Critical Challenge", category: "Challenges", link: "/track" },
    { title: "Solar Cold Storage Micro-Task", type: "Open Project", category: "Challenges", link: "/track" },
    { title: "CSR Escrow Section 135 Rules", type: "Statutory Guideline", category: "Schemes", link: "/guidelines" },
    { title: "Ranchi District Nodal Triage Gate", type: "Nodal Queue", category: "Districts", link: "/dashboard/nodal" },
    { title: "Dhanbad Water Treatment Proposal", type: "Innovation Track", category: "Challenges", link: "/track" },
  ];

  const filteredSuggestions = searchSuggestions.filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  // Auto-close mobile drawer and search upon route transition
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
    setIsSearchDropdownOpen(false);
  }, [pathname]);

  // Click outside and escape handling for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };

    const handleSearchKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchDropdownOpen) {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleSearchKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleSearchKeyDown);
    };
  }, [isSearchDropdownOpen]);

  // Handle Escape key listener for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        hamburgerButtonRef.current?.focus();
      }
    };

    if (isMobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Focus the close button when drawer opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Focus trap inside mobile drawer
  const handleDrawerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !drawerRef.current) return;

    const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <header role="banner" className="w-full bg-white shadow-sm z-40 relative">
      {/* SECTION 0: Indian Tricolor Banner (4px height, 100% viewport width) */}
      <div
        className="w-full h-[4px] flex shrink-0"
        role="presentation"
        aria-hidden="true"
        data-testid="indian-tricolor-banner"
      >
        <div className="flex-1 bg-[#FF9933] h-full" data-testid="tricolor-saffron" />
        <div className="flex-1 bg-[#FFFFFF] h-full" data-testid="tricolor-white" />
        <div className="flex-1 bg-[#138808] h-full" data-testid="tricolor-green" />
      </div>

      {/* SECTION A: Standard Accessibility Utility Bar */}
      <UtilityBar />

      {/* SECTION B: Official Government Header Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex items-center justify-between gap-4">
          {/* Left: State Emblem + 3-Tier Hierarchy */}
          <Link
            href="/"
            className="flex items-center gap-3 sm:gap-4 group focus:outline-none focus:ring-4 focus:ring-[#13528A]/30 rounded-lg p-1.5 transition-all"
          >
            <div className="relative shrink-0 flex items-center justify-center p-2 sm:p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg shadow-xs group-hover:border-[#13528A]/40 transition-colors">
              <Image
                src="/assets/emblem-of-india.svg"
                alt="State Emblem of India"
                width={48}
                height={64}
                priority
                className="w-8 sm:w-11 h-auto object-contain drop-shadow-xs"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-xs sm:text-base text-slate-900 tracking-tight leading-tight">
                  Government of Jharkhand
                </span>
                <span className="text-slate-400 font-normal text-xs sm:text-sm">/</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">
                  झारखंड सरकार
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-[11px] sm:text-xs text-slate-600 font-medium">
                  Department of Higher &amp; Technical Education
                </span>
                <span className="text-slate-400 font-normal text-[11px] hidden sm:inline">/</span>
                <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
                  उच्च एवं तकनीकी शिक्षा विभाग
                </span>
              </div>
              <span className="text-[#13528A] font-bold text-xs sm:text-sm tracking-tight mt-1">
                JSICP — Societal Innovation Collaboration Portal (PRAGATI)
              </span>
            </div>
          </Link>

          {/* Right Controls: Mocked Global Search + National Portal Link + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* Mocked Global Search Component (Desktop / Tablet) */}
            <div className="relative hidden md:block" ref={searchContainerRef}>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  role="combobox"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchDropdownOpen(true);
                  }}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  placeholder="Search challenges, districts..."
                  aria-label="Global Portal Search"
                  aria-expanded={isSearchDropdownOpen}
                  aria-autocomplete="list"
                  aria-controls="global-search-suggestions"
                  className="w-44 lg:w-64 pl-9 pr-7 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13528A] focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Dropdown Overlay */}
              {isSearchDropdownOpen && (
                <div
                  id="global-search-suggestions"
                  className="absolute right-0 top-full mt-1.5 w-80 lg:w-96 bg-white border border-slate-300 rounded-md shadow-md z-50 p-3 text-left animate-in fade-in duration-150"
                  role="region"
                  aria-label="Search suggestions overlay"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Suggested Suggestions
                    </span>
                    <span className="text-[10px] text-[#13528A] font-semibold bg-[#13528A]/10 px-2 py-0.5 rounded">
                      Mocked Directory
                    </span>
                  </div>

                  {/* Category Chips Filter */}
                  <div className="flex items-center gap-1.5 py-2 flex-wrap">
                    {["All", "Challenges", "Districts", "Schemes"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                          selectedCategory === cat
                            ? "bg-[#13528A] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Suggested Search Items */}
                  <div className="space-y-1 pt-1 max-h-56 overflow-y-auto">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.link}
                          onClick={() => setIsSearchDropdownOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#13528A] shrink-0" />
                            <span className="text-slate-700 font-medium group-hover:text-slate-900 truncate">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                            {item.type}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        No matches in selected category.
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400">
                      Press ESC to close • Telemetry mapped to all 24 Jharkhand districts
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* National Portal Link (Desktop >= 1024px) */}
            <a
              href="https://india.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#13528A]"
              aria-label="National Portal of India (opens in external tab)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>india.gov.in</span>
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              ref={hamburgerButtonRef}
              type="button"
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#13528A]/30 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION C: Main Horizontal Navigation (Desktop >= 768px) */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:block bg-slate-50 border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors focus:outline-none focus:ring-4 focus:ring-[#13528A]/30 rounded-t ${
                      isActive
                        ? "border-[#13528A] text-[#13528A] bg-white shadow-xs"
                        : "border-transparent text-slate-700 hover:text-[#13528A] hover:bg-white/60"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="flex items-center">
            {isAuthenticated && user ? (
              <Link
                href={
                  user.role === "GOV" ? "/dashboard/gov" :
                  user.role === "UNIVERSITY" ? "/dashboard/university" :
                  user.role === "INDUSTRY" ? "/dashboard/industry" : "/submit"
                }
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#13528A] hover:bg-[#0E3D66] rounded-md transition-colors focus:outline-none focus:ring-4 focus:ring-[#13528A]/30"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-[#F47B20] text-white rounded-full px-5 py-2 font-bold hover:bg-[#D96711] transition-colors focus:outline-none focus:ring-4 focus:ring-[#F47B20]/30 shadow-xs text-xs"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Portal Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Responsive Hamburger Menu Drawer (< 768px viewports) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 md:hidden"
          onKeyDown={handleDrawerKeyDown}
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => {
              setIsMobileMenuOpen(false);
              hamburgerButtonRef.current?.focus();
            }}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div
            ref={drawerRef}
            className="fixed inset-y-0 right-0 max-w-xs w-full bg-white border-l border-slate-200 shadow-lg z-50 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Image
                    src="/assets/emblem-of-india.svg"
                    alt=""
                    width={28}
                    height={36}
                    className="w-6 h-auto"
                    aria-hidden="true"
                  />
                  <span className="font-bold text-sm text-slate-900">
                    PRAGATI / JSICP
                  </span>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    hamburgerButtonRef.current?.focus();
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#13528A]/30 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav aria-label="Mobile Drawer Navigation" className="p-3">
                <ul className="space-y-1.5">
                  {navLinks.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname?.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-[#13528A]/30 ${
                            isActive
                              ? "bg-[#13528A]/10 text-[#13528A] font-bold"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{item.label}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <a
                      href="https://india.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-4 focus:ring-[#13528A]/30"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="National Portal of India (india.gov.in opens in new tab)"
                    >
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                        <span>india.gov.in (National Portal)</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    </a>
                  </li>
                </ul>
              </nav>

              {/* Mobile Drawer Auth Action (Portal Login / Dashboard) */}
              <div className="p-3 border-t border-slate-100">
                {isAuthenticated && user ? (
                  <Link
                    href={
                      user.role === "GOV" ? "/dashboard/gov" :
                      user.role === "UNIVERSITY" ? "/dashboard/university" :
                      user.role === "INDUSTRY" ? "/dashboard/industry" : "/submit"
                    }
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#13528A] hover:bg-[#0E3D66] rounded-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full bg-[#F47B20] text-white rounded-full px-5 py-2 font-bold hover:bg-[#D96711] transition-colors shadow-xs text-xs"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    <span>Portal Login</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Drawer Footer Info */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 space-y-2">
              <p className="font-semibold text-slate-700">
                Department of Higher &amp; Technical Education
              </p>
              <p className="text-[11px] text-slate-500">
                Government of Jharkhand • Ranchi – 834002
              </p>
              <p className="text-[11px] text-[#13528A] font-medium pt-1">
                Toll-Free: 1800-345-6578
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default GovernmentHeader;

