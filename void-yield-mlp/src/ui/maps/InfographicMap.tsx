import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Clean modern infographic. Flat colors, minimal shadows, sans-serif
 * Helvetica-style typography. Stat panels along the side with key
 * numbers (count of bodies, count of ships, total stockpile, etc).
 *
 * Reference: NYT data visualization / Stripe annual report. Different
 * vibe from the dashboard tab — this still has a spatial map but
 * flat-styled.
 */
export function InfographicMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const w = 800;
  const h = 480;
  const mapW = 540;
  const mapH = h - 40;
  const cx = mapW / 2 + 20;
  const cy = h / 2;
  const bound = keplerViewBound() + 30;
  const scale = (Math.min(mapW, mapH) / 2 - 20) / bound;
  const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

  const colorByBody: Record<BodyId, string> = {
    earth: "#2563eb",
    moon: "#94a3b8",
    nea_04: "#b8722c",
    lunar_habitat: "#16a34a",
  };
  const totalSolid = ALL_BODIES.reduce((acc, bid) => {
    if (bid === "lunar_habitat" && !state.populations.lunar_habitat) return acc;
    const wh = state.bodies[bid].warehouse;
    return acc + Object.values(wh).reduce((a, b) => a + (b ?? 0), 0);
  }, 0);
  const inTransit = state.ships.filter((sh) => sh.route).length;

  return (
    <div style={{ width: "100%", background: "#fafafa", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <text x={20} y={28} fill="#111827" fontFamily="'Helvetica Neue', Helvetica, sans-serif" fontWeight={700} fontSize={16}>
          Solar System Operations
        </text>
        <text x={20} y={48} fill="#6b7280" fontFamily="'Helvetica Neue', Helvetica, sans-serif" fontSize={11}>
          {state.companyName} · T+{Math.floor(state.gameTimeSec)}s
        </text>
        {/* Map area */}
        <rect x={20} y={60} width={mapW} height={mapH - 20} fill="#fff" stroke="#e5e7eb" />
        {/* Faint orbit guides */}
        <circle cx={cx} cy={cy} r={110 * scale} stroke="#e5e7eb" fill="none" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={145 * scale} stroke="#e5e7eb" fill="none" strokeWidth={1} />
        {/* Sun */}
        <circle cx={cx} cy={cy} r={6} fill="#f59e0b" />
        {ALL_BODIES.filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat)).map((bid) => {
          const p = keplerPosition(state, bid);
          const sp = T(p.x, p.y);
          const isSel = selectedBodyId === bid;
          const r = bid === "earth" ? 8 : 5;
          return (
            <g key={bid} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
              {isSel && <circle cx={sp.x} cy={sp.y} r={r + 6} fill="none" stroke="#0ea5e9" strokeWidth={2} />}
              <circle cx={sp.x} cy={sp.y} r={r} fill={colorByBody[bid]} />
              <text
                x={sp.x + r + 6}
                y={sp.y + 4}
                fill="#111827"
                fontFamily="'Helvetica Neue', Helvetica, sans-serif"
                fontWeight={600}
                fontSize={12}
              >
                {state.bodies[bid].name}
              </text>
            </g>
          );
        })}
        {/* Ships */}
        {state.ships
          .filter((sh) => sh.route)
          .map((sh) => {
            const sp = shipKeplerPosition(state, sh);
            const ssp = T(sp.x, sp.y);
            return <circle key={sh.id} cx={ssp.x} cy={ssp.y} r={3} fill="#0ea5e9" />;
          })}

        {/* KPI panel — right side */}
        <g transform={`translate(${20 + mapW + 20} 60)`}>
          {[
            { label: "BODIES", value: ALL_BODIES.filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat)).length },
            { label: "SHIPS", value: state.ships.length },
            { label: "IN TRANSIT", value: inTransit },
            { label: "TOTAL CARGO", value: Math.round(totalSolid) },
            { label: "CREDITS", value: `$${state.credits.toLocaleString()}` },
            { label: "TIER", value: `T${state.tier}` },
          ].map((kpi, i) => (
            <g key={kpi.label} transform={`translate(0 ${i * 60})`}>
              <text x={0} y={14} fill="#9ca3af" fontFamily="'Helvetica Neue', sans-serif" fontWeight={700} fontSize={10}>
                {kpi.label}
              </text>
              <text x={0} y={42} fill="#111827" fontFamily="'Helvetica Neue', sans-serif" fontWeight={700} fontSize={22}>
                {String(kpi.value)}
              </text>
              <line x1={0} y1={50} x2={180} y2={50} stroke="#e5e7eb" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
