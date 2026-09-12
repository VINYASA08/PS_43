import { NextRequest } from "next/server";
import { POST } from "../src/app/api/mobile/challenges/route";
import { prisma } from "../src/lib/prisma";

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING MOBILE API HARDENING VERIFICATION SUITE");
  console.log("==================================================");

  // Test 1: Submit with valid reporterId
  console.log("\n[TEST 1] Testing submission with valid reporterId...");
  const req1 = new NextRequest("http://localhost:3000/api/mobile/challenges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Broken Handpump in Karra Block",
      description: "Drinking water handpump broken since 2 weeks, villagers facing severe water shortage.",
      district: "Khunti",
      location: "23.2750 N, 85.1850 E, Karra Block",
      domain: "Water Management",
      reporterId: "cmtngm5010005ugsyunbe2ich",
      evidenceUrl: "https://storage.jharkhand.gov.in/evidence/handpump.jpg",
      urgency: "HIGH",
    }),
  });

  const res1 = await POST(req1);
  const data1 = await res1.json();
  console.log("→ Response Status:", res1.status);
  console.log("→ Response Body:", JSON.stringify(data1));

  if (res1.status !== 200 || !data1.success) {
    throw new Error(`Test 1 Failed: Status ${res1.status}, data: ${JSON.stringify(data1)}`);
  }
  if (!data1.trackingId || !data1.trackingId.startsWith("IN-JH-")) {
    throw new Error(`Test 1 Failed: Invalid trackingId format ${data1.trackingId}`);
  }

  const ch1 = await prisma.challenge.findUnique({ where: { id: data1.challengeId } });
  if (!ch1) throw new Error("Test 1 Failed: Challenge not found in DB");
  if (ch1.reportedById !== "cmtngm5010005ugsyunbe2ich") {
    throw new Error(`Test 1 Failed: reportedById ${ch1.reportedById} !== cmtngm5010005ugsyunbe2ich`);
  }
  if (ch1.evidence !== JSON.stringify({ media: "https://storage.jharkhand.gov.in/evidence/handpump.jpg" })) {
    throw new Error(`Test 1 Failed: evidence mismatch: ${ch1.evidence}`);
  }
  console.log("✓ Test 1 Passed: Valid reporterId persisted with evidence and trackingId", data1.trackingId);

  // Test 2: Submit WITHOUT reporterId (anonymous / mobile citizen fallback)
  console.log("\n[TEST 2] Testing submission WITHOUT reporterId (fallback resolution)...");
  const req2 = new NextRequest("http://localhost:3000/api/mobile/challenges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Solar Irrigation Pump Inverter Malfunction",
      description: "Community solar pump controller failed due to power surge, affecting 15 smallholder farms.",
      district: "Ranchi",
      location: "23.3441 N, 85.3096 E, Ormanjhi Block",
      domain: "Agriculture",
      mediaUrl: "https://storage.jharkhand.gov.in/evidence/solar_inverter.jpg",
      urgency: "MEDIUM",
    }),
  });

  const res2 = await POST(req2);
  const data2 = await res2.json();
  console.log("→ Response Status:", res2.status);
  console.log("→ Response Body:", JSON.stringify(data2));

  if (res2.status !== 200 || !data2.success) {
    throw new Error(`Test 2 Failed: Status ${res2.status}, data: ${JSON.stringify(data2)}`);
  }

  const ch2 = await prisma.challenge.findUnique({ where: { id: data2.challengeId } });
  if (!ch2) throw new Error("Test 2 Failed: Challenge not found in DB");
  if (!ch2.reportedById) {
    throw new Error("Test 2 Failed: reportedById missing in DB");
  }
  if (ch2.evidence !== JSON.stringify({ media: "https://storage.jharkhand.gov.in/evidence/solar_inverter.jpg" })) {
    throw new Error(`Test 2 Failed: mediaUrl evidence mismatch: ${ch2.evidence}`);
  }
  console.log("✓ Test 2 Passed: Anonymous submission defaulted to citizen ID", ch2.reportedById, "with mediaUrl evidence");

  // Test 3: Submit with NON-EXISTENT reporterId (fallback resolution)
  console.log("\n[TEST 3] Testing submission with NON-EXISTENT reporterId (graceful fallback)...");
  const req3 = new NextRequest("http://localhost:3000/api/mobile/challenges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Primary Health Center Medicine Stockout",
      description: "Essential antimalarial medications out of stock at PHC for over 10 days.",
      district: "West Singhbhum",
      location: "22.5600 N, 85.8100 E, Chaibasa Rural",
      domain: "Healthcare",
      reporterId: "non-existent-user-xyz-999",
      urgency: "CRITICAL",
    }),
  });

  const res3 = await POST(req3);
  const data3 = await res3.json();
  console.log("→ Response Status:", res3.status);
  console.log("→ Response Body:", JSON.stringify(data3));

  if (res3.status !== 200 || !data3.success) {
    throw new Error(`Test 3 Failed: Status ${res3.status}, data: ${JSON.stringify(data3)}`);
  }

  const ch3 = await prisma.challenge.findUnique({ where: { id: data3.challengeId } });
  if (!ch3) throw new Error("Test 3 Failed: Challenge not found in DB");
  if (!ch3.reportedById) {
    throw new Error("Test 3 Failed: reportedById missing in DB");
  }
  console.log("✓ Test 3 Passed: Non-existent reporterId gracefully resolved to fallback citizen ID", ch3.reportedById);

  // Clean up test challenges
  console.log("\n[CLEANUP] Removing test challenges from database...");
  await prisma.challenge.deleteMany({
    where: { id: { in: [data1.challengeId, data2.challengeId, data3.challengeId] } }
  });
  console.log("✓ Cleanup Complete: Database restored.");

  console.log("\n==================================================");
  console.log("ALL TESTS PASSED SUCCESSFULLY (3/3)");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
