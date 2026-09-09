import assert from "node:assert/strict";

/**
 * AUTOMATED NEXT.JS ROUTE CRAWLER & HYDRATION/SERVER-ERROR DETECTOR
 *
 * Designed for SIH26043 Web Application (Next.js 16 App Router)
 * Crawls every major static, dynamic, query-parameter, and multi-tenant portal route.
 */

const DEFAULT_PORTS = [3000, 3005, 3001];
const TARGET_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : null;

// Complete Route Catalog
export const ROUTE_CATALOG = [
  // Static Public Routes
  { path: "/", name: "Landing Page", authRequired: false },
  { path: "/submit", name: "Citizen Submission Form", authRequired: false },
  { path: "/track", name: "Citizen Issue Tracker", authRequired: false },
  { path: "/guidelines", name: "Regulatory Framework & FAQs", authRequired: false },
  { path: "/accountability", name: "Accountability Index", authRequired: false },
  { path: "/whatsapp-intake", name: "WhatsApp Omnichannel Intake", authRequired: false },
  { path: "/login", name: "Tiered Authentication Portal", authRequired: false },

  // Static Dashboard Portals (Protected by RoleGuard)
  { path: "/dashboard", name: "Central Multi-Tenant Gateway", authRequired: true },
  { path: "/dashboard/gov", name: "Government Oversight Dashboard", authRequired: true },
  { path: "/dashboard/nodal", name: "Nodal Triage Queue", authRequired: true },
  { path: "/dashboard/university", name: "University R&D Portal", authRequired: true },
  { path: "/dashboard/industry", name: "Industry CSR Portal", authRequired: true },
  { path: "/dashboard/open-board", name: "Open Contributor Board", authRequired: true },
  { path: "/dashboard/chat", name: "Collaboration Chat Hub", authRequired: true },
  { path: "/dashboard/settings", name: "Platform & Security Settings", authRequired: true },

  // Dynamic Detail & Action Routes (Seeded Sample IDs)
  { path: "/challenge/JHR-2026-842", name: "Challenge Detail (Water Contamination)", authRequired: false },
  { path: "/challenge/JHR-2026-821", name: "Challenge Detail (Solar Microgrid)", authRequired: false },
  { path: "/challenge/JHR-2026-789", name: "Challenge Detail (Tribal Tele-Medicine)", authRequired: false },
  { path: "/apply/JHR-2026-842", name: "Apply as Expert / Mentor (Water)", authRequired: false },
  { path: "/apply/JHR-2026-821", name: "Apply as Expert / Mentor (Solar)", authRequired: false },
  { path: "/dashboard/university/proposal/CH-842", name: "University DPR Proposal Form", authRequired: true },
  { path: "/dashboard/industry/fund/PR-102", name: "Industry CSR Escrow Pledge Form", authRequired: true },

  // Query Parameter & Filter Variations
  { path: "/track?id=IN-GR-2026-9842", name: "Tracker with Ground Zero ID", authRequired: false },
  { path: "/track?id=JHR-2026-842", name: "Tracker with Seeded Challenge ID", authRequired: false },
  { path: "/dashboard/industry/fund/PR-102?type=mentorship", name: "CSR Mentorship Pledge View", authRequired: true },
  { path: "/dashboard/industry/fund/PR-102?type=funding", name: "CSR Escrow Grant Pledge View", authRequired: true },
  { path: "/login?returnUrl=%2Fdashboard%2Fgov", name: "Login ReturnUrl Redirection Flow", authRequired: false },
];

// Error markers to detect in response payload
const SERVER_ERROR_PATTERNS = [
  /Application error: a server-side exception has occurred/i,
  /<title>500: Internal Server Error<\/title>/i,
  /<title>Application Error<\/title>/i,
  /Unhandled Runtime Error/i,
  /NEXT_NOT_FOUND/i,
  /digest:\s*["']\d+["']/i,
  /at async eval \(/i,
  /at Object\.<anonymous>/i,
];

const HYDRATION_ERROR_PATTERNS = [
  /Hydration failed because the initial UI does not match/i,
  /Text content does not match server-rendered HTML/i,
  /Minified React error #(?:418|423|425)/i,
  /There was an error while hydrating/i,
];

async function detectActiveBaseUrl() {
  const portsToTry = TARGET_PORT ? [TARGET_PORT] : DEFAULT_PORTS;
  for (const port of portsToTry) {
    const url = `http://127.0.0.1:${port}`;
    try {
      const res = await fetch(`${url}/`, { method: "HEAD", signal: AbortSignal.timeout(1500) });
      if (res.status === 200 || res.status === 307 || res.status === 308) {
        return url;
      }
    } catch {
      // try next
    }
  }
  return null;
}

export async function runCrawler(customBaseUrl = null) {
  const baseUrl = customBaseUrl || (await detectActiveBaseUrl());
  if (!baseUrl) {
    throw new Error(
      `Next.js server is not reachable on ports [${DEFAULT_PORTS.join(", ")}]. Please ensure the dev or production server is running.`
    );
  }

  console.log("===============================================================================");
  console.log(`AUTOMATED NEXT.JS ROUTE CRAWLER & ERROR DETECTOR`);
  console.log(`Target Server Base URL: ${baseUrl}`);
  console.log(`Total Routes in Catalog: ${ROUTE_CATALOG.length}`);
  console.log("===============================================================================\n");

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const route of ROUTE_CATALOG) {
    const start = performance.now();
    const fullUrl = `${baseUrl}${route.path}`;
    try {
      const res = await fetch(fullUrl, {
        headers: {
          "User-Agent": "NextJSRouteCrawler/1.0 (Automated QA Audit)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      const duration = Math.round(performance.now() - start);
      const text = await res.text();
      const contentType = res.headers.get("content-type") || "";

      // 1. Status Code assertion
      assert.equal(res.status, 200, `Expected HTTP 200 OK, got ${res.status}`);

      // 2. Content-Type assertion
      assert.ok(contentType.includes("text/html"), `Expected text/html content-type, got '${contentType}'`);

      // 3. Minimum Content Length assertion
      assert.ok(text.length >= 500, `Response HTML truncated (${text.length} bytes < 500 bytes threshold)`);

      // 4. Server-Side Exception Assertions
      for (const pattern of SERVER_ERROR_PATTERNS) {
        if (pattern.test(text)) {
          throw new Error(`Server runtime error pattern detected in HTML: ${pattern}`);
        }
      }

      // 5. Hydration Mismatch Assertions
      for (const pattern of HYDRATION_ERROR_PATTERNS) {
        if (pattern.test(text)) {
          throw new Error(`Hydration mismatch pattern detected in HTML: ${pattern}`);
        }
      }

      results.push({
        path: route.path,
        name: route.name,
        status: res.status,
        sizeBytes: text.length,
        durationMs: duration,
        passed: true,
      });

      console.log(`  ✓ 200 OK (${duration}ms | ${(text.length / 1024).toFixed(1)} KB): ${route.path.padEnd(45)} [${route.name}]`);
      passed++;
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      results.push({
        path: route.path,
        name: route.name,
        status: "FAIL",
        error: err.message,
        durationMs: duration,
        passed: false,
      });

      console.error(`  ✗ FAIL   (${duration}ms): ${route.path.padEnd(45)} -> ${err.message}`);
      failed++;
    }
  }

  console.log("\n===============================================================================");
  console.log(`CRAWLER AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED / ${ROUTE_CATALOG.length} TOTAL`);
  console.log("===============================================================================");

  return { passed, failed, total: ROUTE_CATALOG.length, results };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  runCrawler()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error(`Fatal crawler execution error: ${err.message}`);
      process.exit(1);
    });
}
