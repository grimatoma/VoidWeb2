import { useEffect, useRef, useState } from "react";
import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Strategic-game minimap. RTS aesthetic: faction-colored zones, fog-of-war
 * outside scan range, drag-rectangle ship select, mini-overview corner. Built
 * for the "I want to feel commanding" power fantasy.
 *
 * Distinguishing math: each body has a discovery radius; everything outside
 * the visible-from-bodies union is grayed-out fog. Ships glow when selected;
 * drag-rect selects multiple ships; double-click an enemy/neutral pings it.
 */
export function RtsStrategicMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  const [selectedShipIds, setSelectedShipIds] = useState<Set<string>>(new Set());
  const dragRef = useRef<{ startX: number; startY: number; curX: number; curY: number; active: boolean } | null>(null);
  stateRef.current = state;
  selRef.current = selectedBodyId;

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

      // Hex-grain background
      ctx.fillStyle = "#0a1320";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const bound = keplerViewBound() + 30;
      const scale = (Math.min(w, h) / 2 - 30) / bound;
      const T = (vx: number, vy: number) => ({ x: cx + vx * scale, y: cy + vy * scale });

      const s = stateRef.current;

      // Friendly territory zones (Earth, Moon, habitat) — soft blue blobs
      ctx.fillStyle = "rgba(95, 179, 255, 0.06)";
      for (const bid of ["earth", "moon", "lunar_habitat"] as BodyId[]) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 70, 0, Math.PI * 2);
        ctx.fill();
      }
      // Neutral (NEA) — amber zone
      ctx.fillStyle = "rgba(232, 185, 78, 0.05)";
      const nea = keplerPosition(s, "nea_04");
      const np = T(nea.x, nea.y);
      ctx.beginPath();
      ctx.arc(np.x, np.y, 60, 0, Math.PI * 2);
      ctx.fill();

      // Discovered area (union of body scan radii). Everything else is fog.
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        ctx.moveTo(sp.x + 120, sp.y);
        ctx.arc(sp.x, sp.y, 120, 0, Math.PI * 2, true);
      }
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fill("evenodd");
      ctx.restore();

      // Sun
      ctx.fillStyle = "#ffd86b";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Bodies
      const bodyConf: Record<BodyId, { color: string; r: number; faction: string }> = {
        earth: { color: "#5fb3ff", r: 9, faction: "ALLIED" },
        moon: { color: "#c9d2dc", r: 6, faction: "ALLIED" },
        nea_04: { color: "#a8896a", r: 6, faction: "NEUTRAL" },
        lunar_habitat: { color: "#6cd07a", r: 5, faction: "ALLIED" },
      };
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        const conf = bodyConf[bid];
        const isSel = selRef.current === bid;
        // Faction ring
        ctx.strokeStyle =
          conf.faction === "ALLIED" ? "rgba(95, 179, 255, 0.7)" : "rgba(232, 185, 78, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, conf.r + 3, 0, Math.PI * 2);
        ctx.stroke();
        // Selection highlight
        if (isSel) {
          ctx.strokeStyle = "#4cd1d8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, conf.r + 9, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = conf.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, conf.r, 0, Math.PI * 2);
        ctx.fill();
        // Tag
        ctx.fillStyle = isSel ? "#4cd1d8" : conf.color;
        ctx.font = "11px ui-monospace, Menlo, monospace";
        ctx.fillText(`[${conf.faction}] ${s.bodies[bid].name}`, sp.x + conf.r + 8, sp.y + 4);
      }

      // Ships
      const shipPositions: { id: string; x: number; y: number }[] = [];
      for (const ship of s.ships) {
        const sp = shipKeplerPosition(s, ship);
        const ssp = T(sp.x, sp.y);
        shipPositions.push({ id: ship.id, x: ssp.x, y: ssp.y });
        const isShipSelected = selectedShipIds.has(ship.id);
        if (isShipSelected) {
          ctx.strokeStyle = "rgba(108, 208, 122, 0.9)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ssp.x, ssp.y, 9, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = ship.route ? "#4cd1d8" : "#6cd07a";
        ctx.beginPath();
        ctx.arc(ssp.x, ssp.y, 4, 0, Math.PI * 2);
        ctx.fill();
        // Health/status bar over ship (placeholder — show route progress)
        if (ship.route) {
          const r = ship.route;
          const pct = (r.travelSecTotal - r.travelSecRemaining) / Math.max(1, r.travelSecTotal);
          ctx.fillStyle = "rgba(76, 209, 216, 0.25)";
          ctx.fillRect(ssp.x - 12, ssp.y - 12, 24, 3);
          ctx.fillStyle = "#4cd1d8";
          ctx.fillRect(ssp.x - 12, ssp.y - 12, 24 * pct, 3);
        }
        ctx.fillStyle = "rgba(216,226,238,0.85)";
        ctx.font = "10px ui-monospace, Menlo, monospace";
        ctx.fillText(ship.name, ssp.x + 7, ssp.y + 3);
      }

      // Drag-rectangle
      if (dragRef.current?.active) {
        const d = dragRef.current;
        const x0 = Math.min(d.startX, d.curX);
        const y0 = Math.min(d.startY, d.curY);
        const dw = Math.abs(d.curX - d.startX);
        const dh = Math.abs(d.curY - d.startY);
        ctx.fillStyle = "rgba(76, 209, 216, 0.08)";
        ctx.fillRect(x0, y0, dw, dh);
        ctx.strokeStyle = "rgba(76, 209, 216, 0.7)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(x0, y0, dw, dh);
        ctx.setLineDash([]);
      }

      // Mini-overview corner (always shows full system at 1/4 size)
      const miniW = 110;
      const miniH = 70;
      const mx = w - miniW - 10;
      const my = 10;
      ctx.fillStyle = "rgba(8, 12, 20, 0.9)";
      ctx.strokeStyle = "rgba(76, 209, 216, 0.7)";
      ctx.lineWidth = 1;
      ctx.fillRect(mx, my, miniW, miniH);
      ctx.strokeRect(mx, my, miniW, miniH);
      const miniScale = (Math.min(miniW, miniH) / 2 - 4) / bound;
      const miniCx = mx + miniW / 2;
      const miniCy = my + miniH / 2;
      ctx.fillStyle = "#ffd86b";
      ctx.beginPath();
      ctx.arc(miniCx, miniCy, 1.5, 0, Math.PI * 2);
      ctx.fill();
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        ctx.fillStyle = bodyConf[bid].color;
        ctx.beginPath();
        ctx.arc(miniCx + p.x * miniScale, miniCy + p.y * miniScale, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [selectedShipIds]);

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      curX: e.clientX - rect.left,
      curY: e.clientY - rect.top,
      active: true,
    };
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current?.active) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    dragRef.current.curX = e.clientX - rect.left;
    dragRef.current.curY = e.clientY - rect.top;
  };
  const onUp = () => {
    const d = dragRef.current;
    if (!d || !d.active) return;
    const dx = Math.abs(d.curX - d.startX);
    const dy = Math.abs(d.curY - d.startY);
    if (dx < 4 && dy < 4) {
      // Treat as click-select on body
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = 240;
      const bound = keplerViewBound() + 30;
      const scale = (Math.min(rect.width, 480) / 2 - 30) / bound;
      let best: { id: BodyId; dist: number } | null = null;
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !stateRef.current.populations.lunar_habitat) continue;
        const p = keplerPosition(stateRef.current, bid);
        const sx = cx + p.x * scale;
        const sy = cy + p.y * scale;
        const dd = Math.hypot(sx - d.startX, sy - d.startY);
        if (dd <= 14 && (!best || dd < best.dist)) best = { id: bid, dist: dd };
      }
      if (best) onSelectBody(best.id);
    } else {
      // Drag-select ships
      const x0 = Math.min(d.startX, d.curX);
      const y0 = Math.min(d.startY, d.curY);
      const x1 = Math.max(d.startX, d.curX);
      const y1 = Math.max(d.startY, d.curY);
      const rect = canvasRef.current!.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = 240;
      const bound = keplerViewBound() + 30;
      const scale = (Math.min(rect.width, 480) / 2 - 30) / bound;
      const next = new Set<string>();
      for (const ship of stateRef.current.ships) {
        const sp = shipKeplerPosition(stateRef.current, ship);
        const sx = cx + sp.x * scale;
        const sy = cy + sp.y * scale;
        if (sx >= x0 && sx <= x1 && sy >= y0 && sy <= y1) next.add(ship.id);
      }
      setSelectedShipIds(next);
    }
    d.active = false;
  };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{ display: "block", width: "100%", borderRadius: 4, cursor: "crosshair" }}
      />
      <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)" }}>
        Drag to box-select ships · click bodies to select · {selectedShipIds.size} ship(s) selected
      </div>
    </div>
  );
}
