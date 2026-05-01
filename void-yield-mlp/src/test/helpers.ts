import { createInitialState } from "../game/state";
import type { GameState } from "../game/state";
import { placeBuilding } from "../game/sim";
import type { BuildingId } from "../game/defs";

export function fresh(): GameState {
  const s = createInitialState();
  // Fuel is required on dispatch (with Earth as a market-buy fallback). Seed
  // every body — including Earth — with a reserve so existing route/AFK and
  // mining-mission scenarios can dispatch without each test stockpiling fuel
  // first. Non-Earth seed is kept under each fluid cap so production tests
  // checking exact post-cycle stock still pass; Earth has infinite cap so
  // we seed it large to cover full mining-mission cycles. Tests that need
  // precise fuel amounts (or empty fuel) override this explicitly.
  s.bodies.earth.warehouse.hydrogen_fuel = 200;
  for (const id of Object.keys(s.bodies) as (keyof typeof s.bodies)[]) {
    const body = s.bodies[id];
    if (body.type === "earth") continue;
    // Comets have no fluid-storage cap and serve as deep-space staging in tests
    // (mining-mission loops dispatch loaded legs from the comet repeatedly), so
    // seed them with enough fuel for several round trips.
    body.warehouse.hydrogen_fuel = body.type === "comet" ? 200 : 20;
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
