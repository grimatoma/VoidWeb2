import { describe, expect, it } from "vitest";
import { BUILDING_ICON_PACKS, PACK_LABELS, PLANET_PACKS, SHIP_SPRITE_PACKS } from "./packs";
import type { PackId } from "./packs";

describe("graphic packs", () => {
  it("every pack id appears in PACK_LABELS", () => {
    const ids = Object.keys(PLANET_PACKS) as PackId[];
    expect(ids).toEqual(["noir", "atlas"]);
    for (const id of ids) {
      expect(PACK_LABELS[id]).toBeTruthy();
    }
  });

  it("planet packs cover earth/moon/nea/habitat in every pack", () => {
    for (const pack of Object.keys(PLANET_PACKS) as PackId[]) {
      const planets = PLANET_PACKS[pack];
      for (const t of ["earth", "moon", "nea", "habitat"] as const) {
        expect(planets[t]).toMatch(/^<svg/);
      }
    }
  });

  it("building icons exist for all 9 MLP-required buildings in both packs", () => {
    const required = [
      "small_mine",
      "ice_mine",
      "smelter",
      "electrolyzer",
      "probe_bay",
      "silo",
      "tank",
      "lunar_surface_mine",
      "habitat_assembler",
    ] as const;
    for (const pack of Object.keys(BUILDING_ICON_PACKS) as PackId[]) {
      for (const id of required) {
        expect(BUILDING_ICON_PACKS[pack][id], `pack=${pack} id=${id}`).toMatch(/^<svg/);
      }
    }
  });

  it("ship sprites cover hauler_1 in every pack", () => {
    for (const pack of Object.keys(SHIP_SPRITE_PACKS) as PackId[]) {
      expect(SHIP_SPRITE_PACKS[pack].hauler_1).toMatch(/^<svg/);
    }
  });

  it("every SVG closes with </svg>", () => {
    const all = [
      ...Object.values(PLANET_PACKS).flatMap((p) => Object.values(p)),
      ...Object.values(BUILDING_ICON_PACKS).flatMap((p) => Object.values(p)),
      ...Object.values(SHIP_SPRITE_PACKS).flatMap((p) => Object.values(p)),
    ];
    for (const svg of all) {
      expect(svg).toMatch(/<\/svg>$/);
    }
  });
});
