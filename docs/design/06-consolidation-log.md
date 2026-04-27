# 06 — Consolidation Log

This log captures duplicated/contradictory concepts found across prior drafts and how they were normalized.

## Normalized Concepts

### 1) Desktop vs Mobile framing
- **Previous duplication:** repeated statements about map-first desktop and task-first mobile in multiple places.
- **Canonical home:** `03-ui-north-star.md` (UX Principles + Navigation).
- **Decision:** keep wording once; other docs reference this behavior, not restate variants.

### 2) Alert handling flow
- **Previous duplication:** multiple versions of warning resolution language.
- **Canonical home:** `03-ui-north-star.md` under the standardized alert ladder.
- **Decision:** one shared flow: Detect -> Diagnose -> Act -> Verify.

### 3) Early implementation scope
- **Previous contradiction risk:** varying definitions of "first slice".
- **Canonical home:** `04-staged-delivery-plan.md` Stage 1 section.
- **Decision:** one agreed Stage 1 slice (Command + Fleet route + ore->metals + colony oxygen fix).

### 4) Unknowns vs commitments
- **Previous duplication:** unresolved questions repeated near firm design statements.
- **Canonical homes:**
  - commitments in `01-04` docs,
  - unresolved questions in `05-open-questions-risks.md`.
- **Decision:** anything not locked belongs in `05`.

## Current Contradiction Watchlist (Intentional Tensions)

These are not errors yet, but need explicit design decisions later:

1. Fuel model representation in early game (explicit resource vs abstract route cost).
2. Survey interaction depth (engaging minigame vs low-friction management flow).
3. First colony location (teaching clarity vs long-term strategic richness).

Track decisions here as the team resolves them.
