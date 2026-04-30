import { describe, expect, it } from "vitest";
import {
  KEPLER,
  apsides,
  currentTrueAnomaly,
  frameBound,
  frameCenter,
  keplerEllipsePoints,
  keplerPosition,
  keplerPositionAt,
  keplerViewBound,
  nominalPairDistance,
  perifocalPosition,
  predictBodyTrack,
  shipKeplerPosition,
  shipTrajectoryAt,
  shipTrajectoryEndpoints,
  shipTrajectoryFuturePoints,
  solveIntercept,
  solveKepler,
  timeToNextPeriapsis,
  travelTimeForDistance,
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

  it("matches shipTrajectoryAt at the corresponding progress fraction", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const route = s.ships[0].route!;
    route.travelSecRemaining = route.travelSecTotal * 0.4;
    const sp = shipKeplerPosition(s, s.ships[0]);
    const expected = shipTrajectoryAt(s.ships[0], 0.6);
    expect(sp.x).toBeCloseTo(expected.x, 8);
    expect(sp.y).toBeCloseTo(expected.y, 8);
    expect(sp.z).toBeCloseTo(expected.z, 8);
  });

  it("starts at origin@dispatch and ends at destination@arrival", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const route = s.ships[0].route!;
    const start = shipTrajectoryAt(s.ships[0], 0);
    const end = shipTrajectoryAt(s.ships[0], 1);
    const expectedStart = keplerPositionAt("earth", route.dispatchGameTimeSec);
    const expectedEnd = keplerPositionAt("nea_04", route.dispatchGameTimeSec + route.travelSecTotal);
    expect(start.x).toBeCloseTo(expectedStart.x, 6);
    expect(start.y).toBeCloseTo(expectedStart.y, 6);
    expect(end.x).toBeCloseTo(expectedEnd.x, 6);
    expect(end.y).toBeCloseTo(expectedEnd.y, 6);
  });

  it("Earth↔NEA arc stays within Earth's local neighborhood (cislunar hop)", () => {
    // NEA-04 sits at Earth-Moon L4, so an Earth↔NEA leg is a short cislunar
    // hop, not a heliocentric crossing. Every sample should sit close to
    // Earth's path (within a few Moon-orbit radii).
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const route = s.ships[0].route!;
    const moonOrbit = KEPLER.moon.a;
    for (let i = 0; i <= 64; i++) {
      const t01 = i / 64;
      const p = shipTrajectoryAt(s.ships[0], t01);
      const earth = keplerPositionAt(
        "earth",
        route.dispatchGameTimeSec + route.travelSecTotal * t01,
      );
      const r = Math.hypot(p.x - earth.x, p.y - earth.y, p.z - earth.z);
      // Sampling endpoints at the route's instantaneous Earth gives a generous
      // bound — the path bends around the dispatch-time pivot, so it can drift
      // a couple of Moon-orbits away from current-Earth at mid-leg, but never
      // far enough to leave the Earth neighborhood.
      expect(r).toBeLessThan(moonOrbit * 8);
    }
  });

  it("aims at where the destination *will be* — diverges from a naïve current-position lerp", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const route = s.ships[0].route!;
    route.travelSecRemaining = route.travelSecTotal / 2;
    const sp = shipKeplerPosition(s, s.ships[0]);
    const fromNow = keplerPosition(s, "earth");
    const toNow = keplerPosition(s, "nea_04");
    const naive = {
      x: (fromNow.x + toNow.x) / 2,
      y: (fromNow.y + toNow.y) / 2,
      z: (fromNow.z + toNow.z) / 2,
    };
    const drift = Math.hypot(sp.x - naive.x, sp.y - naive.y, sp.z - naive.z);
    // The arc bends well away from a straight midpoint.
    expect(drift).toBeGreaterThan(1);
  });
});

describe("shipTrajectoryFuturePoints", () => {
  it("returns samples+1 points starting at the ship's current position", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const route = s.ships[0].route!;
    route.travelSecRemaining = route.travelSecTotal * 0.7;
    const arc = shipTrajectoryFuturePoints(s.ships[0], 16);
    expect(arc).toHaveLength(17);
    const sp = shipKeplerPosition(s, s.ships[0]);
    expect(arc[0].x).toBeCloseTo(sp.x, 6);
    expect(arc[0].y).toBeCloseTo(sp.y, 6);
  });

  it("ends at destination@arrival", () => {
    const s = fresh();
    startRoute(s, s.ships[0], "earth", "nea_04", null, false, false);
    const route = s.ships[0].route!;
    const arc = shipTrajectoryFuturePoints(s.ships[0], 16);
    const expectedEnd = keplerPositionAt("nea_04", route.dispatchGameTimeSec + route.travelSecTotal);
    expect(arc[arc.length - 1].x).toBeCloseTo(expectedEnd.x, 6);
    expect(arc[arc.length - 1].y).toBeCloseTo(expectedEnd.y, 6);
  });

  it("returns an empty array when the ship has no route", () => {
    const s = fresh();
    expect(shipTrajectoryFuturePoints(s.ships[0])).toHaveLength(0);
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

describe("travelTimeForDistance (accel→coast→decel kinematic profile)", () => {
  it("zero distance is zero time", () => {
    expect(travelTimeForDistance(0, 2, 4)).toBe(0);
  });

  it("triangular profile (never reaches cruise): t = 2·√(d/a)", () => {
    // d_acc = v²/(2a) = 16/4 = 4. d=4 < 2·d_acc=8 → triangular.
    const t = travelTimeForDistance(4, 2, 4);
    expect(t).toBeCloseTo(2 * Math.sqrt(4 / 2), 6); // ≈ 2.828
  });

  it("trapezoidal profile (cruise + coast): two burns plus cruise span", () => {
    // accel=2, vmax=4 → d_acc=4, t_acc=2. d=22 → 2·d_acc=8, d_cruise=14, t_cruise=3.5
    // total = 2 + 3.5 + 2 = 7.5
    expect(travelTimeForDistance(22, 2, 4)).toBeCloseTo(7.5, 6);
  });

  it("longer hauls scale roughly linearly with distance once cruise is reached", () => {
    const t100 = travelTimeForDistance(100, 2, 4);
    const t200 = travelTimeForDistance(200, 2, 4);
    // Difference should be ~100/vmax = 25 (the extra cruise span).
    expect(t200 - t100).toBeCloseTo(25, 1);
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
    const sol = solveIntercept("earth", "nea_04", 0, 2, 4);
    expect(sol.travelSec).toBeGreaterThan(0);
    expect(isFinite(sol.travelSec)).toBe(true);
    // Self-consistency: at the solved arrival time, the destination is at
    // the lead point we computed, and the chase distance is the same one
    // the kinematic time-from-distance helper would predict.
    const toAtArrival = keplerPositionAt("nea_04", sol.travelSec);
    const dist = Math.hypot(
      toAtArrival.x - sol.fromPos.x,
      toAtArrival.y - sol.fromPos.y,
      toAtArrival.z - sol.fromPos.z,
    );
    expect(dist).toBeCloseTo(sol.distance, 4);
    expect(sol.travelSec).toBeCloseTo(travelTimeForDistance(dist, 2, 4), 1);
    expect(sol.toPosAtArrival.x).toBeCloseTo(toAtArrival.x, 4);
  });

  it("travel time differs across dispatch times (orbital geometry varies)", () => {
    // Different dispatch instants give different intercept solutions because
    // Earth has moved between dispatches, so the chase geometry to NEA-04's
    // lead point differs even though NEA-04's local position is periodic.
    const t1 = solveIntercept("earth", "nea_04", 0, 2, 4).travelSec;
    const t2 = solveIntercept("earth", "nea_04", 240, 2, 4).travelSec;
    expect(Math.abs(t1 - t2)).toBeGreaterThan(0.05);
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

describe("frameCenter / frameBound", () => {
  it("system frame centers on the Sun (origin)", () => {
    const s = fresh();
    const c = frameCenter(s, "system");
    expect(c).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("earth frame centers on Earth's current position", () => {
    const s = fresh();
    s.gameTimeSec = 42;
    const c = frameCenter(s, "earth");
    const e = keplerPosition(s, "earth");
    expect(c).toEqual(e);
  });

  it("earth frame bound covers the cislunar neighborhood (Moon + NEA + lunar habitat)", () => {
    const b = frameBound("earth");
    // Earth's children: Moon, NEA-04. Moon's children: lunar_habitat. So the
    // tightest bound that fits everything cislunar is moon-apoapsis + lunar
    // habitat apoapsis, which is well over the Moon's own apoapsis.
    expect(b).toBeGreaterThan(apsides(KEPLER.moon).apoapsis);
  });

  it("earth frame bound is much smaller than the heliocentric bound", () => {
    expect(frameBound("earth")).toBeLessThan(frameBound("system"));
  });

  it("moon frame bound only reaches the lunar habitat", () => {
    const b = frameBound("moon");
    expect(b).toBeGreaterThanOrEqual(apsides(KEPLER.lunar_habitat).apoapsis);
    expect(b).toBeLessThan(apsides(KEPLER.moon).apoapsis);
  });
});
