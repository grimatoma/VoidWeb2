import { useEffect, useRef } from "react";
import { keplerPosition, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Earth-centered polar radar. The math difference: instead of plotting
 * inertial XY, every body and ship is shown as bearing+range relative to
 * Earth. Concentric range rings, rotating sweep, color-by-range fade.
 *
 * Useful gameplay angle: "what's near home?" — the player sees instantly
 * how far each body is from Earth and how much further the lunar habitat
 * is from where their ships start.
 */
export function RadarPolarMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
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
    const draw = (t: number) => {
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

      // Background
      ctx.fillStyle = "#04140a";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) / 2 - 30;
      const s = stateRef.current;
      const earthPos = keplerPosition(s, "earth");

      // Range rings (every 30 units)
      ctx.strokeStyle = "rgba(108, 208, 122, 0.22)";
      ctx.lineWidth = 1;
      const maxRange = 320; // ~ NEA-04 apoapsis-to-Earth distance
      const ringInterval = 50;
      for (let r = ringInterval; r <= maxRange; r += ringInterval) {
        const rs = (r / maxRange) * radius;
        ctx.beginPath();
        ctx.arc(cx, cy, rs, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(108, 208, 122, 0.4)";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillText(`${r}`, cx + rs + 2, cy + 10);
      }
      // Bearing spokes every 30°
      ctx.strokeStyle = "rgba(108, 208, 122, 0.18)";
      for (let θ = 0; θ < 360; θ += 30) {
        const rad = (θ * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * radius, cy + Math.sin(rad) * radius);
        ctx.stroke();
        const lx = cx + Math.cos(rad) * (radius + 12);
        const ly = cy + Math.sin(rad) * (radius + 12);
        ctx.fillStyle = "rgba(108, 208, 122, 0.6)";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillText(`${θ}°`, lx - 8, ly + 3);
      }

      // Earth at center
      ctx.fillStyle = "#5fb3ff";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(95, 179, 255, 0.7)";
      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.fillText("EARTH (origin)", cx + 10, cy + 4);

      // Sweep
      const sweepAngle = ((t / 1000) * 0.6) % (Math.PI * 2);
      const sweepGrad = ctx.createConicGradient(sweepAngle - Math.PI / 6, cx, cy);
      sweepGrad.addColorStop(0, "rgba(108, 208, 122, 0.0)");
      sweepGrad.addColorStop(0.05, "rgba(108, 208, 122, 0.5)");
      sweepGrad.addColorStop(0.12, "rgba(108, 208, 122, 0.0)");
      sweepGrad.addColorStop(1, "rgba(108, 208, 122, 0.0)");
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Bodies as bearing/range pings
      const colorByBody: Record<BodyId, string> = {
        earth: "#5fb3ff",
        moon: "#c9d2dc",
        nea_04: "#a8896a",
        lunar_habitat: "#6cd07a",
      };
      const hits: typeof hitRef.current = [];
      for (const bid of ALL_BODIES) {
        if (bid === "earth") continue;
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const dx = p.x - earthPos.x;
        const dy = p.y - earthPos.y;
        const r = Math.hypot(dx, dy);
        const θ = Math.atan2(dy, dx);
        const rs = Math.min((r / maxRange) * radius, radius - 4);
        const sx = cx + Math.cos(θ) * rs;
        const sy = cy + Math.sin(θ) * rs;
        const isSel = selRef.current === bid;
        const hasAlert = s.alerts.some((a) => !a.resolved && a.bodyId === bid);
        // Ping circle
        if (hasAlert) {
          ctx.strokeStyle = "rgba(232, 185, 78, 0.7)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sx, sy, 9, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (isSel) {
          ctx.strokeStyle = "#4cd1d8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, 12, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = colorByBody[bid];
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isSel ? "#4cd1d8" : "#d8e2ee";
        ctx.font = "11px ui-monospace, Menlo, monospace";
        ctx.fillText(s.bodies[bid].name, sx + 8, sy + 4);
        ctx.fillStyle = "rgba(216,226,238,0.5)";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillText(`R=${r.toFixed(1)} θ=${((θ * 180) / Math.PI).toFixed(0)}°`, sx + 8, sy + 16);
        hits.push({ id: bid, x: sx, y: sy, r: 14 });
      }
      hitRef.current = hits;

      // Ship pings
      for (const ship of s.ships) {
        if (!ship.route) continue;
        const sp = shipKeplerPosition(s, ship);
        const dx = sp.x - earthPos.x;
        const dy = sp.y - earthPos.y;
        const r = Math.hypot(dx, dy);
        const θ = Math.atan2(dy, dx);
        const rs = Math.min((r / maxRange) * radius, radius - 4);
        const sx = cx + Math.cos(θ) * rs;
        const sy = cy + Math.sin(θ) * rs;
        ctx.fillStyle = "#4cd1d8";
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#4cd1d8";
        ctx.font = "10px ui-monospace, Menlo, monospace";
        ctx.fillText(ship.name, sx + 6, sy - 6);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
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
      <canvas ref={canvasRef} onClick={onClick} style={{ display: "block", width: "100%", borderRadius: 4 }} />
    </div>
  );
}
