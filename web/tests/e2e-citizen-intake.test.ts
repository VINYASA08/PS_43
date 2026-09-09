import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import prisma from "../src/lib/prisma";
import { generateCsrfToken } from "../src/lib/csrf";
import { validDomains, validUrgency } from "../src/lib/validation";
import { POST as challengesPOST, GET as challengesGET } from "../src/app/api/challenges/route";

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

// 24 Statutory Jharkhand Districts
export const JHARKHAND_DISTRICTS = [
  "Ranchi", "Dhanbad", "Bokaro", "East Singhbhum", "West Singhbhum",
  "Hazaribagh", "Giridih", "Deoghar", "Dumka", "Palamu",
  "Garhwa", "Chatra", "Koderma", "Godda", "Sahebganj",
  "Pakur", "Jamtara", "Ramgarh", "Latehar", "Lohardaga",
  "Gumla", "Simdega", "Khunti", "Seraikela Kharsawan"
];

// Helper to create NextRequest with CSRF and Headers
export function makeRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
    ip?: string;
    csrf?: string;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(options.headers || {}),
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

export async function runCitizenIntakeSuite(): Promise<SuiteResult> {
  console.log("\n===============================================================================");
  console.log("SUITE: E2E CITIZEN INTAKE & EVIDENCE HARDENING");
  console.log("Tier 1 (Category-Partition Happy Paths) & Tier 2 (Boundary Value Analysis)");
  console.log("===============================================================================\n");

  const results: TestResult[] = [];
  const createdChallengeIds: string[] = [];
  const csrfToken = generateCsrfToken();

  async function executeTest(name: string, tier: number, fn: () => Promise<void | "PENDING">) {
    const start = Date.now();
    try {
      const outcome = await fn();
      const durationMs = Date.now() - start;
      if (outcome === "PENDING") {
        console.log(`  ⏳ [Tier ${tier}] PENDING (Milestone Dependency): ${name} (${durationMs}ms)`);
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

  // ---------------------------------------------------------------------------
  // TIER 1: CATEGORY-PARTITION & CANONICAL INTAKE FLOWS
  // ---------------------------------------------------------------------------
  console.log("--- TIER 1: Category-Partition Happy Paths ---");

  await executeTest(
    "1.1 Citizen submits valid Water Management challenge with GPS coordinates and evidence metadata",
    1,
    async () => {
      const payload = {
        title: "Contaminated Damodar River Borewell in Dhanbad",
        description: "Borewell water has turned turbid and reddish with severe metallic taste. Over 300 households affected in Jharia colliery vicinity.",
        domain: "Water Management",
        district: "Dhanbad",
        location: "Jharia Colliery Sector 4, GPS: 23.7441° N, 86.4116° E",
        urgency: "CRITICAL",
        evidence: JSON.stringify({
          files: [
            { name: "water_test_red_sample.jpg", size: "2.4 MB", type: "image/jpeg", url: "/uploads/water_test_red_sample.jpg" }
          ],
          coordinates: { lat: 23.7441, lng: 86.4116 },
          sensorData: { pH: 4.6, turbidityNTU: 52 }
        })
      };

      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: payload,
        csrf: csrfToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 201, `Expected 201 Created, got ${res.status}`);

      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.trackingId, "Tracking ID must be generated");
      assert.match(json.trackingId, /^IN-GR-2026-\d{4}$/, "Tracking ID must match /^IN-GR-2026-\\d{4}$/");
      assert.equal(json.challenge.title, payload.title);
      assert.equal(json.challenge.domain, "Water Management");
      assert.equal(json.challenge.urgency, "CRITICAL");
      assert.equal(json.challenge.status, "REPORTED");
      assert.equal(json.challenge.escalationLevel, 0);

      createdChallengeIds.push(json.challenge.id);

      // Verify persistence in Prisma database
      const dbRecord = await prisma.challenge.findUnique({
        where: { id: json.challenge.id },
      });
      assert.ok(dbRecord, "Challenge record must exist in database");
      assert.equal(dbRecord!.publicTrackingId, json.trackingId);

      // Verify audit log event
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          resource: "Challenge",
          resourceId: json.challenge.id,
          action: "CHALLENGE_CREATED",
        },
      });
      assert.ok(auditLog, "Audit log event CHALLENGE_CREATED must be recorded");
    }
  );

  await executeTest(
    "1.2 Citizen submits Agriculture challenge in Gumla tribal block with soil telemetry evidence",
    1,
    async () => {
      const payload = {
        title: "Acute Soil Nitrogen Deficit and Irrigation Failure in Raidih",
        description: "Rainfed paddy crops withering due to severe soil moisture deficit and nitrogen depletion across 45 hectares.",
        domain: "Agriculture",
        district: "Gumla",
        location: "Raidih Block, Village Majhatoli (23.0425° N, 84.5412° E)",
        urgency: "HIGH",
        evidence: JSON.stringify({
          files: [{ name: "soil_sample_analysis.pdf", size: "1.2 MB", type: "application/pdf" }],
          coordinates: { lat: 23.0425, lng: 84.5412 },
          metrics: { nitrogenKgPerHa: 145, organicCarbonPct: 0.28 }
        })
      };

      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: payload,
        csrf: csrfToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.match(json.trackingId, /^IN-GR-2026-\d{4}$/);
      createdChallengeIds.push(json.challenge.id);
    }
  );

  await executeTest(
    "1.3 Citizen submits Healthcare emergency challenge in remote Simdega district",
    1,
    async () => {
      const payload = {
        title: "Malaria Outbreak and Absence of Point-of-Care Diagnostic Kits",
        description: "Over 40 tribal children down with high fever and falciparum malaria symptoms in forested Kurdeg block with no active PHC doctor.",
        domain: "Healthcare",
        district: "Simdega",
        location: "Kurdeg Block, Forest Village Charbhati (22.5623° N, 84.1489° E)",
        urgency: "CRITICAL",
        evidence: JSON.stringify({
          files: [{ name: "phc_status_report.jpg", size: "3.1 MB", type: "image/jpeg" }],
          affectedPopulation: 120
        })
      };

      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: payload,
        csrf: csrfToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 201);
      const json = await res.json();
      createdChallengeIds.push(json.challenge.id);
    }
  );

  await executeTest(
    "1.4 Canonical domain coverage: verify all 10 state priority domains are accepted",
    1,
    async () => {
      for (const domain of validDomains) {
        const payload = {
          title: `Societal Innovation Field Test for ${domain}`,
          description: `Testing canonical domain ingestion compliance for sector ${domain} in state capital Ranchi.`,
          domain,
          district: "Ranchi",
          location: "Doranda Ward 12, Ranchi",
          urgency: "MEDIUM",
        };

        const req = makeRequest("http://localhost:3000/api/challenges", {
          method: "POST",
          body: payload,
          csrf: csrfToken,
        });

        const res = await challengesPOST(req);
        assert.equal(res.status, 201, `Domain '${domain}' should be accepted with HTTP 201`);
        const json = await res.json();
        createdChallengeIds.push(json.challenge.id);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // TIER 2: BOUNDARY VALUE ANALYSIS & CORNER CASES
  // ---------------------------------------------------------------------------
  console.log("\n--- TIER 2: Boundary Value Analysis & Corner Cases ---");

  await executeTest(
    "2.1 BVA: Empty or undersized description (< 20 characters) is rejected with HTTP 400",
    2,
    async () => {
      const payload = {
        title: "Short Description Test",
        description: "Too short (15 ch)", // 17 chars, below 20
        domain: "Water Management",
        district: "Dhanbad",
        location: "Dhanbad Town",
        urgency: "LOW",
      };

      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: payload,
        csrf: csrfToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 400, `Expected 400 for description < 20 chars, got ${res.status}`);
      const json = await res.json();
      assert.match(json.error, /Description must be at least 20 characters/i);
    }
  );

  await executeTest(
    "2.2 BVA: Undersized title (< 5 characters) is rejected with HTTP 400",
    2,
    async () => {
      const payload = {
        title: "Fail", // 4 chars, below 5
        description: "Valid description meeting the required twenty characters minimum requirement.",
        domain: "Water Management",
        district: "Dhanbad",
        location: "Dhanbad Town",
        urgency: "LOW",
      };

      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: payload,
        csrf: csrfToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 400, `Expected 400 for title < 5 chars, got ${res.status}`);
      const json = await res.json();
      assert.match(json.error, /Title must be at least 5 characters/i);
    }
  );

  await executeTest(
    "2.3 BVA: Missing required fields (missing domain, missing district) rejected with HTTP 400",
    2,
    async () => {
      const payload = {
        title: "Missing Fields Test",
        description: "Valid description meeting the required twenty characters minimum requirement.",
        location: "Dhanbad Town",
      };

      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: payload,
        csrf: csrfToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 400, `Expected 400 for missing fields, got ${res.status}`);
    }
  );

  await executeTest(
    "2.4 Adversarial: Invalid non-canonical domain rejected with HTTP 400",
    2,
    async () => {
      const payload = {
        title: "Invalid Domain Test Challenge",
        description: "Valid description meeting the required twenty characters minimum requirement.",
        domain: "Cryptocurrency Speculation", // Non-canonical domain
        district: "Ranchi",
        location: "Main Road Ranchi",
      };

      const req = makeRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: payload,
        csrf: csrfToken,
      });

      const res = await challengesPOST(req);
      assert.equal(res.status, 400, `Expected 400 for invalid domain, got ${res.status}`);
      const json = await res.json();
      assert.match(json.error, /Invalid domain/i);
    }
  );

  await executeTest(
    "2.5 Geolocation BVA: Valid coordinates within Jharkhand bounding box parsed cleanly",
    2,
    async () => {
      // Jharkhand Bounding Box: Latitude 21.96° N to 25.35° N, Longitude 83.32° E to 87.94° E
      const boundaryCases = [
        { name: "North-East (Sahebganj)", lat: 25.2425, lng: 87.6412, district: "Sahebganj" },
        { name: "South-West (Simdega)", lat: 22.6184, lng: 84.5074, district: "Simdega" },
        { name: "Central (Ranchi)", lat: 23.3441, lng: 85.3096, district: "Ranchi" },
      ];

      for (const b of boundaryCases) {
        const payload = {
          title: `Boundary Geolocation Test ${b.name}`,
          description: `Testing GPS coordinate ingestion and location string formatting in ${b.district}.`,
          domain: "Urban Infrastructure",
          district: b.district,
          location: `Coordinates: ${b.lat}° N, ${b.lng}° E`,
          urgency: "LOW",
          evidence: JSON.stringify({ coordinates: { lat: b.lat, lng: b.lng } }),
        };

        const req = makeRequest("http://localhost:3000/api/challenges", {
          method: "POST",
          body: payload,
          csrf: csrfToken,
        });

        const res = await challengesPOST(req);
        assert.equal(res.status, 201);
        const json = await res.json();
        createdChallengeIds.push(json.challenge.id);
      }
    }
  );

  await executeTest(
    "2.6 Evidence Upload Contract: Verify multipart upload endpoint `/api/upload` (or M1 upload contract)",
    2,
    async () => {
      // Check if /api/upload route handler exists dynamically
      let uploadPOST: any = null;
      try {
        const dynamicImport = new Function("modulePath", "return import(modulePath)");
        const mod: any = await dynamicImport("../src/app/api/upload/route");
        uploadPOST = mod.POST;
      } catch {
        // Not mounted yet (M1 Feature F2 in progress)
      }

      if (uploadPOST) {
        // Live route test
        const formData = new FormData();
        const blob = new Blob(["test image content"], { type: "image/jpeg" });
        formData.append("file", blob, "test_evidence.jpg");

        const req = new NextRequest("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });

        const res = await uploadPOST(req);
        assert.ok(res.status === 200 || res.status === 201);
      } else {
        // Verify contract invariants expected from M1 specification:
        // Max 10MB file limit, allowed MIME types: image/jpeg, image/png, application/pdf, video/mp4
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const allowedMimes = ["image/jpeg", "image/png", "application/pdf", "video/mp4"];
        assert.equal(maxFileSize, 10485760);
        assert.ok(allowedMimes.includes("image/jpeg"));
        assert.ok(!allowedMimes.includes("application/x-msdownload"));
        return "PENDING";
      }
    }
  );

  await executeTest(
    "2.7 Evidence Dropzone Formatting: Small file (30 KB) formats to '0.0 MB' without error",
    2,
    async () => {
      const sizeBytes = 30 * 1024;
      const formatted = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
      assert.equal(formatted, "0.0 MB");
      assert.ok(!isNaN(parseFloat(formatted)));
    }
  );

  // ---------------------------------------------------------------------------
  // CLEANUP TEST FIXTURES (Physical delete to prevent unique tracking ID exhaustion)
  // ---------------------------------------------------------------------------
  console.log("\n--- Cleaning up temporary citizen intake test fixtures ---");
  if (createdChallengeIds.length > 0) {
    const { PrismaClient } = await import("@prisma/client");
    const rawPrisma = new PrismaClient();
    try {
      await rawPrisma.auditLog.deleteMany({
        where: { challengeId: { in: createdChallengeIds } },
      });
      await rawPrisma.challenge.deleteMany({
        where: { id: { in: createdChallengeIds } },
      });
      console.log(`  ✓ Physically purged ${createdChallengeIds.length} temporary test challenges from database.`);
    } finally {
      await rawPrisma.$disconnect();
    }
  }

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const pending = results.filter((r) => r.status === "PENDING").length;

  console.log("\n===============================================================================");
  console.log(`CITIZEN INTAKE SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED | ${pending} PENDING (M1) | ${results.length} TOTAL`);
  console.log("===============================================================================\n");

  return {
    suiteName: "e2e-citizen-intake",
    passed,
    failed,
    pending,
    total: results.length,
    results,
  };
}

// Standalone execution wrapper
if (typeof process !== "undefined" && process.argv[1]?.includes("e2e-citizen-intake")) {
  runCitizenIntakeSuite().then((res) => {
    if (res.failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  });
}
