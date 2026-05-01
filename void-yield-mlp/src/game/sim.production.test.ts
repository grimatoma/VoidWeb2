import { beforeEach, describe, expect, it } from "vitest";
import {
  canStore,
  getAdjacencyMultiplier,
  getStorageCaps,
  placeBuilding,
  tick,
  warehouseUsage,
} from "./sim";
import { fresh, forcePlace } from "../test/helpers";
import { resetRandom } from "../test/setup";

beforeEach(() => resetRandom());

describe("storage caps", () => {
  it("Earth is treated as an infinite market sink", () => {
    const s = fresh();
    const caps = getStorageCaps(s.bodies.earth);
    expect(caps.solid).toBe(Infinity);
    expect(caps.fluid).toBe(Infinity);
  });

  it("NEA bootstrap baseline is 100 solid + 50 fluid before any Silo", () => {
    const s = fresh();
    const caps = getStorageCaps(s.bodies.nea_04);
    expect(caps.solid).toBe(100);
    expect(caps.fluid).toBe(50);
  });

  it("Moon also gets the bootstrap baseline (lunar surface mining)", () => {
    const s = fresh();
    const caps = getStorageCaps(s.bodies.moon);
    expect(caps.solid).toBe(100);
    expect(caps.fluid).toBe(50);
  });

  it("habitat bodies get a small life-support buffer", () => {
    const s = fresh();
    const caps = getStorageCaps(s.bodies.lunar_habitat);
    expect(caps.solid).toBe(200);
    expect(caps.fluid).toBe(120);
  });

  it("Silo adds +300 solid; Tank adds +180 fluid", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "silo", 0, 0);
    expect(getStorageCaps(s.bodies.nea_04).solid).toBe(100 + 300);
    forcePlace(s, "nea_04", "tank", 0, 1);
    expect(getStorageCaps(s.bodies.nea_04).fluid).toBe(50 + 180);
  });

  it("multiple Silos stack additively", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "silo", 0, 0);
    forcePlace(s, "nea_04", "silo", 1, 0);
    forcePlace(s, "nea_04", "silo", 2, 0);
    expect(getStorageCaps(s.bodies.nea_04).solid).toBe(100 + 300 * 3);
  });
});

describe("warehouseUsage", () => {
  it("sums solid + fluid resources separately", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.iron_ore = 50; // solid
    s.bodies.nea_04.warehouse.refined_metal = 12; // solid
    s.bodies.nea_04.warehouse.hydrogen_fuel = 8; // fluid
    s.bodies.nea_04.warehouse.oxygen = 4; // fluid
    const u = warehouseUsage(s.bodies.nea_04);
    expect(u.solid).toBe(62);
    expect(u.fluid).toBe(12);
  });

  it("treats undefined resources as zero", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.iron_ore = undefined;
    expect(warehouseUsage(s.bodies.nea_04).solid).toBe(0);
  });
});

describe("canStore", () => {
  it("returns the lesser of requested qty and remaining capacity", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.iron_ore = 90;
    expect(canStore(s.bodies.nea_04, "iron_ore", 5)).toBe(5);
    expect(canStore(s.bodies.nea_04, "iron_ore", 50)).toBe(10); // 100 - 90
    expect(canStore(s.bodies.nea_04, "iron_ore", 0)).toBe(0);
  });

  it("respects cargo class — fluid stock doesn't count against solid cap", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.hydrogen_fuel = 50; // fluid, fills fluid cap
    expect(canStore(s.bodies.nea_04, "iron_ore", 50)).toBe(50); // solid still free
    expect(canStore(s.bodies.nea_04, "hydrogen_fuel", 10)).toBe(0); // fluid full
  });
});

describe("adjacency", () => {
  it("Smelter adjacent to Mine grants +15%", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    forcePlace(s, "nea_04", "smelter", 1, 0);
    const smelter = s.bodies.nea_04.buildings.find((b) => b.defId === "smelter")!;
    expect(getAdjacencyMultiplier(smelter, s.bodies.nea_04)).toBeCloseTo(1.15);
  });

  it("Smelter at radius 2 still gets the bonus (collaboration radius)", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    forcePlace(s, "nea_04", "smelter", 2, 0);
    const smelter = s.bodies.nea_04.buildings.find((b) => b.defId === "smelter")!;
    expect(getAdjacencyMultiplier(smelter, s.bodies.nea_04)).toBeCloseTo(1.15);
  });

  it("Smelter beyond radius 2 gets no bonus", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    forcePlace(s, "nea_04", "smelter", 3, 0);
    const smelter = s.bodies.nea_04.buildings.find((b) => b.defId === "smelter")!;
    expect(getAdjacencyMultiplier(smelter, s.bodies.nea_04)).toBe(1.0);
  });

  it("multiple matching neighbors don't double-stack the bonus (MLP cap)", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    forcePlace(s, "nea_04", "small_mine", 2, 0);
    forcePlace(s, "nea_04", "smelter", 1, 0);
    const smelter = s.bodies.nea_04.buildings.find((b) => b.defId === "smelter")!;
    expect(getAdjacencyMultiplier(smelter, s.bodies.nea_04)).toBeCloseTo(1.15);
  });

  it("Storage buildings (Silo) are neutral — don't count as adjacency neighbors", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "silo", 0, 0);
    forcePlace(s, "nea_04", "smelter", 1, 0);
    const smelter = s.bodies.nea_04.buildings.find((b) => b.defId === "smelter")!;
    expect(getAdjacencyMultiplier(smelter, s.bodies.nea_04)).toBe(1.0);
  });

  it("a Mine has no adjacencyPair so always returns 1.0", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    forcePlace(s, "nea_04", "smelter", 1, 0);
    const mine = s.bodies.nea_04.buildings.find((b) => b.defId === "small_mine")!;
    expect(getAdjacencyMultiplier(mine, s.bodies.nea_04)).toBe(1.0);
  });

  it("checks Chebyshev distance (max of dx,dy), not Manhattan", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    forcePlace(s, "nea_04", "smelter", 2, 2); // dx=2, dy=2 → Chebyshev=2 → in radius
    const smelter = s.bodies.nea_04.buildings.find((b) => b.defId === "smelter")!;
    expect(getAdjacencyMultiplier(smelter, s.bodies.nea_04)).toBeCloseTo(1.15);
  });
});

describe("production cycles", () => {
  it("Small Mine (30s cycle) outputs 10 ore in 30s", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    tick(s, 30);
    expect(s.bodies.nea_04.warehouse.iron_ore).toBe(10);
  });

  it("two Mines + Smelter — refined metal produced from ore", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    forcePlace(s, "nea_04", "small_mine", 2, 0);
    forcePlace(s, "nea_04", "smelter", 1, 0);
    // 2 mines produce 20 ore in 30s. Smelter consumes 5 every 45s/1.15.
    tick(s, 60);
    const ore = s.bodies.nea_04.warehouse.iron_ore ?? 0;
    const metal = s.bodies.nea_04.warehouse.refined_metal ?? 0;
    expect(ore).toBeGreaterThan(0);
    expect(metal).toBeGreaterThan(0);
  });

  it("Smelter without ore stalls and produces nothing", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "smelter", 0, 0);
    tick(s, 90);
    expect(s.bodies.nea_04.warehouse.refined_metal ?? 0).toBe(0);
  });

  it("paused buildings don't tick", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    s.bodies.nea_04.buildings[0].paused = true;
    tick(s, 60);
    expect(s.bodies.nea_04.warehouse.iron_ore ?? 0).toBe(0);
  });

  it("output cap stops production — mine fills baseline 100, then halts", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    // 1 mine = 10 ore / 30s. 100 cap reached at 300s.
    for (let i = 0; i < 600; i++) tick(s, 1);
    expect(s.bodies.nea_04.warehouse.iron_ore ?? 0).toBeLessThanOrEqual(100);
  });

  it("Electrolyzer produces 3 fuel + 1 oxygen per cycle from 4 water ice", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.hydrogen_fuel = 0; // fresh() seeds a small reserve; clear to test exact production
    s.bodies.nea_04.warehouse.water_ice = 100;
    forcePlace(s, "nea_04", "electrolyzer", 0, 0);
    tick(s, 60); // exactly one cycle
    expect(s.bodies.nea_04.warehouse.hydrogen_fuel).toBe(3);
    expect(s.bodies.nea_04.warehouse.oxygen).toBe(1);
    expect(s.bodies.nea_04.warehouse.water_ice).toBe(96);
  });

  it("Habitat Assembler consumes 6 construction materials over 8 minutes", () => {
    const s = fresh();
    s.tier = 1;
    s.bodies.lunar_habitat.warehouse.construction_materials = 12;
    forcePlace(s, "lunar_habitat", "habitat_assembler", 0, 0);
    tick(s, 480);
    expect(s.bodies.lunar_habitat.warehouse.habitat_module).toBe(1);
    expect(s.bodies.lunar_habitat.warehouse.construction_materials).toBe(6);
  });

  it("adjacency multiplier accelerates effective cycle (Smelter +15%)", () => {
    // Each scenario gets a Silo so output capacity isn't the bottleneck.
    const a = fresh();
    const b = fresh();
    forcePlace(a, "nea_04", "silo", 4, 4);
    forcePlace(a, "nea_04", "smelter", 0, 0);
    forcePlace(b, "nea_04", "silo", 4, 4);
    forcePlace(b, "nea_04", "small_mine", 0, 0);
    forcePlace(b, "nea_04", "smelter", 1, 0);
    a.bodies.nea_04.warehouse.iron_ore = 50;
    b.bodies.nea_04.warehouse.iron_ore = 50;
    tick(a, 450);
    tick(b, 450);
    expect((b.bodies.nea_04.warehouse.refined_metal ?? 0)).toBeGreaterThan(
      (a.bodies.nea_04.warehouse.refined_metal ?? 0),
    );
  });
});

describe("placement", () => {
  it("rejects placement on an occupied tile", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    s.credits = 100000;
    const r = placeBuilding(s, "nea_04", "small_mine", 0, 0);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("tile occupied");
  });

  it("rejects placement off-grid", () => {
    const s = fresh();
    s.credits = 100000;
    expect(placeBuilding(s, "nea_04", "small_mine", -1, 0).ok).toBe(false);
    expect(placeBuilding(s, "nea_04", "small_mine", 0, -1).ok).toBe(false);
    expect(placeBuilding(s, "nea_04", "small_mine", 99, 0).ok).toBe(false);
    expect(placeBuilding(s, "nea_04", "small_mine", 0, 99).ok).toBe(false);
  });

  it("rejects placement when credits insufficient", () => {
    const s = fresh();
    s.credits = 100;
    const r = placeBuilding(s, "nea_04", "small_mine", 0, 0);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("insufficient credits");
  });

  it("rejects placement when building tier exceeds player tier", () => {
    const s = fresh(); // tier 0
    s.credits = 100000;
    const r = placeBuilding(s, "moon", "lunar_surface_mine", 0, 0);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("tier locked");
  });

  it("rejects placement on a body type the building doesn't support", () => {
    const s = fresh();
    s.tier = 1;
    s.credits = 100000;
    // Lunar Surface Mine is moon/habitat only — not allowed on NEA
    const r = placeBuilding(s, "nea_04", "lunar_surface_mine", 0, 0);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("wrong body type");
  });

  it("deducts cost on a successful placement", () => {
    const s = fresh();
    s.credits = 5000;
    placeBuilding(s, "nea_04", "small_mine", 0, 0); // 800
    expect(s.credits).toBe(4200);
  });

  it("appends a log entry on placement", () => {
    const s = fresh();
    s.credits = 5000;
    placeBuilding(s, "nea_04", "small_mine", 0, 0);
    expect(s.log.at(-1)?.text).toMatch(/Small Mine placed on NEA-04/);
  });
});

describe("foreground tick", () => {
  it("advances gameTimeSec by exactly dt", () => {
    const s = fresh();
    tick(s, 10);
    tick(s, 5.5);
    expect(s.gameTimeSec).toBeCloseTo(15.5);
  });

  it("doesn't trip the tier-up gate when conditions aren't met", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    tick(s, 60);
    expect(s.tierUpReady).toBe(false);
  });

  it("foreground ticks do not produce an AFK summary collector entry", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    tick(s, 60); // no collector arg — that's the foreground path
    // Nothing to assert on the collector path; just ensure it doesn't throw.
    expect(s.gameTimeSec).toBe(60);
  });
});

describe("production — multi-cycle in a single tick", () => {
  it("a single tick wider than cycleSec produces multiple cycles' worth of output", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0); // 30s cycle, 10 ore per
    forcePlace(s, "nea_04", "silo", 1, 0); // raise cap above 100 baseline
    tick(s, 90); // 3 full cycles
    expect(s.bodies.nea_04.warehouse.iron_ore).toBe(30);
  });

  it("smelter consumes 5 ore per cycle across multiple cycles in one tick", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "smelter", 0, 0); // 45s cycle: 5 ore → 2 metal
    forcePlace(s, "nea_04", "silo", 4, 4);
    s.bodies.nea_04.warehouse.iron_ore = 30;
    tick(s, 135); // 3 full cycles at adjacency 1.0 (no neighbor)
    expect(s.bodies.nea_04.warehouse.refined_metal).toBe(6);
    expect(s.bodies.nea_04.warehouse.iron_ore).toBe(15);
  });

  it("breaks mid-tick if inputs run out (no half-consumed batch)", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "smelter", 0, 0);
    forcePlace(s, "nea_04", "silo", 4, 4);
    s.bodies.nea_04.warehouse.iron_ore = 8; // enough for 1 cycle, not 2
    tick(s, 200);
    expect(s.bodies.nea_04.warehouse.refined_metal).toBe(2); // exactly one cycle landed
    expect(s.bodies.nea_04.warehouse.iron_ore).toBe(3); // 8 - 5 leftover
  });
});

describe("production — output-blocked rollback", () => {
  it("stalls at cycleProgress=0 when storage is already full at cycle start", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    s.bodies.nea_04.warehouse.iron_ore = 100;
    tick(s, 30);
    expect(s.bodies.nea_04.warehouse.iron_ore).toBe(100);
    expect(s.bodies.nea_04.buildings[0].cycleProgress).toBe(0);
  });

  it("holds cycleProgress at cycleSec when storage fills mid-cycle, resumes on cleared cap", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0);
    s.bodies.nea_04.warehouse.iron_ore = 100;
    // Manually start mid-cycle so the start-of-cycle output check is skipped;
    // this is the only path into the "held at cycleSec" branch.
    s.bodies.nea_04.buildings[0].cycleProgress = 1;
    tick(s, 30); // cycle would complete; storage full → blocked, held at cycleSec
    expect(s.bodies.nea_04.warehouse.iron_ore).toBe(100);
    expect(s.bodies.nea_04.buildings[0].cycleProgress).toBe(30);
    // Free up storage; next tick commits the held output immediately.
    s.bodies.nea_04.warehouse.iron_ore = 50;
    tick(s, 1);
    expect(s.bodies.nea_04.warehouse.iron_ore).toBe(60);
  });
});
