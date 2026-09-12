"use client";

import React, { useState } from "react";
import { IndustryKanbanView } from "@/app/dashboard/industry/components/IndustryKanbanView";
import { KanbanTask, KanbanColumn, LabResearcher } from "@/app/dashboard/industry/components/types";

export interface KanbanBoardProps {
  initialTasks?: KanbanTask[];
  researchers?: LabResearcher[];
  title?: string;
  subtitle?: string;
  onTaskMove?: (taskId: string, targetColumn: KanbanColumn) => void;
  onTaskCreate?: (task: Omit<KanbanTask, "id">) => void;
}

const DEFAULT_RESEARCHERS: LabResearcher[] = [
  {
    id: "res-1",
    name: "Dr. Ananya Mukherjee",
    role: "Principal Investigator",
    department: "Environmental Engineering",
    institution: "BIT Mesra",
    degrees: ["Ph.D. Environmental Tech", "M.Tech Chemical"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    publicationsCount: 14,
    publications: [],
    skills: ["Adsorption", "Membrane Filtration", "Heavy Metals"],
    flaggedForHiring: true,
    email: "ananya.mukherjee@bitmesra.ac.in",
    currentSubsystem: "Adsorption Column Design",
  },
  {
    id: "res-2",
    name: "Prof. Rajesh Soren",
    role: "Hardware & IoT Lead",
    department: "Electronics & Communication",
    institution: "IIT (ISM) Dhanbad",
    degrees: ["Ph.D. Embedded Systems", "B.Tech ECE"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    publicationsCount: 9,
    publications: [],
    skills: ["Telemetry", "Turbidity Sensors", "LoRaWAN"],
    flaggedForHiring: false,
    email: "rajesh.soren@iitism.ac.in",
    currentSubsystem: "Telemetry Firmware v2.1",
  },
];

const DEFAULT_TASKS: KanbanTask[] = [
  {
    id: "task-1",
    title: "Heavy Metal Adsorbent Subsystem Lab Test",
    description: "Evaluate biochar matrix against Dhanbad acid runoff water samples under controlled pH 4.5.",
    column: "TODO",
    priority: "CRITICAL",
    assignee: {
      name: "Dr. Ananya Mukherjee",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      role: "Principal Investigator",
    },
    milestone: "TRL-4 Lab Validation",
    dueDate: "2026-09-18",
    tags: ["Filtration", "Biochar", "Water"],
  },
  {
    id: "task-2",
    title: "Calibrate Dual Optical Turbidity Sensor",
    description: "Bench test spectrophotometer correlation with ground field telemetry probe in Bokaro.",
    column: "IN_LAB_TESTING",
    priority: "HIGH",
    assignee: {
      name: "Prof. Rajesh Soren",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "Hardware Lead",
    },
    milestone: "Hardware Pilot",
    dueDate: "2026-09-22",
    tags: ["Sensors", "IoT", "Firmware"],
  },
  {
    id: "task-3",
    title: "Mentor Review: Escrow Tranche 2 Readiness",
    description: "Submit bill of materials audit report for Rs 12.5L pilot disbursement.",
    column: "AWAITING_MENTOR_REVIEW",
    priority: "HIGH",
    assignee: {
      name: "Dr. Ananya Mukherjee",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      role: "Principal Investigator",
    },
    milestone: "CSR Audit",
    dueDate: "2026-09-25",
    tags: ["Escrow", "CSR", "Compliance"],
  },
  {
    id: "task-4",
    title: "Field Water Quality Baseline Ingestion",
    description: "Ingested baseline parameters for 14 panchayats in Dhanbad and Ramgarh.",
    column: "COMPLETED",
    priority: "MEDIUM",
    assignee: {
      name: "Prof. Rajesh Soren",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "Hardware Lead",
    },
    milestone: "Baseline",
    dueDate: "2026-09-10",
    tags: ["Data", "Baseline"],
  },
];

export function KanbanBoard({
  initialTasks = DEFAULT_TASKS,
  researchers = DEFAULT_RESEARCHERS,
  title = "Research & Prototyping Kanban Board",
  subtitle = "Interactive 4-column workflow tracking R&D validation, mentor reviews, and milestones.",
  onTaskMove,
  onTaskCreate,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);

  const handleCreateTask = (newTask: Omit<KanbanTask, "id">) => {
    const taskWithId: KanbanTask = {
      ...newTask,
      id: 	ask-,
    };
    setTasks((prev) => [...prev, taskWithId]);
    if (onTaskCreate) {
      onTaskCreate(newTask);
    }
  };

  const handleMoveTask = (taskId: string, targetColumn: KanbanColumn) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, column: targetColumn } : t))
    );
    if (onTaskMove) {
      onTaskMove(taskId, targetColumn);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 shadow-sm space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <IndustryKanbanView
        tasks={tasks}
        researchers={researchers}
        onCreateTask={handleCreateTask}
        onMoveTask={handleMoveTask}
      />
    </div>
  );
}

export default KanbanBoard;
