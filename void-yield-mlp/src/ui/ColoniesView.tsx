import type { GameApi } from "../game/useGame";
import { LIFE_SUPPORT, POP_TIERS } from "../game/defs";
import { fmtNum } from "./format";

export function ColoniesView({ game }: { game: GameApi }) {
  const s = game.state;
  const pop = s.populations.lunar_habitat;
  const body = s.bodies.lunar_habitat;

  if (!pop) {
    return (
      <div className="workspace">
        <h1>Colonies</h1>
        <div className="card dim">
          No colonies yet. Reach T1 (Lunar Foothold), then buy the Lunar Habitat Prefab Kit from Trade.
        </div>
      </div>
    );
  }

  const water = body.warehouse.water_ice ?? 0;
  const o2 = body.warehouse.oxygen ?? 0;
  const food = body.warehouse.food_pack ?? 0;

  const reserveSec = (have: number, perPopSec: number) =>
    pop.pop > 0 ? have / Math.max(1e-9, perPopSec * pop.pop) : Infinity;

  const waterRes = reserveSec(water, LIFE_SUPPORT.water_ice_per_pop_sec);
  const o2Res = reserveSec(o2, LIFE_SUPPORT.oxygen_per_pop_sec);
  const foodRes = reserveSec(food, LIFE_SUPPORT.food_pack_per_pop_sec);

  const fmtRes = (sec: number) => {
    if (sec === Infinity) return "∞";
    if (sec >= 3600) return `${(sec / 3600).toFixed(1)}h`;
    if (sec >= 60) return `${Math.round(sec / 60)}m`;
    return `${Math.round(sec)}s`;
  };

  const currentTierIdx = POP_TIERS.findIndex((t) => t.id === pop.tier);
  const nextTier = POP_TIERS[currentTierIdx + 1];

  return (
    <div className="workspace">
      <h1>Colonies · {body.name}</h1>
      <div className="subtitle">
        Pop {pop.pop.toFixed(1)} / cap {pop.cap} · tier {pop.tier} · {pop.growthPaused ? "growth paused" : pop.suspended ? "suspended" : "growing"}
      </div>

      <div className="card">
        <strong>Pop tier ladder</strong>
        <div className="ladder mt-12">
          {POP_TIERS.map((t, i) => {
            const isComplete = i < currentTierIdx;
            const isCurrent = i === currentTierIdx;
            return (
              <div key={t.id} className={`step ${isComplete ? "complete" : isCurrent ? "current" : "locked"}`}>
                {t.name}{isCurrent ? " ●" : isComplete ? " ✓" : ""}
              </div>
            );
          })}
        </div>
        {nextTier && (
          <div className="dim mono" style={{ fontSize: 12 }}>
            Next: {nextTier.name} · settle-in {nextTier.settleInSec / 60}m{" "}
            (progress {Math.min(100, Math.round((pop.settleProgressSec / nextTier.settleInSec) * 100))}%)
          </div>
        )}
      </div>

      <h2>Life support</h2>
      <div className="card">
        <LifeBar label="Water" qty={water} reserveSec={waterRes} fmtRes={fmtRes} />
        <LifeBar label="Oxygen" qty={o2} reserveSec={o2Res} fmtRes={fmtRes} />
        <LifeBar label="Food Pack" qty={food} reserveSec={foodRes} fmtRes={fmtRes} />
      </div>

      {nextTier && (
        <>
          <h2>Growth-tier bundle ({nextTier.name})</h2>
          <div className="card">
            {Object.entries(nextTier.bundle).map(([rid, q]) => {
              const have = body.warehouse[rid as keyof typeof body.warehouse] ?? 0;
              return (
                <div key={rid} className="row between" style={{ padding: "4px 0" }}>
                  <span>{rid.replace(/_/g, " ")}</span>
                  <span className="mono">{fmtNum(have)} / {q}</span>
                </div>
              );
            })}
            <div className="dim mono" style={{ fontSize: 11.5, marginTop: 6 }}>
              Bundle is consumed automatically once settle-in completes and items are present.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LifeBar({ label, qty, reserveSec, fmtRes }: { label: string; qty: number; reserveSec: number; fmtRes: (n: number) => string }) {
  const reserveHours = reserveSec / 3600;
  const cls = reserveHours < 1 ? "crit" : reserveHours < 2 ? "warn" : "";
  const fillPct = Math.max(0, Math.min(100, (reserveHours / 8) * 100));
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="row between">
        <span>{label}</span>
        <span className="mono dim">{Math.round(qty)} stock · {fmtRes(reserveSec)} reserve</span>
      </div>
      <div className={`bar ${cls}`}><i style={{ width: `${fillPct}%` }} /></div>
    </div>
  );
}
