import React, { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Trash2, Zap } from "lucide-react";

// A lightweight node-based "Workflow" canvas for Stakked.
// Nodes represent functional steps (trigger, action, output). Edges are SVG Bezier curves.

const NODE_TYPES = [
  { k: "trigger", label: "Trigger",   accent: "#c6ff00", desc: "When a user visits or interacts" },
  { k: "action",  label: "Action",    accent: "#ff2e9a", desc: "Do something — show, play, redirect" },
  { k: "ai",      label: "AI",        accent: "#6eaaff", desc: "Run AI — generate, summarize, respond" },
  { k: "output",  label: "Output",    accent: "#ffaa3c", desc: "End state — email, publish, track" },
];

function templateNodes() {
  return [
    { id: "n-1", type: "trigger", x: 120, y: 120, title: "Page opens", config: { event: "pageload" } },
    { id: "n-2", type: "action",  x: 440, y: 120, title: "Play hero music", config: { target: "music-1" } },
    { id: "n-3", type: "ai",      x: 760, y: 220, title: "Welcome message", config: { prompt: "Greet the visitor" } },
    { id: "n-4", type: "output",  x: 1080, y: 220, title: "Track analytics",   config: {} },
  ];
}
function templateEdges() {
  return [
    { id: "e-1", from: "n-1", to: "n-2" },
    { id: "e-2", from: "n-2", to: "n-3" },
    { id: "e-3", from: "n-3", to: "n-4" },
  ];
}

export default function WorkflowCanvas({ initialNodes, initialEdges, onChange }) {
  const [nodes, setNodes] = useState(initialNodes?.length ? initialNodes : templateNodes());
  const [edges, setEdges] = useState(initialEdges?.length ? initialEdges : templateEdges());
  const [selected, setSelected] = useState(null);
  const [draftEdge, setDraftEdge] = useState(null); // {fromId, x, y}
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const wrapRef = useRef(null);

  useEffect(() => { onChange?.({ nodes, edges }); }, [nodes, edges]); // eslint-disable-line react-hooks/exhaustive-deps

  const nodeById = (id) => nodes.find(n => n.id === id);
  const meta = (t) => NODE_TYPES.find(nt => nt.k === t) || NODE_TYPES[0];

  const addNode = (type) => {
    const mt = meta(type);
    const n = {
      id: `n-${Date.now()}`,
      type, x: 200 - pan.x, y: 200 - pan.y,
      title: `${mt.label} ${nodes.length + 1}`,
      config: {},
    };
    setNodes(prev => [...prev, n]);
    setSelected(n.id);
  };

  const deleteNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (selected === id) setSelected(null);
  };

  // ─── Drag nodes ──────────────────────────────────────────────────────────
  const startDragNode = (e, node) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelected(node.id);
    const startMouseX = e.clientX, startMouseY = e.clientY;
    const sx = node.x, sy = node.y;
    const onMove = (ev) => {
      const dx = (ev.clientX - startMouseX) / zoom;
      const dy = (ev.clientY - startMouseY) / zoom;
      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, x: sx + dx, y: sy + dy } : n));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ─── Pan empty area ──────────────────────────────────────────────────────
  const startPan = (e) => {
    if (e.target !== wrapRef.current && !e.target.dataset.bg) return;
    setSelected(null);
    const sx = e.clientX, sy = e.clientY;
    const p0 = { ...pan };
    const onMove = (ev) => setPan({ x: p0.x + (ev.clientX - sx), y: p0.y + (ev.clientY - sy) });
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ─── Create edge by dragging from port ───────────────────────────────────
  const startEdge = (e, fromId) => {
    e.stopPropagation();
    const rect = wrapRef.current.getBoundingClientRect();
    const onMove = (ev) => setDraftEdge({ fromId, x: (ev.clientX - rect.left - pan.x) / zoom, y: (ev.clientY - rect.top - pan.y) / zoom });
    const onUp = (ev) => {
      setDraftEdge(null);
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const tgtNode = el?.closest?.("[data-node-id]");
      const toId = tgtNode?.dataset?.nodeId;
      if (toId && toId !== fromId) {
        setEdges(prev => [...prev.filter(e => !(e.from === fromId && e.to === toId)), { id: `e-${Date.now()}`, from: fromId, to: toId }]);
      }
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ─── Wheel zoom ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const wheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(z => Math.max(0.3, Math.min(2, z * (e.deltaY < 0 ? 1.1 : 0.9))));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  const selectedNode = nodeById(selected);
  const updateSelectedConfig = (key, value) => {
    setNodes(prev => prev.map(n => n.id === selected ? { ...n, config: { ...n.config, [key]: value } } : n));
  };

  // Compute edge paths
  const edgePath = (from, to) => {
    // From right port of `from` to left port of `to`
    const x1 = from.x + 220, y1 = from.y + 34;
    const x2 = to.x,        y2 = to.y + 34;
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
      {/* Left add panel */}
      <div style={{ width: 220, borderRight: "1px solid var(--line)", background: "var(--surface)", padding: 12, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>// WORKFLOW NODES</div>
        {NODE_TYPES.map(t => (
          <button
            key={t.k}
            data-testid={`wf-add-${t.k}`}
            onClick={() => addNode(t.k)}
            style={{
              display: "flex", gap: 10, alignItems: "center", padding: "10px 12px",
              background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
              cursor: "pointer", textAlign: "left", transition: "all 0.15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 999, background: t.accent, boxShadow: `0 0 6px ${t.accent}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>{t.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>{t.desc}</div>
            </div>
            <Plus size={12} style={{ color: "var(--text-mute)" }} />
          </button>
        ))}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", marginTop: "auto", lineHeight: 1.6 }}>
          // Drag right-port → left-port<br />
          // Cmd+Wheel — zoom<br />
          // Drag bg — pan<br />
          // {nodes.length} nodes · {edges.length} edges
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={wrapRef}
        data-testid="workflow-canvas"
        onMouseDown={startPan}
        style={{
          flex: 1, position: "relative", overflow: "hidden",
          background: "var(--bg)",
          backgroundImage: "radial-gradient(circle, var(--line) 1px, transparent 1px)",
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          cursor: "grab",
        }}
      >
        <div data-bg="1" style={{ position: "absolute", inset: 0, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
          {/* Edges */}
          <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", width: 1, height: 1, pointerEvents: "none" }}>
            <defs>
              <marker id="wf-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
              </marker>
            </defs>
            {edges.map(e => {
              const f = nodeById(e.from); const t = nodeById(e.to);
              if (!f || !t) return null;
              return <path key={e.id} d={edgePath(f, t)} stroke="var(--accent)" strokeWidth="2" fill="none" markerEnd="url(#wf-arrow)" opacity="0.85" />;
            })}
            {draftEdge && (() => {
              const f = nodeById(draftEdge.fromId); if (!f) return null;
              const x1 = f.x + 220, y1 = f.y + 34;
              const midX = (x1 + draftEdge.x) / 2;
              return <path d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${draftEdge.y}, ${draftEdge.x} ${draftEdge.y}`} stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.7" />;
            })()}
          </svg>

          {/* Nodes */}
          {nodes.map(n => {
            const m = meta(n.type);
            const isSel = selected === n.id;
            return (
              <div
                key={n.id}
                data-node-id={n.id}
                data-testid={`wf-node-${n.id}`}
                onMouseDown={e => startDragNode(e, n)}
                style={{
                  position: "absolute", left: n.x, top: n.y, width: 220,
                  background: "var(--surface-2)",
                  border: `1.5px solid ${isSel ? "var(--accent)" : "var(--line)"}`,
                  borderRadius: "var(--r-sm)", userSelect: "none",
                  boxShadow: isSel ? "0 8px 24px -8px color-mix(in oklab, var(--accent) 50%, transparent)" : "0 4px 10px -4px rgba(0,0,0,0.4)",
                  cursor: "move",
                }}
              >
                {/* Header */}
                <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: m.accent, boxShadow: `0 0 6px ${m.accent}` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                  </div>
                  <button data-testid={`wf-delete-${n.id}`} onClick={e => { e.stopPropagation(); deleteNode(n.id); }} style={{ color: "var(--text-dim)", padding: 3 }}><Trash2 size={11} /></button>
                </div>
                {/* Body */}
                <div style={{ padding: "8px 10px", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)", lineHeight: 1.6, minHeight: 30 }}>
                  {Object.entries(n.config || {}).slice(0, 3).map(([k, v]) => (<div key={k}>{k}: <span style={{ color: "var(--text-dim)" }}>{String(v).slice(0, 20)}</span></div>))}
                  {!Object.keys(n.config || {}).length && <span style={{ color: "var(--text-dim)" }}>// click to configure</span>}
                </div>
                {/* Ports */}
                <div
                  onMouseDown={e => { e.stopPropagation(); startEdge(e, n.id); }}
                  data-testid={`wf-port-out-${n.id}`}
                  style={{ position: "absolute", right: -7, top: 28, width: 14, height: 14, borderRadius: 999, background: m.accent, border: "2px solid var(--bg)", cursor: "crosshair", boxShadow: `0 0 8px ${m.accent}` }}
                  title="Drag to connect"
                />
                <div style={{ position: "absolute", left: -7, top: 28, width: 14, height: 14, borderRadius: 999, background: "var(--bg)", border: `2px solid ${m.accent}` }} />
              </div>
            );
          })}
        </div>

        {/* Zoom indicator */}
        <div style={{ position: "absolute", bottom: 10, right: 10, padding: "4px 10px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Inspector for selected node */}
      {selectedNode && (
        <div style={{ width: 260, borderLeft: "1px solid var(--line)", background: "var(--surface)", padding: 14, flexShrink: 0, overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Zap size={14} style={{ color: "var(--accent)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>{selectedNode.title}</span>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>Title</label>
              <input data-testid="wf-node-title" className="stk-input" style={{ width: "100%", marginTop: 4 }}
                value={selectedNode.title}
                onChange={e => setNodes(prev => prev.map(n => n.id === selected ? { ...n, title: e.target.value } : n))} />
            </div>
            {selectedNode.type === "trigger" && (
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>Event</label>
                <select className="stk-input" style={{ width: "100%", marginTop: 4 }}
                  value={selectedNode.config?.event || "pageload"}
                  onChange={e => updateSelectedConfig("event", e.target.value)}>
                  {["pageload","click","scroll","timer","form_submit"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}
            {selectedNode.type === "action" && (
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>Action</label>
                <select className="stk-input" style={{ width: "100%", marginTop: 4 }}
                  value={selectedNode.config?.action || "play"}
                  onChange={e => updateSelectedConfig("action", e.target.value)}>
                  {["play","redirect","show","hide","animate","toast"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}
            {selectedNode.type === "ai" && (
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>Prompt</label>
                <textarea className="stk-input" style={{ width: "100%", marginTop: 4, height: "auto", padding: "6px 10px", resize: "vertical" }}
                  rows={3}
                  value={selectedNode.config?.prompt || ""}
                  onChange={e => updateSelectedConfig("prompt", e.target.value)} />
              </div>
            )}
            {selectedNode.type === "output" && (
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>Target</label>
                <select className="stk-input" style={{ width: "100%", marginTop: 4 }}
                  value={selectedNode.config?.target || "analytics"}
                  onChange={e => updateSelectedConfig("target", e.target.value)}>
                  {["analytics","email","webhook","publish"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 14, lineHeight: 1.6 }}>
            // Workflow is saved with the page; runtime execution is a future roadmap item.
          </div>
        </div>
      )}
    </div>
  );
}
