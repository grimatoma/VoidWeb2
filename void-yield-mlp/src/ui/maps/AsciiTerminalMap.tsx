import { useEffect, useRef, useState } from "react";
import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const BODY_GLYPH: Record<BodyId, string> = {
  earth: "@",
  moon: "o",
  nea_04: "*",
  lunar_habitat: "#",
};
const BODY_COLOR: Record<BodyId, string> = {
  earth: "#5fb3ff",
  moon: "#c9d2dc",
  nea_04: "#a8896a",
  lunar_habitat: "#6cd07a",
};

/**
 * Pure monospace text-mode top-down. The grid is character-cells; each
 * Kepler position is rounded to the nearest cell. Sun is `*` painted in
 * gold. Ships render as `>` or `<` depending on their velocity sign.
 *
 * No paths — this view is the current frame, sampled and printed. Honest,
 * terse, and weirdly readable for fleet status at a glance.
 */
export function AsciiTerminalMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 250);
    return () => clearInterval(id);
  }, []);

  const cols = 80;
  const rows = 30;
  const bound = keplerViewBound() + 30;
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  // x scaled to columns, y to rows. Aspect of monospace cell ≈ 0.55:1, compensate.
  const sx = (cx - 2) / bound;
  const sy = (cy - 2) / bound;

  // Build cell grid: each cell is { ch, color }
  const grid: { ch: string; color: string; bodyId?: BodyId }[][] = [];
  for (let r = 0; r < rows; r++) {
    grid.push([]);
    for (let c = 0; c < cols; c++) grid[r].push({ ch: " ", color: "rgba(216,226,238,0.18)" });
  }
  // Border + frame
  for (let c = 0; c < cols; c++) {
    grid[0][c].ch = "─";
    grid[rows - 1][c].ch = "─";
    grid[0][c].color = "rgba(76, 209, 216, 0.45)";
    grid[rows - 1][c].color = "rgba(76, 209, 216, 0.45)";
  }
  for (let r = 0; r < rows; r++) {
    grid[r][0].ch = "│";
    grid[r][cols - 1].ch = "│";
    grid[r][0].color = "rgba(76, 209, 216, 0.45)";
    grid[r][cols - 1].color = "rgba(76, 209, 216, 0.45)";
  }
  grid[0][0].ch = "┌";
  grid[0][cols - 1].ch = "┐";
  grid[rows - 1][0].ch = "└";
  grid[rows - 1][cols - 1].ch = "┘";
  // Crosshair through center
  for (let c = 1; c < cols - 1; c++) grid[cy][c].ch = grid[cy][c].ch === " " ? "·" : grid[cy][c].ch;
  for (let r = 1; r < rows - 1; r++) grid[r][cx].ch = grid[r][cx].ch === " " ? "·" : grid[r][cx].ch;
  // Sun
  grid[cy][cx] = { ch: "✦", color: "#ffd86b" };

  const place = (vx: number, vy: number, ch: string, color: string, bid?: BodyId) => {
    const c = Math.round(cx + vx * sx);
    const r = Math.round(cy + vy * sy);
    if (c <= 0 || c >= cols - 1 || r <= 0 || r >= rows - 1) return;
    grid[r][c] = { ch, color, bodyId: bid };
  };

  const placedBodies: { row: number; col: number; bid: BodyId; name: string }[] = [];
  for (const bid of Object.keys(BODY_GLYPH) as BodyId[]) {
    if (bid === "lunar_habitat" && !state.populations.lunar_habitat) continue;
    const p = keplerPosition(state, bid);
    place(p.x, p.y, BODY_GLYPH[bid], BODY_COLOR[bid], bid);
    placedBodies.push({
      row: Math.round(cy + p.y * sy),
      col: Math.round(cx + p.x * sx),
      bid,
      name: state.bodies[bid].name,
    });
  }
  // Ships as ▶ ◀ ▲ ▼ depending on dominant velocity component
  for (const ship of state.ships) {
    if (!ship.route) continue;
    const sp = shipKeplerPosition(state, ship);
    const to = keplerPosition(state, ship.route.toBodyId);
    const dx = to.x - sp.x;
    const dy = to.y - sp.y;
    let glyph = "▶";
    if (Math.abs(dy) > Math.abs(dx)) glyph = dy > 0 ? "▼" : "▲";
    else glyph = dx > 0 ? "▶" : "◀";
    place(sp.x, sp.y, glyph, "#4cd1d8");
  }

  // Highlight selected body cell
  if (selectedBodyId) {
    const found = placedBodies.find((b) => b.bid === selectedBodyId);
    if (found) {
      const cell = grid[found.row][found.col];
      grid[found.row][found.col] = { ...cell, color: "#4cd1d8" };
    }
  }

  // Render rows as spans
  const lines: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const cells: React.ReactNode[] = [];
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      cells.push(
        cell.bodyId ? (
          <span
            key={c}
            style={{ color: cell.color, cursor: "pointer", fontWeight: 700 }}
            onClick={() => onSelectBody(cell.bodyId!)}
          >
            {cell.ch}
          </span>
        ) : (
          <span key={c} style={{ color: cell.color }}>
            {cell.ch}
          </span>
        ),
      );
    }
    lines.push(
      <div key={r} style={{ whiteSpace: "pre", lineHeight: 1.05 }}>
        {cells}
      </div>,
    );
  }

  // Side legend
  const legend = (
    <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.7 }}>
      <div>
        <span style={{ color: "#ffd86b" }}>✦</span> Sun
      </div>
      {(Object.keys(BODY_GLYPH) as BodyId[])
        .filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat))
        .map((b) => {
          const p = keplerPosition(state, b);
          const r = Math.hypot(p.x, p.y, p.z);
          return (
            <div key={b}>
              <span style={{ color: BODY_COLOR[b], fontWeight: 700 }}>{BODY_GLYPH[b]}</span>{" "}
              {state.bodies[b].name}{" "}
              <span style={{ color: "var(--text-muted)" }}>R={r.toFixed(1)}</span>
            </div>
          );
        })}
      {state.ships
        .filter((s) => s.route)
        .map((s) => {
          const r = s.route!;
          const pct = Math.round(((r.travelSecTotal - r.travelSecRemaining) / Math.max(1, r.travelSecTotal)) * 100);
          return (
            <div key={s.id}>
              <span style={{ color: "#4cd1d8" }}>▶</span> {s.name} {state.bodies[r.fromBodyId].name}→
              {state.bodies[r.toBodyId].name} <span style={{ color: "var(--text-muted)" }}>{pct}%</span>
            </div>
          );
        })}
    </div>
  );

  return (
    <div ref={wrapRef} style={{ background: "#06080d", padding: 12, borderRadius: 4 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)" }}>{lines}</div>
      {legend}
    </div>
  );
}
