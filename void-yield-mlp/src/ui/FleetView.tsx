import { useState } from "react";
import type { GameApi } from "../game/useGame";
import type { BodyId } from "../game/state";
import type { ResourceId } from "../game/defs";
import { RESOURCES, SHIPS } from "../game/defs";
import { fmtCredits, fmtNum } from "./format";

const BODY_OPTIONS: { id: BodyId; label: string }[] = [
  { id: "earth", label: "Earth" },
  { id: "moon", label: "Moon" },
  { id: "nea_04", label: "NEA-04" },
  { id: "lunar_habitat", label: "First Habitat" },
];

export function FleetView({ game }: { game: GameApi }) {
  const s = game.state;
  const [routeFor, setRouteFor] = useState<string | null>(null);

  return (
    <div className="workspace">
      <h1>Fleet</h1>
      <div className="subtitle">Specialized solid (Hauler-1) · MLP</div>

      <div className="card row between">
        <div>
          <strong>{s.ships.length} ship{s.ships.length === 1 ? "" : "s"}</strong>
          <span className="dim mono" style={{ marginLeft: 8 }}>
            Hauler-1: {SHIPS.hauler_1.capacitySolid} solid ·
            {" "}accel {SHIPS.hauler_1.accelUnitsPerSec2.toFixed(1)} u/s² ·
            {" "}vmax {SHIPS.hauler_1.maxSpeedUnits.toFixed(1)} u/s
          </span>
        </div>
        <button className="btn primary" onClick={() => {
          const r = game.buyShip();
          if (!r.ok) alert(r.reason);
        }} disabled={s.credits < 3000}>
          Buy Hauler-1 ({fmtCredits(3000)})
        </button>
      </div>

      <table className="data">
        <thead>
          <tr>
            <th>Ship</th>
            <th>Status</th>
            <th>Location / Route</th>
            <th>Cargo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {s.ships.map((sh) => (
            <tr key={sh.id}>
              <td>{sh.name}</td>
              <td>
                <span className={`tag ${sh.status === "idle" ? "warn" : "ok"}`}>{sh.status}</span>
              </td>
              <td>
                {sh.route
                  ? `${s.bodies[sh.route.fromBodyId].name} → ${s.bodies[sh.route.toBodyId].name} · ETA ${Math.max(0, Math.round(sh.route.travelSecRemaining))}s`
                  : `at ${s.bodies[sh.locationBodyId].name}`}
              </td>
              <td className="dim">
                {sh.route?.cargoResource
                  ? `${fmtNum(sh.route.cargoQty)} ${RESOURCES[sh.route.cargoResource].name}`
                  : "—"}
              </td>
              <td>
                {!sh.route && (
                  <button className="btn tiny" onClick={() => setRouteFor(sh.id)}>Assign route</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {routeFor && (
        <RouteEditor
          game={game}
          shipId={routeFor}
          onClose={() => setRouteFor(null)}
        />
      )}
    </div>
  );
}

function RouteEditor({ game, shipId, onClose }: { game: GameApi; shipId: string; onClose: () => void }) {
  const s = game.state;
  const ship = s.ships.find((x) => x.id === shipId)!;
  const [from, setFrom] = useState<BodyId>(ship.locationBodyId);
  const [to, setTo] = useState<BodyId>(from === "earth" ? "nea_04" : "earth");
  const [resource, setResource] = useState<ResourceId | "empty">("empty");
  const [repeat, setRepeat] = useState(true);
  const [qty, setQty] = useState<number>(30);

  const fromBody = s.bodies[from];
  const cargoOptions = (Object.keys(fromBody.warehouse) as ResourceId[])
    .filter((rid) => (fromBody.warehouse[rid] ?? 0) > 0 && RESOURCES[rid].cargo === "solid");

  const sellOnArrival = to === "earth" && resource !== "empty";

  const onConfirm = () => {
    const r = game.startRoute(
      shipId,
      from,
      to,
      resource === "empty" ? null : resource,
      sellOnArrival,
      repeat,
      qty,
    );
    if (!r.ok) {
      alert(r.reason);
      return;
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Route: {ship.name}</h3>
        <div className="col gap-8">
          <label>From
            <select value={from} onChange={(e) => setFrom(e.target.value as BodyId)} style={selectStyle} disabled>
              {BODY_OPTIONS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
            <div className="dim mono" style={{ fontSize: 11 }}>Ships depart from their current location.</div>
          </label>
          <label>To
            <select value={to} onChange={(e) => setTo(e.target.value as BodyId)} style={selectStyle}>
              {BODY_OPTIONS.filter((b) => b.id !== from).map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </label>
          <label>Cargo (solid only)
            <select value={resource} onChange={(e) => setResource(e.target.value as ResourceId | "empty")} style={selectStyle}>
              <option value="empty">— empty (deadhead)</option>
              {cargoOptions.map((rid) => (
                <option key={rid} value={rid}>{RESOURCES[rid].name} ({fmtNum(fromBody.warehouse[rid] ?? 0)} avail)</option>
              ))}
            </select>
          </label>
          {resource !== "empty" && (
            <label>Quantity
              <input type="number" value={qty} min={1} max={30}
                onChange={(e) => setQty(Math.max(1, Math.min(30, Number(e.target.value) || 0)))}
                style={selectStyle as React.CSSProperties}
              />
              <div className="dim mono" style={{ fontSize: 11 }}>Hauler-1 capacity 30. Limited to available stock.</div>
            </label>
          )}
          {to === "earth" && resource !== "empty" && (
            <div className="dim mono" style={{ fontSize: 11 }}>
              Sell on arrival at Earth at {RESOURCES[resource as ResourceId].earthSell}/unit.
            </div>
          )}
          <label className="row gap-8">
            <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
            Repeat (return to origin and rerun)
          </label>
          <div className="row gap-8 mt-12">
            <button className="btn primary" onClick={onConfirm}>Confirm route</button>
            <button className="btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  background: "var(--bg-deep)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  borderRadius: 2,
  padding: "6px 8px",
  fontFamily: "var(--mono)",
};
