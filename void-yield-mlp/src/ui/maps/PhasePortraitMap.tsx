import { useEffect, useRef, useState } from "react";
import { KEPLER, predictBodyTrack } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Phase-portrait of (r, ṙ) — for each body, plot heliocentric distance
 * vs. radial velocity over one full period. The result is a closed
 * curve in state-space (a "phase portrait" in dynamical-systems
 * parlance). Eccentric orbits trace wide loops; circular orbits
 * collapse to a horizontal line.
 *
 * Different math: derivative-based, not position. Useful for the
 * mathematician brain — quickly read which orbits are nearly circular
 * vs. highly eccentric.
 */
export function PhasePortraitMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
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

  const padL = 64;
  const padR = 220;
  const padT = 36;
  const padB = 50;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // Sample one full period per body, computing r(t) and ṙ(t) by finite difference.
  type Series = { bid: BodyId; pts: { r: number; rdot: number }[] };
  const series: Series[] = ALL_BODIES.filter(
    (b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat),
  ).map((bid) => {
    const period = KEPLER[bid].periodSec;
    const samples = 240;
    const track = predictBodyTrack(state, bid, period, samples);
    const dt = period / samples;
    const pts: { r: number; rdot: number }[] = [];
    for (let i = 0; i < track.length - 1; i++) {
      const r = Math.hypot(track[i].x, track[i].y, track[i].z);
      const r2 = Math.hypot(track[i + 1].x, track[i + 1].y, track[i + 1].z);
      pts.push({ r, rdot: (r2 - r) / dt });
    }
    return { bid, pts };
  });

  // Determine plot bounds across all series
  let minR = Infinity;
  let maxR = -Infinity;
  let absRdot = 1e-6;
  for (const s of series) {
    for (const p of s.pts) {
      if (p.r < minR) minR = p.r;
      if (p.r > maxR) maxR = p.r;
      if (Math.abs(p.rdot) > absRdot) absRdot = Math.abs(p.rdot);
    }
  }
  if (!Number.isFinite(minR)) {
    minR = 0;
    maxR = 1;
  }
  const xAt = (r: number) => padL + ((r - minR) / Math.max(1e-9, maxR - minR)) * plotW;
  const yAt = (rdot: number) => padT + plotH / 2 - (rdot / absRdot) * (plotH / 2 - 8);

  const colorByBody: Record<BodyId, string> = {
    earth: "#5fb3ff",
    moon: "#c9d2dc",
    nea_04: "#a8896a",
    lunar_habitat: "#6cd07a",
  };

  return (
    <div ref={wrapRef} style={{ width: "100%", background: "#04060c", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Title */}
        <text x={padL} y={20} fill="rgba(216, 226, 238, 0.7)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
          Phase portrait — radial distance r vs. radial velocity ṙ (one period each)
        </text>
        {/* Axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(216,226,238,0.4)" />
        <line x1={padL} y1={padT + plotH / 2} x2={padL + plotW} y2={padT + plotH / 2} stroke="rgba(216,226,238,0.4)" />
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(216,226,238,0.2)" />
        <text x={padL + plotW / 2} y={padT + plotH + 20} fill="rgba(216,226,238,0.6)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11} textAnchor="middle">
          r
        </text>
        <text x={padL - 50} y={padT + plotH / 2} fill="rgba(216,226,238,0.6)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
          ṙ
        </text>
        {/* Series */}
        {series.map((s) => {
          const d = s.pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.r).toFixed(1)} ${yAt(p.rdot).toFixed(1)}`).join(" ");
          return (
            <g key={s.bid} onClick={() => onSelectBody(s.bid)} style={{ cursor: "pointer" }}>
              <path d={d} stroke={colorByBody[s.bid]} strokeWidth={selectedBodyId === s.bid ? 2.4 : 1.4} fill="none" opacity={0.9} />
            </g>
          );
        })}
        {/* Legend */}
        <g transform={`translate(${w - padR + 20} ${padT})`}>
          <text fill="rgba(216,226,238,0.7)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
            BODIES
          </text>
          {series.map((s, i) => (
            <g key={s.bid} transform={`translate(0 ${20 + i * 24})`}>
              <rect width={10} height={10} fill={colorByBody[s.bid]} />
              <text x={16} y={9} fill="rgba(216,226,238,0.85)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
                {state.bodies[s.bid].name}
              </text>
              <text x={16} y={22} fill="rgba(216,226,238,0.5)" fontFamily="ui-monospace, Menlo, monospace" fontSize={9}>
                e={KEPLER[s.bid].e.toFixed(3)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
