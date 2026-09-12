import { z } from "zod";

// -----------------------------------------------------------------------------
// AUTH SCHEMAS
// -----------------------------------------------------------------------------

export const loginEmailSchema = z.object({
  email: z.string().email("Invalid email address").min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
  totpCode: z.string().optional(),
});

export const loginPhoneSchema = z.object({
  phone: z.string().regex(/^\+91\d{10}$/, "Invalid Indian phone number (format: +91XXXXXXXXXX)"),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
});

export const signupCitizenSchema = z.object({
  phone: z.string().regex(/^\+91\d{10}$/, "Invalid Indian phone number (format: +91XXXXXXXXXX)"),
  name: z.string().min(2, "Name is required").max(100),
  district: z.string().min(2, "District is required").max(100),
});

export const signupUniversitySchema = z.object({
  email: z.string().email().refine(
    (email) => email.endsWith(".ac.in"),
    "University email must end with .ac.in"
  ),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  name: z.string().min(2).max(100),
  organization: z.string().min(2, "University name is required").max(200),
  designation: z.string().min(2).max(200).optional(),
  district: z.string().min(2).max(100).optional(),
});

export const signupIndustrySchema = z.object({
  email: z.string().email("Invalid corporate email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  name: z.string().min(2).max(100),
  organization: z.string().min(2, "Company name is required").max(200),
  designation: z.string().min(2).max(200).optional(),
  district: z.string().min(2).max(100).optional(),
});

export const signupGovSchema = z.object({
  email: z.string().email().refine(
    (email) => email.endsWith(".gov.in") || email.endsWith(".nic.in"),
    "Government email must end with .gov.in or .nic.in"
  ),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  name: z.string().min(2).max(100),
  organization: z.string().min(2).max(200),
  designation: z.string().min(2).max(200).optional(),
  district: z.string().min(2).max(100).optional(),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(3, "Identifier (phone or email) is required"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  purpose: z.enum(["login", "register"]).default("login"),
});

export const totpVerifySchema = z.object({
  code: z.string().length(6, "TOTP code must be 6 digits"),
  tempToken: z.string().optional(),
});

export const adminApproveUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(500).optional(),
});

// -----------------------------------------------------------------------------
// CHALLENGE SCHEMAS
// -----------------------------------------------------------------------------

export const validDomains = [
  "Water Management", "Agriculture", "Healthcare", "Education",
  "Urban Infrastructure", "Environment", "Energy", "Sanitation",
  "Rural Livelihoods", "Public Service Delivery",
] as const;

export const validUrgency = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

export const validTracks = [
  "TRACK_A_INNOVATION",
  "TRACK_B_STANDARD",
  "TRACK_C_CIVIC",
] as const;

export const validEntityLevels = [
  "ACADEMIC_RESEARCH",
  "STATE_DEPARTMENT",
  "MUNICIPAL_ULB",
  "GRAM_PANCHAYAT",
] as const;

export const validChallengeStatus = [
  "REPORTED", "CITIZEN_VERIFIED", "UNDER_REVIEW", "OPEN_FOR_PROPOSALS",
  "IN_PROGRESS", "RESOLVED", "CLOSED"
] as const;

export const createChallengeSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  domain: z.string().refine(
    (d) => (validDomains as readonly string[]).includes(d),
    "Invalid domain"
  ),
  district: z.string().min(2).max(100),
  location: z.string().min(2, "Location/block/village is required").max(200),
  urgency: z.enum(validUrgency).default("MEDIUM"),
  track: z.enum(validTracks).optional(),
  trackRouting: z.string().optional(),
  triageReasoning: z.string().optional(),
  targetEntityLevel: z.enum(validEntityLevels).optional(),
  evidence: z.string().optional(),
  assignedInstitute: z.string().optional(),
});

export const updateChallengeSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  urgency: z.enum(validUrgency).optional(),
  status: z.enum(validChallengeStatus).optional(),
  track: z.enum(validTracks).optional(),
  trackRouting: z.string().optional(),
  triageReasoning: z.string().optional(),
  targetEntityLevel: z.enum(validEntityLevels).optional(),
  assignedToId: z.string().nullable().optional(),
  assignedInstitute: z.string().nullable().optional(),
  escalationLevel: z.number().int().min(0).max(3).optional(),
  slaDeadline: z.string().datetime().nullable().optional(),
  citizenVerified: z.boolean().optional(),
});

// -----------------------------------------------------------------------------
// PROPOSAL SCHEMAS
// -----------------------------------------------------------------------------

export const validProposalStatus = [
  "DRAFT", "SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "APPROVED", "REJECTED", "FUNDED"
] as const;

export const createProposalSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),
  title: z.string().min(5).max(200),
  abstract: z.string().min(20).max(5000),
  methodology: z.string().min(20).max(10000),
  budget: z.number().min(0).max(100_000_000),
  timelineMonths: z.number().int().min(1).max(60).default(6),
  universityName: z.string().min(2).max(200),
  stage: z.string().default("Prototype Ready"),
  attachedDocs: z.string().optional(),
});

export const updateProposalSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  abstract: z.string().min(20).max(5000).optional(),
  methodology: z.string().min(20).max(10000).optional(),
  budget: z.number().min(0).max(100_000_000).optional(),
  timelineMonths: z.number().int().min(1).max(60).optional(),
  stage: z.string().optional(),
  status: z.enum(validProposalStatus).optional(),
  attachedDocs: z.string().optional(),
});

// -----------------------------------------------------------------------------
// FUNDING COMMITMENT SCHEMAS
// -----------------------------------------------------------------------------

export const validFundingStatus = [
  "PLEDGED", "ESCROWED", "DISBURSED", "COMPLETED", "CANCELLED"
] as const;

export const validFundingType = [
  "CSR", "GRANT", "EQUITY", "MENTORSHIP_ONLY"
] as const;

export const createFundingCommitmentSchema = z.object({
  proposalId: z.string().min(1, "Proposal ID is required"),
  corporateName: z.string().min(2, "Corporate name is required").max(200),
  amount: z.number().min(1000, "Minimum commitment is ₹1,000"),
  type: z.enum(validFundingType).default("CSR"),
  panNumber: z.string().optional(),
  csrRegistrationNo: z.string().optional(),
  notes: z.string().max(2000).optional(),
  tranches: z.string().optional(),
  mouSigned: z.boolean().default(false),
});

export const updateFundingCommitmentSchema = z.object({
  status: z.enum(validFundingStatus).optional(),
  amount: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
  tranches: z.string().optional(),
  mouSigned: z.boolean().optional(),
});

// -----------------------------------------------------------------------------
// USER PROFILE UPDATE SCHEMA
// -----------------------------------------------------------------------------

export const userProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  organization: z.string().max(200).optional(),
  designation: z.string().max(200).optional(),
  district: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().regex(/^\+91\d{10}$/).optional(),
});

// -----------------------------------------------------------------------------
// NODAL OFFICER TRIAGE & CLAIM SCHEMAS
// -----------------------------------------------------------------------------

export const validNodalStatus = [
  "pending",
  "rejected",
  "diverted_to_gov",
  "routed_to_academia",
] as const;

export const nodalTriageSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),
  action: z.enum(["reject", "divert_to_gov", "route_to_academia"]),
  rejectionReason: z.string().min(5, "Rejection reason must be at least 5 characters").optional(),
  divertedTarget: z.string().min(2, "Government target body must be specified").optional(),
  nodalOfficerId: z.string().optional(),
});

export const claimChallengeSchema = z.object({
  universityId: z.string().min(1, "University ID is required"),
  universityName: z.string().min(2, "University Name is required"),
});

