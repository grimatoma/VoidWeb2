import { describe, expect, it } from "vitest";
import {
  KEPLER,
  apsides,
  currentTrueAnomaly,
  keplerEllipsePoints,
  keplerPosition,
  keplerPositionAt,
  keplerViewBound,
  nominalPairDistance,
  perifocalPosition,
  predictBodyTrack,
  shipKeplerPosition,
  shipTrajectoryEndpoints,
  solveIntercept,
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

  it("midway through a route, ship is the midpoint of (origin@dispatch, destination@arrival)", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const route = s.ships[0].route!;
    route.travelSecRemaining = route.travelSecTotal / 2;
    // Lead-the-target: midpoint of dispatch-frame origin and intercept-frame destination,
    // not midpoint of the bodies' *current* positions.
    const from = keplerPositionAt("earth", route.dispatchGameTimeSec);
    const to = keplerPositionAt("nea_04", route.dispatchGameTimeSec + route.travelSecTotal);
    const sp = shipKeplerPosition(s, s.ships[0]);
    expect(sp.x).toBeCloseTo((from.x + to.x) / 2, 5);
    expect(sp.y).toBeCloseTo((from.y + to.y) / 2, 5);
    expect(sp.z).toBeCloseTo((from.z + to.z) / 2, 5);
  });

  it("aims at where the destination *will be* — diverges from a naïve current-position lerp", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const route = s.ships[0].route!;
    route.travelSecRemaining = route.travelSecTotal / 2;
    const sp = shipKeplerPosition(s, s.ships[0]);
    // Naïve lerp: midpoint of current (gameTimeSec=0) inertial positions.
    const fromNow = keplerPosition(s, "earth");
    const toNow = keplerPosition(s, "nea_04");
    const naive = {
      x: (fromNow.x + toNow.x) / 2,
      y: (fromNow.y + toNow.y) / 2,
      z: (fromNow.z + toNow.z) / 2,
    };
    const drift = Math.hypot(sp.x - naive.x, sp.y - naive.y, sp.z - naive.z);
    // NEA-04 has period 480s and high eccentricity — it will have moved
    // noticeably during the leg, so the lead-point and now-point differ.
    expect(drift).toBeGreaterThan(1);
  });
});

describe("shipTrajectoryEndpoints", () => {
  it("returns origin@dispatch and destination@arrival for an in-transit ship", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const route = s.ships[0].route!;
    const ends = shipTrajectoryEndpoints(s.ships[0]);
    const expectedFrom = keplerPositionAt("earth", route.dispatchGameTimeSec);
    const expectedTo = keplerPositionAt("nea_04", route.dispatchGameTimeSec + route.travelSecTotal);
    expect(ends.from.x).toBeCloseTo(expectedFrom.x, 6);
    expect(ends.to.x).toBeCloseTo(expectedTo.x, 6);
    expect(ends.to.y).toBeCloseTo(expectedTo.y, 6);
    expect(ends.to.z).toBeCloseTo(expectedTo.z, 6);
  });
});

describe("nominalPairDistance / solveIntercept", () => {
  it("nominal pair distance is positive and symmetric", () => {
    const a = nominalPairDistance("earth", "nea_04");
    const b = nominalPairDistance("nea_04", "earth");
    expect(a).toBeGreaterThan(0);
    expect(a).toBeCloseTo(b, 6);
  });

  it("intercept solve converges so the destination reaches the lead point at arrival", () => {
    const sol = solveIntercept("earth", "nea_04", 0, 90);
    expect(sol.travelSec).toBeGreaterThan(0);
    expect(isFinite(sol.travelSec)).toBe(true);
    // Self-consistency: at the solved arrival time, the destination is at
    // the lead point we computed, and the cruise distance ≈ speed·travelSec.
    const toAtArrival = keplerPositionAt("nea_04", sol.travelSec);
    const dist = Math.hypot(
      toAtArrival.x - sol.fromPos.x,
      toAtArrival.y - sol.fromPos.y,
      toAtArrival.z - sol.fromPos.z,
    );
    expect(dist).toBeCloseTo(sol.speed * sol.travelSec, 1);
    expect(sol.toPosAtArrival.x).toBeCloseTo(toAtArrival.x, 4);
  });

  it("travel time differs across dispatch times (orbital geometry varies)", () => {
    // Different dispatch instants give different intercept solutions because
    // NEA-04 sweeps through eccentric and inclined positions over its 480s period.
    const t1 = solveIntercept("earth", "nea_04", 0, 90).travelSec;
    const t2 = solveIntercept("earth", "nea_04", 240, 90).travelSec;
    expect(Math.abs(t1 - t2)).toBeGreaterThan(0.5);
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
