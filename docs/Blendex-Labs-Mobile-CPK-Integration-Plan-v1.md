# Blendex Labs Mobile — CPK Integration Plan v1

**Date:** 2026-08-02
**Status:** Review / Plan — no engine code created
**References:** `docs/architecture/*`, `docs/adr/*`, `docs/ui/blendex-labs-mobile-ui-spec-v1.md`

---

## 1. Existing CPK Tool Review

### Repository / location

| Item | Value |
| --- | --- |
| Source repo | `ellenloog-coder/process-capability-analysis-tool` (GitHub, private) |
| Local source | `/Users/ellen/Documents/process-capability-analysis-tool` |
| Form | Single-file vanilla JS PWA — all logic inlined in `index.html`; `ai-assistant.js` (Worker integration); `service-worker.js`; `manifest.webmanifest` |
| Docs | `docs/calculation-notes.md`, `docs/interpretation-rules.md`, `docs/methodology.md` |
| Tests | `tests/core-logic.test.js` — **88 tests**, framework-free (`node:assert` + `vm` sandbox with DOM mocks), run with `node tests/core-logic.test.js` |

### Calculation logic (inline in `index.html`)

- Parsing: `parseMeasurementData`, `parseInputData` (single measurements or subgroup formats), `parseSubgroupValueTable` / `parseSubgroupMatrix`
- Statistics: `calculateMean`; `calculateSampleStandardDeviation` (n−1 sample stdev); `calculatePooledWithinStandardDeviation` (subgroups)
- Capability: `calculateCapabilityStats({data, lsl, usl, target, benchmark, item, owner, ignored, subgroups})` →
  `{ n, lsl, usl, bm, avg, within, overall, min, max, cp, cpk, pp, ppk, oos, subgroup, estimatedPpm, normality, histogram }`
- Derived: `calculateEstimatedPpm` (normal approximation), `calculateNormalityAssessment` (Anderson–Darling), `buildHistogramBins`
- Validation: `validateInputs` (≥2 values, LSL/USL/benchmark validity, zero-stdev guard)
- Status: `status(value, benchmark)` → `Meets Requirement` when `value ≥ benchmark`, else `Below Requirement`
- Interpretation: bilingual (EN/中文) relationship sentences for Cp/Cpk, Pp/Ppk, Cpk/Ppk; `indexSentence`, `observed`, `normalityReport`
- Orchestration: `calculate(options)` (DOM-coupled) → `renderMetrics`, `renderHistogram`, `renderDashboardPanels`, `renderReport`

**Key assumption (documented in `calculation-notes.md`):** in single-measurement mode the same sample stdev is used for within and overall → `Cp = Pp`, `Cpk = Ppk`. Subgroup mode uses pooled within stdev. Mobile must preserve this exactly.

### Report generation

- `buildReportHtml(result, language)` — bilingual HTML report (neutral, Minitab-style wording per `interpretation-rules.md`)
- Snapshot model (`createSingleReportSnapshot`) + raw-data appendix toggle
- Export helpers for HTML/PDF artifacts (covered by tests)

### Reusable modules (extraction candidates)

All pure math/interpretation functions above are reusable as-is. The DOM-coupled parts (`render*`, `byId`, analytics, file upload) are **not** reusable and stay in the web app or get rebuilt for mobile.

---

## 2. Integration Approach

```
Existing CPK Tool (process-capability-analysis-tool)
        ↓  extract pure functions
Mobile Capability Engine (engines/capability/*.mjs — framework-agnostic ES modules, ADR-0003)
        ↓
Mobile Adapter (app/src/lib/tools/capability/*.ts)
        ↓
Decision Card Model (UI spec §1.3–1.6, §2.5)
        ↓
Report Model (UI spec §2.3 report cards + report detail)
        ↓
AI Context (non-sensitive summary_metrics + deterministic interpretation → existing AI gateway → Worker)
```

1. **Engine extraction** — port pure functions into `engines/capability/` as dependency-free ES modules (TypeScript allowed per ADR-0003), with parity tests.
2. **Mobile Adapter** — thin, typed wrapper that runs the engine on mobile input and produces the mobile result object (`CapabilityResult`); keeps UI free of math.
3. **Decision Card Model** — map engine output to the spec's Decision Banner, Metric Summary Bar, Insight/Action lists, AI Context chips.
4. **Report Model** — build a mobile report record (reuses the tool's snapshot fields) → Reports list card + Report Detail (decision card pattern, §2.5).
5. **AI Context** — send only `summary_metrics` (Cp/Cpk/Pp/Ppk/n/oos) + the deterministic interpretation text to the existing Worker via the Phase 0.4 gateway; satisfies ADR-0002 (advisory, no raw data) and the Worker's non-sensitive contract.

---

## 3. Engine Extraction Boundary

### Becomes `capability-engine` (in `engines/`, framework-agnostic, no UI/DOM)

- `parseMeasurementData` / subgroup parsing (single-measurement + subgroup inputs)
- `calculateMean`, `calculateSampleStandardDeviation`, `calculatePooledWithinStandardDeviation`
- `calculateCapabilityStats` (core)
- `calculateEstimatedPpm`, `calculateNormalityAssessment`, `buildHistogramBins`
- `validateInputs` (return structured errors; no DOM status)
- `status(value, benchmark)`, relationship sentences, `indexSentence`, `observed`, `normalityReport` (deterministic bilingual text = evidence/insights source)

### Stays in Mobile (UI layer, `app/src/lib/pages/…` + components)

- Data input UI (paste/file), spec fields (LSL/USL/Target/Benchmark), validation UX
- Metric Summary Bar / Decision Banner / Insight & Action lists / histogram chart rendering
- Navigation, i18n, error/empty states, offline behavior
- Report detail screen and Reports list integration

### Report logic reuse

- Reuse the tool's **snapshot field structure** and **deterministic interpretation strings** (port into engine or report model).
- Mobile report = JSON record (same fields as tool snapshot) rendered by mobile components; raw-data appendix can be a collapsible section instead of a file export.
- HTML/PDF export helpers are **not** ported in Phase 1 (mobile export = share sheet / file download later).

### Scope boundary for Phase 1

- Single-measurement capability analysis only (the §2.4/§2.5 flow).
- **Out of scope:** historical multi-group analysis, Excel workbook parsing (mobile accepts paste/CSV), Google Apps Script feedback, analytics.

---

## 4. Data Contract

### Input

```ts
interface CapabilityInput {
  data: number[];                    // measurements (or subgroups later)
  lsl: number;
  usl: number;
  target?: number;                   // optional
  benchmark: number;                 // capability requirement, e.g. 1.33
  itemName?: string;
  owner?: string;
}
```

### Output

```ts
interface CapabilityResult {
  n: number; avg: number; within: number; overall: number;
  min: number; max: number;
  cp: number; cpk: number; pp: number; ppk: number;
  oos: number; estimatedPpm: number;
  status: {
    cp: 'meets' | 'below' | 'na';
    cpk: 'meets' | 'below' | 'na';
    pp: 'meets' | 'below' | 'na';
    ppk: 'meets' | 'below' | 'na';
  };
  evidence: {
    normality: { pValue: number; interpretation: string };
    histogram: HistogramBin[];
    subgroupProvided: boolean;
    sameStdDevNote: string;          // Cp=Pp, Cpk=Ppk explanation
  };
  insights: { severity: 'danger' | 'warning' | 'neutral' | 'success'; text: string }[];  // max 3 (spec §1.5)
  actions: string[];                 // max 3, suggested review actions (spec §1.5)
  errors: string[];                  // validation
}
```

### AI Context (non-sensitive only)

```ts
// Sent to the existing Worker via app/src/lib/ai/gateway.ts
{
  task: 'quality_engineering_chat' | 'interpret_current_results',
  summary_metrics: { Cp, Cpk, Pp, Ppk, n, oos },   // rounded, no raw data
  deterministic_interpretation: string,             // engine-generated neutral wording
  user_question: string
}
```

Raw measurements, part numbers, customer/supplier names are **never** included (ADR-0002 privacy boundary).

---

## 5. Migration Risk

| Risk | Detail | Mitigation |
| --- | --- | --- |
| Calculation parity | Cp/Cpk/Pp/Ppk formulas, n−1 stdev, pooled within stdev, estimatedPpm, Anderson–Darling must produce identical results | Port formulas verbatim; run parity fixtures from `demo-data/` through both tool and engine and compare |
| Rounding differences | Tool formats via `decimals()` (default **3**) and `fmt`/`fmtPValue`/`fmtPpm`; metric bar shows 2-decimal values; `closeEnough` tolerance = max(1e-6, 0.1% of value) | Replicate exact formatting helpers in the engine/adapter; keep `tabular-nums`; add rounding parity tests |
| Single-measurement assumption | Cp = Pp / Cpk = Ppk (same sample stdev) must be preserved and disclosed in the report | Carry `sameStdDevNote` into Decision Card/report; do not "improve" the math |
| Test requirements | Tool has 88 framework-free tests (parsing, stats, subgroup, validation, export) | Port the pure-function tests to the engine test suite; add cross-check tests against tool outputs; keep `npm test` green |
| DOM coupling | Tool `calculate()` mixes math and rendering; `vm` sandbox tests depend on inline script | Extract pure functions first; engine tests run without DOM; UI tests cover the adapter/render only |
| Compatibility | Mobile TS vs tool plain JS; module system differences | Engine as ESM (`.mjs`/TS), dependency-free; adapter typed; no build-time coupling to the web tool |
| AI payload drift | Worker contract expects `summary_metrics` + `deterministic_interpretation`; sending wrong shape yields worker errors | Reuse existing gateway types; add contract tests (payload shape) |
| Scope creep | Historical analysis / Excel parsing / feedback widget | Explicitly excluded from Phase 1; document boundary |

---

## 6. Recommended Implementation Order (not started)

1. Create `engines/capability/` — port pure math + interpretation functions as ESM; copy core tests from the tool.
2. Add parity fixtures + tests (`npm test`).
3. Build `app/src/lib/tools/capability/` adapter + `CapabilityInput/Result` types.
4. Implement CPK input page per UI spec §2.4 → run engine → Decision Card (§2.5) with Metric Bar, Insights, Actions, histogram.
5. Wire Reports: save result as a mobile report record (IndexedDB), show in Reports list + Report Detail.
6. Wire AI Context through the existing gateway (summary metrics + deterministic interpretation only).
7. Verify: `npm run check`, `npm test`, `npm run build`; manual flow on 375/390/430 px.

*This plan creates no code, no engine, and no commit.*
