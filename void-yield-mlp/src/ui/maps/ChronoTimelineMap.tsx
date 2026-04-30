import { useEffect, useRef, useState } from "react";
import { predictBodyTrack } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Horizontal time-axis: where each body will be over the next N minutes,
 * graphed as distance-from-Sun vs. time. Different math entirely — projects
 * the orbital sample into a 1D distance-vs-time chart so you can see when
 * NEA-04 hits periapsis or when the lunar habitat lines up.
 *
 * Ship arrival/departure events appear as colored ticks on the time axis.
 */
export function ChronoTimelineMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
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

  const padL = 70;
  const padR = 30;
  const padT = 30;
  const padB = 50;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const lookahead = 600; // 10 minutes
  const samples = 120;

  // Build per-body distance-from-Sun series
  const colorByBody: Record<BodyId, string> = {
    earth: "#5fb3ff",
    moon: "#c9d2dc",
    nea_04: "#a8896a",
    lunar_habitat: "#6cd07a",
    halley_4: "#cfeefc",
  };

  const series = ALL_BODIES.filter(
    (bid) => !(bid === "lunar_habitat" && !state.populations.lunar_habitat),
  ).map((bid) => {
    const track = predictBodyTrack(state, bid, lookahead, samples);
    const ds = track.map((p) => Math.hypot(p.x, p.y, p.z));
    return { bid, ds };
  });

  const maxD = Math.max(...series.flatMap((s) => s.ds), 200);
  const minD = 0;

  const xAt = (i: number) => padL + (i / samples) * plotW;
  const yAt = (d: number) => padT + (1 - (d - minD) / (maxD - minD)) * plotH;

  const paths = series.map((s) => {
    const d = s.ds.map((y, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(y).toFixed(1)}`).join(" ");
    return (
      <g key={s.bid} onClick={() => onSelectBody(s.bid)} style={{ cursor: "pointer" }}>
        <path d={d} stroke={colorByBody[s.bid]} strokeWidth={selectedBodyId === s.bid ? 2.5 : 1.5} fill="none" />
        <circle cx={xAt(0)} cy={yAt(s.ds[0])} r={4} fill={colorByBody[s.bid]} />
        <text
          x={xAt(0) + 8}
          y={yAt(s.ds[0]) - 6}
          fill={selectedBodyId === s.bid ? "#4cd1d8" : colorByBody[s.bid]}
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={11}
        >
          {state.bodies[s.bid].name}
        </text>
      </g>
    );
  });

  // Y-axis ticks (range bands)
  const yTicks: React.ReactNode[] = [];
  for (let d = 0; d <= maxD; d += 50) {
    yTicks.push(
      <g key={`y-${d}`}>
        <line x1={padL} y1={yAt(d)} x2={padL + plotW} y2={yAt(d)} stroke="rgba(76, 209, 216, 0.08)" />
        <text
          x={padL - 6}
          y={yAt(d) + 3}
          fill="rgba(216, 226, 238, 0.55)"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={10}
          textAnchor="end"
        >
          {d}
        </text>
      </g>,
    );
  }

  // X-axis time ticks (every 60s)
  const xTicks: React.ReactNode[] = [];
  for (let t = 0; t <= lookahead; t += 60) {
    const x = padL + (t / lookahead) * plotW;
    xTicks.push(
      <g key={`x-${t}`}>
        <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="rgba(76, 209, 216, 0.05)" />
        <line x1={x} y1={padT + plotH} x2={x} y2={padT + plotH + 4} stroke="rgba(216, 226, 238, 0.4)" />
        <text
          x={x}
          y={padT + plotH + 18}
          fill="rgba(216, 226, 238, 0.55)"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={10}
          textAnchor="middle"
        >
          +{t}s
        </text>
      </g>,
    );
  }

  // Ship arrival markers (where the ship crosses 0 remaining time)
  const shipMarkers = state.ships
    .filter((sh) => sh.route)
    .filter((sh) => sh.route!.travelSecRemaining <= lookahead)
    .map((sh) => {
      const x = padL + (sh.route!.travelSecRemaining / lookahead) * plotW;
      return (
        <g key={sh.id}>
          <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#4cd1d8" strokeDasharray="4 4" strokeWidth={1.2} />
          <text
            x={x + 4}
            y={padT + 12}
            fill="#4cd1d8"
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={10}
          >
            {sh.name} arrives → {state.bodies[sh.route!.toBodyId].name}
          </text>
        </g>
      );
    });

  return (
    <div ref={wrapRef} style={{ width: "100%", background: "#06090f", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <text x={padL} y={padT - 10} fill="rgba(216, 226, 238, 0.7)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
          Distance from Sun vs. time (next {lookahead / 60} min)
        </text>
        {/* axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(216, 226, 238, 0.4)" />
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(216, 226, 238, 0.4)" />
        {yTicks}
        {xTicks}
        {paths}
        {shipMarkers}
      </svg>
    </div>
  );
}
