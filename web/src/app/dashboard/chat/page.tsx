"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";

export default function ChatHubPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [proposalId, setProposalId] = useState("");
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch proposals to chat about
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await fetch("/api/proposals?limit=10");
        if (res.ok) {
          const data = await res.json();
          if (data.proposals && data.proposals.length > 0) {
            setProposals(data.proposals);
            setProposalId(data.proposals[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch proposals", err);
      }
    };
    fetchProposals();
  }, []);

  const fetchMessages = async () => {
    if (!proposalId) return;
    try {
      const res = await fetch(`/api/chat?proposalId=${proposalId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!proposalId) return;
    setLoading(true);
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling every 3 seconds
    return () => clearInterval(interval);
  }, [proposalId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !proposalId) return;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          content: newMessage
        })
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Industry-University Chat Hub
          </h1>
          <p className="text-gray-600 mt-1">Collaborate on proposals and projects in real-time.</p>
        </div>
        
        {proposals.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Project/Proposal:</label>
            <select 
              value={proposalId}
              onChange={(e) => setProposalId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {proposals.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.proposalRef})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!proposalId && !loading && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md border border-yellow-200">
          No proposals found. Please create a proposal first to start chatting.
        </div>
      )}

      {proposalId && (
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            {loading ? (
              <div className="text-center text-gray-500 py-10">Loading messages...</div>
            ) : messages.length === 0 ? (
               <div className="text-center text-gray-500 py-10">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 self-start max-w-[80%]">
                  <div className="flex justify-between items-center mb-1 gap-4">
                    <span className="font-semibold text-sm text-gray-900">{msg.sender?.name || "Unknown"} <span className="text-xs text-gray-500 font-normal ml-1">({msg.sender?.organization || msg.sender?.role || 'User'})</span></span>
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-700">{msg.content}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Send <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
