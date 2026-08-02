# Capability Engine

Framework-agnostic ES module extracted from the existing Blendex Labs CPK tool
(`ellenloog-coder/process-capability-analysis-tool`) per [ADR-0003](../../docs/adr/0003-mobile-technology-stack.md)
and [CPK Integration Plan v1](../../docs/Blendex-Labs-Mobile-CPK-Integration-Plan-v1.md).

## Scope

- Pure functions only: parsing, statistics, capability indices, PPM, normality,
  histogram bins, validation, status, and plain-text interpretation sentences.
- No DOM, no HTML report generation, no chart rendering, no UI, no file upload.
- Formulas, rounding defaults (3 decimals), status logic, and interpretation
  wording are ported unchanged from the tool.

## Test

```bash
cd engines/capability
npm test
```

Expected values in the tests are captured from the original tool's own functions,
so the engine output is verified against the tool output.
