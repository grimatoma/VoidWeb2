import { useEffect, useRef } from "react";
import { KEPLER, keplerEllipsePoints, keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Cyberpunk neon-noir aesthetic. Magenta/cyan/yellow neon palette, glow
 * shadows, slow grid scroll. Different vibe from the holo: this is
 * Blade-Runner-meets-Synthwave rather than Star Wars hologram.
 */
export function CyberpunkNeonMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
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
      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#1a002b");
      bg.addColorStop(1, "#0a0014");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const bound = keplerViewBound() + 30;
      const scale = (Math.min(w, h) / 2 - 30) / bound;
      const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

      // Scrolling perspective floor grid (synthwave!)
      const t = Date.now() * 0.0005;
      ctx.strokeStyle = "rgba(255, 60, 200, 0.18)";
      ctx.lineWidth = 1;
      // Horizon at midline
      const horizonY = h * 0.5;
      // Vertical lines vanishing at center bottom
      for (let i = -8; i <= 8; i++) {
        const x = cx + i * 60;
        ctx.beginPath();
        ctx.moveTo(x, horizonY);
        ctx.lineTo(cx + i * 1000, h + 40);
        ctx.stroke();
      }
      // Horizontal scrolling lines
      for (let i = 0; i < 14; i++) {
        const v = ((t + i * 0.07) % 1);
        const y = horizonY + Math.pow(v, 2) * (h - horizonY);
        ctx.strokeStyle = `rgba(255, 60, 200, ${0.05 + v * 0.18})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const s = stateRef.current;

      // Orbit lines — neon cyan with glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(0, 230, 255, 0.7)";
      ctx.strokeStyle = "rgba(0, 230, 255, 0.65)";
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

      // Sun — magenta core
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#ff00aa";
      ctx.fillStyle = "#ff00aa";
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd6f2";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bodies — neon-coded
      const conf: Record<BodyId, { c: string; r: number }> = {
        earth: { c: "#00e6ff", r: 8 },
        moon: { c: "#ffe44a", r: 5 },
        nea_04: { c: "#ff7a00", r: 5 },
        lunar_habitat: { c: "#7cff7c", r: 4 },
      };
      const hits: typeof hitRef.current = [];
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        const isSel = selRef.current === bid;
        ctx.shadowBlur = 18;
        ctx.shadowColor = conf[bid].c;
        ctx.fillStyle = conf[bid].c;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, conf[bid].r, 0, Math.PI * 2);
        ctx.fill();
        if (isSel) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, conf[bid].r + 7, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = conf[bid].c;
        ctx.font = "11px ui-monospace, Menlo, monospace";
        ctx.fillText(s.bodies[bid].name.toUpperCase(), sp.x + conf[bid].r + 8, sp.y + 4);
        hits.push({ id: bid, x: sp.x, y: sp.y, r: conf[bid].r + 8 });
      }
      hitRef.current = hits;

      // Ships — yellow neon chevrons
      for (const ship of s.ships) {
        if (!ship.route) continue;
        const sp = shipKeplerPosition(s, ship);
        const ssp = T(sp.x, sp.y);
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffe44a";
        ctx.fillStyle = "#ffe44a";
        ctx.beginPath();
        ctx.arc(ssp.x, ssp.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Title
      ctx.fillStyle = "rgba(255, 60, 200, 0.7)";
      ctx.font = "bold 14px 'Courier New', ui-monospace, monospace";
      ctx.fillText("// SOL_NET // 2087.04.30 //", 14, 26);

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
