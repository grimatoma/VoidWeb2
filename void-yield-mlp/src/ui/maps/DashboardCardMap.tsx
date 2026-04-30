import { KEPLER, apsides, currentTrueAnomaly, keplerPosition, timeToNextPeriapsis } from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

const ALL_BODIES: BodyId[] = ["earth", "moon", "nea_04", "lunar_habitat"];
const BODY_COLOR: Record<BodyId, string> = {
  earth: "#5fb3ff",
  moon: "#c9d2dc",
  nea_04: "#a8896a",
  lunar_habitat: "#6cd07a",
};

/**
 * Not a map — a dashboard. Each body is a card showing a tiny self-contained
 * orbital portrait + live measurements: current heliocentric distance, true
 * anomaly, time-to-periapsis, eccentricity, period. The "spatial picture" is
 * absent on purpose; this is the *data* angle.
 *
 * Useful for the analytical player: scan all bodies' state in one read.
 */
export function DashboardCardMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 10,
      }}
    >
      {ALL_BODIES.filter((b) => !(b === "lunar_habitat" && !state.populations.lunar_habitat)).map((bid) => {
        const el = KEPLER[bid];
        const p = keplerPosition(state, bid);
        const r = Math.hypot(p.x, p.y, p.z);
        const ν = currentTrueAnomaly(el, state.gameTimeSec);
        const tToPeri = timeToNextPeriapsis(el, state.gameTimeSec);
        const { periapsis, apoapsis } = apsides(el);
        const isSel = selectedBodyId === bid;
        const phase = (((ν / (2 * Math.PI)) % 1) + 1) % 1; // 0 at periapsis

        return (
          <div
            key={bid}
            onClick={() => onSelectBody(bid)}
            style={{
              background: "var(--bg-panel)",
              border: `1px solid ${isSel ? "#4cd1d8" : "var(--line)"}`,
              borderRadius: 4,
              padding: 12,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: BODY_COLOR[bid],
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                <strong style={{ color: "var(--text)", fontSize: 13 }}>{state.bodies[bid].name}</strong>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-muted)" }}>
                T{el.parent === "sun" ? "0" : "1"}
              </span>
            </div>
            {/* Mini portrait — single ellipse SVG with marker at current ν */}
            <svg viewBox="0 0 100 60" width="100%" height={60}>
              <ellipse
                cx={50}
                cy={30}
                rx={42 * (1 - el.e * 0.6)}
                ry={20}
                fill="none"
                stroke="rgba(76, 209, 216, 0.3)"
                strokeWidth={1}
              />
              {/* Focus dot (Sun/parent) */}
              <circle cx={50 - 42 * el.e * 0.6} cy={30} r={2.5} fill="#ffd86b" />
              {/* Body marker on ellipse */}
              {(() => {
                const angle = ν;
                const bx = 50 - 42 * el.e * 0.6 + 42 * (1 - el.e * 0.6) * Math.cos(angle);
                const by = 30 + 20 * Math.sin(angle);
                return <circle cx={bx} cy={by} r={3.5} fill={BODY_COLOR[bid]} />;
              })()}
            </svg>
            {/* Stats */}
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.7, color: "var(--text)" }}>
              <Row label="r (now)" value={r.toFixed(2)} />
              <Row label="ν (true anom)" value={`${((ν * 180) / Math.PI).toFixed(1)}°`} />
              <Row label="phase" value={`${(phase * 100).toFixed(0)}%`} />
              <Row label="next periapsis" value={`${Math.round(tToPeri)}s`} />
              <Row label="a · e" value={`${el.a} · ${el.e.toFixed(3)}`} />
              <Row label="q · Q" value={`${periapsis.toFixed(1)} · ${apoapsis.toFixed(1)}`} />
              <Row label="period" value={`${el.periodSec}s`} />
              <Row label="incl" value={`${((el.i * 180) / Math.PI).toFixed(1)}°`} />
            </div>
            {/* Phase progress bar (0=periapsis → 1=back to periapsis) */}
            <div style={{ height: 4, background: "rgba(76, 209, 216, 0.18)", borderRadius: 2 }}>
              <div style={{ width: `${phase * 100}%`, height: "100%", background: BODY_COLOR[bid], borderRadius: 2 }} />
            </div>
          </div>
        );
      })}
      {/* Ships card */}
      {state.ships.length > 0 && (
        <div
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--line)",
            borderRadius: 4,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ width: 10, height: 10, background: "#4cd1d8", borderRadius: "50%", display: "inline-block" }}
            />
            <strong style={{ color: "var(--text)", fontSize: 13 }}>Fleet</strong>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.7 }}>
            {state.ships.map((sh) => (
              <div key={sh.id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 4, marginBottom: 4 }}>
                <div style={{ color: "var(--text)" }}>{sh.name}</div>
                <div style={{ color: "var(--text-muted)" }}>
                  {sh.route
                    ? `${state.bodies[sh.route.fromBodyId].name} → ${state.bodies[sh.route.toBodyId].name} · ${Math.round(sh.route.travelSecRemaining)}s`
                    : `idle @ ${state.bodies[sh.locationBodyId].name}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
