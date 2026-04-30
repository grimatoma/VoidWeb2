import { RESOURCES } from "../../game/defs";
import type { ResourceId } from "../../game/defs";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];
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

interface TileBox {
  x: number;
  y: number;
  w: number;
  h: number;
  resource: ResourceId;
  qty: number;
}

/** Squarified treemap layout (Bruls et al. simplified). */
function squarify(items: { resource: ResourceId; qty: number }[], rect: { x: number; y: number; w: number; h: number }): TileBox[] {
  const total = items.reduce((a, b) => a + b.qty, 0);
  if (total === 0 || items.length === 0) return [];
  const out: TileBox[] = [];
  let cur = { ...rect };
  let remaining = items.map((it) => ({ ...it, weight: (it.qty / total) * (rect.w * rect.h) }));
  while (remaining.length > 0) {
    const horizontal = cur.w >= cur.h;
    // Take items greedily until aspect-ratio worsens; for simplicity take all in one strip.
    // Actually: simpler — slice the rect proportionally.
    const total2 = remaining.reduce((a, b) => a + b.weight, 0);
    if (horizontal) {
      const stripH = cur.h;
      let xCursor = cur.x;
      // Just use a single strip for everything in 'remaining' in 'horizontal' orientation
      // alternating direction. For 4-10 items this is fine.
      for (const r of remaining) {
        const strW = (r.weight / total2) * cur.w;
        out.push({ x: xCursor, y: cur.y, w: strW, h: stripH, resource: r.resource, qty: r.qty });
        xCursor += strW;
      }
    } else {
      const stripW = cur.w;
      let yCursor = cur.y;
      for (const r of remaining) {
        const strH = (r.weight / total2) * cur.h;
        out.push({ x: cur.x, y: yCursor, w: stripW, h: strH, resource: r.resource, qty: r.qty });
        yCursor += strH;
      }
    }
    remaining = [];
  }
  return out;
}

/**
 * Treemap of every body's warehouse contents. Each body gets a panel; within
 * the panel, each resource is a tile sized by quantity. No spatial map at all
 * — answers "where is my stockpile?" at a glance, totally orthogonal to
 * Kepler position.
 */
export function TreemapWarehouseMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const w = 800;
  const h = 480;
  const visible = ALL_BODIES.filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat));
  const cols = visible.length;
  const cellW = (w - 20 - (cols - 1) * 8) / cols;
  const cellH = h - 60;

  return (
    <div style={{ width: "100%", background: "#06090f", borderRadius: 4 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <text x={20} y={26} fill="rgba(216,226,238,0.75)" fontFamily="ui-monospace, Menlo, monospace" fontSize={12}>
          Warehouse treemap — tile area = quantity, color = resource
        </text>
        {visible.map((bid, i) => {
          const x0 = 20 + i * (cellW + 8);
          const y0 = 50;
          const wh = state.bodies[bid].warehouse;
          const items = (Object.entries(wh) as [ResourceId, number][])
            .filter(([, q]) => (q ?? 0) > 0.001)
            .map(([rid, q]) => ({ resource: rid, qty: q ?? 0 }))
            .sort((a, b) => b.qty - a.qty);
          const tiles = squarify(items, { x: x0, y: y0 + 24, w: cellW, h: cellH - 24 });
          const isSel = selectedBodyId === bid;
          return (
            <g key={bid} onClick={() => onSelectBody(bid)} style={{ cursor: "pointer" }}>
              <rect x={x0} y={y0} width={cellW} height={cellH} fill="#0c1322" stroke={isSel ? "#4cd1d8" : "var(--line)"} strokeWidth={isSel ? 2 : 1} rx={3} />
              <text
                x={x0 + 8}
                y={y0 + 16}
                fill={isSel ? "#4cd1d8" : "#d8e2ee"}
                fontFamily="ui-monospace, Menlo, monospace"
                fontWeight={700}
                fontSize={12}
              >
                {state.bodies[bid].name}
              </text>
              {tiles.length === 0 && (
                <text
                  x={x0 + cellW / 2}
                  y={y0 + cellH / 2}
                  fill="rgba(216, 226, 238, 0.4)"
                  fontFamily="ui-monospace, Menlo, monospace"
                  fontSize={11}
                  textAnchor="middle"
                >
                  empty
                </text>
              )}
              {tiles.map((t, j) => {
                const c = RESOURCE_COLOR[t.resource] ?? "#4cd1d8";
                return (
                  <g key={j}>
                    <rect x={t.x} y={t.y} width={t.w - 1} height={t.h - 1} fill={c} opacity={0.85} />
                    {t.w > 50 && t.h > 18 && (
                      <text
                        x={t.x + 6}
                        y={t.y + 14}
                        fill="#0c1322"
                        fontFamily="ui-monospace, Menlo, monospace"
                        fontWeight={700}
                        fontSize={10}
                      >
                        {RESOURCES[t.resource].name}
                      </text>
                    )}
                    {t.w > 30 && t.h > 30 && (
                      <text
                        x={t.x + 6}
                        y={t.y + 28}
                        fill="#0c1322"
                        fontFamily="ui-monospace, Menlo, monospace"
                        fontSize={10}
                      >
                        {t.qty.toFixed(0)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
