// Central body registry — color, size rank, and visibility rules in one
// place. Map renderers and views read from here instead of redeclaring
// `Record<BodyId, …>` literals every time. Adding a new body is one entry
// (plus the underlying state/kepler/orbit data) instead of seven.

import type { BodyId, GameState } from "./state";

/**
 * Visual hints for body glyphs. `sizeRank` is a coarse 1/2/3 weight (small /
 * medium / large) that each renderer multiplies by its own base-pixel size,
 * so the same body can be drawn small in a dense scanner and large in a
 * dashboard portrait without forcing every map to share a radius scale.
 */
export const BODIES_VISUAL: Record<BodyId, { color: string; sizeRank: 1 | 2 | 3 }> = {
  earth: { color: "#5fb3ff", sizeRank: 3 },
  moon: { color: "#c9d2dc", sizeRank: 2 },
  nea_04: { color: "#a8896a", sizeRank: 2 },
  lunar_habitat: { color: "#6cd07a", sizeRank: 1 },
  halley_4: { color: "#cfeefc", sizeRank: 2 },
};

/**
 * Hidden bodies are filtered everywhere: the routing UI, the maps, the
 * dashboards. Two rules:
 *   • `discovered === false` — comets start hidden until a scout reports.
 *   • `lunar_habitat` — the body slot exists from t=0 but the colony only
 *     materializes once the player buys the Lunar Habitat prefab kit.
 */
export function isBodyVisible(state: GameState, id: BodyId): boolean {
  const body = state.bodies[id];
  if (body.discovered === false) return false;
  if (id === "lunar_habitat" && !state.populations.lunar_habitat) return false;
  return true;
}

/** All visible bodies in the current state, in the order their entries appear in `state.bodies`. */
export function visibleBodies(state: GameState): BodyId[] {
  return (Object.keys(state.bodies) as BodyId[]).filter((id) => isBodyVisible(state, id));
}
