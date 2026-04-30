// Game state shape. Plain serializable data — no class instances, no Maps.
// `tick()` reads and mutates a draft; the AFK catch-up runs the same code path.

import type { BuildingId, ResourceId, ShipId } from "./defs";
import type { SurveyState } from "./survey";
import { createInitialSurvey } from "./survey";

export type BodyId = "earth" | "moon" | "nea_04" | "lunar_habitat";
export type ShipStatus = "idle" | "loading" | "transit" | "unloading";

export interface PlacedBuilding {
  id: string; // unique runtime id
  defId: BuildingId;
  x: number;
  y: number;
  paused: boolean;
  cycleProgress: number; // accumulated seconds toward next cycle completion
}

export interface BodyState {
  id: BodyId;
  name: string;
  type: "earth" | "moon" | "nea" | "habitat";
  gridW: number;
  gridH: number;
  buildings: PlacedBuilding[];
  warehouse: Partial<Record<ResourceId, number>>;
}

export interface RouteOrder {
  resource: ResourceId;
  quantity: number;
}

export interface Ship {
  id: string;
  defId: ShipId;
  name: string;
  status: ShipStatus;
  locationBodyId: BodyId; // when idle/loading/unloading: where docked
  // Active route assignment (single-leg in MLP):
  route: null | {
    fromBodyId: BodyId;
    toBodyId: BodyId;
    cargoResource: ResourceId | null;
    cargoQty: number;
    travelSecRemaining: number;
    travelSecTotal: number; // for solar-map progress interpolation
    // Game-time at which this leg was dispatched. The lead-the-target
    // trajectory is computed from (origin pos at dispatch) → (dest pos at
    // dispatch + travelSecTotal), so the ship aims where the body *will* be.
    dispatchGameTimeSec: number;
    sellOnArrival: boolean; // if dest is earth, sell at earth_sell price
    repeat: boolean;
  };
  // Persistent loop config. Set when the player dispatches a route with
  // repeat=true + cargo. Survives across legs (outbound → empty return) so the
  // sim can re-issue the outbound leg automatically when the ship gets home.
  // Cleared by stopMiningOp() or when restart fails (e.g. no stock at origin).
  miningOp?: {
    fromBodyId: BodyId;
    toBodyId: BodyId;
    cargoResource: ResourceId;
    cargoQty: number;
    sellOnArrival: boolean;
  } | null;
  // Scout-mission roundtrip state. Set by dispatchScoutMission(); cleared
  // when the scout returns to Earth and the survey is refreshed. Drives
  // tickShip's "auto-dispatch return leg" + "fire field-sweep" hooks.
  scoutOp?: {
    targetBodyId: BodyId;
    leg: "outbound" | "return";
  } | null;
}

export interface PopulationState {
  bodyId: BodyId;
  pop: number;
  cap: number;
  tier: "survival" | "settled";
  settleProgressSec: number; // accumulated time toward next tier settle-in
  suspended: boolean;
  growthPaused: boolean;
}

export interface AlertItem {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body?: string;
  bodyId?: BodyId;
  ts: number; // game-time seconds
  resolved?: boolean;
}

export interface LogEntry {
  ts: number;
  text: string;
}

export interface AfkSummary {
  awaySec: number;
  netCredits: number;
  resourceDelta: Partial<Record<ResourceId, number>>;
  cyclesByBuilding: Partial<Record<BuildingId, number>>;
  deliveries: number;
  stalls: { bodyId: BodyId; reason: string; durationSec: number }[];
  popDelta: Record<string, number>;
  cappedAt24h: boolean;
}

export interface GameState {
  saveVersion: 1;
  realTimeStartedAt: number; // ms epoch when the run was created
  lastActiveWallMs: number; // ms epoch of last save/tick
  gameTimeSec: number; // accumulated game-time seconds
  tier: 0 | 1;
  credits: number;
  refinedMetalSoldLifetime: number; // toward T0→T1 gate
  bodies: Record<BodyId, BodyState>;
  ships: Ship[];
  populations: Record<BodyId, PopulationState | undefined>;
  alerts: AlertItem[];
  log: LogEntry[];
  prefabKitsAvailable: Record<"lunar_habitat" | "lunar_surface_mine_kit" | "construction_cache", number>;
  tutorial: { step: number; done: boolean };
  // Latest AFK summary (one-shot, cleared after dismissal)
  pendingAfkSummary: AfkSummary | null;
  // Pending tier-up notification
  tierUpReady: boolean;
  tierUpClaimed: { 1: boolean };
  // Whether the celebratory modal has been seen for that claim. Decoupled from
  // tierUpClaimed so a reload after the modal has been dismissed doesn't reshow.
  tierUpModalSeen: { 1: boolean };
  companyName: string;
  /** Asteroid-field survey state — see ./survey.ts. */
  survey: SurveyState;
  /** Visual asset pack id — controls planet/building/ship glyph style. */
  graphicsPack: "noir" | "atlas";
}

export const STARTING_GRID_NEA = { w: 5, h: 5 };
export const STARTING_GRID_EARTH = { w: 4, h: 4 };
export const STARTING_GRID_MOON = { w: 5, h: 5 };
export const STARTING_GRID_HABITAT = { w: 5, h: 5 };

export function createInitialState(): GameState {
  const now = Date.now();
  return {
    saveVersion: 1,
    realTimeStartedAt: now,
    lastActiveWallMs: now,
    gameTimeSec: 0,
    tier: 0,
    credits: 5000,
    refinedMetalSoldLifetime: 0,
    bodies: {
      earth: {
        id: "earth",
        name: "Earth Orbit",
        type: "earth",
        gridW: STARTING_GRID_EARTH.w,
        gridH: STARTING_GRID_EARTH.h,
        buildings: [],
        warehouse: {},
      },
      moon: {
        id: "moon",
        name: "Moon",
        type: "moon",
        gridW: STARTING_GRID_MOON.w,
        gridH: STARTING_GRID_MOON.h,
        buildings: [],
        warehouse: {},
      },
      nea_04: {
        id: "nea_04",
        name: "NEA-04",
        type: "nea",
        gridW: STARTING_GRID_NEA.w,
        gridH: STARTING_GRID_NEA.h,
        buildings: [],
        warehouse: {},
      },
      lunar_habitat: {
        id: "lunar_habitat",
        name: "First Habitat",
        type: "habitat",
        gridW: STARTING_GRID_HABITAT.w,
        gridH: STARTING_GRID_HABITAT.h,
        buildings: [],
        warehouse: {},
      },
    },
    ships: [
      {
        id: "ship_1",
        defId: "hauler_1",
        name: "Hauler-1",
        status: "idle",
        locationBodyId: "earth",
        route: null,
      },
    ],
    populations: {
      earth: undefined,
      moon: undefined,
      nea_04: undefined,
      lunar_habitat: undefined,
    },
    alerts: [],
    log: [],
    prefabKitsAvailable: {
      lunar_habitat: 0,
      lunar_surface_mine_kit: 0,
      construction_cache: 0,
    },
    tutorial: { step: 0, done: false },
    pendingAfkSummary: null,
    tierUpReady: false,
    tierUpClaimed: { 1: false },
    tierUpModalSeen: { 1: false },
    companyName: "VOID YIELD CO.",
    survey: createInitialSurvey(),
    graphicsPack: "noir",
  };
}
