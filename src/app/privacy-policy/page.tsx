import type { Metadata } from "next";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  MapPin, 
  Trash2, 
  AlertCircle, 
  Mail, 
  Clock, 
  ArrowLeft, 
  Building2, 
  FileText
} from "lucide-react";
import { DpdpBadge } from "@/components/guidance/Layer4_LegalFooter/DpdpBadge";

export const metadata: Metadata = {
  title: "Privacy Policy & DPDP Act 2023 Compliance | PRAGATI",
  description: "Statutory Data Fiduciary Disclosure and Rule 3 itemized privacy protections under the Digital Personal Data Protection (DPDP) Act, 2023 — Government of Jharkhand.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <DpdpBadge variant="compact" />
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Statutory Rule 3 Disclosure • DPDP Act 2023</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy & Data Fiduciary Disclosure
          </h1>

          <p className="mt-3 text-base text-slate-400 max-w-3xl leading-relaxed">
            Statutory disclosure by the Department of Higher & Technical Education, Government of Jharkhand, governing personal data processing on the PRAGATI / JSICP platform under Gazette Notification <span className="text-slate-200 font-mono">JH-SIC-ORD-2026/894</span>.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Data Fiduciary: Dept. of Higher & Tech Education, GoJ</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256 Geo-Encryption & 500m Fuzzing</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Last Revised: September 2026</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Core Guarantees 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Zero Mandatory PII</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              No Aadhaar, PAN card, or voter ID is ever required to report civic problems. Citizens can report issues with complete anonymity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">500m Geo-Fuzzing</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exact coordinates are encrypted with AES-256. Public maps and feeds show only a 500m blurred polygon to shield your household.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">30-Day Auto Erasure</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Under Section 8(7) DPDP Act 2023, personal phone numbers and identifiers are permanently purged within 30 days of grievance closure.
            </p>
          </div>
        </div>

        {/* Verbatim Itemized Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h2>1. Identity of Data Fiduciary</h2>
            </div>
            <p>
              The <strong className="text-white">Department of Higher & Technical Education, Government of Jharkhand</strong>, serves as the statutory <strong className="text-emerald-400">Data Fiduciary</strong> responsible for personal data processed through the PRAGATI / JSICP platform. The platform is hosted under sovereign state infrastructure in compliance with Central and State information security directives.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2>2. Categories of Personal Data Collected & Data Minimization</h2>
            </div>
            <p>
              In strict adherence to the statutory principle of <strong className="text-white">Data Minimization</strong> (Section 6 of the DPDP Act 2023), PRAGATI collects only the absolute minimum data required to triage and resolve reported civic challenges:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                  Optional Data Collected
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong className="text-slate-100">Mobile Phone Number:</strong> Optional; collected exclusively for OTP authentication and dispatching SMS/WhatsApp grievance tracking status updates.</li>
                  <li><strong className="text-slate-100">Spoken Voice Recordings:</strong> Optional voice notes up to 2 minutes in Hindi, English, Nagpuri, Santali, Mundari, or Khortha transcribed via Whisper AI.</li>
                  <li><strong className="text-slate-100">Site Evidence:</strong> Photos (up to 5) and video clips (up to 60s) of civic damage or community conditions.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2">
                  Strictly Excluded Categories (Never Demanded)
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong className="text-slate-100">No National Identity Numbers:</strong> PRAGATI never requests Aadhaar numbers, PAN cards, voter IDs, or passports.</li>
                  <li><strong className="text-slate-100">No Financial Records:</strong> No bank accounts, credit cards, or UPI IDs are ever requested from reporting citizens.</li>
                  <li><strong className="text-slate-100">No Biometrics:</strong> Fingerprint, iris, or facial recognition scans are strictly excluded.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2>3. Purpose of Data Processing</h2>
            </div>
            <p>
              Personal data is processed solely for lawful and transparent purposes directly connected with civic grievance resolution and academic challenge formulation:
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs text-slate-300">
              <li><strong className="text-white">Validation & Deduplication:</strong> Automated comparison against existing municipal records using AI vector similarity to avoid duplicate work orders and aggregate community support.</li>
              <li><strong className="text-white">Real-Time Citizen Tracking:</strong> Sending real-time docket progression alerts via SMS, WhatsApp, and email at each milestone.</li>
              <li><strong className="text-white">Field Inspection:</strong> Facilitating authorized inspection by municipal squads or university researchers under statutory Non-Disclosure Agreements.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h2>4. Geo-Privacy Obfuscation Protocol (500m Geo-Fuzzing)</h2>
            </div>
            <p>
              To protect citizens against harassment, reprisal, or unauthorized commercial profiling:
            </p>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <p>
                1. Exact GPS coordinates (latitude and longitude) captured via device sensors or map pins are immediately encrypted at rest using <strong className="text-white">AES-256</strong> cryptographic standards.
              </p>
              <p>
                2. Exact coordinates are accessible solely to the verified District Nodal Officer and assigned field engineering teams.
              </p>
              <p className="text-emerald-300 font-semibold">
                3. All public dashboards, open GIS heatmaps, and research feeds display only an obfuscated 500-meter radius polygon centroid. Individual household locations are never revealed to the public.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Trash2 className="w-5 h-5 text-emerald-400" />
              <h2>5. Data Retention & Mandatory Erasure (Section 8(7) DPDP Act 2023)</h2>
            </div>
            <p>
              Personal data is maintained strictly for the duration necessary to satisfy the grievance resolution lifecycle.
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300">
              <li>Upon verified resolution of a civic ticket and expiration of the 14-day citizen feedback window, all direct personal contact identifiers (phone numbers, email addresses) are permanently purged or cryptographically anonymized from operational databases within <strong className="text-white">30 calendar days</strong>.</li>
              <li>Citizens retain the statutory right to withdraw their grievance report at any time, which immediately triggers erasure of personal contact identifiers.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <AlertCircle className="w-5 h-5 text-emerald-400" />
              <h2>6. Whistleblower Immunity & Non-Retaliation</h2>
            </div>
            <p>
              Citizens reporting public health hazards, structural failures, illegal mining, or civic negligence are legally protected under the <strong className="text-white">Jharkhand Whistleblower Protection Act</strong>.
            </p>
            <p className="text-xs text-slate-400">
              The platform implements strict role-based access controls (RBAC) ensuring that contractor entities, local representatives, or third parties cannot view or query the identity of citizen reporters. Any retaliatory act is an offense under State law.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-700">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Mail className="w-5 h-5 text-emerald-400" />
              <h2>7. Data Protection Officer (DPO) & Statutory Grievance Redressal</h2>
            </div>
            <p className="text-xs text-slate-300">
              Under Section 12 of the DPDP Act 2023, data principals have the right to readily available means of grievance redressal. You may contact our designated officer for any query regarding your personal data:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 text-xs block">Designated Officer:</span>
                <strong className="text-white text-sm">State Data Protection Officer</strong>
                <p className="text-xs text-slate-400 mt-1">
                  PRAGATI / JSICP Governance Cell<br />
                  Directorate of Higher & Technical Education<br />
                  Government of Jharkhand, Ranchi – 834002
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div>
                  <span className="text-slate-400 text-xs block">Direct Email:</span>
                  <a href="mailto:dpo-pragati@jharkhand.gov.in" className="text-emerald-400 hover:underline font-mono text-sm">
                    dpo-pragati@jharkhand.gov.in
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Statutory Redressal SLA:</span>
                  <span className="text-emerald-300 font-semibold text-xs">
                    Initial acknowledgement within 48 hours; final resolution within 7 working days.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Ready to Report a Community Challenge?</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your voice matters. Report with complete legal protection and real-time tracking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              Report a Problem (/submit)
            </Link>
            <Link
              href="/track"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Track Docket (/track)
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
