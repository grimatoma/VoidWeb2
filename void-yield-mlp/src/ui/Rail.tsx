import type { GameApi } from "../game/useGame";

export type DestId =
  | "map"
  | "ops"
  | "production"
  | "fleet"
  | "survey"
  | "colonies"
  | "trade"
  | "milestones";

export function Rail({
  current,
  onChange,
  game,
  collapsed,
  onToggleCollapsed,
}: {
  current: DestId;
  onChange: (d: DestId) => void;
  game: GameApi;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const items: { id: DestId; label: string; lockedAtT0?: boolean; n: string }[] = [
    { id: "map", label: "Map", n: "1" },
    { id: "ops", label: "Ops", n: "2" },
    { id: "production", label: "Production", n: "3" },
    { id: "fleet", label: "Fleet", n: "4" },
    { id: "survey", label: "Survey", n: "5" },
    { id: "colonies", label: "Colonies", n: "6", lockedAtT0: true },
    { id: "trade", label: "Trade", n: "7" },
    { id: "milestones", label: "Milestones", n: "8" },
  ];
  const tier = game.state.tier;
  return (
    <nav className={`rail ${collapsed ? "collapsed" : ""}`}>
      <button
        className="nav-item rail-toggle"
        onClick={onToggleCollapsed}
        title={collapsed ? "Expand menu" : "Collapse menu"}
        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        aria-expanded={!collapsed}
      >
        <span className="num">{collapsed ? "›" : "‹"}</span>
        <span>Menu</span>
      </button>
      {items.map((it) => {
        const locked = it.lockedAtT0 && tier === 0;
        return (
          <button
            key={it.id}
            className={`nav-item ${current === it.id ? "active" : ""} ${locked ? "locked" : ""}`}
            onClick={() => !locked && onChange(it.id)}
            disabled={locked}
            title={collapsed ? it.label : undefined}
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
