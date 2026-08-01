# Blendex Labs Mobile — App (Phase 0.2)

Svelte + Vite PWA foundation per [ADR-0003](../docs/adr/0003-mobile-technology-stack.md). Local-first: the app is a static, installable PWA with no backend, no accounts, and no cloud database.

## Structure

| Path | Content |
| --- | --- |
| `src/lib/styles/` | Design tokens and global styles (from UI spec v1) |
| `src/lib/components/` | Global component skeletons (UI only) |
| `src/lib/pages/` | Product preview pages (Home, Workspace, Reports, Assistant, More) |
| `src/lib/pages/knowledge/` | Knowledge hub, category list, and article reader |
| `src/lib/router/` | Minimal hash router |
| `src/lib/i18n/` | English / 中文 i18n foundation |
| `src/lib/storage/` | IndexedDB storage foundation |
| `src/lib/knowledge/` | Content adapter, markdown renderer, local search, reading progress |
| `src/content/knowledge.generated.json` | Bundled offline knowledge index (generated) |
| `scripts/import-knowledge.mjs` | Build-time adapter that imports the existing knowledge repository |
| `src/lib/demo/` | Product-preview mock data (sample reports, tool statuses, demo conversations) |

## Product preview (Phase 0.2)

The preview implements the complete mobile product experience per the UI spec: Home, Workspace (all 7 quality tools with Available / Beta / Coming Soon statuses), Knowledge, AI Assistant (local demo conversation only — no backend), Reports (sample report cards plus a decision-card detail view), and More. All sample content is local mock data; no engines, AI backend, user system, or cloud services are involved.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — static PWA build (service worker + manifest)
- `npm run preview` — preview the production build
- `npm run check` — svelte-check / TypeScript
- `npm test` — unit tests (i18n, router)
- `npm run import:knowledge` — regenerate the offline knowledge index from the source repository (read-only import)

## Boundaries

- Quality engineering engines are **not** implemented here; they will live in `../engines` as framework-agnostic ES modules (ADR-0003).
- AI is **not** integrated (ADR-0002). The assistant tab is a disabled placeholder.
- UI components never contain engine/business logic; they receive data via props.
- Knowledge content is bundled at build time; no CMS, backend, or runtime network is involved.
