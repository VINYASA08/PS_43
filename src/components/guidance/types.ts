/**
 * JSICP 5-Layer Guidance Architecture — TypeScript Type Contracts
 * Authority: Department of Higher & Technical Education, Government of Jharkhand
 * Project: PRAGATI / JSICP (Problem Statement 26043)
 */

export type GuidanceRole = "citizen" | "university" | "industry" | "government" | "local_body";

// LocalStorage Persistence Keys
export const GUIDANCE_STORAGE_KEYS = {
  CITIZEN_ONBOARDED: "jsicp_citizen_onboarded",
  ONBOARDING_ROLE_PREFIX: "jsicp_onboarding_",
  CHECKLIST_UNIVERSITY: "jsicp_checklist_university",
  CHECKLIST_INDUSTRY: "jsicp_checklist_industry",
  CHECKLIST_GOV: "jsicp_checklist_gov",
  CHECKLIST_TRACK: "jsicp_checklist_track",
  CARD_COLLAPSED_PREFIX: "jsicp_card_collapsed_",
} as const;

// Layer 1: Onboarding Step Specification
export interface OnboardingStep {
  step: number;
  title: string;
  subtitle: string;
  badge?: string;
  content: string;
  copy?: string; // alias for compatibility
  bullets?: string[];
  notice?: string;
  iconName?: string;
}

export interface OnboardingRoleConfig {
  role: GuidanceRole;
  displayName: string;
  description: string;
  statutoryAuthority?: string;
  steps: OnboardingStep[];
}

// Layer 2: Tooltip Specification
export interface FormTooltipItem {
  id: string;
  field: "title" | "description" | "voice" | "photo" | "video" | "location" | "submit";
  title: string;
  content: string;
  constraints?: string;
}

// Layer 3: FAQ Specification
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  statutoryRef?: string;
  category: "General" | "IP & Legal" | "Escrow & Grants" | "SLA & Escalation" | "Privacy & Data";
  roles: GuidanceRole[];
}

// Layer 3: Visual Workflow Stage Specification
export interface WorkflowStage {
  stageNumber: number;
  title: string;
  badge?: string;
  actor: string;
  timeline: string;
  description: string;
  deliverable: string;
}

// Layer 5: Checklist Item Specification
export interface ChecklistItem {
  id: string;
  title: string;
  label?: string; // compatibility alias
  description: string;
  statutoryRef?: string;
  actionLabel?: string;
  actionText?: string; // compatibility alias
  actionHref?: string;
  actionModal?: "ip_rights" | "funding_tiers" | "what_happens";
  isCompleted?: boolean;
}

// Alias for DashboardChecklistItem
export type DashboardChecklistItem = ChecklistItem;

// Role metadata configuration
export interface RoleMetadata {
  id: GuidanceRole;
  label: string;
  department: string;
  statutoryRef: string;
  badgeColor: string;
}
