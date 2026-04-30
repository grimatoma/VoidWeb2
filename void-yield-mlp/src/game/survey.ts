// Asteroid-field survey model. Two-phase visualization:
//
//   Phase 1 — Field sweep. The probe paints a wide swath of the NEA region,
//   resolving many candidates from blurry blips into rough composition reads.
//   Confidence rises with dwell time. The player picks the one(s) worth a
//   closer look from this overview.
//
//   Phase 2 — Prospecting. The probe focuses on a single candidate, refining
//   the read into per-resource yield estimates and a grid-size roll. The
//   player decides whether to *claim* (stake) the asteroid for mining or
//   discard.
//
// Survey state is fully serializable. The sim ticks survey progress in the
// same code path as everything else, which means AFK catch-up "just works."

import type { ResourceId } from "./defs";

export type SurveyPhase = "idle" | "field" | "prospecting" | "complete";
export type SurveyFocus = "composition" | "purity" | "hazard";

export interface AsteroidCandidate {
  id: string;
  /** 2-D position in the field plot (-1..1, normalized field coords). */
  fx: number;
  fy: number;
  /** Body-type seed: NEA mostly, with occasional belt-rim oddballs. */
  kind: "nea" | "belt-rim";
  /** Raw potential yields before the player ever scans. Hidden until resolved. */
  hiddenYield: Partial<Record<ResourceId, number>>;
  /** Grid-size roll (revealed at full prospecting confidence). */
  hiddenGrid: { w: number; h: number };
  /** Hazards revealed with hazard-focus dwell. */
  hiddenHazards: HazardId[];
  /** Confidence in [0, 1]; rises with dwell time on this candidate. */
  confidence: number;
  /** Reads that have crystallized at the current confidence threshold. */
  resolvedYields: Partial<Record<ResourceId, "trace" | "low" | "medium" | "high">>;
  resolvedGrid: { w: number; h: number } | null;
  resolvedHazards: HazardId[];
  /** Did the player stake this rock? Once staked it can be added to the body roster. */
  staked: boolean;
  /** Monotonic-id used to sort the field grid; stable across re-renders. */
  seed: number;
}

export type HazardId = "solar-storm-belt" | "tumbling" | "thin-iron-shell" | "deep-ice" | "nickel-fines";

export const HAZARD_LABELS: Record<HazardId, string> = {
  "solar-storm-belt": "solar-storm exposure (-5% mine rate)",
  tumbling: "high tumbling (mine cycles +20%)",
  "thin-iron-shell": "thin iron shell (Q drops fast)",
  "deep-ice": "deep ice (water yield doubled)",
  "nickel-fines": "nickel fines (free Nickel kicker)",
};

export interface SurveyState {
  /** Phase 1 vs phase 2 vs idle. */
  phase: SurveyPhase;
  /** Asteroids the probe has spotted in the field sweep. */
  candidates: AsteroidCandidate[];
  /** Field-sweep dwell time so far (seconds). */
  fieldElapsed: number;
  /** Total field-sweep budget (seconds). The sweep auto-completes at this. */
  fieldDuration: number;
  /** Prospecting target — id from `candidates`. */
  prospectingId: string | null;
  /** Prospecting dwell. */
  prospectingElapsed: number;
  prospectingDuration: number;
  /** Player-chosen probe focus during prospecting. */
  focus: SurveyFocus;
  /** Where the probe is. v1 = a single Probe-Bay on Earth Orbit. */
  probeReady: boolean;
}

export function createInitialSurvey(): SurveyState {
  return {
    phase: "idle",
    candidates: [],
    fieldElapsed: 0,
    fieldDuration: 240, // 4 min in MLP — matches GAME.md non-tutorial scan time.
    prospectingId: null,
    prospectingElapsed: 0,
    prospectingDuration: 90,
    focus: "composition",
    probeReady: true,
  };
}

// --------------------------- generation ----------------------------

const FIELD_SIZE = 14; // number of candidates per sweep

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sample a body-type-appropriate hidden yield distribution. */
function rollHiddenYield(rng: () => number, kind: AsteroidCandidate["kind"]): AsteroidCandidate["hiddenYield"] {
  const yields: AsteroidCandidate["hiddenYield"] = {};
  if (kind === "nea") {
    if (rng() < 0.85) yields.iron_ore = 1 + rng() * 4;
    if (rng() < 0.45) yields.water_ice = 0.5 + rng() * 3;
  } else {
    // belt-rim
    if (rng() < 0.6) yields.iron_ore = 0.5 + rng() * 6;
    if (rng() < 0.7) yields.water_ice = 0.5 + rng() * 5;
  }
  return yields;
}

function rollHazards(rng: () => number): HazardId[] {
  const haz: HazardId[] = [];
  if (rng() < 0.18) haz.push("solar-storm-belt");
  if (rng() < 0.22) haz.push("tumbling");
  if (rng() < 0.12) haz.push("thin-iron-shell");
  if (rng() < 0.18) haz.push("deep-ice");
  if (rng() < 0.1) haz.push("nickel-fines");
  return haz;
}

function rollGrid(rng: () => number, kind: AsteroidCandidate["kind"]): { w: number; h: number } {
  if (kind === "nea") {
    return { w: 3 + Math.floor(rng() * 3), h: 3 + Math.floor(rng() * 3) }; // 3x3..5x5
  }
  return { w: 4 + Math.floor(rng() * 3), h: 4 + Math.floor(rng() * 3) };
}

/** Build a fresh candidate list seeded by `seed`. Distribution is somewhat clumpy. */
export function generateField(seed: number): AsteroidCandidate[] {
  const rng = mulberry32(seed);
  const out: AsteroidCandidate[] = [];
  for (let i = 0; i < FIELD_SIZE; i++) {
    // Position with mild clustering — sample from a few "veins".
    const veinId = Math.floor(rng() * 3);
    const veinAngle = veinId * ((Math.PI * 2) / 3) + rng() * 0.8 - 0.4;
    const veinR = 0.3 + rng() * 0.65;
    const fx = Math.cos(veinAngle) * veinR + (rng() - 0.5) * 0.18;
    const fy = Math.sin(veinAngle) * veinR + (rng() - 0.5) * 0.18;
    const kind: AsteroidCandidate["kind"] = rng() < 0.85 ? "nea" : "belt-rim";
    out.push({
      id: `cand_${seed}_${i}`,
      fx,
      fy,
      kind,
      hiddenYield: rollHiddenYield(rng, kind),
      hiddenGrid: rollGrid(rng, kind),
      hiddenHazards: rollHazards(rng),
      confidence: 0,
      resolvedYields: {},
      resolvedGrid: null,
      resolvedHazards: [],
      staked: false,
      seed: i,
    });
  }
  return out;
}

// --------------------------- ticking -------------------------------

const COMP_BAND = (q: number): "trace" | "low" | "medium" | "high" =>
  q < 0.5 ? "trace" : q < 1.5 ? "low" : q < 3 ? "medium" : "high";

/**
 * Advance survey by `dt` seconds. Resolves reads as confidence crosses
 * thresholds. Pure mutation on the passed survey state.
 */
export function tickSurvey(s: SurveyState, dt: number): void {
  if (!s.probeReady) return;
  if (s.phase === "field") {
    s.fieldElapsed = Math.min(s.fieldDuration, s.fieldElapsed + dt);
    const frac = s.fieldElapsed / s.fieldDuration;
    // Field-sweep raises every candidate's confidence in lock-step, capped at 0.5
    // (full reveal needs prospecting).
    const targetConf = Math.min(0.5, frac * 0.5 * 1.2);
    for (const c of s.candidates) {
      if (c.confidence < targetConf) c.confidence = targetConf;
      // Resolve composition reads when conf crosses 0.25.
      if (c.confidence >= 0.25) {
        for (const [rid, qty] of Object.entries(c.hiddenYield) as [ResourceId, number][]) {
          if (!c.resolvedYields[rid]) c.resolvedYields[rid] = COMP_BAND(qty);
        }
      }
    }
    if (s.fieldElapsed >= s.fieldDuration) {
      s.phase = "complete";
    }
  } else if (s.phase === "prospecting" && s.prospectingId) {
    const c = s.candidates.find((x) => x.id === s.prospectingId);
    if (!c) return;
    s.prospectingElapsed = Math.min(s.prospectingDuration, s.prospectingElapsed + dt);
    const frac = s.prospectingElapsed / s.prospectingDuration;
    // Prospecting goes from 0.5 → 1.0. Focus controls *which* layer crystallizes first.
    const targetConf = Math.max(c.confidence, 0.5 + frac * 0.5);
    c.confidence = targetConf;
    if (c.confidence >= 0.65) {
      // Composition resolves fully (already banded; refine if focus is composition)
      for (const [rid, qty] of Object.entries(c.hiddenYield) as [ResourceId, number][]) {
        c.resolvedYields[rid] = COMP_BAND(qty);
      }
    }
    if (c.confidence >= 0.8) {
      // Grid-size roll resolves (so the player knows layout space)
      c.resolvedGrid = c.hiddenGrid;
    }
    if (c.confidence >= 0.9 && s.focus === "hazard") {
      c.resolvedHazards = [...c.hiddenHazards];
    }
    if (c.confidence >= 1) {
      // Always show hazards at full confidence regardless of focus
      c.resolvedHazards = [...c.hiddenHazards];
      s.phase = "complete";
    }
  }
}

// --------------------------- commands ------------------------------

export function startFieldSweep(s: SurveyState, seed: number): void {
  s.candidates = generateField(seed);
  s.fieldElapsed = 0;
  s.phase = "field";
  s.prospectingId = null;
  s.prospectingElapsed = 0;
}

export function startProspecting(s: SurveyState, candId: string, focus: SurveyFocus = "composition"): void {
  s.prospectingId = candId;
  s.prospectingElapsed = 0;
  s.focus = focus;
  s.phase = "prospecting";
}

export function setFocus(s: SurveyState, focus: SurveyFocus): void {
  s.focus = focus;
}

export function stakeCandidate(s: SurveyState, candId: string): void {
  const c = s.candidates.find((x) => x.id === candId);
  if (c) c.staked = true;
}

export function abandonProspecting(s: SurveyState): void {
  s.prospectingId = null;
  s.prospectingElapsed = 0;
  s.phase = s.fieldElapsed >= s.fieldDuration ? "complete" : "field";
}
