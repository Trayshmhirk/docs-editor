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

- [ ] Create upgrade branch from `dev`
- [ ] Upgrade Liveblocks packages first; fix auth/room API changes
- [ ] Upgrade Lexical packages; resolve `@liveblocks/react-lexical` compatibility
- [ ] Upgrade Clerk; update middleware and server imports if needed
- [ ] Upgrade Next.js + React
- [ ] Remove or update `package.json` `overrides` block if no longer needed
- [ ] Re-enable strict security audits: remove Phase 0 transitional bypasses (`continue-on-error: true` in `.github/workflows/ci.yml` and exit fallback in `package.json`)
- [ ] Run full manual test: sign-in, create doc, edit, share, comments
- [ ] Fix any TypeScript errors from upgraded types

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

- [ ] Install `tailwindcss@4` and `@tailwindcss/postcss`
- [ ] Update `postcss.config.mjs` to use `@tailwindcss/postcss`
- [ ] Replace `@tailwind` directives in `app/globals.css` with `@import "tailwindcss"`
- [ ] Migrate theme from `tailwind.config.ts` to `@theme` in CSS:
  - Custom colors (`blue`, `red`, `dark`)
  - Breakpoints (`xs`, `sm`, `md`, `lg`, `xl`)
  - Keyframes / animations (`accordion-down`, `accordion-up`)
  - Custom box shadows (`sm-dark`, `lg-dark`, etc.)
- [ ] Configure dark mode via `@custom-variant dark` (class strategy)
- [ ] Migrate `tailwindcss-animate` usage to v4-compatible approach
- [ ] Delete `tailwind.config.ts`
- [ ] Update `prettier-plugin-tailwindcss` to version supporting Tailwind v4
- [ ] Visual regression pass:
  - Home / document list
  - Editor toolbar and content area
  - Clerk sign-in/up pages
  - Liveblocks comments UI
  - Dark and light themes
- [ ] Update editor-specific CSS in `styles/editor/` and `styles/liveblocks/` if needed

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

- [ ] Define `Presence` type with cursor position, optional selection, name, color
- [ ] Enable Lexical/Liveblocks cursor overlay components (or build custom)
- [ ] Show collaborator name labels near cursors
- [ ] Keep avatar stack in header (`ActiveCollaborators`) in sync with presence
- [ ] Test with 2+ browser sessions simultaneously

### Files to modify for live cursors

```txt
liveblocks.config.ts
components/collaborators/ActiveCollaborators.tsx
components/editor/Editor.tsx
```

---

## 1.4 Collaboration bug fixes and polish

### Known issues

- [ ] **CollaborativeRoom cleanup bug** — `useEffect` cleanup re-adds `mousedown` listener instead of removing it (`CollaborativeRoom.tsx` ~line 79)
- [ ] Debounce or debounce-adjacent title saves; reduce redundant `updateDocument` calls
- [ ] Add connection status indicator (connected / reconnecting / offline)
- [ ] Improve viewer vs editor UX (clearer read-only state in toolbar)

### Files to modify for bug fixes

```txt
components/collaborators/CollaborativeRoom.tsx
components/editor/Editor.tsx
components/editor/plugins/toolbarPlugin/ToolbarPlugin.tsx
```

---

## 1.5 Enable tables in the editor

`TableNode`, `TableCellNode`, `TableRowNode` exist in `playgroundNodes.ts` but no `TablePlugin` is wired.

- [ ] Add `@lexical/table` TablePlugin to `Editor.tsx`
- [ ] Add table insert/control UI to toolbar
- [ ] Verify tables sync correctly via Liveblocks
- [ ] Style tables in editor theme CSS

### Files to modify for enabling tables

```txt
components/editor/Editor.tsx
components/editor/plugins/toolbarPlugin/ToolbarPlugin.tsx
styles/editor/index.css
```

---

## 1.6 Share flow improvements

- [ ] Validate email format before invite
- [ ] Handle invite for users not yet registered in Clerk (pending state / messaging)
- [ ] Copy-link sharing (view-only link as quick win)
- [ ] Close share modal and refresh collaborator list after successful invite
- [ ] Improve error feedback on failed share

### Files to modify for flow improvements

```txt
components/modal/ShareModal.tsx
lib/actions/room.actions.ts
lib/actions/user.actions.ts
```

---

## Acceptance criteria

- [ ] All Phase 0 CI checks pass on upgraded stack
- [ ] Tailwind v4 live; no `tailwind.config.ts`; editor UI matches pre-migration
- [ ] Two users see each other's cursors while editing
- [ ] Tables can be inserted and collaborate correctly
- [ ] Share flow handles errors gracefully
- [ ] No listener leaks in CollaborativeRoom

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

→ [Phase 2 — Core Product Features](./phase-2-core-product-features.md)
