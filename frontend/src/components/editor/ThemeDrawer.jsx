import React, { useState } from "react";
import { X } from "lucide-react";
import { THEMES } from "../../context/ThemeContext";

const THEME_SWATCHES = {
  neon:   ["#ff2e9a","#a98cff","#07000f","#f6eaff"],
  ghost:  ["#f2f2f2","#8c8c93","#0c0c0d","#f1f1f2"],
  brutal: ["#ffee00","#bfbfbf","#000000","#ffffff"],
  paper:  ["#d4a574","#b39b78","#1e1b15","#e8e2d0"],
  sunset: ["#ff8e53","#f5a98a","#1c0f14","#ffe8d6"],
};

export default function ThemeDrawer({ currentTheme, currentMode, onThemeChange, onModeChange, onClose }) {
  return (
    <div style={{
      position: "absolute", top: 48, right: 8,
      width: 360, background: "var(--surface-2)",
      border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)",
      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
      zIndex: 50, overflow: "hidden",
      animation: "fadeInUp 0.2s ease"
    }}>
      {/* Header */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-mute)" }}>◆ THEME</span>
        <button data-testid="close-theme-drawer" onClick={onClose} style={{ color: "var(--text-dim)" }}><X size={14} /></button>
      </div>

      <div style={{ padding: 12 }}>
        {/* Mode */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>MODE</div>
          <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
            {["dark","light"].map(m => (
              <button
                key={m}
                data-testid={`mode-${m}`}
                onClick={() => onModeChange(m)}
                style={{
                  flex: 1, height: 32,
                  fontFamily: "var(--font-mono)", fontSize: 12,
                  background: currentMode === m ? "var(--accent)" : "transparent",
                  color: currentMode === m ? "var(--accent-ink)" : "var(--text-mute)",
                  borderRight: m === "dark" ? "1px solid var(--line)" : "none",
                  transition: "all 0.15s"
                }}
              >{m}</button>
            ))}
          </div>
        </div>

        {/* Themes grid */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>THEME</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                data-testid={`theme-${t.id}`}
                onClick={() => onThemeChange(t.id)}
                style={{
                  border: `1px solid ${currentTheme === t.id ? "var(--accent)" : "var(--line)"}`,
                  borderRadius: "var(--r-sm)", padding: 10, cursor: "pointer",
                  display: "flex", gap: 8, alignItems: "center",
                  background: currentTheme === t.id ? "color-mix(in oklab, var(--accent) 10%, transparent)" : "transparent",
                  transition: "border-color 0.15s, background 0.15s"
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                  background: `linear-gradient(135deg, ${THEME_SWATCHES[t.id][0]} 0%, ${THEME_SWATCHES[t.id][2]} 100%)`,
                  border: "1px solid var(--line)"
                }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: currentTheme === t.id ? "var(--accent)" : "var(--text)" }}>{t.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>{THEME_SWATCHES[t.id][0]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
