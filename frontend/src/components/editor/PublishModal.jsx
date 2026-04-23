import React, { useState } from "react";
import { X, Copy, Globe, ExternalLink } from "lucide-react";
import api from "../../utils/api";

export default function PublishModal({ page, onClose, onPublished }) {
  const [slug, setSlug]       = useState(page?.slug || "");
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(page?.published || false);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);

  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}/p/${encodeURIComponent("creator")}/${slug}`;

  const handlePublish = async () => {
    setError(""); setLoading(true);
    try {
      await api.put(`/pages/${page.id}`, { published: true, slug });
      setPublished(true);
      onPublished?.({ ...page, published: true, slug });
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    try {
      await api.put(`/pages/${page.id}`, { published: false });
      setPublished(false);
      onPublished?.({ ...page, published: false });
    } catch { } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div
        data-testid="publish-modal"
        style={{ background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", width: 380, overflow: "hidden", animation: "fadeInUp 0.2s ease" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-mute)" }}>PUBLISH PAGE</span>
          <button data-testid="close-publish-modal" onClick={onClose} style={{ color: "var(--text-dim)" }}><X size={14} /></button>
        </div>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* URL editor */}
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginBottom: 6, letterSpacing: "0.12em" }}>PAGE URL</div>
            <div style={{ display: "flex", alignItems: "center", height: 34, border: "1px solid var(--line)", borderRadius: "var(--r-sm)", overflow: "hidden", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              <div style={{ padding: "0 10px", color: "var(--text-dim)", background: "var(--bg-2)", height: "100%", display: "flex", alignItems: "center", borderRight: "1px solid var(--line)", whiteSpace: "nowrap" }}>
                /p/creator/
              </div>
              <input
                data-testid="publish-slug-input"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="stk-input"
                style={{ flex: 1, border: "none", borderRadius: 0, height: "100%", color: "var(--accent)" }}
              />
            </div>
          </div>

          {/* Status */}
          <div style={{
            padding: "10px 12px", borderRadius: "var(--r-sm)",
            background: published ? "color-mix(in oklab, var(--ok) 10%, transparent)" : "color-mix(in oklab, var(--text-dim) 10%, transparent)",
            border: `1px solid ${published ? "var(--ok)" : "var(--line)"}`,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: published ? "var(--ok)" : "var(--text-dim)", boxShadow: published ? "0 0 6px var(--ok)" : "none" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: published ? "var(--ok)" : "var(--text-mute)" }}>
              {published ? "PUBLISHED · Live on the web" : "DRAFT · Not publicly visible"}
            </span>
          </div>

          {published && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                data-testid="copy-url-btn"
                onClick={copy}
                style={{
                  flex: 1, height: 36, border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
                  fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-mute)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-mute)"; }}
              >
                <Copy size={12} /> {copied ? "COPIED!" : "COPY URL"}
              </button>
              <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{
                flex: 1, height: 36, border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mute)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.15s"
              }}>
                <ExternalLink size={12} /> OPEN
              </a>
            </div>
          )}

          {error && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--danger)", padding: "8px 10px", background: "color-mix(in oklab, var(--danger) 10%, transparent)", border: "1px solid var(--danger)", borderRadius: "var(--r-sm)" }}>{error}</div>
          )}

          {/* Export basics */}
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginBottom: 8, letterSpacing: "0.12em" }}>EXPORT (COMING SOON)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {["PDF","PNG","ZIP"].map(fmt => (
                <div key={fmt} style={{
                  padding: "12px 8px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
                  textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.5
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{fmt}</div>
                  <div style={{ fontSize: 9 }}>soon</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
          {published ? (
            <button
              data-testid="unpublish-btn"
              onClick={handleUnpublish}
              disabled={loading}
              style={{ flex: 1, height: 40, border: "1px solid var(--danger)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--danger)", transition: "all 0.15s" }}
            >UNPUBLISH</button>
          ) : (
            <button
              data-testid="publish-confirm-btn"
              onClick={handlePublish}
              disabled={loading || !slug}
              style={{ flex: 1, height: 40, background: loading ? "var(--line)" : "var(--accent)", color: loading ? "var(--text-mute)" : "var(--accent-ink)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Globe size={14} /> {loading ? "PUBLISHING…" : "PUBLISH NOW"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
