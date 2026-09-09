"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  Scale, 
  Coins, 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  Users, 
  Building2, 
  ExternalLink,
  Lock,
  Landmark,
  Sparkles
} from "lucide-react";

export default function GuidelinesPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [downloadToast, setDownloadToast] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleDownloadPdf = () => {
    // Generate simulated official guidelines text/document blob
    const content = `GOVERNMENT OF JHARKHAND - STATE INNOVATION COUNCIL
OFFICIAL DIRECTIVE & OPERATIONAL GUIDELINES (2026-2028)
Gazette Notification: JH-SIC-ORD-2026/894
Version: 2.4 | Approved by Department of Higher Education & Industries

1. ELIGIBILITY CRITERIA
- Higher Education Institutions (HEIs): NIRF ranked or NAAC A/A+ accredited state and central universities.
- Startups & MSMEs: Registered with DPIIT with valid Udyam certificate.
- Non-Governmental Organizations: Registered on NITI Aayog NGO-DARPAN portal with min 3 years audited filings.
- Independent Experts: Minimum 5 years specialized R&D experience or former personnel of national labs (ISRO, DRDO, CSIR).

2. INTELLECTUAL PROPERTY (IP) AND TECHNOLOGY TRANSFER
- Joint IP Framework: Solutions co-developed under state challenges hold joint patent assignment.
- Royalty & Commercialization: 60% to Principal Investigator team, 20% to Host Institute R&D Corpus, 20% to State Innovation Escrow.
- Perpetual Public Use: State Government retains perpetual, royalty-free non-exclusive license for sovereign and civil implementations.

3. GRANT DISBURSEMENT & ESCROW PROTOCOLS
- Tranche 1 (30%): Upon approval of Detailed Project Report (DPR) and ethical clearance.
- Tranche 2 (40%): Upon laboratory prototype validation and demonstration to expert panel.
- Tranche 3 (30%): Upon verified field deployment and District Collector sign-off.
- CSR Matching: Eligible for 100% tax exemption under Section 80G and Section 135 Companies Act 2013.

4. ETHICAL COMPLIANCE & CITIZEN PRIVACY
- Compliance with Digital Personal Data Protection (DPDP) Act 2023.
- Full geo-privacy hashing of citizen identities at submission.
- Independent ethics audit required for AI inference models in public welfare.
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Jharkhand_Innovation_Guidelines_2026_Official.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 4000);
  };

  const faqs = [
    {
      q: "How are Intellectual Property (IP) rights divided when an industry partner funds 100% of the prototype?",
      a: "The technology transfer framework provides a 60-20-20 formula: 60% of commercial licensing royalties flow directly to the student/faculty research team, 20% to the host university incubator cell, and 20% to the State Innovation Fund. The industry funder receives first right of commercial refusal and non-exclusive commercialization rights at pre-agreed royalty caps."
    },
    {
      q: "What occurs if a field trial fails to satisfy the milestone benchmarks during Phase 2?",
      a: "An independent Peer Review Committee conducts a failure post-mortem within 14 days. If the deviation is technical and solvable, a 60-day corrective remediation milestone is granted without grant forfeiture. If fundamentally non-viable, unspent Phase 2 escrow reserves are returned to the funding partner or re-assigned to alternate research approaches."
    },
    {
      q: "Can an independent researcher or retired scientist lead a project without formal university affiliation?",
      a: "Yes. Independent researchers can apply as 'Principal Mentors' or co-investigators by partnering with any accredited state university nodal cell. Alternatively, registered NGOs with NITI Aayog DARPAN ID can act as administrative hosts for independent domain experts."
    },
    {
      q: "How does the platform ensure citizen anonymity and protect whistleblower data?",
      a: "All ground telemetry and citizen issue submissions are cryptographically hashed using SHA-256 before ingestion into public feeds. Exact household coordinates are fuzzed into a 500-meter geo-hash block to safeguard reporting citizens from local reprisal while preserving actionable localization."
    },
    {
      q: "What tax exemptions apply to corporate entities providing prototype funding?",
      a: "All financial contributions through the State Innovation Escrow qualify as approved Corporate Social Responsibility (CSR) expenditure under Schedule VII, Item (ix) of the Companies Act, 2013, as well as 100% deductions under Section 80G/35(1)(ii) of the Income Tax Act."
    },
    {
      q: "How are inter-departmental clearances (Forestry, Mining, Water Resources) expedited?",
      a: "Once an AI-triaged challenge is designated as 'Critical State Priority', the Chief Secretary's Office issues a Single Window Expedited Clearance (SWEC) order mandating field agency compliance within 7 working days."
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {downloadToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 font-semibold text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            Official Guidelines PDF/Gazette downloaded successfully.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/50 text-indigo-300 text-xs font-mono">
              <Landmark className="w-3.5 h-3.5" /> Gazette JH-SIC-2026-v2.4
            </span>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" /> Download Official PDF
            </button>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <header className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800/80">
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Regulatory Framework & Protocols
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            State Innovation Governance & IP Guidelines
          </h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed">
            Standard operating procedures, intellectual property division, milestone-based escrow release schedules, and ethical compliance standards for all participating entities.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Section 1: 4 Pillars Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-400" /> Core Policy Frameworks
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pillar 1: Eligibility */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Institutional & Participant Eligibility</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Clear qualifying criteria ensuring reputable, capable research and implementation standards across academic, corporate, and civil domains.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Higher Education Institutes:</strong> NAAC 'A' grade or NIRF Top 200 state/central universities with certified incubation facilities.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Startups & MSMEs:</strong> DPIIT-registered with active Udyam certificates in DeepTech, Agritech, or CleanTech.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Civil Society / NGOs:</strong> 3+ years active operational history with valid NITI Aayog DARPAN ID registration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Independent Experts:</strong> Verified credentials from national bodies (ISRO, DRDO, CSIR, ICAR).</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2: IP & Tech Transfer */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. IP Rights & Technology Transfer</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Balanced model protecting student researchers while incentivizing industry sponsorship and preserving sovereign public utility rights.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>60-20-20 Royalty Split:</strong> 60% directly to the inventing research team, 20% to University R&D Cell, 20% to State Innovation Escrow.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Industry First Right:</strong> Funding partners enjoy 180-day exclusive first right of refusal for commercial patent exploitation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Public Good License:</strong> State Government retains irrevocable, royalty-free non-commercial deployment license across public welfare.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Open Source Clause:</strong> Civic software algorithms default to permissive open-source licenses after 24 months.</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3: Funding & Escrow */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Grant Disbursement & Escrow Rules</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Milestone-locked financial disbursement to prevent project stalling and guarantee transparent utilization of state and CSR capital.
              </p>
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-center">
                <div className="border-r border-slate-800 pr-2">
                  <span className="text-xs font-bold text-emerald-400 block">Tranche 1</span>
                  <span className="text-lg font-black text-white">30%</span>
                  <span className="text-[11px] text-slate-400 block">DPR Approval</span>
                </div>
                <div className="border-r border-slate-800 pr-2">
                  <span className="text-xs font-bold text-blue-400 block">Tranche 2</span>
                  <span className="text-lg font-black text-white">40%</span>
                  <span className="text-[11px] text-slate-400 block">Lab Prototype</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-400 block">Tranche 3</span>
                  <span className="text-lg font-black text-white">30%</span>
                  <span className="text-[11px] text-slate-400 block">Field Validation</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Funds are held in state-supervised escrow accounts. Release requires dual cryptographic sign-off by the Principal Investigator and the District Technology Officer.
              </p>
            </div>

            {/* Pillar 4: Ethics & Citizen Privacy */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">4. Citizen Privacy & Ethical Oversight</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Uncompromising citizen privacy protections adhering to national data governance legislation and institutional review norms.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>DPDP Act 2023 Compliance:</strong> Zero collection of Aadhaar or raw PII during initial challenge reporting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Geo-Privacy Fuzzing:</strong> Exact GPS coordinates are automatically blurred to a 500m radius polygon in public feeds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Informed Consent:</strong> Field testing in tribal and rural areas requires village Gram Sabha council approval.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Whistleblower Immunity:</strong> Citizen reporters are legally shielded from retaliation under State Whistleblower protections.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive FAQ Accordion */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Frequently Answered Queries (FAQ)</h2>
            <p className="text-slate-400 text-sm">Detailed legal, financial, and procedural answers for project stakeholders.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-semibold text-white text-base leading-snug">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${activeFaq === index ? "rotate-180 text-indigo-400" : ""}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-800/60 px-6 py-4 bg-slate-950/50"
                    >
                      <p className="text-slate-300 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Official Gazette Callout & Actions */}
        <section className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-800/40 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" /> State Council Verification
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
              Need Institutional Legal Clarification?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              The State Innovation Council legal cell provides dedicated tech-transfer conciliation and CSR drafting assistance to all registered universities and corporate partners.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleDownloadPdf}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Official Guidelines PDF
              </button>
              <Link
                href="/login"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-xl transition-all border border-slate-700 flex items-center gap-2"
              >
                Enter Portal & Register <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
