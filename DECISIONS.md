# Void Yield 2 Pending Decisions

The single inventory of decisions still needed. Aggregated from all four docs (GAME_DESIGN, UI_VIEWS, UX_FLOWS, DESIGN_NOTES) and prioritized by when we need an answer.

This file is **living** — when a decision is made, move it from "Pending" to "Resolved" with a one-line resolution and a link to the doc where it's now spec'd. Newest decisions on top of Resolved.

## Priority bands

- **P0 — Required before T0 build can start.** Without an answer, build is blocked or will need rework.
- **P1 — Required before T1 unlock.** Affects T1+ content but T0 can be built without.
- **P2 — Required by T3+ or for polish.** Ample time; surface for early prototyping signal.
- **P3 — Strategic / late-game.** Won't affect early builds. Capture intent, defer detail.

---

## Pending (P0 — block T0 build)

| # | Decision | Source | Notes |
|---|----------|--------|-------|
| 1 | **Build time per recipe** — instant placement (Anno-style) vs. wall-time construction (Factorio-style)? Currently wall-time placeholder. | UX_FLOWS Build Recipe; GAME_DESIGN Open Questions | Decision affects whether the Build Drawer needs a queue UI and whether Ops needs a "build in progress" alert type. |
| 2 | **Build footprint** — finite slots per body (forces hard layout choices) vs. unlimited (Paragon-style)? | UX_FLOWS Build Recipe | Affects Production chain view scaling and Body Sheet's "Buildings" tab content. Placeholder cap suggested at 8–16 buildings/body. |
| 3 | **FTUE first sale** — Refined Metal (current) vs. raw Ore at t=6:30? | UX_FLOWS FTUE; GAME_DESIGN FTUE | Refined teaches the chain pattern early; raw is a faster first feedback loop. Affects FTUE script line and the t=3:00 Smelter introduction. |
| 4 | **Earth Prefab Kit mechanic shape** — how does buying a one-time prefab (first habitat, first Lunar Mine) work? Cost curve, quantity-per-tier, generalized vs. hand-authored. | GAME_DESIGN Open Questions; UX_FLOWS Earth Prefab Kit | Lean v1: 1-of-1 hand-authored per kit-per-tier for the *first* of each type; unlimited follow-ups at premium credit cost. |
| 6 | **Sources & Sinks Popover scope** — does tapping a status-bar resource open a popover with per-body breakdown? Spec'd in UI_VIEWS Persistent Surfaces but unconfirmed if v1. | UI_VIEWS Top Status Bar | Lean: yes, since per-body warehouse model makes this trivial to compute and deeply useful. |

## Pending (P1 — block T1+ build, or visible soon after T0)

| # | Decision | Source | Notes |
|---|----------|--------|-------|
| 7 | **Mobile bottom-nav at T1** — promote Colonies into the bottom tab bar (displacing Fleet or Production), or keep Colonies under "More" with strong alert badging? | UI_VIEWS Navigation Architecture; DESIGN_NOTES | Default: keep under More with badging. Revisit after T1 playtest. |
| 8 | **Pop-tier settle-in window** — how long must continuous needs be met to advance? Placeholder: 1 hour real time. | GAME_DESIGN Open Questions | Affects both colony pacing and "did this work?" feedback timing. |
| 9 | **Multi-select entry on desktop Fleet** — long-press on mobile is fine; what's the desktop equivalent? Lean: shift-click row or checkbox-column toggle. | DESIGN_NOTES (Buttons & Navigation pass) | Touches multiple Fleet flows. |
| 14 | **Tier-up dismiss target** — return to Map (current spec) vs. return to where the player tapped Claim? | DESIGN_NOTES (Buttons & Navigation pass) | Map gives a "look at your new region" payoff; "where you were" is less disorienting. |
| 15 | **Body Sheet `Pin` toggle** — does pin persist across navigation back-stacks or just within the current screen? | DESIGN_NOTES (Buttons & Navigation pass) | Affects multi-screen cross-referencing patterns. |

## Pending (P2 — by T3+ or polish)

| # | Decision | Source | Notes |
|---|----------|--------|-------|
| 16 | **Carbon Mesh single-source bottleneck** — Carbonaceous Ore feeds both Textiles and Furnishings; is this a problem? | GAME_DESIGN Open Questions | Validate in playtest. May need second source. |
| 17 | **Aluminum demand scaling** — input to Construction Materials, Glass Furnace, AND Furnishings Workshop. May need volume scaling on Lunar Surface Mines. | GAME_DESIGN Open Questions | Validate in playtest. |
| 18 | **Re-scan cost in Survey** — free time (default) vs. credits per re-scan vs. requires probe consumable? | UX_FLOWS Survey-and-Claim | Default acceptable for v1. |
| 19 | **Claim limit** — unlimited at v1 (default) vs. tier-gated cap? | UX_FLOWS Survey-and-Claim | Unlimited for v1; revisit if claims feel meaningless. |
| 20 | **Ship delivery time** — instant (v1 default) vs. wall-time delivery? | UX_FLOWS Buy Ship | Lean: instant for v1, wall-time at higher tiers as economic friction. |
| 21 | **Repeat-route UI shape** — segmented 3-button (`once / 3× / continuous`) vs. number input. | UX_FLOWS Route Creation | 3-button is faster, less expressive. |
| 22 | **Window-based depart-now-vs-wait** — v1 feature (player chooses) vs. T3+ automation only. | UX_FLOWS Route Creation | v1 shows the indicator; doesn't enforce. |
| 23 | **Trade order timing** — instant fixed-price (v1 default) vs. delivery-time imports? | UI_VIEWS Trade Open Question | Instant simpler; delivery introduces logistics back-pressure. |
| 24 | **Research gating model** — time-gated (research takes wall time) vs. resource-gated (consumes resources) vs. both? | UI_VIEWS Research Open Question | Affects Active Research Queue controls. |
| 25 | **Heat map mode on Map** — justified before T3+ or defer? | UI_VIEWS Open Questions | Currently spec'd but might be dead weight at T0–T2. |
| 26 | **Persistent bottom strip on desktop** — Map+Ops only or all destinations? | UI_VIEWS Open Questions | Density vs. consistency tradeoff. |
| 27 | **Notes per body** — player text annotations on Body Sheet a v1 feature? | UI_VIEWS Open Questions | Lean: defer to v2. |
| 28 | **Build Drawer category filters** — 5 categories (current spec) vs. 4 broader? | DESIGN_NOTES (Buttons & Navigation pass) | Tune in Stage 2 prototype. |
| 29 | **Settings → Saves cloud-sync UI** — auto-only with status indicator vs. explicit sync button? | DESIGN_NOTES | Auto-only is simpler; explicit gives control. |
| 30 | **Active Research Queue Cancel behavior** — refund what? Tied to research-gating model decision (#24). | DESIGN_NOTES | Resolve with #24. |
| 31 | **Greenhouse vs. Hydroponics water consumption** — current placeholder makes water demand 16× pop drink rate. May need rebalancing. | DESIGN_NOTES (recipe validation) | Tune in Stage 3 playtest. |

## Pending (P3 — strategic / late-game)

| # | Decision | Source | Notes |
|---|----------|--------|-------|
| 32 | **Prestige carryover ratios** — % research, % recipe knowledge, starting kit options. | GAME_DESIGN Open Questions; UX_FLOWS Prestige | Modest multipliers (1.1×–2× per axis) is the current frame. |
| 33 | **Charter Shares formula** — peak throughput × colony tier sum × unlocked recipes (placeholder). | GAME_DESIGN Open Questions | Tune late. |
| 34 | **Prestige solar-system reshuffle** — does prestige reshuffle bodies or preserve them? | GAME_DESIGN Open Questions; UI_VIEWS Milestones | Tradeoff: novelty vs. mastery transfer. |
| 35 | **Sandbox-mode entry** — free from start vs. unlocked after first prestige? | GAME_DESIGN Open Questions | Lean: free from start with a "scoreboard mode" toggle for prestige earners. |
| 36 | **Combined-vs-specialized hull tuning** — confirm fixed mixed slots feel right vs. flat penalty alternative. | DESIGN_NOTES (cargo class confirmation) | Locked structurally; numeric tuning pending playtest. |
| 37 | **NASA-industrial palette values** — exact color tokens. | GAME_DESIGN Open Questions; UI_VIEWS Style Direction | Stage 2 territory. |
| 38 | **First survey UI fidelity** — region picker shape, focus model. | GAME_DESIGN Open Questions | Stage 2 territory. |
| 39 | **T3+ resource and recipe content** — deliberately deferred. | GAME_DESIGN Open Questions | Drill after T0–T2 playtest. |
| 40 | **Ship catalog T3+** — long-range drives, exotic propulsion, specialist hulls (probe ships, builders). | DESIGN_NOTES | Drill alongside T3+ content. |
| 41 | **Building catalog (T0–T2 construction costs and footprint)** — mostly spec'd via recipe table; explicit footprint and prereq costs need a pass. | GAME_DESIGN Open Questions | Resolves alongside #2 (build footprint decision). |

---

## Resolved

(Newest on top. Each entry: decision, resolution, source doc.)

| # | Decision | Resolution | Resolved In |
|---|----------|------------|-------------|
| R21 | AFK summary delta units | Hybrid: $ delta as headline (`+$2,304 net · 4h 12m away`), raw resource counts in detail rows. Keeps the satisfaction beat AND honest storage signal. | UX_FLOWS AFK Return |
| R20 | Confirm-vs-commit threshold | Confirm appears only when action is **irreversible** OR **single-action spend ≥ 25% of current credits**. Otherwise single-tap commit. Scales naturally with player wealth — no magic dollar threshold to retune. | UI_VIEWS Global UI Rules |
| R19 | Tier-up ceremony shape | Plain modal at v1 (tier name, flavor text, unlock list, single `Begin` CTA). No cinematic pause/zoom. Cinematic backdrop is a Stage 2 polish candidate. | UX_FLOWS Tier-Up |
| R18 | Notification / system-text voice | **Terse-corporate** — sentence-case, numbers leading, verbs minimal, no NPC dialogue. Examples: `First Habitat — O2 at 18%, importing recommended` / `T1 ready: Lunar Foothold available`. Applies globally across alerts, AFK summaries, tier-up flavor, build-complete notifications. | UI_VIEWS Global UI Rules |
| R8 | Cargo class strictness from T0 | Strict at cargo level; combined hulls have fixed mixed slots. | GAME_DESIGN Resources & Recipes; DESIGN_NOTES |
| R7 | Combined hull mechanics | Fixed mixed slots (e.g., 30 solid + 20 fluid), not flat penalty. | GAME_DESIGN Ship Catalog |
| R6 | Passenger cargo class | Removed at v1 (auto-spawn pop = no cargo to put in passenger holds). Reserve for future specialist/colonist mechanic. | DESIGN_NOTES |
| R5 | Hull count T0–T2 | 6 hulls: 2 specialized solid, 2 specialized fluid, 2 combined. | GAME_DESIGN Ship Catalog |
| R4 | Hull stats v1 | Fixed-spec (no modular/hardpoint upgrades at v1). | GAME_DESIGN Ship Catalog |
| R3 | Pop arrival mechanic | Auto-spawn when life support met. No ship-as-cargo for population. | GAME_DESIGN Colony Pop-Tier Needs |
| R2 | Fuel model v1 | One resource (Hydrogen Fuel) through T2; multi-fuel deferred to T4+. | GAME_DESIGN Recipes |
| R1 | Colony goods granularity | Unpacked Anno-style (Textiles, Furnishings, Spirits as distinct items). | GAME_DESIGN Resources |
| R0 | First habitat location | Lunar orbit station. | GAME_DESIGN Tier Ladder |
| R-1 | Recipe shape | Per-cycle batches (Anno-style). | GAME_DESIGN Resources & Recipes |
| R-2 | Storage model | Per-body warehouse. | GAME_DESIGN Resources & Recipes |
| R-3 | Resource + recipe drill scope | T0–T2 only at v1; T3+ deferred. | GAME_DESIGN Resources & Recipes |
| R-4 | Survey mechanic | Setup-only, not active minigame. | GAME_DESIGN, UX_FLOWS Survey-and-Claim |
| R-5 | Tier ladder shape | 8 named tiers with concrete content gates. | GAME_DESIGN Tier Ladder |
| R-6 | Reference games | Anno 1800 + Paragon Pioneers; not Factorio, not EVE, not pure idle. | GAME_DESIGN Working Summary |
| R-7 | Game scope | Full solar system, 8 tiers, ~15-30h to first prestige. | GAME_DESIGN Scope |
| R-8 | Replay model | Prestige loop with Charter Shares + sandbox opt-out. | GAME_DESIGN Prestige Loop |
| R-9 | Session cadence | Hybrid short + long check-ins. | GAME_DESIGN Session Cadence |
| R-10 | Platforms | True dual-target — same game, same save, full campaigns possible exclusively on either form factor. | GAME_DESIGN Platforms |
| R-11 | Detail surface | Bottom sheet on both desktop and mobile (no right-rail inspector). | UI_VIEWS Navigation Architecture |
| R-12 | Single nav language | One interaction language across form factors. | UI_VIEWS Navigation Architecture |
| R-13 | Survey-as-destination | Folded into Map as a mode. | UI_VIEWS Navigation Architecture |
| R-14 | Industry name | Renamed to Production. | UI_VIEWS Navigation Architecture |
| R-15 | Mobile bottom-nav slots T0 | Map / Ops / Production / Fleet / More (Colonies under More until T1). | UI_VIEWS Navigation Architecture |
| R-16 | Doc strategy | Edit in place + reconcile across docs. Split large writes across separate tool calls to survive timeouts. | DESIGN_NOTES |
| R-17 | UI sketch fidelity | Two-pass (Design Intent → Buttons & Navigation), each scoped to anchor the next pass. | DESIGN_NOTES |

---

## How to use this file

- **Before starting any drill**, scan for relevant Pending items and decide whether to address them in scope.
- **When making a decision in chat**, append it to Resolved with a one-line resolution and a link.
- **When a Pending item gets harder/easier**, update its priority band.
- **Don't let Pending grow unbounded.** If an item has been Pending for 3+ sessions without being touched, demote to P3 or remove with a "won't decide at v1" note.
