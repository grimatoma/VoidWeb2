import { useEffect, useRef } from "react";
import {
  ORBITS,
  bodyPosition,
  orbitRings,
  shipPosition,
  viewBoundRadius,
} from "../game/solarmap";
import type { GameState } from "../game/state";
import type { BodyId } from "../game/state";

/**
 * Realistic-feeling solar map: Sun at center, Earth + NEA-04 on heliocentric
 * orbits, Moon orbiting Earth, Lunar Habitat orbiting the Moon. Ships render as
 * cyan dots interpolated along their route, with a trail to show direction.
 *
 * Drives its own rAF loop so orbital motion is smooth between sim ticks. The
 * sim is the source of truth for time (`state.gameTimeSec`); rAF only samples
 * a sub-second value off it for the *visual* angle of orbits, so the position
 * the player sees matches the data the rest of the UI reads.
 */
export function SolarCanvas({
  state,
  selectedBodyId,
  onSelectBody,
  height = 460,
}: {
  state: GameState;
  selectedBodyId: BodyId | null;
  onSelectBody: (id: BodyId) => void;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selectedRef = useRef(selectedBodyId);
  stateRef.current = state;
  selectedRef.current = selectedBodyId;

  // Track click hit-targets in canvas coords for body selection.
  const hitTargetsRef = useRef<{ bodyId: BodyId; x: number; y: number; r: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let cancelled = false;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = height;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Background gradient (deep space)
      const grad = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, Math.max(w, h));
      grad.addColorStop(0, "#0c1a2c");
      grad.addColorStop(1, "#06080d");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // World→screen scale: fit the largest orbit + padding.
      const margin = 36;
      const worldR = viewBoundRadius() + 12;
      const scale = Math.min(w, h) / 2 / (worldR + margin / 2);
      const cx = w / 2;
      const cy = h / 2;
      const toScreen = (vx: number, vy: number) => ({
        x: cx + vx * scale,
        y: cy + vy * scale,
      });

      // Star field (deterministic — based on canvas size so it doesn't twinkle)
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      let starSeed = 1;
      for (let i = 0; i < 80; i++) {
        starSeed = (starSeed * 9301 + 49297) % 233280;
        const sx = (starSeed / 233280) * w;
        starSeed = (starSeed * 9301 + 49297) % 233280;
        const sy = (starSeed / 233280) * h;
        starSeed = (starSeed * 9301 + 49297) % 233280;
        const sr = (starSeed / 233280) * 1.2 + 0.2;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      const s = stateRef.current;
      const sel = selectedRef.current;

      // Orbit rings — drawn relative to each body's parent's *current* position.
      ctx.strokeStyle = "rgba(76, 209, 216, 0.13)";
      ctx.lineWidth = 1;
      for (const ring of orbitRings()) {
        const center = ring.center === "sun" ? { x: 0, y: 0 } : bodyPosition(s, ring.center);
        const sc = toScreen(center.x, center.y);
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, ring.radius * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sun
      const sunGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
      sunGrad.addColorStop(0, "#ffe39a");
      sunGrad.addColorStop(0.45, "#e8b94e");
      sunGrad.addColorStop(1, "rgba(232, 185, 78, 0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd86b";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Bodies
      const hitTargets: typeof hitTargetsRef.current = [];
      for (const bid of Object.keys(ORBITS) as BodyId[]) {
        // skip habitat if not yet deployed
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = bodyPosition(s, bid);
        const sp = toScreen(p.x, p.y);
        const isSelected = sel === bid;
        const body = s.bodies[bid];
        let bodyR = 7;
        let fill = "#74a3ff";
        if (bid === "earth") {
          fill = "#5fb3ff";
          bodyR = 8;
        } else if (bid === "moon") {
          fill = "#c9d2dc";
          bodyR = 4;
        } else if (bid === "nea_04") {
          fill = "#a8896a";
          bodyR = 4;
        } else if (bid === "lunar_habitat") {
          fill = "#6cd07a";
          bodyR = 3;
        }

        const hasAlert = s.alerts.some((a) => !a.resolved && a.bodyId === bid);
        if (hasAlert) {
          ctx.strokeStyle = "rgba(232, 185, 78, 0.8)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, bodyR + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (isSelected) {
          ctx.strokeStyle = "#4cd1d8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, bodyR + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, bodyR, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = isSelected ? "#4cd1d8" : "#d8e2ee";
        ctx.font = "11px ui-monospace, Menlo, Consolas, monospace";
        ctx.fillText(body.name, sp.x + bodyR + 6, sp.y + 4);

        hitTargets.push({ bodyId: bid, x: sp.x, y: sp.y, r: bodyR + 8 });
      }
      hitTargetsRef.current = hitTargets;

      // Ship route arcs + animated dots
      for (const ship of s.ships) {
        if (!ship.route) continue;
        const from = bodyPosition(s, ship.route.fromBodyId);
        const to = bodyPosition(s, ship.route.toBodyId);
        const fs = toScreen(from.x, from.y);
        const ts = toScreen(to.x, to.y);
        // Route arc — dashed, pointing direction of travel
        ctx.strokeStyle = "rgba(76, 209, 216, 0.55)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fs.x, fs.y);
        ctx.lineTo(ts.x, ts.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ship dot
        const sp = shipPosition(s, ship);
        const ssp = toScreen(sp.x, sp.y);
        // Trail: short stub behind the ship
        const dx = ts.x - fs.x;
        const dy = ts.y - fs.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / len;
        const uy = dy / len;
        ctx.strokeStyle = "rgba(76, 209, 216, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ssp.x - ux * 14, ssp.y - uy * 14);
        ctx.lineTo(ssp.x, ssp.y);
        ctx.stroke();

        // Ship glyph
        ctx.save();
        ctx.translate(ssp.x, ssp.y);
        ctx.rotate(Math.atan2(uy, ux));
        ctx.fillStyle = "#4cd1d8";
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-3, 2.5);
        ctx.lineTo(-3, -2.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Ship label
        ctx.fillStyle = "rgba(216, 226, 238, 0.85)";
        ctx.font = "10px ui-monospace, Menlo, Consolas, monospace";
        ctx.fillText(ship.name, ssp.x + 6, ssp.y - 6);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      void cancelled;
    };
  }, [height]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let best: { bodyId: BodyId; d: number } | null = null;
    for (const t of hitTargetsRef.current) {
      const d = Math.hypot(t.x - x, t.y - y);
      if (d <= t.r && (!best || d < best.d)) best = { bodyId: t.bodyId, d };
    }
    if (best) onSelectBody(best.bodyId);
  };

  return (
    <div ref={containerRef} className="solar-canvas-wrap">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ display: "block", width: "100%", borderRadius: 4 }}
      />
    </div>
  );
}
