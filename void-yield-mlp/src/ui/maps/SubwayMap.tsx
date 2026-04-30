import { useEffect, useRef, useState } from "react";
import type { BodyId, Ship } from "../../game/state";
import type { MapRendererProps } from "./registry";

const STATIONS: { id: BodyId; x: number; y: number; line: "blue" | "amber" | "green" }[] = [
  { id: "earth", x: 0.18, y: 0.5, line: "blue" },
  { id: "moon", x: 0.42, y: 0.5, line: "blue" },
  { id: "lunar_habitat", x: 0.62, y: 0.32, line: "green" },
  { id: "nea_04", x: 0.82, y: 0.5, line: "amber" },
];
const LINE_COLORS = {
  blue: "#5fb3ff",
  amber: "#e8b94e",
  green: "#6cd07a",
};

interface ConnectionDef {
  a: BodyId;
  b: BodyId;
  line: "blue" | "amber" | "green";
}

const CONNECTIONS: ConnectionDef[] = [
  { a: "earth", b: "moon", line: "blue" },
  { a: "moon", b: "lunar_habitat", line: "green" },
  { a: "moon", b: "nea_04", line: "amber" },
  { a: "earth", b: "nea_04", line: "amber" },
];

/**
 * Subway/transit-map style. Bodies become "stations" along colored "lines."
 * Distance is replaced with topology — what's *connectable* matters more than
 * how far. Different math: discrete graph layout, no Kepler positions used at
 * all. Shows the trade *network*, not the spatial geometry.
 *
 * Active ship routes overlay as bold line segments with directional arrows.
 */
export function SubwayMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
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

  const stationPos = (bid: BodyId) => {
    const st = STATIONS.find((s) => s.id === bid);
    if (!st) return { x: w / 2, y: h / 2 };
    return { x: st.x * w, y: st.y * h };
  };

  const connectionPath = (a: BodyId, b: BodyId) => {
    const p1 = stationPos(a);
    const p2 = stationPos(b);
    // Manhattan-ish bend: midpoint elbow
    const midx = (p1.x + p2.x) / 2;
    return `M ${p1.x} ${p1.y} L ${midx} ${p1.y} L ${midx} ${p2.y} L ${p2.x} ${p2.y}`;
  };

  // Active ship routes as colored progress overlays
  const activeRoutes = state.ships.filter((sh) => sh.route);

  return (
    <div ref={wrapRef} style={{ width: "100%", background: "#fafaf6", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Cream background paper */}
        <rect width={w} height={h} fill="#f5f0e3" />
        {/* Subway lines */}
        {CONNECTIONS.map((c, i) => (
          <path
            key={`conn-${i}`}
            d={connectionPath(c.a, c.b)}
            stroke={LINE_COLORS[c.line]}
            strokeWidth={6}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.35}
          />
        ))}
        {/* Active ship route overlays */}
        {activeRoutes
          .filter((sh): sh is Ship & { route: NonNullable<Ship["route"]> } => sh.route !== null)
          .map((sh) => {
            const conn = CONNECTIONS.find(
              (c) =>
                (c.a === sh.route!.fromBodyId && c.b === sh.route!.toBodyId) ||
                (c.b === sh.route!.fromBodyId && c.a === sh.route!.toBodyId),
            );
            const path =
              conn !== undefined
                ? connectionPath(sh.route.fromBodyId, sh.route.toBodyId)
                : `M ${stationPos(sh.route.fromBodyId).x} ${stationPos(sh.route.fromBodyId).y} L ${
                    stationPos(sh.route.toBodyId).x
                  } ${stationPos(sh.route.toBodyId).y}`;
            return (
              <g key={sh.id}>
                <path d={path} stroke="#1c2435" strokeWidth={2.5} fill="none" strokeDasharray="6 4" />
              </g>
            );
          })}
        {/* Stations */}
        {STATIONS.filter(
          (s) => s.id !== "lunar_habitat" || state.populations.lunar_habitat,
        ).map((s) => {
          const p = stationPos(s.id);
          const isSel = selectedBodyId === s.id;
          return (
            <g key={s.id} onClick={() => onSelectBody(s.id)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={isSel ? 14 : 10} fill="#fafaf6" stroke={LINE_COLORS[s.line]} strokeWidth={4} />
              {isSel && <circle cx={p.x} cy={p.y} r={20} fill="none" stroke="#1c2435" strokeWidth={1.5} />}
              <text
                x={p.x}
                y={p.y + 30}
                fill="#1c2435"
                fontFamily="system-ui, 'Helvetica Neue', sans-serif"
                fontSize={13}
                fontWeight={700}
                textAnchor="middle"
              >
                {state.bodies[s.id].name.toUpperCase()}
              </text>
              <text
                x={p.x}
                y={p.y + 46}
                fill="#5a6a86"
                fontFamily="system-ui, 'Helvetica Neue', sans-serif"
                fontSize={10}
                textAnchor="middle"
              >
                {state.bodies[s.id].type}
              </text>
            </g>
          );
        })}
        {/* Sun station */}
        {(() => {
          const p = { x: 0.5 * w, y: 0.18 * h };
          return (
            <g>
              <circle cx={p.x} cy={p.y} r={12} fill="#fafaf6" stroke="#e8b94e" strokeWidth={4} />
              <text
                x={p.x}
                y={p.y + 32}
                fill="#1c2435"
                fontFamily="system-ui, 'Helvetica Neue', sans-serif"
                fontSize={13}
                fontWeight={700}
                textAnchor="middle"
              >
                SOL
              </text>
            </g>
          );
        })()}
        {/* Legend */}
        <g transform={`translate(20 ${h - 80})`}>
          <text fill="#1c2435" fontFamily="system-ui, sans-serif" fontSize={11} fontWeight={700}>
            VOID YIELD TRANSIT NETWORK
          </text>
          <g transform="translate(0 18)">
            <rect width={20} height={4} fill={LINE_COLORS.blue} />
            <text x={28} y={6} fill="#1c2435" fontFamily="system-ui" fontSize={11}>
              Inner Loop
            </text>
          </g>
          <g transform="translate(0 36)">
            <rect width={20} height={4} fill={LINE_COLORS.amber} />
            <text x={28} y={6} fill="#1c2435" fontFamily="system-ui" fontSize={11}>
              NEA Cluster
            </text>
          </g>
          <g transform="translate(0 54)">
            <rect width={20} height={4} fill={LINE_COLORS.green} />
            <text x={28} y={6} fill="#1c2435" fontFamily="system-ui" fontSize={11}>
              Lunar Spur
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
