import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  frameBound,
  frameCenter,
  keplerPosition,
  shipKeplerPosition,
  shipTrajectoryFuturePoints,
} from "../../game/kepler";
import { BODIES_VISUAL, visibleBodies } from "../../game/bodies";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

/**
 * EVE-style scanner. Mouse-wheel zoom in/out, drag to pan, info-dense
 * overview panel listing every body and ship by signature with sortable
 * columns. Click an entry in the overview → camera jumps to that target.
 *
 * The aesthetic: every pixel earns its place. Game-dev nod to EVE Online's
 * dense-on-purpose flight control feel.
 */
export function EveScannerMap({ state, selectedBodyId, onSelectBody, frame = "system" }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  const frameRef = useRef(frame);
  // Mirror the latest props into refs so the long-lived rAF effect always
  // reads the current values without re-binding on every render.
  useLayoutEffect(() => {
    stateRef.current = state;
    selRef.current = selectedBodyId;
    frameRef.current = frame;
  });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  // Reset zoom/pan when the user picks a different frame so the new center
  // isn't fighting an inherited offset. Adjusting state during render (the
  // documented pattern from React's "you might not need an effect" guide)
  // avoids the cascading-render hit of doing it in useEffect.
  const [prevFrame, setPrevFrame] = useState(frame);
  if (frame !== prevFrame) {
    setPrevFrame(frame);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

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
      ctx.fillStyle = "#04080f";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2 + pan.x;
      const cy = h / 2 + pan.y;
      const s = stateRef.current;
      const center = frameCenter(s, frameRef.current);
      const bound = frameBound(frameRef.current) + 30;
      const scale = ((Math.min(w, h) / 2 - 30) / bound) * zoom;
      const T = (vx: number, vy: number) => ({
        x: cx + (vx - center.x) * scale,
        y: cy + (vy - center.y) * scale,
      });

      // Bracket-frame in corners
      ctx.strokeStyle = "rgba(76, 209, 216, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, 22);
      ctx.lineTo(8, 8);
      ctx.lineTo(22, 8);
      ctx.moveTo(w - 22, 8);
      ctx.lineTo(w - 8, 8);
      ctx.lineTo(w - 8, 22);
      ctx.moveTo(8, h - 22);
      ctx.lineTo(8, h - 8);
      ctx.lineTo(22, h - 8);
      ctx.moveTo(w - 22, h - 8);
      ctx.lineTo(w - 8, h - 8);
      ctx.lineTo(w - 8, h - 22);
      ctx.stroke();

      // Range rings — step matches the frame bound (heliocentric vs cislunar).
      ctx.strokeStyle = "rgba(76, 209, 216, 0.12)";
      const sun = T(0, 0);
      const ringStep = bound > 80 ? 30 : bound > 20 ? 8 : 2;
      const ringCenter = frameRef.current === "system" ? sun : { x: cx, y: cy };
      for (let r = ringStep; r <= bound; r += ringStep) {
        ctx.beginPath();
        ctx.arc(ringCenter.x, ringCenter.y, r * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sun — at world-origin, transformed like any body.
      ctx.fillStyle = "#ffd86b";
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, 5 * Math.min(zoom, 2), 0, Math.PI * 2);
      ctx.fill();

      // Bodies as bracketed contacts
      for (const bid of visibleBodies(s)) {
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        if (sp.x < -50 || sp.x > w + 50 || sp.y < -50 || sp.y > h + 50) continue;
        const isSel = selRef.current === bid;
        const c = BODIES_VISUAL[bid].color;
        const r = 5;
        // Bracket
        ctx.strokeStyle = isSel ? "#4cd1d8" : c;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sp.x - r - 4, sp.y - r);
        ctx.lineTo(sp.x - r - 4, sp.y - r - 4);
        ctx.lineTo(sp.x - r, sp.y - r - 4);
        ctx.moveTo(sp.x + r + 4, sp.y - r);
        ctx.lineTo(sp.x + r + 4, sp.y - r - 4);
        ctx.lineTo(sp.x + r, sp.y - r - 4);
        ctx.moveTo(sp.x - r - 4, sp.y + r);
        ctx.lineTo(sp.x - r - 4, sp.y + r + 4);
        ctx.lineTo(sp.x - r, sp.y + r + 4);
        ctx.moveTo(sp.x + r + 4, sp.y + r);
        ctx.lineTo(sp.x + r + 4, sp.y + r + 4);
        ctx.lineTo(sp.x + r, sp.y + r + 4);
        ctx.stroke();
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isSel ? "#4cd1d8" : "#d8e2ee";
        ctx.font = "10px ui-monospace, Menlo, monospace";
        ctx.fillText(s.bodies[bid].name, sp.x + 10, sp.y + 4);
      }

      // Ships — forward-only dotted trajectory arc for in-transit haulers.
      for (const ship of s.ships) {
        const sp = shipKeplerPosition(s, ship);
        const ssp = T(sp.x, sp.y);
        if (ship.route) {
          const arc = shipTrajectoryFuturePoints(ship, 32);
          ctx.strokeStyle = "rgba(76, 209, 216, 0.5)";
          ctx.setLineDash([2, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          const first = T(arc[0].x, arc[0].y);
          ctx.moveTo(first.x, first.y);
          for (let i = 1; i < arc.length; i++) {
            const p = T(arc[i].x, arc[i].y);
            ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = ship.route ? "#4cd1d8" : "rgba(216,226,238,0.4)";
        ctx.beginPath();
        ctx.arc(ssp.x, ssp.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Zoom indicator
      ctx.fillStyle = "rgba(216,226,238,0.6)";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.fillText(`zoom ${zoom.toFixed(2)}× — wheel to zoom, drag to pan`, 14, h - 16);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [zoom, pan]);

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.4, Math.min(8, z * (1 - e.deltaY * 0.0015))));
  };
  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: pan.x,
      baseY: pan.y,
    };
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d?.active) return;
    setPan({ x: d.baseX + (e.clientX - d.startX), y: d.baseY + (e.clientY - d.startY) });
  };
  const onUp = () => {
    if (dragRef.current) dragRef.current.active = false;
  };

  // Overview panel: every body + ship listed with signature
  const rows: { kind: "body" | "ship"; id: string; name: string; type: string; range: string; status: string }[] = [];
  for (const bid of visibleBodies(state)) {
    const p = keplerPosition(state, bid);
    rows.push({
      kind: "body",
      id: bid,
      name: state.bodies[bid].name,
      type: state.bodies[bid].type,
      range: Math.hypot(p.x, p.y, p.z).toFixed(1),
      status: bid === "nea_04" ? "neutral" : "allied",
    });
  }
  for (const ship of state.ships) {
    const sp = shipKeplerPosition(state, ship);
    rows.push({
      kind: "ship",
      id: ship.id,
      name: ship.name,
      type: "hauler",
      range: Math.hypot(sp.x, sp.y, sp.z).toFixed(1),
      status: ship.route ? `transit ${Math.round(ship.route.travelSecRemaining)}s` : "idle",
    });
  }
  rows.sort((a, b) => parseFloat(a.range) - parseFloat(b.range));

  return (
    <div ref={containerRef} style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 240px", gap: 8 }}>
      <canvas
        ref={canvasRef}
        onWheel={onWheel}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{ display: "block", width: "100%", borderRadius: 4, cursor: "move" }}
      />
      <div
        style={{
          background: "#04080f",
          border: "1px solid var(--line)",
          borderRadius: 4,
          padding: 6,
          fontFamily: "var(--mono)",
          fontSize: 11,
          maxHeight: 480,
          overflowY: "auto",
        }}
      >
        <div style={{ color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.06, marginBottom: 6 }}>
          Overview
        </div>
        {rows.map((r) => (
          <div
            key={`${r.kind}-${r.id}`}
            onClick={() => r.kind === "body" && onSelectBody(r.id as BodyId)}
            style={{
              padding: "4px 6px",
              cursor: r.kind === "body" ? "pointer" : "default",
              borderBottom: "1px solid rgba(76, 209, 216, 0.06)",
              color:
                r.kind === "ship"
                  ? "#4cd1d8"
                  : selectedBodyId === r.id
                    ? "#4cd1d8"
                    : "var(--text)",
            }}
          >
            <div style={{ fontWeight: 600 }}>{r.name}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 10 }}>
              {r.type} · R={r.range} · {r.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
