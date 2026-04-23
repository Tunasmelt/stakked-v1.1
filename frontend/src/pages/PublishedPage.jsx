import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";

const THEME_VARS = {
  neon: { dark: { accent: "#ff2e9a" }, light: { accent: "#e0006a" } },
  ghost: { dark: { accent: "#f2f2f2" }, light: { accent: "#0f0f10" } },
  brutal: { dark: { accent: "#ffee00" }, light: { accent: "#ff0000" } },
  paper: { dark: { accent: "#d4a574" }, light: { accent: "#a06b2a" } },
  sunset: { dark: { accent: "#ff8e53" }, light: { accent: "#e55a2b" } },
};

function PublishedElement({ el }) {
  switch (el.type) {
    case "text":
      const isHeading = el.content?.kind === "heading";
      return (
        <div style={{
          position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h,
          fontFamily: isHeading ? "var(--font-display)" : "var(--font-ui)",
          fontWeight: isHeading ? 700 : 400,
          fontSize: el.content?.size || (isHeading ? 36 : 16),
          lineHeight: isHeading ? 1 : 1.5,
          letterSpacing: isHeading ? "-0.02em" : "normal",
          color: "var(--text)", display: "flex", alignItems: "center"
        }}>
          {el.content?.text || ""}
        </div>
      );
    case "button":
      return (
        <div style={{
          position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h,
          background: "var(--accent)", color: "var(--accent-ink)",
          borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 600, fontSize: 14, cursor: "pointer"
        }}>
          {el.content?.label || "Button"}
        </div>
      );
    case "image":
      return el.content?.url ? (
        <img src={el.content.url} alt="" style={{ position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h, objectFit: el.content?.fit || "cover", borderRadius: 6 }} />
      ) : null;
    case "shape":
      return (
        <div style={{
          position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h,
          background: el.content?.color || "var(--accent)",
          borderRadius: el.content?.round ? 999 : 6
        }} />
      );
    case "divider":
      return <div style={{ position: "absolute", left: el.x, top: el.y + el.h/2, width: el.w, height: 2, background: "var(--line-2)" }} />;
    case "social":
      return (
        <div style={{ position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h, display: "flex", gap: 8, alignItems: "center" }}>
          {(el.content?.platforms || ["SP","IG","TT","YT"]).map(p => (
            <a key={p} href="#" style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--line)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>{p}</a>
          ))}
        </div>
      );
    case "music":
      return (
        <div style={{
          position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h,
          background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8,
          display: "flex", alignItems: "center", gap: 12, padding: "0 16px"
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--accent)", display: "grid", placeItems: "center", color: "var(--accent-ink)", fontSize: 18, cursor: "pointer" }}>▶</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{el.content?.title || "Track"}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>{el.content?.duration || "03:00"}</div>
          </div>
        </div>
      );
    default: return null;
  }
}

export default function PublishedPage() {
  const { username, slug } = useParams();
  const [page, setPage]   = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/p/${username}/${slug}`)
      .then(r => {
        setPage(r.data);
        // Apply theme
        document.documentElement.setAttribute("data-theme", r.data.theme || "neon");
        document.documentElement.setAttribute("data-mode", r.data.mode || "dark");
      })
      .catch(() => setError(true));
  }, [username, slug]);

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700 }}>Page not found</h1>
      <p style={{ color: "var(--text-mute)", fontFamily: "var(--font-mono)", fontSize: 12 }}>This page doesn't exist or is not published.</p>
      <Link to="/" style={{ padding: "10px 20px", background: "var(--accent)", color: "var(--accent-ink)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12 }}>GO HOME</Link>
    </div>
  );

  if (!page) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)" }}>Loading<span className="animate-blink">_</span></span>
    </div>
  );

  const maxY = Math.max(...(page.elements || []).map(e => e.y + e.h), 600);

  return (
    <div data-testid="published-page" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Subtle watermark */}
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 100, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, opacity: 0.7 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em" }}>MADE WITH STAKKED</span>
      </div>

      {/* Page canvas */}
      <div style={{ position: "relative", width: "100%", maxWidth: 860, margin: "0 auto", minHeight: maxY + 80, padding: "40px 20px" }}>
        {(page.elements || []).filter(e => e.visible !== false).sort((a,b) => a.zIndex - b.zIndex).map(el => (
          <PublishedElement key={el.id} el={el} />
        ))}
      </div>
    </div>
  );
}
