// Kepler orbital mechanics for the solar map renderers.
//
// We're not a JPL ephemeris — bodies still get game-stylized periods and radii
// scaled to fit a screen — but the *shape* of motion is correct: elliptical
// orbits with foci, real periapsis/apoapsis distances, eccentric & true
// anomaly solved via Newton iteration on Kepler's equation, and 3D rotation
// through inclination, longitude of ascending node, and argument of periapsis.
//
// This module is renderer-agnostic. Each visualization (Canvas 2D, Three.js,
// SVG, Pixi, ASCII, etc.) reads from `keplerPosition` / `keplerEllipsePoints`
// to draw its own picture in its own coordinate system.

import type { BodyId, GameState } from "./state";
import type { Ship } from "./state";

export interface KeplerElements {
  /** Semi-major axis, in solar-canvas units. */
  a: number;
  /** Eccentricity, [0, 1). 0 = circular. */
  e: number;
  /** Inclination from the ecliptic, in radians. */
  i: number;
  /** Longitude of ascending node Ω, in radians. */
  Omega: number;
  /** Argument of periapsis ω, in radians. */
  omega: number;
  /** Mean anomaly at epoch t=0, in radians. */
  M0: number;
  /** Orbital period in game-time seconds. */
  periodSec: number;
  /** Parent body. The Sun is the implicit root. */
  parent: BodyId | "sun";
}

/**
 * Stylized-but-shape-correct Kepler elements for the MLP bodies.
 *
 * Eccentricities chosen so orbits are visibly elliptical (small bodies are
 * eccentric like real NEAs and the Moon, big planets are nearly circular).
 * Inclinations are non-zero on NEA-04 and the lunar habitat so 3D renderers
 * have something to show.
 */
export const KEPLER: Record<BodyId, KeplerElements> = {
  earth: {
    a: 110,
    e: 0.0167, // real Earth eccentricity
    i: 0,
    Omega: 0,
    omega: 0,
    M0: 0,
    periodSec: 360,
    parent: "sun",
  },
  moon: {
    a: 22,
    e: 0.0549, // real Moon eccentricity
    i: 0.0898, // ~5.14° real Moon inclination to ecliptic
    Omega: 0,
    omega: 0.5,
    M0: 0.4,
    periodSec: 60,
    parent: "earth",
  },
  nea_04: {
    a: 145,
    e: 0.31, // typical Apollo-class NEA range
    i: 0.16, // ~9° tilted off ecliptic
    Omega: 1.0,
    omega: 0.7,
    M0: 1.2,
    periodSec: 480,
    parent: "sun",
  },
  lunar_habitat: {
    a: 6,
    e: 0.02,
    i: 0.4,
    Omega: 0.2,
    omega: 0,
    M0: 0,
    periodSec: 24,
    parent: "moon",
  },
};

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Solve Kepler's equation M = E - e·sin(E) for the eccentric anomaly E.
 * Newton-Raphson, converges in ~5 iterations for e < 0.5.
 */
export function solveKepler(M: number, e: number, tol = 1e-9, maxIter = 32): number {
  // Wrap M into (-π, π) for stable convergence.
  let m = ((M + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (m < -Math.PI) m += 2 * Math.PI;
  let E = e < 0.8 ? m : Math.PI;
  for (let k = 0; k < maxIter; k++) {
    const f = E - e * Math.sin(E) - m;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < tol) break;
  }
  return E;
}

/** True anomaly ν from eccentric anomaly E and eccentricity e. */
export function trueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

/** Orbital-plane (perifocal) position for a Kepler element set at time t. */
export function perifocalPosition(el: KeplerElements, t: number): { x: number; y: number; r: number } {
  const M = el.M0 + (2 * Math.PI * t) / el.periodSec;
  const E = solveKepler(M, el.e);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  // Perifocal frame: focus at origin, periapsis on +x, motion CCW.
  const x = el.a * (cosE - el.e);
  const y = el.a * Math.sqrt(1 - el.e * el.e) * sinE;
  const r = Math.sqrt(x * x + y * y);
  return { x, y, r };
}

/**
 * Rotate a perifocal-plane vector to the inertial frame using
 * the ω → i → Ω rotation chain.
 */
export function perifocalToInertial(p: { x: number; y: number }, el: KeplerElements): Vec3 {
  const cosΩ = Math.cos(el.Omega);
  const sinΩ = Math.sin(el.Omega);
  const cosi = Math.cos(el.i);
  const sini = Math.sin(el.i);
  const cosω = Math.cos(el.omega);
  const sinω = Math.sin(el.omega);
  // Standard 3-1-3 rotation matrix product (e.g. Vallado "Fundamentals of Astrodynamics").
  const m11 = cosΩ * cosω - sinΩ * sinω * cosi;
  const m12 = -cosΩ * sinω - sinΩ * cosω * cosi;
  const m21 = sinΩ * cosω + cosΩ * sinω * cosi;
  const m22 = -sinΩ * sinω + cosΩ * cosω * cosi;
  const m31 = sinω * sini;
  const m32 = cosω * sini;
  return {
    x: m11 * p.x + m12 * p.y,
    y: m21 * p.x + m22 * p.y,
    z: m31 * p.x + m32 * p.y,
  };
}

/** Inertial 3D position of a body at the current game time. */
export function keplerPosition(state: GameState, bodyId: BodyId): Vec3 {
  return resolveKepler(bodyId, state.gameTimeSec);
}

/** Inertial 3D position of a body at an arbitrary game-time second. */
export function keplerPositionAt(bodyId: BodyId, t: number): Vec3 {
  return resolveKepler(bodyId, t);
}

function resolveKepler(bodyId: BodyId | "sun", t: number): Vec3 {
  if (bodyId === "sun") return { x: 0, y: 0, z: 0 };
  const el = KEPLER[bodyId];
  const p = perifocalPosition(el, t);
  const inertial = perifocalToInertial({ x: p.x, y: p.y }, el);
  const parent = resolveKepler(el.parent, t);
  return { x: parent.x + inertial.x, y: parent.y + inertial.y, z: parent.z + inertial.z };
}

const NOMINAL_DISTANCE_CACHE = new Map<string, number>();

/**
 * Mean inertial separation between two bodies, sampled over the longer of
 * their orbital periods. Used to calibrate cruise speed against the existing
 * pair-by-pair base travel times: a route's nominal speed is
 *   v = nominalPairDistance / baseTravelSec
 * so when the bodies sit at typical separation the leg takes ~baseTravelSec,
 * but at conjunction or opposition the realistic intercept time scales with
 * the actual distance the ship has to cover.
 */
export function nominalPairDistance(from: BodyId, to: BodyId): number {
  const key = from < to ? `${from}|${to}` : `${to}|${from}`;
  const cached = NOMINAL_DISTANCE_CACHE.get(key);
  if (cached !== undefined) return cached;
  const period = Math.max(KEPLER[from].periodSec, KEPLER[to].periodSec);
  const samples = 96;
  let sum = 0;
  for (let k = 0; k < samples; k++) {
    const t = (k / samples) * period;
    const a = resolveKepler(from, t);
    const b = resolveKepler(to, t);
    sum += Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  }
  const avg = sum / samples;
  NOMINAL_DISTANCE_CACHE.set(key, avg);
  return avg;
}

export interface InterceptSolution {
  /** Travel time from dispatch to arrival, in game seconds. */
  travelSec: number;
  /** Origin body's inertial position at dispatch (the launch point). */
  fromPos: Vec3;
  /** Destination body's predicted inertial position at arrival (the lead point). */
  toPosAtArrival: Vec3;
  /** Cruise speed used for the solve, in canvas-units per second. */
  speed: number;
}

/**
 * Solve for an intercept: how long it takes a ship cruising at a constant
 * speed to reach a body that is itself moving on its own orbit. We pick the
 * speed from the calibrated base travel time for this pair, then iterate
 * Newton-style on the arrival time so the ship aims at *where the body will
 * be*, not at where it currently sits.
 *
 * Converges in a handful of iterations for our orbit set; falls back to the
 * base time if the solve diverges (defensive — shouldn't happen in practice).
 */
export function solveIntercept(
  fromBodyId: BodyId,
  toBodyId: BodyId,
  dispatchGameTimeSec: number,
  baseTravelSec: number,
): InterceptSolution {
  const fromPos = resolveKepler(fromBodyId, dispatchGameTimeSec);
  const nominal = nominalPairDistance(fromBodyId, toBodyId);
  const speed = nominal / Math.max(1e-6, baseTravelSec);
  let travelSec = baseTravelSec;
  for (let k = 0; k < 16; k++) {
    const toPos = resolveKepler(toBodyId, dispatchGameTimeSec + travelSec);
    const dist = Math.hypot(toPos.x - fromPos.x, toPos.y - fromPos.y, toPos.z - fromPos.z);
    const next = dist / speed;
    if (Math.abs(next - travelSec) < 0.05) {
      travelSec = next;
      break;
    }
    travelSec = next;
  }
  if (!isFinite(travelSec) || travelSec <= 0) travelSec = baseTravelSec;
  const toPosAtArrival = resolveKepler(toBodyId, dispatchGameTimeSec + travelSec);
  return { travelSec, fromPos, toPosAtArrival, speed };
}

/**
 * Sample N points on the ellipse for drawing the orbit path. Points are
 * inertial-frame, parent-relative (i.e., add parent position to display
 * absolute coords for nested orbits).
 */
export function keplerEllipsePoints(el: KeplerElements, samples = 128): Vec3[] {
  const out: Vec3[] = [];
  for (let k = 0; k < samples; k++) {
    const E = (k / samples) * 2 * Math.PI;
    const x = el.a * (Math.cos(E) - el.e);
    const y = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
    out.push(perifocalToInertial({ x, y }, el));
  }
  return out;
}

/** Periapsis (closest) and apoapsis (farthest) distance from focus. */
export function apsides(el: KeplerElements): { periapsis: number; apoapsis: number } {
  return { periapsis: el.a * (1 - el.e), apoapsis: el.a * (1 + el.e) };
}

/** True anomaly right now — useful for predicting upcoming periapsis pass. */
export function currentTrueAnomaly(el: KeplerElements, t: number): number {
  const M = el.M0 + (2 * Math.PI * t) / el.periodSec;
  const E = solveKepler(M, el.e);
  return trueAnomaly(E, el.e);
}

/** Time until the next periapsis pass for this body, in game seconds. */
export function timeToNextPeriapsis(el: KeplerElements, t: number): number {
  const M = ((el.M0 + (2 * Math.PI * t) / el.periodSec) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  // Periapsis at M=0; time to wrap M back to 0 is (2π - M) * period / 2π.
  return ((2 * Math.PI - M) * el.periodSec) / (2 * Math.PI);
}

/**
 * Endpoints of the ship's flight path: origin position frozen at dispatch
 * (the launch point in space — the planet has since moved on its orbit) and
 * destination position predicted for the arrival instant (the lead point).
 * The interpolation between these is the realistic transfer arc.
 */
export function shipTrajectoryEndpoints(ship: Ship): { from: Vec3; to: Vec3 } {
  if (!ship.route) {
    const zero = { x: 0, y: 0, z: 0 };
    return { from: zero, to: zero };
  }
  const r = ship.route;
  const dispatch = r.dispatchGameTimeSec;
  const arrival = dispatch + r.travelSecTotal;
  return {
    from: resolveKepler(r.fromBodyId, dispatch),
    to: resolveKepler(r.toBodyId, arrival),
  };
}

/**
 * Where to draw a ship right now. Idle ships sit at their dock body's
 * inertial position. In-transit ships fly the lead-the-target trajectory:
 * a straight line from origin's position at dispatch to the destination's
 * predicted position at arrival, rather than chasing wherever the
 * destination happens to be at the moment.
 */
export function shipKeplerPosition(_state: GameState, ship: Ship): Vec3 {
  if (!ship.route) return keplerPosition(_state, ship.locationBodyId);
  const r = ship.route;
  const { from, to } = shipTrajectoryEndpoints(ship);
  const total = Math.max(1, r.travelSecTotal);
  // travelSecRemaining is the canonical progress field — it ticks down
  // alongside state.gameTimeSec, so reading it works even in tests that
  // poke the route directly without advancing the clock.
  const elapsed = total - r.travelSecRemaining;
  const t = Math.max(0, Math.min(1, elapsed / total));
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    z: from.z + (to.z - from.z) * t,
  };
}

/**
 * Predicted forward trajectory of a body — N points sampled from now to
 * `lookaheadSec` ahead. Used for renderers that draw "where you'll be
 * later" trail arcs.
 */
export function predictBodyTrack(state: GameState, bodyId: BodyId, lookaheadSec: number, samples = 64): Vec3[] {
  const out: Vec3[] = [];
  for (let k = 0; k <= samples; k++) {
    const t = state.gameTimeSec + (k / samples) * lookaheadSec;
    out.push(resolveKepler(bodyId, t));
  }
  return out;
}

/**
 * Total bound radius useful for camera framing. Walks the parent chain
 * for every body and takes the max apoapsis sum.
 */
export function keplerViewBound(): number {
  let max = 0;
  for (const id of Object.keys(KEPLER) as BodyId[]) {
    let r = apsides(KEPLER[id]).apoapsis;
    let p: BodyId | "sun" = KEPLER[id].parent;
    while (p !== "sun") {
      r += apsides(KEPLER[p]).apoapsis;
      p = KEPLER[p].parent;
    }
    if (r > max) max = r;
  }
  return max;
}
