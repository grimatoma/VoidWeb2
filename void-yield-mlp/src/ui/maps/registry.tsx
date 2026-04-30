// Each map renderer is a small self-contained component that takes the
// current GameState and a body-select callback. Adding a new map is one
// import + one entry in the MAP_REGISTRY array — that's the only seam
// the MapView depends on.

import type { ComponentType } from "react";
import type { BodyId, GameState } from "../../game/state";

export interface MapRendererProps {
  state: GameState;
  selectedBodyId: BodyId | null;
  onSelectBody: (id: BodyId) => void;
}

export interface MapEntry {
  id: string;
  label: string;
  blurb: string;
  Component: ComponentType<MapRendererProps>;
}

import { KeplerCanvasMap } from "./KeplerCanvasMap";
import { ThreeOrbitalMap } from "./ThreeOrbitalMap";
import { SvgTacticalMap } from "./SvgTacticalMap";
import { PixiGlowMap } from "./PixiGlowMap";
import { AsciiTerminalMap } from "./AsciiTerminalMap";
import { GraphBodiesMap } from "./GraphBodiesMap";
import { SchematicStaticMap } from "./SchematicStaticMap";
import { RadarPolarMap } from "./RadarPolarMap";
import { ChronoTimelineMap } from "./ChronoTimelineMap";
import { DeltaVHeatmap } from "./DeltaVHeatmap";

export const MAP_REGISTRY: MapEntry[] = [
  {
    id: "kepler-canvas",
    label: "Kepler 2D",
    blurb: "Newton-iterated Kepler orbits, foci marks, periapsis ticks, lookahead trail.",
    Component: KeplerCanvasMap,
  },
  {
    id: "three-3d",
    label: "Three.js 3D",
    blurb: "True 3D ecliptic with inclination; orbit-controls camera.",
    Component: ThreeOrbitalMap,
  },
  {
    id: "svg-tactical",
    label: "SVG Tactical",
    blurb: "Minimalist tactical readout — no orbital paths, just bodies and route vectors.",
    Component: SvgTacticalMap,
  },
  {
    id: "pixi-glow",
    label: "Pixi WebGL",
    blurb: "WebGL with glow halos and particle ship trails.",
    Component: PixiGlowMap,
  },
  {
    id: "ascii",
    label: "ASCII Console",
    blurb: "Pure monospace text-mode top-down. Honest, terse, retro.",
    Component: AsciiTerminalMap,
  },
  {
    id: "graph",
    label: "Graph",
    blurb: "Abstract gravitational-parent tree. Edges are 'orbits around'.",
    Component: GraphBodiesMap,
  },
  {
    id: "schematic",
    label: "Static schematic",
    blurb: "Frozen technical drawing — labeled apsides, semi-major axis, distances.",
    Component: SchematicStaticMap,
  },
  {
    id: "radar",
    label: "Radar polar",
    blurb: "Earth-relative concentric rings; bodies as bearing/range pings.",
    Component: RadarPolarMap,
  },
  {
    id: "chrono",
    label: "Chrono timeline",
    blurb: "Horizontal time axis: where each body and ship will be over the next N minutes.",
    Component: ChronoTimelineMap,
  },
  {
    id: "deltav",
    label: "Δ-v heatmap",
    blurb: "Color field showing transfer-cost contours from the selected body.",
    Component: DeltaVHeatmap,
  },
];
