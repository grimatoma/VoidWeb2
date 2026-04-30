import type { AfkSummary } from "../game/state";
import { RESOURCES } from "../game/defs";
import { fmtCredits, fmtNum, fmtTimeAway } from "./format";

export function AfkModal({ summary, onDismiss }: { summary: AfkSummary; onDismiss: () => void }) {
  const sign = summary.netCredits >= 0 ? "+" : "";
  const totalCycles = Object.values(summary.cyclesByBuilding).reduce((a: number, b) => a + (b ?? 0), 0);
  const popDeltaTotal = Object.entries(summary.popDelta)
    .filter(([k]) => !k.includes("_tier_"))
    .reduce((a, [, v]) => a + (v ?? 0), 0);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="hero">{sign}{fmtCredits(summary.netCredits)} net</div>
        <div className="hero-sub">
          {fmtTimeAway(summary.awaySec)} away{summary.cappedAt24h ? " (capped at 24h — time has passed but operations were idle)" : ""}
        </div>

        <h3>What happened</h3>
        <div className="mono" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
          {summary.deliveries > 0 && <div>· {summary.deliveries} deliveries sold</div>}
          {totalCycles > 0 && <div>· {totalCycles} production cycles</div>}
          {Object.entries(summary.resourceDelta)
            .sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0))
            .slice(0, 5)
            .map(([rid, q]) => (
              <div key={rid}>· {(q ?? 0) > 0 ? "+" : ""}{fmtNum(q ?? 0)} {RESOURCES[rid as keyof typeof RESOURCES].name}</div>
            ))}
          {popDeltaTotal > 0 && <div>· +{popDeltaTotal.toFixed(1)} pop on First Habitat</div>}
          {totalCycles === 0 && summary.deliveries === 0 && <div className="dim">no production this window</div>}
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn primary" onClick={onDismiss}>Continue</button>
        </div>
      </div>
    </div>
  );
}
