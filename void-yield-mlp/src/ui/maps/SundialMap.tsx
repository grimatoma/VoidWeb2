import { KEPLER, currentTrueAnomaly, keplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Sundial / clock-face style. Each body becomes a "hand" pointing from the
 * center outward; the hand's angle is its true anomaly mod 2π. Earth's hand
 * is short and slow (long period); the lunar habitat's hand whirls fast.
 *
 * Roman numeral hour-marks on the outer ring add the period-clock feel.
 * Different math: ν as the only spatial coordinate.
 */
export function SundialMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const w = 800;
  const h = 480;
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) / 2 - 30;

  const colorByBody: Record<BodyId, string> = {
    earth: "#5fb3ff",
    moon: "#c9d2dc",
    nea_04: "#a8896a",
    lunar_habitat: "#6cd07a",
  };

  // Hand-length per body — by orbital period (longer period = shorter hand visually)
  const handLen = (bid: BodyId) => {
    const period = KEPLER[bid].periodSec;
    return R * (0.35 + 0.55 * (60 / period));
  };

  const romans = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

  return (
    <div style={{ width: "100%", background: "#080a14", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(232, 185, 78, 0.5)" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={R - 18} fill="none" stroke="rgba(232, 185, 78, 0.2)" />
        {/* Hour marks (every 30°) */}
        {romans.map((r, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * (R - 8);
          const y = cy + Math.sin(a) * (R - 8) + 4;
          return (
            <g key={r}>
              <line
                x1={cx + Math.cos(a) * (R - 18)}
                y1={cy + Math.sin(a) * (R - 18)}
                x2={cx + Math.cos(a) * R}
                y2={cy + Math.sin(a) * R}
                stroke="rgba(232, 185, 78, 0.7)"
                strokeWidth={1.5}
              />
              <text
                x={cx + Math.cos(a) * (R - 30)}
                y={cy + Math.sin(a) * (R - 30) + 4}
                fill="rgba(232, 185, 78, 0.85)"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize={13}
                textAnchor="middle"
              >
                {r}
              </text>
              {/* Decorative inner mark */}
              <circle cx={x} cy={y - 4} r={1.4} fill="rgba(232, 185, 78, 0.5)" />
            </g>
          );
        })}
        {/* Minute ticks */}
        {Array.from({ length: 60 }).map((_, i) => {
          if (i % 5 === 0) return null;
          const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const r1 = R - 6;
          const r2 = R - 1;
          return (
            <line
              key={`t-${i}`}
              x1={cx + Math.cos(a) * r1}
              y1={cy + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * r2}
              y2={cy + Math.sin(a) * r2}
              stroke="rgba(232, 185, 78, 0.35)"
            />
          );
        })}
        {/* Body hands */}
        {ALL_BODIES.filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat)).map((bid) => {
          const ν = currentTrueAnomaly(KEPLER[bid], state.gameTimeSec);
          const a = ν - Math.PI / 2; // 0 at top
          const len = handLen(bid);
          const tipx = cx + Math.cos(a) * len;
          const tipy = cy + Math.sin(a) * len;
          const isSel = selectedBodyId === bid;
          return (
            <g key={bid} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
              <line
                x1={cx}
                y1={cy}
                x2={tipx}
                y2={tipy}
                stroke={isSel ? "#fff" : colorByBody[bid]}
                strokeWidth={isSel ? 4 : 2.5}
                strokeLinecap="round"
              />
              <circle cx={tipx} cy={tipy} r={isSel ? 8 : 6} fill={colorByBody[bid]} stroke="#080a14" strokeWidth={1} />
              <text
                x={tipx}
                y={tipy - 12}
                fill={isSel ? "#fff" : colorByBody[bid]}
                fontFamily="Georgia, 'Times New Roman', serif"
                fontStyle="italic"
                fontSize={11}
                textAnchor="middle"
              >
                {state.bodies[bid].name}
              </text>
            </g>
          );
        })}
        {/* Center pin */}
        <circle cx={cx} cy={cy} r={6} fill="#ffd86b" />
        <circle cx={cx} cy={cy} r={2.5} fill="#080a14" />
        {/* Sun marker */}
        <text
          x={cx}
          y={cy + 26}
          fill="rgba(232, 185, 78, 0.85)"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
          fontSize={11}
          textAnchor="middle"
        >
          ☉ SOL
        </text>
        {/* Live position readouts */}
        {(() => {
          const earth = keplerPosition(state, "earth");
          return (
            <text
              x={20}
              y={26}
              fill="rgba(216, 226, 238, 0.7)"
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize={11}
            >
              T+{Math.floor(state.gameTimeSec)}s · Earth at {Math.atan2(earth.y, earth.x).toFixed(2)}rad
            </text>
          );
        })()}
      </svg>
    </div>
  );
}
