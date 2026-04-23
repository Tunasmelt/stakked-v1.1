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

### 2026-04-23 — V2 Refactor (this session)
- ✅ Removed "project types" gate — create page goes directly to editor
- ✅ Split sidebar into `LeftPanel.jsx` (tray/layers/pages/assets) + `Inspector.jsx` (properties)
- ✅ Theme made project-level and persistent via `PUT /api/pages/{id}`; theme drawer accessible in editor toolbar
- ✅ Pexels integration: `/api/assets/search` proxy, LeftPanel "Assets" tab fetches & drag-drops photos
- ✅ Sub-page management (add/rename/delete/switch) with independent element state
- ✅ Custom canvas dimensions per sub-page (width/height editable from Inspector)
- ✅ Fixed closure bug in `addSubPage` — new sub-page now auto-switches after creation
- ✅ Fixed theme leak — editor restores previous `data-theme` on unmount
- ✅ Testing: backend 19/19 pass, frontend 95% (all critical flows verified)

## Prioritized Backlog

### P0
- [ ] Workflow canvas (n8n-style node builder) — Option B
- [ ] Full resize handles on canvas elements (drag corners/edges)
- [ ] Double-click to edit text inline on canvas

### P1
- [ ] NLP layout sequencer (richer Gemini integration — plain-English → positioned elements with themes & animations)
- [ ] PDF / PNG / ZIP export
- [ ] CSS animation picker per element
- [ ] Custom slug per user profile
- [ ] Stale-while-revalidate caching

### P2
- [ ] Groq API integration (user-provided key)
- [ ] Template library (fork community pages)
- [ ] Grid/snap guide customization
- [ ] Multi-select + undo/redo
- [ ] Real-time collaboration
- [ ] Custom domains
- [ ] Analytics per published page
- [ ] Split `server.py` into routers (auth/pages/ai/assets) — currently ~502 lines

## Known / Accepted Technical Debt
- `server.py` is 502 lines (threshold 700) — modularize next P2 pass.

## Next Tasks
1. Workflow canvas (P0) or resize handles (P0) — user to prioritize
2. NLP layout sequencer richer prompt chain (P1)
3. Export pipeline (P1)

## Test Credentials
See `/app/memory/test_credentials.md`.
