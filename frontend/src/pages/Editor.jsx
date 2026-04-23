import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { savePage, loadPage } from "../utils/db";
import Toolbar from "../components/editor/Toolbar";
import LeftPanel from "../components/editor/LeftPanel";
import Canvas from "../components/editor/Canvas";
import Inspector from "../components/editor/Inspector";
import ThemeDrawer from "../components/editor/ThemeDrawer";
import AiDock from "../components/editor/AiDock";
import PublishModal from "../components/editor/PublishModal";

const HISTORY_LIMIT = 50;

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [page, setPage]               = useState(null);
  const [subPages, setSubPages]       = useState([]);
  const [activeSubPageId, setActiveSubPageId] = useState(null);
  const [elements, setElements]       = useState([]);
  const [selected, setSelected]       = useState(null);
  const [bp, setBp]                   = useState("desktop");
  const [zoom, setZoom]               = useState(75);
  const [leftTab, setLeftTab]         = useState("insert");
  const [theme, setTheme]             = useState("brutal");
  const [mode, setMode]               = useState("dark");
  const [saved, setSaved]             = useState(true);
  const [loading, setLoading]         = useState(true);
  const [workflowMode, setWorkflowMode] = useState(false);

  const [showTheme,   setShowTheme]   = useState(false);
  const [showAi,      setShowAi]      = useState(false);
  const [showPublish, setShowPublish] = useState(false);

  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiLines,    setAiLines]     = useState([]);

  // Undo/redo history (per active sub-page, reset on switch)
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  // Clipboard (in-memory)
  const clipboard = useRef(null);

  const saveTimer = useRef(null);
  const elementsRef = useRef(elements);
  const subPagesRef = useRef(subPages);
  const activeSubPageIdRef = useRef(activeSubPageId);
  const selectedRef = useRef(selected);

  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { subPagesRef.current = subPages; }, [subPages]);
  useEffect(() => { activeSubPageIdRef.current = activeSubPageId; }, [activeSubPageId]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // ─── History helpers ───────────────────────────────────────────────────────
  const pushHistory = useCallback(() => {
    undoStack.current.push(JSON.stringify(elementsRef.current));
    if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop();
    redoStack.current.push(JSON.stringify(elementsRef.current));
    try { setElements(JSON.parse(prev)); } catch (e) { /* ignore */ }
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop();
    undoStack.current.push(JSON.stringify(elementsRef.current));
    try { setElements(JSON.parse(next)); } catch (e) { /* ignore */ }
  }, []);

  // Reset history when switching sub-pages
  const resetHistory = () => { undoStack.current = []; redoStack.current = []; };

  // ─── Load page ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) { navigate("/workspace"); return; }
    (async () => {
      const local = await loadPage(id);
      if (local) {
        setPage(local);
        const sps = local.sub_pages?.length ? local.sub_pages : [{ id: `sp-default`, name: "Home", slug: "home", elements: local.elements || [], canvas_width: 1440, canvas_height: 2500, padding: 0, transition: "none" }];
        setSubPages(sps);
        setActiveSubPageId(sps[0].id);
        setElements(sps[0].elements || []);
        setTheme(local.theme || "brutal");
        setMode(local.mode || "dark");
      }
      try {
        const r = await api.get(`/pages/${id}`);
        const data = r.data;
        setPage(data);
        const sps = data.sub_pages?.length ? data.sub_pages : [{ id: `sp-default`, name: "Home", slug: "home", elements: data.elements || [], canvas_width: 1440, canvas_height: 2500, padding: 0, transition: "none" }];
        setSubPages(sps);
        setActiveSubPageId(sps[0].id);
        setElements(sps[0].elements || []);
        setTheme(data.theme || "brutal");
        setMode(data.mode || "dark");
        await savePage({ ...data, sub_pages: sps });
      } catch (e) {
        if (!local) navigate("/workspace");
      }
      setLoading(false);
      resetHistory();
    })();
  }, [id, navigate]);

  // Apply theme while editor mounted; restore on unmount
  useEffect(() => {
    const prevTheme = document.documentElement.getAttribute("data-theme");
    const prevMode  = document.documentElement.getAttribute("data-mode");
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-mode", mode);
    return () => {
      if (prevTheme) document.documentElement.setAttribute("data-theme", prevTheme);
      else           document.documentElement.removeAttribute("data-theme");
      if (prevMode)  document.documentElement.setAttribute("data-mode", prevMode);
      else           document.documentElement.removeAttribute("data-mode");
    };
  }, [theme, mode]);

  // Auto-save debounced
  useEffect(() => {
    if (!loading && page) {
      setSaved(false);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { handleSave(true); }, 2000);
    }
  }, [elements, theme, mode, subPages]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildSavePayload = () => {
    const updatedSubPages = subPagesRef.current.map(sp =>
      sp.id === activeSubPageIdRef.current ? { ...sp, elements: elementsRef.current } : sp
    );
    return { sub_pages: updatedSubPages, elements: elementsRef.current, theme, mode };
  };

  const handleSave = useCallback(async () => {
    if (!id || !page) return;
    try {
      const payload = buildSavePayload();
      const r = await api.put(`/pages/${id}`, payload);
      const newPage = { ...page, ...r.data };
      setPage(newPage);
      await savePage({ ...newPage, sub_pages: payload.sub_pages });
      setSaved(true);
    } catch (e) { console.error("Save failed", e); }
  }, [id, page, theme, mode]);

  // ─── Sub-page management ───────────────────────────────────────────────────
  const switchSubPage = useCallback((newId) => {
    setSubPages(prev => prev.map(sp =>
      sp.id === activeSubPageIdRef.current ? { ...sp, elements: elementsRef.current } : sp
    ));
    const sp = subPagesRef.current.find(s => s.id === newId);
    if (sp) {
      setElements(sp.elements || []);
      setActiveSubPageId(newId);
      setSelected(null);
      resetHistory();
    }
  }, []);

  const addSubPage = useCallback(() => {
    const newSp = {
      id: `sp-${Date.now()}`,
      name: `Page ${subPages.length + 1}`,
      slug: `page-${subPages.length + 1}`,
      elements: [],
      canvas_width: 1440, canvas_height: 2500, padding: 0, transition: "none"
    };
    setSubPages(prev => [
      ...prev.map(sp => sp.id === activeSubPageId ? { ...sp, elements } : sp),
      newSp,
    ]);
    setActiveSubPageId(newSp.id);
    setElements([]);
    setSelected(null);
    resetHistory();
  }, [subPages, activeSubPageId, elements]);

  const renameSubPage = useCallback((spId, name) => {
    setSubPages(prev => prev.map(sp =>
      sp.id === spId ? { ...sp, name, slug: name.toLowerCase().replace(/\s+/g, "-") } : sp
    ));
  }, []);

  const deleteSubPage = useCallback((spId) => {
    if (subPages.length <= 1) return;
    const remaining = subPages.filter(sp => sp.id !== spId);
    setSubPages(remaining);
    if (activeSubPageId === spId) {
      setActiveSubPageId(remaining[0].id);
      setElements(remaining[0].elements || []);
      setSelected(null);
      resetHistory();
    }
  }, [subPages, activeSubPageId]);

  const updateSubPage = useCallback((updated) => {
    setSubPages(prev => prev.map(sp => sp.id === updated.id ? { ...sp, ...updated } : sp));
  }, []);

  // ─── Element operations (with history) ─────────────────────────────────────
  const handleDeleteElement = useCallback((elId) => {
    pushHistory();
    setElements(prev => prev.filter(e => e.id !== elId));
    setSelected(null);
  }, [pushHistory]);

  const duplicateElement = useCallback((elId) => {
    const el = elementsRef.current.find(e => e.id === elId);
    if (!el) return;
    const copy = {
      ...el,
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      x: el.x + 16, y: el.y + 16,
      zIndex: elementsRef.current.length,
      content: JSON.parse(JSON.stringify(el.content || {})),
    };
    pushHistory();
    setElements(prev => [...prev, copy]);
    setSelected(copy.id);
  }, [pushHistory]);

  const copyElement = useCallback((elId) => {
    const el = elementsRef.current.find(e => e.id === elId);
    if (el) clipboard.current = JSON.parse(JSON.stringify(el));
  }, []);

  const pasteElement = useCallback(() => {
    const el = clipboard.current;
    if (!el) return;
    const copy = {
      ...el,
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      x: (el.x || 0) + 16,
      y: (el.y || 0) + 16,
      zIndex: elementsRef.current.length,
    };
    pushHistory();
    setElements(prev => [...prev, copy]);
    setSelected(copy.id);
  }, [pushHistory]);

  const bringToFront = useCallback((elId) => {
    pushHistory();
    setElements(prev => {
      const maxZ = Math.max(0, ...prev.map(e => e.zIndex || 0));
      return prev.map(e => e.id === elId ? { ...e, zIndex: maxZ + 1 } : e);
    });
  }, [pushHistory]);

  const sendToBack = useCallback((elId) => {
    pushHistory();
    setElements(prev => {
      const minZ = Math.min(0, ...prev.map(e => e.zIndex || 0));
      return prev.map(e => e.id === elId ? { ...e, zIndex: minZ - 1 } : e);
    });
  }, [pushHistory]);

  const bringForward = useCallback((elId) => {
    pushHistory();
    setElements(prev => prev.map(e => e.id === elId ? { ...e, zIndex: (e.zIndex || 0) + 1 } : e));
  }, [pushHistory]);

  const sendBackward = useCallback((elId) => {
    pushHistory();
    setElements(prev => prev.map(e => e.id === elId ? { ...e, zIndex: (e.zIndex || 0) - 1 } : e));
  }, [pushHistory]);

  // Inspector update helpers — wrap with history
  const updateElement = useCallback((elId, changes, { record = true } = {}) => {
    if (record) pushHistory();
    setElements(prev => prev.map(e => e.id === elId ? { ...e, ...changes } : e));
  }, [pushHistory]);

  const handleAiGenerate = (newElements) => {
    pushHistory();
    setElements(prev => {
      const ids = new Set(prev.map(e => e.id));
      return [...prev, ...newElements.filter(e => !ids.has(e.id))];
    });
    setShowAi(false);
  };

  const handleThemeChange = (t) => { setTheme(t); setShowTheme(false); };
  const handleModeChange  = (m) => { setMode(m); };

  const activeSubPage = subPages.find(sp => sp.id === activeSubPageId);
  const selectedEl    = elements.find(e => e.id === selected);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Skip when typing in inputs/textareas/contentEditable
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

      const meta = e.ctrlKey || e.metaKey;
      const sel = selectedRef.current;

      // Save
      if (meta && e.key.toLowerCase() === "s") { e.preventDefault(); handleSave(); return; }
      // Undo / Redo
      if (meta && !e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); return; }
      if (meta && (e.shiftKey && e.key.toLowerCase() === "z" || e.key.toLowerCase() === "y")) { e.preventDefault(); redo(); return; }
      // Copy / Paste / Duplicate / Cut
      if (meta && e.key.toLowerCase() === "c" && sel) { e.preventDefault(); copyElement(sel); return; }
      if (meta && e.key.toLowerCase() === "v") { e.preventDefault(); pasteElement(); return; }
      if (meta && e.key.toLowerCase() === "d" && sel) { e.preventDefault(); duplicateElement(sel); return; }
      if (meta && e.key.toLowerCase() === "x" && sel) {
        e.preventDefault();
        copyElement(sel);
        handleDeleteElement(sel);
        return;
      }
      // Z-order: Cmd+] / Cmd+[
      if (meta && e.key === "]" && sel) { e.preventDefault(); e.shiftKey ? bringToFront(sel) : bringForward(sel); return; }
      if (meta && e.key === "[" && sel) { e.preventDefault(); e.shiftKey ? sendToBack(sel) : sendBackward(sel); return; }
      // Delete
      if ((e.key === "Delete" || e.key === "Backspace") && sel) {
        e.preventDefault();
        handleDeleteElement(sel);
        return;
      }
      // Escape
      if (e.key === "Escape") { setSelected(null); return; }
      // Arrow nudges
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key) && sel) {
        const d = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowRight" ? d : e.key === "ArrowLeft" ? -d : 0;
        const dy = e.key === "ArrowDown" ? d : e.key === "ArrowUp" ? -d : 0;
        // Use single history entry per nudge press
        pushHistory();
        setElements(prev => prev.map(el => el.id === sel ? { ...el, x: Math.max(0, el.x + dx), y: Math.max(0, el.y + dy) } : el));
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave, undo, redo, copyElement, pasteElement, duplicateElement, handleDeleteElement, bringToFront, sendToBack, bringForward, sendBackward, pushHistory]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)", letterSpacing: "0.14em" }}>
          LOADING<span className="animate-blink">_</span>
        </span>
      </div>
    );
  }

  return (
    <div data-testid="editor-page" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
      <Toolbar
        page={page}
        activeSubPage={activeSubPage}
        theme={theme}
        mode={mode}
        bp={bp} setBp={setBp}
        zoom={zoom} setZoom={setZoom}
        canvasWidth={activeSubPage?.canvas_width || 1440}
        canvasHeight={activeSubPage?.canvas_height || 2500}
        onCanvasWidthChange={w => updateSubPage({ ...activeSubPage, canvas_width: w })}
        onCanvasHeightChange={h => updateSubPage({ ...activeSubPage, canvas_height: h })}
        saved={saved}
        onSave={() => handleSave()}
        onPublish={() => setShowPublish(true)}
        onThemeDrawer={() => setShowTheme(v => !v)}
        onAiDock={() => setShowAi(v => !v)}
        workflowMode={workflowMode}
        onWorkflow={setWorkflowMode}
        onUndo={undo}
        onRedo={redo}
        canUndo={undoStack.current.length > 0}
        canRedo={redoStack.current.length > 0}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <LeftPanel
          tab={leftTab}
          setTab={setLeftTab}
          elements={elements}
          subPages={subPages}
          activeSubPageId={activeSubPageId}
          onSwitch={switchSubPage}
          onAdd={addSubPage}
          onRename={renameSubPage}
          onDeletePage={deleteSubPage}
          onSelectElement={setSelected}
          selected={selected}
        />

        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Canvas
            elements={elements}
            setElements={setElements}
            selected={selected}
            setSelected={setSelected}
            bp={bp}
            zoom={zoom}
            canvasWidth={activeSubPage?.canvas_width || 1440}
            canvasHeight={activeSubPage?.canvas_height || 2500}
            aiLines={aiLines}
            aiStreaming={aiStreaming}
            pushHistory={pushHistory}
          />

          {showTheme && (
            <div style={{ position: "absolute", top: 8, right: 8, zIndex: 50 }}>
              <ThemeDrawer
                currentTheme={theme} currentMode={mode}
                onThemeChange={handleThemeChange} onModeChange={handleModeChange}
                onClose={() => setShowTheme(false)}
              />
            </div>
          )}
          {showAi && (
            <AiDock
              onGenerate={handleAiGenerate}
              onClose={() => setShowAi(false)}
              theme={theme}
              pageType="custom"
            />
          )}
        </div>

        <Inspector
          selectedEl={selectedEl}
          elements={elements}
          setElements={setElements}
          onUpdate={updateElement}
          onDelete={handleDeleteElement}
          onDuplicate={duplicateElement}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          activeSubPage={activeSubPage}
          onUpdateSubPage={updateSubPage}
        />
      </div>

      <div style={{
        height: 26, background: "var(--bg-2)", borderTop: "1px solid var(--line)",
        display: "flex", alignItems: "center", paddingLeft: 10, paddingRight: 10,
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)",
        gap: 8, flexShrink: 0
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 5px var(--accent)" }} />
        <span style={{ color: "var(--text-mute)" }}>{page?.title || "Untitled Project"}</span>
        <span>→</span>
        <span style={{ color: "var(--text-mute)" }}>{activeSubPage?.name || "Home"}</span>
        <span>·</span>
        <span>{elements.length} els</span>
        <span>·</span>
        <span>{bp}</span>
        <div style={{ flex: 1 }} />
        <span data-testid="status-saved">{saved ? "saved" : "unsaved"}</span>
        <span>·</span>
        <span>{zoom}%</span>
        <span>·</span>
        <span>{selected ? "1 selected" : "0 selected"}</span>
      </div>

      {showPublish && (
        <PublishModal
          page={page}
          onClose={() => setShowPublish(false)}
          onPublished={updated => setPage(p => ({ ...p, ...updated }))}
        />
      )}
    </div>
  );
}
