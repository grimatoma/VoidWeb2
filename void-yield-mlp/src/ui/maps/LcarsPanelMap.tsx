import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

const LCARS_PALETTE = {
  orange: "#ff9c44",
  amber: "#ffcc66",
  blueGrey: "#7790c8",
  red: "#ff5c5c",
  rust: "#cc6644",
  cream: "#ffaa90",
  black: "#000",
  background: "#000",
};

/**
 * Star-Trek LCARS-style operations panel. Half map, half UI panel: rounded
 * "elbow" frame with colored function pills, body-status panel on the right,
 * and a stylized SVG starfield-with-orbits map on the left. Reference: TNG
 * Ops console.
 */
export function LcarsPanelMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const w = 800;
  const h = 480;
  const cx = 290;
  const cy = h / 2;
  const bound = keplerViewBound() + 30;
  const scale = (Math.min(440, h - 80) / 2 - 16) / bound;
  const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

  const mapBodies = ALL_BODIES.filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat)).map((bid) => {
    const p = keplerPosition(state, bid);
    const sp = T(p.x, p.y);
    const colorByBody: Record<BodyId, string> = {
      earth: LCARS_PALETTE.blueGrey,
      moon: LCARS_PALETTE.cream,
      nea_04: LCARS_PALETTE.rust,
      lunar_habitat: LCARS_PALETTE.amber,
    };
    return { bid, x: sp.x, y: sp.y, color: colorByBody[bid] };
  });

  return (
    <div style={{ width: "100%", background: LCARS_PALETTE.background, borderRadius: 4 }}>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Frame elbows — top */}
        <path d={`M 0 0 L 240 0 L 240 50 L 110 50 L 80 60 L 80 78`} fill={LCARS_PALETTE.orange} />
        <path d={`M 250 0 L 540 0 L 540 36 L 250 36 Z`} fill={LCARS_PALETTE.amber} />
        <path d={`M 550 0 L 800 0 L 800 36 L 550 36 Z`} fill={LCARS_PALETTE.blueGrey} />
        {/* Bottom frame */}
        <path d={`M 0 90 L 80 90 L 80 480 L 0 480 Z`} fill={LCARS_PALETTE.orange} />
        <path d={`M 80 460 L 540 460 L 540 480 L 80 480 Z`} fill={LCARS_PALETTE.amber} />
        <path d={`M 550 460 L 800 460 L 800 480 L 550 480 Z`} fill={LCARS_PALETTE.rust} />
        {/* Map area */}
        <rect x={86} y={48} width={460} height={406} fill={LCARS_PALETTE.black} />
        {/* Title */}
        <text x={250} y={26} fill={LCARS_PALETTE.black} fontFamily="'Helvetica Neue', sans-serif" fontWeight={700} fontSize={16}>
          OPS-NAV
        </text>
        <text x={555} y={26} fill={LCARS_PALETTE.black} fontFamily="'Helvetica Neue', sans-serif" fontWeight={700} fontSize={16}>
          STELLAR CARTOGRAPHY
        </text>
        {/* Side function pills */}
        <g transform="translate(0 100)">
          {[
            { label: "ENGAGE", fill: LCARS_PALETTE.amber },
            { label: "RECALL", fill: LCARS_PALETTE.cream },
            { label: "SCAN", fill: LCARS_PALETTE.rust },
            { label: "TRADE", fill: LCARS_PALETTE.amber },
            { label: "PROBE", fill: LCARS_PALETTE.cream },
          ].map((b, i) => (
            <g key={b.label} transform={`translate(0 ${i * 38})`}>
              <rect x={0} y={0} width={70} height={32} fill={b.fill} rx={3} />
              <text
                x={64}
                y={20}
                fill={LCARS_PALETTE.black}
                fontFamily="'Helvetica Neue', sans-serif"
                fontWeight={700}
                fontSize={12}
                textAnchor="end"
              >
                {b.label}
              </text>
            </g>
          ))}
        </g>
        {/* Stellar map content */}
        {/* faint orbit hints */}
        <g>
          <circle cx={cx} cy={cy} r={110 * scale} stroke={LCARS_PALETTE.orange} strokeOpacity={0.18} fill="none" />
          <circle cx={cx} cy={cy} r={145 * scale} stroke={LCARS_PALETTE.amber} strokeOpacity={0.18} fill="none" />
        </g>
        {/* Sun */}
        <circle cx={cx} cy={cy} r={6} fill={LCARS_PALETTE.amber} />
        {mapBodies.map((b) => {
          const isSel = selectedBodyId === b.bid;
          return (
            <g key={b.bid} onClick={() => onSelectBody(b.bid)} style={{ cursor: "pointer" }}>
              <circle cx={b.x} cy={b.y} r={isSel ? 11 : 7} fill={b.color} />
              {isSel && <circle cx={b.x} cy={b.y} r={15} fill="none" stroke={LCARS_PALETTE.amber} strokeWidth={1.5} />}
              <text x={b.x + 12} y={b.y + 5} fill={b.color} fontFamily="'Helvetica Neue', sans-serif" fontWeight={700} fontSize={12}>
                {state.bodies[b.bid].name.toUpperCase()}
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
            return (
              <g key={sh.id}>
                <circle cx={ssp.x} cy={ssp.y} r={3} fill={LCARS_PALETTE.amber} />
              </g>
            );
          })}

        {/* Right panel: body roster */}
        <g transform="translate(556 48)">
          <rect width={244} height={406} fill={LCARS_PALETTE.black} />
          <text x={8} y={20} fill={LCARS_PALETTE.amber} fontFamily="'Helvetica Neue', sans-serif" fontWeight={700} fontSize={11}>
            CONTACT ROSTER
          </text>
          {mapBodies.map((b, i) => {
            const yOff = 36 + i * 64;
            return (
              <g key={b.bid} transform={`translate(0 ${yOff})`}>
                <rect width={228} height={56} rx={3} fill={LCARS_PALETTE.black} stroke={b.color} strokeWidth={1.5} />
                <rect x={4} y={4} width={20} height={48} fill={b.color} />
                <text x={32} y={20} fill={b.color} fontFamily="'Helvetica Neue', sans-serif" fontWeight={700} fontSize={13}>
                  {state.bodies[b.bid].name.toUpperCase()}
                </text>
                <text x={32} y={36} fill={LCARS_PALETTE.amber} fontFamily="'Helvetica Neue', sans-serif" fontSize={10}>
                  TYPE · {state.bodies[b.bid].type.toUpperCase()}
                </text>
                <text x={32} y={50} fill={LCARS_PALETTE.cream} fontFamily="'Helvetica Neue', sans-serif" fontSize={10}>
                  GRID · {state.bodies[b.bid].gridW}×{state.bodies[b.bid].gridH}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
