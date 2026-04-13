import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useUserStore } from "../../store/user";

/* ── Ghost SVG ── */
function Ghost({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#gAuth)"
      />
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#gAuth)" />
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#gAuth)" />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25" />
      <defs>
        <radialGradient id="gAuth" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function AuthPage() {
  const nav = useNavigate();
  const { signup, login, isAuthenticated, isOnboarded } = useUserStore();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to={isOnboarded ? "/chat" : "/onboarding"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && name.trim().length === 0) {
      setError("Please enter your name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(name.trim(), email.trim().toLowerCase(), password);
        nav("/onboarding");
      } else {
        await login(email.trim().toLowerCase(), password);
        nav("/chat");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "white",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0c0118" }}
    >
      {/* Background blobs */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, rgba(147,112,255,0.3) 0%, rgba(236,72,153,0.15) 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(ellipse, rgba(236,72,153,0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-md"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          backdropFilter: "blur(20px)",
          padding: "40px 32px",
        }}
      >
        {/* Ghost */}
        <div className="flex justify-center mb-6">
          <div className="ghost-float relative">
            <div
              className="absolute inset-[-12px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(147,112,255,0.3), transparent 70%)",
                filter: "blur(12px)",
              }}
            />
            <div className="relative">
              <Ghost size={56} />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-[24px] font-extrabold text-center mb-2 tracking-tight"
          style={{
            background: "linear-gradient(135deg, #C084FC, #EC4899, #9370ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome to Superboo
        </h1>
        <p className="text-[13px] text-center mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          The AI built for kids
        </p>
        <p className="text-[13px] text-center mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          {mode === "login"
            ? "Sign in to continue creating"
            : "Create your account to get started"}
        </p>

        {/* Tabs */}
        <div
          className="flex mb-6 rounded-full p-1"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className="flex-1 py-2 text-[13px] font-semibold rounded-full transition-all"
            style={{
              background: mode === "login" ? "linear-gradient(135deg, #9370ff, #EC4899)" : "transparent",
              color: mode === "login" ? "white" : "rgba(255,255,255,0.4)",
            }}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className="flex-1 py-2 text-[13px] font-semibold rounded-full transition-all"
            style={{
              background: mode === "signup" ? "linear-gradient(135deg, #9370ff, #EC4899)" : "transparent",
              color: mode === "signup" ? "white" : "rgba(255,255,255,0.4)",
            }}
          >
            Create account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(147,112,255,0.4)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(147,112,255,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(147,112,255,0.4)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(147,112,255,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(147,112,255,0.4)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(147,112,255,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          {error && (
            <p className="text-[13px]" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white text-[14px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #9370ff, #EC4899)",
              boxShadow: "0 0 30px -5px rgba(147,112,255,0.4)",
            }}
          >
            {loading
              ? "..."
              : mode === "signup"
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        {/* Free plan note */}
        <p className="text-[11px] text-center mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
          Free &amp; safe for kids. No credit card.
        </p>

        {/* Toggle link */}
        <p
          className="text-[13px] text-center mt-4"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => { setMode("signup"); setError(""); }}
                className="font-semibold hover:underline"
                style={{ color: "#C084FC" }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="font-semibold hover:underline"
                style={{ color: "#C084FC" }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
