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
  const [missionFor, setMissionFor] = useState<string | null>(null);
  // Routing UI hides bodies the colony hasn't discovered yet (comets pre-scout)
  // and the lunar habitat slot before the prefab is bought — same rule the maps use.
  const bodyOptions: { id: BodyId; label: string }[] = visibleBodies(s).map((id) => ({
    id,
    label: s.bodies[id].name,
  }));
  // Miner-1 picks from discovered comets only — those are the only mineable
  // bodies in v1. Empty = "no targets surveyed yet, send a Scout first".
  const cometOptions: BodyId[] = visibleBodies(s).filter((id) => s.bodies[id].type === "comet");

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
            <button className="btn" onClick={() => {
              const r = game.buyShip("tanker_1");
              if (!r.ok) alert(r.reason);
            }} disabled={s.credits < SHIPS.tanker_1.earthBuy}>
              Buy Tanker-1 ({fmtCredits(SHIPS.tanker_1.earthBuy)})
            </button>
          </div>
        </div>
        <div className="dim mono" style={{ fontSize: 11 }}>
          Hauler-1: {SHIPS.hauler_1.capacitySolid} solid · vmax {SHIPS.hauler_1.maxSpeedUnits.toFixed(1)} u/s ·
          {" "}Scout-1: no cargo · vmax {SHIPS.scout_1.maxSpeedUnits.toFixed(1)} u/s ·
          {" "}Miner-1: {SHIPS.miner_1.capacitySolid} solid · vmax {SHIPS.miner_1.maxSpeedUnits.toFixed(1)} u/s · comet runs ·
          {" "}Tanker-1: {SHIPS.tanker_1.capacityFluid} fluid · vmax {SHIPS.tanker_1.maxSpeedUnits.toFixed(1)} u/s
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
            const isMiner = sh.defId === "miner_1";
            const onMission = !!sh.miningMission;
            return (
            <tr key={sh.id}>
              <td>
                {sh.name}
                <div className="dim mono" style={{ fontSize: 10 }}>{SHIPS[sh.defId].name}</div>
              </td>
              <td>
                <span className={`tag ${sh.status === "idle" ? "warn" : "ok"}`}>{sh.status}</span>
                {onMission && (
                  <span className="tag" style={{ marginLeft: 6 }}>mission</span>
                )}
                {sh.miningOp && !onMission && (
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
                {sh.miningMission && (
                  <div className="dim mono" style={{ fontSize: 11 }}>
                    Mining mission · target {s.bodies[sh.miningMission.cometBodyId].name} ·
                    {" "}{fmtNum(sh.miningMission.cargoQty)} {RESOURCES[sh.miningMission.resource].name}/cycle
                    {!sh.miningOp && !sh.route && " · awaiting cycle"}
                  </div>
                )}
                {sh.miningOp && !sh.miningMission && (
                  <div className="dim mono" style={{ fontSize: 11 }}>
                    Loop: {s.bodies[sh.miningOp.fromBodyId].name} ⇄ {s.bodies[sh.miningOp.toBodyId].name} ·
                    {" "}{fmtNum(sh.miningOp.cargoQty)} {RESOURCES[sh.miningOp.cargoResource].name}/cycle
                    {sh.miningOp.minOriginStock !== undefined && (
                      <> · waits for ≥ {fmtNum(sh.miningOp.minOriginStock)} at origin</>
                    )}
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
                {!sh.route && !isScout && !isMiner && (
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
                {isMiner && !onMission && !sh.route && (
                  <button
                    className="btn tiny"
                    onClick={() => setMissionFor(sh.id)}
                    disabled={cometOptions.length === 0}
                    title={cometOptions.length === 0
                      ? "No comets surveyed yet. Send a Scout-1 to discover one first."
                      : "Pick a target comet. Miner-1 will fly there, load up, sell at Earth, repeat."}
                  >
                    Send mining mission
                  </button>
                )}
                {onMission && (
                  <button
                    className="btn tiny"
                    style={{ marginLeft: 6 }}
                    onClick={() => game.stopMiningOp(sh.id)}
                    title="Cancel the mission. The current leg completes; ship idles after it returns home."
                  >
                    Stop mission
                  </button>
                )}
                {sh.miningOp && !onMission && (
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
      {missionFor && (
        <MiningMissionModal
          game={game}
          shipId={missionFor}
          cometOptions={cometOptions}
          onClose={() => setMissionFor(null)}
        />
      )}
    </div>
  );
}

function MiningMissionModal({
  game,
  shipId,
  cometOptions,
  onClose,
}: {
  game: GameApi;
  shipId: string;
  cometOptions: BodyId[];
  onClose: () => void;
}) {
  const s = game.state;
  const ship = s.ships.find((x) => x.id === shipId)!;
  // Pure helper — given a comet body, return its mineable solids sorted by
  // stockpile (largest first). Lets target-change handlers compute the
  // matching default cargo in one pass without a sync useEffect.
  const solidsAt = (id: BodyId): ResourceId[] =>
    (Object.keys(s.bodies[id].warehouse) as ResourceId[])
      .filter((rid) => RESOURCES[rid].cargo === "solid" && (s.bodies[id].warehouse[rid] ?? 0) > 0)
      .sort((a, b) => (s.bodies[id].warehouse[b] ?? 0) - (s.bodies[id].warehouse[a] ?? 0));
  const initialTarget = cometOptions[0];
  const [pick, setPick] = useState<{ target: BodyId; resource: ResourceId | "" }>(() => ({
    target: initialTarget,
    resource: solidsAt(initialTarget)[0] ?? "",
  }));
  const targetBody = s.bodies[pick.target];
  const cargoOptions = solidsAt(pick.target);
  const cap = SHIPS.miner_1.capacitySolid;
  const onConfirm = () => {
    if (!pick.resource) {
      alert(`${targetBody.name} has no minable solids`);
      return;
    }
    const r = game.dispatchMiningMission(shipId, pick.target, pick.resource);
    if (!r.ok) {
      alert(r.reason);
      return;
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Mining mission: {ship.name}</h3>
        <div className="dim mono" style={{ fontSize: 11, marginBottom: 8 }}>
          Miner-1 flies to the target, loads {cap} solid, returns to Earth, sells, and repeats.
          Use Stop mission to end the loop.
        </div>
        <div className="col gap-8">
          <label>Target
            <select
              value={pick.target}
              onChange={(e) => {
                const next = e.target.value as BodyId;
                setPick({ target: next, resource: solidsAt(next)[0] ?? "" });
              }}
              style={selectStyle}
            >
              {cometOptions.map((id) => (
                <option key={id} value={id}>{s.bodies[id].name}</option>
              ))}
            </select>
            <div className="dim mono" style={{ fontSize: 11 }}>
              Departing {s.bodies[ship.locationBodyId].name} → {targetBody.name}.
            </div>
          </label>
          <label>Cargo (solid)
            <select
              value={pick.resource}
              onChange={(e) => setPick({ ...pick, resource: e.target.value as ResourceId })}
              style={selectStyle}
            >
              {cargoOptions.length === 0 && <option value="">— no minable stock</option>}
              {cargoOptions.map((rid) => (
                <option key={rid} value={rid}>
                  {RESOURCES[rid].name} ({fmtNum(targetBody.warehouse[rid] ?? 0)} on site)
                </option>
              ))}
            </select>
          </label>
          {pick.resource && (
            <div className="dim mono" style={{ fontSize: 11 }}>
              Sell on arrival at Earth at {RESOURCES[pick.resource as ResourceId].earthSell}/unit.
            </div>
          )}
          <div className="row gap-8 mt-12">
            <button className="btn primary" onClick={onConfirm} disabled={cargoOptions.length === 0}>
              Launch mission
            </button>
            <button className="btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteEditor({ game, shipId, bodyOptions, onClose }: { game: GameApi; shipId: string; bodyOptions: { id: BodyId; label: string }[]; onClose: () => void }) {
  const s = game.state;
  const ship = s.ships.find((x) => x.id === shipId)!;
  const shipDef = SHIPS[ship.defId];
  // Hulls are single-class in MLP — pick the dimension this hull actually carries.
  const hullClass: "solid" | "fluid" | null =
    shipDef.capacitySolid > 0 ? "solid" : shipDef.capacityFluid > 0 ? "fluid" : null;
  const cap = hullClass === "solid" ? shipDef.capacitySolid : shipDef.capacityFluid;
  const [from, setFrom] = useState<BodyId>(ship.locationBodyId);
  const fallbackTo = (bodyOptions.find((b) => b.id !== from) ?? bodyOptions[0]).id;
  const [to, setTo] = useState<BodyId>(fallbackTo);
  const [resource, setResource] = useState<ResourceId | "empty">("empty");
  const [repeat, setRepeat] = useState(true);
  const [qty, setQty] = useState<number>(Math.min(30, cap));
  // Optional stock-maintain trigger: only re-dispatch the loop when origin
  // has at least this much of the cargo resource. 0 = no threshold.
  const [minOriginStock, setMinOriginStock] = useState<number>(0);

  const fromBody = s.bodies[from];
  const cargoOptions = (Object.keys(fromBody.warehouse) as ResourceId[])
    .filter((rid) => (fromBody.warehouse[rid] ?? 0) > 0 && hullClass !== null && RESOURCES[rid].cargo === hullClass);

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
      repeat && resource !== "empty" && minOriginStock > 0 ? minOriginStock : undefined,
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
          <label>Cargo ({hullClass ?? "none"} only)
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
          {repeat && resource !== "empty" && (
            <label>Min origin stock to re-dispatch (0 = always)
              <input type="number" value={minOriginStock} min={0}
                onChange={(e) => setMinOriginStock(Math.max(0, Number(e.target.value) || 0))}
                style={selectStyle as React.CSSProperties}
              />
              <div className="dim mono" style={{ fontSize: 11 }}>
                Loop pauses at origin until {RESOURCES[resource as ResourceId].name} stockpile ≥ threshold, then auto-resumes.
              </div>
            </label>
          )}
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
