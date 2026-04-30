import { useEffect, useRef } from "react";
import {
  KEPLER,
  apsides,
  keplerEllipsePoints,
  keplerPosition,
  keplerViewBound,
  predictBodyTrack,
  shipKeplerPosition,
  shipTrajectoryEndpoints,
} from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

/**
 * Scientifically-accurate Kepler 2D top-down (ecliptic plane projection).
 * Every orbit is a true ellipse drawn from solveKepler-iterated samples.
 * Periapsis marker, focus marker (Sun for heliocentric), and a ~30s
 * forward trajectory trail for each body. Inclination is collapsed to
 * the ecliptic plane (z is dropped) — the 3D version of this same data
 * lives in the Three.js renderer tab.
 */
export function KeplerCanvasMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;
  const hitRef = useRef<{ bodyId: BodyId; x: number; y: number; r: number }[]>([]);

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

      // Background
      const bg = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, Math.max(w, h));
      bg.addColorStop(0, "#0a1626");
      bg.addColorStop(1, "#04070d");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const bound = keplerViewBound() + 18;
      const scale = (Math.min(w, h) / 2 - 24) / bound;
      const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

      // Sub-grid: AU rings (every 30 units) for spatial reference
      ctx.strokeStyle = "rgba(76, 209, 216, 0.06)";
      ctx.lineWidth = 1;
      for (let r = 30; r < bound; r += 30) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      const s = stateRef.current;

      // Orbital ellipses, periapsis markers, foci
      const drawOrbit = (bodyId: BodyId) => {
        const el = KEPLER[bodyId];
        const parentPos = el.parent === "sun" ? { x: 0, y: 0 } : keplerPosition(s, el.parent);
        const pts = keplerEllipsePoints(el, 256);
        ctx.strokeStyle = "rgba(76, 209, 216, 0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k < pts.length; k++) {
          const p = pts[k];
          const ax = parentPos.x + p.x;
          const ay = parentPos.y + p.y;
          const sp = T(ax, ay);
          if (k === 0) ctx.moveTo(sp.x, sp.y);
          else ctx.lineTo(sp.x, sp.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Periapsis tick (closest point on the ellipse to focus, drawn as a small line outward)
        const { periapsis } = apsides(el);
        // Periapsis direction in inertial: rotate +x of perifocal by ω, i, Ω. We can sample first ellipse point.
        // The first sample (E=0) is exactly at periapsis — well almost (relative to our parameterization start).
        // Sufficient for the visual marker.
        const peri = pts[0];
        const periX = parentPos.x + peri.x;
        const periY = parentPos.y + peri.y;
        const ps = T(periX, periY);
        ctx.strokeStyle = "rgba(232, 185, 78, 0.7)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        const pcx = T(parentPos.x, parentPos.y);
        const dx = ps.x - pcx.x;
        const dy = ps.y - pcx.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        ctx.moveTo(ps.x - ux * 5, ps.y - uy * 5);
        ctx.lineTo(ps.x + ux * 5, ps.y + uy * 5);
        ctx.stroke();
        ctx.fillStyle = "rgba(232, 185, 78, 0.65)";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillText(`q=${periapsis.toFixed(0)}`, ps.x + 6, ps.y - 4);
      };
      for (const bid of Object.keys(KEPLER) as BodyId[]) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        drawOrbit(bid);
      }

      // Predicted trajectories — short forward arcs
      ctx.strokeStyle = "rgba(108, 208, 122, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      for (const bid of Object.keys(KEPLER) as BodyId[]) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const el = KEPLER[bid];
        const lookahead = el.periodSec * 0.08; // ~8% of one orbit
        const pts = predictBodyTrack(s, bid, lookahead, 24);
        ctx.beginPath();
        for (let k = 0; k < pts.length; k++) {
          const sp = T(pts[k].x, pts[k].y);
          if (k === 0) ctx.moveTo(sp.x, sp.y);
          else ctx.lineTo(sp.x, sp.y);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

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
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Bodies + hit-targets
      const hits: typeof hitRef.current = [];
      for (const bid of Object.keys(KEPLER) as BodyId[]) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        const isSel = selRef.current === bid;
        const fillByBody: Record<BodyId, [string, number]> = {
          earth: ["#5fb3ff", 7],
          moon: ["#c9d2dc", 4],
          nea_04: ["#a8896a", 4],
          lunar_habitat: ["#6cd07a", 3],
        };
        const [fill, br] = fillByBody[bid];
        const hasAlert = s.alerts.some((a) => !a.resolved && a.bodyId === bid);
        if (hasAlert) {
          ctx.strokeStyle = "rgba(232, 185, 78, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, br + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (isSel) {
          ctx.strokeStyle = "#4cd1d8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, br + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isSel ? "#4cd1d8" : "#d8e2ee";
        ctx.font = "11px ui-monospace, Menlo, monospace";
        ctx.fillText(s.bodies[bid].name, sp.x + br + 6, sp.y + 4);
        // Annotate eccentricity
        ctx.fillStyle = "rgba(216, 226, 238, 0.5)";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillText(`e=${KEPLER[bid].e.toFixed(3)}`, sp.x + br + 6, sp.y + 16);
        hits.push({ bodyId: bid, x: sp.x, y: sp.y, r: br + 8 });
      }
      hitRef.current = hits;

      // Ships — forward-only dotted trajectory toward the lead point + glyph + ETA read.
      // The trajectory aims where the destination *will be* at arrival, not its
      // current position; we only draw the unflown remainder.
      for (const ship of s.ships) {
        if (!ship.route) continue;
        const { to } = shipTrajectoryEndpoints(ship);
        const ts = T(to.x, to.y);
        const sp = shipKeplerPosition(s, ship);
        const ssp = T(sp.x, sp.y);
        ctx.strokeStyle = "rgba(76, 209, 216, 0.55)";
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ssp.x, ssp.y);
        ctx.lineTo(ts.x, ts.y);
        ctx.stroke();
        ctx.setLineDash([]);
        const dx = ts.x - ssp.x;
        const dy = ts.y - ssp.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / len;
        const uy = dy / len;
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
        ctx.fillStyle = "rgba(216, 226, 238, 0.85)";
        ctx.font = "10px ui-monospace, Menlo, monospace";
        ctx.fillText(`${ship.name} · ETA ${Math.round(ship.route.travelSecRemaining)}s`, ssp.x + 6, ssp.y - 6);
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
      if (d <= t.r && (!best || d < best.d)) best = { id: t.bodyId, d };
    }
    if (best) onSelectBody(best.id);
  };

  return (
    <div ref={containerRef} className="solar-canvas-wrap">
      <canvas ref={canvasRef} onClick={onClick} style={{ display: "block", width: "100%", borderRadius: 4 }} />
    </div>
  );
}
