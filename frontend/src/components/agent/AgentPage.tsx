import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Cpu, HardDrive, Zap, Shield, Globe, Clock } from "lucide-react";

/* ── Ghost SVG ── */
function Ghost({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128">
      <path d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z" fill="url(#gAgent)"/>
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#gAgent)"/>
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#gAgent)"/>
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764"/>
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764"/>
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764"/>
      <circle cx="50" cy="54" r="2.5" fill="white"/>
      <circle cx="74" cy="54" r="2.5" fill="white"/>
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25"/>
      <defs>
        <radialGradient id="gAgent" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF"/><stop offset="50%" stopColor="#C084FC"/><stop offset="100%" stopColor="#6D28D9"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── Channel data ── */
const CHANNELS = [
  { id: "whatsapp", name: "WhatsApp", emoji: "💬", color: "#25D366", desc: "Chat with Boo on WhatsApp. Send messages, photos, voice notes — Boo responds instantly." },
  { id: "telegram", name: "Telegram", emoji: "✈️", color: "#0088cc", desc: "Add Boo as a Telegram bot. Works in groups too — Boo joins your team chats." },
  { id: "discord", name: "Discord", emoji: "🎮", color: "#5865F2", desc: "Invite Boo to your Discord server. It responds in channels and DMs." },
  { id: "imessage", name: "iMessage", emoji: "💙", color: "#34AADC", desc: "Text Boo from your iPhone. It feels like chatting with a friend." },
  { id: "slack", name: "Slack", emoji: "💼", color: "#4A154B", desc: "Add Boo to your Slack workspace. Automate tasks across channels." },
  { id: "email", name: "Email", emoji: "📧", color: "#EA4335", desc: "Email Boo and get responses. Great for async tasks and long requests." },
];

/* ── Features ── */
const FEATURES = [
  { icon: Clock, title: "Always on", desc: "Boo runs 24/7 on your cloud. Send a message at 3am — it responds in seconds." },
  { icon: Globe, title: "Every channel", desc: "WhatsApp, Telegram, Discord, Slack, email — Boo talks to you wherever you are." },
  { icon: Zap, title: "35+ skills", desc: "Decks, videos, images, documents, research, coding — all running autonomously." },
  { icon: Shield, title: "Your data, your cloud", desc: "Everything runs on your own machine. No one else sees your conversations." },
  { icon: Cpu, title: "Serious power", desc: "2 CPUs and 64 GB RAM. Enough to run all skills, browser automation, and AI models simultaneously." },
  { icon: HardDrive, title: "Persistent memory", desc: "Boo remembers everything across sessions. Your preferences, past requests, context — it never forgets." },
];

/* ── Steps ── */
const STEPS = [
  { num: "01", title: "Sign up for a plan", desc: "Pick the $20/month plan. You get a dedicated cloud instance with 2 CPUs and 64 GB RAM — ready in 60 seconds." },
  { num: "02", title: "Connect your channels", desc: "Link WhatsApp, Telegram, Discord, or any channel you use. Scan a QR code or paste a bot token — that's it." },
  { num: "03", title: "Tell Boo what to do", desc: "Start chatting. Boo creates, automates, and responds across all your channels, 24 hours a day." },
];

/* ── Pricing ── */
const PLAN = {
  price: "$20",
  period: "/month",
  features: [
    "2 CPUs dedicated to your agent",
    "64 GB RAM — run everything at once",
    "256 GB storage for your creations",
    "35+ skills (slides, videos, images, docs)",
    "All channels (WhatsApp, Telegram, Discord, Slack)",
    "Always-on — 24/7 uptime",
    "Browser automation (research, scraping)",
    "Persistent memory across sessions",
    "Priority support",
  ],
};

/* ── Use cases ── */
const USE_CASES = [
  { emoji: "🎓", title: "Students", desc: "\"Boo, create a study guide for my biology exam tomorrow\" — at midnight, on WhatsApp. Done." },
  { emoji: "🚀", title: "Creators", desc: "\"Make me 5 TikTok scripts about fitness\" — on Telegram while you're at the gym. Ready when you are." },
  { emoji: "💼", title: "Freelancers", desc: "\"Write a proposal for the client meeting\" — on Slack at 6am. Sent before you finish coffee." },
  { emoji: "🏠", title: "Everyone", desc: "\"Plan my meals for the week\" — on iMessage while grocery shopping. List in your pocket." },
];

export default function AgentPage() {
  const nav = useNavigate();
  const [selectedChannel, setSelectedChannel] = useState("whatsapp");
  const activeChannel = CHANNELS.find(c => c.id === selectedChannel)!;

  return (
    <div className="min-h-screen text-white" style={{ background: "#0c0118" }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)]"
        style={{ background: "rgba(12,1,24,0.8)", backdropFilter: "blur(24px)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <Ghost size={22} />
            <span className="text-[14px] font-bold tracking-tight text-white">Superboo</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/#section-features" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">Features</a>
            <a href="/agent" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">24x7 Agent</a>
            <a href="/pricing" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">Pricing</a>
            <button onClick={() => nav("/login")}
              className="text-[13px] px-5 py-2 rounded-full text-white font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)" }}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative py-24 md:py-36 px-5 md:px-8 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(147,112,255,0.2), rgba(236,72,153,0.1) 40%, transparent 70%)", filter: "blur(100px)" }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="ghost-float mb-8 inline-block">
            <div className="relative">
              <div className="absolute inset-[-20px] rounded-full" style={{ background: "radial-gradient(circle, rgba(147,112,255,0.4), transparent 70%)", filter: "blur(20px)" }} />
              <div className="relative"><Ghost size={100} /></div>
            </div>
          </div>

          <h1 className="text-[44px] sm:text-[56px] md:text-[72px] font-extrabold leading-[0.95] tracking-[-0.04em] mb-6">
            Your AI.{" "}
            <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899, #9370ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Always on.
            </span>
          </h1>
          <p className="text-[18px] md:text-[22px] text-white/70 max-w-2xl mx-auto mb-4 leading-relaxed">
            Superboo runs 24/7 on your own cloud. It creates slides, edits videos, writes documents, researches markets — and responds on WhatsApp, Telegram, Discord, or wherever you are.
          </p>
          <p className="text-[15px] text-white/40 mb-10">
            Not a chatbot. A full AI agent that actually does things while you sleep.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => nav("/login")}
              className="px-8 py-4 rounded-full text-[16px] font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)", boxShadow: "0 0 40px -8px rgba(147,112,255,0.5)" }}>
              Deploy your Boo — $20/mo <ArrowRight size={16} className="inline ml-2" />
            </button>
            <a href="#channels"
              className="px-8 py-4 rounded-full text-[16px] font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all text-center">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] text-[#9370ff] uppercase tracking-[0.2em] font-medium">What you get</span>
            <h2 className="text-[32px] md:text-[44px] font-extrabold tracking-[-0.03em] mt-3">
              Not just a chatbot. A{" "}
              <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                full agent.
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(147,112,255,0.15)", border: "1px solid rgba(147,112,255,0.2)" }}>
                  <f.icon size={18} className="text-[#9370ff]" />
                </div>
                <h3 className="text-[16px] font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Channels ── */}
      <section id="channels" className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] text-[#9370ff] uppercase tracking-[0.2em] font-medium">Channels</span>
            <h2 className="text-[32px] md:text-[44px] font-extrabold tracking-[-0.03em] mt-3">
              Talk to Boo{" "}
              <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                everywhere.
              </span>
            </h2>
            <p className="text-white/40 text-[15px] mt-4 max-w-md mx-auto">
              Connect your favorite messaging apps. Boo responds on all of them, simultaneously.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Channel selector */}
            <div className="flex md:flex-col gap-2 md:w-48 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {CHANNELS.map(ch => (
                <button key={ch.id} onClick={() => setSelectedChannel(ch.id)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all flex-shrink-0"
                  style={{
                    background: selectedChannel === ch.id ? "rgba(255,255,255,0.08)" : "transparent",
                    border: selectedChannel === ch.id ? `1px solid ${ch.color}40` : "1px solid transparent",
                    color: selectedChannel === ch.id ? "white" : "rgba(255,255,255,0.5)",
                  }}>
                  <span className="text-lg">{ch.emoji}</span>
                  {ch.name}
                </button>
              ))}
            </div>

            {/* Channel detail */}
            <div className="flex-1 rounded-2xl p-8 transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${activeChannel.color}30` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{activeChannel.emoji}</span>
                <div>
                  <h3 className="text-[20px] font-bold text-white">{activeChannel.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                    <span className="text-[12px] text-[#4ade80]">Ready to connect</span>
                  </div>
                </div>
              </div>
              <p className="text-[15px] text-white/60 leading-relaxed mb-6">{activeChannel.desc}</p>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: activeChannel.color }}>
                  Connect {activeChannel.name}
                </button>
                <span className="text-[12px] text-white/30">Takes less than 60 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] text-[#9370ff] uppercase tracking-[0.2em] font-medium">Setup</span>
            <h2 className="text-[32px] md:text-[44px] font-extrabold tracking-[-0.03em] mt-3">
              Live in{" "}
              <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                3 minutes.
              </span>
            </h2>
          </div>
          <div className="space-y-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-6 md:gap-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(147,112,255,0.15)", border: "1px solid rgba(147,112,255,0.2)" }}>
                  <span className="text-[#9370ff] text-sm font-mono font-bold">{s.num}</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-[14px] text-white/50 leading-relaxed max-w-lg">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] text-[#9370ff] uppercase tracking-[0.2em] font-medium">Pricing</span>
            <h2 className="text-[32px] md:text-[44px] font-extrabold tracking-[-0.03em] mt-3">
              One plan.{" "}
              <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Everything included.
              </span>
            </h2>
          </div>

          <div className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(147,112,255,0.3)" }}>
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] opacity-20"
              style={{ background: "radial-gradient(ellipse, rgba(147,112,255,0.5), transparent 70%)", filter: "blur(60px)" }} />

            <div className="relative z-10">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[56px] font-extrabold" style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {PLAN.price}
                </span>
                <span className="text-[18px] text-white/40">{PLAN.period}</span>
              </div>
              <p className="text-[14px] text-white/50 mb-8">Everything you need to run your own AI agent, 24/7.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {PLAN.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check size={14} className="text-[#4ade80] flex-shrink-0" />
                    <span className="text-[14px] text-white/70">{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => nav("/login")}
                className="w-full py-4 rounded-full text-[16px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)", boxShadow: "0 0 40px -8px rgba(147,112,255,0.4)" }}>
                Deploy your Boo <ArrowRight size={16} className="inline ml-2" />
              </button>
              <p className="text-center text-[12px] text-white/30 mt-3">Cancel anytime. No contracts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[32px] md:text-[44px] font-extrabold tracking-[-0.03em]">
              Real people.{" "}
              <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Real use.
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {USE_CASES.map((uc, i) => (
              <div key={i} className="p-6 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-3xl mb-3 block">{uc.emoji}</span>
                <h3 className="text-[16px] font-bold text-white mb-2">{uc.title}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed italic">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 md:py-36 px-5 md:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-20"
          style={{ background: "radial-gradient(circle, rgba(147,112,255,0.3), transparent 60%)", filter: "blur(80px)" }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="ghost-float mb-6 inline-block"><Ghost size={80} /></div>
          <h2 className="text-[36px] md:text-[52px] font-extrabold tracking-[-0.03em] mb-4">
            Your Boo is waiting.
          </h2>
          <p className="text-white/40 text-[15px] mb-10 max-w-sm mx-auto">
            Deploy once. Use forever. $20/month for an AI that never sleeps.
          </p>
          <button onClick={() => nav("/login")}
            className="px-10 py-4 rounded-full text-[16px] font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)", boxShadow: "0 0 40px -8px rgba(147,112,255,0.5)" }}>
            Get started <ArrowRight size={16} className="inline ml-2" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ghost size={16} />
            <span className="text-[12px] text-white/30">Superboo &copy; 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="/" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Home</a>
            <a href="/agent" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Agent</a>
            <a href="/pricing" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Pricing</a>
            <a href="/chat" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Chat</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes ghost-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .ghost-float { animation: ghost-float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
