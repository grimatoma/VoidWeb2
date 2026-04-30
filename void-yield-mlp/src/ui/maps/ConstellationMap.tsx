import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

const CONNECTIONS: [BodyId, BodyId][] = [
  ["earth", "moon"],
  ["earth", "nea_04"],
  ["moon", "lunar_habitat"],
];

/**
 * Constellation aesthetic — bodies are connected by faint white lines
 * forming a "constellation" with mythology-style serif labels. Background
 * is starfield-heavy. Stylized like a vintage Hubble or Galileo print.
 */
export function ConstellationMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const w = 800;
  const h = 480;
  const cx = w / 2;
  const cy = h / 2;
  const bound = keplerViewBound() + 30;
  const scale = (Math.min(w, h) / 2 - 30) / bound;
  const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

  const bodyScreen = (bid: BodyId) => {
    const p = keplerPosition(state, bid);
    return T(p.x, p.y);
  };

  // Deterministic background star pattern
  const stars: { x: number; y: number; r: number; mag: number }[] = [];
  let seed = 19;
  for (let i = 0; i < 220; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const x = (seed / 233280) * w;
    seed = (seed * 9301 + 49297) % 233280;
    const y = (seed / 233280) * h;
    seed = (seed * 9301 + 49297) % 233280;
    const r = (seed / 233280) * 1.6 + 0.2;
    stars.push({ x, y, r, mag: r });
  }

  return (
    <div style={{ width: "100%", background: "#080a14", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <radialGradient id="vignette-const" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0e1226" stopOpacity={0.0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.95} />
          </radialGradient>
        </defs>
        <rect width={w} height={h} fill="#080a14" />
        {/* Stars */}
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fffaf0"
            opacity={0.55 + s.mag * 0.2}
          />
        ))}
        {/* Constellation lines — connect listed bodies */}
        {CONNECTIONS.filter(
          (c) =>
            (c[0] !== "lunar_habitat" || state.populations.lunar_habitat) &&
            (c[1] !== "lunar_habitat" || state.populations.lunar_habitat),
        ).map((c, i) => {
          const a = bodyScreen(c[0]);
          const b = bodyScreen(c[1]);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(220, 220, 220, 0.45)"
              strokeWidth={0.7}
              strokeDasharray="1 3"
            />
          );
        })}
        {/* Sun marker — gold star with rays */}
        <g>
          {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((a, i) => (
            <line
              key={i}
              x1={cx + Math.cos(a) * 10}
              y1={cy + Math.sin(a) * 10}
              x2={cx - Math.cos(a) * 10}
              y2={cy - Math.sin(a) * 10}
              stroke="#ffe39a"
              strokeWidth={1.2}
            />
          ))}
          <circle cx={cx} cy={cy} r={4} fill="#ffd86b" />
        </g>
        {/* Bodies as bright stars with serif labels */}
        {ALL_BODIES.filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat)).map((bid) => {
          const sp = bodyScreen(bid);
          const isSel = selectedBodyId === bid;
          const sizeByBody: Record<BodyId, number> = {
            earth: 4,
            moon: 2.5,
            nea_04: 3,
            lunar_habitat: 2,
          };
          return (
            <g key={bid} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
              {/* Halo */}
              <circle cx={sp.x} cy={sp.y} r={sizeByBody[bid] * 3} fill="rgba(255, 250, 240, 0.06)" />
              {isSel && <circle cx={sp.x} cy={sp.y} r={sizeByBody[bid] + 6} stroke="#ffe39a" strokeWidth={0.8} fill="none" />}
              <circle cx={sp.x} cy={sp.y} r={sizeByBody[bid]} fill="#fff" />
              <text
                x={sp.x + 10}
                y={sp.y - 4}
                fill="rgba(240, 220, 180, 0.88)"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontStyle="italic"
                fontSize={13}
              >
                {state.bodies[bid].name}
              </text>
              <text
                x={sp.x + 10}
                y={sp.y + 9}
                fill="rgba(240, 220, 180, 0.5)"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize={9}
              >
                {bid.replace(/_/g, " ")}
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
            return <circle key={sh.id} cx={ssp.x} cy={ssp.y} r={1.5} fill="#fff" />;
          })}
        <rect width={w} height={h} fill="url(#vignette-const)" pointerEvents="none" />
        <text
          x={w / 2}
          y={h - 16}
          fill="rgba(240, 220, 180, 0.6)"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
          fontSize={11}
          textAnchor="middle"
        >
          ◇ THE INNER SOLAR SPHERE ◇
        </text>
      </svg>
    </div>
  );
}
