import { useEffect, useRef } from "react";
import { keplerPosition, keplerViewBound, shipKeplerPosition, shipTrajectoryEndpoints } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Co-rotating Earth-frame view. The whole picture rotates with Earth's orbital
 * motion, so Earth appears stationary on the +x axis from the Sun. NEA-04 and
 * the Moon then trace out *relative* motion paths — the Moon slowly orbits
 * Earth as a small loop, NEA-04 sweeps a wider relative-motion curve.
 *
 * This is exactly the frame astrodynamicists use to visualize Lagrange points
 * and resonant orbits. Different math: every Kepler position is rotated by
 * -Earth's mean anomaly to lock Earth in place.
 */
export function CorotatingFrameMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;
  const hitRef = useRef<{ id: BodyId; x: number; y: number; r: number }[]>([]);
  // Persistent trail buffer of co-rotating positions to visualize the resonant motion
  const trailsRef = useRef(new Map<BodyId, { x: number; y: number }[]>());

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

      const s = stateRef.current;
      const earth = keplerPosition(s, "earth");
      const earthAngle = Math.atan2(earth.y, earth.x);
      // Co-rotating: rotate by -earthAngle so Earth lands on +x of the screen.
      const cos = Math.cos(-earthAngle);
      const sin = Math.sin(-earthAngle);
      const rotate = (vx: number, vy: number) => ({
        x: vx * cos - vy * sin,
        y: vx * sin + vy * cos,
      });
      const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

      // Update trail buffers (in co-rotating frame)
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const r = rotate(p.x, p.y);
        let trail = trailsRef.current.get(bid);
        if (!trail) {
          trail = [];
          trailsRef.current.set(bid, trail);
        }
        trail.unshift({ x: r.x, y: r.y });
        if (trail.length > 240) trail.length = 240;
      }

      // Sun at origin
      ctx.fillStyle = "#ffd86b";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Co-rotating axes — Sun-Earth line
      ctx.strokeStyle = "rgba(76, 209, 216, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();
      ctx.fillStyle = "rgba(76, 209, 216, 0.5)";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.fillText("Sun-Earth axis →", cx + 50, cy - 6);

      // Lagrange-point hints: L1, L2, L3, L4, L5 along/near the Sun-Earth line.
      // Distances are stylized; not Hill-radius accurate.
      const earthScreenDist = Math.hypot(earth.x, earth.y) * scale;
      const L1 = { x: cx + earthScreenDist * 0.85, y: cy };
      const L2 = { x: cx + earthScreenDist * 1.15, y: cy };
      const L3 = { x: cx - earthScreenDist, y: cy };
      const L4 = { x: cx + earthScreenDist * 0.5, y: cy - earthScreenDist * 0.866 };
      const L5 = { x: cx + earthScreenDist * 0.5, y: cy + earthScreenDist * 0.866 };
      const lpoints = [
        { p: L1, name: "L1" },
        { p: L2, name: "L2" },
        { p: L3, name: "L3" },
        { p: L4, name: "L4" },
        { p: L5, name: "L5" },
      ];
      for (const lp of lpoints) {
        ctx.strokeStyle = "rgba(232, 185, 78, 0.4)";
        ctx.beginPath();
        ctx.arc(lp.p.x, lp.p.y, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(232, 185, 78, 0.7)";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillText(lp.name, lp.p.x + 8, lp.p.y + 3);
      }

      // Trails (relative-motion paths)
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const trail = trailsRef.current.get(bid) ?? [];
        if (trail.length < 2) continue;
        ctx.strokeStyle = "rgba(108, 208, 122, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < trail.length; i++) {
          const sp = T(trail[i].x, trail[i].y);
          if (i === 0) ctx.moveTo(sp.x, sp.y);
          else ctx.lineTo(sp.x, sp.y);
        }
        ctx.stroke();
      }

      // Bodies in co-rotating frame
      const hits: typeof hitRef.current = [];
      const conf: Record<BodyId, { color: string; r: number }> = {
        earth: { color: "#5fb3ff", r: 8 },
        moon: { color: "#c9d2dc", r: 5 },
        nea_04: { color: "#a8896a", r: 5 },
        lunar_habitat: { color: "#6cd07a", r: 4 },
      };
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const r = rotate(p.x, p.y);
        const sp = T(r.x, r.y);
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

      // Ships — forward-only dotted trajectory toward the lead point, drawn
      // in the rotating frame (so a Hohmann arc looks curved here).
      for (const ship of s.ships) {
        if (!ship.route) continue;
        const sp = shipKeplerPosition(s, ship);
        const { to } = shipTrajectoryEndpoints(ship);
        const rot = rotate(sp.x, sp.y);
        const ssp = T(rot.x, rot.y);
        const trot = rotate(to.x, to.y);
        const tsp = T(trot.x, trot.y);
        ctx.strokeStyle = "rgba(76, 209, 216, 0.55)";
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ssp.x, ssp.y);
        ctx.lineTo(tsp.x, tsp.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#4cd1d8";
        ctx.beginPath();
        ctx.arc(ssp.x, ssp.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Frame label
      ctx.fillStyle = "rgba(216,226,238,0.55)";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.fillText("co-rotating Sun-Earth frame · Earth fixed on +x · L1–L5 marked", 14, h - 14);

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
