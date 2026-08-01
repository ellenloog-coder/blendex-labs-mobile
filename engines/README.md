# Engines (reserved)

Framework-agnostic local analysis engines will live in this directory (ADR-0003, architecture overview).

Rules:

- Engines are plain ES modules (TypeScript allowed when porting existing modules).
- Engines never import UI or framework code.
- Engines are deterministic, unit-testable, and portable to existing Blendex web tools.

No engines are implemented in Phase 0.1.
