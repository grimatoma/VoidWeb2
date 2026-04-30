import { useState } from "react";
import type { GameApi } from "../game/useGame";
import type { BodyId } from "../game/state";
import type { ResourceId } from "../game/defs";
import { RESOURCES, SHIPS } from "../game/defs";
import { visibleBodies } from "../game/bodies";
import { fmtCredits, fmtNum } from "./format";

export function FleetView({ game }: { game: GameApi }) {
  const s = game.state;
  const [routeFor, setRouteFor] = useState<string | null>(null);
  // Routing UI hides bodies the colony hasn't discovered yet (comets pre-scout)
  // and the lunar habitat slot before the prefab is bought — same rule the maps use.
  const bodyOptions: { id: BodyId; label: string }[] = visibleBodies(s).map((id) => ({
    id,
    label: s.bodies[id].name,
  }));

  return (
    <div className="workspace">
      <h1>Fleet</h1>
      <div className="subtitle">Hauler · Scout · Miner</div>

      <div className="card col gap-8">
        <div className="row between">
          <div>
            <strong>{s.ships.length} ship{s.ships.length === 1 ? "" : "s"}</strong>
          </div>
          <div className="row gap-8">
            <button className="btn primary" onClick={() => {
              const r = game.buyShip("hauler_1");
              if (!r.ok) alert(r.reason);
            }} disabled={s.credits < SHIPS.hauler_1.earthBuy}>
              Buy Hauler-1 ({fmtCredits(SHIPS.hauler_1.earthBuy)})
            </button>
            <button className="btn" onClick={() => {
              const r = game.buyShip("scout_1");
              if (!r.ok) alert(r.reason);
            }} disabled={s.credits < SHIPS.scout_1.earthBuy}>
              Buy Scout-1 ({fmtCredits(SHIPS.scout_1.earthBuy)})
            </button>
            <button className="btn" onClick={() => {
              const r = game.buyShip("miner_1");
              if (!r.ok) alert(r.reason);
            }} disabled={s.credits < SHIPS.miner_1.earthBuy}>
              Buy Miner-1 ({fmtCredits(SHIPS.miner_1.earthBuy)})
            </button>
          </div>
        </div>
        <div className="dim mono" style={{ fontSize: 11 }}>
          Hauler-1: {SHIPS.hauler_1.capacitySolid} solid · vmax {SHIPS.hauler_1.maxSpeedUnits.toFixed(1)} u/s ·
          {" "}Scout-1: no cargo · vmax {SHIPS.scout_1.maxSpeedUnits.toFixed(1)} u/s ·
          {" "}Miner-1: {SHIPS.miner_1.capacitySolid} solid · vmax {SHIPS.miner_1.maxSpeedUnits.toFixed(1)} u/s · comet runs
        </div>
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
          {s.ships.map((sh) => {
            const isScout = sh.defId === "scout_1";
            return (
            <tr key={sh.id}>
              <td>
                {sh.name}
                <div className="dim mono" style={{ fontSize: 10 }}>{SHIPS[sh.defId].name}</div>
              </td>
              <td>
                <span className={`tag ${sh.status === "idle" ? "warn" : "ok"}`}>{sh.status}</span>
                {sh.miningOp && (
                  <span className="tag" style={{ marginLeft: 6 }}>loop</span>
                )}
                {sh.scoutOp && (
                  <span className="tag" style={{ marginLeft: 6 }}>scout</span>
                )}
              </td>
              <td>
                {sh.route
                  ? `${s.bodies[sh.route.fromBodyId].name} → ${s.bodies[sh.route.toBodyId].name} · ETA ${Math.max(0, Math.round(sh.route.travelSecRemaining))}s`
                  : `at ${s.bodies[sh.locationBodyId].name}`}
                {sh.miningOp && (
                  <div className="dim mono" style={{ fontSize: 11 }}>
                    Mining op: {s.bodies[sh.miningOp.fromBodyId].name} ⇄ {s.bodies[sh.miningOp.toBodyId].name} ·
                    {" "}{fmtNum(sh.miningOp.cargoQty)} {RESOURCES[sh.miningOp.cargoResource].name}/cycle
                  </div>
                )}
                {sh.scoutOp && (
                  <div className="dim mono" style={{ fontSize: 11 }}>
                    Scout mission · {sh.scoutOp.leg === "outbound" ? "outbound" : "returning"} · target {s.bodies[sh.scoutOp.targetBodyId].name}
                  </div>
                )}
              </td>
              <td className="dim">
                {sh.route?.cargoResource
                  ? `${fmtNum(sh.route.cargoQty)} ${RESOURCES[sh.route.cargoResource].name}`
                  : "—"}
              </td>
              <td>
                {!sh.route && !isScout && (
                  <button className="btn tiny" onClick={() => setRouteFor(sh.id)}>Assign route</button>
                )}
                {!sh.route && isScout && (
                  <button
                    className="btn tiny"
                    onClick={() => {
                      const r = game.dispatchScoutMission(sh.id);
                      if (!r.ok) alert(r.reason);
                    }}
                    title="Roundtrip Earth → NEA region → Earth. Refreshes the survey roster on return."
                  >
                    Send scout mission
                  </button>
                )}
                {sh.miningOp && (
                  <button
                    className="btn tiny"
                    style={{ marginLeft: 6 }}
                    onClick={() => game.stopMiningOp(sh.id)}
                    title="Cancel the loop. Current leg finishes; ship idles when it returns to origin."
                  >
                    Stop loop
                  </button>
                )}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>

      {routeFor && (
        <RouteEditor
          game={game}
          shipId={routeFor}
          bodyOptions={bodyOptions}
          onClose={() => setRouteFor(null)}
        />
      )}
    </div>
  );
}

function RouteEditor({ game, shipId, bodyOptions, onClose }: { game: GameApi; shipId: string; bodyOptions: { id: BodyId; label: string }[]; onClose: () => void }) {
  const s = game.state;
  const ship = s.ships.find((x) => x.id === shipId)!;
  const shipDef = SHIPS[ship.defId];
  const cap = shipDef.capacitySolid;
  const [from, setFrom] = useState<BodyId>(ship.locationBodyId);
  const fallbackTo = (bodyOptions.find((b) => b.id !== from) ?? bodyOptions[0]).id;
  const [to, setTo] = useState<BodyId>(fallbackTo);
  const [resource, setResource] = useState<ResourceId | "empty">("empty");
  const [repeat, setRepeat] = useState(true);
  const [qty, setQty] = useState<number>(Math.min(30, cap));

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
              {bodyOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
            <div className="dim mono" style={{ fontSize: 11 }}>Ships depart from their current location.</div>
          </label>
          <label>To
            <select value={to} onChange={(e) => setTo(e.target.value as BodyId)} style={selectStyle}>
              {bodyOptions.filter((b) => b.id !== from).map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
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
              <input type="number" value={qty} min={1} max={cap}
                onChange={(e) => setQty(Math.max(1, Math.min(cap, Number(e.target.value) || 0)))}
                style={selectStyle as React.CSSProperties}
              />
              <div className="dim mono" style={{ fontSize: 11 }}>{shipDef.name} capacity {cap}. Limited to available stock.</div>
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
