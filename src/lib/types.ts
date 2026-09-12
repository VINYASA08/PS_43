// Centralized Domain Types & Enums for Jharkhand Smart Study and Innovation Portal

export enum UserRole {
  STATE_ADMIN = "STATE_ADMIN",
  GOV = "GOV",
  UNIVERSITY = "UNIVERSITY",
  INDUSTRY = "INDUSTRY",
  CITIZEN = "CITIZEN",
  EXPERT = "EXPERT",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  LOCKED = "LOCKED",
  SUSPENDED = "SUSPENDED",
}

export enum ChallengeStatus {
  REPORTED = "REPORTED",
  CITIZEN_VERIFIED = "CITIZEN_VERIFIED",
  UNDER_REVIEW = "UNDER_REVIEW",
  OPEN_FOR_PROPOSALS = "OPEN_FOR_PROPOSALS",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum UrgencyLevel {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum TriageTrack {
  TRACK_A_INNOVATION = "TRACK_A_INNOVATION",
  TRACK_B_STANDARD = "TRACK_B_STANDARD",
  TRACK_C_CIVIC = "TRACK_C_CIVIC",
}

export enum TargetEntityLevel {
  ACADEMIC_RESEARCH = "ACADEMIC_RESEARCH",
  STATE_DEPARTMENT = "STATE_DEPARTMENT",
  MUNICIPAL_ULB = "MUNICIPAL_ULB",
  GRAM_PANCHAYAT = "GRAM_PANCHAYAT",
}

export enum ProposalStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  SHORTLISTED = "SHORTLISTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FUNDED = "FUNDED",
}

export enum FundingType {
  CSR = "CSR",
  GRANT = "GRANT",
  EQUITY = "EQUITY",
  MENTORSHIP_ONLY = "MENTORSHIP_ONLY",
}

export enum FundingStatus {
  PLEDGED = "PLEDGED",
  ESCROWED = "ESCROWED",
  DISBURSED = "DISBURSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface SessionUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  role: UserRole;
  tier?: string | null;
  status: UserStatus;
  organization?: string | null;
  designation?: string | null;
  district?: string | null;
}

export enum NodalTriageStatus {
  PENDING = "pending",
  REJECTED = "rejected",
  DIVERTED_TO_GOV = "diverted_to_gov",
  ROUTED_TO_ACADEMIA = "routed_to_academia",
}

export enum NodalTriageAction {
  REJECT = "reject",
  DIVERT_TO_GOV = "divert_to_gov",
  ROUTE_TO_ACADEMIA = "route_to_academia",
}

export interface MatchedUniversity {
  id: string;
  name: string;
  department: string;
  email: string;
  matchScore: number;
  rationale?: string;
}

