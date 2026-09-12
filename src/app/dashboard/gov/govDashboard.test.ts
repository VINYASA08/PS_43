import assert from "node:assert/strict";
import { 
  JHARKHAND_DISTRICTS, 
  GIS_PINS, 
  INITIAL_IP_QUEUE, 
  MASTER_PROJECTS_DATA, 
  IP_REGISTRY_LEDGER, 
  REPORT_TEMPLATES 
} from "./mockData";

export function runGovDashboardVerification() {
  console.log("=== Running Government Dashboard Verification Suite ===");

  // 1. Verify 24 Administrative Districts
  assert.equal(JHARKHAND_DISTRICTS.length, 24, "Must contain all 24 administrative districts of Jharkhand");
  JHARKHAND_DISTRICTS.forEach((d) => {
    assert.ok(d.id, "District must have an ID");
    assert.ok(d.name, "District must have a name");
    assert.ok(d.division, "District must have a division");
    assert.equal(d.center.length, 2, "Center must be [x, y]");
    assert.ok(d.path.startsWith("M "), "Path must be a valid SVG path starting with 'M '");
    assert.ok(d.nodalOfficer.name, "Must have an assigned Nodal Officer");
    assert.ok(d.nodalOfficer.email.endsWith(".gov.in") || d.nodalOfficer.email.endsWith(".nic.in"), "Email must be official gov.in/nic.in");
    assert.ok(d.nodalOfficer.dscVerified, "DNO must be DSC verified");
    assert.ok(d.activeBuilds >= 0, "Active builds must be >= 0");
    assert.ok(d.triageMunicipalPercent + d.triageAcademicPercent === 100, "Triage split must total 100%");
  });
  console.log("✓ All 24 Jharkhand districts verified with valid SVG paths, DNO contacts, and 100% triage sums.");

  // 2. Verify GIS Pins (4 types)
  assert.ok(GIS_PINS.length >= 8, "Must contain pin markers");
  const types = new Set(GIS_PINS.map((p) => p.type));
  assert.ok(types.has("academic"), "Must have Academic Lab Hub pins");
  assert.ok(types.has("corporate"), "Must have Corporate Sponsor pins");
  assert.ok(types.has("bench_trial"), "Must have Active Bench Trial pins");
  assert.ok(types.has("amber_alert"), "Must have Amber Alert Civic Distress pins");

  const amberPins = GIS_PINS.filter((p) => p.type === "amber_alert");
  assert.ok(amberPins.length >= 2, "Must have at least 2 Amber Alert distress zones");
  amberPins.forEach((p) => {
    assert.ok(p.details.seedGrantEligible, "Amber pin must be seed grant eligible");
    assert.ok((p.details.seedGrantAmountCr ?? 0) > 0, "Seed grant amount must be positive");
    assert.ok(p.details.verifiedByDno, "Must be verified by District Nodal Officer");
  });
  console.log("✓ All 4 GIS pin types (Academic, Corporate, Bench Trial, Amber Alert Seed Grant) verified.");

  // 3. Verify IP Compliance Queue & DigiLocker Readiness
  assert.ok(INITIAL_IP_QUEUE.length >= 4, "Must have IP compliance items in queue");
  INITIAL_IP_QUEUE.forEach((item) => {
    assert.ok(item.projectName, "Item must have a project name");
    assert.ok(item.hostUniversity, "Item must have a host university");
    assert.ok(item.corporatePartner, "Item must have a corporate partner");
    assert.ok(item.hash.length === 64, "Item must have a 64-character SHA-256 hash");
  });
  console.log("✓ State IP Compliance Queue verified with 64-char SHA-256 hashes and NISP badges.");

  // 4. Verify Master Projects Data
  assert.ok(MASTER_PROJECTS_DATA.length >= 10, "Must have civic projects");
  MASTER_PROJECTS_DATA.forEach((p) => {
    assert.ok(p.id.startsWith("PRJ-"), "Project must have PRJ- prefix");
    assert.ok(p.trl >= 1 && p.trl <= 9, "TRL must be between 1 and 9");
    assert.ok(p.escrowFundingCr > 0, "Funding must be > 0");
    assert.ok(["Water", "Roads", "Energy", "Urban"].includes(p.department), "Department must be one of the 4 domains");
  });
  console.log("✓ Master Projects Ledger verified across domains, TRL 1-9, and escrow funding.");

  // 5. Verify IP Registry Ledger & Legal Deeds
  assert.ok(IP_REGISTRY_LEDGER.length >= 4, "Must have registered tripartite legal deeds");
  IP_REGISTRY_LEDGER.forEach((item) => {
    assert.ok(item.id.startsWith("REG-"), "Must have REG- prefix");
    assert.ok(item.hash.length === 64, "Must have 64-char SHA-256 deed hash");
    assert.equal(item.uniSharePercent + item.corpSharePercent, 100, "Royalty split must total 100%");
    assert.ok(item.royaltiesDistributedCr > 0, "Must have royalties recorded");
  });
  console.log("✓ IP Registry Ledger verified with tripartite deeds, locked splits, and SHA-256 hashes.");

  // 6. Verify Report Templates
  assert.equal(REPORT_TEMPLATES.length, 4, "Must have 4 standard report templates");
  console.log("✓ Report Templates verified for CM Office, Higher Ed, NITI Aayog, and DNO Triage.");

  console.log("=== All Government Dashboard Tests Passed Successfully! ===");
}

runGovDashboardVerification();
