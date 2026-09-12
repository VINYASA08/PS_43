import assert from "node:assert/strict";

const BASE_URL = "http://127.0.0.1:3005";

const routes = [
  "/",
  "/submit",
  "/track",
  "/track?id=IN-GR-2026-9842",
  "/track?id=IN-GR-2026-1234",
  "/dashboard",
  "/dashboard/gov",
  "/dashboard/university",
  "/dashboard/university/proposal/CH-842",
  "/dashboard/industry",
  "/dashboard/industry/fund/PR-102",
  "/dashboard/industry/fund/PR-102?type=mentorship",
  "/dashboard/industry/fund/PR-102?type=funding",
  "/challenge/JHR-2026-842",
  "/challenge/JHR-2026-821",
  "/apply/JHR-2026-842",
  "/guidelines",
  "/login",
  "/dashboard/settings"
];

console.log("===============================================================================");
console.log("EMPIRICAL HTTP ROUTE INTEGRATION HARNESS (Target: http://127.0.0.1:3005)");
console.log("===============================================================================\n");

let passed = 0;
let failed = 0;

for (const route of routes) {
  try {
    const res = await fetch(`${BASE_URL}${route}`);
    const text = await res.text();
    assert.equal(res.status, 200, `Expected status 200, got ${res.status}`);
    assert.ok(text.length > 500, `Expected HTML body content > 500 bytes, got ${text.length}`);
    console.log(`  ✓ 200 OK (${res.status}): ${route} [${text.length} bytes]`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${route} - ${err.message}`);
    failed++;
  }
}

console.log("\n===============================================================================");
console.log(`ROUTE TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("===============================================================================");

if (failed > 0) {
  process.exit(1);
}
