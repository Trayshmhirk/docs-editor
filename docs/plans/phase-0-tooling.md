# Phase 0 — Engineering Foundation (Tooling)

**Goal:** Establish code quality, git conventions, and CI/CD so all later phases ship safely on `dev`.

**Depends on:** Nothing — start here.

**Deferred to Phase 1:** Tailwind v4 migration. Phase 0 keeps Tailwind 3.x stable so tooling lands without visual regressions.

---

## 0.1 Code formatting (Prettier)

- [ ] Install `prettier`, `eslint-config-prettier`, `prettier-plugin-tailwindcss`
- [ ] Add `.prettierrc` (or `prettier.config.mjs`) with project defaults
- [ ] Add `.prettierignore` (`.next`, `node_modules`, `package-lock.json`, etc.)
- [ ] Add scripts to `package.json`:
  - `format` — write formatted files
  - `format:check` — CI-safe check only
- [ ] Extend ESLint config to disable rules that conflict with Prettier
- [ ] Run initial format pass on codebase (single dedicated commit: `style: apply prettier formatting`)

### Files to create/modify

```txt
.prettierrc
.prettierignore
package.json
.eslintrc.json
```

---

## 0.2 Git hooks (Husky + lint-staged)

- [ ] Install `husky`, `lint-staged`
- [ ] Run `husky init` and configure hooks
- [ ] **pre-commit:** lint-staged runs Prettier + ESLint on staged files only
- [ ] Add `prepare` script in `package.json` for Husky install on `npm install`
- [ ] Document hook behavior in CONTRIBUTING.md

### lint-staged example scope

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

### Files to create/modify for lint-staged

```txt
.husky/pre-commit
package.json
```

---

## 0.3 Conventional commits (commitlint)

- [ ] Install `@commitlint/cli`, `@commitlint/config-conventional`
- [ ] Add `commitlint.config.js` extending conventional config with 100-char line limits
- [ ] **commit-msg** Husky hook runs `commitlint --edit $1`
- [ ] Document commit types and examples in CONTRIBUTING.md

### commitlint.config.js (target config)

```js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 100],
  },
};
```

### Files to create/modify for commitlint

```txt
commitlint.config.js
.husky/commit-msg
docs/CONTRIBUTING.md
```

---

## 0.4 Tailwind (Phase 0 — stay on v3)

> Tailwind **v4 migration is Phase 1**. Here we only stabilize the existing setup.

- [ ] Re-enable `tailwindcss-animate` plugin in `tailwind.config.ts` (currently commented out)
- [ ] Verify `content` globs cover `app/`, `components/`, and any other TSX dirs
- [ ] Confirm `prettier-plugin-tailwindcss` works with Tailwind 3 class sorting
- [ ] Fix any broken animations after re-enabling the plugin

### Files to modify

```txt
tailwind.config.ts
postcss.config.mjs
```

---

## 0.5 TypeScript strictness (optional but recommended)

- [ ] Add `typecheck` script: `tsc --noEmit`
- [ ] Ensure CI runs typecheck (see 0.6)
- [ ] Fix any blocking type errors surfaced by `tsc`

---

## 0.6 GitHub Actions — CI

Create `.github/workflows/ci.yml`:

- [ ] Trigger on `push` and `pull_request` to `dev` and `master`
- [ ] Job matrix or sequential jobs:
  - **lint** — `npm run lint`
  - **format** — `npm run format:check`
  - **typecheck** — `npm run typecheck`
  - **build** — `npm run build`
- [ ] Cache npm dependencies
- [ ] Provide build-time env vars via GitHub secrets (see 0.8)
- [ ] Add CI status badge to README

### Required secrets for build (placeholders OK for CI if build allows)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
LIVEBLOCKS_SECRET_KEY
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
SENTRY_AUTH_TOKEN (if source map upload in CI)
```

---

## 0.7 GitHub Actions — Security

- [ ] Add `.github/dependabot.yml` for npm and GitHub Actions
- [ ] Add `npm audit` step in CI (start with `--audit-level=high`, warn-only if needed)
- [ ] Optional: CodeQL analysis workflow (`.github/workflows/codeql.yml`)
- [ ] Optional: secret scanning / gitleaks in CI
- [ ] Pin GitHub Actions to commit SHAs where practical

---

## 0.8 GitHub Actions — CD (optional)

Defer full CD until CI is green. When ready:

- [ ] Vercel Git integration (simplest) **or** GitHub Action deploy workflow
- [ ] Preview deployments on PRs
- [ ] Production deploy from `master`

---

## 0.9 Git and PR conventions (docs + agent rules)

Establishes conventions before commitlint hooks enforce them mechanically.

- [x] Add `docs/CONTRIBUTING.md` — commit/PR guide with good/bad examples
- [x] Add `.github/pull_request_template.md` — Summary + Key Changes + Test plan
- [x] Add `.cursor/rules/git-and-pr-conventions.mdc` — always-on agent rules
- [x] Add root `AGENTS.md` — agent entry point linking plans and conventions
- [ ] Enable GitHub branch protection on `dev` and `master` (require PR, require CI)

### Files created

```txt
docs/CONTRIBUTING.md
.github/pull_request_template.md
.cursor/rules/git-and-pr-conventions.mdc
AGENTS.md
```

---

## 0.10 Repo hygiene

- [ ] Add `.env.example` documenting all required environment variables
- [ ] Add `.nvmrc` or `engines.node` in `package.json` (recommend Node 20 LTS)
- [ ] Update root `README.md` (project overview, setup, scripts, link to plans and CONTRIBUTING)
- [ ] Ensure `.cursorignore` is committed (already present locally)

### `.env.example` variables to document

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Liveblocks
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
LIVEBLOCKS_SECRET_KEY=

# Sentry (optional for local dev)
SENTRY_AUTH_TOKEN=
SENTRY_DSN=
```

---

## Deliverables checklist

```txt
.prettierrc
.prettierignore
commitlint.config.js
.husky/pre-commit
.husky/commit-msg
.github/workflows/ci.yml
.github/dependabot.yml
.github/pull_request_template.md
docs/CONTRIBUTING.md
.cursor/rules/git-and-pr-conventions.mdc
AGENTS.md
.env.example
.nvmrc (optional)
```

---

## Acceptance criteria

- [ ] `npm run lint`, `format:check`, `typecheck`, and `build` pass locally
- [ ] Pre-commit hook blocks bad formatting/lint on staged files
- [ ] Commit-msg hook rejects non-conventional commit messages over 100 chars
- [ ] CI runs on PRs to `dev` and passes on a clean checkout
- [ ] Dependabot opens dependency PRs
- [ ] README and CONTRIBUTING explain how to contribute
- [x] PR template, CONTRIBUTING, AGENTS.md, and Cursor rules document conventions
- [ ] GitHub branch protection requires PR + CI on `dev` and `master`

---

## Suggested commit sequence

```txt
docs: add git and pr convention rules for agents and contributors
chore: add prettier and eslint-config-prettier
style: apply prettier formatting
chore: add husky and lint-staged
chore: add commitlint with conventional config
fix: re-enable tailwindcss-animate plugin
ci: add github actions workflow for lint typecheck and build
ci: add dependabot configuration
docs: add env example and update readme with setup and ci badges
```

---

## Next phase

→ [Phase 1 — Foundation & Collaboration](./phase-1-foundation-collaboration.md)
