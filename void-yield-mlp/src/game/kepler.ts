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
 * The lunar habitat carries a noticeable inclination so 3D renderers have
 * something to show. NEA-04 is parked at Earth-Moon L4 — same orbit as the
 * Moon but 60° ahead in mean anomaly — so it co-orbits the Moon and stays
 * at a fixed close distance from Earth.
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
    // Earth-Moon L4 station: matches the Moon's orbit elements, leads it by 60°.
    a: 22,
    e: 0.0549,
    i: 0.0898,
    Omega: 0,
    omega: 0.5,
    M0: 0.4 + Math.PI / 3,
    periodSec: 60,
    parent: "earth",
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
  /** Peak speed reached on this leg (== maxSpeed on long hauls, less on short hops). */
  peakSpeed: number;
  /** Chase distance the kinematic profile covers, in canvas-units. */
  distance: number;
}

/**
 * Travel time for a ship covering distance `d` under a symmetric
 * accel→coast→decel profile.
 *
 *   • Triangular (never reaches cruise): t = 2·√(d / a)    when 2·d_acc ≥ d
 *   • Trapezoidal (cruise + coast):      t = 2·t_acc + (d − 2·d_acc) / v
 *
 * where d_acc = v² / (2a) and t_acc = v / a.
 */
export function travelTimeForDistance(d: number, accel: number, maxSpeed: number): number {
  if (d <= 0 || accel <= 0 || maxSpeed <= 0) return 0;
  const dAcc = (maxSpeed * maxSpeed) / (2 * accel);
  if (d <= 2 * dAcc) return 2 * Math.sqrt(d / accel);
  const tAcc = maxSpeed / accel;
  const dCruise = d - 2 * dAcc;
  return 2 * tAcc + dCruise / maxSpeed;
}

/**
 * Solve for an intercept: how long it takes a ship under an accel→coast→decel
 * profile to reach a body that is itself moving on its own orbit. We compute
 * travel time directly from chase distance via `travelTimeForDistance`, then
 * iterate Newton-style on the arrival time so the ship aims at *where the body
 * will be* at arrival, not where it currently sits.
 *
 * Converges in a handful of iterations for our orbit set.
 */
export function solveIntercept(
  fromBodyId: BodyId,
  toBodyId: BodyId,
  dispatchGameTimeSec: number,
  accel: number,
  maxSpeed: number,
): InterceptSolution {
  const fromPos = resolveKepler(fromBodyId, dispatchGameTimeSec);
  // Initial guess: distance to where the body sits right now.
  const initialToPos = resolveKepler(toBodyId, dispatchGameTimeSec);
  const initialDist = Math.hypot(
    initialToPos.x - fromPos.x,
    initialToPos.y - fromPos.y,
    initialToPos.z - fromPos.z,
  );
  let travelSec = travelTimeForDistance(initialDist, accel, maxSpeed);
  let distance = initialDist;
  for (let k = 0; k < 16; k++) {
    const toPos = resolveKepler(toBodyId, dispatchGameTimeSec + travelSec);
    distance = Math.hypot(toPos.x - fromPos.x, toPos.y - fromPos.y, toPos.z - fromPos.z);
    const next = travelTimeForDistance(distance, accel, maxSpeed);
    if (Math.abs(next - travelSec) < 0.05) {
      travelSec = next;
      break;
    }
    travelSec = next;
  }
  if (!isFinite(travelSec) || travelSec <= 0) {
    travelSec = travelTimeForDistance(initialDist, accel, maxSpeed);
  }
  const toPosAtArrival = resolveKepler(toBodyId, dispatchGameTimeSec + travelSec);
  // Recompute the chase distance against the final arrival point so the
  // returned distance matches the reported travelSec exactly (the iteration
  // exits inside its tolerance, so the two could otherwise drift slightly).
  distance = Math.hypot(
    toPosAtArrival.x - fromPos.x,
    toPosAtArrival.y - fromPos.y,
    toPosAtArrival.z - fromPos.z,
  );
  // Peak speed: maxSpeed if cruise was reached, else accel·(t/2) on the
  // triangular profile.
  const dAcc = (maxSpeed * maxSpeed) / (2 * accel);
  const peakSpeed = distance >= 2 * dAcc ? maxSpeed : accel * (travelSec / 2);
  return { travelSec, fromPos, toPosAtArrival, peakSpeed, distance };
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
 * The actual flight curves around the central body — see `shipTrajectoryAt`
 * for the path geometry.
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
 * Deepest shared ancestor in the body hierarchy. Routes that span the
 * solar system arc around the Sun; cislunar routes arc around Earth;
 * routes between a body and one of its own moons arc around the body.
 */
function commonAncestor(a: BodyId, b: BodyId): BodyId | "sun" {
  const lineageA = new Set<BodyId | "sun">(["sun", a]);
  let cur: BodyId | "sun" = a;
  while (cur !== "sun") {
    cur = KEPLER[cur].parent;
    lineageA.add(cur);
  }
  cur = b;
  while (cur !== "sun") {
    if (lineageA.has(cur)) return cur;
    cur = KEPLER[cur].parent;
  }
  return "sun";
}

/**
 * Position along the ship's flight path at progress fraction t ∈ [0, 1].
 *
 * The path is an angular sweep around the route's central body — bending
 * the trajectory around the gravitational pivot rather than slicing
 * straight through it. Radius interpolates linearly between dispatch-frame
 * |fromPos| and arrival-frame |toPos| measured from the pivot, while the
 * heading sweeps the shorter angular arc between them. Ecliptic z is
 * interpolated linearly so inclined routes still look right.
 *
 * For routes where one endpoint is itself the pivot (e.g. Earth → Moon —
 * Moon orbits Earth, so the ancestor *is* Earth), the radial interpolation
 * naturally degenerates and the path runs straight, which is the right
 * read for a short cislunar hop.
 */
export function shipTrajectoryAt(ship: Ship, t01: number): Vec3 {
  if (!ship.route) {
    const zero = { x: 0, y: 0, z: 0 };
    return zero;
  }
  const r = ship.route;
  const dispatch = r.dispatchGameTimeSec;
  const arrival = dispatch + r.travelSecTotal;
  const fromPos = resolveKepler(r.fromBodyId, dispatch);
  const toPos = resolveKepler(r.toBodyId, arrival);
  const ancestor = commonAncestor(r.fromBodyId, r.toBodyId);
  // Pivot tracks its own orbit during the leg; sample at the midpoint so the
  // arc is reasonably centered for a moving central body (e.g. Earth as the
  // pivot for a Moon ↔ NEA cislunar-ish hop).
  const pivotTime = dispatch + r.travelSecTotal * 0.5;
  const pivot = ancestor === "sun"
    ? { x: 0, y: 0, z: 0 }
    : resolveKepler(ancestor, pivotTime);
  const rx0 = fromPos.x - pivot.x;
  const ry0 = fromPos.y - pivot.y;
  const rz0 = fromPos.z - pivot.z;
  const rx1 = toPos.x - pivot.x;
  const ry1 = toPos.y - pivot.y;
  const rz1 = toPos.z - pivot.z;
  const len0 = Math.hypot(rx0, ry0);
  const len1 = Math.hypot(rx1, ry1);
  // If either endpoint sits *at* the pivot the angular sweep is undefined —
  // fall back to a straight lerp (this is the cislunar case Earth→Moon
  // where the pivot is Earth itself).
  if (len0 < 1e-6 || len1 < 1e-6) {
    return {
      x: fromPos.x + (toPos.x - fromPos.x) * t01,
      y: fromPos.y + (toPos.y - fromPos.y) * t01,
      z: fromPos.z + (toPos.z - fromPos.z) * t01,
    };
  }
  const theta0 = Math.atan2(ry0, rx0);
  const theta1 = Math.atan2(ry1, rx1);
  let dtheta = theta1 - theta0;
  // Take the shorter angular path so the arc never wraps the long way around.
  if (dtheta > Math.PI) dtheta -= 2 * Math.PI;
  if (dtheta < -Math.PI) dtheta += 2 * Math.PI;
  const r_t = len0 + (len1 - len0) * t01;
  const theta_t = theta0 + dtheta * t01;
  const z_t = rz0 + (rz1 - rz0) * t01;
  return {
    x: pivot.x + r_t * Math.cos(theta_t),
    y: pivot.y + r_t * Math.sin(theta_t),
    z: pivot.z + z_t,
  };
}

/**
 * Sample the unflown remainder of the ship's flight path — from its
 * current spot to the lead point — for renderers that want to draw a
 * forward-only dotted arc.
 */
export function shipTrajectoryFuturePoints(ship: Ship, samples = 24): Vec3[] {
  if (!ship.route) return [];
  const r = ship.route;
  const total = Math.max(1, r.travelSecTotal);
  const elapsed = total - r.travelSecRemaining;
  const t0 = Math.max(0, Math.min(1, elapsed / total));
  const out: Vec3[] = [];
  const n = Math.max(2, samples);
  for (let i = 0; i <= n; i++) {
    const t = t0 + (1 - t0) * (i / n);
    out.push(shipTrajectoryAt(ship, t));
  }
  return out;
}

/**
 * Where to draw a ship right now. Idle ships sit at their dock body's
 * inertial position. In-transit ships follow the curved lead-the-target
 * arc that bends around the route's central body — see `shipTrajectoryAt`.
 */
export function shipKeplerPosition(_state: GameState, ship: Ship): Vec3 {
  if (!ship.route) return keplerPosition(_state, ship.locationBodyId);
  const r = ship.route;
  const total = Math.max(1, r.travelSecTotal);
  // travelSecRemaining is the canonical progress field — it ticks down
  // alongside state.gameTimeSec, so reading it works even in tests that
  // poke the route directly without advancing the clock.
  const elapsed = total - r.travelSecRemaining;
  const t = Math.max(0, Math.min(1, elapsed / total));
  return shipTrajectoryAt(ship, t);
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

/**
 * Camera frames for the spatial map renderers. "system" centers on the Sun
 * and shows the full heliocentric layout; "earth" centers on Earth and
 * crops to the cislunar neighborhood; "moon" centers on the Moon and
 * crops to its immediate satellites.
 */
export type KeplerFrame = "system" | "earth" | "moon";

/** Inertial position to put at screen center for the requested frame. */
export function frameCenter(state: GameState, frame: KeplerFrame): Vec3 {
  if (frame === "earth") return keplerPosition(state, "earth");
  if (frame === "moon") return keplerPosition(state, "moon");
  return { x: 0, y: 0, z: 0 };
}

/**
 * View bound for the requested frame — the half-extent we need to see
 * around the frame's center body. Computed as the max apoapsis of any
 * body whose ancestor chain passes through the frame anchor (plus the
 * anchor's own children's children, summed). Anchor "system" is the Sun.
 */
export function frameBound(frame: KeplerFrame): number {
  if (frame === "system") return keplerViewBound();
  const anchor: BodyId = frame;
  let max = 0;
  for (const id of Object.keys(KEPLER) as BodyId[]) {
    if (id === anchor) continue;
    let cur: BodyId = id;
    let acc = 0;
    let inSubtree = false;
    // Walk up to the anchor, summing parent-relative apoapses along the way.
    // Stop when we hit the anchor (in-subtree) or the Sun (not in-subtree).
    while (true) {
      const el: KeplerElements = KEPLER[cur];
      acc += apsides(el).apoapsis;
      const parent: BodyId | "sun" = el.parent;
      if (parent === anchor) {
        inSubtree = true;
        break;
      }
      if (parent === "sun") break;
      cur = parent;
    }
    if (inSubtree && acc > max) max = acc;
  }
  // Floor so the anchor itself has at least *some* breathing room on screen
  // when nothing orbits it (defensive — the MLP set always has children).
  return Math.max(max, 4);
}
