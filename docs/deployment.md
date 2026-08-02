# Blendex Labs Mobile — Deployment Guide

**Scope:** static PWA deployment of `app/` (Svelte + Vite + `vite-plugin-pwa`) to GitHub Pages or Cloudflare Pages.

---

## 1. Deployment readiness report (2026-08-02)

### Project status

- Branch `main`, milestone commit `6716175` (feat: complete mobile preview foundation and responsive UI).
- Uncommitted at time of writing: responsive CSS tweaks (`app/src/app.css`, `app/src/lib/styles/tokens.css`), AI Assistant hero layout (`app/src/lib/pages/AssistantPage.svelte`), deployment config (`app/vite.config.ts`, `app/package.json`), and the preview review document.
- Build output: clean (`svelte-check` 0 errors; `npm run build` succeeds; PWA precache 15 entries).
- `app/dist/` and `app/node_modules/` are gitignored — hosting CI builds from source, as it should.
- `app/package-lock.json` is committed, so `npm ci` works in CI.

### Config review results

| Item | Status | Notes |
| --- | --- | --- |
| `vite.config.ts` | ✅ Ready | Added env-driven `base` (`BASE_PATH`), default `/` |
| PWA plugin | ✅ Ready | `registerType: autoUpdate`, `includeAssets` (icons + svg) |
| Base path | ✅ Ready | Root build (`/`) and subpath build (`/blendex-labs-mobile/`) both verified |
| Manifest | ✅ Ready | `start_url: "./"`, `scope: "./"`, relative icons — subpath-safe |
| Service worker | ✅ Ready | Relative precache URLs (scope-relative); `navigateFallback` follows `base` |
| Node version | ✅ Ready | `engines.node >= 20.19.0` (Vite 7 requirement) |

### Verified build outputs

Root build (Cloudflare / custom domain / GitHub user-site):

- `index.html` → `/assets/*.js`, `/assets/*.css`, `/manifest.webmanifest`
- `sw.js` → `navigateFallback "/index.html"`, relative precache entries

Subpath build (GitHub Pages project site, `BASE_PATH=/blendex-labs-mobile/`):

- `index.html` → `/blendex-labs-mobile/assets/*.js`, `/blendex-labs-mobile/manifest.webmanifest`
- `sw.js` → `navigateFallback "/blendex-labs-mobile/index.html"`
- Manifest unchanged (`./` start_url/scope)

### Routing note

The app uses **hash routing** (`#/`, `#/knowledge`, …). Every direct load hits `index.html` at the site root, so **no SPA fallback / redirect rule is needed** on either platform.

---

## 2. Build commands

```bash
# Local preview (root base, also what Cloudflare needs)
cd app
npm ci
npm run build          # output: app/dist

# GitHub Pages project site (subpath base)
cd app
BASE_PATH=/<repository-name>/ npm run build
# example: BASE_PATH=/blendex-labs-mobile/ npm run build
```

> The repository name in the URL must match `BASE_PATH` exactly, including case.
> If you attach a custom domain, rebuild with `BASE_PATH=/` (or leave unset).

---

## 3. GitHub Pages settings

### Recommended: GitHub Actions (no need to commit `dist`)

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: app/package-lock.json
      - name: Install
        run: cd app && npm ci
      - name: Build
        run: cd app && BASE_PATH=/blendex-labs-mobile/ npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: app/dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

3. Replace `/blendex-labs-mobile/` with the actual repository name.
4. Expected URL: `https://<username>.github.io/<repository-name>/`

### Alternative: branch-based deploy

Only if you prefer committing build output: unignore `app/dist`, push to `gh-pages`, then **Settings → Pages → Source: Deploy from a branch → gh-pages → /(root)**. The Actions route above is recommended instead.

---

## 4. Cloudflare Pages settings

1. Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → choose the repository → **Begin setup**.
2. Build configuration:
   - **Framework preset:** None (static)
   - **Root directory:** `/app`
   - **Build command:** `npm ci && npm run build`
   - **Build output directory:** `dist`
3. Environment variables (Production + Preview):
   - `NODE_VERSION` = `22`
   - Do **not** set `BASE_PATH` (Cloudflare serves at the site root).
4. Deploy. Expected URL: `https://<project-name>.pages.dev` (custom domain optional; still root-based).

> Alternative without a root directory: keep root `/`, build command `cd app && npm ci && npm run build`, output directory `app/dist`.

---

## 5. PWA verification checklist (after deploy)

- [ ] Open the live URL on desktop; DevTools → **Application → Manifest** shows the app with correct `start_url`/`scope` and icons.
- [ ] DevTools → **Application → Service Workers**: SW registered and activated.
- [ ] Reload once, then go **Offline** (DevTools Network or Airplane mode) → app still loads with knowledge articles.
- [ ] iPhone Safari: **Share → Add to Home Screen**; app launches standalone.
- [ ] Android Chrome: **⋮ → Install app**; app launches standalone.
- [ ] Check the app at 360/390/430 px widths for layout sanity.

Notes:

- HTTPS is provided automatically by both hosts; PWA install/offline require it.
- `registerType: autoUpdate` means the service worker updates itself on new deploys — no user action needed.
- No analytics, backend, or SaaS features are bundled; the app makes zero runtime network calls.
