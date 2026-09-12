/**
 * Constants for Jharkhand State Societal Innovation Portal
 * Milestone 1: Citizen Intake & Evidence Hardening
 */

/**
 * The 24 statutory administrative districts of Jharkhand State.
 */
export const JHARKHAND_DISTRICTS = [
  "Bokaro",
  "Chatra",
  "Deoghar",
  "Dhanbad",
  "Dumka",
  "East Singhbhum",
  "Garhwa",
  "Giridih",
  "Godda",
  "Gumla",
  "Hazaribagh",
  "Jamtara",
  "Khunti",
  "Koderma",
  "Latehar",
  "Lohardaga",
  "Pakur",
  "Palamu",
  "Ramgarh",
  "Ranchi",
  "Sahebganj",
  "Saraikela Kharsawan",
  "Simdega",
  "West Singhbhum",
] as const;

export type JharkhandDistrict = (typeof JHARKHAND_DISTRICTS)[number];

export interface PriorityDomainInfo {
  key: string;
  value: string;
  label: string;
  description: string;
}

/**
 * 10 canonical priority domains matching the validation schema with human-readable labels.
 */
export const PRIORITY_DOMAINS = [
  {
    key: "WATER_SANITATION",
    value: "Water Management",
    label: "Water & Sanitation",
    description: "Drinking water quality, groundwater contamination, and water management.",
  },
  {
    key: "HEALTHCARE",
    value: "Healthcare",
    label: "Healthcare",
    description: "Rural health facilities, emergency telemedicine, and public healthcare.",
  },
  {
    key: "AGRICULTURE",
    value: "Agriculture",
    label: "Agriculture",
    description: "Soil health, micro-irrigation, seed quality, and agricultural technology.",
  },
  {
    key: "EDUCATION",
    value: "Education",
    label: "Education",
    description: "Digital literacy, school infrastructure, vocational training, and STEM access.",
  },
  {
    key: "ENERGY",
    value: "Energy",
    label: "Energy",
    description: "Clean power, rural microgrids, solar electrification, and energy systems.",
  },
  {
    key: "INFRASTRUCTURE",
    value: "Urban Infrastructure",
    label: "Infrastructure",
    description: "Road networks, bridges, civic facilities, and urban-rural connectivity.",
  },
  {
    key: "ENVIRONMENT",
    value: "Environment",
    label: "Environment",
    description: "Forest preservation, industrial pollution, mine reclamation, and ecology.",
  },
  {
    key: "GOVERNANCE",
    value: "Public Service Delivery",
    label: "Governance",
    description: "Public service delivery, grievance redressal, transparency, and civil welfare.",
  },
  {
    key: "LIVELIHOOD",
    value: "Rural Livelihoods",
    label: "Livelihood",
    description: "Tribal crafts, cottage industry, rural enterprise, and employment generation.",
  },
  {
    key: "WASTE_MANAGEMENT",
    value: "Sanitation",
    label: "Waste Management",
    description: "Solid waste management, drainage sanitation, and circular waste recycling.",
  },
] as const;

export type PriorityDomainKey = (typeof PRIORITY_DOMAINS)[number]["key"];

/**
 * Key-to-label mapping for canonical priority domains.
 */
export const DOMAIN_LABELS: Record<string, string> = {
  WATER_SANITATION: "Water & Sanitation",
  HEALTHCARE: "Healthcare",
  AGRICULTURE: "Agriculture",
  EDUCATION: "Education",
  ENERGY: "Energy",
  INFRASTRUCTURE: "Infrastructure",
  ENVIRONMENT: "Environment",
  GOVERNANCE: "Governance",
  LIVELIHOOD: "Livelihood",
  WASTE_MANAGEMENT: "Waste Management",
};

/**
 * Mapping from canonical domain key to validation schema value.
 */
export const DOMAIN_KEY_TO_SCHEMA: Record<string, string> = {
  WATER_SANITATION: "Water Management",
  HEALTHCARE: "Healthcare",
  AGRICULTURE: "Agriculture",
  EDUCATION: "Education",
  ENERGY: "Energy",
  INFRASTRUCTURE: "Urban Infrastructure",
  ENVIRONMENT: "Environment",
  GOVERNANCE: "Public Service Delivery",
  LIVELIHOOD: "Rural Livelihoods",
  WASTE_MANAGEMENT: "Sanitation",
};

/**
 * Mapping from validation schema value to canonical domain key.
 */
export const SCHEMA_TO_DOMAIN_KEY: Record<string, string> = {
  "Water Management": "WATER_SANITATION",
  "Healthcare": "HEALTHCARE",
  "Agriculture": "AGRICULTURE",
  "Education": "EDUCATION",
  "Energy": "ENERGY",
  "Urban Infrastructure": "INFRASTRUCTURE",
  "Environment": "ENVIRONMENT",
  "Public Service Delivery": "GOVERNANCE",
  "Rural Livelihoods": "LIVELIHOOD",
  "Sanitation": "WASTE_MANAGEMENT",
};
