"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { StatsSkeleton } from "@/components/ui/Skeletons";
import { CheckCircle2, AlertTriangle, Scale, Coins } from "lucide-react";
import { useGuidanceStore } from "@/components/guidance/store";

import { 
  ActiveTab, 
  Project, 
  EscrowTranche, 
  BomReceipt, 
  LabResearcher, 
  KanbanTask, 
  KanbanColumn,
  TrlStageCriteria, 
  TrlAuditEntry, 
  OfficeHourSlot, 
  ChatMessage, 
  CircuitAnnotation, 
  TestPoint, 
  RubricScores 
} from "./components/types";

import {
  mockProjects,
  mockEscrowTranches,
  mockBomReceipts,
  mockResearchers,
  mockKanbanTasks,
  mockTrlStages,
  mockTrlAuditLog,
  mockOfficeHours,
  mockChatMessages,
  mockCircuitAnnotations,
  mockTestPoints,
  defaultExpertiseTags
} from "./components/mockData";

import { IndustryNavbar } from "./components/IndustryNavbar";
import { IndustryHomeView } from "./components/IndustryHomeView";
import { IndustryEscrowView } from "./components/IndustryEscrowView";
import { IndustryTeamsView } from "./components/IndustryTeamsView";
import { IndustryKanbanView } from "./components/IndustryKanbanView";
import { IndustryTrlView } from "./components/IndustryTrlView";
import { IndustrySettingsView } from "./components/IndustrySettingsView";
import { MilestoneReviewModal } from "./components/MilestoneReviewModal";
import { BilateralIpModal } from "./components/BilateralIpModal";
import { LogoutConfirmModal } from "./components/LogoutConfirmModal";
import { IndustryChecklistCard } from "@/components/guidance/Layer5_DashboardChecklists/IndustryChecklistCard";

function IndustryDashboardContent() {
  const router = useRouter();
  const { isLoading: isAuthLoading, logout } = useAuthStore();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");

  // Domain Datasets State
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project>(mockProjects[0]);
  const [tranches, setTranches] = useState<EscrowTranche[]>(mockEscrowTranches);
  const [bomReceipts] = useState<BomReceipt[]>(mockBomReceipts);
  const [researchers, setResearchers] = useState<LabResearcher[]>(mockResearchers);
  const [tasks, setTasks] = useState<KanbanTask[]>(mockKanbanTasks);
  const [stages, setStages] = useState<TrlStageCriteria[]>(mockTrlStages);
  const [auditLogs, setAuditLogs] = useState<TrlAuditEntry[]>(mockTrlAuditLog);
  const [officeHours, setOfficeHours] = useState<OfficeHourSlot[]>(mockOfficeHours);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [annotations, setAnnotations] = useState<CircuitAnnotation[]>(mockCircuitAnnotations);
  const [testPoints] = useState<TestPoint[]>(mockTestPoints);
  const [expertiseTags, setExpertiseTags] = useState<string[]>(defaultExpertiseTags);

  // Modals Visibility State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Global Toast State
  const [bannerNotice, setBannerNotice] = useState<{ message: string; type: "success" | "warning" } | null>(null);

  const showNotification = (message: string, type: "success" | "warning" = "success") => {
    setBannerNotice({ message, type });
    setTimeout(() => setBannerNotice(null), 4500);
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <StatsSkeleton count={3} />
      </div>
    );
  }

  // --- Handlers ---

  const handleSendMessage = (content: string, attachmentName?: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "Senior Technical Mentor",
      senderRole: "Tata Steel Industry Sponsor",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      isMentor: true,
      content,
      timestamp: "Just now",
      attachment: attachmentName ? { name: attachmentName, size: "1.2 MB" } : undefined
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Simulated lab response after short delay
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: "Dr. Ananya Mukherjee",
        senderRole: "Faculty Guide / PI",
        senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        isMentor: false,
        content: `Acknowledged Senior Mentor: "${content.slice(0, 40)}...". Our laboratory team has received this directive and is integrating the updates into the test bench.`,
        timestamp: "Just now"
      };
      setChatMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  const handleSendMessageToResearcher = (researcherName: string, message: string) => {
    handleSendMessage(`[Direct to ${researcherName}]: ${message}`);
  };

  const handleQuickApprove = () => {
    // Release Tranche 2
    setTranches((prev) =>
      prev.map((t) =>
        t.id === "tranche-2"
          ? {
              ...t,
              status: "DISBURSED",
              disbursedDate: "2026-09-09",
              approvedBy: "Senior Technical Mentor (Tata Steel)",
            }
          : t
      )
    );

    // Update project financials & progress
    setSelectedProject((prev) => ({
      ...prev,
      disbursed: prev.disbursed + 100000,
      escrowLocked: Math.max(0, prev.escrowLocked - 100000),
      trlProgress: 85,
      currentMilestone: "Milestone 2 Approved (Escrow Tranche 2 Released)"
    }));

    // Add audit entry
    const newAudit: TrlAuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: "2026-09-09 20:05",
      type: "TRL_GATE",
      title: "TRL-5 Quick Sign-Off: Milestone 2 Approved & Tranche 2 Disbursed",
      description: "Mentor evaluated CAD schematic v2.2 and thermal camera footage. Approved ₹1,00,000 disbursement from CSR escrow account.",
      author: "Senior Technical Mentor",
      trlStage: 5,
      status: "PASSED"
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showNotification("Milestone 2 approved! ₹1,00,000 released from corporate escrow to BIT Mesra lab.", "success");
  };

  const handleQuickReject = () => {
    setSelectedProject((prev) => ({
      ...prev,
      currentMilestone: "Milestone 2 Revisions Requested (Funding Paused)"
    }));

    const newAudit: TrlAuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: "2026-09-09 20:05",
      type: "TRL_GATE",
      title: "Revision Requested: LM2596 Thermal Dissipation Flaw Flagged",
      description: "Mentor requested additional copper thermal vias underneath regulator and ripple reduction on Node 2.",
      author: "Senior Technical Mentor",
      trlStage: 5,
      status: "REVISION_REQUESTED"
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showNotification("Revision notice sent to Dr. Ananya Mukherjee. Escrow tranche remains locked.", "warning");
  };

  const handleAuthorizeTranche = (trancheId: string) => {
    setTranches((prev) =>
      prev.map((t) => {
        if (t.id === trancheId) {
          return {
            ...t,
            status: "DISBURSED",
            disbursedDate: "2026-09-09",
            approvedBy: "Senior Technical Mentor (Tata Steel)",
          };
        }
        return t;
      })
    );

    setSelectedProject((prev) => ({
      ...prev,
      disbursed: prev.disbursed + 100000,
      escrowLocked: Math.max(0, prev.escrowLocked - 100000),
      trlProgress: 85
    }));

    showNotification("Escrow Tranche 2 (₹1,00,000) successfully authorized and disbursed.", "success");
  };

  const handleAuthorizeEscrowFromModal = (rubric: RubricScores, notes: string) => {
    handleAuthorizeTranche("tranche-2");

    // Advance TRL stage
    setStages((prev) =>
      prev.map((s) => {
        if (s.stage === 5) {
          return {
            ...s,
            status: "COMPLETED",
            checklist: s.checklist.map((c) => ({ ...c, completed: true }))
          };
        }
        if (s.stage === 6) {
          return { ...s, status: "CURRENT" };
        }
        return s;
      })
    );

    const newAudit: TrlAuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: "2026-09-09 20:10",
      type: "TRL_GATE",
      title: "Milestone 2 Formal Sign-Off with Dynamic Rubric Scoring",
      description: `Evaluation: Feasibility ${rubric.technicalFeasibility}%, Durability ${rubric.componentDurability}%, Cost ${rubric.costEfficiency}%. Notes: ${notes.slice(0, 80)}...`,
      author: "Senior Technical Mentor",
      trlStage: 5,
      metrics: [
        { name: "Feasibility Score", value: `${rubric.technicalFeasibility}%`, pass: true },
        { name: "Durability Score", value: `${rubric.componentDurability}%`, pass: true },
        { name: "Cost Efficiency", value: `${rubric.costEfficiency}%`, pass: true }
      ],
      status: "PASSED"
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showNotification("Milestone 2 approved via Review Desk! TRL-5 signed off and Tranche 2 released.", "success");
  };

  const handleRequestRevisionsFromModal = (notes: string) => {
    handleQuickReject();
    handleSendMessage(`[Formal Revision Directive]: ${notes}`);
  };

  const handleToggleTalentFlag = (researcherId: string) => {
    setResearchers((prev) =>
      prev.map((r) => {
        if (r.id === researcherId) {
          const nextVal = !r.flaggedForHiring;
          showNotification(
            nextVal ? `${r.name} bookmarked for corporate fellowship & hiring.` : `${r.name} unflagged.`,
            "success"
          );
          return { ...r, flaggedForHiring: nextVal };
        }
        return r;
      })
    );
  };

  const handleCreateTask = (newTask: Omit<KanbanTask, "id">) => {
    const task: KanbanTask = {
      ...newTask,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [task, ...prev]);
    showNotification(`Technical ticket "${task.title.slice(0, 30)}..." created.`, "success");
  };

  const handleMoveTask = (taskId: string, targetColumn: KanbanColumn) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, column: targetColumn } : t))
    );
  };

  const handleAddOfficeHourSlot = (slot: Omit<OfficeHourSlot, "id">) => {
    const newSlot: OfficeHourSlot = {
      ...slot,
      id: `slot-${Date.now()}`,
    };
    setOfficeHours((prev) => [...prev, newSlot]);
  };

  const handleDeleteOfficeHourSlot = (slotId: string) => {
    setOfficeHours((prev) => prev.filter((s) => s.id !== slotId));
    showNotification("Availability slot removed.", "warning");
  };

  const handleAddExpertiseTag = (tag: string) => {
    setExpertiseTags((prev) => [...prev, tag]);
    showNotification(`Expertise tag "${tag}" added.`, "success");
  };

  const handleRemoveExpertiseTag = (tag: string) => {
    setExpertiseTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSaveAgreement = (uniShare: number, indShare: number) => {
    showNotification(
      `Bilateral IP agreement executed: ${uniShare}% University / ${indShare}% Sponsor with DSC verification.`,
      "success"
    );
  };

  const handleConfirmLogout = async (saveDrafts: boolean) => {
    if (saveDrafts) {
      localStorage.setItem("industry_mentor_draft", JSON.stringify({
        project: selectedProject,
        rubric: { feasibility: 85, durability: 90, cost: 80 }
      }));
    }
    setShowLogoutModal(false);
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Navbar with 7 Navigation Tabs and Mentor Status */}
      <IndustryNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogoutClick={() => setShowLogoutModal(true)}
        pendingReviewsCount={2}
      />

      {/* Global Toast Banner */}
      {bannerNotice && (
        <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-xs shadow-md border-b border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            {bannerNotice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <span className="font-semibold">{bannerNotice.message}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-slate-400 hover:text-white font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Layer 2 Guidance Modals Trigger Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>Corporate CSR &amp; Intellectual Property Guidance</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => useGuidanceStore.getState().openIpRightsModal()}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>View IP Framework &amp; Licensing Terms</span>
            </button>
            <button
              type="button"
              onClick={() => useGuidanceStore.getState().openFundingTiersModal()}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Funding Tiers &amp; Escrow Schedules</span>
            </button>
          </div>
        </div>

        {/* Layer 5: Persistent Corporate CSR & Mentorship Compliance Checklist */}
        <IndustryChecklistCard />

        {activeTab === "home" && (
          <IndustryHomeView
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            officeHours={officeHours}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            onOpenReviewModal={() => setShowReviewModal(true)}
            onOpenIpModal={() => setShowIpModal(true)}
            onQuickApprove={handleQuickApprove}
            onQuickReject={handleQuickReject}
          />
        )}

        {activeTab === "escrow" && (
          <IndustryEscrowView
            project={selectedProject}
            tranches={tranches}
            bomReceipts={bomReceipts}
            onAuthorizeTranche={handleAuthorizeTranche}
          />
        )}

        {activeTab === "teams" && (
          <IndustryTeamsView
            project={selectedProject}
            researchers={researchers}
            onToggleTalentFlag={handleToggleTalentFlag}
            onSendMessageToResearcher={handleSendMessageToResearcher}
          />
        )}

        {activeTab === "tasks" && (
          <IndustryKanbanView
            tasks={tasks}
            researchers={researchers}
            onCreateTask={handleCreateTask}
            onMoveTask={handleMoveTask}
          />
        )}

        {activeTab === "trl" && (
          <IndustryTrlView
            project={selectedProject}
            stages={stages}
            auditLogs={auditLogs}
          />
        )}

        {activeTab === "settings" && (
          <IndustrySettingsView
            officeHours={officeHours}
            onAddOfficeHourSlot={handleAddOfficeHourSlot}
            onDeleteOfficeHourSlot={handleDeleteOfficeHourSlot}
            expertiseTags={expertiseTags}
            onAddExpertiseTag={handleAddExpertiseTag}
            onRemoveExpertiseTag={handleRemoveExpertiseTag}
            onTriggerLogout={() => setShowLogoutModal(true)}
          />
        )}
      </main>

      {/* MODAL 1: Interactive CAD & Circuit Review Desk Modal */}
      <MilestoneReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        project={selectedProject}
        testPoints={testPoints}
        initialAnnotations={annotations}
        onAuthorizeEscrow={handleAuthorizeEscrowFromModal}
        onRequestRevisions={handleRequestRevisionsFromModal}
      />

      {/* MODAL 2: Bilateral IP Assignment & Royalty Term Sheet Modal */}
      <BilateralIpModal
        isOpen={showIpModal}
        onClose={() => setShowIpModal(false)}
        project={selectedProject}
        onSaveAgreement={handleSaveAgreement}
      />

      {/* MODAL 3: Secure Session Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={handleConfirmLogout}
      />
    </div>
  );
}

export default function IndustryDashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><StatsSkeleton count={3} /></div>}>
      <IndustryDashboardContent />
    </Suspense>
  );
}
