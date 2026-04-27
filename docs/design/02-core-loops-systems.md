# 02 — Core Loops & Systems

## Primary Loop

1. Survey prospects and reveal value confidence.
2. Commit extraction on viable bodies.
3. Ship resources along constrained routes.
4. Process goods through industry chains.
5. Sustain colonies to unlock people capacity and growth tiers.
6. Reinvest into research and automation to scale.

## Secondary Gameplay Loops

### Logistics Loop
- Choose ship, source, destination, cargo, and departure timing.
- Balance ETA, fuel multiplier, and urgency.
- Recover from missed windows, congestion, and idle assets.

### Industry Loop
- Convert raw resources through staged recipes.
- Resolve chain stalls via imports, priority, or capacity upgrades.
- Progress from ore->metals to specialized colony materials.

### Colony Loop
- Maintain water, oxygen, food, and spares.
- Fulfill tier-up requirements for growth.
- Convert colony maturity into strategic workforce leverage.

### Automation Loop
- Unlock new capabilities via research and milestone progression.
- Create rules for repetitive logistics and stock balancing.
- Shift gameplay from manual dispatching to system orchestration.

## Simulation Rules (Design-Level)

- Deterministic elapsed-time simulation is required for AFK continuity.
- Production and transfer systems should obey the same blocking logic both online and offline.
- Offline progress is capped by real bottlenecks (storage, fuel, life support, capacity, route viability).

## Resource, Route, and Economy Rules

- Cargo classes begin as: **solid**, **fluid/gas**, **passenger/crew**.
- Storage limits are intentional strategic pressure.
- Earth market is fixed-price and predictable (non-speculative).
- Contracts reward execution reliability more than timing arbitrage.

## Failure & Recovery Rules

- Warn before hard failure.
- Degrade performance before full stop when possible.
- Always provide direct remediation paths in UI.
