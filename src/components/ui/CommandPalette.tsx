"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  Search,
  Home,
  FileText,
  MapPin,
  MessageSquare,
  ListTodo,
  LayoutDashboard,
  Settings,
  LogOut,
  Command,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  action: "navigate" | "logout";
  href?: string;
}

const BASE_COMMANDS: CommandItem[] = [
  { id: "home", label: "Home", category: "Navigate", icon: Home, action: "navigate", href: "/" },
  { id: "submit", label: "Submit Challenge", category: "Navigate", icon: FileText, action: "navigate", href: "/submit" },
  { id: "track", label: "Track Challenge", category: "Navigate", icon: MapPin, action: "navigate", href: "/track" },
  { id: "whatsapp", label: "WhatsApp Intake", category: "Navigate", icon: MessageSquare, action: "navigate", href: "/whatsapp-intake" },
  { id: "open-board", label: "Open Board", category: "Navigate", icon: ListTodo, action: "navigate", href: "/dashboard/open-board" },
  { id: "chat", label: "Chat Hub", category: "Navigate", icon: MessageSquare, action: "navigate", href: "/dashboard/chat" },
  { id: "dashboard", label: "My Dashboard", category: "Dashboard", icon: LayoutDashboard, action: "navigate", href: "/dashboard" },
  { id: "settings", label: "Settings", category: "Dashboard", icon: Settings, action: "navigate", href: "/dashboard/settings" },
  { id: "logout", label: "Logout", category: "Quick Actions", icon: LogOut, action: "logout" },
];

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const lq = query.toLowerCase();
  const lt = text.toLowerCase();
  let qi = 0;
  for (let i = 0; i < lt.length && qi < lq.length; i++) {
    if (lt[i] === lq[qi]) qi++;
  }
  return qi === lq.length;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuthStore();

  // Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredCommands = BASE_COMMANDS.filter((cmd) =>
    fuzzyMatch(query, cmd.label) || fuzzyMatch(query, cmd.category)
  );

  // Reset selection when list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback(
    async (cmd: CommandItem) => {
      setOpen(false);
      if (cmd.action === "logout") {
        try {
          await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } finally {
          router.push("/login");
        }
        return;
      }
      if (cmd.href) {
        router.push(cmd.href);
      }
    },
    [router]
  );

  // Keyboard nav inside palette
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) executeCommand(cmd);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredCommands, selectedIndex, executeCommand]);

  if (!open) return null;

  // Group commands by category
  const categories: Record<string, CommandItem[]> = {};
  let globalIdx = 0;
  const indexedCommands: { cmd: CommandItem; idx: number }[] = filteredCommands.map((cmd) => ({
    cmd,
    idx: globalIdx++,
  }));
  for (const { cmd } of indexedCommands) {
    if (!categories[cmd.category]) categories[cmd.category] = [];
    categories[cmd.category].push(cmd);
  }

  // Build a flat ordered list with global indices for highlighting
  let runningIdx = 0;
  const categoryEntries = Object.entries(categories);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 bg-slate-900/60"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands…"
            className="flex-1 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
          />
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono border border-slate-200 rounded px-1.5 py-0.5">
            ESC
          </div>
        </div>

        {/* Command list */}
        <div className="max-h-96 overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No commands found
            </div>
          ) : (
            categoryEntries.map(([category, cmds]) => {
              const categoryStart = runningIdx;
              runningIdx += cmds.length;
              return (
                <div key={category}>
                  <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {category}
                  </div>
                  {cmds.map((cmd, localIdx) => {
                    const globalItemIdx = categoryStart + localIdx;
                    const isSelected = globalItemIdx === selectedIndex;
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onMouseEnter={() => setSelectedIndex(globalItemIdx)}
                        onClick={() => executeCommand(cmd)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                          isSelected
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? "text-slate-700" : "text-slate-400"
                          }`}
                        />
                        <span className="font-medium">{cmd.label}</span>
                        {cmd.action === "logout" && (
                          <span className="ml-auto text-[10px] text-rose-500 font-semibold">
                            Sign out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-t border-slate-100 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> K to toggle
          </span>
          <span>↑↓ navigate</span>
          <span>↵ execute</span>
          {user && (
            <span className="ml-auto font-semibold text-slate-500">
              {user.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
