import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearAllGameStorage, clearSave, loadState, newGame, saveState } from "./persist";
import { createInitialState } from "./state";

const KEY = "void-yield-mlp:save:v1";
const UI_LAST_DEST_KEY = "void-yield:last-dest";

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("saveState / loadState round-trip", () => {
  it("a fresh state round-trips intact", () => {
    const s = createInitialState();
    s.credits = 1234;
    s.refinedMetalSoldLifetime = 42;
    saveState(s);
    const loaded = loadState();
    expect(loaded).not.toBeNull();
    expect(loaded!.credits).toBe(1234);
    expect(loaded!.refinedMetalSoldLifetime).toBe(42);
  });

  it("loadState returns null when no save present", () => {
    expect(loadState()).toBeNull();
  });

  it("loadState returns null on invalid JSON", () => {
    localStorage.setItem(KEY, "{not valid json");
    expect(loadState()).toBeNull();
  });

  it("loadState rejects mismatched saveVersion", () => {
    localStorage.setItem(KEY, JSON.stringify({ saveVersion: 99 }));
    expect(loadState()).toBeNull();
  });

  it("saveState updates lastActiveWallMs to now on each write", () => {
    const s = createInitialState();
    s.lastActiveWallMs = 1000;
    saveState(s);
    const loaded = loadState();
    expect(loaded!.lastActiveWallMs).toBeGreaterThan(1000);
  });

  it("backfills tierUpModalSeen for older saves missing the field", () => {
    const s = createInitialState();
    // Simulate an older save written before the field existed.
    const raw = JSON.parse(JSON.stringify(s)) as Record<string, unknown> & { tierUpModalSeen?: unknown };
    delete raw.tierUpModalSeen;
    raw.tierUpClaimed = { 1: false };
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = loadState();
    expect(loaded!.tierUpModalSeen).toEqual({ 1: false });
  });

  it("backfills route.travelSecTotal for legacy saves (solar-map progress field)", () => {
    const s = createInitialState();
    s.ships[0].route = {
      fromBodyId: "earth",
      toBodyId: "nea_04",
      cargoResource: null,
      cargoQty: 0,
      travelSecRemaining: 30,
      // intentionally omit travelSecTotal — pretend this is a pre-migration save
      sellOnArrival: false,
      repeat: false,
    } as unknown as NonNullable<typeof s.ships[0]["route"]>;
    const raw = JSON.parse(JSON.stringify(s)) as Record<string, unknown>;
    // strip the field so we exercise the backfill path
    const ships = raw.ships as Array<Record<string, unknown>>;
    delete (ships[0].route as Record<string, unknown>).travelSecTotal;
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = loadState();
    expect(loaded!.ships[0].route!.travelSecTotal).toBe(30);
  });

  it("backfills body slots added after the save was written (e.g. halley_4)", () => {
    // Pre-#69 saves don't have a halley_4 entry. Without backfill, map
    // renderers iterating the KEPLER registry would dereference an undefined
    // body slot mid-render and crash the whole Map view.
    const s = createInitialState();
    const raw = JSON.parse(JSON.stringify(s)) as Record<string, unknown>;
    const bodies = raw.bodies as Record<string, unknown>;
    delete bodies.halley_4;
    const populations = raw.populations as Record<string, unknown>;
    delete populations.halley_4;
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = loadState();
    expect(loaded!.bodies.halley_4).toBeDefined();
    expect(loaded!.bodies.halley_4.discovered).toBe(false);
  });

  it("backfills tierUpModalSeen=true if tier 1 was already claimed in legacy save", () => {
    const s = createInitialState();
    const raw = JSON.parse(JSON.stringify(s)) as Record<string, unknown> & { tierUpModalSeen?: unknown };
    delete raw.tierUpModalSeen;
    raw.tierUpClaimed = { 1: true };
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = loadState();
    expect(loaded!.tierUpModalSeen).toEqual({ 1: true });
  });
});

describe("clearSave + newGame", () => {
  it("clearSave removes the localStorage entry", () => {
    saveState(createInitialState());
    expect(localStorage.getItem(KEY)).not.toBeNull();
    clearSave();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("newGame returns a fresh initial state (cold open shape)", () => {
    const a = newGame();
    expect(a.credits).toBe(5000);
    expect(a.tier).toBe(0);
  });
});

describe("loadState backfills — additional", () => {
  it("backfills graphicsPack='noir' for legacy saves missing the field", () => {
    const s = createInitialState();
    const raw = JSON.parse(JSON.stringify(s)) as Record<string, unknown> & { graphicsPack?: string };
    delete raw.graphicsPack;
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = loadState();
    expect(loaded!.graphicsPack).toBe("noir");
  });

  it("preserves graphicsPack='atlas' on saves that already had it", () => {
    const s = createInitialState();
    s.graphicsPack = "atlas";
    saveState(s);
    expect(loadState()!.graphicsPack).toBe("atlas");
  });

  it("backfills survey state for saves predating Survey/Prospecting feature", () => {
    const s = createInitialState();
    const raw = JSON.parse(JSON.stringify(s)) as Record<string, unknown> & { survey?: unknown };
    delete raw.survey;
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = loadState();
    expect(loaded!.survey).toBeDefined();
    expect(loaded!.survey.phase).toBe("idle");
    expect(loaded!.survey.candidates).toEqual([]);
  });

  it("backfills route.dispatchGameTimeSec for saves predating lead-the-target trajectories", () => {
    const s = createInitialState();
    s.gameTimeSec = 100;
    s.ships[0].route = {
      fromBodyId: "earth",
      toBodyId: "nea_04",
      cargoResource: null,
      cargoQty: 0,
      travelSecRemaining: 20,
      travelSecTotal: 30,
      sellOnArrival: false,
      repeat: false,
    } as unknown as NonNullable<typeof s.ships[0]["route"]>;
    const raw = JSON.parse(JSON.stringify(s)) as Record<string, unknown>;
    const ships = raw.ships as Array<Record<string, unknown>>;
    delete (ships[0].route as Record<string, unknown>).dispatchGameTimeSec;
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = loadState();
    // 30 total - 20 remaining = 10 elapsed → dispatch was at 100 - 10 = 90
    expect(loaded!.ships[0].route!.dispatchGameTimeSec).toBe(90);
  });
});

describe("clearAllGameStorage", () => {
  it("removes both the save and the UI last-destination key", () => {
    saveState(createInitialState());
    localStorage.setItem(UI_LAST_DEST_KEY, "production");
    clearAllGameStorage();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(localStorage.getItem(UI_LAST_DEST_KEY)).toBeNull();
  });
});
