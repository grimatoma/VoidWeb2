import { useState } from "react";
import type { GameApi } from "../game/useGame";
import type { BodyId } from "../game/state";
import { fmtNum } from "./format";
import { SolarCanvas } from "./SolarCanvas";

export function MapView({ game, gotoProduction }: { game: GameApi; gotoProduction: (b: BodyId) => void }) {
  const s = game.state;
  const [sel, setSel] = useState<BodyId | null>("nea_04");

  const activeRoutes = s.ships.filter((sh) => sh.route);

  return (
    <div className="workspace">
      <h1>Map</h1>
      <div className="subtitle">Solar map · Sun-centered orbits · ships interpolate along their routes</div>

      <div className="map-shell">
        <SolarCanvas state={s} selectedBodyId={sel} onSelectBody={setSel} />
      </div>

      {sel && (
        <div className="card mt-12">
          <div className="row between">
            <div>
              <strong>{s.bodies[sel].name}</strong>
              <span className="dim mono" style={{ marginLeft: 8 }}>
                {s.bodies[sel].type} · grid {s.bodies[sel].gridW}×{s.bodies[sel].gridH}
              </span>
            </div>
            <div className="row gap-8">
              <button className="btn" onClick={() => gotoProduction(sel)}>
                Build Here
              </button>
            </div>
          </div>

          <table className="data" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Resource</th>
                <th className="num">Stock</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(s.bodies[sel].warehouse).filter(([, q]) => (q ?? 0) > 0.001).length === 0 ? (
                <tr>
                  <td colSpan={2} className="dim">
                    empty warehouse
                  </td>
                </tr>
              ) : (
                Object.entries(s.bodies[sel].warehouse)
                  .filter(([, q]) => (q ?? 0) > 0.001)
                  .map(([rid, qty]) => (
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
          <div className="dim mono" style={{ marginTop: 6 }}>
            No ships in transit.
          </div>
        ) : (
          <table className="data" style={{ marginTop: 6 }}>
            <thead>
              <tr>
                <th>Ship</th>
                <th>Route</th>
                <th>Cargo</th>
                <th className="num">Progress</th>
                <th className="num">ETA</th>
              </tr>
            </thead>
            <tbody>
              {activeRoutes.map((sh) => {
                const r = sh.route!;
                const pct = Math.round(((r.travelSecTotal - r.travelSecRemaining) / Math.max(1, r.travelSecTotal)) * 100);
                return (
                  <tr key={sh.id}>
                    <td>{sh.name}</td>
                    <td>
                      {s.bodies[r.fromBodyId].name} → {s.bodies[r.toBodyId].name}
                    </td>
                    <td className="dim">
                      {r.cargoResource ? `${r.cargoQty} ${r.cargoResource.replace(/_/g, " ")}` : "empty"}
                    </td>
                    <td className="num">{pct}%</td>
                    <td className="num">{Math.max(0, Math.round(r.travelSecRemaining))}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
