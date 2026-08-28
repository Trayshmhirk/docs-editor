# Phase 1 — Foundation & Seamless Collaboration

**Goal:** Modernize the dependency stack, migrate to Tailwind v4, and make real-time collaboration feel polished.

**Depends on:** [Phase 0 — Tooling](./phase-0-tooling.md) (CI must be green before large upgrades).

**Estimated effort:** 2–3 weeks

---

## 1.1 Dependency upgrades

Upgrade incrementally; run CI after each major bump.

### Priority order

| Package                 | Current (approx.) | Target                                             | Notes                                                                                           |
| ----------------------- | ----------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `@liveblocks/*`         | 2.15              | 3.x                                                | **Breaking** — review [Liveblocks upgrade guide](https://liveblocks.io/docs/platform/upgrading) |
| `lexical`, `@lexical/*` | 0.22              | latest compatible with `@liveblocks/react-lexical` | Check Liveblocks peer deps                                                                      |
| `@clerk/nextjs`         | 6.4               | 7.x                                                | Review Clerk v7 migration                                                                       |
| `next`                  | 15.0              | latest 15.x or 16.x                                | Upgrade after Liveblocks/Lexical stabilize                                                      |
| `react`, `react-dom`    | 18.3              | 19.x                                               | Only when Next.js version supports it                                                           |
| `@sentry/nextjs`        | 8.x               | latest                                             | Usually straightforward                                                                         |

### Checklist

- [x] Create upgrade branch from `dev`
- [x] Upgrade Liveblocks packages first; fix auth/room API changes
- [x] Upgrade Lexical packages; resolve `@liveblocks/react-lexical` compatibility
- [x] Upgrade Clerk; update middleware and server imports if needed
- [x] Upgrade Next.js + React
- [x] Remove or update `package.json` `overrides` block if no longer needed
- [x] Re-enable strict security audits: remove Phase 0 transitional bypasses (`continue-on-error: true` in `.github/workflows/ci.yml` and exit fallback in `package.json`)
- [x] Run full manual test: sign-in, create doc, edit, share, comments
- [x] Fix any TypeScript errors from upgraded types

### Key files

```txt
package.json
package-lock.json
middleware.ts
app/api/liveblocks-auth/route.ts
lib/actions/room.actions.ts
lib/actions/user.actions.ts
components/editor/Editor.tsx
liveblocks.config.ts
```

---

## 1.2 Tailwind CSS v4 migration

> Do this **after** Phase 0 CI is stable, bundled with dependency work in Phase 1.

Tailwind v4 is CSS-first: theme tokens move into CSS; `tailwind.config.ts` is removed.

### Checklist for tailwind v4

- [x] Install `tailwindcss@4` and `@tailwindcss/postcss`
- [x] Update `postcss.config.mjs` to use `@tailwindcss/postcss`
- [x] Replace `@tailwind` directives in `app/globals.css` with `@import "tailwindcss"`
- [x] Migrate theme from `tailwind.config.ts` to `@theme` in CSS:
  - Custom colors (`blue`, `red`, `dark`)
  - Breakpoints (`xs`, `sm`, `md`, `lg`, `xl`)
  - Keyframes / animations (`accordion-down`, `accordion-up`)
  - Custom box shadows (`sm-dark`, `lg-dark`, etc.)
- [x] Configure dark mode via `@custom-variant dark` (class strategy)
- [x] Migrate `tailwindcss-animate` usage to v4-compatible approach
- [x] Delete `tailwind.config.ts`
- [x] Update `prettier-plugin-tailwindcss` to version supporting Tailwind v4
- [x] Visual regression pass:
  - Home / document list
  - Editor toolbar and content area
  - Clerk sign-in/up pages
  - Liveblocks comments UI
  - Dark and light themes
- [x] Update editor-specific CSS in `styles/editor/` and `styles/liveblocks/` if needed

### Files to modify

```txt
package.json
postcss.config.mjs
app/globals.css
tailwind.config.ts          ← delete after migration
styles/editor/index.css
styles/editor/light-theme.css
styles/editor/dark-theme.css
styles/liveblocks/index.css
.prettierrc
```

---

## 1.3 Live cursors and presence

Currently `Presence` in `liveblocks.config.ts` is empty and `ActiveCollaborators` only shows avatars.

### Checklist for live cursors

- [x] Define `Presence` type with cursor position, optional selection, name, color
- [x] Enable Lexical/Liveblocks cursor overlay components (or build custom)
- [x] Show collaborator name labels near cursors
- [x] Keep avatar stack in header (`ActiveCollaborators`) in sync with presence
- [x] Test with 2+ browser sessions simultaneously

### Files to modify for live cursors

```txt
liveblocks.config.ts
components/collaborators/ActiveCollaborators.tsx
components/editor/Editor.tsx
```

---

## 1.4 Collaboration bug fixes and polish

### Known issues

- [x] **CollaborativeRoom cleanup bug** — `useEffect` cleanup re-adds `mousedown` listener instead of removing it (`CollaborativeRoom.tsx` ~line 79)
- [x] Debounce or debounce-adjacent title saves; reduce redundant `updateDocument` calls
- [x] Add connection status indicator (connected / reconnecting / offline)
- [x] Improve viewer vs editor UX (clearer read-only state in toolbar)

### Files to modify for bug fixes

```txt
components/collaborators/CollaborativeRoom.tsx
components/editor/Editor.tsx
components/editor/plugins/toolbarPlugin/ToolbarPlugin.tsx
```

---

## 1.5 Enable tables in the editor

`TableNode`, `TableCellNode`, `TableRowNode` exist in `playgroundNodes.ts` but no `TablePlugin` is wired.

- [x] Add `@lexical/table` TablePlugin to `Editor.tsx`
- [x] Add table insert/control UI to toolbar
- [x] Verify tables sync correctly via Liveblocks
- [x] Style tables in editor theme CSS

### Files to modify for enabling tables

```txt
components/editor/Editor.tsx
components/editor/plugins/toolbarPlugin/ToolbarPlugin.tsx
styles/editor/index.css
```

---

## 1.6 Share flow improvements

- [x] Validate email format before invite
- [x] Handle invite for users not yet registered in Clerk (pending state / messaging)
- [x] Copy-link sharing (view-only link as quick win)
- [x] Close share modal and refresh collaborator list after successful invite
- [x] Improve error feedback on failed share

### Files to modify for flow improvements

```txt
components/modal/ShareModal.tsx
lib/actions/room.actions.ts
lib/actions/user.actions.ts
```

---

## Acceptance criteria

- [x] All Phase 0 CI checks pass on upgraded stack
- [x] Tailwind v4 live; no `tailwind.config.ts`; editor UI matches pre-migration
- [x] Two users see each other's cursors while editing
- [x] Tables can be inserted and collaborate correctly
- [x] Share flow handles errors gracefully
- [x] No listener leaks in CollaborativeRoom

---

## Suggested commit sequence

```txt
build(deps): upgrade liveblocks to v3
build(deps): upgrade lexical packages
build(deps): upgrade clerk and next.js
build: migrate tailwind css to v4
feat(collaboration): add live cursors and presence
fix(collaboration): correct event listener cleanup in collaborative room
feat(editor): enable table plugin
feat(share): improve invite validation and error handling
```

---

## Next phase

→ [Phase 1.5 — Performance & UI Revamp](./phase-1.5-performance-and-ui-revamp.md)
