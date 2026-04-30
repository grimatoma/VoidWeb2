import { useEffect, useRef, useState } from "react";
import { KEPLER, apsides, currentTrueAnomaly, keplerPosition, shipKeplerPosition } from "../../game/kepler";
import { BODIES_VISUAL, isBodyVisible } from "../../game/bodies";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

interface NodePos {
  bodyId: BodyId | "sun";
  x: number;
  y: number;
}

/**
 * Abstract gravitational-parent tree. Edges encode "orbits around" — Earth and
 * NEA-04 hang off Sun; Moon hangs off Earth; habitat hangs off Moon. Nodes are
 * sized by current orbit phase (closer to periapsis = brighter), edges thickness
 * by parent's gravitational pull (1/r²-ish weighting). Ship traffic appears as
 * extra cyan edges between body nodes when a route is active.
 *
 * No spatial geometry — this is the topology view, useful for comprehending
 * "who depends on whom" at a glance.
 */
export function GraphBodiesMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(800);
  const h = 480;

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      if (wrapRef.current) setW(wrapRef.current.clientWidth);
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // Static layout — depth-based with siblings spread horizontally.
  const layout: Record<BodyId | "sun", NodePos> = (() => {
    const cx = w / 2;
    const top = 60;
    const lvl = (depth: number) => top + depth * 100;
    const nodes: Record<string, NodePos> = {
      sun: { bodyId: "sun", x: cx, y: lvl(0) },
    };
    // Children of sun: earth (left), halley_4 (right, hidden until scout returns)
    nodes.earth = { bodyId: "earth", x: cx - 140, y: lvl(1) };
    nodes.halley_4 = { bodyId: "halley_4", x: cx + 140, y: lvl(1) };
    // Children of earth: moon (left), nea_04 (right — Earth-Moon L4 station)
    nodes.moon = { bodyId: "moon", x: cx - 140, y: lvl(2) };
    nodes.nea_04 = { bodyId: "nea_04", x: cx + 0, y: lvl(2) };
    // Children of moon: habitat (only if alive)
    nodes.lunar_habitat = { bodyId: "lunar_habitat", x: cx - 140, y: lvl(3) };
    return nodes as Record<BodyId | "sun", NodePos>;
  })();

  const phaseBrightness = (bid: BodyId): number => {
    const ν = currentTrueAnomaly(KEPLER[bid], state.gameTimeSec);
    // periapsis (ν=0) is brightest; apoapsis (ν=π) is dimmest. Map to 0.4–1.0.
    const closeness = (1 + Math.cos(ν)) / 2;
    return 0.5 + closeness * 0.5;
  };

  const drawEdge = (a: NodePos, b: NodePos, opacity: number, color: string, width: number, dash?: string) => (
    <line
      key={`${a.bodyId}-${b.bodyId}-${color}`}
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={color}
      strokeOpacity={opacity}
      strokeWidth={width}
      strokeDasharray={dash}
    />
  );

  const edges: React.ReactNode[] = [];
  for (const bid of Object.keys(KEPLER) as BodyId[]) {
    if (!isBodyVisible(state, bid)) continue;
    const el = KEPLER[bid];
    const parent = layout[el.parent];
    const child = layout[bid];
    // Edge weight = inverse of apoapsis (loose proxy for "tightness of bond")
    const weight = Math.max(1, 12 - apsides(el).apoapsis * 0.04);
    edges.push(drawEdge(parent, child, 0.45, "rgba(76, 209, 216, 0.9)", Math.min(4, weight)));
  }

  // Ship edges between bodies (active routes)
  for (const ship of state.ships) {
    if (!ship.route) continue;
    const a = layout[ship.route.fromBodyId];
    const b = layout[ship.route.toBodyId];
    if (!a || !b) continue;
    edges.push(drawEdge(a, b, 0.7, "#4cd1d8", 1.5, "5 4"));
  }

  // Render nodes
  const nodeViews = (Object.keys(layout) as (BodyId | "sun")[])
    .filter((id) => id === "sun" || isBodyVisible(state, id))
    .map((id) => {
      const n = layout[id];
      const isSel = selectedBodyId === id;
      const color = id === "sun" ? "#ffd86b" : BODIES_VISUAL[id].color;
      // Sun and Earth get extra-large nodes since they're the heliocentric anchor
      // and the player's home; the rank-based table in BODIES_VISUAL already
      // captures relative size for everything else.
      const baseR = id === "sun"
        ? 20
        : id === "earth"
          ? 14
          : BODIES_VISUAL[id].sizeRank === 2
            ? 10
            : 9;
      const opacity = id === "sun" ? 1 : phaseBrightness(id);
      const label = id === "sun" ? "Sun" : state.bodies[id].name;
      // Distance to parent (live) — for the edge label
      let parentDist = "";
      if (id !== "sun") {
        const p = keplerPosition(state, id);
        const parentBody = KEPLER[id].parent;
        const par = parentBody === "sun" ? { x: 0, y: 0, z: 0 } : keplerPosition(state, parentBody);
        const r = Math.hypot(p.x - par.x, p.y - par.y, p.z - par.z);
        parentDist = `r=${r.toFixed(1)}`;
      }
      return (
        <g key={id} onClick={() => id !== "sun" && onSelectBody(id as BodyId)} style={{ cursor: id === "sun" ? "default" : "pointer" }}>
          <circle cx={n.x} cy={n.y} r={baseR + 4} fill={color} fillOpacity={opacity * 0.18} />
          {isSel && <circle cx={n.x} cy={n.y} r={baseR + 8} stroke="#4cd1d8" strokeWidth={2} fill="none" />}
          <circle cx={n.x} cy={n.y} r={baseR} fill={color} fillOpacity={opacity} />
          <text
            x={n.x}
            y={n.y + baseR + 14}
            fill={isSel ? "#4cd1d8" : "#d8e2ee"}
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={11}
            textAnchor="middle"
          >
            {label}
          </text>
          <text
            x={n.x}
            y={n.y + baseR + 26}
            fill="rgba(216, 226, 238, 0.5)"
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={9}
            textAnchor="middle"
          >
            {parentDist}
          </text>
        </g>
      );
    });

  // Ships near edges, scaled along the edge by progress
  const shipMarkers = state.ships
    .filter((sh) => sh.route)
    .map((sh) => {
      const a = layout[sh.route!.fromBodyId];
      const b = layout[sh.route!.toBodyId];
      const t = (sh.route!.travelSecTotal - sh.route!.travelSecRemaining) / Math.max(1, sh.route!.travelSecTotal);
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      // Use kepler ship position only to compute opacity proxy (not used here for layout)
      void shipKeplerPosition(state, sh);
      return (
        <g key={sh.id}>
          <circle cx={x} cy={y} r={4} fill="#4cd1d8" />
          <text x={x + 7} y={y - 6} fill="#d8e2ee" fontFamily="ui-monospace, Menlo, monospace" fontSize={10}>
            {sh.name}
          </text>
        </g>
      );
    });

  return (
    <div ref={wrapRef} style={{ width: "100%", background: "var(--bg-deep)", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <text
          x={w / 2}
          y={26}
          fill="rgba(216,226,238,0.6)"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={11}
          textAnchor="middle"
        >
          parent →
        </text>
        {edges}
        {nodeViews}
        {shipMarkers}
      </svg>
    </div>
  );
}
