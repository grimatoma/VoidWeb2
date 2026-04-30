import { describe, expect, it } from "vitest";
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
import type { BuildingId, ResourceId } from "./defs";

describe("RESOURCES", () => {
  it("MLP-tier resources are T0 or T1 only", () => {
    for (const r of Object.values(RESOURCES)) {
      expect([0, 1]).toContain(r.tier);
    }
  });

  it("each resource has a sensible buy/sell spread (buy >= sell)", () => {
    for (const r of Object.values(RESOURCES)) {
      // Lunar Regolith and Hydroponic Yield are not sold by Earth (earthBuy=0).
      if (r.earthBuy === 0) continue;
      expect(r.earthBuy).toBeGreaterThanOrEqual(r.earthSell);
    }
  });

  it("cargo class is exactly solid or fluid", () => {
    for (const r of Object.values(RESOURCES)) {
      expect(["solid", "fluid"]).toContain(r.cargo);
    }
  });

  it("ids match keys (no typo drift)", () => {
    for (const [key, def] of Object.entries(RESOURCES)) {
      expect(def.id).toBe(key);
    }
  });
});

describe("BUILDINGS", () => {
  it("ids match keys", () => {
    for (const [key, def] of Object.entries(BUILDINGS)) {
      expect(def.id).toBe(key);
    }
  });

  it("storage buildings have caps and no inputs/outputs", () => {
    for (const def of Object.values(BUILDINGS)) {
      if (!def.isStorage) continue;
      expect(Object.keys(def.inputs)).toHaveLength(0);
      expect(Object.keys(def.outputs)).toHaveLength(0);
      expect((def.storageSolid ?? 0) + (def.storageFluid ?? 0)).toBeGreaterThan(0);
    }
  });

  it("non-storage non-passive buildings have a cycle and at least one output", () => {
    for (const def of Object.values(BUILDINGS)) {
      if (def.isStorage || def.passive) continue;
      expect(def.cycleSec).toBeGreaterThan(0);
      expect(Object.keys(def.outputs).length + Object.keys(def.inputs).length).toBeGreaterThan(0);
    }
  });

  it("input/output resource ids reference real RESOURCES entries", () => {
    for (const def of Object.values(BUILDINGS)) {
      for (const k of Object.keys(def.inputs) as ResourceId[]) {
        expect(RESOURCES[k]).toBeDefined();
      }
      for (const k of Object.keys(def.outputs) as ResourceId[]) {
        expect(RESOURCES[k]).toBeDefined();
      }
    }
  });

  it("MLP adjacency: only Smelter pairs with Small Mine, +15%", () => {
    const withAdj = Object.values(BUILDINGS).filter((d) => d.adjacencyPair);
    expect(withAdj).toHaveLength(1);
    const def = withAdj[0];
    expect(def.id).toBe("smelter");
    expect(def.adjacencyPair).toEqual(["small_mine"]);
    expect(def.adjacencyBonus).toBeCloseTo(0.15);
  });

  it("storage buildings don't have adjacencyPair (neutral rule)", () => {
    for (const def of Object.values(BUILDINGS)) {
      if (!def.isStorage) continue;
      expect(def.adjacencyPair).toBeUndefined();
    }
  });

  it("ADJACENCY_RADIUS matches GAME.md default of 2", () => {
    expect(ADJACENCY_RADIUS).toBe(2);
  });
});

describe("SHIPS (MLP: Hauler-1 only)", () => {
  it("only Hauler-1 exists at MLP", () => {
    expect(Object.keys(SHIPS)).toEqual(["hauler_1"]);
  });

  it("Hauler-1 carries 30 solid, 0 fluid (specialized solid)", () => {
    expect(SHIPS.hauler_1.capacitySolid).toBe(30);
    expect(SHIPS.hauler_1.capacityFluid).toBe(0);
    expect(SHIPS.hauler_1.cargo).toBe("solid");
  });

  it("Hauler-1 costs $3,000 at Earth", () => {
    expect(SHIPS.hauler_1.earthBuy).toBe(3000);
  });
});

describe("LIFE_SUPPORT", () => {
  it("water draw is 1 unit per pop per 8 minutes (1/480 sec)", () => {
    expect(LIFE_SUPPORT.water_ice_per_pop_sec).toBeCloseTo(1 / 480);
  });
  it("oxygen draw is 1 unit per pop per 6 minutes (1/360 sec)", () => {
    expect(LIFE_SUPPORT.oxygen_per_pop_sec).toBeCloseTo(1 / 360);
  });
  it("food draw is 1 unit per pop per 12 minutes (1/720 sec)", () => {
    expect(LIFE_SUPPORT.food_pack_per_pop_sec).toBeCloseTo(1 / 720);
  });
});

describe("POP_TIERS (MLP: Survival → Settled)", () => {
  it("contains exactly two tiers in order", () => {
    expect(POP_TIERS.map((t) => t.id)).toEqual(["survival", "settled"]);
  });

  it("Settled has a settle-in window of 20 minutes", () => {
    const settled = POP_TIERS.find((t) => t.id === "settled")!;
    expect(settled.settleInSec).toBe(1200);
  });

  it("Settled bundle requires construction materials and habitat modules", () => {
    const settled = POP_TIERS.find((t) => t.id === "settled")!;
    expect(settled.bundle.construction_materials).toBe(8);
    expect(settled.bundle.habitat_module).toBe(2);
  });
});

describe("TIER_GATE_T0_T1", () => {
  it("locked numbers from GAME.md: 200 metal sold + 50 fuel reserves", () => {
    expect(TIER_GATE_T0_T1.conditions.refinedMetalSold).toBe(200);
    expect(TIER_GATE_T0_T1.conditions.hydrogenFuelReserves).toBe(50);
  });
});

describe("PREFAB_KITS", () => {
  it("includes the two MLP kits at correct prices", () => {
    expect(PREFAB_KITS.lunar_habitat.cost).toBe(8000);
    expect(PREFAB_KITS.lunar_surface_mine_kit.cost).toBe(3500);
  });

  it("both kits gate behind T1", () => {
    for (const kit of Object.values(PREFAB_KITS)) {
      expect(kit.unlockTier).toBe(1);
    }
  });
});

describe("MLP scope guard", () => {
  it("T2-and-beyond resources are absent (Nickel, Silicates, etc.)", () => {
    const ids = new Set<ResourceId>(Object.keys(RESOURCES) as ResourceId[]);
    expect(ids.has("nickel_ore" as ResourceId)).toBe(false);
    expect(ids.has("silicates" as ResourceId)).toBe(false);
    expect(ids.has("pressure_valves" as ResourceId)).toBe(false);
  });

  it("T2-and-beyond ships are absent (Hauler-2, Mixer, Tanker)", () => {
    const ids = Object.keys(SHIPS);
    expect(ids).not.toContain("hauler_2");
    expect(ids).not.toContain("mixer_1");
    expect(ids).not.toContain("tanker_1");
  });

  it("the 9 MLP-required buildings are present", () => {
    const required: BuildingId[] = [
      "small_mine",
      "ice_mine",
      "smelter",
      "electrolyzer",
      "probe_bay",
      "silo",
      "tank",
      "lunar_surface_mine",
      "habitat_assembler",
    ];
    for (const id of required) {
      expect(BUILDINGS[id], `missing required building: ${id}`).toBeDefined();
    }
  });
});
