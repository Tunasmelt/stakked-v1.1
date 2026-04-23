import React, { useRef, useState, useCallback } from "react";

const SNAP = 8;

function snap(v) {
  return Math.round(v / SNAP) * SNAP;
}

function NodeContent({ el }) {
  switch (el.type) {
    case "text":
      if (el.content?.kind === "heading")
        return <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: el.content?.size || 32, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--text)", padding: 4 }}>{el.content.text || "Heading"}</div>;
      if (el.content?.kind === "sub")
        return <div style={{ fontFamily: "var(--font-ui)", fontSize: el.content?.size || 14, color: "var(--text-mute)", lineHeight: 1.45, padding: 4 }}>{el.content.text || "Subtitle text"}</div>;
      return <div style={{ fontSize: 14, color: "var(--text)", padding: 4 }}>{el.content?.text || "Text block"}</div>;
    case "button":
      return (
        <div style={{ width: "100%", height: "100%", borderRadius: 6, background: "var(--accent)", color: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>
          {el.content?.label || "Button"}
        </div>
      );
    case "image":
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", border: "1px dashed var(--line-2)", borderRadius: 4 }}>
          {el.content?.url ? (
            <img src={el.content.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} />
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
              <div>// image</div>
              <div style={{ fontSize: 9, marginTop: 2 }}>{Math.round(el.w)}×{Math.round(el.h)}</div>
            </div>
          )}
        </div>
      );
    case "music":
      return (
        <div style={{ width: "100%", height: "100%", borderRadius: 6, background: "var(--bg-2)", border: "1px solid var(--line-2)", display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
          <div style={{ width: 44, height: 44, borderRadius: 6, background: "var(--surface-2)", display: "grid", placeItems: "center", color: "var(--accent)", flexShrink: 0 }}>▶</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{el.content?.title || "Track Name"}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>00:00 / {el.content?.duration || "03:30"}</div>
            <div style={{ marginTop: 6, height: 3, background: "var(--line)", borderRadius: 999 }}>
              <div style={{ width: "40%", height: "100%", background: "var(--accent)", borderRadius: 999 }} />
            </div>
          </div>
        </div>
      );
    case "social":
      return (
        <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "0 4px" }}>
          {(el.content?.platforms || ["SP","IG","TT","YT"]).map(p => (
            <div key={p} style={{ width: 36, height: 36, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>{p}</div>
          ))}
        </div>
      );
    case "shape":
      return <div style={{ width: "100%", height: "100%", borderRadius: el.content?.round ? 999 : 6, background: el.content?.color || "var(--accent)", opacity: el.content?.opacity || 1 }} />;
    case "divider":
      return <div style={{ width: "100%", height: 2, background: "var(--line-2)", borderRadius: 999 }} />;
    case "icon":
      return <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--accent)", fontSize: Math.min(el.w, el.h) * 0.5 }}>★</div>;
    case "video":
      return (
        <div style={{ width: "100%", height: "100%", background: "var(--bg)", border: "1px dashed var(--line-2)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <div style={{ fontSize: 24, color: "var(--accent)", marginBottom: 4 }}>▶</div>
            <div>// video</div>
          </div>
        </div>
      );
    case "gallery":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, width: "100%", height: "100%", padding: 3 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: 3, background: `hsl(${i * 40}, 30%, 30%)` }} />
          ))}
        </div>
      );
    default:
      return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>{el.type}</div>;
  }
}

export default function Canvas({ elements, setElements, selected, setSelected, bp, zoom, aiLines, aiStreaming }) {
  const canvasRef = useRef(null);
  const artboardRef = useRef(null);
  const [dragging, setDragging] = useState(null); // {id, offsetX, offsetY}
  const [dropGhost, setDropGhost] = useState(null);
  const [guides, setGuides] = useState([]);

  const bpWidth = bp === "desktop" ? 820 : bp === "tablet" ? 640 : 390;

  // Drop from tray
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const art = artboardRef.current;
    if (!art) return;
    const rect = art.getBoundingClientRect();
    const scale = zoom / 100;
    const x = snap((e.clientX - rect.left) / scale);
    const y = snap((e.clientY - rect.top) / scale);
    const type = e.dataTransfer.getData("text/stk-item") || "text";
    const defaults = { text: [240,80], image: [260,260], button: [140,44], shape: [120,120], music: [440,80], social: [280,44], video: [320,200], gallery: [300,200], divider: [400,10], icon: [60,60], form: [300,200], count: [200,80] };
    const [w, h] = defaults[type] || [200, 100];
    setDropGhost({ x, y, w, h, label: type });
  }, [zoom]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDropGhost(null);
    const type = e.dataTransfer.getData("text/stk-item");
    if (!type) return;
    const art = artboardRef.current;
    if (!art) return;
    const rect = art.getBoundingClientRect();
    const scale = zoom / 100;
    const x = snap((e.clientX - rect.left) / scale);
    const y = snap((e.clientY - rect.top) / scale);
    const defaults = {
      text: { kind: "sub", text: "Your text here" },
      image: { kind: "cover" }, button: { label: "Click me →" },
      shape: { color: "var(--accent)", round: false },
      music: { title: "Track Name", duration: "03:30" },
      social: { platforms: ["SP","IG","TT","YT"] },
    };
    const sizes = { text:[240,80], image:[260,260], button:[140,44], shape:[120,120], music:[440,80], social:[280,44], video:[320,200], gallery:[300,200], divider:[400,10], icon:[60,60], form:[300,200], count:[200,80] };
    const [w, h] = sizes[type] || [200, 100];
    const newEl = {
      id: `el-${Date.now()}`,
      type, x, y, w, h,
      content: defaults[type] || {},
      name: type.charAt(0).toUpperCase() + type.slice(1),
      zIndex: elements.length, locked: false, visible: true, animations: []
    };
    setElements(prev => [...prev, newEl]);
    setSelected(newEl.id);
  }, [zoom, elements, setElements, setSelected]);

  const onDragLeave = () => setDropGhost(null);

  // Drag existing element
  const startDrag = useCallback((e, el) => {
    if (el.locked) return;
    e.stopPropagation();
    setSelected(el.id);
    const art = artboardRef.current;
    const rect = art.getBoundingClientRect();
    const scale = zoom / 100;
    const offsetX = (e.clientX - rect.left) / scale - el.x;
    const offsetY = (e.clientY - rect.top) / scale - el.y;
    setDragging({ id: el.id, offsetX, offsetY });

    const onMove = (ev) => {
      const newX = snap((ev.clientX - rect.left) / scale - offsetX);
      const newY = snap((ev.clientY - rect.top) / scale - offsetY);
      setElements(prev => prev.map(e2 => e2.id === el.id ? { ...e2, x: newX, y: newY } : e2));
      // simple center guides
      const cx = newX + el.w / 2;
      const cy = newY + el.h / 2;
      const newGuides = [];
      if (Math.abs(cx - bpWidth / 2) < 8) newGuides.push({ orient: "v", pos: bpWidth / 2 });
      if (Math.abs(cy - 300) < 8) newGuides.push({ orient: "h", pos: 300 });
      setGuides(newGuides);
    };
    const onUp = () => {
      setDragging(null);
      setGuides([]);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [zoom, bpWidth, setElements, setSelected]);

  const selectedEl = elements.find(e => e.id === selected);

  return (
    <div
      ref={canvasRef}
      data-testid="canvas-area"
      style={{ flex: 1, overflow: "auto", background: "var(--bg)", position: "relative" }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      onClick={(e) => { if (e.target === canvasRef.current || e.target.classList.contains("canvas-viewport-inner")) setSelected(null); }}
    >
      {/* Dot grid */}
      <div className="canvas-dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Artboard */}
      <div style={{ padding: "40px 40px 80px", display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          {/* Label */}
          <div style={{ position: "absolute", top: -24, left: 0, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)", display: "flex", gap: 8 }}>
            <span>{bp}</span>
            <span style={{ color: "var(--text-dim)" }}>{bpWidth}px</span>
          </div>

          <div
            ref={artboardRef}
            data-testid="artboard"
            style={{
              position: "relative",
              width: bpWidth * (zoom / 100),
              minHeight: 600 * (zoom / 100),
              background: "var(--surface)",
              border: "1px solid var(--line-2)",
              boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6)",
              overflow: "hidden",
              transform: "none",
              transition: "width 240ms cubic-bezier(.2,.8,.2,1)"
            }}
          >
            {/* Guides */}
            {guides.map((g, i) => (
              <div key={i} style={{
                position: "absolute", zIndex: 20, background: "var(--accent)", pointerEvents: "none",
                ...(g.orient === "v" ? { width: 1, top: 0, bottom: 0, left: g.pos * (zoom/100) } : { height: 1, left: 0, right: 0, top: g.pos * (zoom/100) })
              }} />
            ))}

            {/* Elements */}
            {[...elements].sort((a,b) => a.zIndex - b.zIndex).map(el => (
              <div
                key={el.id}
                data-testid={`canvas-el-${el.id}`}
                className="stk-node"
                style={{
                  left: el.x * (zoom/100),
                  top: el.y * (zoom/100),
                  width: el.w * (zoom/100),
                  height: el.h * (zoom/100),
                  cursor: el.locked ? "not-allowed" : dragging?.id === el.id ? "grabbing" : "grab",
                  opacity: el.visible ? 1 : 0.3,
                  zIndex: el.zIndex + 1
                }}
                onMouseDown={e => startDrag(e, el)}
              >
                <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                  <NodeContent el={el} />
                </div>
                {/* Selection handles */}
                {selected === el.id && (
                  <>
                    <div style={{ position: "absolute", inset: -1, border: "1.5px solid var(--accent)", pointerEvents: "none", borderRadius: 1 }} />
                    {/* handles */}
                    {[
                      { t: -4, l: -4 }, { t: -4, r: -4 }, { b: -4, l: -4 }, { b: -4, r: -4 },
                      { t: -4, l: "calc(50% - 4px)" }, { b: -4, l: "calc(50% - 4px)" },
                      { l: -4, t: "calc(50% - 4px)" }, { r: -4, t: "calc(50% - 4px)" }
                    ].map((pos, i) => (
                      <div key={i} className="stk-handle" style={{ ...pos }} />
                    ))}
                    {/* Measurement chip */}
                    <div style={{
                      position: "absolute", top: -22, left: 0,
                      fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)",
                      background: "var(--bg)", padding: "2px 6px", borderRadius: 3,
                      border: "1px solid var(--accent)", whiteSpace: "nowrap", pointerEvents: "none"
                    }}>
                      {el.name} · {Math.round(el.w)}×{Math.round(el.h)}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Drop ghost */}
            {dropGhost && (
              <div style={{
                position: "absolute",
                left: dropGhost.x * (zoom/100),
                top: dropGhost.y * (zoom/100),
                width: dropGhost.w * (zoom/100),
                height: dropGhost.h * (zoom/100),
                border: "1.5px dashed var(--accent)",
                background: "color-mix(in oklab, var(--accent) 12%, transparent)",
                borderRadius: "var(--r-sm)",
                pointerEvents: "none", zIndex: 100,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)"
              }}>
                + {dropGhost.label}
              </div>
            )}

            {/* AI streaming overlay */}
            {aiStreaming && (
              <div style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>
                  {aiLines.map((line, i) => (
                    <div key={i} style={{ padding: "2px 0", color: line.startsWith("✓") ? "var(--ok)" : "var(--accent)", animation: "fadeIn 0.3s ease" }}>
                      {line}
                    </div>
                  ))}
                  <span style={{ color: "var(--accent)", animation: "blink 0.8s step-end infinite" }}>▸ generating...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
