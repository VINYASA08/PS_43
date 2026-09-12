import { GET as getTrack } from "../src/app/api/track/[id]/route";
import { POST as postVerify } from "../src/app/api/mobile/verify/route";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/prisma";

async function runMobileVerification() {
  console.log("===============================================================");
  console.log("CHALLENGER 2: ADVERSARIAL MOBILE CONTRACT & TELEMETRY VERIFICATION");
  console.log("===============================================================");

  // 1. Fetch or create test challenge records for Track A, B, and C
  const trackA = await prisma.challenge.findFirst({ where: { track: "TRACK_A_INNOVATION" } });
  if (!trackA) throw new Error("Database missing Track A challenge");

  // Create temporary Track B and Track C challenges for test validation
  const testCitizen = await prisma.user.findFirst({ where: { role: "CITIZEN" } }) || 
                      await prisma.user.findFirst();
  if (!testCitizen) throw new Error("No user found for test challenge creation");

  const tempTrackB = await prisma.challenge.create({
    data: {
      publicTrackingId: "IN-JH-2026-TESTB",
      title: "Test Track B Culvert Repair",
      description: "Damaged culvert causing transport obstruction",
      domain: "Infrastructure",
      district: "Ranchi",
      location: "Namkum Block",
      track: "TRACK_B_STANDARD",
      trackRouting: "PWD Roads Division",
      status: "REPORTED",
      reportedById: testCitizen.id,
    }
  });

  const tempTrackC = await prisma.challenge.create({
    data: {
      publicTrackingId: "IN-JH-2026-TESTC",
      title: "Test Track C Garbage Accumulation",
      description: "Garbage choking drain causing civic hazard",
      domain: "Sanitation",
      district: "Dhanbad",
      location: "Govindpur Haat",
      track: "TRACK_C_CIVIC",
      trackRouting: "Municipal Corporation",
      status: "REPORTED",
      reportedById: testCitizen.id,
    }
  });

  const trackB = tempTrackB;
  const trackC = tempTrackC;

  console.log("\n[TEST 1] Contract Alignment: Track A (Applied R&D / Innovation)");
  if (!trackA) throw new Error("Database missing Track A challenge");
  {
    const req = new NextRequest("http://localhost:3000/api/track/" + trackA.publicTrackingId);
    const res = await getTrack(req, { params: Promise.resolve({ id: trackA.publicTrackingId }) });
    const body = await res.json();

    if (res.status !== 200 || !body.success) {
      throw new Error(`Track A retrieval failed: status ${res.status}`);
    }
    const issue = body.issue;
    console.log(`✓ Track A Retrieved: ID=${issue.id}, Track=${issue.track}, SLA=${issue.slaStatus}`);
    console.log(`✓ Telemetry count: ${issue.telemetry.length}, Timeline count: ${issue.timeline.length}`);
    
    // Assert required fields in TrackIssueDetail
    const requiredProps = ["id", "challengeId", "title", "domain", "track", "location", "urgency", "telemetry", "timeline"];
    for (const prop of requiredProps) {
      if (!(prop in issue)) throw new Error(`Missing property ${prop} in TrackIssueDetail`);
    }
    if (issue.timeline.length !== 5) {
      throw new Error(`Expected 5 timeline steps for Track A, found ${issue.timeline.length}`);
    }
    console.log(`✓ Timeline Step 1: "${issue.timeline[0].title}" | Step 5: "${issue.timeline[4].title}"`);
  }

  console.log("\n[TEST 2] Contract Alignment: Track B (Standard Public Works)");
  if (!trackB) throw new Error("Database missing Track B challenge");
  {
    const req = new NextRequest("http://localhost:3000/api/track/" + trackB.publicTrackingId);
    const res = await getTrack(req, { params: Promise.resolve({ id: trackB.publicTrackingId }) });
    const body = await res.json();

    if (res.status !== 200 || !body.success) {
      throw new Error(`Track B retrieval failed: status ${res.status}`);
    }
    const issue = body.issue;
    console.log(`✓ Track B Retrieved: ID=${issue.id}, Track=${issue.track}`);
    if (issue.timeline.length !== 5) {
      throw new Error(`Expected 5 timeline steps for Track B, found ${issue.timeline.length}`);
    }
    if (!issue.timeline[1].subtitle.includes("Track B")) {
      throw new Error(`Expected Track B subtitle in timeline step 2`);
    }
    console.log(`✓ Step 2 subtitle: "${issue.timeline[1].subtitle}"`);
  }

  console.log("\n[TEST 3] Contract Alignment: Track C (Civic Hazard Rapid Redressal)");
  if (!trackC) throw new Error("Database missing Track C challenge");
  {
    const req = new NextRequest("http://localhost:3000/api/track/" + trackC.publicTrackingId);
    const res = await getTrack(req, { params: Promise.resolve({ id: trackC.publicTrackingId }) });
    const body = await res.json();

    if (res.status !== 200 || !body.success) {
      throw new Error(`Track C retrieval failed: status ${res.status}`);
    }
    const issue = body.issue;
    console.log(`✓ Track C Retrieved: ID=${issue.id}, Track=${issue.track}`);
    if (issue.timeline.length !== 5) {
      throw new Error(`Expected 5 timeline steps for Track C, found ${issue.timeline.length}`);
    }
    if (!issue.timeline[1].subtitle.includes("Track C")) {
      throw new Error(`Expected Track C subtitle in timeline step 2`);
    }
    console.log(`✓ Step 2 subtitle: "${issue.timeline[1].subtitle}"`);
  }

  console.log("\n[TEST 4] Edge Case: Tracking Non-Existent Challenge (404 Fallback)");
  {
    const req = new NextRequest("http://localhost:3000/api/track/IN-NONEXISTENT-9999");
    const res = await getTrack(req, { params: Promise.resolve({ id: "IN-NONEXISTENT-9999" }) });
    const body = await res.json();

    if (res.status !== 404) {
      throw new Error(`Expected HTTP 404 for non-existent challenge, got ${res.status}`);
    }
    console.log(`✓ 404 correctly returned: error="${body.error}"`);
  }

  console.log("\n[TEST 5] Contract Alignment: POST /api/mobile/verify with Nodal Officer ID");
  {
    // Find or create a challenge to verify
    let testChal = await prisma.challenge.findFirst({ where: { status: "REPORTED" } });
    if (!testChal) {
      testChal = trackA;
    }

    const payload = {
      challengeId: testChal.id,
      nodalOfficerId: "test-nodal-id",
    };

    const req = new NextRequest("http://localhost:3000/api/mobile/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await postVerify(req);
    const body = await res.json();

    console.log(`→ Verify response status: ${res.status}`);
    console.log(`→ Verify response payload:`, JSON.stringify(body));

    if (res.status !== 200 || !body.success) {
      throw new Error(`POST /api/mobile/verify failed: ${JSON.stringify(body)}`);
    }

    // Verify properties match VerifyChallengeResponse in Kotlin Models.kt
    if (typeof body.success !== "boolean") throw new Error("body.success is not boolean");
    console.log(`✓ Verify response verified successfully: trackingId=${body.trackingId || body.duplicateOfTrackingId}`);
  }

  console.log("\n===============================================================");
  console.log("ALL 5 MOBILE ADVERSARIAL CONTRACT TESTS PASSED (5/5)");
  console.log("===============================================================");
}

runMobileVerification()
  .catch((err) => {
    console.error("Verification Test Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.challenge.deleteMany({
        where: { publicTrackingId: { in: ["IN-JH-2026-TESTB", "IN-JH-2026-TESTC"] } }
      });
    } catch (_) {}
    await prisma.$disconnect();
  });
