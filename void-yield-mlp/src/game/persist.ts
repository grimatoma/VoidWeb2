// localStorage save/load. The save is the entire GameState shape.
// AFK catch-up runs against the loaded state on app boot.

import { createInitialState } from "./state";
import type { GameState } from "./state";
import { createInitialSurvey } from "./survey";

const KEY = "void-yield-mlp:save:v1";

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState> & { saveVersion?: number };
    if (parsed.saveVersion !== 1) return null;
    // Backfill fields added after first save shape.
    if (!parsed.tierUpModalSeen) {
      // If tier 1 was already claimed in a save predating the field, treat as seen.
      const claimed = !!parsed.tierUpClaimed?.[1];
      parsed.tierUpModalSeen = { 1: claimed };
    }
    // Backfill route.travelSecTotal added when the solar map went realistic.
    if (parsed.ships) {
      for (const ship of parsed.ships) {
        if (ship.route && ship.route.travelSecTotal === undefined) {
          ship.route.travelSecTotal = Math.max(ship.route.travelSecRemaining, 1);
        }
      }
    }
    // Backfill survey state (added in Survey/Prospecting feature).
    if (!parsed.survey) {
      parsed.survey = createInitialSurvey();
    }
    // Backfill graphics-pack default.
    if (!parsed.graphicsPack) parsed.graphicsPack = "noir";
    return parsed as GameState;
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  try {
    const toSave = { ...state, lastActiveWallMs: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error("save failed", e);
  }
}

export function clearSave(): void {
  localStorage.removeItem(KEY);
}

export function newGame(): GameState {
  return createInitialState();
}
