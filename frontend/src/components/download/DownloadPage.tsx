import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquare, MousePointer2, Monitor } from "lucide-react";

const DMG_URL = "https://github.com/anubhav1004/superboo/releases/download/v0.1.0/Superboo-0.0.0-arm64.dmg";

/* -- Ghost SVG -- */
function Ghost({ size = 80, id = "gDL" }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128">
      <path d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z" fill={`url(#${id})`}/>
      <ellipse cx="26" cy="70" rx="10" ry="14" fill={`url(#${id})`}/>
      <ellipse cx="102" cy="70" rx="10" ry="14" fill={`url(#${id})`}/>
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764"/>
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764"/>
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764"/>
      <circle cx="50" cy="54" r="2.5" fill="white"/>
      <circle cx="74" cy="54" r="2.5" fill="white"/>
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25"/>
      <defs>
        <radialGradient id={id} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF"/><stop offset="50%" stopColor="#C084FC"/><stop offset="100%" stopColor="#6D28D9"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/* -- Features -- */
const FEATURES = [
  {
    icon: MessageSquare,
    title: "Chat Interface",
    desc: "Full Superboo chat with 35+ skills, file creation, and canvas preview. Everything from the web app, native on your Mac.",
  },
  {
    icon: MousePointer2,
    title: "Guide Mode",
    desc: "Boo follows your cursor system-wide, answers questions about your screen, and helps you in any app.",
  },
  {
    icon: Monitor,
    title: "Always On",
    desc: "Menu bar app that lives in your system tray. Press Option+Space to summon Boo from anywhere, anytime.",
  },
];

/* -- Install steps -- */
const STEPS = [
  { num: "1", title: "Download the DMG", desc: "Click the download button above to get the installer." },
  { num: "2", title: "Drag to Applications", desc: "Open the DMG and drag Superboo into your Applications folder." },
  { num: "3", title: "Open and grant permissions", desc: "Launch Superboo, grant accessibility permissions, and sign in." },
];

/* -- App Preview (CSS-only macOS window mockup) -- */
function AppPreview() {
  return (
    <div className="app-preview-frame">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8" style={{ background: "rgba(20,10,35,0.9)" }}>
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[12px] text-white/30 ml-3 font-mono">Superboo</span>
      </div>

      {/* Body */}
      <div className="flex" style={{ height: 340 }}>
        {/* Sidebar */}
        <div className="w-[180px] border-r border-white/6 p-3 flex flex-col gap-1" style={{ background: "rgba(15,6,28,0.95)" }}>
          <div className="text-[11px] text-white/30 uppercase tracking-wider px-2 py-1 mb-1">Chats</div>
          {["Pitch deck project", "TikTok scripts", "Resume polish", "Study guide"].map((c, i) => (
            <div key={i} className={`px-3 py-2 rounded-lg text-[12px] truncate ${i === 0 ? "bg-white/8 text-white/80" : "text-white/40"}`}>
              {c}
            </div>
          ))}
          <div className="mt-auto px-3 py-2 rounded-lg text-[12px] text-white/30 border border-white/6 text-center">
            + New chat
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col" style={{ background: "rgba(12,1,24,0.95)" }}>
          <div className="flex-1 p-4 space-y-3 overflow-hidden">
            {/* User message */}
            <div className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-[10px] text-white/50">Y</div>
              <div className="text-[12px] text-white/80 leading-relaxed pt-0.5">Make me a 10-slide pitch deck for my AI startup</div>
            </div>
            {/* Bot message */}
            <div className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] text-white" style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)" }}>S</div>
              <div className="text-[12px] text-white/60 leading-relaxed pt-0.5">
                <p>On it! Creating your pitch deck with:</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-[11px]"><span className="text-[#4ade80]">&#10003;</span> Market analysis</div>
                  <div className="flex items-center gap-2 text-[11px]"><span className="text-[#4ade80]">&#10003;</span> Revenue projections</div>
                  <div className="flex items-center gap-2 text-[11px]"><span className="text-white/30">...</span> Designing slides</div>
                </div>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="p-3 border-t border-white/6">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-[12px] text-white/25">Ask Boo anything...</span>
              <div className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)" }}>
                <ArrowRight size={12} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen text-white" style={{ background: "#0c0118" }}>

      {/* -- Nav -- */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)]"
        style={{ background: "rgba(12,1,24,0.8)", backdropFilter: "blur(24px)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <Ghost size={22} id="navDL" />
            <span className="text-[14px] font-bold tracking-tight text-white">Superboo</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/#section-features" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">Features</a>
            <a href="/agent" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">24x7 Agent</a>
            <a href="/pricing" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">Pricing</a>
            <a href="/download" className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">Download</a>
            <button onClick={() => nav("/login")}
              className="text-[13px] px-5 py-2 rounded-xl text-white font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)" }}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* -- Hero -- */}
      <section className="relative py-24 md:py-36 px-5 md:px-8 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(147,112,255,0.2), rgba(236,72,153,0.1) 40%, transparent 70%)", filter: "blur(100px)" }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="ghost-float mb-8 inline-block">
            <div className="relative">
              <div className="absolute inset-[-20px] rounded-full" style={{ background: "radial-gradient(circle, rgba(147,112,255,0.4), transparent 70%)", filter: "blur(20px)" }} />
              <div className="relative"><Ghost size={80} /></div>
            </div>
          </div>

          <h1 className="text-[40px] sm:text-[52px] md:text-[68px] font-extrabold leading-[0.95] tracking-[-0.04em] mb-6">
            <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899, #9370ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Superboo for Mac
            </span>
          </h1>
          <p className="text-[18px] md:text-[22px] text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your AI companion, right on your desktop.
          </p>

          <a href={DMG_URL}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-white text-[17px] font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)", boxShadow: "0 0 50px -8px rgba(147,112,255,0.5)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download for Mac
          </a>
          <p className="text-[13px] text-white/30 mt-4">
            macOS 14+ &middot; Apple Silicon
          </p>
        </div>
      </section>

      {/* -- Features (3 cards) -- */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-7 rounded-2xl transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(147,112,255,0.15)", border: "1px solid rgba(147,112,255,0.2)" }}>
                  <f.icon size={20} className="text-[#9370ff]" />
                </div>
                <h3 className="text-[18px] font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[14px] text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- App Preview -- */}
      <section className="py-16 md:py-24 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[28px] md:text-[40px] font-extrabold tracking-[-0.03em]">
              Native{" "}
              <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Mac experience.
              </span>
            </h2>
            <p className="text-white/40 text-[15px] mt-3 max-w-md mx-auto">
              A real desktop app with sidebar, chat, canvas, and guide mode.
            </p>
          </div>
          <AppPreview />
        </div>
      </section>

      {/* -- How to Install -- */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[28px] md:text-[40px] font-extrabold tracking-[-0.03em]">
              Install in{" "}
              <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                3 steps.
              </span>
            </h2>
          </div>
          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(147,112,255,0.15)", border: "1px solid rgba(147,112,255,0.2)" }}>
                  <span className="text-[#9370ff] text-sm font-bold">{s.num}</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-[14px] text-white/50 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- System Requirements -- */}
      <section className="py-16 md:py-24 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-8 md:p-10"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="text-[20px] font-bold text-white mb-6">System Requirements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-[12px] text-white/30 uppercase tracking-wider mb-1">OS</p>
                <p className="text-[15px] text-white/80">macOS 14 (Sonoma) or later</p>
              </div>
              <div>
                <p className="text-[12px] text-white/30 uppercase tracking-wider mb-1">Chip</p>
                <p className="text-[15px] text-white/80">Apple Silicon (M1, M2, M3, M4)</p>
              </div>
              <div>
                <p className="text-[12px] text-white/30 uppercase tracking-wider mb-1">Disk Space</p>
                <p className="text-[15px] text-white/80">200 MB</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- CTA -- */}
      <section className="py-24 md:py-36 px-5 md:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-20"
          style={{ background: "radial-gradient(circle, rgba(147,112,255,0.3), transparent 60%)", filter: "blur(80px)" }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="ghost-float mb-6 inline-block"><Ghost size={80} id="ctaDL" /></div>
          <h2 className="text-[36px] md:text-[52px] font-extrabold tracking-[-0.03em] mb-4">
            Get Boo on your Mac.
          </h2>
          <p className="text-white/40 text-[15px] mb-10 max-w-sm mx-auto">
            Free to download. Sign in with your Superboo account.
          </p>
          <a href={DMG_URL}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-white text-[17px] font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)", boxShadow: "0 0 50px -8px rgba(147,112,255,0.5)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download for Mac
          </a>
        </div>
      </section>

      {/* -- Footer -- */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ghost size={16} id="footDL" />
            <span className="text-[12px] text-white/30">Superboo &copy; 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="/" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Home</a>
            <a href="/agent" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Agent</a>
            <a href="/pricing" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Pricing</a>
            <a href="/download" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Download</a>
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

        .app-preview-frame {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(15,6,28,0.9);
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6), 0 0 60px -10px rgba(147,112,255,0.15);
        }
      `}</style>
    </div>
  );
}
