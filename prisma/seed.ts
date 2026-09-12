import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Jharkhand Smart Study and Innovation Portal database...");

  // Clear existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.fundingCommitment.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = "Jharkhand@2026!";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  // ---------------------------------------------------------------------------
  // 1. SEED USERS / TEST PERSONAS
  // ---------------------------------------------------------------------------
  console.log("Creating test personas...");

  const stateAdminUser = await prisma.user.create({
    data: {
      email: "chief.secretary@jharkhand.gov.in",
      phone: "+919835099999",
      passwordHash,
      role: "STATE_ADMIN",
      status: "ACTIVE",
      tier: "STATE",
      name: "Shri L. K. Verma, IAS",
      organization: "State Innovation Council & Cabinet Secretariat, Govt. of Jharkhand",
      designation: "Chief Secretary & State Command Director",
      district: "Ranchi",
      bio: "Exercising apex sovereign oversight, cross-district escalation, and state-wide innovation triage.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
      twoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
    },
  });

  const govUser = await prisma.user.create({
    data: {
      email: "nodal.innovation@jharkhand.gov.in",
      phone: "+919835012345",
      passwordHash,
      role: "GOV",
      status: "ACTIVE",
      name: "Dr. R. K. Soren, IAS",
      organization: "Department of Higher & Technical Education, Govt. of Jharkhand",
      designation: "Principal Secretary & State Innovation Nodal Officer",
      district: "Ranchi",
      bio: "Coordinating state-wide societal challenge escalation, institutional grants, and statutory CSR convergence.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
      twoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP", // Base32 test secret for TOTP
    },
  });

  const universityUser1 = await prisma.user.create({
    data: {
      email: "pi.water@iitism.ac.in",
      phone: "+919431198765",
      passwordHash,
      role: "UNIVERSITY",
      status: "ACTIVE",
      name: "Dr. K. Banerjee",
      organization: "IIT (ISM) Dhanbad",
      designation: "Lead Principal Investigator, Environmental Science & Engineering",
      district: "Dhanbad",
      bio: "Leading translational research in mining-impacted groundwater remediation and decentralized potability systems.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  const universityUser2 = await prisma.user.create({
    data: {
      email: "pi.agri@bau.ac.in",
      phone: "+919431112233",
      passwordHash,
      role: "UNIVERSITY",
      status: "ACTIVE",
      name: "Dr. S. K. Pathak",
      organization: "Birsa Agricultural University",
      designation: "Dean & Research Lead, Precision Agriculture & Soil Science",
      district: "Ranchi",
      bio: "Leading hyper-local agro-meteorology and drought mitigation telemetry for tribal farmers.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  const universityUser3 = await prisma.user.create({
    data: {
      email: "pi.energy@nitjsr.ac.in",
      phone: "+919431144556",
      passwordHash,
      role: "UNIVERSITY",
      status: "ACTIVE",
      name: "Dr. Anita Mahato",
      organization: "NIT Jamshedpur",
      designation: "Professor & Head, Clean Energy Microgrids & Storage",
      district: "East Singhbhum",
      bio: "Pioneering decentralized renewable microgrids and battery storage systems.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  const universityUser = universityUser1; // alias for backwards-compat

  const industryUser = await prisma.user.create({
    data: {
      email: "csr.director@tatasteel.com",
      phone: "+919434055555",
      passwordHash,
      role: "INDUSTRY",
      status: "ACTIVE",
      name: "Chanakya Chaudhary",
      organization: "Tata Steel CSR Division",
      designation: "Vice President & CSR Head",
      district: "East Singhbhum",
      bio: "Channeling Section 135 corporate CSR allocations to high-impact public health and water security pilots in Jharkhand.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  const pendingIndustryUser = await prisma.user.create({
    data: {
      email: "csr.lead@coalindia.in",
      phone: "+919830022222",
      passwordHash,
      role: "INDUSTRY",
      status: "PENDING",
      name: "Amitabh Roy",
      organization: "Coal India CSR Trust",
      designation: "General Manager, Sustainable Development",
      district: "Ranchi",
      bio: "Awaiting Gov Nodal Officer administrative gate verification for statutory CSR portal access.",
      emailVerified: new Date(),
    },
  });

  const expertUser = await prisma.user.create({
    data: {
      email: "dr.sen.mentor@isro-alumni.res.in",
      phone: "+919448011111",
      passwordHash,
      role: "EXPERT",
      status: "ACTIVE",
      name: "Dr. A. K. Sen",
      organization: "ISRO Alumni Network / Society for Geoinformatics",
      designation: "Senior Remote Sensing & Hydrology Expert",
      district: "Ranchi",
      bio: "Providing technical evaluation, satellite telemetry validation, and methodology peer review for societal challenges.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  const citizenUser = await prisma.user.create({
    data: {
      email: "citizen.reporter@jharkhand.org",
      phone: "+919708099999",
      passwordHash,
      role: "CITIZEN",
      status: "ACTIVE",
      name: "Pooja Murmu",
      organization: "Gram Panchayat Nodal Committee",
      designation: "Community Health & Water Monitor",
      district: "Dhanbad",
      bio: "Field reporter logging public grievances and ground sensor telemetry across Block XYZ.",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  // ---------------------------------------------------------------------------
  // 2. SEED CHALLENGES
  // ---------------------------------------------------------------------------
  console.log("Creating challenges...");

  const challenge1 = await prisma.challenge.create({
    data: {
      publicTrackingId: "IN-GR-2026-9842", // Primary tracking ID
      title: "Contaminated Drinking Water & Acidic Runoff in Dhanbad",
      description: "Severe heavy metal leaching and acidic runoff detected in community borewells across Dhanbad colliery fringes. Turbidity exceeds standard BIS limits, rendering local aquifers non-potable for over 4,200 villagers.",
      domain: "Water Management",
      district: "Dhanbad",
      location: "Block XYZ Village 4, Near Jharia Outcrop",
      urgency: "CRITICAL",
      status: "IN_PROGRESS",
      nodalStatus: "routed_to_academia",
      reportedById: citizenUser.id,
      nodalOfficerId: govUser.id,
      nodalReviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      matchedUniversities: JSON.stringify([
        { id: "iit-ism-dhanbad-water", name: "IIT (ISM) Dhanbad", department: "Environmental Science & Engineering", matchScore: 98, email: "pi.water@iitism.ac.in" },
        { id: "bit-mesra-civil", name: "BIT Mesra, Ranchi", department: "Civil & Environmental Engineering", matchScore: 89, email: "civil.chair@bitmesra.ac.in" },
        { id: "bau-ranchi", name: "Birsa Agricultural University (BAU)", department: "Soil & Water Engineering", matchScore: 82, email: "pi.agri@bau.ac.in" }
      ]),
      claimedById: universityUser1.id,
      claimedInstitute: "IIT (ISM) Dhanbad",
      claimedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      assignedToId: universityUser1.id,
      assignedInstitute: "IIT (ISM) Dhanbad",
      evidence: JSON.stringify({
        turbidity: "48 NTU",
        dissolvedIron: "6.2 mg/L",
        ph: "4.8",
        leadPpb: "32 ppb",
        laboratory: "State Water Testing Lab, Dhanbad",
        mediaUrls: [
          "/evidence/dhanbad_borewell_turbidity_1.jpg",
          "/evidence/dhanbad_runoff_channel.jpg"
        ]
      }),
      citizenVerified: true,
      verifiedByCount: 42,
      escalationLevel: 1,
      slaDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      publicTrackingId: "JHR-2026-821",
      title: "Smart Irrigation Deficiencies & Soil Nitrogen Deficit",
      description: "Smallholder tribal farmers in Gumla face severe soil nitrogen depletion and irregular micro-irrigation scheduling during the Rabi crop cycle.",
      domain: "Agriculture",
      district: "Gumla",
      location: "Basia Block, Village Khunti-Toli",
      urgency: "HIGH",
      status: "REPORTED",
      nodalStatus: "pending",
      reportedById: citizenUser.id,
      evidence: JSON.stringify({
        nitrogenDeficit: "38%",
        moistureLevel: "12%",
        reportedAreaHa: 450,
        soilType: "Red gravelly loam"
      }),
      citizenVerified: true,
      verifiedByCount: 19,
      escalationLevel: 0,
      slaDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  });

  const challenge3 = await prisma.challenge.create({
    data: {
      publicTrackingId: "JHR-2026-805",
      title: "Rural Healthcare Access & Tele-Medicine in Tribal Belts",
      description: "Absence of real-time diagnostic telemetry and specialized obstetric telemedicine consultations in remote primary health subcenters.",
      domain: "Healthcare",
      district: "Simdega",
      location: "Kolebira Block Primary Health Subcenter",
      urgency: "CRITICAL",
      status: "OPEN_FOR_PROPOSALS",
      nodalStatus: "routed_to_academia",
      reportedById: citizenUser.id,
      nodalOfficerId: govUser.id,
      nodalReviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      matchedUniversities: JSON.stringify([
        { id: "rims-bit-health", name: "Rajendra Institute of Medical Sciences (RIMS)", department: "Telemedicine & Rural Health", matchScore: 95, email: "director@rimsranchi.ac.in" },
        { id: "bit-mesra-civil", name: "BIT Mesra, Ranchi", department: "Biomedical Engineering & Health Informatics", matchScore: 90, email: "biomed@bitmesra.ac.in" },
        { id: "cuj-education", name: "Central University of Jharkhand", department: "Tribal Health & Development", matchScore: 81, email: "cuj.health@cuj.ac.in" }
      ]),
      claimedAt: null, // Unclaimed - ready for race condition claim testing
      evidence: JSON.stringify({
        networkLatencyMs: 850,
        ambulanceResponseHours: 4.5,
        targetBeneficiaries: 12000
      }),
      citizenVerified: true,
      verifiedByCount: 88,
      escalationLevel: 0,
      slaDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  const challenge4 = await prisma.challenge.create({
    data: {
      publicTrackingId: "JHR-2026-788",
      title: "Solar Microgrid Storage in Slum Clusters",
      description: "Intermittent grid voltage drops and lack of decentralized clean energy storage in urban informal settlements.",
      domain: "Energy",
      district: "Ranchi",
      location: "Hatia Ward 12 Slum Cluster",
      urgency: "HIGH",
      status: "REPORTED",
      nodalStatus: "pending",
      reportedById: citizenUser.id,
      evidence: JSON.stringify({
        outageHoursDaily: 8.5,
        householdCount: 65
      }),
      citizenVerified: true,
      verifiedByCount: 14,
      escalationLevel: 0,
    },
  });

  const challenge5 = await prisma.challenge.create({
    data: {
      publicTrackingId: "JHR-2026-764",
      title: "Digital Literacy Laboratory Access for Tribal Schools",
      description: "Kasturba Gandhi Balika Vidyalaya residential campus lacks off-grid interactive digital learning infrastructure and regional language curriculum tools.",
      domain: "Education",
      district: "Khunti",
      location: "Torpa Block KGBV Campus",
      urgency: "MEDIUM",
      status: "UNDER_REVIEW",
      nodalStatus: "diverted_to_gov",
      divertedTarget: "Road Construction Department (RCD) / State PWD",
      divertedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      nodalOfficerId: govUser.id,
      nodalReviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      reportedById: citizenUser.id,
      evidence: JSON.stringify({
        studentCount: 280,
        availableComputers: 2
      }),
      citizenVerified: true,
      verifiedByCount: 8,
      escalationLevel: 0,
    },
  });

  const challenge6 = await prisma.challenge.create({
    data: {
      publicTrackingId: "JHR-2026-750",
      title: "Subsurface Aquifer Arsenic Contamination",
      description: "Ganga alluvial floodplain handpumps displaying arsenic concentrations exceeding 80 ppb, posing chronic dermatological risk to riparian communities.",
      domain: "Water Management",
      district: "Sahebganj",
      location: "Rajmahal Ganga Basin Village 2",
      urgency: "CRITICAL",
      status: "CLOSED",
      nodalStatus: "rejected",
      rejectionReason: "Duplicate grievance already funded and sanctioned under the Namami Gange Aquifer Remediation Scheme (FY 2025-26).",
      nodalOfficerId: govUser.id,
      nodalReviewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      reportedById: citizenUser.id,
      evidence: JSON.stringify({
        arsenicPpb: "82 ppb",
        limitStandard: "10 ppb (BIS 10500)"
      }),
      citizenVerified: true,
      verifiedByCount: 31,
      escalationLevel: 1,
    },
  });

  const challenge7 = await prisma.challenge.create({
    data: {
      publicTrackingId: "JHR-2026-842",
      title: "Contaminated Drinking Water & Acidic Runoff in Dhanbad (New Intake)",
      description: "Heavy reddish discoloration, high dissolved solids and metallic taste reported across Dhanbad community wells. 40% spike in skin rashes and water-borne cases reported in local PHCs.",
      domain: "Water Management",
      district: "Dhanbad",
      location: "Dhanbad District, Block XYZ, Village 4",
      urgency: "CRITICAL",
      status: "REPORTED",
      nodalStatus: "pending",
      reportedById: citizenUser.id,
      evidence: JSON.stringify({
        turbidity: "48 NTU",
        dissolvedIron: "6.2 mg/L",
        ph: "4.8",
        leadPpb: "32 ppb",
        laboratory: "State Water Testing Lab, Dhanbad",
        mediaUrls: [
          "/evidence/dhanbad_borewell_turbidity_1.jpg",
          "/evidence/dhanbad_runoff_channel.jpg"
        ]
      }),
      citizenVerified: true,
      verifiedByCount: 42,
      escalationLevel: 1,
      slaDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // ---------------------------------------------------------------------------
  // 3. SEED PROPOSALS
  // ---------------------------------------------------------------------------
  console.log("Creating proposals...");

  const proposal1 = await prisma.proposal.create({
    data: {
      proposalRef: "PR-102",
      challengeId: challenge1.id,
      submittedById: universityUser.id,
      universityName: "IIT ISM Dhanbad",
      title: "Solar-Powered Dual-Stage Groundwater Filtration & Arsenic Precipitation Pilot",
      abstract: "Electrochemical coagulation combined with dual-stage activated alumina adsorption to reduce turbidity from 48 NTU to < 1 NTU and heavy metals to WHO potability standards.",
      methodology: "Community scale 5000 LPH filtration unit powered by 5kW rooftop solar PV array with IoT-enabled continuous turbidity and pH telemetry backhauled via LoRaWAN to Jharkhand State Pollution Control Board dashboard.",
      budget: 350000.00,
      timelineMonths: 6,
      stage: "Prototype Ready",
      status: "APPROVED",
      attachedDocs: JSON.stringify([
        { name: "Technical_DPR_IIT_ISM_Water.pdf", size: "2.8 MB", url: "/docs/dpr_iitism_pr102.pdf" },
        { name: "Lab_Bench_Pilot_Spectroscopy.pdf", size: "1.4 MB", url: "/docs/lab_iitism_pr102.pdf" }
      ]),
    },
  });

  const proposal2 = await prisma.proposal.create({
    data: {
      proposalRef: "PR-104",
      challengeId: challenge2.id,
      submittedById: universityUser.id,
      universityName: "Birsa Agricultural University",
      title: "AI-Driven Hyper-Local Soil NPK Telemetry & Micro-Drip Irrigation Scheduler",
      abstract: "Low-cost electrochemical impedance soil probes transmitting NPK deficiency alerts to tribal farmers via automated Santhali/Ho voice calls.",
      methodology: "Deploying 120 solar-powered sensor nodes across Gumla farmland, interfaced with regional weather radar for proactive drought mitigation.",
      budget: 280000.00,
      timelineMonths: 4,
      stage: "Research Phase",
      status: "UNDER_REVIEW",
      attachedDocs: JSON.stringify([
        { name: "BAU_Smart_Irrigation_Protocol.pdf", size: "3.1 MB", url: "/docs/bau_smart_irrigation.pdf" }
      ]),
    },
  });

  const proposal3 = await prisma.proposal.create({
    data: {
      proposalRef: "PR-109",
      challengeId: challenge4.id,
      submittedById: universityUser.id,
      universityName: "NIT Jamshedpur",
      title: "Modular 48V DC Nano-Grid with Second-Life EV Battery Storage",
      abstract: "Decentralized DC microgrid powering 60 slum dwellings using repurposed LiFePO4 battery modules.",
      methodology: "Smart bi-directional metering with GSM telemetry and pre-paid smart tokens managed by women's self-help groups.",
      budget: 1200000.00,
      timelineMonths: 9,
      stage: "Pilot Implementation",
      status: "SUBMITTED",
    },
  });

  const proposal4 = await prisma.proposal.create({
    data: {
      proposalRef: "PR-115",
      challengeId: challenge6.id,
      submittedById: universityUser.id,
      universityName: "IIT ISM Dhanbad",
      title: "Bio-Adsorbent Arsenic Remediation Filter using Calcined Laterite",
      abstract: "Zero-chemical arsenic removal media leveraging locally sourced Jharkhand laterite soil.",
      methodology: "Gravity-fed community columns installed directly at public tubewells with 18-month media longevity.",
      budget: 480000.00,
      timelineMonths: 8,
      stage: "Prototype Ready",
      status: "SHORTLISTED",
    },
  });

  // ---------------------------------------------------------------------------
  // 4. SEED FUNDING COMMITMENTS & ESCROW
  // ---------------------------------------------------------------------------
  console.log("Creating escrow commitments...");

  const escrow1 = await prisma.fundingCommitment.create({
    data: {
      escrowRef: "JH-ESCROW-2026-CSR-9842",
      proposalId: proposal1.id,
      industryUserId: industryUser.id,
      corporateName: "Tata Steel CSR Division",
      panNumber: "AAACT1234F",
      csrRegistrationNo: "CSR0001842",
      amount: 350000.00,
      type: "CSR",
      status: "ESCROWED",
      notes: "Statutory Section 135 CSR disbursement against Schedule VII Clean Drinking Water mandate. Funds locked in Jharkhand State Escrow Node.",
      tranches: JSON.stringify([
        { tranche: 1, percentage: 30, amount: 105000, milestone: "DPR Approval & Baseline Borewell Survey", status: "DISBURSED", date: "2026-08-15" },
        { tranche: 2, percentage: 40, amount: 140000, milestone: "Pilot Unit Installation & 30-Day Testing", status: "IN_PROGRESS", date: "2026-09-30" },
        { tranche: 3, percentage: 30, amount: 105000, milestone: "Collector Sign-off & Community Handover", status: "PENDING", date: "2026-11-15" }
      ]),
      mouSigned: true,
      mouSignedAt: new Date("2026-08-10"),
    },
  });

  // ---------------------------------------------------------------------------
  // 5. SEED AUDIT LOGS
  // ---------------------------------------------------------------------------
  console.log("Creating initial audit trail...");

  for (const log of [
      {
        userId: citizenUser.id,
        action: "CHALLENGE_CREATED",
        resource: "Challenge",
        resourceId: challenge1.id,
        challengeId: challenge1.id,
        newState: JSON.stringify({ publicTrackingId: challenge1.publicTrackingId, status: "REPORTED" }),
        ipAddress: "103.24.188.12",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
      },
      {
        userId: govUser.id,
        action: "CHALLENGE_ASSIGNED",
        resource: "Challenge",
        resourceId: challenge1.id,
        challengeId: challenge1.id,
        oldState: JSON.stringify({ status: "REPORTED" }),
        newState: JSON.stringify({ status: "IN_PROGRESS", assignedTo: "IIT ISM Dhanbad" }),
        ipAddress: "14.139.221.6",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/125.0",
      },
      {
        userId: universityUser.id,
        action: "PROPOSAL_SUBMITTED",
        resource: "Proposal",
        resourceId: proposal1.id,
        challengeId: challenge1.id,
        newState: JSON.stringify({ proposalRef: proposal1.proposalRef, budget: 350000 }),
        ipAddress: "14.139.221.18",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4)",
      },
      {
        userId: industryUser.id,
        action: "ESCROW_COMMITTED",
        resource: "FundingCommitment",
        resourceId: escrow1.id,
        challengeId: challenge1.id,
        newState: JSON.stringify({ escrowRef: escrow1.escrowRef, amount: 350000, corporate: "Tata Steel CSR" }),
        ipAddress: "115.112.240.50",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    ]) {
    await prisma.auditLog.create({ data: log });
  }

  console.log("✅ Database seeded successfully with 6 users, 6 challenges, 4 proposals, 1 escrow, and 4 audit logs.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
