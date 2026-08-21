# Phase 2.5 — Enterprise Editor Canvas & Insert Experience

**Goal:** Elevate the Lexical editor from a functional rich-text input into a document-first
editing canvas. Introduce a Google Docs-inspired page layout (white page on a gray viewport,
ruler, visible margins), a comprehensive Insert menu covering the full range of block types
Lexical supports, and proper spatial anchoring of Liveblocks comment threads beside the page.
By the end of this phase the editor shell should feel unmistakably professional.

**Depends on:** [Phase 1.5 — Performance & UI Revamp](./performance-and-ui-revamp.md),
[Phase 2 — Core Product Features](./phase-2-core-product-features.md)

**Estimated effort:** 2–3 weeks

---

## Sections Overview

| Section | Focus                               | Effort |
| ------- | ----------------------------------- | ------ |
| 2.5.1   | Page canvas shell & viewport layout | Medium |
| 2.5.2   | Ruler & margin controls             | Medium |
| 2.5.3   | Comprehensive Insert menu           | Large  |
| 2.5.4   | Comment thread spatial anchoring    | Small  |
| 2.5.5   | Document outline sidebar            | Medium |

---

## 2.5.1 Page Canvas Shell & Viewport Layout

The most impactful visual change: replace the current full-width editor fill with a
document-first "paper on a desk" metaphor. The editor canvas becomes a constrained-width
white page centered in a gray viewport — the same mental model users bring from Google
Docs and Microsoft Word.

This is **not a Lexical change**. It is a CSS layout architecture change to the editor
shell components. Lexical renders inside whatever container you give it; the container
just needs to look like a page.

### Target Layout

```txt
+----------- Viewport (gray, #f0f0f0 / dark: #1a1a1a) -------------------------+
|                                                                               |
|  +--------- Document Room Header -------------------------------------------+|
|  | <- Home  | Untitled Document (pencil icon)  Connected  [Share] [Avatars] ||
|  +---------------------------------------------------------------------------+|
|                                                                               |
|  +--------- Toolbar (sticky, full-width) ------------------------------------+|
|  | [Undo][Redo] | [Format] | [Font][Size] | [B][I][U]... | [Insert] [Align] ||
|  +---------------------------------------------------------------------------+|
|                                                                               |
|  +--- Ruler -----------------------------------------------------------------+|
|                                                                               |
|          +------- Page Canvas (816px, white, shadow) --------+               |
|          |                                                    |               |
|          |  [cursor / editor content renders here]            |               |
|          |                                                    |               |
|          +----------------------------------------------------+               |
|                      [Comment column appears to the right]                    |
+-------------------------------------------------------------------------------+
```

### Why 816px

816px = 8.5 inches x 96 DPI — the standard US Letter page width at screen resolution.
This makes the page feel like a real document. A4 equivalent would be 794px. The width
should be a CSS custom property so it can be changed per-document in a later phase.

### Checklist for page canvas

- [ ] Wrap the editor viewport in a `PageViewport` shell component with a gray background
      and vertical scroll
- [ ] Center a `PageCanvas` div (max-width: 816px, white background, padding: 96px 96px,
      `box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`)
- [ ] Define `--page-width`, `--page-padding-x`, and `--page-padding-y` as CSS custom
      properties in `globals.css` for future per-document overrides
- [ ] Ensure the page canvas fills to at least the full viewport height even when content
      is short (min-height approach)
- [ ] Verify dark mode: viewport becomes `#1e1e1e`, page canvas becomes `#2a2a2a` or
      near-white depending on the user's document theme preference
- [ ] Confirm Liveblocks collaborator cursors render correctly inside the new canvas
      container (they are viewport-absolute and may need re-anchoring to the canvas)

### Files to modify for page canvas

```txt
components/editor/EditorShell.tsx              [NEW — wraps PageViewport + PageCanvas]
components/editor/Editor.tsx
app/(root)/documents/[id]/page.tsx
app/globals.css
styles/editor/index.css
```

---

## 2.5.2 Ruler & Margin Controls

A horizontal ruler sitting above the page canvas provides visual grounding and, in a later
iteration, draggable margin handles. The first iteration ships a read-only ruler that
reflects the current page width and padding. Drag-to-adjust margins is a Phase 3 stretch
goal and is explicitly out of scope here.

### Ruler Anatomy

```txt
  <- margin ->|<-- -- -- -- text area (624px) -- -- -- -- -->|<- margin ->
  0           1           2           3           4           5           6
  |           |           |           |           |           |           |
  |||   |   |||   |   |||   |   |||   |   |||   |   |||   |   |||   |   |||
```

### Checklist for ruler

- [ ] Build a `DocumentRuler` React component that renders above the page canvas
- [ ] Ruler ticks at 0.25in intervals, labeled at every 1in; tick height varies by interval
- [ ] Ruler width matches the page canvas width including horizontal scroll offset
- [ ] Shade the margin zones (left and right of the text area) in a distinct background
      tint to visually separate them from the live editing zone
- [ ] The ruler hides automatically on mobile (below `md` breakpoint) where page
      margins collapse for readability
- [ ] Expose `--ruler-unit` CSS variable (`96px = 1in`) for consistency with page width

### Files to modify for ruler

```txt
components/editor/DocumentRuler.tsx            [NEW]
components/editor/EditorShell.tsx
styles/editor/index.css
```

---

## 2.5.3 Comprehensive Insert Menu

Google Docs compresses its most-used features into a well-organized Insert dropdown. We
will add an **Insert** dropdown to the toolbar that surfaces all Lexical-native block types
in one place, grouped logically. This replaces scattered toolbar buttons and makes the
editor feel complete without overwhelming the toolbar strip.

### Insert Menu Groups & Items

```txt
Insert
+-- Media
|   +-- Image (upload or URL)
|   +-- Horizontal Rule / Divider
+-- Structure
|   +-- Table (opens table size picker)
|   +-- Callout Block (info, warning, tip)
|   +-- Page Break
+-- Embed
|   +-- YouTube Video
|   +-- Tweet
|   +-- External Link (block-level embed)
+-- Code
    +-- Code Block (with language selector)
```

> **Out of scope for this phase:** Drawing canvas (Excalidraw integration), Charts (third-party
> embed), Smart chips (requires API integration), Inline math (LaTeX). These are Phase 3+
> concerns.

### Lexical Node Requirements

| Insert Item     | Lexical Mechanism                     | Status   |
| --------------- | ------------------------------------- | -------- |
| Image           | Custom `ImageNode` (Decorator)        | To build |
| Horizontal Rule | `HorizontalRuleNode` (@lexical/react) | To wire  |
| Table           | `@lexical/table` — already in editor  | Exists   |
| Callout Block   | Custom `CalloutNode` (Decorator)      | To build |
| Page Break      | Custom `PageBreakNode` (Decorator)    | To build |
| YouTube Embed   | Custom `YouTubeNode` (Decorator)      | To build |
| Tweet Embed     | Custom `TweetNode` (Decorator)        | To build |
| Code Block      | `@lexical/code` — already in editor   | Exists   |

### Checklist for Insert menu

- [ ] Build `InsertDropdown` toolbar component with grouped sections and keyboard-accessible
      menu items
- [ ] Implement `ImageNode` (Decorator): upload dialog to file to base64 or Vercel Blob
      URL; resize handle overlay on selection
- [ ] Wire `HorizontalRuleNode` from `@lexical/react` as an insert action
- [ ] Implement `CalloutNode` (Decorator): styled block with icon (info / warning / tip)
      and an editable body text child
- [ ] Implement `PageBreakNode` (Decorator): renders as a visual dashed rule across the
      page canvas; semantically represents a manual page break
- [ ] Implement `YouTubeNode` (Decorator): takes a YouTube URL, renders `<iframe>` with
      aspect-ratio box inside the canvas
- [ ] Implement `TweetNode` (Decorator): takes a tweet URL, renders `<blockquote>` embed
      via Twitter's oEmbed endpoint
- [ ] All custom nodes must serialize to/from Lexical JSON correctly for Liveblocks
      persistence and Markdown export (Phase 2)
- [ ] Add smooth open/close animations to the Insert dropdown
- [ ] Verify all custom nodes render correctly in both dark and light mode

### Files to modify for Insert menu

```txt
components/editor/plugins/toolbarPlugin/ToolbarPlugin.tsx
components/editor/plugins/toolbarPlugin/toolbarDropdown/InsertDropdown.tsx   [NEW]
components/editor/nodes/ImageNode.tsx                                         [NEW]
components/editor/nodes/CalloutNode.tsx                                       [NEW]
components/editor/nodes/PageBreakNode.tsx                                     [NEW]
components/editor/nodes/YouTubeNode.tsx                                       [NEW]
components/editor/nodes/TweetNode.tsx                                         [NEW]
components/editor/Editor.tsx
```

---

## 2.5.4 Comment Thread Spatial Anchoring

Liveblocks `FloatingThreads` currently renders comment threads as overlays attached to
selected text. The enterprise pattern — as seen in Google Docs — is to anchor threads to
the right margin of the page, vertically aligned with the text they annotate. This gives
comments their own column and keeps the document canvas unobstructed.

### Target Layout for comment anchoring

```txt
+------- Page Canvas -----------------+   +---- Comment Column (320px) --------+
|                                     |   |                                     |
|  Lorem ipsum dolor sit amet,        |<--|  Thread: @user - 2h ago             |
|  consectetur adipiscing elit.       |   |  "Can we rework this paragraph?"    |
|                                     |   |  [Reply...]                         |
|                                     |   +-------------------------------------+
+-------------------------------------+
```

### Checklist for comment anchoring

- [ ] Wrap the page canvas and comment column in a flex row container inside `EditorShell`
- [ ] Position `FloatingThreads` (Liveblocks) inside the comment column (right side),
      fixed width 320px, with `position: absolute` anchored to the annotated text's
      vertical offset within the page canvas
- [ ] Ensure the comment column collapses to a floating popover on narrow viewports
      (below `lg` breakpoint) to preserve canvas space on tablets
- [ ] Add a toggle button in the room header to show/hide the comment column
- [ ] Verify that clicking a comment thread highlights the corresponding text range in
      the Lexical editor

### Files to modify for comment anchoring

```txt
components/editor/EditorShell.tsx
components/collaborators/CollaborativeRoom.tsx
components/ui/shared/Header.tsx
styles/editor/index.css
```

---

## 2.5.5 Document Outline Sidebar

A collapsible left sidebar that reads heading nodes (H1, H2, H3) from the Lexical editor
state and renders a navigable outline. Clicking an entry smoothly scrolls the page canvas
to the corresponding heading. This mirrors Google Docs' document outline panel and
significantly improves navigation on long documents.

### Checklist for document outline

- [ ] Build an `OutlinePlugin` Lexical plugin that reads the editor state for heading nodes
      and emits an ordered outline array on every editor state change
- [ ] Build an `OutlineSidebar` component that renders the outline with indentation levels
      matching heading depth (H1 / H2 / H3)
- [ ] Clicking an outline item scrolls the associated heading into view using
      `scrollIntoView` on the heading's DOM node (retrieved via `editor.getElementByKey`)
- [ ] The sidebar is collapsible; default state is open on desktop, closed on tablet and
      mobile
- [ ] Highlight the active heading in the outline as the user scrolls through the document
- [ ] The sidebar toggle button lives in the document room header

### Files to modify for document outline

```txt
components/editor/plugins/OutlinePlugin.tsx    [NEW]
components/editor/OutlineSidebar.tsx           [NEW]
components/editor/EditorShell.tsx
components/editor/Editor.tsx
components/ui/shared/Header.tsx
```

---

## Acceptance Criteria

### Canvas & Layout

- [ ] The editor renders as a white page (816px wide) centered on a gray viewport background
- [ ] A horizontal ruler sits above the page with correct inch markings and shaded margin zones
- [ ] Page canvas has a drop shadow and correct padding in both dark and light mode
- [ ] Liveblocks cursors and presence indicators are correctly anchored within the page canvas

### Insert Experience

- [ ] The Insert dropdown surfaces all supported block types in logical groups
- [ ] Images, callout blocks, page breaks, YouTube embeds, and tweets insert correctly
      and persist across collaborative sessions via Liveblocks
- [ ] All custom Lexical nodes serialize to and from Lexical JSON correctly

### Comments & Outline

- [ ] Comment threads are spatially anchored to the right margin column beside the page
- [ ] The document outline sidebar renders H1/H2/H3 headings and scrolls to them on click
- [ ] Both the comment column and outline sidebar are independently collapsible from the
      document room header

---

## Suggested Commit Sequence

```txt
style(canvas): introduce page canvas shell with gray viewport and white page layout
style(ruler): add horizontal document ruler with inch markings and margin zones
feat(editor): add Insert dropdown with grouped block type actions to toolbar
feat(nodes): implement ImageNode with upload dialog and resize handle
feat(nodes): implement CalloutNode with info, warning, and tip variants
feat(nodes): implement PageBreakNode as dashed visual rule in canvas
feat(nodes): implement YouTubeNode and TweetNode decorator embeds
feat(comments): anchor liveblocks threads to right margin column beside page
feat(outline): add collapsible document outline sidebar driven by heading nodes
```

---

## Next Phase

-> [Phase 3 — AI Features](./phase-3-ai-features.md)
