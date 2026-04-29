# Void Yield 2 Game Design

## Working Summary

Void Yield 2 is an optimistic hard-sci-fi, browser-based **incremental production-chain builder** set across the solar system. Think *Anno 1800* or *Paragon Pioneers* in space, with idle-friendly throughput, **spatial grid placement** as the layout texture, and a Charter-driven prestige loop on top.

The player surveys asteroids (revealing their grid size on scan), **places buildings on per-body grids** with soft adjacency bonuses, links chains via per-body warehouses, ships goods between bodies on routes that can have up to 3 stops, and grows colonies that demand progressively more advanced processed materials. The signature loop is **tier transitions**: Earth's demand unlocks the Moon, the Moon's population demands habitats which unlock NEA mining, NEA wealth unlocks Mars, and so on out to the gas giants — culminating in T7 (System Corporation), a destination of 5–10h unique content before the prestige choice. Placement and chain design are the active gameplay; throughput continues while away.

The game runs as a single experience that plays equally well exclusively on mobile or exclusively on desktop. Sessions are hybrid with **short check-ins as the default** (resolve an alert, claim a daily quest, place one building) and **long sessions first-class supported** (plan a tier transition, lay out a new colony's grid, work toward a weekly arc).

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
- **Setup Is Active, Operations Are Idle:** Surveying, **placing buildings on per-body grids**, and chain design are deliberate. Soft adjacency bonuses reward thoughtful placement. Once running, production continues unattended until a real bottleneck.
- **Spatial Layout, Bounded by Grids:** Each body has a placement grid whose size is rolled at survey within a body-type range. Storage, production, refining, and life-support all live on the grid; opportunity cost between buildings is the central layout decision. Belt routing is abstracted (per-body warehouse); placement and adjacency are the texture.
- **Stable Economy, No Speculation:** Earth and other markets use fixed prices and predictable demand.
- **Failures Slow, Don't Punish:** Bottlenecks are clear, recoverable, and authored. No random save loss. **No alert/event has a sub-minute urgency window** — there is no Pause control, so the design must be readable at human pace.
- **One Game, Two Form Factors:** A player can run a complete campaign exclusively on mobile or exclusively on desktop. Layout adapts; mechanics, save, and progression do not.

## Tone And Visual Direction

The target mood is **NASA-industrial orbital command**:

- Dark Orbital Command map as the emotional centerpiece.
- NASA Industrial Hybrid as the practical visual language.
- Corporate Logistics as the structure for menus, rates, fleet status, and throughput.

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

Anchors for "is this enough content." Tune later.

- **Tiers:** 8 (T0–T7), with T7 as a destination of 5–10h unique content.
- **Resources:** ~35 distinct goods. ~8 raw, ~12 intermediate, ~12 finished, ~3 prestige-only.
- **Recipes:** ~50 across all tiers. Curve roughly 4 / 6 / 7 / 7 / 8 / 7 / 6 / 5 by tier.
- **Buildings:** ~30 (mines, refineries, processors, fabricators, life-support, **storage buildings**, support).
- **Storage buildings:** ~6 (Silo / Tank / Cryo Tank, plus tier-2/4/6 capacity unlocks per type).
- **Ship hulls:** 12 at launch. 5 solid / 5 fluid-gas / 2 specialist (probe, builder).
- **Celestial bodies (interactable):** ~25 fixed + ~30 procedurally-rolled NEAs and belt asteroids per run; **each body has a survey-rolled grid size** drawn from a body-type range.
- **Research nodes:** ~40, branched as Logistics / Industry / Life Support / Exploration.
- **Events:** ~24 distinct. Frequency progression-paced — foreground events fire ~1 per 20 min of *active-play* time; AFK-return events fire on long-away with their own budget.
- **Earth Prefab Kits:** ~10–14 hand-authored, **1-of-1 per kit per tier** (T1 Lunar Habitat + Lunar Surface Mine; T4 Mars Foothold; etc.).
- **Charters (prestige modifiers):** ~6–8 hand-authored at v1 (Mining Charter, Tanker Charter, Logistics Charter, Frontier Charter, Settler Charter, +reserved).
- **Quest content pool:** ~30–50 hand-authored daily templates parameterized by current state, plus ~5–8 hand-authored weekly arcs.

These are anchors, not contracts. If a tier feels thin, add a recipe; if it feels noisy, cut one.

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

## Platforms

**True dual-target.** Same game, same save, runs on either form factor exclusively if desired.

- **Desktop:** browser; PWA-installable. Multi-panel UI, keyboard shortcuts.
- **Mobile:** browser + PWA install; portrait-first, landscape supported. Touch-first, push notifications, background-throttle resilient.
- **Save:** local-first with cloud sync via account login. Manual import/export always available. Conflict resolution favors latest deterministic state.
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

- Habitat life-support buffers: 8h reserve at full pop, baseline; lifesupport buffer-buildings unlock T1+.

## Resources And Recipes (T0–T2)

Specced for the first three tiers. T3+ resources/recipes are placeholder-only at named-tier level. Authoring rules:

- **Recipe shape:** per-cycle batches. A building has a cycle time; one cycle consumes its input batch and produces its output batch. Display: cycle time, output/cycle, derived rate/min.
- **Storage:** per-body warehouse logical, **per-grid-slot physical**. All buildings on a body share one logical stockpile, but the cap is the sum of storage-building caps placed on the grid. Routes go warehouse → ship → warehouse.
- **Placement:** every building (including storage) takes 1 grid slot. Body grid sizes roll at survey within a body-type range (NEAs ~3×4 to 5×5; lunar habitats ~5×5 to 7×7; Mars colonies ~7×7 to 9×9; tunable in playtest). **Soft adjacency bonuses (10–25%)** apply to paired buildings (e.g., Mine + Crusher; Refinery + Smelter; Greenhouse + Water-Reclaim). **Building is instant** — cost (credits + slot) is the only gate; no build timers.
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
- **t=13:00 — First objective unlock.** "Reach $10k to unlock Lunar Foothold (T1)." Tutorial ends, free play begins.
- **t=15:00 — Player is on the loop.** They know: survey-with-grid-reveal, place, mine, refine, ship, sell. They know placement matters. They know what's next.

Acceptance: a first-time player understands and is executing the loop unaided by t=15:00, including the grid-placement step. Tutorial is skippable.

## AFK Return Specification

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
| Economy | Zero credits, zero exportable | Soft-stuck | Earth grants a one-time bailout (capped uses per run) |

No bankruptcy, no save-deletion. The bailout is the floor.

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
- Single nav language for desktop and mobile (see UI_VIEWS.md).

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

Playtest question: *Does this look and feel like a game worth managing on both form factors?*

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
- A player can complete a full run on either form factor exclusively.
- Prestige feels like reward, not reset-punishment.

### Build Acceptance (per stage)

Tracked per-slice in Stage 4. Each slice answers one design question and ships its acceptance test list with the slice.

## Open Questions

These are deferred to playtest validation or late-game drill. The full prioritized inventory (with resolved/pending state) lives in `DECISIONS.md`.

- **Grid range tuning per body type** (P0 #2c): Stage 3 playtest. NEA min/max, lunar habitat min/max, Mars min/max, etc.
- **Carbon Mesh single-source bottleneck** (P2): does Carbonaceous Ore feeding both Textiles and Furnishings make T2 comfort tier fragile? Validate in playtest.
- **Aluminum demand scaling** (P2): input to Construction Materials, Glass Furnace, Furnishings Workshop. May need volume scaling on Lunar Surface Mines.
- **Research gating model** (P2): time-gated, resource-gated, or both?
- **Build Drawer category filters** (P2): 5 categories vs. 4 broader.
- **Active Research Queue Cancel behavior** (P2): refund what? Tied to research-gating decision.
- **Greenhouse vs. Hydroponics water consumption** (P2): placeholder makes water demand 16× pop drink rate. Tune in Stage 3.
- **Prestige carryover ratios** (P3): exact %s for research and recipe knowledge after Charter pick.
- **Charter catalog beyond v1 ~6–8** (P3): expansion territory.
- **Whether prestige reshuffles the solar system layout** (P3): novelty vs. mastery.
- **Sandbox-mode entry** (P3): free from start vs. unlocked after first prestige.
- **NASA-industrial palette values** (P3): Stage 2.
- **First survey UI fidelity** (P3): region picker shape, focus model.
- **T3+ resource and recipe content** (P3): deferred until T0–T2 playtest.
- **Building catalog T0–T2 costs and prereqs** (P3): explicit costs/prereqs pass alongside grid-mechanic prototyping.

All other open questions from earlier doc states are resolved. See `DECISIONS.md` for the resolution log (R22–R59).
