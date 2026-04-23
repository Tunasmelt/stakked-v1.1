import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Plus, Pencil, Trash2, Globe, Lock, LayoutGrid, LogOut, Users } from "lucide-react";

const THEME_COLORS = {
  neon: "#ff2e9a", ghost: "#f2f2f2", brutal: "#c6ff00",
  paper: "#d4a574", sunset: "#ff8e53"
};

const THEMES = ["brutal", "neon", "ghost", "paper", "sunset"];

function PageCard({ page, onDelete, onOpen }) {
  const [hovering, setHovering] = useState(false);
  const color = THEME_COLORS[page.theme] || "var(--accent)";
  return (
    <div
      data-testid={`page-card-${page.id}`}
      style={{
        background: "var(--surface)", border: `1px solid ${hovering ? color : "var(--line)"}`,
        borderRadius: "var(--r-lg)", overflow: "hidden",
        transition: "border-color 0.2s, transform 0.2s",
        transform: hovering ? "translateY(-3px)" : "translateY(0)", cursor: "pointer"
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div onClick={() => onOpen(page.id)} style={{
        height: 120,
        background: `linear-gradient(135deg, color-mix(in oklab, ${color} 20%, var(--bg)) 0%, var(--surface-2) 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color, textAlign: "center", padding: "0 12px", letterSpacing: "-0.02em" }}>
          {page.title}
        </div>
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          {page.published
            ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ok)", padding: "2px 6px", background: "color-mix(in oklab, var(--ok) 15%, transparent)", border: "1px solid var(--ok)", borderRadius: 3 }}>LIVE</span>
            : <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", padding: "2px 6px", border: "1px solid var(--line)", borderRadius: 3 }}>DRAFT</span>}
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{page.title}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>
              {page.theme} · {page.mode} · {new Date(page.created_at).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button data-testid={`page-edit-${page.id}`} onClick={() => onOpen(page.id)} style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-mute)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}>
              <Pencil size={12} />
            </button>
            <button data-testid={`page-delete-${page.id}`} onClick={() => onDelete(page.id)} style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--danger)"; e.currentTarget.style.color = "var(--danger)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewPageModal({ onClose, onCreate }) {
  const [title, setTitle]   = useState("");
  const [theme, setTheme]   = useState("brutal");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onCreate({ title: title.trim(), theme, mode: "dark" });
    setLoading(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div data-testid="new-page-modal" style={{ background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", padding: 28, width: 380, animation: "fadeInUp 0.25s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-mute)", marginBottom: 20 }}>// NEW PROJECT</div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 6 }}>PROJECT TITLE</label>
            <input data-testid="new-page-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled Project" required autoFocus className="stk-input" style={{ width: "100%", height: 40, fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>THEME</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {THEMES.map(t => (
                <button key={t} type="button" onClick={() => setTheme(t)} style={{
                  padding: "8px 4px", border: `1px solid ${theme === t ? "var(--accent)" : "var(--line)"}`,
                  borderRadius: "var(--r-sm)",
                  background: theme === t ? "color-mix(in oklab, var(--accent) 15%, transparent)" : "transparent",
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: theme === t ? "var(--accent)" : "var(--text-mute)", transition: "all 0.15s"
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: THEME_COLORS[t], margin: "0 auto 4px" }} />
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 40, border: "1px solid var(--line)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)" }}>CANCEL</button>
            <button data-testid="create-page-btn" type="submit" disabled={loading} style={{ flex: 2, height: 40, background: loading ? "var(--line)" : "var(--accent)", color: loading ? "var(--text-mute)" : "var(--accent-ink)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12 }}>
              {loading ? "CREATING…" : "CREATE PROJECT →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Workspace() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter]   = useState("all");

  const fetchPages = async () => {
    setLoading(true);
    try { const r = await api.get("/pages"); setPages(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchPages(); }, []);

  const handleCreate = async (data) => {
    const r = await api.post("/pages", data);
    navigate(`/editor/${r.data.id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/pages/${id}`);
    setPages(p => p.filter(x => x.id !== id));
  };

  const filtered = filter === "all" ? pages
    : filter === "published" ? pages.filter(p => p.published)
    : pages.filter(p => !p.published);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.14em", fontSize: 13 }}>STAKKED</span>
        </div>
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {[
            { label: "all projects", val: "all", icon: <LayoutGrid size={13} /> },
            { label: "published",    val: "published", icon: <Globe size={13} /> },
            { label: "drafts",       val: "draft", icon: <Lock size={13} /> },
          ].map(item => (
            <button key={item.val} data-testid={`filter-${item.val}`} onClick={() => setFilter(item.val)} style={{
              width: "100%", padding: "9px 12px", borderRadius: "var(--r-sm)",
              display: "flex", alignItems: "center", gap: 10,
              background: filter === item.val ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "transparent",
              color: filter === item.val ? "var(--text)" : "var(--text-mute)",
              fontFamily: "var(--font-mono)", fontSize: 11, border: "none", textAlign: "left",
              transition: "all 0.15s", marginBottom: 2
            }}>
              <span style={{ color: filter === item.val ? "var(--accent)" : "var(--text-dim)" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: "1px dashed var(--line)", margin: "10px 4px", paddingTop: 10 }}>
            <Link to="/gallery" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--r-sm)", color: "var(--text-mute)", fontFamily: "var(--font-mono)", fontSize: 11, transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-mute)"}
            ><Users size={13} /> community</Link>
          </div>
        </nav>
        <div style={{ padding: "12px 14px", borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{user?.artist_type}</div>
            </div>
            <button data-testid="workspace-logout-btn" onClick={logout} style={{ color: "var(--text-mute)", padding: 4 }} title="Logout"><LogOut size={13} /></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em" }}>
              workspace<span style={{ color: "var(--accent)" }}>/</span>
              <span style={{ color: "var(--text-mute)", fontSize: 18 }}>@{user?.name?.toLowerCase().replace(/\s+/g, "")}</span>
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
              {pages.length} projects · {pages.filter(p => p.published).length} published
            </p>
          </div>
          <button data-testid="new-page-open-btn" onClick={() => setShowNew(true)} style={{
            height: 36, padding: "0 16px", background: "var(--accent)", color: "var(--accent-ink)",
            borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11,
            display: "flex", alignItems: "center", gap: 6, transition: "filter 0.15s"
          }}
            onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
            onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
          >
            <Plus size={13} /> NEW PROJECT
          </button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 180, borderRadius: "var(--r-lg)", border: "1px solid var(--line)" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", border: "2px dashed var(--line)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--text-dim)" }}><Plus size={22} /></div>
            <p style={{ color: "var(--text-mute)", fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 14 }}>No projects yet. Start building!</p>
            <button data-testid="empty-new-page-btn" onClick={() => setShowNew(true)} style={{ padding: "9px 18px", background: "var(--accent)", color: "var(--accent-ink)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11 }}>NEW PROJECT</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {filtered.map(p => <PageCard key={p.id} page={p} onDelete={handleDelete} onOpen={id => navigate(`/editor/${id}`)} />)}
            <div data-testid="add-page-card" onClick={() => setShowNew(true)} style={{
              minHeight: 180, border: "1px dashed var(--line-2)", borderRadius: "var(--r-lg)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8, color: "var(--text-dim)", cursor: "pointer", transition: "all 0.15s"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "color-mix(in oklab, var(--accent) 5%, transparent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "transparent"; }}
            >
              <Plus size={22} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em" }}>NEW PROJECT</span>
            </div>
          </div>
        )}
      </main>

      {showNew && <NewPageModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
    </div>
  );
}
