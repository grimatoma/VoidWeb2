import { useEffect, useRef } from "react";
import {
  KEPLER,
  keplerEllipsePoints,
  keplerPosition,
  keplerViewBound,
  shipKeplerPosition,
} from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Sci-fi holographic projector aesthetic. CRT scanlines, phosphor flicker,
 * vector-line wireframe bodies (no fills), glowing cyan everything, slight
 * jitter on the scan rasters. Pure VFX vibe — referencing Star Wars
 * Death Star plans / Mass Effect Galaxy Map.
 */
export function HoloProjectorMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
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

      // Holo base — dark blue, scanlines on top
      ctx.fillStyle = "#000a16";
      ctx.fillRect(0, 0, w, h);
      // Vignette
      const vg = ctx.createRadialGradient(w / 2, h / 2, h / 2, w / 2, h / 2, w);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const bound = keplerViewBound() + 30;
      const scale = (Math.min(w, h) / 2 - 30) / bound;
      const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

      const s = stateRef.current;

      // Phosphor flicker (pseudo-random per-frame jitter)
      const jitter = () => Math.random() * 0.6 - 0.3;
      ctx.translate(jitter(), jitter());

      // Holo grid — cyan polar lines
      ctx.strokeStyle = "rgba(76, 209, 216, 0.18)";
      ctx.lineWidth = 1;
      for (let r = 30; r <= bound; r += 30) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let θ = 0; θ < 360; θ += 30) {
        const rad = (θ * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * bound * scale, cy + Math.sin(rad) * bound * scale);
        ctx.stroke();
      }

      // Orbits as bright cyan paths with glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(76, 209, 216, 0.9)";
      ctx.strokeStyle = "rgba(76, 209, 216, 0.55)";
      ctx.lineWidth = 1.4;
      for (const bid of Object.keys(KEPLER) as BodyId[]) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const el = KEPLER[bid];
        const parent = el.parent === "sun" ? { x: 0, y: 0, z: 0 } : keplerPosition(s, el.parent);
        const pts = keplerEllipsePoints(el, 96);
        ctx.beginPath();
        for (let k = 0; k < pts.length; k++) {
          const sp = T(parent.x + pts[k].x, parent.y + pts[k].y);
          if (k === 0) ctx.moveTo(sp.x, sp.y);
          else ctx.lineTo(sp.x, sp.y);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Sun — wireframe star
      ctx.strokeStyle = "rgba(76, 209, 216, 0.95)";
      ctx.lineWidth = 1.5;
      const drawStar = (sx: number, sy: number, R: number) => {
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const rr = i % 2 === 0 ? R : R * 0.5;
          const x = sx + Math.cos(a) * rr;
          const y = sy + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      };
      drawStar(cx, cy, 14);

      // Bodies — wireframe globes (vertical and horizontal hoops)
      const hits: typeof hitRef.current = [];
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        const isSel = selRef.current === bid;
        const r = bid === "earth" ? 11 : bid === "moon" ? 7 : bid === "nea_04" ? 8 : 6;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(76, 209, 216, 0.9)";
        ctx.strokeStyle = isSel ? "#a8f0f4" : "rgba(76, 209, 216, 0.95)";
        ctx.lineWidth = 1.3;
        // Outer
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
        ctx.stroke();
        // Hoops
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, r, r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, r * 0.4, r, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label tag
        ctx.fillStyle = isSel ? "#a8f0f4" : "rgba(76, 209, 216, 0.85)";
        ctx.font = "11px ui-monospace, Menlo, monospace";
        ctx.fillText(`◇ ${s.bodies[bid].name}`, sp.x + r + 8, sp.y + 4);
        hits.push({ id: bid, x: sp.x, y: sp.y, r: r + 6 });
      }
      hitRef.current = hits;

      // Ships
      for (const ship of s.ships) {
        if (!ship.route) continue;
        const sp = shipKeplerPosition(s, ship);
        const ssp = T(sp.x, sp.y);
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(76, 209, 216, 0.9)";
        ctx.strokeStyle = "rgba(168, 240, 244, 0.95)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(ssp.x - 4, ssp.y - 4);
        ctx.lineTo(ssp.x + 4, ssp.y + 4);
        ctx.moveTo(ssp.x - 4, ssp.y + 4);
        ctx.lineTo(ssp.x + 4, ssp.y - 4);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Scanlines (every 2px) over the whole frame
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      for (let y = 0; y < h; y += 2) {
        ctx.fillRect(0, y, w, 1);
      }
      // Random scan glitch every few frames
      if (Math.random() < 0.05) {
        const gy = Math.random() * h;
        ctx.fillStyle = "rgba(76, 209, 216, 0.18)";
        ctx.fillRect(0, gy, w, 1.5);
      }

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
