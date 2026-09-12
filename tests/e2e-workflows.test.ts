import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import prisma from "../src/lib/prisma";
import { signSessionToken } from "../src/lib/auth";
import { generateCsrfToken } from "../src/lib/csrf";
import { UserRole, UserStatus } from "../src/lib/types";

// Route Handlers
import { POST as challengesPOST } from "../src/app/api/challenges/route";
import { PUT as challengeDetailPUT, GET as challengeDetailGET } from "../src/app/api/challenges/[id]/route";
import { POST as proposalsPOST } from "../src/app/api/proposals/route";
import { POST as fundsPOST } from "../src/app/api/funds/route";
import { GET as trackGET } from "../src/app/api/track/[id]/route";

export interface TestResult {
  name: string;
  tier: number;
  status: "PASS" | "FAIL" | "PENDING";
  error?: string;
  durationMs: number;
}

export interface SuiteResult {
  suiteName: string;
  passed: number;
  failed: number;
  pending: number;
  total: number;
  results: TestResult[];
}

function makeRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
    ip?: string;
    csrf?: string;
  } = {}
): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (options.token) {
    headers["cookie"] = `sih_session=${options.token}`;
  }

  if (options.ip) {
    headers["x-forwarded-for"] = options.ip;
  }

  if (options.csrf) {
    const csrfCookie = `sih_csrf=${options.csrf}`;
    headers["cookie"] = headers["cookie"]
      ? `${headers["cookie"]}; ${csrfCookie}`
      : csrfCookie;
    headers["x-csrf-token"] = options.csrf;
  }

  const init: any = {
    method: options.method || "GET",
    headers,
  };

  if (options.body !== undefined) {
    init.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  return new NextRequest(url, init);
}

export async function runWorkflowsSuite(): Promise<SuiteResult> {
  console.log("\n===============================================================================");
  console.log("SUITE: E2E COLLABORATIVE ECOSYSTEM WORKFLOWS & REAL-WORLD SCENARIOS");
  console.log("Tier 3 (Pairwise Cross-Feature Lifecycle) & Tier 4 (Real-World Jharkhand Workloads)");
  console.log("===============================================================================\n");

  const results: TestResult[] = [];
  const cleanupChallengeIds: string[] = [];
  const cleanupProposalIds: string[] = [];
  const cleanupFundIds: string[] = [];
  const cleanupUserIds: string[] = [];
  const csrfToken = generateCsrfToken();

  async function executeTest(name: string, tier: number, fn: () => Promise<void | "PENDING">) {
    const start = Date.now();
    try {
      const outcome = await fn();
      const durationMs = Date.now() - start;
      if (outcome === "PENDING") {
        console.log(`  ⏳ [Tier ${tier}] PENDING: ${name} (${durationMs}ms)`);
        results.push({ name, tier, status: "PENDING", durationMs });
      } else {
        console.log(`  ✓ [Tier ${tier}] PASS: ${name} (${durationMs}ms)`);
        results.push({ name, tier, status: "PASS", durationMs });
      }
    } catch (err: any) {
      const durationMs = Date.now() - start;
      console.error(`  ✗ [Tier ${tier}] FAIL: ${name} (${durationMs}ms)`);
      console.error(`    Error: ${err.message}`);
      results.push({ name, tier, status: "FAIL", error: err.message, durationMs });
    }
  }

  // Set up authenticated personas for the multi-party workflow
  // 1. Citizen
  const citizenUser = await prisma.user.create({
    data: {
      name: "Birsa Munda Citizen Reporter",
      phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: UserRole.CITIZEN,
      status: UserStatus.ACTIVE,
      passwordHash: "N/A",
      district: "Dhanbad",
    },
  });
  cleanupUserIds.push(citizenUser.id);
  const citizenToken = await signSessionToken({
    userId: citizenUser.id,
    name: citizenUser.name,
    role: UserRole.CITIZEN,
    status: UserStatus.ACTIVE,
  });

  // 2. University PI (IIT ISM Dhanbad)
  const uniUser = await prisma.user.create({
    data: {
      name: "Dr. Alok Sinha (Principal Investigator)",
      email: `pi.water.${Date.now()}@iitism.ac.in`,
      role: UserRole.UNIVERSITY,
      status: UserStatus.ACTIVE,
      organization: "IIT (ISM) Dhanbad",
      designation: "Professor, Dept of Environmental Science",
      passwordHash: "N/A",
      district: "Dhanbad",
    },
  });
  cleanupUserIds.push(uniUser.id);
  const uniToken = await signSessionToken({
    userId: uniUser.id,
    name: uniUser.name,
    role: UserRole.UNIVERSITY,
    status: UserStatus.ACTIVE,
  });

  // 3. Industry CSR Director (Tata Steel)
  const industryUser = await prisma.user.create({
    data: {
      name: "Rajesh Sharma (CSR Director)",
      email: `csr.director.${Date.now()}@tatasteel.com`,
      role: UserRole.INDUSTRY,
      status: UserStatus.ACTIVE,
      organization: "Tata Steel CSR Foundation",
      designation: "Vice President - Corporate Sustainability",
      passwordHash: "N/A",
      district: "East Singhbhum",
    },
  });
  cleanupUserIds.push(industryUser.id);
  const industryToken = await signSessionToken({
    userId: industryUser.id,
    name: industryUser.name,
    role: UserRole.INDUSTRY,
    status: UserStatus.ACTIVE,
  });

  // 4. Gov Principal Secretary
  const govUser = await prisma.user.create({
    data: {
      name: "Sunil Kumar IAS (Principal Secretary)",
      email: `nodal.secretary.${Date.now()}@jharkhand.gov.in`,
      role: UserRole.GOV,
      status: UserStatus.ACTIVE,
      organization: "Department of Higher & Technical Education",
      designation: "Principal Secretary",
      passwordHash: "N/A",
      district: "Ranchi",
    },
  });
  cleanupUserIds.push(govUser.id);
  const govToken = await signSessionToken({
    userId: govUser.id,
    name: govUser.name,
    role: UserRole.GOV,
    status: UserStatus.ACTIVE,
  });

  // ---------------------------------------------------------------------------
  // TIER 3: PAIRWISE CROSS-FEATURE COLLABORATIVE WORKFLOW
  // ---------------------------------------------------------------------------
  console.log("--- TIER 3: Pairwise Cross-Feature Collaborative Lifecycle ---");

  let workflowChallengeId = "";
  let workflowTrackingId = "";
  let workflowProposalId = "";
  let workflowEscrowRef = "";

  await executeTest(
    "3.1 Step 1 (Citizen Ingestion): Citizen submits challenge with telemetry & tracking ID",
    3,
    async () => {
      const payload = {
        title: "Acidic Mine Drainage contaminating Damodar Riverbank Wells in Dhanbad",
        description: "Borewell drinking water across 400 households in Jharia Sector 4 turned dark reddish with severe sulfuric odor and pH 4.4. Local children reporting skin dermatitis.",
        domain: "Water Management",
        district: "Dhanbad",
        location: "Jharia Colliery Sector 4, Damodar Riverbank",
        urgency: "CRITICAL",
        evidence: JSON.stringify({
          files: [{ name: "water_test_ph4.4.jpg", size: "1.8 MB", type: "image/jpeg", url: "/uploads/sample.jpg" }],
          coordinates: { lat: 23.7441, lng: 86.4116 },
          sensorData: { pH: 4.4, turbidityNTU: 58, ironMgL: 6.8 }
        }),
      };

      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: payload,
        token: citizenToken,
        csrf: csrfToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.match(json.trackingId, /^IN-GR-2026-\d{4}$/);

      workflowChallengeId = json.challenge.id;
      workflowTrackingId = json.trackingId;
      cleanupChallengeIds.push(workflowChallengeId);

      assert.equal(json.challenge.status, "REPORTED");
    }
  );

  await executeTest(
    "3.2 Step 2 (AI Triage & Routing): Challenge is triaged and routed to IIT ISM Dhanbad",
    3,
    async () => {
      assert.ok(workflowChallengeId, "Workflow challenge must exist from Step 1");

      // Gov Nodal Officer / AI system verifies triage, routes to IIT ISM Dhanbad, advances to OPEN_FOR_PROPOSALS
      const updatePayload = {
        status: "OPEN_FOR_PROPOSALS",
        assignedInstitute: "IIT ISM Dhanbad",
        citizenVerified: true,
      };

      const req = makeRequest(`http://localhost:3000/api/challenges/${workflowChallengeId}`, {
        method: "PUT",
        body: updatePayload,
        token: govToken,
        csrf: csrfToken,
      });

      const res = await challengeDetailPUT(req, {
        params: Promise.resolve({ id: workflowChallengeId }),
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.challenge.status, "OPEN_FOR_PROPOSALS");
      assert.equal(json.challenge.assignedInstitute, "IIT ISM Dhanbad");
    }
  );

  await executeTest(
    "3.3 Step 3 (University Proposal): IIT ISM Dhanbad PI submits translational DPR proposal",
    3,
    async () => {
      assert.ok(workflowChallengeId, "Workflow challenge must exist");

      const proposalPayload = {
        challengeId: workflowChallengeId,
        universityName: "IIT (ISM) Dhanbad",
        title: "Solar-Powered Dual-Stage Nanofiltration Skid for Acidic Mine Drainage Remediation",
        abstract: "Translational engineering design of a 5,000 LPH mobile water purification reactor utilizing nanofiltration membranes and solar photovoltaic power to neutralize acidic mine drainage down to WHO potable drinking water standards (pH 6.8 - 7.5).",
        methodology: "Stage 1: Pre-treatment aeration and coagulation using locally sourced calcined laterite to precipitate dissolved iron. Stage 2: Dual-stage low-fouling spiral-wound nanofiltration membrane skid driven by a 3.2 kW solar PV array with 48V LiFePO4 battery buffer.",
        budget: 350000,
        timelineMonths: 6,
        stage: "Prototype Ready",
      };

      const req = makeRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        body: proposalPayload,
        token: uniToken,
        csrf: csrfToken,
      });

      const res = await proposalsPOST(req);
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.proposal.proposalRef.startsWith("PR-"));

      workflowProposalId = json.proposal.id;
      cleanupProposalIds.push(workflowProposalId);

      // Verify challenge status automatically transitioned to UNDER_REVIEW
      const updatedChallenge = await prisma.challenge.findUnique({
        where: { id: workflowChallengeId },
      });
      assert.equal(updatedChallenge!.status, "UNDER_REVIEW");
    }
  );

  await executeTest(
    "3.4 Step 4 (Industry CSR Escrow): Tata Steel commits ₹3,50,000 with 30-40-30 tranches & MoU",
    3,
    async () => {
      assert.ok(workflowProposalId, "Workflow proposal must exist");

      const fundPayload = {
        proposalId: workflowProposalId,
        corporateName: "Tata Steel CSR Foundation",
        amount: 350000,
        type: "CSR",
        panNumber: "AAACT1234F",
        csrRegistrationNo: "CSR00001234",
        notes: "Committed under Schedule VII Section 135 for clean drinking water in Dhanbad mining perimeter.",
        mouSigned: true,
      };

      const req = makeRequest("http://localhost:3000/api/funds", {
        method: "POST",
        body: fundPayload,
        token: industryToken,
        csrf: csrfToken,
      });

      const res = await fundsPOST(req);
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.commitment.escrowRef.startsWith("JH-ESCROW-2026-CSR-"));
      workflowEscrowRef = json.commitment.escrowRef;
      cleanupFundIds.push(json.commitment.id);

      // Verify proposal status transitioned to FUNDED
      const dbProp = await prisma.proposal.findUnique({
        where: { id: workflowProposalId },
      });
      assert.equal(dbProp!.status, "FUNDED");

      // Verify challenge status transitioned to IN_PROGRESS
      const dbChal = await prisma.challenge.findUnique({
        where: { id: workflowChallengeId },
      });
      assert.equal(dbChal!.status, "IN_PROGRESS");

      // Verify 30-40-30 tranches structured in DB
      assert.ok(json.commitment.tranches, "Tranches must be calculated");
      const tranches = typeof json.commitment.tranches === "string"
        ? JSON.parse(json.commitment.tranches)
        : json.commitment.tranches;
      assert.equal(tranches.length, 3);
      assert.equal(tranches[0].percentage, 30);
      assert.equal(tranches[0].amount, 105000); // 30% of 350000
      assert.equal(tranches[1].percentage, 40);
      assert.equal(tranches[1].amount, 140000); // 40% of 350000
      assert.equal(tranches[2].percentage, 30);
      assert.equal(tranches[2].amount, 105000); // 30% of 350000
    }
  );

  await executeTest(
    "3.5 Step 5 (Public Telemetry & Tracking): GET /api/track/[id] verifies full 5-stage lifecycle history",
    3,
    async () => {
      assert.ok(workflowTrackingId, "Workflow tracking ID must exist");

      const req = makeRequest(`http://localhost:3000/api/track/${workflowTrackingId}`);
      const res = await trackGET(req, {
        params: Promise.resolve({ id: workflowTrackingId }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.challenge.publicTrackingId, workflowTrackingId);
      assert.equal(json.challenge.status, "IN_PROGRESS");
      assert.ok(json.issue.timeline.length >= 4, "Timeline must contain all lifecycle milestones");
      assert.equal(json.issue.timeline[0].title, "Submitted by Citizen");
      assert.equal(json.issue.timeline[1].title, "AI Clustered & Triaged");
      assert.match(json.issue.timeline[2].title, /Assigned to IIT ISM Dhanbad/);
      assert.equal(json.issue.timeline[3].title, "Industry Funded via Escrow");
      assert.equal(json.issue.timeline[3].status, "completed");
    }
  );

  // ---------------------------------------------------------------------------
  // TIER 4: REAL-WORLD JHARKHAND SOCIO-GEOGRAPHIC SCENARIOS
  // ---------------------------------------------------------------------------
  console.log("\n--- TIER 4: Real-World Jharkhand Socio-Geographic Scenarios ---");

  await executeTest(
    "4.1 Scenario A: Dhanbad Acidic Mine Drainage (Coal Washery Runoff in Jharia)",
    4,
    async () => {
      // 1. Citizen Intake
      const chalPayload = {
        title: "Dhanbad Coal Mine Runoff Infiltration in Jharia Aquifer",
        description: "Severe toxic runoff from opencast mines infiltrating drinking water wells. Dissolved iron 6.2 mg/L, pH 4.8, Turbidity 48 NTU. 2,000 colliery families affected.",
        domain: "Water Management",
        district: "Dhanbad",
        location: "Jharia Coal Belt, Sector 3",
        urgency: "CRITICAL",
        evidence: JSON.stringify({ telemetry: { pH: 4.8, turbidity: 48, ironMgL: 6.2 } }),
      };

      const cReq = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: chalPayload,
        token: citizenToken,
        csrf: csrfToken,
      });
      const cRes = await challengesPOST(cReq);
      assert.equal(cRes.status, 201);
      const cJson = await cRes.json();
      cleanupChallengeIds.push(cJson.challenge.id);

      // 2. Proposal by IIT ISM Dhanbad
      const pPayload = {
        challengeId: cJson.challenge.id,
        universityName: "IIT (ISM) Dhanbad",
        title: "Decentralized Modular Nanofiltration Skid for Coal Belt Groundwater Purification",
        abstract: "Rapid deployment of containerized nanofiltration water treatment plant with solar power backing to remove heavy metals and acidity for Jharia communities.",
        methodology: "Two-stage flocculation and nanofiltration with automated backwash and real-time IoT pH sensors.",
        budget: 500000,
        timelineMonths: 4,
      };

      const pReq = makeRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        body: pPayload,
        token: uniToken,
        csrf: csrfToken,
      });
      const pRes = await proposalsPOST(pReq);
      assert.equal(pRes.status, 201);
      const pJson = await pRes.json();
      cleanupProposalIds.push(pJson.proposal.id);

      // 3. Funding by Coal India / Tata Steel
      const fPayload = {
        proposalId: pJson.proposal.id,
        corporateName: "Coal India CSR Trust",
        amount: 500000,
        type: "CSR",
        panNumber: "AAACC1111G",
        csrRegistrationNo: "CSR00009999",
        mouSigned: true,
      };

      const fReq = makeRequest("http://localhost:3000/api/funds", {
        method: "POST",
        body: fPayload,
        token: industryToken,
        csrf: csrfToken,
      });
      const fRes = await fundsPOST(fReq);
      assert.equal(fRes.status, 201);
      const fJson = await fRes.json();
      cleanupFundIds.push(fJson.commitment.id);

      // 4. Verify Telemetry Tracking
      const tReq = makeRequest(`http://localhost:3000/api/track/${cJson.trackingId}`);
      const tRes = await trackGET(tReq, { params: Promise.resolve({ id: cJson.trackingId }) });
      assert.equal(tRes.status, 200);
      const tJson = await tRes.json();
      assert.equal(tJson.challenge.status, "IN_PROGRESS");
      assert.equal(tJson.challenge.proposals.length, 1);
    }
  );

  await executeTest(
    "4.2 Scenario B: Gumla Solar Drip Irrigation (Rainfed Tribal Agriculture)",
    4,
    async () => {
      // 1. Citizen Intake in Gumla
      const chalPayload = {
        title: "Severe Soil Nitrogen Deficit and Irrigation Shortage in Gumla",
        description: "Rainfed paddy crops withering across 50 hectares in Raidih block. Soil tests confirm nitrogen < 140 kg/ha with severe drought stress.",
        domain: "Agriculture",
        district: "Gumla",
        location: "Raidih Tribal Block, Village Majhatoli",
        urgency: "HIGH",
        evidence: JSON.stringify({ telemetry: { soilNitrogenKgPerHa: 140, organicCarbon: 0.28 } }),
      };

      const cReq = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: chalPayload,
        token: citizenToken,
        csrf: csrfToken,
      });
      const cRes = await challengesPOST(cReq);
      assert.equal(cRes.status, 201);
      const cJson = await cRes.json();
      cleanupChallengeIds.push(cJson.challenge.id);

      // 2. Proposal by Birsa Agricultural University (BAU)
      const pPayload = {
        challengeId: cJson.challenge.id,
        universityName: "Birsa Agricultural University (BAU)",
        title: "Solar-Powered Smart Drip Micro-Irrigation & Bio-Fertilizer Regimen for Rainfed Tribal Plots",
        abstract: "Installation of low-cost gravity-assisted solar drip irrigation systems with soil telemetry sensors to optimize water and nitrogen fertilizer delivery.",
        methodology: "IoT soil moisture probes communicating via LoRaWAN to adjust solar water pump duty cycles, combined with Azotobacter bio-fertilizer inoculation.",
        budget: 280000,
        timelineMonths: 6,
      };

      const pReq = makeRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        body: pPayload,
        token: uniToken,
        csrf: csrfToken,
      });
      const pRes = await proposalsPOST(pReq);
      assert.equal(pRes.status, 201);
      const pJson = await pRes.json();
      cleanupProposalIds.push(pJson.proposal.id);

      // 3. Funding by Corporate CSR
      const fPayload = {
        proposalId: pJson.proposal.id,
        corporateName: "NABARD Rural Innovation Fund",
        amount: 280000,
        type: "CSR",
        panNumber: "AAACN2222H",
        csrRegistrationNo: "CSR00008888",
        mouSigned: true,
      };

      const fReq = makeRequest("http://localhost:3000/api/funds", {
        method: "POST",
        body: fPayload,
        token: industryToken,
        csrf: csrfToken,
      });
      const fRes = await fundsPOST(fReq);
      assert.equal(fRes.status, 201);
      const fJson = await fRes.json();
      cleanupFundIds.push(fJson.commitment.id);

      // 4. Verify Telemetry Tracking
      const tReq = makeRequest(`http://localhost:3000/api/track/${cJson.trackingId}`);
      const tRes = await trackGET(tReq, { params: Promise.resolve({ id: cJson.trackingId }) });
      assert.equal(tRes.status, 200);
      const tJson = await tRes.json();
      assert.equal(tJson.challenge.status, "IN_PROGRESS");
    }
  );

  await executeTest(
    "4.3 Scenario C: Simdega Rural Maternal Healthcare (Remote Forest PHC Telemedicine)",
    4,
    async () => {
      // 1. Citizen / ASHA worker intake in Simdega
      const chalPayload = {
        title: "High Maternal Morbidity & Lack of Diagnostic Imaging in Forested Kurdeg",
        description: "Primary Health Center in Kurdeg lacks ultrasound equipment and specialist obstetric care. Expectant tribal mothers must travel 80 km over unpaved forest roads.",
        domain: "Healthcare",
        district: "Simdega",
        location: "Kurdeg Block Forest Perimeter",
        urgency: "CRITICAL",
        evidence: JSON.stringify({ telemetry: { affectedMothers: 85, travelDistanceKm: 80 } }),
      };

      const cReq = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: chalPayload,
        token: citizenToken,
        csrf: csrfToken,
      });
      const cRes = await challengesPOST(cReq);
      assert.equal(cRes.status, 201);
      const cJson = await cRes.json();
      cleanupChallengeIds.push(cJson.challenge.id);

      // 2. Proposal by RIMS Ranchi & BIT Mesra Bioengineering
      const pPayload = {
        challengeId: cJson.challenge.id,
        universityName: "RIMS Ranchi & BIT Mesra Bioengineering",
        title: "Handheld Solar Point-of-Care Ultrasound with AI Tele-Diagnostics for Remote PHCs",
        abstract: "Deployment of ultra-portable battery-operated ultrasound probes connecting via satellite/cellular telemetry to RIMS Ranchi Department of Obstetrics for tele-triage.",
        methodology: "Portable probe ultrasound training for ASHA facilitators with edge AI fetal biometry measurement and store-and-forward teleconsultation server.",
        budget: 420000,
        timelineMonths: 5,
      };

      const pReq = makeRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        body: pPayload,
        token: uniToken,
        csrf: csrfToken,
      });
      const pRes = await proposalsPOST(pReq);
      assert.equal(pRes.status, 201);
      const pJson = await pRes.json();
      cleanupProposalIds.push(pJson.proposal.id);

      // 3. Funding by Jindal Steel CSR
      const fPayload = {
        proposalId: pJson.proposal.id,
        corporateName: "Jindal Steel & Power CSR Division",
        amount: 420000,
        type: "CSR",
        panNumber: "AAACJ3333K",
        csrRegistrationNo: "CSR00007777",
        mouSigned: true,
      };

      const fReq = makeRequest("http://localhost:3000/api/funds", {
        method: "POST",
        body: fPayload,
        token: industryToken,
        csrf: csrfToken,
      });
      const fRes = await fundsPOST(fReq);
      assert.equal(fRes.status, 201);
      const fJson = await fRes.json();
      cleanupFundIds.push(fJson.commitment.id);

      // 4. Verify Telemetry Tracking
      const tReq = makeRequest(`http://localhost:3000/api/track/${cJson.trackingId}`);
      const tRes = await trackGET(tReq, { params: Promise.resolve({ id: cJson.trackingId }) });
      assert.equal(tRes.status, 200);
      const tJson = await tRes.json();
      assert.equal(tJson.challenge.status, "IN_PROGRESS");
    }
  );

  // ---------------------------------------------------------------------------
  // CLEANUP TEST FIXTURES (Physical delete to prevent unique tracking ID exhaustion)
  // ---------------------------------------------------------------------------
  console.log("\n--- Cleaning up temporary workflow test fixtures ---");
  const { PrismaClient } = await import("@prisma/client");
  const rawPrisma = new PrismaClient();
  try {
    if (cleanupFundIds.length > 0) {
      await rawPrisma.fundingCommitment.deleteMany({ where: { id: { in: cleanupFundIds } } });
    }
    if (cleanupProposalIds.length > 0) {
      await rawPrisma.proposal.deleteMany({ where: { id: { in: cleanupProposalIds } } });
    }
    if (cleanupChallengeIds.length > 0) {
      await rawPrisma.auditLog.deleteMany({ where: { challengeId: { in: cleanupChallengeIds } } });
      await rawPrisma.challenge.deleteMany({ where: { id: { in: cleanupChallengeIds } } });
    }
    if (cleanupUserIds.length > 0) {
      await rawPrisma.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
    }
    console.log(`  ✓ Physically purged test fixtures (${cleanupChallengeIds.length} challenges, ${cleanupProposalIds.length} proposals, ${cleanupFundIds.length} commitments, ${cleanupUserIds.length} users).`);
  } finally {
    await rawPrisma.$disconnect();
  }

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const pending = results.filter((r) => r.status === "PENDING").length;

  console.log("\n===============================================================================");
  console.log(`WORKFLOWS SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED | ${pending} PENDING | ${results.length} TOTAL`);
  console.log("===============================================================================\n");

  return {
    suiteName: "e2e-workflows",
    passed,
    failed,
    pending,
    total: results.length,
    results,
  };
}

// Standalone execution wrapper
if (typeof process !== "undefined" && process.argv[1]?.includes("e2e-workflows")) {
  runWorkflowsSuite().then((res) => {
    if (res.failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  });
}
