// Solar map positioning model.
//
// Coordinate system: AU-ish but stylized — Sun at origin, +x right, +y down
// (canvas-friendly). Distances and orbital periods are picked for legibility,
// not Kepler accuracy: the goal is "feels alive, ships move along arcs you
// can read at a glance," not an astronomical simulator.
//
// Hierarchy (parent body → child body):
//   sun → earth → moon → lunar_habitat
//                ↘ nea_04 (Earth-Moon L4 station — co-orbits with the Moon,
//                          60° ahead, fixed-distance from Earth)
//
// The model is pure functions of `state.gameTimeSec` and the ship route's
// progress fraction; no extra state is persisted.

import type { Ship } from "./state";
import type { BodyId, GameState } from "./state";

export interface Vec2 {
  x: number;
  y: number;
}

export interface OrbitDef {
  /** Parent body. The sun is the implicit root and has no entry. */
  parent: BodyId | "sun";
  /** Distance from the parent's position, in solar-canvas units. */
  radius: number;
  /** Game-time seconds for one full orbit. */
  periodSec: number;
  /** Phase offset in radians at gameTimeSec=0 — keeps default layout pretty. */
  phase: number;
}

export const SUN: Vec2 = { x: 0, y: 0 };

/**
 * Orbital constants. Periods are aggressively short relative to real life so a
 * 30-min playtest shows visible motion. NEA-04 is parked at Earth-Moon L4 —
 * it shares the Moon's orbit around Earth but sits 60° ahead, so it stays at
 * a fixed close distance from Earth (= the Moon's orbital radius).
 */
export const ORBITS: Record<BodyId, OrbitDef> = {
  earth: { parent: "sun", radius: 110, periodSec: 360, phase: 0 },
  // Moon orbits Earth in roughly 1/12 the time Earth orbits the sun (stylized).
  moon: { parent: "earth", radius: 22, periodSec: 60, phase: 0.4 },
  // NEA-04 station: Earth-Moon L4 — same a/period as the Moon, 60° ahead.
  nea_04: { parent: "earth", radius: 22, periodSec: 60, phase: 0.4 + Math.PI / 3 },
  // Lunar Habitat orbits the Moon at very close range.
  lunar_habitat: { parent: "moon", radius: 6, periodSec: 24, phase: 0 },
};

/** Recursive position lookup. Sun is the root; every body composes onto its parent. */
export function bodyPosition(state: GameState, bodyId: BodyId): Vec2 {
  return resolveOrbit(bodyId, state.gameTimeSec);
}

function resolveOrbit(bodyId: BodyId | "sun", t: number): Vec2 {
  if (bodyId === "sun") return { ...SUN };
  const orb = ORBITS[bodyId];
  const parent = resolveOrbit(orb.parent, t);
  const theta = orb.phase + (2 * Math.PI * t) / orb.periodSec;
  return {
    x: parent.x + Math.cos(theta) * orb.radius,
    y: parent.y + Math.sin(theta) * orb.radius,
  };
}

/** Linear progress fraction along a ship's current route, in [0, 1]. */
export function routeProgress(ship: Ship): number {
  const r = ship.route;
  if (!r || r.travelSecTotal <= 0) return 0;
  const elapsed = r.travelSecTotal - r.travelSecRemaining;
  return Math.max(0, Math.min(1, elapsed / r.travelSecTotal));
}

/**
 * Where to draw a ship right now.
 * - Idle/docked ships sit at their location body's position.
 * - In-transit ships interpolate along a straight line from origin to
 *   destination at the current sample of game-time. Origin and destination
 *   are sampled at the *current* game-time, so a ship "follows" its
 *   destination if the destination is itself orbiting (Moon, lunar_habitat).
 *   That's the right read for stylized inner-system trips at this scale.
 */
export function shipPosition(state: GameState, ship: Ship): Vec2 {
  if (!ship.route) return bodyPosition(state, ship.locationBodyId);
  const from = bodyPosition(state, ship.route.fromBodyId);
  const to = bodyPosition(state, ship.route.toBodyId);
  const t = routeProgress(ship);
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

/** Bounding radius useful for the canvas viewport ("how far do I need to draw?"). */
export function viewBoundRadius(): number {
  let max = 0;
  for (const b of Object.keys(ORBITS) as BodyId[]) {
    const o = ORBITS[b];
    let r = o.radius;
    let p: BodyId | "sun" = o.parent;
    while (p !== "sun") {
      r += ORBITS[p].radius;
      p = ORBITS[p].parent;
    }
    if (r > max) max = r;
  }
  return max;
}

/** Visible-name list of static rings that the canvas should draw. */
export function orbitRings(): { center: BodyId | "sun"; radius: number; bodyId: BodyId }[] {
  return (Object.keys(ORBITS) as BodyId[]).map((bid) => ({
    bodyId: bid,
    center: ORBITS[bid].parent,
    radius: ORBITS[bid].radius,
  }));
}
