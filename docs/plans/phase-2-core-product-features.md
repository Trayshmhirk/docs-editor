# Phase 2 — Core Product Features & Database Architecture

**Goal:** Transform Docs Editor into a multi-tenant document platform with an application database (Postgres), personalized home dashboards, Google Docs-grade sharing (anonymous guest carets & public link sharing), Google Drive/Docs integration, version history, full-text search, and multi-format exports.

**Depends on:** [Phase 1 — Foundation & Collaboration](./phase-1-foundation-collaboration.md), [Phase 1.5 — Performance & UI Revamp](./performance-and-ui-revamp.md)

**Estimated effort:** 3–4 weeks

---

## 2.1 Application Database & Multi-Tenant Schema (Postgres)

Liveblocks handles real-time delta streaming and collaborative CRDT state. Postgres stores application metadata, document ownership, user preferences, and permissions.

### Architecture Overview

```txt
┌────────────────────────────┐       ┌────────────────────────────┐
│      Postgres Database     │       │    Liveblocks WebSocket    │
│ (Users, Docs, Permissions) │       │ (Document Canvas & Cursors)│
└─────────────┬──────────────┘       └─────────────┬──────────────┘
              │                                    │
              ▼                                    ▼
       Next.js 15 Server                   Lexical Rich Text
       Actions & API Layer                 Collaborative Canvas
```

### Database Schema (Drizzle ORM / Prisma)

```sql
-- Users (Linked with Clerk or Inbuilt Auth)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Metadata
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  liveblocks_room_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  general_access TEXT NOT NULL DEFAULT 'restricted', -- 'restricted' | 'public_view' | 'public_edit'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Document Permissions
CREATE TABLE document_permissions (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'viewer' | 'commenter' | 'editor'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_email)
);

-- Folders
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Starred Documents
CREATE TABLE starred_documents (
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, document_id)
);
```

### Checklist

- [ ] Set up Drizzle ORM (or Prisma) with Postgres connection pooling
- [ ] Define database schema tables: `users`, `documents`, `document_permissions`, `folders`, `starred_documents`
- [ ] Create database migration scripts and seed utilities
- [ ] Sync document creation and deletion lifecycle between Postgres and Liveblocks rooms

### Files to create/modify

```txt
drizzle.config.ts (or prisma/schema.prisma)
lib/db/index.ts
lib/db/schema.ts
lib/actions/document.actions.ts
.env.example
```

---

## 2.2 Personalized Multi-Tenant Dashboard (`/`)

The home screen must be strictly tailored to the authenticated user, matching Google Docs' organization.

### Dashboard Views

1. **Owned by Me:** Documents where `owner_id === user.id` and `deleted_at IS NULL`.
2. **Shared with Me:** Documents where `document_permissions.user_email === user.email` (excluding owned docs).
3. **Recent:** All accessible documents sorted chronologically by `updated_at DESC`.
4. **Starred:** Quick-access bookmarked documents from `starred_documents`.
5. **Trash:** Soft-deleted documents (`deleted_at IS NOT NULL`) with restore and permanent purge actions.

### Checklist for multi-tenant dashboard

- [ ] Rebuild home page (`app/(root)/page.tsx`) with dynamic tab filtering (_All_, _Owned by me_, _Shared with me_, _Recent_, _Trash_)
- [ ] Implement document search bar and sorting options (Last modified, Title, Date created)
- [ ] Add Grid and List view switcher for document cards
- [ ] Build document action menu: Rename, Star, Duplicate, Move to Folder, Move to Trash

### Files to create/modify for multi-tenant dashboard

```txt
app/(root)/page.tsx
components/dashboard/DocumentGrid.tsx
components/dashboard/DocumentList.tsx
components/dashboard/DocumentCard.tsx
components/dashboard/DashboardTabs.tsx
components/dashboard/DocumentActionsMenu.tsx
```

---

## 2.3 Google Docs-Grade Sharing & Anonymous Guest Carets

Allow seamless public link sharing without forcing mandatory sign-ups, while retaining strict permission controls.

### Two-Tier Permission Model

```txt
┌─────────────────────────────────────────────────────────────┐
│                    Document Share Model                     │
├─────────────────────────────────────────────────────────────┤
│ 1. General Access:                                          │
│    • Restricted: Only users with explicit invites           │
│    • Anyone with the link (Viewer / Editor)                 │
│                                                             │
│ 2. People with Access:                                      │
│    • Owner (Full rights)                                    │
│    • Invited Collaborators (Viewer / Commenter / Editor)    │
└─────────────────────────────────────────────────────────────┘
```

### Anonymous Guest Collaboration

When a document has `general_access = 'public_view'` or `'public_edit'`:

- Unauthenticated visitors can open `/documents/[id]` directly without being forced to `/sign-in`.
- `/api/liveblocks-auth` generates an ephemeral guest identity (_Anonymous Penguin_, _Anonymous Otter_) with a randomized color and guest avatar.
- Anonymous users have full real-time reading and cursor visibility.

### Post-Auth Deep Linking

- If an unauthenticated user opens a restricted document, preserve `returnBackUrl=/documents/[id]` so that after signing in/up they return directly to the document instead of the home screen.

### Checklist for sharing

- [ ] Add `general_access` selector (_Restricted_ vs _Anyone with link_) to `ShareModal.tsx`
- [ ] Update `app/api/liveblocks-auth/route.ts` to support authenticated users and anonymous guest tokens
- [ ] Update `middleware.ts` to permit public document access when `general_access !== 'restricted'`
- [ ] Preserve return URLs across Clerk sign-in and sign-up flows

### Files to create/modify for sharing

```txt
app/api/liveblocks-auth/route.ts
middleware.ts
components/modal/ShareModal.tsx
lib/actions/room.actions.ts
```

---

## 2.4 Google Drive & Google Docs Integrations (Export & Import)

Allow seamless document synchronization and export with the Google Workspace ecosystem.

### Google Integration Workflows

1. **Export to Google Docs / Google Drive:**
   - Authenticate with Google OAuth (`drive.file` / `documents` scope).
   - Convert Lexical document AST into Google Docs formatting via Google Docs API (`documents.create` + `documents.batchUpdate`).
   - Save directly as a Google Doc or uploaded `.docx` / `.pdf` in the user's Google Drive.
2. **Import from Google Drive:**
   - Integrate Google Drive File Picker.
   - Fetch `.gdoc`, `.docx`, or `.md` files, parse into Lexical nodes, and instantiate a new collaborative room.

### Checklist for export/import

- [ ] Configure Google OAuth client and API credentials
- [ ] Implement Lexical AST to Google Docs API structural transformer
- [ ] Add "Save to Google Drive" and "Export to Google Docs" options to export dialog
- [ ] Add "Import from Google Drive" action on home dashboard

### Files to create/modify for export/import

```txt
app/api/integrations/google/export/route.ts
app/api/integrations/google/import/route.ts
lib/integrations/google-docs.ts
lib/integrations/google-drive.ts
components/modal/ExportModal.tsx
```

---

## 2.5 Version History & Snapshots

Provide revision tracking, comparison, and one-click rollback.

### Checklist for version history

- [ ] Wire Liveblocks Yjs history / versioning API endpoints
- [ ] Build Version History sidebar UI displaying timestamped revisions and authors
- [ ] Implement "Restore this version" workflow with confirmation dialog
- [ ] Add named version tagging (e.g. "Final Draft", "Approved Copy")

### Files to create/modify for version history

```txt
components/editor/VersionHistorySidebar.tsx
lib/actions/version.actions.ts
app/(root)/documents/[id]/page.tsx
```

---

## 2.6 Unified Document Search (Titles + Full Text)

Enable instant search across all documents.

### Checklist for document search

- [ ] Implement fast title search via Postgres indexed queries
- [ ] Add plain-text content indexing in Postgres using `tsvector` on document save
- [ ] Build global `Cmd+K` / `Ctrl+K` search modal with instant results and highlight snippets

### Files to create/modify for document search

```txt
components/dashboard/SearchCommandModal.tsx
app/api/search/route.ts
lib/actions/document.actions.ts
```

---

## 2.7 Document Organization (Folders, Starred, Trash)

Structured file management for power users.

### Checklist for docs organization

- [ ] Implement folder creation, renaming, nesting, and document movement
- [ ] Add folder tree sidebar navigation on home screen
- [ ] Implement Star/Unstar toggle with instant UI update
- [ ] Implement Trash view with soft delete (`deleted_at`), Restore, and Empty Trash actions

### Files to create/modify for docs organization

```txt
components/dashboard/FolderSidebar.tsx
components/dashboard/FolderTree.tsx
components/dashboard/TrashView.tsx
lib/actions/folder.actions.ts
```

---

## 2.8 Multi-Format Export (Markdown, PDF, HTML, Docx)

Enable exporting document content to standard industry formats.

### Checklist multi-format export

- [ ] Export to Markdown (`.md`) using Lexical markdown serializer
- [ ] Export to PDF (`.pdf`) using `@react-pdf/renderer` or server-side headless print
- [ ] Export to HTML / Copy Rich Text for pasting into external tools
- [ ] Export to Word Document (`.docx`)

### Files to create/modify for multi-format export

```txt
app/api/export/[id]/route.ts
lib/export/markdown.ts
lib/export/pdf.ts
lib/export/docx.ts
components/modal/ExportModal.tsx
```

---

## 2.9 Keyboard Shortcuts, Command Palette & Inline Mentions

Provide power-user shortcuts and interactive collaborator tagging.

### Checklist for keyboard shortcuts

- [ ] Add `Cmd+K` / `Ctrl+K` command palette for quick formatting, exporting, and actions
- [ ] Add keyboard shortcuts help dialog (`?` key)
- [ ] Implement inline `@` mention plugin in Lexical editor with user autocomplete
- [ ] Send Liveblocks notifications when a user is mentioned in the document body

### Files to create/modify for keyboard shortcuts

```txt
components/editor/plugins/mentionPlugin/index.tsx
components/editor/CommandPalette.tsx
components/modal/ShortcutsModal.tsx
```

---

## 2.10 Mobile & Responsive Editor Experience

Ensure high-quality document editing across mobile devices and tablets.

### Checklist for mobile experience

- [ ] Build responsive bottom formatting toolbar for mobile viewports
- [ ] Optimize touch targets for selection, comments, and modals
- [ ] Verify touch drag and drop interactions

### Files to modify for mobile experience

```txt
components/editor/Editor.tsx
components/editor/plugins/toolbarPlugin/ToolbarPlugin.tsx
```

---

## Acceptance Criteria

- [ ] Postgres schema manages users, documents, permissions, and folders
- [ ] Home dashboard (`/`) dynamically separates _Owned by me_, _Shared with me_, _Recent_, and _Trash_
- [ ] Public link sharing allows unauthenticated users to view/edit with anonymous guest carets
- [ ] Documents can be exported to and imported from Google Drive / Google Docs
- [ ] Version history allows reviewing and restoring past document revisions
- [ ] Instant `Cmd+K` search finds documents by title and content
- [ ] Multi-format export (Markdown, PDF, HTML, Docx) works reliably

---

## Suggested Commit Sequence

```txt
feat(db): establish postgres schema with drizzle orm and migration scripts
feat(dashboard): build multi-tenant document views with dynamic filtering
feat(sharing): implement general access tiers and anonymous guest presence
feat(integrations): add google drive and google docs export/import handlers
feat(history): implement version history sidebar and snapshot restore
feat(search): add full-text postgres search with command palette modal
feat(organization): add folders, starred items, and soft-delete trash
feat(export): add multi-format export for markdown, pdf, and docx
feat(mentions): add inline collaborator mentions with inbox notifications
```

---

## Next Phase

→ [Phase 3 — AI Features & Inline Editing](./phase-3-ai-features.md)  
→ [Phase 4 — Auth Strategy & Inbuilt Auth Migration](./phase-4-auth-strategy.md)
