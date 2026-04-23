import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { savePage, loadPage } from "../utils/db";
import Toolbar from "../components/editor/Toolbar";
import ElementTray from "../components/editor/ElementTray";
import Canvas from "../components/editor/Canvas";
import PropertiesPanel from "../components/editor/PropertiesPanel";
import ThemeDrawer from "../components/editor/ThemeDrawer";
import AiDock from "../components/editor/AiDock";
import PublishModal from "../components/editor/PublishModal";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [page, setPage]         = useState(null);
  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bp, setBp]             = useState("desktop");
  const [zoom, setZoom]         = useState(75);
  const [leftTab, setLeftTab]   = useState("elements");
  const [theme, setTheme]       = useState("neon");
  const [mode, setMode]         = useState("dark");
  const [saved, setSaved]       = useState(true);
  const [loading, setLoading]   = useState(true);

  const [showTheme,   setShowTheme]   = useState(false);
  const [showAi,      setShowAi]      = useState(false);
  const [showPublish, setShowPublish] = useState(false);

  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiLines,    setAiLines]     = useState([]);

  const saveTimer = useRef(null);

  // Load page
  useEffect(() => {
    if (!id) { navigate("/workspace"); return; }
    (async () => {
      // Try IndexedDB first for instant load
      const local = await loadPage(id);
      if (local) {
        setPage(local);
        setElements(local.elements || []);
        setTheme(local.theme || "neon");
        setMode(local.mode || "dark");
      }
      try {
        const r = await api.get(`/pages/${id}`);
        setPage(r.data);
        setElements(r.data.elements || []);
        setTheme(r.data.theme || "neon");
        setMode(r.data.mode || "dark");
        await savePage(r.data);
      } catch (e) {
        if (!local) { navigate("/workspace"); }
      }
      setLoading(false);
    })();
  }, [id, navigate]);

  // Apply theme to editor scope
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-mode", mode);
  }, [theme, mode]);

  // Auto-save (debounced)
  const triggerSave = useCallback(() => {
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      handleSave(false);
    }, 2000);
  }, [elements, theme, mode, page]);

  useEffect(() => {
    if (page && !loading) triggerSave();
  }, [elements, theme, mode]);

  const handleSave = async (notify = true) => {
    if (!id || !page) return;
    try {
      const updated = await api.put(`/pages/${id}`, { elements, theme, mode });
      const newPage = { ...page, ...updated.data, elements };
      setPage(newPage);
      await savePage(newPage);
      setSaved(true);
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleDeleteElement = (elId) => {
    setElements(prev => prev.filter(e => e.id !== elId));
    setSelected(null);
  };

  const handleAiGenerate = (newElements) => {
    setElements(prev => {
      const ids = new Set(prev.map(e => e.id));
      const fresh = newElements.filter(e => !ids.has(e.id));
      return [...prev, ...fresh];
    });
    setShowAi(false);
  };

  const handlePublished = (updated) => {
    setPage(p => ({ ...p, ...updated }));
  };

  const selectedEl = elements.find(e => e.id === selected);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)", letterSpacing: "0.14em" }}>
          LOADING EDITOR<span className="animate-blink">_</span>
        </span>
      </div>
    );
  }

  return (
    <div data-testid="editor-page" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
      {/* Toolbar */}
      <Toolbar
        pageTitle={page?.title}
        theme={theme}
        bp={bp}
        setBp={setBp}
        zoom={zoom}
        setZoom={setZoom}
        saved={saved}
        onSave={() => handleSave(true)}
        onPublish={() => setShowPublish(true)}
        onThemeDrawer={() => setShowTheme(v => !v)}
        onAiDock={() => setShowAi(v => !v)}
      />

      {/* Status bar */}
      <div style={{
        height: 24, background: "var(--bg-2)", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", paddingLeft: 12, gap: 16,
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", flexShrink: 0
      }}>
        <span>{elements.length} elements</span>
        <span>·</span>
        <span>{selectedEl ? `${selectedEl.name} selected` : "nothing selected"}</span>
        <span>·</span>
        <span>{bp} · {zoom}%</span>
        <span style={{ marginLeft: "auto", paddingRight: 12 }}>drag from tray · click to select · delete key to remove</span>
      </div>

      {/* Main 3-col layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Left: Element tray */}
        <ElementTray leftTab={leftTab} setLeftTab={setLeftTab} elements={elements} />

        {/* Center: Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <Canvas
            elements={elements}
            setElements={setElements}
            selected={selected}
            setSelected={setSelected}
            bp={bp}
            zoom={zoom}
            aiLines={aiLines}
            aiStreaming={aiStreaming}
          />

          {/* Overlays */}
          {showTheme && (
            <ThemeDrawer
              currentTheme={theme}
              currentMode={mode}
              onThemeChange={setTheme}
              onModeChange={setMode}
              onClose={() => setShowTheme(false)}
            />
          )}
          {showAi && (
            <AiDock
              onGenerate={handleAiGenerate}
              onClose={() => setShowAi(false)}
              theme={theme}
              pageType={page?.page_type}
            />
          )}
        </div>

        {/* Right: Properties */}
        <PropertiesPanel
          selectedEl={selectedEl}
          elements={elements}
          setElements={setElements}
          onDelete={handleDeleteElement}
        />
      </div>

      {/* Publish modal */}
      {showPublish && (
        <PublishModal
          page={page}
          onClose={() => setShowPublish(false)}
          onPublished={handlePublished}
        />
      )}

      {/* Keyboard shortcuts */}
      <KeyHandler
        selected={selected}
        elements={elements}
        setElements={setElements}
        setSelected={setSelected}
      />
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
      // Arrow key nudge
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
