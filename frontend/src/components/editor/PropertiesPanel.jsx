import React, { useState } from "react";
import { X, ChevronRight } from "lucide-react";

function Section({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div style={{ borderBottom: "1px solid var(--line)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-mute)", transition: "color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--text-mute)"}
      >
        {title}
        <ChevronRight size={12} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s", color: "var(--text-dim)" }} />
      </button>
      {open && <div style={{ padding: "6px 14px 14px" }}>{children}</div>}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <span style={{ width: 64, fontSize: 11, color: "var(--text-mute)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function StkInput({ value, onChange, type = "text", min, max }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      min={min} max={max}
      className="stk-input"
      style={{ width: "100%" }}
    />
  );
}

export default function PropertiesPanel({ selectedEl, elements, setElements, onDelete }) {
  if (!selectedEl) {
    return (
      <aside style={{ width: 280, background: "var(--surface)", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.06em" }}>NO SELECTION</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <p style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Click an element<br />to edit properties
          </p>
        </div>
      </aside>
    );
  }

  const update = (changes) => {
    setElements(prev => prev.map(e => e.id === selectedEl.id ? { ...e, ...changes } : e));
  };
  const updateContent = (key, value) => {
    update({ content: { ...selectedEl.content, [key]: value } });
  };

  return (
    <aside
      data-testid="properties-panel"
      style={{ width: 280, background: "var(--surface)", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", letterSpacing: "0.06em" }}>{selectedEl.name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{selectedEl.type} · id: {selectedEl.id.slice(-6)}</div>
        </div>
        <button
          data-testid="delete-element-btn"
          onClick={() => onDelete(selectedEl.id)}
          style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", borderRadius: "var(--r-sm)", transition: "color 0.15s, background 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "color-mix(in oklab, var(--danger) 15%, transparent)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "transparent"; }}
        ><X size={12} /></button>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Transform */}
        <Section title="TRANSFORM">
          <Row label="X · Y">
            <div style={{ display: "flex", gap: 4 }}>
              <StkInput type="number" value={Math.round(selectedEl.x)} onChange={v => update({ x: Number(v) })} />
              <StkInput type="number" value={Math.round(selectedEl.y)} onChange={v => update({ y: Number(v) })} />
            </div>
          </Row>
          <Row label="W · H">
            <div style={{ display: "flex", gap: 4 }}>
              <StkInput type="number" value={Math.round(selectedEl.w)} onChange={v => update({ w: Number(v) })} min={10} />
              <StkInput type="number" value={Math.round(selectedEl.h)} onChange={v => update({ h: Number(v) })} min={10} />
            </div>
          </Row>
          <Row label="Z-index">
            <StkInput type="number" value={selectedEl.zIndex} onChange={v => update({ zIndex: Number(v) })} min={0} />
          </Row>
        </Section>

        {/* Name */}
        <Section title="LABEL">
          <Row label="Name">
            <StkInput value={selectedEl.name} onChange={v => update({ name: v })} />
          </Row>
        </Section>

        {/* Content based on type */}
        {selectedEl.type === "text" && (
          <Section title="TEXT">
            <Row label="Kind">
              <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                {["heading","sub","body"].map(k => (
                  <button key={k} onClick={() => updateContent("kind", k)} style={{
                    flex: 1, height: 26, fontFamily: "var(--font-mono)", fontSize: 10,
                    background: selectedEl.content?.kind === k ? "var(--accent)" : "transparent",
                    color: selectedEl.content?.kind === k ? "var(--accent-ink)" : "var(--text-mute)",
                    borderRight: "1px solid var(--line)", transition: "all 0.15s"
                  }}>{k}</button>
                ))}
              </div>
            </Row>
            <Row label="Text">
              <textarea
                value={selectedEl.content?.text || ""}
                onChange={e => updateContent("text", e.target.value)}
                rows={3}
                className="stk-input"
                style={{ width: "100%", height: "auto", resize: "vertical", padding: "6px 8px" }}
              />
            </Row>
            <Row label="Size">
              <StkInput type="number" value={selectedEl.content?.size || 16} onChange={v => updateContent("size", Number(v))} min={8} max={200} />
            </Row>
          </Section>
        )}

        {selectedEl.type === "button" && (
          <Section title="BUTTON">
            <Row label="Label">
              <StkInput value={selectedEl.content?.label || ""} onChange={v => updateContent("label", v)} />
            </Row>
          </Section>
        )}

        {selectedEl.type === "image" && (
          <Section title="IMAGE">
            <Row label="URL">
              <StkInput value={selectedEl.content?.url || ""} onChange={v => updateContent("url", v)} placeholder="https://..." />
            </Row>
            <Row label="Fit">
              <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                {["cover","contain","fill"].map(k => (
                  <button key={k} onClick={() => updateContent("fit", k)} style={{
                    flex: 1, height: 26, fontFamily: "var(--font-mono)", fontSize: 9,
                    background: (selectedEl.content?.fit || "cover") === k ? "var(--accent)" : "transparent",
                    color: (selectedEl.content?.fit || "cover") === k ? "var(--accent-ink)" : "var(--text-mute)",
                    borderRight: "1px solid var(--line)"
                  }}>{k}</button>
                ))}
              </div>
            </Row>
          </Section>
        )}

        {selectedEl.type === "music" && (
          <Section title="MUSIC">
            <Row label="Title">
              <StkInput value={selectedEl.content?.title || ""} onChange={v => updateContent("title", v)} />
            </Row>
            <Row label="Duration">
              <StkInput value={selectedEl.content?.duration || ""} onChange={v => updateContent("duration", v)} placeholder="03:30" />
            </Row>
          </Section>
        )}

        {selectedEl.type === "shape" && (
          <Section title="SHAPE">
            <Row label="Color">
              <StkInput value={selectedEl.content?.color || "var(--accent)"} onChange={v => updateContent("color", v)} placeholder="var(--accent) or #hex" />
            </Row>
            <Row label="Round">
              <button
                onClick={() => updateContent("round", !selectedEl.content?.round)}
                style={{ width: 36, height: 20, borderRadius: 999, background: selectedEl.content?.round ? "var(--accent)" : "var(--line)", transition: "background 0.2s", position: "relative" }}
              >
                <span style={{ position: "absolute", top: 3, transition: "left 0.2s", left: selectedEl.content?.round ? 18 : 4, width: 14, height: 14, borderRadius: "50%", background: selectedEl.content?.round ? "var(--accent-ink)" : "var(--text-mute)" }} />
              </button>
            </Row>
          </Section>
        )}

        {/* Visibility / Lock */}
        <Section title="VISIBILITY" defaultOpen={false}>
          <Row label="Visible">
            <button
              data-testid="toggle-visible-btn"
              onClick={() => update({ visible: !selectedEl.visible })}
              style={{ width: 36, height: 20, borderRadius: 999, background: selectedEl.visible ? "var(--accent)" : "var(--line)", transition: "background 0.2s", position: "relative" }}
            >
              <span style={{ position: "absolute", top: 3, transition: "left 0.2s", left: selectedEl.visible ? 18 : 4, width: 14, height: 14, borderRadius: "50%", background: selectedEl.visible ? "var(--accent-ink)" : "var(--text-mute)" }} />
            </button>
          </Row>
          <Row label="Locked">
            <button
              data-testid="toggle-locked-btn"
              onClick={() => update({ locked: !selectedEl.locked })}
              style={{ width: 36, height: 20, borderRadius: 999, background: selectedEl.locked ? "var(--accent)" : "var(--line)", transition: "background 0.2s", position: "relative" }}
            >
              <span style={{ position: "absolute", top: 3, transition: "left 0.2s", left: selectedEl.locked ? 18 : 4, width: 14, height: 14, borderRadius: "50%", background: selectedEl.locked ? "var(--accent-ink)" : "var(--text-mute)" }} />
            </button>
          </Row>
        </Section>
      </div>
    </aside>
  );
}
