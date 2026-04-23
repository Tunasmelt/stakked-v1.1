import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Undo2, Redo2, Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, Globe, Sparkles, Eye, Download, ChevronDown } from "lucide-react";

export default function Toolbar({ page, activeSubPage, theme, mode, bp, setBp, zoom, setZoom, canvasWidth, canvasHeight, onCanvasWidthChange, onCanvasHeightChange, onPublish, onThemeDrawer, onAiDock, onSave, saved, onWorkflow, workflowMode, onUndo, onRedo, canUndo, canRedo, onExport }) {
  return (
    <div style={{
      height: 42, display: "flex", alignItems: "center", gap: 0,
      background: "var(--bg-2)", borderBottom: "1px solid var(--line)",
      flexShrink: 0, overflow: "hidden"
    }}>
      {/* Back + Reset */}
      <div style={{ display: "flex", alignItems: "center", borderRight: "1px solid var(--line)", padding: "0 8px", gap: 2, height: "100%" }}>
        <Link to="/workspace" title="Back to workspace">
          <button style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mute)"; }}>
            <ArrowLeft size={13} />
          </button>
        </Link>
        <button title="Reset view" style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mute)"; }}>
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Design / Workflow tabs */}
      <div style={{ display: "flex", alignItems: "center", borderRight: "1px solid var(--line)", padding: "0 8px", gap: 2, height: "100%" }}>
        <button
          data-testid="toolbar-design-tab"
          onClick={() => onWorkflow && onWorkflow(false)}
          style={{
            padding: "4px 10px", borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-mono)", fontSize: 11,
            background: !workflowMode ? "var(--surface)" : "transparent",
            color: !workflowMode ? "var(--text)" : "var(--text-mute)",
            border: !workflowMode ? "1px solid var(--line)" : "1px solid transparent",
            transition: "all 0.15s"
          }}
        >Design</button>
        <button
          data-testid="toolbar-workflow-tab"
          onClick={() => onWorkflow && onWorkflow(true)}
          style={{
            padding: "4px 10px", borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-mono)", fontSize: 11,
            background: workflowMode ? "var(--surface)" : "transparent",
            color: workflowMode ? "var(--text)" : "var(--text-mute)",
            border: workflowMode ? "1px solid var(--line)" : "1px solid transparent",
            transition: "all 0.15s"
          }}
        >Workflow</button>
      </div>

      {/* Undo / Redo */}
      <div style={{ display: "flex", alignItems: "center", borderRight: "1px solid var(--line)", padding: "0 8px", gap: 2, height: "100%" }}>
        <button
          data-testid="toolbar-undo"
          title="Undo (Cmd/Ctrl+Z)"
          onClick={onUndo}
          disabled={canUndo === false}
          style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: canUndo === false ? "var(--text-dim)" : "var(--text-mute)", opacity: canUndo === false ? 0.5 : 1, transition: "all 0.15s", cursor: canUndo === false ? "not-allowed" : "pointer" }}
          onMouseEnter={e => { if (canUndo !== false) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text)"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = canUndo === false ? "var(--text-dim)" : "var(--text-mute)"; }}
        >
          <Undo2 size={13} />
        </button>
        <button
          data-testid="toolbar-redo"
          title="Redo (Cmd/Ctrl+Shift+Z)"
          onClick={onRedo}
          disabled={canRedo === false}
          style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: canRedo === false ? "var(--text-dim)" : "var(--text-mute)", opacity: canRedo === false ? 0.5 : 1, transition: "all 0.15s", cursor: canRedo === false ? "not-allowed" : "pointer" }}
          onMouseEnter={e => { if (canRedo !== false) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text)"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = canRedo === false ? "var(--text-dim)" : "var(--text-mute)"; }}
        >
          <Redo2 size={13} />
        </button>
      </div>

      {/* Project name + theme */}
      <div style={{ display: "flex", alignItems: "center", borderRight: "1px solid var(--line)", padding: "0 10px", gap: 6, height: "100%", minWidth: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: 3, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 9, color: "var(--accent-ink)" }}>S</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {page?.title || "Untitled Project"}
        </div>
        <div style={{ padding: "2px 6px", background: "var(--accent)", color: "var(--accent-ink)", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>AI</div>
        <div style={{ padding: "2px 5px", border: "1px solid var(--line)", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}
          onClick={onThemeDrawer} data-testid="theme-drawer-btn">
          {theme} <ChevronDown size={9} />
        </div>
      </div>

      {/* Breakpoints — center */}
      <div style={{ display: "flex", alignItems: "center", borderRight: "1px solid var(--line)", padding: "0 10px", gap: 1, height: "100%", flexShrink: 0 }}>
        {[
          { val: "desktop", icon: <Monitor size={13} />, label: "D" },
          { val: "tablet",  icon: <Tablet size={13} />,  label: "T" },
          { val: "mobile",  icon: <Smartphone size={13} />, label: "M" },
        ].map(bpItem => (
          <button key={bpItem.val} data-testid={`bp-${bpItem.val}`} onClick={() => setBp(bpItem.val)} title={bpItem.val} style={{
            width: 30, height: 28, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center",
            background: bp === bpItem.val ? "var(--accent)" : "transparent",
            color: bp === bpItem.val ? "var(--accent-ink)" : "var(--text-mute)",
            transition: "all 0.15s"
          }}>{bpItem.icon}</button>
        ))}
      </div>

      {/* Canvas size */}
      <div style={{ display: "flex", alignItems: "center", borderRight: "1px solid var(--line)", padding: "0 8px", gap: 4, height: "100%", flexShrink: 0 }}>
        <input type="number" value={canvasWidth} onChange={e => onCanvasWidthChange(Number(e.target.value))} title="Canvas Width"
          className="stk-input" style={{ width: 52, height: 24, fontSize: 11, textAlign: "center", padding: "0 4px" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>×</span>
        <input type="number" value={canvasHeight} onChange={e => onCanvasHeightChange(Number(e.target.value))} title="Canvas Height"
          className="stk-input" style={{ width: 52, height: 24, fontSize: 11, textAlign: "center", padding: "0 4px" }} />
      </div>

      {/* Zoom */}
      <div style={{ display: "flex", alignItems: "center", borderRight: "1px solid var(--line)", padding: "0 8px", gap: 2, height: "100%", flexShrink: 0 }}>
        <button onClick={() => setZoom(z => Math.max(25, z - 25))} style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)" }}><ZoomOut size={11} /></button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)", minWidth: 34, textAlign: "center" }}>{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(200, z + 25))} style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)" }}><ZoomIn size={11} /></button>
      </div>

      {/* Right actions */}
      <div style={{ flex: 1 }} />

      {/* Saved status */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)", borderLeft: "1px solid var(--line)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: saved ? "var(--ok)" : "var(--accent)", boxShadow: saved ? "0 0 4px var(--ok)" : "0 0 4px var(--accent)", flexShrink: 0 }} />
        {saved ? "saved" : "unsaved"}
      </div>

      {/* AI button */}
      <button data-testid="ai-dock-btn" onClick={onAiDock} style={{
        padding: "0 12px", height: 28, margin: "0 4px",
        background: "var(--accent)", color: "var(--accent-ink)",
        borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11,
        display: "flex", alignItems: "center", gap: 5, transition: "filter 0.15s"
      }}
        onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
        onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
      >
        <Sparkles size={11} /> AI
      </button>

      {/* Save */}
      <button data-testid="save-page-btn" onClick={onSave} title="Save" style={{ width: 28, height: 28, margin: "0 2px", borderRadius: "var(--r-sm)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)", transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-mute)"; e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}>
        <Eye size={13} />
      </button>

      {/* Preview */}
      <button style={{ padding: "0 10px", height: 28, margin: "0 2px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-mute)"; e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}>
        ▷ Preview
      </button>

      {/* Export */}
      <button data-testid="export-btn" onClick={onExport} style={{ padding: "0 10px", height: 28, margin: "0 2px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}>
        <Download size={11} /> Export
      </button>

      {/* Publish */}
      <button data-testid="publish-btn" onClick={onPublish} style={{
        padding: "0 14px", height: 28, margin: "0 6px 0 2px",
        background: "var(--accent)", color: "var(--accent-ink)",
        borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11,
        display: "flex", alignItems: "center", gap: 5, transition: "filter 0.15s"
      }}
        onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
        onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
      >
        <Globe size={11} /> Publish
      </button>
    </div>
  );
}
