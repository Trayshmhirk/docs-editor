# Agent instructions — docs-editor

Instructions for AI agents working in this repository.

## Required reading

Before commits, PRs, or phase work, read:

1. [`.cursor/rules/git-and-pr-conventions.mdc`](.cursor/rules/git-and-pr-conventions.mdc) — commit and PR rules (always applied)
2. [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — contributor guide with examples
3. [`docs/plans/README.md`](docs/plans/README.md) — development roadmap index

## Development phases

| Phase | File                                                                                               | Focus                             |
| ----- | -------------------------------------------------------------------------------------------------- | --------------------------------- |
| 0     | [`docs/plans/phase-0-tooling.md`](docs/plans/phase-0-tooling.md)                                   | Tooling, CI/CD, conventions       |
| 1     | [`docs/plans/phase-1-foundation-collaboration.md`](docs/plans/phase-1-foundation-collaboration.md) | Deps, Tailwind v4, collaboration  |
| 2     | [`docs/plans/phase-2-core-product-features.md`](docs/plans/phase-2-core-product-features.md)       | History, search, export, Postgres |
| 3     | [`docs/plans/phase-3-ai-features.md`](docs/plans/phase-3-ai-features.md)                           | Inline AI editing                 |
| 4     | [`docs/plans/phase-4-auth-strategy.md`](docs/plans/phase-4-auth-strategy.md)                       | Auth strategy                     |

Before starting a phase, read its plan file and work through the checklist.

## Git rules (summary)

- **Conventional Commits** — `type(scope): subject`
- **100 characters max** per line in commit messages
- Describe **functional impact**, not implementation details
- Run `git status` + `git diff` before writing any commit message
- **Commit when asked** — show the message for approval, then commit; do not push unless asked
- **Never use `--trailer` on git commit** — no `Co-authored-by` or other trailers

## PR rules (summary)

- Title: conventional format
- Body: **Summary** + flat **Key Changes** list (no nested bullets)
- Derive content from actual `git log`, not assumptions
- Use `gh pr create` with a HEREDOC body

## Branch strategy

```txt
master  ← production
  └── dev  ← integration branch for development
```

## Project stack

- Next.js 15, React 18, TypeScript
- Lexical + Liveblocks for collaborative editing
- Clerk for authentication
- Tailwind CSS 3.x (v4 migration planned in Phase 1)
- Sentry for monitoring

## Code principles

- Minimize scope — smallest correct diff
- Match existing conventions in surrounding code
- No over-engineering or unnecessary abstractions
- Do not create markdown files unless requested (plans in `docs/plans/` are the exception)
