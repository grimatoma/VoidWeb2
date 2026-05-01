import { useState } from "react";
import type { GameApi } from "../game/useGame";
import type { BodyId, RouteStop, StopAction } from "../game/state";
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
                    {sh.miningOp.minOriginStock !== undefined && (
                      <> · waits for ≥ {fmtNum(sh.miningOp.minOriginStock)} at origin</>
                    )}
                  </div>
                )}
                {sh.itinerary && (
                  <div className="dim mono" style={{ fontSize: 11 }}>
                    Itinerary ({sh.itinerary.stops.length} stops{sh.itinerary.loop ? " · looping" : ""}
                    {sh.itinerary.paused ? " · paused" : ""}): {" "}
                    {sh.itinerary.stops.map((st, i) => (
                      <span key={i}>
                        {i > 0 && " → "}
                        <span style={{ fontWeight: i === sh.itinerary!.currentIdx ? 600 : 400 }}>
                          {s.bodies[st.bodyId].name}
                        </span>
                      </span>
                    ))}
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
                {sh.itinerary && (
                  <button
                    className="btn tiny"
                    style={{ marginLeft: 6 }}
                    onClick={() => game.stopItinerary(sh.id)}
                    title="Cancel the itinerary. Current leg finishes; ship idles on arrival."
                  >
                    Stop itinerary
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
  const [mode, setMode] = useState<"single" | "multi">("single");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row gap-8" style={{ marginBottom: 8 }}>
          <button
            className={`btn tiny ${mode === "single" ? "primary" : ""}`}
            onClick={() => setMode("single")}
          >
            Single leg
          </button>
          <button
            className={`btn tiny ${mode === "multi" ? "primary" : ""}`}
            onClick={() => setMode("multi")}
          >
            Multi-stop
          </button>
        </div>
        {mode === "single" ? (
          <SingleLegEditor game={game} shipId={shipId} bodyOptions={bodyOptions} onClose={onClose} />
        ) : (
          <MultiStopEditor game={game} shipId={shipId} bodyOptions={bodyOptions} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function SingleLegEditor({ game, shipId, bodyOptions, onClose }: { game: GameApi; shipId: string; bodyOptions: { id: BodyId; label: string }[]; onClose: () => void }) {
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
    <>
      <h3 style={{ marginTop: 0 }}>Single leg: {ship.name}</h3>
      <div className="dim mono" style={{ fontSize: 11, marginBottom: 8 }}>
        Fuel cost: {shipDef.fuelPerRoute} base + {shipDef.fuelPerDistance.toFixed(2)} per distance unit.
        {" "}Earth dispatches auto-buy fuel from the market if local stock is short.
      </div>
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
    </>
  );
}

function MultiStopEditor({ game, shipId, bodyOptions, onClose }: { game: GameApi; shipId: string; bodyOptions: { id: BodyId; label: string }[]; onClose: () => void }) {
  const s = game.state;
  const ship = s.ships.find((x) => x.id === shipId)!;
  const shipDef = SHIPS[ship.defId];
  const hullClass: "solid" | "fluid" | null =
    shipDef.capacitySolid > 0 ? "solid" : shipDef.capacityFluid > 0 ? "fluid" : null;

  // Itinerary always starts at the ship's current location — the sim rejects
  // anything else, so we lock stops[0] to ship.locationBodyId. The player adds
  // additional stops after; the first leg is locationBodyId → stops[1].
  const [stops, setStops] = useState<RouteStop[]>(() => [
    { bodyId: ship.locationBodyId, actions: [] },
    { bodyId: bodyOptions.find((b) => b.id !== ship.locationBodyId)?.id ?? "earth", actions: [{ kind: "unload" }] },
  ]);
  const [loop, setLoop] = useState(true);

  const updateStop = (idx: number, patch: Partial<RouteStop>) => {
    setStops((prev) => prev.map((st, i) => (i === idx ? { ...st, ...patch } : st)));
  };
  const updateAction = (stopIdx: number, actionIdx: number, action: StopAction) => {
    setStops((prev) =>
      prev.map((st, i) =>
        i === stopIdx
          ? { ...st, actions: st.actions.map((a, j) => (j === actionIdx ? action : a)) }
          : st,
      ),
    );
  };
  const addAction = (stopIdx: number, action: StopAction) => {
    setStops((prev) =>
      prev.map((st, i) =>
        i === stopIdx ? { ...st, actions: [...st.actions, action] } : st,
      ),
    );
  };
  const removeAction = (stopIdx: number, actionIdx: number) => {
    setStops((prev) =>
      prev.map((st, i) =>
        i === stopIdx
          ? { ...st, actions: st.actions.filter((_, j) => j !== actionIdx) }
          : st,
      ),
    );
  };
  const addStop = () => {
    setStops((prev) => [
      ...prev,
      { bodyId: bodyOptions[0].id, actions: [{ kind: "unload" }] },
    ]);
  };
  const removeStop = (idx: number) => {
    if (idx === 0) return; // first stop is locked
    setStops((prev) => prev.filter((_, i) => i !== idx));
  };

  const onConfirm = () => {
    const r = game.startItinerary(shipId, stops, loop);
    if (!r.ok) {
      alert(r.reason);
      return;
    }
    onClose();
  };

  return (
    <>
      <h3 style={{ marginTop: 0 }}>Multi-stop: {ship.name}</h3>
      <div className="dim mono" style={{ fontSize: 11, marginBottom: 8 }}>
        Each stop runs its actions in order on arrival. Fuel is drawn at every leg's
        origin body (Earth auto-buys from market if short).
      </div>
      <div className="col gap-8">
        {stops.map((stop, i) => (
          <div key={i} className="card col gap-8" style={{ padding: 8 }}>
            <div className="row between">
              <strong>Stop {i + 1}{i === 0 ? " · start" : ""}</strong>
              {i > 0 && (
                <button className="btn tiny" onClick={() => removeStop(i)}>Remove stop</button>
              )}
            </div>
            <label>Body
              <select
                value={stop.bodyId}
                onChange={(e) => updateStop(i, { bodyId: e.target.value as BodyId })}
                style={selectStyle}
                disabled={i === 0}
              >
                {bodyOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
              {i === 0 && (
                <div className="dim mono" style={{ fontSize: 11 }}>Locked to ship's current location.</div>
              )}
            </label>
            <div className="col gap-8">
              {stop.actions.length === 0 && (
                <div className="dim mono" style={{ fontSize: 11 }}>(no actions — ship just passes through)</div>
              )}
              {stop.actions.map((action, j) => (
                <ActionRow
                  key={j}
                  action={action}
                  hullClass={hullClass}
                  bodyId={stop.bodyId}
                  body={s.bodies[stop.bodyId]}
                  onChange={(a) => updateAction(i, j, a)}
                  onRemove={() => removeAction(i, j)}
                />
              ))}
              <div className="row gap-8">
                <button
                  className="btn tiny"
                  onClick={() => addAction(i, { kind: "load", resource: hullClass === "fluid" ? "hydrogen_fuel" : "iron_ore" })}
                >
                  + Load
                </button>
                <button className="btn tiny" onClick={() => addAction(i, { kind: "unload" })}>
                  + Unload
                </button>
                {stop.bodyId === "earth" && (
                  <button className="btn tiny" onClick={() => addAction(i, { kind: "sell" })}>
                    + Sell at Earth
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <button className="btn" onClick={addStop}>+ Add stop</button>
        <label className="row gap-8">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
          Loop (after the last stop, return to stop 1 and repeat)
        </label>
        <div className="row gap-8 mt-12">
          <button className="btn primary" onClick={onConfirm}>Confirm itinerary</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </>
  );
}

function ActionRow({
  action,
  hullClass,
  bodyId,
  body,
  onChange,
  onRemove,
}: {
  action: StopAction;
  hullClass: "solid" | "fluid" | null;
  bodyId: BodyId;
  body: { warehouse: Partial<Record<ResourceId, number>> };
  onChange: (a: StopAction) => void;
  onRemove: () => void;
}) {
  if (action.kind === "load") {
    const cargoOptions = (Object.keys(RESOURCES) as ResourceId[]).filter(
      (rid) => hullClass !== null && RESOURCES[rid].cargo === hullClass,
    );
    return (
      <div className="row gap-8" style={{ alignItems: "center" }}>
        <span className="tag" style={{ minWidth: 60 }}>load</span>
        <select
          value={action.resource}
          onChange={(e) => onChange({ ...action, resource: e.target.value as ResourceId })}
          style={{ ...selectStyle, width: "auto", marginTop: 0 }}
        >
          {cargoOptions.map((rid) => (
            <option key={rid} value={rid}>
              {RESOURCES[rid].name} ({fmtNum(body.warehouse[rid] ?? 0)} on hand)
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="qty (cap)"
          value={action.qty ?? ""}
          min={1}
          onChange={(e) =>
            onChange({ ...action, qty: e.target.value === "" ? undefined : Math.max(1, Number(e.target.value)) })
          }
          style={{ ...selectStyle, width: 80, marginTop: 0 }}
        />
        <input
          type="number"
          placeholder="min stock"
          value={action.minOriginStock ?? ""}
          min={0}
          onChange={(e) =>
            onChange({
              ...action,
              minOriginStock: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)),
            })
          }
          style={{ ...selectStyle, width: 100, marginTop: 0 }}
          title="If set, the itinerary parks here until this body has ≥ minOriginStock of the cargo resource."
        />
        <button className="btn tiny" onClick={onRemove}>×</button>
      </div>
    );
  }
  if (action.kind === "sell" && bodyId !== "earth") {
    return (
      <div className="row gap-8" style={{ alignItems: "center" }}>
        <span className="tag warn">sell (Earth only — invalid here)</span>
        <button className="btn tiny" onClick={onRemove}>×</button>
      </div>
    );
  }
  return (
    <div className="row gap-8" style={{ alignItems: "center" }}>
      <span className="tag" style={{ minWidth: 60 }}>{action.kind}</span>
      <span className="dim mono" style={{ fontSize: 11 }}>
        {action.kind === "unload" && "drop all cargo into this body's warehouse"}
        {action.kind === "sell" && "sell all cargo at Earth (earthSell price)"}
      </span>
      <button className="btn tiny" onClick={onRemove}>×</button>
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
