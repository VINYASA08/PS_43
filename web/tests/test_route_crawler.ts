import assert from "node:assert/strict";
import { spawn, ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * AUTOMATED NEXT.JS ROUTE CRAWLER & SSR/HYDRATION ERROR DETECTOR (TYPESCRIPT)
 *
 * Designed for Jharkhand Societal Innovation Collaboration Portal (SIH26043)
 * Target Framework: Next.js 16 (App Router) + React 19
 */

export interface RouteCatalogEntry {
  path: string;
  name: string;
  category: "Public Static" | "Protected Dashboard" | "Dynamic Detail" | "Dynamic Action" | "Query Variation";
  authRequired: boolean;
  expectedTitleSnippet?: string;
}

export interface CrawlResult {
  path: string;
  name: string;
  category: string;
  status: number | "FAIL";
  sizeBytes?: number;
  durationMs: number;
  contentType?: string;
  passed: boolean;
  error?: string;
}

export interface CrawlerSummary {
  passed: number;
  failed: number;
  total: number;
  averageLatencyMs: number;
  totalBytesCrawled: number;
  results: CrawlResult[];
}

export const DEFAULT_PORTS = [3005, 3000, 3001, 3002];
export const TARGET_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : null;

// Complete 25+ Major Route Catalog
export const ROUTE_CATALOG: RouteCatalogEntry[] = [
  // 1. PUBLIC STATIC PAGES (7 Routes)
  { path: "/", name: "Landing Page", category: "Public Static", authRequired: false, expectedTitleSnippet: "Jharkhand" },
  { path: "/submit", name: "Citizen Submission Form", category: "Public Static", authRequired: false, expectedTitleSnippet: "Submit" },
  { path: "/track", name: "Citizen Issue Tracker", category: "Public Static", authRequired: false, expectedTitleSnippet: "Track" },
  { path: "/guidelines", name: "Regulatory Framework & FAQs", category: "Public Static", authRequired: false, expectedTitleSnippet: "Guidelines" },
  { path: "/accountability", name: "Accountability & GRAI Index", category: "Public Static", authRequired: false, expectedTitleSnippet: "Accountability" },
  { path: "/whatsapp-intake", name: "WhatsApp Omnichannel Intake", category: "Public Static", authRequired: false, expectedTitleSnippet: "WhatsApp" },
  { path: "/login", name: "Tiered Authentication Portal", category: "Public Static", authRequired: false, expectedTitleSnippet: "Login" },

  // 2. PROTECTED DASHBOARD PORTALS (8 Routes)
  { path: "/dashboard", name: "Central Multi-Tenant Gateway", category: "Protected Dashboard", authRequired: true },
  { path: "/dashboard/gov", name: "Government Oversight Dashboard", category: "Protected Dashboard", authRequired: true },
  { path: "/dashboard/nodal", name: "District Nodal Triage Queue", category: "Protected Dashboard", authRequired: true },
  { path: "/dashboard/university", name: "University R&D Portal", category: "Protected Dashboard", authRequired: true },
  { path: "/dashboard/industry", name: "Industry CSR Escrow Portal", category: "Protected Dashboard", authRequired: true },
  { path: "/dashboard/open-board", name: "Open Contributor Board", category: "Protected Dashboard", authRequired: true },
  { path: "/dashboard/chat", name: "Cross-Sector Collaboration Chat Hub", category: "Protected Dashboard", authRequired: true },
  { path: "/dashboard/settings", name: "Platform & Security Settings", category: "Protected Dashboard", authRequired: true },

  // 3. DYNAMIC DETAIL & ACTION PAGES (7 Routes)
  { path: "/challenge/JHR-2026-842", name: "Challenge Detail (Water Contamination)", category: "Dynamic Detail", authRequired: false },
  { path: "/challenge/JHR-2026-821", name: "Challenge Detail (Solar Microgrid)", category: "Dynamic Detail", authRequired: false },
  { path: "/challenge/JHR-2026-789", name: "Challenge Detail (Tribal Tele-Medicine)", category: "Dynamic Detail", authRequired: false },
  { path: "/apply/JHR-2026-842", name: "Apply as Expert / Mentor (Water)", category: "Dynamic Action", authRequired: false },
  { path: "/apply/JHR-2026-821", name: "Apply as Expert / Mentor (Solar)", category: "Dynamic Action", authRequired: false },
  { path: "/dashboard/university/proposal/CH-842", name: "University DPR Proposal Submission", category: "Dynamic Action", authRequired: true },
  { path: "/dashboard/industry/fund/PR-102", name: "Industry CSR Escrow Pledge Form", category: "Dynamic Action", authRequired: true },

  // 4. QUERY PARAMETER & FILTER VARIATIONS (5 Variations)
  { path: "/track?id=IN-GR-2026-9842", name: "Tracker with Ground Zero ID", category: "Query Variation", authRequired: false },
  { path: "/track?id=JHR-2026-842", name: "Tracker with Seeded Challenge ID", category: "Query Variation", authRequired: false },
  { path: "/dashboard/industry/fund/PR-102?type=mentorship", name: "CSR Mentorship Pledge View", category: "Query Variation", authRequired: true },
  { path: "/dashboard/industry/fund/PR-102?type=funding", name: "CSR Escrow Grant Pledge View", category: "Query Variation", authRequired: true },
  { path: "/login?returnUrl=%2Fdashboard%2Fgov", name: "Login ReturnUrl Redirection Flow", category: "Query Variation", authRequired: false },
];

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

export async function detectActiveBaseUrl(): Promise<string | null> {
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
      // Try next
    }
  }
  return null;
}

export async function ensureServerRunning(): Promise<{ baseUrl: string; process: ChildProcess | null }> {
  let baseUrl = await detectActiveBaseUrl();
  if (baseUrl) return { baseUrl, process: null };

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
      return { baseUrl, process: child };
    }
  }

  child.kill();
  throw new Error(`Failed to initialize Next.js server within ${maxWaitMs}ms.`);
}

export async function acquireAuthCookie(baseUrl: string): Promise<string | null> {
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
    // Non-fatal
  }
  return null;
}

export async function runCrawler(customBaseUrl: string | null = null): Promise<CrawlerSummary> {
  let spawnedProcess: ChildProcess | null = null;
  let baseUrl = customBaseUrl;

  if (!baseUrl) {
    const serverResult = await ensureServerRunning();
    baseUrl = serverResult.baseUrl;
    spawnedProcess = serverResult.process;
  }

  const authCookie = await acquireAuthCookie(baseUrl);

  console.log("===============================================================================");
  console.log("  AUTOMATED NEXT.JS ROUTE CRAWLER & INTEGRITY HARNESS (TSX)");
  console.log(`  Target Server Base URL : ${baseUrl}`);
  console.log(`  Auth Cookie Available  : ${authCookie ? "Yes (sih_session attached)" : "No (SSR fallback mode)"}`);
  console.log(`  Total Routes Cataloged : ${ROUTE_CATALOG.length}`);
  console.log("===============================================================================\n");

  const results: CrawlResult[] = [];
  let passed = 0;
  let failed = 0;
  let totalDurationMs = 0;
  let totalBytes = 0;

  for (const route of ROUTE_CATALOG) {
    const start = performance.now();
    const fullUrl: string = `${baseUrl}${route.path}`;
    const headers: Record<string, string> = {
      "User-Agent": "NextJSRouteCrawler/1.0 (Automated QA Audit TS)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };
    if (authCookie && route.authRequired) {
      headers["Cookie"] = authCookie;
    }

    try {
      const res: Response = await fetch(fullUrl, { headers });
      const duration = Math.round(performance.now() - start);
      totalDurationMs += duration;

      const text = await res.text();
      const bytes = text.length;
      totalBytes += bytes;
      const contentType = res.headers.get("content-type") || "";

      // 1. Status Code assertion
      assert.equal(res.status, 200, `Expected HTTP 200 OK, got ${res.status}`);

      // 2. Content-Type assertion
      assert.ok(contentType.toLowerCase().includes("text/html"), `Expected text/html, got '${contentType}'`);

      // 3. Minimum Content Length assertion
      assert.ok(bytes >= 500, `Response body truncated (${bytes} bytes < 500 byte threshold)`);

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
    } catch (err: any) {
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
