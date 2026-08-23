# Docs Editor — Development Roadmap

Living documentation for the docs-editor development effort. Each phase has its own file with checklists, file targets, and acceptance criteria.

## Branch strategy

```txt
master          ← production-ready releases
  └── dev       ← integration branch for development work
        └── feature/*  ← individual tasks per phase
```

- Open PRs into `dev`; merge `dev` → `master` when a phase (or milestone) is stable.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for every commit.
- See [CONTRIBUTING.md](../CONTRIBUTING.md) and [AGENTS.md](../../AGENTS.md) for full commit and PR rules.

### Commit format

```txt
<type>[optional scope]: <description>

Types: feat | fix | docs | style | refactor | test | chore | ci | build
```

Examples:

```txt
chore: add husky and lint-staged
ci: add github actions workflow for lint and build
docs: add phase 1 foundation plan
feat(collaboration): add live cursors and presence
```

---

## Phases

| Phase   | File                                                                             | Focus                                                    | Depends on                 |
| ------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------- |
| **0**   | [phase-0-tooling.md](./phase-0-tooling.md)                                       | Prettier, Husky, commitlint, CI/CD, security             | —                          |
| **1**   | [phase-1-foundation-collaboration.md](./phase-1-foundation-collaboration.md)     | Dependency upgrades, Tailwind v4, seamless collaboration | Phase 0                    |
| **1.5** | [performance-and-ui-revamp.md](./performance-and-ui-revamp.md)                   | Dev speed (Turbopack), Google Docs sharing, UI revamp    | Phase 1                    |
| **2**   | [phase-2-core-product-features.md](./phase-2-core-product-features.md)           | Version history, search, export, Postgres metadata       | Phase 1                    |
| **2.5** | [phase-2.5-enterprise-editor-canvas.md](./phase-2.5-enterprise-editor-canvas.md) | Page canvas, ruler, Insert menu, comments, outline       | Phase 1.5, Phase 2         |
| **3**   | [phase-3-ai-features.md](./phase-3-ai-features.md)                               | Inline AI editing, formatting, summarization             | Phase 1 (Phase 2 optional) |
| **4**   | [phase-4-auth-strategy.md](./phase-4-auth-strategy.md)                           | Clerk customization vs custom auth                       | Phase 0 (Phase 2 for DB)   |

---

## Current codebase snapshot (baseline)

| Area              | Current state                                       |
| ----------------- | --------------------------------------------------- |
| **Framework**     | Next.js 15, React 18, TypeScript                    |
| **Editor**        | Lexical 0.22 + `@liveblocks/react-lexical`          |
| **Collaboration** | Liveblocks 2.x (rooms, comments, share modal)       |
| **Auth**          | Clerk 6.x                                           |
| **Styling**       | Tailwind CSS 3.x (`tailwind.config.ts`)             |
| **Monitoring**    | Sentry                                              |
| **Tooling**       | ESLint only — no Prettier, Husky, commitlint, or CI |
| **Data**          | Liveblocks rooms only — no application database     |

---

## How to use these plans

1. Pick the next phase (start with **Phase 0**).
2. Work through the checklist in order unless a task is marked parallel-safe.
3. Check off items as they ship on `dev`.
4. Update the plan file when scope changes — these docs are the source of truth.

---

## Out of scope (for now)

- Mobile native apps
- Real-time video/voice
- Full Google Docs feature parity (slides, sheets, etc.)
