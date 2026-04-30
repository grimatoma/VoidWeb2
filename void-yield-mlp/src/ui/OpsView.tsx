import type { GameApi } from "../game/useGame";
import { TIER_GATE_T0_T1 } from "../game/defs";
import type { DestId } from "./Rail";
import { fmtCredits, fmtNum, fmtTimeAway } from "./format";

export function OpsView({
  game,
  goto,
}: {
  game: GameApi;
  goto: (d: DestId) => void;
}) {
  const s = game.state;
  // The state ref is mutated in place on each tick, so we recompute every render
  // (no useMemo) — the parent's version-counter re-render fires anyway.
  const activeAlerts = s.alerts.filter((a) => !a.resolved).slice(-12).reverse();

  const idleShips = s.ships.filter((sh) => sh.status === "idle" && !sh.route);
  const onAutoAssign = (shipId: string) => {
    const ship = s.ships.find((x) => x.id === shipId);
    if (!ship) return;
    const nea = s.bodies.nea_04;
    const haveMetal = (nea.warehouse.refined_metal ?? 0) >= 10;
    const haveOre = (nea.warehouse.iron_ore ?? 0) >= 10;
    // At NEA-04: ship out the highest-value cargo to Earth.
    if (ship.locationBodyId === "nea_04") {
      if (haveMetal) {
        game.startRoute(shipId, "nea_04", "earth", "refined_metal", true, true);
      } else if (haveOre) {
        game.startRoute(shipId, "nea_04", "earth", "iron_ore", true, true);
      } else {
        // No cargo here — return empty to Earth.
        game.startRoute(shipId, "nea_04", "earth", null, false, false);
      }
      return;
    }
    // At Earth (or anywhere else): if NEA has cargo, deadhead to pick it up.
    if (ship.locationBodyId === "earth") {
      if (haveMetal || haveOre) {
        game.startRoute(shipId, "earth", "nea_04", null, false, false);
      } else {
        // Nothing to do — also send to NEA so it's pre-positioned for the next batch.
        game.startRoute(shipId, "earth", "nea_04", null, false, false);
      }
    }
  };

  const productionHotList: { name: string; status: "ok" | "stalled"; bodyName: string }[] = [];
  for (const body of Object.values(s.bodies)) {
    for (const b of body.buildings) {
      productionHotList.push({
        name: `${b.defId.replace(/_/g, " ")} (${body.name})`,
        status: b.paused ? "stalled" : "ok",
        bodyName: body.name,
      });
    }
  }
  productionHotList.splice(6);

  const tierGateMet = s.tierUpReady;

  return (
    <div className="workspace" style={{ overflowY: "auto" }}>
      <h1>Ops</h1>
      <div className="subtitle">90-second check-in. Resolve top issue, dispatch idle ships, glance state.</div>

      {tierGateMet && !s.tierUpClaimed[1] && (
        <div className="card" style={{ borderColor: "var(--accent-cyan)", background: "var(--bg-panel-2)" }}>
          <div className="row between">
            <div>
              <div style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>T1 ready: Lunar Foothold available</div>
              <div className="dim mono" style={{ fontSize: 12, marginTop: 2 }}>
                Both gate conditions met. Open Milestones to claim.
              </div>
            </div>
            <button className="btn primary" onClick={() => goto("milestones")}>Open Milestones</button>
          </div>
        </div>
      )}

      <h2>Critical alerts</h2>
      {activeAlerts.length === 0 ? (
        <div className="card dim">All systems nominal.</div>
      ) : (
        activeAlerts.slice(0, 5).map((a) => (
          <div key={a.id} className={`alert-card ${a.severity === "critical" ? "crit" : a.severity === "info" ? "info" : ""}`}>
            <span className={`severity-icon ${a.severity}`} />
            <div className="body">
              <div className="title">{a.title}</div>
              {a.body && <div className="meta">{a.body}</div>}
              <div className="meta">t+{Math.floor(a.ts)}s</div>
            </div>
            <button className="btn tiny" onClick={() => game.dismissAlert(a.id)}>Dismiss</button>
          </div>
        ))
      )}

      <h2>Idle ships</h2>
      {idleShips.length === 0 ? (
        <div className="card dim">No idle ships.</div>
      ) : (
        idleShips.map((ship) => (
          <div key={ship.id} className="card row between">
            <div>
              <strong>{ship.name}</strong>
              <span className="dim mono" style={{ marginLeft: 8 }}>at {s.bodies[ship.locationBodyId].name}</span>
            </div>
            <div className="row gap-8">
              <button className="btn primary" onClick={() => onAutoAssign(ship.id)}>Auto-assign</button>
            </div>
          </div>
        ))
      )}

      <h2>Production hot list</h2>
      {productionHotList.length === 0 ? (
        <div className="card dim">No buildings yet — visit Production to place your first.</div>
      ) : (
        <div className="card">
          {productionHotList.map((r, i) => (
            <div key={i} className="row between" style={{ padding: "4px 0", borderBottom: i < productionHotList.length - 1 ? "1px solid var(--line)" : "none" }}>
              <span>{r.name}</span>
              <span className={`tag ${r.status === "ok" ? "ok" : "warn"}`}>{r.status}</span>
            </div>
          ))}
        </div>
      )}

      <h2>Tier-gate progress</h2>
      <div className="card">
        <div className="gate-row">
          <div className="label">
            <span>Sell Refined Metal to Earth</span>
            <span>{fmtNum(s.refinedMetalSoldLifetime)} / {TIER_GATE_T0_T1.conditions.refinedMetalSold}</span>
          </div>
          <div className="bar"><i style={{ width: `${Math.min(100, (s.refinedMetalSoldLifetime / TIER_GATE_T0_T1.conditions.refinedMetalSold) * 100)}%` }} /></div>
        </div>
        <div className="gate-row">
          <div className="label">
            <span>Hydrogen Fuel reserves</span>
            <span>{fmtNum((s.bodies.earth.warehouse.hydrogen_fuel ?? 0) + (s.bodies.nea_04.warehouse.hydrogen_fuel ?? 0))} / {TIER_GATE_T0_T1.conditions.hydrogenFuelReserves}</span>
          </div>
          <div className="bar">
            <i style={{ width: `${Math.min(100, (((s.bodies.earth.warehouse.hydrogen_fuel ?? 0) + (s.bodies.nea_04.warehouse.hydrogen_fuel ?? 0)) / TIER_GATE_T0_T1.conditions.hydrogenFuelReserves) * 100)}%` }} />
          </div>
        </div>
      </div>

      <h2>Recent log</h2>
      <div className="card mono" style={{ fontSize: 12, lineHeight: 1.7, maxHeight: 220, overflowY: "auto" }}>
        {s.log.length === 0 ? <span className="dim">Empty.</span> :
          s.log.slice(-20).reverse().map((l, i) => (
            <div key={i}>
              <span className="dim">t+{fmtTimeAway(l.ts)}</span> · {l.text}
            </div>
          ))
        }
      </div>
    </div>
  );
}

// re-export for use in App
export { fmtCredits };
