import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";

describe("createInitialState", () => {
  it("returns a valid GameState with the cold-open contract", () => {
    const s = createInitialState();
    expect(s.saveVersion).toBe(1);
    expect(s.tier).toBe(0);
    expect(s.credits).toBe(5000);
    expect(s.refinedMetalSoldLifetime).toBe(0);
    expect(s.tierUpReady).toBe(false);
    expect(s.tierUpClaimed[1]).toBe(false);
    expect(s.tierUpModalSeen[1]).toBe(false);
    expect(s.companyName).toBe("VOID YIELD CO.");
  });

  it("seeds Earth, Moon, NEA-04, and a stub habitat body (uninhabited)", () => {
    const s = createInitialState();
    expect(s.bodies.earth.type).toBe("earth");
    expect(s.bodies.moon.type).toBe("moon");
    expect(s.bodies.nea_04.type).toBe("nea");
    expect(s.bodies.lunar_habitat.type).toBe("habitat");
    expect(s.populations.lunar_habitat).toBeUndefined();
  });

  it("starts with one Hauler-1 idle at Earth", () => {
    const s = createInitialState();
    expect(s.ships).toHaveLength(1);
    expect(s.ships[0].defId).toBe("hauler_1");
    expect(s.ships[0].locationBodyId).toBe("earth");
    expect(s.ships[0].status).toBe("idle");
    expect(s.ships[0].route).toBeNull();
  });

  it("NEA-04 is staked at 5×5 — within the body-type range from GAME.md", () => {
    const s = createInitialState();
    expect(s.bodies.nea_04.gridW).toBeGreaterThanOrEqual(3);
    expect(s.bodies.nea_04.gridW).toBeLessThanOrEqual(5);
    expect(s.bodies.nea_04.gridH).toBeGreaterThanOrEqual(3);
    expect(s.bodies.nea_04.gridH).toBeLessThanOrEqual(5);
  });

  it("starts with no buildings, no alerts, no log, no prefab kits available", () => {
    const s = createInitialState();
    for (const body of Object.values(s.bodies)) {
      expect(body.buildings).toHaveLength(0);
    }
    expect(s.alerts).toHaveLength(0);
    expect(s.log).toHaveLength(0);
    expect(s.prefabKitsAvailable.lunar_habitat).toBe(0);
    expect(s.prefabKitsAvailable.lunar_surface_mine_kit).toBe(0);
  });

  it("each invocation returns a fresh, independent object graph", () => {
    const a = createInitialState();
    const b = createInitialState();
    a.credits = 99999;
    expect(b.credits).toBe(5000);
    a.bodies.nea_04.warehouse.iron_ore = 10;
    expect(b.bodies.nea_04.warehouse.iron_ore).toBeUndefined();
  });
});
