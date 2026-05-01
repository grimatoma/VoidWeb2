# Void Yield 2

A browser-based incremental production-chain builder set across the solar system. Anno 1800 + Paragon Pioneers in space, with idle throughput. Player runs a private space corporation, surveys asteroids, builds production chains, ships goods between bodies, grows colonies, transitions through 8 named tiers (T0 Wildcatter → T7 System Corporation), and prestiges into a new run with carryover.

## Status

**Design phase.** No game code yet — the existing `index.html` / `app.js` / `styles.css` are a Stage 0 concept-gallery site that's deployed via GitHub Pages, not the game itself. The game's design is locked enough at T0–T2 fidelity that a vertical slice can begin from the docs.

## Doc map

| Doc | What's in it | When to read |
|-----|--------------|--------------|
| [GAME_DESIGN.md](GAME_DESIGN.md) | Game scope, design pillars, tier ladder (T0–T7 with concrete gates), T0–T2 resource and recipe master, ship catalog, colony pop-tier needs, FTUE script, AFK return spec, failure modes, notification taxonomy, performance budget, prestige loop. | Start here for the game itself. |
| [UI_VIEWS.md](UI_VIEWS.md) | The 8 destinations spec'd at sketch fidelity. Each gets Design Intent (job, use cases, success signals, anti-patterns), sections, content with T0–T2 examples, buttons & navigation enumerating every control and cross-screen jump, states, mobile adaptation. Plus persistent surfaces (status bar, body sheet, alerts). | When designing or building any screen. |
| [UX_FLOWS.md](UX_FLOWS.md) | 10 cross-cutting journeys spanning multiple screens: FTUE, AFK return, alert resolution, tier-up, buy ship, build recipe, survey-and-claim, route creation, Earth Prefab Kit, prestige incorporation. | When the work spans more than one screen or surface. |
| [DECISIONS.md](DECISIONS.md) | The single canonical inventory of pending and resolved design decisions, prioritized P0 (block T0 build) → P3 (strategic / late-game). | Before starting any drill — scan for relevant items. When a decision is made — update Pending → Resolved. |
| [DESIGN_NOTES.md](DESIGN_NOTES.md) | Informal session log capturing rationale, rejected alternatives, and *why* each decision was made. Append-only, newest on top. | When a doc says "X is locked" and you want to know why — the answer is here. |
| [CLAUDE_DESIGN_PROMPTS.md](CLAUDE_DESIGN_PROMPTS.md) | Copy-paste prompts for [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs). One Session Preamble + 8 destination prompts + 5 modal prompts + iteration prompts. | When generating UI mocks. |

## Recommended reading order

1. **README.md** (you are here) — 2 minutes.
2. **GAME_DESIGN.md** Working Summary + Design Pillars + Tier Ladder + Tone — 10 minutes for game framing.
3. **UI_VIEWS.md** Navigation Architecture + Map (Destination 1) — 10 minutes for UX framing.
4. **DECISIONS.md** P0 list — 5 minutes for what's not yet decided.
5. Drill into specific docs as work demands.

## Locked decisions worth surfacing

For new readers — design is not "soft everywhere." These are committed:

- **Reference games:** Anno 1800 + Paragon Pioneers. Not Factorio, not EVE, not pure idle.
- **Scope:** full solar system, 8 tiers, ~15–30h to first prestige.
- **Platforms:** true dual-target — same game, same save, full campaigns possible exclusively on either desktop or mobile.
- **Survey:** setup-only (region pick + probe focus + idle scan), folded into Map as a mode. Not a destination.
- **Voice:** terse-corporate. Sentence-case, numbers leading, no NPC dialogue.
- **Detail surface:** bottom sheet on both desktop and mobile. No right-rail inspector.
- **Cargo classes:** solid + fluid/gas only at v1. No passenger class (population auto-spawns when life support is met).
- **Combined hulls:** fixed mixed slots (e.g., "30 solid + 20 fluid"), not flat penalty.
- **Confirm rule:** confirmation appears only when (irreversible) OR (single-action spend ≥ 25% of current credits).
- **Tier-up ceremony:** plain modal at v1. Cinematic deferred to Stage 2 polish.
- **AFK summary:** $ delta as headline, raw resource counts as detail.

Full context for each in [DESIGN_NOTES.md](DESIGN_NOTES.md) and [DECISIONS.md](DECISIONS.md).

## The concept gallery site

The repo's GitHub Pages site (`index.html`, `app.js`, `styles.css`, `concepts/`) is a **frozen Stage 0 concept gallery**. Its mocks were generated against an earlier spec — they're preserved as palette/density reference but are not current. The site banner makes this explicit.

When new mocks are generated through Claude Design (per [CLAUDE_DESIGN_PROMPTS.md](CLAUDE_DESIGN_PROMPTS.md)), they should land in a fresh `concepts/v2/` directory so the historical Stage 0 set stays untouched.

## Build status

No game code yet. `app.js` is a small Three.js sketch that animates the orbital preview on the gallery site — not the game.

When the T0 vertical slice begins, recommended scope (per [DESIGN_NOTES.md](DESIGN_NOTES.md)):

- Map (Default mode) + Body Detail Sheet
- Ops (full daily-management form)
- Production (one body at a time, no automation rules — those are T3+)
- Fleet (list view only)
- Trade (Earth buy/sell only — skip Prefab Kits and contracts at T0)
- Status bar + alerts + confirm dialog as cross-cutting infrastructure
