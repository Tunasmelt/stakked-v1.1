import React, { useRef, useState, useCallback } from "react";

const SNAP = 8;
const RULER_SIZE = 20;

function snap(v) { return Math.round(v / SNAP) * SNAP; }

function Ruler({ orient, size, offset, zoom }) {
  const count = Math.ceil(size / (zoom / 100) / 100) + 2;
  const scale = zoom / 100;
  const marks = Array.from({ length: count + 1 }, (_, i) => i * 100);
  const isH = orient === "h";

  return (
    <div style={{
      position: isH ? "absolute" : "absolute",
      [isH ? "top" : "left"]: 0,
      [isH ? "left" : "top"]: RULER_SIZE,
      [isH ? "width" : "height"]: isH ? `calc(100% - ${RULER_SIZE}px)` : `calc(100% - ${RULER_SIZE}px)`,
      [isH ? "height" : "width"]: RULER_SIZE,
      background: "var(--bg-2)",
      borderBottom: isH ? "1px solid var(--line)" : "none",
      borderRight: isH ? "none" : "1px solid var(--line)",
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 10,
      flexShrink: 0
    }}>
      {marks.map(val => {
        const pos = val * scale - offset;
        if (pos < -60 || pos > size + 60) return null;
        return (
          <React.Fragment key={val}>
            <div style={{
              position: "absolute",
              [isH ? "left" : "top"]: pos,
              [isH ? "top" : "left"]: 11,
              [isH ? "width" : "height"]: 1,
              [isH ? "height" : "width"]: 9,
              background: "var(--line-2)"
            }} />
            <span style={{
              position: "absolute",
              [isH ? "left" : "top"]: pos + 3,
              [isH ? "top" : "left"]: 1,
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              color: "var(--text-dim)",
              lineHeight: 1,
              pointerEvents: "none",
              writingMode: isH ? "horizontal-tb" : "vertical-lr"
            }}>{val}</span>
            {/* sub-marks */}
            {[20, 40, 60, 80].map(sub => {
              const sp = (val + sub) * scale - offset;
              if (sp < 0 || sp > size) return null;
              return (
                <div key={`${val}-${sub}`} style={{
                  position: "absolute",
                  [isH ? "left" : "top"]: sp,
                  [isH ? "top" : "left"]: 14,
                  [isH ? "width" : "height"]: 1,
                  [isH ? "height" : "width"]: 6,
                  background: "var(--line)"
                }} />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function NodeContent({ el }) {
  switch (el.type) {
    case "text":
      const isHeading = el.content?.kind === "heading";
      const isSub = el.content?.kind === "sub";
      return (
        <div style={{
          fontFamily: isHeading ? "var(--font-display)" : "var(--font-ui)",
          fontWeight: isHeading ? 700 : 400,
          fontSize: el.content?.size || (isHeading ? 32 : isSub ? 18 : 14),
          lineHeight: isHeading ? 1 : 1.45,
          letterSpacing: isHeading ? "-0.02em" : "normal",
          color: "var(--text)", padding: 4, width: "100%", height: "100%",
          display: "flex", alignItems: isHeading ? "flex-start" : "flex-start",
          wordBreak: "break-word"
        }}>{el.content?.text || (isHeading ? "Heading" : "Text block")}</div>
      );
    case "button":
      return (
        <div style={{ width: "100%", height: "100%", borderRadius: 6, background: "var(--accent)", color: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>
          {el.content?.label || "Button"}
        </div>
      );
    case "image":
      return el.content?.url ? (
        <img src={el.content.url} alt="" style={{ width: "100%", height: "100%", objectFit: el.content?.fit || "cover", borderRadius: 4, display: "block" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", border: "1px dashed var(--line-2)", borderRadius: 4, gap: 4 }}>
          <span style={{ fontSize: 22, opacity: 0.4 }}>🖼</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>{Math.round(el.w)}×{Math.round(el.h)}</span>
        </div>
      );
    case "container":
      return (
        <div style={{ width: "100%", height: "100%", border: "1px dashed var(--line-2)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>container</span>
        </div>
      );
    case "music":
      return (
        <div style={{ width: "100%", height: "100%", borderRadius: 6, background: "var(--bg-2)", border: "1px solid var(--line-2)", display: "flex", alignItems: "center", gap: 10, padding: "0 12px", overflow: "hidden" }}>
          <div style={{ width: 44, height: 44, borderRadius: 6, background: "var(--accent)", display: "grid", placeItems: "center", color: "var(--accent-ink)", flexShrink: 0, fontSize: 16 }}>▶</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{el.content?.title || "Track Name"}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>00:00 / {el.content?.duration || "03:30"}</div>
            <div style={{ marginTop: 5, height: 3, background: "var(--line)", borderRadius: 999 }}>
              <div style={{ width: "35%", height: "100%", background: "var(--accent)", borderRadius: 999 }} />
            </div>
          </div>
        </div>
      );
    case "social":
      return (
        <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "0 4px", height: "100%" }}>
          {["SP","IG","TT","YT"].map(p => (
            <div key={p} style={{ width: 36, height: 36, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>{p}</div>
          ))}
        </div>
      );
    case "shape":
      return <div style={{ width: "100%", height: "100%", borderRadius: el.content?.round ? 999 : 6, background: el.content?.color || "var(--accent)" }} />;
    case "divider":
      return <div style={{ width: "100%", height: 2, background: "var(--line-2)", borderRadius: 999, marginTop: "50%" }} />;
    case "nav":
      return (
        <div style={{ width: "100%", height: "100%", background: "var(--bg-2)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", padding: "0 16px", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--text)" }}>BRAND</span>
          {["Home","Work","About","Contact"].map(l => <span key={l} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>{l}</span>)}
        </div>
      );
    case "video":
      return (
        <div style={{ width: "100%", height: "100%", background: "var(--bg)", border: "1px dashed var(--line-2)", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontSize: 28, color: "var(--accent)", lineHeight: 1 }}>▶</div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>video</span>
        </div>
      );
    case "gallery":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, width: "100%", height: "100%", padding: 3 }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ borderRadius: 3, background: `hsl(${i * 40 + 180}, 20%, 30%)` }} />)}
        </div>
      );
    case "testimonial":
      return (
        <div style={{ width: "100%", height: "100%", padding: "12px 14px", background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 22, color: "var(--accent)", lineHeight: 1, marginBottom: 6 }}>"</div>
          <div style={{ fontSize: 13, color: "var(--text-mute)", lineHeight: 1.5 }}>Great product. Exactly what we needed.</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 8 }}>— Client Name</div>
        </div>
      );
    case "marquee":
      return (
        <div style={{ width: "100%", height: "100%", background: "var(--surface-2)", overflow: "hidden", display: "flex", alignItems: "center", borderRadius: 4 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)", whiteSpace: "nowrap", animation: "none", paddingLeft: 8 }}>
            ⟶ Scrolling text · Marquee element · Add your content · ⟶
          </div>
        </div>
      );
    default:
      return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", border: "1px dashed var(--line)", borderRadius: 4 }}>{el.type}</div>;
  }
}

export default function Canvas({ elements, setElements, selected, setSelected, bp, zoom, canvasWidth, canvasHeight, aiLines, aiStreaming }) {
  const wrapRef = useRef(null);
  const artboardRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dropGhost, setDropGhost] = useState(null);
  const [guides, setGuides]     = useState([]);
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });

  const bpWidth  = bp === "desktop" ? (canvasWidth || 1440) : bp === "tablet" ? 640 : 390;
  const bpHeight = canvasHeight || 2500;
  const scale    = zoom / 100;

  const getArtboardRect = () => artboardRef.current?.getBoundingClientRect();

  // Drop from tray / assets
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const rect = getArtboardRect();
    if (!rect) return;
    const type = e.dataTransfer.getData("text/stk-item");
    const x = snap((e.clientX - rect.left) / scale);
    const y = snap((e.clientY - rect.top) / scale);
    const sizes = { text:[240,60], image:[300,220], button:[140,44], shape:[120,120], container:[400,200], music:[460,80], social:[280,44], video:[320,200], gallery:[360,220], divider:[400,10], icon:[60,60], nav:[bpWidth,56], form:[320,220], embed:[400,300], map:[400,300], count:[200,80], testimonial:[320,160], marquee:[400,60] };
    const [w, h] = sizes[type] || [200, 100];
    setDropGhost({ x, y, w, h, label: type });
  }, [scale, bpWidth]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDropGhost(null);
    const type = e.dataTransfer.getData("text/stk-item");
    const imageUrl = e.dataTransfer.getData("text/stk-image-url");
    if (!type) return;
    const rect = getArtboardRect();
    if (!rect) return;
    const x = snap((e.clientX - rect.left) / scale);
    const y = snap((e.clientY - rect.top) / scale);
    const sizes = { text:[240,60], image:[300,220], button:[140,44], shape:[120,120], container:[400,200], music:[460,80], social:[280,44], video:[320,200], gallery:[360,220], divider:[400,10], icon:[60,60], nav:[bpWidth,56], form:[320,220], embed:[400,300], map:[400,300], count:[200,80], testimonial:[320,160], marquee:[400,60] };
    const defaults = { text: { kind: "sub", text: "Your text here" }, button: { label: "Click me →" }, shape: { color: "var(--accent)", round: false }, music: { title: "Track Name", duration: "03:30" }, social: { platforms: ["SP","IG","TT","YT"] } };
    const [w, h] = sizes[type] || [200, 100];
    const content = defaults[type] || {};
    if (type === "image" && imageUrl) content.url = imageUrl;
    const newEl = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      type, x, y, w, h, content,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      zIndex: elements.length, locked: false, visible: true, animations: []
    };
    setElements(prev => [...prev, newEl]);
    setSelected(newEl.id);
  }, [scale, bpWidth, elements, setElements, setSelected]);

  const onDragLeave = () => setDropGhost(null);

  // Drag existing element
  const startDrag = useCallback((e, el) => {
    if (el.locked) return;
    e.stopPropagation();
    setSelected(el.id);
    const rect = getArtboardRect();
    const offsetX = (e.clientX - rect.left) / scale - el.x;
    const offsetY = (e.clientY - rect.top) / scale - el.y;
    setDragging({ id: el.id });
    const onMove = (ev) => {
      const newX = snap((ev.clientX - rect.left) / scale - offsetX);
      const newY = snap((ev.clientY - rect.top) / scale - offsetY);
      setElements(prev => prev.map(e2 => e2.id === el.id ? { ...e2, x: Math.max(0, newX), y: Math.max(0, newY) } : e2));
      const cx = newX + el.w / 2;
      const gg = [];
      if (Math.abs(cx - bpWidth / 2) < 8) gg.push({ orient: "v", pos: bpWidth / 2 });
      setGuides(gg);
    };
    const onUp = () => { setDragging(null); setGuides([]); document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [scale, bpWidth, setElements, setSelected]);

  const selectedEl = elements.find(e => e.id === selected);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
      {/* Ruler row */}
      <div style={{ display: "flex", flexShrink: 0 }}>
        {/* Corner */}
        <div style={{ width: RULER_SIZE, height: RULER_SIZE, background: "var(--bg-2)", borderRight: "1px solid var(--line)", borderBottom: "1px solid var(--line)", flexShrink: 0 }} />
        {/* H Ruler */}
        <div style={{ flex: 1, height: RULER_SIZE, background: "var(--bg-2)", borderBottom: "1px solid var(--line)", overflow: "hidden", position: "relative" }}>
          <HorizontalRuler zoom={zoom} />
        </div>
      </div>
      {/* Canvas row */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* V Ruler */}
        <div style={{ width: RULER_SIZE, background: "var(--bg-2)", borderRight: "1px solid var(--line)", overflow: "hidden", position: "relative", flexShrink: 0 }}>
          <VerticalRuler zoom={zoom} />
        </div>
        {/* Scrollable artboard area */}
        <div
          ref={wrapRef}
          style={{ flex: 1, overflow: "auto", position: "relative" }}
          onClick={e => { if (e.target === wrapRef.current || e.target.dataset.canvas) setSelected(null); }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragLeave={onDragLeave}
        >
          {/* Dot grid bg */}
          <div data-canvas="1" className="canvas-dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
          {/* Artboard container */}
          <div style={{ padding: "40px 60px 80px", display: "inline-flex", justifyContent: "flex-start", minWidth: "100%" }}>
            <div style={{ position: "relative" }}>
              {/* Artboard label */}
              <div style={{ position: "absolute", top: -22, left: 0, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", display: "flex", gap: 8, pointerEvents: "none" }}>
                <span>{bp}</span><span style={{ color: "var(--line-2)" }}>·</span><span style={{ color: "var(--text-dim)" }}>{bpWidth}px</span>
              </div>
              <div
                ref={artboardRef}
                data-testid="artboard"
                style={{
                  position: "relative",
                  width: bpWidth * scale,
                  height: bpHeight * scale,
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  boxShadow: "0 16px 48px -12px rgba(0,0,0,0.6)",
                  overflow: "hidden"
                }}
              >
                {/* Alignment guides */}
                {guides.map((g, i) => (
                  <div key={i} style={{
                    position: "absolute", zIndex: 20, background: "var(--accent)",
                    ...(g.orient === "v" ? { width: 1, top: 0, bottom: 0, left: g.pos * scale } : { height: 1, left: 0, right: 0, top: g.pos * scale })
                  }} />
                ))}

                {/* Elements */}
                {[...elements].sort((a,b) => a.zIndex - b.zIndex).map(el => (
                  <div key={el.id} data-testid={`canvas-el-${el.id}`}
                    className="stk-node"
                    style={{
                      left: el.x * scale, top: el.y * scale,
                      width: el.w * scale, height: el.h * scale,
                      cursor: el.locked ? "not-allowed" : dragging?.id === el.id ? "grabbing" : "grab",
                      opacity: el.visible ? 1 : 0.25, zIndex: el.zIndex + 1
                    }}
                    onMouseDown={ev => startDrag(ev, el)}
                  >
                    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                      <NodeContent el={el} />
                    </div>
                    {selected === el.id && (
                      <>
                        <div style={{ position: "absolute", inset: -1.5, border: "1.5px solid var(--accent)", pointerEvents: "none", borderRadius: 1 }} />
                        {[[[-4,-4],["auto","auto"]],[[-4,"auto"],["auto",-4]],[["auto",-4],[-4,"auto"]],[["auto","auto"],[4,4]]].map(([tl, br], i) => null)}
                        {[
                          {top:-4,left:-4},{top:-4,right:-4},{bottom:-4,left:-4},{bottom:-4,right:-4},
                          {top:-4,left:"calc(50% - 4px)"},{bottom:-4,left:"calc(50% - 4px)"},
                          {left:-4,top:"calc(50% - 4px)"},{right:-4,top:"calc(50% - 4px)"}
                        ].map((pos, i) => <div key={i} className="stk-handle" style={pos} />)}
                        <div style={{
                          position: "absolute", top: -22, left: 0,
                          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)",
                          background: "var(--bg)", padding: "2px 6px", borderRadius: 3,
                          border: "1px solid var(--accent)", whiteSpace: "nowrap", pointerEvents: "none"
                        }}>{el.name} · {Math.round(el.w)}×{Math.round(el.h)}</div>
                      </>
                    )}
                  </div>
                ))}

                {/* Drop ghost */}
                {dropGhost && (
                  <div style={{
                    position: "absolute", left: dropGhost.x * scale, top: dropGhost.y * scale,
                    width: dropGhost.w * scale, height: dropGhost.h * scale,
                    border: "1.5px dashed var(--accent)",
                    background: "color-mix(in oklab, var(--accent) 10%, transparent)",
                    borderRadius: "var(--r-sm)", pointerEvents: "none", zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)"
                  }}>+ {dropGhost.label}</div>
                )}

                {/* AI overlay */}
                {aiStreaming && (
                  <div style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>
                      {aiLines.map((line, i) => (
                        <div key={i} style={{ padding: "2px 0", color: line.startsWith("✓") ? "var(--ok)" : "var(--accent)", animation: "fadeIn 0.3s ease" }}>{line}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HorizontalRuler({ zoom }) {
  const scale = zoom / 100;
  const marks = Array.from({ length: 40 }, (_, i) => i * 100);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {marks.map(val => {
        const pos = val * scale;
        return (
          <React.Fragment key={val}>
            <div style={{ position: "absolute", left: pos, top: 11, width: 1, height: 9, background: "var(--line-2)" }} />
            <span style={{ position: "absolute", left: pos + 2, top: 1, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-dim)", lineHeight: 1, whiteSpace: "nowrap" }}>{val}</span>
            {[20,40,60,80].map(sub => {
              const sp = (val + sub) * scale;
              return <div key={sub} style={{ position: "absolute", left: sp, top: 14, width: 1, height: 6, background: "var(--line)" }} />;
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function VerticalRuler({ zoom }) {
  const scale = zoom / 100;
  const marks = Array.from({ length: 40 }, (_, i) => i * 100);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {marks.map(val => {
        const pos = val * scale;
        return (
          <React.Fragment key={val}>
            <div style={{ position: "absolute", top: pos, left: 11, height: 1, width: 9, background: "var(--line-2)" }} />
            <span style={{ position: "absolute", top: pos + 2, left: 1, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-dim)", lineHeight: 1, writingMode: "vertical-lr", whiteSpace: "nowrap" }}>{val}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
