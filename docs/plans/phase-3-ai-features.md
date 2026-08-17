# Phase 3 — AI Features

**Goal:** AI that feels native to the editor — rewrite, format, generate, and summarize — not a bolt-on chatbot.

**Depends on:** [Phase 1 — Foundation & Collaboration](./phase-1-foundation-collaboration.md) (stable Lexical + Liveblocks). [Phase 2](./phase-2-core-product-features.md) optional but recommended for version snapshots before AI edits.

**Estimated effort:** 2–3 weeks

---

## 3.1 Architecture overview

```txt
User selects text (or places cursor)
        ↓
AI panel / slash command opens
        ↓
POST /api/ai/edit  (streaming, auth-guarded)
        ↓
LLM returns Markdown or Lexical-compatible structure
        ↓
Preview diff → user accepts
        ↓
Apply via editor.update() → Liveblocks syncs to collaborators
```

### Principles

- Apply edits as Lexical transactions (preserves undo/redo + collaboration)
- Always show preview before applying destructive changes
- Never send document content without explicit user action
- Rate-limit API routes per user
- Log usage for cost monitoring (no PII in logs)

---

## 3.2 Infrastructure

- [ ] Add **Vercel AI SDK** (`ai` package) for streaming
- [ ] Choose provider: OpenAI, Anthropic, or configurable via env
- [ ] Add env vars to `.env.example`:

  ```env
  OPENAI_API_KEY=
  # or
  ANTHROPIC_API_KEY=
  AI_MODEL=gpt-4o
  ```

- [ ] Create base route: `app/api/ai/edit/route.ts`
- [ ] Auth guard: require Clerk session (`currentUser()`)
- [ ] Rate limiting: `@upstash/ratelimit` or in-memory for dev

---

## 3.3 AI command plugin (Lexical)

- [ ] Create `AICommandPlugin` for Lexical
- [ ] Triggers:
  - `/ai` slash command in editor
  - Toolbar button "Ask AI"
  - Context menu on text selection
- [ ] Floating panel UI: prompt input, action chips, streaming output
- [ ] Selection-aware: pass selected text as context to API

### Files to create

```txt
components/editor/plugins/aiCommandPlugin/index.tsx
components/editor/plugins/aiCommandPlugin/AICommandPanel.tsx
app/api/ai/edit/route.ts
lib/ai/prompts.ts
lib/ai/apply-ai-edit.ts      ← Lexical transaction helpers
```

---

## 3.4 Core AI actions

| Action                   | Description                                              | Priority |
| ------------------------ | -------------------------------------------------------- | -------- |
| **Improve writing**      | Rewrite selection for clarity, tone, or length           | P0       |
| **Fix grammar**          | Grammar and spelling pass                                | P0       |
| **Format content**       | Restructure bullets → table, add headings, fix hierarchy | P0       |
| **Generate from prompt** | Insert new content at cursor from user prompt            | P1       |
| **Change tone**          | Formal, casual, concise, expand                          | P1       |
| **Summarize**            | Summarize selection or full document                     | P1       |
| **Translate**            | Translate selection to chosen language                   | P2       |

### Prompt engineering

- [ ] Centralize prompts in `lib/ai/prompts.ts`
- [ ] Include document title as context when available
- [ ] Instruct model to return Markdown for predictable parsing
- [ ] System prompt: preserve factual content unless user asks to change it

---

## 3.5 Diff preview and apply

- [ ] Show side-by-side or inline diff before applying
- [ ] "Accept" applies Lexical transaction; "Discard" closes panel
- [ ] Undo works after accept (HistoryPlugin)
- [ ] For collaborative docs: other users see the change live after accept (expected)

### Apply strategy

```typescript
// Pseudocode — apply Markdown to selection
editor.update(() => {
  const selection = $getSelection();
  // Parse markdown → Lexical nodes
  // Replace selection or insert at cursor
});
```

- [ ] Use `@lexical/markdown` or custom converter
- [ ] Handle edge cases: empty selection, full document replace

---

## 3.6 AI formatting presets (differentiator)

One-click structural transforms:

- [ ] "Make this a meeting notes format"
- [ ] "Make this a blog post outline"
- [ ] "Make this a legal brief structure"
- [ ] "Add table of contents from headings"

Preset definitions live in `lib/ai/presets.ts`.

---

## 3.7 Document-level AI sidebar

- [ ] Collapsible sidebar on document page
- [ ] Full-document summary
- [ ] "Ask about this document" Q&A with doc content as context
- [ ] Chat history per document (store in Postgres if Phase 2 DB exists)

---

## 3.8 AI in comments (stretch)

- [ ] "Suggest reply" on comment threads
- [ ] Uses thread context + surrounding document excerpt
- [ ] Inserts suggested reply into comment composer for user to edit/send

---

## 3.9 Collaborative AI (stretch)

- [ ] One user triggers AI; others see suggestion in real time before accept
- [ ] "Apply for everyone" vs "Apply for me only" (if technically feasible)
- [ ] Defer if complex; document as v2 feature

---

## 3.10 Security and compliance

- [ ] API keys server-side only — never expose to client
- [ ] Do not log full document content
- [ ] Optional: user setting to disable AI features
- [ ] Document data handling in privacy policy / README
- [ ] Consider provider data retention policies (OpenAI zero retention, etc.)

---

## Acceptance criteria

- [ ] Authenticated user can select text, prompt AI, preview, and apply edit
- [ ] Edits sync to other collaborators via Liveblocks
- [ ] Undo reverts AI-applied changes
- [ ] Rate limiting prevents abuse
- [ ] At least 3 actions work: improve writing, format content, generate from prompt
- [ ] AI panel matches app dark/light theme

---

## Suggested commit sequence

```txt
feat(ai): add ai edit api route with streaming
feat(ai): add ai command plugin and panel ui
feat(ai): add diff preview and apply flow
feat(ai): add formatting presets
feat(ai): add document summary sidebar
```

---

## Next phase

→ [Phase 4 — Auth Strategy](./phase-4-auth-strategy.md)
