import { beforeEach, describe, expect, it } from "vitest";
import {
  buyShip,
  dispatchScoutMission,
  startItinerary,
  startRoute,
  stopItinerary,
  stopMiningOp,
  tick,
} from "./sim";
import type { RouteStop } from "./state";
import { fresh } from "../test/helpers";
import { resetRandom } from "../test/setup";

beforeEach(() => resetRandom());

describe("startRoute — preconditions", () => {
  it("rejects when ship not at the from-body", () => {
    const s = fresh();
    const ship = s.ships[0]; // at earth
    const r = startRoute(s, ship, "nea_04", "earth", null, false, false);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not at origin/);
  });

  it("rejects when ship is already on a route", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const r = startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("ship busy");
  });

  it("rejects fluid cargo on Hauler-1 (specialized solid)", () => {
    const s = fresh();
    s.bodies.earth.warehouse.hydrogen_fuel = 50;
    const r = startRoute(s, s.ships[0], "earth", "nea_04", "hydrogen_fuel", false, false);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/solids/);
  });

  it("rejects when cargo isn't available at origin", () => {
    const s = fresh();
    const r = startRoute(s, s.ships[0], "earth", "nea_04", "iron_ore", false, false, 10);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("no cargo at origin");
  });

  it("clamps loaded qty to ship capacity (30 solid)", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 100;
    startRoute(s, s.ships[0], "earth", "nea_04", "iron_ore", false, false, 100);
    expect(s.ships[0].route!.cargoQty).toBe(30);
  });

  it("clamps loaded qty to available stock", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 7;
    startRoute(s, s.ships[0], "earth", "nea_04", "iron_ore", false, false, 30);
    expect(s.ships[0].route!.cargoQty).toBe(7);
  });
});

describe("startRoute — fuel mechanics", () => {
  it("consumes hydrogen_fuel from origin equal to base + per-distance × distance", () => {
    const s = fresh();
    s.bodies.earth.warehouse.hydrogen_fuel = 50;
    const startCredits = s.credits;
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    // Hauler-1: fuelPerRoute=4 + fuelPerDistance=0.05 × cislunar distance.
    // Local stock had 50 (more than enough), so no Earth auto-buy fires.
    const consumed = 50 - (s.bodies.earth.warehouse.hydrogen_fuel ?? 0);
    expect(consumed).toBeGreaterThan(4); // distance term contributes positive fuel
    expect(consumed).toBeLessThan(8); // and stays modest on a cislunar hop
    expect(s.credits).toBe(startCredits); // no auto-buy charge
  });

  it("Earth dispatch auto-buys the fuel shortfall from the market", () => {
    const s = fresh();
    s.bodies.earth.warehouse.hydrogen_fuel = 0; // empty stock
    const startCredits = s.credits;
    const r = startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(r.ok).toBe(true);
    expect(s.bodies.earth.warehouse.hydrogen_fuel).toBe(0); // drained then refilled net-zero
    expect(s.credits).toBeLessThan(startCredits); // charged for top-up
  });

  it("non-Earth dispatch with insufficient fuel rejects with a reason", () => {
    const s = fresh();
    s.ships[0].locationBodyId = "nea_04";
    s.bodies.nea_04.warehouse.hydrogen_fuel = 0; // override helper seed
    const r = startRoute(s, s.ships[0], "nea_04", "earth", null, false, false);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/insufficient fuel/);
  });

  it("Earth auto-buy fails when player can't afford the top-up", () => {
    const s = fresh();
    s.bodies.earth.warehouse.hydrogen_fuel = 0;
    s.credits = 1; // not enough to top-up at earthBuy=8 per fuel unit
    const r = startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/insufficient fuel/);
  });

  it("longer legs cost more fuel (Earth↔Halley costs strictly more than Earth↔NEA-04)", () => {
    const a = fresh();
    a.bodies.earth.warehouse.hydrogen_fuel = 100;
    startRoute(a, a.ships[0], "earth", "nea_04", null, false, false);
    const usedNea = 100 - (a.bodies.earth.warehouse.hydrogen_fuel ?? 0);

    const b = fresh();
    b.credits = 20000;
    buyShip(b, "miner_1");
    const miner = b.ships.find((s) => s.defId === "miner_1")!;
    b.bodies.halley_4.discovered = true;
    b.bodies.earth.warehouse.hydrogen_fuel = 200;
    startRoute(b, miner, "earth", "halley_4", null, false, false);
    const usedHalley = 200 - (b.bodies.earth.warehouse.hydrogen_fuel ?? 0);
    expect(usedHalley).toBeGreaterThan(usedNea);
  });
});

describe("startRoute — loading", () => {
  it("loading is synchronous: cargo leaves origin warehouse on dispatch", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 50;
    startRoute(s, s.ships[0], "earth", "nea_04", "iron_ore", false, false, 30);
    expect(s.bodies.earth.warehouse.iron_ore).toBe(20);
    expect(s.ships[0].route!.cargoQty).toBe(30);
  });

  it("ship enters transit status immediately", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(s.ships[0].status).toBe("transit");
  });

  it("ETA is set to a positive intercept-solved transit time", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    // Travel time comes from the ship's accel→coast→decel profile applied
    // to current orbital geometry. Earth↔NEA-04 (cislunar L4) is a short hop,
    // a handful of seconds — not the minute-plus it used to be.
    expect(s.ships[0].route!.travelSecRemaining).toBeGreaterThan(1);
    expect(s.ships[0].route!.travelSecRemaining).toBeLessThan(60);
  });

  it("records travelSecTotal alongside travelSecRemaining (for solar-map progress)", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(s.ships[0].route!.travelSecTotal).toBe(s.ships[0].route!.travelSecRemaining);
    expect(s.ships[0].route!.travelSecTotal).toBeGreaterThan(0);
  });

  it("stamps dispatchGameTimeSec when the route starts so the lead-target trajectory can be reconstructed", () => {
    const s = fresh();
    s.gameTimeSec = 123;
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(s.ships[0].route!.dispatchGameTimeSec).toBe(123);
  });

  it("travel time scales with orbital geometry — same pair, different dispatch times produce different ETAs", () => {
    const s1 = fresh();
    s1.gameTimeSec = 0;
    startRoute(s1, s1.ships[0], "earth", "nea_04", null, false, false);
    const s2 = fresh();
    s2.gameTimeSec = 240;
    startRoute(s2, s2.ships[0], "earth", "nea_04", null, false, false);
    // Short cislunar hops are quick now, so the geometric variation is small
    // — but it should still register, since Earth has moved between dispatches.
    expect(Math.abs(s1.ships[0].route!.travelSecTotal - s2.ships[0].route!.travelSecTotal)).toBeGreaterThan(0.05);
  });
});

describe("delivery & sale on arrival", () => {
  it("ship lands at destination and switches to idle", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.ships[0].locationBodyId).toBe("nea_04");
    expect(s.ships[0].status).toBe("idle");
    expect(s.ships[0].route).toBeNull();
  });

  it("sell-on-arrival at Earth credits the player at earthSell", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04"; // already at NEA
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, false, 10);
    const startCredits = s.credits;
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.credits).toBe(startCredits + 10 * 12); // earthSell for refined_metal = 12
  });

  it("sale of refined_metal updates refinedMetalSoldLifetime", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, false, 30);
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.refinedMetalSoldLifetime).toBe(30);
  });

  it("non-sale delivery to a non-Earth body adds to that body's warehouse", () => {
    const s = fresh();
    s.tier = 1;
    s.populations.lunar_habitat = {
      bodyId: "lunar_habitat",
      pop: 10,
      cap: 50,
      tier: "survival",
      settleProgressSec: 0,
      suspended: false,
      growthPaused: false,
    };
    s.bodies.earth.warehouse.iron_ore = 30;
    startRoute(s, s.ships[0], "earth", "lunar_habitat", "iron_ore", false, false, 30);
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.bodies.lunar_habitat.warehouse.iron_ore).toBe(30);
  });

  it("delivery clamps to destination capacity, leaves remainder dropped", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.iron_ore = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "moon", "iron_ore", false, false, 30);
    s.bodies.moon.warehouse.iron_ore = 95; // moon cap 100 (baseline)
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.bodies.moon.warehouse.iron_ore).toBe(100);
  });

  it("repeat=true sends ship back empty to origin", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10);
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.ships[0].route).not.toBeNull();
    expect(s.ships[0].route!.fromBodyId).toBe("earth");
    expect(s.ships[0].route!.toBodyId).toBe("nea_04");
    expect(s.ships[0].route!.cargoResource).toBeNull();
  });

  it("logs a sale entry on Earth delivery", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 10;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, false, 10);
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.log.some((l) => l.text.match(/delivered 10 Refined Metal to Earth/))).toBe(true);
  });
});

describe("mining ops — auto-repeat loop", () => {
  it("repeat=true with cargo records a miningOp on the ship", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10);
    expect(s.ships[0].miningOp).toEqual({
      fromBodyId: "nea_04",
      toBodyId: "earth",
      cargoResource: "refined_metal",
      cargoQty: 10,
      sellOnArrival: true,
    });
  });

  it("the empty return leg preserves miningOp; restart fires when it lands at origin", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 60;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10);
    // Outbound arrives at earth, sells, dispatches empty return
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.ships[0].route).not.toBeNull();
    expect(s.ships[0].route!.fromBodyId).toBe("earth");
    expect(s.ships[0].route!.cargoResource).toBeNull();
    // miningOp survives the empty return dispatch
    expect(s.ships[0].miningOp).not.toBeNull();
    // Empty return arrives at NEA — auto-restart should fire a fresh outbound
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.ships[0].route).not.toBeNull();
    expect(s.ships[0].route!.fromBodyId).toBe("nea_04");
    expect(s.ships[0].route!.toBodyId).toBe("earth");
    expect(s.ships[0].route!.cargoResource).toBe("refined_metal");
    expect(s.ships[0].route!.cargoQty).toBe(10);
  });

  it("auto-restart halts (op cleared, ship idles) when origin is dry on return", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 10; // exactly one cycle's worth
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10);
    tick(s, s.ships[0].route!.travelSecTotal); // delivers, dispatches return
    tick(s, s.ships[0].route!.travelSecTotal); // return lands at empty NEA
    expect(s.ships[0].route).toBeNull();
    expect(s.ships[0].status).toBe("idle");
    expect(s.ships[0].miningOp).toBeNull();
    expect(s.alerts.some((a) => !a.resolved && a.title.match(/mining op halted/))).toBe(true);
  });

  it("stopMiningOp clears the op; current leg finishes, ship idles on return", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 60;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10);
    expect(s.ships[0].miningOp).not.toBeNull();
    stopMiningOp(s, s.ships[0].id);
    expect(s.ships[0].miningOp).toBeNull();
    // Outbound still completes, return leg dispatches as before
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.ships[0].route!.cargoResource).toBeNull();
    // Return arrives at NEA — without miningOp, no auto-restart
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.ships[0].route).toBeNull();
    expect(s.ships[0].status).toBe("idle");
  });

  it("a fresh non-repeat dispatch clears a prior miningOp on the ship", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 60;
    // Seed a miningOp directly without running the sim through return-arrival
    s.ships[0].miningOp = {
      fromBodyId: "earth",
      toBodyId: "nea_04",
      cargoResource: "iron_ore",
      cargoQty: 5,
      sellOnArrival: false,
    };
    startRoute(s, s.ships[0], "earth", "nea_04", "iron_ore", false, false, 10);
    expect(s.ships[0].miningOp).toBeNull();
  });

  it("stopMiningOp on a ship without an active op returns ok=false", () => {
    const s = fresh();
    const r = stopMiningOp(s, s.ships[0].id);
    expect(r.ok).toBe(false);
  });
});

describe("Scout-1 ship class", () => {
  it("buyShip('scout_1') drops a Scout-1 docked at Earth", () => {
    const s = fresh();
    s.credits = 10000;
    const r = buyShip(s, "scout_1");
    expect(r.ok).toBe(true);
    const scout = s.ships.find((sh) => sh.defId === "scout_1");
    expect(scout).toBeTruthy();
    expect(scout!.locationBodyId).toBe("earth");
    expect(scout!.status).toBe("idle");
    expect(scout!.name).toBe("Scout-1");
  });

  it("scouts reject cargo on routes (capacitySolid=0)", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "scout_1");
    const scout = s.ships.find((sh) => sh.defId === "scout_1")!;
    s.bodies.earth.warehouse.iron_ore = 30;
    const r = startRoute(s, scout, "earth", "nea_04", "iron_ore", false, false, 30);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/no cargo|carries no cargo/);
  });

  it("scouts can fly empty routes (cargo=null)", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "scout_1");
    const scout = s.ships.find((sh) => sh.defId === "scout_1")!;
    const r = startRoute(s, scout, "earth", "nea_04", null, false, false);
    expect(r.ok).toBe(true);
    expect(scout.status).toBe("transit");
  });

  it("haulers correctly use shipDef.capacitySolid (not the old hard-coded 30)", () => {
    // Existing hauler default is 30, so this should still clamp to 30.
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 100;
    startRoute(s, s.ships[0], "earth", "nea_04", "iron_ore", false, false, 100);
    expect(s.ships[0].route!.cargoQty).toBe(30);
  });
});

describe("scout missions — dispatchScoutMission", () => {
  it("rejects on non-scout ships", () => {
    const s = fresh();
    const r = dispatchScoutMission(s, s.ships[0].id);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not a scout/);
  });

  it("requires the scout to be at Earth", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "scout_1");
    const scout = s.ships.find((sh) => sh.defId === "scout_1")!;
    scout.locationBodyId = "nea_04";
    const r = dispatchScoutMission(s, scout.id);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/Earth/);
  });

  it("dispatch sets scoutOp.leg=outbound and routes Earth→target", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "scout_1");
    const scout = s.ships.find((sh) => sh.defId === "scout_1")!;
    const r = dispatchScoutMission(s, scout.id);
    expect(r.ok).toBe(true);
    expect(scout.scoutOp).toEqual({ targetBodyId: "nea_04", leg: "outbound" });
    expect(scout.route!.fromBodyId).toBe("earth");
    expect(scout.route!.toBodyId).toBe("nea_04");
  });

  it("on arrival at target, flips to return leg back to Earth", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "scout_1");
    const scout = s.ships.find((sh) => sh.defId === "scout_1")!;
    dispatchScoutMission(s, scout.id);
    tick(s, scout.route!.travelSecTotal);
    expect(scout.scoutOp).not.toBeNull();
    expect(scout.scoutOp!.leg).toBe("return");
    expect(scout.route!.fromBodyId).toBe("nea_04");
    expect(scout.route!.toBodyId).toBe("earth");
  });

  it("on return to Earth, refreshes the survey roster and clears scoutOp", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "scout_1");
    const scout = s.ships.find((sh) => sh.defId === "scout_1")!;
    expect(s.survey.candidates.length).toBe(0);
    dispatchScoutMission(s, scout.id);
    tick(s, scout.route!.travelSecTotal); // outbound arrives
    tick(s, scout.route!.travelSecTotal); // return arrives at Earth
    expect(scout.scoutOp).toBeNull();
    expect(scout.status).toBe("idle");
    expect(scout.locationBodyId).toBe("earth");
    expect(s.survey.candidates.length).toBeGreaterThan(0);
    // Sweep auto-completes (player can prospect immediately)
    expect(s.survey.fieldElapsed).toBe(s.survey.fieldDuration);
  });

  it("logs an alert on scout-mission completion", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "scout_1");
    const scout = s.ships.find((sh) => sh.defId === "scout_1")!;
    dispatchScoutMission(s, scout.id);
    tick(s, scout.route!.travelSecTotal);
    tick(s, scout.route!.travelSecTotal);
    expect(s.alerts.some((a) => !a.resolved && a.title.match(/scout mission complete/))).toBe(true);
  });
});

describe("Miner-1 + comets", () => {
  it("Halley-IV starts hidden (discovered=false) at game start", () => {
    const s = fresh();
    expect(s.bodies.halley_4).toBeTruthy();
    expect(s.bodies.halley_4.discovered).toBe(false);
    expect(s.bodies.halley_4.type).toBe("comet");
    expect(s.bodies.halley_4.warehouse.water_ice).toBeGreaterThan(0);
  });

  it("Miner-1 carries 60 solid (twice the Hauler) and is buyable", () => {
    const s = fresh();
    s.credits = 10000;
    const r = buyShip(s, "miner_1");
    expect(r.ok).toBe(true);
    const miner = s.ships.find((sh) => sh.defId === "miner_1");
    expect(miner).toBeTruthy();
    expect(miner!.locationBodyId).toBe("earth");
  });

  it("scout return discovers Halley-IV (flips its discovered flag)", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "scout_1");
    const scout = s.ships.find((sh) => sh.defId === "scout_1")!;
    dispatchScoutMission(s, scout.id);
    tick(s, scout.route!.travelSecTotal); // outbound arrives
    tick(s, scout.route!.travelSecTotal); // return arrives at Earth
    expect(s.bodies.halley_4.discovered).toBe(true);
    expect(s.alerts.some((a) => !a.resolved && a.title.match(/Halley/))).toBe(true);
  });

  it("Miner-1 can route Earth→Halley once discovered, return loaded with comet ore", () => {
    const s = fresh();
    s.credits = 20000;
    buyShip(s, "miner_1");
    s.bodies.halley_4.discovered = true; // pretend the scout has come back
    const miner = s.ships.find((sh) => sh.defId === "miner_1")!;
    // Outbound empty Earth → comet
    const out = startRoute(s, miner, "earth", "halley_4", null, false, false);
    expect(out.ok).toBe(true);
    tick(s, miner.route!.travelSecTotal);
    expect(miner.locationBodyId).toBe("halley_4");
    // Return loaded with water_ice
    const back = startRoute(s, miner, "halley_4", "earth", "water_ice", true, false, 60);
    expect(back.ok).toBe(true);
    expect(miner.route!.cargoQty).toBe(60); // Miner cap = 60, comet has plenty
    tick(s, miner.route!.travelSecTotal);
    expect(miner.locationBodyId).toBe("earth");
    expect(s.credits).toBeGreaterThan(20000 - 5500 - 5500); // sold ice for some credits
  });
});

describe("tanker_1 — fluid hauling", () => {
  it("buyShip names a Tanker-1 'Tanker-N'", () => {
    const s = fresh();
    s.credits = 10000;
    const r = buyShip(s, "tanker_1");
    expect(r.ok).toBe(true);
    const tanker = s.ships.find((sh) => sh.defId === "tanker_1");
    expect(tanker?.name).toBe("Tanker-1");
    expect(tanker?.locationBodyId).toBe("earth");
  });

  it("Tanker-1 accepts fluid cargo (hydrogen_fuel)", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "tanker_1");
    const tanker = s.ships.find((sh) => sh.defId === "tanker_1")!;
    s.bodies.earth.warehouse.hydrogen_fuel = 50;
    const r = startRoute(s, tanker, "earth", "nea_04", "hydrogen_fuel", false, false, 40);
    expect(r.ok).toBe(true);
    expect(tanker.route!.cargoQty).toBe(40); // capacityFluid = 40
  });

  it("Tanker-1 rejects solid cargo (hull mismatch)", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "tanker_1");
    const tanker = s.ships.find((sh) => sh.defId === "tanker_1")!;
    s.bodies.earth.warehouse.iron_ore = 30;
    const r = startRoute(s, tanker, "earth", "nea_04", "iron_ore", false, false, 30);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/fluids only/);
  });

  it("Hauler-1 still rejects fluid cargo (regression — error reads 'solids only')", () => {
    const s = fresh();
    s.bodies.earth.warehouse.hydrogen_fuel = 50;
    const r = startRoute(s, s.ships[0], "earth", "nea_04", "hydrogen_fuel", false, false);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/solids only/);
  });

  it("Tanker-1 delivers fluid to destination warehouse on arrival", () => {
    const s = fresh();
    s.credits = 10000;
    buyShip(s, "tanker_1");
    const tanker = s.ships.find((sh) => sh.defId === "tanker_1")!;
    s.bodies.nea_04.warehouse.hydrogen_fuel = 0; // clear helper seed for exact-stock check
    s.bodies.earth.warehouse.hydrogen_fuel = 50;
    startRoute(s, tanker, "earth", "nea_04", "hydrogen_fuel", false, false, 40);
    tick(s, tanker.route!.travelSecTotal);
    expect(tanker.locationBodyId).toBe("nea_04");
    expect(s.bodies.nea_04.warehouse.hydrogen_fuel).toBe(40);
  });
});

describe("stock-maintain trigger on miningOp", () => {
  it("persists minOriginStock onto miningOp when set on initial dispatch", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10, 25);
    expect(s.ships[0].miningOp?.minOriginStock).toBe(25);
  });

  it("loop pauses at origin when stockpile is below threshold on return", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 10; // exactly the cargo qty
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10, 25);
    // Outbound: deliver to Earth, then empty return.
    tick(s, s.ships[0].route!.travelSecTotal);
    tick(s, s.ships[0].route!.travelSecTotal); // back at origin
    expect(s.ships[0].locationBodyId).toBe("nea_04");
    expect(s.ships[0].status).toBe("idle");
    // miningOp preserved (paused, not halted).
    expect(s.ships[0].miningOp).toBeTruthy();
    // Origin stockpile still below threshold (production is off in this test).
    expect((s.bodies.nea_04.warehouse.refined_metal ?? 0) < 25).toBe(true);
  });

  it("loop auto-resumes once origin stockpile crosses threshold", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 10;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10, 25);
    tick(s, s.ships[0].route!.travelSecTotal); // arrive Earth
    tick(s, s.ships[0].route!.travelSecTotal); // back at origin, now paused
    expect(s.ships[0].status).toBe("idle");
    // Top up the stockpile past the threshold (simulates production refilling).
    s.bodies.nea_04.warehouse.refined_metal = 30;
    tick(s, 1);
    expect(s.ships[0].status).toBe("transit");
    expect(s.ships[0].route!.cargoResource).toBe("refined_metal");
    expect(s.ships[0].route!.toBodyId).toBe("earth");
  });

  it("loop without minOriginStock still re-dispatches as before (regression)", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 100;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10);
    expect(s.ships[0].miningOp?.minOriginStock).toBeUndefined();
    tick(s, s.ships[0].route!.travelSecTotal); // arrive Earth
    tick(s, s.ships[0].route!.travelSecTotal); // back at origin
    // Same-tick re-dispatch (handleArrival called startRoute) — ship transit again.
    expect(s.ships[0].status).toBe("transit");
  });

  it("threshold is NOT enforced on the initial player dispatch", () => {
    // The trigger gates re-dispatch from the loop; the initial intent fires
    // even if origin only has the qty for one trip.
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 10;
    s.ships[0].locationBodyId = "nea_04";
    const r = startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10, 999);
    expect(r.ok).toBe(true);
    expect(s.ships[0].status).toBe("transit");
  });

  it("stopMiningOp clears a paused (waiting-on-stock) op", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 10;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10, 25);
    tick(s, s.ships[0].route!.travelSecTotal);
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.ships[0].miningOp).toBeTruthy();
    stopMiningOp(s, s.ships[0].id);
    expect(s.ships[0].miningOp).toBeFalsy();
  });
});

describe("idle ship alerts", () => {
  it("idle Hauler at start triggers an idle alert within one tick", () => {
    const s = fresh();
    tick(s, 1);
    expect(s.alerts.some((a) => !a.resolved && a.title.startsWith("Hauler-1 idle"))).toBe(true);
  });

  it("clears the idle alert when ship begins transit", () => {
    const s = fresh();
    tick(s, 1);
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    tick(s, 1);
    expect(s.alerts.some((a) => !a.resolved && a.title.startsWith("Hauler-1 idle"))).toBe(false);
  });
});

describe("multi-stop itinerary", () => {
  it("rejects when ship isn't at stops[0]", () => {
    const s = fresh();
    const stops: RouteStop[] = [
      { bodyId: "nea_04", actions: [{ kind: "load", resource: "iron_ore" }] },
      { bodyId: "earth", actions: [{ kind: "sell" }] },
    ];
    const r = startItinerary(s, s.ships[0].id, stops, true);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not at first stop/);
  });

  it("rejects fewer than 2 stops", () => {
    const s = fresh();
    const r = startItinerary(s, s.ships[0].id, [{ bodyId: "earth", actions: [] }], false);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/2 stops/);
  });

  it("rejects load actions for cargo the hull can't carry", () => {
    const s = fresh();
    const stops: RouteStop[] = [
      { bodyId: "earth", actions: [{ kind: "load", resource: "hydrogen_fuel" }] },
      { bodyId: "nea_04", actions: [{ kind: "unload" }] },
    ];
    const r = startItinerary(s, s.ships[0].id, stops, false); // Hauler-1 = solid only
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/can't carry/);
  });

  it("dispatches the first leg immediately on assignment", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 30;
    const stops: RouteStop[] = [
      { bodyId: "earth", actions: [{ kind: "load", resource: "iron_ore", qty: 30 }] },
      { bodyId: "nea_04", actions: [{ kind: "unload" }] },
    ];
    const r = startItinerary(s, s.ships[0].id, stops, false);
    expect(r.ok).toBe(true);
    expect(s.ships[0].status).toBe("transit");
    expect(s.ships[0].route!.toBodyId).toBe("nea_04");
    expect(s.ships[0].route!.cargoResource).toBe("iron_ore");
    expect(s.ships[0].route!.cargoQty).toBe(30);
  });

  it("walks a 3-stop circuit unloading at intermediate stops and loading new cargo", () => {
    const s = fresh();
    s.tier = 1;
    s.populations.lunar_habitat = {
      bodyId: "lunar_habitat",
      pop: 5,
      cap: 50,
      tier: "survival",
      settleProgressSec: 0,
      suspended: false,
      growthPaused: false,
    };
    s.bodies.earth.warehouse.iron_ore = 30;
    s.bodies.lunar_habitat.warehouse.lunar_regolith = 30;
    const stops: RouteStop[] = [
      { bodyId: "earth", actions: [{ kind: "load", resource: "iron_ore", qty: 30 }] },
      {
        bodyId: "lunar_habitat",
        actions: [
          { kind: "unload" },
          { kind: "load", resource: "lunar_regolith", qty: 30 },
        ],
      },
      { bodyId: "nea_04", actions: [{ kind: "unload" }] },
    ];
    startItinerary(s, s.ships[0].id, stops, false);
    // Leg 1: earth→lunar_habitat with iron_ore
    tick(s, s.ships[0].route!.travelSecTotal);
    // After leg 1: iron_ore unloaded, regolith loaded, leg 2 dispatched
    expect(s.bodies.lunar_habitat.warehouse.iron_ore).toBe(30);
    expect(s.ships[0].route!.cargoResource).toBe("lunar_regolith");
    expect(s.ships[0].route!.toBodyId).toBe("nea_04");
    // Leg 2: lunar_habitat→nea_04 with regolith
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.bodies.nea_04.warehouse.lunar_regolith).toBe(30);
    expect(s.ships[0].locationBodyId).toBe("nea_04");
    expect(s.ships[0].itinerary).toBeNull(); // non-loop itinerary cleared at end
  });

  it("loops back to stops[0] after the last stop when loop=true", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 100;
    s.bodies.nea_04.warehouse.refined_metal = 0;
    const stops: RouteStop[] = [
      { bodyId: "earth", actions: [{ kind: "load", resource: "iron_ore", qty: 30 }] },
      { bodyId: "nea_04", actions: [{ kind: "unload" }] },
    ];
    startItinerary(s, s.ships[0].id, stops, true);
    // Leg 1: earth→nea
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.bodies.nea_04.warehouse.iron_ore).toBeGreaterThan(0);
    // Leg 2: nea→earth (no cargo since stop[0]'s actions only run on next arrival there)
    expect(s.ships[0].route!.toBodyId).toBe("earth");
    tick(s, s.ships[0].route!.travelSecTotal);
    // Back at earth → executes load again and dispatches the next earth→nea leg
    expect(s.ships[0].route!.toBodyId).toBe("nea_04");
    expect(s.ships[0].route!.cargoResource).toBe("iron_ore");
  });

  it("pauses at a load action's minOriginStock until the stockpile catches up", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 0;
    const stops: RouteStop[] = [
      {
        bodyId: "earth",
        actions: [{ kind: "load", resource: "iron_ore", qty: 30, minOriginStock: 30 }],
      },
      { bodyId: "nea_04", actions: [{ kind: "unload" }] },
    ];
    const r = startItinerary(s, s.ships[0].id, stops, true);
    expect(r.ok).toBe(true);
    // Origin is short — itinerary parks at earth, no leg dispatched.
    expect(s.ships[0].status).toBe("idle");
    expect(s.ships[0].itinerary?.paused).toBe(true);
    expect(s.ships[0].route).toBeNull();
    // Once production tops the stockpile, tick auto-resumes the itinerary.
    s.bodies.earth.warehouse.iron_ore = 50;
    tick(s, 1);
    expect(s.ships[0].status).toBe("transit");
    expect(s.ships[0].route!.cargoResource).toBe("iron_ore");
  });

  it("sells via 'sell' action at Earth, crediting at earthSell", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04";
    const startCredits = s.credits;
    const stops: RouteStop[] = [
      { bodyId: "nea_04", actions: [{ kind: "load", resource: "refined_metal", qty: 10 }] },
      { bodyId: "earth", actions: [{ kind: "sell" }] },
    ];
    startItinerary(s, s.ships[0].id, stops, false);
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.credits).toBeGreaterThan(startCredits + 10 * 12 - 1); // earthSell=12, minus a small fuel charge
    expect(s.refinedMetalSoldLifetime).toBe(10);
  });

  it("stopItinerary clears the itinerary; current leg finishes naturally", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 60;
    const stops: RouteStop[] = [
      { bodyId: "earth", actions: [{ kind: "load", resource: "iron_ore", qty: 30 }] },
      { bodyId: "nea_04", actions: [{ kind: "unload" }] },
    ];
    startItinerary(s, s.ships[0].id, stops, true);
    expect(s.ships[0].itinerary).toBeTruthy();
    stopItinerary(s, s.ships[0].id);
    expect(s.ships[0].itinerary).toBeNull();
    // Current leg still completes; ship arrives and idles.
    tick(s, s.ships[0].route!.travelSecTotal);
    expect(s.ships[0].locationBodyId).toBe("nea_04");
    expect(s.ships[0].status).toBe("idle");
    expect(s.ships[0].route).toBeNull();
  });

  it("a manual override route clears an active itinerary", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 60;
    const stops: RouteStop[] = [
      { bodyId: "earth", actions: [{ kind: "load", resource: "iron_ore", qty: 30 }] },
      { bodyId: "nea_04", actions: [{ kind: "unload" }] },
    ];
    // Non-loop, so the ship idles at nea after the second leg arrives.
    startItinerary(s, s.ships[0].id, stops, false);
    tick(s, s.ships[0].route!.travelSecTotal); // arrives nea, itinerary clears (non-loop, last stop)
    // Re-attach itinerary mid-flight via a direct write to test override path.
    s.ships[0].itinerary = { stops, currentIdx: 0, loop: true, paused: false };
    s.ships[0].locationBodyId = "nea_04";
    // Override route to a body that isn't the next itinerary stop.
    startRoute(s, s.ships[0], "nea_04", "moon", null, false, false);
    expect(s.ships[0].itinerary).toBeNull();
  });

  it("itinerary clears miningOp when assigned (mutually exclusive)", () => {
    const s = fresh();
    // Seed a miningOp directly without running a route, then attach an itinerary.
    s.ships[0].miningOp = {
      fromBodyId: "earth",
      toBodyId: "nea_04",
      cargoResource: "iron_ore",
      cargoQty: 5,
      sellOnArrival: false,
    };
    const stops: RouteStop[] = [
      { bodyId: "earth", actions: [] },
      { bodyId: "nea_04", actions: [] },
    ];
    s.bodies.earth.warehouse.hydrogen_fuel = 50;
    startItinerary(s, s.ships[0].id, stops, false);
    expect(s.ships[0].itinerary).toBeTruthy();
    expect(s.ships[0].miningOp).toBeNull();
  });
});
