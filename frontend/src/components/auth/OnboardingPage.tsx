import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/user";

/* ── Ghost SVG ── */
function Ghost({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#gOnboard)"
      />
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#gOnboard)" />
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#gOnboard)" />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25" />
      <defs>
        <radialGradient id="gOnboard" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const CATEGORIES = [
  { id: "content", label: "Content", emoji: "🎬", color: "#EC4899" },
  { id: "design", label: "Design", emoji: "🎨", color: "#9370ff" },
  { id: "writing", label: "Writing", emoji: "📝", color: "#22C55E" },
  { id: "video", label: "Video", emoji: "🎥", color: "#F43F5E" },
  { id: "learning", label: "Learning", emoji: "📚", color: "#06B6D4" },
  { id: "lifestyle", label: "Lifestyle", emoji: "🍕", color: "#EAB308" },
  { id: "career", label: "Career", emoji: "💼", color: "#F97316" },
  { id: "fun", label: "Fun", emoji: "🎮", color: "#A855F7" },
];

const ROLES = [
  "Student",
  "Creator",
  "Freelancer",
  "Startup",
  "Professional",
  "Just exploring",
];

export default function OnboardingPage() {
  const nav = useNavigate();
  const { user, isAuthenticated, setInterests, setRole, completeOnboarding } =
    useUserStore();

  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");

  if (!isAuthenticated || !user) {
    nav("/login", { replace: true });
    return null;
  }

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleContinueStep1 = () => {
    if (selectedCategories.length > 0) {
      setInterests(selectedCategories);
      setStep(2);
    }
  };

  const handleContinueStep2 = () => {
    if (selectedRole) {
      setRole(selectedRole);
      setStep(3);
    }
  };

  const handleFinish = () => {
    completeOnboarding();
    nav("/chat");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0c0118" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, rgba(147,112,255,0.3) 0%, rgba(236,72,153,0.15) 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-lg"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          backdropFilter: "blur(20px)",
          padding: "40px 32px",
        }}
      >
        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background:
                  s === step
                    ? "linear-gradient(135deg, #9370ff, #EC4899)"
                    : s < step
                    ? "#4ade80"
                    : "rgba(255,255,255,0.15)",
                width: s === step ? "24px" : "8px",
              }}
            />
          ))}
        </div>

        {/* ─── Step 1: Interests ─── */}
        {step === 1 && (
          <div>
            <h2
              className="text-[22px] font-extrabold text-center mb-2 tracking-tight"
              style={{
                background: "linear-gradient(135deg, #C084FC, #EC4899, #9370ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              What do you want to create?
            </h2>
            <p className="text-[13px] text-center mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              Pick 2-3 categories that interest you
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {CATEGORIES.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: selected
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.03)",
                      border: selected
                        ? `2px solid ${cat.color}`
                        : "2px solid rgba(255,255,255,0.06)",
                      boxShadow: selected
                        ? `0 0 20px -5px ${cat.color}60`
                        : "none",
                    }}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span
                      className="text-[14px] font-semibold"
                      style={{ color: selected ? "white" : "rgba(255,255,255,0.6)" }}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleContinueStep1}
              disabled={selectedCategories.length === 0}
              className="w-full py-3 rounded-full text-white text-[14px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30"
              style={{
                background: "linear-gradient(135deg, #9370ff, #EC4899)",
                boxShadow: "0 0 30px -5px rgba(147,112,255,0.4)",
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* ─── Step 2: Role ─── */}
        {step === 2 && (
          <div>
            <h2
              className="text-[22px] font-extrabold text-center mb-2 tracking-tight"
              style={{
                background: "linear-gradient(135deg, #C084FC, #EC4899, #9370ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Tell us about yourself
            </h2>
            <p className="text-[13px] text-center mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              What best describes you?
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {ROLES.map((r) => {
                const selected = selectedRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className="px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                      background: selected
                        ? "linear-gradient(135deg, #9370ff, #EC4899)"
                        : "rgba(255,255,255,0.05)",
                      border: selected
                        ? "1px solid rgba(147,112,255,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                      color: selected ? "white" : "rgba(255,255,255,0.5)",
                      boxShadow: selected
                        ? "0 0 20px -5px rgba(147,112,255,0.4)"
                        : "none",
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleContinueStep2}
              disabled={!selectedRole}
              className="w-full py-3 rounded-full text-white text-[14px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30"
              style={{
                background: "linear-gradient(135deg, #9370ff, #EC4899)",
                boxShadow: "0 0 30px -5px rgba(147,112,255,0.4)",
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* ─── Step 3: All set ─── */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center">
            <div className="ghost-float relative mb-6">
              <div
                className="absolute inset-[-20px] rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(147,112,255,0.4), transparent 70%)",
                  filter: "blur(16px)",
                }}
              />
              <div className="relative">
                <Ghost size={80} />
              </div>
            </div>

            <h2
              className="text-[24px] font-extrabold mb-3 tracking-tight"
              style={{
                background: "linear-gradient(135deg, #C084FC, #EC4899, #9370ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome to Superboo, {user.name}!
            </h2>
            <p className="text-[14px] mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
              Boo is ready to create whatever you need.
            </p>

            <button
              onClick={handleFinish}
              className="px-10 py-3 rounded-full text-white text-[14px] font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #9370ff, #EC4899)",
                boxShadow: "0 0 30px -5px rgba(147,112,255,0.4)",
              }}
            >
              Start creating &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
