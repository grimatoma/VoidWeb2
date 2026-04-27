# Void Yield 2 UI Views

This document defines the actual game views that Stage 0 concepts should explore. The goal is to make visual concepts compare the same screens across styles instead of producing disconnected cool images.

## Global UI Rules

- The game is menu-heavy and management-first, with the orbital map as the emotional centerpiece.
- Desktop can show multiple panels at once; mobile should show one focused task view at a time.
- Every view should expose: current state, bottleneck, next useful action, and risk/warning when relevant.
- Primary actions should be explicit buttons, icon buttons, toggles, sliders, segmented controls, or menus, not hidden interactions.
- All screens should support AFK/incremental play by showing timers, rates, storage limits, and stalled reasons.
- Economy UI must use fixed prices and predictable demand, never speculative market graphs.

## Core Navigation

Desktop default layout:

- Top status bar: credits, global resources, People Capacity, alert count, game time/speed.
- Left rail: Map, Ops, Survey, Fleet, Colonies, Industry, Research, Milestones.
- Center workspace: selected major view.
- Right inspector: selected object details and contextual actions.
- Bottom strip: active ships, queues, event log, or timeline.

Mobile default layout:

- Top sticky status bar: credits, fuel, alert count, People Capacity.
- Bottom tab nav: Map, Ops, Fleet, Colony, Industry.
- One major view at a time.
- Bottom sheets for selected-object details and actions.

## View 1: System Command

Purpose:

- The main strategic overview of the orbital network.
- Shows where things are, what is moving, and which routes are currently efficient.

Contains:

- Live orbital map with Earth, Moon, asteroids, colonies, ships, and route arcs.
- Transfer-window indicators on routes.
- Global resource summary.
- Bottleneck and alert list.
- Selected object inspector.
- Active fleet/event strip.

Primary actions:

- Select asteroid, ship, colony, or route.
- Open route planner.
- Assign idle ship.
- Inspect transfer window forecast.
- Jump to alert source.
- Change simulation speed.

Key questions:

- Can the player tell what is moving and what needs attention?
- Does the map feel alive without becoming hard to read?

## View 2: Mobile Operations

Purpose:

- The mobile-first daily-management screen.
- Lets the player resolve bottlenecks quickly without precision map interaction.

Contains:

- Critical alerts.
- Active routes.
- Idle ships.
- Production rates.
- AFK progress summary.
- Resource bottlenecks.
- Bottom sheet for selected alert/action.

Primary actions:

- Resolve oxygen/water/fuel/storage alerts.
- Assign an idle ship.
- Import from Earth.
- Pause or resume a route.
- Jump to Fleet, Colony, or Industry detail.
- Collect/review AFK summary.

Key questions:

- Can mobile players manage the game mostly from lists and sheets?
- Are urgent actions reachable in one or two taps?

## View 3: Survey Gameplay

Purpose:

- Core discovery minigame for finding and evaluating asteroids.
- Starts simple and gains layers over time.

Contains:

- Search region map.
- Probe scan cone or scan path.
- Signal waveform/spectrum.
- Candidate asteroid list.
- Selected candidate resource readings.
- Confidence, scan time, and unlockable data layers.

Early data:

- Low/medium/high readings for iron, water ice, nickel, carbon, and rare traces.

Later data:

- Purity.
- Depth.
- Extraction difficulty.
- Hazards.
- Orbital value.
- Rare trace confidence.

Primary actions:

- Pick scan region.
- Retune probe focus.
- Start follow-up scan.
- Prioritize composition, orbit, or hazard data.
- Claim a surveyed asteroid.
- Assign survey automation once unlocked.

Key questions:

- Does surveying feel like discovery instead of a passive button?
- Are uncertainty and confidence understandable?

## View 4: Colony Needs

Purpose:

- Shows why colonies are powerful and demanding.
- Makes People Capacity, life support, and growth-tier material needs readable.

Contains:

- Population.
- People Capacity.
- Happiness/effective capacity.
- Life support bars: water, oxygen, food, spares.
- Growth status.
- Next tier material checklist.
- Shortage effects and recovery options.
- Optional 3D habitat preview.

Primary actions:

- Import missing resource from Earth.
- Assign tanker/cargo route.
- Prioritize local production.
- Upgrade habitat tier.
- Pause growth.
- Inspect shortage source.

Key questions:

- Does colony growth feel valuable enough to justify upkeep?
- Are shortages stressful but recoverable?

## View 5: Fleet And Route Planning

Purpose:

- Manages ships, cargo classes, routes, fuel, and transfer timing.

Contains:

- Ship list grouped by solid cargo, fluid/gas tanker, passenger/crew.
- Ship status: idle, loading, in transit, unloading, maintenance.
- Cargo capacity and compatibility.
- Route planner.
- Fuel/time estimate.
- Transfer-window forecast.
- Repeat count or route behavior.

Primary actions:

- Assign ship route.
- Select cargo.
- Choose source/destination.
- Set repeat count.
- Compare depart now vs wait.
- Buy ship from Earth.
- Later: build ship locally.

Key questions:

- Does the player understand why a route costs more or less now?
- Is manual logistics clear before automation unlocks?

## View 6: Industry And Automation

Purpose:

- Shows production chains, bottlenecks, storage, and later route automation.

Contains:

- Production chain graph.
- Building list and rates.
- Storage by resource.
- Input/output shortages.
- Automation rules.
- Route stock thresholds.
- Export surplus rules.
- Priority controls.

Primary actions:

- Build or upgrade mine/refinery/processor.
- Assign People Capacity.
- Set production priority.
- Configure maintain-stock rule.
- Configure export-surplus rule.
- Prefer good transfer windows.
- Inspect bottleneck.

Key questions:

- Can players see why a chain is stalled?
- Does automation feel like relief without removing strategy?

## Style Matrix For New Concepts

Each core view should be explored in three consistent styles:

1. **Light Mission Control**
   - Mostly off-white/pale steel UI.
   - Dark embedded map or viewport.
   - Clean NASA telemetry feel.

2. **Dark Orbital Command**
   - Mostly dark navy/graphite UI.
   - Cyan route lines, amber warnings, green stable chips.
   - Strongest space-command mood.

3. **Hybrid Corporate Logistics**
   - Dark map/visual core with light management panels.
   - Stronger tables, KPIs, rate cards, and throughput language.
   - Best candidate for long-session readability.

## Concept Output Plan

Keep the original exploratory concepts in `concepts/`.

Add a new grouped matrix in `concepts/cohesive/`:

- `system-command-light.png`
- `system-command-dark.png`
- `system-command-hybrid.png`
- `mobile-ops-light.png`
- `mobile-ops-dark.png`
- `mobile-ops-hybrid.png`
- `survey-light.png`
- `survey-dark.png`
- `survey-hybrid.png`
- `colony-light.png`
- `colony-dark.png`
- `colony-hybrid.png`
- `fleet-light.png`
- `fleet-dark.png`
- `fleet-hybrid.png`
- `industry-light.png`
- `industry-dark.png`
- `industry-hybrid.png`

This creates 18 images grouped by actual view and style, while preserving the first 15 broad exploration concepts.
