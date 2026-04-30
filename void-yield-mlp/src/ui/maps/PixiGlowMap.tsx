import { useEffect, useRef } from "react";
import { Application, Container, Graphics, Text } from "pixi.js";
import {
  KEPLER,
  keplerEllipsePoints,
  keplerPosition,
  keplerViewBound,
  shipKeplerPosition,
} from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

/**
 * Pixi WebGL — Graphics-driven, with additive glow halos around the Sun
 * and bodies, and a fading-particle trail behind each ship. Same Kepler
 * data as the rest of the spectrum; this tab is the "feel-good" answer
 * to "what does it look like with VFX cranked up?"
 */
export function PixiGlowMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;

  useEffect(() => {
    let app: Application | null = null;
    let cancelled = false;
    const wrap = wrapRef.current;
    if (!wrap) return;

    (async () => {
      const a = new Application();
      await a.init({
        background: 0x06090f,
        antialias: true,
        resizeTo: wrap,
        height: 480,
      });
      if (cancelled) {
        a.destroy(true);
        return;
      }
      app = a;
      wrap.appendChild(a.canvas);

      const cx = () => a.canvas.width / 2;
      const cy = () => a.canvas.height / 2;
      const bound = keplerViewBound() + 30;
      const scale = () => Math.min(a.canvas.width, a.canvas.height) / 2 / bound;

      // Layered containers (back→front)
      const stars = new Container();
      const orbits = new Container();
      const sunLayer = new Container();
      const trails = new Container();
      const bodies = new Container();
      const ships = new Container();
      const ui = new Container();
      a.stage.addChild(stars, orbits, sunLayer, trails, bodies, ships, ui);

      // Star field — random points, pre-baked
      const starG = new Graphics();
      let seed = 1;
      for (let i = 0; i < 200; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        const x = (seed / 233280) * a.canvas.width;
        seed = (seed * 9301 + 49297) % 233280;
        const y = (seed / 233280) * a.canvas.height;
        seed = (seed * 9301 + 49297) % 233280;
        const r = (seed / 233280) * 1.4 + 0.3;
        starG.circle(x, y, r).fill({ color: 0xffffff, alpha: 0.7 });
      }
      stars.addChild(starG);

      // Sun + glow rings (multiple stacked transparencies)
      const sunG = new Graphics();
      sunLayer.addChild(sunG);
      const drawSun = () => {
        sunG.clear();
        const x = cx();
        const y = cy();
        // Outer glow
        for (let r = 60; r >= 22; r -= 6) {
          sunG.circle(x, y, r).fill({ color: 0xe8b94e, alpha: 0.025 + (60 - r) * 0.0035 });
        }
        sunG.circle(x, y, 22).fill(0xe8b94e);
        sunG.circle(x, y, 6).fill(0xfff0c2);
      };

      // Orbit lines
      const orbitG = new Graphics();
      orbits.addChild(orbitG);

      // Body sprites
      const bodyConf: Record<BodyId, { color: number; r: number }> = {
        earth: { color: 0x5fb3ff, r: 8 },
        moon: { color: 0xc9d2dc, r: 5 },
        nea_04: { color: 0xa8896a, r: 5 },
        lunar_habitat: { color: 0x6cd07a, r: 4 },
      };
      const bodyG: Record<string, Graphics> = {};
      const bodyLabels: Record<string, Text> = {};
      const hits: { bodyId: BodyId; x: number; y: number; r: number }[] = [];
      for (const bid of Object.keys(bodyConf) as BodyId[]) {
        const g = new Graphics();
        bodies.addChild(g);
        bodyG[bid] = g;
        const t = new Text({
          text: state.bodies[bid].name,
          style: { fill: 0xd8e2ee, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11 },
        });
        ui.addChild(t);
        bodyLabels[bid] = t;
      }

      // Ship trail buffers — keep recent positions per ship
      const trailMap = new Map<string, { x: number; y: number; age: number }[]>();
      const TRAIL_LEN = 36;

      // Click → hit-test bodies
      a.stage.eventMode = "static";
      a.stage.hitArea = a.screen;
      a.stage.on("pointerdown", (ev) => {
        const x = ev.global.x;
        const y = ev.global.y;
        let best: { bodyId: BodyId; d: number } | null = null;
        for (const t of hits) {
          const d = Math.hypot(t.x - x, t.y - y);
          if (d <= t.r && (!best || d < best.d)) best = { bodyId: t.bodyId, d };
        }
        if (best) onSelectBody(best.bodyId);
      });

      a.ticker.add(() => {
        const s = stateRef.current;
        const sel = selRef.current;
        const sc = scale();
        const ox = cx();
        const oy = cy();
        const T = (vx: number, vy: number) => ({ x: ox + vx * sc, y: oy + vy * sc });

        drawSun();

        // Orbits: parent-relative
        orbitG.clear();
        for (const bid of Object.keys(KEPLER) as BodyId[]) {
          if (bid === "lunar_habitat" && !s.populations.lunar_habitat) continue;
          const el = KEPLER[bid];
          const parent = el.parent === "sun" ? { x: 0, y: 0, z: 0 } : keplerPosition(s, el.parent);
          const pts = keplerEllipsePoints(el, 96);
          orbitG.moveTo(T(parent.x + pts[0].x, parent.y + pts[0].y).x, T(parent.x + pts[0].x, parent.y + pts[0].y).y);
          for (let k = 1; k < pts.length; k++) {
            const ax = parent.x + pts[k].x;
            const ay = parent.y + pts[k].y;
            const sp = T(ax, ay);
            orbitG.lineTo(sp.x, sp.y);
          }
          orbitG.closePath();
          orbitG.stroke({ color: 0x4cd1d8, alpha: 0.2, width: 1 });
        }

        // Bodies + glow halos
        hits.length = 0;
        for (const bid of Object.keys(bodyG) as BodyId[]) {
          const visible = !(bid === "lunar_habitat" && !s.populations.lunar_habitat);
          bodyG[bid].visible = visible;
          bodyLabels[bid].visible = visible;
          if (!visible) continue;
          const conf = bodyConf[bid];
          const p = keplerPosition(s, bid);
          const sp = T(p.x, p.y);
          const g = bodyG[bid];
          g.clear();
          // halo
          for (let r = conf.r * 3.5; r >= conf.r; r -= 2) {
            g.circle(sp.x, sp.y, r).fill({ color: conf.color, alpha: 0.04 });
          }
          // selection / alert ring
          const hasAlert = s.alerts.some((a) => !a.resolved && a.bodyId === bid);
          if (hasAlert) g.circle(sp.x, sp.y, conf.r + 4).stroke({ color: 0xe8b94e, alpha: 0.8, width: 1.5 });
          if (sel === bid) g.circle(sp.x, sp.y, conf.r + 7).stroke({ color: 0x4cd1d8, alpha: 0.95, width: 2 });
          g.circle(sp.x, sp.y, conf.r).fill(conf.color);
          bodyLabels[bid].x = sp.x + conf.r + 6;
          bodyLabels[bid].y = sp.y - 6;
          hits.push({ bodyId: bid, x: sp.x, y: sp.y, r: conf.r + 8 });
        }

        // Ships + particle trails
        trails.removeChildren().forEach((c) => c.destroy());
        ships.removeChildren().forEach((c) => c.destroy());
        const liveIds = new Set<string>();
        for (const ship of s.ships) {
          if (!ship.route) continue;
          liveIds.add(ship.id);
          const sp = shipKeplerPosition(s, ship);
          const ssp = T(sp.x, sp.y);
          let trail = trailMap.get(ship.id);
          if (!trail) {
            trail = [];
            trailMap.set(ship.id, trail);
          }
          trail.unshift({ x: ssp.x, y: ssp.y, age: 0 });
          for (const t of trail) t.age++;
          if (trail.length > TRAIL_LEN) trail.length = TRAIL_LEN;

          // draw trail (oldest = most transparent)
          const tg = new Graphics();
          for (let i = trail.length - 1; i >= 0; i--) {
            const t = trail[i];
            const a = (1 - i / TRAIL_LEN) * 0.65;
            tg.circle(t.x, t.y, 2.4 - i * 0.05).fill({ color: 0x4cd1d8, alpha: a });
          }
          trails.addChild(tg);

          // ship glyph (oriented arrow)
          const to = keplerPosition(s, ship.route.toBodyId);
          const tsp = T(to.x, to.y);
          const dx = tsp.x - ssp.x;
          const dy = tsp.y - ssp.y;
          const len = Math.max(1, Math.hypot(dx, dy));
          const ux = dx / len;
          const uy = dy / len;
          const sg = new Graphics();
          sg.poly([
            ssp.x + ux * 7,
            ssp.y + uy * 7,
            ssp.x - ux * 4 + uy * 3,
            ssp.y - uy * 4 - ux * 3,
            ssp.x - ux * 4 - uy * 3,
            ssp.y - uy * 4 + ux * 3,
          ]).fill(0x4cd1d8);
          ships.addChild(sg);
        }
        // GC stale ship trails
        for (const id of trailMap.keys()) if (!liveIds.has(id)) trailMap.delete(id);
      });
    })();

    return () => {
      cancelled = true;
      if (app) {
        app.destroy(true, { children: true });
        app = null;
      }
      while (wrap.firstChild) wrap.removeChild(wrap.firstChild);
    };
  }, [onSelectBody]);

  return <div ref={wrapRef} style={{ width: "100%", height: 480 }} />;
}
