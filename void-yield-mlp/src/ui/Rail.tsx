import type { GameApi } from "../game/useGame";

export type DestId =
  | "map"
  | "ops"
  | "production"
  | "fleet"
  | "colonies"
  | "trade"
  | "milestones";

export function Rail({
  current,
  onChange,
  game,
}: {
  current: DestId;
  onChange: (d: DestId) => void;
  game: GameApi;
}) {
  const items: { id: DestId; label: string; lockedAtT0?: boolean; n: string }[] = [
    { id: "map", label: "Map", n: "1" },
    { id: "ops", label: "Ops", n: "2" },
    { id: "production", label: "Production", n: "3" },
    { id: "fleet", label: "Fleet", n: "4" },
    { id: "colonies", label: "Colonies", n: "5", lockedAtT0: true },
    { id: "trade", label: "Trade", n: "6" },
    { id: "milestones", label: "Milestones", n: "8" },
  ];
  const tier = game.state.tier;
  return (
    <nav className="rail">
      {items.map((it) => {
        const locked = it.lockedAtT0 && tier === 0;
        return (
          <button
            key={it.id}
            className={`nav-item ${current === it.id ? "active" : ""} ${locked ? "locked" : ""}`}
            onClick={() => !locked && onChange(it.id)}
            disabled={locked}
          >
            <span className="num">{it.n}</span>
            <span>{it.label}</span>
            {locked && <span className="lock-tag">T1</span>}
          </button>
        );
      })}
    </nav>
  );
}
