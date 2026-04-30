import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Polar bar chart — bodies become radial bars on a circular axis. The bar's
 * angle is the body's heliocentric longitude; the bar's length is the body's
 * current distance from the Sun. As bodies orbit, bars rotate and pulse.
 *
 * Different math angle: discards the y-component, plots r vs θ as a circular
 * histogram. Reads cleanly as "how far is each body, and at what bearing?"
 */
export function PolarBarMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const w = 800;
  const h = 480;
  const cx = w / 2;
  const cy = h / 2;
  const bound = keplerViewBound() + 30;
  const maxR = Math.min(w, h) / 2 - 30;
  const scale = maxR / bound;

  const colorByBody: Record<BodyId, string> = {
    earth: "#5fb3ff",
    moon: "#c9d2dc",
    nea_04: "#a8896a",
    lunar_habitat: "#6cd07a",
  };

  return (
    <div style={{ width: "100%", background: "#06090f", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Range rings */}
        {[40, 80, 120, 160, 200].map((r) => (
          <g key={r}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(76,209,216,0.1)" strokeWidth={1} />
            <text x={cx + r + 4} y={cy + 3} fill="rgba(216,226,238,0.5)" fontFamily="ui-monospace, Menlo, monospace" fontSize={9}>
              {(r / scale).toFixed(0)}
            </text>
          </g>
        ))}
        {/* Spokes every 30° */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x2 = cx + Math.cos(a) * maxR;
          const y2 = cy + Math.sin(a) * maxR;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(76,209,216,0.08)" />
              <text
                x={cx + Math.cos(a) * (maxR + 12)}
                y={cy + Math.sin(a) * (maxR + 12) + 3}
                fill="rgba(216,226,238,0.55)"
                fontFamily="ui-monospace, Menlo, monospace"
                fontSize={9}
                textAnchor="middle"
              >
                {(i * 30) % 360}°
              </text>
            </g>
          );
        })}
        {/* Sun */}
        <circle cx={cx} cy={cy} r={4} fill="#ffd86b" />
        {/* Body bars */}
        {ALL_BODIES.filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat)).map((bid) => {
          const p = keplerPosition(state, bid);
          const r = Math.hypot(p.x, p.y);
          const θ = Math.atan2(p.y, p.x);
          const x2 = cx + Math.cos(θ) * r * scale;
          const y2 = cy + Math.sin(θ) * r * scale;
          const isSel = selectedBodyId === bid;
          const c = colorByBody[bid];
          return (
            <g key={bid} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={c} strokeWidth={isSel ? 4 : 2.5} opacity={0.85} />
              <circle cx={x2} cy={y2} r={isSel ? 8 : 6} fill={c} />
              {isSel && <circle cx={x2} cy={y2} r={12} stroke="#4cd1d8" strokeWidth={2} fill="none" />}
              <text
                x={x2 + 12}
                y={y2 + 4}
                fill={isSel ? "#4cd1d8" : "#d8e2ee"}
                fontFamily="ui-monospace, Menlo, monospace"
                fontSize={11}
              >
                {state.bodies[bid].name}
              </text>
              <text
                x={x2 + 12}
                y={y2 + 18}
                fill="rgba(216,226,238,0.5)"
                fontFamily="ui-monospace, Menlo, monospace"
                fontSize={9}
              >
                R={r.toFixed(1)} θ={((θ * 180) / Math.PI).toFixed(0)}°
              </text>
            </g>
          );
        })}
        {/* Ships as small chevrons on their radial */}
        {state.ships
          .filter((sh) => sh.route)
          .map((sh) => {
            const p = shipKeplerPosition(state, sh);
            const r = Math.hypot(p.x, p.y);
            const θ = Math.atan2(p.y, p.x);
            const x = cx + Math.cos(θ) * r * scale;
            const y = cy + Math.sin(θ) * r * scale;
            return <circle key={sh.id} cx={x} cy={y} r={3} fill="#4cd1d8" />;
          })}
        <text x={20} y={26} fill="rgba(216,226,238,0.7)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
          Polar bar — bar length = heliocentric distance, bar angle = longitude
        </text>
      </svg>
    </div>
  );
}
