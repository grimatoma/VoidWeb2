import { beforeEach, describe, expect, it } from "vitest";
import { tick } from "./sim";
import { LIFE_SUPPORT } from "./defs";
import { fresh } from "../test/helpers";
import { resetRandom } from "../test/setup";

beforeEach(() => resetRandom());

function seedHabitat(pop: number, water = 50, oxygen = 50, food = 50) {
  const s = fresh();
  s.tier = 1;
  s.populations.lunar_habitat = {
    bodyId: "lunar_habitat",
    pop,
    cap: 50,
    tier: "survival",
    settleProgressSec: 0,
    suspended: false,
    growthPaused: false,
  };
  s.bodies.lunar_habitat.warehouse.water_ice = water;
  s.bodies.lunar_habitat.warehouse.oxygen = oxygen;
  s.bodies.lunar_habitat.warehouse.food_pack = food;
  return s;
}

describe("life support draws", () => {
  it("water draws ~1 unit / pop / 8min — 10 pop drinks ~1.25 units / minute", () => {
    const s = seedHabitat(10);
    const start = s.bodies.lunar_habitat.warehouse.water_ice ?? 0;
    tick(s, 60);
    const after = s.bodies.lunar_habitat.warehouse.water_ice ?? 0;
    const consumed = start - after;
    const expected = LIFE_SUPPORT.water_ice_per_pop_sec * 10 * 60;
    expect(consumed).toBeCloseTo(expected, 4);
  });

  it("oxygen draws faster than water (1/6min vs 1/8min per pop)", () => {
    const s = seedHabitat(10);
    const wStart = s.bodies.lunar_habitat.warehouse.water_ice!;
    const oStart = s.bodies.lunar_habitat.warehouse.oxygen!;
    tick(s, 60);
    const wDelta = wStart - (s.bodies.lunar_habitat.warehouse.water_ice ?? 0);
    const oDelta = oStart - (s.bodies.lunar_habitat.warehouse.oxygen ?? 0);
    expect(oDelta).toBeGreaterThan(wDelta);
  });

  it("growth paused when any need is depleted", () => {
    const s = seedHabitat(10, 50, 0, 50); // O2 empty
    tick(s, 30);
    expect(s.populations.lunar_habitat!.growthPaused).toBe(true);
  });

  it("growth resumes when supply restored", () => {
    const s = seedHabitat(10, 50, 0, 50);
    tick(s, 30);
    expect(s.populations.lunar_habitat!.growthPaused).toBe(true);
    s.bodies.lunar_habitat.warehouse.oxygen = 50;
    tick(s, 5);
    expect(s.populations.lunar_habitat!.growthPaused).toBe(false);
  });

  it("population grows toward cap when life support is healthy (~1 pop per 30s)", () => {
    const s = seedHabitat(10, 1000, 1000, 1000);
    const start = s.populations.lunar_habitat!.pop;
    tick(s, 30);
    const after = s.populations.lunar_habitat!.pop;
    expect(after - start).toBeCloseTo(1, 0);
  });

  it("population stops at cap", () => {
    const s = seedHabitat(50, 1000, 1000, 1000); // already at cap
    tick(s, 60);
    expect(s.populations.lunar_habitat!.pop).toBeLessThanOrEqual(50);
  });
});

describe("pop-tier settle-in", () => {
  it("does not advance to Settled before the 20-minute window", () => {
    const s = seedHabitat(10, 1e6, 1e6, 1e6);
    s.bodies.lunar_habitat.warehouse.construction_materials = 100;
    s.bodies.lunar_habitat.warehouse.habitat_module = 5;
    tick(s, 60); // only 1 minute
    expect(s.populations.lunar_habitat!.tier).toBe("survival");
  });

  it("advances to Settled once window completes AND bundle is on-hand", () => {
    const s = seedHabitat(10, 1e6, 1e6, 1e6);
    s.bodies.lunar_habitat.warehouse.construction_materials = 100;
    s.bodies.lunar_habitat.warehouse.habitat_module = 5;
    tick(s, 1300);
    expect(s.populations.lunar_habitat!.tier).toBe("settled");
  });

  it("consumes the Settled bundle on advance (8 mat + 2 module)", () => {
    const s = seedHabitat(10, 1e6, 1e6, 1e6);
    s.bodies.lunar_habitat.warehouse.construction_materials = 100;
    s.bodies.lunar_habitat.warehouse.habitat_module = 5;
    tick(s, 1300);
    expect(s.bodies.lunar_habitat.warehouse.construction_materials).toBe(92);
    expect(s.bodies.lunar_habitat.warehouse.habitat_module).toBe(3);
  });

  it("waits at threshold if the bundle isn't met", () => {
    const s = seedHabitat(10, 1e6, 1e6, 1e6);
    // No bundle items — should hold at the threshold.
    tick(s, 1300);
    expect(s.populations.lunar_habitat!.tier).toBe("survival");
    expect(s.populations.lunar_habitat!.settleProgressSec).toBe(1200);
  });

  it("settle-in resets to 0 after advancing", () => {
    const s = seedHabitat(10, 1e6, 1e6, 1e6);
    s.bodies.lunar_habitat.warehouse.construction_materials = 100;
    s.bodies.lunar_habitat.warehouse.habitat_module = 5;
    tick(s, 1300);
    expect(s.populations.lunar_habitat!.settleProgressSec).toBe(0);
  });

  it("settle progress doesn't accumulate while growth is paused (any shortage)", () => {
    const s = seedHabitat(10, 50, 0, 50); // O2 zero
    tick(s, 100);
    expect(s.populations.lunar_habitat!.settleProgressSec).toBe(0);
  });

  it("Settled tier multiplies cap by 1.25", () => {
    const s = seedHabitat(10, 1e6, 1e6, 1e6);
    s.bodies.lunar_habitat.warehouse.construction_materials = 100;
    s.bodies.lunar_habitat.warehouse.habitat_module = 5;
    const startCap = s.populations.lunar_habitat!.cap;
    tick(s, 1300);
    expect(s.populations.lunar_habitat!.cap).toBe(Math.floor(startCap * 1.25));
  });
});

describe("ops alerts", () => {
  it("fires a 'water low' / 'O2 low' / 'food low' alert when reserve <2h", () => {
    const s = seedHabitat(10, 5, 5, 5);
    tick(s, 1);
    const titles = s.alerts.filter((a) => !a.resolved).map((a) => a.title);
    expect(titles.some((t) => t.includes("water low"))).toBe(true);
    expect(titles.some((t) => t.includes("O2 low"))).toBe(true);
    expect(titles.some((t) => t.includes("food low"))).toBe(true);
  });

  it("clears the alert when reserves recover above 2h", () => {
    const s = seedHabitat(10, 5, 5, 5);
    tick(s, 1);
    expect(s.alerts.some((a) => !a.resolved && a.title.includes("water low"))).toBe(true);
    s.bodies.lunar_habitat.warehouse.water_ice = 1e6;
    tick(s, 1);
    expect(s.alerts.some((a) => !a.resolved && a.title.includes("water low"))).toBe(false);
  });

  it("dedupes alerts by title+bodyId — multiple ticks don't pile up duplicates", () => {
    const s = seedHabitat(10, 5, 50, 50);
    tick(s, 1);
    tick(s, 1);
    tick(s, 1);
    const waterLow = s.alerts.filter((a) => a.title.includes("water low"));
    expect(waterLow).toHaveLength(1);
  });
});
