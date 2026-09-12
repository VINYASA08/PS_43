import { PrismaClient } from "../../web/node_modules/@prisma/client";
import { evaluateHeuristicCategorization, calculateTrackSlaDays } from "../../web/src/lib/ai";
import { routeProblemByTrack, STATE_LINE_DEPARTMENTS, LOCAL_CIVIC_BODIES } from "../../web/src/lib/routing";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("=== 3-TRACK PROBLEM TRIAGE SYSTEM VERIFICATION ===");

  // ---------------------------------------------------------------------------
  // 1. VERIFY HEURISTIC TRIAGE CLASSIFICATION ACROSS 3 TRACKS
  // ---------------------------------------------------------------------------
  console.log("\n[TEST 1] Testing evaluateHeuristicCategorization across 3 tracks...");

  // Scenario A: Innovation (Track A)
  const problemA = {
    title: "Novel Graphene-Based Nanofiltration Skid for Acid Mine Drainage Heavy Metal Adsorption in Jharia Coal Belt",
    description: "Acidic mine runoff from open-cast coal mines has infiltrated local aquifers with high concentrations of dissolved Fe, Pb, and Sulfates (pH 3.9). Requires research into novel low-cost nanomaterial adsorbent skids and university laboratory water filtration prototypes.",
    domain: "Water Management",
    district: "Dhanbad",
    location: "Jharia Block, Damodar Aquifer Sector 4",
    urgency: "CRITICAL",
    evidenceNotes: JSON.stringify({ ph: "3.9", dissolvedIron: "7.8 mg/L", turbidity: "65 NTU" }),
  };

  const triageA = evaluateHeuristicCategorization(problemA);
  console.log("Scenario A Result:", {
    track: triageA.track,
    trackRouting: triageA.trackRouting,
    domain: triageA.domain,
    slaDays: triageA.slaDays,
    targetEntityLevel: triageA.targetEntityLevel,
  });

  if (triageA.track !== "TRACK_A_INNOVATION") {
    throw new Error(`Scenario A expected TRACK_A_INNOVATION, got ${triageA.track}`);
  }
  if (!triageA.trackRouting.includes("IIT (ISM) Dhanbad")) {
    throw new Error(`Scenario A expected routing to IIT (ISM) Dhanbad, got ${triageA.trackRouting}`);
  }
  if (triageA.slaDays < 45) {
    throw new Error(`Scenario A SLA days should be >= 45, got ${triageA.slaDays}`);
  }
  console.log("✔ Scenario A (Track A Innovation) PASSED");

  // Scenario B: Standard (Track B)
  const problemB = {
    title: "Replacement of Burnt 100 kVA Distribution Transformer on Rural Feeder Line in Dumka",
    description: "The 100 kVA distribution transformer on Feeder 4 in Shikaripara block suffered winding failure and burnt out after lightning surge. Needs standard departmental tender replacement with standard 11kV/415V transformer unit under JUVNL rural electrification maintenance schedule.",
    domain: "Energy",
    district: "Dumka",
    location: "Shikaripara Block, Substation Feeder 4",
    urgency: "HIGH",
    evidenceNotes: JSON.stringify({ rating: "100 kVA", voltage: "11kV/415V" }),
  };

  const triageB = evaluateHeuristicCategorization(problemB);
  console.log("Scenario B Result:", {
    track: triageB.track,
    trackRouting: triageB.trackRouting,
    domain: triageB.domain,
    slaDays: triageB.slaDays,
    targetEntityLevel: triageB.targetEntityLevel,
  });

  if (triageB.track !== "TRACK_B_STANDARD") {
    throw new Error(`Scenario B expected TRACK_B_STANDARD, got ${triageB.track}`);
  }
  if (!triageB.trackRouting.includes("JUVNL") && !triageB.trackRouting.includes("Jharkhand Urja Vikas")) {
    throw new Error(`Scenario B expected routing to JUVNL, got ${triageB.trackRouting}`);
  }
  if (triageB.slaDays < 14 || triageB.slaDays > 30) {
    throw new Error(`Scenario B SLA days should be 14-30, got ${triageB.slaDays}`);
  }
  console.log("✔ Scenario B (Track B Standard) PASSED");

  // Scenario C: Civic (Track C)
  const problemC = {
    title: "Choked Open Stormwater Drain and Overflowing Garbage Vat on Main Road Harmu",
    description: "Open municipal stormwater drain is severely choked with solid plastic waste causing foul stagnant blackwater overflow onto Harmu Housing Colony main street. Broken drain slab and non-functional streetlights create immediate pedestrian hazard requiring urgent municipal cleaning crew dispatch.",
    domain: "Urban Infrastructure",
    district: "Ranchi",
    location: "Harmu Housing Colony, Ward 26",
    urgency: "HIGH",
    evidenceNotes: JSON.stringify({ street: "Harmu Main Road", ward: "26" }),
  };

  const triageC = evaluateHeuristicCategorization(problemC);
  console.log("Scenario C Result:", {
    track: triageC.track,
    trackRouting: triageC.trackRouting,
    domain: triageC.domain,
    slaDays: triageC.slaDays,
    targetEntityLevel: triageC.targetEntityLevel,
  });

  if (triageC.track !== "TRACK_C_CIVIC") {
    throw new Error(`Scenario C expected TRACK_C_CIVIC, got ${triageC.track}`);
  }
  if (!triageC.trackRouting.includes("Ranchi Municipal Corporation") && !triageC.trackRouting.includes("RMC")) {
    throw new Error(`Scenario C expected routing to RMC, got ${triageC.trackRouting}`);
  }
  if (triageC.slaDays > 3) {
    throw new Error(`Scenario C SLA days should be <= 3 (72h), got ${triageC.slaDays}`);
  }
  console.log("✔ Scenario C (Track C Civic) PASSED");

  // ---------------------------------------------------------------------------
  // 2. VERIFY PRISMA DATABASE READ & WRITE WITH TRACK FIELDS
  // ---------------------------------------------------------------------------
  console.log("\n[TEST 2] Verifying Prisma Database persistence with track fields...");

  // Find or create test reporter user
  let testUser = await prisma.user.findFirst({
    where: { role: "CITIZEN" },
  });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        name: "Verification Citizen",
        phone: "+919800000099",
        role: "CITIZEN",
        status: "ACTIVE",
        passwordHash: "N/A",
      },
    });
  }

  const testTimestamp = Date.now();
  const trackingIdA = `TEST-TR-A-${testTimestamp}`;
  const trackingIdB = `TEST-TR-B-${testTimestamp}`;
  const trackingIdC = `TEST-TR-C-${testTimestamp}`;

  // Insert Track A Challenge
  const recordA = await prisma.challenge.create({
    data: {
      publicTrackingId: trackingIdA,
      title: problemA.title,
      description: problemA.description,
      domain: triageA.domain,
      district: problemA.district,
      location: problemA.location,
      urgency: triageA.urgency,
      track: triageA.track,
      trackRouting: triageA.trackRouting,
      triageReasoning: triageA.triageReasoning,
      triageConfidence: triageA.triageConfidence,
      targetEntityLevel: triageA.targetEntityLevel,
      assignedInstitute: triageA.suggestedInstitute,
      slaDeadline: new Date(Date.now() + triageA.slaDays * 24 * 60 * 60 * 1000),
      reportedById: testUser.id,
      status: "REPORTED",
    },
  });

  // Insert Track B Challenge
  const recordB = await prisma.challenge.create({
    data: {
      publicTrackingId: trackingIdB,
      title: problemB.title,
      description: problemB.description,
      domain: triageB.domain,
      district: problemB.district,
      location: problemB.location,
      urgency: triageB.urgency,
      track: triageB.track,
      trackRouting: triageB.trackRouting,
      triageReasoning: triageB.triageReasoning,
      triageConfidence: triageB.triageConfidence,
      targetEntityLevel: triageB.targetEntityLevel,
      slaDeadline: new Date(Date.now() + triageB.slaDays * 24 * 60 * 60 * 1000),
      reportedById: testUser.id,
      status: "REPORTED",
    },
  });

  // Insert Track C Challenge
  const recordC = await prisma.challenge.create({
    data: {
      publicTrackingId: trackingIdC,
      title: problemC.title,
      description: problemC.description,
      domain: triageC.domain,
      district: problemC.district,
      location: problemC.location,
      urgency: triageC.urgency,
      track: triageC.track,
      trackRouting: triageC.trackRouting,
      triageReasoning: triageC.triageReasoning,
      triageConfidence: triageC.triageConfidence,
      targetEntityLevel: triageC.targetEntityLevel,
      slaDeadline: new Date(Date.now() + triageC.slaDays * 24 * 60 * 60 * 1000),
      reportedById: testUser.id,
      status: "REPORTED",
    },
  });

  console.log("Inserted challenge records successfully:");
  console.log(`- Track A: ID ${recordA.id}, Tracking: ${recordA.publicTrackingId}, Track: ${recordA.track}`);
  console.log(`- Track B: ID ${recordB.id}, Tracking: ${recordB.publicTrackingId}, Track: ${recordB.track}`);
  console.log(`- Track C: ID ${recordC.id}, Tracking: ${recordC.publicTrackingId}, Track: ${recordC.track}`);

  // Query back with track filters
  const fetchedA = await prisma.challenge.findUnique({
    where: { publicTrackingId: trackingIdA },
  });
  if (!fetchedA || fetchedA.track !== "TRACK_A_INNOVATION" || !fetchedA.trackRouting?.includes("IIT (ISM) Dhanbad")) {
    throw new Error(`Verification of record A failed: ${JSON.stringify(fetchedA)}`);
  }

  const fetchedB = await prisma.challenge.findUnique({
    where: { publicTrackingId: trackingIdB },
  });
  if (!fetchedB || fetchedB.track !== "TRACK_B_STANDARD" || !fetchedB.trackRouting?.includes("JUVNL")) {
    throw new Error(`Verification of record B failed: ${JSON.stringify(fetchedB)}`);
  }

  const fetchedC = await prisma.challenge.findUnique({
    where: { publicTrackingId: trackingIdC },
  });
  if (!fetchedC || fetchedC.track !== "TRACK_C_CIVIC" || !fetchedC.trackRouting?.includes("RMC") && !fetchedC.trackRouting?.includes("Ranchi Municipal Corporation")) {
    throw new Error(`Verification of record C failed: ${JSON.stringify(fetchedC)}`);
  }

  // Count by track index
  const countTrackA = await prisma.challenge.count({ where: { track: "TRACK_A_INNOVATION" } });
  const countTrackB = await prisma.challenge.count({ where: { track: "TRACK_B_STANDARD" } });
  const countTrackC = await prisma.challenge.count({ where: { track: "TRACK_C_CIVIC" } });

  console.log("\nDatabase counts by track index:");
  console.log(`- TRACK_A_INNOVATION: ${countTrackA}`);
  console.log(`- TRACK_B_STANDARD: ${countTrackB}`);
  console.log(`- TRACK_C_CIVIC: ${countTrackC}`);

  // Cleanup test records
  await prisma.challenge.deleteMany({
    where: {
      publicTrackingId: { in: [trackingIdA, trackingIdB, trackingIdC] },
    },
  });
  console.log("Cleaned up temporary test records.");

  console.log("\n✔ ALL 3-TRACK PROBLEM TRIAGE SYSTEM VERIFICATIONS PASSED SUCCESSFULLY!");
}

runVerification()
  .catch((err) => {
    console.error("\n❌ VERIFICATION FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
