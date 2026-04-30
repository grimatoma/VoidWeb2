import { useState } from "react";
import type { GameApi } from "../game/useGame";
import { ADJACENCY_RADIUS, BUILDINGS, RESOURCES } from "../game/defs";
import type { BuildingId } from "../game/defs";
import type { BodyId, BodyState, PlacedBuilding } from "../game/state";
import { getStorageCaps, warehouseUsage } from "../game/sim";
import { fmtCredits, fmtNum } from "./format";
import { BUILDING_ICON_PACKS, svgIcon } from "./graphics/packs";

const BODIES_ORDER: BodyId[] = ["nea_04", "moon", "lunar_habitat", "earth"];

export function ProductionView({ game }: { game: GameApi }) {
  const s = game.state;
  const neaActive = s.survey.candidates.some((c) => c.staked) || s.bodies.nea_04.buildings.length > 0;
  const [bodyId, setBodyId] = useState<BodyId>(neaActive ? "nea_04" : "earth");
  const body = s.bodies[bodyId];

  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [hoveredBuildId, setHoveredBuildId] = useState<BuildingId | null>(null);

  // Build-tab eligibility — narrower than the general "visible body" rule
  // (we hide the Moon tab pre-T1 even though the Moon is always visible on
  // the maps, and NEA-04 is gated on having staked / built something there).
  const buildableBodies = BODIES_ORDER.filter((id) => {
    if (id === "lunar_habitat") return !!s.populations.lunar_habitat;
    if (id === "moon") return s.tier >= 1 || s.bodies.moon.buildings.length > 0;
    if (id === "nea_04") return neaActive;
    return true;
  });

  const buildingAtTile = (x: number, y: number) => body.buildings.find((b) => b.x === x && b.y === y);

  const allBuildingDefs = Object.values(BUILDINGS);
  const availableHere = allBuildingDefs.filter((d) => {
    if (d.tier > s.tier) return false;
    if (d.allowedBodyTypes && !d.allowedBodyTypes.includes(body.type)) return false;
    return true;
  });

  const placeChosen = (defId: BuildingId, x: number, y: number) => {
    const r = game.place(bodyId, defId, x, y);
    if (!r.ok) {
      alert(`Cannot place: ${r.reason}`);
      return;
    }
    setSelectedTile(null);
    setHoveredBuildId(null);
  };

  const tileInRadiusOfHover = (x: number, y: number): boolean => {
    if (!hoveredBuildId || !selectedTile) return false;
    const def = BUILDINGS[hoveredBuildId];
    if (!def.adjacencyPair || def.isStorage) return false;
    const dx = Math.abs(selectedTile.x - x);
    const dy = Math.abs(selectedTile.y - y);
    return Math.max(dx, dy) <= ADJACENCY_RADIUS && !(x === selectedTile.x && y === selectedTile.y);
  };

  const caps = getStorageCaps(body);
  const usage = warehouseUsage(body);

  return (
    <div className="workspace">
      <h1>Production · {body.name}</h1>
      <div className="subtitle">
        Grid {body.gridW}×{body.gridH} · {body.buildings.length}/{body.gridW * body.gridH} slots used · adjacency radius {ADJACENCY_RADIUS}
      </div>

      <div className="body-tabs">
        {buildableBodies.map((bid) => (
          <button
            key={bid}
            className={`body-tab ${bid === bodyId ? "active" : ""}`}
            onClick={() => { setBodyId(bid); setSelectedTile(null); }}
          >
            {s.bodies[bid].name}
          </button>
        ))}
      </div>

      <div className="prod-layout">
        <div>
          <Grid
            body={body}
            selected={selectedTile}
            onPick={(x, y) => {
              const at = buildingAtTile(x, y);
              if (at) {
                setSelectedTile({ x, y });
                setHoveredBuildId(null);
              } else {
                setSelectedTile({ x, y });
                setHoveredBuildId(null);
              }
            }}
            hoverInRadius={tileInRadiusOfHover}
          />

          <div className="card">
            <div className="row between">
              <div>
                <strong>Storage</strong>
                <span className="dim mono" style={{ marginLeft: 8 }}>
                  solid {fmtNum(usage.solid)}/{caps.solid === Infinity ? "∞" : fmtNum(caps.solid)} ·
                  fluid {fmtNum(usage.fluid)}/{caps.fluid === Infinity ? "∞" : fmtNum(caps.fluid)}
                </span>
              </div>
            </div>
            <table className="data" style={{ marginTop: 6 }}>
              <thead>
                <tr><th>Resource</th><th className="num">Stock</th><th>Cargo</th></tr>
              </thead>
              <tbody>
                {Object.entries(body.warehouse)
                  .filter(([, q]) => (q ?? 0) > 0.001)
                  .map(([rid, qty]) => (
                  <tr key={rid}>
                    <td>{RESOURCES[rid as keyof typeof RESOURCES].name}</td>
                    <td className="num">{fmtNum(qty as number)}</td>
                    <td className="dim">{RESOURCES[rid as keyof typeof RESOURCES].cargo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <strong>Buildings on this body</strong>
            {body.buildings.length === 0 ? (
              <div className="dim mono" style={{ marginTop: 6 }}>None placed. Tap a tile to start.</div>
            ) : (
              <table className="data" style={{ marginTop: 6 }}>
                <thead>
                  <tr><th>Building</th><th>Tile</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {body.buildings.map((b) => {
                    const def = BUILDINGS[b.defId];
                    const adj = adjacencyMultiplierClient(b, body);
                    return (
                      <tr key={b.id}>
                        <td>
                          {def.name}
                          {adj > 1 && <span className="tag ok mono" style={{ marginLeft: 6 }}>+{Math.round((adj - 1) * 100)}%</span>}
                        </td>
                        <td className="mono dim">{b.x},{b.y}</td>
                        <td>
                          {b.paused ? <span className="tag warn">paused</span> :
                            def.cycleSec > 0 ? <span className="tag ok">running</span> :
                            <span className="dim">passive</span>}
                        </td>
                        <td>
                          {!def.passive && !def.isStorage && (
                            <button className="btn tiny" onClick={() => game.pauseBuilding(bodyId, b.id, !b.paused)}>
                              {b.paused ? "Resume" : "Pause"}
                            </button>
                          )}
                          <button className="btn tiny danger" style={{ marginLeft: 4 }} onClick={() => {
                            if (confirm(`Demolish ${def.name}? 50% refund.`)) game.demolish(bodyId, b.id);
                          }}>Demolish</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="build-drawer">
          <strong>{selectedTile && !buildingAtTile(selectedTile.x, selectedTile.y) ? `Build at ${selectedTile.x},${selectedTile.y}` : "Build Drawer"}</strong>
          {!selectedTile && <div className="dim mono" style={{ fontSize: 11.5 }}>Select an empty tile in the grid to place.</div>}
          {selectedTile && buildingAtTile(selectedTile.x, selectedTile.y) && (
            <BuildingDetail
              building={buildingAtTile(selectedTile.x, selectedTile.y)!}
              body={body}
            />
          )}
          {selectedTile && !buildingAtTile(selectedTile.x, selectedTile.y) && availableHere.map((def) => {
            const affordable = s.credits >= def.cost;
            const icon = BUILDING_ICON_PACKS[s.graphicsPack][def.id];
            return (
              <div
                key={def.id}
                className={`build-card ${affordable ? "" : "disabled"}`}
                onMouseEnter={() => setHoveredBuildId(def.id)}
                onMouseLeave={() => setHoveredBuildId(null)}
              >
                <div className="row gap-8" style={{ alignItems: "center" }}>
                  {icon && svgIcon(icon, 28)}
                  <div className="name">{def.name}</div>
                </div>
                <div className="desc">{def.description}</div>
                <div className="cost">{fmtCredits(def.cost)} · 1 slot</div>
                {def.adjacencyPair && (
                  <div className="adj">
                    +{Math.round((def.adjacencyBonus ?? 0) * 100)}% with {def.adjacencyPair.map((p) => BUILDINGS[p].name).join(", ")} in radius {ADJACENCY_RADIUS}
                  </div>
                )}
                <button
                  className="btn primary"
                  style={{ marginTop: 8, width: "100%" }}
                  disabled={!affordable}
                  onClick={() => placeChosen(def.id, selectedTile.x, selectedTile.y)}
                >
                  Build
                </button>
              </div>
            );
          })}
          {availableHere.length === 0 && selectedTile && (
            <div className="dim">No buildings available for {body.type}.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Grid({
  body,
  selected,
  onPick,
  hoverInRadius,
}: {
  body: BodyState;
  selected: { x: number; y: number } | null;
  onPick: (x: number, y: number) => void;
  hoverInRadius: (x: number, y: number) => boolean;
}) {
  const tiles: { x: number; y: number; b: PlacedBuilding | undefined }[] = [];
  for (let y = 0; y < body.gridH; y++) {
    for (let x = 0; x < body.gridW; x++) {
      tiles.push({ x, y, b: body.buildings.find((bb) => bb.x === x && bb.y === y) });
    }
  }
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${body.gridW}, 64px)` }}>
      {tiles.map((t) => {
        const isSelected = selected?.x === t.x && selected?.y === t.y;
        const inRadius = hoverInRadius(t.x, t.y);
        if (t.b) {
          const def = BUILDINGS[t.b.defId];
          const mult = adjacencyMultiplierClient(t.b, body);
          return (
            <div
              key={`${t.x},${t.y}`}
              className={`grid-tile filled ${isSelected ? "selected" : ""}`}
              onClick={() => onPick(t.x, t.y)}
            >
              <div>
                <div className="b-name">{def.name.replace(/\s*\(.+\)/, "")}</div>
                {mult > 1 && <div className="b-bonus">+{Math.round((mult - 1) * 100)}%</div>}
                {t.b.paused && <div className="b-paused">paused</div>}
              </div>
            </div>
          );
        }
        return (
          <div
            key={`${t.x},${t.y}`}
            className={`grid-tile empty ${isSelected ? "selected" : ""} ${inRadius ? "in-radius" : ""}`}
            onClick={() => onPick(t.x, t.y)}
          >
            +
          </div>
        );
      })}
    </div>
  );
}

function BuildingDetail({ building, body }: { building: PlacedBuilding; body: BodyState }) {
  const def = BUILDINGS[building.defId];
  const mult = adjacencyMultiplierClient(building, body);
  return (
    <div className="build-card">
      <div className="name">{def.name}</div>
      <div className="desc">{def.description}</div>
      {def.cycleSec > 0 && (
        <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>
          Cycle {def.cycleSec}s · {Math.round((building.cycleProgress / def.cycleSec) * 100)}%
        </div>
      )}
      {mult > 1 && <div className="adj">Adjacency bonus active: +{Math.round((mult - 1) * 100)}%</div>}
    </div>
  );
}

// Mirror of sim's adjacencyMultiplierFor (kept here to render bonus indicators).
function adjacencyMultiplierClient(b: PlacedBuilding, body: BodyState): number {
  const def = BUILDINGS[b.defId];
  if (!def.adjacencyPair || !def.adjacencyBonus) return 1.0;
  let bonus = 0;
  for (const other of body.buildings) {
    if (other.id === b.id) continue;
    const otherDef = BUILDINGS[other.defId];
    if (otherDef.isStorage) continue;
    if (!def.adjacencyPair.includes(other.defId)) continue;
    const dx = Math.abs(other.x - b.x);
    const dy = Math.abs(other.y - b.y);
    if (Math.max(dx, dy) <= ADJACENCY_RADIUS) bonus += def.adjacencyBonus;
  }
  return 1 + Math.min(bonus, def.adjacencyBonus);
}
