import React, { useState, useCallback } from "react";
import { Search } from "lucide-react";
import api from "../../utils/api";

const TRAY_ITEMS = [
  { id: "container", label: "Container", hot: "C" },
  { id: "text",    label: "Text",       hot: "T" },
  { id: "image",   label: "Image",      hot: "I" },
  { id: "shape",   label: "Shape",      hot: "S" },
  { id: "divider", label: "Divider",    hot: "—" },
  { id: "button",  label: "Button",     hot: "B" },
  { id: "nav",     label: "Nav",        hot: "N" },
  { id: "form",    label: "Form",       hot: "F" },
  { id: "music",   label: "Music",      hot: "M" },
  { id: "video",   label: "Video",      hot: "V" },
  { id: "gallery", label: "Gallery",    hot: "G" },
  { id: "social",  label: "Social",     hot: "L" },
  { id: "embed",   label: "Embed",      hot: "E" },
  { id: "map",     label: "Map",        hot: "P" },
  { id: "count",   label: "Timer",      hot: "K" },
  { id: "icon",    label: "Icon",       hot: "J" },
  { id: "testimonial", label: "Testimonial", hot: "Q" },
  { id: "marquee", label: "Marquee",    hot: "R" },
];

function InsertPanel({ elements }) {
  const [search, setSearch] = useState("");
  const filtered = TRAY_ITEMS.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));
  const onDragStart = (e, item) => {
    e.dataTransfer.setData("text/stk-item", item.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Section header */}
      <div style={{ padding: "6px 10px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>// TRAY → DRAG TO CANVAS</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", padding: "1px 5px", border: "1px solid var(--line)", borderRadius: 3 }}>tray</span>
      </div>
      {/* Search */}
      <div style={{ padding: "4px 10px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 8px", height: 28, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
          <Search size={11} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
          <input data-testid="tray-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="search elements…"
            style={{ flex: 1, fontSize: 11, color: "var(--text)", background: "transparent", outline: "none", fontFamily: "var(--font-mono)" }} />
        </div>
      </div>
      {/* Grid */}
      <div style={{ flex: 1, overflow: "auto", padding: "2px 10px 10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {filtered.map(item => (
            <div key={item.id} data-testid={`tray-item-${item.id}`} draggable onDragStart={e => onDragStart(e, item)}
              style={{
                height: 52, border: "1px solid var(--line)", background: "var(--bg)", borderRadius: "var(--r-sm)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 3, cursor: "grab", transition: "border-color 0.12s, background 0.12s", position: "relative"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--surface)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--bg)"; }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text)", opacity: 0.7, letterSpacing: 0 }}>{item.label.slice(0,3).toUpperCase()}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)" }}>{item.label}</span>
              <span style={{ position: "absolute", top: 3, right: 5, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-dim)" }}>{item.hot}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LayersPanel({ elements }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "6px 10px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>// LAYERS · Z-INDEX</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)" }}>→</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "4px 8px" }}>
        {elements.length === 0 ? (
          <div style={{ padding: "32px 8px", textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.6 }}>
            No layers yet.<br />Drop an element to begin.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[...elements].reverse().map(el => (
              <div key={el.id} data-testid={`layer-item-${el.id}`} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 8px",
                borderRadius: "var(--r-sm)", fontSize: 11, color: "var(--text-mute)", cursor: "pointer",
                transition: "background 0.1s, color 0.1s", border: "1px solid transparent"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--line)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mute)"; e.currentTarget.style.borderColor = "transparent"; }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-dim)", width: 24, textAlign: "center" }}>{el.type.slice(0,3).toUpperCase()}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{el.name || el.type}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)" }}>z{el.zIndex}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PagesPanel({ subPages, activeSubPageId, onSwitch, onAdd, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const startRename = (sp) => { setEditingId(sp.id); setEditName(sp.name); };
  const commitRename = (id) => { if (editName.trim()) onRename(id, editName.trim()); setEditingId(null); };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "6px 10px 4px" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>// PAGES</span>
      </div>
      <div style={{ padding: "4px 10px 8px" }}>
        <button data-testid="add-sub-page-btn" onClick={onAdd} style={{
          width: "100%", height: 34, background: "var(--accent)", color: "var(--accent-ink)",
          borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "filter 0.15s"
        }}
          onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
          onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
        >+ Add Page</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 8px" }}>
        {subPages.map((sp, i) => (
          <div key={sp.id} data-testid={`sub-page-${sp.id}`}
            onClick={() => onSwitch(sp.id)}
            style={{
              padding: "8px 10px", marginBottom: 3, borderRadius: "var(--r-sm)", cursor: "pointer",
              background: activeSubPageId === sp.id ? "color-mix(in oklab, var(--accent) 15%, var(--surface))" : "var(--surface)",
              border: `1px solid ${activeSubPageId === sp.id ? "var(--accent)" : "var(--line)"}`,
              transition: "all 0.15s"
            }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {editingId === sp.id ? (
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  onBlur={() => commitRename(sp.id)}
                  onKeyDown={e => e.key === "Enter" && commitRename(sp.id)}
                  className="stk-input" autoFocus style={{ flex: 1, height: 24, fontSize: 12, marginRight: 6 }}
                  onClick={e => e.stopPropagation()} />
              ) : (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: activeSubPageId === sp.id ? "var(--accent)" : "var(--text)", fontWeight: 600 }}>{sp.name}</span>
              )}
              <div style={{ display: "flex", gap: 2 }}>
                <button onClick={e => { e.stopPropagation(); startRename(sp); }} style={{ width: 20, height: 20, fontSize: 10, color: "var(--text-dim)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                  title="Rename">✎</button>
                {subPages.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); onDelete(sp.id); }} style={{ width: 20, height: 20, fontSize: 10, color: "var(--text-dim)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                    title="Delete">✕</button>
                )}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>/{sp.slug}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetsPanel() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage]       = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const search = useCallback(async (q = query, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await api.get("/assets/search", { params: { q, per_page: 20, page: p } });
      if (p === 1) setResults(r.data.photos || []);
      else setResults(prev => [...prev, ...(r.data.photos || [])]);
      setTotalResults(r.data.total_results || 0);
      setPage(p);
    } catch (e) {
      console.error("Pexels search failed", e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const onDragStart = (e, photo) => {
    e.dataTransfer.setData("text/stk-item", "image");
    e.dataTransfer.setData("text/stk-image-url", photo.src.large2x);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "6px 10px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>// ASSETS · PEXELS</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", padding: "1px 5px", border: "1px solid var(--line)", borderRadius: 3 }}>free</span>
      </div>
      <div style={{ padding: "4px 10px 6px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "0 8px", height: 28, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
            <Search size={11} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
            <input data-testid="assets-search-input" value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search(query, 1)}
              placeholder="search images…"
              style={{ flex: 1, fontSize: 11, color: "var(--text)", background: "transparent", outline: "none", fontFamily: "var(--font-mono)" }} />
          </div>
          <button data-testid="assets-search-btn" onClick={() => search(query, 1)} style={{
            width: 28, height: 28, background: "var(--accent)", color: "var(--accent-ink)",
            borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}><Search size={11} /></button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "2px 10px 10px" }}>
        {loading && results.length === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer" style={{ aspectRatio: "3/2", borderRadius: "var(--r-sm)" }} />)}
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.7 }}>
            Search for images<br />from Pexels library.<br />
            <span style={{ fontSize: 10, color: "var(--text-dim)", opacity: 0.6 }}>Drag to canvas to add.</span>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {results.map(photo => (
                <div key={photo.id} draggable onDragStart={e => onDragStart(e, photo)}
                  title={`${photo.alt || "Photo"} by ${photo.photographer}`}
                  data-testid={`asset-photo-${photo.id}`}
                  style={{ aspectRatio: "3/2", borderRadius: "var(--r-sm)", overflow: "hidden", cursor: "grab", border: "1px solid var(--line)", transition: "border-color 0.15s, transform 0.1s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "scale(1.02)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "scale(1)"; }}>
                  <img src={photo.src.small} alt={photo.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
            {results.length < totalResults && (
              <button onClick={() => search(query, page + 1)} disabled={loading} style={{
                width: "100%", marginTop: 8, padding: "8px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)", background: "transparent",
                transition: "all 0.15s"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}>
                {loading ? "loading…" : `load more (${totalResults - results.length} left)`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const TAB_LABELS = [
  { id: "insert",  label: "+ Insert" },
  { id: "layers",  label: "Layers" },
  { id: "pages",   label: "Pages" },
  { id: "assets",  label: "Assets" },
];

export default function LeftPanel({ tab, setTab, elements, subPages, activeSubPageId, onSwitch, onAdd, onRename, onDeletePage }) {
  return (
    <aside style={{
      width: 240, background: "var(--surface)", borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0
    }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--line)", flexShrink: 0, overflow: "hidden" }}>
        {TAB_LABELS.map(t => (
          <button key={t.id} data-testid={`panel-tab-${t.id}`} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "8px 0",
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.02em",
            color: tab === t.id ? "var(--text)" : "var(--text-dim)",
            borderBottom: `2px solid ${tab === t.id ? "var(--accent)" : "transparent"}`,
            marginBottom: -1, transition: "all 0.15s", background: "transparent",
            whiteSpace: "nowrap"
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      {tab === "insert"  && <InsertPanel elements={elements} />}
      {tab === "layers"  && <LayersPanel elements={elements} />}
      {tab === "pages"   && <PagesPanel subPages={subPages} activeSubPageId={activeSubPageId} onSwitch={onSwitch} onAdd={onAdd} onRename={onRename} onDelete={onDeletePage} />}
      {tab === "assets"  && <AssetsPanel />}
    </aside>
  );
}
