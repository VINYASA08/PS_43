/**
 * Authoritative Help Center Data & Statutory FAQ Matrix
 * Authority: Department of Higher & Technical Education, Government of Jharkhand
 * Project: PRAGATI / JSICP (Problem Statement 26043)
 * Reference: guidelines_spec.md (§3, §8), IP guidelines.pdf, JSICP.docx §17
 */

import { GuidanceRole, FaqItem, WorkflowStage } from "../types";

export type HelpRoleKey = "citizens" | "universities" | "industry" | "government" | "local-body";

export interface ProceduralGuide {
  id: string;
  title: string;
  category: string;
  summary: string;
  steps: string[];
  statutoryRef?: string;
}

export interface RoleDocumentation {
  id: HelpRoleKey;
  internalRole: GuidanceRole;
  title: string;
  badge: string;
  badgeColor: string;
  department: string;
  statutoryRef: string;
  description: string;
  highlights: string[];
  proceduralGuides: ProceduralGuide[];
}

export interface GrievanceLevel {
  level: number;
  name: string;
  authority: string;
  slaAck?: string;
  slaResolution: string;
  description: string;
  escalationTrigger: string;
}

// Dialect and vernacular synonyms mapping to standard technical/civic terms
export const DIALECT_SYNONYMS: Record<string, string> = {
  khortha: "Voice Input",
  nagpuri: "Voice Input",
  "chapa-kal": "Drinking Water & Sanitation",
  "nal-jal": "Track B Public Works",
  sadak: "Rural Roads & PWD",
  water: "Drinking Water & Sanitation",
  ip: "Intellectual Property & Patents",
  grant: "Funding Tiers & Escrow Tranches",
  escrow: "Milestone Escrow & 30-40-30 Tranches",
  rofr: "Right of First Refusal & Commercialization",
  whisper: "Voice Input & AI Transcription",
  dpr: "Detailed Project Report Studio",
  dsc: "Class 3 Digital Signature Certificate",
  cin: "Corporate Identity Number",
  swec: "Single Window Clearance System",
  tribal: "Gram Sabha Tribal Consent Protocol",
  whistleblower: "Whistleblower Protection & Zero PII",
  fuzzing: "500m Geo-Privacy Obfuscation",
  sanitation: "Drinking Water & Sanitation",
  patent: "Intellectual Property & Patents",
};

export const HELP_CONTACT_INFO = {
  authority: "Government of Jharkhand — Department of Higher & Technical Education",
  division: "State Innovation Council & PRAGATI Oversight Cell",
  dpoEmail: "dpo-pragati@jharkhand.gov.in",
  grievanceEmail: "grievance.dpo@jharkhand.gov.in",
  helplinePhone: "+91 94311 00000",
  tollFreePhone: "1800-345-6789",
  workingHours: "Monday to Saturday, 09:00 AM – 06:00 PM IST",
  headquarters: "Directorate of Higher & Technical Education, Nepal House, Doranda, Ranchi – 834002",
  gazetteRef: "Gazette Notification JH-SIC-ORD-2026/894",
};

export const GRIEVANCE_LADDER: GrievanceLevel[] = [
  {
    level: 1,
    name: "Level 1: Institutional / District Nodal Review",
    authority: "District Nodal Officer (DNO) & Institutional Grievance Officer",
    slaAck: "Within 2 working days",
    slaResolution: "5 working days target",
    description: "Initial administrative assessment, docket validation, and localized field verification.",
    escalationTrigger: "Breached if unresolved within 5 working days or citizen rejects resolution.",
  },
  {
    level: 2,
    name: "Level 2: Designated State Review Authority",
    authority: "State Nodal Officer, Directorate of Higher & Technical Education",
    slaAck: "Automated via State Ledger",
    slaResolution: "10 working days target",
    description: "Inter-departmental administrative review with authority to direct Line Departments or University PIs.",
    escalationTrigger: "Breached if unaddressed after 10 working days or inter-agency jurisdictional dispute arises.",
  },
  {
    level: 3,
    name: "Level 3: State Innovation Council / Apex Committee",
    authority: "Apex Committee chaired by Additional Chief Secretary / Principal Secretary",
    slaAck: "Immediate cryptographic audit log",
    slaResolution: "20 working days final binding order",
    description: "Legal Cell conciliation, sovereign master overrides, and binding statutory dispute arbitration.",
    escalationTrigger: "Final appellate forum under Section 17 of JSICP Governance Framework.",
  },
];

export const WORKFLOW_LIFECYCLE_STAGES: WorkflowStage[] = [
  {
    stageNumber: 1,
    title: "AI Cognitive Intake & Tri-Track Triage",
    badge: "0 – 2 Hours",
    actor: "Grassroots Citizen & AI Engine",
    timeline: "Immediate / 0 to 2 Hours",
    description: "Multilingual voice/photo/text intake with pgvector semantic deduplication, 500m geo-fuzzing, urgency scoring, and Tri-Track routing.",
    deliverable: "Cryptographic Docket ID (IN-JH-2026-xxxx) & State Innovation Ledger Receipt",
  },
  {
    stageNumber: 2,
    title: "District Nodal Statutory Validation",
    badge: "Within 48 Hours",
    actor: "District Nodal Officer (DNO)",
    timeline: "Within 48 Hours (Statutory SLA)",
    description: "Administrative gatekeeper verification: 3-way triage options (Reject with justification, Divert to Line Dept Track B/C, Route to Academia Track A).",
    deliverable: "Official Validation Certificate & Digital Work Order / Academic RFP Dispatch",
  },
  {
    stageNumber: 3,
    title: "University Matching & DPR Formulation",
    badge: "Days 3 – 14",
    actor: "Higher Education Institute & Faculty PI",
    timeline: "Days 3 to 14",
    description: "72-hour exclusive race claim lock. Multidisciplinary student-faculty team creation with NEP 2020 ABC credits and 30-40-30 Detailed Project Report (DPR).",
    deliverable: "Approved Detailed Project Report & Dual DSC Tranche 1 (30%) Escrow Release",
  },
  {
    stageNumber: 4,
    title: "Corporate CSR Matching & Escrow Funding",
    badge: "Days 15 – 45",
    actor: "Corporate Industry Sponsor & State Escrow",
    timeline: "Days 15 to 45",
    description: "30-day academic priority window expires. Corporate sponsors commit funds under Sec 135 Companies Act 2013, locking 180-day exclusive ROFR.",
    deliverable: "Automated MCA Form CSR-1, 100% Sec 80G Tax Exemption & Escrow Deposit",
  },
  {
    stageNumber: 5,
    title: "Lab Prototyping, Field Pilot & Deployment",
    badge: "Months 2 – 6",
    actor: "Research Team, Industry Mentor, Gram Sabha",
    timeline: "Months 2 to 6",
    description: "Working lab prototype demonstration (Tranche 2: 40%), field pilot at reported site with Gram Sabha consent (Tranche 3: 30%), and 60-20-20 royalty distribution.",
    deliverable: "Sovereign Public Good License, Verified Citizen Closure, True Inventor Patent Filing",
  },
];

export const ROLE_DOCUMENTATION: Record<HelpRoleKey, RoleDocumentation> = {
  citizens: {
    id: "citizens",
    internalRole: "citizen",
    title: "Citizen & Grassroots Reporter Desk",
    badge: "Grassroots Inclusion",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    department: "Public Grievance & Citizen Participation Division",
    statutoryRef: "DPDP Act 2023 Rule 3 & Jharkhand Whistleblower Protection Act",
    description: "Empowering every resident across all 24 districts of Jharkhand to report community challenges, voice civic grievances, and track resolution with legal privacy guarantees.",
    highlights: [
      "DPDP Act 2023 Compliance & Zero Mandatory Personal Identifiers: No Aadhaar, PAN, or voter ID is ever demanded.",
      "Geo-Privacy 500m Fuzzing: Exact coordinates are encrypted with AES-256; public feeds show only a 500m radius polygon.",
      "Multilingual Voice Notes: Speak in Hindi, English, Nagpuri, Santali, Mundari, or Khortha with automatic Whisper AI transcription.",
      "Offline Resilience: Submissions are cached safely in local IndexedDB when offline and synchronized automatically once connected.",
      "21-Day Statutory Resolution SLA: Automated escalation to District Magistrate if delayed past 7 days.",
      "Whistleblower Legal Shield: Full non-retaliation immunity under Jharkhand State law with right to data erasure upon closure.",
    ],
    proceduralGuides: [
      {
        id: "guide_citizen_file",
        title: "How to File a Problem Docket",
        category: "Submission",
        summary: "Step-by-step procedure to document civic issues via web, voice, or WhatsApp helpline.",
        steps: [
          "Navigate to the Citizen Intake portal (/submit) or message our official WhatsApp helpline (+91 94311 00000).",
          "Provide a concise summary title and describe the ground zero reality (minimum 50 characters).",
          "If you prefer speaking, click the microphone button and record up to 2 minutes in your mother tongue (Nagpuri, Santali, Mundari, Khortha, Hindi).",
          "Attach up to 5 clear site photographs or a 60-second video demonstrating active hazards.",
          "Use 'Detect My Location' or drop a map pin. Rest assured your exact home coordinates remain encrypted under AES-256 with 500m fuzzing.",
          "Review the DPDP Act 2023 Rule 3 privacy notice, check the statutory consent box, and click Submit.",
          "Instantly receive your immutable Tracking ID (e.g. IN-JH-2026-0842) for real-time monitoring.",
        ],
        statutoryRef: "Manual §4.1, §5.1",
      },
      {
        id: "guide_citizen_track",
        title: "How to Track Docket Status & Environmental Telemetry",
        category: "Tracking",
        summary: "Monitor live resolution milestones, IoT sensor telemetry, and assigned department teams.",
        steps: [
          "Visit the Grievance Tracking Engine (/track) and enter your unique Tracking ID.",
          "View the interactive 5-stage lifecycle stepper displaying exact progress and elapsed time.",
          "Inspect environmental sensor readings (water pH, turbidity, air particulate levels) if hardware IoT nodes are active at the site.",
          "Check the name and contact desk of the assigned line agency, university lab, or municipal squad.",
          "If the docket reaches Day 7 without acknowledgement, use the 'Trigger Priority Escalation' button to alert the District Magistrate.",
        ],
        statutoryRef: "Manual §4.4, §6.2",
      },
      {
        id: "guide_citizen_whistleblower",
        title: "Whistleblower Protections & Data Erasure Rights",
        category: "Privacy & Rights",
        summary: "Understanding your statutory rights under the DPDP Act 2023 and Whistleblower Protection Act.",
        steps: [
          "Your phone number is strictly optional and used solely for transactional SMS/WhatsApp status dockets.",
          "Neither local municipal contractors nor political representatives have access to reporter identity records.",
          "Upon resolution verification, you may submit a formal Data Erasure Request via dpo-pragati@jharkhand.gov.in to purge contact logs within 30 days.",
          "Any attempted administrative retaliation is punishable under Section 12 of the Jharkhand Whistleblower Protection Act.",
        ],
        statutoryRef: "DPDP Act 2023 Sec 8(7), Manual §4.2",
      },
    ],
  },
  universities: {
    id: "universities",
    internalRole: "university",
    title: "Higher Education Institutes & Researchers Desk",
    badge: "Academic R&D",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    department: "Directorate of Higher & Technical Education, GoJ",
    statutoryRef: "Jharkhand Student Research and Innovation Policy 2025 & NISP 2019",
    description: "Facilitating academic challenge claiming, multidisciplinary research team formation, DPR budgeting, milestone-locked escrow grants, and statutory patent co-ownership.",
    highlights: [
      "Institutional Eligibility: NAAC 'A' accredited or NIRF Top 200 institutions with registered Innovation Cells.",
      "72-Hour Exclusive AI Claim Window: First-to-claim atomic lock on high-priority societal problem statements.",
      "Multidisciplinary Teams & NEP 2020: Enrolled students earn Academic Bank of Credits (ABC) credit transfers.",
      "30-40-30 Milestone Escrow Tranches: Unspent grants are held in State Escrow and released on verified benchmarks.",
      "60-20-20 Royalty Split: 60% Inventing Team (30% PI, 20% Students, 10% Co-PIs), 20% University Corpus, 20% State Escrow.",
      "Statutory Inventorship Protection: Students and faculty guides are legally named as true and first Inventors on Indian Patents Act filings.",
    ],
    proceduralGuides: [
      {
        id: "guide_univ_claim",
        title: "AI Challenge Matching & Atomic Race-Lock Claiming",
        category: "Opportunities",
        summary: "Browsing prioritized civic RFPs and executing atomic claim locks within the 72-hour window.",
        steps: [
          "Log in to the University Portal (/dashboard/university) using your verified institutional email (.ac.in).",
          "Browse matched challenges under the 'Browse Opportunities' tab. Semantic AI ranks challenges based on lab expertise and faculty publications.",
          "Review estimated grant budget, civic urgency score, and participating district requirements.",
          "Click 'Claim Challenge' to initiate an atomic race-lock. The first institution to execute locks exclusive rights for DPR submission.",
          "Ensure your department maintains fewer than 5 active projects to comply with institutional capacity constraints.",
        ],
        statutoryRef: "Manual §1.1, §5.3",
      },
      {
        id: "guide_univ_dpr",
        title: "DPR Formulation & 30-40-30 Escrow Milestones",
        category: "Grants & DPR",
        summary: "Structuring Detailed Project Reports aligned with the statutory 3-phase escrow release model.",
        steps: [
          "Assemble an interdisciplinary team combining Engineering, Physical/Life Sciences, Social Sciences, and Design.",
          "Draft the Detailed Project Report (DPR) covering technical blueprints, bills of materials, and testing protocols.",
          "Structure the budget strictly according to the statutory 30-40-30 escrow formula:",
          "• Tranche 1 (30%): Released upon DPR approval and ethical clearance via Dual DSC sign-off.",
          "• Tranche 2 (40%): Released upon successful institutional lab prototype demonstration (TRL 4–6).",
          "• Tranche 3 (30%): Released upon real-world field pilot validation with Gram Sabha / Municipal clearance.",
          "Submit Form F-02 statutory Conflict of Interest declaration signed by the University Registrar.",
        ],
        statutoryRef: "Manual §3.1, §3.2, §7.1",
      },
      {
        id: "guide_univ_ip",
        title: "IP Co-Ownership & 60-20-20 Royalty Distribution",
        category: "Intellectual Property",
        summary: "Statutory requirements for patent filings, corporate co-ownership, and internal royalty division.",
        steps: [
          "The University Technology Transfer Office (TTO) acts as legal applicant/assignee alongside the sponsoring corporate partner.",
          "All participating students and faculty guides must be formally designated as Inventors on Form 1 under the Indian Patents Act 1970.",
          "All gross commercial royalties earned by the university must follow the mandatory 60-20-20 distribution:",
          "• 60% to Inventing Research Team (30% Faculty PI, 20% Student Researchers, 10% Co-Investigators).",
          "• 20% to University R&D Incubator Corpus for laboratory equipment and seed grants.",
          "• 20% to State Innovation Escrow Fund for platform sustainability.",
          "Ensure bilateral agreements reserve the perpetual, royalty-free Sovereign Public Good License for the State of Jharkhand.",
        ],
        statutoryRef: "IP Guidelines §1-5, NISP 2019",
      },
    ],
  },
  industry: {
    id: "industry",
    internalRole: "industry",
    title: "Corporate CSR & Technology Transfer Desk",
    badge: "Corporate CSR",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    department: "Corporate Social Responsibility & Tech Transfer Cell",
    statutoryRef: "Companies Act 2013 Section 135 & Schedule VII Item (ix)(a)",
    description: "Facilitating corporate CSR sponsorship, 100% tax-deductible escrow grants, technical mentorship, TRL milestone reviews, and 180-day exclusive ROFR commercialization licensing.",
    highlights: [
      "Statutory Corporate Verification: Valid MCA Corporate Identity Number (CIN) or DPIIT startup accreditation.",
      "100% Tax Deductions: Grants qualify under Section 135 & Schedule VII Item (ix)(a) Companies Act 2013 and Section 80G.",
      "Form CSR-1 Auto-Generation: Automated statutory tax compliance documents issued upon escrow commitment.",
      "30-Day Public Priority Window: Exclusive academic incubation period precedes corporate commercialization options.",
      "3-Tier Sponsorship Model: Tier 1 (Mentorship), Tier 2 (In-Kind Labs), Tier 3 (Full Capital Funding).",
      "180-Day Right of First Refusal (ROFR): Exclusive option to license and manufacture validated prototypes.",
    ],
    proceduralGuides: [
      {
        id: "guide_ind_tiers",
        title: "Selecting Sponsorship Tiers & State Escrow Commitments",
        category: "Sponsorship",
        summary: "Understanding the three corporate engagement tiers and milestone-locked escrow deposits.",
        steps: [
          "Tier 1 (Mentorship Only): Provide technical reviews, guidance hours, and design feedback. Retains 0% IP claim; partner receives CSR Advisory Citation and priority recruitment.",
          "Tier 2 (In-Kind Infrastructure): Supply specialized testing rigs, cleanrooms, or software licenses. Yields 15% to 30% negotiated commercial licensing share.",
          "Tier 3 (Full Financial CSR Funding): Fund 100% of the prototype development budget into the State Innovation Escrow. Default 50/50 commercial split (negotiable to 60/40).",
          "Upon escrow deposit, download your automated Form CSR-1 for MCA filing and Section 80G tax deductions.",
        ],
        statutoryRef: "Manual §2.5, §3.3; IP Guidelines §2",
      },
      {
        id: "guide_ind_mentorship",
        title: "Active Technical Mentorship & TRL Audit Sign-Off",
        category: "Mentorship",
        summary: "Guiding university research teams through TRL progression on the Industry Mentor Portal.",
        steps: [
          "Access your Industry Dashboard (/dashboard/industry) to review assigned research dockets.",
          "Use the interactive Kanban task board to inspect sprint milestones, laboratory test results, and prototype schematics.",
          "Conduct bi-weekly advisory office hours with the Faculty PI and student engineers.",
          "Participate in the joint TRL audit review for Tranche 2 (40% Lab Prototype Completion) and execute the digital milestone sign-off.",
        ],
        statutoryRef: "Manual §3.2, §7.2",
      },
      {
        id: "guide_ind_rofr",
        title: "Exercising the 180-Day Exclusive Commercial ROFR",
        category: "Commercialization",
        summary: "Locking exclusive commercialization rights following successful prototype field trials.",
        steps: [
          "The 180-day exclusive Right of First Refusal (ROFR) clock activates immediately upon Phase 2 prototype validation.",
          "During this 180-day window, the university cannot license or offer the technology to any third-party competitor.",
          "Submit a formal Commercialization and Manufacturing Rollout Plan to the University Technology Transfer Office.",
          "Execute the bilateral commercial licensing agreement via Class 3 DSC, incorporating the mandatory Sovereign Public Good exemption for Jharkhand civic utilities.",
          "Note: If the solution is not commercialized within 24 months, the university reserves march-in rights and software defaults to MIT/Apache 2.0.",
        ],
        statutoryRef: "IP Guidelines §4, Manual §2.2, §2.4",
      },
    ],
  },
  government: {
    id: "government",
    internalRole: "government",
    title: "Government Officials & District Nodal Desk",
    badge: "State Governance",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    department: "District Administration & State Innovation Council",
    statutoryRef: "Jharkhand Administrative Directives & Gazette JH-SIC-ORD-2026/894",
    description: "Operational directives for District Nodal Officers (DNOs) and State Apex Administrators overseeing 48-hour triage gates, Valley of Death monitoring, and master sovereign overrides.",
    highlights: [
      "Rigorous Official Authentication: NIC email domain (.gov.in / .nic.in) + TOTP 2FA + Class 3 DSC.",
      "48-Hour District Triage SLA: Mandatory review and classification of all citizen submissions across all 24 districts.",
      "Tri-Track Decision Gates: Reject (justification required), Divert to Line Dept (Track B/C), Route to Academia (Track A).",
      "24-District Real-Time GIS Telemetry: Interactive heatmap tracking problem density and domain bottlenecks.",
      "Valley of Death Automated Flags: Immediate alert triggered for any academic innovation project stalled >14 days.",
      "Dual Escrow Release Authorization: Cryptographic digital signature by District Technology Officer alongside Faculty PI.",
    ],
    proceduralGuides: [
      {
        id: "guide_gov_triage",
        title: "District Nodal Officer (DNO) 48-Hour Triage Workflow",
        category: "Triage Operations",
        summary: "Reviewing incoming citizen reports and operating the tri-track decision gateway.",
        steps: [
          "Log in to the Nodal Triage Queue (/dashboard/nodal) within 48 hours of ticket ingestion.",
          "Inspect AI Cognitive Engine findings: duplicate cluster similarity score, domain classification, and media evidence.",
          "Select one of three authoritative statutory decision gates:",
          "1. Reject: Enter mandatory written justification (frivolous, outside district boundaries, or already resolved).",
          "2. Divert to Gov Line Department (Track B/C): Dispatch work order to PWD, Municipal Corp, or Water Resources with Day 0-3-7 SLA clock.",
          "3. Route to Academia (Track A): Approve docket for competitive AI challenge matching across Jharkhand universities.",
          "Sign the triage assessment using your authorized digital token.",
        ],
        statutoryRef: "Manual §5.6, §6.2",
      },
      {
        id: "guide_gov_command",
        title: "State Command Center & Master Override Authority",
        category: "State Oversight",
        summary: "Statewide telemetry monitoring, bottleneck resolution, and administrative overrides.",
        steps: [
          "Access the Apex Command Center (/dashboard/state) to view the 24-district choropleth GIS heatmap.",
          "Review Bottleneck Analytics comparing district average triage times against the statutory 4.0-hour benchmark.",
          "Adjudicate corporate registration applications under the Industry Approvals queue.",
          "Exercise Master Overrides: Force-reassign stalled dockets, escalate tickets directly to the Chief Secretary, or reallocate unspent escrow funds.",
          "Calibrate global AI confidence thresholds (0.70 – 0.95) under the AI Oversight console.",
        ],
        statutoryRef: "Manual §7.1, §7.2; Architecture Plan Layer 5",
      },
      {
        id: "guide_gov_swec",
        title: "Single Window Expedited Clearance (SWEC) Protocol",
        category: "Clearances",
        summary: "Fast-tracking inter-departmental statutory approvals for state priority innovations.",
        steps: [
          "Dockets tagged as 'Critical State Priority' are routed through the State Single Window Clearance System (SWEC).",
          "Automated statutory notifications are dispatched to Forestry, Mining, Environmental Control, and Water Resources departments.",
          "All participating regulatory departments must complete statutory review and grant approvals within 30 days.",
          "Unresolved clearance requests are escalated directly to the State Review Authority on Day 31.",
        ],
        statutoryRef: "Manual §8 Q6, SWEC Framework GoJ",
      },
    ],
  },
  "local-body": {
    id: "local-body",
    internalRole: "local_body",
    title: "Local Bodies, Municipalities & Line Departments Desk",
    badge: "Field Operations",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    department: "Urban Local Bodies (ULBs) & Panchayati Raj Institutions (PRIs)",
    statutoryRef: "Rapid Civic Redressal Framework (Track C) & Gram Sabha Tribal Regulations",
    description: "Zero-dashboard integration for field personnel, municipal supervisors, and rural panchayats resolving localized public works without requiring complex computer systems.",
    highlights: [
      "Zero-Dashboard Architecture: Field teams do not require desktop computers or complicated software training.",
      "WhatsApp Cloud API Integration: Linemen receive work tickets with photo and GPS location; reply 'DONE + photo' to close.",
      "Formatted Email Dockets: Structured action memos with direct one-click resolution update links for Executive Engineers.",
      "Printable QR-Code Work Orders: Supervisors print physical work orders with embedded QR codes for smartphone scanning.",
      "Day 0-3-7 Statutory SLA Ladder: Day 0 Assigned, Day 3 Reminder, Day 7 DM Escalation, Day 14 State Nodal, Day 21 Valley of Death.",
      "Mandatory Gram Sabha Consent: Rural/tribal community projects require documented Gram Sabha council resolutions.",
    ],
    proceduralGuides: [
      {
        id: "guide_local_whatsapp",
        title: "Field Ticket Management via WhatsApp Cloud API",
        category: "Field Operations",
        summary: "Receiving and resolving civic repair work orders entirely through WhatsApp.",
        steps: [
          "Field personnel receive automated WhatsApp message containing Ticket ID, location description, GPS map link, and citizen photos.",
          "Inspect the ground site and perform the necessary maintenance (drain clearance, pipe repair, transformer fix).",
          "Reply to the official WhatsApp bot with the text 'DONE' along with a clear photographic proof of the completed work.",
          "The AI vision model verifies the before/after repair evidence and marks the ticket as 'Field Resolved'.",
          "The reporting citizen is instantly notified to inspect the repair and submit a satisfaction confirmation.",
        ],
        statutoryRef: "Manual §6.1, §6.2",
      },
      {
        id: "guide_local_qr",
        title: "Printable QR-Code Physical Work Orders",
        category: "Work Orders",
        summary: "Generating and scanning paper work tickets for field inspection crews.",
        steps: [
          "Department supervisors can download and print batch work orders in PDF format with high-resolution QR codes.",
          "Field crews carry physical job sheets to remote areas with limited network connectivity.",
          "Upon completing the physical work, scan the QR code with any standard smartphone camera.",
          "The secure mobile web view opens automatically with the ticket pre-loaded, allowing one-tap photo upload and status sign-off.",
        ],
        statutoryRef: "Manual §6.1",
      },
      {
        id: "guide_local_tribal",
        title: "Gram Sabha Tribal Consent Protocol",
        category: "Compliance",
        summary: "Mandatory statutory consultation and consent before rural field deployment.",
        steps: [
          "For any technological pilot, water installation, or sensor deployment in Fifth Schedule tribal areas, formal Gram Sabha approval is mandatory.",
          "The field team presents the proposed civic prototype, benefits, and environmental safety data to the local village council.",
          "A formal resolution is recorded in the Gram Sabha register and signed by the traditional village head (Pradhan / Manki / Munda).",
          "Upload a digital scan of the Gram Sabha resolution to unlock Tranche 3 field deployment grants.",
        ],
        statutoryRef: "Manual §6.2, PESA Act & Jharkhand Panchayati Raj Act",
      },
    ],
  },
};

export const STATUTORY_FAQS: FaqItem[] = [
  {
    id: "Q1",
    question: "How are IP rights divided when an industry partner funds 100% of the prototype?",
    answer: "Under Tier 3 (Full Financial Sponsorship), the default IP split is 50% Industry / 50% University. However, this is negotiable via the platform's Dynamic IP Split screen (up to 60% Industry / 40% University). The University retains the right to license the technology to other parties after the 180-day ROFR period expires. All commercial revenue flowing to the university is distributed under the mandatory 60-20-20 Royalty Split (60% to Inventing Research Team, 20% to University R&D Cell, 20% to State Innovation Escrow), aligned with the National Innovation and Startup Policy (NISP) 2019.",
    statutoryRef: "Manual §8 Q1, IP Guidelines §2, NISP 2019",
    category: "IP & Legal",
    roles: ["university", "industry"],
  },
  {
    id: "Q2",
    question: "What occurs if a field trial fails to satisfy the milestone benchmarks during Phase 2?",
    answer: "A 30-day grace period is granted. The Principal Investigator (PI) must submit a revised remediation plan. If benchmarks are still not met, the project is downgraded to \"Stalled\" and escalated to the State Innovation Council. The sponsoring industry partner's ROFR window is extended by 90 days, or unspent Phase 2 escrow reserves may be reallocated.",
    statutoryRef: "Manual §8 Q2, Manual §3.2",
    category: "SLA & Escalation",
    roles: ["university", "industry", "government"],
  },
  {
    id: "Q3",
    question: "Can an independent researcher or retired scientist lead a project without formal university affiliation?",
    answer: "Yes, provided they have verified credentials from a national body (ISRO, DRDO, CSIR, ICAR) and partner with a registered Higher Education Institute (HEI) for laboratory access, institutional oversight, and student team formation. Alternatively, registered NGOs with NITI Aayog DARPAN ID can act as administrative hosts.",
    statutoryRef: "Manual §8 Q3, Jharkhand Innovation Policy 2025",
    category: "General",
    roles: ["university", "citizen"],
  },
  {
    id: "Q4",
    question: "How does the platform ensure citizen anonymity and protect whistleblower data?",
    answer: "The platform does not collect Aadhaar, PAN, or mandatory personal identifiers. Exact GPS coordinates are encrypted with AES-256 and fuzzed to a 500m radius polygon for public feeds. Citizens can report completely anonymously, and whistleblowers are legally shielded against retaliation under the Jharkhand Whistleblower Protection Act. The platform strictly complies with the DPDP Act 2023.",
    statutoryRef: "Manual §8 Q4, DPDP Act 2023 Rule 3, Whistleblower Act",
    category: "Privacy & Data",
    roles: ["citizen", "government", "local_body"],
  },
  {
    id: "Q5",
    question: "What tax exemptions apply to corporate entities providing prototype funding?",
    answer: "Corporate contributions to JSICP-registered projects qualify for 100% tax exemptions under Schedule VII of the Companies Act, 2013. Item no. (ix)(a) of Schedule VII explicitly covers contributions to incubators or R&D projects in science, technology, engineering, and medicine funded by Central or State Governments. Contributions also qualify for deduction under Section 80G of the Income Tax Act. The platform automatically generates a statutory Form CSR-1 for all funding partners.",
    statutoryRef: "Manual §8 Q5, Companies Act 2013 Sec 135, IT Act Sec 80G",
    category: "Escrow & Grants",
    roles: ["industry", "government"],
  },
  {
    id: "Q6",
    question: "How are inter-departmental clearances (Forestry, Mining, Water Resources) expedited?",
    answer: "The platform integrates directly with the State Single Window Clearance System (SWEC). Projects flagged as \"Critical State Priority\" by the District Nodal Officer receive expedited inter-departmental statutory clearance within 30 days.",
    statutoryRef: "Manual §8 Q6, SWEC Framework GoJ",
    category: "General",
    roles: ["government", "university", "industry"],
  },
  {
    id: "Q7",
    question: "What is the role of institutional research and innovation cells?",
    answer: "Under the Jharkhand Student Research and Innovation Policy, 2025, these cells serve as the primary interface between HEIs and the JSICP platform. They facilitate team formation, manage IP filings, and coordinate with the State Innovation Council. The policy establishes cells across 22 universities during 2026-27 (with 74 additional units annually) backed by a ₹1,280 crore investment, targeting at least 1,000 student-led innovations and a minimum of 10 university patents every year.",
    statutoryRef: "Manual §8 Q7, Jharkhand Innovation Policy 2025 §1.2",
    category: "General",
    roles: ["university", "government"],
  },
  // Role Operational FAQs
  {
    id: "OP-CIT-01",
    question: "Do I need an Aadhaar card or email address to report a public issue?",
    answer: "No. In strict compliance with the DPDP Act 2023 principle of Data Minimization, PRAGATI never requires Aadhaar, PAN, or voter credentials. An optional mobile phone number may be supplied solely to receive transactional SMS/WhatsApp status dockets. Reports can also be filed anonymously.",
    statutoryRef: "DPDP Act 2023 Sec 6, Manual §4.1",
    category: "Privacy & Data",
    roles: ["citizen"],
  },
  {
    id: "OP-CIT-02",
    question: "How do I report in regional languages like Nagpuri, Santali, Mundari, or Khortha?",
    answer: "On the submission page (/submit), simply tap the microphone button and speak naturally. Our integrated Whisper AI speech recognition model transcribes dialect recordings directly into structured grievance dockets with automated Hindi/English translations for administrative engineers.",
    statutoryRef: "NEP 2020 Vernacular Inclusion, Manual §5.1",
    category: "General",
    roles: ["citizen"],
  },
  {
    id: "OP-CIT-03",
    question: "What happens if a civic issue remains unresolved past the 21-day statutory SLA?",
    answer: "If a civic docket breaches statutory milestones, the system triggers the automated escalation ladder: Day 3 alerts the line agency, Day 7 escalates directly to the District Magistrate, Day 14 escalates to the State Nodal Officer, and Day 21 flags the problem on the Statewide Command Center as a stalled 'Valley of Death' item.",
    statutoryRef: "Manual §6.2, JSICP Governance Framework §17",
    category: "SLA & Escalation",
    roles: ["citizen", "local_body"],
  },
  {
    id: "OP-UNIV-01",
    question: "How does the 72-hour exclusive academic claim lock prevent race conditions?",
    answer: "When a high-priority problem docket is validated by the District Nodal Officer, semantic AI matches the top 3 best-suited universities. The first verified university to click 'Claim Challenge' secures an exclusive atomic lock for 72 hours, preventing duplicate grant applications while the multidisciplinary team prepares the DPR.",
    statutoryRef: "Manual §1.1, §5.3",
    category: "Escrow & Grants",
    roles: ["university"],
  },
  {
    id: "OP-UNIV-02",
    question: "How do student researchers receive Academic Bank of Credits (ABC) under NEP 2020?",
    answer: "Faculty Principal Investigators log verified student research hours and technical milestones into the institutional R&D portal. Upon successful Phase 2 prototype completion, the university registrar issues academic credit certificates mapped to the student's national ABC ID.",
    statutoryRef: "NEP 2020 ABC Framework, Policy 2025 §3.4",
    category: "General",
    roles: ["university"],
  },
  {
    id: "OP-IND-01",
    question: "How does the 180-day Right of First Refusal (ROFR) protect our commercial investment?",
    answer: "Upon successful Phase 2 prototype validation, the sponsoring corporate entity receives an exclusive 180-day window to execute commercial manufacturing and distribution licenses. During this period, the host university is prohibited from entering third-party licensing discussions for the same solution.",
    statutoryRef: "IP Guidelines §4, Manual §2.2",
    category: "IP & Legal",
    roles: ["industry"],
  },
  {
    id: "OP-IND-02",
    question: "How is Form CSR-1 generated and what tax deductions does it provide?",
    answer: "When funds are committed to the State Innovation Escrow, the platform automatically generates a digitally signed Form CSR-1 referencing Schedule VII Item (ix)(a) of the Companies Act 2013. This provides 100% deduction for corporate income tax under Section 80G.",
    statutoryRef: "Companies Act 2013 Sec 135, IT Act Sec 80G",
    category: "Escrow & Grants",
    roles: ["industry"],
  },
  {
    id: "OP-GOV-01",
    question: "What are the required qualifications and security measures for District Nodal Officers?",
    answer: "District Nodal Officers must authenticate using authorized National Informatics Centre (NIC) email credentials (.gov.in/.nic.in), complete mandatory TOTP two-factor authentication, and execute statutory milestone sign-offs using a verified Class 3 Digital Signature Certificate (DSC).",
    statutoryRef: "CCA MeitY DSC Rules, Manual §7.2",
    category: "Privacy & Data",
    roles: ["government"],
  },
  {
    id: "OP-LOC-01",
    question: "Can municipal field staff update repair tickets without desktop computer access?",
    answer: "Yes. Field supervisors and linemen receive tickets via WhatsApp Cloud API with location coordinates and citizen photos. Replying to the notification with 'DONE' and an after-repair photo triggers AI computer-vision validation and marks the ticket resolved.",
    statutoryRef: "Manual §6.1, Rapid Civic Redressal SOP",
    category: "General",
    roles: ["local_body"],
  },
];
