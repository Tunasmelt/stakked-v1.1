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

### 2026-04-23 — V3 Canvas System (this session)
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

### P0
- [ ] Workflow canvas (n8n-style node builder) — Option B
- [ ] Marquee selection (drag-rectangle to select multiple elements)

### P1
- [ ] Multi-select (Shift+click) and multi-element drag/move
- [ ] NLP layout sequencer (richer Gemini chain — plain-English → positioned elements with themes & animations)
- [ ] PDF / PNG / ZIP export
- [ ] CSS animation picker per element
- [ ] Custom slug per user profile
- [ ] Stale-while-revalidate caching

### P2
- [ ] Groq API integration (user-provided key)
- [ ] Template library (fork community pages)
- [ ] Grid/snap guide customization (snap threshold, toggle snap)
- [ ] Real-time collaboration
- [ ] Custom domains
- [ ] Analytics per published page
- [ ] Split `server.py` into routers (auth/pages/ai/assets)

## Known / Accepted Technical Debt
- `server.py` is 502 lines (threshold 700) — modularize next P2 pass.

## Next Tasks
1. Workflow canvas (P0) or resize handles (P0) — user to prioritize
2. NLP layout sequencer richer prompt chain (P1)
3. Export pipeline (P1)

## Test Credentials
See `/app/memory/test_credentials.md`.
