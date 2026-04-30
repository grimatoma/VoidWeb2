import { useEffect, useRef } from "react";
import { keplerPosition, keplerViewBound } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Topographic contour map. Each body's gravity well is approximated as a
 * 1/r potential, summed across bodies. Iso-potential contour lines drawn
 * at logarithmic intervals — looks like a topographic survey of "what's
 * downhill" in the system. Ships fall along the gradient in this view.
 *
 * Different math: scalar potential field instead of position-only. A real
 * planner uses this kind of map to spot Lagrange saddle points.
 */
export function TopographicGravityMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;
  const hitRef = useRef<{ id: BodyId; x: number; y: number; r: number }[]>([]);

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
      const Tinv = (sx: number, sy: number) => ({ x: (sx - cx) / scale, y: (sy - cy) / scale });
      const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

      const s = stateRef.current;

      // Gravity sources: Sun (mass=large) + bodies
      const sources: { x: number; y: number; mass: number }[] = [{ x: 0, y: 0, mass: 50000 }];
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const massByBody: Record<BodyId, number> = {
          earth: 600,
          moon: 8,
          nea_04: 0.4,
          lunar_habitat: 0.05,
        };
        sources.push({ x: p.x, y: p.y, mass: massByBody[bid] });
      }

      const potentialAt = (x: number, y: number): number => {
        let phi = 0;
        for (const src of sources) {
          const dx = x - src.x;
          const dy = y - src.y;
          const r = Math.max(1e-3, Math.sqrt(dx * dx + dy * dy));
          phi += -src.mass / r;
        }
        return phi;
      };

      // Sample a coarse 12-px grid of potential values; render as marching-squares-ish iso-lines.
      // Simpler: just shade the field by potential level (banded heatmap).
      const cell = 6;
      // Pre-compute potential extent for color mapping
      let minPhi = Infinity;
      let maxPhi = -Infinity;
      for (let y = 0; y < h; y += cell) {
        for (let x = 0; x < w; x += cell) {
          const wp = Tinv(x, y);
          const phi = potentialAt(wp.x, wp.y);
          if (phi < minPhi) minPhi = phi;
          if (phi > maxPhi) maxPhi = phi;
        }
      }
      // Logarithmic compression for better contour spacing
      const compress = (phi: number) => Math.log10(1 + Math.max(0, phi - minPhi));
      const cMin = compress(minPhi);
      const cMax = compress(maxPhi);

      // Banded contour fill
      const bands = 18;
      for (let y = 0; y < h; y += cell) {
        for (let x = 0; x < w; x += cell) {
          const wp = Tinv(x + cell / 2, y + cell / 2);
          const phi = potentialAt(wp.x, wp.y);
          const cv = compress(phi);
          const t = (cv - cMin) / Math.max(1e-9, cMax - cMin);
          const band = Math.floor(t * bands) / bands;
          // Color from deep blue (deep well) to pale teal (high)
          const r = Math.round(20 + band * 80);
          const g = Math.round(40 + band * 160);
          const b = Math.round(80 + band * 140);
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, y, cell, cell);
        }
      }

      // Contour lines (every 2 bands)
      for (let band = 1; band < bands; band += 2) {
        const targetCv = cMin + (band / bands) * (cMax - cMin);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
        ctx.lineWidth = 0.7;
        // Walk the same grid; draw cell edge if neighbor crosses the contour.
        for (let y = 0; y < h - cell; y += cell) {
          for (let x = 0; x < w - cell; x += cell) {
            const wp = Tinv(x + cell / 2, y + cell / 2);
            const wpx = Tinv(x + cell + cell / 2, y + cell / 2);
            const wpy = Tinv(x + cell / 2, y + cell + cell / 2);
            const cv0 = compress(potentialAt(wp.x, wp.y));
            const cvX = compress(potentialAt(wpx.x, wpx.y));
            const cvY = compress(potentialAt(wpy.x, wpy.y));
            if ((cv0 < targetCv) !== (cvX < targetCv)) {
              ctx.beginPath();
              ctx.moveTo(x + cell, y);
              ctx.lineTo(x + cell, y + cell);
              ctx.stroke();
            }
            if ((cv0 < targetCv) !== (cvY < targetCv)) {
              ctx.beginPath();
              ctx.moveTo(x, y + cell);
              ctx.lineTo(x + cell, y + cell);
              ctx.stroke();
            }
          }
        }
      }

      // Sun
      ctx.fillStyle = "#ffd86b";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      const hits: typeof hitRef.current = [];
      const conf: Record<BodyId, { color: string; r: number }> = {
        earth: { color: "#5fb3ff", r: 7 },
        moon: { color: "#c9d2dc", r: 4 },
        nea_04: { color: "#a8896a", r: 5 },
        lunar_habitat: { color: "#6cd07a", r: 3 },
      };
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        const isSel = selRef.current === bid;
        if (isSel) {
          ctx.strokeStyle = "#4cd1d8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, conf[bid].r + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = conf[bid].color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, conf[bid].r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isSel ? "#4cd1d8" : "#d8e2ee";
        ctx.font = "11px ui-monospace, Menlo, monospace";
        ctx.fillText(s.bodies[bid].name, sp.x + conf[bid].r + 6, sp.y + 4);
        hits.push({ id: bid, x: sp.x, y: sp.y, r: conf[bid].r + 8 });
      }
      hitRef.current = hits;

      // Legend
      ctx.fillStyle = "rgba(216,226,238,0.7)";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.fillText("topography of −∑ M/r — wells = color saturation, contour every 2 bands", 14, h - 14);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

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
    </div>
  );
}
