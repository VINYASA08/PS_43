"use client";

import React, { useState } from "react";
import { 
  ClipboardList, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Tag,
  User,
  Filter
} from "lucide-react";
import { KanbanTask, KanbanColumn, TaskPriority, LabResearcher } from "./types";

interface IndustryKanbanViewProps {
  tasks: KanbanTask[];
  researchers: LabResearcher[];
  onCreateTask: (newTask: Omit<KanbanTask, "id">) => void;
  onMoveTask: (taskId: string, targetColumn: KanbanColumn) => void;
}

export function IndustryKanbanView({
  tasks,
  researchers,
  onCreateTask,
  onMoveTask,
}: IndustryKanbanViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssigneeName, setNewAssigneeName] = useState(researchers[0]?.name || "Dr. Ananya Mukherjee");
  const [newPriority, setNewPriority] = useState<TaskPriority>("HIGH");
  const [newColumn, setNewColumn] = useState<KanbanColumn>("TODO");
  const [newMilestone, setNewMilestone] = useState("Milestone 2");
  const [newDueDate, setNewDueDate] = useState("2026-09-15");
  const [newTags, setNewTags] = useState("Hardware, Thermal");

  const columns: { id: KanbanColumn; label: string; bg: string; border: string; headerColor: string }[] = [
    { id: "TODO", label: "To Do", bg: "bg-slate-100/70", border: "border-slate-200", headerColor: "text-slate-800" },
    { id: "IN_LAB_TESTING", label: "In Lab Testing", bg: "bg-blue-50/50", border: "border-blue-200", headerColor: "text-blue-900" },
    { id: "AWAITING_MENTOR_REVIEW", label: "Awaiting Mentor Review", bg: "bg-amber-50/50", border: "border-amber-200", headerColor: "text-amber-900" },
    { id: "COMPLETED", label: "Completed", bg: "bg-emerald-50/50", border: "border-emerald-200", headerColor: "text-emerald-900" },
  ];

  const columnOrder: KanbanColumn[] = ["TODO", "IN_LAB_TESTING", "AWAITING_MENTOR_REVIEW", "COMPLETED"];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const matchedResearcher = researchers.find((r) => r.name === newAssigneeName) || {
      name: newAssigneeName,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      role: "Engineering Researcher"
    };

    onCreateTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      column: newColumn,
      priority: newPriority,
      assignee: {
        name: matchedResearcher.name,
        avatar: matchedResearcher.avatar,
        role: matchedResearcher.role
      },
      milestone: newMilestone,
      dueDate: newDueDate,
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean)
    });

    setNewTitle("");
    setNewDescription("");
    setShowCreateModal(false);
  };

  const getNextColumn = (current: KanbanColumn): KanbanColumn | null => {
    const idx = columnOrder.indexOf(current);
    if (idx < columnOrder.length - 1) return columnOrder[idx + 1];
    return null;
  };

  const getPrevColumn = (current: KanbanColumn): KanbanColumn | null => {
    const idx = columnOrder.indexOf(current);
    if (idx > 0) return columnOrder[idx - 1];
    return null;
  };

  const filteredTasks = priorityFilter === "ALL"
    ? tasks
    : tasks.filter((t) => t.priority === priorityFilter);

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200">CRITICAL</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">HIGH</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-blue-100 text-blue-800 border border-blue-200">MEDIUM</span>;
      case "LOW":
        return <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-100 text-slate-700 border border-slate-200">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" /> Milestone Deliverables & Technical Tasks
            </h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
              4 Workflow Stages
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Jira-grade technical task tracking for laboratory testing, firmware commits, and mentor review sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Priority filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  priorityFilter === p ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Create Technical Ticket
          </button>
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.column === col.id);
          return (
            <div
              key={col.id}
              className={`${col.bg} border ${col.border} rounded-2xl p-4 min-h-[550px] flex flex-col`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-xs ${col.headerColor}`}>{col.label}</h3>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-700 font-bold text-[10px] flex items-center justify-center shadow-2xs border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400 font-medium">
                    No tickets in {col.label}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const nextCol = getNextColumn(task.column);
                    const prevCol = getPrevColumn(task.column);

                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          {getPriorityBadge(task.priority)}
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {task.milestone}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 leading-snug">{task.title}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tg, i) => (
                              <span key={i} className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                #{tg}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Assignee & Due Date */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={task.assignee.avatar} alt={task.assignee.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-slate-700 text-[10px] truncate max-w-[90px]">
                              {task.assignee.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>

                        {/* Workflow Shift Buttons */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          {prevCol ? (
                            <button
                              onClick={() => onMoveTask(task.id, prevCol)}
                              className="px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded flex items-center gap-0.5 transition-colors cursor-pointer"
                              title={`Move back to ${prevCol}`}
                            >
                              <ChevronLeft className="w-3 h-3" /> Prev
                            </button>
                          ) : (
                            <span />
                          )}

                          {nextCol ? (
                            <button
                              onClick={() => onMoveTask(task.id, nextCol)}
                              className="px-2 py-0.5 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded flex items-center gap-0.5 transition-colors cursor-pointer"
                              title={`Advance to ${nextCol}`}
                            >
                              Next <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Technical Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">Create Actionable Technical Ticket</h4>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ticket Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Re-test voltage regulator under 45°C ambient temperature"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Technical Description & Acceptance Criteria
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Specific test instructions, acceptable voltage tolerances, test bench setup..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Assignee (Researcher)
                  </label>
                  <select
                    value={newAssigneeName}
                    onChange={(e) => setNewAssigneeName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  >
                    {researchers.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.role})
                      </option>
                    ))}
                    <option value="Senior Technical Mentor">Senior Technical Mentor</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  >
                    <option value="CRITICAL">CRITICAL (Blocks Milestone)</option>
                    <option value="HIGH">HIGH (Required for Gate)</option>
                    <option value="MEDIUM">MEDIUM (Optimization)</option>
                    <option value="LOW">LOW (Documentation)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Starting Stage
                  </label>
                  <select
                    value={newColumn}
                    onChange={(e) => setNewColumn(e.target.value as KanbanColumn)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_LAB_TESTING">In Lab Testing</option>
                    <option value="AWAITING_MENTOR_REVIEW">Awaiting Mentor Review</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Hardware, LM2596, Thermal"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
