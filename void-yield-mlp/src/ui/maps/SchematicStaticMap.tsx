import { useEffect, useRef, useState } from "react";
import {
  KEPLER,
  apsides,
  keplerEllipsePoints,
  keplerPosition,
  keplerViewBound,
} from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

/**
 * Frozen technical-drawing style. Snapshot at the *time the tab was opened*
 * — no animation, no live update. Labels every measurable: semi-major axis,
 * eccentricity, period, periapsis q, apoapsis Q. Looks like the diagram you
 * pin to the wall during a mission planning meeting.
 */
export function SchematicStaticMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(800);
  const h = 480;
  // Snapshot the time at first render so the diagram doesn't move.
  const [tFreeze] = useState(state.gameTimeSec);

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      if (wrapRef.current) setW(wrapRef.current.clientWidth);
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const cx = w / 2;
  const cy = h / 2;
  const bound = keplerViewBound() + 20;
  const scale = (Math.min(w, h) / 2 - 40) / bound;
  const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

  // Frozen state snapshot
  const frozen = { ...state, gameTimeSec: tFreeze };

  const orbits: React.ReactNode[] = [];
  const annotations: React.ReactNode[] = [];
  const bodies: React.ReactNode[] = [];

  for (const bid of Object.keys(KEPLER) as BodyId[]) {
    if (bid === "lunar_habitat" && !state.populations.lunar_habitat) continue;
    const el = KEPLER[bid];
    const parent = el.parent === "sun" ? { x: 0, y: 0, z: 0 } : keplerPosition(frozen, el.parent);
    const pts = keplerEllipsePoints(el, 256);
    const path = pts
      .map((p, i) => {
        const sp = T(parent.x + p.x, parent.y + p.y);
        return `${i === 0 ? "M" : "L"} ${sp.x.toFixed(2)} ${sp.y.toFixed(2)}`;
      })
      .join(" ");
    orbits.push(
      <path key={`orbit-${bid}`} d={`${path} Z`} fill="none" stroke="rgba(76,209,216,0.6)" strokeWidth={1.2} />,
    );

    // Apsides line through periapsis (E=0) and apoapsis (E=π)
    const peri = pts[0];
    const apo = pts[Math.floor(pts.length / 2)];
    const periPos = T(parent.x + peri.x, parent.y + peri.y);
    const apoPos = T(parent.x + apo.x, parent.y + apo.y);
    annotations.push(
      <line
        key={`apsides-${bid}`}
        x1={periPos.x}
        y1={periPos.y}
        x2={apoPos.x}
        y2={apoPos.y}
        stroke="rgba(232, 185, 78, 0.5)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />,
    );
    annotations.push(
      <circle key={`peri-${bid}`} cx={periPos.x} cy={periPos.y} r={3} fill="#e8b94e" />,
      <circle key={`apo-${bid}`} cx={apoPos.x} cy={apoPos.y} r={3} fill="rgba(232,185,78,0.6)" />,
    );

    const { periapsis, apoapsis } = apsides(el);
    annotations.push(
      <text
        key={`label-${bid}`}
        x={(periPos.x + apoPos.x) / 2}
        y={(periPos.y + apoPos.y) / 2 - 6}
        fill="rgba(232, 185, 78, 0.9)"
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize={10}
        textAnchor="middle"
      >
        {state.bodies[bid].name} · a={el.a} · e={el.e.toFixed(3)} · q={periapsis.toFixed(1)} · Q={apoapsis.toFixed(1)}
      </text>,
    );

    // Body at frozen position
    const p = keplerPosition(frozen, bid);
    const sp = T(p.x, p.y);
    const fillByBody: Record<BodyId, [string, number]> = {
      earth: ["#5fb3ff", 7],
      moon: ["#c9d2dc", 4],
      nea_04: ["#a8896a", 4],
      lunar_habitat: ["#6cd07a", 3],
    };
    const [fill, br] = fillByBody[bid];
    const isSel = selectedBodyId === bid;
    bodies.push(
      <g key={`body-${bid}`} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
        {isSel && <circle cx={sp.x} cy={sp.y} r={br + 6} stroke="#4cd1d8" strokeWidth={2} fill="none" />}
        <circle cx={sp.x} cy={sp.y} r={br} fill={fill} />
        <text
          x={sp.x + br + 6}
          y={sp.y + 4}
          fill={isSel ? "#4cd1d8" : "#d8e2ee"}
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={11}
        >
          {state.bodies[bid].name}
        </text>
      </g>,
    );
  }

  // Sun + scale bar
  const sun = T(0, 0);
  const scaleBar = (() => {
    const len = 30 * scale; // 30 AU-units
    const x0 = 30;
    const y0 = h - 30;
    return (
      <g>
        <line x1={x0} y1={y0} x2={x0 + len} y2={y0} stroke="#d8e2ee" strokeWidth={1.5} />
        <line x1={x0} y1={y0 - 4} x2={x0} y2={y0 + 4} stroke="#d8e2ee" />
        <line x1={x0 + len} y1={y0 - 4} x2={x0 + len} y2={y0 + 4} stroke="#d8e2ee" />
        <text x={x0 + len / 2} y={y0 - 8} fill="#d8e2ee" fontFamily="ui-monospace, Menlo, monospace" fontSize={11} textAnchor="middle">
          30 units
        </text>
      </g>
    );
  })();

  return (
    <div ref={wrapRef} style={{ width: "100%", background: "#0a1626", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <pattern id="schem-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(76, 209, 216, 0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill="url(#schem-grid)" />
        {/* axes through sun */}
        <line x1={0} y1={cy} x2={w} y2={cy} stroke="rgba(76, 209, 216, 0.18)" strokeDasharray="2 4" />
        <line x1={cx} y1={0} x2={cx} y2={h} stroke="rgba(76, 209, 216, 0.18)" strokeDasharray="2 4" />
        {orbits}
        {annotations}
        {/* Sun */}
        <circle cx={sun.x} cy={sun.y} r={6} fill="#ffd86b" />
        <circle cx={sun.x} cy={sun.y} r={14} fill="none" stroke="#e8b94e" strokeWidth={0.7} />
        <text x={sun.x + 14} y={sun.y - 8} fill="#e8b94e" fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
          Sun (focus)
        </text>
        {bodies}
        {scaleBar}
        <text x={w - 20} y={h - 16} fill="rgba(216,226,238,0.5)" fontFamily="ui-monospace, Menlo, monospace" fontSize={10} textAnchor="end">
          T = {tFreeze.toFixed(0)}s · static snapshot
        </text>
      </svg>
    </div>
  );
}
