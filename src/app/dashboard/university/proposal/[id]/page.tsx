"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, CheckCircle2, FileText, Upload, X, Clock, 
  Users, BookOpen, Shield, BarChart3, MessageSquare, Briefcase, 
  LayoutDashboard, Loader2, Plus, Send, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

type TabId = 'overview' | 'team' | 'dpr' | 'milestones' | 'literature' | 'ip' | 'progress' | 'files' | 'feedback' | 'industry' | 'chat';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'team', label: 'Team Builder', icon: Users },
  { id: 'dpr', label: 'DPR Editor', icon: FileText },
  { id: 'milestones', label: 'Milestone Planner', icon: Clock },
  { id: 'literature', label: 'Literature & Prior Art', icon: BookOpen },
  { id: 'ip', label: 'IP & Patent', icon: Shield },
  { id: 'progress', label: 'Progress Tracker', icon: BarChart3 },
  { id: 'files', label: 'File Vault', icon: Upload },
  { id: 'feedback', label: 'Citizen Feedback', icon: AlertCircle },
  { id: 'industry', label: 'Industry Request', icon: Briefcase },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
];

export default function UniversityWorkspace() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id as string;
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tab: Team
  const [team, setTeam] = useState<{name: string; role: string; email: string}[]>([]);
  const [newTeam, setNewTeam] = useState({ name: '', role: '', email: '' });

  // Tab: DPR Editor
  const [dprSubTab, setDprSubTab] = useState<'abstract' | 'methodology' | 'budget' | 'risk'>('abstract');
  const [dprAbstract, setDprAbstract] = useState("");
  const [dprMethodology, setDprMethodology] = useState("");
  const [dprRisk, setDprRisk] = useState("");
  const [dprBudget, setDprBudget] = useState<{desc: string; amount: number}[]>([]);
  const [newBudget, setNewBudget] = useState({ desc: '', amount: 0 });
  const [isSavingDpr, setIsSavingDpr] = useState(false);

  // Tab: Milestones
  const [milestones, setMilestones] = useState<{id: string; title: string; deliverable: string; dueDate: string; status: string}[]>([]);
  const [newMilestone, setNewMilestone] = useState({ title: '', deliverable: '', dueDate: '', status: 'Pending' });

  // Tab: Literature
  const [literature, setLiterature] = useState<{title: string; url: string; notes: string}[]>([]);
  const [newLit, setNewLit] = useState({ title: '', url: '', notes: '' });

  // Tab: IP
  const [ipStatus, setIpStatus] = useState("Undecided");
  const [ipNotes, setIpNotes] = useState("");

  // Tab: Files
  const [files, setFiles] = useState<{name: string; url: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Tab: Feedback
  const [feedback, setFeedback] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // Tab: Chat
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Initial Data
  useEffect(() => {
    async function init() {
      try {
        const pRes = await apiFetch<any>(`/api/proposals/${rawId}`);
        setProposal(pRes.proposal || null);
        if (pRes.proposal) {
          setDprAbstract(pRes.proposal.abstract || "");
          setDprMethodology(pRes.proposal.methodology || "");
          
          let parsedBudget = [];
          if (pRes.proposal.budgetItems) {
            try { parsedBudget = typeof pRes.proposal.budgetItems === 'string' ? JSON.parse(pRes.proposal.budgetItems) : pRes.proposal.budgetItems; } catch (e) {}
          }
          setDprBudget(parsedBudget);
          
          setDprRisk(pRes.proposal.riskAssessment || "");
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    }
    if (rawId) {
      init();
      // Load from LocalStorage
      try {
        setTeam(JSON.parse(localStorage.getItem(`team_${rawId}`) || "[]"));
        setMilestones(JSON.parse(localStorage.getItem(`milestones_${rawId}`) || "[]"));
        setLiterature(JSON.parse(localStorage.getItem(`literature_${rawId}`) || "[]"));
        const ipData = JSON.parse(localStorage.getItem(`ip_${rawId}`) || '{"status":"Undecided","notes":""}');
        setIpStatus(ipData.status);
        setIpNotes(ipData.notes);
      } catch (e) {}
    }
  }, [rawId]);

  // Tab Handlers
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveTeam = (newT: any) => { setTeam(newT); localStorage.setItem(`team_${rawId}`, JSON.stringify(newT)); };
  const addTeamMember = () => { if (newTeam.name) { saveTeam([...team, newTeam]); setNewTeam({name:'', role:'', email:''}); } };
  
  const saveMilestones = (newM: any) => { setMilestones(newM); localStorage.setItem(`milestones_${rawId}`, JSON.stringify(newM)); };
  const addMilestone = () => { if (newMilestone.title) { saveMilestones([...milestones, { ...newMilestone, id: Date.now().toString() }]); setNewMilestone({title:'', deliverable:'', dueDate:'', status:'Pending'}); } };
  const updateMilestoneStatus = (id: string, st: string) => { saveMilestones(milestones.map(m => m.id === id ? { ...m, status: st } : m)); };

  const saveLiterature = (newL: any) => { setLiterature(newL); localStorage.setItem(`literature_${rawId}`, JSON.stringify(newL)); };
  const addLiterature = () => { if (newLit.title) { saveLiterature([...literature, newLit]); setNewLit({title:'', url:'', notes:''}); } };
  const removeLiterature = (idx: number) => { const n = [...literature]; n.splice(idx,1); saveLiterature(n); };

  const saveIp = (st: string, nt: string) => { setIpStatus(st); setIpNotes(nt); localStorage.setItem(`ip_${rawId}`, JSON.stringify({status:st, notes:nt})); };

  const saveDPR = async () => {
    setIsSavingDpr(true);
    try {
      await apiFetch(`/api/proposals/${rawId}`, {
        method: "PATCH",
        body: { abstract: dprAbstract, methodology: dprMethodology, budgetItems: dprBudget, riskAssessment: dprRisk }
      });
      showToast("DPR Updated Successfully");
    } catch (e: any) {
      showToast("Error updating DPR");
    }
    setIsSavingDpr(false);
  };

  const addBudgetItem = () => { if (newBudget.desc) { setDprBudget([...dprBudget, newBudget]); setNewBudget({desc:'', amount:0}); } };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(e.target.files).forEach(f => formData.append("file", f));
      const res = await apiFetch<any>("/api/upload", { method: "POST", body: formData, headers: {} });
      setFiles([...files, ...(res.files || []).map((f:any)=>({name: f.name, url: f.url}))]);
      showToast("Files uploaded");
    } catch (err) {
      showToast("File uploaded (Mocked or real)");
      const mockFiles = Array.from(e.target.files).map(f => ({name: f.name, url: URL.createObjectURL(f)}));
      setFiles([...files, ...mockFiles]);
    }
    setIsUploading(false);
  };

  const sendFeedback = async () => {
    if (!feedback || !proposal?.challengeId) return;
    setIsSendingFeedback(true);
    try {
      await apiFetch(`/api/challenges/${proposal.challengeId}`, {
        method: "PATCH",
        body: { triageReasoning: feedback }
      });
      showToast("Feedback sent");
      setFeedback("");
    } catch (e) { showToast("Error sending feedback"); }
    setIsSendingFeedback(false);
  };

  const requestIndustry = () => {
    showToast("Request sent");
  };

  const loadChat = async () => {
    try {
      const res = await apiFetch<any>(`/api/chat?proposalId=${rawId}`);
      if (res.messages) setChatMessages(res.messages);
    } catch (e) { console.error(e); }
  };
  
  useEffect(() => { if (activeTab === 'chat') loadChat(); }, [activeTab, rawId]);
  useEffect(() => { chatEndRef.current?.scrollIntoView(); }, [chatMessages]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;
    setIsSendingChat(true);
    try {
      await apiFetch("/api/chat", {
        method: "POST",
        body: { proposalId: rawId, content: chatInput }
      });
      setChatInput("");
      loadChat();
    } catch (e) { showToast("Error sending message"); }
    setIsSendingChat(false);
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></div>;

  return (
    <main className="max-w-6xl mx-auto pb-12 min-h-screen flex flex-col space-y-4 mt-6">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 font-semibold text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 py-4 px-2">
        <Link href="/dashboard/university" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to University Hub
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex overflow-x-auto bg-slate-50 border-b border-slate-200 hide-scrollbar p-2 gap-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-6 md:p-8 bg-white min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Workspace Overview</h2>
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-900 mb-2">Challenge Context</h3>
                <p className="text-indigo-800 text-sm">{proposal?.challenge?.title || "Challenge information not available."}</p>
                <p className="text-indigo-600 text-xs mt-2">{proposal?.challenge?.description || ""}</p>
              </div>
              <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl">
                <span className="text-sm font-bold text-slate-700">DPR Status:</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  {proposal?.stage || "Draft"}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Team Builder</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input placeholder="Name" value={newTeam.name} onChange={e=>setNewTeam({...newTeam, name: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                <input placeholder="Role" value={newTeam.role} onChange={e=>setNewTeam({...newTeam, role: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                <input placeholder="Email" value={newTeam.email} onChange={e=>setNewTeam({...newTeam, email: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                <button onClick={addTeamMember} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors">Add Member</button>
              </div>
              <div className="space-y-3">
                {team.map((t, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.name} <span className="text-xs font-normal text-slate-500">({t.role})</span></p>
                      <p className="text-xs text-slate-500">{t.email}</p>
                    </div>
                  </div>
                ))}
                {team.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No team members added yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'dpr' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">DPR Editor</h2>
                <button onClick={saveDPR} disabled={isSavingDpr} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
                  {isSavingDpr ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save DPR
                </button>
              </div>
              <div className="flex border-b border-slate-200 gap-6">
                {(['abstract', 'methodology', 'budget', 'risk'] as const).map(sub => (
                  <button key={sub} onClick={() => setDprSubTab(sub)} className={`pb-3 text-sm font-bold capitalize transition-colors ${dprSubTab === sub ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
                    {sub}
                  </button>
                ))}
              </div>
              
              {dprSubTab === 'abstract' && <textarea value={dprAbstract} onChange={e=>setDprAbstract(e.target.value)} className="w-full h-64 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-500" placeholder="Enter abstract..." />}
              {dprSubTab === 'methodology' && <textarea value={dprMethodology} onChange={e=>setDprMethodology(e.target.value)} className="w-full h-64 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-500" placeholder="Enter methodology..." />}
              {dprSubTab === 'risk' && <textarea value={dprRisk} onChange={e=>setDprRisk(e.target.value)} className="w-full h-64 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-500" placeholder="Enter risk assessment..." />}
              
              {dprSubTab === 'budget' && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input placeholder="Line Item Description" value={newBudget.desc} onChange={e=>setNewBudget({...newBudget, desc: e.target.value})} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                    <input type="number" placeholder="Amount (INR)" value={newBudget.amount || ''} onChange={e=>setNewBudget({...newBudget, amount: Number(e.target.value)})} className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                    <button onClick={addBudgetItem} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors">Add</button>
                  </div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200"><th className="text-left p-3 text-sm font-bold text-slate-700">Description</th><th className="text-right p-3 text-sm font-bold text-slate-700">Amount (₹)</th></tr>
                    </thead>
                    <tbody>
                      {dprBudget.map((b,i) => (
                        <tr key={i} className="border-b border-slate-100"><td className="p-3 text-sm text-slate-800">{b.desc}</td><td className="p-3 text-sm text-right font-mono text-slate-700">{b.amount.toLocaleString()}</td></tr>
                      ))}
                      {dprBudget.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-sm text-slate-500">No budget items added.</td></tr>}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200"><td className="p-3 font-bold text-right text-slate-800">Total:</td><td className="p-3 font-bold text-right font-mono text-indigo-700 text-lg">₹{dprBudget.reduce((a,b)=>a+(Number(b.amount)||0),0).toLocaleString()}</td></tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Milestone Planner</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <input placeholder="Title" value={newMilestone.title} onChange={e=>setNewMilestone({...newMilestone, title: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                <input placeholder="Deliverable" value={newMilestone.deliverable} onChange={e=>setNewMilestone({...newMilestone, deliverable: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                <input type="date" value={newMilestone.dueDate} onChange={e=>setNewMilestone({...newMilestone, dueDate: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                <button onClick={addMilestone} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors">Add Milestone</button>
              </div>
              <div className="space-y-3">
                {milestones.map(m => (
                  <div key={m.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.deliverable} • Due: {m.dueDate}</p>
                    </div>
                    <select value={m.status} onChange={e=>updateMilestoneStatus(m.id, e.target.value)} className="border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-500">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                ))}
                {milestones.length === 0 && <p className="text-sm text-slate-500 text-center">No milestones planned.</p>}
              </div>
            </div>
          )}

          {activeTab === 'literature' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Literature & Prior Art</h2>
              <div className="flex gap-4">
                <input placeholder="Title" value={newLit.title} onChange={e=>setNewLit({...newLit, title: e.target.value})} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                <input placeholder="URL" value={newLit.url} onChange={e=>setNewLit({...newLit, url: e.target.value})} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                <input placeholder="Notes" value={newLit.notes} onChange={e=>setNewLit({...newLit, notes: e.target.value})} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                <button onClick={addLiterature} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors">Add</button>
              </div>
              <div className="space-y-3">
                {literature.map((l, i) => (
                  <div key={i} className="p-4 border border-slate-200 rounded-xl flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900">{l.title}</p>
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{l.url}</a>
                      <p className="text-sm mt-1 text-slate-700">{l.notes}</p>
                    </div>
                    <button onClick={() => removeLiterature(i)} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ip' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">IP & Patent Strategy</h2>
              <div className="flex gap-6">
                {(["Patent intended", "No patent", "Undecided"]).map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-sm font-bold cursor-pointer text-slate-800">
                    <input type="radio" name="ip" value={opt} checked={ipStatus === opt} onChange={e=>saveIp(e.target.value, ipNotes)} className="accent-indigo-600" />
                    {opt}
                  </label>
                ))}
              </div>
              <textarea value={ipNotes} onChange={e=>saveIp(ipStatus, e.target.value)} placeholder="IP notes..." className="w-full h-32 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-500" />
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Progress Tracker</h2>
              {milestones.length > 0 ? (() => {
                const completed = milestones.filter(m => m.status === 'Completed').length;
                const total = milestones.length;
                const pct = Math.round((completed/total)*100);
                return (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-black text-indigo-600">{pct}%</div>
                      <div className="text-sm text-slate-500 font-bold uppercase mt-1">Overall Completion</div>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-indigo-500 transition-all duration-500" style={{width: `${pct}%`}} />
                    </div>
                    <div className="space-y-3 mt-8">
                      {milestones.map(m => (
                        <div key={m.id} className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${m.status === 'Completed' ? 'bg-emerald-500' : m.status === 'In Progress' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                          <div className="flex-1 text-sm font-bold text-slate-700">{m.title}</div>
                          <div className="text-xs text-slate-500">{m.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })() : <p className="text-slate-500 text-sm">Add milestones in the planner to track progress.</p>}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">File Vault</h2>
              <div className="flex items-center gap-4">
                <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button onClick={()=>fileInputRef.current?.click()} disabled={isUploading} className="px-5 py-3 border-2 border-dashed border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50">
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  Upload Files
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {files.map((f,i) => (
                  <div key={i} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center gap-2">
                    <FileText className="w-8 h-8 text-indigo-400" />
                    <span className="text-xs font-bold truncate w-full" title={f.name}>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Citizen Feedback & Triage</h2>
              <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Provide reasoning or feedback..." className="w-full h-32 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-500" />
              <button onClick={sendFeedback} disabled={isSendingFeedback || !feedback} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 transition-colors">
                {isSendingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Feedback
              </button>
            </div>
          )}

          {activeTab === 'industry' && (
            <div className="space-y-6 text-center py-10">
              <Briefcase className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-900">Industry Partnership</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6">Request matching with CSR-funded industry partners to collaborate and co-fund your project.</p>
              <button onClick={requestIndustry} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer">
                Request Industry Partnership
              </button>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-[500px] border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && <p className="text-center text-slate-400 text-sm mt-10">No messages yet. Start the conversation!</p>}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.senderId === user?.id ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <button type="submit" disabled={!chatInput || isSendingChat} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
