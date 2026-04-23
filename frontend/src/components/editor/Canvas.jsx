import React, { useRef, useState, useCallback, useEffect } from "react";

const SNAP = 8;
const RULER_SIZE = 20;
const SNAP_THRESHOLD = 6;

function snap(v) { return Math.round(v / SNAP) * SNAP; }

const HANDLES = [
  { k: "nw", pos: { top: -4,  left: -4  }, cursor: "nwse-resize" },
  { k: "n",  pos: { top: -4,  left: "calc(50% - 4px)" }, cursor: "ns-resize" },
  { k: "ne", pos: { top: -4,  right: -4 }, cursor: "nesw-resize" },
  { k: "w",  pos: { top: "calc(50% - 4px)", left: -4 }, cursor: "ew-resize" },
  { k: "e",  pos: { top: "calc(50% - 4px)", right: -4 }, cursor: "ew-resize" },
  { k: "sw", pos: { bottom: -4, left: -4 }, cursor: "nesw-resize" },
  { k: "s",  pos: { bottom: -4, left: "calc(50% - 4px)" }, cursor: "ns-resize" },
  { k: "se", pos: { bottom: -4, right: -4 }, cursor: "nwse-resize" },
];

// Animation preset class names (defined in index.css)
function getAnimationClass(anim) {
  if (!anim || anim === "none") return "";
  return `stk-anim-${anim}`;
}

function NodeContent({ el, editingText, onTextCommit }) {
  const isEditing = editingText === el.id && el.type === "text";
  switch (el.type) {
    case "text": {
      const isHeading = el.content?.kind === "heading";
      const isSub = el.content?.kind === "sub";
      const baseStyle = {
        fontFamily: isHeading ? "var(--font-display)" : "var(--font-ui)",
        fontWeight: isHeading ? 700 : 400,
        fontSize: el.content?.size || (isHeading ? 32 : isSub ? 18 : 14),
        lineHeight: isHeading ? 1 : 1.45,
        letterSpacing: isHeading ? "-0.02em" : "normal",
        color: el.content?.color || "var(--text)", padding: 4, width: "100%", height: "100%",
        display: "flex", alignItems: "flex-start",
        wordBreak: "break-word", outline: "none",
        textAlign: el.content?.align || "left",
      };
      if (isEditing) {
        return (
          <div
            contentEditable suppressContentEditableWarning autoFocus
            onBlur={e => onTextCommit(el.id, e.currentTarget.innerText)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.blur(); }
              if (e.key === "Escape") { e.preventDefault(); e.currentTarget.blur(); }
              e.stopPropagation();
            }}
            onMouseDown={e => e.stopPropagation()}
            style={{ ...baseStyle, cursor: "text", background: "color-mix(in oklab, var(--accent) 8%, transparent)", borderRadius: 2 }}
            data-testid={`text-editor-${el.id}`}
          >{el.content?.text || ""}</div>
        );
      }
      return (
        <div style={baseStyle} data-testid={`text-display-${el.id}`}>
          {el.content?.text || (isHeading ? "Heading" : "Text block")}
        </div>
      );
    }
    case "button":
      return (
        <div style={{ width: "100%", height: "100%", borderRadius: 6, background: "var(--accent)", color: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>
          {el.content?.label || "Button"}
        </div>
      );
    case "image":
      return el.content?.url ? (
        <img src={el.content.url} alt="" style={{ width: "100%", height: "100%", objectFit: el.content?.fit || "cover", borderRadius: 4, display: "block", pointerEvents: "none" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", border: "1px dashed var(--line-2)", borderRadius: 4, gap: 4 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>{Math.round(el.w)}×{Math.round(el.h)}</span>
        </div>
      );
    case "container":
      return <div style={{ width: "100%", height: "100%", border: "1px dashed var(--line-2)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>container</span></div>;
    case "music":
      return (
        <div style={{ width: "100%", height: "100%", borderRadius: 6, background: "var(--bg-2)", border: "1px solid var(--line-2)", display: "flex", alignItems: "center", gap: 10, padding: "0 12px", overflow: "hidden" }}>
          <div style={{ width: 44, height: 44, borderRadius: 6, background: "var(--accent)", display: "grid", placeItems: "center", color: "var(--accent-ink)", flexShrink: 0, fontSize: 16 }}>▶</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{el.content?.title || "Track Name"}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>00:00 / {el.content?.duration || "03:30"}</div>
            <div style={{ marginTop: 5, height: 3, background: "var(--line)", borderRadius: 999 }}><div style={{ width: "35%", height: "100%", background: "var(--accent)", borderRadius: 999 }} /></div>
          </div>
        </div>
      );
    case "social":
      return (<div style={{ display: "flex", gap: 6, alignItems: "center", padding: "0 4px", height: "100%" }}>{["SP","IG","TT","YT"].map(p => (<div key={p} style={{ width: 36, height: 36, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>{p}</div>))}</div>);
    case "shape":
      return <div style={{ width: "100%", height: "100%", borderRadius: el.content?.round ? 999 : 6, background: el.content?.color || "var(--accent)" }} />;
    case "divider":
      return <div style={{ width: "100%", height: 2, background: "var(--line-2)", borderRadius: 999, marginTop: "50%" }} />;
    case "nav":
      return (<div style={{ width: "100%", height: "100%", background: "var(--bg-2)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", padding: "0 16px", gap: 16 }}><span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--text)" }}>BRAND</span>{["Home","Work","About","Contact"].map(l => <span key={l} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>{l}</span>)}</div>);
    case "video":
      return (<div style={{ width: "100%", height: "100%", background: "var(--bg)", border: "1px dashed var(--line-2)", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}><div style={{ fontSize: 28, color: "var(--accent)", lineHeight: 1 }}>▶</div><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>video</span></div>);
    case "gallery":
      return (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, width: "100%", height: "100%", padding: 3 }}>{[...Array(6)].map((_, i) => <div key={i} style={{ borderRadius: 3, background: `hsl(${i * 40 + 180}, 20%, 30%)` }} />)}</div>);
    case "testimonial":
      return (<div style={{ width: "100%", height: "100%", padding: "12px 14px", background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--line)" }}><div style={{ fontSize: 22, color: "var(--accent)", lineHeight: 1, marginBottom: 6 }}>"</div><div style={{ fontSize: 13, color: "var(--text-mute)", lineHeight: 1.5 }}>Great product. Exactly what we needed.</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 8 }}>— Client Name</div></div>);
    case "marquee":
      return (<div style={{ width: "100%", height: "100%", background: "var(--surface-2)", overflow: "hidden", display: "flex", alignItems: "center", borderRadius: 4 }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)", whiteSpace: "nowrap", paddingLeft: 8 }}>⟶ Scrolling text · Marquee element · Add your content · ⟶</div></div>);
    default:
      return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", border: "1px dashed var(--line)", borderRadius: 4 }}>{el.type}</div>;
  }
}

export default function Canvas({
  elements, setElements,
  selectedIds, setSelectedIds, // arrays
  bp, zoom, canvasWidth, canvasHeight, aiLines, aiStreaming,
  pushHistory, artboardRefExternal
}) {
  const wrapRef = useRef(null);
  const artboardRef = useRef(null);
  // Expose artboard ref to parent (for export)
  useEffect(() => { if (artboardRefExternal) artboardRefExternal.current = artboardRef.current; }, [artboardRefExternal]);

  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [dropGhost, setDropGhost] = useState(null);
  const [guides, setGuides]     = useState([]);
  const [editingText, setEditingText] = useState(null);
  const [marquee, setMarquee]   = useState(null); // {x0,y0,x1,y1}

  const bpWidth  = bp === "desktop" ? (canvasWidth || 1440) : bp === "tablet" ? 640 : 390;
  const bpHeight = canvasHeight || 2500;
  const scale    = zoom / 100;

  const getArtboardRect = () => artboardRef.current?.getBoundingClientRect();
  const selectedSet = new Set(selectedIds || []);

  // ─── Snap targets (exclude currently-moving elements) ─────────────────────
  const getTargets = (excludeIds) => {
    const t = [];
    t.push({ axis: "x", value: 0 },             { axis: "x", value: bpWidth },       { axis: "x", value: bpWidth / 2 });
    t.push({ axis: "y", value: 0 },             { axis: "y", value: bpHeight },      { axis: "y", value: bpHeight / 2 });
    for (const el of elements) {
      if (excludeIds.has(el.id)) continue;
      t.push({ axis: "x", value: el.x },        { axis: "x", value: el.x + el.w },   { axis: "x", value: el.x + el.w / 2 });
      t.push({ axis: "y", value: el.y },        { axis: "y", value: el.y + el.h },   { axis: "y", value: el.y + el.h / 2 });
    }
    return t;
  };

  const applySnap = (proposed, excludeIds) => {
    const targets = getTargets(excludeIds);
    const cx = [proposed.x, proposed.x + proposed.w / 2, proposed.x + proposed.w];
    const cy = [proposed.y, proposed.y + proposed.h / 2, proposed.y + proposed.h];
    let dx = 0, dy = 0, bestX = SNAP_THRESHOLD + 1, bestY = SNAP_THRESHOLD + 1, gx = null, gy = null;
    for (const t of targets) {
      if (t.axis === "x") for (const c of cx) { const d = Math.abs(c - t.value); if (d < bestX) { bestX = d; dx = t.value - c; gx = t.value; } }
      else                for (const c of cy) { const d = Math.abs(c - t.value); if (d < bestY) { bestY = d; dy = t.value - c; gy = t.value; } }
    }
    const gs = [];
    if (bestX <= SNAP_THRESHOLD && gx !== null) gs.push({ orient: "v", pos: gx });
    if (bestY <= SNAP_THRESHOLD && gy !== null) gs.push({ orient: "h", pos: gy });
    return {
      x: bestX <= SNAP_THRESHOLD ? proposed.x + dx : proposed.x,
      y: bestY <= SNAP_THRESHOLD ? proposed.y + dy : proposed.y,
      guides: gs,
    };
  };

  // ─── Drop from tray / assets ──────────────────────────────────────────────
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const rect = getArtboardRect(); if (!rect) return;
    const type = e.dataTransfer.types.includes("text/stk-item") ? e.dataTransfer.getData("text/stk-item") : null;
    const x = snap((e.clientX - rect.left) / scale);
    const y = snap((e.clientY - rect.top) / scale);
    const sizes = { text:[240,60], image:[300,220], button:[140,44], shape:[120,120], container:[400,200], music:[460,80], social:[280,44], video:[320,200], gallery:[360,220], divider:[400,10], icon:[60,60], nav:[bpWidth,56], form:[320,220], embed:[400,300], map:[400,300], count:[200,80], testimonial:[320,160], marquee:[400,60] };
    const [w, h] = sizes[type] || [200, 100];
    setDropGhost({ x, y, w, h, label: type || "image" });
  }, [scale, bpWidth]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDropGhost(null);
    const type = e.dataTransfer.getData("text/stk-item");
    const imageUrl = e.dataTransfer.getData("text/stk-image-url");
    if (!type && !imageUrl) return;
    const rect = getArtboardRect(); if (!rect) return;
    const x = snap((e.clientX - rect.left) / scale);
    const y = snap((e.clientY - rect.top) / scale);
    const effectiveType = type || "image";
    const sizes = { text:[240,60], image:[300,220], button:[140,44], shape:[120,120], container:[400,200], music:[460,80], social:[280,44], video:[320,200], gallery:[360,220], divider:[400,10], icon:[60,60], nav:[bpWidth,56], form:[320,220], embed:[400,300], map:[400,300], count:[200,80], testimonial:[320,160], marquee:[400,60] };
    const defaults = { text: { kind: "sub", text: "Your text here" }, button: { label: "Click me →" }, shape: { color: "var(--accent)", round: false }, music: { title: "Track Name", duration: "03:30" }, social: { platforms: ["SP","IG","TT","YT"] } };
    const [w, h] = sizes[effectiveType] || [200, 100];
    const content = { ...(defaults[effectiveType] || {}) };
    if (effectiveType === "image" && imageUrl) content.url = imageUrl;
    const newEl = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      type: effectiveType, x, y, w, h, content,
      name: effectiveType.charAt(0).toUpperCase() + effectiveType.slice(1),
      zIndex: elements.length, locked: false, visible: true, animation: "none"
    };
    pushHistory?.();
    setElements(prev => [...prev, newEl]);
    setSelectedIds([newEl.id]);
  }, [scale, bpWidth, elements, setElements, setSelectedIds, pushHistory]);

  const onDragLeave = () => setDropGhost(null);

  // ─── Drag existing element(s) ─────────────────────────────────────────────
  const startDrag = useCallback((e, el) => {
    if (el.locked) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    // Selection logic
    const isSelected = selectedSet.has(el.id);
    let working;
    if (e.shiftKey) {
      // Toggle in selection
      if (isSelected) working = (selectedIds || []).filter(id => id !== el.id);
      else working = [...(selectedIds || []), el.id];
      setSelectedIds(working);
    } else {
      working = isSelected ? selectedIds : [el.id];
      if (!isSelected) setSelectedIds([el.id]);
    }
    if (editingText === el.id) return;

    const rect = getArtboardRect();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    // Snapshot the elements we'll be moving
    const movingSet = new Set(working);
    const startPositions = new Map();
    elements.forEach(x => { if (movingSet.has(x.id)) startPositions.set(x.id, { x: x.x, y: x.y }); });
    let moved = false;
    let captured = false;
    setDragging({ ids: working });

    const onMove = (ev) => {
      if (!moved && Math.hypot(ev.clientX - startMouseX, ev.clientY - startMouseY) < 3) return;
      if (!moved) { moved = true; if (!captured) { pushHistory?.(); captured = true; } }
      const rawDx = (ev.clientX - startMouseX) / scale;
      const rawDy = (ev.clientY - startMouseY) / scale;
      // Compute snap for the primary element (el), then apply same dx/dy to all
      const primaryStart = startPositions.get(el.id) || { x: el.x, y: el.y };
      const rawProposed = { x: snap(primaryStart.x + rawDx), y: snap(primaryStart.y + rawDy), w: el.w, h: el.h };
      const snapped = applySnap(rawProposed, movingSet);
      const dx = snapped.x - primaryStart.x;
      const dy = snapped.y - primaryStart.y;
      setElements(prev => prev.map(x => {
        if (!movingSet.has(x.id)) return x;
        const sp = startPositions.get(x.id);
        return { ...x, x: Math.max(0, sp.x + dx), y: Math.max(0, sp.y + dy) };
      }));
      setGuides(snapped.guides);
    };
    const onUp = () => {
      setDragging(null); setGuides([]);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    if (!rect) onUp();
  }, [scale, setElements, setSelectedIds, selectedIds, selectedSet, pushHistory, editingText, elements]);

  // ─── Resize (single element) ──────────────────────────────────────────────
  const startResize = useCallback((e, el, handle) => {
    if (el.locked) return;
    e.stopPropagation(); e.preventDefault();
    const startMouseX = e.clientX; const startMouseY = e.clientY;
    const start = { x: el.x, y: el.y, w: el.w, h: el.h };
    setResizing({ id: el.id, handle });
    let captured = false;
    const movingSet = new Set([el.id]);
    const onMove = (ev) => {
      if (!captured) { pushHistory?.(); captured = true; }
      const dx = (ev.clientX - startMouseX) / scale;
      const dy = (ev.clientY - startMouseY) / scale;
      let { x, y, w, h } = start;
      if (handle.includes("e")) w = Math.max(10, snap(start.w + dx));
      if (handle.includes("w")) { const nw = Math.max(10, snap(start.w - dx)); x = start.x + (start.w - nw); w = nw; }
      if (handle.includes("s")) h = Math.max(10, snap(start.h + dy));
      if (handle.includes("n")) { const nh = Math.max(10, snap(start.h - dy)); y = start.y + (start.h - nh); h = nh; }
      if (ev.shiftKey && (handle === "nw" || handle === "ne" || handle === "sw" || handle === "se")) {
        const ratio = start.w / start.h;
        if (Math.abs(w / start.w) > Math.abs(h / start.h)) h = Math.max(10, snap(w / ratio));
        else w = Math.max(10, snap(h * ratio));
        if (handle.includes("n")) y = start.y + (start.h - h);
        if (handle.includes("w")) x = start.x + (start.w - w);
      }
      const snapped = applySnap({ x, y, w, h }, movingSet);
      x = snapped.x; y = snapped.y;
      setElements(prev => prev.map(e2 => e2.id === el.id ? { ...e2, x: Math.max(0, x), y: Math.max(0, y), w, h } : e2));
      setGuides(snapped.guides);
    };
    const onUp = () => { setResizing(null); setGuides([]); document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp);
  }, [scale, setElements, pushHistory, elements, bpWidth, bpHeight]);

  // ─── Marquee select ───────────────────────────────────────────────────────
  const startMarquee = (e) => {
    // Only fire if clicking empty artboard area
    if (!(e.target === wrapRef.current || e.target.dataset.canvas || e.target === artboardRef.current)) return;
    const rect = getArtboardRect(); if (!rect) return;
    const x0 = (e.clientX - rect.left) / scale;
    const y0 = (e.clientY - rect.top) / scale;
    setMarquee({ x0, y0, x1: x0, y1: y0 });
    if (!e.shiftKey) setSelectedIds([]);
    setEditingText(null);
    const onMove = (ev) => {
      const x1 = (ev.clientX - rect.left) / scale;
      const y1 = (ev.clientY - rect.top) / scale;
      setMarquee({ x0, y0, x1, y1 });
    };
    const onUp = (ev) => {
      const x1 = (ev.clientX - rect.left) / scale;
      const y1 = (ev.clientY - rect.top) / scale;
      const rx0 = Math.min(x0, x1), rx1 = Math.max(x0, x1);
      const ry0 = Math.min(y0, y1), ry1 = Math.max(y0, y1);
      // Any element intersecting the rectangle
      const hits = elements.filter(el => {
        if (el.locked) return false;
        return el.x < rx1 && el.x + el.w > rx0 && el.y < ry1 && el.y + el.h > ry0;
      }).map(el => el.id);
      if (hits.length > 0) {
        setSelectedIds(prev => e.shiftKey ? Array.from(new Set([...(prev||[]), ...hits])) : hits);
      }
      setMarquee(null);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ─── Inline text edit ────────────────────────────────────────────────────
  const onDoubleClick = (e, el) => {
    if (el.type !== "text" || el.locked) return;
    e.stopPropagation();
    setSelectedIds([el.id]);
    setEditingText(el.id);
  };

  const commitTextEdit = (id, text) => {
    setEditingText(null);
    setElements(prev => prev.map(e => e.id === id ? { ...e, content: { ...e.content, text } } : e));
  };

  useEffect(() => {
    if (editingText && !selectedSet.has(editingText)) setEditingText(null);
  }, [selectedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute marquee rect in screen px
  const marqueeRect = marquee && {
    left: Math.min(marquee.x0, marquee.x1) * scale,
    top:  Math.min(marquee.y0, marquee.y1) * scale,
    width:  Math.abs(marquee.x1 - marquee.x0) * scale,
    height: Math.abs(marquee.y1 - marquee.y0) * scale,
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
      {/* Ruler row */}
      <div style={{ display: "flex", flexShrink: 0 }}>
        <div style={{ width: RULER_SIZE, height: RULER_SIZE, background: "var(--bg-2)", borderRight: "1px solid var(--line)", borderBottom: "1px solid var(--line)", flexShrink: 0 }} />
        <div style={{ flex: 1, height: RULER_SIZE, background: "var(--bg-2)", borderBottom: "1px solid var(--line)", overflow: "hidden", position: "relative" }}>
          <HorizontalRuler zoom={zoom} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: RULER_SIZE, background: "var(--bg-2)", borderRight: "1px solid var(--line)", overflow: "hidden", position: "relative", flexShrink: 0 }}>
          <VerticalRuler zoom={zoom} />
        </div>
        <div
          ref={wrapRef}
          style={{ flex: 1, overflow: "auto", position: "relative" }}
          onMouseDown={startMarquee}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragLeave={onDragLeave}
        >
          <div data-canvas="1" className="canvas-dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
          <div style={{ padding: "40px 60px 80px", display: "inline-flex", justifyContent: "flex-start", minWidth: "100%" }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: -22, left: 0, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", display: "flex", gap: 8, pointerEvents: "none" }}>
                <span>{bp}</span><span style={{ color: "var(--line-2)" }}>·</span><span style={{ color: "var(--text-dim)" }}>{bpWidth}px</span>
              </div>
              <div
                ref={artboardRef}
                data-testid="artboard"
                style={{
                  position: "relative",
                  width: bpWidth * scale, height: bpHeight * scale,
                  background: "var(--surface)", border: "1px solid var(--line)",
                  boxShadow: "0 16px 48px -12px rgba(0,0,0,0.6)", overflow: "hidden"
                }}
              >
                {/* Alignment guides */}
                {guides.map((g, i) => (
                  <div key={i} style={{
                    position: "absolute", zIndex: 200, background: "var(--accent)",
                    boxShadow: "0 0 4px color-mix(in oklab, var(--accent) 60%, transparent)",
                    ...(g.orient === "v" ? { width: 1, top: 0, bottom: 0, left: g.pos * scale } : { height: 1, left: 0, right: 0, top: g.pos * scale })
                  }} />
                ))}

                {/* Marquee */}
                {marqueeRect && (
                  <div data-testid="marquee-rect" style={{
                    position: "absolute", zIndex: 150,
                    left: marqueeRect.left, top: marqueeRect.top,
                    width: marqueeRect.width, height: marqueeRect.height,
                    border: "1px dashed var(--accent)",
                    background: "color-mix(in oklab, var(--accent) 8%, transparent)",
                    pointerEvents: "none"
                  }} />
                )}

                {/* Elements */}
                {[...elements].sort((a,b) => a.zIndex - b.zIndex).map(el => {
                  const isSel = selectedSet.has(el.id);
                  const isOnlySel = isSel && selectedIds?.length === 1;
                  return (
                    <div key={el.id} data-testid={`canvas-el-${el.id}`}
                      className={`stk-node ${getAnimationClass(el.animation)}`}
                      style={{
                        position: "absolute",
                        left: el.x * scale, top: el.y * scale,
                        width: el.w * scale, height: el.h * scale,
                        cursor: el.locked ? "not-allowed" : (editingText === el.id ? "text" : (dragging?.ids?.includes(el.id) ? "grabbing" : "grab")),
                        opacity: el.visible === false ? 0.25 : 1, zIndex: el.zIndex + 1
                      }}
                      onMouseDown={ev => startDrag(ev, el)}
                      onDoubleClick={ev => onDoubleClick(ev, el)}
                    >
                      <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                        <NodeContent el={el} editingText={editingText} onTextCommit={commitTextEdit} />
                      </div>
                      {isSel && (
                        <>
                          <div style={{ position: "absolute", inset: -1.5, border: "1.5px solid var(--accent)", pointerEvents: "none", borderRadius: 1 }} />
                          {isOnlySel && !el.locked && editingText !== el.id && HANDLES.map(h => (
                            <div key={h.k} data-testid={`resize-handle-${h.k}`} className="stk-handle"
                              onMouseDown={ev => startResize(ev, el, h.k)}
                              style={{ ...h.pos, cursor: h.cursor, pointerEvents: "auto" }} />
                          ))}
                          {isOnlySel && (
                            <div style={{
                              position: "absolute", top: -22, left: 0,
                              fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)",
                              background: "var(--bg)", padding: "2px 6px", borderRadius: 3,
                              border: "1px solid var(--accent)", whiteSpace: "nowrap", pointerEvents: "none"
                            }}>{el.name} · {Math.round(el.w)}×{Math.round(el.h)}{el.locked ? " · 🔒" : ""}</div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

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
                      {aiLines.map((line, i) => (<div key={i} style={{ padding: "2px 0", color: line.startsWith("✓") ? "var(--ok)" : "var(--accent)" }}>{line}</div>))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Multi-selection count badge */}
      {selectedIds?.length > 1 && (
        <div data-testid="multi-select-badge" style={{
          position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
          background: "var(--surface-2)", border: "1px solid var(--accent)", color: "var(--accent)",
          padding: "4px 10px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em",
          zIndex: 300, pointerEvents: "none"
        }}>{selectedIds.length} SELECTED</div>
      )}
    </div>
  );
}

function HorizontalRuler({ zoom }) {
  const scale = zoom / 100;
  const marks = Array.from({ length: 40 }, (_, i) => i * 100);
  return (<div style={{ position: "absolute", inset: 0 }}>{marks.map(val => { const pos = val * scale; return (<React.Fragment key={val}><div style={{ position: "absolute", left: pos, top: 11, width: 1, height: 9, background: "var(--line-2)" }} /><span style={{ position: "absolute", left: pos + 2, top: 1, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-dim)", lineHeight: 1, whiteSpace: "nowrap" }}>{val}</span>{[20,40,60,80].map(sub => { const sp = (val + sub) * scale; return <div key={sub} style={{ position: "absolute", left: sp, top: 14, width: 1, height: 6, background: "var(--line)" }} />; })}</React.Fragment>); })}</div>);
}
function VerticalRuler({ zoom }) {
  const scale = zoom / 100;
  const marks = Array.from({ length: 40 }, (_, i) => i * 100);
  return (<div style={{ position: "absolute", inset: 0 }}>{marks.map(val => { const pos = val * scale; return (<React.Fragment key={val}><div style={{ position: "absolute", top: pos, left: 11, height: 1, width: 9, background: "var(--line-2)" }} /><span style={{ position: "absolute", top: pos + 2, left: 1, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-dim)", lineHeight: 1, writingMode: "vertical-lr", whiteSpace: "nowrap" }}>{val}</span></React.Fragment>); })}</div>);
}
