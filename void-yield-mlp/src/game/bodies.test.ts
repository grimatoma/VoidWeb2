import { describe, expect, it } from "vitest";
import { BODIES_VISUAL, isBodyVisible, visibleBodies } from "./bodies";
import { KEPLER } from "./kepler";
import type { BodyId } from "./state";
import { fresh } from "../test/helpers";

describe("BODIES_VISUAL", () => {
  it("has an entry for every BodyId in KEPLER", () => {
    const keplerIds = Object.keys(KEPLER) as BodyId[];
    const visualIds = Object.keys(BODIES_VISUAL) as BodyId[];
    expect(visualIds.sort()).toEqual(keplerIds.sort());
  });

  it("size ranks are 1, 2, or 3", () => {
    for (const v of Object.values(BODIES_VISUAL)) {
      expect([1, 2, 3]).toContain(v.sizeRank);
    }
  });
});

describe("isBodyVisible", () => {
  it("returns true for the always-visible bodies (earth, moon, nea_04)", () => {
    const s = fresh();
    expect(isBodyVisible(s, "earth")).toBe(true);
    expect(isBodyVisible(s, "moon")).toBe(true);
    expect(isBodyVisible(s, "nea_04")).toBe(true);
  });

  it("hides lunar_habitat before the prefab kit is bought (no population)", () => {
    const s = fresh();
    expect(s.populations.lunar_habitat).toBeUndefined();
    expect(isBodyVisible(s, "lunar_habitat")).toBe(false);
  });

  it("shows lunar_habitat once a population is seeded (post-prefab)", () => {
    const s = fresh();
    s.populations.lunar_habitat = {
      bodyId: "lunar_habitat",
      pop: 10,
      cap: 50,
      tier: "survival",
      settleProgressSec: 0,
      suspended: false,
      growthPaused: false,
    };
    expect(isBodyVisible(s, "lunar_habitat")).toBe(true);
  });

  it("hides comets while discovered=false (pre-scout return)", () => {
    const s = fresh();
    expect(s.bodies.halley_4.discovered).toBe(false);
    expect(isBodyVisible(s, "halley_4")).toBe(false);
  });

  it("shows comets once a scout has discovered them", () => {
    const s = fresh();
    s.bodies.halley_4.discovered = true;
    expect(isBodyVisible(s, "halley_4")).toBe(true);
  });

  it("returns false instead of throwing when a body slot is missing", () => {
    // Map renderers iterate the full KEPLER registry, so a stale state with a
    // missing slot used to crash the whole Map view (TypeError on .discovered).
    const s = fresh();
    delete (s.bodies as Record<string, unknown>).halley_4;
    expect(isBodyVisible(s, "halley_4")).toBe(false);
  });
});

describe("visibleBodies", () => {
  it("at game start returns earth, moon, nea_04 (no habitat, no comet)", () => {
    const s = fresh();
    expect(visibleBodies(s).sort()).toEqual(["earth", "moon", "nea_04"]);
  });

  it("includes a discovered comet", () => {
    const s = fresh();
    s.bodies.halley_4.discovered = true;
    expect(visibleBodies(s)).toContain("halley_4");
  });
});
