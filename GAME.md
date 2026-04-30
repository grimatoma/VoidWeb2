# Void Yield 2 — Game Design (Single Source of Truth)

> Single source of truth. Merges the former `GAME_DESIGN.md` (mechanics, content, balance), `UI_VIEWS.md` (per-screen specs), and `UX_FLOWS.md` (cross-cutting journeys) into this file. Resolution history lives in `git log`; rationale folds inline next to the rule it explains as `*Rationale: ...*` italic notes; unresolved items live in the Open Questions section at the end of each Part.
>
> Document layout:
> - **Part I — Game Design** — pillars, tone, scope, tier ladder, content targets, prestige, recipes, pop tiers, ships, stage progression, failure modes.
> - **Part II — UI Views** — global rules, navigation, eight destinations, persistent surfaces, style direction.
> - **Part III — UX Flows** — first-time experience, AFK return, alert resolution, tier-up, build, survey, route creation, prefab kit, prestige, quests.
>
> Cross-doc references in the merged content now point to sections within this file.

---

# Part I — Game Design


## Working Summary

Void Yield 2 is an optimistic hard-sci-fi, browser-based **incremental production-chain builder** set across the solar system. Think *Anno 1800* or *Paragon Pioneers* in space, with idle-friendly throughput, **spatial grid placement** as the layout texture, and a Charter-driven prestige loop on top.

The player surveys asteroids (revealing their grid size on scan), **places buildings on per-body grids** with soft adjacency bonuses, links chains via per-body warehouses, ships goods between bodies on routes that can have up to 3 stops, and grows colonies that demand progressively more advanced processed materials. The signature loop is **tier transitions**: Earth's demand unlocks the Moon, the Moon's population demands habitats which unlock NEA mining, NEA wealth unlocks Mars, and so on out to the gas giants — culminating in T7 (System Corporation), a destination of 5–10h unique content before the prestige choice. Placement and chain design are the active gameplay; throughput continues while away.

v1 ships desktop/web first; the design preserves mobile-compatible patterns (bottom sheet as universal detail surface, single nav language, no desktop-only inspectors) so a mobile build is an additive later phase, not a rewrite. Sessions are hybrid with **short check-ins as the default** (resolve an alert, claim a daily quest, place one building) and **long sessions first-class supported** (plan a tier transition, lay out a new colony's grid, work toward a weekly arc).

## Reference Games

- **Anno 1800** — tier-gated population needs driving recipe complexity.
- **Paragon Pioneers** — incremental, mobile-first chain building with simple visuals.
- *Influences, not clones.* We are not aiming at Factorio's hand-placed belt density or EVE's player-driven economy.

## Non-Goals

- No combat, piracy, or PvP.
- No price speculation, market timing, or trading minigame.
- No twitch reflexes or real-time precision.
- No permadeath. Failures degrade and pressure, never delete.
- No live-ops dependency. The game must be playable fully offline-capable.
- No belt-by-belt logistics editing. Routes are abstract, not topological.

## Design Pillars

- **Tier Transitions Are the Signature System:** Each tier introduces new bodies, new resources, new recipes, and new ship classes. A run is the path through the tier ladder.
- **Orbital Logistics Is the Texture:** Routes, fuel, and transfer windows make space feel alive, but the math is abstracted to readable indicators.
- **Colonies Are Power With Obligations:** Colonies provide People Capacity for more concurrent work, and their needs drive the recipe tree.
- **Setup Is Active, Operations Are Idle:** Surveying, **placing buildings on per-body grids**, and chain design are deliberate. Soft, range-based adjacency bonuses reward thoughtful placement. Once running, production continues unattended until a real bottleneck.
- **Spatial Layout, Bounded by Grids:** Each body has a placement grid whose size is rolled at survey within a body-type range. Storage, production, refining, and life-support all live on the grid; opportunity cost between buildings is the central layout decision. Belt routing is abstracted (per-body warehouse); placement and a **collaboration-radius adjacency model** (default 2 tiles, per-building override supported) are the texture. Storage buildings are *neutral* — they don't participate in adjacency, so the grid trade-off is space-vs-synergy, not stacking-storage-synergy.
- **Stable Economy, No Speculation:** Earth and other markets use fixed prices and predictable demand.
- **Failures Slow, Don't Punish:** Bottlenecks are clear, recoverable, and authored. No random save loss. **No alert/event has a sub-minute urgency window** — there is no Pause control, so the design must be readable at human pace.
- **Desktop-First, Mobile-Compatible:** v1 is desktop/web; UI patterns (bottom sheet detail surface, single nav language, no desktop-only inspectors) keep mobile a viable later additive phase rather than a rewrite.

## Tone And Visual Direction

The target mood is **NASA-industrial orbital command**:

- Dark Orbital Command map as the emotional centerpiece.
- NASA Industrial Hybrid as the practical visual language.
- Corporate Logistics as the structure for menus, rates, fleet status, and throughput.

## Narrative Framing

The player operates a **private corporation** expanding outward through the solar system. Earth-side context is deliberately faceless: there is no mission-control voice, no NPC dialogue, no chartering authority issuing personalized comms. Earth is a fixed-price market with predictable demand. The texture comes from the player's own corporation: its name, its tier-by-tier expansion, and the milestones it ticks off on the way to System Corporation status.

- **Default company name:** `VOID YIELD CO.` Set during FTUE; player-renameable from Settings at any time.
- **Voice:** terse-corporate (locked R18). Status text, alerts, AFK summaries, and milestone titles all read as internal corporate comms — sentence-case, numbers leading, verbs minimal. Examples: `First Habitat — O2 at 18%, importing recommended` / `T1 ready: Lunar Foothold available` / `First IPO — milestone complete`.
- **No NPCs.** No characters, no dialogue. Anyone the corporation interacts with (Earth markets, settlers, future business partners) is implied through outcomes — credits in, supplies out, population numbers up — not voiced.
- **Milestone language is corporate.** Tier names (Wildcatter, Lunar Foothold, NEA Industry, Cislunar Network, Martian Reach, Belt Operations, Jovian Frontier, System Corporation) and T7 milestones (First IPO, Charter Signed, System Corporation Declaration) are deliberately corporate-business language, not romantic-frontier language. Reinforces the player's role and the terse-corporate voice register.
- **Charter framing.** When the player prestiges, they receive a "Charter" — the corporate document that defines the next run's modifier (Mining Charter, Tanker Charter, Logistics Charter, Frontier Charter, Settler Charter). Charters fit naturally into the corporation framing.

This section anchors all string authoring across the game. New alerts, milestone titles, AFK summaries, and tier-up text should pass the test: *would this read like a notice on a corporate dashboard?*

## Voice & Strings (Starter Sheet)

Voice rules: terse-corporate, sentence-case, numbers leading, verbs minimal, no NPC speakers. The strings below are the v1 starter sheet — concrete copy for every load-bearing surface, locking the voice with examples instead of just rules. Authoring TODOs are flagged inline; T3+ tier-up flavor remains placeholder until that drill.

### Alerts

| Surface | String |
|---------|--------|
| Life support — oxygen low (warning) | `First Habitat — O2 at 18%, 1.7h reserve · import recommended` |
| Life support — water low (warning) | `First Habitat — water at 22%, 2.4h reserve · import or local-produce` |
| Life support — food low (warning) | `First Habitat — food at 19%, 2.0h reserve · import or build greenhouse` |
| Life support — critical (any need at 0%) | `First Habitat — O2 depleted · population suspends in 1h 58m` |
| Ship idle | `Hauler-1 idle at Earth dock — 12m` |
| Ship stranded (no fuel reserves) | `Hauler-2 stranded at NEA-04 — no fuel, dispatch tanker or accept tow` |
| Storage at cap | `NEA-04 — Refined Metal at cap (120/120) · output halted` |
| Recipe stalled (no input) | `Smelter (NEA-04) idle — no Iron Ore in warehouse` |
| Tier-up ready | `T1 ready: Lunar Foothold available` |
| Build complete | `Habitat Module assembled — First Habitat live` |
| Route arrived | `Hauler-1 unloaded at Earth — 30 Refined Metal sold for $360` |

### AFK Return Summary

| Surface | String |
|---------|--------|
| Header pattern | `+$2,304 net · 4h 12m away` |
| Stall line | `NEA-04 storage at cap — 1h 42m of 4h away` |
| Stall line (life support) | `First Habitat — O2 low, growth paused 38m` |
| Population delta | `+8 pop at First Habitat · 0 suspended` |
| Capped-at-24h note | `Capped at 24h — time has passed but operations were idle` |
| Top fix CTA | `Resolve top issue` |

### FTUE Banners

| Beat | String |
|------|--------|
| t=0:00 cold open | `VOID YIELD CO. — operations begin · Earth orbit, 1 Hauler-1, $5,000 starting capital` |
| t=0:30 first survey reveal | `NEA-04 surveyed — iron high, water low · 4×4 grid available` |
| t=4:30 first sale | `First sale: 30 Iron Ore × $1 = $30 · raw exports are thin margin` |
| t=6:00 first refinery compare moment | `Smelter +15% from Mine adjacency · 5 ore → 2 metal × $12 = $24/cycle (vs. 5 ore × $1 = $5)` |
| t=13:00 first objective unlock | `Sell 200 Refined Metal to unlock Lunar Foothold (T1) · 124/200 sold` |

### Tier-Up Flavor

| Tier | String |
|------|--------|
| T1 Lunar Foothold | `Lunar Foothold authorized · habitat construction cleared · life support imports available · pop tier mechanics live` |
| T2 NEA Industry | `NEA Industry authorized · tanker logistics cleared · advanced refining unlocked · 11 new recipes added` |
| T3+ | *Authoring TODO — placeholder until T3+ content drill.* |

### T7 Milestone Titles

| Milestone | String |
|-----------|--------|
| First IPO | `First IPO — 100k credits of finished goods shipped to Earth in 24h` |
| Charter Signed | `Charter Signed — Affluent pop tier reached on 5 colonies` |
| Outer System Declaration | `Outer System Declaration — production chain operational on a Saturnian moon` |
| Helium-3 Reserve | `Helium-3 Reserve — target tonnage stockpiled across Jovian + Saturnian sources` |
| System Corporation Declaration | `System Corporation Declaration — endgame milestone bundle complete · incorporate available` |

### Build / Route / Error Toasts

| Surface | String |
|---------|--------|
| Build placed | `Smelter placed on NEA-04 · adjacency: +15% from Small Mine` |
| Route confirmed | `Route confirmed: NEA-04 → Earth · ETA 8m 20s · fuel 1.12×` |
| Demolish confirm | `Demolish Smelter on NEA-04? · refund 50% · adjacency to Small Mine clears` |
| Insufficient credits | `Cost $1,500 · available $840 · sell stockpile or wait for next sale` |
| Prereq unmet | `Locked — requires T2 NEA Industry` |
| Sandbox-tagged action | `Sandbox save · Charter Shares not earned this run` |

### Settings / Menu Chrome

| Surface | String |
|---------|--------|
| Save exported | `Save exported · void-yield-save.json downloaded` |
| Save imported | `Save imported · resuming from game-time 04:12:33` |
| Conflict screen header | `Save conflict — two diverged saves found · pick one to keep` |

These strings serve as the voice template. New copy added during implementation should pass the corporate-dashboard test and follow the format above.

## Scope

- **Spatial scope:** full solar system. Earth, Moon, near-Earth asteroids, Mars + moons, main belt, Jovian moons, Saturnian moons, outer system probes. Not every body is a colony site — most are anchors for routes, surveys, or rare-trace pickups.
- **Run length:** a first prestige cycle should be reachable in ~15–30 hours of mixed-cadence play. Sandbox mode disables prestige gates for free-build.
- **Replay model:** prestige loop with sandbox opt-out. See *Prestige Loop*.

## Tier Ladder (v1, named tiers + gate conditions)

The ladder is the spine of progression. Numbers are placeholders; names and gates are the design commitment.

| Tier | Name | Region Unlocked | Gate To Next Tier | Headline New Capability |
|------|------|-----------------|-------------------|------------------------|
| T0 | Wildcatter | Earth orbit + 1 NEA | Sell N metals to Earth | Ship surveying, basic mining |
| T1 | Lunar Foothold | Moon orbit + lunar surface site | First habitat reaches Pop 50 | First colony, life-support imports |
| T2 | NEA Industry | NEA cluster (3–5 asteroids) | Local oxygen + water production | Tankers, fluid/gas cargo class |
| T3 | Cislunar Network | Earth–Moon–NEA route automation | Automation research complete | Maintain-stock and surplus-export rules |
| T4 | Martian Reach | Mars orbit + Phobos/Deimos | Build first non-Earth shipyard | Local shipbuilding, advanced alloys |
| T5 | Belt Operations | Main belt mining hub | 3 tier-3 colonies sustaining | Bulk haulers, advanced refining |
| T6 | Jovian Frontier | Jovian moons (Europa/Ganymede focus) | Helium-3 / heavy isotope chain | Long-range drives, ice giants |
| T7 | System Corporation | Saturn + outer system probes | Endgame milestone bundle | Prestige unlock |

Gate conditions are **content gates, not paywalls**: every gate is something the player produces or builds.

### T7 Endgame: System Corporation (Destination)

T7 is a **destination, not a transition**. Reaching T7 unlocks 5–10h of unique content before the player chooses to incorporate (prestige). Players can also stay indefinitely and complete every milestone — the spine's plateau, not its cliff.

**Region:** Saturn + outer-system probes (Titan, Enceladus, Iapetus, Triton, Pluto-class probes).

**T7-only milestones (working titles, ~6–10):**
- **First IPO:** Ship 100k credits worth of finished goods to Earth in a single 24h game-day.
- **Charter Signed:** Reach Affluent pop tier on at least 5 distinct colonies.
- **Outer System Declaration:** Operate at least one production chain on a Saturnian moon.
- **Helium-3 Reserve:** Stockpile a target tonnage of Helium-3 (Jovian + Saturnian sourcing).
- **System Corporation Declaration:** Complete the endgame milestone bundle. Unlocks the Incorporate (prestige) flow.

Each milestone deep-links to where the player needs to act. Completion of all milestones unlocks the prestige path; the player may incorporate at any time after Declaration but is not forced to. Voice on milestones follows the locked terse-corporate tone.

## Content Targets (v1 launch numbers)

Anchors for "is this enough content." Tune later. Each category lists a **floor** (minimum to ship the *Minimum Lovable Prototype*) and an **anchor** (current v1 launch target). The floor exists so scope cuts are pre-decided rather than scrambled at month 6.

- **Tiers:** floor 3 (T0–T2 playable) · anchor 8 (T0–T7), with T7 as a destination of 5–10h unique content.
- **Resources:** floor ~20 (T0–T2 set already drafted) · anchor ~35 distinct goods. ~8 raw, ~12 intermediate, ~12 finished, ~3 prestige-only.
- **Recipes:** floor ~24 (T0–T2 already drafted) · anchor ~50 across all tiers. Curve roughly 4 / 6 / 7 / 7 / 8 / 7 / 6 / 5 by tier.
- **Buildings:** floor ~14 (T0–T2 set) · anchor ~30 (mines, refineries, processors, fabricators, life-support, **storage buildings**, support).
- **Storage buildings:** floor 2 (Silo + Tank, T0 caps only) · anchor ~6 (Silo / Tank / Cryo Tank, plus tier-2/4/6 capacity unlocks per type).
- **Ship hulls:** floor 3 (Hauler-1, Mixer-1, Tanker-1) · anchor 12 at launch. 5 solid / 5 fluid-gas / 2 specialist (probe, builder).
- **Celestial bodies (interactable):** floor ~5 (Earth + Moon + 3 NEAs) · anchor ~25 fixed + ~30 procedurally-rolled NEAs and belt asteroids per run; **each body has a survey-rolled grid size** drawn from a body-type range.
- **Research nodes:** floor 0 (deferred from MLP) · anchor ~40, branched as Logistics / Industry / Life Support / Exploration.
- **Events:** floor 4 (one of each archetype: solar storm, equipment fault, supply emergency, route disruption) · anchor ~24. Frequency progression-paced — foreground events fire ~1 per 20 min of *active-play* time; AFK-return events fire on long-away with their own budget.
- **Earth Prefab Kits:** floor 2 (T1 Lunar Habitat + Lunar Surface Mine, already in T0–T2) · anchor ~10–14 hand-authored, **1-of-1 per kit per tier** (T4 Mars Foothold; etc.).
- **Charters (prestige modifiers):** floor 0 (deferred from MLP) · anchor ~6–8 hand-authored at v1 (Mining Charter, Tanker Charter, Logistics Charter, Frontier Charter, Settler Charter, +reserved).
- **Quest content pool:** floor 8–12 hand-authored daily templates + 2 weekly arcs covering T0–T2 (R66) · anchor ~30–50 dailies + ~5–8 weekly arcs deferred until Stage 4 playtest signal. Templates are parameterized by current state (resource name, body name, count).

These are anchors, not contracts. Floor numbers define the v1 minimum-lovable scope (see *Minimum Lovable Prototype*). If a tier feels thin, add a recipe; if it feels noisy, cut one.

## Prestige Loop

When the player completes the T7 endgame milestone bundle (System Corporation Declaration), they may **incorporate** — start a new run with mechanical variety, not just multiplied numbers.

- **Currency:** *Charter Shares*, earned from peak throughput, colony tier sum, unlocked recipes, and Charter-specific objectives.
- **Headline mechanic — Charter pick:** on each incorporation, the player picks one of ~6–8 hand-authored **Charters** that mechanically modify the next run. Examples (v1 catalog):
  - **Mining Charter:** ore yields +25%, refinery costs +50%. Specialize in raw extraction.
  - **Tanker Charter:** fluid hulls 30% cheaper, solid hulls 30% more expensive. Pivot logistics priorities.
  - **Logistics Charter:** route fuel costs −20%, but fewer slots per body grid. Faster trade, tighter layouts.
  - **Frontier Charter:** outer-system regions unlock 1 tier earlier; Earth markets pay less. Push outward, lean less on home.
  - **Settler Charter:** pop-tier settle-in windows halved; storage caps halved. Faster colony growth, tighter buffers.
  - (~3 more reserved for v1 authoring.)
- **Modest carryover:** % of unlocked research nodes, % of recipe knowledge, a small Charter-Share-purchasable starting kit. **Not** carried over: ships, money, populations, surveyed asteroids, body grid rolls.
- **Why Charters over flat multipliers:** flat multipliers make each prestige feel like "do the same thing 1.5× faster." Charters make each prestige *play differently* on the same content — mechanical variety rather than mathematical acceleration. PP2-aligned (Challenges-as-modifiers).
- **Sandbox mode:** toggle that disables prestige gates and grants all tiers immediately, for creative-builder play. Sandbox saves are tagged and do **not** earn Charter Shares.

Open: exact carryover ratios, full Charter catalog beyond v1, whether the solar system reshuffles per prestige.

## Session Cadence

Designed for **hybrid** check-ins, with **short check-ins as the default** and **long sessions first-class supported** (not rare power-user mode — both are core).

- **Short (1–3 min, default):** open the app, glance at alerts, resolve one (assign idle ship, import oxygen, claim a daily quest, dismiss event), close. Always has at least one meaningful one-tap action. **Ops is the hero surface.**
- **Long (15–60 min, first-class):** plan a tier transition, lay out a new colony's grid, set route automations, run a survey campaign, work toward a weekly quest arc. **Production is the hero surface.**
- **AFK between (minutes to a day):** production runs against bottlenecks. Returning shows an AFK Return summary including any AFK events that fired (per the hybrid event metric — see *Events*).

The mobile bottom-bar reshuffles to match: at T0, Production sits in the bar (active early-game build phase); at T1+, Colonies takes Production's slot (daily life-support emergencies > occasional grid optimization). Notification design and pop-tier dopamine are tuned around the short-check-in floor. Pop-tier settle-in windows are tier-scaled (Survival 5min → Affluent 4h) so early advances are visible during a long session, late advances build tension.

*Mobile bottom-bar design deferred from v1; preserved as design intent for the mobile phase.*

## Platforms

**Desktop/web first at v1.** Mobile is a deferred later phase. The UI architecture (bottom sheet detail surface, single nav language, no desktop-only inspectors) is mobile-compatible so adding the mobile build is additive, not a rewrite.

- **Desktop (v1):** browser; PWA-installable. Multi-panel UI, keyboard shortcuts.
- **Mobile (deferred):** browser + PWA install; portrait-first, landscape supported. Touch-first, push notifications, background-throttle resilient. Design intent preserved across this doc; not in v1 scope.
- **Save:** local-first with cloud sync via account login. Manual import/export always available. **Conflict resolution: player picks.** When two desktop instances have diverged offline saves, on next cloud-sync resume show a Conflict Screen with both saves' game-time, last-wall-time, and headline stats (credits, pop, tier). Player keeps one; other discards. Honest UX over silent overwrite; rare in practice. (Cross-form-factor conflict deferred until mobile ships.)
- **Auth:** anonymous device-id account at start; optional email/passkey upgrade for cross-device sync. No login required to play.

## Placeholder Numbers Sheet

These numbers exist so balancing has a starting point. **All values are placeholders** and will be tuned in Stage 3+.

### Tick Model

- Simulation tick: 1 Hz foreground, deterministic catch-up offline.
- AFK catch-up cap: 24h per return, with a soft warning beyond that.
- Game time : real time = 1:1.

### Action Durations (placeholder)

| Action | Duration |
|--------|----------|
| Survey one NEA (T0 probe) | 4 min |
| Mine cycle (small mine, 1 batch) | 30 s |
| Smelt cycle | 45 s |
| Build small habitat | 8 min |
| Earth → Moon transit (good window) | 6 min |
| Earth → Mars transit (good window) | 35 min |
| Earth → Belt transit | 90 min |
| Build T1 ship at Earth shipyard | 12 min |

### Storage Defaults (placeholder)

Storage is grid-based: dedicated **Silo** (solids), **Tank** (fluids/gases), and **Cryo Tank** (specialty cold-chain) buildings each take 1 grid slot per copy. Capacity per copy unlocks at tier transitions:

| Storage Building | T0 cap | T2 cap | T4 cap | T6 cap |
|------------------|-------:|-------:|-------:|-------:|
| Silo (solids) | 300 | 900 | 3,000 | 9,000 |
| Tank (fluids/gases) | 180 | 540 | 1,800 | 5,400 |
| Cryo Tank (specialty) | — | 240 | 800 | 2,400 |

A starter NEA with a 4×4 grid that allocates 2 slots to mines + 1 to refining + 1 to a Silo gets 300 ore capacity. Want more? Demolish a refinery, build another Silo. The opportunity cost between storage and production is the layout decision — and the reason storage doesn't dominate as the only upgrade that matters.

**Storage cap upgrade UX:** when a tier transition unlocks higher capacity, **existing storage buildings auto-upgrade in place** — no demolish/rebuild, no stored-resource loss. Capacity is computed from `tier × silo_count`, not stored per-silo. The dopamine beat at tier transition is silent: warehouses suddenly have more breathing room.

- Habitat life-support buffers: 8h reserve at full pop, baseline; lifesupport buffer-buildings unlock T1+.

## Resources And Recipes (T0–T2)

Specced for the first three tiers. T3+ resources/recipes are placeholder-only at named-tier level. Authoring rules:

- **Recipe shape:** per-cycle batches. A building has a cycle time; one cycle consumes its input batch and produces its output batch. Display: cycle time, output/cycle, derived rate/min. *Rationale: continuous flow rates are a nightmare to balance against discrete ship loads and tier-gate quantities; cycles give the player "this batch fills this hauler in 4 cycles" math they can do in their head.*
- **Storage:** per-body warehouse logical, **per-grid-slot physical**. All buildings on a body share one logical stockpile, but the cap is the sum of storage-building caps placed on the grid. Routes go warehouse → ship → warehouse. *Rationale: per-building stockpiles would fight the no-belt-routing non-goal — we want layout-as-decision at the "which buildings exist on this body" level, not the "how do they connect" level.*
- **Placement:** every building (including storage) takes 1 grid slot. Body grid sizes roll at survey within a body-type range (NEAs ~3×4 to 5×5; lunar habitats ~5×5 to 7×7; Mars colonies ~7×7 to 9×9; tunable in playtest). **Soft adjacency bonuses (10–25%)** apply to buildings within a placer's **collaboration radius** (default 2 tiles, uniform; per-building override architecturally supported for future content). Pair-type table drives the magnitude (e.g., Mine + Crusher; Refinery + Smelter; Greenhouse + Water-Reclaim). **Storage buildings (Silo / Tank / Cryo Tank) are neutral** — they don't grant or receive adjacency bonuses. **Building is instant** — cost (credits + slot) is the only gate; no build timers. Placement preview must visually indicate the collaboration-radius boundary so the player can see which neighbors a building will pair with before placing. *Rationale: range-based adjacency replaces an earlier pair-list model (which required ~30 buildings × pair matrix authoring); the placement decision becomes "what's nearby" rather than "what's edge-adjacent" — cleaner authoring, more puzzle texture.*
- **Cargo class:** strict at the cargo level. Solids in solid holds, fluids/gases in tankers. *Combined* hulls have **fixed mixed slots** — an explicit per-class allocation (e.g., 30 solid + 20 fluid) that can be filled in any combination but not repurposed between classes. *Specialized* hulls are single-class at full capacity. (Cargo classes are two at v1 — solid and fluid/gas.)
- **Multi-stop routes:** routes can have **up to 3 stops from T0**. Combined hulls become uniquely valuable for multi-leg runs (e.g., NEA → Lunar Habitat → Earth in one assignment).

### Resource Master (T0–T2)

20 resources across the first three tiers. Earth prices are placeholder; cargo class drives ship choice.

| # | Resource | Tier | Class | Cargo | Earth Buy | Earth Sell |
|---|----------|------|-------|-------|-----------|------------|
| 1 | Iron Ore | T0 | Raw | Solid | 3 | 1 |
| 2 | Water Ice | T0 | Raw | Solid | 4 | 2 |
| 3 | Refined Metal | T0 | Intermediate | Solid | 18 | 12 |
| 4 | Hydrogen Fuel | T0 | Intermediate | Fluid/Gas | 8 | 5 |
| 5 | Oxygen | T0* | Intermediate | Fluid/Gas | 6 | 3 |
| 6 | Lunar Regolith | T1 | Raw | Solid | — | 2 |
| 7 | Aluminum | T1 | Intermediate | Solid | 22 | 15 |
| 8 | Construction Materials | T1 | Finished | Solid | 60 | 45 |
| 9 | Food Pack | T1 | Finished | Solid | 25 | 18 |
| 10 | Habitat Module | T1 | Finished | Solid | 180 | 130 |
| 11 | Nickel Ore | T2 | Raw | Solid | 5 | 2 |
| 12 | Carbonaceous Ore | T2 | Raw | Solid | 4 | 2 |
| 13 | Silicates | T2 | Raw | Solid | 4 | 2 |
| 14 | Pressure Valves | T2 | Finished | Solid | 90 | 65 |
| 15 | Habitat Glass | T2 | Finished | Solid | 75 | 55 |
| 16 | Carbon Mesh | T2 | Intermediate | Solid | 40 | 28 |
| 17 | Textiles | T2 | Finished | Solid | 70 | 50 |
| 18 | Furnishings | T2 | Finished | Solid | 110 | 80 |
| 19 | Spirits | T2 | Finished | Fluid/Gas | 95 | 70 |
| 20 | Hydroponic Yield | T2 | Intermediate | Solid | — | 12 |

\* *Oxygen exists at T0 as an electrolysis byproduct (low-margin Earth sale only). Becomes load-bearing at T1 for life support.*

### Recipe Master (T0–T2)

24 recipes. Each recipe is one building. Cycle times are placeholder.

#### T0 — Wildcatter (7 buildings)

| Building | Cycle | Inputs | Outputs |
|----------|------:|--------|---------|
| Small Mine | 30s | — | 10 Iron Ore |
| Ice Mine | 40s | — | 8 Water Ice |
| Smelter | 45s | 5 Iron Ore | 2 Refined Metal |
| Electrolyzer | 60s | 4 Water Ice | 3 Hydrogen Fuel + 1 Oxygen |
| Probe Bay | (passive) | — | survey time → asteroid data |
| Silo | (storage) | — | +300 solids capacity |
| Tank | (storage) | — | +180 fluids/gases capacity |

#### T1 — Lunar Foothold (8 recipes)

| Building | Cycle | Inputs | Outputs |
|----------|------:|--------|---------|
| Lunar Surface Mine | 50s | — | 6 Lunar Regolith |
| Refinery (Aluminum) | 70s | 3 Lunar Regolith | 2 Aluminum |
| Construction Yard | 90s | 2 Refined Metal + 2 Aluminum | 1 Construction Materials |
| Habitat Assembler | 8 min | 6 Construction Materials | 1 Habitat Module |
| Greenhouse (small) | 60s | 2 Water Ice | 2 Food Pack |
| Life Support — Water | continuous draw | 1 Water Ice / pop / 8 min | — |
| Life Support — Oxygen | continuous draw | 1 Oxygen / pop / 6 min | — |
| Life Support — Food | continuous draw | 1 Food Pack / pop / 12 min | — |

> **Note:** Habitat Glass appears only as a colony pop-tier need (Growing tier and above), not as a habitat-build ingredient. The first habitat at T1 is delivered as a one-time **Earth Prefab Kit** purchase (a Habitat Module bought directly from Earth) to bootstrap the local construction chain. Subsequent habitats are built locally via the Habitat Assembler.

#### T2 — NEA Industry (11 recipes)

| Building | Cycle | Inputs | Outputs |
|----------|------:|--------|---------|
| NEA Mine (Nickel) | 45s | — | 6 Nickel Ore |
| NEA Mine (Carbon) | 45s | — | 6 Carbonaceous Ore |
| NEA Mine (Silicates) | 50s | — | 7 Silicates |
| Hydroponics Bay | 60s | 2 Water Ice | 2 Hydroponic Yield |
| Hydroponic Greenhouse (upgrade) | 45s | 2 Hydroponic Yield | 4 Food Pack |
| Glass Furnace | 90s | 4 Silicates + 1 Aluminum | 2 Habitat Glass |
| Carbon Mill | 75s | 3 Carbonaceous Ore + 1 Refined Metal | 2 Carbon Mesh |
| Pressure-Valve Forge | 120s | 2 Refined Metal + 1 Nickel Ore | 1 Pressure Valves |
| Textile Mill | 100s | 2 Carbon Mesh + 1 Hydroponic Yield | 2 Textiles |
| Furnishings Workshop | 150s | 1 Aluminum + 1 Carbon Mesh + 1 Textiles | 1 Furnishings |
| Distillery | 180s | 3 Hydroponic Yield + 1 Water Ice | 1 Spirits |

### Colony Pop-Tier Needs

Colony pop tiers are local growth states *within* the game tier. Reaching a higher pop tier requires meeting all listed needs continuously for a settle-in window. **Settle-in windows are tier-scaled** to align dopamine cadence with session shape: early advances visible during a long session; late advances build tension as the "I'm waiting for the big advance" beat. Population caps at the highest met tier.

| Pop Tier | Unlocks At | Continuous Needs | Settle-in Window | Growth-Tier Bundle (one-time, on first reach) |
|----------|-----------|------------------|-----------------:|----------------------------------------------|
| Survival | T1 (first habitat) | Water, Oxygen, Food Pack | 5 min | 4 Construction Materials |
| Settled | T1 (habitat upgraded) | + nothing new | 20 min | 8 Construction Materials + 2 Habitat Module |
| Growing | T2 (Glass + Valves available) | + Pressure Valves drip (1 / pop / 30 min) | 1 h | 6 Habitat Glass + 4 Pressure Valves |
| Comfortable | T2 late | + Textiles drip (1 / pop / 60 min) | 2 h | 8 Textiles + 4 Furnishings |
| Affluent | T2 endgame | + Spirits drip (1 / pop / 90 min) | 4 h | 6 Furnishings + 4 Spirits |

Effects: each pop-tier increase adds a multiplicative People Capacity bonus (placeholder: ×1.25 per tier). Shortages in continuous needs cause growth pause first, capacity penalty second, eventual suspension at extended zero-stock.

**Settle-in across AFK:** settle-in windows resume across AFK boundaries (they don't reset on session end), but the player gains **at most one tier transition per AFK return** regardless of away-duration. An overnight AFK player with all needs satisfied will see Survival → Settled (or Settled → Growing) on return, not Survival → Affluent in one summary. The cap resets on the next AFK return; the window resumes (does not restart) on each return so total real-time-elapsed counts. Preserves "wait for the big advance" tension while honoring the daily-check-in cadence.

### Tier Gate Recipes (concrete content gates)

The named gates from the tier ladder become concrete production milestones:

- **T0 → T1 (Lunar Foothold):** Sell 200 Refined Metal to Earth *and* accumulate 50 Hydrogen Fuel reserves.
- **T1 → T2 (NEA Industry):** First habitat reaches Pop 50 (i.e., maintain Survival tier for 50 settled population) *and* claim 2 NEA surveys.
- **T2 → T3 (Cislunar Network):** Local production of Oxygen at lunar habitat reaches break-even (no Earth O2 imports for 24h game time) *and* habitat reaches Comfortable pop tier.

T3+ gates remain at named-only level until that drill.

## Ship Catalog (T0–T2)

Six hulls covering the first three tiers. All hulls in this range are **Earth-bought** (local shipbuilding unlocks at T4). Hull stats are **fixed-spec** at v1: capacity, speed, and fuel use are hardcoded per hull, not modular. Cargo classes at v1 are **solid** and **fluid/gas** only. Population auto-spawns when life support is met, so colonist transport is not a gameplay loop and there is no passenger cargo class.

Two hull families exist:

- **Specialized hulls** carry one cargo class at full capacity.
- **Combined hulls** have **fixed mixed slots** — an explicit per-class allocation that can be filled in any combination but cannot be repurposed between classes.

Stats:

- **Capacity:** absolute slot units, broken down by class.
- **Speed:** multiplier on a route's base transit time. 1.0 is the Hauler-1 baseline; <1.0 is slower, >1.0 is faster.
- **Fuel/Route:** flat hull-specific multiplier on a route's base fuel cost. Encourages filling ships rather than partial loads.
- **Earth Buy:** placeholder credits.

| Hull | Tier | Family | Slots | Speed | Fuel/Route | Earth Buy |
|------|------|--------|-------|------:|-----------:|----------:|
| Hauler-1 | T0 | Specialized Solid | 30 solid | 1.00× | 1.00× | $3,000 |
| Mixer-1 | T0 | Combined | 20 solid + 10 fluid | 0.95× | 1.05× | $4,200 |
| Tanker-1 | T1 | Specialized Fluid | 25 fluid | 0.90× | 1.10× | $4,800 |
| Hauler-2 | T2 | Specialized Solid | 75 solid | 1.10× | 1.30× | $9,500 |
| Tanker-2 | T2 | Specialized Fluid | 60 fluid | 1.00× | 1.40× | $11,500 |
| Mixer-2 | T2 | Combined | 45 solid + 25 fluid | 1.00× | 1.40× | $12,500 |

Tier-introduction rules:

- **T0 (player start):** owns 1 Hauler-1 free. Hauler-1 and Mixer-1 available at Earth Trade.
- **T1 (Lunar Foothold):** Tanker-1 unlocks at Earth Trade. Tanker capacity becomes the gating factor for ferrying water/oxygen between Earth and the lunar habitat.
- **T2 (NEA Industry):** Hauler-2, Tanker-2, and Mixer-2 unlock. The 2nd-generation hulls roughly triple capacity at ~3× the cost — a meaningful investment, not a free upgrade.

Choice the catalog forces:

- Combined hulls (Mixer-1, Mixer-2) are **single-ship multi-class** vehicles. A Mixer-2 can run a route that picks up ore from an NEA, swings by the lunar habitat to drop fuel and pick up oxygen, and returns to Earth — one ship, one round-trip. Specialized hulls force separate trips but move more total tonnage per dollar of investment.
- Tanker-1 is intentionally slower and modestly fuel-hungry: tanker logistics is a deliberate T1+ commitment, not a default.

Specialist hulls (probes-as-ships, builders, science) are deferred — at T0–T2 surveys are handled by the Probe Bay building, and there are no construction-only or science-only ships yet.

## First 15 Minutes (FTUE Script)

The narrative spec — what the player sees and feels minute-by-minute. The screen-by-screen flow walk-through (which screens, which actions, which state changes) lives in Part III — First-Time User Experience.

- **t=0:00 — Cold open.** Player drops into Earth orbit with one Hauler-1, one starter Probe, $5,000, an Earth-orbit home base (a 4×4 grid with warehouse-bearing tiles), and 1 staked NEA claim. Tutorial overlay points at the Probe.
- **t=0:30 — First survey.** Auto-target on NEA-04, scan completes in 30 s (tutorial-accelerated). Reveals iron + water readings *and* the body's grid size (e.g., a 4×4 NEA — player sees their first surveyed grid).
- **t=2:00 — First mine.** Tutorial places a Small Mine on NEA-04's grid. Building is instant; mining begins immediately.
- **t=2:45 — First load-out.** Hauler-1 auto-assigned to NEA-04 → Earth, loaded with raw Iron Ore. Player taps "Confirm route."
- **t=4:30 — First sale.** Hauler delivers raw Iron Ore, sells at fixed Earth price. First feedback loop closes — player feels the cycle work.
- **t=5:30 — Second mine.** Tutorial nudges player to place a second Small Mine on NEA-04's grid (showing how multiple buildings stack on a body and how grid space is finite).
- **t=6:00 — First refinery.** Tutorial places a Smelter alongside the mines. *Compare moment:* tutorial points out "refining 5 ore → 2 metal worth 12 each — way more than 5 ore at 1 each." Pedagogy by comparison, not demonstration. Smelter inherits a +15% adjacency bonus from being next to a mine.
- **t=8:00 — Second sale, refined.** Refined Metal sells at higher rate. *Now* the chain pattern lands.
- **t=9:30 — Second ship.** Tutorial points at Earth Trade → Buy second Hauler-1.
- **t=11:00 — Second NEA.** Manual survey (no acceleration this time). Player learns the real pace and grid-roll variance — second NEA might be 3×4 (tighter) or 5×5 (rare big roll).
- **t=13:00 — First objective unlock.** "Sell 200 Refined Metal to unlock Lunar Foothold (T1) · 124/200 sold." (The concrete production milestone, not a credit threshold — reinforces the "content gates not paywalls" pillar from the first gate the player sees.) Tutorial ends, free play begins.
- **t=15:00 — Player is on the loop.** They know: survey-with-grid-reveal, place, mine, refine, ship, sell. They know placement matters. They know what's next.

Acceptance: a first-time player understands and is executing the loop unaided by t=15:00, including the grid-placement step. Tutorial is skippable.

## AFK Return Specification

The contents and capping rules. The screen-by-screen flow walk-through lives in Part III — AFK Return.

When the player returns after ≥60 s away, show the **Return Summary** before the main UI.

Contents:

- **Time away** (real time, capped at **24h hard**).
- **What happened:** top 5 bullets — ore mined, metals refined, ships dispatched, deliveries sold.
- **AFK events:** any progression-paced events that fired during AFK (per the hybrid event metric — most auto-resolve, rare ones gate on return). Example: "Solar storm at NEA-04 — auto-resolved, output 4% lower for the storm window."
- **What stopped:** ranked list of stalls — *Storage full at 67% of away time*, *Hauler-1 idle (no route)*, *Oxygen shortage at First Habitat*. Each row is tappable to jump-to-fix.
- **Net change:** $ delta as headline (`+$2,304 net · 4h 12m away`), raw resource deltas (top 6), population delta.
- **Single primary action:** "Resolve top issue" deep-links to the worst stall.
- **Single dismissible action:** "Continue."

Capping rules: AFK earnings are capped at the lowest of (storage cap, route capacity, fuel availability). **Hard cap at 24h** of simulated catch-up; beyond 24h the catch-up halts cleanly with a "capped at 24h" note in the summary. Aligns with the "minutes to a day" cadence pitch — daily check-in is the implicit contract.

## Failure Modes

Authored, recoverable, never silent.

**Corollary rule (load-bearing):** No alert/event has a sub-minute urgency window. If reading an alert at human pace can change the outcome under time pressure, the alert is mis-tuned. Life-support shortages must give plenty of warning before suspension. Stranded ships wait politely. Storage-cap warnings fire well before zero-output. Anything tighter than ~5 min real-time is wrong. This holds because **there is no Pause control** — players must be able to read and think at human speed.

| System | Failure | Effect | Recovery |
|--------|---------|--------|----------|
| Colony life support | Oxygen/water/food < 25% | Growth pauses, capacity -8% | Import or local-produce |
| Colony life support | Any need at 0% for >2h | Population suspends (frozen, no decay) | Restore supply, resume |
| Fleet | Ship runs out of fuel mid-route | Ship strands at nearest body, callable for fuel | Dispatch tanker; pay tow if no fuel anywhere |
| Industry | No input | Building idles, alerts | Provide input |
| Industry | Storage full | Building idles, alerts | Export, sell, or expand storage |
| Survey | Probe lost to hazard event | Probe destroyed | Buy/build replacement |
| Economy | Zero credits, zero exportable | Soft-stuck | **TBD post-prototype.** May add a capped Earth bailout if Stage 3 playtest shows players reach soft-stuck states; may not be needed if storage caps + idle production naturally provide a floor. |

No bankruptcy, no save-deletion. The Stage 3 playtest will reveal whether soft-stuck is a real failure mode and what the floor should look like.

## Notification Taxonomy

Spam budget: ≤3 push notifications per day per player by default, user-tunable. Pushes can name a problem but never need a sub-minute response (per Failure Modes corollary).

| Type | Channel | When |
|------|---------|------|
| Critical alert | Push + in-app | Population suspension imminent, ship stranded with no fuel reserves |
| Tier complete | Push + in-app | Gate met, new tier available |
| Long-running task complete | In-app only | Build finished, survey finished |
| Event opened | In-app only | Solar storm, supply emergency |
| Idle reminder | Push, opt-in | After 24h of no check-in |
| Marketing/news | Never push | Reserved for in-app banners only |

Mobile push uses Web Push API via PWA. Desktop uses browser notifications when permitted.

## Performance Budget

- **Desktop:** 60 FPS map, 16ms tick budget, no GC stalls visible during pan/zoom.
- **Mid-range Android (3-yr-old phone, ~Pixel 4a class):** 30 FPS map minimum, scrolling lists must remain 60 FPS, tick budget 33ms. Three.js focus views must have a Canvas 2D fallback toggle.
- **Battery:** background tab uses simulation-only (no rendering). Resume rebuilds visuals from state.
- **Background throttling:** assume mobile browsers may pause JS for hours. Catch-up math runs on resume against a deterministic seed and state snapshot, not against accumulated frame counts.
- **Save size:** target <2 MB for a fully-developed run; hard cap at 10 MB.

## Stage 0: Vision Mocks

Stage 0 happens before architecture or implementation. It creates cheap, disposable mockups to answer:

> What does this game feel like to look at and manage?

These mocks are direction-finding tools, not production UI.

### Mock 1: Main Desktop Command View

```text
+--------------------------------------------------------------------------------+
| VOID YIELD 2        $12,480     Metals 38/t     Fuel 120     Alerts 2          |
+----------------------+--------------------------------------+------------------+
| Resources            |                                      | Selected: NEA-04 |
| Ore        180 / 300 |        . NEA-04                      | Type: Asteroid   |
| Metals      38 / 120 |      /                               | Iron: High       |
| Fuel       120 / 180 |   Earth Orbit                        | Water: Low       |
|                      |      \                               | Survey: 62%      |
| Bottlenecks          |        o Hauler-1                    |                  |
| - Storage 82%        |                                      | Route Preview    |
| - Ship idle          |  Route: NEA-04 -> Earth              | Fuel: 1.12x      |
|                      |  Window: Improving +2% / min         | ETA: 8m 20s      |
+----------------------+--------------------------------------+------------------+
| Ships: Hauler-1 in transit | Probe-1 surveying | Refinery active | Log: +12 metals |
+--------------------------------------------------------------------------------+
```

### Mock 2: Mobile Management View

```text
+------------------------------+
| $12.4k   Fuel 120   Alerts 2 |
+------------------------------+
| OPS                          |
|                              |
| Critical                     |
| [Oxygen low at First Habitat]|
| [Hauler-1 idle]              |
|                              |
| Active Routes                |
| NEA-04 -> Earth              |
| Metals, ETA 8m, Fuel 1.12x   |
|                              |
| Production                   |
| Mine A      18 ore / min     |
| Refinery    6 metal / min    |
|                              |
| Bottom Sheet: Oxygen Warning |
| Import from Earth            |
| Assign tanker                |
+------------------------------+
| Map | Ops | Fleet | Colony   |
+------------------------------+
```

### Mock 3: Survey Setup View

Survey is **setup-only**: the player chooses a region and probe focus, then probe-time runs idle. No active minigame loop during scanning.

```text
+----------------------------------------------------------------+
| Survey: Near-Earth Search                                      |
+-----------------------------+----------------------------------+
| Search Region               | Candidate NEA-04                 |
|                             | Iron:  High                      |
|        [scan cone]          | Water: Low                       |
|             . ?             | Nickel: Medium                   |
|       .                     | Confidence: 62%                  |
|                             |                                  |
| Probe Time: 3m 40s          | Next Data Layer                  |
| Focus: Composition          | - Purity                         |
|                             | - Extraction difficulty          |
+-----------------------------+----------------------------------+
```

### Mock 4: Colony Needs View

```text
+--------------------------------------------------------------+
| First Habitat       Population 120       People Capacity 38   |
+-----------------------+--------------------------------------+
| Life Support          | Growth Tier: Habitat Tier 2          |
| Water      92% stable | Needs for next tier:                 |
| Oxygen     71% low    | - Aluminum Panels       40 / 80      |
| Food       88% stable | - Pressure Valves       12 / 30      |
| Spares     44% risk   | - Comfort Goods          0 / 20      |
|                       |                                      |
| Effect                | Warning                              |
| Capacity: -8%         | Oxygen shortage slows growth.        |
| Growth: paused        | Import or produce locally.           |
+-----------------------+--------------------------------------+
```

### Mock 5: Fleet And Route View

```text
+----------------------------------------------------------------+
| Fleet                                                          |
+----------------+------------+-------------+--------------------+
| Ship           | Type       | Status      | Assignment         |
| Hauler-1       | Solid      | In transit  | NEA-04 -> Earth    |
| Tanker-1       | Fluid/Gas  | Idle        | None               |
| Mixer-1        | Combined   | Docked      | First Habitat      |
+----------------+------------+-------------+--------------------+
| Selected Route: NEA-04 -> Earth                                |
| Cargo: Metals       ETA: 8m 20s       Fuel Cost: 1.12x         |
| Window: Improving for 6m, then stable, then closing            |
+----------------------------------------------------------------+
```

### Mock 6: Industry Chain View

```text
Ore Mine -> Crusher -> Smelter -> Metals -> Earth Sale
                              \-> Panels -> Colony Tier Upgrade

Ice Mine -> Electrolysis -> Oxygen -> Colony Upkeep
                         \-> Hydrogen Fuel -> Ship Routes

Advanced chain examples:
Nickel + Carbon -> Pressure Valves
Silicates + Metals -> Habitat Glass
Rare Traces -> Electronics
```

### Stage 0 Decision Gate

Decisions to lock before architecture:

- Visual direction: **Dark Orbital Command** for map, **Hybrid Corporate Logistics** for management panels. (Provisionally chosen — confirm in Stage 2.)
- Renderer split: Canvas 2D for map and survey; selective Three.js for focus views with Canvas 2D fallback; React for everything else.
- Single nav language (desktop at v1, mobile-compatible for later phase — see Part II — UI Views).

## Minimum Lovable Prototype (MLP)

The MLP is the smallest version of the game that **demonstrates every pillar** — not just the smallest version that runs the loop. Stage 3 (*First Playable Core Idle Loop*) proves the technical loop works; Stage 4 expands content. The MLP slice sits between them: it's Stage 3's loop *plus* the minimum surrounding texture (placement adjacency, tier transition, AFK return, voice strings) that makes a tester experience this specific game rather than a generic incremental.

### Scope

- **Tiers:** T0 + T1 only.
- **Bodies:** Earth + Moon + 1 NEA (manually staked at cold open, no Survey region picker yet — that's Stage 4 slice 1).
- **Buildings (~9):** Small Mine, Ice Mine, Smelter, Electrolyzer, Probe Bay, Silo, Tank, Lunar Surface Mine, Habitat Assembler. (No T2 buildings.)
- **Adjacency:** one paired bonus active — **Mine + Smelter (+15%)**. Engine supports the radius model (R69) but only this one pair is authored.
- **Ships:** Hauler-1 only. (No Mixer, no Tanker — single-class solid logistics only.)
- **Routes:** single-stop only. (Multi-stop deferred to Stage 4.)
- **Colony:** 1 lunar habitat, dropped via Earth Prefab Kit. Pop-tier mechanics: Survival → Settled only (Growing+ deferred — those need T2 recipes).
- **Tier transition:** T0 → T1 fires once, real (Sell 200 Refined Metal + 50 Hydrogen Fuel reserves).
- **AFK return:** full summary modal with header, what-happened, what-stopped, top-fix CTA. 24h hard cap enforced.
- **Voice:** all v1 starter-sheet strings authored (see *Voice & Strings*).
- **Form factor:** desktop only (matches v1 commitment).

### Deliberately excluded from MLP

T2 recipes, tankers and combined hulls, multi-stop routes, automation rules, research tree, quest content, Charter prestige, weekly arcs, Mars and beyond, T7 destination, full event catalog (1–2 events authored, archetype coverage deferred).

### Acceptance

A 30-minute play session demonstrates:

- Placement matters — adjacency gives a visible, tracked bonus that changes layout decisions.
- Tier transition lands as a moment, not a checklist completion (Risk Register #2 validated here).
- AFK return is satisfying — leaving the game and returning produces meaningful, honest progress (Risk Register #3 validated here).
- Voice reads as a corporate dashboard, not placeholder.
- Risk Register items #1, #2, #3 all validate or surface as "this isn't working" before Stage 4.

### Why MLP exists

If a tester plays Stage 3 in isolation (mine-refine-ship-sell on a single asteroid with no placement texture, no tier transition, no AFK return, no authored voice), they experience a generic incremental. The MLP is the smallest surface that lets a tester answer *"is this Anno-in-space?"* — yes or no — with enough fidelity to course-correct before Stage 4 commits to broad content authoring.

## Stage 1: Core Architecture Plan

Stage 1 defines the full architecture before gameplay implementation begins. The goal is cohesion, not overengineering.

### Technology Targets

- React + TypeScript.
- PWA-installable from day one.
- Canvas 2D for the map.
- Selective Three.js for focus views (with Canvas 2D fallback for low-end mobile).
- Local-first save with cloud sync structure.
- Deterministic simulation loop supporting AFK progress.
- Data-driven definitions for resources, ships, buildings (including storage buildings with capacity tiers), colonies, unlocks, research, events, **Charters (prestige modifiers)**, **quest content pool (daily templates + weekly arcs)**, **Earth Prefab Kits**, and celestial bodies (with body-type grid-size ranges and per-body adjacency map).

### Core Architecture Principles

- Simulation logic independent from React.
- UI reads derived state and dispatches explicit player commands.
- Definitions are data-driven where practical.
- Saves are versioned from the start.
- Offline progress replays through the same deterministic rules as foreground, with chunking for performance.
- Mobile and desktop share game state and commands; layouts adapt.

### Proposed Module Boundaries

- **Simulation Engine:** tick loop, time advancement, command processing, offline catch-up.
- **Game State:** resources, entities, routes, colonies, ships, unlocks, research, settings, save metadata.
- **Definitions:** resources, recipes, buildings, ships, celestial bodies, events, unlocks.
- **Economy:** fixed Earth buy/sell tables and later stable buyer definitions.
- **Survey:** asteroid candidates, scan progress, confidence, data layers, probe assignments.
- **Logistics:** ships, cargo, route assignment, travel time, fuel cost, transfer efficiency.
- **Colonies:** population, People Capacity, needs, happiness, shortage effects, growth tiers.
- **Industry:** mines, refineries, **storage buildings (silos/tanks/cryo)**, recipes, **per-body grid placement with adjacency bonuses**, throughput.
- **UI State:** selected object, active screen, sheet state, filters.
- **Persistence:** save/load, migrations, import/export, cloud sync.
- **Notifications:** rules, dispatch, opt-in/out.

### Save Model

- Save version, created/updated timestamps.
- Account ID (anonymous device or upgraded), run ID, random seed.
- Game time, last-active wall time.
- Stable entity IDs.
- Definitions version.
- Player settings.
- Game state snapshot.

### Resource And Flow Model

- Resources have type, unit, storage category, optional cargo class.
- Cargo classes at v1: solid, fluid/gas. (Passenger/crew reserved for future mechanics; not present at v1.)
- Storage limits are first-class bottlenecks.
- Earth trade is a fixed-price sink/source.

### Route And Ship Model

- Ships have cargo class, capacity, drive stats, fuel behavior, location, assignment.
- Manual assignment first; automation rules unlock at T3.
- Fuel/time derived from distance and alignment, smoothed for readability.

### Survey Model (setup-only)

- Player chooses region and probe focus; probe time elapses idle.
- Early reveals: low/medium/high readings.
- Later layers: purity, depth, difficulty, hazards, orbital value, rare traces.
- Survey automation at T3+: standing orders for regions.

### Colony Model

- Colonies provide People Capacity, gating concurrent work.
- Life support is ongoing upkeep.
- Advanced processed materials unlock growth tiers.
- Shortages reduce happiness and capacity before suspension.

### Unlock Model

- Major unlocks come from research, tier gates, and colony tiers.
- Each unlock introduces a clear new capability.

## Stage 2: UI Cohesion Prototype

Build a lightly functional UI shell using the chosen visual direction. No deep simulation yet.

Includes:

- Single-language nav for desktop and mobile.
- Resource/status bar.
- System map placeholder.
- Panels for asteroid, fleet, colony, Earth trade, industry, and research.
- Mobile: bottom-sheet detail pattern.
- Basic fake data to judge readability and excitement.

Playtest question: *Does this look and feel like a game worth managing on desktop?* (Mobile parity is a later-phase question, not a Stage 2 question.)

## Stage 3: First Playable Core Idle Loop

Implement the smallest real loop:

- Survey one asteroid (setup, idle scan).
- Mine ore.
- Refine ore into metals.
- Ship metals to Earth.
- Sell at fixed Earth price.
- Buy upgrades or another ship.
- Real durations, real AFK with storage caps.

Playtest question: *Is survey-mine-refine-ship-sell satisfying before colonies exist, on both desktop and mobile?*

## Stage 4: Vertical Slice Expansion

Add one major system per slice:

1. Survey region picker, candidate list, data layers.
2. First colony with People Capacity and life-support slowdown.
3. Orbital logistics with moving bodies and transfer efficiency.
4. Automation (T3 unlock) with stock-maintain and surplus-export rules.
5. Local life-support industry and tanker logistics.
6. Shipbuilding and advanced colony material tiers.
7. Prestige loop scaffolding (T7 → incorporate).

Each slice must be playtestable and answer one specific design question.

## Full Game Stage Progression

(Mirrors the Tier Ladder. Bottlenecks listed are the *intended* friction at each stage.)

### T0: Wildcatter

Buy basic ships from Earth. Survey NEAs. Mine ore. Refine and sell metals.
Bottlenecks: ship count, cargo capacity, storage, mine/refinery rate.

### T1: Lunar Foothold

Establish first habitat. Gain People Capacity. Import life support from Earth.
Bottlenecks: water/oxygen/food/spares, People Capacity, Earth import cost.

### T2: NEA Industry

Local life-support production. Ice mining. Tanker logistics.
Bottlenecks: tanker capacity, ice availability, processing rate, fuel allocation.

### T3: Cislunar Network

Route automation. Stock thresholds. Surplus export. Window preference.
Bottlenecks: route congestion, fuel efficiency, storage buffers.

### T4: Martian Reach

Local shipbuilding. Advanced alloys. Phobos/Deimos staging.
Bottlenecks: advanced material chains, shipyard throughput, colony upgrade requirements.

### T5: Belt Operations

Bulk haulers. Multiple colonies. Scaled chain design.
Bottlenecks: network fragility, fleet composition, large-scale storage.

### T6: Jovian Frontier

Long-range drives. Helium-3 / heavy isotopes. Outer-system logistics.
Bottlenecks: travel time, exotic material chains, automation priorities.

### T7: System Corporation (Destination)

Saturn + outer-system probes (Titan, Enceladus, Iapetus, Triton, Pluto-class). 5–10h of unique content with ~6–10 named milestones (First IPO, Charter Signed, Outer System Declaration, Helium-3 Reserve, System Corporation Declaration). Players may incorporate (prestige) once Declaration completes; staying further is encouraged.

Bottlenecks: long-range fuel logistics, exotic material chains (Helium-3, heavy isotopes), grid optimization on outer-system bodies, milestone-specific objectives, prestige preparation (Charter previewing). T7 is the spine's plateau, not its cliff.

## Economy

- Earth always buys and sells key resources at fixed prices.
- Fixed prices unlock by tier or region; they do not fluctuate.
- Contracts are not the main economy.
- Profit comes from production rate, logistics efficiency, scale, and self-sufficiency.

## Events

Events create operational pressure without becoming a market simulator.

Examples: solar storm, launch delay, equipment fault, rescue request, supply emergency, route disruption.

**Frequency model — progression-paced, hybrid:**

- **Foreground events:** ~1 active event per 20 min of *active-play* time (not wall time). A 5-min/day player gets fewer foreground events than a 2-hr/day player; pacing matches the player's actual engagement.
- **AFK-return events:** separate budget. On AFK return (≥60 s away), the AFK Return summary surfaces 0–3 events that fired while away. Most auto-resolve ("Solar storm hit at NEA-04 — output 4% lower for the storm window"); rare ones gate on return ("Rescue request pending player attention").
- **Combined effect:** every player sees event texture; the absolute amount scales with how much they play. Per the no-sub-minute corollary (Failure Modes), no event has a tight urgency window — even foreground events allow human-pace response.

Events are recoverable and readable. They create decisions, not random punishment. See *Failure Modes* for the floor.

## IAP Principles

IAP is not in the first prototype but the architecture should not preclude it.

- Do not design pain to sell relief.
- Do not sell essential automation, life-support recovery, or core UI clarity.
- Do not sell speculative market advantages (the game has no speculation).
- Acceptable: optional cosmetics, supporter packs, scenarios, expansions, sandbox tools.
- Cloud-ready entitlement architecture from save v1.

## Acceptance Criteria

### Design Acceptance (whole-game feel)

- A first-time player understands the first loop within 5 minutes (see FTUE script).
- AFK progress works naturally and stops at understandable bottlenecks.
- Earth trade is stable and predictable, with no price speculation.
- Colony growth clearly creates both more capacity and more obligations.
- New colony tiers require new processed materials, not just larger quantities of old ones.
- Shortages slow and pressure without harsh fail states.
- Transfer windows are visible and understandable from the system map.
- Automation feels like a major earned upgrade after early manual logistics.
- Shipbuilding feels like a meaningful transition away from Earth dependence.
- A desktop player can complete a full run end-to-end. (Mobile parity is a deferred later-phase goal, not a v1 acceptance criterion.)
- Prestige feels like reward, not reset-punishment.

### Build Acceptance (per stage)

Tracked per-slice in Stage 4. Each slice answers one design question and ships its acceptance test list with the slice.

## Risk Register

The five highest-risk *assumptions* in the design — distinct from the *decisions* in Open Questions. Each item names how we'd know the assumption is wrong and the phase that validates it. Phasing should front-load these, not save them for late-stage playtest.

| # | Assumption | How we'd know it's wrong | Validation phase |
|---|------------|--------------------------|------------------|
| 1 | Grid-placement adjacency is a meaningful active layer — players think about layout, not just placement-as-storage. | Testers place buildings anywhere; the +15% bonus is invisible in their decision-making; layout is solved in 5 minutes and never revisited. | **MLP** |
| 2 | Tier transitions register as a "moment," not a checklist completion. | Testers describe T0→T1 as "I hit the gate" not "the game opened up"; the new-region reveal lands as flat. | **MLP** |
| 3 | AFK return is satisfying, not anxious. | Testers report dread or frustration on return; the summary screen reads as a list of problems rather than a satisfying number. | **MLP** (overlap with Stage 3) |
| 4 | T7 is a plateau, not a chore — players want to stay 5–10h before incorporating. | Stage 4 slice 7 testers either prestige immediately on Declaration or quit before completing the milestone bundle. | **Stage 4 slice 7** |
| 5 | Charter pick produces "play differently" feel, not "math acceleration." | Stage 4 slice 7 testers describe their second run as "the same but with +25% ore"; layout and chain decisions don't shift between Charters. | **Stage 4 slice 7** |

If items 1–3 fail at MLP, the design pivots are large but cheap (we haven't built T2+ yet). If 4–5 fail at Stage 4 slice 7, the pivots are expensive — which is why MLP-stage validation matters: even though items 4–5 can't be fully tested until T7 exists, a strong signal at MLP that items 1–3 work raises confidence that 4–5 will too.

## Open Questions

These are deferred to playtest validation or late-game drill.

- **Grid range tuning per body type** (P0): Stage 3 playtest. NEA min/max, lunar habitat min/max, Mars min/max, etc.
- **Earth bailout existence** (post-prototype): whether soft-stuck states actually happen often enough in Stage 3 playtest to need a floor mechanic. May not exist at v1.
- **Carbon Mesh single-source bottleneck** (P2): does Carbonaceous Ore feeding both Textiles and Furnishings make T2 comfort tier fragile? Validate in playtest.
- **Aluminum demand scaling** (P2): input to Construction Materials, Glass Furnace, Furnishings Workshop. May need volume scaling on Lunar Surface Mines.
- **Research gating model** (P2): time-gated, resource-gated, or both? Affects Active Research Queue Cancel-refund behavior.
- **Build Drawer category filters** (P2): 5 categories vs. 4 broader.
- **Greenhouse vs. Hydroponics water consumption** (P2): placeholder makes water demand 16× pop drink rate. Tune in Stage 3.
- **Prestige carryover ratios** (P3): exact %s for research and recipe knowledge after Charter pick.
- **Charter catalog beyond v1 ~6–8** (P3): expansion territory.
- **Charter Shares formula** (P3): peak throughput × colony tier sum × unlocked recipes is the placeholder. Tune late.
- **Whether prestige reshuffles the solar system layout** (P3): novelty vs. mastery.
- **Sandbox-mode entry** (P3): free from start vs. unlocked after first prestige. Lean: free from start with a "scoreboard mode" toggle for prestige earners.
- **Combined-vs-specialized hull tuning** (P3): fixed mixed slots (R7) locked structurally; numeric tuning pending playtest signal that the mix feels right vs. a flat-penalty alternative.
- **Ship catalog T3+** (P3): long-range drives, exotic propulsion, specialist hulls (probe ships, builders). Drill alongside T3+ content.
- **NASA-industrial palette values** (P3): Stage 2.
- **First survey UI fidelity** (P3): region picker shape, focus model.
- **T3+ resource and recipe content** (P3): deferred until T0–T2 playtest.
- **Building catalog T0–T2 costs and prereqs** (P3): explicit costs/prereqs pass alongside grid-mechanic prototyping.
- **Per-building radius authoring** (post-prototype): the engine supports per-building collaboration radius but v1 ships with uniform 2-tile radius for all buildings. Variable radii become a content-balance lever once Stage 3 reveals how layout plays.
- **Audio:** no audio at v1. Visual NASA-industrial mood carries the tone alone. Audio is a post-v1 expansion candidate, not a Stage 2 deferral.

---

# Part II — UI Views

The navigable UX north star. Each destination is spec'd at sketch fidelity — Design Intent (job, use cases, success signals, anti-patterns), sections, content, **buttons & navigation** (every control with what it does and where it goes), states, and mobile adaptation. Visual styling and pixel-level chrome (hover states, exact icons, keyboard shortcuts beyond pause, animation timing) is Stage 2's job.

See Part I (Game Design) above for game scope, tier ladder, recipes, and ship catalog. See Part III (UX Flows) below for the cross-cutting journeys that span multiple screens (FTUE, AFK return, tier-up, etc.).

## Contents

1. [Global UI Rules](#global-ui-rules)
2. [Navigation Architecture](#navigation-architecture)
3. [Destination 1 — Map](#destination-1--map) (anchor)
4. [Destination 2 — Ops](#destination-2--ops) (daily check-in)
5. [Destination 3 — Production](#destination-3--production) (industry, formerly Industry)
6. [Destination 4 — Fleet](#destination-4--fleet)
7. [Destination 5 — Colonies](#destination-5--colonies)
8. [Destination 6 — Trade](#destination-6--trade) (light spec)
9. [Destination 7 — Research](#destination-7--research) (light spec)
10. [Destination 8 — Milestones](#destination-8--milestones) (light spec)
11. [Persistent Surfaces](#persistent-surfaces) (status bar, body sheet, alerts)
12. [Style Direction](#style-direction)
13. [Open Questions](#open-questions)

---

## Global UI Rules

- The game is menu-heavy and management-first; the orbital map is the emotional centerpiece.
- **One interaction language across form factors.** Desktop is the v1 target; mobile (deferred to a later phase) inherits the same selection model, detail surface, and nav. Only layout density adapts.
- Every view exposes: current state, bottleneck, next useful action, risk/warning when relevant.
- Primary actions are explicit buttons, icon buttons, toggles, sliders, segmented controls, or menus — never hidden gestures.
- All screens support AFK/incremental play by showing timers, rates, storage limits, stalled reasons.
- Economy UI uses fixed prices and predictable demand — never speculative graphs.
- **Per-body warehouse model** drives screen design: every body has one shared stockpile; buildings on a body all draw from it; routes go warehouse → ship → warehouse.
- **Confirm-vs-commit rule.** A confirmation dialog appears only when an action is **(irreversible) OR (single-action spend ≥ 25% of current credits) OR (single action affecting >100 units of a finished resource)**. Otherwise, single-tap commit. The third clause catches catastrophic high-wealth misclicks — selling 100 Furnishings prompts even when the player is rich. Irreversible actions: demolish building, accept prestige, abandon a stranded ship, sell-all-of-resource. The 25% rule scales with player wealth — a $3k Hauler-1 prompts when credits are $5k; the same purchase commits silently when credits are $200k.
- **No sub-minute urgency.** No alert/event has a time-pressure window tighter than ~5 minutes real time. Reading an alert at human pace must never change the outcome. There is no Pause control; the design must be readable at human speed (per the Failure Modes corollary in Part I).
- **No sim speed control.** Real-time gates pacing. Players cannot fast-forward production, transit, scans, or settle-in. AFK return is the catch-up surface.
- **Voice.** All system-facing text — alerts, AFK summaries, tier-up flavor, banners, build-complete notifications — uses **terse-corporate** voice. Sentence-case, numbers leading, verbs minimal, no NPC characters speaking. Examples: `First Habitat — O2 at 18%, importing recommended` / `T1 ready: Lunar Foothold available` / `Hauler-1 idle at Earth dock`. *Rationale: NPC-flavored voice reads charming the first time but grates after the player sees the same alert hundreds of times in an idle game; terse-corporate stays readable at high frequency.*

---

## Navigation Architecture

Eight destinations. Survey is a **mode of the Map**, not its own destination. Production replaces the old "Industry" name.

| # | Destination | Purpose | T0 use | T1+ use |
|---|-------------|---------|--------|---------|
| 1 | Map | Spatial overview, route planning, body detail entry | Heavy | Heavy |
| 2 | Ops | Alerts, AFK return, daily management hub | Heavy | Heavy |
| 3 | Production | Building chains, recipes, throughput | Heavy | Heavy |
| 4 | Fleet | Ship list, hangar, batch assignment | Medium | Heavy |
| 5 | Colonies | Habitat detail, life support, pop tier needs | None (locked) | Heavy |
| 6 | Trade | Earth buy/sell, Earth Prefab Kits, contracts | Heavy | Medium |
| 7 | Research | Tech tree across 4 branches | Light | Medium |
| 8 | Milestones | Tier ladder progress, prestige preview | Light | Medium |

### Desktop Layout

- **Top status bar** (persistent): credits, key resources, People Capacity, alert count, game time, settings.
- **Left rail** (persistent): all 8 destinations as labeled icons.
- **Center workspace**: the active destination's screen.
- **Bottom strip** (persistent on Map and Ops; collapsible elsewhere): active fleet activity, recent log entries.
- **Detail surface — bottom sheet**: appears when a body, ship, or route is selected. Drag to peek (~25%) / half (~55%) / full (~90%). Can be pinned open on desktop.

### Mobile Layout

*Deferred from v1; preserved as design intent for the mobile phase.*

- **Top sticky status bar** (compact): credits, fuel, alert count.
- **Bottom tab bar — 5 slots, reshuffles at T1.**
  - **At T0:** **Map / Ops / Production / Fleet / More**. Production is in the bar — early-game is a build-heavy active phase.
  - **At T1+:** **Map / Ops / Colonies / Fleet / More**. Colonies takes Production's slot once Lunar Foothold unlocks. Daily life-support emergencies are higher-frequency than chain optimization; the bar serves the daily/short-check-in axis.
- **"More" sheet contents.** At T0 = Colonies (locked with hint), Trade, Research, Milestones, Settings. At T1+ = Production, Trade, Research, Milestones, Settings.
- Detail surface: same bottom sheet (peek/half/full drag).
- The reshuffle is a one-shot transition on first reaching T1; the new layout persists. Visible nav-change tutorial nudge fires once at T1 unlock ("Colonies is now your daily check-in").

### Detail Surface vs. Full-Screen Rule

A bottom sheet is the universal detail surface: select-an-object surfaces detail in the sheet (mobile-compatible pattern preserved for the later mobile phase).

Full screens (push, not sheet) are reserved for **editor experiences** where the screen IS the workspace:
- Production chain editor (Production destination)
- Survey region picker (Map's Survey mode)
- Research tree (Research destination)
- Trade order book (Trade destination)
- Tier ladder visual (Milestones destination)

Heuristic: *if the destination is the editor, push a screen; if it's a detail of a selection, push a sheet.*

---

## Destination 1 — Map

### Design Intent

**Job:** Be the player's first answer to *"what's going on right now?"* — the canvas that holds every spatial decision, where every body-level action begins.

**Primary use cases:**
- Glance the network at a high level (where ships are, who's idle, which routes are running good windows).
- Select any body or ship as the entry point to deeper action.
- Plan and dispatch routes.
- Survey new regions and inspect candidate asteroids.

**Success signals:**
- A returning player locates the body they care about in <3 seconds.
- The map *feels alive* — ships move, route arcs pulse on good windows — without becoming visually noisy.
- Tap-to-select works reliably; selection state survives zoom and mode switches.

**Anti-patterns:**
- Becomes wallpaper the player avoids in favor of menus.
- Route arcs unreadable when many routes exist.
- Survey/Routes modes overlap so much that mode-switching feels redundant.

**Reached from:** Default landing screen on app open (after AFK Return modal if applicable). Always one tap away via left rail / bottom nav.

### Sections

1. **Map Mode Selector** (top-left, segmented control): `Default | Survey | Routes`.
2. **Orbital Canvas** (center, dominant): Earth, Moon, surveyed bodies, ships, route arcs.
3. **Body Detail Sheet** (bottom, dismissible): appears when a body or ship is tapped/selected.
4. **Mini Alert Sidebar** (left edge, collapsible on desktop; peek-sheet on mobile): top 3 alerts, tap to jump.
5. **Active Fleet Strip** (below map on desktop; second peek-sheet on mobile): live status of ships in transit.

### Content (T0–T2 examples)

**Default mode:**
- Earth (always visible, anchor)
- Moon (visible from start; route arc to Earth shown)
- Lunar Habitat (after T1 Prefab Kit lands; shown as a docked habitat icon)
- 1–6 NEA claims (named: NEA-04, NEA-12, etc.; each shows a tiny ore/ice/rare-trace indicator)
- Ships in transit shown as small triangles along route arcs
- Route arcs colored by current window: green (good), white (neutral), amber (poor)

**Survey mode:**
- Search regions overlaid on the canvas (Earth-NEA region, Mars approach corridor, etc.)
- Surveyed bodies marked with confidence percentages
- Probe Bay queue indicator (top of map)
- Tap unsurveyed region → opens Survey region picker (full screen)

**Routes mode:**
- Only route arcs and ships visible; bodies dimmed
- Each route arc shows: ship icon, ETA, fuel cost multiplier
- Tap route → route detail sheet (cargo, repeat, automation rules)

### Body Detail Sheet (the universal selection result)

When the player selects any body, the sheet shows:

**Header**
- Body name, type (Earth / Moon / NEA / Mars / Belt-Asteroid)
- Distance/window indicator vs. selected origin
- Action toolbar: `Build Here · Send Ship · Plan Route · Survey · Pin`

**Tabs (segmented, scrollable)** — 4 tabs total
- **Overview** — surveyed resources, body grid size, current pop (if colony), warehouse summary
- **Buildings** — grid view of buildings on this body with rates, stalled reasons, and adjacency bonus indicators (`Smelter · 4 metal/min · +15% from Mine adjacency · OK` / `Smelter · idle · output storage full`)
- **Storage** — full warehouse contents with caps, broken down by storage building (Silo/Tank/Cryo)
- **Activity** — ships currently docked here + active routes touching this body, merged ("what's moving in/out")

### Buttons & Navigation

**Map Mode Selector** (segmented control, top-left of canvas):
- `Default` — bodies + active routes (default view).
- `Survey` — survey regions become tappable overlays.
- `Routes` — bodies dim; route arcs become tappable.

**Mini Alert Sidebar** (left edge):
- Collapse/expand chevron toggle.
- Per alert card: tap card → opens the relevant Body Detail Sheet (or Production for chain stalls). Severity icon is informational only.

**Active Fleet Strip** (below canvas on desktop / peek-sheet on mobile):
- Per ship row: tap → opens Ship Detail Sheet.
- `Show all` link → navigates to **Fleet** destination.

**Body Detail Sheet** (opens on body tap — full spec under Persistent Surfaces).

**Route Detail Sheet** (opens in Routes mode on route tap):
- `Pause Route` / `Resume Route` toggle button.
- `Edit Route` button → opens Route Creation flow in edit mode.
- `Recall Ship` button → calls the ship back to its origin.
- Drag-down or `Close` (X) dismisses.

**Survey Region Picker** (full screen, opens from Survey-mode region tap):
- Region tiles tappable to focus.
- `Probe Focus` segmented control: `Composition` / `Orbit` / `Hazard`.
- Estimated scan time readout (informational).
- `Begin Scan` (primary CTA, bottom).
- `Cancel` / back arrow → returns to Map in Survey mode.

**Navigation out of Map:**
- Body Sheet `Build Here` → **Production** (scoped to selected body).
- Body Sheet `Send Ship` → Route Creation flow (selected body = origin).
- Body Sheet `Plan Route` → Route Creation flow (selected body = destination).
- Body Sheet `Survey` → Survey Region Picker.
- Body Sheet body-name link in storage/buildings → stays on Map but switches selection.
- Active Fleet `Show all` → **Fleet**.
- Alert card tap → varies by alert type (Body Sheet here on Map / **Colonies** for life support / **Production** for chain stalls).

### States

- **Empty (T0 cold open):** Earth + Moon + 1 staked NEA visible. No ships in transit. Tutorial nudge points at the NEA.
- **Loading (post-AFK):** brief spinner over canvas while catch-up resolves.
- **Normal:** typical operations view.
- **Problem:** bodies with critical alerts pulse red; alert sidebar shows count.
- **Disconnected:** if account/cloud sync fails, banner at top — game continues offline.

### Mobile Adaptation

*Deferred from v1; preserved as design intent for the mobile phase.*

- Top status bar compresses to 3 fields (credits, fuel, alerts). Tap expands to full status drawer.
- Mode selector is a segmented control above the canvas.
- Alert sidebar becomes a left-edge peek sheet — drag right to expand.
- Active fleet strip becomes a bottom-edge peek sheet (between map and bottom tab bar).
- Body sheet drag handles are larger (touch targets ≥44px).
- Pinch zoom and pan; tap-and-hold-<120ms = select; longer hold = context menu.

---

## Destination 2 — Ops

### Design Intent

**Job:** Be the 90-second-check-in screen. A hurried player should be able to keep their operation healthy from this view alone.

**Primary use cases:**
- Skim and resolve critical alerts.
- Read the AFK Return summary on first load after time away.
- Assign idle ships to obvious routes in one tap.
- Trigger emergency imports (oxygen, water, fuel) without leaving Ops.

**Success signals:**
- A player who only ever opens Ops can survive — they may not optimize, but they don't lose progress.
- Top issue is always actionable from here directly, with no required jump to another screen.
- Alerts clear immediately and reliably the moment they're resolved.

**Anti-patterns:**
- Becomes a list-of-everything noise dump.
- Primary actions require drilling to a different screen to actually execute.
- Alerts persist visually after being addressed, training learned helplessness.

**Reached from:** Left rail / bottom nav. After AFK Return modal dismisses, if there are unresolved alerts the modal can deep-link here.

### Sections

1. **Critical Alerts** (top, hero) — at most 3 cards, each with: alert type, body affected, severity icon, primary action button, "Jump to source" link.
2. **AFK Return Summary** (visible only if relevant — typically right after returning) — collapsible card with what happened, what stopped, net resource delta.
3. **Idle Ships** — ships currently with no assignment.
4. **Production Hot List** — 3–5 buildings with the largest stalls or most output.
5. **Resource Bottlenecks** — resources at >85% storage cap or <15% reserve (whichever signals).
6. **Active Routes** — short summary, tap to expand.
7. **Top Action Button** — sticky at bottom: "Resolve top issue."

### Content (T0–T2 examples)

**Critical Alerts:**
- `First Habitat · O2 at 18% · 1.7h reserve · [Import 50 from Earth] [Build Electrolyzer]`
- `Hauler-1 idle at Earth dock · [Auto-assign to NEA-04 → Earth]`
- `NEA-04 storage at cap · Refined Metal full · [Add Hauler] [Sell direct] [Expand storage]`

**AFK Return Summary** (after 4h away):
- Ore mined: +480
- Metals refined: +192
- Sold to Earth: 4 deliveries, +$2,304
- Stalled at: NEA-04 storage full (1h 42m of 4h)
- Top fix: `[Add second Hauler]`

**Idle Ships:** `Hauler-2 · Earth · idle 12m · [Auto-assign] [Manual assign]`

**Production Hot List:**
- `Smelter (NEA-04) · 4.0 metal/min · ok`
- `Lunar Mine (Moon) · idle · no power · [Investigate]`
- `Electrolyzer (Moon) · 1.5 fuel/min · input low`

**Bottlenecks:**
- `Refined Metal (NEA-04) · 118/120 · 98% — sell or expand`
- `Water Ice (Moon) · 8/200 · 4% — risk to life support in ~22m`

**Routes summary:** `3 active · 0 paused · Avg fuel 1.05× · ETA next: 8m 20s`

### Buttons & Navigation

**Critical Alerts** (top hero section, max 3 cards visible):
- Per alert card:
  - Severity icon (informational, not interactive).
  - Alert title and body.
  - **Primary action button** (label varies by alert type — `Import 50 Oxygen` / `Auto-assign to NEA-04` / `Add Hauler` / etc.). Tapping resolves the alert in-place when possible, or deep-links with state pre-filled.
  - `Jump to source` chevron link (right side) — same action as primary if no in-place fix exists.
  - Whole card is also tappable (acts as `Jump to source`).
- `View all (N)` expandable link below the cards if more alerts exist.

**AFK Return Summary card** (visible after returning from ≥60s away):
- Collapsed: header tappable to expand.
- Expanded: detail rows + sticky `Resolve top issue` button (deep-links to worst stall).
- `Dismiss` (X icon top-right) — closes the card for this session; remains accessible via Alert Log.

**Idle Ships section:**
- Per ship row:
  - Ship name + status icon (informational).
  - `Auto-assign` button — system picks highest-value idle route and dispatches.
  - `Manual assign` link → opens Route Creation flow with ship pre-bound.

**Production Hot List section:**
- Per building row: tap → navigates to **Production** with the building's body selected and chain auto-scrolled to the building.

**Resource Bottlenecks section:**
- Per resource row: tap → navigates to **Production** with body selected and resource highlighted in chain.

**Active Routes summary:**
- 1-line summary readout (informational).
- `View all` link → navigates to **Map** in Routes mode.

**Sticky bottom CTA** (above bottom nav on mobile, fixed on desktop):
- `Resolve top issue` button — deep-links to the worst stall.
- Empty state: `All systems nominal — Start new objective?` (links to **Milestones**).

**Navigation out of Ops:**
- Alert primary button → in-place resolution OR deep-link (Trade for imports, Production for builds, Fleet for ships, Colonies for life support).
- Production Hot List / Bottleneck row → **Production** (body and resource pre-selected).
- Idle ship `Manual assign` → Route Creation flow.
- Active Routes `View all` → **Map** (Routes mode).
- Sticky CTA → varies by current top issue.

### States

- **No alerts, all healthy:** "All systems nominal" hero, links to plan-something prompts (claim a new NEA, queue research).
- **Many alerts (>3):** show top 3 + "View all (N)" expandable.
- **Post-AFK:** Return summary at top, alerts below.
- **Tier-up pending:** banner above alerts: "T1 ready — Lunar Foothold can be claimed [Open Milestones]."

### Mobile Adaptation

*Deferred from v1; preserved as design intent for the mobile phase.*

- This screen is **mobile-first** in feel — vertical card stack.
- Cards full-width, tappable as units.
- Sticky "Resolve top issue" button stays above bottom nav.
- AFK Return summary takes full-screen modal on first open after long absence (see Part III — AFK Return).

---

## Destination 3 — Production

### Design Intent

**Job:** Be the chain-design and build-placement workspace — where players go when they're *optimizing*, not reacting. The "I have time to plan" home.

**Primary use cases:**
- See an entire body's chain end-to-end at a glance.
- Identify and diagnose chain stalls — which input is starving which building.
- Place new buildings via the Build Drawer.
- Configure automation rules (T3+).
- Allocate People Capacity (T1+, when capacity becomes finite).

**Success signals:**
- A stalled chain is visible without inspection — the chain view tells the player which edge is broken.
- The Build Drawer feels like browsing a recipe book, not consulting a tech tree.
- Adding a building is a 3-tap operation in the typical case.

**Anti-patterns:**
- Requires the player to mentally simulate flow to spot bottlenecks.
- Doesn't scale past ~20 buildings on a body without becoming unreadable.
- Build Drawer hides recipes behind unclear or unexplained gates.

**Reached from:** Left rail / bottom nav. Also deep-link from Body Detail Sheet ("Build Here" jumps to Production scoped to that body) and from Ops alerts ("Build to fix").

### Sections

1. **Body Selector** (top) — segmented or dropdown of bodies the player has buildings on (or could build on). Each body's Production view is independent.
2. **Grid Workspace** (main area, dominant) — the body's placement grid (size revealed at survey, e.g., 4×4 / 5×5 / 7×7). Buildings sit on tiles; empty tiles are tappable to place. **Placement preview visualizes the collaboration-radius boundary** (default 2 tiles per R69) — when the player picks a candidate building from the Build Drawer and hovers/drags over an empty tile, the radius footprint highlights so the player can see which neighbors will pair with the new building before committing. Adjacency bonuses are visualized on hover/tap of placed buildings (highlighted neighbors with bonus value). **Storage buildings (Silo / Tank / Cryo Tank) are neutral** — they don't grant or receive adjacency bonuses; their radius preview is skipped accordingly (R70). This is the *primary* work surface — Production is a workspace, not a browser.
3. **Chain View** (collapsible side panel or toggle) — secondary diagnostic view: inputs → buildings → outputs as a graph. Useful for tracing stalls; not the primary surface.
4. **Building List** (right/below) — tabular list of buildings on this body with rates, status, and inline controls. Synced with grid selection (tap a grid tile → row highlights).
5. **Storage Panel** (right or as a tab) — current warehouse stock with caps, broken down by storage building (Silo / Tank / Cryo).
6. **Build Drawer** (slide-up sheet) — opens when the player taps an empty grid tile or `+ Add Building`. Lists available buildings for this body type, gated by tier.
7. **Automation Rules** (T3+ only) — rules per building or per resource (maintain-stock, surplus-export, prefer-good-windows).

### Content (T0–T2 examples)

**Chain View** (NEA-04 selected, T0):
```
[Small Mine ×2]  →  Iron Ore (84/300)  →  [Smelter ×1]  →  Refined Metal (38/120)
[Ice Mine ×1]    →  Water Ice (12/100)
```

Each node:
- Building name, count
- Resource shows current/cap
- Edges colored: green (flowing), amber (slow), red (stalled)

**Building List** (NEA-04, T0):
| Building | Rate | Status | Controls |
|----------|------|--------|----------|
| Small Mine #1 | 20 ore/min | OK | `Pause · Demolish` |
| Small Mine #2 | 20 ore/min | OK | `Pause · Demolish` |
| Smelter #1 | 8 metal/min | OK | `Pause · Demolish` |

**Storage Panel** (NEA-04, T0):
- Iron Ore: 84/300 (28%)
- Refined Metal: 38/120 (32%)
- Hydrogen Fuel: — (no Electrolyzer here)

**Build Drawer** (NEA-04, T0):
- Available now: Small Mine ($800, 1 slot), Smelter ($1,500, 1 slot, +15% with a Mine in radius), Ice Mine ($900, 1 slot), Electrolyzer ($1,200, 1 slot, +10% with an Ice Mine in radius), Silo ($600, +300 solid cap, neutral — no adjacency), Tank ($500, +180 fluid cap, neutral — no adjacency)
- Locked behind tier: Lunar Surface Mine (T1), NEA Mine variants (T2), Glass Furnace (T2), Cryo Tank (T2)…
- Each card: cost, grid footprint, prerequisites, output preview, adjacency hint. **Building is instant** on commit — no wall-time.

### Buttons & Navigation

**Body Selector** (top of screen):
- Desktop: dropdown with all bodies the player has buildings on or could build on.
- Mobile: horizontal scrolling chip rail.
- Each entry tappable → switches Production scope (stays on Production).

**`+ Add Building` CTA** (top-right of Building List, or floating on mobile):
- Opens Build Drawer (slide-up sheet).

**Grid Workspace** (main work surface):
- Tap an empty tile → opens Build Drawer scoped to that tile.
- Tap a placed building → opens reasoning panel: rate breakdown, current adjacency bonuses, stall reason (if any). Same panel hosts `Pause` / `Demolish` controls.
- Hover/long-press a building → highlights neighbors within the collaboration radius and shows the bonus each grants ("+15% from Smelter at radius 1").
- Drag a building (T2+) → relocate it to another empty tile in the same body. Costs a small fee; preserves cumulative output stats.

**Chain View** (collapsible side panel):
- Tap a building node → opens the same reasoning panel as the grid.
- Tap a resource node → highlights all buildings consuming/producing it on the grid.
- Tap an edge (flow arrow) → opens reasoning panel for that flow (why is it green/amber/red).

**Building List** (right panel or below chain on mobile):
- Per row:
  - `Pause` / `Resume` toggle button.
  - `Demolish` button → opens Confirm Demolish modal (`Confirm` / `Cancel`).
- Row tappable → expands inline detail (cycle time, total output, people cost).

**Build Drawer** (slide-up sheet):
- Category filter chips: `All` / `Mining` / `Refining` / `Storage` / `Life Support` / `Construction`.
- Per recipe card:
  - Cost, grid footprint (1 slot at v1), prereq summary, output preview, adjacency hint (e.g., "+15% with a Mine in collaboration radius"). Storage cards omit the adjacency line (R70 — storage is neutral).
  - `Build` CTA (primary). Building is **instant on commit** — no wall-time. Disabled when prereqs unmet (or when no empty grid slots available), with hint text below.
- Drag-down or backdrop tap dismisses; `Cancel` button at bottom.

**Storage Panel** (right tab on desktop, peek-sheet on mobile):
- Per resource row: tap → focuses chain view on that resource (highlights producers and consumers).
- `Expand` / `Collapse` chevron per row for input/output detail.

**Automation Rules Panel** (T3+ only):
- `+ Add Rule` button → opens Rule Builder modal.
- Per rule: `Edit` / `Delete` buttons.

**People Capacity Allocation** (T1+ inline header bar):
- Per-recipe slider or numeric input that allocates People Capacity to that building.
- `Auto-distribute` button — system spreads capacity evenly.

**Navigation out of Production:**
- Body selector → switches scope (stays on Production).
- Storage row tap → focuses chain (stays on Production).
- Reasoning panel `Jump to Ops alert` (when stall has matching alert) → **Ops**.
- Building's resource source link (e.g., "needs Iron Ore from NEA-04") → **Map** with NEA-04 selected.
- Recipe card unlock hint `Unlocks at T2` → **Milestones**.

### States

- **Empty body:** "No buildings yet. Tap + to start." with hint about what's typical for body type.
- **Healthy chain:** all edges green.
- **Stalled chain:** at least one edge red; chain view auto-scrolls to highlight stall.
- **Capacity-limited (T1+):** "People Capacity 24/24 used — assign or expand."
- **Tier locked:** drawer shows blurred recipes with tier-gate text ("Unlocks at T2 — NEA Industry").

### Mobile Adaptation

*Deferred from v1; preserved as design intent for the mobile phase.*

- Body selector is a horizontal scrolling chip rail at top.
- Chain view is the dominant section; building list collapses behind a tab toggle.
- Build Drawer is a full-height bottom sheet with snap points.
- Storage panel is a peek-sheet from the right edge.

---

## Destination 4 — Fleet

### Design Intent

**Job:** Be the ship management table. Routes live on the Map; this is where the player thinks about *ships* — finding them, comparing them, batch-managing them.

**Primary use cases:**
- Find a specific ship (by name, status, or class).
- Reassign a route directly from the ship row.
- Compare hull stats before buying a new ship.
- Batch-recall multiple ships during emergencies.

**Success signals:**
- Idle ships are immediately obvious without filtering.
- Finding a specific ship by name is fast (<2 seconds at any fleet size).
- Hull stats are comparable side-by-side in the Buy Ship modal.

**Anti-patterns:**
- Duplicates Map's route information without adding management leverage.
- Multi-select is hidden or finicky to enter.
- Ship details require modal-on-modal stacking.

**Reached from:** Left rail / bottom nav. Also from Body Sheet ("Send Ship") and Ops idle-ship cards.

### Sections

1. **Ship Hangar Summary** (top) — count of owned ships by family (specialized solid / fluid / combined / specialist).
2. **Ship List** (main area) — tabular list with sort/filter.
3. **Ship Detail Sheet** (bottom sheet on selection) — full ship inspection.
4. **Buy Ship** (CTA top-right) — opens a Trade-flow modal for purchasing.

### Content (T0–T2 examples)

**Ship List columns:**
- Name (Hauler-1, Mixer-1, etc.)
- Family icon (specialized solid / fluid / combined)
- Slots (e.g., "30 solid", "20s + 10f", "25 fluid")
- Status (Idle / Loading / In Transit / Unloading / Maintenance)
- Assignment (route description or "—")
- ETA / Last activity
- Inline action: `Reassign · Pause · Recall`

**Ship Detail Sheet:**
- Hull spec block (capacity, speed, fuel/route, Earth buy price for replacement reference)
- Current cargo manifest (live, updates with route progress)
- Route history (last 10 trips with cargo + fuel cost)
- Maintenance bar (placeholder: not in v1, deferred)

**Buy Ship Modal:**
- Each owned-eligible hull (gated by current tier)
- Side-by-side: hull stats, current owned count, buy CTA
- Cost confirmation, delivery time (placeholder: instant at v1)

### Buttons & Navigation

**Header bar:**
- Hangar Summary readout (counts by family — informational).
- `Buy Ship` CTA → opens Buy Ship modal.

**Filter Bar** (above list):
- Status filter dropdown: `All` / `Idle` / `In Transit` / `Loading` / `Unloading` / `Maintenance` (deferred).
- Family filter dropdown: `All` / `Specialized Solid` / `Specialized Fluid` / `Combined` / `Specialist` (deferred).
- Sort dropdown: `Name` / `Status` / `Capacity` / `ETA`.
- Sort direction toggle (`↑` / `↓`).

**Ship Row** (single-select default):
- Whole row tappable → opens Ship Detail Sheet.
- Inline buttons (right side of row, visible on hover/desktop, always-visible compact on mobile):
  - `Reassign` → opens Route Creation flow with ship pre-bound.
  - `Recall` → calls ship back to last-known dock body.

**Multi-Select Mode:**
- Mobile: long-press any row enters multi-select.
- Desktop: **shift-click any row** enters multi-select (matches mobile pattern in spirit; uses keyboard modifier for desktop).
- Selected count appears at top: `3 selected`.
- Batch action buttons appear in a sticky bar:
  - `Reassign` (batch route assignment).
  - `Recall` (batch recall).
  - `Pause` (placeholder for future maintenance scheduling).
- `Cancel` (X) exits multi-select.

**Ship Detail Sheet** (opens on row tap):
- Hull spec block (read-only).
- Live cargo manifest.
- Route history list (last 10 trips).
- Action toolbar:
  - `Reassign Route` → Route Creation flow.
  - `Recall` → calls back.
  - `Send to Maintenance` (deferred — disabled with tooltip "T3+").
- Drag-down or `Close` (X) dismisses.

**Buy Ship Modal:**
- Per hull card: spec block, owned count, `Buy` CTA.
- `Buy` confirmation popover (per global confirm rule): shows credit deduction, delivery (instant at v1), `Confirm` / `Cancel`. Skipped on small purchases that don't trip the rule.
- `Compare` toggle → switches to side-by-side comparison view of selected hulls.
- `Close` (X) dismisses.

**Navigation out of Fleet:**
- `Reassign` (single or batch) → Route Creation flow → returns to Fleet on confirm.
- `Buy Ship` → Buy Ship modal in-place; or deep-link from Ops alert returns to Ops on confirm.
- Ship Detail action `Send to Maintenance` → deferred; no v1 destination.

### States

- **Empty (T0 cold open):** 1 Hauler-1 + 1 Probe. List shows them.
- **All idle:** banner "N ships idle — auto-assign to top opportunity?"
- **Maintenance pending (deferred):** placeholder, no v1 content.

### Mobile Adaptation

*Deferred from v1; preserved as design intent for the mobile phase.*

- Ship list rows compress: name, status icon, ETA only.
- Tap row expands inline (no separate sheet for shallow detail).
- Long-press row enters multi-select mode (matches gestures elsewhere).
- "Buy Ship" is a sticky bottom CTA.

---

## Destination 5 — Colonies

### Design Intent

**Job:** Be the pop-and-life-support workspace. The screen the player checks daily once habitats exist — where colony health is read, advanced, and recovered.

**Primary use cases:**
- Check life support reserves at a glance.
- Track progress toward the next pop tier (growth-tier bundle delivery).
- Diagnose shortage causes — "why is oxygen draining?"
- Trigger emergency imports for critical reserves.

**Success signals:**
- Pop-tier progress is the visual hero — the player can answer "what unlocks next?" in <5 seconds.
- Shortages are surfaced *before* they're critical (warning at <25%, not 0%).
- The growth-tier bundle communicates "go produce X more, then come back."

**Anti-patterns:**
- Becomes a debugging tool for "what is eating my water."
- Growth-tier bundle is hidden behind tabs or scrolling.
- Suspended-pop state feels permanent rather than recoverable.

**Reached from:** Left rail / bottom nav (visible but disabled at T0 with hint text). At T1+, also from Map (tap habitat) and Ops alerts.

### Sections

1. **Colony List** (top or left rail-within-screen) — all habitats the player operates.
2. **Selected Colony Detail** (main area) — population, life support, growth tier checklist, buildings nested.
3. **Pop Tier Visual** (compact sidebar or overlay) — current tier with checkmarks for met/unmet needs.
4. **Life Support Bars** (always-visible inside detail) — water / oxygen / food with reserve hours.
5. **Growth-Tier Bundle Tracker** — items the player needs to deliver to advance.

### Content (T0–T2 examples)

**Colony List entry (when first habitat exists):**
- "Lunar Foothold" · Pop 32 / Cap 50 · Tier: Survival · `12% O2 reserve risk`

**Selected Colony Detail (Lunar Foothold, T1, post-Prefab):**
- Population: 32 (capacity 50 from 1 Habitat Module)
- People Capacity: 32 (1:1 with pop at T1)
- Pop tier: **Survival** (next: Settled)
- Continuous needs:
  - Water: 87% (8.4h reserve at current pop)
  - Oxygen: 18% (1.7h reserve — *low*)
  - Food Pack: 64% (5.1h reserve)
- Growth-tier bundle for Settled (one-time):
  - Construction Materials: 3 / 8
  - Habitat Module: 0 / 2
- Suggested fix: `[Import 30 Oxygen now]`

**Pop Tier Visual:**
```
Survival ✓  →  Settled ◐ (4/10 inputs)  →  Growing ○  →  Comfortable ○  →  Affluent ○
```

**Buildings on this colony:** (nested expandable list — same shape as Production's building list)

### Buttons & Navigation

**Colony List** (top of screen):
- Each colony chip: tap → switches selected colony.
- `+` button (when player has Earth Prefab Kits available) → opens Trade scrolled to Prefab Kits tab.

**Selected Colony Detail — header actions:**
- `Build Building Here` → navigates to **Production** scoped to this colony.
- `Inspect Habitat Layout` (informational only at v1; opens 3D viewer if Three.js enabled).

**Life Support Bars** (per resource: water / oxygen / food):
- Bar is informational. Right-side action button:
  - `Import N` button when reserves are pinched (<25%) → deep-links to **Trade** with prefilled order quantity.

**Pop-Tier Visual** (compact):
- Each tier marker tappable → opens popover (or full sheet on mobile) showing requirements and current progress.

**Growth-Tier Bundle Tracker:**
- Per item row:
  - Item name + progress bar (informational).
  - `Send to colony` link (when item is produced elsewhere) → opens Route Creation flow with this colony as destination.
- `Claim` button (visible only when all items met) → opens Confirm Tier-Up modal (`Confirm` consumes bundle + advances pop tier; `Cancel`).

**Buildings list** (nested):
- Same controls as Production's building list (`Pause` / `Resume` / `Demolish`).

**Footer actions** (rare-use, in a `…` menu on mobile):
- `Pause Growth` button → opens confirmation modal (emergency action).
- `Resume Growth` (when paused) → confirmation.

**Navigation out of Colonies:**
- `Build Building Here` → **Production** (scoped here).
- `Import N` on a life support bar → **Trade** (prefilled).
- `Send to colony` on bundle item → Route Creation flow.
- Inspect-shortage tap on a pinched bar → **Production** (resource highlighted).
- Pop-tier marker → stays in Colonies (popover/sheet).
- `+` colony → **Trade** (Prefab Kits).

### States

- **Locked (T0):** screen shows "Unlocks at T1 — Lunar Foothold tier" with progress hint (200 Refined Metal sold + 50 Hydrogen Fuel reserves).
- **Healthy:** all bars green, pop growing, growth-tier checklist progressing.
- **Pinched:** at least one need <25%; pulses amber.
- **Critical:** any need at 0%; pop suspension warning timer visible.
- **Suspended:** habitat displays frozen state; pop displayed as "Suspended (resume by restoring inputs)."

### Mobile Adaptation

*Deferred from v1; preserved as design intent for the mobile phase.*

- Colony list is a horizontal chip rail at top (most players have 1–3 colonies through T2).
- Detail body fills the rest of the screen.
- Pop tier visual collapses to a single row above the life support bars.
- Growth-tier bundle is a card with a fill bar; tap to expand item-by-item.

---

## Destination 6 — Trade

### Design Intent

**Job:** Be the Earth-side market interface. Where the player buys what they can't yet make, sells what they have to spare, and deploys Earth Prefab Kits to bootstrap new bodies.

**Primary use cases:**
- Emergency life-support imports (oxygen, water, food) when a colony is pinched.
- Bulk sell of stockpiled goods (metals, ore) to convert to credits.
- Buy new ships.
- Buy and deploy Earth Prefab Kits at tier-up moments.

**Success signals:**
- Order completion is 1–2 taps from intent to confirmation.
- ROI on every potential order is obvious — the player isn't doing math in their head.
- Prefab Kits feel like a moment, not a buried row in a table.

**Anti-patterns:**
- Feels like a banking app rather than a market.
- Prices shown without context ("am I making money? losing money?").
- Order placement requires modal-on-modal-on-confirmation.

**Light spec below.** Earth-side market, Earth Prefab Kits, contract list.

**Reached from:** Left rail / More sheet. Also deep-link from Ops "Import from Earth" actions and Buy Ship CTA.

### Sections (sketch)

1. **Earth Market** — fixed buy/sell prices for unlocked resources; buy/sell order entry.
2. **Earth Prefab Kits** — one-time prefab purchases (first habitat, first lunar mine, first Mars foothold). Tier-gated and quantity-limited per run.
3. **Contracts** (post-event) — accept/decline list; deliveries tied to events.
4. **Account** — credits, recent transactions log.

### Content (T0–T2 examples)

**Earth Market table:**
| Resource | Earth Buy | Earth Sell | Owned | Last 24h Net |
|----------|----------:|-----------:|------:|-------------:|
| Iron Ore | 3 | 1 | 84 | +480 |
| Refined Metal | 18 | 12 | 38 | +192 sold |
| Water Ice | 4 | 2 | 12 | — |
| Hydrogen Fuel | 8 | 5 | 120 | — |
| Oxygen | 6 | 3 | 30 | -2 sold |

**Earth Prefab Kits (T1 unlock):**
- Lunar Habitat Module Kit · $8,000 · 1 of 1 available · `[Buy and Drop on Moon]`
- Lunar Surface Mine Kit · $3,500 · 1 of 1 available · `[Buy and Drop on Moon]`

### Buttons & Navigation

**Tab Strip** (top of screen):
- `Earth Market` / `Earth Prefab Kits` / `Contracts` / `Account` segmented tabs.

**Earth Market (table view):**
- Per resource row:
  - Quantity input (numeric stepper with `−` / `+` buttons or typed entry).
  - `Buy` button (uses input qty).
  - `Sell` button (uses input qty).
  - Both buttons disabled when input qty exceeds available (sell) or affordable (buy).
- Confirmation popover (per global confirm rule — fires when spend ≥ 25% of current credits): `Confirm` / `Cancel`.

**Earth Prefab Kits:**
- Per kit card:
  - Cost, "1 of 1 available" indicator.
  - `Buy and Drop` CTA → opens Delivery Target Picker.
- Delivery Target Picker (modal): list of eligible bodies; tap a body → `Confirm Delivery` / `Cancel`.

**Contracts:**
- Per contract row: title, deliverable, deadline, reward.
- `Accept` button → adds contract to active list.
- `Decline` button → dismisses.

**Account section:**
- Recent transactions list (read-only).
- Credits balance display.
- `Export Save` button (links to Settings → Saves).

**Navigation out of Trade:**
- `Buy and Drop` → after confirm, returns to **Map** with the new body's deployment animated.
- `Buy` / `Sell` order confirm → returns to invoking screen if reached via deep-link (Ops alert or Colonies); stays on Trade otherwise.
- `Buy Ship` flow (when reached from Fleet) → returns to **Fleet**.

---

## Destination 7 — Research

### Design Intent

**Job:** Be the strategic-upgrade home. Where the player commits to long-term direction with infrequent, weighty decisions.

**Primary use cases:**
- Queue the next research node to unlock a known bottleneck-relief.
- Review the tree to plan a multi-step strategy.
- Understand prerequisite chains for late-game targets.

**Success signals:**
- The tree's branches communicate strategic identity (Logistics vs. Industry vs. Life Support vs. Exploration).
- A casual player gets value from queuing one node; a strategic player gets value from planning ten.
- ETAs are honest — research time matches what the queue says.

**Anti-patterns:**
- Tree is unreadable at full size; users zoom rather than scan.
- Node prerequisites require multiple taps to surface.
- "Best path" is so obvious that the tree becomes a one-time exercise rather than ongoing strategy.

**Light spec below.** Tech tree across 4 branches: Logistics / Industry / Life Support / Exploration.

**Reached from:** Left rail / More sheet. Also from Milestones when a tier-up unlocks new research.

### Sections (sketch)

1. **Branch Tabs** — Logistics / Industry / Life Support / Exploration.
2. **Tree Visual** — node graph with prerequisites, completed nodes, in-progress, locked.
3. **Active Research Queue** — what's currently researching with ETA.
4. **Node Detail** — on click: cost, prereqs, what unlocks, time.

### Content target

~40 nodes total at full game; ~8 reachable by T2.

### Buttons & Navigation

**Branch Tabs** (top, segmented):
- `Logistics` / `Industry` / `Life Support` / `Exploration`.

**Tree Visual** (main area):
- Each node tappable → opens Node Detail panel (sheet on mobile, side-panel on desktop).
- Visual states (informational): locked / available / in progress / complete.
- Pinch zoom and drag pan; `Reset View` button (top-right) re-centers tree on player's progress.

**Active Research Queue** (sidebar / drawer):
- Per queued node:
  - Node name + time remaining.
  - `Cancel` button (refunds partial resources / time-gating cost — exact rule pending Open Question).

**Node Detail Panel:**
- Read-only: cost, prereqs, what it unlocks, time.
- `Start Research` button — adds node to queue. Disabled when prereqs unmet (with hint).
- Each prereq is a tappable link → focuses tree on that prereq node.
- Each "what it unlocks" item is a tappable link → varies (new recipe → **Production**; new ship → **Trade**; new region → **Map**).

**Navigation out of Research:**
- Prereq link → focuses tree (stays on Research).
- "What it unlocks" link → varies by unlock type.
- Reached-from **Milestones** tier-up: returns to **Milestones** on dismiss.

### Open question

Is research time-gated (research takes wall time), resource-gated (consumes resources to unlock), or both? Decision pending; affects what controls show in Active Research Queue.

---

## Destination 8 — Milestones

### Design Intent

**Job:** Be the tier-progression home and prestige-loop entry point. Where the player sees how far they've come, what unlocks next, and eventually how to incorporate.

**Primary use cases:**
- Check tier gate progress (concrete progress bars on each gate condition).
- Claim a tier-up when ready.
- Preview prestige (T7+) and decide whether to incorporate.

**Success signals:**
- Every visit answers "what's the very next thing that unlocks?" in <5 seconds.
- Gate conditions tie cleanly back to actionable goals on other screens (tap a gate → jump to where you'd act on it).
- The prestige preview makes carryover concrete and motivating.

**Anti-patterns:**
- Becomes a passive stats screen the player ignores.
- Gate progress doesn't link forward — player has to figure out where to act.
- Prestige feels like punishment (loss of progress) rather than reward (carryover gain).

**Light spec below.** Tier ladder progress and prestige preview.

**Reached from:** Left rail / More sheet. Also from Ops banner when tier-up is ready.

### Sections (sketch)

1. **Tier Ladder Visual** — horizontal/vertical strip of T0 → T7, current tier highlighted.
2. **Current Tier Detail** — what's unlocked, what completed milestones look like.
3. **Next-Tier Gate** — concrete progress bars on each gate condition (e.g., "Sell 200 Refined Metal" → 124/200; "Hydrogen Fuel reserves" → 38/50).
4. **Prestige Preview** (T7-only) — Charter Shares earned at this point, what carries over, "Incorporate" CTA.

### Content (T0–T2 examples)

**Current Tier:** T0 — Wildcatter

**Next Tier Gate (T0 → T1 Lunar Foothold):**
- Sell 200 Refined Metal to Earth: **124 / 200** (62%)
- Hydrogen Fuel reserves: **38 / 50** (76%)

**Completed milestones:**
- ✓ First survey (NEA-04)
- ✓ First mine built
- ✓ First refined metal sold

### Buttons & Navigation

**Tier Ladder Visual** (top of screen):
- Each tier marker tappable → scrolls or jumps to that tier's detail (stays on Milestones).
- Visual states (informational): complete / current / locked.

**Current Tier Detail** (read-only block):
- Lists unlocked recipes, hulls, regions for the current tier.
- Each unlocked item tappable → links to where to use it (e.g., a recipe → **Production** Build Drawer with that recipe pre-selected).

**Next-Tier Gate** (per-condition list):
- Per condition row:
  - Title + progress bar (informational).
  - Tap row → deep-links to the screen where the player can act (e.g., "Sell 200 Refined Metal" → **Trade** with metal sell row prefilled; "First habitat reaches Pop 50" → **Colonies**).
- `Claim [Tier Name]` primary CTA (visible only when all gates met) → opens Tier-Up Modal.

**Tier-Up Modal** (full-screen on claim):
- Tier name + flavor text.
- Bullet list of newly unlocked items.
- `Begin` CTA (single primary) → dismisses to **Map** with the new region animated/highlighted.

**Prestige Preview** (T7+ only):
- Charter Shares calculation breakdown (read-only).
- **Charter gallery** — 6–8 hand-authored Charters as picker cards (Mining Charter, Tanker Charter, Logistics Charter, Frontier Charter, Settler Charter, +reserved). Each card shows the modifier set. Player must select one before Incorporate.
- Carryover preview list (modest %: research, recipe knowledge, starter kit options). What's not carried: ships, money, populations, surveyed asteroids, body grid rolls.
- `Incorporate` primary CTA → opens Prestige Incorporation flow (see Part III — Prestige Incorporation). Disabled until a Charter is picked.

**Navigation out of Milestones:**
- Gate condition tap → varies (Trade, Production, Colonies, Fleet).
- Unlocked-item link in Current Tier Detail → varies.
- `Claim` → Tier-Up Modal → **Map**.
- `Incorporate` → Prestige flow → new run.

### Open questions

- Tier-up ceremony shape (modal? cinematic moment?). See Part III — Tier-Up flow.
- Whether prestige reshuffles solar layout. Affects prestige preview content.

---

## Persistent Surfaces

Three surfaces appear across multiple destinations and need their own spec. They aren't destinations, so they don't have Design Intent blocks — their job is to be invisible until needed.

### Top Status Bar (always visible)

**Desktop fields (left → right):**
- Credits readout.
- Key resources: Refined Metal, Hydrogen Fuel, Water Ice, Oxygen (context-prioritized — order can shift based on current concerns).
- People Capacity (T1+).
- Alert count badge.
- Game time readout.
- Settings cog icon.

*No Sim Speed control, no Pause button.* Real-time gates pacing. Game time advances continuously while the app is open; AFK return handles catch-up.

**Mobile fields (compressed):**
- Credits, fuel, alert count.
- Tap any field → expands full status drawer (full status bar fields visible in a sheet).

**Buttons & Navigation:**
- Credits readout: tap → opens recent-transactions popover.
- Each resource: tap → opens **Sources & Sinks Popover** (small panel listing all bodies producing/consuming that resource, with rates and storage). Popover has a `View all` link → pushes to the full **Resource Detail screen** (see Persistent Surfaces below). Each popover row tappable → **Production** scoped to that body.
- People Capacity: tap → opens **Capacity Allocation Popover** (per-body breakdown). Each row tappable → **Production** scoped there.
- Alert count badge: tap → expands Map's mini alert sidebar (or pops the alert list as a sheet on mobile).
- Game time: tap → opens calendar/log popover (deferred at v1, placeholder).
- Settings cog: tap → opens **Settings Modal**.

**Settings Modal:**
- Tab strip: `Audio` / `Saves` / `Notifications` / `Account` / `Help` / `Tutorial`.
- Per tab, primary controls (button/toggle list deferred to v2 widget pass — for v1 each tab has a clear primary action):
  - **Audio:** master / SFX / music sliders, mute toggle.
  - **Saves:** `Save Now`, `Export Save` (downloads JSON), `Import Save` (file picker), slot list.
  - **Notifications:** push opt-in toggle, per-alert-type toggles, daily idle reminder toggle.
  - **Account:** anonymous / signed-in state, `Sign In with Email` / `Use Passkey`, `Sign Out`.
  - **Help:** searchable help list (deferred), link to support.
  - **Tutorial:** `Replay Tutorial` button (starts a separate save slot).
- `Close` (X) dismisses.

**Behavior notes (informational, kept brief at this pass):**
- Credit changes flash green/red briefly.
- Alert count badge color reflects max severity present (red > amber > blue).

### Body Detail Sheet (cross-cutting, opens on body select from any screen)

The same sheet appears whenever a body is selected — from Map tap, from Colonies list, from Production's body selector, from a route endpoint in Fleet, or from an alert deep-link.

**Sheet snap heights:** drag handle supports peek (~25% screen) / half (~55%) / full (~90%). On desktop, can be `Pin` toggled to stay open across screen changes.

**Header:**
- Body name + type badge (e.g., "NEA · Surveyed").
- Distance/window indicator vs. selected origin (informational).
- Action toolbar buttons (always visible):
  - `Build Here` → navigates to **Production** scoped to this body.
  - `Send Ship` → opens Route Creation flow with this body as destination.
  - `Plan Route` → opens Route Creation flow with this body as origin.
  - `Survey` → opens Survey Region Picker (or scan launcher if region already known).
  - `Pin` toggle (desktop only) — sheet **persists across navigation back-stacks**. Pinned sheet stays open as the player navigates between destinations, enabling cross-screen analysis (e.g., compare warehouse on NEA-04 while editing chains in Production). Mobile has no equivalent (no persistent sheet across destinations).

**Tab Strip** (segmented, 4 tabs total):
- `Overview` — surveyed resources, body grid size (e.g., "4×4 grid, 12/16 slots used"), current pop (if colony), warehouse summary.
- `Buildings` — grid view + list with same controls as Production's building panel (`Pause` / `Demolish`); shows adjacency bonuses.
- `Storage` — full warehouse contents with caps, broken down by storage building (Silo / Tank / Cryo). Each row tappable → focuses chain on that resource (jumps to Production).
- `Activity` — ships currently docked + active routes touching this body, merged ("what's moving in/out"). Ship rows open Ship Detail Sheet (stacks above body sheet); route rows open Route Detail Sheet.

**Dismiss:**
- Drag-down handle.
- `Close` (X) top-right.
- Tap outside sheet (when at peek/half).

### Resource Detail Screen (cross-cutting, opens from Sources & Sinks Popover)

A full-screen push view that surfaces the entire flow of a single resource across the player's network. Reached from the Top Status Bar's resource popover via `View all`, or from the Resource Bottlenecks section in Ops. Prevents the Colonies-from-becoming-a-debug-tool failure mode flagged in the design review.

**Header:**
- Resource name + class (raw / intermediate / finished) + cargo class (solid / fluid).
- Global rate readout: net production/min, net consumption/min, net surplus or deficit.
- 24h game-time chart: stockpile and rate over time (placeholder at v1).

**Sections (segmented filter at top: `Producers` / `Consumers` / `In Transit`):**
- **Producers:** every body producing this resource, with current rate, contributing buildings, and storage status. Each row tappable → **Production** scoped to that body.
- **Consumers:** every body consuming this resource, with rate and what it's fed into. Each row tappable → **Production** scoped to that body.
- **In Transit:** ships currently carrying this resource (route + ETA + quantity). Each row tappable → Ship Detail Sheet.

**Footer summary:**
- Total cap across all storage buildings holding this resource; usage percentage; tap → links to Storage tab on the body with the highest stockpile.

**Buttons & Navigation:**
- Per row: tap → respective deep-link.
- `Close` / back arrow → returns to invoking screen (popover or Ops).

**Why this surface:** it's the diagnostic answer to "where is my oxygen going?" without forcing the player to bounce through Colonies and Production looking for the leak.

### Alerts System

**Sources:** life support shortages, ships idle, ships stranded, storage at cap, recipe stalled, tier-up ready, event opened, build complete, route arrived.

**Channels (where they appear):**
- Alert count badge in Top Status Bar (always).
- Map's mini alert sidebar (top 3).
- Ops' Critical Alerts hero (top 3).
- Push notification (only critical, opt-in; see Notification Taxonomy in Part I).

**Severity tiers:**
- **Critical (red):** pop suspension imminent, ship stranded with no fuel reserves.
- **Warning (amber):** need <25%, storage full, idle ship.
- **Info (blue):** tier-up ready, build complete, route arrived.

**Alert Card Buttons & Navigation:**
- Severity icon + title (informational).
- **Primary action button** — label and behavior vary by alert type:
  - Life support low → `Import N [Resource]` → places Trade order, deducts credits, dispatches tanker if available.
  - Idle ship → `Auto-assign to [Best Route]` → system picks highest-value idle route, dispatches.
  - Storage full → `Add Hauler` (opens Buy Ship modal) / `Sell direct` / `Expand storage`.
  - Recipe stalled → `Build [missing input]` → deep-links to Production.
  - Tier-up ready → `Open Milestones` → navigates to **Milestones**.
- `Jump to source` chevron (right side) — deep-link to relevant screen with state pre-populated. Same as primary if no in-place fix exists.
- Whole card tappable (acts as `Jump to source`).
- `Dismiss` (X) — moves to Alert Log without resolving.

**Alert Log** (accessible from Ops):
- Read-only list of dismissed/resolved alerts with timestamps.
- Filter chips: `All` / `Resolved` / `Dismissed`.
- Per row: tap to inspect — shows what fired and how it ended.

---

## Style Direction

(Confirmed from prior decision: Dark Orbital Command for the map, Hybrid Corporate Logistics for management panels. Confirm in Stage 2 prototype.)

Three styles to compare in concepts:

1. **Light Mission Control** — off-white/pale steel UI, dark embedded map, clean NASA telemetry feel.
2. **Dark Orbital Command** — dark navy/graphite UI, cyan route lines, amber warnings, green stable chips. Strongest space-command mood.
3. **Hybrid Corporate Logistics** — dark map/visual core with light management panels, stronger tables and KPIs.

---

## Open Questions

Most v1 UI decisions are locked. Remaining:

- **Fleet maintenance / breakdowns:** deferred placeholder. v1 mechanic or T3+ research unlock?
- **Research gating** (P2): time-gated, resource-gated, or both? Affects Active Research Queue Cancel-refund behavior.
- **Build Drawer category filters** (P2): 5 categories vs. 4 broader. Tune in Stage 2 prototype.

---

## Concept Output Plan

Stage 0 concepts in `concepts/cohesive/` should now target the 5 active T0–T2 destinations × 3 styles = **15 images**:

- `map-{light,dark,hybrid}.png`
- `ops-{light,dark,hybrid}.png`
- `production-{light,dark,hybrid}.png`
- `fleet-{light,dark,hybrid}.png`
- `colonies-{light,dark,hybrid}.png`

Trade / Research / Milestones each get one representative concept in the chosen style after Stage 0 decision gate. Map's Survey and Routes modes each get one concept in the chosen style.

Mobile-specific concept renders are deferred from v1 along with the mobile build; desktop concepts carry the visual lock.

Original exploratory concepts in `concepts/` are preserved.

---

# Part III — UX Flows

Cross-cutting journeys that span multiple screens. Each flow walks step-by-step through which screens, which actions, and what state changes — sketch fidelity, not pixel-spec.

See Part II (UI Views) above for screen-by-screen specs and Part I (Game Design) above for game scope and content.

## Contents

1. [First-Time User Experience (FTUE)](#first-time-user-experience-ftue)
2. [AFK Return](#afk-return)
3. [Alert Resolution](#alert-resolution)
4. [Tier-Up](#tier-up)
5. [Buy Ship](#buy-ship)
6. [Build Recipe](#build-recipe)
7. [Survey and Claim](#survey-and-claim)
8. [Route Creation](#route-creation)
9. [Earth Prefab Kit (Drop a Foothold)](#earth-prefab-kit-drop-a-foothold)
10. [Prestige Incorporation](#prestige-incorporation)
11. [Quests (Daily / Weekly)](#quests-daily--weekly)
12. [Common Micro-Interactions](#common-micro-interactions)

---

## First-Time User Experience (FTUE)

**Goal:** by t=15:00 the player understands and is executing the loop unaided. Tutorial is skippable.

**Anchors:** Map screen, Body Detail Sheet, Production overlay, Trade screen. The narrative version of this script (what the player feels minute-by-minute) lives in Part I — First 15 Minutes.

### Step-by-step

| Time | Screen | Player action | System action |
|------|--------|---------------|---------------|
| t=-0:15 | Company-name modal | (Optional rename, defaults `VOID YIELD CO.`) | One-line modal: "Name your corporation — `VOID YIELD CO.` (renameable later)." Single CTA: `Begin operations`. Skippable; defaults retained. (R63) |
| t=0:00 | Map (cold open) | — | Drops player into Earth orbit. Earth + Moon + 1 staked NEA visible. Earth-orbit home base shows a 4×4 starter grid. Tutorial overlay highlights NEA-04 with "Tap to inspect" hint. |
| t=0:15 | Map → Body Sheet | Tap NEA-04 | Body Sheet opens at half-height. Tutorial highlights "Survey" action. |
| t=0:30 | Body Sheet → tutorial-accelerated scan | Tap "Survey" | 30s scan with progress ring (real-time scans are 4 min; first one is sped up). **Reveals iron + water readings AND a 4×4 grid for NEA-04.** |
| t=1:30 | Body Sheet (post-scan) | Sees readings + grid | Tutorial highlights "Build Here" action. |
| t=2:00 | Body Sheet → Production (NEA-04 grid) | Tap "Build Here" → tap empty grid tile → tap "Small Mine" in Build Drawer | Building placed instantly on grid. Mining begins immediately. Tutorial dismisses back to Body Sheet. |
| t=2:30 | Body Sheet | Sees Iron Ore counter ticking | Tutorial overlay: "Ship the ore to Earth." Highlights Hauler-1. |
| t=2:45 | Map → Route Creation flow | Tap Hauler-1 → "Send Ship" → tap NEA-04 → "Confirm" | Route arc draws (NEA-04 → Earth, raw Iron Ore). Hauler launches. |
| t=4:30 | Map | Hauler arrives Earth, auto-sells | $ ticks up. Banner: `First sale: +Iron Ore × 30 sold for $30` (raw price). First feedback loop closes. |
| t=5:30 | Body Sheet (NEA-04) | Tutorial nudges player | "Place a second Mine — your grid has space." Tutorial highlights another empty tile. Player places second Small Mine. |
| t=6:00 | Build Drawer | Tap "Smelter" | Smelter placed adjacent to a Mine on the grid. **Compare moment:** banner reads `Smelter +15% from Mine adjacency · Refining 5 ore → 2 metal worth 12 each. Way more than 5 ore at 1 each.` Pedagogy by comparison. |
| t=7:30 | Map | Tutorial: "Now ship the refined metal" | Highlights Hauler-1 again. Player sets up route NEA-04 → Earth carrying Refined Metal. |
| t=8:00 | Map | Hauler arrives Earth, auto-sells | $ ticks up significantly: `+Refined Metal × 12 sold for $144`. The chain pattern lands. |
| t=9:30 | Trade | Tutorial highlights Trade | Buy a second Hauler-1 for $3,000. |
| t=11:00 | Map → second survey | Manual survey of a second NEA | No acceleration. Real 4-min scan. Player learns the real pace and grid-roll variance — second NEA might roll 3×4 (tight) or 5×5 (rare big find). |
| t=13:00 | Map / Ops | Banner: "Sell 200 Refined Metal to unlock Lunar Foothold (T1) · 124/200 sold" | Tutorial overlay ends. Concrete production gate (not credit threshold) — reinforces "content gates not paywalls" pillar. (R64) |
| t=15:00 | Any | Free play | Player knows: survey-with-grid-reveal, place, mine, refine, ship, sell. Placement matters. |

### State changes

- `tutorial.step` advances through ~10 named milestones; saves persist on each.
- Tutorial is skippable from a corner button at any step. Skipping fast-forwards `tutorial.step = done` and removes overlays.
- Replaying tutorial: reachable from Settings, restarts a separate save slot.

### Open questions

- Is the t=0:30 30-second tutorial-accelerated scan honest enough? Or should we just say "Sample scan" and skip the timer entirely?

*Resolved 2026-04-28: FTUE first sale is raw Iron Ore at t=4:30; Smelter introduced at t=6:00 as a compare moment ("look how much more").*

---

## AFK Return

**Goal:** the most important moment in an idle game. Fast, honest summary of what happened, with one-tap path to fix the worst stall.

**Anchors:** AFK Return Modal (full-screen), Ops, deep-link targets. The contents/capping spec (what goes in the modal and the 24h cap rule) lives in Part I — AFK Return Specification.

### Step-by-step

| Step | Surface | Content / Action |
|------|---------|------------------|
| 1 | App-open detection | If `now - last_active > 60s`, run catch-up sim. Show modal once catch-up resolves. |
| 2 | AFK Return Modal | Full-screen modal. Cannot be skipped without acknowledging (single dismiss). |
| 3 | Modal — Header (the satisfying number) | `+$2,304 net · 4h 12m away` as a hero readout. (Capped at 24h with caveat note "AFK simulation capped at 24h.") |
| 4 | Modal — What happened | Raw resource deltas as the body. Examples: `+480 ore · +192 metals · +24 fuel · 4 deliveries sold · 1 event auto-resolved`. Top ~5 lines, raw counts not credit-normalized — keeps the player honest about storage state. |
| 5 | Modal — What stopped | Ranked list of stalls with duration. e.g.:<br>• `NEA-04 storage at cap — 1h 42m`<br>• `Hauler-1 idle — 38m`<br>• `First Habitat O2 low — 12m`<br>Each row tappable for jump-to-fix. |
| 6 | Modal — Population delta (T1+ only) | `+8 pop at First Habitat · 0 suspended` |
| 7 | Modal — Primary CTA | Single button: `Resolve top issue` — deep-links to the worst stall (typically jumps to the relevant body's sheet on Map, with the alert pre-selected). |
| 8 | Modal — Dismiss | `Continue` — closes modal, drops player on Ops. |
| 9 | Ops | Critical alerts surface remaining stalls. AFK Return summary card persists at top of Ops for the current session. |

### Voice (locked: terse-corporate)

- Header is the satisfying number ($ delta) with time away as context. No "Welcome back!" or "While you were away…" preamble.
- Body uses sentence-case, terse phrasing. Numbers leading; verbs minimal.
- Stall lines name the body and the problem in 4–6 words: `NEA-04 storage at cap`, not `Hey! Your storage at NEA-04 is full!`

### Capping rules

- AFK earnings capped at min(storage cap, route capacity, fuel availability) per resource.
- **24h hard cap** on simulated catch-up (R31). Beyond 24h, modal shows: `Capped at 24h · time has passed but operations were idle.` No earnings beyond cap. Daily check-in is the implicit contract.
- AFK events fire under the **hybrid event metric** (R32): foreground events accumulate per active-play minute when the app is open; AFK-return events have their own budget. Most auto-resolve and surface as a single line in the modal ("Solar storm at NEA-04 — auto-resolved, output 4% lower for the storm window"); rare ones gate on return ("Rescue request pending player attention").

### State changes

- `afk.last_summary` persists for the current session so the player can re-read it from Ops.
- AFK summary is also written to the Event Log (Ops sub-screen).

### Open questions

*Resolved 2026-04-28: delta units = $ headline + raw counts in body. Voice = terse-corporate.*

---

## Alert Resolution

**Goal:** every alert has a primary action that resolves it in one or two taps. No alert is purely informational without a path forward.

**Anchors:** Alert source (Ops or Map sidebar), deep-link target screen.

### Generic pattern

1. Alert fires (e.g., "Oxygen low at First Habitat").
2. Surfaces in: status bar badge, Map mini sidebar, Ops Critical Alerts.
3. Each alert card has:
   - **Primary action button** — resolves in-place when possible.
   - **Jump to source** link — deep-links to the relevant screen with state pre-populated.
4. On resolution, alert clears across all surfaces.
5. Dismissed alerts go to the Alert Log (Ops sub-screen).

### Specific examples

#### Oxygen low at First Habitat

- Primary: `[Import 50 Oxygen from Earth]` — places a Trade order with prefilled quantity, deducts credits, tanker auto-dispatched if available.
- Secondary: `[Build Electrolyzer]` — deep-links to Production scoped to First Habitat with Electrolyzer pre-selected in Build Drawer.
- Jump: opens Colonies → First Habitat detail.

#### Hauler-1 idle (no route)

- Primary: `[Auto-assign to NEA-04 → Earth]` — system picks the highest-value idle route; ship dispatches.
- Secondary: `[Manual assign]` — opens Route Creation flow with this ship pre-bound.
- Jump: opens Fleet → Hauler-1 detail.

#### NEA-04 storage full (Refined Metal at cap)

- Primary: `[Add Hauler]` — opens Buy Ship flow with cheapest-eligible solid hauler highlighted.
- Secondary: `[Sell direct]` — exports current stockpile via cheapest available route.
- Tertiary: `[Expand storage]` — deep-links to Production with storage upgrade selected.
- Jump: opens Map → NEA-04 → Storage tab.

#### Tier-up ready (T0 → T1 Lunar Foothold)

- Primary: `[Open Milestones]` — jumps to Milestones; Tier-Up flow takes over.
- This is an **info** alert, not critical, but always presents prominently when met.

### Open questions

*Resolved 2026-04-28: confirmation follows the global confirm rule — fires only when an action is irreversible OR single-action spend ≥ 25% of current credits. Auto-assign and small Trade orders commit silently.*

---

## Tier-Up

**Goal:** make tier transitions feel earned without disrupting the running game.

**Anchors:** Milestones screen, optional cinematic moment.

### Step-by-step

| Step | Surface | Content / Action |
|------|---------|------------------|
| 1 | Background | All gate conditions met for T(N) → T(N+1). Sim still running. |
| 2 | Status bar | Banner appears: "T(N+1) ready — [tier name] can be claimed." Banner persists until Milestones is opened. |
| 3 | Ops | Tier-up alert sits at top of Critical Alerts list. Primary: `[Open Milestones]`. |
| 4 | Milestones screen | Player navigates here. Next-Tier Gate section shows all bars at 100% with green checks. Single CTA: "**Claim [Tier Name]**". |
| 5 | Tier-Up Modal | Full-screen modal (or large overlay) with: tier name + flavor text, list of newly unlocked items (recipes, ship hulls, regions), single "Begin" CTA. |
| 6 | Post-claim | Modal dismisses to **Map**, which now shows the newly unlocked region (e.g., Moon's surface as build-able after T1) animated/highlighted. The new-region reveal IS the payoff (R57 — tier-up is treated as a chapter break). Sim continues running (no Pause control exists; nothing was suspended during the modal). |

### State changes

- `player.current_tier` advances.
- New recipes, hulls, and Earth Prefab Kits unlock in their respective screens.
- New tier gate (T(N+1) → T(N+2)) starts tracking.
- Achievement-style log entry written.

### Locked: plain modal at v1

*Resolved 2026-04-28: Tier-up is a plain modal (tier name, flavor text, list of newly unlocked items, single `Begin` CTA). No cinematic pause/zoom at v1. Cinematic is a Stage 2 polish candidate — adding an animated backdrop later doesn't break the flow.*

*Voice of tier-up flavor text follows the global terse-corporate voice (see Notification Taxonomy in Part I). Each tier gets ~30–50 words of measured, NASA-industrial copy — not character dialogue.*

---

## Buy Ship

**Goal:** straightforward purchase from Earth with a clear stat compare.

**Anchors:** Trade screen (or Fleet's "Buy Ship" CTA), Fleet screen post-purchase.

### Step-by-step

| Step | Surface | Action |
|------|---------|--------|
| 1 | Fleet → "Buy Ship" CTA | Opens Buy Ship modal. Or: Trade → Earth Prefab Kits / Ships tab. |
| 2 | Buy Ship modal | Lists tier-eligible hulls (Hauler-1, Mixer-1 at T0; +Tanker-1 at T1; +Hauler-2/Tanker-2/Mixer-2 at T2). Each card: spec block, owned count, price, "Buy" CTA. |
| 3 | Player taps "Buy" | Per global confirm rule — if spend ≥ 25% current credits, confirmation popover with credit-deduction preview (`Confirm` / `Cancel`); otherwise commits silently. |
| 4 | Commit | Credits deducted; ship spawns at Earth dock; ship appears in Fleet list with status `Idle`. (Instant delivery at v1.) |
| 5 | Modal dismisses to Fleet | New ship is highlighted briefly (selection state). |

### State changes

- `player.credits -= price`
- `fleet.ships += new ship at Earth, status=idle`

### Variations

- If launched from Ops "Add Hauler" alert primary, modal pre-selects the cheapest-eligible solid hauler.
- If launched from a route-creation flow that needs more capacity, modal pre-selects the cargo class needed.

### Open questions

*Resolved 2026-04-28: ship delivery is instant at v1 (R50); wall-time delivery deferred to higher tiers as economic friction.*

- Should buying a second copy of the same hull be one-tap "+1" rather than full modal? Likely yes for v2.

---

## Build Recipe

**Goal:** place a building on a body in 2–3 taps, with chain context visible.

**Anchors:** Body Sheet (entry), Production overlay or full screen.

### Step-by-step (from Map)

| Step | Surface | Action |
|------|---------|--------|
| 1 | Map | Player taps a body. Body Sheet opens. |
| 2 | Body Sheet | Player taps "Build Here." Production opens scoped to that body, showing its grid. |
| 3 | Production grid | Player taps an empty grid tile. Build Drawer (slide-up sheet) opens for that tile. |
| 4 | Build Drawer | Lists tier-eligible buildings for this body type, grouped by category (Mining / Refining / Storage / Life Support / Construction). Each card: cost, grid footprint (1 slot), prerequisites, output preview, **adjacency hint** (e.g., "+15% with a Mine in collaboration radius"). Storage cards skip the adjacency line — storage is neutral (R70). Selecting a card highlights the candidate placement and shows the collaboration-radius boundary on the grid (R69). |
| 5 | Player taps a building card | Card expands inline showing input chain status: "Needs: Iron Ore (you produce 20/min on this body) — chain OK" or "Needs: Aluminum (no source on this body) — import needed." |
| 6 | Player taps "Build" CTA | Credits deducted; **building placed instantly** on the selected tile (R33 — no wall-time). Production resumes immediately. Adjacency bonuses apply on placement. |

### Step-by-step (from Production)

Skip steps 1–2; player is already on Production with body selected. Tap an empty grid tile or `+ Add Building` → Build Drawer. Same from there.

### State changes

- `player.credits -= building.cost`
- `body.buildings += new building (status=active, slot=tile, adjacency_bonus=computed)`
- Placement applies adjacency to neighbors immediately.

### Open questions

*Resolved 2026-04-28: build is instant placement (R33); body grids are survey-rolled per body type (R29 — see Survey-and-Claim flow). Storage uses dedicated Silo / Tank / Cryo buildings on the grid (R41).*

---

## Survey and Claim

**Goal:** discover an asteroid worth mining, with enough information to commit.

**Anchors:** Map's Survey mode, Survey region picker (full screen), Body Sheet.

### Step-by-step

| Step | Surface | Action |
|------|---------|--------|
| 1 | Map | Player switches to Survey mode (top-left selector). Map dims; search regions overlay. |
| 2 | Survey mode | Player taps a region (e.g., "Near-Earth Search"). |
| 3 | Survey region picker (full screen) | Region map zoomed; candidate count ("3 unsurveyed bodies in this region"). Probe focus selector: Composition / Orbit / Hazard. Scan time estimate per focus. |
| 4 | Player picks focus, taps "Begin Scan" | Probe Bay queues the scan. Scan time elapses idle (player can return to Map). |
| 5 | Scan completes (notification) | Body Sheet opens with discovered readings (low/medium/high for each resource) **and the body's grid size, rolled within its body-type range** (R29 — e.g., NEAs roll 3×4 to 5×5; lunar habitats 5×5 to 7×7). The grid roll is the discovery beat: a 5×5 NEA is a meaningful early-game find; a 3×4 is "just enough for a starter mine." |
| 6 | Player decides: Claim, Re-scan, or Move on | "Claim" stakes the body (unlimited claims at v1, R49). "Re-scan" reveals next data layer (Purity, Depth, Hazards) — free, just takes more time (R48). "Move on" returns to Map. |
| 7 | Claimed body | Now appears as a buildable destination across all screens (Production body selector with the rolled grid, route endpoints, etc.). |

### State changes

- `survey.queue += scan task (region, focus, eta)`
- On complete: `surveyed_bodies += this body, with readings + grid_size (rolled)`
- On claim: `claimed_bodies += this body`, build/route options enabled.

### Open questions

*Resolved 2026-04-28: re-scan is free (R48); claim limit is unlimited at v1 (R49); body grid sizes roll at survey within a body-type range (R29). Range tuning per body type is P0 #2c, deferred to playtest.*

---

## Route Creation

**Goal:** assign a ship to a route in 3–4 taps.

**Anchors:** Map (selection origin), route detail sheet (confirm).

### Step-by-step (canonical)

| Step | Surface | Action |
|------|---------|--------|
| 1 | Map | Player taps a body (e.g., NEA-04). Body Sheet opens. |
| 2 | Body Sheet | Player taps "Plan Route." |
| 3 | Route Sheet (replaces Body Sheet) | Origin = NEA-04 (locked). Player picks Destination (defaults to Earth or last-used). Player picks Cargo (auto-fills with NEA-04's exportable resource). Player picks Ship (defaults to closest idle compatible ship). |
| 4 | (Optional) Add stop | Player taps `+ Add stop` to insert intermediate destinations. Up to **3 stops total** (R42 — multi-stop available from T0). For each added stop, picker shows pickup/dropoff cargo per leg. Combined hulls (Mixer-1) shine here: ore from NEA-04 → drop to lunar habitat → pick up oxygen → return to Earth in one assignment. |
| 5 | Route Sheet — preview | Shows: ETA per leg + total (e.g., 8m 20s + 3m 10s + 4m 40s = 16m 10s total), fuel cost (1.12×), capacity utilization per leg (e.g., 30/30 solid leg 1; 0 solid + 20 fluid leg 2), good-window indicator per leg. |
| 6 | Player taps "Confirm" | Ship dispatches; route arc draws on map (multi-leg if applicable). |
| 7 | Optional repeat config | `once / 3× / continuous` segmented toggle (R51). Continuous routes auto-dispatch the same ship on the same multi-leg route after each unload at the final stop. |

### Variations

- **From Fleet:** select ship → "Assign Route" → opens same Route Sheet with ship pre-bound; player picks origin/destination/cargo.
- **From Ops idle-ship alert:** "Auto-assign" picks the highest-value idle route automatically; "Manual assign" opens this flow.

### Cargo class enforcement

- Ship picker grays out hulls that can't carry the chosen cargo.
- For combined hulls, capacity preview shows breakdown: "Mixer-1 — 20 solid + 0 fluid used."
- If the user selects a multi-cargo route (T2+), cargo picker becomes a multi-select.

### State changes

- `routes += new route (origin, destination, cargo, ship_id, repeat_mode)`
- Ship status: `idle → loading → in_transit → unloading → idle (or repeat)`.

### Open questions

*Resolved 2026-04-28: repeat config is 3-button segmented (R51); window-based departure shows the indicator but doesn't enforce wait at v1 (R52); multi-stop routes available from T0 with up to 3 stops per route (R42).*

---

## Earth Prefab Kit (Drop a Foothold)

**Goal:** the one-time mechanism for establishing a presence on a new body before local industry exists.

**Anchors:** Trade screen, Map (delivery target).

### Step-by-step

| Step | Surface | Action |
|------|---------|--------|
| 1 | Tier-up flow | T(N+1) tier unlocks new Earth Prefab Kits (e.g., T1 unlocks Lunar Habitat Module Kit + Lunar Surface Mine Kit). |
| 2 | Trade → Earth Prefab Kits tab | Lists available kits with cost and "1 of 1 available" indicator. |
| 3 | Player taps "Buy and Drop" on a kit | Modal asks for delivery target (e.g., "Drop on: Moon"). Confirms credit cost + delivery time (placeholder: 2 min). |
| 4 | Player confirms | Credits deducted. Delivery vessel auto-launches from Earth (visualized on Map as a unique kit-delivery icon). |
| 5 | Delivery arrives | Notification: "Lunar Habitat Module deployed on Moon." Body now has a habitat (or first mine, etc.) — buildable / inhabitable. |
| 6 | Post-delivery | Kit is consumed (no longer available in Trade). To deploy more on the same body, player must build locally via Production. |

### State changes

- `player.credits -= kit.cost`
- `prefab_kits.consumed += this kit`
- Body state: gains the kit's content (habitat / mine / etc.) as a fully-built building.

### Open questions

*Resolved 2026-04-28: kits are 1-of-1 hand-authored per kit per tier (R37). Each tier unlocks specific kits (T1 = Lunar Habitat + Lunar Surface Mine; T4 = Mars Foothold; etc.); each buyable once per tier per kit-type. After that, the player must build locally — forces local-industry scaling. The "I just bought my Mars foothold" moment is the load-bearing emotional beat.*

- Should Prefab Kits be visible-but-locked at lower tiers, so the player anticipates them? Probably yes — drives forward momentum.

---

## Prestige Incorporation

**Goal:** end a run, claim Charter Shares, start a new run with **mechanical variety via Charter pick** (R44) — not just multiplied numbers.

**Anchors:** Milestones screen, Prestige Incorporation modal, fresh-run cold open.

### Step-by-step

| Step | Surface | Action |
|------|---------|--------|
| 1 | Background | Player completes the **System Corporation Declaration** milestone (final T7 milestone). All prior T7 milestones may or may not be complete — Declaration is the gate. |
| 2 | Status bar | Banner: `Incorporate available · System Corporation Declaration complete`. Player can ignore (continue T7 destination play, R36) or proceed. |
| 3 | Milestones | Player taps `Incorporate` CTA. Prestige Preview surfaces: Charter Shares calculation, Charter gallery, carryover preview. |
| 4 | Charter Gallery | Player browses 6–8 hand-authored Charters as picker cards. Each card shows the modifier set (e.g., `Mining Charter · ore yields +25% · refinery costs +50%`). Player **must select one** before continuing. |
| 5 | Confirm modal | Confirm modal lists: chosen Charter (with full modifier readout), carryover (modest % research, % recipe knowledge, small Charter-Share-purchasable starting kit), and what's not carried (ships, money, populations, surveyed asteroids, body grid rolls). |
| 6 | Player confirms | Old run archived (still browsable from Settings → Saves). New run starts at T0 with the chosen Charter active and carryover applied. |
| 7 | Fresh cold open | New run drops the player at the modified T0 cold-open. Charter modifiers apply from turn one (e.g., Mining Charter run starts with ore yields already +25%). |
| Optional | Mid-confirm | "Continue this run as Sandbox" — disables further Charter Shares accumulation but lets the player keep playing without resetting. |

### State changes

- `runs.archived += {old_run_state}`
- `prestige.charter_active = chosen_charter_id`
- `prestige.charter_shares += earned_amount`
- `runs.current = new_run_state with carryover applied`

### Voice (terse-corporate)

The Confirm modal copy follows the locked terse-corporate voice. Examples:
- Header: `Incorporate · charter shares earned: 142`
- Charter card title: `Mining Charter`
- Charter card body: `ore yields +25% · refinery costs +50%`
- Confirm CTA: `Begin charter`
- Cancel: `Continue as sandbox` / `Back`

### Open questions

*Resolved 2026-04-28: prestige model is Charter pick + modest carryover (R44). Charter v1 catalog ~6–8 hand-authored. Mining / Tanker / Logistics / Frontier / Settler examples drafted in Part I — Prestige Loop above.*

- Exact carryover ratios (% research, % recipe knowledge) — playtest territory.
- Whether the solar system layout reshuffles per prestige (P3) — tradeoff: novelty vs. mastery transfer.
- Charter catalog beyond v1 ~6–8 (P3) — expansion territory.
- Sandbox-mode entry gating: free from start vs. unlocked after first prestige (P3 — lean: free from start with a "scoreboard mode" toggle for prestige earners).

---

## Quests (Daily / Weekly)

**Goal:** give players a reason to open the app daily and a reason to think about the week ahead. Hand-authored content (R40), parameterized by current state.

**Anchors:** Ops daily-quest card, Milestones weekly-arc preview, Quest Detail Sheet.

### Step-by-step (daily)

| Step | Surface | Action |
|------|---------|--------|
| 1 | Daily reset | At 00:00 player local time, daily quest pool rolls. 1 daily selected from the v1 hand-authored template pool (8–12 templates covering T0–T2; full ~30–50 target deferred to Stage 4 playtest signal — R66), parameterized by current state (resource name, body name, count). Examples: `Sell 50 Refined Metal today` / `Build first Greenhouse on a NEA` / `Run 3 routes through Lunar Habitat`. |
| 2 | Ops | Daily-quest card surfaces at top of Ops with title + progress bar + reward (`+$200, +1 Charter Shares preview`). Tappable to open Quest Detail Sheet. |
| 3 | Player gets going | Player tackles the quest passively (by playing normally) or actively (deliberately steering toward the goal). Progress updates in real time. |
| 4 | Completion | Quest marked complete; reward auto-credits; brief banner (`Daily quest done · +$200, +1 Charter Shares preview`). |
| 5 | Already done | Card collapses to a single-line summary (`Daily quest complete · resets in 14h 22m`). |

### Step-by-step (weekly arc)

| Step | Surface | Action |
|------|---------|--------|
| 1 | Weekly reset | At 00:00 Monday player local time, weekly arc rolls. 1 arc selected from the v1 hand-authored arc pool (2 arcs covering T0–T2; full ~5–8 target deferred to Stage 4 playtest signal — R66), tier-gated. Example: `Reach Comfortable pop tier on First Habitat by Sunday`. |
| 2 | Ops + Milestones | Weekly arc card surfaces in Ops (collapsed below daily) and Milestones (full progress block). |
| 3 | Player works toward goal | Multi-day commitment. Progress visible across the week. |
| 4 | Completion | Reward = larger Charter Shares preview drip + occasional one-shot unlock (cosmetic, sandbox toggle, etc.). |
| 5 | Failure | If not completed by reset, arc archives without reward. No penalty. Next arc rolls. |

### State changes

- `quests.daily_active = {template_id, params, progress, reward, reset_at}`
- `quests.weekly_active = {arc_id, progress, reward, deadline}`
- On complete: `player.charter_shares_preview += reward`, `player.credits += credits_reward`

### Open questions

*Resolved 2026-04-28: hand-authored daily templates (~30–50) + hand-authored weekly arcs (~5–8). Reward shape: dailies = small credits + small Charter Shares preview drip; weeklies = larger Charter Shares preview + occasional unlocks (R40).*

- Daily reset clock anchor: player local 00:00 vs. 24h-since-claim. Default: player local for predictability.
- Weekly arc difficulty curve: tier-aligned, exact pacing needs playtest.

---

## Common Micro-Interactions

These are too small to deserve their own flow but worth listing as expected behaviors.

| Interaction | Behavior |
|-------------|----------|
| Switch map mode | Top-left segmented control on Map (`Default` / `Survey` / `Routes`). Persists per session. |
| Open settings | Cog icon in status bar (top-right). Opens a modal: audio, save management, notifications, account, help, tutorial replay. |
| Save management | Settings → Saves. Supports manual save, auto-save status (last save N min ago), import/export, slot switching. Cloud sync auto-only with status indicator (R55). |
| Notification permission ask | First time a critical-tier alert is about to fire AND the player has shown engagement (>30 min total play). Not on first launch. |
| PWA install prompt | After session 2, if not yet installed and platform supports. Single dismissible banner. |
| Empty-resource fallback | Any list view that's empty shows what would unlock content (e.g., Colonies at T0: "Unlocks at T1 — Lunar Foothold (gate progress: 124/200 metals sold)"). |
| No Pause / no Sim Speed | Real-time gates pacing. There is no time-stop or fast-forward control (R22, R34). All alerts and events are designed to be readable at human pace (no sub-minute urgency, per the Failure Modes corollary in Part I). |

---

## Open Questions Across Flows

Most flow-level open questions are resolved. Remaining items are deferred to playtest or strategic late-game:

- **Tier-up flavor text length and voice tuning** (P3): voice locked terse-corporate (R18); specific copy still authored.
- **Daily quest reset clock** (P2): player local 00:00 vs. 24h-since-claim. Default: player local.
- **Weekly arc difficulty curve** (P3): tier-aligned, exact pacing needs playtest.
- **Prefab Kit visibility at lower tiers** (P2): locked-and-shown vs. hidden until unlock — drives forward momentum if shown.
- **One-tap "+1" repeat-buy for ships** (v2): nice-to-have UX polish.

All other flow-level questions previously listed (FTUE first sale, AFK voice/units, build time/footprint, re-scan cost, claim limit, ship delivery, repeat UI, window rules, Prefab Kit quantity) are resolved.
