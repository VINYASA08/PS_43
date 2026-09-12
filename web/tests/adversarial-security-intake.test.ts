import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import prisma from "../src/lib/prisma";
import {
  hashPassword,
  signSessionToken,
} from "../src/lib/auth";
import { generateCsrfToken } from "../src/lib/csrf";
import { checkRateLimit } from "../src/lib/rateLimiter";
import { UserRole, UserStatus } from "../src/lib/types";

// Route Handlers
import { POST as uploadPOST } from "../src/app/api/upload/route";
import { GET as userProfileGET, PUT as userProfilePUT } from "../src/app/api/users/profile/route";
import { POST as challengeApplyPOST } from "../src/app/api/challenges/[id]/apply/route";
import { GET as pendingUsersGET } from "../src/app/api/admin/pending-users/route";
import { POST as approveUserPOST } from "../src/app/api/admin/approve-user/route";
import { GET as auditLogsGET } from "../src/app/api/audit-logs/route";
import { POST as proposalsPOST } from "../src/app/api/proposals/route";
import { POST as fundsPOST } from "../src/app/api/funds/route";
import { POST as loginPOST } from "../src/app/api/auth/login/route";
import { POST as challengesPOST } from "../src/app/api/challenges/route";

export interface AdversarialTestResult {
  category: string;
  name: string;
  expectedStatus: number | string;
  actualStatus: number | string;
  status: "PASS" | "FAIL";
  details?: string;
}

export const results: AdversarialTestResult[] = [];

function makeJsonRequest(
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

async function runAdversarialTest(
  category: string,
  name: string,
  expectedStatus: number | string,
  fn: () => Promise<{ actualStatus: number | string; details?: string }>
) {
  try {
    const { actualStatus, details } = await fn();
    const passed = String(actualStatus) === String(expectedStatus);
    results.push({
      category,
      name,
      expectedStatus,
      actualStatus,
      status: passed ? "PASS" : "FAIL",
      details,
    });
    if (passed) {
      console.log(`  ✓ PASS: [${category}] ${name} -> Expected ${expectedStatus}, got ${actualStatus}`);
    } else {
      console.error(`  ✗ FAIL: [${category}] ${name} -> Expected ${expectedStatus}, got ${actualStatus}. Details: ${details}`);
    }
  } catch (err: any) {
    results.push({
      category,
      name,
      expectedStatus,
      actualStatus: "ERROR",
      status: "FAIL",
      details: err.message,
    });
    console.error(`  ✗ EXCEPTION: [${category}] ${name} -> ${err.message}`);
  }
}

async function run() {
  console.log("===============================================================================");
  console.log("ADVERSARIAL STRESS-TESTING HARNESS (CHALLENGER 1)");
  console.log("Edge Cases, File Uploads, RBAC Bypasses, CSRF, Lockout, Rate Limiting");
  console.log("===============================================================================\n");

  const validCsrf = generateCsrfToken();
  const createdChallengeIds: string[] = [];
  const createdUserIds: string[] = [];

  // Setup personas in DB
  const citizenUser = await prisma.user.create({
    data: {
      name: "Adv Citizen",
      phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: UserRole.CITIZEN,
      status: UserStatus.ACTIVE,
      passwordHash: "N/A",
    },
  });
  createdUserIds.push(citizenUser.id);

  const universityUser = await prisma.user.create({
    data: {
      name: "Adv University PI",
      email: `adv.uni.${Date.now()}@bitmesra.ac.in`,
      role: UserRole.UNIVERSITY,
      status: UserStatus.ACTIVE,
      passwordHash: "N/A",
    },
  });
  createdUserIds.push(universityUser.id);

  const industryUser = await prisma.user.create({
    data: {
      name: "Adv Industry Rep",
      email: `adv.ind.${Date.now()}@corporate.com`,
      role: UserRole.INDUSTRY,
      status: UserStatus.ACTIVE,
      passwordHash: "N/A",
    },
  });
  createdUserIds.push(industryUser.id);

  const pendingIndustryUser = await prisma.user.create({
    data: {
      name: "Adv Pending Industry",
      email: `adv.pending.${Date.now()}@corporate.com`,
      role: UserRole.INDUSTRY,
      status: UserStatus.PENDING,
      passwordHash: "N/A",
    },
  });
  createdUserIds.push(pendingIndustryUser.id);

  const govUser = await prisma.user.create({
    data: {
      name: "Adv Gov Officer",
      email: `adv.gov.${Date.now()}@jharkhand.gov.in`,
      role: UserRole.GOV,
      status: UserStatus.ACTIVE,
      passwordHash: "N/A",
    },
  });
  createdUserIds.push(govUser.id);

  // Mint Tokens
  const citizenToken = await signSessionToken({
    userId: citizenUser.id,
    name: citizenUser.name,
    role: UserRole.CITIZEN,
    status: UserStatus.ACTIVE,
  });

  const universityToken = await signSessionToken({
    userId: universityUser.id,
    name: universityUser.name,
    role: UserRole.UNIVERSITY,
    status: UserStatus.ACTIVE,
  });

  const industryToken = await signSessionToken({
    userId: industryUser.id,
    name: industryUser.name,
    role: UserRole.INDUSTRY,
    status: UserStatus.ACTIVE,
  });

  const pendingIndustryToken = await signSessionToken({
    userId: pendingIndustryUser.id,
    name: pendingIndustryUser.name,
    role: UserRole.INDUSTRY,
    status: UserStatus.PENDING,
  });

  const govToken = await signSessionToken({
    userId: govUser.id,
    name: govUser.name,
    role: UserRole.GOV,
    status: UserStatus.ACTIVE,
  });

  // Create a seeded challenge for apply tests
  const seedChallenge = await prisma.challenge.create({
    data: {
      publicTrackingId: `IN-GR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "Seed Challenge for Adversarial Testing",
      description: "A valid challenge description for application testing purposes.",
      domain: "Water Management",
      district: "Ranchi",
      location: "Kanke Road",
      urgency: "HIGH",
      status: "OPEN_FOR_PROPOSALS",
      reportedById: citizenUser.id,
    },
  });
  createdChallengeIds.push(seedChallenge.id);

  // ---------------------------------------------------------------------------
  // SECTION 1: CHALLENGE SUBMISSION EDGE CASES
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION 1: Challenge Submission Edge Cases ---");

  await runAdversarialTest(
    "Submission Validation",
    "Empty title rejected with 400",
    400,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "",
          description: "A sufficiently long description explaining the community issue in detail.",
          domain: "Water Management",
          district: "Ranchi",
          location: "Doranda",
        },
        csrf: validCsrf,
      });
      const res = await challengesPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Submission Validation",
    "Empty description rejected with 400",
    400,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "Contaminated Well Water",
          description: "",
          domain: "Water Management",
          district: "Ranchi",
          location: "Doranda",
        },
        csrf: validCsrf,
      });
      const res = await challengesPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Submission Validation",
    "Undersized description (19 chars) rejected with 400",
    400,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "Contaminated Well Water",
          description: "1234567890123456789", // 19 chars
          domain: "Water Management",
          district: "Ranchi",
          location: "Doranda",
        },
        csrf: validCsrf,
      });
      const res = await challengesPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Submission Validation",
    "Valid boundary description (exactly 20 chars) accepted with 201",
    201,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "Contaminated Well Water",
          description: "12345678901234567890", // exactly 20 chars
          domain: "Water Management",
          district: "Ranchi",
          location: "Doranda",
        },
        csrf: validCsrf,
      });
      const res = await challengesPOST(req);
      const json = await res.json().catch(() => ({}));
      if (json.challenge?.id) createdChallengeIds.push(json.challenge.id);
      return { actualStatus: res.status, details: json.trackingId };
    }
  );

  await runAdversarialTest(
    "Submission Validation",
    "Missing district rejected with 400",
    400,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "Contaminated Well Water",
          description: "A sufficiently long description explaining the community issue in detail.",
          domain: "Water Management",
          location: "Doranda",
        },
        csrf: validCsrf,
      });
      const res = await challengesPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Submission Validation",
    "Undersized district (<2 chars) rejected with 400",
    400,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "Contaminated Well Water",
          description: "A sufficiently long description explaining the community issue in detail.",
          domain: "Water Management",
          district: "R", // 1 char
          location: "Doranda",
        },
        csrf: validCsrf,
      });
      const res = await challengesPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Submission Validation",
    "Missing location rejected with 400",
    400,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "Contaminated Well Water",
          description: "A sufficiently long description explaining the community issue in detail.",
          domain: "Water Management",
          district: "Ranchi",
        },
        csrf: validCsrf,
      });
      const res = await challengesPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Submission Validation",
    "Boundary coordinates (North-East Sahebganj 25.35°N, 87.94°E) accepted with 201",
    201,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "River Erosion at Sahebganj Boundary",
          description: "Severe bank erosion threatening rural settlement along the Ganges bend.",
          domain: "Environment",
          district: "Sahebganj",
          location: "Ganga Bank GPS 25.35, 87.94",
          evidence: JSON.stringify({ coordinates: { lat: 25.35, lng: 87.94 } }),
        },
        csrf: validCsrf,
      });
      const res = await challengesPOST(req);
      const json = await res.json().catch(() => ({}));
      if (json.challenge?.id) createdChallengeIds.push(json.challenge.id);
      return { actualStatus: res.status, details: json.trackingId };
    }
  );

  await runAdversarialTest(
    "Submission Validation",
    "Boundary coordinates (South-West Simdega 21.96°N, 83.32°E) accepted with 201",
    201,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/challenges", {
        method: "POST",
        body: {
          title: "Forest PHC Emergency Access Route Blocked",
          description: "Remote culvert washed out during heavy rainfall isolating tribal settlement.",
          domain: "Urban Infrastructure",
          district: "Simdega",
          location: "Kersai Border GPS 21.96, 83.32",
          evidence: JSON.stringify({ coordinates: { lat: 21.96, lng: 83.32 } }),
        },
        csrf: validCsrf,
      });
      const res = await challengesPOST(req);
      const json = await res.json().catch(() => ({}));
      if (json.challenge?.id) createdChallengeIds.push(json.challenge.id);
      return { actualStatus: res.status, details: json.trackingId };
    }
  );

  // ---------------------------------------------------------------------------
  // SECTION 1B: MALICIOUS FILE UPLOADS AGAINST /api/upload
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION 1B: Malicious File Uploads (/api/upload) ---");

  await runAdversarialTest(
    "File Upload Security",
    "Empty upload payload rejected with 400",
    400,
    async () => {
      const formData = new FormData();
      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const res = await uploadPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "File Upload Security",
    "Malicious executable (.exe) rejected with 400",
    400,
    async () => {
      const formData = new FormData();
      const fakeExe = new Blob(["MZ\x90\x00\x03\x00\x00\x00"], { type: "application/x-msdownload" });
      formData.append("files", fakeExe, "malware.exe");

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const res = await uploadPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "File Upload Security",
    "Malicious shell script (.sh) rejected with 400",
    400,
    async () => {
      const formData = new FormData();
      const scriptBlob = new Blob(["#!/bin/bash\nrm -rf /"], { type: "text/x-shellscript" });
      formData.append("files", scriptBlob, "exploit.sh");

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const res = await uploadPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "File Upload Security",
    "Malicious PHP web shell (.php) rejected with 400",
    400,
    async () => {
      const formData = new FormData();
      const phpBlob = new Blob(["<?php system($_GET['cmd']); ?>"], { type: "application/x-php" });
      formData.append("files", phpBlob, "shell.php");

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const res = await uploadPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "File Upload Security",
    "Oversized file (>10MB, e.g. 11MB) rejected with 400",
    400,
    async () => {
      const formData = new FormData();
      // Construct an in-memory 11MB buffer
      const size11MB = 11 * 1024 * 1024;
      const buffer = new Uint8Array(size11MB);
      const oversizedBlob = new Blob([buffer], { type: "image/jpeg" });
      formData.append("files", oversizedBlob, "huge_photo.jpg");

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const res = await uploadPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "File Upload Security",
    "Legitimate evidence image (JPEG, 50KB) accepted with 200",
    200,
    async () => {
      const formData = new FormData();
      const validBlob = new Blob([new Uint8Array(50 * 1024)], { type: "image/jpeg" });
      formData.append("files", validBlob, "valid_water_sample.jpg");

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const res = await uploadPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.files?.[0]?.url };
    }
  );

  // Adversarial stress test: Extension vs MIME type mismatch
  // e.g. upload malware.exe with Content-Type: image/jpeg
  await runAdversarialTest(
    "File Upload Security",
    "Adversarial extension bypass attempt (malware.exe with spoofed image/jpeg MIME) rejected with 400",
    400,
    async () => {
      const formData = new FormData();
      const spoofedBlob = new Blob(["MZ\x90\x00\x03\x00\x00\x00"], { type: "image/jpeg" });
      formData.append("files", spoofedBlob, "malware.exe");

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const res = await uploadPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error || (json.success ? "ALLOWED_UNSAFE" : "UNKNOWN") };
    }
  );

  // ---------------------------------------------------------------------------
  // SECTION 2: RBAC & UNAUTHORIZED ROLE API ACCESS
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION 2: RBAC & Unauthorized Role Access ---");

  await runAdversarialTest(
    "RBAC Authorization",
    "Citizen attempting to approve pending users returns HTTP 403",
    403,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/admin/approve-user", {
        method: "POST",
        body: { userId: pendingIndustryUser.id, action: "approve" },
        token: citizenToken,
        csrf: validCsrf,
      });
      const res = await approveUserPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "RBAC Authorization",
    "University PI attempting to access gov audit logs returns HTTP 403",
    403,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/audit-logs", {
        method: "GET",
        token: universityToken,
      });
      const res = await auditLogsGET(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "RBAC Authorization",
    "Industry user attempting to submit academic proposal returns HTTP 403",
    403,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        body: {
          challengeId: seedChallenge.id,
          title: "Corporate Solution Proposal",
          abstract: "Attempting to author academic DPR from corporate account.",
          methodology: "Testing RBAC boundary on proposal submission.",
          budget: 500000,
          universityName: "Corporate R&D Lab",
        },
        token: industryToken,
        csrf: validCsrf,
      });
      const res = await proposalsPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "RBAC Authorization",
    "University PI attempting to commit CSR funds returns HTTP 403",
    403,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/funds", {
        method: "POST",
        body: {
          proposalId: "some_proposal_id",
          amount: 500000,
          type: "CSR",
          corporateName: "Academic Entity",
        },
        token: universityToken,
        csrf: validCsrf,
      });
      const res = await fundsPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "RBAC Authorization",
    "Pending Industry user accessing profile returns HTTP 403",
    403,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/users/profile", {
        method: "GET",
        token: pendingIndustryToken,
      });
      const res = await userProfileGET(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  // ---------------------------------------------------------------------------
  // SECTION 3: UNAUTHENTICATED ACCESS TO PROTECTED ROUTES (HTTP 401)
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION 3: Unauthenticated Access (HTTP 401) ---");

  await runAdversarialTest(
    "Authentication",
    "Unauthenticated GET /api/admin/pending-users returns HTTP 401",
    401,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/admin/pending-users");
      const res = await pendingUsersGET(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Authentication",
    "Unauthenticated POST /api/admin/approve-user returns HTTP 401",
    401,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/admin/approve-user", {
        method: "POST",
        body: { userId: "some_id", action: "approve" },
        csrf: validCsrf,
      });
      const res = await approveUserPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Authentication",
    "Unauthenticated GET /api/audit-logs returns HTTP 401",
    401,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/audit-logs");
      const res = await auditLogsGET(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Authentication",
    "Unauthenticated POST /api/proposals returns HTTP 401",
    401,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        body: { challengeId: seedChallenge.id, title: "Unauthenticated Proposal" },
        csrf: validCsrf,
      });
      const res = await proposalsPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Authentication",
    "Unauthenticated POST /api/funds returns HTTP 401",
    401,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/funds", {
        method: "POST",
        body: { proposalId: "some_prop", amount: 100000 },
        csrf: validCsrf,
      });
      const res = await fundsPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Authentication",
    "Unauthenticated GET /api/users/profile returns HTTP 401",
    401,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/users/profile");
      const res = await userProfileGET(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "Authentication",
    "Unauthenticated PUT /api/users/profile returns HTTP 401",
    401,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/users/profile", {
        method: "PUT",
        body: { name: "Hacker" },
        csrf: validCsrf,
      });
      const res = await userProfilePUT(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  // ---------------------------------------------------------------------------
  // SECTION 4: CSRF PROTECTION VERIFICATION
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION 4: CSRF Protection Verification ---");

  await runAdversarialTest(
    "CSRF Protection",
    "PUT /api/users/profile without CSRF token returns HTTP 403",
    403,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/users/profile", {
        method: "PUT",
        body: { name: "Updated Name" },
        token: govToken,
        // No CSRF token
      });
      const res = await userProfilePUT(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "CSRF Protection",
    "PUT /api/users/profile with forged CSRF token returns HTTP 403",
    403,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/users/profile", {
        method: "PUT",
        body: { name: "Updated Name" },
        token: govToken,
        csrf: "forged.csrf.signature.token",
      });
      const res = await userProfilePUT(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "CSRF Protection",
    "PUT /api/users/profile with valid CSRF token returns HTTP 200",
    200,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/users/profile", {
        method: "PUT",
        body: { designation: "Nodal Principal Secretary" },
        token: govToken,
        csrf: validCsrf,
      });
      const res = await userProfilePUT(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.user?.designation };
    }
  );

  await runAdversarialTest(
    "CSRF Protection",
    "POST /api/challenges/[id]/apply without CSRF token returns HTTP 403",
    403,
    async () => {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${seedChallenge.id}/apply`, {
        method: "POST",
        body: {
          name: "Dr. Expert",
          email: "expert@example.org",
          proposalSummary: "Collaboration summary without CSRF.",
        },
        token: universityToken,
        // No CSRF token
      });
      const res = await challengeApplyPOST(req, { params: Promise.resolve({ id: seedChallenge.id }) });
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "CSRF Protection",
    "POST /api/challenges/[id]/apply with forged CSRF token returns HTTP 403",
    403,
    async () => {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${seedChallenge.id}/apply`, {
        method: "POST",
        body: {
          name: "Dr. Expert",
          email: "expert@example.org",
          proposalSummary: "Collaboration summary with forged CSRF.",
        },
        token: universityToken,
        csrf: "forged_malicious_csrf_token_12345",
      });
      const res = await challengeApplyPOST(req, { params: Promise.resolve({ id: seedChallenge.id }) });
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  await runAdversarialTest(
    "CSRF Protection",
    "POST /api/challenges/[id]/apply with valid CSRF token returns HTTP 200",
    200,
    async () => {
      const req = makeJsonRequest(`http://localhost:3000/api/challenges/${seedChallenge.id}/apply`, {
        method: "POST",
        body: {
          name: "Dr. Expert Collaborator",
          email: "expert.lead@example.org",
          phone: "+919876543210",
          role: "RESEARCHER",
          organization: "Birsa Agricultural University",
          proposalSummary: "Valid collaborative application for agricultural drainage remediation.",
        },
        token: universityToken,
        csrf: validCsrf,
      });
      const res = await challengeApplyPOST(req, { params: Promise.resolve({ id: seedChallenge.id }) });
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.message };
    }
  );

  // ---------------------------------------------------------------------------
  // SECTION 5: ACCOUNT LOCKOUT (5 FAILED LOGINS -> HTTP 423)
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION 5: Account Lockout (5 Failed Logins -> HTTP 423) ---");

  const lockoutEmail = `lockout.adv.${Date.now()}@tatasteel.com`;
  const correctPassword = "StrongPassword123!";
  const wrongPassword = "IncorrectPassword!";

  const lockoutSubject = await prisma.user.create({
    data: {
      email: lockoutEmail,
      passwordHash: await hashPassword(correctPassword),
      role: UserRole.INDUSTRY,
      status: UserStatus.ACTIVE,
      name: "Adv Lockout Subject",
      failedLoginAttempts: 0,
    },
  });
  createdUserIds.push(lockoutSubject.id);

  // Failed attempts 1 to 4 should return 401
  for (let i = 1; i <= 4; i++) {
    await runAdversarialTest(
      "Account Lockout",
      `Failed login attempt ${i}/5 returns HTTP 401 (remaining: ${5 - i})`,
      401,
      async () => {
        const req = makeJsonRequest("http://localhost:3000/api/auth/login", {
          method: "POST",
          body: { email: lockoutEmail, password: wrongPassword },
          ip: "10.0.0.99",
        });
        const res = await loginPOST(req);
        const json = await res.json().catch(() => ({}));
        return { actualStatus: res.status, details: `attemptsRemaining: ${json.attemptsRemaining}` };
      }
    );
  }

  // 5th failed attempt must trigger lockout (HTTP 423)
  await runAdversarialTest(
    "Account Lockout",
    "5th consecutive failed login triggers lockout (HTTP 423 Locked)",
    423,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: { email: lockoutEmail, password: wrongPassword },
        ip: "10.0.0.99",
      });
      const res = await loginPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  // 6th attempt WITH CORRECT PASSWORD must still be rejected with HTTP 423
  await runAdversarialTest(
    "Account Lockout",
    "Subsequent attempt with CORRECT password while locked returns HTTP 423",
    423,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: { email: lockoutEmail, password: correctPassword },
        ip: "10.0.0.99",
      });
      const res = await loginPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  // ---------------------------------------------------------------------------
  // SECTION 6: SLIDING-WINDOW RATE LIMITER (>10 REQ/MIN -> HTTP 429)
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION 6: Sliding-Window Rate Limiter ---");

  const testRateLimitIp = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;

  await runAdversarialTest(
    "Rate Limiting",
    "10 rapid requests from single IP are permitted",
    "10_ALLOWED",
    async () => {
      let allowedCount = 0;
      for (let i = 1; i <= 10; i++) {
        const check = checkRateLimit(testRateLimitIp, 10, 60000);
        if (check.allowed) allowedCount++;
      }
      return {
        actualStatus: allowedCount === 10 ? "10_ALLOWED" : `${allowedCount}_ALLOWED`,
        details: `Allowed ${allowedCount}/10 requests`,
      };
    }
  );

  await runAdversarialTest(
    "Rate Limiting",
    "11th rapid request within 1 minute returns HTTP 429",
    429,
    async () => {
      const req = makeJsonRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: { email: "someuser@example.com", password: "Password123!" },
        ip: testRateLimitIp,
      });
      const res = await loginPOST(req);
      const json = await res.json().catch(() => ({}));
      return { actualStatus: res.status, details: json.error };
    }
  );

  // ---------------------------------------------------------------------------
  // CLEANUP FIXTURES
  // ---------------------------------------------------------------------------
  console.log("\n--- Cleaning up temporary test fixtures ---");
  try {
    if (createdChallengeIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { challengeId: { in: createdChallengeIds } },
      });
      await prisma.proposal.deleteMany({
        where: { challengeId: { in: createdChallengeIds } },
      });
      await prisma.challenge.deleteMany({
        where: { id: { in: createdChallengeIds } },
      });
      console.log(`  ✓ Purged ${createdChallengeIds.length} temporary challenges.`);
    }

    if (createdUserIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
      console.log(`  ✓ Purged ${createdUserIds.length} temporary test users.`);
    }
  } catch (cleanErr: any) {
    console.error("  Cleanup warning:", cleanErr.message);
  }

  // Summary
  const passedCount = results.filter((r) => r.status === "PASS").length;
  const failedCount = results.filter((r) => r.status === "FAIL").length;

  console.log("\n===============================================================================");
  console.log(`CHALLENGER 1 ADVERSARIAL STRESS TEST SUMMARY: ${passedCount} PASSED | ${failedCount} FAILED | ${results.length} TOTAL`);
  console.log("===============================================================================\n");

  if (failedCount > 0) {
    console.error(`FAILURE: ${failedCount} adversarial assertions failed.`);
    process.exit(1);
  } else {
    console.log("SUCCESS: All adversarial security and intake assertions verified empirically.");
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Adversarial test runner crashed:", err);
  process.exit(1);
});
