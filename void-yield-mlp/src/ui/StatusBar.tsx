import { useState } from "react";
import type { GameApi } from "../game/useGame";
import { fmtCredits, fmtGameTime, fmtNum } from "./format";
import { PACK_LABELS, PLANET_PACKS, svgIcon } from "./graphics/packs";
import type { PackId } from "./graphics/packs";

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
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="statusbar">
        <span style={{ marginRight: 6 }}>{svgIcon(PLANET_PACKS[s.graphicsPack].earth, 26)}</span>
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
        <button
          className="btn tiny"
          style={{ marginLeft: 12 }}
          onClick={() => setSettingsOpen((v) => !v)}
          title="Settings"
        >
          ⚙
        </button>
      </div>
      {settingsOpen && (
        <div
          className="card elev"
          style={{
            position: "absolute",
            top: 56,
            right: 16,
            zIndex: 50,
            minWidth: 260,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}
        >
          <strong style={{ display: "block", marginBottom: 6 }}>Graphics pack</strong>
          {(Object.keys(PACK_LABELS) as PackId[]).map((p) => (
            <label
              key={p}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 6,
                cursor: "pointer",
                background: s.graphicsPack === p ? "var(--bg-elev)" : "transparent",
                borderRadius: 3,
                marginBottom: 4,
              }}
            >
              <input
                type="radio"
                checked={s.graphicsPack === p}
                onChange={() => game.setGraphicsPack(p)}
                style={{ accentColor: "var(--accent-cyan)" }}
              />
              {svgIcon(PLANET_PACKS[p].earth, 32)}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{PACK_LABELS[p]}</div>
                <div className="dim mono" style={{ fontSize: 10.5 }}>{p}</div>
              </div>
            </label>
          ))}
          <strong style={{ display: "block", margin: "10px 0 6px" }}>Debug</strong>
          <button
            className="btn tiny"
            style={{ width: "100%" }}
            onClick={() => game.debugAddCredits(1_000_000)}
            title="Add 1,000,000 credits (testing)"
          >
            +1,000,000 credits
          </button>
          <button
            className="btn tiny"
            style={{ marginTop: 6 }}
            onClick={() => setSettingsOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
