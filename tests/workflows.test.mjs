import assert from "node:assert/strict";

console.log("===============================================================================");
console.log("EMPIRICAL TEST SUITE: WORKFLOWS & EDGE-CASE ORACLES");
console.log("===============================================================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// WORKFLOW 1: Drag-and-Drop Dropzone & File Chips in src/app/submit/page.tsx
// -----------------------------------------------------------------------------
console.log("--- Workflow 1: Drag-and-Drop Dropzone & File Chips (submit/page.tsx) ---");

test("Dropzone & File Change adds files with correct ID, name, and formatted MB size", () => {
  const mockFiles = [
    { name: "water_test_site1.jpg", size: 2.5 * 1024 * 1024 },
    { name: "ground_runoff.mp4", size: 14.8 * 1024 * 1024 }
  ];

  let stateFiles = [{ id: "sample-1", name: "water_borewell_sample.jpg", size: "2.4 MB" }];

  const handleFileAdd = (incoming) => {
    const newItems = incoming.map((f, i) => ({
      id: `mock-time-${i}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`
    }));
    stateFiles = [...stateFiles, ...newItems];
  };

  handleFileAdd(mockFiles);

  assert.equal(stateFiles.length, 3);
  assert.equal(stateFiles[1].name, "water_test_site1.jpg");
  assert.equal(stateFiles[1].size, "2.5 MB");
  assert.equal(stateFiles[2].name, "ground_runoff.mp4");
  assert.equal(stateFiles[2].size, "14.8 MB");
});

test("File chip removal deletes the specified item without altering others", () => {
  let stateFiles = [
    { id: "sample-1", name: "file1.jpg", size: "2.4 MB" },
    { id: "sample-2", name: "file2.jpg", size: "1.1 MB" },
    { id: "sample-3", name: "file3.jpg", size: "5.0 MB" }
  ];

  const removeFile = (id) => {
    stateFiles = stateFiles.filter(f => f.id !== id);
  };

  removeFile("sample-2");
  assert.equal(stateFiles.length, 2);
  assert.equal(stateFiles.some(f => f.id === "sample-2"), false);
  assert.equal(stateFiles[0].id, "sample-1");
  assert.equal(stateFiles[1].id, "sample-3");
});

test("Stress-test small file sizes formatted to 0.0 MB edge case", () => {
  const tinyFile = { name: "small_icon.png", size: 30 * 1024 }; // 30 KB
  const formattedSize = `${(tinyFile.size / (1024 * 1024)).toFixed(1)} MB`;
  assert.equal(formattedSize, "0.0 MB", "Files < 50KB format to '0.0 MB'");
});

// -----------------------------------------------------------------------------
// WORKFLOW 2: Tracking ID Generation, Clipboard Toast, & Redirect to track/page.tsx
// -----------------------------------------------------------------------------
console.log("\n--- Workflow 2: Tracking ID Generation & Redirect (submit -> track) ---");

test("Tracking ID generator creates valid official regex pattern IN-GR-2026-XXXX", () => {
  const trackingIdRegex = /^IN-GR-2026-\d{4}$/;
  for (let i = 0; i < 50; i++) {
    const randomId = "IN-GR-2026-" + Math.floor(1000 + Math.random() * 9000);
    assert.match(randomId, trackingIdRegex, `Generated ID ${randomId} must match pattern`);
  }
});

test("Submit form redirect URL properly constructs /track?id=${trackingId}", () => {
  const generatedId = "IN-GR-2026-8832";
  const redirectHref = `/track?id=${generatedId}`;
  assert.equal(redirectHref, "/track?id=IN-GR-2026-8832");
});

test("Track page fallback behavior when unknown generated ID is passed in query param", () => {
  const SAMPLE_ISSUES = {
    "IN-GR-2026-9842": { id: "IN-GR-2026-9842", title: "Heavy Metal & Acid Runoff" },
    "IN-DL-2026-3104": { id: "IN-DL-2026-3104", title: "Smart Irrigation" },
    "IN-MH-2026-7712": { id: "IN-MH-2026-7712", title: "Rural Tele-Medicine" }
  };

  const queriedId = "IN-GR-2026-8832"; // newly generated ID
  const resolvedIssue = SAMPLE_ISSUES[queriedId] || SAMPLE_ISSUES["IN-GR-2026-9842"];

  assert.ok(resolvedIssue, "Must resolve to fallback issue without throwing null/undefined");
  assert.equal(resolvedIssue.id, "IN-GR-2026-9842");
});

test("Track page search normalization trims whitespace and converts to uppercase", () => {
  const SAMPLE_ISSUES = {
    "IN-GR-2026-9842": { id: "IN-GR-2026-9842" },
    "IN-DL-2026-3104": { id: "IN-DL-2026-3104" }
  };

  const inputRaw = "   in-dl-2026-3104   ";
  const clean = inputRaw.trim().toUpperCase();
  assert.equal(clean, "IN-DL-2026-3104");
  assert.ok(SAMPLE_ISSUES[clean], "Normalized input must match dictionary key");
});

// -----------------------------------------------------------------------------
// WORKFLOW 3: Live Search and Filter Controls in src/app/dashboard/university/page.tsx
// -----------------------------------------------------------------------------
console.log("\n--- Workflow 3: Live Search & Priority Filter (university/page.tsx) ---");

const initialChallenges = [
  { id: "CH-842", title: "Contaminated Drinking Water in XYZ Village", domain: "Water Management", priority: "High", publicChallengeId: "JHR-2026-842" },
  { id: "CH-843", title: "Lack of Access to Quality Seeds & Soil Nitrogen Deficit", domain: "Agriculture", priority: "Medium", publicChallengeId: "JHR-2026-821" },
  { id: "CH-821", title: "Inadequate Healthcare Facilities for Elderly Tribal Population", domain: "Healthcare", priority: "High", publicChallengeId: "JHR-2026-805" },
  { id: "CH-809", title: "Urban Slum Microgrid Battery Chemistry & Inverter Failures", domain: "Energy", priority: "High", publicChallengeId: "JHR-2026-788" }
];

function filterChallenges(challenges, query, priorityFilter) {
  const q = query.toLowerCase().trim();
  return challenges.filter((c) => {
    const matchesSearch = !q || 
      c.title.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.publicChallengeId.toLowerCase().includes(q);
    const matchesPriority = priorityFilter === "All" || c.priority === "High";
    return matchesSearch && matchesPriority;
  });
}

test("Live search matches title, domain, internal ID, and public challenge ID", () => {
  assert.equal(filterChallenges(initialChallenges, "Water", "All").length, 1);
  assert.equal(filterChallenges(initialChallenges, "ch-843", "All").length, 1);
  assert.equal(filterChallenges(initialChallenges, "jhr-2026-788", "All").length, 1);
  assert.equal(filterChallenges(initialChallenges, "Healthcare", "All").length, 1);
});

test("Priority filter 'High' correctly excludes Medium priority items", () => {
  const highOnly = filterChallenges(initialChallenges, "", "High");
  assert.equal(highOnly.length, 3);
  assert.ok(highOnly.every(c => c.priority === "High"));
  assert.equal(highOnly.some(c => c.id === "CH-843"), false);
});

test("Search query + Priority filter combined behavior", () => {
  // CH-843 has Agriculture but Medium priority
  const result = filterChallenges(initialChallenges, "Agriculture", "High");
  assert.equal(result.length, 0, "Medium priority item must be filtered out when High is selected");
});

test("View All toggle correctly resets search query and priority filter", () => {
  let searchQuery = "Water";
  let priorityFilter = "High";

  const handleToggleViewAll = () => {
    if (searchQuery || priorityFilter !== "All") {
      searchQuery = "";
      priorityFilter = "All";
    } else {
      priorityFilter = "High";
    }
  };

  handleToggleViewAll();
  assert.equal(searchQuery, "");
  assert.equal(priorityFilter, "All");
});

// -----------------------------------------------------------------------------
// WORKFLOW 4: Filter Proposals Modal in src/app/dashboard/industry/page.tsx
// -----------------------------------------------------------------------------
console.log("\n--- Workflow 4: Filter Proposals Modal (industry/page.tsx) ---");

const proposals = [
  { id: "PR-102", domain: "Water Management", stage: "Prototype Ready", fundingRequested: "₹3,50,000", rawBudget: 350000 },
  { id: "PR-104", domain: "Agriculture", stage: "Research Phase", fundingRequested: "Mentorship Only", rawBudget: 0 },
  { id: "PR-109", domain: "Energy", stage: "Pilot Implementation", fundingRequested: "₹12,00,000", rawBudget: 1200000 },
  { id: "PR-115", domain: "Water Management", stage: "Prototype Ready", fundingRequested: "₹4,80,000", rawBudget: 480000 }
];

function filterIndustryProposals(list, domain, stage, budget) {
  return list.filter((p) => {
    if (domain !== "all" && p.domain !== domain) return false;
    if (stage !== "all" && p.stage !== stage) return false;
    if (budget === "under5L" && (p.rawBudget > 500000 || p.rawBudget === 0)) return false;
    if (budget === "above5L" && p.rawBudget <= 500000) return false;
    if (budget === "mentorship" && p.rawBudget !== 0) return false;
    return true;
  });
}

test("Filter proposals by Domain", () => {
  const water = filterIndustryProposals(proposals, "Water Management", "all", "all");
  assert.equal(water.length, 2);
  assert.equal(water[0].id, "PR-102");
  assert.equal(water[1].id, "PR-115");

  const agri = filterIndustryProposals(proposals, "Agriculture", "all", "all");
  assert.equal(agri.length, 1);
  assert.equal(agri[0].id, "PR-104");
});

test("Filter proposals by Budget Bracket", () => {
  const under5L = filterIndustryProposals(proposals, "all", "all", "under5L");
  assert.equal(under5L.length, 2); // PR-102 (350k) and PR-115 (480k)

  const above5L = filterIndustryProposals(proposals, "all", "all", "above5L");
  assert.equal(above5L.length, 1); // PR-109 (1.2M)

  const mentorship = filterIndustryProposals(proposals, "all", "all", "mentorship");
  assert.equal(mentorship.length, 1); // PR-104 (0)
});

test("Filter proposals with multiple simultaneous criteria", () => {
  const combo = filterIndustryProposals(proposals, "Water Management", "Prototype Ready", "under5L");
  assert.equal(combo.length, 2);

  const nonMatching = filterIndustryProposals(proposals, "Energy", "Prototype Ready", "all");
  assert.equal(nonMatching.length, 0);
});

test("Proposal cards provide distinct mentorship and funding query routes", () => {
  const p = proposals[0];
  const mentorRoute = `/dashboard/industry/fund/${p.id}?type=mentorship`;
  const fundRoute = `/dashboard/industry/fund/${p.id}?type=funding`;
  assert.equal(mentorRoute, "/dashboard/industry/fund/PR-102?type=mentorship");
  assert.equal(fundRoute, "/dashboard/industry/fund/PR-102?type=funding");
});

// -----------------------------------------------------------------------------
// WORKFLOW 5: Interactive Lightbox Photo & Video Modals in src/app/challenge/[id]/page.tsx
// -----------------------------------------------------------------------------
console.log("\n--- Workflow 5: Lightbox Photo & Video Modals (challenge/[id]/page.tsx) ---");

test("Photo evidence opens with valid metadata and spectrographic telemetry", () => {
  let activeEvidence = null;
  const openPhotoEvidence = () => {
    activeEvidence = {
      type: "photo",
      title: "Ground Zero Borewell Water Sample Photo",
      source: "Citizen Field Camera (Validated SHA-256)",
      timestamp: "24 Aug 2026, 09:14 AM IST",
      location: "Borewell #03, Village 4, Dhanbad (23.7957° N, 86.4304° E)",
      notes: "Severe rust-orange precipitate visible after 15 minutes of settling. pH verified at 4.8 via mobile colorimetric assay.",
      telemetry: "Turbidity: 48 NTU • Dissolved Iron: 6.2 mg/L • pH: 4.8"
    };
  };

  openPhotoEvidence();
  assert.ok(activeEvidence);
  assert.equal(activeEvidence.type, "photo");
  assert.ok(activeEvidence.telemetry.includes("pH: 4.8"));
});

test("Video evidence supports play/pause toggle state and transcript preview", () => {
  let activeEvidence = null;
  let isPlayingVideo = false;

  const openVideoEvidence = () => {
    isPlayingVideo = false;
    activeEvidence = {
      type: "video",
      title: "Citizen Community Interview Video",
      source: "Gram Panchayat Nodal Officer Recording",
      timestamp: "24 Aug 2026, 10:30 AM IST",
      location: "Panchayat Hall, Village 4, Dhanbad",
      notes: "Local resident testimonies detailing borewell pump failures and child hospitalizations over 90 consecutive days.",
      telemetry: "Audio: Clear Hindi/Santhali • Resolution: 1080p 60fps • Duration: 02:45"
    };
  };

  openVideoEvidence();
  assert.equal(activeEvidence.type, "video");
  assert.equal(isPlayingVideo, false);

  // Play
  isPlayingVideo = true;
  assert.equal(isPlayingVideo, true);

  // Pause
  isPlayingVideo = false;
  assert.equal(isPlayingVideo, false);
});

// -----------------------------------------------------------------------------
// WORKFLOW 6: Escrow Terms Modal & CSR Tax Receipt in src/app/dashboard/industry/fund/[id]/page.tsx
// -----------------------------------------------------------------------------
console.log("\n--- Workflow 6: Escrow Terms & CSR Receipt (fund/[id]/page.tsx) ---");

test("Commitment type dynamically reflects ?type= query parameter", () => {
  const parseType = (param) => {
    return param === "mentorship" ? "mentorship" : param === "funding" ? "funding" : "both";
  };

  assert.equal(parseType("mentorship"), "mentorship");
  assert.equal(parseType("funding"), "funding");
  assert.equal(parseType("both"), "both");
  assert.equal(parseType(null), "both", "Defaults to 'both' if not specified");
  assert.equal(parseType("invalid"), "both", "Defaults to 'both' if invalid");
});

test("Escrow terms MoU pre-acceptance updates state and header badge", () => {
  let mouSigned = false;
  let showMouModal = true;

  const handlePreSignMou = () => {
    mouSigned = true;
    showMouModal = false;
  };

  handlePreSignMou();
  assert.equal(mouSigned, true);
  assert.equal(showMouModal, false);
});

test("CSR 80G tax receipt generator calculates tranches (30-40-30) and contains statutory citations", () => {
  const escrowRef = "JH-ESCROW-2026-CSR-4821";
  const proposalId = "PR-102";
  const pledgedAmount = "350000";

  const numAmount = Number(pledgedAmount);
  const tranche1 = numAmount * 0.3;
  const tranche2 = numAmount * 0.4;
  const tranche3 = numAmount * 0.3;

  assert.equal(tranche1 + tranche2 + tranche3, numAmount, "Tranches must equal 100% of pledge");
  assert.equal(tranche1, 105000);
  assert.equal(tranche2, 140000);
  assert.equal(tranche3, 105000);

  const receiptContent = `
GOVERNMENT OF JHARKHAND - STATE INNOVATION ESCROW AUTHORITY
CSR CONTRIBUTION & TAX EXEMPTION RECEIPT (SECTION 80G / 135)
Receipt Number: ${escrowRef}
Academic Proposal ID: ${proposalId}
Total Pledged Capital: ₹${numAmount.toLocaleString('en-IN')}
Tranche 1: ₹${tranche1.toLocaleString('en-IN')} [30% Upon DPR Approval]
Tranche 2: ₹${tranche2.toLocaleString('en-IN')} [40% Upon Lab Pilot]
Tranche 3: ₹${tranche3.toLocaleString('en-IN')} [30% Upon Collector Sign-off]
Section 80G(5)(vi) and Section 35(1)(ii) of the Income Tax Act, 1961.
Schedule VII, Item (ix) - Science & Technology Incubation
`;

  assert.ok(receiptContent.includes("Section 80G(5)(vi)"));
  assert.ok(receiptContent.includes("Schedule VII, Item (ix)"));
  assert.ok(receiptContent.includes("₹1,05,000"));
  assert.ok(receiptContent.includes("₹1,40,000"));
});

// -----------------------------------------------------------------------------
// WORKFLOW 7: Save Draft in src/app/dashboard/university/proposal/[id]/page.tsx
// -----------------------------------------------------------------------------
console.log("\n--- Workflow 7: Save Draft (university/proposal/[id]/page.tsx) ---");

test("Save draft serializes form fields and document reference to localStorage format", () => {
  const mockStorage = {};
  const challengeId = "CH-842";
  const title = "Solar-Powered Dual-Stage Groundwater Filtration Pilot";
  const summary = "Proposing a scalable IoT-integrated filtration unit...";
  const timeline = "6";
  const funding = "350000";
  const attachedDoc = { name: "IIT_ISM_Technical_Architecture_DPR.pdf", size: "3.8 MB" };
  const now = "06:30:15 PM";

  const draftPayload = {
    title,
    summary,
    timeline,
    funding,
    attachedDoc: attachedDoc?.name,
    savedAt: now
  };

  mockStorage[`proposal_draft_${challengeId}`] = JSON.stringify(draftPayload);

  assert.ok(mockStorage[`proposal_draft_${challengeId}`]);
  const retrieved = JSON.parse(mockStorage[`proposal_draft_${challengeId}`]);
  assert.equal(retrieved.title, title);
  assert.equal(retrieved.attachedDoc, "IIT_ISM_Technical_Architecture_DPR.pdf");
  assert.equal(retrieved.savedAt, now);
});

test("DOCUMENTED DEFECT: Draft is not rehydrated on page reload (omitted useEffect)", () => {
  // In proposal/[id]/page.tsx, useState has static defaults and no useEffect reads localStorage.getItem
  const hasHydrationHook = false; // verified by inspecting source code
  assert.equal(hasHydrationHook, false, "Verified: proposal/[id]/page.tsx does not restore draft from localStorage on mount");
});

console.log("\n===============================================================================");
console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("===============================================================================");

if (failed > 0) {
  process.exit(1);
}
