"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, ListTodo, Briefcase } from "lucide-react";

export default function OpenContributorBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    challengeId: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, chalRes] = await Promise.all([
        fetch("/api/micro-tasks"),
        fetch("/api/challenges?limit=50")
      ]);
      
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.microTasks || []);
      }
      
      if (chalRes.ok) {
        const chalData = await chalRes.json();
        setChallenges(chalData.challenges || []);
        if (chalData.challenges && chalData.challenges.length > 0 && !formData.challengeId) {
          setFormData(prev => ({ ...prev, challengeId: chalData.challenges[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/micro-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ title: "", description: "", skills: "", challengeId: challenges[0]?.id || "" });
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to create task: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ListTodo className="w-8 h-8 text-indigo-600" />
            Open Contributor Board
          </h1>
          <p className="text-gray-600 mt-2">Discover micro-tasks, contribute your skills, and solve societal challenges.</p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Post a Micro-Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Build React Dashboard Component"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Challenge</label>
                <select
                  required
                  value={formData.challengeId}
                  onChange={(e) => setFormData({...formData, challengeId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {challenges.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.district})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (Comma separated)</label>
              <input
                type="text"
                required
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. React, TailwindCSS, Next.js"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe what needs to be done..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                Publish Task
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No open tasks available</h3>
          <p className="text-gray-500 mt-1">Be the first to post a micro-task for contributors!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${task.status === 'OPEN' ? 'bg-green-100 text-green-800' : task.status === 'ASSIGNED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {task.status}
                </span>
                <span className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
              <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{task.description}</p>
              
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Related Challenge</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{task.challenge?.title || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {task.skills.split(',').map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {task.createdBy?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{task.createdBy?.name}</p>
                    <p className="text-[10px] text-gray-500">{task.createdBy?.organization || "University"}</p>
                  </div>
                </div>
                {task.status === "OPEN" ? (
                  <button 
                    onClick={async () => {
                      if (!confirm("Are you sure you want to apply for this task?")) return;
                      try {
                        const res = await fetch(`/api/micro-tasks`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ taskId: task.id })
                        });
                        if (res.ok) {
                          alert("Successfully applied!");
                          fetchData();
                        } else {
                          const err = await res.json();
                          alert(`Failed to apply: ${err.error}`);
                        }
                      } catch (err) {
                        alert("An error occurred");
                      }
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Apply Now
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm font-medium">
                    {task.status === "ASSIGNED" ? "Assigned" : "Completed"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
