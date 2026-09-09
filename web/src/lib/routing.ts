/**
 * Academic Routing Engine for Jharkhand Societal Innovation Portal
 * Connects challenge domain and district to empanelled Jharkhand universities
 * and centers of excellence.
 */

export interface AcademicRoutingResult {
  instituteName: string;
  department: string;
  reason: string;
}

export interface EmpanelledInstitution {
  id: string;
  name: string;
  shortName: string;
  department: string;
  districtsCovered?: string[];
  expertise: string[];
}

export const EMPANELLED_INSTITUTIONS: Record<string, EmpanelledInstitution> = {
  IIT_ISM_DHANBAD_WATER: {
    id: "iit-ism-dhanbad-water",
    name: "IIT (ISM) Dhanbad",
    shortName: "IIT ISM",
    department: "Department of Environmental Science & Mining Engineering",
    districtsCovered: ["Dhanbad", "Bokaro", "Giridih", "Deoghar", "Dumka", "Jamtara", "Godda", "Sahebganj", "Pakur"],
    expertise: ["Acid Mine Drainage", "Groundwater Potability", "Heavy Metal Treatment", "Aquifer Recharge", "Water Purification Skids"],
  },
  IIT_ISM_DHANBAD_ENV: {
    id: "iit-ism-dhanbad-env",
    name: "IIT (ISM) Dhanbad",
    shortName: "IIT ISM",
    department: "Centre for Mining Environment",
    districtsCovered: ["Dhanbad", "Bokaro", "Ramgarh", "Hazaribagh", "Chatra"],
    expertise: ["Mine Reclamation", "Fly Ash Utilization", "Coal Pit Hazards", "Afforestation", "Air Quality Telemetry"],
  },
  BAU_RANCHI: {
    id: "bau-ranchi",
    name: "Birsa Agricultural University (BAU), Ranchi/Gumla",
    shortName: "BAU Ranchi",
    department: "Faculty of Agriculture & Agro-Forestry",
    districtsCovered: ["Ranchi", "Gumla", "Simdega", "Lohardaga", "Khunti", "Latehar", "Palamu", "Garhwa"],
    expertise: ["Soil NPK Deficit", "Drip Micro-irrigation", "Drought-Resistant Millets", "Agro-Forestry", "Crop Disease Diagnostics"],
  },
  RIMS_BIT_HEALTH: {
    id: "rims-bit-health",
    name: "Rajendra Institute of Medical Sciences (RIMS) Ranchi / BIT Mesra",
    shortName: "RIMS / BIT Mesra",
    department: "Department of Bioengineering",
    districtsCovered: ["Ranchi", "Simdega", "Khunti", "West Singhbhum", "Latehar", "Gumla", "Palamu"],
    expertise: ["Telemedicine Diagnostics", "Point-of-Care Testing", "Vector-borne Epidemiology", "Maternal Health Tech", "Nutritional Telemetry"],
  },
  NIT_JAMSHEDPUR_ENERGY: {
    id: "nit-jamshedpur-energy",
    name: "National Institute of Technology (NIT) Jamshedpur",
    shortName: "NIT Jamshedpur",
    department: "Department of Electrical & Clean Energy Engineering",
    districtsCovered: ["East Singhbhum", "West Singhbhum", "Seraikela Kharsawan", "Ranchi", "Bokaro", "Dhanbad"],
    expertise: ["Solar Microgrid Design", "Battery Energy Storage Systems", "Bi-directional Inverters", "Rural Electrification", "DC Nano-grids"],
  },
  CUJ_EDUCATION: {
    id: "cuj-education",
    name: "Central University of Jharkhand (CUJ), Brambe",
    shortName: "CUJ Brambe",
    department: "Department of Education & Humanities",
    districtsCovered: ["Ranchi", "Khunti", "Lohardaga", "Gumla", "Simdega", "Latehar", "Garhwa"],
    expertise: ["Tribal Vernacular Pedagogy", "Off-grid Digital Literacy Labs", "Regional Language Instruction", "Teacher Training"],
  },
  BIT_MESRA_CIVIL: {
    id: "bit-mesra-civil",
    name: "BIT Mesra, Ranchi",
    shortName: "BIT Mesra",
    department: "Department of Civil Engineering",
    districtsCovered: ["Ranchi", "Ramgarh", "Hazaribagh", "Koderma", "Khunti", "Bokaro"],
    expertise: ["Rural Road Soil Stabilization", "Drainage Culvert Engineering", "Bridge Structural Monitoring", "Sustainable Aggregates"],
  },
  XISS_GOVERNANCE: {
    id: "xiss-governance",
    name: "Xavier Institute of Social Service (XISS), Ranchi",
    shortName: "XISS Ranchi",
    department: "Department of Rural Management",
    districtsCovered: ["Ranchi", "Khunti", "Gumla", "Simdega", "West Singhbhum", "Latehar", "Dumka"],
    expertise: ["PDS Delivery Supply Audits", "Gram Panchayat Redressal", "Tribal Administrative Outreach", "DBT Verification"],
  },
  XISS_LIVELIHOOD: {
    id: "xiss-livelihood",
    name: "Xavier Institute of Social Service (XISS), Ranchi",
    shortName: "XISS Ranchi",
    department: "Department of Rural Management",
    districtsCovered: ["Ranchi", "Khunti", "Gumla", "Simdega", "West Singhbhum", "East Singhbhum", "Seraikela Kharsawan"],
    expertise: ["Lac Cultivation Value Chains", "Tussar Silk Marketing", "Minor Forest Produce Processing", "Women SHG Micro-enterprises"],
  },
  NIT_BIT_WASTE: {
    id: "nit-bit-waste",
    name: "NIT Jamshedpur / BIT Mesra",
    shortName: "NIT Jsr / BIT Mesra",
    department: "Department of Civil & Environmental Engineering",
    districtsCovered: ["East Singhbhum", "Ranchi", "Dhanbad", "Bokaro", "Ramgarh"],
    expertise: ["Industrial Solid Waste Recycling", "Bio-methanation of Civic Sludge", "Mining Slag Repurposing", "Effluent Bioremediation"],
  },
};

/**
 * Normalizes user-submitted or AI-detected domain text into canonical keys
 */
export function normalizeDomainKey(domain: string): string {
  const d = domain.trim().toUpperCase().replace(/[\s&/_-]+/g, "_");

  if (d.includes("WATER") || d.includes("AQUIFER") || d.includes("BOREWELL")) {
    return "WATER_SANITATION";
  }
  if (d.includes("AGRICULTUR") || d.includes("FARM") || d.includes("CROP") || d.includes("SOIL")) {
    return "AGRICULTURE";
  }
  if (d.includes("HEALTH") || d.includes("MEDICAL") || d.includes("DISEASE") || d.includes("TELEMEDICINE")) {
    return "HEALTHCARE";
  }
  if (d.includes("ENERGY") || d.includes("SOLAR") || d.includes("POWER") || d.includes("ELECTRIC") || d.includes("MICROGRID")) {
    return "ENERGY";
  }
  if (d.includes("EDUCAT") || d.includes("SCHOOL") || d.includes("LITERACY") || d.includes("STUDENT")) {
    return "EDUCATION";
  }
  if (d.includes("ROAD") || d.includes("BRIDGE") || d.includes("CULVERT") || d.includes("INFRASTRUCT")) {
    return "INFRASTRUCTURE";
  }
  if (d.includes("MINING") || d.includes("RECLAMATION") || d.includes("FOREST") || d.includes("ENVIRON")) {
    return "ENVIRONMENT";
  }
  if (d.includes("GOVERN") || d.includes("PUBLIC_SERVICE") || d.includes("PDS") || d.includes("CIVIC")) {
    return "GOVERNANCE";
  }
  if (d.includes("LIVELIHOOD") || d.includes("SHG") || d.includes("TRIBAL") || d.includes("FOREST_PRODUCE")) {
    return "LIVELIHOOD";
  }
  if (d.includes("WASTE") || d.includes("GARBAGE") || d.includes("SEWAGE") || d.includes("SANITAT")) {
    return "WASTE_MANAGEMENT";
  }

  return "GOVERNANCE";
}

/**
 * Maps challenge domain and optional district to empanelled Jharkhand institutions
 * @param domain Societal problem domain (e.g. "Water Management", "WATER_SANITATION", "Agriculture")
 * @param district Optional Jharkhand district for geographic proximity weighting
 */
export function routeChallengeToInstitute(
  domain: string,
  district?: string
): AcademicRoutingResult {
  const normalizedDomain = normalizeDomainKey(domain);
  const normalizedDistrict = district?.trim() || "";

  switch (normalizedDomain) {
    case "WATER_SANITATION": {
      const inst = EMPANELLED_INSTITUTIONS.IIT_ISM_DHANBAD_WATER;
      const districtNote = normalizedDistrict
        ? ` with dedicated field telemetry deployment in ${normalizedDistrict} district.`
        : ".";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `IIT (ISM) Dhanbad holds premier institutional expertise in water contamination, mine drainage remediation, and aquifer filtration${districtNote}`,
      };
    }

    case "AGRICULTURE": {
      const inst = EMPANELLED_INSTITUTIONS.BAU_RANCHI;
      const station = normalizedDistrict.toLowerCase() === "gumla"
        ? " Gumla Zonal Agricultural Research Station"
        : " Ranchi Kanke Headquarters";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `Birsa Agricultural University possesses specialized research infrastructure for soil telemetry, drought mitigation, and tribal crop resilience via its${station}.`,
      };
    }

    case "HEALTHCARE": {
      const inst = EMPANELLED_INSTITUTIONS.RIMS_BIT_HEALTH;
      const districtNote = normalizedDistrict
        ? ` prioritized for rural outreach in ${normalizedDistrict}.`
        : ".";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `RIMS Ranchi and BIT Mesra collaborate on translational biomedical engineering, point-of-care rural diagnostics, and epidemiological interventions${districtNote}`,
      };
    }

    case "ENERGY": {
      const inst = EMPANELLED_INSTITUTIONS.NIT_JAMSHEDPUR_ENERGY;
      const districtNote = normalizedDistrict
        ? ` covering the ${normalizedDistrict} regional grid sector.`
        : ".";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `NIT Jamshedpur features advanced laboratory facilities in renewable microgrid integration, battery storage systems, and bi-directional inverters${districtNote}`,
      };
    }

    case "EDUCATION": {
      const inst = EMPANELLED_INSTITUTIONS.CUJ_EDUCATION;
      const districtNote = normalizedDistrict
        ? ` customized for KGBV schools and tribal communities in ${normalizedDistrict}.`
        : ".";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `Central University of Jharkhand leads state initiatives in vernacular pedagogy, tribal education development, and off-grid digital literacy frameworks${districtNote}`,
      };
    }

    case "INFRASTRUCTURE": {
      const inst = EMPANELLED_INSTITUTIONS.BIT_MESRA_CIVIL;
      const districtNote = normalizedDistrict
        ? ` targeting civil connectivity challenges across ${normalizedDistrict}.`
        : ".";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `BIT Mesra Civil Engineering provides specialized expertise in rural road stabilization, bridge structural dynamics, and sustainable culvert construction${districtNote}`,
      };
    }

    case "ENVIRONMENT": {
      const inst = EMPANELLED_INSTITUTIONS.IIT_ISM_DHANBAD_ENV;
      const districtNote = normalizedDistrict
        ? ` for mining environmental remediation in ${normalizedDistrict}.`
        : ".";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `IIT (ISM) Dhanbad Centre for Mining Environment is the state lead for open-cast pit reclamation, fly-ash repurposing, and air-soil pollution mitigation${districtNote}`,
      };
    }

    case "GOVERNANCE": {
      const inst = EMPANELLED_INSTITUTIONS.XISS_GOVERNANCE;
      const districtNote = normalizedDistrict
        ? ` addressing grievance and delivery bottlenecks in ${normalizedDistrict}.`
        : ".";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `XISS Ranchi specializes in institutional governance, public distribution delivery audits, and tribal participatory grassroots administration${districtNote}`,
      };
    }

    case "LIVELIHOOD": {
      const inst = EMPANELLED_INSTITUTIONS.XISS_LIVELIHOOD;
      const districtNote = normalizedDistrict
        ? ` supporting women SHGs and forest gatherers in ${normalizedDistrict}.`
        : ".";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `XISS Ranchi has proven field immersion models for minor forest produce value-addition, lac and tussar silk value-chains, and rural micro-enterprises${districtNote}`,
      };
    }

    case "WASTE_MANAGEMENT": {
      const inst = EMPANELLED_INSTITUTIONS.NIT_BIT_WASTE;
      const districtNote = normalizedDistrict
        ? ` for industrial and civic waste treatment in ${normalizedDistrict}.`
        : ".";
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `NIT Jamshedpur and BIT Mesra host joint research tracks in municipal solid waste processing, bio-methanation, and industrial effluent recycling${districtNote}`,
      };
    }

    default: {
      const inst = EMPANELLED_INSTITUTIONS.XISS_GOVERNANCE;
      return {
        instituteName: inst.name,
        department: inst.department,
        reason: `Routed to Xavier Institute of Social Service (XISS) for multi-sectoral rural management assessment and state innovation triage.`,
      };
    }
  }
}

// -----------------------------------------------------------------------------
// TRACK B: STATE LINE DEPARTMENTS DIRECTORY (STANDARD PUBLIC WORKS & UTILITIES)
// -----------------------------------------------------------------------------

export interface StateLineDepartment {
  id: string;
  name: string;
  shortName: string;
  department: string;
  nodalDivision: string;
  applicableDomains: string[];
  procurementWorkflow: string;
  statutorySlaDays: number;
}

export const STATE_LINE_DEPARTMENTS: Record<string, StateLineDepartment> = {
  JUVNL_ENERGY: {
    id: "juvnl-energy",
    name: "Jharkhand Urja Vikas Nigam Limited (JUVNL / JBVNL)",
    shortName: "JUVNL",
    department: "Department of Energy, Govt of Jharkhand",
    nodalDivision: "Rural/Urban Electricity Supply Division",
    applicableDomains: ["Energy", "ENERGY"],
    procurementWorkflow: "Standard Schedule of Rates (SoR) transformer replacement & 11kV/415V feeder tender",
    statutorySlaDays: 21,
  },
  DWSD_WATER: {
    id: "dwsd-water",
    name: "Drinking Water & Sanitation Department (DWSD)",
    shortName: "DWSD",
    department: "Public Health Engineering Department, Govt of Jharkhand",
    nodalDivision: "Mechanical & Public Health Engineering Wing",
    applicableDomains: ["Water Management", "WATER_SANITATION", "Sanitation"],
    procurementWorkflow: "Deep-well submersible pump replacement, booster station overhaul & pipeline DPR",
    statutorySlaDays: 14,
  },
  RCD_INFRASTRUCTURE: {
    id: "rcd-roads",
    name: "Road Construction Department (RCD) / Rural Development (RDD)",
    shortName: "RCD / RDD",
    department: "State PWD & Rural Works Department, Govt of Jharkhand",
    nodalDivision: "PMGSY Project Implementation Unit (PIU) / State Highway Division",
    applicableDomains: ["Urban Infrastructure", "INFRASTRUCTURE"],
    procurementWorkflow: "Structural culvert, causeway & arterial road rebuilding e-procurement tender",
    statutorySlaDays: 30,
  },
  HEALTH_DEPARTMENT: {
    id: "health-dept",
    name: "Dept of Health, Medical Education & Family Welfare",
    shortName: "Health Dept",
    department: "Health & Family Welfare, Govt of Jharkhand",
    nodalDivision: "District Civil Surgeon & Health Infrastructure Cell",
    applicableDomains: ["Healthcare", "HEALTHCARE"],
    procurementWorkflow: "PHC/CHC building repair, cold-chain maintenance & medical equipment AMC requisition",
    statutorySlaDays: 21,
  },
  WRD_IRRIGATION: {
    id: "wrd-irrigation",
    name: "Water Resources Department (WRD)",
    shortName: "WRD",
    department: "Minor Irrigation & Water Resources, Govt of Jharkhand",
    nodalDivision: "Minor Irrigation & Dam Safety Division",
    applicableDomains: ["Agriculture", "AGRICULTURE", "Water Management", "WATER_SANITATION"],
    procurementWorkflow: "Canal breach desiltation, check dam & sluice gate repair sanction",
    statutorySlaDays: 28,
  },
  DSEL_EDUCATION: {
    id: "dsel-education",
    name: "Dept of School Education & Literacy (DSE&L) / JEPC",
    shortName: "DSE&L / JEPC",
    department: "School Education & Literacy, Govt of Jharkhand",
    nodalDivision: "Jharkhand Education Project Council Civil Infrastructure Wing",
    applicableDomains: ["Education", "EDUCATION"],
    procurementWorkflow: "School building roof waterproofing, boundary wall & classroom infrastructure tender",
    statutorySlaDays: 30,
  },
  FOOD_CONSUMER_AFFAIRS: {
    id: "food-pds",
    name: "Food, Public Distribution & Consumer Affairs Dept",
    shortName: "Food & PDS Dept",
    department: "Food & Civil Supplies, Govt of Jharkhand",
    nodalDivision: "District Supply Office (DSO) & ePDS Technical Cell",
    applicableDomains: ["Public Service Delivery", "GOVERNANCE", "Rural Livelihoods", "LIVELIHOOD"],
    procurementWorkflow: "Electronic POS weighing scale replacement & network connectivity tender",
    statutorySlaDays: 14,
  },
};

// -----------------------------------------------------------------------------
// TRACK C: LOCAL CIVIC BODIES & MUNICIPAL CORPORATIONS DIRECTORY
// -----------------------------------------------------------------------------

export interface LocalCivicBody {
  id: string;
  name: string;
  shortName: string;
  district: string;
  type: "MUNICIPAL_CORPORATION" | "NOTIFIED_AREA_COMMITTEE" | "NAGAR_PARISHAD" | "GRAM_PANCHAYAT";
  targetWing: string;
  rapidSlaHours: number;
}

export const LOCAL_CIVIC_BODIES: Record<string, LocalCivicBody> = {
  RMC_RANCHI: {
    id: "rmc-ranchi",
    name: "Ranchi Municipal Corporation (RMC)",
    shortName: "RMC",
    district: "Ranchi",
    type: "MUNICIPAL_CORPORATION",
    targetWing: "Sanitation, Drain Clearing & Quick Response Team (QRT)",
    rapidSlaHours: 48,
  },
  DMC_DHANBAD: {
    id: "dmc-dhanbad",
    name: "Dhanbad Municipal Corporation (DMC)",
    shortName: "DMC",
    district: "Dhanbad",
    type: "MUNICIPAL_CORPORATION",
    targetWing: "Civic Works & Solid Waste Management Cell",
    rapidSlaHours: 48,
  },
  JNAC_JAMSHEDPUR: {
    id: "jnac-jamshedpur",
    name: "Jamshedpur Notified Area Committee (JNAC) / Mango MC",
    shortName: "JNAC",
    district: "East Singhbhum",
    type: "NOTIFIED_AREA_COMMITTEE",
    targetWing: "Municipal Maintenance & Rapid Sanitation Wing",
    rapidSlaHours: 48,
  },
  CHAS_MC_BOKARO: {
    id: "chas-mc-bokaro",
    name: "Chas Municipal Corporation / BS City Admin",
    shortName: "Chas MC",
    district: "Bokaro",
    type: "MUNICIPAL_CORPORATION",
    targetWing: "Public Health & Streetlight Maintenance Unit",
    rapidSlaHours: 48,
  },
  DEOGHAR_MC: {
    id: "deoghar-mc",
    name: "Deoghar Municipal Corporation",
    shortName: "Deoghar MC",
    district: "Deoghar",
    type: "MUNICIPAL_CORPORATION",
    targetWing: "City Sanitation & Stormwater Drainage Cell",
    rapidSlaHours: 48,
  },
  GENERIC_RURAL_PANCHAYAT: {
    id: "gram-panchayat-rural",
    name: "Block Development Officer (BDO) & Gram Panchayat Maintenance Cell",
    shortName: "BDO / Gram Panchayat",
    district: "All Rural",
    type: "GRAM_PANCHAYAT",
    targetWing: "Mukhiya & Panchayat Secretary Field Maintenance Cell",
    rapidSlaHours: 72,
  },
};

// -----------------------------------------------------------------------------
// UNIFIED 3-TRACK ROUTING DISPATCHER
// -----------------------------------------------------------------------------

export interface TrackRoutingResult {
  track: string;
  routingTarget: string;
  departmentOrWing: string;
  targetEntityLevel: string;
  reason: string;
  slaDays: number;
}

/**
 * Authoritative router for the 3-Track Problem Triage System:
 * - TRACK_A_INNOVATION: Empanelled Universities & Research Centers
 * - TRACK_B_STANDARD: State Government Line Departments (Public Works / Utilities)
 * - TRACK_C_CIVIC: Urban Local Bodies (ULBs) & Gram Panchayats
 */
export function routeProblemByTrack(
  track: string,
  domain: string,
  district?: string,
  location?: string
): TrackRoutingResult {
  const normTrack = track ? track.trim().toUpperCase() : "TRACK_A_INNOVATION";
  const normDistrict = district?.trim() || "";
  const normLocation = location?.trim().toLowerCase() || "";
  const distLower = normDistrict.toLowerCase();

  // 1. TRACK C: CIVIC HAZARDS & RAPID MUNICIPAL MAINTENANCE
  if (normTrack === "TRACK_C_CIVIC") {
    let civicBody: LocalCivicBody | null = null;

    if (distLower.includes("ranchi") || normLocation.includes("ranchi") || normLocation.includes("harmu")) {
      civicBody = LOCAL_CIVIC_BODIES.RMC_RANCHI;
    } else if (distLower.includes("dhanbad") || normLocation.includes("dhanbad") || normLocation.includes("jharia")) {
      civicBody = LOCAL_CIVIC_BODIES.DMC_DHANBAD;
    } else if (distLower.includes("east singhbhum") || distLower.includes("jamshedpur") || normLocation.includes("jamshedpur") || normLocation.includes("mango")) {
      civicBody = LOCAL_CIVIC_BODIES.JNAC_JAMSHEDPUR;
    } else if (distLower.includes("bokaro") || normLocation.includes("chas") || normLocation.includes("bokaro")) {
      civicBody = LOCAL_CIVIC_BODIES.CHAS_MC_BOKARO;
    } else if (distLower.includes("deoghar") || normLocation.includes("deoghar")) {
      civicBody = LOCAL_CIVIC_BODIES.DEOGHAR_MC;
    }

    if (civicBody) {
      return {
        track: "TRACK_C_CIVIC",
        routingTarget: civicBody.name,
        departmentOrWing: civicBody.targetWing,
        targetEntityLevel: "MUNICIPAL_ULB",
        reason: `Dispatched to ${civicBody.name} (${civicBody.targetWing}) for rapid municipal remediation within ${civicBody.rapidSlaHours} hours.`,
        slaDays: Math.ceil(civicBody.rapidSlaHours / 24),
      };
    }

    // Check if urban or ward-based
    if (normLocation.includes("ward") || normLocation.includes("nagar") || normLocation.includes("colony") || normLocation.includes("sector")) {
      const ulbName = normDistrict ? `${normDistrict} Nagar Parishad / Municipal Council` : "District Urban Local Body (ULB)";
      return {
        track: "TRACK_C_CIVIC",
        routingTarget: ulbName,
        departmentOrWing: "Sanitation & Civic Works Wing",
        targetEntityLevel: "MUNICIPAL_ULB",
        reason: `Dispatched to ${ulbName} for rapid municipal sanitation and maintenance resolution (SLA: 48-72h).`,
        slaDays: 2,
      };
    }

    // Rural Gram Panchayat / BDO
    const ruralBody = LOCAL_CIVIC_BODIES.GENERIC_RURAL_PANCHAYAT;
    const ruralTarget = normDistrict ? `${normDistrict} Block Development Officer (BDO) & Gram Panchayat` : ruralBody.name;
    return {
      track: "TRACK_C_CIVIC",
      routingTarget: ruralTarget,
      departmentOrWing: ruralBody.targetWing,
      targetEntityLevel: "GRAM_PANCHAYAT",
      reason: `Routed to ${ruralTarget} for immediate village-level maintenance and physical inspection (SLA: 72h).`,
      slaDays: 3,
    };
  }

  // 2. TRACK B: STANDARD PUBLIC WORKS & LINE DEPARTMENTS
  if (normTrack === "TRACK_B_STANDARD") {
    const normDomKey = normalizeDomainKey(domain);
    let dept: StateLineDepartment;

    switch (normDomKey) {
      case "ENERGY":
        dept = STATE_LINE_DEPARTMENTS.JUVNL_ENERGY;
        break;
      case "WATER_SANITATION":
      case "WASTE_MANAGEMENT":
        dept = STATE_LINE_DEPARTMENTS.DWSD_WATER;
        break;
      case "INFRASTRUCTURE":
        dept = STATE_LINE_DEPARTMENTS.RCD_INFRASTRUCTURE;
        break;
      case "HEALTHCARE":
        dept = STATE_LINE_DEPARTMENTS.HEALTH_DEPARTMENT;
        break;
      case "AGRICULTURE":
        dept = STATE_LINE_DEPARTMENTS.WRD_IRRIGATION;
        break;
      case "EDUCATION":
        dept = STATE_LINE_DEPARTMENTS.DSEL_EDUCATION;
        break;
      case "GOVERNANCE":
      case "LIVELIHOOD":
        dept = STATE_LINE_DEPARTMENTS.FOOD_CONSUMER_AFFAIRS;
        break;
      default:
        dept = STATE_LINE_DEPARTMENTS.RCD_INFRASTRUCTURE;
    }

    return {
      track: "TRACK_B_STANDARD",
      routingTarget: dept.name,
      departmentOrWing: dept.nodalDivision,
      targetEntityLevel: "STATE_DEPARTMENT",
      reason: `Assigned to ${dept.name} (${dept.nodalDivision}) for standard departmental execution via: ${dept.procurementWorkflow}.`,
      slaDays: dept.statutorySlaDays,
    };
  }

  // 3. TRACK A: INNOVATION, APPLIED R&D & UNIVERSITY INCUBATION (DEFAULT)
  const academic = routeChallengeToInstitute(domain, district);
  return {
    track: "TRACK_A_INNOVATION",
    routingTarget: academic.instituteName,
    departmentOrWing: academic.department,
    targetEntityLevel: "ACADEMIC_RESEARCH",
    reason: academic.reason,
    slaDays: 60,
  };
}
