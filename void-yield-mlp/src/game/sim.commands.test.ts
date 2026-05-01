import { beforeEach, describe, expect, it } from "vitest";
import {
  buyFromEarth,
  buyPrefabKit,
  buyShip,
  claimTierUp,
  demolishBuilding,
  placeBuilding,
  sellToEarth,
  stakeClaim,
  startRoute,
  tick,
} from "./sim";
import { generateField } from "./survey";
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

  it("Construction Cache lands 60 CM + 4 Aluminum + 1 habitat module on Earth", () => {
    const s = fresh();
    s.tier = 1;
    s.credits = 10000;
    s.bodies.earth.warehouse.construction_materials = 5; // start non-zero to verify accumulation
    const r = buyPrefabKit(s, "construction_cache");
    expect(r.ok).toBe(true);
    expect(s.bodies.earth.warehouse.construction_materials).toBe(65);
    expect(s.bodies.earth.warehouse.aluminum).toBe(4);
    expect(s.bodies.earth.warehouse.habitat_module).toBe(1);
  });

  it("Construction Cache logs and emits a landed-at-Earth info alert", () => {
    const s = fresh();
    s.tier = 1;
    s.credits = 10000;
    buyPrefabKit(s, "construction_cache");
    expect(s.alerts.some((a) => a.title.match(/Construction Cache landed/))).toBe(true);
    expect(s.log.some((l) => l.text.match(/Construction Cache delivered/))).toBe(true);
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
    // Clear helper seeds; the gate sums earth + nea_04 hydrogen_fuel and the
    // helper now puts a reserve on each so dispatches work in other tests.
    s.bodies.earth.warehouse.hydrogen_fuel = 0;
    s.bodies.nea_04.warehouse.hydrogen_fuel = 0;
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

  it("trips when 50 fuel sits entirely on NEA-04 (no Earth-side reserve required)", () => {
    const s = fresh();
    s.refinedMetalSoldLifetime = 200;
    s.bodies.nea_04.warehouse.hydrogen_fuel = 50;
    tick(s, 1);
    expect(s.tierUpReady).toBe(true);
  });

  it("does not trip at 49 fuel even if metal threshold is met (strict gate)", () => {
    const s = fresh();
    s.refinedMetalSoldLifetime = 200;
    s.bodies.earth.warehouse.hydrogen_fuel = 49;
    s.bodies.nea_04.warehouse.hydrogen_fuel = 0; // gate sums earth + nea_04; helper seeds nea_04
    tick(s, 1);
    expect(s.tierUpReady).toBe(false);
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

describe("stakeClaim", () => {
  it("activates nea_04 with the staked candidate's grid and renames the body", () => {
    const s = fresh();
    s.survey.candidates = generateField(42);
    const cand = s.survey.candidates[3];
    cand.confidence = 1;
    cand.resolvedGrid = { w: 4, h: 5 };
    const r = stakeClaim(s, cand.id);
    expect(r.ok).toBe(true);
    expect(cand.staked).toBe(true);
    expect(s.bodies.nea_04.gridW).toBe(4);
    expect(s.bodies.nea_04.gridH).toBe(5);
    expect(s.bodies.nea_04.name).toMatch(/Claim/);
  });

  it("after staking, the player can place a NEA building and route a ship to nea_04", () => {
    const s = fresh();
    s.survey.candidates = generateField(11);
    const cand = s.survey.candidates[0];
    cand.confidence = 1;
    cand.resolvedGrid = cand.hiddenGrid;
    stakeClaim(s, cand.id);
    s.credits = 100_000;
    const place = placeBuilding(s, "nea_04", "small_mine", 0, 0);
    expect(place.ok).toBe(true);
    const route = startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(route.ok).toBe(true);
  });

  it("falls back to hiddenGrid when prospecting hasn't resolved a grid yet", () => {
    const s = fresh();
    s.survey.candidates = generateField(99);
    const cand = s.survey.candidates[1];
    cand.confidence = 0.7;
    cand.resolvedGrid = null;
    stakeClaim(s, cand.id);
    expect(s.bodies.nea_04.gridW).toBe(cand.hiddenGrid.w);
    expect(s.bodies.nea_04.gridH).toBe(cand.hiddenGrid.h);
  });

  it("preserves an in-progress base when a second candidate is staked", () => {
    const s = fresh();
    s.survey.candidates = generateField(7);
    const first = s.survey.candidates[0];
    const second = s.survey.candidates[1];
    first.confidence = 1;
    first.resolvedGrid = { w: 5, h: 5 };
    second.confidence = 1;
    second.resolvedGrid = { w: 3, h: 3 };
    stakeClaim(s, first.id);
    s.credits = 100_000;
    placeBuilding(s, "nea_04", "small_mine", 0, 0);
    const r = stakeClaim(s, second.id);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/claim slot full/);
    expect(s.bodies.nea_04.gridW).toBe(5);
    expect(s.bodies.nea_04.gridH).toBe(5);
    expect(s.bodies.nea_04.buildings).toHaveLength(1);
    expect(second.staked).toBe(false);
  });

  it("rejects staking the same candidate twice", () => {
    const s = fresh();
    s.survey.candidates = generateField(3);
    const cand = s.survey.candidates[0];
    cand.confidence = 1;
    cand.resolvedGrid = cand.hiddenGrid;
    expect(stakeClaim(s, cand.id).ok).toBe(true);
    const second = stakeClaim(s, cand.id);
    expect(second.ok).toBe(false);
    expect(second.reason).toMatch(/already staked/);
  });
});

// Force-import this so eslint sees forcePlace as used.
void forcePlace;
