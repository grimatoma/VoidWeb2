import { useEffect, useRef, useState } from "react";
import { keplerPosition, keplerViewBound } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Voronoi territory partition. Every screen pixel is colored by which body
 * (including the Sun) is its nearest neighbor. The result is a partition
 * of the system into "spheres of influence." Different math: nearest-
 * point classification at every pixel.
 *
 * As bodies orbit, the Voronoi cells flow and merge — gives the system
 * a "tectonic" feel.
 */
export function VoronoiTerritoryMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;
  const hitRef = useRef<{ id: BodyId; x: number; y: number; r: number }[]>([]);
  const [showCells, setShowCells] = useState(true);

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
      ctx.fillStyle = "#04060c";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const bound = keplerViewBound() + 30;
      const scale = (Math.min(w, h) / 2 - 30) / bound;
      const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });
      const Tinv = (sx: number, sy: number) => ({ x: (sx - cx) / scale, y: (sy - cy) / scale });

      const s = stateRef.current;

      // Voronoi seeds
      const seeds: { id: BodyId | "sun"; x: number; y: number; color: string }[] = [
        { id: "sun", x: 0, y: 0, color: "#ffd86b" },
      ];
      const colorByBody: Record<BodyId, string> = {
        earth: "#5fb3ff",
        moon: "#c9d2dc",
        nea_04: "#a8896a",
        lunar_habitat: "#6cd07a",
      };
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        seeds.push({ id: bid, x: p.x, y: p.y, color: colorByBody[bid] });
      }

      if (showCells) {
        const cell = 8;
        for (let y = 0; y < h; y += cell) {
          for (let x = 0; x < w; x += cell) {
            const wp = Tinv(x + cell / 2, y + cell / 2);
            // nearest seed (ignore z for a 2D Voronoi)
            let best: typeof seeds[number] | null = null;
            let bestDist = Infinity;
            for (const sd of seeds) {
              const d = Math.hypot(wp.x - sd.x, wp.y - sd.y);
              if (d < bestDist) {
                bestDist = d;
                best = sd;
              }
            }
            if (!best) continue;
            ctx.fillStyle = `${best.color}22`;
            ctx.fillRect(x, y, cell, cell);
          }
        }
        // Edge-detect at cell boundaries to thicken Voronoi edges
        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
        ctx.lineWidth = 0.6;
        for (let y = 0; y < h - cell; y += cell) {
          for (let x = 0; x < w - cell; x += cell) {
            const wp = Tinv(x + cell / 2, y + cell / 2);
            const wpRight = Tinv(x + cell + cell / 2, y + cell / 2);
            const wpDown = Tinv(x + cell / 2, y + cell + cell / 2);
            const nearestId = (px: number, py: number) => {
              let bid: BodyId | "sun" = "sun";
              let bd = Infinity;
              for (const sd of seeds) {
                const d = Math.hypot(px - sd.x, py - sd.y);
                if (d < bd) {
                  bd = d;
                  bid = sd.id;
                }
              }
              return bid;
            };
            const here = nearestId(wp.x, wp.y);
            const right = nearestId(wpRight.x, wpRight.y);
            const down = nearestId(wpDown.x, wpDown.y);
            if (here !== right) {
              ctx.beginPath();
              ctx.moveTo(x + cell, y);
              ctx.lineTo(x + cell, y + cell);
              ctx.stroke();
            }
            if (here !== down) {
              ctx.beginPath();
              ctx.moveTo(x, y + cell);
              ctx.lineTo(x + cell, y + cell);
              ctx.stroke();
            }
          }
        }
      }

      // Sun
      const sun = T(0, 0);
      ctx.fillStyle = "#ffd86b";
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Bodies
      const conf: Record<BodyId, number> = { earth: 7, moon: 4, nea_04: 5, lunar_habitat: 3 };
      const hits: typeof hitRef.current = [];
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        const isSel = selRef.current === bid;
        if (isSel) {
          ctx.strokeStyle = "#4cd1d8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, conf[bid] + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = colorByBody[bid];
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, conf[bid], 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isSel ? "#4cd1d8" : "#d8e2ee";
        ctx.font = "11px ui-monospace, Menlo, monospace";
        ctx.fillText(s.bodies[bid].name, sp.x + conf[bid] + 6, sp.y + 4);
        hits.push({ id: bid, x: sp.x, y: sp.y, r: conf[bid] + 8 });
      }
      hitRef.current = hits;

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [showCells]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let best: { id: BodyId; d: number } | null = null;
    for (const t of hitRef.current) {
      const d = Math.hypot(t.x - x, t.y - y);
      if (d <= t.r && (!best || d < best.d)) best = { id: t.id, d };
    }
    if (best) onSelectBody(best.id);
  };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <canvas ref={canvasRef} onClick={onClick} style={{ display: "block", width: "100%", borderRadius: 4, cursor: "pointer" }} />
      <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)" }}>
        Voronoi cells = nearest-body partition.{" "}
        <button
          onClick={() => setShowCells((v) => !v)}
          style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", color: "var(--text)", padding: "2px 8px", borderRadius: 2 }}
        >
          {showCells ? "Hide cells" : "Show cells"}
        </button>
      </div>
    </div>
  );
}
