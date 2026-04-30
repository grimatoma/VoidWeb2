import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearSave, loadState, newGame, saveState } from "./persist";
import { createInitialState } from "./state";

const KEY = "void-yield-mlp:save:v1";

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
