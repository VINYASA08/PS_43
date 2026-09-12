import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * AUTOMATED NEXT.JS ROUTE CRAWLER & SSR/HYDRATION ERROR DETECTOR
 *
 * Designed for Jharkhand Societal Innovation Collaboration Portal (SIH26043)
 * Target Framework: Next.js 16 (App Router) + React 19
 *
 * Crawls all 25 major web routes across:
 *  - Public Static Pages (7)
 *  - Protected Multi-Tenant Dashboards (8)
 *  - Dynamic Detail & Action Pages (7)
 *  - Query Parameter & Filter Variations (5)
 *
 * Asserts:
 *  1. HTTP Status Code === 200 OK
 *  2. Response Content-Type includes 'text/html'
 *  3. Body size >= 500 bytes (non-empty rendered markup)
 *  4. Absence of Next.js server runtime crash markers (500, error digests)
 *  5. Absence of React hydration mismatch error patterns (#418, #423, #425)
 */

export const DEFAULT_PORTS = [3005, 3000, 3001, 3002];
export const TARGET_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : null;

// Complete 25+ Major Route Catalog
export const ROUTE_CATALOG = [
  // ---------------------------------------------------------------------------
  // 1. PUBLIC STATIC PAGES (7 Routes)
  // ---------------------------------------------------------------------------
  {
    path: "/",
    name: "Landing Page",
    category: "Public Static",
    authRequired: false,
    expectedTitleSnippet: "Jharkhand",
  },
  {
    path: "/submit",
    name: "Citizen Submission Form",
    category: "Public Static",
    authRequired: false,
    expectedTitleSnippet: "Submit",
  },
  {
    path: "/track",
    name: "Citizen Issue Tracker",
    category: "Public Static",
    authRequired: false,
    expectedTitleSnippet: "Track",
  },
  {
    path: "/guidelines",
    name: "Regulatory Framework & FAQs",
    category: "Public Static",
    authRequired: false,
    expectedTitleSnippet: "Guidelines",
  },
  {
    path: "/accountability",
    name: "Accountability & GRAI Index",
    category: "Public Static",
    authRequired: false,
    expectedTitleSnippet: "Accountability",
  },
  {
    path: "/whatsapp-intake",
    name: "WhatsApp Omnichannel Intake",
    category: "Public Static",
    authRequired: false,
    expectedTitleSnippet: "WhatsApp",
  },
  {
    path: "/login",
    name: "Tiered Authentication Portal",
    category: "Public Static",
    authRequired: false,
    expectedTitleSnippet: "Login",
  },

  // ---------------------------------------------------------------------------
  // 2. PROTECTED DASHBOARD PORTALS (8 Routes)
  // ---------------------------------------------------------------------------
  {
    path: "/dashboard",
    name: "Central Multi-Tenant Gateway",
    category: "Protected Dashboard",
    authRequired: true,
  },
  {
    path: "/dashboard/gov",
    name: "Government Oversight Dashboard",
    category: "Protected Dashboard",
    authRequired: true,
  },
  {
    path: "/dashboard/nodal",
    name: "District Nodal Triage Queue",
    category: "Protected Dashboard",
    authRequired: true,
  },
  {
    path: "/dashboard/university",
    name: "University R&D Portal",
    category: "Protected Dashboard",
    authRequired: true,
  },
  {
    path: "/dashboard/industry",
    name: "Industry CSR Escrow Portal",
    category: "Protected Dashboard",
    authRequired: true,
  },
  {
    path: "/dashboard/open-board",
    name: "Open Contributor Board",
    category: "Protected Dashboard",
    authRequired: true,
  },
  {
    path: "/dashboard/chat",
    name: "Cross-Sector Collaboration Chat Hub",
    category: "Protected Dashboard",
    authRequired: true,
  },
  {
    path: "/dashboard/settings",
    name: "Platform & Security Settings",
    category: "Protected Dashboard",
    authRequired: true,
  },

  // ---------------------------------------------------------------------------
  // 3. DYNAMIC DETAIL & ACTION PAGES (7 Routes)
  // ---------------------------------------------------------------------------
  {
    path: "/challenge/JHR-2026-842",
    name: "Challenge Detail (Water Contamination)",
    category: "Dynamic Detail",
    authRequired: false,
  },
  {
    path: "/challenge/JHR-2026-821",
    name: "Challenge Detail (Solar Microgrid)",
    category: "Dynamic Detail",
    authRequired: false,
  },
  {
    path: "/challenge/JHR-2026-789",
    name: "Challenge Detail (Tribal Tele-Medicine)",
    category: "Dynamic Detail",
    authRequired: false,
  },
  {
    path: "/apply/JHR-2026-842",
    name: "Apply as Expert / Mentor (Water)",
    category: "Dynamic Action",
    authRequired: false,
  },
  {
    path: "/apply/JHR-2026-821",
    name: "Apply as Expert / Mentor (Solar)",
    category: "Dynamic Action",
    authRequired: false,
  },
  {
    path: "/dashboard/university/proposal/CH-842",
    name: "University DPR Proposal Submission",
    category: "Dynamic Action",
    authRequired: true,
  },
  {
    path: "/dashboard/industry/fund/PR-102",
    name: "Industry CSR Escrow Pledge Form",
    category: "Dynamic Action",
    authRequired: true,
  },

  // ---------------------------------------------------------------------------
  // 4. QUERY PARAMETER & FILTER VARIATIONS (5 Variations)
  // ---------------------------------------------------------------------------
  {
    path: "/track?id=IN-GR-2026-9842",
    name: "Tracker with Ground Zero ID",
    category: "Query Variation",
    authRequired: false,
  },
  {
    path: "/track?id=JHR-2026-842",
    name: "Tracker with Seeded Challenge ID",
    category: "Query Variation",
    authRequired: false,
  },
  {
    path: "/dashboard/industry/fund/PR-102?type=mentorship",
    name: "CSR Mentorship Pledge View",
    category: "Query Variation",
    authRequired: true,
  },
  {
    path: "/dashboard/industry/fund/PR-102?type=funding",
    name: "CSR Escrow Grant Pledge View",
    category: "Query Variation",
    authRequired: true,
  },
  {
    path: "/login?returnUrl=%2Fdashboard%2Fgov",
    name: "Login ReturnUrl Redirection Flow",
    category: "Query Variation",
    authRequired: false,
  },
];

// Error markers to detect in response payload
export const SERVER_ERROR_PATTERNS = [
  /Application error: a server-side exception has occurred/i,
  /<title>500: Internal Server Error<\/title>/i,
  /<title>Application Error<\/title>/i,
  /Unhandled Runtime Error/i,
  /NEXT_NOT_FOUND/i,
  /digest:\s*["']\d+["']/i,
  /at async eval \(/i,
  /at Object\.<anonymous>/i,
];

export const HYDRATION_ERROR_PATTERNS = [
  /Hydration failed because the initial UI does not match/i,
  /Text content does not match server-rendered HTML/i,
  /Minified React error #(?:418|423|425)/i,
  /There was an error while hydrating/i,
];

/**
 * Auto-discovers the active Next.js base URL by probing candidate ports.
 */
export async function detectActiveBaseUrl() {
  const portsToTry = TARGET_PORT ? [TARGET_PORT] : DEFAULT_PORTS;
  for (const port of portsToTry) {
    const url = `http://127.0.0.1:${port}`;
    try {
      const res = await fetch(`${url}/`, {
        method: "HEAD",
        signal: AbortSignal.timeout(1500),
      });
      if (res.status === 200 || res.status === 307 || res.status === 308) {
        return url;
      }
    } catch {
      // Continue to next port candidate
    }
  }
  return null;
}

/**
 * Attempts to start Next.js server locally if not currently reachable.
 */
export async function ensureServerRunning() {
  let baseUrl = await detectActiveBaseUrl();
  if (baseUrl) return { baseUrl, process: null };

  console.log("No active Next.js instance detected on ports " + DEFAULT_PORTS.join(", "));
  console.log("Attempting to spawn Next.js server on port 3005...");

  const webDir = path.resolve(fileURLToPath(import.meta.url), "../..");
  const child = spawn("npx", ["next", "start", "-p", "3005"], {
    cwd: webDir,
    shell: true,
    stdio: "pipe",
    env: { ...process.env, PORT: "3005" },
  });

  const startTime = Date.now();
  const maxWaitMs = 25000;
  const pollIntervalMs = 500;

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((r) => setTimeout(r, pollIntervalMs));
    baseUrl = await detectActiveBaseUrl();
    if (baseUrl) {
      console.log(`Server successfully initialized at ${baseUrl}`);
      return { baseUrl, process: child };
    }
  }

  child.kill();
  throw new Error(`Failed to initialize Next.js server within ${maxWaitMs}ms.`);
}

/**
 * Attempts to acquire an authenticated session cookie via /api/auth/login.
 */
export async function acquireAuthCookie(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nodal.innovation@jharkhand.gov.in",
        password: "Jharkhand@2026!",
      }),
    });
    if (res.ok) {
      const cookieHeader = res.headers.get("set-cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/sih_session=[^;]+/);
        if (match) return match[0];
      }
    }
  } catch {
    // Non-fatal: crawler operates with public and SSR-fallback headers
  }
  return null;
}

/**
 * Main Crawler Runner Function
 *
 * @param {string|null} customBaseUrl - Optional explicit URL to target
 * @param {object} options - Configuration overrides
 * @returns {Promise<{passed: number, failed: number, total: number, results: Array}>}
 */
export async function runCrawler(customBaseUrl = null, options = {}) {
  let spawnedProcess = null;
  let baseUrl = customBaseUrl;

  if (!baseUrl) {
    const serverResult = await ensureServerRunning();
    baseUrl = serverResult.baseUrl;
    spawnedProcess = serverResult.process;
  }

  const authCookie = await acquireAuthCookie(baseUrl);

  console.log("===============================================================================");
  console.log("  AUTOMATED NEXT.JS ROUTE CRAWLER & INTEGRITY HARNESS");
  console.log(`  Target Server Base URL : ${baseUrl}`);
  console.log(`  Auth Cookie Available  : ${authCookie ? "Yes (sih_session attached)" : "No (SSR fallback mode)"}`);
  console.log(`  Total Routes Cataloged : ${ROUTE_CATALOG.length}`);
  console.log("===============================================================================\n");

  const results = [];
  let passed = 0;
  let failed = 0;
  let totalDurationMs = 0;
  let totalBytes = 0;

  for (const route of ROUTE_CATALOG) {
    const start = performance.now();
    const fullUrl = `${baseUrl}${route.path}`;
    const headers = {
      "User-Agent": "NextJSRouteCrawler/1.0 (Automated QA Audit)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };
    if (authCookie && route.authRequired) {
      headers["Cookie"] = authCookie;
    }

    try {
      const res = await fetch(fullUrl, { headers });
      const duration = Math.round(performance.now() - start);
      totalDurationMs += duration;

      const text = await res.text();
      const bytes = text.length;
      totalBytes += bytes;
      const contentType = res.headers.get("content-type") || "";

      // 1. Assert HTTP Status Code === 200
      assert.equal(
        res.status,
        200,
        `Expected HTTP 200 OK, got ${res.status} (${res.statusText})`
      );

      // 2. Assert Content-Type contains text/html
      assert.ok(
        contentType.toLowerCase().includes("text/html"),
        `Expected text/html content-type, got '${contentType}'`
      );

      // 3. Assert HTML Body Size >= 500 bytes
      assert.ok(
        bytes >= 500,
        `Response body truncated (${bytes} bytes < 500 byte minimum threshold)`
      );

      // 4. Assert Zero Server Runtime Crash Markers
      for (const pattern of SERVER_ERROR_PATTERNS) {
        if (pattern.test(text)) {
          throw new Error(`Server runtime error pattern detected in HTML: ${pattern}`);
        }
      }

      // 5. Assert Zero React Hydration Failure Markers
      for (const pattern of HYDRATION_ERROR_PATTERNS) {
        if (pattern.test(text)) {
          throw new Error(`Hydration mismatch pattern detected in HTML: ${pattern}`);
        }
      }

      results.push({
        path: route.path,
        name: route.name,
        category: route.category,
        status: res.status,
        sizeBytes: bytes,
        durationMs: duration,
        contentType,
        passed: true,
      });

      console.log(
        `  ✓ 200 OK | ${String(duration).padStart(4)}ms | ${String((bytes / 1024).toFixed(1)).padStart(6)} KB | ${route.path.padEnd(46)} [${route.name}]`
      );
      passed++;
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      totalDurationMs += duration;

      results.push({
        path: route.path,
        name: route.name,
        category: route.category,
        status: "FAIL",
        error: err.message,
        durationMs: duration,
        passed: false,
      });

      console.error(
        `  ✗ FAIL   | ${String(duration).padStart(4)}ms | ${route.path.padEnd(46)} -> ${err.message}`
      );
      failed++;
    }
  }

  const avgDuration = Math.round(totalDurationMs / ROUTE_CATALOG.length);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log("\n===============================================================================");
  console.log(`  CRAWLER AUDIT SUMMARY`);
  console.log(`  Total Catalog Routes : ${ROUTE_CATALOG.length}`);
  console.log(`  Passed               : ${passed}`);
  console.log(`  Failed               : ${failed}`);
  console.log(`  Average Latency      : ${avgDuration} ms / route`);
  console.log(`  Total Data Crawled   : ${totalMb} MB`);
  console.log("===============================================================================\n");

  if (spawnedProcess) {
    try {
      spawnedProcess.kill();
    } catch {
      // Ignore
    }
  }

  return {
    passed,
    failed,
    total: ROUTE_CATALOG.length,
    averageLatencyMs: avgDuration,
    totalBytesCrawled: totalBytes,
    results,
  };
}

// Support direct invocation via CLI
const currentFilePath = fileURLToPath(import.meta.url).toLowerCase();
const invokedFilePath = process.argv[1] ? path.resolve(process.argv[1]).toLowerCase() : null;

if (invokedFilePath && invokedFilePath === currentFilePath) {
  runCrawler()
    .then(({ failed, total, passed }) => {
      if (failed > 0) {
        console.error(`Route crawler test suite finished with ${failed} failures.`);
        process.exit(1);
      }
      console.log(`Route crawler test suite passed successfully (${passed}/${total} routes OK).`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`Fatal crawler execution error: ${err.message}`);
      process.exit(1);
    });
}
