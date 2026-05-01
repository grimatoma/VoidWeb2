import { createInitialState } from "../game/state";
import type { GameState } from "../game/state";
import { placeBuilding } from "../game/sim";
import type { BuildingId } from "../game/defs";

export function fresh(): GameState {
  const s = createInitialState();
  // Fuel is required on dispatch (with Earth as a market-buy fallback). Seed
  // every non-Earth body with a small reserve so existing route/AFK scenarios
  // can dispatch without sprinkling explicit fuel seeds across every test.
  // Kept under each body's fluid cap so production tests checking exact
  // post-cycle stock still pass. Tests that need precise fuel amounts (or
  // empty fuel) override this explicitly.
  for (const id of Object.keys(s.bodies) as (keyof typeof s.bodies)[]) {
    if (s.bodies[id].type === "earth") continue; // earth handles via auto-buy
    s.bodies[id].warehouse.hydrogen_fuel = 20;
  }
  return s;
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
