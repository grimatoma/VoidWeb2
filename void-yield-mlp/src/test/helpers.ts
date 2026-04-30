import { createInitialState } from "../game/state";
import type { GameState } from "../game/state";
import { placeBuilding } from "../game/sim";
import type { BuildingId } from "../game/defs";

export function fresh(): GameState {
  return createInitialState();
}

/**
 * Place a building forcibly: bypasses the cost check by topping up credits first
 * so a test can construct an arbitrary scenario without bookkeeping the spend.
 * Use the real `placeBuilding` for credit-deduction tests instead.
 */
export function forcePlace(
  state: GameState,
  bodyId: keyof GameState["bodies"],
  defId: BuildingId,
  x: number,
  y: number,
): void {
  state.credits += 1_000_000;
  const r = placeBuilding(state, bodyId, defId, x, y);
  if (!r.ok) throw new Error(`forcePlace failed: ${r.reason}`);
}

/** Run the sim for `seconds` worth of time in 1s steps. */
export function runFor(state: GameState, seconds: number, tick: (s: GameState, dt: number) => void): void {
  for (let i = 0; i < seconds; i++) tick(state, 1);
}
