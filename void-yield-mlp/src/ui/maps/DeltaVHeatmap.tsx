import { useEffect, useRef, useState } from "react";
import { keplerPosition, keplerViewBound } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Δ-v heatmap. Picks the selected body (default Earth) as the origin and
 * paints a coarse-grained color field showing transfer-cost from origin
 * to every screen pixel — distance² as a proxy for ΔV (Hohmann-ish: cost
 * grows with distance to be crossed). Bodies are overlaid as bright pings;
 * orbits are drawn as faint rings.
 *
 * The math is intentionally simplified — a proper Lambert solver is a
 * future drill. The visual point: "where in the system is cheap to reach
 * from here, and where will eat your fuel?"
 */
export function DeltaVHeatmap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;
  const hitRef = useRef<{ id: BodyId; x: number; y: number; r: number }[]>([]);

  // Heatmap is recomputed when origin changes; we store the chosen origin's id
  // and re-render the field.
  const [origin, setOrigin] = useState<BodyId>("earth");
  useEffect(() => {
    if (selectedBodyId) setOrigin(selectedBodyId);
  }, [selectedBodyId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = 480;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const bound = keplerViewBound() + 30;
      const scale = (Math.min(w, h) / 2 - 24) / bound;
      const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });
      const Tinv = (sx: number, sy: number) => ({ x: (sx - cx) / scale, y: (sy - cy) / scale });

      const s = stateRef.current;
      const op = keplerPosition(s, origin);

      // Heatmap field — coarse 16-pixel cells for speed
      const cell = 16;
      const maxCost = bound * 1.4;
      for (let y = 0; y < h; y += cell) {
        for (let x = 0; x < w; x += cell) {
          const wp = Tinv(x + cell / 2, y + cell / 2);
          const dx = wp.x - op.x;
          const dy = wp.y - op.y;
          const cost = Math.sqrt(dx * dx + dy * dy);
          const t = Math.min(1, cost / maxCost);
          // Cool→warm gradient: cyan (cheap) → green → yellow → red (expensive)
          let r: number, g: number, b: number;
          if (t < 0.33) {
            const u = t / 0.33;
            r = Math.round(76 + (108 - 76) * u);
            g = Math.round(209 + (208 - 209) * u);
            b = Math.round(216 + (122 - 216) * u);
          } else if (t < 0.66) {
            const u = (t - 0.33) / 0.33;
            r = Math.round(108 + (232 - 108) * u);
            g = Math.round(208 + (185 - 208) * u);
            b = Math.round(122 + (78 - 122) * u);
          } else {
            const u = (t - 0.66) / 0.34;
            r = Math.round(232 + (232 - 232) * u);
            g = Math.round(185 + (112 - 185) * u);
            b = Math.round(78 + (96 - 78) * u);
          }
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
          ctx.fillRect(x, y, cell, cell);
        }
      }

      // Iso-cost contour lines
      ctx.strokeStyle = "rgba(216, 226, 238, 0.3)";
      ctx.lineWidth = 1;
      for (let cost = 50; cost < maxCost; cost += 50) {
        const rs = cost * scale;
        ctx.beginPath();
        ctx.arc(T(op.x, op.y).x, T(op.x, op.y).y, rs, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(216, 226, 238, 0.55)";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        const lp = T(op.x, op.y);
        ctx.fillText(`Δv≈${cost.toFixed(0)}`, lp.x + rs - 22, lp.y - 2);
      }

      // Sun
      ctx.fillStyle = "#ffd86b";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Origin marker
      const opS = T(op.x, op.y);
      ctx.strokeStyle = "#4cd1d8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(opS.x, opS.y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#4cd1d8";
      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.fillText(`Origin: ${s.bodies[origin].name}`, opS.x + 18, opS.y - 6);

      // Bodies + cost-to-reach annotations
      const hits: typeof hitRef.current = [];
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        const d = Math.hypot(p.x - op.x, p.y - op.y, p.z - op.z);
        const isOrigin = bid === origin;
        const colorByBody: Record<BodyId, string> = {
          earth: "#5fb3ff",
          moon: "#c9d2dc",
          nea_04: "#a8896a",
          lunar_habitat: "#6cd07a",
        };
        ctx.fillStyle = colorByBody[bid];
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, isOrigin ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isOrigin ? "#4cd1d8" : "#d8e2ee";
        ctx.font = "11px ui-monospace, Menlo, monospace";
        ctx.fillText(s.bodies[bid].name, sp.x + 10, sp.y + 4);
        if (!isOrigin) {
          ctx.fillStyle = "rgba(216, 226, 238, 0.65)";
          ctx.font = "9px ui-monospace, Menlo, monospace";
          ctx.fillText(`Δv≈${d.toFixed(1)}`, sp.x + 10, sp.y + 16);
        }
        hits.push({ id: bid, x: sp.x, y: sp.y, r: 12 });
      }
      hitRef.current = hits;

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [origin]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let best: { id: BodyId; d: number } | null = null;
    for (const t of hitRef.current) {
      const d = Math.hypot(t.x - x, t.y - y);
      if (d <= t.r && (!best || d < best.d)) best = { id: t.id, d };
    }
    if (best) {
      onSelectBody(best.id);
      setOrigin(best.id);
    }
  };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <canvas ref={canvasRef} onClick={onClick} style={{ display: "block", width: "100%", borderRadius: 4 }} />
      <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)" }}>
        Click any body to set it as the Δv origin. Cool colors = cheaper transfer; hot colors = far reach.
      </div>
    </div>
  );
}
