"use client";

import React, { useState, useMemo } from "react";
import { 
  ChevronDown, 
  HelpCircle, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Tag, 
  ExternalLink,
  BookOpen,
  Filter
} from "lucide-react";
import { FaqItem } from "../types";
import { STATUTORY_FAQS, HelpRoleKey } from "./helpData";

interface HelpFaqAccordionProps {
  activeRole?: HelpRoleKey;
  searchQuery?: string;
}

export function HelpFaqAccordion({ activeRole, searchQuery = "" }: HelpFaqAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["Q1", "Q4"]));
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const toggleItem = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFaqs.map((f) => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("All");
    cats.add("Statutory (Q1-Q7)");
    STATUTORY_FAQS.forEach((f) => cats.add(f.category));
    return Array.from(cats);
  }, []);

  // Filter FAQs based on role, category, and search query
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return STATUTORY_FAQS.filter((faq) => {
      // Category filter
      if (selectedCategory === "Statutory (Q1-Q7)") {
        if (!faq.id.startsWith("Q")) return false;
      } else if (selectedCategory !== "All" && faq.category !== selectedCategory) {
        return false;
      }

      // Search query matching
      if (q) {
        const matchesQ = faq.question.toLowerCase().includes(q);
        const matchesA = faq.answer.toLowerCase().includes(q);
        const matchesRef = (faq.statutoryRef || "").toLowerCase().includes(q);
        const matchesCat = faq.category.toLowerCase().includes(q);
        const matchesId = faq.id.toLowerCase().includes(q);
        if (!matchesQ && !matchesA && !matchesRef && !matchesCat && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden my-8">
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Scale className="w-3.5 h-3.5" />
              State Innovation Council Manual §8
            </div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Master Statutory FAQ & Legal Digest
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Verbatim authoritative answers from Section 8 of the Implementation Manual (Q1–Q7) and operational guidelines.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={expandAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-2 border-t border-slate-200/60 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion Item List */}
      <div className="divide-y divide-slate-100">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No questions found matching your filter</p>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search terms or select "All" categories to view the complete FAQ digest.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Category Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);
            const isStatutoryVerbatim = faq.id.startsWith("Q");

            return (
              <div key={faq.id} className="transition-colors hover:bg-slate-50/40">
                <button
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left p-5 md:p-6 flex items-start justify-between gap-4 cursor-pointer focus:outline-hidden focus-visible:bg-slate-50"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        isStatutoryVerbatim
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {faq.id}
                      </span>
                      {isStatutoryVerbatim && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded">
                          Statutory Verbatim (§8)
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {faq.category}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {faq.question}
                    </h4>
                  </div>

                  <div className={`p-1.5 rounded-lg transition-transform duration-200 ${
                    isExpanded ? "rotate-180 bg-slate-100 text-blue-600" : "text-slate-400"
                  }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-6 md:px-6 md:pb-6 text-sm text-slate-600 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 leading-relaxed">
                      {faq.answer}
                    </div>

                    {faq.statutoryRef && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>
                          Statutory Authority: <strong className="text-slate-700">{faq.statutoryRef}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Note */}
      <div className="p-4 bg-slate-50 border-t border-slate-200/60 text-xs text-slate-500 flex items-center justify-between">
        <span>Displaying {filteredFaqs.length} of {STATUTORY_FAQS.length} registered statutory & operational FAQs</span>
        <span className="font-medium text-slate-600">Updated: September 2026 Manual v3.0</span>
      </div>
    </div>
  );
}
