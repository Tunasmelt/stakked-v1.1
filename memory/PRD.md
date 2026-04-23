# Stakked - Product Requirements Document

## Overview
**Stakked** is a drag-and-drop UI creator for artists (music artists, digital artists, photographers, social media influencers). Users create dynamic portfolio pages, profile pages, and promo pages for their work without writing code.

## Architecture
- **Frontend**: React 18 + React Router v6 + Tailwind CSS + Framer Motion + @dnd-kit (drag-and-drop) + idb (IndexedDB caching)
- **Backend**: FastAPI + Motor (async MongoDB) + JWT Auth (bcrypt + python-jose)
- **Database**: MongoDB (via MONGO_URL env var)
- **AI**: Gemini 2.5 Flash via emergentintegrations (emergent LLM key)

## User Personas
- Music artists building album promo pages
- Digital artists showcasing portfolios
- Photographers displaying galleries
- Social media influencers creating link-in-bio pages
- General creators building any kind of page

## Core Requirements (Static)

### Auth
- JWT-based custom auth with email + password
- bcrypt password hashing
- httponly cookie tokens (access + refresh)
- Brute force protection (5 attempts → 15 min lockout)

### Page Builder (Editor)
- 3-column layout: ElementTray | Canvas | PropertiesPanel
- Artboard with dot-grid background
- Elements: Text, Image, Button, Shape, Music, Video, Social, Divider, Gallery, Icon, Form, Countdown
- Drag from tray → drop on canvas
- Click to select → shows properties panel
- Resize handles on selected elements
- Keyboard shortcuts (Delete, Arrow keys, Escape)
- Auto-save to both MongoDB and IndexedDB (offline-first)

### Themes
- 5 dynamic themes: Ghost, Neon, Brutal, Paper, Sunset
- Each with dark + light mode variants
- CSS variable-driven theming (--bg, --surface, --accent, --accent-ink, etc.)

### Publish
- One-click publish with custom slug/URL
- Public gallery at /gallery
- Published pages at /p/:username/:slug

### AI Features
- AI layout generation via Gemini 2.5 Flash
- Describe page in plain English → elements generated
- Page summary generation
- Animation suggestions

## What's Been Implemented (2026-04-23)

### Landing Page ✅
- Animated hero with 3D slab art
- Typewriter effect for artist types
- Feature cards section (6 features)
- Showcase gallery (4 sample pages)
- CTA section with accent glow
- Full animation with CSS keyframes

### Auth ✅
- Register with name, email, password, artist type selector
- Login with brute force protection
- JWT httponly cookies
- Protected routes

### Workspace ✅
- Sidebar with filter tabs (all/published/drafts)
- Project grid (auto-fill, responsive)
- Page cards with theme preview, status badges
- New page modal (title, theme, type)
- Empty state with "Create First" CTA

### Editor ✅
- 3-column IDE-style layout (240px | 1fr | 280px)
- Element tray with 12 element types, search, hotkeys
- Layer panel tab showing element stack
- Canvas with dot-grid background
- Artboard with breakpoint switching (820/640/390px)
- Zoom control (25-200%, 25% increments)
- Properties panel (transform, content, visibility, lock)
- Theme drawer (5 themes × 2 modes)
- AI dock overlay (Gemini integration)
- Publish modal (slug, status, unpublish, export placeholders)
- Keyboard shortcuts (Delete, Arrows, Escape)
- Auto-save with debounce + IndexedDB caching
- Save status indicator (unsaved/saved)

### Gallery ✅
- Filter by page type
- Community published pages grid
- Card hover with "View Page" overlay

### Published Page View ✅
- Renders elements at absolute positions
- Theme/mode applied from page data
- "Made with Stakked" watermark

## Prioritized Backlog

### P0 (Critical for next version)
- [ ] Workflow canvas (n8n-style node builder) — Option B deferred
- [ ] Full resize handles (drag to resize, not just select)
- [ ] Double-click to edit text inline on canvas

### P1 (Important)
- [ ] PDF/PNG/ZIP export (planned, placeholders in UI)
- [ ] NLP animation addition (CSS animation picker per element)
- [ ] Image search via Unsplash/Pexels API
- [ ] Custom slug URL editor per user profile
- [ ] Page caching improvements (stale-while-revalidate)

### P2 (Nice to have)
- [ ] Groq API integration (user provides key)
- [ ] Template library (fork community pages)
- [ ] Grid/snap guides customization
- [ ] Multi-select elements
- [ ] Undo/redo history
- [ ] Real-time collaboration
- [ ] Custom domain mapping
- [ ] Analytics per published page

## Next Tasks
1. Implement resize handles for canvas elements
2. Add inline text editing
3. Build image search integration
4. Add animation library per element
5. Implement workflow canvas (n8n-style)
6. Add PDF export
