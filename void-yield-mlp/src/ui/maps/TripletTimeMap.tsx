import { keplerEllipsePoints, keplerPosition, keplerViewBound, KEPLER } from "../../game/kepler";
import type { BodyId, GameState } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

interface PanelConfig {
  label: string;
  tOffset: number;
}

/**
 * Triple-panel comparison view: same map drawn three times with different
 * time samples (t-300s, t now, t+300s). Lets you compare past/present/future
 * configurations side by side. No animation in the panels — three frozen
 * snapshots.
 */
export function TripletTimeMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const w = 800;
  const h = 460;
  const panelW = (w - 40) / 3;

  const panels: PanelConfig[] = [
    { label: "−5 min", tOffset: -300 },
    { label: "now", tOffset: 0 },
    { label: "+5 min", tOffset: 300 },
  ];

  const renderPanel = (cfg: PanelConfig, panelIdx: number) => {
    const x0 = 10 + panelIdx * (panelW + 10);
    const cx = x0 + panelW / 2;
    const cy = h / 2;
    const bound = keplerViewBound() + 30;
    const scale = (Math.min(panelW, h) / 2 - 30) / bound;
    const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

    // Sample state at t = state.gameTimeSec + tOffset
    const fakeState: GameState = { ...state, gameTimeSec: state.gameTimeSec + cfg.tOffset };

    const colorByBody: Record<BodyId, string> = {
      earth: "#5fb3ff",
      moon: "#c9d2dc",
      nea_04: "#a8896a",
      lunar_habitat: "#6cd07a",
    };

    return (
      <g key={panelIdx}>
        {/* Panel frame */}
        <rect x={x0} y={20} width={panelW} height={h - 30} fill="#04060c" stroke="var(--line)" strokeWidth={1} />
        <text x={cx} y={36} fill="rgba(216, 226, 238, 0.8)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11} textAnchor="middle">
          T{cfg.tOffset >= 0 ? "+" : ""}{cfg.tOffset}s · {cfg.label}
        </text>
        {/* Faint orbits */}
        {(Object.keys(KEPLER) as BodyId[])
          .filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat))
          .map((bid) => {
            const el = KEPLER[bid];
            const parent = el.parent === "sun" ? { x: 0, y: 0, z: 0 } : keplerPosition(fakeState, el.parent);
            const pts = keplerEllipsePoints(el, 64);
            const d = pts
              .map((p, i) => {
                const sp = T(parent.x + p.x, parent.y + p.y);
                return `${i === 0 ? "M" : "L"} ${sp.x.toFixed(1)} ${sp.y.toFixed(1)}`;
              })
              .join(" ");
            return <path key={`o-${bid}`} d={`${d} Z`} fill="none" stroke="rgba(76, 209, 216, 0.18)" strokeWidth={0.8} />;
          })}
        {/* Sun */}
        <circle cx={cx} cy={cy} r={3} fill="#ffd86b" />
        {/* Bodies */}
        {ALL_BODIES.filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat)).map((bid) => {
          const p = keplerPosition(fakeState, bid);
          const sp = T(p.x, p.y);
          const isSel = selectedBodyId === bid;
          const r = bid === "earth" ? 5 : 3;
          return (
            <g key={bid} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
              {isSel && <circle cx={sp.x} cy={sp.y} r={r + 4} fill="none" stroke="#4cd1d8" strokeWidth={1.5} />}
              <circle cx={sp.x} cy={sp.y} r={r} fill={colorByBody[bid]} />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div style={{ width: "100%", background: "#06090f", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <text x={20} y={14} fill="rgba(216, 226, 238, 0.7)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
          Triple-time comparison · past / present / future
        </text>
        {panels.map(renderPanel)}
      </svg>
    </div>
  );
}
