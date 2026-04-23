import React, { useState } from "react";
import { X, FileImage, FileText, Archive } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import JSZip from "jszip";

async function captureArtboardPng(artboardEl) {
  // Temporarily zoom to 100% by cloning styles? Simpler: capture at current scale but set pixelRatio.
  return await toPng(artboardEl, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--surface") || "#000",
  });
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}

async function exportPng(artboardEl, name) {
  const data = await captureArtboardPng(artboardEl);
  downloadDataUrl(data, `${name || "stakked-page"}.png`);
}

async function exportPdf(artboardEl, name) {
  const data = await captureArtboardPng(artboardEl);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = data; });
  const w = img.width; const h = img.height;
  const orientation = w >= h ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [w, h] });
  pdf.addImage(data, "PNG", 0, 0, w, h);
  pdf.save(`${name || "stakked-page"}.pdf`);
}

function buildHtml(page, subPages) {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const renderEl = (el) => {
    const style = `position:absolute; left:${el.x}px; top:${el.y}px; width:${el.w}px; height:${el.h}px; z-index:${el.zIndex || 0};`;
    const animClass = el.animation && el.animation !== "none" ? `stk-anim-${el.animation}` : "";
    let inner = "";
    switch (el.type) {
      case "text": inner = `<div style="font-family: system-ui; font-size:${el.content?.size || 16}px; font-weight:${el.content?.kind === "heading" ? 700 : 400}; color:${el.content?.color || "inherit"};">${esc(el.content?.text || "")}</div>`; break;
      case "image": inner = el.content?.url ? `<img src="${esc(el.content.url)}" style="width:100%;height:100%;object-fit:${el.content?.fit || "cover"};" alt="" />` : ""; break;
      case "button": inner = `<a href="${esc(el.content?.href || "#")}" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#ff2e9a;color:#000;border-radius:6px;font-weight:600;text-decoration:none;">${esc(el.content?.label || "Button")}</a>`; break;
      case "shape": inner = `<div style="width:100%;height:100%;border-radius:${el.content?.round ? 999 : 6}px;background:${esc(el.content?.color || "#ff2e9a")};"></div>`; break;
      case "divider": inner = `<div style="width:100%;height:2px;background:#333;margin-top:50%;"></div>`; break;
      default: inner = `<div style="width:100%;height:100%;border:1px dashed #555;color:#888;font-family:monospace;font-size:10px;display:flex;align-items:center;justify-content:center;">${esc(el.type)}</div>`;
    }
    return `<div class="stk-el ${animClass}" style="${style}">${inner}</div>`;
  };
  const pages = (subPages?.length ? subPages : [{ id:"home", name:"Home", elements: page.elements || [], canvas_width: 1440, canvas_height: 2500 }])
    .map(sp => `<section data-page="${esc(sp.slug || sp.name)}" style="position:relative; width:${sp.canvas_width || 1440}px; height:${sp.canvas_height || 2500}px; margin: 0 auto 80px;">${(sp.elements || []).map(renderEl).join("\n")}</section>`).join("\n");

  const css = `
    body { margin:0; background:#0a0a0a; color:#eee; font-family: system-ui, sans-serif; }
    .stk-el { box-sizing: border-box; }
    @keyframes stk-fade-in{from{opacity:0}to{opacity:1}}
    @keyframes stk-slide-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes stk-slide-down{from{opacity:0;transform:translateY(-24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes stk-slide-left{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
    @keyframes stk-slide-right{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
    @keyframes stk-zoom-in{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
    @keyframes stk-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
    @keyframes stk-spin{to{transform:rotate(360deg)}}
    @keyframes stk-bounce{0%,20%,50%,80%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}60%{transform:translateY(-5px)}}
    @keyframes stk-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    .stk-anim-fade-in{animation:stk-fade-in .6s ease both}
    .stk-anim-slide-up{animation:stk-slide-up .6s cubic-bezier(.2,.9,.2,1) both}
    .stk-anim-slide-down{animation:stk-slide-down .6s cubic-bezier(.2,.9,.2,1) both}
    .stk-anim-slide-left{animation:stk-slide-left .6s cubic-bezier(.2,.9,.2,1) both}
    .stk-anim-slide-right{animation:stk-slide-right .6s cubic-bezier(.2,.9,.2,1) both}
    .stk-anim-zoom-in{animation:stk-zoom-in .5s cubic-bezier(.2,.9,.2,1) both}
    .stk-anim-pulse{animation:stk-pulse 2s ease-in-out infinite}
    .stk-anim-spin{animation:stk-spin 6s linear infinite}
    .stk-anim-bounce{animation:stk-bounce 1.5s ease-in-out infinite}
    .stk-anim-float{animation:stk-float 3s ease-in-out infinite}
  `;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(page?.title || "Stakked Page")}</title>
<style>${css}</style>
</head><body>
${pages}
</body></html>`;
}

async function exportZip(page, subPages, artboardEl, name) {
  const zip = new JSZip();
  zip.file("index.html", buildHtml(page, subPages));
  zip.file("README.txt", `Exported from Stakked on ${new Date().toISOString()}\nProject: ${page?.title || "Untitled"}\nPages: ${subPages?.length || 1}\n`);
  zip.file("page.json", JSON.stringify({ page, subPages }, null, 2));
  if (artboardEl) {
    try {
      const data = await captureArtboardPng(artboardEl);
      const base64 = data.split(",")[1];
      zip.file("preview.png", base64, { base64: true });
    } catch (e) { /* skip preview on error */ }
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, `${name || "stakked-page"}.zip`);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function ExportModal({ onClose, page, subPages, artboardRef }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const name = (page?.title || "stakked-page").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const doExport = async (kind) => {
    if (busy) return;
    setBusy(kind); setError(null);
    try {
      if (!artboardRef?.current) throw new Error("Artboard not ready");
      if (kind === "png") await exportPng(artboardRef.current, name);
      else if (kind === "pdf") await exportPdf(artboardRef.current, name);
      else if (kind === "zip") await exportZip(page, subPages, artboardRef.current, name);
    } catch (e) {
      setError(e.message || "Export failed");
    } finally {
      setBusy(null);
    }
  };

  const items = [
    { k: "png", icon: FileImage, label: "PNG", desc: "High-res raster image of current page" },
    { k: "pdf", icon: FileText,  label: "PDF", desc: "Single page, print-ready" },
    { k: "zip", icon: Archive,   label: "ZIP", desc: "Full HTML + preview + page.json" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div data-testid="export-modal" onClick={e => e.stopPropagation()} style={{
        width: 440, background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)",
        padding: 24, animation: "fadeInUp 0.25s ease"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--text-mute)" }}>// EXPORT</div>
          <button data-testid="export-close-btn" onClick={onClose} style={{ color: "var(--text-dim)" }}><X size={14} /></button>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {items.map(it => (
            <button
              key={it.k}
              data-testid={`export-${it.k}-btn`}
              onClick={() => doExport(it.k)}
              disabled={busy !== null}
              style={{
                display: "flex", gap: 12, alignItems: "center", padding: "12px 14px",
                background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
                color: "var(--text)", cursor: busy ? "wait" : "pointer",
                transition: "border-color 0.15s, background 0.15s", textAlign: "left", width: "100%"
              }}
              onMouseEnter={e => { if (!busy) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--surface)"; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--bg)"; }}
            >
              <it.icon size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{it.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{it.desc}</div>
              </div>
              {busy === it.k && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>…exporting</span>}
            </button>
          ))}
        </div>
        {error && <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--danger)" }}>✗ {error}</div>}
        <div style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6 }}>
          // PNG/PDF export the currently visible sub-page at 2x pixel density. ZIP includes all sub-pages as an HTML file.
        </div>
      </div>
    </div>
  );
}
