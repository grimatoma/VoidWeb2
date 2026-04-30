import { beforeEach, describe, expect, it } from "vitest";
import { runAfkCatchup, startRoute } from "./sim";
import { fresh, forcePlace } from "../test/helpers";
import { resetRandom } from "../test/setup";

beforeEach(() => resetRandom());

describe("runAfkCatchup — basic shape", () => {
  it("returns a summary with awaySec=0 when away time is zero", () => {
    const s = fresh();
    const sum = runAfkCatchup(s, 0);
    expect(sum.awaySec).toBe(0);
    expect(sum.cappedAt24h).toBe(false);
    expect(sum.netCredits).toBe(0);
  });

  it("clamps awaySec to 24h hard cap", () => {
    const s = fresh();
    const oneHourMs = 60 * 60 * 1000;
    const sum = runAfkCatchup(s, 30 * oneHourMs);
    expect(sum.awaySec).toBe(24 * 60 * 60);
    expect(sum.cappedAt24h).toBe(true);
  });

  it("does not flag cappedAt24h for a sub-24h window", () => {
    const s = fresh();
    const sum = runAfkCatchup(s, 60_000); // 1 minute
    expect(sum.cappedAt24h).toBe(false);
  });

  it("advances gameTimeSec by the awaySec amount", () => {
    const s = fresh();
    runAfkCatchup(s, 600_000); // 10 minutes
    expect(s.gameTimeSec).toBeCloseTo(600, 0);
  });
});

describe("runAfkCatchup — production accumulation", () => {
  it("accumulates production cycles for placed buildings", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    const sum = runAfkCatchup(s, 5 * 60 * 1000); // 5 min
    // Mine = 10 ore / 30s, so 5 min = 100 ore — but capacity caps at 100.
    expect(sum.cyclesByBuilding.small_mine).toBeGreaterThan(0);
  });

  it("counts deliveries when a route lands at Earth during AFK", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, false, 30);
    const sum = runAfkCatchup(s, 120_000); // 2 min — exceeds 90s travel
    expect(sum.deliveries).toBeGreaterThanOrEqual(1);
    expect(sum.netCredits).toBeGreaterThan(0);
  });

  it("populates resourceDelta with sales-side decrements (sold metal counted negative)", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.refined_metal = 30;
    s.ships[0].locationBodyId = "nea_04";
    startRoute(s, s.ships[0], "nea_04", "earth", "refined_metal", true, false, 30);
    const sum = runAfkCatchup(s, 120_000);
    expect(sum.resourceDelta.refined_metal ?? 0).toBeLessThan(0);
  });

  it("uses 5s steps for windows >10 min (doesn't run forever)", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    const start = performance.now();
    runAfkCatchup(s, 23 * 60 * 60 * 1000); // 23h
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000); // a 23h replay shouldn't take 2 seconds
  });
});

describe("runAfkCatchup — life support during AFK", () => {
  it("a habitat with sufficient supply continues growing through AFK", () => {
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
    s.bodies.lunar_habitat.warehouse.water_ice = 10000;
    s.bodies.lunar_habitat.warehouse.oxygen = 10000;
    s.bodies.lunar_habitat.warehouse.food_pack = 10000;
    runAfkCatchup(s, 30 * 60 * 1000); // 30 min
    expect(s.populations.lunar_habitat!.pop).toBeGreaterThan(10);
  });

  it("a starved habitat pauses growth during AFK", () => {
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
    runAfkCatchup(s, 30 * 60 * 1000);
    expect(s.populations.lunar_habitat!.growthPaused).toBe(true);
    expect(s.populations.lunar_habitat!.pop).toBeCloseTo(10, 0);
  });
});

describe("runAfkCatchup — tier gate", () => {
  it("trips the gate during AFK when production crosses both thresholds", () => {
    const s = fresh();
    s.refinedMetalSoldLifetime = 200; // pre-met
    s.bodies.earth.warehouse.hydrogen_fuel = 80;
    runAfkCatchup(s, 60_000);
    expect(s.tierUpReady).toBe(true);
  });
});
