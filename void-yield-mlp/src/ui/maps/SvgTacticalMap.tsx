import { useEffect, useRef, useState } from "react";
import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Pure SVG. Deliberately omits the orbital paths — this is a tactical
 * readout, the *current* picture only. Bodies are rendered as targeting
 * crosshairs, ships as direction-vectors with magnitude bars, distance
 * brackets between selected pair. The aesthetic is a heads-up display:
 * minimal ink, every glyph means something specific.
 */
export function SvgTacticalMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
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

  const bound = keplerViewBound() + 30;
  const cx = w / 2;
  const cy = h / 2;
  const scale = (Math.min(w, h) / 2 - 30) / bound;
  const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

  // --- Body glyph: targeting crosshair (no orbit, no shading) ---
  const renderBody = (bid: BodyId) => {
    const live = !(bid === "lunar_habitat" && !state.populations.lunar_habitat);
    if (!live) return null;
    const p = keplerPosition(state, bid);
    const sp = T(p.x, p.y);
    const isSel = selectedBodyId === bid;
    const hasAlert = state.alerts.some((a) => !a.resolved && a.bodyId === bid);
    const stroke = isSel ? "#4cd1d8" : hasAlert ? "#e8b94e" : "#d8e2ee";
    const r = bid === "earth" ? 8 : 5;
    return (
      <g key={bid} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
        {/* outer brackets */}
        <path
          d={`M ${sp.x - r - 4} ${sp.y - r} L ${sp.x - r - 4} ${sp.y - r - 4} L ${sp.x - r} ${sp.y - r - 4}`}
          stroke={stroke}
          strokeWidth={1.2}
          fill="none"
        />
        <path
          d={`M ${sp.x + r + 4} ${sp.y - r} L ${sp.x + r + 4} ${sp.y - r - 4} L ${sp.x + r} ${sp.y - r - 4}`}
          stroke={stroke}
          strokeWidth={1.2}
          fill="none"
        />
        <path
          d={`M ${sp.x - r - 4} ${sp.y + r} L ${sp.x - r - 4} ${sp.y + r + 4} L ${sp.x - r} ${sp.y + r + 4}`}
          stroke={stroke}
          strokeWidth={1.2}
          fill="none"
        />
        <path
          d={`M ${sp.x + r + 4} ${sp.y + r} L ${sp.x + r + 4} ${sp.y + r + 4} L ${sp.x + r} ${sp.y + r + 4}`}
          stroke={stroke}
          strokeWidth={1.2}
          fill="none"
        />
        {/* small dot center */}
        <circle cx={sp.x} cy={sp.y} r={2.5} fill={stroke} />
        {/* label + range from sun */}
        <text
          x={sp.x + r + 10}
          y={sp.y + 4}
          fill={stroke}
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={11}
        >
          {state.bodies[bid].name}
        </text>
        <text
          x={sp.x + r + 10}
          y={sp.y + 16}
          fill="rgba(216, 226, 238, 0.5)"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={9}
        >
          R={Math.hypot(p.x, p.y, p.z).toFixed(1)}
        </text>
      </g>
    );
  };

  // Distance bracket between selected and Sun
  const selBody = selectedBodyId && state.bodies[selectedBodyId];
  let bracket: React.ReactNode = null;
  if (selBody && selectedBodyId) {
    const p = keplerPosition(state, selectedBodyId);
    const sp = T(p.x, p.y);
    const sun = T(0, 0);
    const r = Math.hypot(p.x, p.y, p.z);
    bracket = (
      <g>
        <line
          x1={sun.x}
          y1={sun.y}
          x2={sp.x}
          y2={sp.y}
          stroke="rgba(76, 209, 216, 0.6)"
          strokeDasharray="2 4"
        />
        <text
          x={(sun.x + sp.x) / 2}
          y={(sun.y + sp.y) / 2 - 8}
          fill="#4cd1d8"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={10}
          textAnchor="middle"
        >
          Δ {r.toFixed(1)}
        </text>
      </g>
    );
  }

  // Ship vectors with progress bar
  const ships = state.ships
    .filter((sh) => sh.route)
    .map((sh) => {
      const sp = shipKeplerPosition(state, sh);
      const to = keplerPosition(state, sh.route!.toBodyId);
      const ssp = T(sp.x, sp.y);
      const tsp = T(to.x, to.y);
      const dx = tsp.x - ssp.x;
      const dy = tsp.y - ssp.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const ux = dx / len;
      const uy = dy / len;
      const arrowLen = 22;
      const tipx = ssp.x + ux * arrowLen;
      const tipy = ssp.y + uy * arrowLen;
      const pct = Math.round(
        ((sh.route!.travelSecTotal - sh.route!.travelSecRemaining) / Math.max(1, sh.route!.travelSecTotal)) * 100,
      );
      return (
        <g key={sh.id}>
          <line x1={ssp.x} y1={ssp.y} x2={tipx} y2={tipy} stroke="#4cd1d8" strokeWidth={1.4} />
          <polygon
            points={`${tipx},${tipy} ${tipx - ux * 6 - uy * 3},${tipy - uy * 6 + ux * 3} ${tipx - ux * 6 + uy * 3},${tipy - uy * 6 - ux * 3}`}
            fill="#4cd1d8"
          />
          <text
            x={ssp.x + 8}
            y={ssp.y - 8}
            fill="#d8e2ee"
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={10}
          >
            {sh.name} {pct}%
          </text>
          {/* progress bar */}
          <rect x={ssp.x - 14} y={ssp.y + 8} width={28} height={3} fill="rgba(76, 209, 216, 0.18)" />
          <rect x={ssp.x - 14} y={ssp.y + 8} width={28 * (pct / 100)} height={3} fill="#4cd1d8" />
        </g>
      );
    });

  // crosshair grid (cyan, faint)
  return (
    <div ref={wrapRef} style={{ width: "100%", background: "var(--bg-deep)", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img">
        {/* tactical grid */}
        <defs>
          <pattern id="tact-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(76, 209, 216, 0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill="url(#tact-grid)" />
        {/* center crosshair */}
        <line x1={cx} y1={0} x2={cx} y2={h} stroke="rgba(76, 209, 216, 0.1)" />
        <line x1={0} y1={cy} x2={w} y2={cy} stroke="rgba(76, 209, 216, 0.1)" />
        {/* sun mark */}
        <circle cx={cx} cy={cy} r={4} fill="#ffd86b" />
        <circle cx={cx} cy={cy} r={11} fill="none" stroke="#e8b94e" strokeWidth={0.6} strokeDasharray="2 3" />
        {bracket}
        {BODIES.map((bid) => renderBody(bid))}
        {ships}
      </svg>
    </div>
  );
}
