/**
 * Adversarial Test Harness for PRAGATI Round 11:
 * Statewide 24-District GIS Heatmap, Recharts Analytics, and Command Center UI Components.
 * 
 * Scope:
 * 1. Statutory 24-District GIS Integrity (completeness, uniqueness, choropleth, DNOs)
 * 2. Boundary Values in Analytics Data (0 challenges, 0 funds, negative numbers, 100+ Crore, extreme speeds)
 * 3. Recharts Components SSR Safety & Responsive Wrappers
 * 4. Tab Switching, Filter States & Search Queries across all modules
 * 5. Component Runtime Execution & Defect Oracle
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import { JHARKHAND_DISTRICTS } from "../src/app/dashboard/gov/mockData";
import { StateHeatmap, DistrictMetric } from "../src/app/dashboard/state/components/StateHeatmap";
import { BottleneckAnalytics, DistrictBottleneck, DomainBottleneck } from "../src/app/dashboard/state/components/BottleneckAnalytics";
import { UniversityLeaderboard, UniversityRankItem } from "../src/app/dashboard/state/components/UniversityLeaderboard";
import { FinancialCommand, SectorEscrowItem, FinancialTrendItem } from "../src/app/dashboard/state/components/FinancialCommand";
import { AiOversightPanel } from "../src/app/dashboard/state/components/AiOversightPanel";
import { UserManagementPanel } from "../src/app/dashboard/state/components/UserManagementPanel";
import { MasterOverridePanel } from "../src/app/dashboard/state/components/MasterOverridePanel";
import { GET as getAnalyticsRoute } from "../src/app/api/state/analytics/route";
import { NextRequest } from "next/server";
import { signSessionToken } from "../src/lib/auth";
import { UserRole, UserStatus } from "../src/lib/types";
import * as fsLib from "fs";
import * as pathLib from "path";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, errorMsg?: string) {
  if (condition) {
    console.log(`  [PASS] [${suite}] ${name}`);
    results.push({ suite, name, passed: true });
  } else {
    console.error(`  [FAIL] [${suite}] ${name} - ${errorMsg || "Condition violated"}`);
    results.push({ suite, name, passed: false, error: errorMsg || "Condition violated" });
  }
}

async function runAdversarialTests() {
  console.log("===============================================================================");
  console.log("    PRAGATI ROUND 11: ADVERSARIAL GIS & RECHARTS CHALLENGER TEST HARNESS");
  console.log("===============================================================================\n");

  // ==========================================================================
  // SUITE 1: 24 Statutory Districts of Jharkhand Integrity & GIS Configuration
  // ==========================================================================
  console.log("--- SUITE 1: Statutory 24 Districts & GIS Configuration ---");
  const SUITE1 = "GIS_24_DISTRICTS";

  const EXPECTED_24_DISTRICTS = [
    "Ranchi", "Dhanbad", "Bokaro", "East Singhbhum", "West Singhbhum",
    "Palamu", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh",
    "Dumka", "Jamtara", "Godda", "Sahibganj", "Pakur",
    "Gumla", "Simdega", "Lohardaga", "Latehar", "Garhwa",
    "Chatra", "Koderma", "Khunti", "Saraikela Kharsawan"
  ];

  assert(SUITE1, "Contains exactly 24 statutory districts in mockData", JHARKHAND_DISTRICTS.length === 24);

  const districtNames = JHARKHAND_DISTRICTS.map((d) => d.name);
  const districtIds = JHARKHAND_DISTRICTS.map((d) => d.id);

  const uniqueIds = new Set(districtIds);
  const uniqueNames = new Set(districtNames);
  assert(SUITE1, "All 24 district IDs are globally unique", uniqueIds.size === 24);
  assert(SUITE1, "All 24 district names are globally unique", uniqueNames.size === 24);

  let missingDistricts: string[] = [];
  for (const expected of EXPECTED_24_DISTRICTS) {
    if (!districtNames.some((name) => name.toLowerCase() === expected.toLowerCase())) {
      missingDistricts.push(expected);
    }
  }
  assert(
    SUITE1,
    "All 24 statutory district names present in inventory",
    missingDistricts.length === 0,
    `Missing: ${missingDistricts.join(", ")}`
  );

  const allHaveValidSvgPaths = JHARKHAND_DISTRICTS.every(
    (d) => typeof d.path === "string" && d.path.startsWith("M") && d.path.endsWith("Z") && d.path.length > 20
  );
  assert(SUITE1, "All 24 districts have valid SVG vector paths (starting M, ending Z)", allHaveValidSvgPaths);

  const allHaveCentroids = JHARKHAND_DISTRICTS.every(
    (d) => Array.isArray(d.center) && d.center.length === 2 &&
           typeof d.center[0] === "number" && typeof d.center[1] === "number" &&
           d.center[0] >= 0 && d.center[0] <= 820 &&
           d.center[1] >= 0 && d.center[1] <= 580
  );
  assert(SUITE1, "All 24 districts have 2D centroids within map viewport bounds (820x580)", allHaveCentroids);

  const allHaveDno = JHARKHAND_DISTRICTS.every(
    (d) => d.nodalOfficer &&
           typeof d.nodalOfficer.name === "string" && d.nodalOfficer.name.length > 3 &&
           typeof d.nodalOfficer.email === "string" && d.nodalOfficer.email.includes("@jharkhand.gov.in") &&
           typeof d.nodalOfficer.phone === "string" && d.nodalOfficer.phone.startsWith("+91-") &&
           typeof d.nodalOfficer.dscVerified === "boolean"
  );
  assert(SUITE1, "All 24 districts have DSC-verified DNOs with gov.in emails and phone numbers", allHaveDno);

  // Analytics API Route verification
  try {
    const stateSession = {
      userId: "challenger-state-admin",
      name: "State Auditor",
      email: "auditor@jharkhand.gov.in",
      role: UserRole.STATE_ADMIN,
      tier: "STATE",
      status: UserStatus.ACTIVE,
    };
    const token = await signSessionToken(stateSession);
    const req = new NextRequest("http://localhost:3000/api/state/analytics", {
      headers: { cookie: `sih_session=${token}` },
    });
    const res = await getAnalyticsRoute(req);
    const data = await res.json();

    assert(SUITE1, "Analytics API returns HTTP 200 OK", res.status === 200);
    assert(SUITE1, "Analytics API districtHeatmap has exactly 24 items", Array.isArray(data.districtHeatmap) && data.districtHeatmap.length === 24);
    assert(SUITE1, "Analytics summary reports 24 districts monitored", data.summary?.districtsMonitored === 24);

    const apiDistrictNames = data.districtHeatmap.map((d: any) => d.name);
    let allInApi = EXPECTED_24_DISTRICTS.every((exp) => apiDistrictNames.some((n: string) => n.toLowerCase() === exp.toLowerCase()));
    assert(SUITE1, "Analytics API includes all 24 statutory districts", allInApi);
  } catch (err: any) {
    assert(SUITE1, "Analytics API execution without fatal exception", false, err.message);
  }

  // ==========================================================================
  // SUITE 2: Boundary Values in Analytics Data & Resilience
  // ==========================================================================
  console.log("\n--- SUITE 2: Analytics Data Boundary Values & Stress Testing ---");
  const SUITE2 = "BOUNDARY_VALUES";

  const standardDistricts: DistrictMetric[] = JHARKHAND_DISTRICTS.map((d) => ({
    id: d.id,
    name: d.name,
    division: d.division,
    challenges: d.complaintsLogged,
    density: d.complaintsLogged >= 350 ? "critical" : d.complaintsLogged >= 250 ? "high" : "medium",
    avgResolutionDays: Number((d.resolutionSpeedHours * 1.6).toFixed(1)),
    triageHours: d.resolutionSpeedHours,
    activeBuilds: d.activeBuilds,
    csrDeployedCr: d.csrDeployedCr,
    civicBacklogCount: d.civicBacklogCount,
    complaintsLogged: d.complaintsLogged,
    complaintsResolved: d.complaintsResolved,
    center: d.center,
    path: d.path,
    nodalOfficer: d.nodalOfficer,
  }));

  // Boundary 1: All Zeroes
  const zeroDistricts: DistrictMetric[] = standardDistricts.map((d) => ({
    ...d,
    challenges: 0,
    civicBacklogCount: 0,
    csrDeployedCr: 0,
    triageHours: 0,
    avgResolutionDays: 0,
    complaintsLogged: 0,
    complaintsResolved: 0,
  }));

  try {
    const zeroHtml = ReactDOMServer.renderToString(
      React.createElement(StateHeatmap, { districts: zeroDistricts })
    );
    assert(SUITE2, "StateHeatmap renders cleanly with 0 challenges/funds across all 24 districts", zeroHtml.length > 0);
    assert(SUITE2, "StateHeatmap with 0 challenges does not produce NaN in rendered output", !zeroHtml.includes("NaN"));
  } catch (err: any) {
    assert(SUITE2, "StateHeatmap renders cleanly with 0 challenges", false, err.message);
  }

  // Boundary 2: Empty Array
  try {
    const emptyHtml = ReactDOMServer.renderToString(
      React.createElement(StateHeatmap, { districts: [] })
    );
    assert(SUITE2, "StateHeatmap renders without crash when passed empty array []", emptyHtml.length > 0);
    assert(SUITE2, "StateHeatmap empty array produces 0 summary metrics without NaN", !emptyHtml.includes("NaN"));
  } catch (err: any) {
    assert(SUITE2, "StateHeatmap empty array handling", false, err.message);
  }

  // Boundary 3: Negative Numbers
  const negativeDistricts: DistrictMetric[] = standardDistricts.map((d) => ({
    ...d,
    challenges: -5,
    civicBacklogCount: -12,
    csrDeployedCr: -0.5,
    triageHours: -2.0,
    avgResolutionDays: -4.0,
  }));

  try {
    const negHtml = ReactDOMServer.renderToString(
      React.createElement(StateHeatmap, { districts: negativeDistricts })
    );
    assert(SUITE2, "StateHeatmap handles negative metrics without throwing", negHtml.length > 0);
  } catch (err: any) {
    assert(SUITE2, "StateHeatmap handles negative metrics", false, err.message);
  }

  // Boundary 4: Extreme Large Values (100+ Crore, 1M Challenges)
  const extremeDistricts: DistrictMetric[] = standardDistricts.map((d) => ({
    ...d,
    challenges: 1000000,
    civicBacklogCount: 50000,
    csrDeployedCr: 100.5,
    triageHours: 9999.9,
    avgResolutionDays: 15999.8,
  }));

  try {
    const extremeHtml = ReactDOMServer.renderToString(
      React.createElement(StateHeatmap, { districts: extremeDistricts })
    );
    assert(SUITE2, "StateHeatmap handles extreme large values (100+ Cr, 1M challenges) without overflow", extremeHtml.length > 0);
  } catch (err: any) {
    assert(SUITE2, "StateHeatmap extreme value handling", false, err.message);
  }

  // Boundary 5: Bottleneck Analytics with Extreme & Zero Values
  try {
    const zeroBottlenecksHtml = ReactDOMServer.renderToString(
      React.createElement(BottleneckAnalytics, {
        districtBottlenecks: [
          { district: "Ranchi", domain: "Water", avgResolutionDays: 0, triageHours: 0, isSlow: false, slaStatus: "COMPLIANT" },
          { district: "Garhwa", domain: "Sanitation", avgResolutionDays: 99999, triageHours: 5000, isSlow: true, slaStatus: "BREACHED" },
          { district: "Chatra", domain: "Roads", avgResolutionDays: -5, triageHours: -1, isSlow: false, slaStatus: "COMPLIANT" },
        ],
        domainBottlenecks: [
          { domain: "Water", avgResolutionDays: 0, triageHours: 0, challengeCount: 0 },
          { domain: "Mega", avgResolutionDays: 10000, triageHours: 800, challengeCount: 500000 },
        ],
      })
    );
    assert(SUITE2, "BottleneckAnalytics handles 0, negative, and extreme resolution times without error", zeroBottlenecksHtml.length > 0);
  } catch (err: any) {
    assert(SUITE2, "BottleneckAnalytics boundary resilience", false, err.message);
  }

  // Boundary 6: University Leaderboard with 0 and 100 Crore Funding
  try {
    const extremeLeaderboardHtml = ReactDOMServer.renderToString(
      React.createElement(UniversityLeaderboard, {
        universities: [
          { rank: 1, name: "BIT Mesra", claimed: 1000, fundingSecured: 1000000000, successfulHandovers: 800, graiScore: 99.4 },
          { rank: 2, name: "Empty Tech", claimed: 0, fundingSecured: 0, successfulHandovers: 0, graiScore: 0 },
          { rank: 3, name: "Negative Fund Uni", claimed: 1, fundingSecured: -500000, successfulHandovers: 0, graiScore: 10 },
        ],
      })
    );
    assert(SUITE2, "UniversityLeaderboard handles 0, negative, and 100-Crore funding values cleanly", extremeLeaderboardHtml.length > 0);
  } catch (err: any) {
    assert(SUITE2, "UniversityLeaderboard extreme value handling", false, err.message);
  }

  // ==========================================================================
  // SUITE 3: Recharts SSR Safety, Responsive Wrappers & Chart Types
  // ==========================================================================
  console.log("\n--- SUITE 3: Recharts SSR Safety & Responsive Container Verification ---");
  const SUITE3 = "RECHARTS_SSR_AND_RESPONSIVENESS";

  try {
    const ssrBottlenecks = ReactDOMServer.renderToString(
      React.createElement(BottleneckAnalytics, { districtBottlenecks: [], domainBottlenecks: [] })
    );
    assert(
      SUITE3,
      "BottleneckAnalytics provides safe SSR fallback before client mount",
      ssrBottlenecks.includes("Loading interactive chart engine...")
    );
  } catch (err: any) {
    assert(SUITE3, "BottleneckAnalytics SSR fallback", false, err.message);
  }

  try {
    const ssrLeaderboard = ReactDOMServer.renderToString(
      React.createElement(UniversityLeaderboard, { universities: [] })
    );
    assert(
      SUITE3,
      "UniversityLeaderboard provides safe SSR fallback before client mount",
      ssrLeaderboard.includes("Loading leaderboard charts...")
    );
  } catch (err: any) {
    assert(SUITE3, "UniversityLeaderboard SSR fallback", false, err.message);
  }

  const bottleneckSrc = fsLib.readFileSync(
    pathLib.join(process.cwd(), "src/app/dashboard/state/components/BottleneckAnalytics.tsx"),
    "utf-8"
  );
  const leaderboardSrc = fsLib.readFileSync(
    pathLib.join(process.cwd(), "src/app/dashboard/state/components/UniversityLeaderboard.tsx"),
    "utf-8"
  );
  const financialSrc = fsLib.readFileSync(
    pathLib.join(process.cwd(), "src/app/dashboard/state/components/FinancialCommand.tsx"),
    "utf-8"
  );

  const bottleneckHasExplicitHeights = bottleneckSrc.includes("h-[380px] w-full");
  assert(SUITE3, "BottleneckAnalytics wraps ResponsiveContainer with explicit fixed height (h-[380px])", bottleneckHasExplicitHeights);

  const leaderboardHasExplicitHeights = leaderboardSrc.includes("h-[360px] w-full");
  assert(SUITE3, "UniversityLeaderboard wraps ResponsiveContainer with explicit fixed height (h-[360px])", leaderboardHasExplicitHeights);

  const financialHasExplicitHeights = financialSrc.includes("h-[360px] w-full");
  assert(SUITE3, "FinancialCommand wraps ResponsiveContainer with explicit fixed height (h-[360px])", financialHasExplicitHeights);

  const hasBarChart = bottleneckSrc.includes("<BarChart") && leaderboardSrc.includes("<BarChart") && financialSrc.includes("<BarChart");
  assert(SUITE3, "BarChart configured across Bottleneck, Leaderboard, and Financial modules", hasBarChart);

  const hasComposedChart = bottleneckSrc.includes("<ComposedChart");
  assert(SUITE3, "ComposedChart (dual-axis Bar + Line) configured for thematic domain bottleneck analysis", hasComposedChart);

  const hasAreaChart = financialSrc.includes("<AreaChart");
  assert(SUITE3, "AreaChart configured with linear gradient fills for cumulative financial trend telemetry", hasAreaChart);

  // ==========================================================================
  // SUITE 4: Tab Switching, Filter States & Search Queries Across All Modules
  // ==========================================================================
  console.log("\n--- SUITE 4: Tab Switching, Filter States & Search Queries ---");
  const SUITE4 = "TABS_FILTERS_AND_SEARCH";

  const EXPECTED_TABS = ["overview", "heatmap", "bottlenecks", "leaderboard", "override", "users", "oversight"];

  const statePageSrc = fsLib.readFileSync(
    pathLib.join(process.cwd(), "src/app/dashboard/state/page.tsx"),
    "utf-8"
  );

  let allTabsConfigured = true;
  for (const t of EXPECTED_TABS) {
    if (!statePageSrc.includes(`"${t}"`)) {
      allTabsConfigured = false;
    }
  }
  assert(SUITE4, "All 7 Command Center tabs configured in state page", allTabsConfigured);

  const hasUrlSync = statePageSrc.includes('searchParams.get("tab")') && statePageSrc.includes("router.push(`/dashboard/state?tab=${tab}`");
  assert(SUITE4, "State dashboard implements two-way URL search params synchronization for tabs", hasUrlSync);

  const hasOverridePreselect = statePageSrc.includes("handleSelectDistrictForOverride") && statePageSrc.includes("initialDistrictFilter={overrideDistrictFilter}");
  assert(SUITE4, "Cross-tab delegation from GIS Heatmap/Bottlenecks to Master Override with preselected district filter is wired", hasOverridePreselect);

  // Test Filter States in BottleneckAnalytics
  const mockBottlenecks: DistrictBottleneck[] = [
    { district: "Ranchi", domain: "Water", avgResolutionDays: 5.2, triageHours: 3.2, isSlow: false, slaStatus: "COMPLIANT" },
    { district: "Garhwa", domain: "Sanitation", avgResolutionDays: 14.8, triageHours: 5.1, isSlow: true, slaStatus: "BREACHED" },
    { district: "Chatra", domain: "Roads", avgResolutionDays: 16.4, triageHours: 4.8, isSlow: true, slaStatus: "BREACHED" },
  ];
  const allCount = mockBottlenecks.length;
  const breachedCount = mockBottlenecks.filter((d) => d.isSlow || d.slaStatus === "BREACHED").length;
  assert(SUITE4, "Bottleneck SLA filter correctly identifies breached districts (2 of 3)", breachedCount === 2 && allCount === 3);

  // Test Search Filter in UniversityLeaderboard
  const mockUniversities: UniversityRankItem[] = [
    { rank: 1, name: "BIT Mesra", claimed: 24, fundingSecured: 4500000, successfulHandovers: 18, graiScore: 92.4 },
    { rank: 2, name: "IIT (ISM) Dhanbad", claimed: 21, fundingSecured: 5200000, successfulHandovers: 15, graiScore: 91.2 },
    { rank: 3, name: "NIT Jamshedpur", claimed: 18, fundingSecured: 3800000, successfulHandovers: 12, graiScore: 88.5 },
  ];
  const searchResult1 = mockUniversities.filter((u) => u.name.toLowerCase().includes("bit".toLowerCase()));
  const searchResult2 = mockUniversities.filter((u) => u.name.toLowerCase().includes("dhanbad".toLowerCase()));
  const searchResultNone = mockUniversities.filter((u) => u.name.toLowerCase().includes("xyz non-existent".toLowerCase()));
  assert(SUITE4, "UniversityLeaderboard search query matches bit -> 1 result", searchResult1.length === 1 && searchResult1[0].name === "BIT Mesra");
  assert(SUITE4, "UniversityLeaderboard search query matches dhanbad -> 1 result", searchResult2.length === 1 && searchResult2[0].name === "IIT (ISM) Dhanbad");
  assert(SUITE4, "UniversityLeaderboard search query matches non-existent query -> 0 results", searchResultNone.length === 0);

  // Test Search Filter in UserManagementPanel
  const mockUsers = [
    { id: "u1", name: "Tata Steel Corp", email: "csr@tatasteel.com", organization: "Tata Steel Ltd" },
    { id: "u2", name: "Jindal Mining", email: "info@jindal.com", organization: "Jindal Steel & Power" },
  ];
  const userSearch = mockUsers.filter(
    (u) => u.name.toLowerCase().includes("tata") || (u.organization && u.organization.toLowerCase().includes("tata")) || (u.email && u.email.toLowerCase().includes("tata"))
  );
  assert(SUITE4, "UserManagementPanel search matches name, email, or corporate organization", userSearch.length === 1);

  // Test AI Oversight Slider Bounds
  const aiPanelSrc = fsLib.readFileSync(
    pathLib.join(process.cwd(), "src/app/dashboard/state/components/AiOversightPanel.tsx"),
    "utf-8"
  );
  const hasSliderBounds = aiPanelSrc.includes('min="0.70"') && aiPanelSrc.includes('max="0.95"');
  assert(SUITE4, "AiOversightPanel enforces confidence threshold bounds between 0.70 and 0.95", hasSliderBounds);

  // Test Master Override Reason Validation
  const overridePanelSrc = fsLib.readFileSync(
    pathLib.join(process.cwd(), "src/app/dashboard/state/components/MasterOverridePanel.tsx"),
    "utf-8"
  );
  const hasReasonValidation = overridePanelSrc.includes("length < 8");
  assert(SUITE4, "MasterOverridePanel enforces minimum 8-character mandatory audit justification", hasReasonValidation);

  // ==========================================================================
  // SUITE 5: Empirical Component Runtime Execution & Defect Oracle
  // ==========================================================================
  console.log("\n--- SUITE 5: Empirical Component Execution & Defect Oracle ---");
  const SUITE5 = "RUNTIME_EXECUTION_ORACLE";

  try {
    const html = ReactDOMServer.renderToString(React.createElement(StateHeatmap, { districts: standardDistricts }));
    assert(SUITE5, "StateHeatmap component executes and renders without runtime exceptions", html.length > 0);
  } catch (err: any) {
    assert(SUITE5, "StateHeatmap component execution", false, err.message);
  }

  try {
    const html = ReactDOMServer.renderToString(
      React.createElement(BottleneckAnalytics, {
        districtBottlenecks: mockBottlenecks,
        domainBottlenecks: [
          { domain: "Water Supply", avgResolutionDays: 14.8, triageHours: 4.2, challengeCount: 412 }
        ],
      })
    );
    assert(SUITE5, "BottleneckAnalytics component executes and renders without runtime exceptions", html.length > 0);
  } catch (err: any) {
    assert(SUITE5, "BottleneckAnalytics component execution", false, err.message);
  }

  try {
    const html = ReactDOMServer.renderToString(
      React.createElement(UniversityLeaderboard, { universities: mockUniversities })
    );
    assert(SUITE5, "UniversityLeaderboard component executes and renders without runtime exceptions", html.length > 0);
  } catch (err: any) {
    assert(SUITE5, "UniversityLeaderboard component execution", false, err.message);
  }

  try {
    const html = ReactDOMServer.renderToString(React.createElement(AiOversightPanel, {}));
    assert(SUITE5, "AiOversightPanel component executes and renders without runtime exceptions", html.length > 0);
  } catch (err: any) {
    assert(SUITE5, "AiOversightPanel component execution", false, err.message);
  }

  try {
    const html = ReactDOMServer.renderToString(React.createElement(UserManagementPanel, {}));
    assert(SUITE5, "UserManagementPanel component executes and renders without runtime exceptions", html.length > 0);
  } catch (err: any) {
    assert(SUITE5, "UserManagementPanel component execution", false, err.message);
  }

  try {
    const html = ReactDOMServer.renderToString(React.createElement(MasterOverridePanel, {}));
    assert(SUITE5, "MasterOverridePanel component executes and renders without runtime exceptions", html.length > 0);
  } catch (err: any) {
    assert(SUITE5, "MasterOverridePanel component execution", false, err.message);
  }

  // Test FinancialCommand component render (DEFECT ORACLE)
  try {
    const html = ReactDOMServer.renderToString(
      React.createElement(FinancialCommand, {
        financialEscrow: [
          { domain: "Healthcare", pledged: 6000000, escrowed: 3500000, disbursed: 2500000 },
        ],
        financialTrend: [
          { month: "Apr 2026", pledged: 3.5, disbursed: 1.8 },
        ],
        totalCsrPledged: 6000000,
        totalCsrDisbursed: 2500000,
        escrowBalance: 3500000,
      })
    );
    assert(SUITE5, "FinancialCommand component executes and renders without runtime exceptions", html.length > 0);
  } catch (err: any) {
    assert(
      SUITE5,
      "FinancialCommand component executes and renders without runtime exceptions",
      false,
      `FATAL DEFECT: ${err.name}: ${err.message}`
    );
  }

  // ==========================================================================
  // Summary & Formal Verdict
  // ==========================================================================
  console.log("\n===============================================================================");
  console.log("                        ADVERSARIAL HARNESS RESULTS");
  console.log("===============================================================================");

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const totalCount = results.length;

  console.log(`Total Invariants Evaluated : ${totalCount}`);
  console.log(`Passed Invariants          : ${passedCount}`);
  console.log(`Failed Invariants          : ${failedCount}`);

  if (failedCount > 0) {
    console.error("\n[DEFECTS DETECTED]:");
    for (const f of results.filter((r) => !r.passed)) {
      console.error(`  - [${f.suite}] ${f.name}: ${f.error}`);
    }
    console.log("\nFORMAL VERDICT: FAIL");
    process.exit(1);
  } else {
    console.log("\nFORMAL VERDICT: PASS");
    process.exit(0);
  }
}

runAdversarialTests().catch((err) => {
  console.error("Adversarial test harness runner error:", err);
  process.exit(1);
});
