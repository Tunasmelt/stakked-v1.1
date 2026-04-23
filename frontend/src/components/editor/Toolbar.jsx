import React from "react";
import { Link } from "react-router-dom";
import { MousePointer2, Hand, ZoomIn, ZoomOut, Monitor, Tablet, Smartphone, Globe, Palette, Sparkles, Undo2, Redo2, Save } from "lucide-react";

export default function Toolbar({ pageTitle, theme, bp, setBp, zoom, setZoom, onPublish, onThemeDrawer, onAiDock, saved, onSave }) {
  return (
    <div style={{
      height: 44, display: "flex", alignItems: "center", paddingLeft: 8, paddingRight: 8, gap: 4,
      background: "var(--bg-2)", borderBottom: "1px solid var(--line)",
      flexShrink: 0
    }}>
      {/* Logo */}
      <Link to="/workspace" style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 4, paddingRight: 8, borderRight: "1px solid var(--line)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.14em", fontSize: 12, color: "var(--text)" }}>STAKKED</span>
      </Link>

      {/* File title */}
      <button
        data-testid="page-title-btn"
        style={{
          fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)",
          padding: "4px 10px", borderRadius: "var(--r-sm)", border: "1px solid transparent",
          transition: "border-color 0.15s, background 0.15s",
          display: "flex", alignItems: "center", gap: 8
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--surface)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
      >
        {pageTitle || "untitled"}
        <span style={{ fontSize: 9, color: "var(--text-dim)" }}>▾</span>
      </button>

      <div style={{ width: 1, height: 22, background: "var(--line)", margin: "0 4px" }} />

      {/* Tools */}
      {[
        { icon: <MousePointer2 size={14} />, title: "Select (V)", active: true },
        { icon: <Hand size={14} />, title: "Pan (H)" },
      ].map((tool, i) => (
        <button key={i} title={tool.title} data-testid={`tool-btn-${i}`} style={{
          width: 28, height: 28, borderRadius: "var(--r-sm)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: tool.active ? "var(--accent)" : "var(--text-mute)",
          background: tool.active ? "var(--surface)" : "transparent",
          transition: "all 0.15s"
        }}
          onMouseEnter={e => { if (!tool.active) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text)"; }}}
          onMouseLeave={e => { if (!tool.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mute)"; }}}
        >{tool.icon}</button>
      ))}

      <div style={{ width: 1, height: 22, background: "var(--line)", margin: "0 4px" }} />

      {/* Breakpoints */}
      <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
        {[
          { val: "desktop", icon: <Monitor size={12} />, label: "D" },
          { val: "tablet",  icon: <Tablet size={12} />,  label: "T" },
          { val: "mobile",  icon: <Smartphone size={12} />,label: "M" },
        ].map(bpItem => (
          <button
            key={bpItem.val}
            data-testid={`bp-${bpItem.val}`}
            onClick={() => setBp(bpItem.val)}
            title={bpItem.val}
            style={{
              padding: "0 10px", height: 26,
              fontFamily: "var(--font-mono)", fontSize: 11,
              background: bp === bpItem.val ? "var(--accent)" : "transparent",
              color: bp === bpItem.val ? "var(--accent-ink)" : "var(--text-mute)",
              borderRight: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 4,
              transition: "all 0.15s"
            }}
          >{bpItem.icon}<span style={{ fontSize: 10 }}>{bpItem.label}</span></button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Zoom */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "0 8px", height: 26 }}>
        <button onClick={() => setZoom(z => Math.max(25, z - 25))} style={{ color: "var(--text-mute)" }}><ZoomOut size={11} /></button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)", minWidth: 36, textAlign: "center" }}>{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(200, z + 25))} style={{ color: "var(--text-mute)" }}><ZoomIn size={11} /></button>
      </div>

      <div style={{ width: 1, height: 22, background: "var(--line)", margin: "0 4px" }} />

      {/* Save indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: saved ? "var(--ok)" : "var(--accent)", boxShadow: saved ? "0 0 4px var(--ok)" : "0 0 4px var(--accent)" }} />
        {saved ? "saved" : "unsaved"}
      </div>

      {/* AI */}
      <button
        data-testid="ai-dock-btn"
        onClick={onAiDock}
        style={{
          height: 28, padding: "0 10px",
          border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)",
          display: "flex", alignItems: "center", gap: 6,
          transition: "all 0.15s"
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}
      >
        <Sparkles size={12} /> AI
      </button>

      {/* Theme */}
      <button
        data-testid="theme-drawer-btn"
        onClick={onThemeDrawer}
        style={{
          height: 28, padding: "0 10px",
          border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)",
          display: "flex", alignItems: "center", gap: 6,
          transition: "all 0.15s"
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-mute)"; e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}
      >
        <Palette size={12} /> {theme}
      </button>

      {/* Save */}
      <button
        data-testid="save-page-btn"
        onClick={onSave}
        style={{
          height: 28, padding: "0 10px",
          border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)",
          display: "flex", alignItems: "center", gap: 6,
          transition: "all 0.15s"
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-mute)"; e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}
      >
        <Save size={12} /> SAVE
      </button>

      {/* Publish */}
      <button
        data-testid="publish-btn"
        onClick={onPublish}
        style={{
          height: 28, padding: "0 14px",
          background: "var(--accent)", color: "var(--accent-ink)",
          borderRadius: "var(--r-sm)",
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12,
          display: "flex", alignItems: "center", gap: 6,
          transition: "filter 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
        onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
      >
        <Globe size={12} /> PUBLISH
      </button>
    </div>
  );
}
