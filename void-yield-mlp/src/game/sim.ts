// Simulation core. One pure-ish function: tick(state, deltaSec) mutates state.
// Foreground tick is 1 Hz; AFK catch-up calls tick() in 1s chunks against the same
// rules. Capacity caps, life-support draws, route progress, and tier-gate checks
// all happen here.

import {
  ADJACENCY_RADIUS,
  BUILDINGS,
  LIFE_SUPPORT,
  POP_TIERS,
  PREFAB_KITS,
  RESOURCES,
  SHIPS,
  TIER_GATE_T0_T1,
} from "./defs";
import type { BuildingId, PrefabKitId, ResourceId, ShipId } from "./defs";
import type {
  AfkSummary,
  AlertItem,
  BodyId,
  BodyState,
  GameState,
  PlacedBuilding,
  PopulationState,
  Ship,
} from "./state";
import { solveIntercept } from "./kepler";
import { startFieldSweep, tickSurvey } from "./survey";

const AFK_HARD_CAP_SEC = 24 * 60 * 60;

// ---------- Capacity ----------
export function getStorageCaps(body: BodyState): { solid: number; fluid: number } {
  let solid = 0;
  let fluid = 0;
  // Earth has implicit infinite — it's the market, not a stockpile.
  if (body.type === "earth") return { solid: Infinity, fluid: Infinity };
  // Habitat gets a small free baseline so prefab arrivals + life-support reserves work.
  if (body.type === "habitat") {
    solid += 200;
    fluid += 120;
  }
  // NEAs and Moon get a small ground-stockpile baseline so first mines aren't
  // dead on arrival before the player builds a Silo. The serious capacity still
  // requires building Silos/Tanks; this just bootstraps the FTUE.
  if (body.type === "nea" || body.type === "moon") {
    solid += 100;
    fluid += 50;
  }
  for (const b of body.buildings) {
    const def = BUILDINGS[b.defId];
    solid += def.storageSolid ?? 0;
    fluid += def.storageFluid ?? 0;
  }
  return { solid, fluid };
}

export function warehouseUsage(body: BodyState): { solid: number; fluid: number } {
  let solid = 0;
  let fluid = 0;
  for (const [rid, qty] of Object.entries(body.warehouse) as [ResourceId, number][]) {
    if (!qty) continue;
    if (RESOURCES[rid].cargo === "solid") solid += qty;
    else fluid += qty;
  }
  return { solid, fluid };
}

export function canStore(body: BodyState, rid: ResourceId, qty: number): number {
  const cap = getStorageCaps(body);
  const usage = warehouseUsage(body);
  const cls = RESOURCES[rid].cargo;
  const free = cls === "solid" ? cap.solid - usage.solid : cap.fluid - usage.fluid;
  return Math.max(0, Math.min(qty, free));
}

// ---------- Adjacency ----------
function adjacencyMultiplierFor(b: PlacedBuilding, body: BodyState): number {
  const def = BUILDINGS[b.defId];
  if (!def.adjacencyPair || !def.adjacencyBonus) return 1.0;
  let bonus = 0;
  for (const other of body.buildings) {
    if (other.id === b.id) continue;
    const otherDef = BUILDINGS[other.defId];
    if (otherDef.isStorage) continue; // storage is neutral
    if (!def.adjacencyPair.includes(other.defId)) continue;
    const dx = Math.abs(other.x - b.x);
    const dy = Math.abs(other.y - b.y);
    if (Math.max(dx, dy) <= ADJACENCY_RADIUS) {
      bonus += def.adjacencyBonus;
    }
  }
  // MLP cap: at most one matching neighbor counts toward the bonus to keep math simple.
  return 1 + Math.min(bonus, def.adjacencyBonus);
}

export function getAdjacencyMultiplier(b: PlacedBuilding, body: BodyState): number {
  return adjacencyMultiplierFor(b, body);
}

// ---------- Production ----------
function tickBuilding(
  b: PlacedBuilding,
  body: BodyState,
  dt: number,
  cyclesAccum: Partial<Record<BuildingId, number>>,
): { stalled: false } | { stalled: true; reason: string } {
  const def = BUILDINGS[b.defId];
  if (def.passive || def.isStorage) return { stalled: false };
  if (b.paused) return { stalled: true, reason: "paused" };
  if (def.cycleSec === 0) return { stalled: false };

  const mult = adjacencyMultiplierFor(b, body); // multiplier on effective speed

  // Check inputs available for next cycle (only when starting a new cycle)
  if (b.cycleProgress <= 0) {
    for (const [rid, q] of Object.entries(def.inputs) as [ResourceId, number][]) {
      if ((body.warehouse[rid] ?? 0) < q) {
        return { stalled: true, reason: `no ${RESOURCES[rid].name}` };
      }
    }
    // Check output room
    for (const [rid, q] of Object.entries(def.outputs) as [ResourceId, number][]) {
      if (canStore(body, rid, q) < q) {
        return { stalled: true, reason: `${RESOURCES[rid].name} storage full` };
      }
    }
    // Consume inputs at start of cycle
    for (const [rid, q] of Object.entries(def.inputs) as [ResourceId, number][]) {
      body.warehouse[rid] = (body.warehouse[rid] ?? 0) - q;
    }
  }

  b.cycleProgress += dt * mult;

  while (b.cycleProgress >= def.cycleSec) {
    // Output one cycle's worth, IF storage allows; otherwise stop and refund inputs already gone (we don't refund in MLP — outputs just halt).
    let outputBlocked = false;
    for (const [rid, q] of Object.entries(def.outputs) as [ResourceId, number][]) {
      if (canStore(body, rid, q) < q) {
        outputBlocked = true;
        break;
      }
    }
    if (outputBlocked) {
      b.cycleProgress = def.cycleSec; // hold at full, retry next tick
      return { stalled: true, reason: "output storage full" };
    }
    for (const [rid, q] of Object.entries(def.outputs) as [ResourceId, number][]) {
      body.warehouse[rid] = (body.warehouse[rid] ?? 0) + q;
    }
    cyclesAccum[b.defId] = (cyclesAccum[b.defId] ?? 0) + 1;
    b.cycleProgress -= def.cycleSec;

    // Only pre-consume inputs for the *next* cycle if we still have leftover
    // progress to commit to it. Otherwise, leave inputs in the warehouse and
    // let the next tick treat cycleProgress=0 as the start of a fresh cycle.
    // (Earlier we pre-consumed unconditionally, which caused tick(cycleSec) to
    //  consume two batches of inputs but only emit one batch of outputs.)
    if (b.cycleProgress <= 0) break;

    let canContinue = true;
    for (const [rid, q] of Object.entries(def.inputs) as [ResourceId, number][]) {
      if ((body.warehouse[rid] ?? 0) < q) {
        canContinue = false;
        break;
      }
    }
    if (!canContinue) {
      b.cycleProgress = 0;
      break;
    }
    for (const [rid, q] of Object.entries(def.inputs) as [ResourceId, number][]) {
      body.warehouse[rid] = (body.warehouse[rid] ?? 0) - q;
    }
  }
  return { stalled: false };
}

// ---------- Life support / population ----------
function tickPopulation(
  pop: PopulationState,
  body: BodyState,
  dt: number,
  popDelta: Record<string, number>,
): void {
  if (pop.pop <= 0 && pop.suspended) return;

  // Continuous draws scaled by population
  const popN = pop.pop;
  const drawWater = LIFE_SUPPORT.water_ice_per_pop_sec * popN * dt;
  const drawO2 = LIFE_SUPPORT.oxygen_per_pop_sec * popN * dt;
  const drawFood = LIFE_SUPPORT.food_pack_per_pop_sec * popN * dt;

  const consume = (rid: ResourceId, want: number): number => {
    const have = body.warehouse[rid] ?? 0;
    const taken = Math.min(have, want);
    body.warehouse[rid] = have - taken;
    return taken;
  };

  const tookWater = consume("water_ice", drawWater);
  const tookO2 = consume("oxygen", drawO2);
  const tookFood = consume("food_pack", drawFood);

  const shortageWater = tookWater < drawWater - 1e-6;
  const shortageO2 = tookO2 < drawO2 - 1e-6;
  const shortageFood = tookFood < drawFood - 1e-6;
  const anyShortage = shortageWater || shortageO2 || shortageFood;

  pop.growthPaused = anyShortage;
  pop.suspended = false;

  if (!anyShortage) {
    // Settle-in progress toward next tier
    const tierIndex = POP_TIERS.findIndex((t) => t.id === pop.tier);
    const nextTier = POP_TIERS[tierIndex + 1];
    if (nextTier) {
      pop.settleProgressSec += dt;
      if (pop.settleProgressSec >= nextTier.settleInSec) {
        // require bundle items present in warehouse to advance
        let bundleOK = true;
        for (const [rid, q] of Object.entries(nextTier.bundle) as [ResourceId, number][]) {
          if ((body.warehouse[rid] ?? 0) < q) {
            bundleOK = false;
            break;
          }
        }
        if (bundleOK) {
          for (const [rid, q] of Object.entries(nextTier.bundle) as [ResourceId, number][]) {
            body.warehouse[rid] = (body.warehouse[rid] ?? 0) - q;
          }
          pop.tier = nextTier.id;
          pop.settleProgressSec = 0;
          pop.cap = Math.floor(pop.cap * nextTier.capacityMultiplier);
          popDelta[`${pop.bodyId}_tier_${nextTier.id}`] = 1;
        } else {
          // wait at threshold for bundle
          pop.settleProgressSec = nextTier.settleInSec;
        }
      }
    }
    // Pop growth — slow drip toward cap
    if (pop.pop < pop.cap) {
      // ~1 pop per 30s of healthy life support
      const grew = dt * (1 / 30);
      pop.pop = Math.min(pop.cap, pop.pop + grew);
      popDelta[pop.bodyId] = (popDelta[pop.bodyId] ?? 0) + grew;
    }
  }
}

// ---------- Routes / ships ----------
function tickShip(
  ship: Ship,
  state: GameState,
  dt: number,
  summary: { deliveries: number; netCredits: number; resourceDelta: Partial<Record<ResourceId, number>> },
): void {
  const r = ship.route;
  if (!r) return;

  if (ship.status === "loading") {
    // Already loaded synchronously when route started (MLP simplification).
    ship.status = "transit";
  }
  if (ship.status === "transit") {
    r.travelSecRemaining -= dt;
    if (r.travelSecRemaining <= 0) {
      const destBody = state.bodies[r.toBodyId];
      // Unload
      if (r.cargoResource && r.cargoQty > 0) {
        if (r.sellOnArrival && destBody.type === "earth") {
          const def = RESOURCES[r.cargoResource];
          const earned = def.earthSell * r.cargoQty;
          state.credits += earned;
          summary.netCredits += earned;
          summary.deliveries += 1;
          summary.resourceDelta[r.cargoResource] =
            (summary.resourceDelta[r.cargoResource] ?? 0) - r.cargoQty;
          if (r.cargoResource === "refined_metal") {
            state.refinedMetalSoldLifetime += r.cargoQty;
          }
          pushLog(state, `${ship.name} delivered ${r.cargoQty} ${def.name} to Earth · +$${earned}`);
        } else {
          const accepted = canStore(destBody, r.cargoResource, r.cargoQty);
          destBody.warehouse[r.cargoResource] =
            (destBody.warehouse[r.cargoResource] ?? 0) + accepted;
          summary.deliveries += 1;
          if (accepted < r.cargoQty) {
            pushAlert(state, {
              severity: "warning",
              title: `${ship.name} dropped ${accepted}/${r.cargoQty} — ${destBody.name} storage full`,
              bodyId: destBody.id,
            });
          }
          pushLog(
            state,
            `${ship.name} unloaded ${accepted} ${RESOURCES[r.cargoResource].name} at ${destBody.name}`,
          );
        }
      }
      ship.locationBodyId = r.toBodyId;
      const repeat = r.repeat;
      const fromBody = r.fromBodyId;
      const cargoResource = r.cargoResource;
      ship.route = null;
      ship.status = "idle";
      handleArrival(state, ship, { repeat, fromBody, cargoResource });
    }
  }
}

/**
 * Post-arrival dispatcher. The ship has already been switched to idle at the
 * destination — this routes to the right per-op handler so adding a new
 * persistent ship op (escort, patrol, refuel-loop) is one new branch instead
 * of growing the if/else chain inside `tickShip`.
 */
function handleArrival(
  state: GameState,
  ship: Ship,
  arrival: { repeat: boolean; fromBody: BodyId; cargoResource: ResourceId | null },
): void {
  if (ship.scoutOp) {
    handleScoutArrival(state, ship);
    return;
  }
  if (arrival.repeat && arrival.cargoResource) {
    // Outbound leg of a mining op just delivered. Send the ship back empty
    // to the origin; the loop's next outbound dispatch fires on return arrival.
    startRoute(state, ship, ship.locationBodyId, arrival.fromBody, null, false, false);
    return;
  }
  if (ship.miningOp && ship.locationBodyId === ship.miningOp.fromBodyId) {
    // Empty return leg of a mining op just arrived at origin. Re-issue the
    // loaded outbound leg using the saved op config — but if a stock-maintain
    // trigger is set and origin hasn't accumulated enough yet, leave the ship
    // idle here and keep miningOp in place. tryResumeMiningOp() will retry on
    // each tick once production refills the stockpile.
    const op = ship.miningOp;
    if (op.minOriginStock !== undefined) {
      const have = state.bodies[op.fromBodyId].warehouse[op.cargoResource] ?? 0;
      if (have < op.minOriginStock) return;
    }
    const result = startRoute(
      state,
      ship,
      op.fromBodyId,
      op.toBodyId,
      op.cargoResource,
      op.sellOnArrival,
      true,
      op.cargoQty,
      op.minOriginStock,
    );
    if (!result.ok) {
      ship.miningOp = null;
      pushAlert(state, {
        severity: "warning",
        title: `${ship.name} mining op halted: ${result.reason}`,
        bodyId: ship.locationBodyId,
      });
    }
  }
}

/**
 * Per-tick retry for paused mining ops. A loop with `minOriginStock` set will
 * sit idle at origin until the stockpile crosses the threshold, then resume
 * automatically. Cheap O(ships) check; safe to run every tick.
 */
function tryResumeMiningOp(state: GameState, ship: Ship): void {
  if (ship.status !== "idle" || ship.route) return;
  const op = ship.miningOp;
  if (!op) return;
  if (op.minOriginStock === undefined) return;
  if (ship.locationBodyId !== op.fromBodyId) return;
  const have = state.bodies[op.fromBodyId].warehouse[op.cargoResource] ?? 0;
  if (have < op.minOriginStock) return;
  startRoute(
    state,
    ship,
    op.fromBodyId,
    op.toBodyId,
    op.cargoResource,
    op.sellOnArrival,
    true,
    op.cargoQty,
    op.minOriginStock,
  );
}

/**
 * Scout roundtrip arrival. Outbound at target → flip to return leg.
 * Return at Earth → refresh the survey roster, reveal the next undiscovered
 * comet, clear the op.
 */
function handleScoutArrival(state: GameState, ship: Ship): void {
  const op = ship.scoutOp;
  if (!op) return;
  if (op.leg === "outbound" && ship.locationBodyId === op.targetBodyId) {
    op.leg = "return";
    startRoute(state, ship, ship.locationBodyId, "earth", null, false, false);
    return;
  }
  if (op.leg === "return" && ship.locationBodyId === "earth") {
    completeScoutMission(state, ship);
  }
}

/**
 * Scout report: fresh candidates, sweep auto-completes so the player can
 * prospect immediately, and one previously-hidden comet is revealed (the
 * "near where a scouting ship is" detail — v1 picks the first undiscovered
 * comet in registration order). Pulled out as a helper so tests can target
 * it directly without setting up a full roundtrip.
 */
function completeScoutMission(state: GameState, ship: Ship): void {
  const seed = Math.floor(Math.random() * 1e9);
  startFieldSweep(state.survey, seed);
  state.survey.fieldElapsed = state.survey.fieldDuration;
  ship.scoutOp = null;
  const revealedComet = revealNextHiddenComet(state);
  pushLog(state, `${ship.name} returned with scout data — survey roster refreshed`);
  pushAlert(state, {
    severity: "info",
    title: `${ship.name} scout mission complete — new candidates available`,
  });
  if (revealedComet) {
    const comet = state.bodies[revealedComet];
    pushLog(state, `${ship.name} catalogued ${comet.name} — Miner-1 can now route there`);
    pushAlert(state, {
      severity: "info",
      title: `${comet.name} discovered — comet mining available`,
      bodyId: revealedComet,
    });
  }
}

function revealNextHiddenComet(state: GameState): BodyId | null {
  for (const body of Object.values(state.bodies)) {
    if (body.type === "comet" && body.discovered === false) {
      body.discovered = true;
      return body.id;
    }
  }
  return null;
}

// ---------- Top-level tick ----------
export function tick(
  state: GameState,
  dt: number,
  // Accumulator passed during AFK catch-up; foreground passes a fresh one each tick.
  collector?: AfkSummary,
): void {
  const startCredits = state.credits;
  const summary = {
    deliveries: 0,
    netCredits: 0,
    resourceDelta: {} as Partial<Record<ResourceId, number>>,
  };

  state.gameTimeSec += dt;

  // Production
  const cyclesByBuilding: Partial<Record<BuildingId, number>> = {};
  for (const body of Object.values(state.bodies)) {
    for (const b of body.buildings) {
      tickBuilding(b, body, dt, cyclesByBuilding);
    }
  }

  // Life support / population
  const popDelta: Record<string, number> = {};
  for (const pop of Object.values(state.populations)) {
    if (!pop) continue;
    tickPopulation(pop, state.bodies[pop.bodyId], dt, popDelta);
  }

  // Ships
  for (const ship of state.ships) {
    tickShip(ship, state, dt, summary);
  }
  // Resume any mining op paused on a stock-maintain trigger now that
  // production this tick may have crossed the threshold.
  for (const ship of state.ships) {
    tryResumeMiningOp(state, ship);
  }

  // Survey (asteroid field sweep / prospecting). Pure data-side; no
  // side-effects on the world state until the player explicitly stakes a
  // candidate from the UI.
  tickSurvey(state.survey, dt);

  // Tier-gate check
  if (
    !state.tierUpReady &&
    state.tier === 0 &&
    state.refinedMetalSoldLifetime >= TIER_GATE_T0_T1.conditions.refinedMetalSold
  ) {
    const earthFuel = state.bodies.earth.warehouse.hydrogen_fuel ?? 0;
    const neaFuel = state.bodies.nea_04.warehouse.hydrogen_fuel ?? 0;
    const totalFuel = earthFuel + neaFuel;
    if (totalFuel >= TIER_GATE_T0_T1.conditions.hydrogenFuelReserves) {
      state.tierUpReady = true;
      pushAlert(state, {
        severity: "info",
        title: "T1 ready: Lunar Foothold available",
      });
      pushLog(state, "T1 ready: Lunar Foothold available");
    }
  }

  // Generate dynamic alerts (simple rules, deduped by stable key)
  generateOpsAlerts(state);

  // AFK collector
  if (collector) {
    collector.netCredits += state.credits - startCredits;
    collector.deliveries += summary.deliveries;
    for (const [rid, qty] of Object.entries(summary.resourceDelta) as [ResourceId, number][]) {
      collector.resourceDelta[rid] = (collector.resourceDelta[rid] ?? 0) + qty;
    }
    for (const [bid, c] of Object.entries(cyclesByBuilding) as [BuildingId, number][]) {
      collector.cyclesByBuilding[bid] = (collector.cyclesByBuilding[bid] ?? 0) + c;
    }
    for (const [k, v] of Object.entries(popDelta)) {
      collector.popDelta[k] = (collector.popDelta[k] ?? 0) + v;
    }
  }
}

// ---------- AFK catch-up ----------
export function runAfkCatchup(state: GameState, awayMs: number): AfkSummary {
  const cappedAt24h = awayMs > AFK_HARD_CAP_SEC * 1000;
  const awaySec = Math.min(Math.floor(awayMs / 1000), AFK_HARD_CAP_SEC);
  const summary: AfkSummary = {
    awaySec,
    netCredits: 0,
    resourceDelta: {},
    cyclesByBuilding: {},
    deliveries: 0,
    stalls: [],
    popDelta: {},
    cappedAt24h,
  };
  // Run at 1s steps for now. Could be coarsened; MLP is small enough.
  let remaining = awaySec;
  // Use larger steps when there's a lot to chew through to keep load < 100ms.
  const step = remaining > 600 ? 5 : 1;
  while (remaining > 0) {
    const dt = Math.min(step, remaining);
    tick(state, dt, summary);
    remaining -= dt;
  }
  return summary;
}

// ---------- Helpers ----------
export function pushAlert(state: GameState, a: Omit<AlertItem, "id" | "ts">): void {
  // Dedupe by title+bodyId active alerts
  const dupe = state.alerts.find(
    (x) => !x.resolved && x.title === a.title && x.bodyId === a.bodyId,
  );
  if (dupe) return;
  state.alerts.push({
    id: `a_${Math.random().toString(36).slice(2, 9)}`,
    ts: state.gameTimeSec,
    ...a,
  });
}

export function pushLog(state: GameState, text: string): void {
  state.log.push({ ts: state.gameTimeSec, text });
  if (state.log.length > 200) state.log.splice(0, state.log.length - 200);
}

function generateOpsAlerts(state: GameState): void {
  // Idle ship alert
  for (const ship of state.ships) {
    const idleKey = `${ship.name} idle at ${state.bodies[ship.locationBodyId].name}`;
    const existing = state.alerts.find(
      (a) => !a.resolved && a.title.startsWith(`${ship.name} idle`),
    );
    if (ship.status === "idle" && !ship.route) {
      if (!existing) {
        pushAlert(state, {
          severity: "warning",
          title: idleKey,
        });
      }
    } else if (existing) {
      existing.resolved = true;
    }
  }

  // Storage cap alerts
  for (const body of Object.values(state.bodies)) {
    if (body.type === "earth") continue;
    const cap = getStorageCaps(body);
    const usage = warehouseUsage(body);
    const solidPct = cap.solid > 0 ? usage.solid / cap.solid : 0;
    const fluidPct = cap.fluid > 0 ? usage.fluid / cap.fluid : 0;
    const key = `${body.name} storage at cap`;
    const existing = state.alerts.find((a) => !a.resolved && a.title === key && a.bodyId === body.id);
    if (solidPct >= 0.95 || fluidPct >= 0.95) {
      if (!existing) {
        pushAlert(state, { severity: "warning", title: key, bodyId: body.id });
      }
    } else if (existing && solidPct < 0.85 && fluidPct < 0.85) {
      existing.resolved = true;
    }
  }

  // Life support warnings
  for (const pop of Object.values(state.populations)) {
    if (!pop) continue;
    const body = state.bodies[pop.bodyId];
    const o2 = body.warehouse.oxygen ?? 0;
    const water = body.warehouse.water_ice ?? 0;
    const food = body.warehouse.food_pack ?? 0;
    const checks: { rid: ResourceId; have: number; label: string }[] = [
      { rid: "oxygen", have: o2, label: "O2" },
      { rid: "water_ice", have: water, label: "water" },
      { rid: "food_pack", have: food, label: "food" },
    ];
    for (const c of checks) {
      // Reserve hours estimate: have / (per_pop_per_sec * pop * 3600)
      const perSec =
        c.rid === "oxygen"
          ? LIFE_SUPPORT.oxygen_per_pop_sec
          : c.rid === "water_ice"
            ? LIFE_SUPPORT.water_ice_per_pop_sec
            : LIFE_SUPPORT.food_pack_per_pop_sec;
      const reserveSec = pop.pop > 0 ? c.have / Math.max(1e-9, perSec * pop.pop) : Infinity;
      const title = `${body.name} — ${c.label} low`;
      const existing = state.alerts.find(
        (a) => !a.resolved && a.title === title && a.bodyId === body.id,
      );
      if (reserveSec < 60 * 60 * 2) {
        if (!existing) {
          pushAlert(state, { severity: "warning", title, bodyId: body.id });
        }
      } else if (existing) {
        existing.resolved = true;
      }
    }
  }
}

// ---------- Commands ----------
export function startRoute(
  state: GameState,
  ship: Ship,
  fromBodyId: BodyId,
  toBodyId: BodyId,
  cargoResource: ResourceId | null,
  sellOnArrival: boolean,
  repeat: boolean,
  desiredQty?: number,
  // Stock-maintain trigger persisted onto miningOp when repeat+cargo.
  // Only consulted on auto re-dispatch from the loop; the initial player
  // dispatch goes immediately if cargo is on hand.
  minOriginStock?: number,
): { ok: boolean; reason?: string } {
  if (ship.status !== "idle" || ship.route) return { ok: false, reason: "ship busy" };
  if (ship.locationBodyId !== fromBodyId) return { ok: false, reason: `${ship.name} not at origin` };
  const fromBody = state.bodies[fromBodyId];
  const shipDefForCargo = SHIPS[ship.defId];
  let qty = 0;
  if (cargoResource) {
    if (shipDefForCargo.capacitySolid <= 0 && shipDefForCargo.capacityFluid <= 0) {
      return { ok: false, reason: `${ship.name} carries no cargo` };
    }
    const cargoClass = RESOURCES[cargoResource].cargo;
    const cap = cargoClass === "solid" ? shipDefForCargo.capacitySolid : shipDefForCargo.capacityFluid;
    if (cap <= 0) {
      // Hull mismatch: solid-class hull can't hold fluids and vice versa.
      const carries = shipDefForCargo.capacitySolid > 0 ? "solids" : "fluids";
      return { ok: false, reason: `${ship.name} carries ${carries} only` };
    }
    const have = fromBody.warehouse[cargoResource] ?? 0;
    qty = Math.min(have, desiredQty ?? cap, cap);
    if (qty <= 0) return { ok: false, reason: "no cargo at origin" };
  }
  // Fuel mechanic: ships consume hydrogen fuel from origin warehouse if any is on
  // hand; otherwise the leg is free in MLP. Lets the early loop flow before the
  // player builds an Electrolyzer + Tank, while still rewarding fuel stockpiling
  // (fewer Earth-bought fuel kits) at the tier-gate threshold.
  const fuelCost = shipDefForCargo.fuelPerRoute;
  const haveFuel = fromBody.warehouse.hydrogen_fuel ?? 0;
  if (haveFuel >= fuelCost) {
    fromBody.warehouse.hydrogen_fuel = haveFuel - fuelCost;
  }
  // Pick up cargo synchronously (loading is instant in MLP)
  if (cargoResource && qty > 0) {
    fromBody.warehouse[cargoResource] = (fromBody.warehouse[cargoResource] ?? 0) - qty;
  }
  // Travel time comes from the ship's accel→coast→decel kinematic profile
  // applied to the chase distance to where the destination body will be at
  // arrival. See kepler.ts:travelTimeForDistance / solveIntercept.
  const intercept = solveIntercept(
    fromBodyId,
    toBodyId,
    state.gameTimeSec,
    shipDefForCargo.accelUnitsPerSec2,
    shipDefForCargo.maxSpeedUnits,
  );
  const travelSec = intercept.travelSec;
  ship.route = {
    fromBodyId,
    toBodyId,
    cargoResource,
    cargoQty: qty,
    travelSecRemaining: travelSec,
    travelSecTotal: travelSec,
    dispatchGameTimeSec: state.gameTimeSec,
    sellOnArrival,
    repeat,
  };
  ship.status = "transit";
  // A repeating route with cargo is a "mining op" — persist its config on
  // the ship so the empty return leg's arrival can re-fire the outbound.
  // Cases:
  //   - repeat + cargo (player or auto-restart): (re)set miningOp.
  //   - cargo=null + repeat=false + miningOp.toBodyId == fromBodyId: this is
  //     the sim-issued empty return leg of an active op; preserve the op.
  //   - anything else (a fresh one-off dispatch from the player): clear it,
  //     so a manual override doesn't leave a stale loop attached.
  if (repeat && cargoResource) {
    ship.miningOp = {
      fromBodyId,
      toBodyId,
      cargoResource,
      cargoQty: qty,
      sellOnArrival,
      minOriginStock,
    };
  } else {
    const isEmptyReturnLeg =
      !cargoResource && !repeat && ship.miningOp && fromBodyId === ship.miningOp.toBodyId;
    if (!isEmptyReturnLeg) ship.miningOp = null;
  }
  pushLog(
    state,
    `${ship.name} departed ${fromBody.name} → ${state.bodies[toBodyId].name}${
      cargoResource ? ` with ${qty} ${RESOURCES[cargoResource].name}` : ""
    }`,
  );
  return { ok: true };
}

export function stopMiningOp(state: GameState, shipId: string): { ok: boolean; reason?: string } {
  const ship = state.ships.find((s) => s.id === shipId);
  if (!ship) return { ok: false, reason: "ship not found" };
  if (!ship.miningOp) return { ok: false, reason: "no mining op active" };
  ship.miningOp = null;
  pushLog(state, `${ship.name} mining op cancelled — will idle after current leg`);
  return { ok: true };
}

export function placeBuilding(
  state: GameState,
  bodyId: BodyId,
  defId: BuildingId,
  x: number,
  y: number,
): { ok: boolean; reason?: string } {
  const def = BUILDINGS[defId];
  if (def.tier > state.tier) return { ok: false, reason: "tier locked" };
  const body = state.bodies[bodyId];
  if (def.allowedBodyTypes && !def.allowedBodyTypes.includes(body.type)) {
    return { ok: false, reason: "wrong body type" };
  }
  if (x < 0 || y < 0 || x >= body.gridW || y >= body.gridH) {
    return { ok: false, reason: "off-grid" };
  }
  const occupied = body.buildings.some((b) => b.x === x && b.y === y);
  if (occupied) return { ok: false, reason: "tile occupied" };
  if (state.credits < def.cost) return { ok: false, reason: "insufficient credits" };
  state.credits -= def.cost;
  body.buildings.push({
    id: `b_${Math.random().toString(36).slice(2, 9)}`,
    defId,
    x,
    y,
    paused: false,
    cycleProgress: 0,
  });
  pushLog(state, `${def.name} placed on ${body.name}`);
  return { ok: true };
}

export function demolishBuilding(state: GameState, bodyId: BodyId, buildingId: string): void {
  const body = state.bodies[bodyId];
  const idx = body.buildings.findIndex((b) => b.id === buildingId);
  if (idx === -1) return;
  const def = BUILDINGS[body.buildings[idx].defId];
  state.credits += Math.floor(def.cost * 0.5); // 50% refund
  body.buildings.splice(idx, 1);
  pushLog(state, `${def.name} demolished on ${body.name} (50% refund)`);
}

export function buyFromEarth(
  state: GameState,
  rid: ResourceId,
  qty: number,
  toBodyId: BodyId,
): { ok: boolean; reason?: string } {
  const def = RESOURCES[rid];
  const cost = def.earthBuy * qty;
  if (state.credits < cost) return { ok: false, reason: "insufficient credits" };
  const dest = state.bodies[toBodyId];
  // MLP simplification: instant delivery, but constrained by destination storage caps.
  const accepted = canStore(dest, rid, qty);
  if (accepted < qty) return { ok: false, reason: "destination storage full" };
  state.credits -= cost;
  dest.warehouse[rid] = (dest.warehouse[rid] ?? 0) + qty;
  pushLog(state, `Bought ${qty} ${def.name} from Earth → ${dest.name} · -$${cost}`);
  return { ok: true };
}

export function sellToEarth(
  state: GameState,
  rid: ResourceId,
  qty: number,
): { ok: boolean; reason?: string } {
  // Pull only from earth warehouse — selling other-body stock requires shipping.
  const earth = state.bodies.earth;
  const have = earth.warehouse[rid] ?? 0;
  if (have < qty) return { ok: false, reason: "not enough at Earth" };
  const def = RESOURCES[rid];
  earth.warehouse[rid] = have - qty;
  state.credits += def.earthSell * qty;
  if (rid === "refined_metal") state.refinedMetalSoldLifetime += qty;
  pushLog(state, `Sold ${qty} ${def.name} to Earth · +$${def.earthSell * qty}`);
  return { ok: true };
}

export function buyShip(state: GameState, defId: ShipId = "hauler_1"): { ok: boolean; reason?: string } {
  const def = SHIPS[defId];
  if (state.credits < def.earthBuy) return { ok: false, reason: "insufficient credits" };
  state.credits -= def.earthBuy;
  // Naming: derive the prefix from the def's display name ("Hauler-1" → "Hauler",
  // "Scout-1" → "Scout", "Miner-1" → "Miner") so adding a new class never silently
  // borrows the wrong label.
  const n = state.ships.filter((s) => s.defId === defId).length + 1;
  const baseLabel = def.name.replace(/-\d+$/, "");
  const name = `${baseLabel}-${n}`;
  state.ships.push({
    id: `ship_${Math.random().toString(36).slice(2, 9)}`,
    defId,
    name,
    status: "idle",
    locationBodyId: "earth",
    route: null,
  });
  pushLog(state, `${name} purchased at Earth · -$${def.earthBuy.toLocaleString()}`);
  return { ok: true };
}

export function dispatchScoutMission(
  state: GameState,
  shipId: string,
  targetBodyId: BodyId = "nea_04",
): { ok: boolean; reason?: string } {
  const ship = state.ships.find((s) => s.id === shipId);
  if (!ship) return { ok: false, reason: "ship not found" };
  if (ship.defId !== "scout_1") return { ok: false, reason: `${ship.name} is not a scout` };
  if (ship.status !== "idle" || ship.route) return { ok: false, reason: "ship busy" };
  if (ship.locationBodyId !== "earth") return { ok: false, reason: `${ship.name} must launch from Earth` };
  if (targetBodyId === "earth") return { ok: false, reason: "scout target must be off-Earth" };
  ship.scoutOp = { targetBodyId, leg: "outbound" };
  const r = startRoute(state, ship, "earth", targetBodyId, null, false, false);
  if (!r.ok) {
    ship.scoutOp = null;
    return r;
  }
  pushLog(state, `${ship.name} dispatched on scout mission to ${state.bodies[targetBodyId].name}`);
  return { ok: true };
}

export function buyPrefabKit(
  state: GameState,
  kitId: PrefabKitId,
): { ok: boolean; reason?: string } {
  const kit = PREFAB_KITS[kitId];
  if (state.tier < kit.unlockTier) return { ok: false, reason: "T1 required" };
  if (state.credits < kit.cost) return { ok: false, reason: "insufficient credits" };
  // Validate per-kit preconditions before any state mutation, so a failure
  // never leaves credits half-spent.
  if (kitId === "lunar_habitat" && state.populations.lunar_habitat) {
    return { ok: false, reason: "habitat already deployed" };
  }
  if (kitId === "lunar_surface_mine_kit") {
    const tile = findFreeTile(state.bodies.moon);
    if (!tile) return { ok: false, reason: "no free tile on Moon" };
  }
  state.credits -= kit.cost;
  if (kitId === "lunar_habitat") {
    // Drop habitat module + seed pop on lunar_habitat body
    state.bodies.lunar_habitat.warehouse.habitat_module = 1;
    state.populations.lunar_habitat = {
      bodyId: "lunar_habitat",
      pop: 10,
      cap: 50,
      tier: "survival",
      settleProgressSec: 0,
      suspended: false,
      growthPaused: false,
    };
    // Seed initial life-support buffer so the colony has runway
    state.bodies.lunar_habitat.warehouse.water_ice =
      (state.bodies.lunar_habitat.warehouse.water_ice ?? 0) + 30;
    state.bodies.lunar_habitat.warehouse.oxygen =
      (state.bodies.lunar_habitat.warehouse.oxygen ?? 0) + 20;
    state.bodies.lunar_habitat.warehouse.food_pack =
      (state.bodies.lunar_habitat.warehouse.food_pack ?? 0) + 15;
    pushLog(state, "Lunar Habitat deployed · First Habitat live (10 pop, 50 cap)");
    pushAlert(state, {
      severity: "info",
      title: "Habitat Module assembled — First Habitat live",
      bodyId: "lunar_habitat",
    });
  } else if (kitId === "lunar_surface_mine_kit") {
    const moon = state.bodies.moon;
    const tile = findFreeTile(moon)!;
    moon.buildings.push({
      id: `b_${Math.random().toString(36).slice(2, 9)}`,
      defId: "lunar_surface_mine",
      x: tile.x,
      y: tile.y,
      paused: false,
      cycleProgress: 0,
    });
    pushLog(state, "Lunar Surface Mine deployed on Moon (Earth Prefab Kit)");
  } else if (kitId === "construction_cache") {
    const earth = state.bodies.earth.warehouse;
    earth.construction_materials = (earth.construction_materials ?? 0) + 60;
    earth.aluminum = (earth.aluminum ?? 0) + 4;
    earth.habitat_module = (earth.habitat_module ?? 0) + 1;
    pushLog(state, "Construction Cache delivered · +60 Construction Materials · +4 Aluminum · +1 Habitat Module to Earth");
    pushAlert(state, {
      severity: "info",
      title: "Construction Cache landed at Earth depot",
    });
  }
  return { ok: true };
}

function findFreeTile(body: BodyState): { x: number; y: number } | null {
  for (let y = 0; y < body.gridH; y++) {
    for (let x = 0; x < body.gridW; x++) {
      if (!body.buildings.some((b) => b.x === x && b.y === y)) return { x, y };
    }
  }
  return null;
}

export function claimTierUp(state: GameState): { ok: boolean; reason?: string } {
  if (!state.tierUpReady || state.tier !== 0) return { ok: false, reason: "tier-up not ready" };
  state.tier = 1;
  state.tierUpReady = false;
  state.tierUpClaimed[1] = true;
  state.tierUpModalSeen[1] = false;
  pushLog(
    state,
    "T1 Lunar Foothold authorized · habitat construction cleared · life support imports available · pop tier mechanics live",
  );
  pushAlert(state, {
    severity: "info",
    title: "T1 Lunar Foothold authorized",
    body: "habitat construction cleared · life support imports available · pop tier mechanics live",
  });
  return { ok: true };
}
