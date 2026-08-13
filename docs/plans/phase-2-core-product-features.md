# Phase 2 — Core Product Features

**Goal:** Close the gap with mainstream doc tools on everyday workflows — history, search, organization, export.

**Depends on:** [Phase 1 — Foundation & Collaboration](./phase-1-foundation-collaboration.md)

**Estimated effort:** 3–4 weeks

---

## 2.1 Application database (Postgres)

Liveblocks is the right store for real-time document content, but metadata features need a database.

### Why now

- Folders, search indexing, user preferences, and AI chat history don't belong in Liveblocks room metadata alone
- Unlocks Phase 4 auth flexibility (own user model alongside or instead of Clerk)

### Checklist

- [ ] Choose ORM: **Drizzle** or **Prisma** (match team preference)
- [ ] Add Postgres (local: Docker; prod: Neon, Supabase, or Railway)
- [ ] Define schema:
  - `users` — id, email, name, avatar, clerk_id (nullable), created_at
  - `documents` — id, liveblocks_room_id, title, owner_id, folder_id, created_at, updated_at, deleted_at
  - `folders` — id, name, owner_id, parent_id
  - `document_access` — document_id, user_id, role (viewer | editor)
- [ ] Sync document creation/deletion with Liveblocks room lifecycle
- [ ] Migrate document list page to read from DB (keep Liveblocks as content source)
- [ ] Add migration scripts and seed for local dev

### Files to create

```txt
drizzle.config.ts (or prisma/schema.prisma)
lib/db/
lib/actions/document.actions.ts   ← new DB-backed actions
.env.example                      ← DATABASE_URL
```

---

## 2.2 Version history

- [ ] Investigate Liveblocks Yjs history / room versioning APIs
- [ ] Build version history sidebar UI
- [ ] List named snapshots with timestamp and author
- [ ] "Restore this version" action with confirmation modal
- [ ] Optional: auto-snapshot on interval or before major AI edits (Phase 3)

### Files to create/modify

```txt
components/editor/VersionHistorySidebar.tsx
lib/actions/version.actions.ts
app/(root)/documents/[id]/page.tsx
```

---

## 2.3 Document search

- [ ] Full-text search across document titles (DB query)
- [ ] Content search: index Lexical plain text on save (webhook or client debounce → DB)
- [ ] Search UI on home page (Cmd+K or search bar)
- [ ] Highlight matches in results

### Considerations

- Liveblocks Search API vs self-hosted index in Postgres (`tsvector`)
- Start with title search; add content index in follow-up PR

---

## 2.4 Organization and navigation

- [ ] Folders / collections for documents
- [ ] Starred documents
- [ ] Recent documents (sorted by `updated_at`)
- [ ] Trash with soft delete (`deleted_at`) and restore
- [ ] Breadcrumb navigation in editor header

---

## 2.5 Export

- [ ] **Markdown** — Lexical `$generateMarkdownFromNodes` or equivalent
- [ ] **PDF** — server route with Puppeteer or `@react-pdf/renderer`
- [ ] **Copy as HTML** — for paste into other tools
- [ ] Export menu in document header (editor role only)

### Files to create for export

```txt
app/api/export/[id]/route.ts
components/modal/ExportModal.tsx
lib/export/markdown.ts
lib/export/pdf.ts
```

---

## 2.6 Keyboard shortcuts and command palette

- [ ] Standard formatting shortcuts (bold, italic, undo, redo)
- [ ] Cmd+K command palette (shadcn Command component)
- [ ] Shortcuts cheat sheet (`?` key or help menu)
- [ ] Document-level shortcuts (rename, share, export)

---

## 2.7 @mentions in editor

`resolveMentionSuggestions` already exists in `app/Provider.tsx` — extend to inline mentions.

- [ ] Lexical mention plugin or custom node
- [ ] `@` trigger with autocomplete dropdown
- [ ] Notify mentioned user (Liveblocks inbox notification)
- [ ] Render mention chips in editor

### Files to modify

```txt
app/Provider.tsx
components/editor/Editor.tsx
components/editor/nodes/playgroundNodes.ts
```

---

## 2.8 Mobile and responsive editor

- [ ] Collapsible toolbar on small viewports
- [ ] Touch-friendly comment composer
- [ ] Verify floating plugins degrade gracefully (already gated at 1025px in `Editor.tsx`)
- [ ] Test document list and editor on mobile browsers

---

## 2.9 Suggesting mode (optional / stretch)

Track changes before accept/reject — harder but differentiating.

- [ ] Research Lexical + Liveblocks patterns for suggestions
- [ ] "Suggesting" vs "Editing" mode toggle
- [ ] Accept/reject per change or batch
- [ ] Defer if scope too large; document as future work

---

## Acceptance criteria

- [ ] Documents stored in Postgres with Liveblocks room linkage
- [ ] User can browse folders, star docs, and recover from trash
- [ ] Search finds documents by title (content search if implemented)
- [ ] Export to Markdown works for a typical document
- [ ] @mentions notify collaborators
- [ ] Version history shows at least last N revisions with restore

---

## Suggested commit sequence

```txt
feat(db): add postgres schema for documents and folders
feat(documents): migrate document list to database
feat(search): add title search on home page
feat(export): add markdown export
feat(editor): add command palette and keyboard shortcuts
feat(collaboration): add inline mentions
feat(history): add version history sidebar
```

---

## Next phase

→ [Phase 3 — AI Features](./phase-3-ai-features.md)  
→ [Phase 4 — Auth Strategy](./phase-4-auth-strategy.md) (can run in parallel after DB exists)
