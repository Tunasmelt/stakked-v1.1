import React, { useState, useCallback } from "react";
import { MousePointer2, Type, Image, Square, Music, Video, Link, Minus, Grid, Clock, Star, FileText } from "lucide-react";

export const TRAY_ITEMS = [
  { id: "text",    label: "Text",      Icon: Type,        hot: "T" },
  { id: "image",   label: "Image",     Icon: Image,       hot: "I" },
  { id: "button",  label: "Button",    Icon: Square,      hot: "B" },
  { id: "shape",   label: "Shape",     Icon: Square,      hot: "S" },
  { id: "music",   label: "Music",     Icon: Music,       hot: "M" },
  { id: "video",   label: "Video",     Icon: Video,       hot: "V" },
  { id: "social",  label: "Social",    Icon: Link,        hot: "L" },
  { id: "divider", label: "Divider",   Icon: Minus,       hot: "—" },
  { id: "gallery", label: "Gallery",   Icon: Grid,        hot: "G" },
  { id: "count",   label: "Countdown", Icon: Clock,       hot: "C" },
  { id: "icon",    label: "Icon",      Icon: Star,        hot: "N" },
  { id: "form",    label: "Form",      Icon: FileText,    hot: "F" },
];

export default function ElementTray({ leftTab, setLeftTab, elements }) {
  const [search, setSearch] = useState("");

  const filtered = TRAY_ITEMS.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const onDragStart = (e, item) => {
    e.dataTransfer.setData("text/stk-item", item.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside style={{
      width: 240, background: "var(--surface)", borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--line)", padding: "0 8px", gap: 2, flexShrink: 0 }}>
        {["elements", "layers"].map(tab => (
          <button
            key={tab}
            data-testid={`tray-tab-${tab}`}
            onClick={() => setLeftTab(tab)}
            style={{
              padding: "10px 12px",
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: leftTab === tab ? "var(--text)" : "var(--text-mute)",
              borderBottom: `2px solid ${leftTab === tab ? "var(--accent)" : "transparent"}`,
              marginBottom: -1, transition: "all 0.15s"
            }}
          >{tab}</button>
        ))}
      </div>

      {leftTab === "elements" && (
        <>
          {/* Search */}
          <div style={{ padding: "10px", flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "0 10px", height: 30,
              background: "var(--bg)", border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)"
            }}>
              <span style={{ fontSize: 11, color: "var(--text-dim)" }}>⌕</span>
              <input
                data-testid="tray-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="search elements"
                style={{ flex: 1, fontSize: 11, color: "var(--text)", background: "transparent", outline: "none", fontFamily: "var(--font-mono)" }}
              />
            </div>
          </div>
          {/* Grid */}
          <div style={{ flex: 1, overflow: "auto", padding: "4px 10px 10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {filtered.map(item => (
                <div
                  key={item.id}
                  data-testid={`tray-item-${item.id}`}
                  draggable
                  onDragStart={e => onDragStart(e, item)}
                  style={{
                    aspectRatio: "1",
                    border: "1px solid var(--line)",
                    background: "var(--bg)",
                    borderRadius: "var(--r-sm)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 4, cursor: "grab",
                    transition: "border-color 0.15s, background 0.15s, transform 0.1s",
                    position: "relative"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--bg)"; }}
                  onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <item.Icon size={16} style={{ color: "var(--text)", opacity: 0.8 }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-mute)", letterSpacing: "0.04em" }}>{item.label}</span>
                  <span style={{ position: "absolute", top: 4, right: 5, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)" }}>{item.hot}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {leftTab === "layers" && (
        <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 6px 8px", marginBottom: 4 }}>
            LAYERS · {elements.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[...elements].reverse().map((el, i) => (
              <div
                key={el.id}
                data-testid={`layer-item-${el.id}`}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 8px", borderRadius: "var(--r-sm)",
                  fontSize: 12, color: "var(--text-mute)",
                  cursor: "pointer", transition: "background 0.1s, color 0.1s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mute)"; }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)" }}>{el.type.toUpperCase().slice(0,3)}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{el.name || el.type}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)" }}>z{el.zIndex}</span>
              </div>
            ))}
            {elements.length === 0 && (
              <div style={{ padding: "20px 8px", textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                No elements yet.<br />Drag from Elements tab.
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
