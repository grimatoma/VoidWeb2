# Void Yield 2 Game Design

## Working Summary

Void Yield 2 is an optimistic hard-sci-fi, browser-based incremental logistics game about building a space industry network from a scrappy startup into a private space corporation.

The player surveys asteroids, mines resources, ships goods through changing orbital conditions, grows colonies, and eventually builds automated logistics networks and local shipbuilding capacity. The game should be AFK-friendly: actions take real time, usually minutes to hours, and production continues while away until blocked by storage, capacity, fuel, life support, or route constraints.

The first design goal is not to solve the whole game at once. The first goal is to create a clear design direction and then build playtestable vertical slices where each slice answers one important question.

## Design Pillars

- **Orbital Logistics Is the Signature System:** Routes, fuel, transfer windows, and changing orbital positions should make space feel alive without forcing the player to do math.
- **Colonies Are Power With Obligations:** Colonies provide People Capacity for more concurrent work, but require life support and increasingly advanced processed materials to grow.
- **Incremental Growth With Real Bottlenecks:** Numbers grow over time, but storage, shipping, fuel, people, and production chains create meaningful decisions.
- **Readable Hard Sci-Fi:** The science should feel grounded and practical, but every system must be understandable from the UI.
- **Stable Economy, No Speculation:** Earth and other markets use fixed prices and predictable demand. The game should not become a trading or price-speculation game.
- **AFK-Friendly, Not Punishing:** Waiting is part of the game, but bottlenecks should be clear and recoverable.

## Tone And Visual Direction

The target mood is **NASA-industrial orbital command**:

- Dark Orbital Command map as the emotional centerpiece.
- NASA Industrial Hybrid as the practical visual language.
- Corporate Logistics as the structure for menus, rates, fleet status, and throughput.

The game should look like a serious operational tool for managing space infrastructure, but still feel exciting when watching ships move, routes change, asteroids get surveyed, and colonies grow.

## Stage 0: Vision Mocks

Stage 0 happens before architecture or implementation. It creates cheap, disposable mockups to answer:

> What does this game feel like to look at and manage?

These mocks are not production UI and should not constrain implementation. They are direction-finding tools.

### Mock 1: Main Desktop Command View

Purpose: prove the overall command-center fantasy.

```text
+--------------------------------------------------------------------------------+
| VOID YIELD 2        $12,480     Metals 38/t     Fuel 120     Alerts 2          |
+----------------------+--------------------------------------+------------------+
| Resources            |                                      | Selected: NEA-04 |
| Ore        180 / 300 |        . NEA-04                      | Type: Asteroid   |
| Metals      38 / 120 |      /                               | Iron: High       |
| Fuel       120 / 180 |   Earth Orbit                         | Water: Low       |
|                      |      \                               | Survey: 62%      |
| Bottlenecks          |        o Hauler-1                    |                  |
| - Storage 82%        |                                      | Route Preview    |
| - Ship idle          |  Route: NEA-04 -> Earth              | Fuel: 1.12x      |
|                      |  Window: Improving +2% / min         | ETA: 8m 20s      |
+----------------------+--------------------------------------+------------------+
| Ships: Hauler-1 in transit | Probe-1 surveying | Refinery active | Log: +12 metals |
+--------------------------------------------------------------------------------+
```

Target feel:

- Large readable orbital map.
- Practical side panels.
- Immediate route and resource context.
- Cool system tracking without sacrificing management clarity.

### Mock 2: Mobile Management View

Purpose: prove mobile is task-first, not a squeezed desktop.

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

Target feel:

- One focused view at a time.
- Vertical cards and lists.
- Bottom sheets for detail and action.
- Map remains important, but mobile management is mostly menu-driven.

### Mock 3: Survey Gameplay View

Purpose: make asteroid discovery feel like active gameplay.

```text
+----------------------------------------------------------------+
| Survey: Near-Earth Search                                      |
+-----------------------------+----------------------------------+
| Search Field                | Candidate NEA-04                 |
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

Progression:

- Early survey reveals low/medium/high readings.
- Later tools reveal purity, depth, extraction difficulty, hazards, orbital value, and rare traces.
- Eventually probe networks and survey automation reduce repeated manual scanning.

### Mock 4: Colony Needs View

Purpose: make population feel powerful but demanding.

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

Target feel:

- Colonies unlock work capacity.
- Basic needs are ongoing upkeep.
- Advanced processed materials unlock growth tiers.
- Shortages slow and pressure the player without causing hard failure.

### Mock 5: Fleet And Route View

Purpose: clarify ship roles and transfer windows.

```text
+----------------------------------------------------------------+
| Fleet                                                          |
+----------------+------------+-------------+--------------------+
| Ship           | Type       | Status      | Assignment         |
| Hauler-1       | Solid      | In transit  | NEA-04 -> Earth    |
| Tanker-1       | Fluid/Gas  | Idle        | None               |
| Courier-1      | Passenger  | Docked      | First Habitat      |
+----------------+------------+-------------+--------------------+
| Selected Route: NEA-04 -> Earth                                |
| Cargo: Metals       ETA: 8m 20s       Fuel Cost: 1.12x          |
| Window: Improving for 6m, then stable, then closing             |
+----------------------------------------------------------------+
```

Target feel:

- Three ship families: solid cargo, fluid/gas tankers, passenger/crew ships.
- Early ships are bought from Earth.
- Later shipyards build local specialized hulls.

### Mock 6: Industry Chain View

Purpose: show the bridge from simple early production to colony-driven material complexity.

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

Target feel:

- Early chain is simple: ore to metals.
- Later chains exist because colonies need more unique processed materials.
- Industry is the path from Earth dependence to self-sufficiency.

### Stage 0 Decision Gate

Before architecture begins, choose:

- Overall visual direction.
- Desktop layout rules.
- Mobile layout rules.
- Which views use Canvas 2D.
- Which views use Three.js.
- Which views are pure React UI.
- Whether the game looks exciting enough to move into architecture.

Default recommendation:

- **Canvas 2D:** main system map, route overlays, survey map.
- **Three.js:** selected asteroid, ship, habitat, milestone visuals, optional scenic background moments.
- **React UI:** dashboards, tables, cards, bottom sheets, resource bars, research, industry, colony needs.

## Stage 1: Core Architecture Plan

Stage 1 defines the full architecture before gameplay implementation begins. The goal is cohesion, not overengineering.

### Technology Targets

- React + TypeScript.
- Medium-dense management UI.
- Canvas 2D for readable orbital map gameplay.
- Selective Three.js for animated focus views.
- Local save first, but cloud-ready save structure.
- Deterministic simulation loop supporting AFK progress.
- Data-driven definitions for resources, ships, buildings, colonies, unlocks, research, events, and celestial bodies.

### Core Architecture Principles

- Simulation logic should be independent from React components.
- UI should read derived game state and dispatch explicit player commands.
- All gameplay definitions should be data-driven where practical.
- Saves should be versioned from the start.
- Offline progress should replay through the same deterministic simulation rules as online progress, with practical caps or chunking for performance.
- Mobile and desktop should share game state and commands, but use different layouts.

### Proposed Module Boundaries

- **Simulation Engine:** tick loop, time advancement, command processing, offline progress.
- **Game State:** resources, entities, routes, colonies, ships, unlocks, research, settings, save metadata.
- **Definitions:** resources, recipes, buildings, ships, celestial bodies, events, unlocks.
- **Economy:** fixed Earth buy/sell tables and later stable buyer definitions.
- **Survey:** asteroid candidates, scan progress, confidence, data layers, probe assignments.
- **Logistics:** ships, cargo, route assignment, travel time, fuel cost, transfer efficiency.
- **Colonies:** population, People Capacity, needs, happiness, shortage effects, growth tiers.
- **Industry:** mines, refineries, production recipes, storage, throughput.
- **UI State:** selected object, active screen, panel state, mobile bottom sheet state, filters.
- **Persistence:** save/load, migrations, import/export, future cloud-ready IDs.

### Simulation Tick Model

- Use deterministic elapsed-time simulation.
- Actions have durations measured in seconds.
- Production rates are continuous but can be displayed per minute.
- The engine should support both foreground ticking and AFK catch-up.
- AFK progress is storage-limited and bottleneck-limited: production stops when storage, fuel, life support, capacity, or route requirements block it.

### Save Model

V1 should use local browser persistence, with cloud-ready structure:

- Save version.
- Created/updated timestamps.
- Player/company ID.
- Run ID.
- Random seed.
- Game time.
- Entity IDs stable across saves.
- Definitions version.
- Player settings.
- Game state snapshot.

Future cloud sync should be possible without changing core entity identity or save migration rules.

### Resource And Flow Model

- Resources have type, unit, storage category, and optional cargo class.
- Cargo classes start as solid, fluid/gas, and passenger/crew.
- Production consumes and produces resources over time.
- Storage limits are important gameplay bottlenecks.
- Earth trade is a fixed-price sink/source, never speculative.

### Route And Ship Model

- Ships have cargo class, capacity, speed/drive stats, fuel behavior, current location, and assignment.
- Manual assignment comes first: choose ship, source, destination, cargo, and repeat count.
- Routes derive fuel/time from distance/alignment, smoothed for readable gameplay.
- Automation later adds rules like maintain stock, export surplus, and prefer good windows.

### Survey Model

- Early survey reveals low/medium/high resource readings.
- Survey progress is time-based.
- Confidence increases with probe time and better tools.
- Later data layers reveal purity, depth, difficulty, hazards, orbital value, and rare traces.
- Survey automation eventually assigns probes to scan regions or candidates.

### Colony Model

- Colonies provide People Capacity.
- People Capacity limits concurrent work across mines, factories, ships, surveys, construction, and support systems.
- Basic life support is ongoing upkeep.
- Advanced processed materials unlock colony growth tiers.
- Shortages reduce happiness, growth, and effective capacity before causing evacuation or suspension.

### Unlock Model

- Major unlocks come from both research and colony tiers.
- Each milestone should introduce a clear new capability: resource class, ship type, automation feature, industry chain, region, or visual/tooling upgrade.

### Responsive UI Model

Desktop:

- Map center.
- Left panel for global resources, navigation, alerts, and bottlenecks.
- Right panel for selected-object details.
- Bottom strip for ships, queues, timeline, or event log.

Mobile:

- Top sticky status bar.
- Bottom tab navigation.
- One major view at a time.
- Vertical cards/lists.
- Bottom sheets for details and actions.
- Map is a core feature, but not the only management surface.

## Stage 2: UI Cohesion Prototype

Build a lightly functional UI shell using the chosen visual direction. No deep simulation yet.

Includes:

- Desktop command layout.
- Mobile vertical/tab layout.
- Resource/status bar.
- System map placeholder.
- Panels for asteroid, fleet, colony, Earth trade, industry, and research.
- Basic fake data to judge readability and excitement.

Playtest question:

> Does this look and feel like a game worth managing?

## Stage 3: First Playable Core Idle Loop

Implement the smallest real loop:

- Survey one asteroid.
- Mine ore.
- Refine ore into metals.
- Ship metals to Earth.
- Sell at fixed Earth price.
- Buy upgrades or another ship.
- Support minutes-to-hours timers.
- Support storage-limited AFK progress.

Playtest question:

> Is survey-mine-refine-ship-sell satisfying before colonies exist?

## Stage 4: Vertical Slice Expansion

Add one major system per slice:

1. Survey minigame with map search and low/medium/high readings.
2. First colony with People Capacity and life-support slowdown.
3. Orbital logistics with moving bodies and transfer efficiency.
4. Automation after first stable colony.
5. Local life-support industry and tanker logistics.
6. Shipbuilding and advanced colony material tiers.

Each slice must be playtestable and should answer one specific design question.

## Full Game Stage Progression

### Game Stage 1: Scrappy Orbital Startup

- Buy basic ships and supplies from Earth.
- Survey near-Earth asteroids.
- Mine ore.
- Refine and sell metals to Earth.
- Manage storage and ship availability.

Primary bottlenecks:

- Ship count.
- Cargo capacity.
- Storage.
- Mine/refinery rate.
- Early fuel or launch cost.

### Game Stage 2: First Habitat

- Establish first small habitat.
- Gain People Capacity.
- Import life support from Earth.
- Handle basic population growth and needs.

Primary bottlenecks:

- Water, oxygen, food, spares.
- People Capacity.
- Earth import cost.
- Happiness and growth.

### Game Stage 3: Local Survival Industry

- Produce life-support resources locally.
- Mine ice/water.
- Process oxygen and fuel.
- Use fluid/gas tankers.

Primary bottlenecks:

- Tanker capacity.
- Ice availability.
- Processing rate.
- Fuel allocation between shipping and production.

### Game Stage 4: Automated Logistics Network

- Unlock route rules and stock thresholds.
- Maintain colony inventories.
- Export surplus.
- Prefer good transfer windows.

Primary bottlenecks:

- Route congestion.
- Fuel efficiency.
- Storage buffers.
- Bad orbital alignment.

### Game Stage 5: Shipbuilding And Advanced Materials

- Build ships locally.
- Produce advanced processed materials.
- Grow colonies through higher need tiers.
- Specialize ship hulls and industrial hubs.

Primary bottlenecks:

- Advanced material chains.
- Shipyard throughput.
- Colony upgrade requirements.
- Specialist industry capacity.

### Game Stage 6: System-Scale Corporation

- Manage multiple colonies and asteroid clusters.
- Scale automated logistics.
- Expand into broader system regions.
- Push bigger-number production and colony growth.

Primary bottlenecks:

- Network fragility.
- Fleet composition.
- Large-scale storage.
- Automation priorities.
- Advanced research.

## Economy

The economy should be simple and predictable.

- Earth always buys and sells key resources at fixed prices.
- Fixed prices may unlock by resource or region, but do not fluctuate.
- Contracts are not the main economy.
- Milestone goals and operational events may ask for deliveries, but not speculative trading.
- Profit comes from production rate, logistics efficiency, scale, and self-sufficiency.

## Events

Events should create operational pressure without changing the game into a market simulator.

Examples:

- Solar storm increases travel risk or pauses launches.
- Launch delay slows Earth imports.
- Equipment fault reduces mine/refinery output.
- Rescue request asks for passenger/crew ship use.
- Supply emergency creates a temporary priority shipment.
- Route disruption raises fuel/time temporarily.

Events should be recoverable and readable. They should create decisions, not random punishment.

## IAP Principles

IAP is not part of the first prototype, but the game should avoid painting itself into a corner.

Principles:

- Do not design pain to sell relief.
- Do not sell essential automation, life-support recovery, or basic UI clarity.
- Do not sell speculative market advantages because the game has no price speculation.
- Prefer optional cosmetics, supporter packs, nonessential convenience, scenarios, or expansions.
- Save and entitlement architecture should be cloud-ready later.

## Acceptance Criteria

- A first-time player understands the first loop within 5 minutes: survey, mine, ship, sell.
- AFK progress works naturally and stops at understandable bottlenecks.
- Earth trade is stable and predictable, with no price speculation.
- Surveying feels like an active core mechanic, not just a passive unlock button.
- Colony growth clearly creates both more capacity and more obligations.
- New colony tiers require new processed materials, not just larger quantities of old ones.
- Life-support shortages slow and pressure the player without feeling like a harsh fail state.
- Transfer windows are visible and understandable from the system map.
- Automation feels like a major earned upgrade after early manual logistics.
- Shipbuilding feels like a meaningful transition away from Earth dependence.
- Mobile UI is task-first and manageable, not a compressed desktop layout.

## Open Questions

- What exact visual palette should the NASA-industrial command style use?
- How complex should the first survey minigame interaction be?
- Should early route fuel use be explicit fuel, money-like launch cost, or both?
- What is the first colony location: Earth orbit, lunar orbit, or lunar surface-adjacent habitat?
- What replayability advantages should future playthroughs provide?
- What should the first three colony need tiers require?
