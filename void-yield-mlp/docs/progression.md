# Progression — v1 (Outpost Milestone)

The first slice of the game has one explicit goal: **send out a colony ship/outpost**. Everything before that is teaching the player how the economy works; everything after that is a future tier.

## Starting state

- One small space station in Earth orbit.
- Starting credits + a single Hauler-1 docked at Earth.
- No mines or refineries placed yet.
- Earth is the market (infinite buy/sell, never a stockpile).

## Core loop (pre-outpost)

1. **Mine** — drop a Small Mine / Ice Mine on NEA-04 or a Lunar Surface Mine on the Moon to extract resources.
2. **Move** — assign a Hauler-1 route from the mining body back toward Earth.
3. **Sell or process** — sell raw at Earth for cash, or refine first (Smelter, Electrolyzer, Refinery) and sell the upgraded good for a better margin.
4. **Reinvest** — buy more buildings, more ships, or save toward the outpost milestone.

Travel inside the Earth–Moon neighborhood is **near-instant** so this loop reads as logistics-puzzle, not waiting-game. Longer hauls (future destinations beyond the Moon) take real time because of how the kinematic travel model works (below).

## The milestone — outpost dispatch

Once the player has banked enough credits and produced the right tech inputs, they fund a **scout / colony ship** that locates the outpost site and plants the forward base. This is the v1 finish line. Everything past that — surveys, comet mining, sector control — lives in later tiers.

In the current code this maps to the existing T0 → T1 "Lunar Foothold" gate (200 Refined Metal sold + 50 Hydrogen Fuel reserve) and the prefab-kit deployment that follows.

## Time model — compress everything

There is no real-time pacing. All durations are scaled down so a session can run through the loop without idle waiting. AFK catch-up still applies for players who close the tab, but the foreground experience is "things happen quickly enough that decisions matter."

## Travel model — accel → coast → decel

Ships are governed by two stats:

| Stat | Unit | Source | Meaning |
|---|---|---|---|
| `accelUnitsPerSec2` | canvas-units / s² | engine | how hard the ship can burn |
| `maxSpeedUnits` | canvas-units / s | hull / engine cap | cruise ceiling |

Travel time for a leg of distance `d` is the symmetric burn-coast-burn profile:

- Distance to reach max speed: `d_acc = maxSpeed² / (2·accel)`
- If `2·d_acc ≥ d` → never hits cruise (triangular profile): `t = 2·√(d / accel)`
- Otherwise (trapezoidal): `t = 2·(maxSpeed / accel) + (d − 2·d_acc) / maxSpeed`

This naturally produces:

- Earth ↔ Moon / NEA-04 ≈ a few seconds (the hop never reaches cruise).
- Long hauls scale roughly linearly with distance once `maxSpeed` is reached, so a faster ship pulls away on long legs but is no quicker on short ones.

### Stat ownership (today)

For v1 every ship in the catalog (Hauler-1, Scout-1, Miner-1, Tanker-1) has the **same acceleration**. Different ship classes will have **different max speeds**, which is the dimension we expose first. Acceleration is conceptually an engine stat — when engines become swappable in a later tier, that's the lever for differentiating accel.

### Cargo classes (today)

Hulls are single-class in v1:

| Hull | Solid | Fluid | Use |
|---|---|---|---|
| Hauler-1 | 30 | 0 | ore, metals, modules |
| Miner-1 | 60 | 0 | comet runs (long, large hold) |
| Tanker-1 | 0 | 40 | hydrogen_fuel, oxygen, water_ice (when refined off-Earth) |
| Scout-1 | 0 | 0 | survey roundtrips |

A hauler will not accept fluid cargo and vice versa. Combined hulls (mixed solid + fluid slots) are deferred — single-class hulls keep the puzzle "do you own enough of each kind of ship?" rather than "did you fill the right slot?".

The `solveIntercept` solver still does Newton iteration to lead-the-target; only the time-from-distance function is new.

## Failure / loss

None in v1. Ships always make it. Storage caps and stalls are the only ways the player feels friction in this slice.

## Open questions for v2

- Does the outpost generate income passively, or only by being a logistics node for further-out mining?
- When engines become swappable, what's the cost curve so accel upgrades aren't strictly better than buying a faster hull?
- Do comets / surveys live behind the outpost milestone, or alongside it?
