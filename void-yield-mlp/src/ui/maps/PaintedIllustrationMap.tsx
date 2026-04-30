import { useEffect, useRef, useState } from "react";
import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Hand-illustrated storybook style. Soft radial-gradient blobs for each
 * body, painted halos, no grid, no orbit lines. Aesthetic reference:
 * Slay the Spire / Frostpunk hand-painted look — the "this is a place"
 * mood rather than the "this is a chart" mood.
 *
 * Background is a watercolor-ish nebula gradient. Bodies wobble slightly
 * via a sine offset so they breathe. Labels are uppercase serif.
 */
export function PaintedIllustrationMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;
  const hitRef = useRef<{ id: BodyId; x: number; y: number; r: number }[]>([]);
  const [t0] = useState(() => performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const draw = (now: number) => {
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

      // Watercolor nebula background — multiple soft blobs
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#1a1430");
      bg.addColorStop(0.5, "#0c0e22");
      bg.addColorStop(1, "#070a18");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const nebulae = [
        { x: w * 0.2, y: h * 0.3, r: 220, c: "rgba(120, 70, 200, 0.13)" },
        { x: w * 0.8, y: h * 0.6, r: 260, c: "rgba(60, 130, 200, 0.10)" },
        { x: w * 0.5, y: h * 0.85, r: 200, c: "rgba(180, 90, 130, 0.08)" },
      ];
      for (const n of nebulae) {
        const g = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.r);
        g.addColorStop(0, n.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Painted star field — points with soft halos, deterministic
      let seed = 7;
      for (let i = 0; i < 60; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        const x = (seed / 233280) * w;
        seed = (seed * 9301 + 49297) % 233280;
        const y = (seed / 233280) * h;
        seed = (seed * 9301 + 49297) % 233280;
        const r = (seed / 233280) * 1.6 + 0.6;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, "rgba(255,240,220,0.95)");
        g.addColorStop(1, "rgba(255,240,220,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      const cx = w / 2;
      const cy = h / 2;
      const bound = keplerViewBound() + 30;
      const scale = (Math.min(w, h) / 2 - 30) / bound;
      const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

      const s = stateRef.current;
      const wobble = (k: number) => Math.sin((now - t0) * 0.001 + k) * 1.5;

      // Sun — painted, multiple halos
      for (let r = 90; r >= 22; r -= 4) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, "rgba(255, 220, 130, 0.05)");
        g.addColorStop(1, "rgba(255, 220, 130, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      const sunG = ctx.createRadialGradient(cx, cy, 4, cx, cy, 18);
      sunG.addColorStop(0, "#fff5b8");
      sunG.addColorStop(1, "#e2a14a");
      ctx.fillStyle = sunG;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();

      const hits: typeof hitRef.current = [];
      const bodyGrad: Record<BodyId, [string, string]> = {
        earth: ["#7ec1ff", "#1c4a85"],
        moon: ["#f3eee3", "#7d7560"],
        nea_04: ["#cfa276", "#5d4128"],
        lunar_habitat: ["#a3e7ad", "#356a3c"],
      };
      const conf: Record<BodyId, { r: number }> = {
        earth: { r: 18 },
        moon: { r: 10 },
        nea_04: { r: 12 },
        lunar_habitat: { r: 9 },
      };
      for (let bi = 0; bi < ALL_BODIES.length; bi++) {
        const bid = ALL_BODIES[bi];
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        const wx = sp.x + wobble(bi * 1.7);
        const wy = sp.y + wobble(bi * 1.7 + 0.6);
        const isSel = selRef.current === bid;
        const r = conf[bid].r;
        // Glow halo
        const halo = ctx.createRadialGradient(wx, wy, r, wx, wy, r * 4);
        halo.addColorStop(0, `${bodyGrad[bid][0]}55`);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(wx, wy, r * 4, 0, Math.PI * 2);
        ctx.fill();
        // Body radial gradient (painted look)
        const bg2 = ctx.createRadialGradient(wx - r * 0.3, wy - r * 0.3, r * 0.1, wx, wy, r);
        bg2.addColorStop(0, bodyGrad[bid][0]);
        bg2.addColorStop(1, bodyGrad[bid][1]);
        ctx.fillStyle = bg2;
        ctx.beginPath();
        ctx.arc(wx, wy, r, 0, Math.PI * 2);
        ctx.fill();
        // Selection ring (painterly dashed)
        if (isSel) {
          ctx.strokeStyle = "#fff5b8";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.arc(wx, wy, r + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Label — small caps serif
        ctx.fillStyle = "rgba(255, 245, 220, 0.92)";
        ctx.font = "11px Georgia, 'Times New Roman', serif";
        ctx.textAlign = "center";
        ctx.fillText(s.bodies[bid].name.toUpperCase(), wx, wy + r + 18);
        ctx.textAlign = "left";
        hits.push({ id: bid, x: wx, y: wy, r: r + 8 });
      }
      hitRef.current = hits;

      // Ship — soft brush stroke
      for (const ship of s.ships) {
        if (!ship.route) continue;
        const sp = shipKeplerPosition(s, ship);
        const ssp = T(sp.x, sp.y);
        const to = keplerPosition(s, ship.route.toBodyId);
        const tsp = T(to.x, to.y);
        const dx = tsp.x - ssp.x;
        const dy = tsp.y - ssp.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / len;
        const uy = dy / len;
        // brushed line
        ctx.strokeStyle = "rgba(255, 245, 220, 0.55)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ssp.x - ux * 18, ssp.y - uy * 18);
        ctx.lineTo(ssp.x + ux * 4, ssp.y + uy * 4);
        ctx.stroke();
        // arrow head
        ctx.fillStyle = "#fff5b8";
        ctx.beginPath();
        ctx.moveTo(ssp.x + ux * 8, ssp.y + uy * 8);
        ctx.lineTo(ssp.x - ux * 2 + uy * 3, ssp.y - uy * 2 - ux * 3);
        ctx.lineTo(ssp.x - ux * 2 - uy * 3, ssp.y - uy * 2 + ux * 3);
        ctx.closePath();
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [t0]);

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
