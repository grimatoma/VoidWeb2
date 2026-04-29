# Void Yield 2 Pending Decisions

The single inventory of decisions still needed. Aggregated from `GAME.md` (Parts I/II/III, the merged design+UI+flows source of truth) and `DESIGN_NOTES.md`, prioritized by when we need an answer.

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
| 2c | **Grid range tuning per body type** — survey-rolled grids (R29) need authored ranges per body type (NEA min/max, lunar habitat min/max, etc.). | DESIGN_NOTES 2026-04-28 | Tunable in playtest; Stage 3 territory. |

## Pending (P1 — block T1+ build, or visible soon after T0)

*(none — all P1 decisions resolved.)*

## Pending (P2 — by T3+ or polish)

| # | Decision | Source | Notes |
|---|----------|--------|-------|
| 16 | **Carbon Mesh single-source bottleneck** — Carbonaceous Ore feeds both Textiles and Furnishings; is this a problem? | GAME.md (Part I) Open Questions | Validate in playtest. May need second source. |
| 17 | **Aluminum demand scaling** — input to Construction Materials, Glass Furnace, AND Furnishings Workshop. May need volume scaling on Lunar Surface Mines. | GAME.md (Part I) Open Questions | Validate in playtest. |
| 24 | **Research gating model** — time-gated (research takes wall time) vs. resource-gated (consumes resources) vs. both? | GAME.md (Part II) Destination 7 — Research Open Question | Affects Active Research Queue controls. |
| 28 | **Build Drawer category filters** — 5 categories (current spec) vs. 4 broader? | DESIGN_NOTES (Buttons & Navigation pass) | Tune in Stage 2 prototype. |
| 30 | **Active Research Queue Cancel behavior** — refund what? Tied to research-gating model decision (#24). | DESIGN_NOTES | Resolve with #24. |
| 31 | **Greenhouse vs. Hydroponics water consumption** — current placeholder makes water demand 16× pop drink rate. May need rebalancing. | DESIGN_NOTES (recipe validation) | Tune in Stage 3 playtest. |

## Pending (P3 — strategic / late-game)

| # | Decision | Source | Notes |
|---|----------|--------|-------|
| 32 | **Prestige carryover ratios** — % research, % recipe knowledge, starting kit options. | GAME.md (Part I) Open Questions; GAME.md (Part III) Prestige Incorporation | Modest multipliers (1.1×–2× per axis) is the current frame. |
| 33 | **Charter Shares formula** — peak throughput × colony tier sum × unlocked recipes (placeholder). | GAME.md (Part I) Open Questions | Tune late. |
| 34 | **Prestige solar-system reshuffle** — does prestige reshuffle bodies or preserve them? | GAME.md (Part I) Open Questions; GAME.md (Part II) Destination 8 — Milestones | Tradeoff: novelty vs. mastery transfer. |
| 35 | **Sandbox-mode entry** — free from start vs. unlocked after first prestige? | GAME.md (Part I) Open Questions | Lean: free from start with a "scoreboard mode" toggle for prestige earners. |
| 36 | **Combined-vs-specialized hull tuning** — confirm fixed mixed slots feel right vs. flat penalty alternative. | DESIGN_NOTES (cargo class confirmation) | Locked structurally; numeric tuning pending playtest. |
| 37 | **NASA-industrial palette values** — exact color tokens. | GAME.md (Part I) Open Questions; GAME.md (Part II) Style Direction | Stage 2 territory. |
| 38 | **First survey UI fidelity** — region picker shape, focus model. | GAME.md (Part I) Open Questions | Stage 2 territory. |
| 39 | **T3+ resource and recipe content** — deliberately deferred. | GAME.md (Part I) Open Questions | Drill after T0–T2 playtest. |
| 40 | **Ship catalog T3+** — long-range drives, exotic propulsion, specialist hulls (probe ships, builders). | DESIGN_NOTES | Drill alongside T3+ content. |
| 41 | **Building catalog (T0–T2 construction costs and footprint)** — mostly spec'd via recipe table; explicit footprint and prereq costs need a pass. | GAME.md (Part I) Open Questions | Resolves alongside #2 (build footprint decision). |

---

## Resolved

(Newest on top. Each entry: decision, resolution, source doc.)

| # | Decision | Resolution | Resolved In |
|---|----------|------------|-------------|
| R71 | Doc merge execution (per R68) | **Done.** GAME_DESIGN.md + UI_VIEWS.md + UX_FLOWS.md merged into `GAME.md` as Parts I / II / III. Source files removed. R69/R70 (collaboration radius preview, storage neutrality) applied to Production view text during merge. CLAUDE_DESIGN_PROMPTS.md references updated. Source-column refs in this file updated to point at GAME.md. Closes Pending #50. | DESIGN_NOTES 2026-04-29 |
| R70 | Storage adjacency participation | Storage buildings (Silo / Tank / Cryo Tank) are neutral — don't grant or receive adjacency bonuses. Pure capacity; trade-off is grid space, not synergy. | DESIGN_NOTES 2026-04-29 |
| R69 | Adjacency radius default | 2 tiles uniform for all buildings at v1. Per-building radius override architecturally supported for future content/balance tuning. Placement preview must visually indicate the collaboration radius boundary. | DESIGN_NOTES 2026-04-29 |
| R68 | Doc structure | Merge GAME_DESIGN.md + UI_VIEWS.md + UX_FLOWS.md into a single `GAME.md`. DECISIONS.md and DESIGN_NOTES.md stay separate. Single source of truth eliminates cross-doc drift; the FTUE-banner drift between GAME_DESIGN and UX_FLOWS is the proof of concern. | DESIGN_NOTES 2026-04-29 |
| R67 | Pop-tier settle-in during AFK | Hybrid: progresses while away, capped at **one tier transition per AFK return**. Window resumes (does not restart) on return; cap resets on next return. Preserves "wait for the big advance" tension AND honors daily-check-in cadence. | DESIGN_NOTES 2026-04-29 |
| R66 | Quest content authoring scope | Lean v1: **8–12 daily templates + 2 weekly arcs** covering T0–T2. Defer the full 30–50 / 5–8 target until Stage 4 playtest. Reduces up-front authoring; enables Stage 4 build immediately. | DESIGN_NOTES 2026-04-29 |
| R65 | Adjacency model | **Range-based** (collaboration radius), not pair-based edge-adjacency. Buildings have a radius (default 2 tiles per R69); any building within radius contributes per the pair-type table. Storage is neutral (R70). **Supersedes R30.** | DESIGN_NOTES 2026-04-29 |
| R64 | FTUE T0→T1 gate banner text | Tutorial banner at t=13:00 shows the concrete gate: `Sell 200 Refined Metal to unlock Lunar Foothold (T1) · 124/200 sold`. Replaces the contradictory `$10k` placeholder. Reinforces "content gates not paywalls" pillar from day one. | DESIGN_NOTES 2026-04-29 |
| R63 | Narrative framing | Player-as-corporation, faceless Earth. Default company name `VOID YIELD CO.` (player-renameable at FTUE). Earth interactions are a fixed-price market with no NPCs. Milestones use corporate-beat language (already aligned: First IPO, Charter Signed, System Corporation Declaration). | DESIGN_NOTES 2026-04-29 |
| R62 | Earth bailout | **Deferred to post-prototype.** May not exist at all at v1. Failure Modes "Zero credits, zero exportable" row marked TBD until Stage 3 playtest reveals whether soft-stuck states actually happen. | DESIGN_NOTES 2026-04-29 |
| R61 | Save conflict resolution | Player picks on conflict. Conflict Screen shows both saves' game-time, last-wall-time, headline stats (credits, pop, tier). Player keeps one; other discards. Rare in practice; honest UX over silent overwrite. | DESIGN_NOTES 2026-04-29 |
| R60 | Storage cap upgrade UX | **Auto-upgrade in place.** Existing T0 silos/tanks gain higher cap on tier transition; no player action needed; no stored-resource loss. Storage cap computed from `tier × silo_count` not stored per-silo. | DESIGN_NOTES 2026-04-29 |
| R59 | Confirm-rule extension at high wealth | Existing rule (irreversible OR ≥25% credits) + NEW: any single action affecting >100 units of a finished resource triggers confirm. Catches catastrophic high-wealth misclicks without re-tuning the percentage threshold. | DESIGN_NOTES 2026-04-28 |
| R58 | Body Sheet Pin scope | Persists across navigation back-stacks (desktop only — mobile has no persistent sheet across destinations). Power-user feature for cross-screen analysis (e.g., compare warehouse on NEA-04 while editing chains in Production). | DESIGN_NOTES 2026-04-28 |
| R57 | Tier-up dismiss target | **Return to Map** with newly-unlocked region animated/highlighted. Tier-up is treated as a chapter break; the new-region reveal IS the payoff. Forced attention redirect is part of the moment. | DESIGN_NOTES 2026-04-28 |
| R56 | Pop-tier settle-in window | **Tier-scaled real-time.** Survival 5min, Settled 20min, Growing 1h, Comfortable 2h, Affluent 4h. Early dopamine fast (forms habit during onboarding); late tiers build tension. Replaces flat 1h placeholder. Closes design-review #4. | DESIGN_NOTES 2026-04-28 |
| R55 | Settings → Saves cloud-sync UI | Auto-only with status indicator (no explicit sync button). Simpler UX; status indicator surfaces sync state passively. | DESIGN_NOTES 2026-04-28 |
| R54 | Persistent bottom strip on desktop | Map+Ops only at v1. Other destinations don't get the strip. Density wins for hero-and-daily screens; consistency cost accepted. | DESIGN_NOTES 2026-04-28 |
| R53 | Trade order timing | Instant fixed-price at v1. Delivery-time imports deferred — adds logistics back-pressure but isn't load-bearing for v1. | DESIGN_NOTES 2026-04-28 |
| R52 | Window-based departure | v1 shows the good/poor window indicator but doesn't enforce wait — player choice. T3+ automation rules can prefer good windows. | DESIGN_NOTES 2026-04-28 |
| R51 | Repeat-route UI | 3-button segmented control (once / 3× / continuous). Faster than number input; covers the common cases. | DESIGN_NOTES 2026-04-28 |
| R50 | Ship delivery time | Instant at v1. Wall-time delivery deferred to higher tiers as economic friction (T4+ shipyard considerations). | DESIGN_NOTES 2026-04-28 |
| R49 | Claim limit | Unlimited at v1. Revisit if claims feel meaningless (e.g., players claim everything reflexively). | DESIGN_NOTES 2026-04-28 |
| R48 | Re-scan cost in Survey | Free (time-only). No credits or consumable cost. Simplest UX; preserves Survey's setup-feel. | DESIGN_NOTES 2026-04-28 |
| R47 | Multi-select on desktop Fleet | **Shift-click row** to enter multi-select mode (matches mobile long-press pattern). Selected count + batch-action bar appears at top; Cancel exits. | DESIGN_NOTES 2026-04-28 |
| R46 | Heat mode on Map | **Cut at v1.** Three Map modes (Default / Survey / Routes) is sufficient on a hero screen. Heat returns at T3+ if fleet density justifies. | DESIGN_NOTES 2026-04-28 |
| R45 | Notes per body | **Cut at v1**, deferred to v2. Phantom commitment that creates engineering ambiguity (save model, cloud-sync). Body Sheet drops to 4 tabs (R43). | DESIGN_NOTES 2026-04-28 |
| R44 | Prestige model | **Charter pick per prestige + modest carryover.** Player picks one of ~6–8 hand-authored Charters that modify the next run mechanically (e.g., "Mining Charter: ore yields +25%, refinery costs +50%"). Modest carryover (% research, % recipe knowledge). PP2-aligned; closes design-review #20 ("treadmill not homecoming"). | DESIGN_NOTES 2026-04-28 |
| R43 | Body Sheet tab structure | **4 tabs: Overview / Buildings / Storage / Activity.** Activity merges ships-docked + routes-touching ("what's moving in/out"). Notes cut (R45). Cleaner mobile fit at sheet half-height. | DESIGN_NOTES 2026-04-28 |
| R42 | Multi-stop routes | **Available from T0**, up to 3 stops per route. Combined hulls (Mixer-1) get a unique role immediately (NEA → Lunar Habitat → Earth in one assignment). Route Creation UI gains a multi-leg editor. Closes design-review #6. | DESIGN_NOTES 2026-04-28 |
| R41 | Storage upgrade model | **Storage buildings on grid**, tier-gated capacity unlocks. Dedicated Silo / Tank / Cryo buildings each take 1 grid slot. Capacity unlocks at tier transitions (placeholder: T0 = 300, T2 = 900, T4 = 3000). Storage stops dominating because each upgrade costs grid space against another building. Closes design-review #9. | DESIGN_NOTES 2026-04-28 |
| R40 | Quest cadence + reward shape | **Hand-authored dailies + weekly arcs, tiered rewards.** Daily quests pulled from a hand-authored content pool ("Sell 50 Refined Metal today", "Build first Greenhouse on a NEA"); reward = small credits + Charter Shares preview drip. Weekly arcs hand-authored, tier-gated; reward = larger Charter Shares preview + occasional unlocks. Authoring sized at ~30–50 daily templates + ~5–8 weekly arcs. | DESIGN_NOTES 2026-04-28 |
| R39 | Mobile bottom-nav at T1 | **Promote Colonies, demote Production.** T1 unlock shifts mobile nav to: Map / Ops / Colonies / Fleet / More. Production drops to More. Bottom-bar serves the daily/short-check-in axis; long-session destinations live one tap deeper. Resolves design-review #7. | DESIGN_NOTES 2026-04-28 |
| R38 | Sources & Sinks scope | **Popover + global Resource Detail screen.** Tap status-bar resource → popover with bodies producing/consuming + "View all" → full Resource Detail screen showing the resource's network globally. Handles scale at T4+. Prevents Colonies-as-debug-tool failure mode. New light-spec surface in GAME.md (Part II) Persistent Surfaces. | DESIGN_NOTES 2026-04-28 |
| R37 | Earth Prefab Kit mechanic | **1-of-1 hand-authored per kit per tier.** Each tier unlocks specific kits (T1 = Lunar Habitat + Lunar Surface Mine; T4 = Mars Foothold; etc.); each buyable once per tier per kit-type. After that, local industry scales. Strong "moment" feel — kits are tier-up payoff. ~10–14 kits across T1–T6. | DESIGN_NOTES 2026-04-28 |
| R36 | T7 endgame shape | **Destination.** T7 gets 5–10h of unique play — Saturn ring industries, outer-system probes, named narrative milestones (working titles: "First IPO", "Charter Signed", "System Corporation Declaration"). Prestige is the closing chapter, not the goal. Players can prestige when ready or stay and complete. Closes the design-review's "T7 is fog" critique. | DESIGN_NOTES 2026-04-28 |
| R35 | FTUE first sale | **Raw Iron Ore at t=4:30.** Faster first dopamine; mobile retention. Smelter introduced at t=6:00 as contrast ("look how much more you'd have made if you'd refined"). Pedagogy by comparison; refining still in FTUE, just second sale. | DESIGN_NOTES 2026-04-28 |
| R34 | Pause toggle | **Cut entirely.** No time-stop control of any kind. Internally consistent with R22 (sim speed cut). **Corollary rule:** alerts and events must never have sub-minute urgency — if reading an alert at human pace can change the outcome under time pressure, the alert is mis-tuned. Propagated to GAME.md (Part II) Global UI Rules and GAME.md (Part I) Failure Modes. | DESIGN_NOTES 2026-04-28 |
| R33 | Build time per recipe | **Instant placement.** No build timers. Cost (credits + grid slot) is the only gate. Critical given R27 spatial grid: placement now has a thoughtful "where" decision; adding a "wait 90s for it to be real" timer on top stacks two friction moments. Removes a third real-time-timer category atop route transit, probe scans, pop settle-in, research. | DESIGN_NOTES 2026-04-28 |
| R32 | Events progression metric | **Hybrid.** Foreground events accumulate per active-play minute; AFK return surfaces separate auto-resolved event beats. Honors "5 min/day = fewer events" while giving AFK returners texture in the AFK Return modal. | DESIGN_NOTES 2026-04-28 |
| R31 | AFK cap value | **24h hard cap.** Matches "minutes to a day" cadence; daily check-in is the implicit contract. Consumable extender stays as a clean follow-up if retention data demands it later. | DESIGN_NOTES 2026-04-28 |
| R30 | Adjacency bonus shape | ~~**Soft adjacency.** ~10–25% rate boosts for paired buildings (e.g., Crusher next to Mine = +15% throughput; Refinery next to Smelter = +10%). Layout matters but doesn't dominate. Players can ignore at T0, lean in by T2+.~~ **Superseded by R65 (range-based collaboration radius).** Bonus magnitude (10–25%) and "soft" character preserved; the *shape* changed from edge-adjacency-pairs to within-radius. | DESIGN_NOTES 2026-04-28 |
| R29 | Grid scale per body type | **Survey-revealed variable.** Each body's grid size rolls within a body-type range at survey time (e.g., NEAs roll 3x4 to 5x5; lunar habitats 5x5 to 7x7; tunable in playtest). Persists with the body for the run; couples to procedural seed. Adds discovery and replayability — survey now has a skill-ceiling beyond setup. | DESIGN_NOTES 2026-04-28 |
| R28 | Session cadence emphasis | Short check-ins are the default; long sessions are first-class supported (not rare power-user mode). Both are core. Ops hosts the short-check-in surface; Production hosts the long-session surface. | DESIGN_NOTES 2026-04-28 |
| R27 | Layout model | **Spatial grid placement.** Bodies have placement grids; players hand-place buildings; adjacency bonuses drive layout decisions. Per-body warehouse retained for stock (buildings on a body share stockpile). Reference: Paragon Pioneers. Supersedes the older "typed slots / no spatial layer" framing. | DESIGN_NOTES 2026-04-28 |
| R26 | Events pacing | Progression-paced, not wall-time-paced. A 5-min/day player gets fewer events than a 2-hr/day player. Specific metric pending (#15b). | DESIGN_NOTES 2026-04-28 |
| R25 | Quest layer | Dailies + weeklies layered on top of tier gates. Provides the mid-tier active-loop texture the design-review critique flagged as missing. Cadence/reward shape pending (#15c). | DESIGN_NOTES 2026-04-28 |
| R24 | Inventory model | Per-ship cargo manifest + per-body warehouse for colonies. Confirms the existing implicit model — no new mechanic, just explicit confirmation. | DESIGN_NOTES 2026-04-28 |
| R23 | AFK cap principle | Retained as anti-scaling-break safeguard. Specific value pending (#15a). | DESIGN_NOTES 2026-04-28 |
| R22 | Sim Speed | **Removed at v1.** Real-time is the pacing gate; aligns with idle-centric mobile direction. PP2 dev declined to add one for the same reason. (Pause-toggle question lives separately as #2b.) | DESIGN_NOTES 2026-04-28 |
| R21 | AFK summary delta units | Hybrid: $ delta as headline (`+$2,304 net · 4h 12m away`), raw resource counts in detail rows. Keeps the satisfaction beat AND honest storage signal. | GAME.md (Part III) AFK Return |
| R20 | Confirm-vs-commit threshold | Confirm appears only when action is **irreversible** OR **single-action spend ≥ 25% of current credits**. Otherwise single-tap commit. Scales naturally with player wealth — no magic dollar threshold to retune. | GAME.md (Part II) Global UI Rules |
| R19 | Tier-up ceremony shape | Plain modal at v1 (tier name, flavor text, unlock list, single `Begin` CTA). No cinematic pause/zoom. Cinematic backdrop is a Stage 2 polish candidate. | GAME.md (Part III) Tier-Up |
| R18 | Notification / system-text voice | **Terse-corporate** — sentence-case, numbers leading, verbs minimal, no NPC dialogue. Examples: `First Habitat — O2 at 18%, importing recommended` / `T1 ready: Lunar Foothold available`. Applies globally across alerts, AFK summaries, tier-up flavor, build-complete notifications. | GAME.md (Part II) Global UI Rules |
| R8 | Cargo class strictness from T0 | Strict at cargo level; combined hulls have fixed mixed slots. | GAME.md (Part I) Resources & Recipes; DESIGN_NOTES |
| R7 | Combined hull mechanics | Fixed mixed slots (e.g., 30 solid + 20 fluid), not flat penalty. | GAME.md (Part I) Ship Catalog |
| R6 | Passenger cargo class | Removed at v1 (auto-spawn pop = no cargo to put in passenger holds). Reserve for future specialist/colonist mechanic. | DESIGN_NOTES |
| R5 | Hull count T0–T2 | 6 hulls: 2 specialized solid, 2 specialized fluid, 2 combined. | GAME.md (Part I) Ship Catalog |
| R4 | Hull stats v1 | Fixed-spec (no modular/hardpoint upgrades at v1). | GAME.md (Part I) Ship Catalog |
| R3 | Pop arrival mechanic | Auto-spawn when life support met. No ship-as-cargo for population. | GAME.md (Part I) Colony Pop-Tier Needs |
| R2 | Fuel model v1 | One resource (Hydrogen Fuel) through T2; multi-fuel deferred to T4+. | GAME.md (Part I) Resources & Recipes |
| R1 | Colony goods granularity | Unpacked Anno-style (Textiles, Furnishings, Spirits as distinct items). | GAME.md (Part I) Resources & Recipes |
| R0 | First habitat location | Lunar orbit station. | GAME.md (Part I) Tier Ladder |
| R-1 | Recipe shape | Per-cycle batches (Anno-style). | GAME.md (Part I) Resources & Recipes |
| R-2 | Storage model | Per-body warehouse. | GAME.md (Part I) Resources & Recipes |
| R-3 | Resource + recipe drill scope | T0–T2 only at v1; T3+ deferred. | GAME.md (Part I) Resources & Recipes |
| R-4 | Survey mechanic | Setup-only, not active minigame. | GAME.md (Part I) Survey Model; GAME.md (Part III) Survey and Claim |
| R-5 | Tier ladder shape | 8 named tiers with concrete content gates. | GAME.md (Part I) Tier Ladder |
| R-6 | Reference games | Anno 1800 + Paragon Pioneers; not Factorio, not EVE, not pure idle. | GAME.md (Part I) Working Summary |
| R-7 | Game scope | Full solar system, 8 tiers, ~15-30h to first prestige. | GAME.md (Part I) Scope |
| R-8 | Replay model | Prestige loop with Charter Shares + sandbox opt-out. | GAME.md (Part I) Prestige Loop |
| R-9 | Session cadence | Hybrid short + long check-ins. | GAME.md (Part I) Session Cadence |
| R-10 | Platforms | True dual-target — same game, same save, full campaigns possible exclusively on either form factor. | GAME.md (Part I) Platforms |
| R-11 | Detail surface | Bottom sheet on both desktop and mobile (no right-rail inspector). | GAME.md (Part II) Navigation Architecture |
| R-12 | Single nav language | One interaction language across form factors. | GAME.md (Part II) Navigation Architecture |
| R-13 | Survey-as-destination | Folded into Map as a mode. | GAME.md (Part II) Navigation Architecture |
| R-14 | Industry name | Renamed to Production. | GAME.md (Part II) Navigation Architecture |
| R-15 | Mobile bottom-nav slots T0 | Map / Ops / Production / Fleet / More (Colonies under More until T1). | GAME.md (Part II) Navigation Architecture |
| R-16 | Doc strategy | Edit in place + reconcile across docs. Split large writes across separate tool calls to survive timeouts. | DESIGN_NOTES |
| R-17 | UI sketch fidelity | Two-pass (Design Intent → Buttons & Navigation), each scoped to anchor the next pass. | DESIGN_NOTES |

---

## How to use this file

- **Before starting any drill**, scan for relevant Pending items and decide whether to address them in scope.
- **When making a decision in chat**, append it to Resolved with a one-line resolution and a link.
- **When a Pending item gets harder/easier**, update its priority band.
- **Don't let Pending grow unbounded.** If an item has been Pending for 3+ sessions without being touched, demote to P3 or remove with a "won't decide at v1" note.
