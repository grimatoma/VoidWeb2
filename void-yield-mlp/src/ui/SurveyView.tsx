import { useEffect, useRef, useState } from "react";
import type { GameApi } from "../game/useGame";
import { HAZARD_LABELS } from "../game/survey";
import type { AsteroidCandidate, SurveyFocus } from "../game/survey";
import { RESOURCES } from "../game/defs";
import type { ResourceId } from "../game/defs";

const BAND_COLOR: Record<string, string> = {
  trace: "#5a6a86",
  low: "#74a3ff",
  medium: "#4cd1d8",
  high: "#6cd07a",
};

const FOCUS_TINT: Record<SurveyFocus, string> = {
  composition: "rgba(76, 209, 216, 0.7)",
  purity: "rgba(232, 185, 78, 0.7)",
  hazard: "rgba(232, 112, 96, 0.7)",
};

/**
 * Survey destination. Two phases of visualization:
 *
 *   Phase 1 (Field) — wide-area top-down sweep showing every spotted
 *   asteroid as a blip on a normalized field plot. Confidence raises blips
 *   from blurry haloed dots to crisp small disks. Resolved composition
 *   bands color-code the blips as the sweep progresses.
 *
 *   Phase 2 (Prospect) — focused panel for one candidate. Animated radar
 *   sweep shows the probe locking on; resolved bands fill in as confidence
 *   rises through 0.5 → 1.0; grid roll appears at 0.8; hazards at 0.9.
 *
 * Idle phase shows the "launch sweep" CTA with cost/duration breakdown.
 */
export function SurveyView({ game }: { game: GameApi }) {
  const survey = game.state.survey;
  const phase = survey.phase;
  const fieldFrac = survey.fieldElapsed / survey.fieldDuration;
  const prospectingFrac = survey.prospectingElapsed / Math.max(1, survey.prospectingDuration);
  const [visualId, setVisualId] = useState<SurveyVisualId>("radar");

  return (
    <div className="workspace">
      <h1>Survey</h1>
      <div className="subtitle">
        Probe Bay · {phase === "idle" ? "ready" : phase === "field" ? `field sweep ${(fieldFrac * 100).toFixed(0)}%` : phase === "prospecting" ? `prospecting ${(prospectingFrac * 100).toFixed(0)}%` : "complete"}
      </div>
      <div className="map-tabs">
        {SURVEY_VISUALS.map((v) => (
          <button key={v.id} className={`map-tab ${visualId === v.id ? "active" : ""}`} onClick={() => setVisualId(v.id)}>{v.label}</button>
        ))}
      </div>

      {phase === "idle" && <IdlePanel game={game} />}
      {(phase === "field" || phase === "complete") && visualId === "radar" && <FieldPlot game={game} />}
      {(phase === "field" || phase === "complete") && visualId === "hologlobe" && <HoloGlobeField game={game} />}
      {(phase === "field" || phase === "complete") && visualId === "dronebay" && <DroneBayField game={game} />}
      {(phase === "field" || phase === "complete") && visualId === "seismic" && <ConceptField game={game} concept={SURVEY_VISUAL_BY_ID.seismic} />}
      {(phase === "field" || phase === "complete") && visualId === "shattercone" && <ConceptField game={game} concept={SURVEY_VISUAL_BY_ID.shattercone} />}
      {(phase === "field" || phase === "complete") && visualId === "lattice" && <ConceptField game={game} concept={SURVEY_VISUAL_BY_ID.lattice} />}
      {(phase === "field" || phase === "complete") && visualId === "accretion" && <ConceptField game={game} concept={SURVEY_VISUAL_BY_ID.accretion} />}
      {(phase === "field" || phase === "complete") && visualId === "rift" && <ConceptField game={game} concept={SURVEY_VISUAL_BY_ID.rift} />}
      {phase === "prospecting" && visualId === "radar" && <ProspectingPanel game={game} />}
      {phase === "prospecting" && visualId === "hologlobe" && <HoloGlobeProspecting game={game} />}
      {phase === "prospecting" && visualId === "dronebay" && <DroneBayProspecting game={game} />}
      {phase === "prospecting" && ["seismic", "shattercone", "lattice", "accretion", "rift"].includes(visualId) && <ConceptProspecting game={game} concept={SURVEY_VISUAL_BY_ID[visualId as SurveyConceptId]} />}

      <CandidateRoster game={game} />
    </div>
  );
}

type SurveyConceptId = "seismic" | "shattercone" | "lattice" | "accretion" | "rift";
type SurveyVisualId = "radar" | "hologlobe" | "dronebay" | SurveyConceptId;
type SurveyConcept = { id: SurveyConceptId; label: string; fieldName: string; vibe: string; panelA: string; panelB: string; panelC: string; accent: string };
const SURVEY_VISUALS: { id: SurveyVisualId; label: string }[] = [
  { id: "radar", label: "Classic Radar" }, { id: "hologlobe", label: "Holo Globe" }, { id: "dronebay", label: "Drone Bay Sim" },
  { id: "seismic", label: "Seismic Choir" }, { id: "shattercone", label: "Shattercone Lab" }, { id: "lattice", label: "Lattice Reef" }, { id: "accretion", label: "Accretion Forge" }, { id: "rift", label: "Grav Rift Loom" },
];
const SURVEY_VISUAL_BY_ID: Record<SurveyConceptId, SurveyConcept> = {
  seismic: { id: "seismic", label: "Seismic Choir", fieldName: "resonance sweep", vibe: "Asteroids are interpreted as singing geology. You pulse frequencies and read harmonic lock.", panelA: "Frequency lock", panelB: "Echo strata", panelC: "Fracture hiss", accent: "var(--accent-cyan)" },
  shattercone: { id: "shattercone", label: "Shattercone Lab", fieldName: "impact genealogy", vibe: "Treat each rock as a crash history puzzle; isolate impact epochs to infer ore migration.", panelA: "Epoch marker", panelB: "Ejecta weave", panelC: "Shock vectors", accent: "var(--accent-amber)" },
  lattice: { id: "lattice", label: "Lattice Reef", fieldName: "crystal reef dive", vibe: "Surveying is a close-range reef dive where crystal lattices form swimmable caverns and yield pockets.", panelA: "Lattice tension", panelB: "Pocket purity", panelC: "Cave stability", accent: "#89a5ff" },
  accretion: { id: "accretion", label: "Accretion Forge", fieldName: "forge reverse-cast", vibe: "You rewind asteroid formation like a foundry sim and watch heavy elements condense in layers.", panelA: "Heat horizon", panelB: "Slug density", panelC: "Impurity slag", accent: "#d88eff" },
  rift: { id: "rift", label: "Grav Rift Loom", fieldName: "gravity textile scan", vibe: "Gravity becomes fabric. Tugging folds reveals trapped nodes and shear hazards in the weave.", panelA: "Warp tension", panelB: "Node brightness", panelC: "Shear knots", accent: "#7fdb7c" },
};

function ConceptField({ game, concept }: { game: GameApi; concept: SurveyConcept }) {
  const { survey } = game.state;
  const avgConf = survey.candidates.length ? survey.candidates.reduce((n, c) => n + c.confidence, 0) / survey.candidates.length : 0;
  return <div className="card"><strong>{concept.label} · {concept.fieldName}</strong><ConceptVisualField concept={concept} confidence={avgConf} nodes={survey.candidates.length} hazardNodes={survey.candidates.filter((c) => c.resolvedHazards.length > 0).length} /><MiniRows survey={survey} /><div className="dim mono mt-12">{concept.vibe}</div><div className="dim mono mt-12" style={{ borderLeft: `3px solid ${concept.accent}`, paddingLeft: 10 }}>{concept.panelA}: {Math.round(avgConf * 100)}% · {concept.panelB}: {survey.candidates.length} nodes · {concept.panelC}: {survey.candidates.filter((c) => c.resolvedHazards.length > 0).length}</div></div>;
}

function ConceptProspecting({ game, concept }: { game: GameApi; concept: SurveyConcept }) {
  const cand = game.state.survey.candidates.find((c) => c.id === game.state.survey.prospectingId);
  const [stability, setStability] = useState(55);
  const [intensity, setIntensity] = useState(42);
  if (!cand) return null;
  return (
    <div className="card">
      <strong>{concept.label} · prospecting run</strong>
      <ConceptVisualProspecting concept={concept} stability={stability} intensity={intensity} hazardCount={cand.resolvedHazards.length} />
      <div className="dim mono mt-12">{concept.vibe}</div>
      <table className="data" style={{ marginTop: 10 }}>
        <thead><tr><th>Sub table</th><th>Status</th><th className="num">Signal</th></tr></thead>
        <tbody>
          <tr><td>{concept.panelA}</td><td className="dim">{stability > 60 ? "stable" : "drifting"}</td><td className="num">{stability}%</td></tr>
          <tr><td>{concept.panelB}</td><td className="dim">{Object.keys(cand.resolvedYields).length ? "mapped" : "forming"}</td><td className="num">{intensity}%</td></tr>
          <tr><td>{concept.panelC}</td><td className="dim">{cand.resolvedHazards.length ? "alert" : "clear"}</td><td className="num">{cand.resolvedHazards.length}</td></tr>
        </tbody>
      </table>
      <div className="row gap-8 mt-12">
        <button className="btn tiny" onClick={() => setStability((v) => Math.min(99, v + 7))}>Tune +</button>
        <button className="btn tiny" onClick={() => setIntensity((v) => Math.min(99, v + 9))}>Pulse +</button>
        <button className="btn tiny" onClick={() => { setStability(55); setIntensity(42); }}>Reset rig</button>
      </div>
    </div>
  );
}
function ConceptVisualField({ concept, confidence, nodes, hazardNodes }: { concept: SurveyConcept; confidence: number; nodes: number; hazardNodes: number }) {
  const glow = Math.round(confidence * 100);
  return (
    <div style={{ marginTop: 10, border: "1px solid #2b3346", borderRadius: 10, padding: 10, background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), rgba(0,0,0,0.15))" }}>
      <ConceptSignalCanvas intensity={confidence} accent={concept.accent} />
      <div className="row gap-8" style={{ alignItems: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", border: `2px solid ${concept.accent}`, boxShadow: `0 0 ${Math.max(6, glow / 3)}px ${concept.accent}88 inset` }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, borderRadius: 999, background: "#1f2533", overflow: "hidden" }}>
            <div style={{ width: `${glow}%`, height: "100%", background: concept.accent }} />
          </div>
          <div className="dim mono" style={{ fontSize: 11, marginTop: 6 }}>{concept.panelA} lock {glow}% · {concept.panelB} {nodes} · {concept.panelC} {hazardNodes}</div>
        </div>
      </div>
    </div>
  );
}
function ConceptVisualProspecting({ concept, stability, intensity, hazardCount }: { concept: SurveyConcept; stability: number; intensity: number; hazardCount: number }) {
  const hazardPct = Math.min(100, hazardCount * 20);
  return (
    <div style={{ marginTop: 10, border: "1px solid #2b3346", borderRadius: 10, padding: 10 }}>
      <div className="row gap-8">
        {[{ label: concept.panelA, value: stability }, { label: concept.panelB, value: intensity }, { label: concept.panelC, value: hazardPct }].map((m) => (
          <div key={m.label} style={{ flex: 1 }}>
            <div className="dim mono" style={{ fontSize: 10, marginBottom: 4 }}>{m.label}</div>
            <div style={{ height: 50, borderRadius: 8, background: "#1a2030", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${m.value}%`, background: `linear-gradient(0deg, ${concept.accent}, transparent)` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoloGlobeField({ game }: { game: GameApi }) {
  const { survey } = game.state;
  const avgConf = survey.candidates.length ? survey.candidates.reduce((n, c) => n + c.confidence, 0) / survey.candidates.length : 0;
  return <div className="card"><strong>Holo Globe · volumetric sweep</strong><HoloGlobeVisual confidence={avgConf} candidates={survey.candidates.length} /><MiniRows survey={survey} /><div className="dim mono mt-12">3D orbital shell projects candidates as depth-layered glyphs with bloom based on confidence.</div></div>;
}
function DroneBayField({ game }: { game: GameApi }) {
  const { survey } = game.state;
  const avgConf = survey.candidates.length ? survey.candidates.reduce((n, c) => n + c.confidence, 0) / survey.candidates.length : 0;
  return <div className="card"><strong>Drone Bay Sim · tactical sweep</strong><DroneBayVisual confidence={avgConf} candidates={survey.candidates.length} /><MiniRows survey={survey} /><div className="dim mono mt-12">Mini-game tone: dispatch autonomous drones over lanes, each pass improving one subtable lane.</div></div>;
}
function HoloGlobeProspecting({ game }: { game: GameApi }) {
  const cand = game.state.survey.candidates.find((c) => c.id === game.state.survey.prospectingId);
  if (!cand) return null;
  return <ProspectingSubtables title="Holo Globe lock" cand={cand} accent="var(--accent-cyan)" />;
}
function DroneBayProspecting({ game }: { game: GameApi }) {
  const cand = game.state.survey.candidates.find((c) => c.id === game.state.survey.prospectingId);
  if (!cand) return null;
  return <ProspectingSubtables title="Drone Bay lock" cand={cand} accent="var(--accent-amber)" />;
}
function ConceptSignalCanvas({ intensity, accent }: { intensity: number; accent: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#2a3040";
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = 6 + i * 8;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const t = x / w;
      const y = h / 2 + Math.sin(t * 12) * (intensity * 8);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [accent, intensity]);
  return <canvas ref={ref} width={320} height={54} style={{ width: "100%", height: 54, marginBottom: 8, borderRadius: 8, background: "#0f1420" }} />;
}
function HoloGlobeVisual({ confidence, candidates }: { confidence: number; candidates: number }) {
  const angle = Math.round(confidence * 360);
  return (
    <div style={{ marginTop: 10, border: "1px solid #273047", borderRadius: 10, padding: 10 }}>
      <div style={{ display: "grid", placeItems: "center", height: 140, background: "radial-gradient(circle at center, rgba(76,209,216,0.15), transparent 60%)", borderRadius: 10 }}>
        <div style={{ width: 102, height: 102, borderRadius: "50%", border: "2px solid #4cd1d8", position: "relative", boxShadow: "0 0 18px rgba(76,209,216,0.35) inset" }}>
          <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1px dashed rgba(76,209,216,0.55)" }} />
          <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid rgba(76,209,216,0.25)", transform: `rotate(${angle}deg)` }} />
        </div>
      </div>
      <div className="dim mono" style={{ fontSize: 11, marginTop: 6 }}>orbital lock {(confidence * 100).toFixed(0)}% · glyph stack {candidates}</div>
    </div>
  );
}
function DroneBayVisual({ confidence, candidates }: { confidence: number; candidates: number }) {
  const lanes = [0.7, 0.9, 1, 0.8].map((f, i) => Math.round(confidence * 100 * f + ((i * 9) % 13)));
  return (
    <div style={{ marginTop: 10, border: "1px solid #3b2f1f", borderRadius: 10, padding: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {lanes.map((n, i) => (
          <div key={i} style={{ height: 70, borderRadius: 8, background: "#17130f", border: "1px solid #4a3c27", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${Math.min(100, n)}%`, background: "linear-gradient(0deg, rgba(232,185,78,0.8), rgba(232,185,78,0.1))" }} />
          </div>
        ))}
      </div>
      <div className="dim mono" style={{ fontSize: 11, marginTop: 6 }}>drone lanes · {candidates} passes · efficiency {(confidence * 100).toFixed(0)}%</div>
    </div>
  );
}
function MiniRows({ survey }: { survey: GameApi["state"]["survey"] }) {
  const avgConf = survey.candidates.length ? survey.candidates.reduce((n, c) => n + c.confidence, 0) / survey.candidates.length : 0;
  const staked = survey.candidates.filter((c) => c.staked).length;
  return (
    <table className="data" style={{ marginTop: 10 }}>
      <thead><tr><th>Sub table</th><th className="num">State</th></tr></thead>
      <tbody>
        <tr><td>Depth slices</td><td className="num">{Math.round(avgConf * 9)}/9</td></tr>
        <tr><td>Signal coherence</td><td className="num">{Math.round(avgConf * 100)}%</td></tr>
        <tr><td>Claims synced</td><td className="num">{staked}</td></tr>
      </tbody>
    </table>
  );
}
function ProspectingSubtables({ title, cand, accent }: { title: string; cand: AsteroidCandidate; accent: string }) {
  return (
    <div className="card">
      <strong>{title}</strong>
      <div className="dim mono mt-12" style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 10 }}>Stylized mini-game panels: tune beam phase, stabilize ore echo, then commit claim when confidence crosses threshold.</div>
      <table className="data" style={{ marginTop: 10 }}>
        <thead><tr><th>Panel</th><th>Status</th><th className="num">Value</th></tr></thead>
        <tbody>
          <tr><td>Beam phase</td><td className="dim">tracking</td><td className="num">{(cand.confidence * 100).toFixed(0)}%</td></tr>
          <tr><td>Yield bands</td><td className="dim">{Object.keys(cand.resolvedYields).length ? "resolved" : "pending"}</td><td className="num">{Object.keys(cand.resolvedYields).length}</td></tr>
          <tr><td>Risk matrix</td><td className="dim">{cand.resolvedHazards.length ? "watch" : "clear"}</td><td className="num">{cand.resolvedHazards.length}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function IdlePanel({ game }: { game: GameApi }) {
  return (
    <div className="card">
      <div className="row between">
        <div>
          <strong>Field sweep — {game.state.survey.fieldDuration / 60} min, $0</strong>
          <div className="dim mono" style={{ fontSize: 12, marginTop: 4, maxWidth: 540 }}>
            Wide-area scan resolves ~{14} candidate asteroids in the near-Earth region. Each
            candidate's composition reads partially crystallize as confidence reaches 25%. The
            sweep auto-completes; bring up Production / Ops in the meantime.
          </div>
        </div>
        <button className="btn primary" onClick={() => game.startFieldSweep()}>
          Launch field sweep
        </button>
      </div>
    </div>
  );
}

function FieldPlot({ game }: { game: GameApi }) {
  const survey = game.state.survey;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Re-render at the foreground tick (state.gameTimeSec) — no rAF needed
  // because survey progress is bounded by the game tick anyway. Animation
  // is via the sweep-line overlay below.
  void survey.fieldElapsed;

  return (
    <div className="card" style={{ position: "relative" }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <strong>Field plot · NEA region</strong>
        {survey.phase !== "complete" && (
          <span className="dim mono" style={{ fontSize: 11 }}>
            sweeping — {Math.round(survey.fieldElapsed)}s / {survey.fieldDuration}s
          </span>
        )}
        {survey.phase === "complete" && (
          <button className="btn tiny" onClick={() => game.startFieldSweep()}>
            Re-sweep
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          background:
            "radial-gradient(ellipse at center, #0c1a2c 0%, #04060c 80%), repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(76,209,216,0.04) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(76,209,216,0.04) 40px)",
          border: "1px solid var(--line)",
          borderRadius: 4,
          overflow: "hidden",
          backgroundBlendMode: "screen",
        }}
      >
        {/* Cross-hairs */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            background: "rgba(76, 209, 216, 0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 1,
            background: "rgba(76, 209, 216, 0.18)",
          }}
        />
        {/* Range rings */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <div
            key={r}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: `${r * 96}%`,
              height: `${r * 96}%`,
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(76, 209, 216, 0.12)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
        ))}
        {/* Animated sweep arc — visible while sweeping */}
        {survey.phase === "field" && (
          <div
            className="survey-sweep"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "conic-gradient(from var(--from), rgba(76,209,216,0.0) 0deg, rgba(76,209,216,0.35) 6deg, rgba(76,209,216,0.0) 60deg, rgba(76,209,216,0.0) 360deg)",
              ["--from" as never]: `${(survey.fieldElapsed / survey.fieldDuration) * 720}deg`,
              animation: "survey-sweep-spin 8s linear infinite",
              pointerEvents: "none",
            }}
          />
        )}
        {/* Candidate blips */}
        {survey.candidates.map((c) => {
          const left = `${50 + c.fx * 47}%`;
          const top = `${50 + c.fy * 47}%`;
          const conf = c.confidence;
          const isProspecting = survey.prospectingId === c.id;
          // Color by best resolved band
          const dominant = pickDominantBand(c);
          const color = dominant ? BAND_COLOR[dominant] : "#5a6a86";
          const blur = Math.max(0, 0.5 - conf) * 12;
          const size = c.staked ? 16 : c.kind === "belt-rim" ? 10 : 8;
          return (
            <div
              key={c.id}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                if (survey.phase === "field" || survey.phase === "complete") {
                  game.startProspecting(c.id, "composition");
                }
              }}
              style={{
                position: "absolute",
                left,
                top,
                transform: "translate(-50%, -50%)",
                width: size,
                height: size,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 ${4 + conf * 12}px ${color}, 0 0 0 ${isProspecting ? 3 : 0}px var(--accent-cyan)`,
                filter: blur ? `blur(${blur}px)` : "none",
                cursor: "pointer",
                opacity: 0.4 + conf * 0.7,
                transition: "filter 0.4s",
              }}
            />
          );
        })}
        {/* Hover tooltip */}
        {hovered && (
          <CandidateTooltip cand={survey.candidates.find((c) => c.id === hovered)!} />
        )}
        {/* Footer hint */}
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 10,
            color: "rgba(216, 226, 238, 0.7)",
            fontFamily: "var(--mono)",
            fontSize: 11,
          }}
        >
          {survey.candidates.length} candidates · click any to begin prospecting
        </div>
      </div>
      <style>{`
        @keyframes survey-sweep-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function CandidateTooltip({ cand }: { cand: AsteroidCandidate }) {
  const yields = Object.entries(cand.resolvedYields) as [ResourceId, "trace" | "low" | "medium" | "high"][];
  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        top: 12,
        background: "rgba(8, 14, 24, 0.95)",
        border: "1px solid var(--line)",
        borderRadius: 4,
        padding: "10px 12px",
        fontFamily: "var(--mono)",
        fontSize: 11,
        pointerEvents: "none",
        minWidth: 200,
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
        {cand.kind === "belt-rim" ? "Belt-rim asteroid" : "NEA candidate"}
      </div>
      <div className="dim" style={{ marginBottom: 6 }}>
        confidence {(cand.confidence * 100).toFixed(0)}%
      </div>
      {yields.length === 0 ? (
        <div className="dim">no resolved reads yet</div>
      ) : (
        yields.map(([rid, band]) => (
          <div key={rid} style={{ display: "flex", justifyContent: "space-between", color: BAND_COLOR[band] }}>
            <span>{RESOURCES[rid]?.name ?? rid}</span>
            <span style={{ textTransform: "uppercase", letterSpacing: 0.04 }}>{band}</span>
          </div>
        ))
      )}
      {cand.resolvedGrid && (
        <div style={{ marginTop: 6, color: "var(--text-dim)" }}>
          grid {cand.resolvedGrid.w}×{cand.resolvedGrid.h}
        </div>
      )}
      {cand.resolvedHazards.length > 0 && (
        <div style={{ marginTop: 6, color: "var(--accent-amber)" }}>
          hazards: {cand.resolvedHazards.length}
        </div>
      )}
    </div>
  );
}

function ProspectingPanel({ game }: { game: GameApi }) {
  const survey = game.state.survey;
  const cand = survey.candidates.find((c) => c.id === survey.prospectingId);
  if (!cand) return null;
  const conf = cand.confidence;
  const focusOptions: { id: SurveyFocus; label: string; hint: string }[] = [
    { id: "composition", label: "Composition", hint: "lock yields" },
    { id: "purity", label: "Purity", hint: "refine bands" },
    { id: "hazard", label: "Hazard", hint: "early hazard read" },
  ];

  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: 8 }}>
        <strong>Prospecting · {cand.kind === "belt-rim" ? "Belt-rim" : "NEA"} candidate</strong>
        <button className="btn tiny" onClick={() => game.abandonProspecting()}>
          Abandon
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 240px", gap: 14 }}>
        {/* Left — focus radar */}
        <div
          style={{
            position: "relative",
            aspectRatio: "1 / 1",
            background: "radial-gradient(circle, #06121e 0%, #02060c 100%)",
            border: "1px solid var(--line)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Concentric range rings, scaled by confidence */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
            <div
              key={r}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: `${r * 90}%`,
                height: `${r * 90}%`,
                transform: "translate(-50%, -50%)",
                border: `1px solid ${r <= conf ? "rgba(76,209,216,0.6)" : "rgba(76,209,216,0.15)"}`,
                borderRadius: "50%",
                transition: "border-color 0.6s",
              }}
            />
          ))}
          {/* Sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `conic-gradient(${FOCUS_TINT[survey.focus]} 0deg, transparent 30deg)`,
              transform: `rotate(${(survey.prospectingElapsed / survey.prospectingDuration) * 720}deg)`,
              transition: "transform 0.4s linear",
              pointerEvents: "none",
              opacity: conf < 1 ? 0.55 : 0.15,
            }}
          />
          {/* Center target */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "var(--accent-cyan)",
              boxShadow: `0 0 ${10 + conf * 20}px var(--accent-cyan)`,
            }}
          />
          {/* Crosshairs */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "rgba(76,209,216,0.18)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "rgba(76,209,216,0.18)" }} />
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--text)",
            }}
          >
            CONF {(conf * 100).toFixed(0)}%
          </div>
          <div
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: FOCUS_TINT[survey.focus],
              textTransform: "uppercase",
            }}
          >
            FOCUS · {survey.focus}
          </div>
        </div>

        {/* Right — readout */}
        <div className="col gap-8">
          <div>
            <div className="dim mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.06 }}>
              Probe focus
            </div>
            <div className="row gap-8" style={{ flexWrap: "wrap", marginTop: 4 }}>
              {focusOptions.map((f) => (
                <button
                  key={f.id}
                  className={`btn tiny ${survey.focus === f.id ? "primary" : ""}`}
                  onClick={() => game.setSurveyFocus(f.id)}
                  title={f.hint}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="dim mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.06 }}>
              Composition
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7 }}>
              {(Object.entries(cand.resolvedYields) as [ResourceId, "trace" | "low" | "medium" | "high"][]).length === 0 ? (
                <span className="dim">scanning…</span>
              ) : (
                (Object.entries(cand.resolvedYields) as [ResourceId, "trace" | "low" | "medium" | "high"][]).map(([rid, band]) => (
                  <div key={rid} className="row between">
                    <span>{RESOURCES[rid]?.name ?? rid}</span>
                    <span style={{ color: BAND_COLOR[band], textTransform: "uppercase" }}>{band}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="dim mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.06 }}>
              Grid roll
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
              {cand.resolvedGrid ? (
                <span>{cand.resolvedGrid.w}×{cand.resolvedGrid.h}</span>
              ) : (
                <span className="dim">resolves at 80%</span>
              )}
            </div>
          </div>

          <div>
            <div className="dim mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.06 }}>
              Hazards
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, lineHeight: 1.7 }}>
              {cand.resolvedHazards.length === 0 ? (
                <span className="dim">{conf >= 0.9 ? "none" : "resolves at 90%"}</span>
              ) : (
                cand.resolvedHazards.map((h) => (
                  <div key={h} style={{ color: "var(--accent-amber)" }}>
                    · {HAZARD_LABELS[h]}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="row gap-8 mt-12">
            <button
              className="btn primary"
              disabled={conf < 0.65 || cand.staked}
              onClick={() => game.stakeCandidate(cand.id)}
            >
              {cand.staked ? "Staked ✓" : "Stake claim"}
            </button>
            <button className="btn" onClick={() => game.abandonProspecting()}>
              Drop target
            </button>
          </div>
          {conf < 0.65 && (
            <div className="dim mono" style={{ fontSize: 11 }}>
              Stake unlocks at 65% confidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateRoster({ game }: { game: GameApi }) {
  const survey = game.state.survey;
  if (survey.candidates.length === 0) return null;
  const sorted = [...survey.candidates].sort((a, b) => {
    if (a.staked !== b.staked) return a.staked ? -1 : 1;
    return b.confidence - a.confidence;
  });
  return (
    <>
      <h2>Roster</h2>
      <div className="card" style={{ padding: 0 }}>
        <table className="data" style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Type</th>
              <th>Conf.</th>
              <th>Top read</th>
              <th>Grid</th>
              <th>Hazards</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const top = pickDominantBand(c);
              const topRid = topYieldRid(c);
              return (
                <tr key={c.id}>
                  <td>
                    {c.staked ? "★ " : ""}
                    {c.id.replace(/^cand_/, "")}
                  </td>
                  <td className="dim">{c.kind}</td>
                  <td className="num">{(c.confidence * 100).toFixed(0)}%</td>
                  <td className="dim mono">
                    {top ? (
                      <span style={{ color: BAND_COLOR[top] }}>
                        {topRid ? RESOURCES[topRid].name : ""}: {top}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="mono dim">{c.resolvedGrid ? `${c.resolvedGrid.w}×${c.resolvedGrid.h}` : "—"}</td>
                  <td className="dim">{c.resolvedHazards.length || (c.confidence >= 0.9 ? "0" : "?")}</td>
                  <td>
                    {!c.staked && (
                      <button
                        className="btn tiny"
                        onClick={() => game.startProspecting(c.id, "composition")}
                      >
                        Prospect
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function pickDominantBand(c: AsteroidCandidate): "trace" | "low" | "medium" | "high" | null {
  const bands = Object.values(c.resolvedYields);
  if (bands.length === 0) return null;
  const order: Record<string, number> = { high: 4, medium: 3, low: 2, trace: 1 };
  let best: "trace" | "low" | "medium" | "high" | null = null;
  let bestScore = 0;
  for (const b of bands) {
    if (order[b] > bestScore) {
      bestScore = order[b];
      best = b as "trace" | "low" | "medium" | "high";
    }
  }
  return best;
}

function topYieldRid(c: AsteroidCandidate): ResourceId | null {
  const order: Record<string, number> = { high: 4, medium: 3, low: 2, trace: 1 };
  let best: ResourceId | null = null;
  let bestScore = 0;
  for (const [rid, band] of Object.entries(c.resolvedYields) as [ResourceId, "trace" | "low" | "medium" | "high"][]) {
    if (order[band] > bestScore) {
      bestScore = order[band];
      best = rid;
    }
  }
  return best;
}
