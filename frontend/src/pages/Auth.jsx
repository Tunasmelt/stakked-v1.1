import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

const ARTIST_TYPES = [
  { id: "music",     label: "Music Artist" },
  { id: "design",    label: "Designer" },
  { id: "photo",     label: "Photographer" },
  { id: "video",     label: "Video Creator" },
  { id: "social",    label: "Influencer" },
  { id: "creator",   label: "Creator" },
];

export default function Auth({ mode }) {
  const { login, register, formatError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [name, setName]             = useState("");
  const [artistType, setArtistType] = useState("creator");
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name, artistType);
      } else {
        await login(email, password);
      }
      navigate("/workspace");
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: "20px 16px", position: "relative", overflow: "hidden"
    }}>
      <div className="scanline-overlay" />
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
        backgroundSize: "48px 48px", opacity: 0.1,
        maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)"
      }} />
      {/* Accent glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 20%, transparent) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.14em", fontSize: 14 }}>STAKKED</span>
          </Link>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", marginBottom: 8 }}>
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ color: "var(--text-mute)", fontSize: 14 }}>
            {isRegister ? "Build your creative page in minutes." : "Sign in to your workspace."}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)", padding: 32
        }}>
          <form onSubmit={handleSubmit} data-testid="auth-form">
            {isRegister && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                  DISPLAY NAME
                </label>
                <input
                  data-testid="auth-name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your artist name"
                  required
                  className="stk-input"
                  style={{ width: "100%", height: 40, fontSize: 14 }}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                EMAIL
              </label>
              <input
                data-testid="auth-email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="stk-input"
                style={{ width: "100%", height: 40, fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: isRegister ? 16 : 24 }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <input
                  data-testid="auth-password-input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isRegister ? "Min. 8 characters" : "Your password"}
                  required
                  minLength={isRegister ? 8 : 1}
                  className="stk-input"
                  style={{ width: "100%", height: 40, fontSize: 14, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                  I AM A…
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {ARTIST_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      data-testid={`artist-type-${t.id}`}
                      onClick={() => setArtistType(t.id)}
                      style={{
                        padding: "8px 4px",
                        border: `1px solid ${artistType === t.id ? "var(--accent)" : "var(--line)"}`,
                        borderRadius: "var(--r-sm)",
                        background: artistType === t.id ? "color-mix(in oklab, var(--accent) 15%, transparent)" : "transparent",
                        fontFamily: "var(--font-mono)", fontSize: 10,
                        color: artistType === t.id ? "var(--accent)" : "var(--text-mute)",
                        transition: "all 0.15s"
                      }}
                    >{t.label}</button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div data-testid="auth-error" style={{
                padding: "10px 12px", marginBottom: 16,
                background: "color-mix(in oklab, var(--danger) 15%, transparent)",
                border: "1px solid var(--danger)", borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--danger)"
              }}>
                {error}
              </div>
            )}

            <button
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: "100%", height: 44,
                background: loading ? "var(--line)" : "var(--accent)",
                color: loading ? "var(--text-mute)" : "var(--accent-ink)",
                borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "filter 0.15s"
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
            >
              {loading ? (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em" }}>LOADING…</span>
              ) : (
                <>{isRegister ? "CREATE ACCOUNT" : "SIGN IN"} <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)" }}>
          {isRegister ? (
            <>Already have an account? <Link to="/login" style={{ color: "var(--accent)" }}>Sign in</Link></>
          ) : (
            <>Don't have an account? <Link to="/register" style={{ color: "var(--accent)" }}>Create one free</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
