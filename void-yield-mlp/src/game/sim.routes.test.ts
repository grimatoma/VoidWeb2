import { beforeEach, describe, expect, it } from "vitest";
import { startRoute, tick } from "./sim";
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

describe("startRoute — fuel mechanics (MLP)", () => {
  it("consumes 4 hydrogen_fuel from origin if available", () => {
    const s = fresh();
    s.bodies.earth.warehouse.hydrogen_fuel = 20;
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(s.bodies.earth.warehouse.hydrogen_fuel).toBe(16);
  });

  it("doesn't reject when no fuel — leg is free in MLP for early loop flow", () => {
    const s = fresh();
    s.bodies.earth.warehouse.hydrogen_fuel = 0;
    const r = startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(r.ok).toBe(true);
  });

  it("with <4 fuel, doesn't deduct partial — leaves stock untouched", () => {
    const s = fresh();
    s.bodies.earth.warehouse.hydrogen_fuel = 2;
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(s.bodies.earth.warehouse.hydrogen_fuel).toBe(2);
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

  it("ETA is set to the body-pair transit time", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(s.ships[0].route!.travelSecRemaining).toBe(90); // earth↔nea
  });
});

describe("delivery & sale on arrival", () => {
  it("ship lands at destination and switches to idle", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    tick(s, 90);
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
    tick(s, 90);
    expect(s.credits).toBe(startCredits + 10 * 12); // earthSell for refined_metal = 12
  });

  it("sale of refined_metal updates refinedMetalSoldLifetime", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, false, 30);
    tick(s, 90);
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
    tick(s, 60);
    expect(s.bodies.lunar_habitat.warehouse.iron_ore).toBe(30);
  });

  it("delivery clamps to destination capacity, leaves remainder dropped", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.iron_ore = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "moon", "iron_ore", false, false, 30);
    s.bodies.moon.warehouse.iron_ore = 95; // moon cap 100 (baseline)
    tick(s, 75);
    expect(s.bodies.moon.warehouse.iron_ore).toBe(100);
  });

  it("repeat=true sends ship back empty to origin", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, true, 10);
    tick(s, 90);
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
    tick(s, 90);
    expect(s.log.some((l) => l.text.match(/delivered 10 Refined Metal to Earth/))).toBe(true);
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
