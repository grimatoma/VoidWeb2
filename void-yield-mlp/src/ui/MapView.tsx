import { useState } from "react";
import type { GameApi } from "../game/useGame";
import type { BodyId } from "../game/state";
import { fmtNum } from "./format";

const POSITIONS: Record<BodyId, { x: string; y: string }> = {
  earth: { x: "30%", y: "55%" },
  moon: { x: "55%", y: "40%" },
  lunar_habitat: { x: "65%", y: "30%" },
  nea_04: { x: "82%", y: "65%" },
};

export function MapView({ game, gotoProduction }: { game: GameApi; gotoProduction: (b: BodyId) => void }) {
  const s = game.state;
  const [sel, setSel] = useState<BodyId | null>("nea_04");

  // State ref is mutated in place — recompute every render rather than useMemo.
  const bodies: BodyId[] = ["earth", "moon", "nea_04"];
  if (s.populations.lunar_habitat) bodies.push("lunar_habitat");

  const activeRoutes = s.ships.filter((sh) => sh.route).map((sh) => sh.route!);

  const alertsByBody = new Map<BodyId, number>();
  for (const a of s.alerts) {
    if (!a.resolved && a.bodyId) alertsByBody.set(a.bodyId, (alertsByBody.get(a.bodyId) ?? 0) + 1);
  }

  return (
    <div className="workspace">
      <h1>Map</h1>
      <div className="subtitle">Solar map (MLP slice — Earth orbit, Moon, NEA-04, First Habitat)</div>

      <div className="map-canvas">
        {/* Route arcs: simple straight lines between body centers */}
        {activeRoutes.map((r, i) => {
          const a = POSITIONS[r.fromBodyId];
          const b = POSITIONS[r.toBodyId];
          if (!a || !b) return null;
          // Render arc as a CSS-rotated div (degenerate; just a visual hint)
          return (
            <svg
              key={i}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
              width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
            >
              <line
                x1={parseFloat(a.x)} y1={parseFloat(a.y)}
                x2={parseFloat(b.x)} y2={parseFloat(b.y)}
                stroke="var(--accent-cyan-dim)" strokeWidth="0.3"
                strokeDasharray="1.5,1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          );
        })}

        {bodies.map((bid) => {
          const body = s.bodies[bid];
          const pos = POSITIONS[bid];
          const hasAlert = (alertsByBody.get(bid) ?? 0) > 0;
          const isSel = sel === bid;
          return (
            <div
              key={bid}
              className={`map-body ${hasAlert ? "alert" : ""} ${isSel ? "selected" : ""}`}
              style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
              onClick={() => setSel(bid)}
            >
              <div className="name">{body.name}</div>
              <div className="meta">{body.type} · {body.gridW}×{body.gridH}</div>
              {body.buildings.length > 0 && <div className="meta">{body.buildings.length} bldg</div>}
              {hasAlert && <div className="meta" style={{ color: "var(--accent-amber)" }}>! {alertsByBody.get(bid)}</div>}
            </div>
          );
        })}
      </div>

      {sel && (
        <div className="card mt-12">
          <div className="row between">
            <div>
              <strong>{s.bodies[sel].name}</strong>
              <span className="dim mono" style={{ marginLeft: 8 }}>{s.bodies[sel].type} · grid {s.bodies[sel].gridW}×{s.bodies[sel].gridH}</span>
            </div>
            <div className="row gap-8">
              <button className="btn" onClick={() => gotoProduction(sel)}>Build Here</button>
            </div>
          </div>

          <table className="data" style={{ marginTop: 10 }}>
            <thead>
              <tr><th>Resource</th><th className="num">Stock</th></tr>
            </thead>
            <tbody>
              {Object.entries(s.bodies[sel].warehouse).filter(([, q]) => (q ?? 0) > 0.001).length === 0 ? (
                <tr><td colSpan={2} className="dim">empty warehouse</td></tr>
              ) : (
                Object.entries(s.bodies[sel].warehouse).filter(([, q]) => (q ?? 0) > 0.001).map(([rid, qty]) => (
                  <tr key={rid}>
                    <td>{rid.replace(/_/g, " ")}</td>
                    <td className="num">{fmtNum(qty as number)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="card mt-12">
        <strong>Active routes</strong>
        {activeRoutes.length === 0 ? (
          <div className="dim mono" style={{ marginTop: 6 }}>No ships in transit.</div>
        ) : (
          <table className="data" style={{ marginTop: 6 }}>
            <thead>
              <tr><th>Ship</th><th>Route</th><th>Cargo</th><th className="num">ETA</th></tr>
            </thead>
            <tbody>
              {s.ships.filter((sh) => sh.route).map((sh) => (
                <tr key={sh.id}>
                  <td>{sh.name}</td>
                  <td>{s.bodies[sh.route!.fromBodyId].name} → {s.bodies[sh.route!.toBodyId].name}</td>
                  <td className="dim">{sh.route!.cargoResource ? `${sh.route!.cargoQty} ${sh.route!.cargoResource.replace(/_/g, " ")}` : "empty"}</td>
                  <td className="num">{Math.max(0, Math.round(sh.route!.travelSecRemaining))}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
