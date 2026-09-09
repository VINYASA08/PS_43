"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Camera, 
  Paperclip, 
  Mic, 
  Send,
  MapPin,
  CheckCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  sender: "bot" | "user";
  text?: string;
  image?: boolean;
  location?: boolean;
  time: string;
  status?: "sent" | "delivered" | "read";
}

export default function WhatsAppIntake() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Johar! 🙏 Welcome to Jharkhand Govt Smart Study and Innovation Portal.\n\nReply with:\n1️⃣ Report a local problem\n2️⃣ Track my complaint\n3️⃣ Speak to an agent (Hindi/Santhali)",
      time: "09:00",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [stage, setStage] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const simulateBotResponse = (newMessage: Message, nextStage: number) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, newMessage]);
      setStage(nextStage);
    }, 1500);
  };

  const handleSend = () => {
    if (!inputValue.trim() && stage !== 1 && stage !== 2) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // User sends a text message
    if (inputValue.trim()) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: inputValue, time, status: "read" }]);
      setInputValue("");
    }

    if (stage === 0) {
      simulateBotResponse({
        id: Date.now().toString(),
        sender: "bot",
        text: "Please send a photo or video of the problem.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, 1);
    } else if (stage === 1) {
      // Handled by attachment buttons
    } else if (stage === 2) {
      // Handled by attachment buttons
    }
  };

  const sendAttachment = (type: "photo" | "location") => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (type === "photo") {
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", image: true, time, status: "read" }]);
      simulateBotResponse({
        id: Date.now().toString(),
        sender: "bot",
        text: "Photo received! 📸\n\nNow, please send your live location so the district authorities know exactly where this is.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, 2);
    } else if (type === "location") {
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", location: true, time, status: "read" }]);
      simulateBotResponse({
        id: Date.now().toString(),
        sender: "bot",
        text: "Location saved! 📍\n\nAnalyzing your report using AI and persisting to Jharkhand State Ledger... ⏳",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, 3);

      // Call real backend API
      fetch("/api/intake/whatsapp-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Water contamination and pipeline breach reported via WhatsApp intake",
          domain: "Water Management",
          district: "Dhanbad",
          location: "Borewell #03, Block XYZ, Village 4",
          phone: "+919708099999",
          mediaUrl: "/evidence/whatsapp_borewell_sample.jpg"
        })
      })
      .then(res => res.json())
      .then(data => {
        const trackingId = data.trackingId || "IN-GR-2026-9842";
        setTimeout(() => {
          simulateBotResponse({
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: `✅ *Report Submitted Successfully!*\n\n*Official Tracking ID:* ${trackingId}\n*Category:* Water Management\n*Urgency:* CRITICAL\n\nThis grievance has been registered on the public ledger and routed to IIT ISM Dhanbad.\n\nTrack live status here: /track?id=${trackingId}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, 4);
        }, 1500);
      })
      .catch(() => {
        setTimeout(() => {
          simulateBotResponse({
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: "✅ *Report Registered!*\n\nTracking ID: IN-GR-2026-9842\nTrack status at /track?id=IN-GR-2026-9842",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, 4);
        }, 1500);
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Background context */}
      <div className="absolute top-8 left-8 text-white max-w-sm hidden lg:block z-10">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 font-bold">
          <ArrowLeft className="w-5 h-5" /> Exit Simulation
        </Link>
        <h1 className="text-3xl font-black mb-3 text-emerald-400">Zero-Negative Intake</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          Government portals fail when they assume rural citizens have high digital literacy. 
        </p>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          This omnichannel simulation demonstrates how a villager can report a critical issue using only WhatsApp, a photo, and a GPS pin—bypassing complex web forms entirely.
        </p>
        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Instructions</p>
          <ul className="text-sm text-slate-300 list-disc pl-4 space-y-1">
            <li>Type &quot;1&quot; and send to start.</li>
            <li>Click the <Camera className="inline w-3 h-3 mx-1 text-emerald-400"/> icon to send a photo.</li>
            <li>Click the <MapPin className="inline w-3 h-3 mx-1 text-emerald-400"/> icon to send location.</li>
          </ul>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-semibold"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Device Mockup */}
      <div className="w-full max-w-[400px] h-[800px] max-h-[90vh] bg-slate-100 rounded-[3rem] p-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[8px] border-slate-800 relative overflow-hidden flex flex-col z-20">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
          <div className="w-32 h-6 bg-slate-800 rounded-b-3xl"></div>
        </div>

        {/* WhatsApp Header */}
        <div className="bg-[#075E54] pt-12 pb-3 px-4 flex items-center justify-between text-white rounded-t-2xl z-10 shadow-md">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/")} className="hover:bg-white/10 p-1 rounded-full transition-colors -ml-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center overflow-hidden border border-emerald-200">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Government_of_Jharkhand_Logo.png" alt="Gov" className="w-7 h-7 object-contain" />
            </div>
            <div 
              onClick={() => showToast("Jharkhand Sahayata Automated Public Grievance Helpline")}
              className="leading-tight cursor-pointer"
            >
              <h2 className="font-semibold text-[17px]">Jharkhand Sahayata</h2>
              <p className="text-[13px] text-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => showToast("Voice/Video calling active on WhatsApp helpline 1800-JH-INNOV")}
              className="hover:opacity-80 transition-opacity cursor-pointer p-1 rounded-full hover:bg-white/10"
              title="Start Video Call"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => showToast("Voice helpline connecting: Toll-free 1800-JH-INNOV")}
              className="hover:opacity-80 transition-opacity cursor-pointer p-1 rounded-full hover:bg-white/10"
              title="Call Helpline"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={() => showToast("Helpline v2.4 • Registered under Jharkhand Public Services Delivery Act")}
              className="hover:opacity-80 transition-opacity cursor-pointer p-1 rounded-full hover:bg-white/10"
              title="More Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Background */}
        <div className="flex-1 bg-[#E5DDD5] relative overflow-hidden flex flex-col">
          {/* WA Doodle Background pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg')", backgroundSize: "cover" }}></div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10 scroll-smooth" ref={scrollRef}>
            <div className="flex justify-center mb-6">
              <span className="bg-[#D4EAF7] text-slate-600 text-xs px-3 py-1 rounded-lg shadow-sm">Today</span>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="bg-[#FEF5C3] text-slate-700 text-xs px-4 py-2 rounded-lg shadow-sm max-w-[90%] text-center leading-relaxed">
                <span className="font-bold">🔒 Messages and calls are end-to-end encrypted.</span> No one outside of this chat, not even WhatsApp, can read or listen to them.
              </div>
            </div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-2 shadow-sm relative ${
                    msg.sender === "user" 
                      ? "bg-[#DCF8C6] rounded-tr-sm text-slate-800" 
                      : "bg-white rounded-tl-sm text-slate-800"
                  }`}>
                    {msg.image ? (
                      <div className="p-1">
                        <div className="w-48 h-48 bg-slate-300 rounded-xl overflow-hidden relative border border-slate-200">
                          <img src="https://images.unsplash.com/photo-1541888087593-3d0d8bb03b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" alt="Borewell" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ) : msg.location ? (
                      <div className="p-1">
                        <div className="w-48 h-32 bg-slate-300 rounded-xl overflow-hidden relative border border-slate-200">
                          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" alt="Map" className="w-full h-full object-cover grayscale" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-rose-500 fill-white" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-2 px-1 pb-1 truncate">Dhanbad, Block XYZ, Village 4</p>
                      </div>
                    ) : (
                      <div className="px-2 pt-1 pb-2 whitespace-pre-wrap text-[15px] leading-relaxed">
                        {/* Simple parser to render links in text */}
                        {msg.text?.split(/(https?:\/\/[^\s]+)/g).map((part, i) => 
                          part.match(/^https?:\/\//) 
                            ? <Link key={i} href="/track?id=JHR-2026-842" className="text-blue-600 hover:underline break-all">{part}</Link>
                            : <span key={i}>{part.replace(/\*/g, '').replace(/Johar!/, 'Johar!').replace(/Report Submitted Successfully!/, 'Report Submitted Successfully!')}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end gap-1 px-2 pb-0.5">
                      <span className="text-[10px] text-slate-500">{msg.time}</span>
                      {msg.sender === "user" && (
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.status === "read" ? "text-blue-500" : "text-slate-400"}`} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex gap-1 items-center">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Input */}
        <div className="bg-[#F0F0F0] p-2 flex items-end gap-2 rounded-b-2xl z-10 pb-6">
          <div className="flex-1 bg-white rounded-full min-h-[44px] flex items-center px-3 shadow-sm border border-slate-200">
            <button
              onClick={() => setInputValue((prev) => prev + "😊")}
              className="p-2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              title="Insert Emoji"
            >
              <span className="text-xl">😀</span>
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message"
              className="flex-1 bg-transparent border-none focus:outline-none text-[15px] px-2 py-3"
            />
            
            {/* Contextual Attachments based on stage */}
            <div className="flex items-center">
              {stage === 1 && (
                <button 
                  onClick={() => sendAttachment("photo")}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors relative group cursor-pointer"
                >
                  <Camera className="w-6 h-6 animate-pulse" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">Simulate Photo</span>
                </button>
              )}
              {stage === 2 && (
                <button 
                  onClick={() => sendAttachment("location")}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors relative group cursor-pointer"
                >
                  <MapPin className="w-6 h-6 animate-pulse" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">Simulate GPS Pin</span>
                </button>
              )}
              <button
                onClick={() => sendAttachment("photo")}
                className="p-2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                title="Attach Document / Media"
              >
                <Paperclip className="w-5 h-5 -rotate-45" />
              </button>
              {!inputValue && stage !== 1 && stage !== 2 && (
                <button
                  onClick={() => sendAttachment("photo")}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Take Photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <button 
            onClick={() => {
              if (inputValue.trim()) {
                handleSend();
              } else {
                setInputValue("Road collapse and water contamination reported at Sector 4");
                showToast("Voice transcribed: 'Road collapse and water contamination reported at Sector 4'");
              }
            }}
            className="w-[44px] h-[44px] rounded-full bg-[#00A884] text-white flex items-center justify-center shrink-0 hover:bg-[#008f6f] transition-colors shadow-sm cursor-pointer"
            title={inputValue ? "Send Message" : "Voice Input (Speech-to-Text)"}
          >
            {inputValue ? (
              <Send className="w-5 h-5 ml-1" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
