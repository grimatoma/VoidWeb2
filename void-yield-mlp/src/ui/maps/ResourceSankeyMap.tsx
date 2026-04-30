import { useEffect, useRef, useState } from "react";
import { keplerPosition, keplerViewBound } from "../../game/kepler";
import { RESOURCES } from "../../game/defs";
import type { ResourceId } from "../../game/defs";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Resource flow Sankey-style overlay. The geometry is the spatial map
 * (bodies at Kepler positions), but each route gets a thick semi-transparent
 * ribbon whose width is proportional to cargo volume. Color matches the
 * resource being shipped. The "where" and "what's flowing" answer the
 * same question.
 *
 * Storage at each body shown as a small stacked bar of resource sticks.
 */
export function ResourceSankeyMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
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

  const cx = w / 2;
  const cy = h / 2;
  const bound = keplerViewBound() + 30;
  const scale = (Math.min(w, h) / 2 - 40) / bound;
  const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

  const RESOURCE_COLOR: Partial<Record<ResourceId, string>> = {
    iron_ore: "#a17c4f",
    refined_metal: "#9bb8d6",
    water_ice: "#6fc6e8",
    hydrogen_fuel: "#dfa6e8",
    oxygen: "#cfe8f0",
    food_pack: "#d6c66b",
    construction_materials: "#c9c9c9",
    aluminum: "#bbbbbb",
    lunar_regolith: "#a39584",
    habitat_module: "#94c19f",
  };

  // Body screen positions
  const bodyScreen = (bid: BodyId) => {
    const p = keplerPosition(state, bid);
    return T(p.x, p.y);
  };

  // Storage stacks for each body
  const storageStacks = ALL_BODIES.filter(
    (b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat),
  ).map((bid) => {
    const wh = state.bodies[bid].warehouse;
    const entries: { rid: ResourceId; qty: number }[] = (Object.entries(wh) as [ResourceId, number][])
      .filter(([, q]) => (q ?? 0) > 0.001)
      .map(([rid, q]) => ({ rid, qty: q ?? 0 }))
      .sort((a, b) => b.qty - a.qty);
    return { bid, entries };
  });

  // Ship route ribbons
  const ribbons = state.ships
    .filter((sh) => sh.route && sh.route.cargoResource && sh.route.cargoQty > 0)
    .map((sh) => {
      const r = sh.route!;
      const from = bodyScreen(r.fromBodyId);
      const to = bodyScreen(r.toBodyId);
      const color = RESOURCE_COLOR[r.cargoResource!] ?? "#4cd1d8";
      const width = Math.max(3, Math.min(20, r.cargoQty * 0.6));
      // Curve the ribbon slightly via a midpoint offset
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2 - 30;
      return { id: sh.id, from, to, mx, my, color, width, label: `${r.cargoQty} ${RESOURCES[r.cargoResource!].name}` };
    });

  return (
    <div ref={wrapRef} style={{ width: "100%", background: "#06090f", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Sun */}
        <circle cx={cx} cy={cy} r={5} fill="#ffd86b" />
        <circle cx={cx} cy={cy} r={14} fill="none" stroke="rgba(232, 185, 78, 0.4)" strokeWidth={0.7} />
        {/* Resource ribbons */}
        {ribbons.map((rb) => (
          <g key={rb.id}>
            <path
              d={`M ${rb.from.x} ${rb.from.y} Q ${rb.mx} ${rb.my} ${rb.to.x} ${rb.to.y}`}
              stroke={rb.color}
              strokeWidth={rb.width}
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
            />
            <text x={rb.mx} y={rb.my - 6} fill={rb.color} fontFamily="ui-monospace, Menlo, monospace" fontSize={10} textAnchor="middle">
              {rb.label}
            </text>
          </g>
        ))}
        {/* Bodies + storage stacks */}
        {storageStacks.map((s) => {
          const sp = bodyScreen(s.bid);
          const isSel = selectedBodyId === s.bid;
          const colorByBody: Record<BodyId, string> = {
            earth: "#5fb3ff",
            moon: "#c9d2dc",
            nea_04: "#a8896a",
            lunar_habitat: "#6cd07a",
          };
          // Stack: vertical bar to the right of the body
          const stackX = sp.x + 14;
          const stackY = sp.y - 30;
          const segH = 7;
          return (
            <g key={s.bid} onClick={() => onSelectBody(s.bid)} style={{ cursor: "pointer" }}>
              {isSel && <circle cx={sp.x} cy={sp.y} r={11} fill="none" stroke="#4cd1d8" strokeWidth={2} />}
              <circle cx={sp.x} cy={sp.y} r={6} fill={colorByBody[s.bid]} />
              <text
                x={sp.x + 14}
                y={sp.y + 22}
                fill={isSel ? "#4cd1d8" : "#d8e2ee"}
                fontFamily="ui-monospace, Menlo, monospace"
                fontSize={11}
              >
                {state.bodies[s.bid].name}
              </text>
              {/* Storage stack */}
              {s.entries.slice(0, 6).map((e, i) => (
                <g key={e.rid}>
                  <rect
                    x={stackX}
                    y={stackY + i * (segH + 2)}
                    width={Math.min(70, Math.max(8, e.qty * 0.4))}
                    height={segH}
                    fill={RESOURCE_COLOR[e.rid] ?? "#4cd1d8"}
                    opacity={0.8}
                  />
                  <text
                    x={stackX + 4}
                    y={stackY + i * (segH + 2) + 6}
                    fill="#04060c"
                    fontFamily="ui-monospace, Menlo, monospace"
                    fontSize={8}
                    fontWeight={700}
                  >
                    {e.qty.toFixed(0)}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
        {/* Legend */}
        <g transform={`translate(${w - 220} 20)`}>
          <text fill="rgba(216,226,238,0.7)" fontFamily="ui-monospace, Menlo, monospace" fontSize={11}>
            Resource flow (ribbon width = qty)
          </text>
          {(Object.keys(RESOURCE_COLOR) as ResourceId[]).slice(0, 5).map((rid, i) => (
            <g key={rid} transform={`translate(0 ${16 + i * 14})`}>
              <rect width={20} height={4} fill={RESOURCE_COLOR[rid]} />
              <text x={26} y={5} fill="rgba(216,226,238,0.65)" fontFamily="ui-monospace, Menlo, monospace" fontSize={10}>
                {RESOURCES[rid].name}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
