import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

function Section({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div style={{ borderBottom: "1px solid var(--line)" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", padding: "7px 12px", display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--text-mute)", background: "transparent", transition: "color 0.15s"
      }}>
        {title}
        <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", color: "var(--text-dim)" }} />
      </button>
      {open && <div style={{ padding: "6px 12px 12px" }}>{children}</div>}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
      <span style={{ width: 72, fontSize: 11, color: "var(--text-mute)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function StkInput({ value, onChange, type = "text", min, max, placeholder }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} min={min} max={max} placeholder={placeholder}
      className="stk-input" style={{ width: "100%" }} />
  );
}

function PageInspector({ subPage, onUpdate }) {
  if (!subPage) return null;
  const update = (key, value) => onUpdate({ ...subPage, [key]: value });
  const TRANSITIONS = ["none", "fade", "slide", "zoom", "flip"];

  return (
    <div>
      <Section title="PAGE SETTINGS">
        <Row label="Transition">
          <select value={subPage.transition || "none"} onChange={e => update("transition", e.target.value)}
            className="stk-input" style={{ width: "100%", appearance: "none" }}>
            {TRANSITIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Row>
        <Row label="Width">
          <StkInput type="number" value={subPage.canvas_width || 1440} onChange={v => update("canvas_width", Number(v))} min={320} max={3840} />
        </Row>
        <Row label="Padding">
          <StkInput type="number" value={subPage.padding || 0} onChange={v => update("padding", Number(v))} min={0} />
        </Row>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 6, letterSpacing: "0.06em" }}>
          // transitions apply when entering this page
        </div>
      </Section>
    </div>
  );
}

export default function Inspector({ selectedEl, elements, setElements, onDelete, activeSubPage, onUpdateSubPage }) {
  const update = (changes) => {
    setElements(prev => prev.map(e => e.id === selectedEl.id ? { ...e, ...changes } : e));
  };
  const updateContent = (key, value) => {
    update({ content: { ...selectedEl?.content, [key]: value } });
  };

  return (
    <aside data-testid="inspector-panel" style={{
      width: 280, background: "var(--surface)", borderLeft: "1px solid var(--line)",
      display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0
    }}>
      {/* Header */}
      <div style={{ height: 38, padding: "0 12px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>
          PAGE : <span style={{ color: "var(--accent)" }}>{activeSubPage?.name?.toUpperCase() || "HOME"}</span>
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", padding: "2px 6px", border: "1px solid var(--line)", borderRadius: 3 }}>Inspector</span>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Page settings — always visible at top */}
        <PageInspector subPage={activeSubPage} onUpdate={onUpdateSubPage} />

        {/* Divider */}
        <div style={{ margin: "8px 12px", borderTop: "1px dashed var(--line)" }} />

        {/* Element inspector or empty state */}
        {!selectedEl ? (
          <div style={{ padding: "12px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>// SELECTION EMPTY</div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>
              Select an element to edit styles, or use the page inspector above.
            </p>
          </div>
        ) : (
          <>
            {/* Element header */}
            <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>{selectedEl.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", marginTop: 1 }}>{selectedEl.type} · {selectedEl.id.slice(-6)}</div>
              </div>
              <button data-testid="delete-element-btn" onClick={() => onDelete(selectedEl.id)} style={{
                width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-dim)", borderRadius: "var(--r-sm)", transition: "all 0.15s"
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "color-mix(in oklab, var(--danger) 12%, transparent)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "transparent"; }}>
                <X size={11} />
              </button>
            </div>

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
                  <StkInput type="number" value={Math.round(selectedEl.w)} onChange={v => update({ w: Math.max(10, Number(v)) })} />
                  <StkInput type="number" value={Math.round(selectedEl.h)} onChange={v => update({ h: Math.max(10, Number(v)) })} />
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

            {/* Type-specific content */}
            {selectedEl.type === "text" && (
              <Section title="TEXT">
                <Row label="Kind">
                  <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                    {["heading","sub","body"].map(k => (
                      <button key={k} onClick={() => updateContent("kind", k)} style={{
                        flex: 1, height: 24, fontFamily: "var(--font-mono)", fontSize: 10,
                        background: (selectedEl.content?.kind || "body") === k ? "var(--accent)" : "transparent",
                        color: (selectedEl.content?.kind || "body") === k ? "var(--accent-ink)" : "var(--text-mute)",
                        borderRight: "1px solid var(--line)", transition: "all 0.15s"
                      }}>{k}</button>
                    ))}
                  </div>
                </Row>
                <Row label="Text">
                  <textarea value={selectedEl.content?.text || ""} onChange={e => updateContent("text", e.target.value)}
                    rows={3} className="stk-input" style={{ width: "100%", height: "auto", resize: "vertical", padding: "6px 8px" }} />
                </Row>
                <Row label="Size">
                  <StkInput type="number" value={selectedEl.content?.size || 16} onChange={v => updateContent("size", Number(v))} min={8} max={200} />
                </Row>
              </Section>
            )}

            {selectedEl.type === "button" && (
              <Section title="BUTTON">
                <Row label="Label"><StkInput value={selectedEl.content?.label || ""} onChange={v => updateContent("label", v)} /></Row>
                <Row label="Link"><StkInput value={selectedEl.content?.href || ""} onChange={v => updateContent("href", v)} placeholder="https://..." /></Row>
              </Section>
            )}

            {selectedEl.type === "image" && (
              <Section title="IMAGE">
                <Row label="URL"><StkInput value={selectedEl.content?.url || ""} onChange={v => updateContent("url", v)} placeholder="https://..." /></Row>
                <Row label="Fit">
                  <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                    {["cover","contain","fill"].map(k => (
                      <button key={k} onClick={() => updateContent("fit", k)} style={{
                        flex: 1, height: 24, fontFamily: "var(--font-mono)", fontSize: 9,
                        background: (selectedEl.content?.fit || "cover") === k ? "var(--accent)" : "transparent",
                        color: (selectedEl.content?.fit || "cover") === k ? "var(--accent-ink)" : "var(--text-mute)",
                        borderRight: "1px solid var(--line)"
                      }}>{k}</button>
                    ))}
                  </div>
                </Row>
              </Section>
            )}

            {selectedEl.type === "shape" && (
              <Section title="SHAPE">
                <Row label="Color"><StkInput value={selectedEl.content?.color || "var(--accent)"} onChange={v => updateContent("color", v)} /></Row>
              </Section>
            )}

            {selectedEl.type === "music" && (
              <Section title="MUSIC">
                <Row label="Title"><StkInput value={selectedEl.content?.title || ""} onChange={v => updateContent("title", v)} /></Row>
                <Row label="Duration"><StkInput value={selectedEl.content?.duration || ""} onChange={v => updateContent("duration", v)} placeholder="03:30" /></Row>
              </Section>
            )}

            {/* Visibility */}
            <Section title="VISIBILITY" defaultOpen={false}>
              <Row label="Visible">
                <button data-testid="toggle-visible-btn" onClick={() => update({ visible: !selectedEl.visible })} style={{
                  width: 36, height: 20, borderRadius: 999,
                  background: selectedEl.visible ? "var(--accent)" : "var(--line)",
                  transition: "background 0.2s", position: "relative"
                }}>
                  <span style={{ position: "absolute", top: 3, transition: "left 0.2s", left: selectedEl.visible ? 18 : 4, width: 14, height: 14, borderRadius: "50%", background: selectedEl.visible ? "var(--accent-ink)" : "var(--text-mute)" }} />
                </button>
              </Row>
              <Row label="Locked">
                <button data-testid="toggle-locked-btn" onClick={() => update({ locked: !selectedEl.locked })} style={{
                  width: 36, height: 20, borderRadius: 999,
                  background: selectedEl.locked ? "var(--accent)" : "var(--line)",
                  transition: "background 0.2s", position: "relative"
                }}>
                  <span style={{ position: "absolute", top: 3, transition: "left 0.2s", left: selectedEl.locked ? 18 : 4, width: 14, height: 14, borderRadius: "50%", background: selectedEl.locked ? "var(--accent-ink)" : "var(--text-mute)" }} />
                </button>
              </Row>
            </Section>
          </>
        )}
      </div>
    </aside>
  );
}
