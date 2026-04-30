import { useEffect, useRef, useState } from "react";
import {
  KEPLER,
  apsides,
  keplerEllipsePoints,
  keplerPosition,
  keplerViewBound,
  predictBodyTrack,
  shipKeplerPosition,
} from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Flight-path predictor — shows where each body will be in N minutes
 * (slider-controlled), with a fading "ghost" preview at the look-ahead
 * time and the cumulative trail between now and then.
 *
 * Useful for transfer-window planning: pick a future time, see who's
 * close to whom. The slider is the killer feature — drag through time
 * and watch the system swirl.
 */
export function FlightPathPredictorMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;
  const [lookaheadSec, setLookaheadSec] = useState(180);
  const lookaheadRef = useRef(lookaheadSec);
  lookaheadRef.current = lookaheadSec;
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
      const h = 460;
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

      const s = stateRef.current;
      const lookahead = lookaheadRef.current;

      // Faint orbits
      ctx.strokeStyle = "rgba(76, 209, 216, 0.15)";
      ctx.lineWidth = 1;
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

      // Sun
      ctx.fillStyle = "#ffd86b";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      const conf: Record<BodyId, { color: string; r: number }> = {
        earth: { color: "#5fb3ff", r: 7 },
        moon: { color: "#c9d2dc", r: 4 },
        nea_04: { color: "#a8896a", r: 5 },
        lunar_habitat: { color: "#6cd07a", r: 3 },
      };

      const hits: typeof hitRef.current = [];
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        // Forward-track: now → +lookahead, fading-trail
        const track = predictBodyTrack(s, bid, lookahead, 60);
        for (let i = 0; i < track.length - 1; i++) {
          const a = track[i];
          const b = track[i + 1];
          const sa = T(a.x, a.y);
          const sb = T(b.x, b.y);
          const t = i / (track.length - 1);
          ctx.strokeStyle = `${conf[bid].color}${Math.floor(70 + t * 100).toString(16).padStart(2, "0")}`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.stroke();
        }

        // Current position
        const now = keplerPosition(s, bid);
        const sp = T(now.x, now.y);
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
        // Ghost preview at lookahead
        const future = track[track.length - 1];
        const fp = T(future.x, future.y);
        ctx.strokeStyle = `${conf[bid].color}80`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, conf[bid].r + 1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(fp.x, fp.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label both
        ctx.fillStyle = isSel ? "#4cd1d8" : "#d8e2ee";
        ctx.font = "11px ui-monospace, Menlo, monospace";
        ctx.fillText(s.bodies[bid].name, sp.x + conf[bid].r + 6, sp.y + 4);
        ctx.fillStyle = "rgba(216,226,238,0.55)";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillText(`+${lookahead}s →`, fp.x + 4, fp.y - 6);
        // Distance change
        const r0 = Math.hypot(now.x, now.y, now.z);
        const r1 = Math.hypot(future.x, future.y, future.z);
        const dr = r1 - r0;
        ctx.fillText(`Δr=${dr >= 0 ? "+" : ""}${dr.toFixed(1)}`, sp.x + conf[bid].r + 6, sp.y + 16);

        hits.push({ id: bid, x: sp.x, y: sp.y, r: conf[bid].r + 8 });
      }
      hitRef.current = hits;

      // Ships
      for (const ship of s.ships) {
        if (!ship.route) continue;
        const sp = shipKeplerPosition(s, ship);
        const ssp = T(sp.x, sp.y);
        ctx.fillStyle = "#4cd1d8";
        ctx.beginPath();
        ctx.arc(ssp.x, ssp.y, 3, 0, Math.PI * 2);
        ctx.fill();
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

  // For the slider — show period of selected body (so user can tune)
  const selPeriod = selectedBodyId ? KEPLER[selectedBodyId].periodSec : 0;
  const apo = selectedBodyId ? apsides(KEPLER[selectedBodyId]).apoapsis : 0;

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <canvas ref={canvasRef} onClick={onClick} style={{ display: "block", width: "100%", borderRadius: 4, cursor: "pointer" }} />
      <div
        style={{
          marginTop: 10,
          padding: "8px 12px",
          background: "var(--bg-panel)",
          border: "1px solid var(--line)",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "var(--mono)",
          fontSize: 12,
        }}
      >
        <span style={{ color: "var(--text-dim)" }}>Look-ahead</span>
        <input
          type="range"
          min={30}
          max={1200}
          step={10}
          value={lookaheadSec}
          onChange={(e) => setLookaheadSec(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ minWidth: 60 }}>+{lookaheadSec}s</span>
        {selectedBodyId && (
          <span style={{ color: "var(--text-muted)" }}>
            (selected period: {selPeriod}s · apoapsis: {apo.toFixed(1)})
          </span>
        )}
      </div>
    </div>
  );
}
