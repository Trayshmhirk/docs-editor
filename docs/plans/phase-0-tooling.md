# Phase 0 — Engineering Foundation (Tooling)

**Goal:** Establish code quality, git conventions, and CI/CD so all later phases ship safely on `dev`.

**Depends on:** Nothing — start here.

**Deferred to Phase 1:** Tailwind v4 migration. Phase 0 keeps Tailwind 3.x stable so tooling lands without visual regressions.

---

## 0.1 Code formatting (Prettier) & Workspace Config

- [x] Install `prettier`, `eslint-config-prettier`, `prettier-plugin-tailwindcss`
- [x] Add `.prettierrc` (or `prettier.config.mjs`) with project defaults
- [x] Add `.prettierignore` (`.next`, `node_modules`, `package-lock.json`, etc.)
- [x] Add `.vscode/extensions.json` with recommended extensions (ESLint, Prettier, Tailwind CSS, CSpell)
- [x] Add `.vscode/settings.json` with workspace defaults (format on save, ESLint fix on save)
- [x] Add scripts to `package.json`:
  - `format` — write formatted files
  - `format:check` — CI-safe check only
- [x] Extend ESLint config to disable rules that conflict with Prettier
- [x] Run initial format pass on codebase (single dedicated commit: `style: apply prettier formatting`)

### Files to create/modify

```txt
.prettierrc
.prettierignore
.vscode/extensions.json
.vscode/settings.json
package.json
.eslintrc.json
```

---

## 0.2 Git hooks (Husky + lint-staged)

- [x] Install `husky`, `lint-staged`
- [x] Run `husky init` and configure hooks
- [x] **pre-commit:** lint-staged runs Prettier + ESLint on staged files only
- [x] Add `prepare` script in `package.json` for Husky install on `npm install`
- [x] Document hook behavior in CONTRIBUTING.md

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

- [x] Install `@commitlint/cli`, `@commitlint/config-conventional`
- [x] Add `commitlint.config.js` extending conventional config with 100-char line limits
- [x] **commit-msg** Husky hook runs `commitlint --edit $1`
- [x] Document commit types and examples in CONTRIBUTING.md

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

- [x] Re-enable `tailwindcss-animate` plugin in `tailwind.config.ts` (currently commented out)
- [x] Verify `content` globs cover `app/`, `components/`, and any other TSX dirs
- [x] Confirm `prettier-plugin-tailwindcss` works with Tailwind 3 class sorting
- [x] Fix any broken animations after re-enabling the plugin

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

## 0.6 GitHub Actions — CI & Quality Checks

Create `.github/workflows/ci.yml` and quality workflows:

- [ ] Add `.github/workflows/ci.yml` triggered on `push` and `pull_request` to `dev` and `master`:
  - **lint** — `npm run lint`
  - **format** — `npm run format:check`
  - **typecheck** — `npm run typecheck`
  - **build** — `npm run build`
- [ ] Cache npm dependencies in CI
- [ ] Add `.github/workflows/pr-title.yml` (`amannn/action-semantic-pull-request`):
  - Validates PR title matches Conventional Commits (`type(scope): subject`)
  - Ensures line length limit under 100 characters
- [ ] Add `.github/workflows/branch-guard.yml`:
  - Enforces that pull requests targeting `master` must originate from the `dev` branch
- [ ] Provide build-time env vars via GitHub secrets (see env list below and §0.10 `.env.example`)
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

## 0.7 GitHub Actions — Security & Leak Detection

- [ ] Add `.github/dependabot.yml` for npm and GitHub Actions ecosystem
- [ ] Add `.github/workflows/gitleaks.yml` (or secret scanning step in CI) to prevent leaked API keys
- [ ] Add `npm audit` step in CI (start with `--audit-level=high`, warn-only if needed)
- [ ] Optional: CodeQL analysis workflow (`.github/workflows/codeql.yml`)
- [ ] Pin GitHub Actions to commit SHAs or major versions where practical

---

## 0.8 Continuous Deployment (CD) & Automated Releases

**Goal:** Complete the CI/CD pipeline — CI verifies code; CD deploys after verification; releases and changelogs are automated on `master`.

**Depends on:** §0.6 CI green; Vercel project linked to the GitHub repo.

### CI vs CD vs Releases

|                    | **CI (§0.6)**                         | **CD (§0.8)**                               | **Releases (§0.8)**                         |
| ------------------ | ------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| **When**           | Every push / PR                       | After CI passes (or in parallel via Vercel) | On merge to `master`                        |
| **Does**           | Lint, format, typecheck, build, audit | Deploy the app to a hosted environment      | Bump semver, write CHANGELOG, tag Git / PR  |
| **Goal**           | Catch bugs before merge               | Ship working code to preview or production  | Milestone tracking, audit trail, changelogs |
| **Where to watch** | GitHub Actions tab → job logs         | Vercel dashboard, PR deploy comments        | GitHub Releases tab & CHANGELOG.md          |

### Pipeline overview

| Trigger          | CI (GitHub Actions)                   | CD (Vercel)                     | Releases (Release Please)         |
| ---------------- | ------------------------------------- | ------------------------------- | --------------------------------- |
| PR → `dev`       | lint, format, typecheck, build, audit | Preview deployment (unique URL) | —                                 |
| Push → `dev`     | Same                                  | Optional staging URL            | —                                 |
| Merge → `master` | Same (required check before merge)    | Production deployment           | Creates/updates Release PR & tags |

```txt
Push / PR
    ↓
CI (GitHub Actions: lint, format, typecheck, build, gitleaks, audit)
    ↓ (pass)
CD (Vercel: preview URL on PR, production on master merge)
    ↓ (on master merge)
Releases (Release Please: bump version, update CHANGELOG.md, create GitHub Release)
```

### Automated Releases setup (Release Please)

- [ ] Add `.github/workflows/release.yml` (`googleapis/release-please-action`)
- [ ] Configure `release-please-config.json` and `.release-please-manifest.json` for Node.js / Next.js
- [ ] Automated release workflow:
  1. On merge to `master`, Release Please creates/updates a release candidate PR
  2. Merging the release PR updates `CHANGELOG.md`, bumps `package.json`, and cuts a GitHub Release tag (e.g. `v0.1.0`)

### Recommended approach: Vercel Git integration

Best for learning and for Next.js — Vercel handles builds and deploys on git events.

- [ ] Create Vercel project linked to `Trayshmhirk/docs-editor`
- [ ] Set **Production Branch** to `master` in Vercel project settings
- [ ] Enable **Preview Deployments** for pull requests (all branches or PRs only)
- [ ] Add environment variables in Vercel (**Production** + **Preview** scopes):
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`
  - `LIVEBLOCKS_SECRET_KEY`
  - `SENTRY_AUTH_TOKEN` / `SENTRY_DSN` (optional for preview)
- [ ] Add Clerk allowed origins for Vercel preview and production URLs
- [ ] Verify Liveblocks auth works on deployed preview URLs
- [ ] Add deploy status to branch protection on `master` (optional)
- [ ] Document preview/prod URLs and env setup in README

### Optional: GitHub Actions deploy workflow

Use only if not relying on Vercel Git integration, or for explicit CD control:

- [ ] Add `.github/workflows/deploy.yml`
- [ ] Trigger on push to `master` after CI workflow succeeds (`workflow_run` or job dependency)
- [ ] Deploy via Vercel CLI: `vercel deploy --prod` with `VERCEL_TOKEN` GitHub secret
- [ ] Store `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as GitHub secrets

### Environment flow

```txt
Local (.env.local)
    ↓
Preview (Vercel env: Preview)      ← every PR
    ↓
Production (Vercel env: Production) ← master only
```

Use separate Clerk/Liveblocks keys per environment where providers require it.

### What to watch when things fail

| Layer                   | Symptom                | Where to look                                    |
| ----------------------- | ---------------------- | ------------------------------------------------ |
| Pre-commit / commitlint | Commit blocked locally | Terminal output from Husky                       |
| PR title check          | PR title check red     | GitHub Actions → Semantic PR job log             |
| CI lint / build         | Red check on PR        | GitHub Actions → failed job logs                 |
| Gitleaks                | Secret leak flagged    | GitHub Actions → Gitleaks log                    |
| `npm audit`             | Security step fails    | CI log — package name and severity               |
| Preview deploy          | No URL on PR           | Vercel dashboard → Deployments                   |
| Preview app broken      | 500 or auth fails      | Vercel function logs; Clerk/Liveblocks dashboard |
| Production deploy       | Prod not updated       | Vercel → Promote previous deployment to rollback |

### Learning notes

- **Preview deploy:** every PR gets a unique URL — test sign-in, editing, and share before merge
- **Production deploy:** automatic on merge to `master` (or manual promote in Vercel)
- **Automated releases:** Conventional commits on `master` trigger automatic changelog and semver tags
- **Failed CI should block merge** via branch protection; do not merge broken code to `dev`/`master`
- **Rollback:** Vercel → Deployments → select previous deployment → Promote to Production

### Files to create (Releases & CD)

```txt
.github/workflows/release.yml
release-please-config.json
.release-please-manifest.json
.github/workflows/deploy.yml   ← only if not using Vercel Git integration
```

### CD & Release acceptance criteria

- [ ] Opening a PR produces a Vercel preview URL within ~2–5 minutes
- [ ] Preview URL loads the app, Clerk sign-in works, and Liveblocks connects
- [ ] Merging to `master` updates production automatically
- [ ] Release PR is created on `master` and tags GitHub releases upon merge
- [ ] Failed CI prevents merging broken code (branch protection)
- [ ] README documents how preview, production, and releases work

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

## 0.10 Repo hygiene & Issue Templates

- [ ] Add `.github/ISSUE_TEMPLATE/bug_report.yml` structured issue form
- [ ] Add `.github/ISSUE_TEMPLATE/feature_request.yml` structured feature proposal form
- [ ] Add `.github/ISSUE_TEMPLATE/config.yml` (links to discussions / security guidelines)
- [ ] Add `.env.example` documenting all required environment variables
- [ ] Add `.nvmrc` or `engines.node` in `package.json` (recommend Node 20 LTS)
- [ ] Update root `README.md` (project overview, setup, scripts, link to plans, badges, and CONTRIBUTING)
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
.vscode/extensions.json
.vscode/settings.json
commitlint.config.js
.husky/pre-commit
.husky/commit-msg
.github/workflows/ci.yml
.github/workflows/pr-title.yml
.github/workflows/branch-guard.yml
.github/workflows/gitleaks.yml
.github/workflows/release.yml
release-please-config.json
.release-please-manifest.json
.github/workflows/deploy.yml       (optional — Vercel CLI CD)
.github/dependabot.yml
.github/pull_request_template.md
.github/ISSUE_TEMPLATE/bug_report.yml
.github/ISSUE_TEMPLATE/feature_request.yml
.github/ISSUE_TEMPLATE/config.yml
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
- [ ] PR title workflow enforces conventional PR titles under 100 chars
- [ ] Branch guard workflow blocks PRs to `master` originating from non-`dev` branches
- [ ] CI runs on PRs to `dev` and passes on a clean checkout
- [ ] Gitleaks scans for exposed credentials on every PR
- [ ] Dependabot opens dependency PRs
- [ ] Preview deployments work on PRs via Vercel (see §0.8)
- [ ] Production deploys from `master` via Vercel
- [ ] Release Please generates changelog and tags releases upon merge to `master`
- [ ] VS Code / Cursor recommended extensions and format-on-save configured
- [ ] Structured issue templates available for bug reports and feature requests
- [ ] README and CONTRIBUTING explain how to contribute and where to watch CI/CD logs
- [x] PR template, CONTRIBUTING, AGENTS.md, and Cursor rules document conventions
- [ ] GitHub branch protection requires PR + CI on `dev` and `master`

---

## Suggested commit sequence

```txt
docs: add git and pr convention rules for agents and contributors
chore: add prettier eslint-config-prettier and vscode workspace config
style: apply prettier formatting
chore: add husky and lint-staged
chore: add commitlint with conventional config
fix: re-enable tailwindcss-animate plugin
ci: add github actions workflow for lint typecheck build and pr titles
ci: add gitleaks secret scanning and dependabot configuration
ci: add release please workflow for automated changelog and releases
ci: connect vercel preview and production deployments
docs: add issue templates env example and update readme with badges
```

---

## Next phase

→ [Phase 1 — Foundation & Collaboration](./phase-1-foundation-collaboration.md)
