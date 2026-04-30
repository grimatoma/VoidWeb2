import { useEffect, useRef, useState } from "react";
import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Hex 4X grid. Bodies snap to the nearest hex center; ships traverse along
 * a hex path computed at render time. Different math angle: continuous
 * Kepler positions discretized to a flat-top hex grid à la Civilization /
 * Endless Space, then re-projected to screen. Selecting a body highlights
 * the ring of hexes within "1 jump" range.
 */
export function HexGridMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
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
  const hexSize = 18; // hex radius
  const cx = w / 2;
  const cy = h / 2;
  const scale = (Math.min(w, h) / 2 - 30) / bound;

  // Flat-top hex axial → pixel
  const hexToPixel = (q: number, r: number) => ({
    x: cx + hexSize * 1.5 * q,
    y: cy + hexSize * (Math.sqrt(3) * (r + q / 2)),
  });
  // Pixel → hex axial (flat-top)
  const pixelToHex = (x: number, y: number) => {
    const dx = x - cx;
    const dy = y - cy;
    const q = (dx * 2) / 3 / hexSize;
    const r = (-dx / 3 + (Math.sqrt(3) / 3) * dy) / hexSize;
    // round
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);
    const dq = Math.abs(rq - q);
    const dr = Math.abs(rr - r);
    const ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs;
    else if (dr > ds) rr = -rq - rs;
    return { q: rq, r: rr };
  };
  // World coords → hex
  const worldToHex = (wx: number, wy: number) => {
    const sx = wx * scale;
    const sy = wy * scale;
    return pixelToHex(cx + sx, cy + sy);
  };

  // Build hex grid that fills the canvas
  const hexCols = Math.ceil(w / (hexSize * 1.5)) + 2;
  const hexRows = Math.ceil(h / (hexSize * Math.sqrt(3))) + 2;
  const hexes: { q: number; r: number; key: string }[] = [];
  for (let q = -hexCols / 2; q < hexCols / 2; q++) {
    for (let r = -hexRows / 2; r < hexRows / 2; r++) {
      hexes.push({ q, r, key: `${q},${r}` });
    }
  }

  const hexCorners = (cxh: number, cyh: number) => {
    const corners: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      corners.push({ x: cxh + hexSize * Math.cos(a), y: cyh + hexSize * Math.sin(a) });
    }
    return corners;
  };
  const hexPath = (cxh: number, cyh: number) => {
    const c = hexCorners(cxh, cyh);
    return `M ${c.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")} Z`;
  };

  // Body hex assignments
  const bodyHexes = new Map<BodyId, { q: number; r: number }>();
  for (const bid of ALL_BODIES) {
    if (bid === "lunar_habitat" && !state.populations.lunar_habitat) continue;
    const p = keplerPosition(state, bid);
    bodyHexes.set(bid, worldToHex(p.x, p.y));
  }

  // Adjacent hexes to selected body — within 2 jump rings
  const inSelRange = new Set<string>();
  const selHex = selectedBodyId ? bodyHexes.get(selectedBodyId) : null;
  if (selHex) {
    for (let dq = -2; dq <= 2; dq++) {
      for (let dr = Math.max(-2, -dq - 2); dr <= Math.min(2, -dq + 2); dr++) {
        inSelRange.add(`${selHex.q + dq},${selHex.r + dr}`);
      }
    }
  }

  return (
    <div ref={wrapRef} style={{ width: "100%", background: "#0a1628", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Hex grid */}
        {hexes.map((hex) => {
          const px = hexToPixel(hex.q, hex.r);
          const inRange = inSelRange.has(hex.key);
          return (
            <path
              key={hex.key}
              d={hexPath(px.x, px.y)}
              fill={inRange ? "rgba(76, 209, 216, 0.06)" : "none"}
              stroke="rgba(76, 209, 216, 0.12)"
              strokeWidth={0.7}
            />
          );
        })}

        {/* Sun hex */}
        {(() => {
          const c = hexToPixel(0, 0);
          return (
            <g>
              <path d={hexPath(c.x, c.y)} fill="rgba(255, 216, 107, 0.18)" stroke="#ffd86b" strokeWidth={1.5} />
              <circle cx={c.x} cy={c.y} r={5} fill="#ffd86b" />
            </g>
          );
        })()}

        {/* Bodies on their hexes */}
        {Array.from(bodyHexes.entries()).map(([bid, hex]) => {
          const c = hexToPixel(hex.q, hex.r);
          const isSel = selectedBodyId === bid;
          const colorByBody: Record<BodyId, string> = {
            earth: "#5fb3ff",
            moon: "#c9d2dc",
            nea_04: "#a8896a",
            lunar_habitat: "#6cd07a",
          };
          return (
            <g key={bid} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
              <path
                d={hexPath(c.x, c.y)}
                fill={`${colorByBody[bid]}22`}
                stroke={isSel ? "#4cd1d8" : colorByBody[bid]}
                strokeWidth={isSel ? 2.5 : 1.5}
              />
              <circle cx={c.x} cy={c.y} r={5} fill={colorByBody[bid]} />
              <text
                x={c.x}
                y={c.y + 18}
                fill={isSel ? "#4cd1d8" : "#d8e2ee"}
                fontFamily="ui-monospace, Menlo, monospace"
                fontSize={10}
                textAnchor="middle"
              >
                {state.bodies[bid].name}
              </text>
              <text
                x={c.x}
                y={c.y + 30}
                fill="rgba(216,226,238,0.5)"
                fontFamily="ui-monospace, Menlo, monospace"
                fontSize={9}
                textAnchor="middle"
              >
                ({hex.q},{hex.r})
              </text>
            </g>
          );
        })}

        {/* Ship hex traversal — path from origin hex to dest hex */}
        {state.ships
          .filter((sh) => sh.route)
          .map((sh) => {
            const sp = shipKeplerPosition(state, sh);
            const ssp = pixelToHex(cx + sp.x * scale, cy + sp.y * scale);
            const fromHex = bodyHexes.get(sh.route!.fromBodyId);
            const toHex = bodyHexes.get(sh.route!.toBodyId);
            if (!fromHex || !toHex) return null;
            const f = hexToPixel(fromHex.q, fromHex.r);
            const t = hexToPixel(toHex.q, toHex.r);
            const sPos = hexToPixel(ssp.q, ssp.r);
            return (
              <g key={sh.id}>
                <line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke="rgba(76,209,216,0.4)" strokeDasharray="4 3" />
                <circle cx={sPos.x} cy={sPos.y} r={5} fill="#4cd1d8" stroke="#0a1628" strokeWidth={1.5} />
                <text x={sPos.x + 8} y={sPos.y - 4} fill="#4cd1d8" fontFamily="ui-monospace, Menlo, monospace" fontSize={10}>
                  {sh.name}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}
