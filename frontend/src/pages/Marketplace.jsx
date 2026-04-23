import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Copy, Sparkles } from "lucide-react";

const THEME_COLORS = {
  neon: "#ff2e9a", ghost: "#f2f2f2", brutal: "#c6ff00",
  paper: "#d4a574", sunset: "#ff8e53"
};

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [forking, setForking] = useState(null);

  useEffect(() => { (async () => {
    try { const r = await api.get("/marketplace/templates"); setItems(r.data || []); }
    catch (e) { /* ignore */ }
    finally { setLoading(false); }
  })(); }, []);

  const fork = async (tpl) => {
    if (!user) { navigate("/login"); return; }
    setForking(tpl.id);
    try {
      const r = await api.post(`/templates/${tpl.id}/use`, { title: `${tpl.name} — fork` });
      navigate(`/editor/${r.data.id}`);
    } catch (e) {
      window.alert("Failed to fork template: " + (e.response?.data?.detail || e.message));
    } finally { setForking(null); }
  };

  return (
    <div data-testid="marketplace-page" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--line)", padding: "14px 28px", display: "flex", alignItems: "center", gap: 14 }}>
        <Link to={user ? "/workspace" : "/"} style={{ color: "var(--text-mute)", display: "flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={14} /> <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>back</span>
        </Link>
        <div style={{ width: 1, height: 18, background: "var(--line)" }} />
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>community<span style={{ color: "var(--accent)" }}>/</span><span style={{ color: "var(--text-mute)" }}>templates</span></div>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>{items.length} public</span>
      </header>

      <main style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>Templates by the community</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)", lineHeight: 1.7 }}>
            Fork a template to start a new project with the same layout. Your own templates can be made public from the editor — toolbar → ↗ Template, then toggle "public" on the template.
          </p>
        </div>

        {loading ? (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>loading templates…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center", border: "1px dashed var(--line)", borderRadius: "var(--r-lg)" }}>
            <Sparkles size={28} style={{ color: "var(--text-dim)", margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)", marginBottom: 8 }}>No public templates yet.</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>Be the first — publish one from the editor.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {items.map(tpl => {
              const color = THEME_COLORS[tpl.theme] || "var(--accent)";
              return (
                <div key={tpl.id} data-testid={`marketplace-tpl-${tpl.id}`} style={{
                  background: "var(--surface)", border: `1px solid var(--line)`, borderRadius: "var(--r-lg)",
                  overflow: "hidden", display: "flex", flexDirection: "column"
                }}>
                  <div style={{
                    height: 120,
                    background: `linear-gradient(135deg, color-mix(in oklab, ${color} 22%, var(--bg)) 0%, var(--surface-2) 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden"
                  }}>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color, textAlign: "center", padding: "0 14px", letterSpacing: "-0.02em" }}>{tpl.name}</div>
                    <div style={{ position: "absolute", top: 8, left: 8, fontFamily: "var(--font-mono)", fontSize: 9, color, padding: "2px 6px", background: "color-mix(in oklab, var(--bg) 60%, transparent)", border: `1px solid ${color}`, borderRadius: 3 }}>{tpl.theme}</div>
                    <div style={{ position: "absolute", top: 8, right: 8, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", padding: "2px 6px", background: "color-mix(in oklab, var(--bg) 60%, transparent)", border: "1px solid var(--line)", borderRadius: 3 }}>{tpl.uses || 0} forks</div>
                  </div>
                  <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{tpl.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginBottom: 10 }}>
                      by {tpl.author_name || "Anonymous"} · {(tpl.elements || []).length} elements
                    </div>
                    {tpl.description && <div style={{ fontSize: 12, color: "var(--text-mute)", lineHeight: 1.5, marginBottom: 12 }}>{tpl.description}</div>}
                    <button
                      data-testid={`fork-tpl-${tpl.id}`}
                      onClick={() => fork(tpl)}
                      disabled={forking !== null}
                      style={{
                        marginTop: "auto", height: 34, borderRadius: "var(--r-sm)",
                        background: forking === tpl.id ? "var(--line)" : "var(--accent)",
                        color: "var(--accent-ink)", fontFamily: "var(--font-mono)",
                        fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "filter 0.15s", cursor: forking ? "wait" : "pointer"
                      }}
                      onMouseEnter={e => { if (!forking) e.currentTarget.style.filter = "brightness(1.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
                    >
                      <Copy size={11} />
                      {forking === tpl.id ? "FORKING…" : "FORK TO NEW PROJECT"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
