import { useState } from "react";
import type { GameApi } from "../game/useGame";
import { PREFAB_KITS, RESOURCES } from "../game/defs";
import type { ResourceId } from "../game/defs";
import { fmtCredits, fmtNum } from "./format";

export function TradeView({ game }: { game: GameApi }) {
  const s = game.state;
  const [tab, setTab] = useState<"market" | "prefab">("market");

  // Show only resources unlocked at current tier or below.
  const visibleResources = (Object.values(RESOURCES)).filter((r) => r.tier <= s.tier);

  return (
    <div className="workspace">
      <h1>Trade</h1>
      <div className="subtitle">Earth-side market · fixed prices · prefab kits</div>

      <div className="body-tabs">
        <button className={`body-tab ${tab === "market" ? "active" : ""}`} onClick={() => setTab("market")}>Earth Market</button>
        <button className={`body-tab ${tab === "prefab" ? "active" : ""}`} onClick={() => setTab("prefab")}>Earth Prefab Kits</button>
      </div>

      {tab === "market" && (
        <div className="card">
          <div className="trade-row head">
            <div>Resource</div>
            <div className="num">Buy</div>
            <div className="num">Sell</div>
            <div>Qty</div>
            <div></div>
            <div></div>
          </div>
          {visibleResources.map((r) => (
            <MarketRow key={r.id} game={game} rid={r.id} />
          ))}
        </div>
      )}

      {tab === "prefab" && (
        <div>
          {s.tier < 1 ? (
            <div className="card dim">Prefab kits unlock at T1 — Lunar Foothold. Reach the tier first.</div>
          ) : (
            <>
              {Object.values(PREFAB_KITS).map((k) => {
                const ownedHabitat = !!s.populations.lunar_habitat;
                const disabled =
                  s.credits < k.cost ||
                  (k.id === "lunar_habitat" && ownedHabitat);
                return (
                  <div key={k.id} className="card">
                    <div className="row between">
                      <div>
                        <strong>{k.name}</strong>
                        <div className="dim" style={{ fontSize: 12, marginTop: 2 }}>{k.description}</div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--accent-amber)", marginTop: 4 }}>
                          {fmtCredits(k.cost)} · 1 of 1 per run
                        </div>
                      </div>
                      <button className="btn primary" disabled={disabled} onClick={() => {
                        const r = game.buyPrefabKit(k.id);
                        if (!r.ok) alert(r.reason);
                      }}>
                        {k.id === "lunar_habitat" && ownedHabitat ? "Deployed" : "Buy & Drop"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MarketRow({ game, rid }: { game: GameApi; rid: ResourceId }) {
  const s = game.state;
  const r = RESOURCES[rid];
  const [qty, setQty] = useState(10);
  const earthStock = s.bodies.earth.warehouse[rid] ?? 0;
  return (
    <div className="trade-row">
      <div>{r.name} <span className="dim mono" style={{ fontSize: 10, marginLeft: 6 }}>T{r.tier}</span></div>
      <div className="num">{fmtCredits(r.earthBuy)}</div>
      <div className="num">{fmtCredits(r.earthSell)}</div>
      <div>
        <input
          className="qty"
          type="number"
          value={qty}
          min={1}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 0))}
        />
      </div>
      <div>
        <button className="btn tiny" disabled={s.credits < r.earthBuy * qty} onClick={() => {
          const res = game.buyFromEarth(rid, qty, "earth");
          if (!res.ok) alert(res.reason);
        }}>Buy → Earth</button>
      </div>
      <div>
        <button className="btn tiny" disabled={earthStock < qty} onClick={() => {
          const res = game.sellToEarth(rid, qty);
          if (!res.ok) alert(res.reason);
        }}>Sell ({fmtNum(earthStock)})</button>
      </div>
    </div>
  );
}
