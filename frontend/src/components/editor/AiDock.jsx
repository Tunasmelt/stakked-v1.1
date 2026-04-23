import React, { useState, useRef } from "react";
import { X, Sparkles, Send } from "lucide-react";
import api from "../../utils/api";

const QUICK_PROMPTS = [
  "music portfolio with album art",
  "dark neon link in bio",
  "minimal photography gallery",
  "event promo with countdown",
];

export default function AiDock({ onGenerate, onClose, theme, pageType }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState([]);
  const textareaRef = useRef(null);

  const send = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setLines(["▸ Analyzing prompt…", "▸ Planning layout…"]);

    setTimeout(() => setLines(l => [...l, "▸ Generating elements…"]), 500);
    setTimeout(() => setLines(l => [...l, "▸ Applying theme…"]), 1000);

    try {
      const r = await api.post("/ai/generate-layout", { prompt, page_type: pageType || "music", theme });
      if (r.data.elements?.length) {
        setLines(l => [...l, `✓ Generated ${r.data.elements.length} elements`, "✓ Layout ready!"]);
        setTimeout(() => {
          onGenerate(r.data.elements);
          setLoading(false);
          setLines([]);
        }, 600);
      } else {
        setLines(l => [...l, "⚠ No elements generated. Try a different prompt."]);
        setLoading(false);
      }
    } catch (err) {
      setLines(l => [...l, "✗ Error: " + (err.response?.data?.error || err.message)]);
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{
      position: "absolute", left: "50%", bottom: 20, transform: "translateX(-50%)",
      width: "min(600px, calc(100% - 80px))",
      background: "var(--surface-2)", border: "1px solid var(--line-2)",
      borderRadius: "var(--r-lg)",
      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
      zIndex: 40, overflow: "hidden",
      animation: "fadeInUp 0.25s ease"
    }}>
      {/* Header */}
      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)", animation: "pulse-glow 1.6s ease-in-out infinite" }} />
        AI LAYOUT GENERATOR · {theme?.toUpperCase()}
        <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button data-testid="ai-dock-close" onClick={onClose} style={{ color: "var(--text-dim)" }}><X size={14} /></button>
        </span>
      </div>

      {/* Lines */}
      {lines.length > 0 && (
        <div style={{ padding: "10px 14px 0", fontFamily: "var(--font-mono)", fontSize: 11 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ padding: "2px 0", color: line.startsWith("✓") ? "var(--ok)" : line.startsWith("✗") ? "var(--danger)" : "var(--text-dim)", animation: "fadeIn 0.3s ease" }}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Sparkles size={14} style={{ color: "var(--accent)", marginTop: 3, flexShrink: 0 }} />
        <textarea
          ref={textareaRef}
          data-testid="ai-prompt-input"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Describe your page… e.g. 'dark music portfolio with album art grid and social links'"
          rows={2}
          style={{
            flex: 1, resize: "none", fontFamily: "var(--font-ui)", fontSize: 14,
            color: "var(--text)", background: "transparent", outline: "none", lineHeight: 1.5
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", background: "var(--bg-2)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {QUICK_PROMPTS.map(q => (
          <button
            key={q}
            data-testid={`quick-prompt-${q.slice(0,10).replace(/\s+/g,"-")}`}
            onClick={() => setPrompt(q)}
            style={{
              padding: "4px 10px", border: "1px solid var(--line)", borderRadius: 999,
              fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)",
              transition: "border-color 0.15s, color 0.15s", cursor: "pointer"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}
          >{q}</button>
        ))}
        <button
          data-testid="ai-send-btn"
          onClick={send}
          disabled={loading || !prompt.trim()}
          style={{
            marginLeft: "auto",
            background: loading ? "var(--line)" : "var(--accent)",
            color: loading ? "var(--text-mute)" : "var(--accent-ink)",
            padding: "7px 16px", borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
            display: "inline-flex", alignItems: "center", gap: 6,
            transition: "filter 0.15s"
          }}
        >
          {loading ? "GENERATING…" : <><Send size={11} /> GENERATE</>}
        </button>
      </div>
    </div>
  );
}
