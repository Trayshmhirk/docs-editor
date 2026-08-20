# Phase 1.5 — Performance Acceleration & UI Revamp

**Goal:** Eliminate cold dev server bottlenecks, enable Turbopack, optimize bundle deserialization, and completely modernize the Docs Editor user interface into a sleek, premium product.

**Depends on:** [Phase 1 — Foundation & Collaboration](./phase-1-foundation-collaboration.md)

**Estimated effort:** 1–2 weeks

---

## 1.5.1 Local Dev Performance & Turbopack Acceleration

Next.js 15 Webpack dev compilation on large modules (Lexical + Liveblocks) causes cold start delays of 75s–3min and memory serialization warnings.

### Bottleneck Breakdown

| Component                      | Dev Impact                                       | Solution                                                      |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------- |
| **Webpack Bundler**            | 5,400+ modules compiled synchronously            | Migrate dev script to `next dev --turbopack`                  |
| **Sentry Telemetry**           | Intercepts all dev routes & generates sourcemaps | Disable Sentry replay/tracing in `NODE_ENV === 'development'` |
| **Liveblocks Auth Cold Start** | ~29s response on initial auth handshakes         | Optimize auth route and cache Clerk identity lookups          |
| **Lexical Auxiliary Plugins**  | Heavy synchronous AST nodes in initial bundle    | Dynamic code-splitting for secondary plugins                  |

### Checklist

- [ ] Update `package.json` dev script to enable Turbopack (`next dev --turbopack`)
- [ ] Verify Tailwind v4 `@tailwindcss/postcss` compatibility under Turbopack
- [ ] Verify Sentry client instrumentation (`instrumentation-client.ts`) runs smoothly with Turbopack
- [ ] Profile cold page loads on `/` and `/documents/[id]` to ensure under 3s render times

### Files to modify

```txt
package.json
next.config.ts
```

---

## 1.5.2 Development Telemetry & Sentry Decoupling

Sentry is critical in production but adds substantial overhead during local development compilation and navigation.

### Checklist for development telemetry

- [ ] Gate Sentry client initialization so tracing/replay are disabled or minimized in development
- [ ] Ensure Sentry server/edge instrumentation avoids redundant source map generation in dev
- [ ] Opt out of Clerk telemetry pings during development if desired (`NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=1`)

### Files to modify for development telemetry

```txt
instrumentation-client.ts
sentry.server.config.ts
sentry.edge.config.ts
.env.example
```

---

## 1.5.3 Lexical & Liveblocks Bundle Optimization

Secondary editor features (Draggable block menu, code highlight action menus, floating link editors) can be split into asynchronous chunks.

### Checklist for lexical bundle optimization

- [ ] Lazy-load `CodeActionMenuPlugin` with `next/dynamic` or `React.lazy`
- [ ] Lazy-load `DraggableBlockPlugin` to keep primary editor canvas light
- [ ] Audit vendor chunk sizes on `/documents/[id]` using `@next/bundle-analyzer`

### Files to modify for lexical bundle optimization

```txt
components/editor/Editor.tsx
package.json
next.config.ts
```

---

## 1.5.4 Premium Design System & Modern Theme Tokens

Elevate the visual aesthetic from a prototype layout to a state-of-the-art SaaS workspace.

### Design Tokens & Aesthetics

- **Color Palettes:**
  - Dark Mode: Rich slate/obsidian backgrounds (`#090d16`, `#0f172a`, `#1e293b`), elevated borders (`#334155`), and electric cyan/azure accents (`#00afdb` / `#38bdf8`).
  - Light Mode: Crisp off-white surfaces (`#f8fafc`, `#ffffff`), subtle gray borders (`#e2e8f0`), and deep charcoal typography (`#0f172a`).
- **Typography:** Modern variable font configuration (Inter / Outfit) with balanced leading and hierarchy.
- **Glassmorphism & Elevation:** Subtle backdrop blur (`backdrop-blur-md`), layered dark mode drop shadows (`shadow-sm-dark` to `shadow-xl-dark`).

### Checklist for design system

- [ ] Refine `@theme` token definitions in `app/globals.css`
- [ ] Standardize text color contrast across all dark mode inputs, dropdowns, and canvas containers
- [ ] Polish scrollbars, tooltips, and micro-interaction animations

### Files to modify for design system

```txt
app/globals.css
app/layout.tsx
styles/editor/dark-theme.css
styles/editor/light-theme.css
```

---

## 1.5.5 Header & Room Navigation Overhaul

Redesign the application header for both the home dashboard and document room.

### Checklist navigation overhaul

- [ ] Build a sleek, floating room navigation header
- [ ] Add editable document title with seamless hover/focus transition and saving indicator
- [ ] Redesign connection status pill (`• Connected`, `• Reconnecting`, `• Offline`) with pulsing state
- [ ] Redesign collaborator avatar stack with smooth hover magnification and name badges
- [ ] Add breadcrumbs / quick navigation back to home

### Files to modify navigation overhaul

```txt
components/ui/shared/Header.tsx
components/collaborators/CollaborativeRoom.tsx
components/collaborators/ActiveCollaborators.tsx
```

---

## 1.5.6 Toolbar & Editor Canvas Modernization

Transform the Lexical toolbar into a fluid, grouped pill interface.

### Checklist toolbar modernization

- [ ] Reorganize toolbar items into logical visual groups with subtle dividers:
  - _History:_ Undo, Redo
  - _Hierarchy:_ Block Format dropdown (Paragraph, H1, H2, Code, Quote)
  - _Typography:_ Font family, font size incrementer
  - _Inline Styles:_ Bold, Italic, Underline, Strikethrough, Code, Sub/Superscript
  - _Insert Tools:_ Link, Collaborative Table, Images/Dividers
  - _Alignment:_ Left, Center, Right, Justify
- [ ] Style active buttons with prominent contrasting backdrops
- [ ] Elevate editor canvas with crisp page margins, drop shadow, and dark mode contrast
- [ ] Add smooth hover tooltips across all toolbar controls

### Files to modify toolbar modernization

```txt
components/editor/plugins/toolbarPlugin/ToolbarPlugin.tsx
components/editor/plugins/toolbarPlugin/toolbarDropdown/BlockFormatDropdown.tsx
components/editor/plugins/toolbarPlugin/toolbarDropdown/FontDropdown.tsx
components/editor/plugins/toolbarPlugin/toolbarDropdown/TextFormatDropdown.tsx
styles/editor/index.css
```

---

## 1.5.7 Share Dialog UI & User Experience Polish

Provide a refined sharing modal experience matching modern collaborative editors.

### Checklist for share dialog UI

- [ ] Implement clear visual hierarchy: Document Access Summary, Email Invite Field, Collaborator List
- [ ] Add animated "Copy Link" button with instant success feedback
- [ ] Polish collaborator list items with role dropdowns (Viewer / Editor) and owner badges
- [ ] Add animated transitions for dialog open/close using Radix dialog primitives

### Files to modify for share dialog UI

```txt
components/modal/ShareModal.tsx
components/collaborators/Collaborator.tsx
components/ui/dialog.tsx
```

---

## Acceptance Criteria

- [ ] Local dev server starts and compiles routes in under 5 seconds with Turbopack
- [ ] Sentry dev overhead is eliminated with no source map lag in development
- [ ] Application header and document canvas feature polished dark and light themes
- [ ] Toolbar controls are grouped into fluid pill sections with responsive active states
- [ ] Share modal provides instant link copying and clear collaborator management

---

## Suggested Commit Sequence

```txt
perf(dev): enable turbopack and optimize development compilation
perf(sentry): decouple telemetry and source map tracing in development
style(theme): establish modern dark slate tokens and typography
style(header): redesign floating room header and live presence stack
style(toolbar): modernize editor toolbar with grouped pill formatting
style(share): polish share dialog layout and copy-link interactions
```

---

## Next Phase

→ [Phase 2 — Core Product Features & Database Architecture](./phase-2-core-product-features.md)
