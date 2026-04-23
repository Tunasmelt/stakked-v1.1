import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { ArrowLeft, ExternalLink } from "lucide-react";

const THEME_COLORS = {
  neon: "#ff2e9a", ghost: "#f2f2f2", brutal: "#ffee00",
  paper: "#d4a574", sunset: "#ff8e53"
};

const PAGE_TYPES = ["All", "music", "portfolio", "gallery", "link-in-bio", "custom"];

export default function Gallery() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [pages, setPages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("All");
  const [sort, setSort]       = useState("recent");

  useEffect(() => {
    api.get("/pages/published")
      .then(r => setPages(r.data))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? pages : pages.filter(p => p.page_type === filter);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="scanline-overlay" />

      {/* Nav */}
      <nav style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,4vw,48px)", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.14em", fontSize: 13 }}>STAKKED</span>
          </Link>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>/ pages</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {user ? (
            <Link to="/workspace" style={{ padding: "7px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-mute)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}
            >WORKSPACE</Link>
          ) : (
            <Link to="/register" style={{ padding: "7px 14px", borderRadius: "var(--r-sm)", background: "var(--accent)", color: "var(--accent-ink)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12 }}>
              START FREE ↗
            </Link>
          )}
        </div>
      </nav>

      {/* Header */}
      <div style={{ padding: "48px clamp(16px,4vw,48px) 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.14em", marginBottom: 12 }}>01 / COMMUNITY PAGES</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Pages by the community
        </h1>
        <p style={{ color: "var(--text-mute)", fontSize: 16, marginBottom: 32, maxWidth: 500 }}>
          Browse artist pages built with Stakked. Get inspired or fork a layout to start faster.
        </p>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {PAGE_TYPES.map(t => (
            <button
              key={t}
              data-testid={`gallery-filter-${t}`}
              onClick={() => setFilter(t)}
              style={{
                padding: "6px 12px", borderRadius: 999,
                border: `1px solid ${filter === t ? "var(--accent)" : "var(--line)"}`,
                background: filter === t ? "color-mix(in oklab, var(--accent) 15%, transparent)" : "transparent",
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: filter === t ? "var(--accent)" : "var(--text-mute)",
                transition: "all 0.15s"
              }}
            >{t}</button>
          ))}
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>
            {filtered.length} pages
          </span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "0 clamp(16px,4vw,48px) 80px", maxWidth: 1280, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="shimmer" style={{ height: 240, borderRadius: "var(--r-lg)", border: "1px solid var(--line)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ color: "var(--text-mute)", fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 16 }}>
              No published pages yet. Be the first!
            </p>
            <Link to="/register" style={{
              display: "inline-block", padding: "10px 20px",
              background: "var(--accent)", color: "var(--accent-ink)",
              borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12
            }}>CREATE YOUR PAGE →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {filtered.map((p, i) => (
              <GalleryCard key={p.id} page={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryCard({ page, index }) {
  const [hov, setHov] = useState(false);
  const color = THEME_COLORS[page.theme] || "var(--accent)";

  return (
    <div
      data-testid={`gallery-card-${index}`}
      style={{
        border: `1px solid ${hov ? color : "var(--line)"}`,
        borderRadius: "var(--r-lg)", overflow: "hidden",
        background: "var(--surface)", cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s",
        transform: hov ? "translateY(-4px)" : "translateY(0)"
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Visual */}
      <div style={{
        height: 160,
        background: `linear-gradient(135deg, color-mix(in oklab, ${color} 25%, var(--bg)) 0%, var(--surface-2) 100%)`,
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color, textAlign: "center", padding: "0 12px", letterSpacing: "-0.02em", zIndex: 1 }}>
          {page.title}
        </div>
        {hov && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.15s ease" }}>
            <Link
              to={`/p/creator/${page.slug || page.id}`}
              target="_blank"
              onClick={e => e.stopPropagation()}
              style={{ padding: "8px 14px", background: "var(--accent)", color: "var(--accent-ink)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}
            >
              <ExternalLink size={12} /> VIEW PAGE
            </Link>
          </div>
        )}
      </div>
      {/* Meta */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{page.title}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color, padding: "2px 6px", border: `1px solid ${color}`, borderRadius: 3 }}>{page.theme}</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>
          {page.author_name || "creator"} · {page.page_type || "page"}
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)" }}>⑂ fork</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", marginLeft: "auto" }}>
            {new Date(page.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
