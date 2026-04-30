import { beforeEach, describe, expect, it } from "vitest";
import {
  ORBITS,
  bodyPosition,
  orbitRings,
  routeProgress,
  shipPosition,
  viewBoundRadius,
} from "./solarmap";
import { startRoute } from "./sim";
import { fresh } from "../test/helpers";
import { resetRandom } from "../test/setup";

beforeEach(() => resetRandom());

describe("bodyPosition", () => {
  it("Earth at t=0 sits at its phase angle on its orbit", () => {
    const s = fresh();
    s.gameTimeSec = 0;
    const p = bodyPosition(s, "earth");
    expect(p.x).toBeCloseTo(Math.cos(ORBITS.earth.phase) * ORBITS.earth.radius, 5);
    expect(p.y).toBeCloseTo(Math.sin(ORBITS.earth.phase) * ORBITS.earth.radius, 5);
  });

  it("Earth completes a full orbit in its period", () => {
    const s = fresh();
    const p1 = bodyPosition(s, "earth");
    s.gameTimeSec = ORBITS.earth.periodSec;
    const p2 = bodyPosition(s, "earth");
    expect(p2.x).toBeCloseTo(p1.x, 5);
    expect(p2.y).toBeCloseTo(p1.y, 5);
  });

  it("Moon orbits around Earth's *current* position (not the Sun)", () => {
    const s = fresh();
    s.gameTimeSec = 100;
    const earth = bodyPosition(s, "earth");
    const moon = bodyPosition(s, "moon");
    const dist = Math.hypot(moon.x - earth.x, moon.y - earth.y);
    expect(dist).toBeCloseTo(ORBITS.moon.radius, 5);
  });

  it("Lunar habitat orbits the Moon at its small radius", () => {
    const s = fresh();
    s.gameTimeSec = 17;
    const moon = bodyPosition(s, "moon");
    const hab = bodyPosition(s, "lunar_habitat");
    const dist = Math.hypot(hab.x - moon.x, hab.y - moon.y);
    expect(dist).toBeCloseTo(ORBITS.lunar_habitat.radius, 5);
  });

  it("NEA-04 orbits Earth at its fixed L4 radius (= Moon orbit radius)", () => {
    const s = fresh();
    s.gameTimeSec = 50;
    const earth = bodyPosition(s, "earth");
    const nea = bodyPosition(s, "nea_04");
    const dist = Math.hypot(nea.x - earth.x, nea.y - earth.y);
    expect(dist).toBeCloseTo(ORBITS.nea_04.radius, 5);
  });

  it("NEA-04 stays 60° ahead of the Moon (Earth-Moon L4)", () => {
    const s = fresh();
    for (const t of [0, 17, 50, 200]) {
      s.gameTimeSec = t;
      const earth = bodyPosition(s, "earth");
      const moon = bodyPosition(s, "moon");
      const nea = bodyPosition(s, "nea_04");
      const moonAng = Math.atan2(moon.y - earth.y, moon.x - earth.x);
      const neaAng = Math.atan2(nea.y - earth.y, nea.x - earth.x);
      let delta = neaAng - moonAng;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      expect(delta).toBeCloseTo(Math.PI / 3, 5);
    }
  });

  it("body positions change continuously as game time advances", () => {
    const s = fresh();
    s.gameTimeSec = 0;
    const a = bodyPosition(s, "earth");
    s.gameTimeSec = 1;
    const b = bodyPosition(s, "earth");
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(0);
  });
});

describe("routeProgress", () => {
  it("returns 0 when ship has no route", () => {
    const s = fresh();
    expect(routeProgress(s.ships[0])).toBe(0);
  });

  it("0 at dispatch (full time remaining)", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    expect(routeProgress(s.ships[0])).toBe(0);
  });

  it("1 at completion (0 time remaining)", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    s.ships[0].route!.travelSecRemaining = 0;
    expect(routeProgress(s.ships[0])).toBe(1);
  });

  it("0.5 at the halfway point of a route", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    s.ships[0].route!.travelSecRemaining = s.ships[0].route!.travelSecTotal / 2;
    expect(routeProgress(s.ships[0])).toBeCloseTo(0.5, 5);
  });

  it("clamps to [0,1] even with degenerate values", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    s.ships[0].route!.travelSecRemaining = -5;
    expect(routeProgress(s.ships[0])).toBe(1);
    s.ships[0].route!.travelSecRemaining = 1000;
    expect(routeProgress(s.ships[0])).toBe(0);
  });
});

describe("shipPosition", () => {
  it("idle ship sits at its body's position", () => {
    const s = fresh();
    s.ships[0].locationBodyId = "nea_04";
    const ship = bodyPosition(s, "nea_04");
    const sp = shipPosition(s, s.ships[0]);
    expect(sp).toEqual(ship);
  });

  it("midway through a route, ship is the midpoint of from→to", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    s.ships[0].route!.travelSecRemaining = s.ships[0].route!.travelSecTotal / 2;
    const from = bodyPosition(s, "earth");
    const to = bodyPosition(s, "nea_04");
    const sp = shipPosition(s, s.ships[0]);
    expect(sp.x).toBeCloseTo((from.x + to.x) / 2, 5);
    expect(sp.y).toBeCloseTo((from.y + to.y) / 2, 5);
  });

  it("at dispatch, ship is at origin body", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const sp = shipPosition(s, s.ships[0]);
    const earth = bodyPosition(s, "earth");
    expect(sp.x).toBeCloseTo(earth.x, 5);
    expect(sp.y).toBeCloseTo(earth.y, 5);
  });

  it("at arrival, ship is at destination body", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    s.ships[0].route!.travelSecRemaining = 0;
    const sp = shipPosition(s, s.ships[0]);
    const nea = bodyPosition(s, "nea_04");
    expect(sp.x).toBeCloseTo(nea.x, 5);
    expect(sp.y).toBeCloseTo(nea.y, 5);
  });
});

describe("viewBoundRadius", () => {
  it("equals the largest cumulative orbit radius (Earth+Moon+Habitat chain)", () => {
    // With NEA-04 docked at Earth-Moon L4 (parent=earth, radius=22), the
    // outermost reach is the Earth → Moon → Habitat chain at 110+22+6 = 138.
    expect(viewBoundRadius()).toBe(
      ORBITS.earth.radius + ORBITS.moon.radius + ORBITS.lunar_habitat.radius,
    );
  });
});

describe("orbitRings", () => {
  it("returns one ring per orbit-bearing body", () => {
    const rings = orbitRings();
    expect(rings).toHaveLength(Object.keys(ORBITS).length);
    const ids = rings.map((r) => r.bodyId).sort();
    expect(ids).toEqual(["earth", "lunar_habitat", "moon", "nea_04"]);
  });

  it("each ring carries its parent reference for parent-relative drawing", () => {
    const rings = orbitRings();
    const earth = rings.find((r) => r.bodyId === "earth")!;
    const moon = rings.find((r) => r.bodyId === "moon")!;
    const hab = rings.find((r) => r.bodyId === "lunar_habitat")!;
    expect(earth.center).toBe("sun");
    expect(moon.center).toBe("earth");
    expect(hab.center).toBe("moon");
  });
});
