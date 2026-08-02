# Blendex Labs Mobile — Preview Release Review v1

**Date:** 2026-08-02
**Reviewed commit:** `6716175` (feat: complete mobile preview foundation and responsive UI)
**Scope:** Mobile Product Preview (foundation + preview + knowledge + refinement + responsive passes)
**Reviewed against:** `docs/ui/blendex-labs-mobile-ui-spec-v1.md`, `docs/architecture/*`, `docs/adr/*`
**Method:** source-level review of all pages/components/tokens against the spec; computed responsive verification at 360/375/390/430 px; test/build evidence from the reviewed commit (`svelte-check` 0 errors, 45/45 tests, clean PWA build).

---

## Executive summary

The preview is **demo-ready**: all six product areas are implemented, bilingual, responsive at 360–430 px, local-first with zero runtime network calls, and spec-aligned on tokens, typography, colors, and core components. It can be shown as a product experience today.

It is **not yet public-release-ready**. The blockers are non-code: no HTTPS hosting path for installable PWA testing on devices, and no content/legal review (redistribution rights, citations, privacy notice). Code-level gaps are concentrated in a handful of P1/P2 items: non-persistent "Save", preview-labeling consistency, missing resilience states, and iOS install polish.

**Priority summary:** 2 P0 (release blockers) · 4 P1 · 7 P2 · 4 P3

---

## 1. Product Experience Review

### Home

| Dimension | Finding |
| --- | --- |
| Visual consistency | ✅ Hero (greeting 14/brand, two-line 26/800, desc 13), today-status row, resume card with 75% progress, Quick Start, Copilot entry, recent reports, knowledge highlights — all match spec §2.1 and use shared tokens |
| Information density | ✅ Moderate and well grouped. Quick-Start labels truncate cleanly on narrow screens; today-status and report rows are compact |
| Mobile usability | ✅ Every interactive row is ≥44 px tall (report rows 52 px, quick tiles ≈56 px incl. label). Brand header navigates home; Copilot entry is prominent |
| Navigation | ✅ Home is the hub for tools, reports, knowledge, and Copilot entry; hash routing works |

### Workspace

| Dimension | Finding |
| --- | --- |
| Visual consistency | ✅ Resume card, 112×112 horizontal quick rail, All Methods rows (32 px icons, name/desc, status badges), AI guide, Knowledge Hub — order now matches spec §2.6 (Quick Analysis → All Methods → AI Guide) |
| Information density | ✅ Long page, but horizontal rail and 72 px rows keep it scannable; status badges (Available / Beta / Coming Soon) are honest about roadmap |
| Mobile usability | ✅ Rows ≥72 px; horizontal rail scrolls with touch momentum |
| Navigation | ⚠️ Sub-page (tool preview) header is contextual now; bottom nav shows no active tab on the tool preview route (see Issue 10) |

### Knowledge

| Dimension | Finding |
| --- | --- |
| Visual consistency | ✅ Search (52 px/r16), featured (24/800), 36 px horizontal category chips, latest articles, continue reading, related tools; reader has 56 px reading header, EN\|中文 toggle, collapsible TOC, key takeaways |
| Information density | ✅ Real article content (10 articles, 5 bilingual pairs) renders with tables, images, and local formula blocks; reading progress persists in IndexedDB |
| Mobile usability | ✅ Bottom nav hidden in reading mode (spec §1.2/§2.8); tables scroll horizontally; images cap at 100%; smooth scroll-to-heading |
| Navigation | ✅ Category → article → related article/tool flows work; Open Tool navigates to the tool preview |

### AI Assistant

| Dimension | Finding |
| --- | --- |
| Visual consistency | ✅ Hero (38 px sparkle, 24/800 title, 15 px subtitles), 25-r composer, suggestion chips, 62 px conversation items, 30 px topic chips |
| Information density | ✅ Demo thread + recent conversations + topics is busy but scoped; demo replies are labeled "Demo" and a notice states no AI backend is connected |
| Mobile usability | ✅ Composer is thumb-reachable at page bottom; Enter-to-send works |
| Navigation | ⚠️ Suggestion chips disappear once a conversation starts (spec §2.2 keeps them under the input) — see Issue 11 |

### Reports

| Dimension | Finding |
| --- | --- |
| Visual consistency | ✅ Filter chips (32 px/r16), 78 px report cards (36 px tool icon, name/desc/date, StatusBadge), decision-card detail (banner, 4-col metric bar, chart preview, insights/actions, AI CTA, sticky bottom bar with hairline) |
| Information density | ✅ Five realistic sample reports across tools; filters (All/Cpk/SPC/MSA/8D/Custom) work |
| Mobile usability | ✅ Cards ≥78 px; sticky bottom bar respects safe area and bottom nav |
| Navigation | ✅ List → detail with back; contextual header title |
| ⚠️ | "Save" only shows a toast — nothing is persisted (Issue 3); mock data is not visually labeled as sample data (Issue 5) |

### More

| Dimension | Finding |
| --- | --- |
| Visual consistency | ✅ Preferences (language/appearance), Data & Privacy with confirm dialog, soft AI Privacy card with Learn More, Support, About |
| Information density | ✅ 56 px rows; clear data flow has a proper destructive-confirm dialog |
| Mobile usability | ✅ Language switch is instant and persists via IndexedDB |
| Navigation | ✅ Local links only |
| ⚠️ | About shows "1.0.0 (Preview)" while the app/package version is 0.2.0 (Issue 4); the header ☰ menu button is a no-op (Issue 9) |

---

## 2. Responsive Review

### Computed layout at target widths (from the shipped tokens/CSS)

| Viewport | Gutter | Content width | Title | Metric | Quick icon |
| --- | --- | --- | --- | --- | --- |
| 360 px | 21.6 px | 316.8 px | 22.3 px | 16.6 px | 36 px |
| 375 px | 22.5 px | 330 px | 23.3 px | 17.3 px | 37.5 px |
| 390 px | 23.4 px | 343.2 px | 24.2 px | 17.9 px | 39 px |
| 430 px | 24 px | 382 px | 26 px | 18 px | 43 px |

### Checks

| Check | Finding |
| --- | --- |
| Text overflow | ✅ Quick-Start labels, report rows, method descriptions, and header titles truncate with ellipsis; tables and formulas scroll horizontally; article images cap at 100%; no fixed widths below 382 px remain |
| Card spacing | ✅ Fluid gaps `clamp(16px,5vw,24px)` and card padding `clamp(12px,4.2vw,18px)` keep rhythm at all four widths |
| Bottom navigation | ✅ Bar height is `72px + env(safe-area-inset-bottom)` — 72 px chrome preserved, home indicator handled |
| Safe area | ✅ `viewport-fit=cover`; `env(safe-area-inset-top)` on headers, `env(safe-area-inset-bottom)` on nav/toast/bottom bar |
| Scrolling | ✅ `100dvh` shell with `100vh` fallback; `.app-main` scrolls; horizontal rails/chips use touch scrolling; reading mode hides nav |
| Caveat | Verification is computed + build-level (no device emulator available in this environment). A real-device spot check at 375/390/430 is still recommended before release |

---

## 3. UI Specification Compliance

| Area | Status | Notes |
| --- | --- | --- |
| Design tokens (§0.2–0.5) | ✅ Pass | All color tokens incl. tool palette; fluid type/layout tokens keep spec values at 390 px; radii and shadow match |
| Typography (§0.4) | ✅ Pass | Weights 400–800, sizes per spec at 390 px, `tabular-nums` on metrics |
| Colors (§0.2–0.3) | ✅ Pass | Background/surface/ink/secondary/faint/hairline/fill/brand/semantic and 7 tool colors all exact |
| Components | ✅ Pass | AppHeader, BottomNavigation, Button (primary/secondary/AI/danger/icon), Chip variants (filter/category/suggestion), StatusBadge, Card (+soft), Input (+search), Toast, ConfirmDialog, EmptyState |
| Cards | ✅ Pass | 16 px radius, `0 2px 8px rgba(0,0,0,0.04)` shadow, fluid padding |
| Buttons | ✅ Pass | Primary #111827, AI #6366F1, 15 px labels, ≥48 px targets |
| Chips | ✅ Pass | filter 32 px/r16, category 36 px, suggestion 32 px/r16 white, topic 30 px #F3F4F6 |
| Report components | ✅ Pass | MetricSummaryBar (64 px, 4 cols, tone-on-value), DecisionBanner (≥72 px, 32 px icon circle, 18/700 + 14 px), Insight/Action lists (max 3), AI Context Button (56 px, brand, chips), bottom action bar with hairline |
| Minor deviations | ⚠️ | Reader "related articles" heading uses the "Latest Articles" label (Issue 8); Article Information block absent (Issue 12); tool icons are text initials, not icon art (Issue 13) |

---

## 4. Architecture Compliance

| Requirement | Status | Evidence |
| --- | --- | --- |
| Local-first | ✅ Pass | Zero `fetch`/`XMLHttpRequest`/beacon in app source; content bundled at build time; SW precaches 15 entries incl. article images; reading progress in IndexedDB |
| No SaaS | ✅ Pass | No backend, accounts, subscriptions, or remote APIs; manifest/static-only |
| No user system | ✅ Pass | No login/identity/registration anywhere |
| No cloud database | ✅ Pass | Persistence is IndexedDB on-device only |
| UI/business separation | ✅ Pass | Mock/demo data isolated in `src/lib/demo/`; knowledge adapter in `src/lib/knowledge/`; components consume data via props; no engine logic in UI |
| Existing repositories untouched | ✅ Pass | Source knowledge repo is read-only input; no other repo modified; only this repo changed (commits `1945083`, `a25ef9b`, `6716175`) |
| AI boundary (ADR-0002) | ✅ Pass | AI is demo-only, labeled, disabled CTA, no backend; app fully functional without it |
| Engines (ADR-0003) | ✅ Pass | `engines/` reserved; tool pages are preview shells with disabled Analyze + Phase 1 note |

---

## 5. Mobile Product Readiness

### Can this be shown as a product demo?

**Yes.** The preview covers the full product narrative: Home → tool workspace (7 methods with honest statuses) → knowledge (real bilingual articles, offline-capable) → AI assistant (clearly-labeled demo) → reports (sample decision cards) → settings. It is bilingual (EN/中文), responsive at 360–430 px, installable as a PWA at localhost, and runs with zero network dependency once loaded.

Recommended demo flow: Home (hero + resume) → Workspace (tools + statuses) → Knowledge (search + article + EN/中文 toggle + Open Tool) → Reports (filter + decision card) → More (language switch, clear-data safety). Script the "Save"/"Generate Report" buttons as demo actions, not persistent behavior.

### What prevents public preview release?

1. **No HTTPS/public hosting path.** The PWA is only served locally; over LAN HTTP, service workers and install prompts are disabled on iOS/Android (secure-context requirement).
2. **Content and legal review not done.** The bundle redistributes knowledge articles from the source repository, includes a Reuters citation and links to external GitHub Pages tool sites; redistribution rights, citation policy, privacy notice, and terms are unresolved.
3. **Preview labeling is inconsistent.** Reports and tool previews present mock data that can be mistaken for production output; AI and "Save" already have labels, but reports do not.
4. **Resilience UX is incomplete.** Loading/error/offline states exist as components but are not wired into knowledge/reports screens.
5. **iOS install polish missing.** No `apple-touch-icon`; version display (1.0.0 Preview) conflicts with app version 0.2.0.

### Top 5 remaining issues

1. HTTPS hosting + deploy pipeline for installable-device testing (P0-1).
2. Content/legal review: redistribution, citations, privacy notice (P0-2).
3. Non-persistent "Save" + mock-data labeling on Reports (P1).
4. Missing loading/error/offline states on knowledge and reports (P2).
5. iOS install polish and version consistency (P1/P3).

---

## Issue Register

| # | Area | Priority | Finding | Recommendation |
| --- | --- | --- | --- | --- |
| 1 | Release | P0 | No HTTPS host/deploy path; LAN HTTP disables SW + install on devices | Add static hosting (e.g., Cloudflare Pages/Netlify/GitHub Pages or tunnel) with build/deploy config; verify SW + manifest on a real phone |
| 2 | Legal/Content | P0 | Redistribution of imported knowledge + external citations/privacy unvetted | Content-rights pass, privacy notice + terms, citation check (incl. Reuters link), naming/logo ownership |
| 3 | Reports | P1 | "Save" is toast-only while labeled as an action | Persist saved-report state in IndexedDB, or relabel as demo action |
| 4 | More/Versioning | P1 | About "1.0.0 (Preview)" vs package 0.2.0 | Single preview version source (manifest, About, package) |
| 5 | Preview clarity | P1 | Mock reports/data not visually marked as samples | Consistent "Preview data" label on Reports and tool previews |
| 6 | iOS install | P1 | No `apple-touch-icon`; install meta incomplete | Add apple-touch-icon + device meta; verify home-screen install on iPhone |
| 7 | States | P2 | LoadingSkeleton/ErrorState/OfflineNotice exist but are unused | Wire into knowledge/reports (bundle is local, but failures/offline still possible) |
| 8 | Knowledge reader | P2 | Related-articles heading says "Latest Articles" (spec: Related Articles) | Use a dedicated related-articles label |
| 9 | Header | P2 | ☰ menu button is a no-op | Wire to a menu/More, or remove until functional |
| 10 | Navigation | P2 | No active bottom-nav tab on sub-pages | Highlight originating tab on knowledge/tool/report routes |
| 11 | AI Assistant | P2 | Suggestion chips hidden once a conversation starts (spec keeps them) | Keep quick prompts visible above composer |
| 12 | Knowledge detail | P2 | Article Information (Source/Reference/Version) absent | Surface existing metadata (updatedAt, relatedTool) in a collapsed section |
| 13 | Icons | P2 | Tool icons are text initials | Add a real tool icon set (spec §0.3) |
| 14 | Search | P3 | Search results duplicate "Latest Articles" entries | Hide latest section while a query is active, or dedupe results |
| 15 | Responsive | P3 | `--content-width` uses `100vw`, which can overhang on desktop with a scrollbar | Use `100%`-based calc or container query |
| 16 | Cleanup | P3 | ProgressTracker and state components are dead code | Wire in or remove |

---

## Recommended next steps

1. **P0:** Choose a static HTTPS host and add a deploy step (`npm run build` → publish `app/dist`); verify install + offline on a physical iPhone (375/390/430) and Android.
2. **P0:** Complete the content/legal pass (rights, citations, privacy notice) — required before any public URL.
3. **P1:** Persist "Save" locally, add consistent preview-data labels, unify versioning, add `apple-touch-icon`.
4. **P2:** Wire loading/error/offline states; fix reader "Related Articles" wording; address menu button and sub-page nav highlighting.
5. **Release candidate:** Re-run `npm run check`, `npm test`, `npm run build`; device test matrix at 375/390/430; then cut the preview release with a documented "Preview" disclaimer.

---

*This review created no code changes. Working tree and commit history were verified clean after the reviewed milestone commit.*
