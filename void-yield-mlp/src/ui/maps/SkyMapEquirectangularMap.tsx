import { useEffect, useRef, useState } from "react";
import { keplerPosition, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Geocentric sky map (equirectangular projection). What does an observer
 * standing on Earth see? Compute each body's direction relative to Earth,
 * convert to right-ascension (RA, 0–360°) and declination (Dec, ±90°), and
 * plot on a flat equirectangular grid.
 *
 * Different math: vectors *relative to Earth*, projected to spherical
 * coords, projected to a flat sky chart. Useful for "where do I point my
 * antenna?"
 */
export function SkyMapEquirectangularMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(800);
  const h = 360;

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      if (wrapRef.current) setW(wrapRef.current.clientWidth);
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const padL = 50;
  const padR = 30;
  const padT = 40;
  const padB = 40;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // RA in [0, 360], Dec in [-90, +90]
  const skyToScreen = (ra: number, dec: number) => ({
    x: padL + (ra / 360) * plotW,
    y: padT + ((90 - dec) / 180) * plotH,
  });

  const earth = keplerPosition(state, "earth");

  const projectBody = (px: number, py: number, pz: number) => {
    const dx = px - earth.x;
    const dy = py - earth.y;
    const dz = pz - earth.z;
    const r = Math.hypot(dx, dy, dz);
    let ra = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (ra < 0) ra += 360;
    const dec = (Math.asin(dz / Math.max(1e-9, r)) * 180) / Math.PI;
    return { ra, dec, r };
  };

  const colorByBody: Record<BodyId, string> = {
    earth: "#5fb3ff",
    moon: "#c9d2dc",
    nea_04: "#a8896a",
    lunar_habitat: "#6cd07a",
  };

  // Grid lines
  const gridLines: React.ReactNode[] = [];
  for (let ra = 0; ra <= 360; ra += 30) {
    const x = padL + (ra / 360) * plotW;
    gridLines.push(
      <g key={`ra-${ra}`}>
        <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="rgba(76, 209, 216, 0.1)" />
        <text
          x={x}
          y={padT - 6}
          fill="rgba(216, 226, 238, 0.55)"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={10}
          textAnchor="middle"
        >
          {ra}°
        </text>
      </g>,
    );
  }
  for (let dec = -90; dec <= 90; dec += 30) {
    const y = padT + ((90 - dec) / 180) * plotH;
    gridLines.push(
      <g key={`dec-${dec}`}>
        <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="rgba(76, 209, 216, 0.1)" />
        <text
          x={padL - 6}
          y={y + 4}
          fill="rgba(216, 226, 238, 0.55)"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={10}
          textAnchor="end"
        >
          {dec >= 0 ? "+" : ""}
          {dec}°
        </text>
      </g>,
    );
  }
  // Ecliptic line (dec=0)
  const eqLine = (
    <line
      key="ecliptic"
      x1={padL}
      y1={padT + plotH / 2}
      x2={padL + plotW}
      y2={padT + plotH / 2}
      stroke="rgba(76, 209, 216, 0.4)"
      strokeDasharray="6 4"
    />
  );

  // Body markers
  const bodyMarkers = ALL_BODIES.filter(
    (b) => b !== "earth" && !(b === "lunar_habitat" && !state.populations.lunar_habitat),
  ).map((bid) => {
    const p = keplerPosition(state, bid);
    const { ra, dec, r } = projectBody(p.x, p.y, p.z);
    const sp = skyToScreen(ra, dec);
    const isSel = selectedBodyId === bid;
    const c = colorByBody[bid];
    const apparentMag = -2 - 6 * Math.log10(Math.max(0.5, r) / 100); // stylized magnitude
    const sz = Math.max(3, 8 - Math.max(0, apparentMag));
    return (
      <g key={bid} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
        {isSel && <circle cx={sp.x} cy={sp.y} r={sz + 5} stroke="#4cd1d8" strokeWidth={2} fill="none" />}
        <circle cx={sp.x} cy={sp.y} r={sz} fill={c} />
        <text x={sp.x + sz + 4} y={sp.y + 4} fill={isSel ? "#4cd1d8" : c} fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
          {state.bodies[bid].name}
        </text>
        <text
          x={sp.x + sz + 4}
          y={sp.y + 16}
          fill="rgba(216, 226, 238, 0.5)"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={9}
        >
          RA {ra.toFixed(0)}° · Dec {dec.toFixed(0)}° · m={apparentMag.toFixed(1)}
        </text>
      </g>
    );
  });

  // Ship markers
  const shipMarkers = state.ships
    .filter((sh) => sh.route)
    .map((sh) => {
      const sp = shipKeplerPosition(state, sh);
      const { ra, dec } = projectBody(sp.x, sp.y, sp.z);
      const screen = skyToScreen(ra, dec);
      return (
        <g key={sh.id}>
          <circle cx={screen.x} cy={screen.y} r={3} fill="#4cd1d8" />
          <text
            x={screen.x + 6}
            y={screen.y - 4}
            fill="#4cd1d8"
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize={10}
          >
            {sh.name}
          </text>
        </g>
      );
    });

  return (
    <div ref={wrapRef} style={{ width: "100%", background: "#02050b", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <text
          x={padL}
          y={20}
          fill="rgba(216, 226, 238, 0.7)"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize={11}
        >
          Geocentric sky map · equirectangular projection · RA × Dec
        </text>
        <rect x={padL} y={padT} width={plotW} height={plotH} fill="#06090f" />
        {gridLines}
        {eqLine}
        {bodyMarkers}
        {shipMarkers}
      </svg>
      <div style={{ padding: "0 14px 8px", color: "var(--text-dim)", fontFamily: "var(--mono)", fontSize: 11 }}>
        Apparent magnitude is stylized — real values would need actual photometry.
      </div>
    </div>
  );
}
