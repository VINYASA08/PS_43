import prisma from "../src/lib/prisma";
import { UserRole, UserStatus } from "../src/lib/types";
import { signSessionToken, verifySessionToken, SessionPayload } from "../src/lib/auth";
import { hasPermission, ROLE_PERMISSIONS } from "../src/lib/rbac";
import { getAiConfig, updateAiConfig } from "../src/lib/ai-config";
import { getRoleRedirect } from "../src/stores/authStore";

async function runTests() {
  console.log("=== RUNNING STATE COMMAND CENTER BACKEND TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  // Test 1: UserRole includes STATE_ADMIN
  assert(UserRole.STATE_ADMIN === "STATE_ADMIN", "UserRole.STATE_ADMIN is defined as 'STATE_ADMIN'");

  // Test 2: Role redirect helper
  assert(getRoleRedirect(UserRole.STATE_ADMIN) === "/dashboard/state", "getRoleRedirect(STATE_ADMIN) points to /dashboard/state");
  assert(getRoleRedirect("STATE_ADMIN") === "/dashboard/state", "getRoleRedirect('STATE_ADMIN') points to /dashboard/state");
  assert(getRoleRedirect(UserRole.GOV) === "/dashboard/gov", "getRoleRedirect(GOV) points to /dashboard/gov");

  // Test 3: JWT Session Token creation & verification with STATE_ADMIN & tier
  const testPayload: SessionPayload = {
    userId: "test-state-admin-id",
    name: "Shri L. K. Verma, IAS",
    email: "chief.secretary@jharkhand.gov.in",
    role: UserRole.STATE_ADMIN,
    tier: "STATE",
    status: UserStatus.ACTIVE,
    organization: "Cabinet Secretariat",
    district: "Ranchi",
  };

  const token = await signSessionToken(testPayload);
  assert(typeof token === "string" && token.length > 20, "signSessionToken generates valid JWT string");

  const verified = await verifySessionToken(token);
  assert(verified !== null, "verifySessionToken successfully decodes token");
  assert(verified?.role === UserRole.STATE_ADMIN, "Decoded token role is STATE_ADMIN");
  assert(verified?.tier === "STATE", "Decoded token tier is 'STATE'");
  assert(verified?.userId === "test-state-admin-id", "Decoded userId matches");

  // Test 4: RBAC God-mode permissions
  assert(hasPermission(UserRole.STATE_ADMIN, "challenge:override") === true, "STATE_ADMIN has 'challenge:override' permission");
  assert(hasPermission(UserRole.STATE_ADMIN, "funding:revoke") === true, "STATE_ADMIN has 'funding:revoke' permission");
  assert(hasPermission(UserRole.STATE_ADMIN, "any:arbitrary:action") === true, "STATE_ADMIN has God-mode for any arbitrary permission");
  assert(hasPermission(UserRole.CITIZEN, "funding:revoke") === false, "CITIZEN does NOT have 'funding:revoke' permission");

  // Test 5: AI Config Tuning
  const initialConfig = getAiConfig();
  assert(initialConfig.minThreshold === 0.70, "AI min threshold is 0.70");
  assert(initialConfig.maxThreshold === 0.95, "AI max threshold is 0.95");

  const updatedConfig = updateAiConfig(0.92);
  assert(updatedConfig.confidenceThreshold === 0.92, "AI confidence threshold updated to 0.92");

  // Clamping check
  const clampedLow = updateAiConfig(0.50);
  assert(clampedLow.confidenceThreshold === 0.70, "AI confidence threshold clamped to min 0.70");
  const clampedHigh = updateAiConfig(0.99);
  assert(clampedHigh.confidenceThreshold === 0.95, "AI confidence threshold clamped to max 0.95");
  // Reset to default
  updateAiConfig(0.85);

  // Test 6: Database integration & model fields
  const userSample = await prisma.user.findFirst({ select: { id: true, role: true, tier: true } });
  assert(userSample !== null, "Prisma can query User table with tier column");

  const challengeSample = await prisma.challenge.findFirst({ select: { id: true, status: true, nodalStatus: true } });
  assert(challengeSample !== null, "Prisma can query Challenge table with status and nodalStatus");

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
