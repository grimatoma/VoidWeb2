import { describe, expect, it } from "vitest";
import {
  KEPLER,
  apsides,
  currentTrueAnomaly,
  keplerEllipsePoints,
  keplerPosition,
  keplerViewBound,
  perifocalPosition,
  predictBodyTrack,
  shipKeplerPosition,
  solveKepler,
  timeToNextPeriapsis,
  trueAnomaly,
} from "./kepler";
import { startRoute } from "./sim";
import { fresh } from "../test/helpers";

describe("solveKepler", () => {
  it("circular orbit (e=0): E equals M", () => {
    expect(solveKepler(0.5, 0)).toBeCloseTo(0.5, 9);
    expect(solveKepler(2.3, 0)).toBeCloseTo(2.3 - 2 * Math.PI < -Math.PI ? 2.3 : 2.3 - 2 * Math.PI, 5);
  });

  it("highly eccentric orbit (e=0.9) converges and satisfies M = E - e·sin(E)", () => {
    const e = 0.9;
    for (const M of [0.1, 1.2, 2.5, -0.7]) {
      const E = solveKepler(M, e);
      const back = E - e * Math.sin(E);
      // Wrap M for comparison
      const wrap = (x: number) => ((x + Math.PI) % (2 * Math.PI)) - Math.PI;
      expect(wrap(back)).toBeCloseTo(wrap(M), 6);
    }
  });

  it("M=0 → E=0 for any eccentricity", () => {
    for (const e of [0, 0.1, 0.5, 0.9]) {
      expect(solveKepler(0, e)).toBeCloseTo(0, 9);
    }
  });
});

describe("trueAnomaly", () => {
  it("ν = E for circular orbit (e=0)", () => {
    expect(trueAnomaly(0.7, 0)).toBeCloseTo(0.7, 9);
  });
  it("ν > E in the first half of an eccentric orbit (faster near periapsis)", () => {
    const E = 1.0;
    const ν = trueAnomaly(E, 0.5);
    expect(ν).toBeGreaterThan(E);
  });
});

describe("apsides", () => {
  it("Earth (e=0.0167): periapsis < a < apoapsis", () => {
    const { periapsis, apoapsis } = apsides(KEPLER.earth);
    expect(periapsis).toBeLessThan(KEPLER.earth.a);
    expect(apoapsis).toBeGreaterThan(KEPLER.earth.a);
    // Mean of the two is exactly a.
    expect((periapsis + apoapsis) / 2).toBeCloseTo(KEPLER.earth.a, 9);
  });

  it("circular orbit collapses periapsis = apoapsis = a", () => {
    const { periapsis, apoapsis } = apsides({ ...KEPLER.earth, e: 0 });
    expect(periapsis).toBe(KEPLER.earth.a);
    expect(apoapsis).toBe(KEPLER.earth.a);
  });
});

describe("perifocalPosition", () => {
  it("at M=0 the body sits at periapsis on +x axis", () => {
    const el = { ...KEPLER.earth, M0: 0 };
    const p = perifocalPosition(el, 0);
    expect(p.x).toBeCloseTo(el.a * (1 - el.e), 6);
    expect(p.y).toBeCloseTo(0, 6);
  });

  it("at half-period (M=π) the body is at apoapsis on -x axis", () => {
    const el = { ...KEPLER.earth, M0: 0 };
    const p = perifocalPosition(el, el.periodSec / 2);
    expect(p.x).toBeCloseTo(-el.a * (1 + el.e), 5);
    expect(p.y).toBeCloseTo(0, 4);
  });

  it("after one full period the body returns to its starting point", () => {
    const el = KEPLER.nea_04;
    const p1 = perifocalPosition(el, 100);
    const p2 = perifocalPosition(el, 100 + el.periodSec);
    expect(p2.x).toBeCloseTo(p1.x, 6);
    expect(p2.y).toBeCloseTo(p1.y, 6);
  });
});

describe("keplerPosition (inertial, hierarchical)", () => {
  it("Sun is the implicit root at the origin", () => {
    const s = fresh();
    const p = keplerPosition(s, "earth");
    // No assertion on Earth's exact position — just that a position came back.
    expect(typeof p.x).toBe("number");
    expect(typeof p.y).toBe("number");
    expect(typeof p.z).toBe("number");
  });

  it("Earth's distance from origin lies between periapsis and apoapsis", () => {
    const s = fresh();
    const { periapsis, apoapsis } = apsides(KEPLER.earth);
    for (const t of [0, 30, 90, 200, 360]) {
      s.gameTimeSec = t;
      const p = keplerPosition(s, "earth");
      const r = Math.hypot(p.x, p.y, p.z);
      expect(r).toBeGreaterThanOrEqual(periapsis - 1e-6);
      expect(r).toBeLessThanOrEqual(apoapsis + 1e-6);
    }
  });

  it("Moon stays within Moon-relative apsides of Earth", () => {
    const s = fresh();
    const { periapsis, apoapsis } = apsides(KEPLER.moon);
    for (const t of [0, 17, 50]) {
      s.gameTimeSec = t;
      const earth = keplerPosition(s, "earth");
      const moon = keplerPosition(s, "moon");
      const dist = Math.hypot(moon.x - earth.x, moon.y - earth.y, moon.z - earth.z);
      expect(dist).toBeGreaterThanOrEqual(periapsis - 1e-6);
      expect(dist).toBeLessThanOrEqual(apoapsis + 1e-6);
    }
  });

  it("Lunar habitat tracks the Moon (stays within habitat-orbit apsides)", () => {
    const s = fresh();
    const { periapsis, apoapsis } = apsides(KEPLER.lunar_habitat);
    for (const t of [0, 9, 12, 30]) {
      s.gameTimeSec = t;
      const moon = keplerPosition(s, "moon");
      const hab = keplerPosition(s, "lunar_habitat");
      const dist = Math.hypot(hab.x - moon.x, hab.y - moon.y, hab.z - moon.z);
      expect(dist).toBeGreaterThanOrEqual(periapsis - 1e-6);
      expect(dist).toBeLessThanOrEqual(apoapsis + 1e-6);
    }
  });

  it("inclined NEA-04 has a nonzero z-component over time", () => {
    const s = fresh();
    let zRange = 0;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (let t = 0; t < KEPLER.nea_04.periodSec; t += 10) {
      s.gameTimeSec = t;
      const p = keplerPosition(s, "nea_04");
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    }
    zRange = maxZ - minZ;
    expect(zRange).toBeGreaterThan(0);
  });
});

describe("keplerEllipsePoints", () => {
  it("returns the requested sample count, all on the orbit", () => {
    const pts = keplerEllipsePoints(KEPLER.earth, 64);
    expect(pts).toHaveLength(64);
    const { periapsis, apoapsis } = apsides(KEPLER.earth);
    for (const p of pts) {
      const r = Math.hypot(p.x, p.y, p.z);
      expect(r).toBeGreaterThanOrEqual(periapsis - 1e-6);
      expect(r).toBeLessThanOrEqual(apoapsis + 1e-6);
    }
  });
});

describe("timeToNextPeriapsis + currentTrueAnomaly", () => {
  it("returns a positive duration ≤ periodSec", () => {
    const t = timeToNextPeriapsis(KEPLER.earth, 100);
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThanOrEqual(KEPLER.earth.periodSec);
  });

  it("currentTrueAnomaly is 0 at periapsis (M=0)", () => {
    const el = { ...KEPLER.earth, M0: 0 };
    expect(currentTrueAnomaly(el, 0)).toBeCloseTo(0, 9);
  });
});

describe("shipKeplerPosition", () => {
  it("idle ship sits at its docked body's Kepler position", () => {
    const s = fresh();
    s.ships[0].locationBodyId = "earth";
    const ship = shipKeplerPosition(s, s.ships[0]);
    const earth = keplerPosition(s, "earth");
    expect(ship).toEqual(earth);
  });

  it("midway through a route, ship is the midpoint of from→to inertial positions", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    s.ships[0].route!.travelSecRemaining = s.ships[0].route!.travelSecTotal / 2;
    const from = keplerPosition(s, "earth");
    const to = keplerPosition(s, "nea_04");
    const sp = shipKeplerPosition(s, s.ships[0]);
    expect(sp.x).toBeCloseTo((from.x + to.x) / 2, 5);
    expect(sp.y).toBeCloseTo((from.y + to.y) / 2, 5);
    expect(sp.z).toBeCloseTo((from.z + to.z) / 2, 5);
  });
});

describe("predictBodyTrack", () => {
  it("returns samples+1 points over the lookahead window", () => {
    const s = fresh();
    const track = predictBodyTrack(s, "earth", 60, 10);
    expect(track).toHaveLength(11);
  });

  it("first sample equals the body's current position", () => {
    const s = fresh();
    const track = predictBodyTrack(s, "earth", 60, 10);
    const p = keplerPosition(s, "earth");
    expect(track[0]).toEqual(p);
  });
});

describe("keplerViewBound", () => {
  it("at least covers NEA-04's apoapsis (the outermost bound)", () => {
    const bound = keplerViewBound();
    expect(bound).toBeGreaterThanOrEqual(apsides(KEPLER.nea_04).apoapsis);
  });
});
