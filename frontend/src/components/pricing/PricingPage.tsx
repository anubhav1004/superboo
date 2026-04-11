import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

/* -- Ghost SVG -- */
function Ghost({ size = 80, id = "gPricing" }: { size?: number; id?: string }) {
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

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no commitments. Cancel with one click." },
  { q: "What's included in the free plan?", a: "10 creations per month, web chat access, and basic text skills." },
  { q: "Do I need a credit card for free?", a: "No. Sign up and start using Superboo instantly." },
  { q: "What channels does Agent support?", a: "WhatsApp, Telegram, Discord, Slack, Email, and iMessage." },
  { q: "Can I upgrade later?", a: "Yes. Upgrade or downgrade anytime from your settings." },
];

export default function PricingPage() {
  const nav = useNavigate();
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen text-white" style={{ background: "#0c0118" }}>

      {/* -- Nav -- */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)]"
        style={{ background: "rgba(12,1,24,0.8)", backdropFilter: "blur(24px)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <Ghost size={22} id="navPG" />
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

      {/* -- Hero -- */}
      <section className="relative py-20 md:py-28 px-5 md:px-8 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(147,112,255,0.2), rgba(236,72,153,0.1) 40%, transparent 70%)", filter: "blur(100px)" }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="ghost-float mb-6 inline-block">
            <div className="relative">
              <div className="absolute inset-[-16px] rounded-full" style={{ background: "radial-gradient(circle, rgba(147,112,255,0.3), transparent 70%)", filter: "blur(16px)" }} />
              <div className="relative"><Ghost size={64} /></div>
            </div>
          </div>
          <h1 className="text-[40px] sm:text-[52px] md:text-[64px] font-extrabold leading-[0.95] tracking-[-0.04em] mb-4">
            Simple{" "}
            <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899, #9370ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              pricing.
            </span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/50 max-w-md mx-auto mb-10">
            Start free. Upgrade when you need more power.
          </p>

          {/* -- Toggle -- */}
          <div className="inline-flex items-center gap-3 p-1 rounded-full mb-12"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              onClick={() => setAnnual(false)}
              className="px-5 py-2 rounded-full text-[13px] font-semibold transition-all"
              style={{
                background: !annual ? "linear-gradient(135deg, #9370ff, #EC4899)" : "transparent",
                color: !annual ? "white" : "rgba(255,255,255,0.4)",
              }}>
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="px-5 py-2 rounded-full text-[13px] font-semibold transition-all"
              style={{
                background: annual ? "linear-gradient(135deg, #9370ff, #EC4899)" : "transparent",
                color: annual ? "white" : "rgba(255,255,255,0.4)",
              }}>
              Annual <span className="text-[11px] opacity-70 ml-1">Save 33%</span>
            </button>
          </div>
        </div>
      </section>

      {/* -- Pricing Cards -- */}
      <section className="px-5 md:px-8 pb-24 md:pb-36 -mt-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Tier 1: Free */}
          <div className="rounded-2xl p-7 flex flex-col"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="mb-6">
              <h3 className="text-[18px] font-bold text-white mb-1">Free</h3>
              <p className="text-[13px] text-white/40">Try Superboo for free</p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-extrabold text-white">$0</span>
              <span className="text-[15px] text-white/30">/month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              {["10 creations/month", "Web chat only", "Basic skills (text only)", "Community support"].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check size={14} className="text-white/30 flex-shrink-0" />
                  <span className="text-[13px] text-white/60">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => nav("/login")}
              className="w-full py-3 rounded-full text-[14px] font-semibold text-white/70 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Start free
            </button>
          </div>

          {/* Tier 2: Pro */}
          <div className="rounded-2xl p-7 flex flex-col relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(147,112,255,0.4)" }}>
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] opacity-20"
              style={{ background: "radial-gradient(ellipse, rgba(147,112,255,0.5), transparent 70%)", filter: "blur(50px)" }} />
            {/* Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)", color: "white" }}>
              Most Popular
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-[18px] font-bold text-white mb-1">Pro</h3>
                <p className="text-[13px] text-white/40">For creators and students</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[48px] font-extrabold" style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {annual ? "$9.99" : "$14.99"}
                </span>
                <span className="text-[15px] text-white/30">/month</span>
              </div>
              {annual && <p className="text-[12px] text-white/30 mb-6">Billed annually</p>}
              {!annual && <p className="text-[12px] text-white/30 mb-6">Billed monthly</p>}
              <div className="space-y-3 mb-8 flex-1">
                {[
                  "Unlimited creations",
                  "All 35+ skills",
                  "File creation (slides, docs, sheets)",
                  "Image generation",
                  "Priority support",
                  "Chat history sync",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#4ade80] flex-shrink-0" />
                    <span className="text-[13px] text-white/70">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => nav("/login")}
                className="w-full py-3 rounded-full text-[14px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)", boxShadow: "0 0 30px -5px rgba(147,112,255,0.4)" }}>
                Start Pro <ArrowRight size={14} className="inline ml-1" />
              </button>
            </div>
          </div>

          {/* Tier 3: Agent */}
          <div className="rounded-2xl p-7 flex flex-col md:scale-[1.02]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(236,72,153,0.3)" }}>
            <div className="mb-6">
              <h3 className="text-[18px] font-bold text-white mb-1">Agent</h3>
              <p className="text-[13px] text-white/40">Your own 24/7 AI agent</p>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[48px] font-extrabold text-white">
                {annual ? "$29.99" : "$39.99"}
              </span>
              <span className="text-[15px] text-white/30">/month</span>
            </div>
            {annual && <p className="text-[12px] text-white/30 mb-6">Billed annually</p>}
            {!annual && <p className="text-[12px] text-white/30 mb-6">Billed monthly</p>}
            <div className="space-y-3 mb-8 flex-1">
              <p className="text-[12px] text-white/40 font-semibold uppercase tracking-wider mb-1">Everything in Pro, plus:</p>
              {[
                "Dedicated cloud (2 CPUs, 64 GB RAM)",
                "All channels (WhatsApp, Telegram, Discord, Slack, Email)",
                "Always-on 24/7",
                "Persistent memory",
                "Browser automation",
                "Custom skills",
                "API access",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check size={14} className="text-[#EC4899] flex-shrink-0" />
                  <span className="text-[13px] text-white/70">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => nav("/login")}
              className="w-full py-3 rounded-full text-[14px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #EC4899, #9370ff)", boxShadow: "0 0 30px -5px rgba(236,72,153,0.3)" }}>
              Deploy Agent <ArrowRight size={14} className="inline ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* -- FAQ -- */}
      <section className="px-5 md:px-8 pb-24 md:pb-36">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-[-0.03em] text-center mb-12">
            Frequently asked{" "}
            <span style={{ background: "linear-gradient(135deg, #C084FC, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              questions
            </span>
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}>
                  <span className="text-[14px] font-semibold">{faq.q}</span>
                  <span className="text-white/30 text-[18px] transition-transform" style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-[13px] text-white/50 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Footer -- */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ghost size={16} id="footPG" />
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
