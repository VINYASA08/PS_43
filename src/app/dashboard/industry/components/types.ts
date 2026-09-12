export type ActiveTab = "home" | "escrow" | "teams" | "tasks" | "trl" | "settings";

export interface Project {
  id: string;
  title: string;
  institution: string;
  department: string;
  domain: string;
  trl: number;
  trlProgress: number; // e.g. 70
  sponsor: string;
  totalPledged: number; // e.g. 350000
  disbursed: number; // e.g. 145000
  escrowLocked: number; // e.g. 205000
  currentMilestone: string;
  description: string;
}

export type TrancheStatus = "DISBURSED" | "LOCKED_IN_ESCROW" | "PENDING_VERIFICATION";

export interface EscrowTranche {
  id: string;
  trancheNumber: number;
  title: string;
  amount: number;
  totalAllocation: number;
  status: TrancheStatus;
  condition: string;
  disbursedDate?: string;
  approvedBy?: string;
  receiptsCount: number;
}

export interface BomReceipt {
  id: string;
  itemName: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  invoiceNumber: string;
  status: "VERIFIED" | "PENDING_AUDIT";
  specifications: string;
}

export interface ResearcherPublication {
  title: string;
  journal: string;
  year: number;
}

export interface LabResearcher {
  id: string;
  name: string;
  role: string;
  department: string;
  institution: string;
  degrees: string[];
  avatar: string;
  publicationsCount: number;
  publications: ResearcherPublication[];
  skills: string[];
  flaggedForHiring: boolean;
  email: string;
  currentSubsystem: string;
}

export type KanbanColumn = "TODO" | "IN_LAB_TESTING" | "AWAITING_MENTOR_REVIEW" | "COMPLETED";
export type TaskPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  column: KanbanColumn;
  priority: TaskPriority;
  assignee: {
    name: string;
    avatar: string;
    role: string;
  };
  milestone: string;
  dueDate: string;
  tags: string[];
}

export interface TrlAuditEntry {
  id: string;
  timestamp: string;
  type: "SCHEMATIC" | "FIRMWARE" | "TEST_LOG" | "TRL_GATE";
  title: string;
  description: string;
  author: string;
  commitSha?: string;
  trlStage?: number;
  metrics?: { name: string; value: string; pass: boolean }[];
  status: "VERIFIED" | "REVISION_REQUESTED" | "PASSED";
}

export interface TrlStageCriteria {
  stage: number;
  title: string;
  shortDesc: string;
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
  checklist: { item: string; completed: boolean }[];
}

export interface OfficeHourSlot {
  id: string;
  day: string;
  dateNumber: number; // e.g. 11, 15, 17
  startTime: string;
  endTime: string;
  recurring: boolean;
  type: "Office Hours" | "Milestone Review" | "Lab Demonstration";
  attendees: string[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderRole: string;
  senderAvatar: string;
  isMentor: boolean;
  content: string;
  timestamp: string;
  attachment?: { name: string; size: string };
}

export interface CircuitAnnotation {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  component: string;
  text: string;
  author: string;
  timestamp: string;
  resolved: boolean;
}

export interface TestPoint {
  id: string;
  nodeNumber: number;
  label: string;
  voltage: number;
  targetVoltage: number;
  tolerance: string;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  waveform: number[];
}

export interface RubricScores {
  technicalFeasibility: number; // 0-100
  componentDurability: number; // 0-100
  costEfficiency: number; // 0-100
}
