# Void Yield 2 Game Design

## Working Summary

Void Yield 2 is an optimistic hard-sci-fi, browser-based **incremental production-chain builder** set across the solar system. Think *Anno 1800* or *Paragon Pioneers* in space, with idle-friendly throughput and a prestige loop on top.

The player surveys asteroids, sets up mines and refineries, links them into chains, ships goods between bodies, and grows colonies that demand progressively more advanced processed materials. The signature loop is **tier transitions**: Earth's demand unlocks the Moon, the Moon's population demands habitats which unlock NEA mining, NEA wealth unlocks Mars, and so on out to the gas giants. Layout and chain design are the active gameplay; throughput continues while away.

The game runs as a single experience that plays equally well exclusively on mobile or exclusively on desktop. Sessions are hybrid: short check-ins (resolve an alert, place one building) and long check-ins (plan a tier transition, redesign a chain).

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
- **Setup Is Active, Operations Are Idle:** Surveying, building, and chain design are deliberate. Once running, production continues unattended until a real bottleneck.
- **Stable Economy, No Speculation:** Earth and other markets use fixed prices and predictable demand.
- **Failures Slow, Don't Punish:** Bottlenecks are clear, recoverable, and authored. No random save loss.
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

## Content Targets (v1 launch numbers)

Anchors for "is this enough content." Tune later.

- **Tiers:** 8 (T0–T7).
- **Resources:** ~35 distinct goods. ~8 raw, ~12 intermediate, ~12 finished, ~3 prestige-only.
- **Recipes:** ~50 across all tiers. Curve roughly 4 / 6 / 7 / 7 / 8 / 7 / 6 / 5 by tier.
- **Ship hulls:** 12 at launch. 5 solid / 5 fluid-gas / 2 specialist (probe, builder).
- **Celestial bodies (interactable):** ~25 fixed + ~30 procedurally-rolled NEAs and belt asteroids per run.
- **Buildings:** ~25 (mines, refineries, processors, fabricators, life-support, support).
- **Research nodes:** ~40, branched as Logistics / Industry / Life Support / Exploration.
- **Events:** ~24 distinct, with frequency budgeted to ~1 active per 20 minutes of foreground play.

These are anchors, not contracts. If a tier feels thin, add a recipe; if it feels noisy, cut one.

## Prestige Loop

When the player completes the T7 endgame milestone bundle, they may **incorporate** — start a new run with carryover.

- **Currency:** *Charter Shares*, earned from peak throughput, colony tier sum, and unlocked recipes.
- **Carryover (proposed v1):** % of unlocked research nodes, % of recipe knowledge, a small Charter-Share-purchasable starting kit. **Not** carried over: ships, money, populations, surveyed asteroids.
- **Multipliers:** modest (1.1×–2× per major axis) to keep mid-game decisions live, not steamrollable.
- **Sandbox mode:** toggle that disables prestige gates and grants all tiers immediately, for creative-builder play. Sandbox saves are tagged and do **not** earn Charter Shares.

Open: exact carryover ratios, whether prestige resets the solar system layout, named-asteroid persistence.

## Session Cadence

Designed for **hybrid** check-ins.

- **Short (1–3 min):** open the app, glance at alerts, resolve one (assign idle ship, import oxygen, dismiss event), close. Should always have at least one meaningful one-tap action.
- **Long (15–60 min):** plan a tier transition, lay out a new colony's chains, set route automations, run a survey campaign.
- **AFK between (minutes to a day):** production runs against bottlenecks. Returning shows an AFK summary.

Notification design (see *Notifications*) is what makes the short cadence work on mobile.

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

- Starter ore silo: 300 units.
- Starter metals bin: 120 units.
- Starter fuel tank: 180 units.
- Habitat life-support buffers: 8h reserve at full pop.

## Resources And Recipes (T0–T2)

Specced for the first three tiers. T3+ resources/recipes are placeholder-only at named-tier level. Authoring rules:

- **Recipe shape:** per-cycle batches. A building has a cycle time; one cycle consumes its input batch and produces its output batch. Display: cycle time, output/cycle, derived rate/min.
- **Storage:** per-body warehouse. All buildings on a body share one logical stockpile. Routes go warehouse → ship → warehouse.
- **Cargo class:** strict at the cargo level. Solids in solid holds, fluids/gases in tankers. *Combined* hulls have **fixed mixed slots** — an explicit per-class allocation (e.g., 30 solid + 20 fluid) that can be filled in any combination but not repurposed between classes. *Specialized* hulls are single-class at full capacity. (Cargo classes are two at v1 — solid and fluid/gas. A passenger class may be added later if specialist/colonist transport becomes a mechanic.)

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

#### T0 — Wildcatter (5 recipes)

| Building | Cycle | Inputs | Outputs |
|----------|------:|--------|---------|
| Small Mine | 30s | — | 10 Iron Ore |
| Ice Mine | 40s | — | 8 Water Ice |
| Smelter | 45s | 5 Iron Ore | 2 Refined Metal |
| Electrolyzer | 60s | 4 Water Ice | 3 Hydrogen Fuel + 1 Oxygen |
| Probe Bay | (passive) | — | survey time → asteroid data |

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

Colony pop tiers are local growth states *within* the game tier. Reaching a higher pop tier requires meeting all listed needs continuously for a settle-in window (placeholder: 1 hour real time). Population caps at the highest met tier.

| Pop Tier | Unlocks At | Continuous Needs | Growth-Tier Bundle (one-time, on first reach) |
|----------|-----------|------------------|----------------------------------------------|
| Survival | T1 (first habitat) | Water, Oxygen, Food Pack | 4 Construction Materials |
| Settled | T1 (habitat upgraded) | + nothing new | 8 Construction Materials + 2 Habitat Module |
| Growing | T2 (Glass + Valves available) | + Pressure Valves drip (1 / pop / 30 min) | 6 Habitat Glass + 4 Pressure Valves |
| Comfortable | T2 late | + Textiles drip (1 / pop / 60 min) | 8 Textiles + 4 Furnishings |
| Affluent | T2 endgame | + Spirits drip (1 / pop / 90 min) | 6 Furnishings + 4 Spirits |

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

- **t=0:00 — Cold open.** Player drops into Earth orbit with one Hauler-1, one starter Probe, $5,000, an Earth-orbit home base (warehouse + buildable surface), and 1 staked NEA claim. Tutorial overlay points at the Probe.
- **t=0:30 — First survey.** Auto-target on NEA-04, scan completes in 30 s (tutorial-accelerated). Reveals iron + water readings.
- **t=2:00 — First mine.** Tutorial places a Small Mine on NEA-04. Mining begins.
- **t=3:00 — First refinery.** Tutorial places a Smelter on NEA-04 alongside the mine. Ore feeds straight into the Smelter through the body's shared warehouse.
- **t=4:30 — First load-out.** Hauler-1 auto-assigned to NEA-04 → Earth, loaded with Refined Metal. Player taps "Confirm route."
- **t=6:30 — First sale.** Hauler delivers Refined Metal, sells at fixed Earth price. First *real* feedback loop closes — the refining step pays off vs. raw ore.
- **t=8:00 — Second ship.** Tutorial points at Earth Trade → Buy Hauler-2.
- **t=10:00 — Second NEA.** Manual survey (no acceleration this time). Player learns the real pace.
- **t=12:00 — First objective unlock.** "Reach $10k to unlock Lunar Foothold (T1)." Tutorial ends, free play begins.
- **t=15:00 — Player is on the loop.** They know: survey, mine, ship, sell. They know what's next.

Acceptance: a first-time player understands and is executing the loop unaided by t=15:00. Tutorial is skippable.

## AFK Return Specification

When the player returns after ≥60 s away, show the **Return Summary** before the main UI.

Contents:

- **Time away** (real time, capped at 24h).
- **What happened:** top 5 bullets — ore mined, metals refined, ships dispatched, deliveries sold, events resolved automatically.
- **What stopped:** ranked list of stalls — *Storage full at 67% of away time*, *Hauler-1 idle (no route)*, *Oxygen shortage at First Habitat*. Each row is tappable to jump-to-fix.
- **Net change:** $ delta, resource deltas (top 6), population delta.
- **Single primary action:** "Resolve top issue" deep-links to the worst stall.
- **Single dismissible action:** "Continue."

Capping rules: AFK earnings are capped at the lowest of (storage cap, route capacity, fuel availability). No AFK earns past 24h without check-in. This protects pacing without feeling punitive.

## Failure Modes

Authored, recoverable, never silent.

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

Spam budget: ≤3 push notifications per day per player by default, user-tunable.

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
- Data-driven definitions for resources, ships, buildings, colonies, unlocks, research, events, and celestial bodies.

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
- **Industry:** mines, refineries, recipes, storage, throughput.
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

### T7: System Corporation

Saturn + outer probes. Endgame milestone bundle. Prestige unlock.
Bottlenecks: optimization, throughput ceilings, prestige preparation.

## Economy

- Earth always buys and sells key resources at fixed prices.
- Fixed prices unlock by tier or region; they do not fluctuate.
- Contracts are not the main economy.
- Profit comes from production rate, logistics efficiency, scale, and self-sufficiency.

## Events

Events create operational pressure without becoming a market simulator.

Examples: solar storm, launch delay, equipment fault, rescue request, supply emergency, route disruption.

Frequency budget: ~1 active event per 20 minutes of foreground play. Events are recoverable and readable. They create decisions, not random punishment. See *Failure Modes* for the floor.

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

> Canonical inventory: see [DECISIONS.md](DECISIONS.md) for all pending decisions across docs (priority bands P0–P3) plus resolved decisions with one-line resolutions. Items below are GAME_DESIGN-flavored items — kept here for in-context reading.

- Exact NASA-industrial palette values.
- First survey UI fidelity (region picker shape, focus model).
- **Earth Prefab Kit mechanic shape:** cost curve, quantity-per-tier, generalized vs. hand-authored. (P0)
- Pop-tier settle-in window value (placeholder 1h real time). (P1)
- Whether Carbon Mesh as input to both Textiles and Furnishings makes Carbonaceous Ore a single-source bottleneck for the entire T2 comfort tier (validate in playtest). (P2)
- Aluminum demand scaling: input to Construction Materials, Glass Furnace, and Furnishings Workshop — may need volume scaling on Lunar Surface Mines. (P2)
- T3+ resource and recipe content (deliberately deferred until T0–T2 playtest). (P3)
- Ship catalog (T0–T2): hull-spec tuning may need playtest revisits even though the catalog shape is locked. (P2)
- Building catalog (T0–T2): construction costs, footprint, prerequisites for the 24 recipe-buildings. (P3, pairs with build-footprint decision in P0.)
- Prestige carryover ratios and the exact Charter Shares formula. (P3)
- Whether prestige reshuffles the solar system layout or preserves it. (P3)
- Sandbox-mode entry point and gating (free from start, or unlocked after first prestige). (P3)
