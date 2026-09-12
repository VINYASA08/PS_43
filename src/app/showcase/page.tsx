"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  Banknote,
  Search
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";

export default function ShowcasePage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResolved() {
      try {
        const res = await fetch("/api/challenges?status=RESOLVED&limit=100");
        if (res.ok) {
          const data = await res.json();
          setChallenges(data.challenges || []);
        }
      } catch (err) {
        console.error("Failed to load resolved challenges", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadResolved();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-24">
      {/* Navigation spacer if there is a global fixed navbar */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <CheckCircle2 className="w-4 h-4" />
            Public Impact Showcase
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4"
          >
            Success Stories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Real problems reported by citizens, solved by academic innovation, and funded by industry partners.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading success stories...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200 shadow-sm text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Our first success stories are being built right now...</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Citizens, universities, and industry partners are collaborating to solve pressing local challenges. Check back soon!
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Report a Challenge
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((ch, idx) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all group flex flex-col"
              >
                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {/* Before / After Mockup */}
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 bg-rose-50/50 flex flex-col items-center justify-center border-r border-white/50">
                      <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Before</span>
                      <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center">
                        <Search className="w-6 h-6 text-rose-400" />
                      </div>
                    </div>
                    <div className="w-1/2 bg-emerald-50/50 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">After</span>
                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {ch.domain}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {ch.district}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                    {ch.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Solved By</div>
                        <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {ch.claimedInstitute || ch.assignedInstitute || "University Partner"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Funded By</div>
                        <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                          CSR Industry Partner
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
