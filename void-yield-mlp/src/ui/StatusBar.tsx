import type { GameApi } from "../game/useGame";
import { fmtCredits, fmtGameTime, fmtNum } from "./format";

export function StatusBar({ game }: { game: GameApi }) {
  const s = game.state;
  const earth = s.bodies.earth.warehouse;
  const nea = s.bodies.nea_04.warehouse;
  const refinedMetal = (earth.refined_metal ?? 0) + (nea.refined_metal ?? 0);
  const fuel = (earth.hydrogen_fuel ?? 0) + (nea.hydrogen_fuel ?? 0);
  const o2 = (earth.oxygen ?? 0) + (s.bodies.lunar_habitat.warehouse.oxygen ?? 0);
  const water = (nea.water_ice ?? 0) + (s.bodies.lunar_habitat.warehouse.water_ice ?? 0);
  const activeAlerts = s.alerts.filter((a) => !a.resolved).length;
  const crit = s.alerts.some((a) => !a.resolved && a.severity === "critical");

  return (
    <div className="statusbar">
      <span className="brand">{s.companyName}</span>
      <span className="stat credits"><strong>{fmtCredits(s.credits)}</strong></span>
      <span className="stat"><strong>Metals</strong> {fmtNum(refinedMetal)}</span>
      <span className="stat"><strong>Fuel</strong> {fmtNum(fuel)}</span>
      <span className="stat"><strong>O2</strong> {fmtNum(o2)}</span>
      <span className="stat"><strong>Water</strong> {fmtNum(water)}</span>
      <span className="stat"><strong>Tier</strong> T{s.tier}</span>
      {activeAlerts > 0 && (
        <span className={`alert-badge ${crit ? "crit" : ""}`}>{activeAlerts} alert{activeAlerts === 1 ? "" : "s"}</span>
      )}
      <span className="spacer" />
      <span className="gametime">t+{fmtGameTime(s.gameTimeSec)}</span>
    </div>
  );
}
