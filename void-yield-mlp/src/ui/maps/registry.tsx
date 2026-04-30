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
import { GraphBodiesMap } from "./GraphBodiesMap";
import { ChronoTimelineMap } from "./ChronoTimelineMap";
import { EveScannerMap } from "./EveScannerMap";
import { DashboardCardMap } from "./DashboardCardMap";
import { FlightPathPredictorMap } from "./FlightPathPredictorMap";

export const MAP_REGISTRY: MapEntry[] = [
  {
    id: "kepler-canvas",
    label: "Kepler 2D",
    blurb: "Newton-iterated Kepler orbits, foci marks, periapsis ticks, lookahead trail.",
    Component: KeplerCanvasMap,
  },
  {
    id: "graph",
    label: "Graph",
    blurb: "Abstract gravitational-parent tree. Edges are 'orbits around'.",
    Component: GraphBodiesMap,
  },
  {
    id: "chrono",
    label: "Chrono timeline",
    blurb: "Horizontal time axis: where each body and ship will be over the next N minutes.",
    Component: ChronoTimelineMap,
  },
  {
    id: "eve",
    label: "EVE scanner",
    blurb: "Zoomable scanner with dense info overlays — homage to EVE Online's overview.",
    Component: EveScannerMap,
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
];
