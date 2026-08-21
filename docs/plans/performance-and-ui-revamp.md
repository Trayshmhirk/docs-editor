# Phase 1.5 — Performance Acceleration & UI Revamp

**Goal:** Eliminate cold dev server bottlenecks, enable Turbopack, lock in production-grade
performance foundations (React Compiler, streaming SSR, auth latency), optimize bundle
deserialization, and completely modernize the Docs Editor user interface.

**Depends on:** [Phase 1 — Foundation & Collaboration](./phase-1-foundation-collaboration.md)

**Estimated effort:** 1–2 weeks

---

## Performance Sections Overview

| Section | Focus                             | Impact Layer   |
| ------- | --------------------------------- | -------------- |
| 1.5.1   | Turbopack dev bundler             | Dev-time       |
| 1.5.2   | Sentry dev decoupling             | Dev-time       |
| 1.5.3   | Lexical plugin lazy-loading       | Dev + Prod     |
| 1.5.4   | Liveblocks auth cold start fix    | **Production** |
| 1.5.5   | React Compiler (auto-memoization) | **Production** |
| 1.5.6   | Suspense boundaries & streaming   | **Production** |

---

## 1.5.1 Local Dev Performance & Turbopack Acceleration

Next.js 15 Webpack dev compilation on large modules (Lexical + Liveblocks) causes cold start delays of 75s–3min and memory serialization warnings.

### Bottleneck Breakdown

| Component                      | Dev Impact                                       | Solution                                                      |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------- |
| **Webpack Bundler**            | 5,400+ modules compiled synchronously            | Migrate dev script to `next dev --turbopack`                  |
| **Sentry Telemetry**           | Intercepts all dev routes & generates sourcemaps | Disable Sentry replay/tracing in `NODE_ENV === 'development'` |
| **Liveblocks Auth Cold Start** | ~29s response on initial auth handshakes         | See dedicated section 1.5.4                                   |
| **Lexical Auxiliary Plugins**  | Heavy synchronous AST nodes in initial bundle    | Dynamic code-splitting for secondary plugins                  |

### Checklist

- [x] Update `package.json` dev script to enable Turbopack (`next dev --turbopack`)
- [x] Verify Tailwind v4 `@tailwindcss/postcss` compatibility under Turbopack
- [x] Verify Sentry client instrumentation (`instrumentation-client.ts`) runs smoothly with Turbopack
- [x] Profile cold page loads on `/` and `/documents/[id]` to ensure under 3s render times

### Files to modify

```txt
package.json
next.config.ts
```

---

## 1.5.2 Development Telemetry & Sentry Decoupling

Sentry is critical in production but adds substantial overhead during local development compilation and navigation.

### Checklist for development telemetry

- [x] Gate Sentry client initialization so tracing/replay are disabled or minimized in development
- [x] Ensure Sentry server/edge instrumentation avoids redundant source map generation in dev
- [x] Opt out of Clerk telemetry pings during development if desired (`NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=1`)

### Files to modify for development telemetry

```txt
instrumentation-client.ts
sentry.server.config.ts
sentry.edge.config.ts
.env.example
```

---

## 1.5.3 Lexical & Liveblocks Bundle Optimization

Secondary editor features (Draggable block menu, code highlight action menus, floating link
editors) can be split into asynchronous chunks to reduce the initial JS parse cost on
`/documents/[id]`.

### Checklist for lexical bundle optimization

- [x] Lazy-load `CodeActionMenuPlugin` with `next/dynamic` (`{ ssr: false }`)
- [x] Lazy-load `DraggableBlockPlugin` to keep primary editor canvas light
- [x] Lazy-load `FloatingLinkEditorPlugin` with `next/dynamic` (`{ ssr: false }`)
- [ ] Audit vendor chunk sizes on `/documents/[id]` using `ANALYZE=true npm run build`

### Files to modify for lexical bundle optimization

```txt
components/editor/Editor.tsx
package.json
next.config.ts
```

---

## 1.5.4 Liveblocks Auth Cold Start Fix

> **Production Critical.** Every user who opens a document waits for `/api/liveblocks-auth`
> before the Liveblocks WebSocket handshake can complete.

The ~29s cold start is caused by calling `currentUser()` from `@clerk/nextjs/server`, which
makes a **live network round-trip to Clerk's API** on every invocation.

### Root Cause

```ts
// Slow — makes a Clerk network request on every call
import { currentUser } from "@clerk/nextjs/server";
const user = await currentUser();

// Fast — reads from the signed session JWT locally, zero network call
import { auth } from "@clerk/nextjs/server";
const { userId } = await auth();
```

`auth()` verifies the JWT cryptographically in-process. `currentUser()` hits Clerk's API to
hydrate the full user object. For the auth endpoint, only `userId` and user metadata are
needed — `auth()` is always the right choice here.

### Checklist for auth cold start fix

- [x] Replace `currentUser()` with `auth()` in `app/api/liveblocks-auth/route.ts`
- [x] Source user name and avatar from `auth().sessionClaims` or a lightweight Clerk backend
      client call (not `currentUser()`)
- [x] Add `Cache-Control: no-store` header to the auth route to prevent CDN caching of tokens
- [x] Measure auth response time before and after (target: under 200ms)

### Files to modify for auth cold start fix

```txt
app/api/liveblocks-auth/route.ts
```

---

## 1.5.5 React Compiler (Auto-Memoization)

> **Production Critical.** Especially important as the app grows and more collaborators
> join a single document room.

The **React Compiler** (formerly "React Forget"), stable in React 19, automatically memoizes
all components and hooks — eliminating the need for manual `useMemo`, `useCallback`, and
`React.memo` throughout the codebase.

For a Lexical editor this is transformative: every keypress, cursor move, selection change,
and Liveblocks presence update triggers a cascade of re-renders across the toolbar, floating
plugins, and presence layer. The compiler eliminates this overhead automatically.

### Why This Matters at Scale

- `ToolbarPlugin` re-renders on every editor state change (format state, selection, block type)
- `ActiveCollaborators` re-renders on every cursor position update from every connected peer
- `CollaborativeRoom` holds title editing, connection status, and Liveblocks presence — all
  updating at high frequency

Without the compiler, re-render overhead compounds as collaborators join and document content
grows. With the compiler, it is eliminated automatically with zero changes to existing
components.

### Enablement

```ts
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
};
```

```bash
npm install --save-dev babel-plugin-react-compiler
```

### Checklist for React Compiler

- [x] Install `babel-plugin-react-compiler` as a dev dependency
- [x] Enable `experimental.reactCompiler: true` in `next.config.ts`
- [x] Verify no components use patterns that opt them out (mutable refs in render, direct DOM
      mutations outside `useEffect`)
- [x] Run `npm run typecheck` and `npm run build` to confirm clean compilation
- [x] Smoke test editor interactions: typing, selection, formatting, table operations,
      collaborator cursors

### Files to modify for React Compiler

```txt
next.config.ts
package.json
```

---

## 1.5.6 Suspense Boundaries & Streaming SSR Architecture

Next.js 15 App Router streams page responses to the browser via React Suspense. Without
explicit `<Suspense>` wrappers, any slow data dependency on the critical path — Liveblocks
auth, Clerk session fetch, Postgres query — blocks the **entire page** from rendering.

This is important now (auth cold start) and becomes critical in Phase 2 when Postgres queries
will sit on the rendering critical path of the dashboard.

### Current Gap

The document room page renders the full `<CollaborativeRoom>` and `<Editor>` tree
synchronously. If the auth endpoint is slow, the user sees a blank page. The Phase 2 dashboard
will load multiple data-dependent tab views — without streaming, all tabs block on the slowest
query.

### Target Architecture

```txt
Document room:
  Page Shell (renders instantly — no blocking data)
    └── <Suspense fallback={<EditorSkeleton />}>
          └── CollaborativeRoom -> Liveblocks WebSocket (streams in)
                └── <Suspense fallback={<CanvasLoader />}>
                      └── Editor -> Lexical canvas

Phase 2 Dashboard:
  Page Shell
    └── <Suspense fallback={<DashboardSkeleton />}>
          └── Tab data (Postgres — each tab streams independently)
```

### Checklist for Suspense & streaming

- [x] Wrap `CollaborativeRoom` in an explicit `<Suspense>` boundary in
      `app/(root)/documents/[id]/page.tsx` with a canvas skeleton fallback
- [x] Ensure the document room page shell renders before the Liveblocks connection is
      established
- [x] Plan Phase 2 dashboard with per-section `<Suspense>` wrappers so each tab streams
      independently
- [x] Verify `loading.tsx` files exist for all route segments to provide automatic Suspense
      fallbacks at the route level

### Files to modify for Suspense & streaming

```txt
app/(root)/documents/[id]/page.tsx
app/(root)/loading.tsx
components/collaborators/CollaborativeRoom.tsx
```

---

## 1.5.7 Premium Design System & Modern Theme Tokens

Elevate the visual aesthetic from a prototype layout to a state-of-the-art SaaS workspace.

### Design Tokens & Aesthetics

- **Color Palettes:**
  - Dark Mode: Rich slate/obsidian backgrounds (`#090d16`, `#0f172a`, `#1e293b`), elevated
    borders (`#334155`), and electric cyan/azure accents (`#00afdb` / `#38bdf8`).
  - Light Mode: Crisp off-white surfaces (`#f8fafc`, `#ffffff`), subtle gray borders
    (`#e2e8f0`), and deep charcoal typography (`#0f172a`).
- **Typography:** Modern variable font via `next/font` (Inter / Outfit) with balanced leading
  and hierarchy. Use `next/font` — not a CDN link — to self-host fonts, eliminate external
  network requests, and prevent layout shift (CLS).
- **Glassmorphism & Elevation:** Subtle backdrop blur (`backdrop-blur-md`), layered dark mode
  drop shadows (`shadow-sm-dark` to `shadow-xl-dark`).

### Checklist for design system

- [ ] Replace `font-family: Arial` in `globals.css` body rule with `next/font` variable font
      (Inter or Outfit) configured in `app/layout.tsx`
- [ ] Refine `@theme` token definitions in `app/globals.css`
- [ ] Standardize text color contrast across all dark mode inputs, dropdowns, and canvas
      containers
- [ ] Polish scrollbars, tooltips, and micro-interaction animations

### Files to modify for design system

```txt
app/globals.css
app/layout.tsx
styles/editor/dark-theme.css
styles/editor/light-theme.css
```

---

## 1.5.8 Header & Room Navigation Overhaul

Redesign the application header for both the home dashboard and document room.

### Checklist navigation overhaul

- [ ] Build a sleek, floating room navigation header
- [ ] Add editable document title with seamless hover/focus transition and saving indicator
- [ ] Redesign connection status pill (`• Connected`, `• Reconnecting`, `• Offline`) with
      pulsing state
- [ ] Redesign collaborator avatar stack with smooth hover magnification and name badges
- [ ] Add breadcrumbs / quick navigation back to home

### Files to modify navigation overhaul

```txt
components/ui/shared/Header.tsx
components/collaborators/CollaborativeRoom.tsx
components/collaborators/ActiveCollaborators.tsx
```

---

## 1.5.9 Toolbar & Editor Canvas Modernization

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

## 1.5.10 Share Dialog UI & User Experience Polish

Provide a refined sharing modal experience matching modern collaborative editors.

### Checklist for share dialog UI

- [ ] Implement clear visual hierarchy: Document Access Summary, Email Invite Field,
      Collaborator List
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

### Performance (Production-Grade)

- [ ] Local dev server starts and compiles routes in under 5 seconds with Turbopack
- [ ] Sentry dev overhead is eliminated with no source map lag in development
- [ ] `/api/liveblocks-auth` responds in under 200ms consistently (no Clerk network round-trip)
- [ ] React Compiler is enabled; no manual `useMemo`/`useCallback` is required in new code
- [ ] Document room page shell renders before the Liveblocks WebSocket is established

### UI

- [ ] Application header and document canvas feature polished dark and light themes
- [ ] Toolbar controls are grouped into fluid pill sections with responsive active states
- [ ] Share modal provides instant link copying and clear collaborator management

---

## Suggested Commit Sequence

```txt
perf(dev): enable turbopack and optimize development compilation
perf(sentry): decouple telemetry and source map tracing in development
perf(editor): lazy-load auxiliary lexical plugins with next/dynamic
perf(auth): replace currentUser with auth to eliminate liveblocks cold start
perf(compiler): enable react compiler for automatic component memoization
perf(streaming): add suspense boundaries for streaming ssr on document room
style(theme): establish modern dark slate tokens and typography with next/font
style(header): redesign floating room header and live presence stack
style(toolbar): modernize editor toolbar with grouped pill formatting
style(share): polish share dialog layout and copy-link interactions
```

---

## Next Phase

→ [Phase 2 — Core Product Features & Database Architecture](./phase-2-core-product-features.md)
