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
import { RtsStrategicMap } from "./RtsStrategicMap";
import { EveScannerMap } from "./EveScannerMap";
import { HexGridMap } from "./HexGridMap";
import { PaintedIllustrationMap } from "./PaintedIllustrationMap";
import { HoloProjectorMap } from "./HoloProjectorMap";
import { SubwayMap } from "./SubwayMap";
import { CorotatingFrameMap } from "./CorotatingFrameMap";
import { DashboardCardMap } from "./DashboardCardMap";
import { FlightPathPredictorMap } from "./FlightPathPredictorMap";
import { ResourceSankeyMap } from "./ResourceSankeyMap";
import { PixelArtMap } from "./PixelArtMap";
import { TopographicGravityMap } from "./TopographicGravityMap";
import { PhasePortraitMap } from "./PhasePortraitMap";
import { SkyMapEquirectangularMap } from "./SkyMapEquirectangularMap";
import { VoronoiTerritoryMap } from "./VoronoiTerritoryMap";

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
  {
    id: "rts",
    label: "RTS strategic",
    blurb: "Game-style strategic minimap — fog of war, fleet selector, group highlights.",
    Component: RtsStrategicMap,
  },
  {
    id: "eve",
    label: "EVE scanner",
    blurb: "Zoomable scanner with dense info overlays — homage to EVE Online's overview.",
    Component: EveScannerMap,
  },
  {
    id: "hex",
    label: "Hex 4X",
    blurb: "Turn-based 4X-style hex grid. Bodies snap to hex centers; ships traverse along hex paths.",
    Component: HexGridMap,
  },
  {
    id: "painted",
    label: "Painted",
    blurb: "Hand-illustrated storybook style — soft blobs, painted halos, no grid.",
    Component: PaintedIllustrationMap,
  },
  {
    id: "holo",
    label: "Holo projector",
    blurb: "Sci-fi cyan hologram with scanlines and CRT phosphor flicker.",
    Component: HoloProjectorMap,
  },
  {
    id: "subway",
    label: "Subway map",
    blurb: "Topological transit map — stations, colored lines, no spatial scale. The trade network as Métro.",
    Component: SubwayMap,
  },
  {
    id: "corot",
    label: "Co-rotating",
    blurb: "Sun-Earth co-rotating reference frame. Earth pinned on +x; L1-L5 Lagrange points marked.",
    Component: CorotatingFrameMap,
  },
  {
    id: "dash",
    label: "Dashboard",
    blurb: "Per-body data cards — no spatial map at all. Stats, mini portrait, phase progress.",
    Component: DashboardCardMap,
  },
  {
    id: "predictor",
    label: "Predictor",
    blurb: "Flight-path predictor with look-ahead slider — drag time forward, watch the system swirl.",
    Component: FlightPathPredictorMap,
  },
  {
    id: "sankey",
    label: "Resource Sankey",
    blurb: "Spatial map with resource-flow ribbons sized by cargo qty + per-body storage stacks.",
    Component: ResourceSankeyMap,
  },
  {
    id: "pixel",
    label: "8-bit pixel",
    blurb: "Retro 200x120 pixel-art renderer with image-rendering: pixelated. Sega-grade.",
    Component: PixelArtMap,
  },
  {
    id: "topo",
    label: "Topographic",
    blurb: "Gravity-potential topographic map — banded contour fill, iso-potential lines, Lagrange-style.",
    Component: TopographicGravityMap,
  },
  {
    id: "phase",
    label: "Phase portrait",
    blurb: "State-space (r, ṙ) phase portrait — closed orbit loops in dynamical-systems form.",
    Component: PhasePortraitMap,
  },
  {
    id: "sky",
    label: "Sky map",
    blurb: "Geocentric equirectangular sky chart — RA × Dec view of where each body appears from Earth.",
    Component: SkyMapEquirectangularMap,
  },
  {
    id: "voronoi",
    label: "Voronoi",
    blurb: "Sphere-of-influence partition — every pixel colored by nearest body. Toggle cells on/off.",
    Component: VoronoiTerritoryMap,
  },
];
