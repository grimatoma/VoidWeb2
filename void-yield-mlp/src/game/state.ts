// Game state shape. Plain serializable data — no class instances, no Maps.
// `tick()` reads and mutates a draft; the AFK catch-up runs the same code path.

import type { BuildingId, ResourceId, ShipId } from "./defs";
import type { SurveyState } from "./survey";
import { createInitialSurvey } from "./survey";

export type BodyId = "earth" | "moon" | "nea_04" | "lunar_habitat" | "halley_4";
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
  type: "earth" | "moon" | "nea" | "habitat" | "comet";
  gridW: number;
  gridH: number;
  buildings: PlacedBuilding[];
  warehouse: Partial<Record<ResourceId, number>>;
  /**
   * Whether the body is visible to the player. Defaults to true (omitted).
   * Comets start with `discovered: false` and flip true when a scout returns.
   * Routing and rendering both filter on this.
   */
  discovered?: boolean;
}

export interface RouteOrder {
  resource: ResourceId;
  quantity: number;
}

/**
 * Multi-stop itinerary primitives. A ship with `itinerary` set walks through
 * `stops` in order, executing each stop's actions on arrival. Loops if `loop`.
 *
 * Actions are kept narrow so the route editor can render them as a small list
 * of typed pills, and the sim can fold every action into a couple of helpers.
 */
export type StopAction =
  | {
      kind: "load";
      resource: ResourceId;
      // Cargo qty to load. Always clamped to ship capacity and available stock.
      qty?: number;
      // Pause the loop here until the body has at least this much of `resource`.
      // Lets routes batch up a full load instead of running half-empty.
      minOriginStock?: number;
    }
  // Unload all current cargo (or the named resource) into the body's warehouse.
  // Earth deliveries auto-sell at earthSell when `kind === "sell"`.
  | { kind: "unload" }
  | { kind: "sell" };

export interface RouteStop {
  bodyId: BodyId;
  actions: StopAction[];
}

export interface ShipItinerary {
  stops: RouteStop[];
  // Index of the stop the ship is currently at (status=idle) or heading toward
  // (status=transit). Advanced after actions execute on arrival.
  currentIdx: number;
  loop: boolean;
  // Set when a `load` action's minOriginStock isn't met yet; cleared and the
  // leg dispatched once production refills the stockpile across that line.
  paused?: boolean;
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
  // Cleared by stopMiningOp(); preserved across paused waits so production can
  // refill origin and the loop resumes on its own.
  miningOp?: {
    fromBodyId: BodyId;
    toBodyId: BodyId;
    cargoResource: ResourceId;
    cargoQty: number;
    sellOnArrival: boolean;
    // Optional stock-maintain trigger. When set, the loop's next outbound only
    // dispatches once origin's `cargoResource` stockpile is ≥ this threshold.
    // Lets the player say "only haul when there's a full load worth of ore",
    // so production batches up instead of starving the route.
    minOriginStock?: number;
  } | null;
  // High-level "mining mission" intent for Miner-1. Set by dispatchMiningMission;
  // outlives the empty-leg-to-target so handleArrival knows to fire the loaded
  // outbound (which sets miningOp and lets the existing loop machinery take
  // over). Cleared by stopMiningOp() or when the mission halts. Pure UI/ops
  // metadata once the loop is running — the sim drives the cycle through
  // miningOp; miningMission lets the UI render "on mission to Halley-IV".
  miningMission?: {
    cometBodyId: BodyId;
    resource: ResourceId;
    cargoQty: number;
  } | null;
  // Scout-mission roundtrip state. Set by dispatchScoutMission(); cleared
  // when the scout returns to Earth and the survey is refreshed. Drives
  // tickShip's "auto-dispatch return leg" + "fire field-sweep" hooks.
  scoutOp?: {
    targetBodyId: BodyId;
    leg: "outbound" | "return";
  } | null;
  // Multi-stop itinerary. Mutually exclusive with miningOp/scoutOp — the route
  // editor clears the others when assigning an itinerary. Drives the same
  // arrival-handler dispatch path; richer than miningOp because each stop
  // carries its own actions (load specific cargo, unload, sell).
  itinerary?: ShipItinerary | null;
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
export const STARTING_GRID_COMET = { w: 0, h: 0 }; // comets aren't buildable surfaces

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
      halley_4: {
        id: "halley_4",
        name: "Comet Halley-IV",
        type: "comet",
        gridW: STARTING_GRID_COMET.w,
        gridH: STARTING_GRID_COMET.h,
        buildings: [],
        // Pre-stocked: comets are extracted in-place by Miner-1, not built upon.
        // Water-ice rich (it's a comet) plus a generous iron-ore lode.
        warehouse: { water_ice: 5000, iron_ore: 3000 },
        discovered: false,
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
      halley_4: undefined,
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
