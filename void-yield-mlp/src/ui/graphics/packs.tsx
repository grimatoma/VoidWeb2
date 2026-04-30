// Graphic asset packs. Two versions of each glyph/sprite/icon, picked by a
// pack id. Everything renders inline as SVG strings or React-friendly props
// — no PNGs to ship, no fonts to load, no spritesheet to keep in sync.
//
// Add a new pack: extend the union type, add an entry to PLANET_PACKS /
// BUILDING_ICON_PACKS / SHIP_SPRITE_PACKS. The selector in Settings
// (post-MLP) becomes one dropdown.

import type { BuildingId } from "../../game/defs";

export type PackId = "noir" | "atlas";
export const PACK_LABELS: Record<PackId, string> = {
  noir: "Noir (NASA-industrial)",
  atlas: "Atlas (vintage astronomy plate)",
};

// ---------------- Planet portraits ----------------
//
// Used by the Body Detail Sheet header and by some maps that want a single
// portrait per body. Returns an SVG string keyed by body type.

export type PlanetType = "earth" | "moon" | "nea" | "habitat" | "comet";

const COMET_NOIR = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="c1" cx="0.45" cy="0.5"><stop offset="0%" stop-color="#cfeefc"/><stop offset="60%" stop-color="#5b8db8"/><stop offset="100%" stop-color="#1a2a3a"/></radialGradient></defs><circle cx="30" cy="40" r="14" fill="url(#c1)" stroke="#0e2a3a" stroke-width="1.2"/><path d="M40 40 q12 -6 30 -2 q-16 6 -30 6 z" fill="rgba(165,210,240,0.55)"/><path d="M40 44 q14 -2 28 4 q-14 0 -28 -1 z" fill="rgba(165,210,240,0.32)"/></svg>`;
const COMET_ATLAS = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="40" r="14" fill="#dcc89c" stroke="#3a280a" stroke-width="1.4"/><path d="M40 40 q14 -4 30 0 q-14 4 -30 4 z" fill="none" stroke="#3a280a" stroke-width="0.8"/><text x="30" y="44" text-anchor="middle" font-family="Georgia, serif" font-style="italic" fill="#3a280a" font-size="9">comet</text></svg>`;

const PLANET_PACK_NOIR: Record<PlanetType, string> = {
  earth: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="e1" cx="0.35" cy="0.35"><stop offset="0%" stop-color="#7ec1ff"/><stop offset="60%" stop-color="#3a7fc5"/><stop offset="100%" stop-color="#0d2745"/></radialGradient></defs><circle cx="40" cy="40" r="32" fill="url(#e1)"/><path d="M14 36 q12 -10 24 -2 q14 8 28 -4" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" fill="none"/><path d="M18 50 q8 -6 18 0 q12 8 26 -2" stroke="rgba(255,255,255,0.12)" stroke-width="1" fill="none"/></svg>`,
  moon: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="m1" cx="0.4" cy="0.4"><stop offset="0%" stop-color="#e2e7ed"/><stop offset="60%" stop-color="#a8b2bf"/><stop offset="100%" stop-color="#43494f"/></radialGradient></defs><circle cx="40" cy="40" r="32" fill="url(#m1)"/><circle cx="32" cy="34" r="3" fill="rgba(0,0,0,0.18)"/><circle cx="48" cy="46" r="2.4" fill="rgba(0,0,0,0.18)"/><circle cx="40" cy="52" r="1.6" fill="rgba(0,0,0,0.12)"/><circle cx="56" cy="32" r="1.8" fill="rgba(0,0,0,0.18)"/></svg>`,
  nea: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="n1" cx="0.4" cy="0.4"><stop offset="0%" stop-color="#cba374"/><stop offset="100%" stop-color="#52341a"/></radialGradient></defs><path d="M16 40 q4 -16 24 -22 q22 -4 28 18 q4 18 -16 26 q-22 8 -32 -10 q-6 -6 -4 -12 z" fill="url(#n1)" stroke="#2d1c0d" stroke-width="1.4"/><circle cx="34" cy="40" r="3" fill="rgba(0,0,0,0.25)"/><circle cx="50" cy="48" r="2" fill="rgba(0,0,0,0.18)"/></svg>`,
  habitat: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="30" fill="#162236" stroke="#5fb3ff" stroke-width="1.2"/><rect x="22" y="34" width="36" height="14" rx="3" fill="#1f3050" stroke="#5fb3ff" stroke-width="1.2"/><rect x="28" y="22" width="24" height="14" rx="3" fill="#1f3050" stroke="#5fb3ff" stroke-width="1.2"/><circle cx="40" cy="29" r="2" fill="#a8f0f4"/><circle cx="34" cy="41" r="1.8" fill="#a8f0f4"/><circle cx="46" cy="41" r="1.8" fill="#a8f0f4"/></svg>`,
  comet: COMET_NOIR,
};

const PLANET_PACK_ATLAS: Record<PlanetType, string> = {
  earth: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="32" fill="#dcc89c" stroke="#3a280a" stroke-width="1.5"/><circle cx="40" cy="40" r="22" fill="none" stroke="#3a280a" stroke-width="0.8" stroke-dasharray="2 3"/><text x="40" y="44" text-anchor="middle" font-family="Georgia, serif" font-style="italic" fill="#3a280a" font-size="11">Terra</text></svg>`,
  moon: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="28" fill="#e6dcb6" stroke="#3a280a" stroke-width="1.2"/><circle cx="32" cy="34" r="3" fill="none" stroke="#3a280a" stroke-width="0.8"/><circle cx="48" cy="44" r="2" fill="none" stroke="#3a280a" stroke-width="0.8"/><circle cx="40" cy="52" r="1.6" fill="none" stroke="#3a280a" stroke-width="0.8"/><text x="40" y="68" text-anchor="middle" font-family="Georgia, serif" font-style="italic" fill="#3a280a" font-size="9">Luna</text></svg>`,
  nea: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M16 40 q4 -16 24 -22 q22 -4 28 18 q4 18 -16 26 q-22 8 -32 -10 q-6 -6 -4 -12 z" fill="#dcc89c" stroke="#3a280a" stroke-width="1.4"/><path d="M22 38 q8 -8 18 -2 q14 8 24 -2" stroke="#3a280a" stroke-width="0.6" fill="none"/></svg>`,
  habitat: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="30" fill="#dcc89c" stroke="#3a280a" stroke-width="1.5"/><rect x="22" y="34" width="36" height="14" rx="2" fill="none" stroke="#3a280a"/><rect x="28" y="22" width="24" height="14" rx="2" fill="none" stroke="#3a280a"/><line x1="40" y1="22" x2="40" y2="48" stroke="#3a280a" stroke-width="0.8" stroke-dasharray="2 2"/></svg>`,
  comet: COMET_ATLAS,
};

export const PLANET_PACKS: Record<PackId, Record<PlanetType, string>> = {
  noir: PLANET_PACK_NOIR,
  atlas: PLANET_PACK_ATLAS,
};

// ---------------- Building icons ----------------

const BUILD_NOIR: Partial<Record<BuildingId, string>> = {
  small_mine: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="6,26 26,26 22,16 10,16" fill="#a8896a" stroke="#3a280a"/><rect x="14" y="6" width="4" height="12" fill="#a8896a" stroke="#3a280a"/><circle cx="16" cy="6" r="3" fill="#e8b94e" stroke="#3a280a"/></svg>`,
  ice_mine: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="6,26 26,26 22,16 10,16" fill="#6fc6e8" stroke="#0e2a3a"/><polygon points="14,6 18,6 19,16 13,16" fill="#cfe8f0" stroke="#0e2a3a"/><circle cx="16" cy="14" r="2" fill="#fff"/></svg>`,
  smelter: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="14" width="20" height="14" fill="#5a6a86" stroke="#1c2435"/><rect x="12" y="6" width="4" height="10" fill="#5a6a86" stroke="#1c2435"/><rect x="20" y="4" width="3" height="12" fill="#5a6a86" stroke="#1c2435"/><circle cx="16" cy="22" r="3" fill="#e8b94e"/></svg>`,
  electrolyzer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="20" height="18" rx="2" fill="#4a5a78" stroke="#1c2435"/><circle cx="12" cy="19" r="3" fill="#a8f0f4"/><circle cx="20" cy="19" r="3" fill="#dfa6e8"/><line x1="6" y1="14" x2="26" y2="14" stroke="#1c2435"/></svg>`,
  probe_bay: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,4 26,28 6,28" fill="#5fb3ff" stroke="#0e2a3a"/><circle cx="16" cy="20" r="3" fill="#a8f0f4"/></svg>`,
  silo: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="6" width="12" height="22" rx="6" fill="#bbb" stroke="#1c2435"/><line x1="10" y1="14" x2="22" y2="14" stroke="#1c2435"/><line x1="10" y1="20" x2="22" y2="20" stroke="#1c2435"/></svg>`,
  tank: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="10" rx="10" ry="3" fill="#74a3ff" stroke="#1c2435"/><rect x="6" y="10" width="20" height="16" fill="#74a3ff" stroke="#1c2435"/><ellipse cx="16" cy="26" rx="10" ry="3" fill="#5fb3ff" stroke="#1c2435"/></svg>`,
  cryo_tank: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="8" rx="11" ry="3" fill="#a8f0f4" stroke="#0e2a3a"/><rect x="5" y="8" width="22" height="20" fill="#a8f0f4" stroke="#0e2a3a"/><ellipse cx="16" cy="28" rx="11" ry="3" fill="#74cfd4" stroke="#0e2a3a"/><circle cx="11" cy="16" r="1.4" fill="#fff"/><circle cx="20" cy="20" r="1.2" fill="#fff"/><circle cx="14" cy="22" r="1" fill="#fff"/></svg>`,
  lunar_surface_mine: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="6,28 26,28 22,18 10,18" fill="#c9d2dc" stroke="#1c2435"/><rect x="13" y="8" width="6" height="12" fill="#a8b2bf" stroke="#1c2435"/><rect x="14" y="2" width="4" height="6" fill="#5fb3ff" stroke="#1c2435"/></svg>`,
  refinery_aluminum: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="14" width="20" height="14" fill="#bbb" stroke="#1c2435"/><rect x="9" y="4" width="3" height="12" fill="#bbb" stroke="#1c2435"/><rect x="14" y="6" width="3" height="10" fill="#bbb" stroke="#1c2435"/><rect x="20" y="2" width="3" height="14" fill="#bbb" stroke="#1c2435"/></svg>`,
  construction_yard: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="18" width="20" height="10" fill="#e8b94e" stroke="#3a280a"/><polygon points="4,18 16,4 28,18" fill="#e8b94e" stroke="#3a280a"/><rect x="13" y="20" width="6" height="8" fill="#3a280a"/></svg>`,
  habitat_assembler: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="14" width="24" height="14" rx="3" fill="#5fb3ff" stroke="#0e2a3a"/><circle cx="10" cy="21" r="2" fill="#a8f0f4"/><circle cx="16" cy="21" r="2" fill="#a8f0f4"/><circle cx="22" cy="21" r="2" fill="#a8f0f4"/><polygon points="6,14 16,4 26,14" fill="#3a7fc5" stroke="#0e2a3a"/></svg>`,
  greenhouse: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="4,28 16,8 28,28" fill="#cfe8d0" stroke="#1c2435"/><line x1="16" y1="8" x2="16" y2="28" stroke="#1c2435"/><line x1="10" y1="18" x2="22" y2="18" stroke="#1c2435"/><circle cx="13" cy="22" r="1.6" fill="#6cd07a"/><circle cx="19" cy="24" r="1.4" fill="#6cd07a"/></svg>`,
};

const BUILD_ATLAS: Partial<Record<BuildingId, string>> = {
  small_mine: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="6,26 26,26 22,16 10,16" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="14" y="6" width="4" height="12" fill="none" stroke="#3a280a" stroke-width="1.5"/><circle cx="16" cy="6" r="3" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  ice_mine: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="6,26 26,26 22,16 10,16" fill="none" stroke="#3a280a" stroke-width="1.5"/><polygon points="14,6 18,6 19,16 13,16" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  smelter: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="14" width="20" height="14" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="12" y="6" width="4" height="10" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="20" y="4" width="3" height="12" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  electrolyzer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="20" height="18" rx="2" fill="none" stroke="#3a280a" stroke-width="1.5"/><circle cx="12" cy="19" r="3" fill="none" stroke="#3a280a" stroke-width="1.5"/><circle cx="20" cy="19" r="3" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  probe_bay: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,4 26,28 6,28" fill="none" stroke="#3a280a" stroke-width="1.5"/><circle cx="16" cy="20" r="3" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  silo: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="6" width="12" height="22" rx="6" fill="none" stroke="#3a280a" stroke-width="1.5"/><line x1="10" y1="14" x2="22" y2="14" stroke="#3a280a" stroke-width="1.2"/><line x1="10" y1="20" x2="22" y2="20" stroke="#3a280a" stroke-width="1.2"/></svg>`,
  tank: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="10" rx="10" ry="3" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="6" y="10" width="20" height="16" fill="none" stroke="#3a280a" stroke-width="1.5"/><ellipse cx="16" cy="26" rx="10" ry="3" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  cryo_tank: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="8" rx="11" ry="3" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="5" y="8" width="22" height="20" fill="none" stroke="#3a280a" stroke-width="1.5"/><ellipse cx="16" cy="28" rx="11" ry="3" fill="none" stroke="#3a280a" stroke-width="1.5"/><line x1="5" y1="14" x2="27" y2="14" stroke="#3a280a" stroke-width="0.6" stroke-dasharray="2 2"/></svg>`,
  lunar_surface_mine: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="6,28 26,28 22,18 10,18" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="13" y="8" width="6" height="12" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="14" y="2" width="4" height="6" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  refinery_aluminum: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="14" width="20" height="14" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="9" y="4" width="3" height="12" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="14" y="6" width="3" height="10" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="20" y="2" width="3" height="14" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  construction_yard: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="18" width="20" height="10" fill="none" stroke="#3a280a" stroke-width="1.5"/><polygon points="4,18 16,4 28,18" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  habitat_assembler: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="14" width="24" height="14" rx="3" fill="none" stroke="#3a280a" stroke-width="1.5"/><polygon points="6,14 16,4 26,14" fill="none" stroke="#3a280a" stroke-width="1.5"/></svg>`,
  greenhouse: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="4,28 16,8 28,28" fill="none" stroke="#3a280a" stroke-width="1.5"/><line x1="16" y1="8" x2="16" y2="28" stroke="#3a280a" stroke-width="1.2"/><line x1="10" y1="18" x2="22" y2="18" stroke="#3a280a" stroke-width="1.2"/></svg>`,
};

export const BUILDING_ICON_PACKS: Record<PackId, Partial<Record<BuildingId, string>>> = {
  noir: BUILD_NOIR,
  atlas: BUILD_ATLAS,
};

// ---------------- Ship sprites ----------------

export type ShipSpriteId = "hauler_1";
const SHIP_NOIR: Record<ShipSpriteId, string> = {
  hauler_1: `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="10" width="36" height="12" rx="2" fill="#5a6a86" stroke="#1c2435"/><rect x="50" y="13" width="6" height="6" fill="#a8f0f4" stroke="#1c2435"/><polygon points="14,10 6,16 14,22" fill="#74a3ff" stroke="#1c2435"/><line x1="20" y1="10" x2="44" y2="10" stroke="#1c2435"/><line x1="20" y1="22" x2="44" y2="22" stroke="#1c2435"/><circle cx="40" cy="16" r="2" fill="#a8f0f4"/></svg>`,
};
const SHIP_ATLAS: Record<ShipSpriteId, string> = {
  hauler_1: `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="10" width="36" height="12" rx="2" fill="none" stroke="#3a280a" stroke-width="1.5"/><rect x="50" y="13" width="6" height="6" fill="none" stroke="#3a280a" stroke-width="1.5"/><polygon points="14,10 6,16 14,22" fill="none" stroke="#3a280a" stroke-width="1.5"/><line x1="20" y1="10" x2="44" y2="10" stroke="#3a280a"/><line x1="20" y1="22" x2="44" y2="22" stroke="#3a280a"/></svg>`,
};
export const SHIP_SPRITE_PACKS: Record<PackId, Record<ShipSpriteId, string>> = {
  noir: SHIP_NOIR,
  atlas: SHIP_ATLAS,
};

// ---------------- React helpers ----------------

/** Render an SVG string inside a span. Used for inline icon placement. */
export function svgIcon(svg: string, size = 24): React.ReactElement {
  return (
    <span
      aria-hidden
      style={{ display: "inline-block", width: size, height: size, verticalAlign: "middle" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
