import type { GameApi } from "../game/useGame";
import { TIER_GATE_T0_T1 } from "../game/defs";
import { fmtNum } from "./format";

export function MilestonesView({ game }: { game: GameApi }) {
  const s = game.state;
  const earthFuel = s.bodies.earth.warehouse.hydrogen_fuel ?? 0;
  const neaFuel = s.bodies.nea_04.warehouse.hydrogen_fuel ?? 0;
  const totalFuel = earthFuel + neaFuel;
  const metalSold = s.refinedMetalSoldLifetime;

  const TIERS: { tier: number; name: string; status: "complete" | "current" | "locked" }[] = [
    { tier: 0, name: "Wildcatter", status: s.tier === 0 ? "current" : "complete" },
    { tier: 1, name: "Lunar Foothold", status: s.tier === 1 ? "current" : s.tier > 1 ? "complete" : "locked" },
  ];

  const claim = () => {
    const r = game.claimTierUp();
    if (!r.ok) alert(r.reason);
  };

  return (
    <div className="workspace">
      <h1>Milestones</h1>
      <div className="subtitle">Tier ladder · prestige preview · MLP slice covers T0 → T1</div>

      <div className="ladder">
        {TIERS.map((t) => (
          <div key={t.tier} className={`step ${t.status}`}>
            T{t.tier} · {t.name}
          </div>
        ))}
        <div className="step locked">T2+ · deferred</div>
      </div>

      {s.tier === 0 && (
        <div className="card">
          <strong>Next: T1 Lunar Foothold</strong>
          <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>
            Both conditions must be met simultaneously. The "moment" lands when Ops fires the tier-up alert.
          </div>

          <div className="gate-row">
            <div className="label">
              <span>Sell Refined Metal to Earth</span>
              <span>{fmtNum(metalSold)} / {TIER_GATE_T0_T1.conditions.refinedMetalSold}</span>
            </div>
            <div className="bar"><i style={{ width: `${Math.min(100, (metalSold / TIER_GATE_T0_T1.conditions.refinedMetalSold) * 100)}%` }} /></div>
          </div>

          <div className="gate-row">
            <div className="label">
              <span>Hydrogen Fuel reserves (Earth + NEA-04)</span>
              <span>{fmtNum(totalFuel)} / {TIER_GATE_T0_T1.conditions.hydrogenFuelReserves}</span>
            </div>
            <div className="bar"><i style={{ width: `${Math.min(100, (totalFuel / TIER_GATE_T0_T1.conditions.hydrogenFuelReserves) * 100)}%` }} /></div>
          </div>

          <div style={{ marginTop: 14 }}>
            {s.tierUpReady ? (
              <button className="btn primary" onClick={claim}>Claim Lunar Foothold</button>
            ) : (
              <button className="btn" disabled>Conditions not met</button>
            )}
          </div>
        </div>
      )}

      {s.tier === 1 && (
        <div className="card">
          <strong>T1 Lunar Foothold — claimed</strong>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            habitat construction cleared · life support imports available · pop tier mechanics live
          </div>
          <div className="dim mono" style={{ fontSize: 11.5, marginTop: 8 }}>
            T2 (NEA Industry) is deferred from MLP. The next milestone here would be the first habitat reaching pop 50 in the full game.
          </div>
        </div>
      )}

      <h2>Completed milestones</h2>
      <div className="card mono" style={{ fontSize: 12 }}>
        {s.refinedMetalSoldLifetime > 0 && <div>✓ First sale to Earth</div>}
        {s.bodies.nea_04.buildings.length > 0 && <div>✓ First mine built (NEA-04)</div>}
        {(s.bodies.nea_04.buildings.some((b) => b.defId === "smelter")) && <div>✓ First Smelter placed</div>}
        {s.tier >= 1 && <div>✓ T1 Lunar Foothold authorized</div>}
        {s.populations.lunar_habitat && <div>✓ First Habitat live</div>}
      </div>
    </div>
  );
}
