export type MapLayer = "density" | "csr" | "civic";

export type DepartmentFilterType = "All" | "Water" | "Roads" | "Energy" | "Urban";

export type PinType = "academic" | "corporate" | "bench_trial" | "amber_alert";

export interface DistrictData {
  id: string;
  name: string;
  division: string;
  // Center coordinates for map labels/pins on 800x600 canvas
  center: [number, number];
  // SVG polygon points or path data
  path: string;
  nodalOfficer: {
    name: string;
    designation: string;
    email: string;
    phone: string;
    dscVerified: boolean;
  };
  activeBuilds: number;
  csrDeployedCr: number;
  civicBacklogCount: number;
  complaintsLogged: number;
  complaintsResolved: number;
  resolutionSpeedHours: number;
  triageMunicipalPercent: number;
  triageAcademicPercent: number;
  departments: {
    water: number;
    roads: number;
    energy: number;
    urban: number;
  };
}

export interface GisMapPin {
  id: string;
  type: PinType;
  title: string;
  subtitle: string;
  district: string;
  x: number;
  y: number;
  department: DepartmentFilterType;
  details: {
    activeTeams?: number;
    labFacilities?: string[];
    deployedPoCs?: string[];
    pledgedCapitalCr?: number;
    activeMentors?: number;
    testingFacilitiesOpened?: string[];
    trlLevel?: number;
    benchParameters?: string;
    urgency?: "Critical" | "High" | "Medium";
    verifiedByDno?: string;
    seedGrantEligible?: boolean;
    seedGrantAmountCr?: number;
    problemDescription?: string;
  };
}

export interface IpQueueItem {
  id: string;
  projectName: string;
  hostUniversity: string;
  corporatePartner: string;
  status: "Bilateral DSC Verified" | "Pending";
  compliant: boolean;
  submittedDate: string;
  trl: number;
  hash: string;
  department: string;
  registered?: boolean;
  certificateId?: string;
}

export interface CivicProject {
  id: string;
  title: string;
  summary: string;
  district: string;
  department: DepartmentFilterType;
  university: string;
  leadPi: string;
  corporateSponsor: string;
  trl: number;
  trlStage: string;
  escrowFundingCr: number;
  status: "Bench Prototyping" | "Field Testing" | "Municipal Trial" | "Certified Commercial";
  lastAuditDate: string;
}

export interface IpRegistryItem {
  id: string;
  title: string;
  hostUniversity: string;
  ttoSignatory: string;
  corporateSponsor: string;
  corporateLegalOfficer: string;
  negotiatedSplit: string;
  uniSharePercent: number;
  corpSharePercent: number;
  hash: string;
  status: "Active License" | "Commercialized" | "Royalty Distributed" | "Registered & Locked";
  licenseType: string;
  royaltiesDistributedCr: number;
  registrationDate: string;
  patentNumber: string;
}

export interface DnoScorecard {
  districtId: string;
  districtName: string;
  officerName: string;
  designation: string;
  email: string;
  phone: string;
  dscActive: boolean;
  complaintsLogged: number;
  complaintsResolved: number;
  avgResolutionHours: number;
  municipalRoutingPct: number;
  academicRoutingPct: number;
  activeBuilds: number;
  status: "Active" | "Standby" | "Review Required";
}

export interface ReportConfig {
  id: string;
  title: string;
  recipient: string;
  frequency: string;
  description: string;
  metricsCovered: string[];
  lastGenerated: string;
}
