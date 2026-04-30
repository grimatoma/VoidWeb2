import { useEffect, useRef } from "react";
import { keplerPosition, keplerViewBound, shipKeplerPosition } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];

/**
 * Retro 8-bit pixel-art aesthetic. Renders to a small offscreen canvas
 * (160×100 logical px, 4× scaled) with image-rendering: pixelated.
 * Bodies are 5×5 NES-palette sprites; ships are 3×3 micro-glyphs.
 * No anti-aliasing anywhere. Looks like a Sega Star Cruiser status screen.
 */
export function PixelArtMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;
  const hitRef = useRef<{ id: BodyId; x: number; y: number; r: number }[]>([]);
  // Display resolution multiplier
  const ZOOM = 4;
  const LOGW = 200;
  const LOGH = 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const draw = () => {
      const w = LOGW * ZOOM;
      const h = LOGH * ZOOM;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      // Render at 1× into a temp surface then nearest-neighbor to display.
      // Simpler: render directly at logical resolution by scaling all coords.
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(ZOOM, 0, 0, ZOOM, 0, 0);
      ctx.clearRect(0, 0, LOGW, LOGH);

      // Background — dark blue
      ctx.fillStyle = "#0c1a3a";
      ctx.fillRect(0, 0, LOGW, LOGH);

      // Star pixels — deterministic
      let seed = 11;
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 30; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        const x = Math.floor((seed / 233280) * LOGW);
        seed = (seed * 9301 + 49297) % 233280;
        const y = Math.floor((seed / 233280) * LOGH);
        ctx.fillRect(x, y, 1, 1);
      }

      const cx = LOGW / 2;
      const cy = LOGH / 2;
      const bound = keplerViewBound() + 30;
      const scale = (Math.min(LOGW, LOGH) / 2 - 10) / bound;
      const T = (vx: number, vy: number) => ({
        x: Math.round(cx + vx * scale),
        y: Math.round(cy + vy * scale),
      });

      const s = stateRef.current;

      // Sun — chunky 5×5 with halo
      const sun = T(0, 0);
      ctx.fillStyle = "#fcc442";
      ctx.fillRect(sun.x - 2, sun.y - 2, 5, 5);
      ctx.fillStyle = "#ffe39a";
      ctx.fillRect(sun.x - 1, sun.y - 1, 3, 3);
      // Halo flicker
      const flicker = Math.floor(Date.now() / 200) % 2;
      ctx.fillStyle = "#fcc442";
      if (flicker) {
        ctx.fillRect(sun.x - 4, sun.y, 1, 1);
        ctx.fillRect(sun.x + 4, sun.y, 1, 1);
        ctx.fillRect(sun.x, sun.y - 4, 1, 1);
        ctx.fillRect(sun.x, sun.y + 4, 1, 1);
      }

      // Bodies — 3×3 colored sprites
      const conf: Record<BodyId, string> = {
        earth: "#5fb3ff",
        moon: "#c9d2dc",
        nea_04: "#a8896a",
        lunar_habitat: "#6cd07a",
      };
      const hits: typeof hitRef.current = [];
      for (const bid of ALL_BODIES) {
        if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
        const p = keplerPosition(s, bid);
        const sp = T(p.x, p.y);
        ctx.fillStyle = conf[bid];
        if (bid === "earth") {
          ctx.fillRect(sp.x - 1, sp.y - 1, 3, 3);
          ctx.fillRect(sp.x - 2, sp.y, 1, 1);
          ctx.fillRect(sp.x + 2, sp.y, 1, 1);
          ctx.fillRect(sp.x, sp.y - 2, 1, 1);
          ctx.fillRect(sp.x, sp.y + 2, 1, 1);
        } else {
          ctx.fillRect(sp.x - 1, sp.y - 1, 3, 3);
        }
        // Selection — flashing outline pixels
        if (selRef.current === bid) {
          ctx.fillStyle = (Math.floor(Date.now() / 250) % 2 ? "#4cd1d8" : "#a8f0f4");
          ctx.fillRect(sp.x - 3, sp.y - 3, 1, 1);
          ctx.fillRect(sp.x + 3, sp.y - 3, 1, 1);
          ctx.fillRect(sp.x - 3, sp.y + 3, 1, 1);
          ctx.fillRect(sp.x + 3, sp.y + 3, 1, 1);
        }
        hits.push({ id: bid, x: sp.x * ZOOM, y: sp.y * ZOOM, r: 8 * ZOOM });
      }
      hitRef.current = hits;

      // Ships — 1-pixel chevron
      for (const ship of s.ships) {
        if (!ship.route) continue;
        const sp = shipKeplerPosition(s, ship);
        const ssp = T(sp.x, sp.y);
        ctx.fillStyle = "#4cd1d8";
        ctx.fillRect(ssp.x, ssp.y, 1, 1);
        ctx.fillRect(ssp.x - 1, ssp.y - 1, 1, 1);
        ctx.fillRect(ssp.x - 1, ssp.y + 1, 1, 1);
      }

      // HUD bar (bottom)
      ctx.fillStyle = "#1c2a4a";
      ctx.fillRect(0, LOGH - 12, LOGW, 12);
      ctx.fillStyle = "#5fb3ff";
      ctx.font = "8px monospace";
      ctx.fillText(`SOL T+${Math.floor(s.gameTimeSec)}`, 4, LOGH - 4);
      ctx.fillStyle = "#a8f0f4";
      ctx.fillText(`F${s.ships.filter((sh) => sh.route).length}/${s.ships.length}`, LOGW - 36, LOGH - 4);

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
    <div ref={containerRef} style={{ width: "100%", display: "flex", justifyContent: "center", padding: "20px 0", background: "#0a1320", borderRadius: 4 }}>
      <canvas
        ref={canvasRef}
        onClick={onClick}
        style={{
          imageRendering: "pixelated",
          cursor: "pointer",
          border: "2px solid #5fb3ff",
        }}
      />
    </div>
  );
}
