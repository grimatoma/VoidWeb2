import { beforeEach, describe, expect, it } from "vitest";
import {
  buyFromEarth,
  buyPrefabKit,
  buyShip,
  claimTierUp,
  demolishBuilding,
  placeBuilding,
  sellToEarth,
  tick,
} from "./sim";
import { fresh, forcePlace } from "../test/helpers";
import { resetRandom } from "../test/setup";

beforeEach(() => resetRandom());

describe("demolishBuilding", () => {
  it("removes the building and refunds 50% of cost", () => {
    const s = fresh();
    s.credits = 5000;
    placeBuilding(s, "nea_04", "small_mine", 0, 0); // -800 → 4200
    const id = s.bodies.nea_04.buildings[0].id;
    demolishBuilding(s, "nea_04", id);
    expect(s.bodies.nea_04.buildings).toHaveLength(0);
    expect(s.credits).toBe(4200 + 400);
  });

  it("is a no-op for an unknown building id", () => {
    const s = fresh();
    s.credits = 5000;
    demolishBuilding(s, "nea_04", "bogus_id");
    expect(s.credits).toBe(5000);
  });
});

describe("buyShip", () => {
  it("adds Hauler-N to the fleet at Earth", () => {
    const s = fresh();
    s.credits = 10000;
    const r = buyShip(s);
    expect(r.ok).toBe(true);
    expect(s.ships).toHaveLength(2);
    expect(s.ships[1].name).toBe("Hauler-2");
    expect(s.ships[1].locationBodyId).toBe("earth");
    expect(s.credits).toBe(7000);
  });

  it("rejects when credits insufficient", () => {
    const s = fresh();
    s.credits = 100;
    const r = buyShip(s);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("insufficient credits");
    expect(s.ships).toHaveLength(1);
  });

  it("naming is sequential: 2nd buy → Hauler-3", () => {
    const s = fresh();
    s.credits = 100000;
    buyShip(s);
    buyShip(s);
    expect(s.ships.map((sh) => sh.name)).toEqual(["Hauler-1", "Hauler-2", "Hauler-3"]);
  });

  it("buyShip names a Miner-1 'Miner-N', not 'Scout-N' (regression)", () => {
    const s = fresh();
    s.credits = 100000;
    buyShip(s, "miner_1");
    const miner = s.ships.find((sh) => sh.defId === "miner_1");
    expect(miner!.name).toBe("Miner-1");
  });

  it("buyShip names a Scout-1 'Scout-N'", () => {
    const s = fresh();
    s.credits = 100000;
    buyShip(s, "scout_1");
    const scout = s.ships.find((sh) => sh.defId === "scout_1");
    expect(scout!.name).toBe("Scout-1");
  });
});

describe("buyFromEarth", () => {
  it("deducts cost and adds resource to destination warehouse", () => {
    const s = fresh();
    s.credits = 1000;
    const r = buyFromEarth(s, "iron_ore", 50, "earth"); // 3 * 50 = 150
    expect(r.ok).toBe(true);
    expect(s.credits).toBe(850);
    expect(s.bodies.earth.warehouse.iron_ore).toBe(50);
  });

  it("rejects when credits insufficient", () => {
    const s = fresh();
    s.credits = 10;
    const r = buyFromEarth(s, "iron_ore", 50, "earth");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("insufficient credits");
  });

  it("rejects when destination is full", () => {
    const s = fresh();
    s.credits = 100000;
    s.bodies.nea_04.warehouse.iron_ore = 100; // fills baseline
    const r = buyFromEarth(s, "iron_ore", 1, "nea_04");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("destination storage full");
  });
});

describe("sellToEarth", () => {
  it("decrements Earth stockpile, credits the player at earthSell", () => {
    const s = fresh();
    s.bodies.earth.warehouse.refined_metal = 20;
    s.credits = 0;
    const r = sellToEarth(s, "refined_metal", 20);
    expect(r.ok).toBe(true);
    expect(s.bodies.earth.warehouse.refined_metal).toBe(0);
    expect(s.credits).toBe(20 * 12);
  });

  it("rejects when Earth doesn't have enough stock", () => {
    const s = fresh();
    s.bodies.earth.warehouse.refined_metal = 5;
    const r = sellToEarth(s, "refined_metal", 20);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("not enough at Earth");
  });

  it("counts toward refinedMetalSoldLifetime when selling refined metal", () => {
    const s = fresh();
    s.bodies.earth.warehouse.refined_metal = 50;
    sellToEarth(s, "refined_metal", 50);
    expect(s.refinedMetalSoldLifetime).toBe(50);
  });

  it("does not count other resources toward refined metal lifetime", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 50;
    sellToEarth(s, "iron_ore", 50);
    expect(s.refinedMetalSoldLifetime).toBe(0);
  });
});

describe("buyPrefabKit", () => {
  it("rejects before T1", () => {
    const s = fresh();
    s.credits = 100000;
    const r = buyPrefabKit(s, "lunar_habitat");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("T1 required");
  });

  it("rejects when credits insufficient", () => {
    const s = fresh();
    s.tier = 1;
    s.credits = 100;
    const r = buyPrefabKit(s, "lunar_habitat");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("insufficient credits");
  });

  it("Lunar Habitat: deploys a habitat, seeds pop=10, seeds life-support buffer", () => {
    const s = fresh();
    s.tier = 1;
    s.credits = 10000;
    const r = buyPrefabKit(s, "lunar_habitat");
    expect(r.ok).toBe(true);
    expect(s.populations.lunar_habitat).toBeDefined();
    expect(s.populations.lunar_habitat!.pop).toBe(10);
    expect(s.populations.lunar_habitat!.cap).toBe(50);
    expect(s.populations.lunar_habitat!.tier).toBe("survival");
    // Life-support seed
    expect(s.bodies.lunar_habitat.warehouse.water_ice).toBeGreaterThan(0);
    expect(s.bodies.lunar_habitat.warehouse.oxygen).toBeGreaterThan(0);
    expect(s.bodies.lunar_habitat.warehouse.food_pack).toBeGreaterThan(0);
    expect(s.bodies.lunar_habitat.warehouse.habitat_module).toBe(1);
    expect(s.credits).toBe(2000);
  });

  it("rejects a 2nd Lunar Habitat purchase (1 of 1 per run)", () => {
    const s = fresh();
    s.tier = 1;
    s.credits = 100000;
    buyPrefabKit(s, "lunar_habitat");
    const r = buyPrefabKit(s, "lunar_habitat");
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/already deployed/);
  });

  it("Lunar Surface Mine kit: drops a Surface Mine on first free Moon tile", () => {
    const s = fresh();
    s.tier = 1;
    s.credits = 10000;
    const r = buyPrefabKit(s, "lunar_surface_mine_kit");
    expect(r.ok).toBe(true);
    expect(s.bodies.moon.buildings).toHaveLength(1);
    expect(s.bodies.moon.buildings[0].defId).toBe("lunar_surface_mine");
  });

  it("Surface Mine kit fills sequential tiles when called multiple times — but each kit costs", () => {
    const s = fresh();
    s.tier = 1;
    s.credits = 100000;
    buyPrefabKit(s, "lunar_surface_mine_kit");
    buyPrefabKit(s, "lunar_surface_mine_kit");
    expect(s.bodies.moon.buildings).toHaveLength(2);
    expect(s.credits).toBe(100000 - 3500 * 2);
  });

  it("kit cost matches PREFAB_KITS — single source of truth (regression)", async () => {
    const { PREFAB_KITS } = await import("./defs");
    const s = fresh();
    s.tier = 1;
    s.credits = 100000;
    buyPrefabKit(s, "construction_cache");
    expect(s.credits).toBe(100000 - PREFAB_KITS.construction_cache.cost);
  });

  it("Surface Mine kit rolls back cleanly when no free tile (no half-spent credits)", () => {
    const s = fresh();
    s.tier = 1;
    s.credits = 100000;
    // Saturate the Moon grid so there is no free tile.
    const moon = s.bodies.moon;
    for (let y = 0; y < moon.gridH; y++) {
      for (let x = 0; x < moon.gridW; x++) {
        moon.buildings.push({
          id: `b_fill_${x}_${y}`,
          defId: "silo",
          x,
          y,
          paused: false,
          cycleProgress: 0,
        });
      }
    }
    const before = s.credits;
    const r = buyPrefabKit(s, "lunar_surface_mine_kit");
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/no free tile/);
    expect(s.credits).toBe(before);
  });
});

describe("claimTierUp", () => {
  it("rejects when tierUpReady is false", () => {
    const s = fresh();
    const r = claimTierUp(s);
    expect(r.ok).toBe(false);
  });

  it("advances tier 0 → 1, sets tierUpClaimed and tierUpModalSeen=false", () => {
    const s = fresh();
    s.tierUpReady = true;
    const r = claimTierUp(s);
    expect(r.ok).toBe(true);
    expect(s.tier).toBe(1);
    expect(s.tierUpReady).toBe(false);
    expect(s.tierUpClaimed[1]).toBe(true);
    expect(s.tierUpModalSeen[1]).toBe(false);
  });

  it("logs the canon T1 voice line and emits an info alert", () => {
    const s = fresh();
    s.tierUpReady = true;
    claimTierUp(s);
    expect(s.log.some((l) => l.text.match(/T1 Lunar Foothold authorized/))).toBe(true);
    expect(s.alerts.some((a) => a.title === "T1 Lunar Foothold authorized")).toBe(true);
  });

  it("rejects a re-claim once already at T1", () => {
    const s = fresh();
    s.tierUpReady = true;
    claimTierUp(s);
    const r = claimTierUp(s);
    expect(r.ok).toBe(false);
  });
});

describe("tick + auto-detect tier-gate", () => {
  it("does not trip when only metal sold but no fuel reserves", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.hydrogen_fuel = 0; // clear helper seed; gate sums earth+nea_04 fuel
    s.refinedMetalSoldLifetime = 200;
    tick(s, 1);
    expect(s.tierUpReady).toBe(false);
  });

  it("does not trip when fuel reserves but no metal sold", () => {
    const s = fresh();
    s.bodies.earth.warehouse.hydrogen_fuel = 80;
    tick(s, 1);
    expect(s.tierUpReady).toBe(false);
  });

  it("trips when both gate conditions are satisfied (metal sold + fuel sum ≥ 50)", () => {
    const s = fresh();
    s.refinedMetalSoldLifetime = 200;
    s.bodies.earth.warehouse.hydrogen_fuel = 30;
    s.bodies.nea_04.warehouse.hydrogen_fuel = 25;
    tick(s, 1);
    expect(s.tierUpReady).toBe(true);
  });

  it("emits the 'T1 ready' info alert exactly once across multiple ticks", () => {
    const s = fresh();
    s.refinedMetalSoldLifetime = 200;
    s.bodies.earth.warehouse.hydrogen_fuel = 80;
    tick(s, 1);
    tick(s, 1);
    tick(s, 1);
    const matches = s.alerts.filter((a) => a.title === "T1 ready: Lunar Foothold available");
    expect(matches).toHaveLength(1);
  });
});

describe("forcePlace + demolish round-trip", () => {
  it("placing then demolishing returns roughly even credit position", () => {
    const s = fresh();
    s.credits = 5000;
    placeBuilding(s, "nea_04", "small_mine", 0, 0);
    placeBuilding(s, "nea_04", "small_mine", 1, 0);
    placeBuilding(s, "nea_04", "small_mine", 2, 0);
    expect(s.credits).toBe(5000 - 800 * 3);
    for (const b of [...s.bodies.nea_04.buildings]) {
      demolishBuilding(s, "nea_04", b.id);
    }
    // Each demolish refunds 400, so total refund 1200; net loss 1200.
    expect(s.credits).toBe(5000 - 800 * 3 + 400 * 3);
    expect(s.bodies.nea_04.buildings).toHaveLength(0);
  });
});

// Force-import this so eslint sees forcePlace as used.
void forcePlace;
