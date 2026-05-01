# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo has a nested structure: the actual application lives in `void-yield-mlp/`, not at the repo root. **All `npm` commands must run from `void-yield-mlp/`.** The repo root holds only `GAME.md` (canonical design doc) and `.github/workflows/`.

- `void-yield-mlp/` — Vite + React 19 + TypeScript app. Single-page browser game.
- `void-yield-mlp/src/game/` — pure simulation core (state shape, tick, persist, defs, kepler, survey).
- `void-yield-mlp/src/ui/` — React views, plus `ui/maps/` (map renderers) and `ui/graphics/` (asset packs).
- `void-yield-mlp/src/test/` — vitest setup + test helpers (deterministic `Math.random`, scenario seeding).
- `void-yield-mlp/docs/progression.md` — short design slice for the v1 outpost milestone.
- `GAME.md` — single-source-of-truth design doc (Game Design / UI Views / UX Flows). Long; consult before changing tier gates, recipe numbers, voice/strings, or pillars.

## Common commands

All commands run from `void-yield-mlp/`:

```bash
npm install          # first-time setup
npm run dev          # Vite dev server, http://localhost:5173
npm run build        # tsc -b && vite build (CI gates on this)
npm run lint         # eslint .
npm test             # vitest run (single pass, CI uses this)
npm run test:watch   # vitest in watch mode
npm run preview      # serve the production build locally
```

Run a single test file or filter by name:

```bash
npm test -- src/game/sim.production.test.ts
npm test -- -t "adjacency"
```

There is no separate typecheck script; `npm run build` runs `tsc -b` first and is the canonical typecheck. CI runs `npm test` and `npm run build` on every PR (`.github/workflows/pr-preview.yml`); merging to `main` auto-deploys to GitHub Pages (`pages.yml`) with `VITE_BASE_PATH=/VoidWeb2/`.

## Architecture

### Sim/UI split

The codebase is intentionally split between a pure simulation core (`src/game/`) and a React UI shell (`src/ui/`). The sim has zero React imports. The UI never mutates state directly — it calls commands exposed by `useGame`.

### One state, one tick

`GameState` (`src/game/state.ts`) is the entire game world as one **plain JSON-serializable object** — no class instances, no `Map`/`Set`, no functions. This is load-bearing:

- The save format is `JSON.stringify(state)` to localStorage (`src/game/persist.ts`, key `void-yield-mlp:save:v1`).
- AFK catch-up is "run the same `tick()` in 1-second chunks until wall-clock catches up." Anything that can't survive serialization breaks AFK.

`tick(state, dt)` in `src/game/sim.ts` is the only function that advances the simulation. Foreground runs it at 1 Hz from `useGame`. AFK catch-up calls it in 1s chunks (capped at 24 h). Production cycles, life support, route progress, tier gates, surveys, and alerts all flow through this single path. **Don't add a side-channel timer or a "during AFK" branch — extend `tick()` instead.**

### React glue (`useGame`)

`src/game/useGame.ts` owns state in a `useRef` and forces re-renders via a version counter (`setVersion(v => v + 1)`) after every command commit. State is mutated **in place** — do not replace `stateRef.current` except in `newRun`. Commands wrap the pure sim functions, then call `commit()` which bumps the version and persists.

Periodic save runs every 5 s and on `visibilitychange` to `hidden`. The dev shortcut at the bottom of `useGame` exposes `window.__voidYield = { state, commit }` so preview harnesses can seed scenarios; keep it.

### Save migrations

When adding fields to `GameState`, add a backfill in `loadState()` (`src/game/persist.ts`). `saveVersion` is currently `1`; bumping it requires a real migration path. The existing backfills (e.g. `tierUpModalSeen`, `route.travelSecTotal`, `route.dispatchGameTimeSec`, `survey`, `graphicsPack`, body-slot top-up) document the pattern: detect missing field, fill from `createInitialState()` or a sensible derived value, never throw on old saves.

### Tier model

Tiers are integers on `GameState.tier` (currently `0 | 1`). Buildings, ships, and resources carry a `tier` field; commands like `placeBuilding` reject when `def.tier > state.tier`. The T0→T1 gate is the **Lunar Foothold** milestone — sell 200 Refined Metal lifetime + hold 50 Hydrogen Fuel. Tier-up flow is two-stage (`tierUpReady` → `tierUpClaimed[1]`) with a separate `tierUpModalSeen[1]` so a reload after dismiss doesn't reshow the modal.

### Eight-rail navigation

`App.tsx` switches between eight destinations (`map`, `ops`, `production`, `fleet`, `survey`, `colonies`, `trade`, `milestones`) by string id. `Rail.tsx` declares the list and locks `colonies` until T1. Adding a destination = update the `DestId` union, the `Rail` items array, and the switch in `App.tsx`.

### Map renderers (registry pattern)

`src/ui/maps/registry.tsx` declares `MAP_REGISTRY: MapEntry[]`. Each entry is `{ id, label, blurb, Component, spatial? }`. Adding a new map renderer = one file in `ui/maps/` implementing `MapRendererProps`, plus one entry in the registry — that's the only seam `MapView` depends on. Spatial maps honor the `frame` prop (`system`/`earth`/`moon`); abstract maps ignore it.

### Kepler model

`src/game/kepler.ts` is renderer-agnostic — Newton iteration on Kepler's equation, returning positions/ellipse points in canvas units. The simulation uses `solveIntercept` for lead-the-target trajectories; visualizations read `keplerPosition`/`keplerEllipsePoints`. Travel time is the burn-coast-burn profile in `progression.md`. NEA-04 is parked at Earth-Moon L4 (same orbit as the Moon, 60° ahead) so it co-orbits — this is intentional, not a bug.

### Asset packs

`src/ui/graphics/packs.tsx` ships two visual packs (`noir`, `atlas`) as inline SVG strings keyed by id. No PNGs/fonts/spritesheets. Active pack is `state.graphicsPack`. New pack = extend the `PackId` union and add entries to each `*_PACK` map.

## Conventions to preserve

- **State must stay JSON-clean.** No class instances, no `Map`/`Set`, no functions. If you reach for one, you're probably about to break AFK.
- **Mutate in place inside the sim.** The whole architecture (ref + version counter, AFK chunking, saves) assumes one stable `GameState` object. Don't return a new state from sim functions.
- **`verbatimModuleSyntax` is on.** Type-only imports must use `import type`. `noUnusedLocals` and `noUnusedParameters` are enabled — prefix unused params with `_` or remove them.
- **IDs are random strings, but tests need determinism.** `src/test/setup.ts` patches `Math.random()` for the test environment with a seeded LCG. Don't use `crypto.randomUUID()` or `Date.now()` for ids; stick to `Math.random().toString(36).slice(2, 9)` so tests stay stable.
- **Earth is the market, not a body to build on.** It has infinite storage and fixed buy/sell prices. Don't add buildings or pop to `bodies.earth`.
- **Voice rules from `GAME.md` apply to user-visible strings:** terse-corporate, sentence-case, numbers leading. Alert/log/milestone copy should read like a corporate dashboard notice. No NPCs, no dialogue.
- **`GAME.md` is the source of truth for tier gates, recipe numbers, and design intent.** Game-balance changes belong there first; code follows.
- **GitHub Pages base path:** `vite.config.ts` reads `VITE_BASE_PATH`. Local dev stays at `/`; CI sets `/VoidWeb2/` for the live deploy and `./` for PR-preview artifacts. Don't hardcode `/VoidWeb2/` anywhere.

## Testing notes

- Vitest with `jsdom` environment, globals **off** — import `describe`/`it`/`expect` explicitly. Tests live alongside source as `*.test.ts(x)` under `src/`.
- `src/test/helpers.ts` exposes `fresh()` (clean `GameState`), `forcePlace()` (top up credits and place a building, bypassing the cost check), and `runFor(state, sec, tick)` (advance the sim in 1 s steps).
- Sim tests should drive scenarios through `tick()` rather than poking individual functions, so AFK and foreground stay aligned.
