// Static game definitions for the MLP slice (T0 + T1 only).
// Numbers map directly to GAME.md Part I tables; placeholder values noted there.

export type ResourceId =
  | "iron_ore"
  | "water_ice"
  | "refined_metal"
  | "hydrogen_fuel"
  | "oxygen"
  | "lunar_regolith"
  | "aluminum"
  | "construction_materials"
  | "food_pack"
  | "habitat_module";

export type CargoClass = "solid" | "fluid";

export interface ResourceDef {
  id: ResourceId;
  name: string;
  tier: 0 | 1;
  cargo: CargoClass;
  earthBuy: number; // credits to buy 1 from Earth
  earthSell: number; // credits Earth pays for 1
}

export const RESOURCES: Record<ResourceId, ResourceDef> = {
  iron_ore: { id: "iron_ore", name: "Iron Ore", tier: 0, cargo: "solid", earthBuy: 3, earthSell: 1 },
  water_ice: { id: "water_ice", name: "Water Ice", tier: 0, cargo: "solid", earthBuy: 4, earthSell: 2 },
  refined_metal: { id: "refined_metal", name: "Refined Metal", tier: 0, cargo: "solid", earthBuy: 18, earthSell: 12 },
  hydrogen_fuel: { id: "hydrogen_fuel", name: "Hydrogen Fuel", tier: 0, cargo: "fluid", earthBuy: 8, earthSell: 5 },
  oxygen: { id: "oxygen", name: "Oxygen", tier: 0, cargo: "fluid", earthBuy: 6, earthSell: 3 },
  lunar_regolith: { id: "lunar_regolith", name: "Lunar Regolith", tier: 1, cargo: "solid", earthBuy: 0, earthSell: 2 },
  aluminum: { id: "aluminum", name: "Aluminum", tier: 1, cargo: "solid", earthBuy: 22, earthSell: 15 },
  construction_materials: { id: "construction_materials", name: "Construction Materials", tier: 1, cargo: "solid", earthBuy: 60, earthSell: 45 },
  food_pack: { id: "food_pack", name: "Food Pack", tier: 1, cargo: "solid", earthBuy: 25, earthSell: 18 },
  habitat_module: { id: "habitat_module", name: "Habitat Module", tier: 1, cargo: "solid", earthBuy: 180, earthSell: 130 },
};

export type BodyType = "earth" | "moon" | "nea" | "habitat" | "comet";

export type BuildingId =
  | "small_mine"
  | "ice_mine"
  | "smelter"
  | "electrolyzer"
  | "probe_bay"
  | "silo"
  | "tank"
  | "cryo_tank"
  | "lunar_surface_mine"
  | "refinery_aluminum"
  | "construction_yard"
  | "habitat_assembler"
  | "greenhouse";

export interface BuildingDef {
  id: BuildingId;
  name: string;
  tier: 0 | 1;
  cost: number;
  cycleSec: number; // 0 = passive/storage
  inputs: Partial<Record<ResourceId, number>>;
  outputs: Partial<Record<ResourceId, number>>;
  // adjacency: building grants/receives bonus from neighbors of these ids
  adjacencyPair?: BuildingId[];
  adjacencyBonus?: number; // multiplier added per adjacent matching neighbor (cap at 1 in MLP)
  // storage capacity contributions (in MLP only Silo and Tank exist)
  storageSolid?: number;
  storageFluid?: number;
  // body-type whitelist (e.g. lunar_surface_mine only on Moon/Habitat)
  allowedBodyTypes?: BodyType[];
  passive?: boolean;
  isStorage?: boolean;
  description: string;
}

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  small_mine: {
    id: "small_mine",
    name: "Small Mine",
    tier: 0,
    cost: 800,
    cycleSec: 30,
    inputs: {},
    outputs: { iron_ore: 10 },
    allowedBodyTypes: ["nea"],
    description: "Extracts 10 Iron Ore per 30s cycle.",
  },
  ice_mine: {
    id: "ice_mine",
    name: "Ice Mine",
    tier: 0,
    cost: 900,
    cycleSec: 40,
    inputs: {},
    outputs: { water_ice: 8 },
    allowedBodyTypes: ["nea"],
    description: "Extracts 8 Water Ice per 40s cycle.",
  },
  smelter: {
    id: "smelter",
    name: "Smelter",
    tier: 0,
    cost: 1500,
    cycleSec: 45,
    inputs: { iron_ore: 5 },
    outputs: { refined_metal: 2 },
    adjacencyPair: ["small_mine"],
    adjacencyBonus: 0.15,
    allowedBodyTypes: ["nea", "earth"],
    description: "Refines 5 Iron Ore into 2 Refined Metal. +15% with a Mine in collaboration radius.",
  },
  electrolyzer: {
    id: "electrolyzer",
    name: "Electrolyzer",
    tier: 0,
    cost: 1200,
    cycleSec: 60,
    inputs: { water_ice: 4 },
    outputs: { hydrogen_fuel: 3, oxygen: 1 },
    allowedBodyTypes: ["nea", "earth", "moon", "habitat"],
    description: "Splits 4 Water Ice into 3 Hydrogen Fuel + 1 Oxygen.",
  },
  probe_bay: {
    id: "probe_bay",
    name: "Probe Bay",
    tier: 0,
    cost: 600,
    cycleSec: 0,
    inputs: {},
    outputs: {},
    passive: true,
    allowedBodyTypes: ["earth"],
    description: "Survey support (cosmetic in MLP).",
  },
  silo: {
    id: "silo",
    name: "Silo",
    tier: 0,
    cost: 600,
    cycleSec: 0,
    inputs: {},
    outputs: {},
    isStorage: true,
    storageSolid: 300,
    description: "+300 solids capacity. Neutral — no adjacency.",
  },
  tank: {
    id: "tank",
    name: "Tank",
    tier: 0,
    cost: 500,
    cycleSec: 0,
    inputs: {},
    outputs: {},
    isStorage: true,
    storageFluid: 180,
    description: "+180 fluids/gases capacity. Neutral — no adjacency.",
  },
  cryo_tank: {
    id: "cryo_tank",
    name: "Cryo Tank",
    tier: 1,
    cost: 1400,
    cycleSec: 0,
    inputs: {},
    outputs: {},
    isStorage: true,
    storageFluid: 600,
    description: "+600 fluid capacity (cryogenic). Heavier upfront cost than a Tank, 3.3× the buffer.",
  },
  lunar_surface_mine: {
    id: "lunar_surface_mine",
    name: "Lunar Surface Mine",
    tier: 1,
    cost: 2200,
    cycleSec: 50,
    inputs: {},
    outputs: { lunar_regolith: 6 },
    allowedBodyTypes: ["moon", "habitat"],
    description: "Extracts 6 Lunar Regolith per 50s cycle.",
  },
  refinery_aluminum: {
    id: "refinery_aluminum",
    name: "Refinery (Aluminum)",
    tier: 1,
    cost: 2400,
    cycleSec: 70,
    inputs: { lunar_regolith: 3 },
    outputs: { aluminum: 2 },
    allowedBodyTypes: ["moon", "habitat", "nea"],
    description: "Refines 3 Lunar Regolith into 2 Aluminum.",
  },
  construction_yard: {
    id: "construction_yard",
    name: "Construction Yard",
    tier: 1,
    cost: 3000,
    cycleSec: 90,
    inputs: { refined_metal: 2, aluminum: 2 },
    outputs: { construction_materials: 1 },
    allowedBodyTypes: ["moon", "habitat", "nea"],
    description: "Combines 2 Refined Metal + 2 Aluminum into 1 Construction Materials.",
  },
  habitat_assembler: {
    id: "habitat_assembler",
    name: "Habitat Assembler",
    tier: 1,
    cost: 4000,
    cycleSec: 480,
    inputs: { construction_materials: 6 },
    outputs: { habitat_module: 1 },
    allowedBodyTypes: ["habitat", "moon"],
    description: "Builds 1 Habitat Module from 6 Construction Materials. 8 min cycle.",
  },
  greenhouse: {
    id: "greenhouse",
    name: "Greenhouse (small)",
    tier: 1,
    cost: 1800,
    cycleSec: 60,
    inputs: { water_ice: 2 },
    outputs: { food_pack: 2 },
    allowedBodyTypes: ["habitat", "moon"],
    description: "2 Water Ice → 2 Food Pack per cycle.",
  },
};

// Ship catalog. Hauler-1 = specialized solid hauler. Scout-1 = no-cargo
// fast prospector (sent on scout missions to refresh the survey roster).
//
// Travel uses an accel→coast→decel kinematic profile:
//   • `accelUnitsPerSec2` is conceptually an engine stat. For v1 every ship
//     class shares the same accel; engine swaps differentiate it later.
//   • `maxSpeedUnits` is the cruise ceiling. Different ship classes get
//     different ceilings, which is what makes one hull faster than another
//     on long hauls (short cislunar hops never reach cruise either way).
// Both are in solar-canvas distance units (the same units kepler.ts works in).
export type ShipId = "hauler_1" | "scout_1" | "miner_1" | "tanker_1";

export interface ShipDef {
  id: ShipId;
  name: string;
  cargo: CargoClass | "combined" | "none";
  capacitySolid: number;
  capacityFluid: number;
  accelUnitsPerSec2: number;
  maxSpeedUnits: number;
  // Fuel cost per leg = fuelPerRoute + fuelPerDistance * intercept-distance.
  // Base + linear distance term, so cislunar hops stay cheap and deep-space
  // legs cost meaningful fuel that the player has to plan for.
  fuelPerRoute: number;
  fuelPerDistance: number;
  earthBuy: number;
}

export const SHIPS: Record<ShipId, ShipDef> = {
  hauler_1: {
    id: "hauler_1",
    name: "Hauler-1",
    cargo: "solid",
    capacitySolid: 30,
    capacityFluid: 0,
    // Calibrated so Earth↔Moon / Earth↔NEA-04 (~22 units) take ~7s — near
    // instant for the player — while a 200-unit haul stretches past 50s.
    accelUnitsPerSec2: 2,
    maxSpeedUnits: 4,
    fuelPerRoute: 4,
    fuelPerDistance: 0.05,
    earthBuy: 3000,
  },
  scout_1: {
    id: "scout_1",
    name: "Scout-1",
    cargo: "none",
    capacitySolid: 0,
    capacityFluid: 0,
    // Same accel (engine class is shared in v1), but a higher cruise ceiling
    // so long-haul scout missions outpace haulers. Cislunar hops still
    // never reach cruise — calibrated for the future longer scout reaches.
    accelUnitsPerSec2: 2,
    maxSpeedUnits: 8,
    fuelPerRoute: 2,
    fuelPerDistance: 0.03,
    earthBuy: 4500,
  },
  miner_1: {
    id: "miner_1",
    name: "Miner-1",
    cargo: "solid",
    // Larger hold than the Hauler — comet runs are long, so amortize the trip.
    capacitySolid: 60,
    capacityFluid: 0,
    accelUnitsPerSec2: 2,
    // Slightly slower than the Hauler — heavy hold, deep-space rated.
    maxSpeedUnits: 3,
    fuelPerRoute: 6,
    fuelPerDistance: 0.06,
    earthBuy: 5500,
  },
  tanker_1: {
    id: "tanker_1",
    name: "Tanker-1",
    cargo: "fluid",
    capacitySolid: 0,
    capacityFluid: 40,
    accelUnitsPerSec2: 2,
    maxSpeedUnits: 4,
    fuelPerRoute: 5,
    fuelPerDistance: 0.05,
    earthBuy: 3500,
  },
};

// Life support draws per pop per second (fractional consumption, applied each tick).
export const LIFE_SUPPORT = {
  // 1 unit / pop / 8 min ⇒ 1 / 480
  water_ice_per_pop_sec: 1 / 480,
  // 1 unit / pop / 6 min ⇒ 1 / 360
  oxygen_per_pop_sec: 1 / 360,
  // 1 unit / pop / 12 min ⇒ 1 / 720
  food_pack_per_pop_sec: 1 / 720,
};

// Pop-tier definition (Survival → Settled in MLP).
export interface PopTierDef {
  id: "survival" | "settled";
  name: string;
  needs: ResourceId[]; // continuous needs, all must be > 0
  settleInSec: number;
  bundle: Partial<Record<ResourceId, number>>; // one-time consumption on first reach
  capacityMultiplier: number;
}

export const POP_TIERS: PopTierDef[] = [
  {
    id: "survival",
    name: "Survival",
    needs: ["water_ice", "oxygen", "food_pack"],
    settleInSec: 300, // 5 min
    bundle: { construction_materials: 4 },
    capacityMultiplier: 1.0,
  },
  {
    id: "settled",
    name: "Settled",
    needs: ["water_ice", "oxygen", "food_pack"],
    settleInSec: 1200, // 20 min
    bundle: { construction_materials: 8, habitat_module: 2 },
    capacityMultiplier: 1.25,
  },
];

// Earth Prefab Kits.
export type PrefabKitId =
  | "lunar_habitat"
  | "lunar_surface_mine_kit"
  | "construction_cache";
export interface PrefabKit {
  id: PrefabKitId;
  name: string;
  cost: number;
  description: string;
  unlockTier: 0 | 1;
}

export const PREFAB_KITS: Record<PrefabKitId, PrefabKit> = {
  lunar_habitat: {
    id: "lunar_habitat",
    name: "Lunar Habitat Module Kit",
    cost: 8000,
    description: "Drops the first habitat on the Moon. Includes 1 Habitat Module + a 5×5 grid foothold.",
    unlockTier: 1,
  },
  lunar_surface_mine_kit: {
    id: "lunar_surface_mine_kit",
    name: "Lunar Surface Mine Kit",
    cost: 3500,
    description: "Pre-built Lunar Surface Mine, deployed on the Moon.",
    unlockTier: 1,
  },
  construction_cache: {
    id: "construction_cache",
    name: "Construction Cache",
    cost: 4500,
    description: "Direct Earth airdrop: 60 Construction Materials + 4 Aluminum + 1 Habitat Module to your Earth depot.",
    unlockTier: 1,
  },
};

// Tier gates (T0 → T1). Concrete production milestones, not credit thresholds.
export interface TierGate {
  fromTier: 0;
  toTier: 1;
  name: string;
  conditions: {
    refinedMetalSold: number;
    hydrogenFuelReserves: number;
  };
}

export const TIER_GATE_T0_T1: TierGate = {
  fromTier: 0,
  toTier: 1,
  name: "Lunar Foothold",
  conditions: {
    refinedMetalSold: 200,
    hydrogenFuelReserves: 50,
  },
};

export const ADJACENCY_RADIUS = 2;
