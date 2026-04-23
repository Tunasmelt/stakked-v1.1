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

  const saveTimer = useRef(null);
  const elementsRef = useRef(elements);
  const subPagesRef = useRef(subPages);
  const activeSubPageIdRef = useRef(activeSubPageId);

  // Keep refs in sync
  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { subPagesRef.current = subPages; }, [subPages]);
  useEffect(() => { activeSubPageIdRef.current = activeSubPageId; }, [activeSubPageId]);

  // Load page
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
    })();
  }, [id, navigate]);

  // Apply theme to entire document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-mode", mode);
  }, [theme, mode]);

  // Auto-save debounced
  useEffect(() => {
    if (!loading && page) {
      setSaved(false);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { handleSave(true); }, 2000);
    }
  }, [elements, theme, mode, subPages]);

  const buildSavePayload = () => {
    const updatedSubPages = subPagesRef.current.map(sp =>
      sp.id === activeSubPageIdRef.current ? { ...sp, elements: elementsRef.current } : sp
    );
    return { sub_pages: updatedSubPages, elements: elementsRef.current, theme, mode };
  };

  const handleSave = useCallback(async (silent = false) => {
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

  // Sub-page management
  const switchSubPage = useCallback((newId) => {
    // Save current elements to current sub-page
    setSubPages(prev => prev.map(sp =>
      sp.id === activeSubPageId ? { ...sp, elements } : sp
    ));
    const sp = subPages.find(s => s.id === newId);
    if (sp) {
      setElements(sp.elements || []);
      setActiveSubPageId(newId);
      setSelected(null);
    }
  }, [activeSubPageId, elements, subPages]);

  const addSubPage = useCallback(() => {
    const newSp = {
      id: `sp-${Date.now()}`,
      name: `Page ${subPages.length + 1}`,
      slug: `page-${subPages.length + 1}`,
      elements: [],
      canvas_width: 1440, canvas_height: 2500, padding: 0, transition: "none"
    };
    setSubPages(prev => [...prev, newSp]);
    switchSubPage(newSp.id);
  }, [subPages, switchSubPage]);

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
    }
  }, [subPages, activeSubPageId]);

  const updateSubPage = useCallback((updated) => {
    setSubPages(prev => prev.map(sp => sp.id === updated.id ? { ...sp, ...updated } : sp));
  }, []);

  const handleDeleteElement = (elId) => {
    setElements(prev => prev.filter(e => e.id !== elId));
    setSelected(null);
  };

  const handleAiGenerate = (newElements) => {
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
      {/* Top toolbar */}
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
        onSave={() => handleSave(false)}
        onPublish={() => setShowPublish(true)}
        onThemeDrawer={() => setShowTheme(v => !v)}
        onAiDock={() => setShowAi(v => !v)}
        workflowMode={workflowMode}
        onWorkflow={setWorkflowMode}
      />

      {/* 3-column body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Left panel */}
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
        />

        {/* Canvas */}
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
          />

          {/* Floating theme drawer */}
          {showTheme && (
            <div style={{ position: "absolute", top: 8, right: 8, zIndex: 50 }}>
              <ThemeDrawer
                currentTheme={theme} currentMode={mode}
                onThemeChange={handleThemeChange} onModeChange={handleModeChange}
                onClose={() => setShowTheme(false)}
              />
            </div>
          )}
          {/* AI dock */}
          {showAi && (
            <AiDock
              onGenerate={handleAiGenerate}
              onClose={() => setShowAi(false)}
              theme={theme}
              pageType="custom"
            />
          )}
        </div>

        {/* Inspector */}
        <Inspector
          selectedEl={selectedEl}
          elements={elements}
          setElements={setElements}
          onDelete={handleDeleteElement}
          activeSubPage={activeSubPage}
          onUpdateSubPage={updateSubPage}
        />
      </div>

      {/* Bottom status bar */}
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
        <span>{zoom}%</span>
        <span>·</span>
        <span>{selected ? "1 selected" : "0 selected"}</span>
      </div>

      {/* Publish modal */}
      {showPublish && (
        <PublishModal
          page={page}
          onClose={() => setShowPublish(false)}
          onPublished={updated => setPage(p => ({ ...p, ...updated }))}
        />
      )}

      {/* Keyboard handler */}
      <KeyHandler selected={selected} elements={elements} setElements={setElements} setSelected={setSelected} />
    </div>
  );
}

function KeyHandler({ selected, elements, setElements, setSelected }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        setElements(prev => prev.filter(el => el.id !== selected));
        setSelected(null);
      }
      if (e.key === "Escape") setSelected(null);
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key) && selected) {
        const d = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowRight" ? d : e.key === "ArrowLeft" ? -d : 0;
        const dy = e.key === "ArrowDown" ? d : e.key === "ArrowUp" ? -d : 0;
        setElements(prev => prev.map(el => el.id === selected ? { ...el, x: el.x + dx, y: el.y + dy } : el));
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, setElements, setSelected]);
  return null;
}
