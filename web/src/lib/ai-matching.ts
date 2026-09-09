import { EMPANELLED_INSTITUTIONS, EmpanelledInstitution } from "./routing";
import { MatchedUniversity } from "./types";

// Canonical email directory for empanelled academic institutions in Jharkhand
const INSTITUTION_EMAILS: Record<string, string> = {
  "iit-ism-dhanbad-water": "pi.water@iitism.ac.in",
  "iit-ism-dhanbad-env": "env.chair@iitism.ac.in",
  "bau-ranchi": "pi.agri@bau.ac.in",
  "rims-bit-health": "director@rimsranchi.ac.in",
  "nit-jamshedpur-energy": "pi.energy@nitjsr.ac.in",
  "cuj-education": "cuj.health@cuj.ac.in",
  "bit-mesra-civil": "civil.chair@bitmesra.ac.in",
  "xiss-governance": "dean.xiss@xiss.ac.in",
  "xiss-livelihood": "pi.livelihood@xiss.ac.in",
  "nit-bit-waste": "waste.rnd@nitjsr.ac.in",
};

export interface ChallengeMatchInput {
  id?: string;
  title: string;
  description: string;
  domain: string;
  district?: string;
}

/**
 * AI 3-Way Matching Engine:
 * Scores empanelled Jharkhand institutions using domain affinity, keyword overlap,
 * and geographic district proximity, selecting the top 3 distinct candidate universities.
 */
export function matchUniversities(challenge: ChallengeMatchInput): MatchedUniversity[] {
  const domainLower = (challenge.domain || "").toLowerCase();
  const titleLower = (challenge.title || "").toLowerCase();
  const descLower = (challenge.description || "").toLowerCase();
  const fullText = `${titleLower} ${descLower}`;
  const district = challenge.district || "";

  // Scoring matrix
  const scoredInstitutions = Object.values(EMPANELLED_INSTITUTIONS).map((inst: EmpanelledInstitution) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Primary Domain Match (Weight: 40)
    if (
      (domainLower.includes("water") && inst.id.includes("water")) ||
      (domainLower.includes("agri") && inst.id.includes("bau")) ||
      (domainLower.includes("health") && inst.id.includes("health")) ||
      (domainLower.includes("energy") && inst.id.includes("energy")) ||
      (domainLower.includes("edu") && inst.id.includes("education")) ||
      (domainLower.includes("infra") && inst.id.includes("civil")) ||
      (domainLower.includes("waste") && inst.id.includes("waste"))
    ) {
      score += 40;
      reasons.push("Direct thematic domain alignment");
    } else if (
      (domainLower.includes("water") && inst.expertise.some(e => e.toLowerCase().includes("water") || e.toLowerCase().includes("drainage"))) ||
      (domainLower.includes("env") && inst.id.includes("env"))
    ) {
      score += 25;
      reasons.push("Secondary domain expertise");
    }

    // 2. Keyword Semantic Overlap (Weight: Up to 35)
    let keywordMatches = 0;
    for (const exp of inst.expertise) {
      const words = exp.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && fullText.includes(word)) {
          keywordMatches++;
        }
      }
    }
    const keywordScore = Math.min(35, keywordMatches * 7);
    score += keywordScore;
    if (keywordMatches > 0) {
      reasons.push(`Matched ${keywordMatches} technical expertise keywords`);
    }

    // 3. District Proximity (Weight: 25)
    if (district && inst.districtsCovered && inst.districtsCovered.some(d => d.toLowerCase() === district.toLowerCase())) {
      score += 25;
      reasons.push(`Designated regional nodal institution for ${district} district`);
    }

    // Baseline fallback score ensuring valid range
    const normalizedScore = Math.min(99, Math.max(72, Math.round(score)));

    return {
      inst,
      score: normalizedScore,
      rationale: reasons.join("; ") || "Empanelled state institution under STI convergence framework",
    };
  });

  // Sort descending by score
  scoredInstitutions.sort((a, b) => b.score - a.score);

  // Pick top 3 ensuring distinct institutional names where possible
  const selected: MatchedUniversity[] = [];
  const seenInstitutions = new Set<string>();

  for (const item of scoredInstitutions) {
    if (!seenInstitutions.has(item.inst.shortName)) {
      seenInstitutions.add(item.inst.shortName);
      selected.push({
        id: item.inst.id,
        name: item.inst.name,
        department: item.inst.department,
        email: INSTITUTION_EMAILS[item.inst.id] || `research@${item.inst.shortName.toLowerCase().replace(/[^a-z0-9]/g, "")}.ac.in`,
        matchScore: item.score,
        rationale: item.rationale,
      });
    }
    if (selected.length === 3) break;
  }

  // Fallback: if fewer than 3 unique institutions, backfill from remaining top scorers
  if (selected.length < 3) {
    for (const item of scoredInstitutions) {
      if (!selected.some(s => s.id === item.inst.id)) {
        selected.push({
          id: item.inst.id,
          name: item.inst.name,
          department: item.inst.department,
          email: INSTITUTION_EMAILS[item.inst.id] || `research@${item.inst.shortName.toLowerCase().replace(/[^a-z0-9]/g, "")}.ac.in`,
          matchScore: item.score,
          rationale: item.rationale,
        });
      }
      if (selected.length === 3) break;
    }
  }

  return selected;
}

/**
 * Simulated Claim Email Dispatcher:
 * Outputs mock email dispatches to the server console with challenge details and claim links.
 */
export function sendSimulatedClaimEmails(
  challenge: { id: string; title: string; publicTrackingId?: string },
  universities: MatchedUniversity[],
  baseUrl: string = "http://localhost:3000"
): void {
  console.log(`\n================================================================================`);
  console.log(`📧 [MOCK EMAIL DISPATCH] AI 3-WAY UNIVERSITY MATCH NOTIFICATION`);
  console.log(`   Challenge ID: ${challenge.id} | Tracking ID: ${challenge.publicTrackingId || "N/A"}`);
  console.log(`   Title: "${challenge.title}"`);
  console.log(`================================================================================`);

  universities.forEach((uni, index) => {
    const claimLink = `${baseUrl}/challenge/${challenge.id}`;
    console.log(`[Mock Email to ${uni.email}] You have been matched to Challenge "${challenge.title}". Claim link: ${claimLink}`);
    console.log(`   🏛️ Institution: ${uni.name} (${uni.department})`);
    console.log(`   🎯 Match Score: ${uni.matchScore}%`);
    console.log(`   ⚡ Notice: This challenge is open to 3 matched institutions. First to claim secures the project.`);
    if (index < universities.length - 1) {
      console.log(`   -----------------------------------------------------------------------------`);
    }
  });
  console.log(`================================================================================\n`);
}

// =============================================================================
// INDUSTRY PARTNER MATCHING (Feature 1: AI-to-Industry Matching)
// =============================================================================

export interface MatchedIndustry {
  id: string;
  name: string;
  csrDomain: string;
  email: string;
  matchScore: number;
  rationale: string;
}

interface IndustryPartner {
  id: string;
  name: string;
  shortName: string;
  csrDomain: string;
  email: string;
  expertise: string[];
}

const INDUSTRY_PARTNERS: IndustryPartner[] = [
  {
    id: "tata-steel-csr",
    name: "Tata Steel CSR Division",
    shortName: "Tata Steel",
    csrDomain: "Water Management & Environment",
    email: "csr.water@tatasteel.com",
    expertise: ["Water Purification", "Mine Reclamation", "Sanitation", "Environment", "Heavy Metal Treatment"],
  },
  {
    id: "coal-india-csr",
    name: "Coal India CSR Trust",
    shortName: "Coal India",
    csrDomain: "Healthcare & Rural Development",
    email: "csr.health@coalindia.in",
    expertise: ["Healthcare", "Telemedicine", "Rural Livelihoods", "Education", "Tribal Welfare"],
  },
  {
    id: "jspl-foundation",
    name: "JSPL Foundation (Jindal Steel)",
    shortName: "JSPL",
    csrDomain: "Education & Skill Development",
    email: "foundation@jspl.com",
    expertise: ["Education", "Skill Development", "Energy", "Women Empowerment", "Digital Literacy"],
  },
  {
    id: "adani-foundation",
    name: "Adani Foundation (Godda)",
    shortName: "Adani Foundation",
    csrDomain: "Agriculture & Infrastructure",
    email: "csr.jharkhand@adani.com",
    expertise: ["Agriculture", "Smart Irrigation", "Infrastructure", "Solar Energy", "Water Management"],
  },
  {
    id: "usha-martin-csr",
    name: "Usha Martin CSR (Ranchi)",
    shortName: "Usha Martin",
    csrDomain: "Livelihoods & Women Empowerment",
    email: "csr@ushamartin.com",
    expertise: ["Rural Livelihoods", "Micro Enterprise", "Women Empowerment", "Sanitation", "Education"],
  },
  {
    id: "tata-power-csr",
    name: "Tata Power (Jojobera) CSR",
    shortName: "Tata Power",
    csrDomain: "Energy & Clean Technology",
    email: "csr.jojobera@tatapower.com",
    expertise: ["Energy", "Clean Technology", "Solar Microgrids", "Environment", "Water Treatment"],
  },
];

/**
 * AI Industry Partner Matching Engine:
 * Scores industry partners based on CSR domain alignment with proposal characteristics.
 * Returns top 3 matched industry partners.
 */
export function matchIndustryPartners(proposal: {
  title: string;
  abstract: string;
  domain?: string;
  budget?: number;
}): MatchedIndustry[] {
  const titleLower = (proposal.title || "").toLowerCase();
  const abstractLower = (proposal.abstract || "").toLowerCase();
  const domainLower = (proposal.domain || "").toLowerCase();
  const fullText = `${titleLower} ${abstractLower} ${domainLower}`;

  const scored = INDUSTRY_PARTNERS.map((partner) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Primary CSR domain alignment (Weight: 40)
    const csrDomainLower = partner.csrDomain.toLowerCase();
    if (
      (domainLower.includes("water") && csrDomainLower.includes("water")) ||
      (domainLower.includes("health") && csrDomainLower.includes("health")) ||
      (domainLower.includes("agri") && csrDomainLower.includes("agri")) ||
      (domainLower.includes("energy") && csrDomainLower.includes("energy")) ||
      (domainLower.includes("edu") && csrDomainLower.includes("edu")) ||
      (domainLower.includes("infra") && csrDomainLower.includes("infra")) ||
      (domainLower.includes("sanitation") && csrDomainLower.includes("sanitation")) ||
      (domainLower.includes("environment") && csrDomainLower.includes("environment"))
    ) {
      score += 40;
      reasons.push("Direct CSR domain alignment");
    }

    // 2. Expertise keyword overlap (Weight: up to 35)
    let keywordMatches = 0;
    for (const exp of partner.expertise) {
      const words = exp.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && fullText.includes(word)) {
          keywordMatches++;
        }
      }
    }
    const keywordScore = Math.min(35, keywordMatches * 7);
    score += keywordScore;
    if (keywordMatches > 0) {
      reasons.push(`Matched ${keywordMatches} CSR expertise keywords`);
    }

    // 3. Budget tier alignment (Weight: 15)
    if (proposal.budget && proposal.budget > 0) {
      if (proposal.budget > 500000 && ["tata-steel-csr", "coal-india-csr", "adani-foundation"].includes(partner.id)) {
        score += 15;
        reasons.push("High-value CSR capability match");
      } else if (proposal.budget <= 500000) {
        score += 10;
        reasons.push("Budget-appropriate CSR partner");
      }
    }

    const normalizedScore = Math.min(99, Math.max(68, Math.round(score)));

    return {
      partner,
      score: normalizedScore,
      rationale: reasons.join("; ") || "Empanelled CSR partner under Section 135 convergence framework",
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected: MatchedIndustry[] = [];
  const seen = new Set<string>();

  for (const item of scored) {
    if (!seen.has(item.partner.id)) {
      seen.add(item.partner.id);
      selected.push({
        id: item.partner.id,
        name: item.partner.name,
        csrDomain: item.partner.csrDomain,
        email: item.partner.email,
        matchScore: item.score,
        rationale: item.rationale,
      });
    }
    if (selected.length === 3) break;
  }

  return selected;
}

/**
 * Simulated Industry Claim Email Dispatcher:
 * Outputs mock email dispatches to the server console with proposal details and claim links.
 */
export function sendSimulatedIndustryClaimEmails(
  proposal: { id: string; title: string; proposalRef?: string },
  industries: MatchedIndustry[],
  baseUrl: string = "http://localhost:3000"
): void {
  console.log(`\n================================================================================`);
  console.log(`📧 [MOCK EMAIL DISPATCH] AI 3-WAY INDUSTRY CSR MATCH NOTIFICATION`);
  console.log(`   Proposal ID: ${proposal.id} | Ref: ${proposal.proposalRef || "N/A"}`);
  console.log(`   Title: "${proposal.title}"`);
  console.log(`================================================================================`);

  industries.forEach((ind, index) => {
    const claimLink = `${baseUrl}/api/proposals/${proposal.id}/claim-industry`;
    console.log(`[Mock Email to ${ind.email}] You have been matched to Proposal "${proposal.title}". Claim link: ${claimLink}`);
    console.log(`   🏢 Company: ${ind.name} (${ind.csrDomain})`);
    console.log(`   🎯 Match Score: ${ind.matchScore}%`);
    console.log(`   ⚡ Notice: This proposal is open to 3 matched CSR partners. First to commit funding locks the proposal.`);
    if (index < industries.length - 1) {
      console.log(`   -----------------------------------------------------------------------------`);
    }
  });
  console.log(`================================================================================\n`);
}
