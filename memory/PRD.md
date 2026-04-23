# Stakked — Product Requirements Document

## Overview
**Stakked** is a drag-and-drop UI creator for artists (music artists, digital artists, photographers, social media influencers). Users create dynamic portfolio/profile/promo pages without writing code.

## Architecture
- **Frontend**: React 18 + React Router v6 + Tailwind + Framer Motion + @dnd-kit (drag-drop) + idb (IndexedDB)
- **Backend**: FastAPI + Motor (async Mongo) + JWT (bcrypt + python-jose) + httpx (Pexels proxy)
- **Database**: MongoDB via `MONGO_URL`
- **AI**: Gemini 2.5 Flash via `emergentintegrations` (Emergent LLM key)
- **Assets**: Pexels API proxied through `/api/assets/search` (key kept server-side)

## User Personas
Music artists, digital artists, photographers, influencers, general creators.

## Core Requirements (Static)

### Auth (JWT custom)
- Email + password, bcrypt hashing
- httponly access + refresh cookies
- Brute-force protection (5 attempts → 15 min lockout)

### Editor
- Top toolbar + LeftPanel (tray / layers / pages / assets) + Canvas + Inspector
- **NO project-type gate** — create page → lands directly in editor
- Elements: Container, Text, Image, Button, Shape, Music, Video, Social, Divider, Gallery, Icon, Form, Countdown, Embed, Map, Nav, Testimonial, Marquee
- Drag from tray → drop on canvas; drag Pexels image → drop on canvas
- Click to select → Inspector shows properties
- Sub-pages: multiple pages per project, independent element state
- Custom canvas width/height per sub-page
- Auto-save debounced (MongoDB + IndexedDB)
- Keyboard: Delete, Arrows (1px / 10px shift), Escape

### Themes (persistent, project-level)
- 5 themes × 2 modes (Ghost, Neon, Brutal, Paper, Sunset × dark/light)
- Theme drawer accessible from toolbar; switches instantly, persists on reload
- Theme scoped to editor (restores on unmount — doesn't leak to workspace)

### Publish
- One-click publish with slug
- Public gallery at `/gallery`
- Published pages at `/p/:username/:slug`

### AI (Gemini)
- "Describe page" → elements generated and added to canvas
- Page summary generation

### Assets (Pexels)
- LeftPanel Assets tab → search → drag result to canvas → image element with Pexels URL
- API key never exposed to client

## What's Implemented

### 2026-04-23 — V1 MVP
- Landing page with animated hero, typewriter, feature cards, showcase, CTA
- Auth (register/login, brute-force, httponly JWT)
- Workspace (project grid, filter tabs, new-page modal)
- Editor V1 (3-col IDE layout, element tray, canvas w/ dot grid, breakpoints, zoom, properties, theme drawer, AI dock, publish modal, keyboard, auto-save + IndexedDB)
- Gallery (filter + community grid)
- Published page view

### 2026-04-23 — V5 Backend modularization + features (this session)
- ✅ **Backend split**: extracted `core.py` (db, JWT helpers, models) and created `/app/backend/routes/` package with `templates.py`, `marketplace.py`, `analytics.py`, `profile.py`. server.py now orchestrates auth/pages/ai/assets and mounts feature routers.
- ✅ **Self-hosted CORS fonts**: moved Google Fonts `<link>` to `public/index.html` with `crossorigin="anonymous"`, removed `@import` from `index.css`. Fonts still cached by browser; export font embedding is no longer blocked by CORS.
- ✅ **Group / Ungroup**: Cmd/Ctrl+G groups selection (tags elements with shared `groupId`), Cmd+Shift+G ungroups. Clicking any group member auto-selects the whole group for moving/resizing. Multi-select inspector shows group/ungroup buttons.
- ✅ **Per-page analytics**: `POST /api/analytics/pageview/:pageId` increments view counter (public endpoint); `GET /api/analytics/page/:pageId` (owner-only) returns total views + 14-day breakdown + top 10 referrers.
- ✅ **Custom user handle**: `GET/PUT /api/profile/me` lets users set a slug handle; `GET /api/profile/by-handle/:handle` is a public lookup used for @handle pages.
- ✅ **Community template marketplace**: `GET /api/marketplace/templates` lists public templates (sorted by fork count); owners flip public via `POST /api/templates/:id/publish`; non-owners can `POST /api/templates/:id/use` to fork. New `/marketplace` route in the frontend with empty-state + fork button.
- ✅ **Testing**: all new endpoints verified end-to-end via curl (create template → publish → list public → fork → lookup by handle → delete). Frontend lint clean, marketplace page renders with zero console errors.

### 2026-04-23 — V4 Advanced Canvas + Templates
- ✅ **Multi-select**: Shift+click, Cmd/Ctrl+A (select all), marquee drag-rectangle on empty canvas area
- ✅ **Multi-element drag** — preserves relative positions with snap guides on primary element
- ✅ **Workflow canvas** (n8n-style) — Trigger/Action/AI/Output nodes, draggable ports with Bezier edges, pan + Cmd+wheel zoom, per-node config inspector, persisted to page via PUT `/api/pages/{id}` `workflow` field
- ✅ **Export modal** — PNG (2x pixelRatio), PDF (jsPDF), ZIP (JSZip: HTML + page.json + preview.png). `skipFonts:true` to avoid Google Fonts SecurityError
- ✅ **Animation picker** — 12 CSS keyframe presets (none/fade-in/slide-up/down/left/right/zoom-in/pulse/spin/bounce/glow/float), applied on canvas preview, carried to export HTML
- ✅ **Richer AI layout prompt** — generates 8-14 positioned elements with type-appropriate content and animations
- ✅ **Templates**: backend `POST/GET/DELETE /api/templates` + `POST /api/templates/{id}/use`; Editor toolbar "↗ Template" saves current sub-page; Workspace NewPageModal lists and applies templates
- ✅ **Bug fixes**: workflow addNode dedupe (StrictMode double-invoke), React hooks name collision (`useTemplate` → `applyTemplate`)
- ✅ **Testing**: backend 29/29 pytest pass, frontend 9/10 flows (only flaky marquee path — logic confirmed via Cmd+A+Shift+click alternate path)

### 2026-04-23 — V3 Canvas System
Fully functional editor & canvas:
- ✅ **Interactive resize handles** — 8 handles (nw/n/ne/w/e/sw/s/se), drag to resize, Shift = aspect-lock, snap to alignment targets
- ✅ **Inline text editing** — double-click text element → contentEditable; Enter or blur commits
- ✅ **Undo/redo** — 50-step history per sub-page, Cmd/Ctrl+Z & Cmd/Ctrl+Shift+Z (also Cmd+Y), toolbar buttons with disabled state
- ✅ **Copy / Paste / Duplicate / Cut** — Cmd+C/V/D/X, in-memory clipboard, Inspector has Duplicate button
- ✅ **Z-order** — Cmd+]/[ (forward/back), Cmd+Shift+]/[ (bring to front/send to back), 4 Inspector buttons
- ✅ **Element-to-element snap guides** — snap to edges & centers of other elements + canvas edges/center, pink alignment line shown during drag/resize
- ✅ **Lock enforcement** — locked elements hide resize handles, block drag
- ✅ **Inspector cheatsheet** — shortcuts visible when no selection
- ✅ **Status indicator** — 'saved'/'unsaved' in status bar (data-testid='status-saved')
- ✅ **Testing**: backend 19/19, frontend 17/18 Playwright — arrow nudge confirmed via self-test (+1px, +10px with Shift)

### 2026-04-23 — V2 Refactor
- Removed "project types" gate; split sidebar into LeftPanel + Inspector; Pexels integration via /api/assets/search; sub-page management; fixed addSubPage closure bug; fixed theme leak on unmount.

### 2026-04-23 — V1 MVP

## Prioritized Backlog

### P3 — Deferred (require multi-week infra / out-of-scope for current budget)
- [ ] **Real-time collaboration** (WebSockets + CRDT like Yjs) — weeks of infra
- [ ] **Custom domain mapping** (DNS + cloud-infra, certificate management)
- [ ] **Runtime workflow execution** (need a full event interpreter and action registry; current workflow is editable + persisted but not yet interpreted)

### P4 — Nice-to-have future features
- [ ] Analytics dashboard UI (currently API-only — wire a chart view in /analytics/:pageId)
- [ ] Public @handle page listing user's published creations
- [ ] Template preview thumbnails (auto-generate via html-to-image on publish)
- [ ] Template categorization + search in marketplace
- [ ] Split remaining `server.py` monolith (auth/pages/ai/assets) into further routes/ modules — partially done in V5 for new features

## Known / Accepted Technical Debt
- `server.py` is 502 lines (threshold 700) — modularize next P2 pass.

## Next Tasks
1. Workflow canvas (P0) or resize handles (P0) — user to prioritize
2. NLP layout sequencer richer prompt chain (P1)
3. Export pipeline (P1)

## Test Credentials
See `/app/memory/test_credentials.md`.
