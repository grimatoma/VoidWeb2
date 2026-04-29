# Design Notes (Informal)

This is an informal log of design decisions and the reasoning behind them. It exists so that if a session crashes or context is lost, the *why* behind the docs survives. Less formal than `GAME.md`. Append-only — newest at the top.

---

## 2026-04-29 — Round 11: doc merge executed (R71)

User asked to finish the merge per R68. Executed the mechanical reorganization tracked as Pending #50.

### What landed

- **`GAME.md` created** as the single source of truth, structured in three Parts:
  - **Part I — Game Design**: working summary, pillars, tone, narrative framing, scope, tier ladder, content targets, prestige, session cadence, platforms, performance budget, numbers sheet, resources & recipes, pop-tier needs, tier-gate recipes, ship catalog, FTUE script (narrative version), AFK return spec, failure modes, notification taxonomy, stage progression, economy, events, IAP principles, acceptance criteria, open questions.
  - **Part II — UI Views**: global UI rules, navigation architecture, eight destinations (Map / Ops / Production / Fleet / Colonies / Trade / Research / Milestones), persistent surfaces, style direction, open questions, concept output plan.
  - **Part III — UX Flows**: FTUE flow (table version), AFK return flow, alert resolution, tier-up, buy ship, build recipe, survey & claim, route creation, Earth prefab kit, prestige incorporation, quests, common micro-interactions, open questions across flows.
- **R69/R70 applied to Production view text during merge.** Grid Workspace now spec's the placement-preview collaboration-radius boundary. Build Drawer card adjacency hints rephrased from edge-adjacency wording ("+15% next to a Mine") to radius-based wording ("+15% with a Mine in collaboration radius"); storage cards omit adjacency lines per R70.
- **Cross-doc references rewritten** to internal Part-section refs: 9 in-content refs to `GAME_DESIGN.md` / `UI_VIEWS.md` / `UX_FLOWS.md` updated. Companion-doc refs (`DECISIONS.md`, `DESIGN_NOTES.md`) preserved since those files remain separate.
- **Source files removed**: `GAME_DESIGN.md`, `UI_VIEWS.md`, `UX_FLOWS.md` deleted (`git rm`).
- **`CLAUDE_DESIGN_PROMPTS.md` references updated**: 3 mentions of the old docs converted to `GAME.md`.

### DECISIONS.md prune pass

User also asked to review Decisions/Design docs for outdated content.

Changes:
- Pending #50 (doc merge execution) moved to Resolved as **R71**.
- Source-column references throughout DECISIONS.md updated from `GAME_DESIGN ...` / `UI_VIEWS ...` / `UX_FLOWS ...` to `GAME.md (Part I/II/III) <Section>` to keep links resolvable.
- R34's resolution body updated from "To be propagated to ..." to "Propagated to ..." since that propagation has actually landed in the merged file.
- R38's resolution body updated to point at GAME.md (Part II) Persistent Surfaces as the anchoring section.
- Top-of-file sentence updated to reflect the new doc layout.
- **Not pruned (deliberately):**
  - R30 (pair-based adjacency) is marked superseded by R65 but kept as a supersession trail. It documents the design's evolution.
  - All Pending items retained in priority order. Every P2/P3 entry is genuinely playtest-or-strategic-late-game; none have grown stale enough to demote per the file's own "3+ sessions untouched" rule.
  - Historical Resolved entries kept intact — DECISIONS.md is the resolution log and the historical record is the value it provides.

### DESIGN_NOTES.md prune pass

DESIGN_NOTES is an append-only session log. Its purpose is preserving session context for crash recovery. Pruning it would defeat that purpose, so the rule applied here is: don't delete historical content; just append the new round and update the leading description ("`GAME_DESIGN.md` or `UI_VIEWS.md`" → "`GAME.md`") for forward correctness.

### Verification

- `grep "GAME_DESIGN\\.md\\|UI_VIEWS\\.md\\|UX_FLOWS\\.md" GAME.md` returns only the explanatory header at line 3 (which intentionally names the merged-from files).
- `grep "GAME_DESIGN\\|UI_VIEWS\\|UX_FLOWS" DECISIONS.md` returns only R68 and R71 (historical context describing the merge itself).
- `grep "GAME_DESIGN\\|UI_VIEWS\\|UX_FLOWS" CLAUDE_DESIGN_PROMPTS.md` returns nothing.

### State of pending after Round 11

- **P0:** 1 item — #2c grid-range tuning (deferred to Stage 3 playtest). #50 closed by R71.
- **P1:** 0.
- **P2:** 6 (unchanged from Round 10).
- **P3:** 10 (unchanged from Round 10).

Concept is now implementation-ready. The doc-drift surface that R68 was designed to eliminate is gone. Next non-trivial step is whatever the user picks: Stage 1 architecture work, Stage 0 visual mocks via CLAUDE_DESIGN_PROMPTS, or further design drills (e.g., authoring the quest content pool, fleshing T7 milestones, drilling T3+ recipes).

---

## 2026-04-29 — Round 7 review: post-lock concept audit

User asked for a fresh "any gaps?" review of the current design after Rounds 1–6 closed. Re-read every doc top-to-bottom. The concept is in *much* better shape than at the round-1 audit — the spine is solid, content targets exist, the Anno-in-space framing is locked, and 50+ decisions have been resolved. What follows are the gaps that survived the previous rounds, plus new ones that emerged from cumulative locks.

### Real bugs (must fix, not opinion)

1. **FTUE/T0→T1 gate contradiction.** GAME_DESIGN.md FTUE line 336 and UX_FLOWS.md line 48 both show the t=13:00 tutorial banner as `Reach $10k to unlock Lunar Foothold (T1)`. The actual T0→T1 gate (GAME_DESIGN.md line 280) is `Sell 200 Refined Metal AND accumulate 50 Hydrogen Fuel reserves`. UX_FLOWS line 454 has the correct version (`gate progress: 124/200 metals sold`), so there's drift within a single doc. This is a documentation bug — pick one and reconcile.
2. **Settle-in window during AFK is unspec'd.** Pop-tier settle-in is real-time (Survival 5min → Affluent 4h, R56). Cumulative ≈ 7h to Affluent. Critical question: does the timer run while the player is offline? If yes, a player who sets up at night + checks in next morning auto-passes Survival/Settled/Growing/Comfortable in one AFK return — the "build tension as 'I'm waiting for the big advance'" claim collapses. If no, settle-in becomes a session-time gate, which conflicts with "minutes-to-a-day" cadence. Either answer is defensible; the choice is load-bearing for the cadence pillar but isn't written down.
3. **Storage cap upgrade UX is unspec'd.** When T2 unlocks 3× Silo capacity, what happens to existing T0 silos? Auto-upgrade in place? Ripped out and rebuilt (player loses stored ore)? Unlocked-but-only-affects-new-silos? GAME_DESIGN line 165–170 just shows the capacity table without UX semantics. Affects the "every storage slot is a refinery you didn't build" pillar.

### Material gaps (P0/P1 territory)

4. **Audio direction is null.** "NASA-industrial" tone is fully spec'd visually. Zero mention of audio. For a game whose hero surface is the orbital map and whose voice is locked terse-corporate, audio is half the mood. Stage 2 territory but the *direction* needs a sentence.
5. **iOS PWA push notification reality.** The notification taxonomy assumes Web Push. iOS Safari only ships Web Push for *installed* PWAs (homescreen-added), and even then with limits. Mobile mid-tier players on iOS who don't install will silently get zero push notifications — and the design's "≤3 push/day default" depends on push working. Either accept iOS-degraded-without-install (and design alerts to be in-app-discoverable) or commit to "install required for full mobile experience" (and add an FTUE install prompt). Currently the docs assume push works; they don't acknowledge this constraint.
6. **Save conflict resolution is hand-wavy.** GAME_DESIGN line 136: "Conflict resolution favors latest deterministic state." If two devices both played offline against the same starting save and pushed different states, what does "latest deterministic state" mean — wall clock? Game-time advancement? Whoever synced first? This will eat someone's progress if not spec'd.
7. **No narrative/flavor layer.** The terse-corporate voice is locked but no actual strings exist beyond ~3 examples. Who is the player — a corporation? A foundation? Earth-side context? Is there a company name? Mission-control voice for AFK summaries? Voice without content is just a font choice. This isn't the same as wanting NPC dialogue (which was rejected) — it's the framing that makes "First IPO" and "System Corporation" land.
8. **Quest content authoring not started.** R40 commits to ~30–50 hand-authored daily templates + 5–8 weekly arcs. None drafted. Largest authoring task in the game. Daily quest content is the long-tail texture between tier-ups; if it doesn't exist, mid-tier engagement drops.
9. **Adjacency authoring scope.** Soft adjacency (R30) at +10–25% for paired buildings. Only 3 example pairs in the docs (Mine+Crusher, Refinery+Smelter, Greenhouse+Water-Reclaim). With ~30 buildings the pair matrix is real authoring effort. What about buildings with no good pair — do they get a fallback bonus, or are they "always solo"?
10. **Earth bailout cap is unspec'd.** Failure Modes table says "capped uses per run" without a number. Too generous = no skin in the game; too low = wall-stuck. Probably 2–3 per run; needs commitment.

### Mobile-ability gaps

11. **Multi-stop route editor on mobile.** Routes have up to 3 stops from T0 (R42); building a 3-leg chain on a portrait phone screen needs a layout. Not mocked.
12. **Build Drawer + grid on mobile.** Production view's grid workspace + Build Drawer overlay isn't mocked at portrait-phone density. A 7×7 grid eats most of a phone screen; the drawer needs to coexist without occluding placement preview.
13. **Touch-target sizing not stated.** No "44px minimum" rule in the doc. Some dense surfaces (Fleet list, Resource Detail screen, body warehouse rows) will fail on phones if not designed for it.
14. **Map gesture disambiguation.** Tap vs. pan threshold, pinch zoom behavior, long-press semantics — not spec'd. Map is the emotional centerpiece; misfiring touches there poisons the experience.
15. **Accessibility / reduced motion / contrast.** Not addressed. Tier-up animation (R57: "new region animated/highlighted") needs `prefers-reduced-motion`. NASA-industrial dark palette needs contrast verification.
16. **Landscape vs portrait policy.** "Portrait-first, landscape supported" — but landscape on a tablet is materially different from landscape on a phone. Single rule or two?

### Content depth gaps

17. **T7 milestones target ~6–10; only 5 named.** Authoring work remaining.
18. **Charters target 6–8; only 5 named** (3 reserved). 
19. **Earth Prefab Kits target ~10–14; only 2 named.**
20. **Events target ~24; only ~6 named.**
21. **Research nodes target ~40; branches named, nodes empty.**
22. **T3+ recipes deliberately deferred** (P3 #39); still flagging it as a content cliff.
23. **No long-tail repeat content past ~50 recipes + ~30–50 daily templates.** A 200-hour player exhausts the content mid-T7 absent prestige Charters changing the play. Charter variety carries the long tail; six Charters for v1 may be light.

### Coherence drift between docs

24. **DESIGN_NOTES Round 6 itself flags a reconciliation pass** that was about to happen when the previous session crashed (see top of file: "What's next: big-doc reconciliation"). A bunch of items in that list look done in GAME_DESIGN.md (T7 destination, no-sub-minute corollary, Charter pick prestige, storage buildings on grid) — but UI_VIEWS.md and UX_FLOWS.md need a re-read against the locks to confirm. Specific items called out there:
   - UI_VIEWS Global UI Rules: no-sub-minute corollary (R34) — verify present
   - UI_VIEWS Mobile Layout: T1 nav reshuffle Map/Ops/Colonies/Fleet/More (R39) — verify
   - UI_VIEWS Map: Heat mode dropped (R46) — verify
   - UI_VIEWS Body Detail Sheet: 4 tabs (R43) + Pin persists (R58)
   - UI_VIEWS Production: grid workspace, Build Drawer cards drop build-time (R33)
   - UI_VIEWS Status Bar: drop Sim Speed (R22), drop Pause (R34)
   - UI_VIEWS Persistent Surfaces: Resource Detail screen (R38)
   - UI_VIEWS Fleet: shift-click multi-select (R47)
   - UI_VIEWS Confirm rule: bulk-action threshold (R59)
   - UX_FLOWS FTUE: t=4:30 raw sale, t=6:00 Smelter contrast (R35) — verified present
   - UX_FLOWS AFK Return: 24h hard cap (R31), hybrid event metric (R32)
   - UX_FLOWS Build Recipe: placement step, drop wall-time (R33, R27)
   - UX_FLOWS Tier-Up: dismiss-to-Map with new region animated (R57)
   - UX_FLOWS Route Creation: multi-leg editor (R42, multi-stop from T0)
   - UX_FLOWS new flow: Quest claim/reset (R40, R25)
   - UX_FLOWS Earth Prefab Kit: 1-of-1 hand-authored shape (R37)

### What's *strong* in the current state (not hand-waving)

- Tier ladder is concrete with named gates that aren't paywalls.
- Charter prestige answers the "treadmill" critique cleanly.
- Storage-as-buildings-on-grid forces the right opportunity-cost decision.
- Survey-rolled grid sizes give discovery a skill ceiling without the survey minigame everyone (correctly) rejected.
- No-sub-minute corollary is the correct discipline given no Pause control.
- Hybrid foreground/AFK event metric solves the "5-min/day player gets nothing" tension.
- True dual-target with single nav language is consistently held throughout.
- FTUE script has decision points, compare moments, and a real free-play boundary.

### What I'd ask the user next

The full inventory is in this notes entry; the highest-leverage Q1 set is:
- Triage which gap area to drill first (review meta-question).
- Settle-in during AFK: progress or pause? (Cadence-load-bearing.)
- iOS PWA notification policy: degrade gracefully or require install?
- Audio direction commitment: sentence-level only or skip until Stage 2?

Other questions in flight after the first set: storage cap upgrade UX, save conflict policy, Earth bailout cap, narrative framing, doc-reconciliation pass scope.

### Round 7 Q1 answers

- **Drill order: implementation-unblocking concepts first.** User explicitly steered away from audio/iOS/polish toward "things you need before you can start building." Translates to: fix FTUE-gate bug, pin storage upgrade UX, pin save conflict rule, pin bailout cap, scope quest/adjacency authoring, narrative framing, then doc reconciliation. Audio + iOS push + polish accessibility = explicitly deferred.
- **Settle-in during AFK: hybrid, capped per AFK return.** Progresses while away but capped — placeholder shape: at most ONE tier transition per AFK return regardless of away-duration. So an overnight player advances Survival → Settled (or one further), not Survival → Affluent in one return. Preserves "wait for the big advance" tension AND honors the daily-check-in cadence. Late-tier 4h windows can still feel like a real wait if the player has just used their AFK transition. Need to spec: does the cap reset on next AFK return, or does the 4h window restart from foreground time only? Lean: cap resets on next return; window resumes (does not restart) so total real-time-elapsed counts but only one cap-step is granted per session boundary.
- **iOS push: N/A — deferred.** Don't drill, don't write into the doc as a constraint.
- **Audio: defer to Stage 2.** Don't add a sentence; the gap stays open intentionally until Stage 2.

These answers narrow Round 8 to: real-bug fixes + concept-completeness items only.

### Round 8 answers

- **Storage cap upgrade UX: auto-upgrade in place.** Existing T0 silos gain higher cap on tier transition. No player action required. Cleanest UX; storage's "every slot is a refinery you didn't build" pillar still holds because a player can never stockpile *infinitely* without spending more grid slots — they just don't have to think about cap as a separate upgrade chore. Adds a small dopamine beat at tier transitions (capacities silently expand). Save model implication: storage cap is computed from `tier × silo_count` not stored per-silo.
- **Save conflict: player picks on conflict.** Show a Conflict Screen with both saves' game-time, last-wall-time, headline stats (credits, pop, tier). Player picks one to keep; the other discards. Rare in practice (most players sync more often than they offline-divide). Need a UX surface in UI_VIEWS Settings → Saves area, or as a startup interruption when conflict is detected on cloud-sync resume.
- **Earth bailout: deferred to post-prototype.** May not exist at all; revisit after Stage 3 playtest reveals whether players actually get stuck. Failure Modes table needs to be updated to remove the bailout row (or mark as TBD).
- **Narrative framing: player-as-corporation, faceless Earth.** Default company name "VOID YIELD CO." (player-renameable at FTUE). Earth interactions remain a fixed-price market (no NPCs). Milestones use corporate-beat language (already aligned: First IPO, Charter Signed, System Corporation Declaration). No mission-control voice. Minimal new authoring — mostly anchors the existing terse-corporate strings. Need to add: company-name set at FTUE (one-line tutorial moment), GAME_DESIGN section for Narrative Framing, optional setting to rename later.

### Round 9 answers

- **FTUE/T0→T1 gate text: fix banner to show concrete gate.** Replace `Reach $10k to unlock Lunar Foothold (T1)` with `Sell 200 Refined Metal to unlock Lunar Foothold (T1) · 124/200 sold` (matches the canonical version on UX_FLOWS line 454). Reinforces the "content gates not paywalls" pillar from day one — first gate the player sees is concrete production, not a credit number.
- **Adjacency: range-based, not pairs.** **This supersedes R30.** Buildings have a *collaboration radius* (placeholder: 2 blocks). Any building within radius contributes a bonus. Replaces the pair-list authoring model (~30 buildings × pair matrix) with a per-building radius + a per-pair-type multiplier table. New questions this opens: do all buildings have the same radius? Is the bonus flat per neighbor or pair-type-weighted? Are there buildings that don't grant any bonus (e.g., storage)? Lean: storage buildings don't grant bonus to anything; pair-type table still exists but is consulted by neighbor type, not by adjacency-tile-edge. Cleaner authoring, more puzzle texture (placement decisions become "what's nearby" not "what's edge-adjacent").
- **Quest scope: lean v1 — 8–12 dailies + 2 weeklies.** Author T0–T2 templates; learn from Stage 4 playtest before scaling. Reduces up-front authoring; defers tuning until we see how players actually engage daily quests.
- **Doc structure: clarify before reconciling.** User raised a meta-concern: the UI_VIEWS / UX_FLOWS / GAME_DESIGN split may be the *cause* of the drift bugs we keep finding. They're worried about disconnect and asking whether one giant doc is better. This is a load-bearing structural decision — the answer changes how the next 5 sessions of work are organized. Round 10 needs to commit on doc structure before applying any further locks, since "where does R64-on get written" depends on it.

### Doc structure problem statement

**Current layout:**
- `GAME_DESIGN.md` (770 lines) — game systems, content, balance, FTUE script, prestige, economy, events
- `UI_VIEWS.md` (1099 lines) — destinations, persistent surfaces, control inventory, navigation
- `UX_FLOWS.md` (469 lines) — cross-cutting journeys (FTUE, AFK return, alert resolution, tier-up, etc.)
- `DECISIONS.md` (136 lines) — resolution inventory; pending + resolved
- `DESIGN_NOTES.md` (this file) — informal session log
- `CLAUDE_DESIGN_PROMPTS.md` (538 lines) — prompt templates for design sessions

**Disconnects we've already found:**
1. FTUE script lives in *both* GAME_DESIGN.md (full t=X:YY narrative) and UX_FLOWS.md (table form). They drifted on the T0→T1 gate banner text.
2. Round 6 reconciliation list (Apr 28) had items pending across three docs that didn't all land before crash.
3. Earth Prefab Kit shape (R37) is mentioned in GAME_DESIGN, UI_VIEWS Trade view, AND UX_FLOWS — three places to keep in sync.

**Doc-strategy options:**

- **A. Status quo (separate docs).** Drift continues; rely on DECISIONS.md as the reconciler. Cheap, but the disconnect concern is real.
- **B. Merge UI_VIEWS + UX_FLOWS into one `GAMEPLAY_SPEC.md`.** Keep GAME_DESIGN separate for systems/balance. One UX source. ~1500 lines.
- **C. Merge everything into one `GAME.md`.** Game + UI + flows together. ~2300 lines. Single source of truth; biggest read but no drift surface.
- **D. Status quo + strict cross-reference policy.** Keep separate docs but add a "Cross-doc dependencies" header in each section that shows where else the topic appears. Drift still possible but visible.

Recommendation: **C** for v0.1 cohesion-over-readability. The doc *is* large but the design needs holistic readability more than it needs short individual files. AI tools and modern editors handle 2300 lines fine; the drift cost of separation is real (we've already paid for it twice).

### Round 10 answers

- **Doc structure: One giant GAME.md.** Merge GAME_DESIGN + UI_VIEWS + UX_FLOWS. DECISIONS + DESIGN_NOTES stay separate. Single source of truth eliminates cross-doc drift. Logged as R68. Execution = mechanical reorganization; deferred to a focused session and tracked as Pending #50 in DECISIONS.md.
- **Adjacency radius default: 2 tiles uniform at v1, with per-building radius override architecturally supported.** Rationale: simple to learn (one number), simple to balance, but the *engine* must allow per-building values so future content / balance tuning can vary radius per definition. Visual placement preview must show the collaboration radius boundary (e.g., highlight the 5×5 area around the building being placed, with a different shade for the building's own tile and the radius edge). Logged as R69.
- **Storage adjacency: neutral.** Storage buildings (Silo / Tank / Cryo Tank) don't grant or receive adjacency bonuses. Pure capacity; trade-off is grid space, not synergy. Logged as R70.

### Round 7–10 lock summary (R60–R70)

Eleven new resolutions, one supersession (R30 → R65). State of pending after this round:

- **P0:** 2 items — #2c grid-range tuning (deferred to playtest), #50 doc-merge execution (mechanical).
- **P1:** 0.
- **P2:** 6 (unchanged from Round 6).
- **P3:** 10 (unchanged from Round 6).

The design has gone from 41 pending items at the start of decision-cataloging to 18 total, with 0 P1 items, only 2 P0 items (one of which is mechanical execution and one of which is playtest-deferred). The concept is implementation-ready pending the doc merge.

### What needs to land in GAME_DESIGN.md before/during merge

Concept changes from R60–R70 that change content (not just structure):

1. **Pillars — Spatial Layout:** rewrite adjacency description to range-based (R65, R69). Note storage neutrality (R70).
2. **Resources & Recipes — Placement subsection:** rewrite adjacency mechanic. Change "+10–25% applied to paired buildings" to "+10–25% applied to buildings within the placer's collaboration radius (default 2 tiles)."
3. **Storage Defaults table:** add a note that existing storage buildings auto-upgrade in place at tier transitions (R60).
4. **First 15 Minutes (FTUE) script t=13:00:** replace `Reach $10k to unlock Lunar Foothold (T1)` with `Sell 200 Refined Metal to unlock Lunar Foothold (T1) · 124/200 sold` (R64).
5. **Failure Modes table:** remove the "Zero credits, zero exportable" row OR mark it as TBD post-prostotype (R62).
6. **Notification Taxonomy / Save model:** update conflict resolution to "player picks" (R61).
7. **Pop-Tier Needs table:** add note that settle-in windows resume across AFK and a player gains at most one tier transition per AFK return (R67).
8. **New section: Narrative Framing.** Player-as-corporation, default company name "VOID YIELD CO." renameable at FTUE, no NPC dialogue, Earth = faceless market (R63).
9. **Content Targets:** revise quest line from `~30–50 hand-authored daily templates plus ~5–8 hand-authored weekly arcs` to `8–12 hand-authored daily templates + 2 weekly arcs at v1; full target ~30–50 / 5–8 deferred to Stage 4 playtest signal` (R66).

### What needs to land in UX_FLOWS.md before merge

10. **FTUE flow t=13:00 banner text** (line 48): same fix as item 4 above (R64).

### What needs to land in UI_VIEWS.md before merge

11. **Production view — Build Drawer / placement preview:** spec the visual collaboration-radius boundary on placement (R69).
12. **Production view — adjacency description:** update to range-based (R65).

---

## 2026-04-28 — Final UX locks + decisions complete (Q18–Q21)

Round 6 closed the last meaningful pendings — all four picks landed on recommended.

**Q18 settle-in → tier-scaled.** Survival 5min, Settled 20min, Growing 1h, Comfortable 2h, Affluent 4h. Early dopamine fast (forms habit during onboarding); late tiers build tension as "I'm waiting for the big advance." Closes design-review #4.

**Q19 tier-up dismiss → return to Map with new region animated.** Tier-up treated as a chapter break, not an inline unlock. The new-region reveal IS the payoff. Closes the design-review's "tier-up dismiss-target ambiguity is a tell" — the chapter-break frame wins.

**Q20 Pin → persists across navigation.** Power-user feature on desktop only. Lets a player keep NEA-04's warehouse visible while editing chains in Production — the cross-screen analysis pattern PP power-users actually want.

**Q21 confirm rule → add bulk-action threshold.** Existing rule (irreversible OR ≥25% credits) + NEW: any single action affecting >100 units of a finished resource. Catches catastrophic high-wealth misclicks. Closes design-review #12.

**State of decisions: complete.** P0 pending = 1 (#2c grid-range-tuning, deferred to playtest). P1 pending = 0. P2 pending = 6 (all genuinely playtest-or-Stage-2 calls). P3 unchanged. The design has gone from 41 pending items (when DECISIONS.md was first cataloged) to 7, with all of those being deferred-to-playtest or strategic-late-game.

**What's next: big-doc reconciliation.** The formal docs (GAME_DESIGN, UI_VIEWS, UX_FLOWS) currently reflect the *pre-decisions* state for many sections. Examples that need updating:

- **GAME_DESIGN.md**
  - Pillars: "Setup Is Active" should specify spatial grid (R27).
  - Failure Modes: add the no-sub-minute corollary (R34).
  - Tier ladder: T7 endgame fleshed out as Destination (R36).
  - Pop-Tier Needs table: settle-in window now tier-scaled (R56).
  - Prestige Loop: Charters added as headline mechanic (R44).
  - Storage model: shift from abstract caps to grid-buildings (R41).
  - Sim Speed removed from architecture (R22); Pause removed (R34).
  - Notification taxonomy: tied to no-sub-minute corollary.

- **UI_VIEWS.md**
  - Global UI Rules: add no-sub-minute corollary (R34).
  - Mobile Layout: T1 nav reshuffle (Map / Ops / Colonies / Fleet / More) per R39.
  - Map: drop Heat mode (R46); 3 modes only.
  - Body Detail Sheet: 4 tabs (Overview / Buildings / Storage / Activity) per R43; Pin persists across nav (R58).
  - Production: shift to grid workspace; Build Drawer cards drop build-time (R33).
  - Status Bar: drop Sim Speed control (R22) and Pause (R34).
  - Persistent Surfaces: add Resource Detail screen spec (R38).
  - Fleet: shift-click for desktop multi-select (R47).
  - Confirm rule: add bulk-action threshold (R59).

- **UX_FLOWS.md**
  - FTUE: rewrite t=4:30 raw sale, t=6:00 Smelter intro contrast (R35).
  - AFK Return: confirm 24h hard cap (R31), hybrid event metric (R32).
  - Build Recipe: add placement step, drop wall-time (R33, R27).
  - Tier-Up: dismiss-to-Map with new region animated (R57).
  - Route Creation: add multi-leg editor (R42, multi-stop from T0).
  - New flow: Quest claim/reset (R40, R25).
  - Earth Prefab Kit: 1-of-1 hand-authored shape (R37).

Per the doc-edit memory pattern, this should be done as full rewrites (`Write` not `Edit`) since the changes are reframings. Splitting across separate tool calls per file to survive timeouts.

Asking the user before proceeding — three big rewrites is meaningful effort and they may want to pace it.

---

## 2026-04-28 — Mechanical cleanups + P2 default-locks (Q14–Q17 + bulk locks)

Round 5 closed the four biggest mechanical questions left from the design review (storage, multi-stop, body-sheet tabs, prestige) and bulk-locked 8 P2 items at their docs-stated "Lean"/"Default" values.

**Q14 storage → buildings on grid, tier-gated capacity.** Dedicated Silo / Tank / Cryo buildings sit on the grid like any other building, each taking 1 slot. Capacity unlocks at tier transitions (placeholder: T0 = 300, T2 = 900, T4 = 3000). Closes the design-review's storage-dominance critique: storage stops being the runaway upgrade because every storage slot is a refinery you didn't build. Coupled neatly to R27 (spatial grid) and R29 (survey-rolled grid sizes) — small NEAs face hard storage-vs-production tradeoffs; big rolls give breathing room.

**Q15 multi-stop → T0.** Routes can have up to 3 stops from day one. Combined hulls (Mixer-1) get a unique role immediately. Route Creation UI gains a multi-leg editor — added complexity, but combined hulls would be trap purchases without it. NEA → Lunar Habitat → Earth in one assignment is a meaningful T1+ pattern; it earns the Mixer-1's 20+10 split.

**Q16 body-sheet tabs → 4 (Overview / Buildings / Storage / Activity).** Notes cut. Ships and Routes merge into Activity ("what's moving in/out of this body"). Mobile fit at half-height improves; "which tab was that?" confusion drops.

**Q17 prestige → Charter pick + modest carryover.** Each prestige, player picks one of ~6–8 hand-authored Charters that modify the next run mechanically. Mining Charter, Tanker Charter, Logistics Charter, etc. PP2-aligned. Carryover stays modest (% research, % recipe knowledge) so the Charter is the headline mechanic, not the multiplier. Closes the design-review's "treadmill not homecoming" critique. Adds a meta-progression layer (which Charters have you tried?) without bloating run length.

**Bulk P2 locks (R47–R55).** 8 P2 items that had clear "Lean"/"Default" notes locked at those values, plus 3 inline cuts (Notes, Heat, Multi-select).

| Resolved | Lock |
|----------|------|
| Re-scan cost | Free (time-only) |
| Claim limit | Unlimited at v1 |
| Ship delivery time | Instant at v1 |
| Repeat-route UI | 3-button segmented |
| Window-based departure | Indicator only, not enforced |
| Trade order timing | Instant fixed-price |
| Persistent bottom strip on desktop | Map+Ops only |
| Settings → Saves cloud-sync UI | Auto-only with status indicator |
| Multi-select on desktop Fleet | Shift-click row |
| Heat mode on Map | Cut at v1 |
| Notes per body | Cut at v1 (deferred to v2) |

Convergent enough that the user wanted to clear them in bulk. None block T0 build; most are stage-2 polish or playtest-tuning territory.

**State of pending after this round:** P0 has 1 item (#2c grid range tuning, deferred to playtest). P1 has 3 items (Pop-tier settle-in #8, Tier-up dismiss #14, Pin toggle scope #15). P2 has 6 items, all genuinely playtest-or-stage-2 calls. P3 unchanged. The design has gone from 41 pending items to 10, with a clear path through the rest.

Logged as R41–R55 in DECISIONS.md.

**Still asking next round:** Pop-tier settle-in window, Tier-up dismiss target, Pin toggle scope, Confirm-rule extension at high wealth. After Round 6, only playtest-deferred items remain — at which point we should reconcile the formal docs (GAME_DESIGN, UI_VIEWS, UX_FLOWS) in one big pass.

---

## 2026-04-28 — P0 cleanup + first major P1 (Q10–Q13)

Round 4 closed the remaining P0 items (Earth Prefab, Sources & Sinks) and the biggest P1 (Mobile nav at T1, Quest shape). All four picks landed on the recommended option.

**Q10 Prefab Kits → 1-of-1 hand-authored per tier.** Each tier unlocks specific kits; each kit is buyable once. The "I just bought my Mars foothold" moment is the load-bearing emotional beat — kits become tier-up payoff, not a generic Earth-buy mechanic. Authoring scales with tier count: ~10–14 kits across T1–T6.

**Q11 Sources & Sinks → popover + global screen.** Tap-status-bar opens the popover for a quick glance; "View all" pushes to a full Resource Detail screen for cross-network analysis. The global screen prevents Colonies-from-becoming-a-debug-tool. New surface needed in UI_VIEWS: Resource Detail screen (light spec — table + global rates + storage + in-transit). It's the diagnostic surface for the whole game.

**Q12 Mobile nav at T1 → promote Colonies.** Bottom-bar reshuffles at T1: Map / Ops / Colonies / Fleet / More. Production drops to More. The principle this locks in: bottom-bar serves the daily/short-check-in axis; long-session destinations live one tap deeper. Production at T0 is in the bar because it's where the player builds (active early-game); after T1, Colonies overtakes it.

**Q13 Quests → hand-authored dailies + weekly arcs.** Commits to authoring discipline rather than procgen. Sizing: ~30–50 hand-authored daily templates parameterized by current state (resource name, body name, count) gives ~1–2 weeks of unique-feel rotation. Weekly arcs ~5–8 hand-authored, tier-gated. Reward shape: dailies = small credits + small Charter Shares preview drip; weeklies = larger Charter Shares preview + occasional unlocks (cosmetic, sandbox toggle, etc.).

**Knock-on for content authoring:** the design now commits to authoring three content layers — recipes (~50), Earth Prefab Kits (~10–14), quest content pool (~30–50 daily templates + 5–8 weekly arcs). All tier-scoped. None unlock new mechanics; all populate existing systems.

Logged as R37–R40 in DECISIONS.md. Pending #4, #6 (P0) and #7, #15c (P1) removed.

**Still open:** P1 #8 (Pop-tier settle-in window), #9 (Multi-select desktop Fleet), #14 (Tier-up dismiss target), #15 (Pin toggle scope). Plus design-review items not yet asked: storage-dominance fix, multi-stop routes, body-sheet tab consolidation, prestige-as-modifier model, confirm-rule extension at high wealth.

---

## 2026-04-28 — Pacing locks: build, pause, FTUE, T7 (Q6–Q9)

Round 3 closed four pacing/structural calls.

**Q6 build time → instant placement.** Building placed = building exists. Cost (credits + grid slot) is the only gate. Critical given R27 (spatial grid): placement now has a thoughtful "where" decision; adding a "wait 90s for it to be real" timer on top stacks two friction moments. Removes a third real-time-timer category atop route transit, probe scans, pop settle-in, research. Build Drawer cards now show cost + grid footprint + output preview — not build time.

**Q7 pause → cut entirely.** No time-stop control. The user's rationale: alerts and events should never be so time-sensitive that reading one matters. This is a *meaningful design constraint* derived from the choice — it forces a corollary rule into the spec:

> **Corollary rule: No alert/event has a sub-minute urgency window.** If reading an alert at human pace can change the outcome under time pressure, the alert is mis-tuned. Life support shortages must give plenty of warning before suspension. Stranded ships wait politely. Storage-cap warnings fire well before zero-output. The 1.7h-reserve "low O2" example currently in the docs is fine; anything tighter than ~5 min real-time is wrong.

This corollary needs to land in UI_VIEWS Global UI Rules and the GAME_DESIGN Failure Modes table. It also bounds notification design: critical pushes can name a problem but never need a sub-minute response from the player.

**Q8 FTUE → raw ore at t=4:30.** First dopamine moves up by 2 minutes. Smelter still introduced at t=6:00 as the *contrast* moment — "look how much more you'd have made if you'd refined." Pedagogy by comparison rather than by demonstration. Refining still in FTUE; it's just the *second* sale that pays off the chain pattern.

**Q9 T7 → destination.** 5–10h of unique play. Saturn ring industries, outer-system probes, hand-authored narrative milestones (working titles: "First IPO," "Charter Signed," "System Corporation Declaration"). Prestige is the closing chapter, not the goal — players can prestige when ready or stay and complete. Closes the design-review's "T7 is fog" critique. Drafting placeholder T7 milestone names + progression conditions becomes a near-term content task that unblocks the Milestones screen's prestige-preview.

**Implications for upcoming work:**
- T7 milestone authoring is a new content task. Drafting placeholders unblocks Milestones content.
- The pause-cut corollary needs propagation into UI_VIEWS Global UI Rules and the Failure Modes table in GAME_DESIGN.
- FTUE script (UX_FLOWS) needs a small rewrite at t=4:30 raw sale and t=6:00 Smelter intro as compare moment.
- Build Drawer (UI_VIEWS Production) loses the build-time field on cards.

Logged as R33–R36 in DECISIONS.md. Pending #1, #2b, #3 removed.

**Still open in P0/P1 for next rounds:** #4 Earth Prefab Kit shape, #6 Sources & Sinks Popover scope, #7 Mobile bottom-nav at T1, #8 Pop-tier settle-in window, #15c Quest cadence/reward. Plus minor: tier-up dismiss target, Pin toggle scope, multi-select on desktop Fleet.

---

## 2026-04-28 — Spatial mechanics + pacing dials (Q2–Q5)

Round 2 resolved the spatial cascade and the two pacing dials. Round 1 settled the structural model (spatial grid placement, idle-default cadence); Round 2 picks the numbers.

**Q2 grid scale → survey-revealed variable.** Body grids roll within a body-type range at survey time. NEAs might roll 3x4 to 5x5; lunar habitats 5x5 to 7x7; Mars colonies 7x7 to 9x9; ranges to be tuned in playtest. Each survey becomes a small lottery: a 5x5 NEA is a meaningful early-game find, a 3x4 is "just enough for a starter mine." Persists with the body for the run; tied to the procedural seed.

**Knock-on effect:** survey is now meaningful again. R-4 had survey as setup-only with no skill ceiling (just "wait for the timer, look at the readings"). With grid sizes rolled at survey, surveying becomes a *discovery* loop — each new body might be the rare big roll that justifies a major chain. The Survey mode of the Map earns weight beyond setup; survey-cost (re-scan, claim limit, P2 pendings #18 #19) gets more interesting because rare-big-roll bodies make claim-prioritization a real decision.

Tradeoff acknowledged: harder to balance than hand-authored grids. A great early roll can compound. Range tuning per body type is now explicitly a P0 sub-task (#2c) and Stage 3 will need to validate it.

**Q3 adjacency → soft.** ~10–25% rate boosts for paired buildings (Crusher+Mine, Refinery+Smelter, Greenhouse+Water-Reclaim, etc.). Not dominant — players can ignore adjacency at T0 and still progress. By T2+, when production densities go up and bottlenecks bite, adjacency lean-in becomes a meaningful optimization layer.

PP-strong adjacency was rejected as too easy to break balance with one good config. Functional adjacency was rejected as feeling punitive when players don't know the rule. Soft is the lowest-risk highest-replay-value option — and crucially, soft adjacency lets the *survey-rolled grid size* be the headline placement constraint while adjacency is the texture.

**Q4 AFK cap → 24h hard cap.** Matches "minutes to a day" cadence. Daily check-in is the implicit contract. Weekend/travel players hit the cap; this was the design-review's open concern but the user landed on accepting it as a v1 trade. If retention data shows it costs us, the consumable extender ("Long Voyage Reserves") remains the cleanest follow-up — easy to layer on without breaking 24h-base scaling.

**Q5 events metric → hybrid.** Foreground events per-active-play-min + AFK-return events on long-away. Pure-foreground was rejected because it leaves the AFK Return modal flat (events should be part of "what happened while you were away"). Per-tier budget was rejected because fast-progressing players exhaust event content. Per-output was rejected as opaque. Hybrid satisfies the "5 min/day = fewer foreground events" ask AND gives AFK return a beat.

**Three open mechanics this round didn't resolve** but logged as P0/P1: Pause toggle (#2b — keep/cut after sim speed removal), Quest cadence/reward (#15c — needs decomposition into source + cadence + reward), and Build time wall vs instant (#1 — still pending from before).

Logged as R29–R32 in DECISIONS.md. Pending #2 / #2a / #15a / #15b removed (resolved). New pending #2c (grid range tuning per body type) added.

---

## 2026-04-28 — Layout model + idle cadence locked (Q0 + Q1 + design-review followups)

After the design-review critique surfaced "is this Anno + Paragon, or something more abstract?", the user pivoted hard on layout. **Layout model = spatial grid placement.** Bodies have a placement grid; players hand-place buildings on tiles; adjacency bonuses drive layout decisions. Closest reference is Paragon Pioneers — research confirmed PP proves spatial-placement coexists with idle: PP players tinker rarely, layouts run for days, and the dev declined to add a sim-speed toggle on mobile-idle alignment grounds. Per-body warehouse stays (buildings on a body share stock); what changes is *placement* — buildings sit on a grid, not in an abstract list.

**Why this works with idle-centric direction:**
- PP proves spatial + idle coexist: place thoughtfully, run real-time, return.
- Spatial puzzle becomes the long-session attractor; short check-ins are alerts/throughput.
- Aligns with cutting sim speed: rhythm is "place once, watch for a week."

**Session cadence (Q1):** short check-ins are the default; long sessions are first-class supported (not a rare power-user mode). Ops hosts the short-check-in surface; Production hosts the long-session surface.

**Other locks from this round (logged as R22–R28 in DECISIONS.md):**
- **Sim Speed = removed.** PP2 dev declined to add one for the same reason — mobile-idle alignment.
- **AFK cap = retained** as anti-scaling-break safeguard (specific value pending #15a).
- **Quests = dailies + weeklies** layered on tier gates (cadence/reward shape pending #15c). Provides the mid-tier active-loop texture the design review flagged as missing.
- **Inventory = per-ship cargo + per-body warehouse for colonies** (already implicit; just made explicit).
- **Events = progression-paced**, not wall-time (5-min/day player gets fewer events; metric pending #15b).
- **Constrained building = in**, now reshaped under spatial-grid (R27 supersedes the older "typed slots" framing).

**What this changes downstream (deferred reconciliation):**
- `GAME_DESIGN.md` Pillars + Stage 1 architecture need a layout-model rewrite.
- `UI_VIEWS.md` Production destination shifts from "chain browser + drawer" to "grid workspace + drawer with placement."
- `UI_VIEWS.md` Body Detail Sheet's Buildings tab gets a grid view.
- `UX_FLOWS.md` Build Recipe gains a placement step.
- DECISIONS.md updated this turn (R22–R28; new pendings #2 / #2a / #2b / #15a / #15b / #15c).

Big-doc reconciliation (GAME_DESIGN / UI_VIEWS / UX_FLOWS) deferred until all decisions in this round are landed — otherwise four sets of rewrites for one set of decisions. DECISIONS + this notes file are kept current as decisions land; the formal docs get reconciled in one pass at the end.

**Still open (next questions in flight):** grid scale, adjacency shape, pause toggle, AFK cap value, events metric, quest cadence/reward, T7 endgame, FTUE first sale, multi-stop routes, storage dominance fix.

---

## 2026-04-28 — Mock-blocking decisions resolved (4 items)

User flagged that strictly speaking *no* P0 decisions block making UX prototype mocks — but four decisions, if made first, would prevent the mocks from being stale and needing rework when answers come later. All four are now locked:

- **Voice = terse-corporate.** Cascades into every alert string, AFK summary copy, tier-up flavor, build-complete notification, banner, status text. Ruleset updated in UI_VIEWS Global UI Rules. Existing alert-card examples re-written from shouty caps (`OXYGEN LOW`) to corporate-comms (`First Habitat — O2 at 18%, importing recommended`). Why: matches NASA-industrial mood (measured, professional), reads fast for short check-ins, avoids the "NPC dialogue gets old" trap that kills NPC-flavored voice in idle games where you see the same alerts hundreds of times.
- **Tier-up ceremony = plain modal at v1.** Cinematic deferred to Stage 2 polish. Why: tier-ups happen 7 times in a full prestige run — frequent enough that intrusive ceremonies grate. A plain modal can be polished later (animated backdrop, region zoom) without breaking anything; jumping straight to cinematic locks in 5+ seconds of unskippable per-tier delay.
- **Confirm-vs-commit rule = (irreversible OR ≥25% current credits).** Replaces the `confirm above $1,000` placeholder with a rule that scales with player wealth. Why: one rule scales naturally — when credits are $5k a $3k buy prompts; when credits are $200k the same buy commits silently. No magic number to retune. Mobile players don't get spammed with confirms on routine $800 building placements.
- **AFK summary delta units = $ headline + raw counts.** Hero readout is the satisfying $ delta with time away as context (`+$2,304 net · 4h 12m away`); body shows raw resource deltas (`+480 ore · +192 metals`). Why: $ headline gives the dopamine hit of return-from-AFK; raw deltas keep the player honest about storage state ("oh, ore stockpiled at cap — that's why sales were lower than expected"). Pure-credit hides storage problems; pure-raw misses the satisfaction beat.

P0 list is now 5 items (was 6). DECISIONS.md updated with R18–R21 in Resolved.

**What this unblocks:** UX prototype mocks can now be made with confidence that the voice, confirm patterns, AFK return shape, and tier-up shape won't flip out from under them. Specifically: the AFK Return mock has its hero readout format locked, the Tier-Up Modal mock can be drafted as a single screen rather than waiting on cinematic decisions, all alert-card mocks use the same voice, and confirm dialogs only appear in the right places.

---

## 2026-04-28 — Consolidated decisions inventory: DECISIONS.md

Open Questions had fragmented across four docs (GAME_DESIGN, UI_VIEWS, UX_FLOWS, this file). Created [DECISIONS.md](DECISIONS.md) as the single inventory: 41 Pending items prioritized into P0 (block T0 build) → P1 (block T1) → P2 (T3+/polish) → P3 (strategic/late-game), and 17 Resolved items with one-line resolutions and source links.

**P0 currently has 6 items:** build-time placement model, build footprint cap, FTUE first-sale resource, Earth Prefab Kit shape, confirm-vs-commit threshold, Sources & Sinks Popover scope. These are the actual blockers before a T0 prototype could begin without rework.

The per-doc Open Questions sections stay where they are — they're useful in-context — but DECISIONS.md is now the canonical rollup. When a decision is made in chat, the rule is: move from Pending to Resolved with a one-line resolution and a link to where it's now spec'd.

---

## 2026-04-28 — UI Buttons & Navigation pass (pass 2 of 2 on UI_VIEWS)

User requested an interaction-layer pass scoped specifically to: which buttons exist on each screen, what each does, and how a player navigates between menus. **Explicitly out of scope:** keyboard shortcuts, hover/press visual states, exact icons, validation rules, animation timing — those belong to a Stage 2 chrome-and-polish pass.

### What changed

For each of the 8 destinations, the existing terse `### Primary Actions` block (which was a verb list like "Resolve alert / Assign idle ship") was replaced with a `### Buttons & Navigation` section that enumerates:

- Each control by name with its location ("top-right of canvas", "left edge", "right side of row").
- What the control does on tap.
- For controls that open modals/sheets: the modal's controls listed nested.
- A "Navigation out of this screen" sub-list for every cross-screen jump, with the destination state pre-populated where relevant (e.g., `Build Here` → **Production** scoped to selected body).

Persistent Surfaces section also expanded with full Buttons & Navigation treatment for the Top Status Bar (settings cog, sim speed, resource popovers), Body Detail Sheet (action toolbar + tab strip), and Alerts System (per-alert-type primary action label and behavior).

### Why this format (verb + location + behavior + outbound link)

- **Designers can now sketch wireframes from this doc** without asking "where does this button live?" or "what happens when I tap it?"
- **Engineers can see the navigation graph** — every cross-screen jump is named with its source button, its destination, and what state should be pre-populated.
- **Ambiguity is now visible.** Where a control's behavior is undecided (e.g., "Cancel" on Active Research Queue refunds what?), the doc says so and links to the relevant Open Question. This is honest about what's still open.

### What this unblocks

- **Design wireframes / concept renders.** Stage 0 cohesive concepts can now show specific buttons in specific positions, not just generic panels.
- **Navigation graph implementation.** When the build starts, the routing layer has a concrete graph: 30+ cross-screen jumps are named and sourced.
- **Deep-link state spec.** Each alert primary action and each Body Sheet action now says what state the destination screen receives. Implementation has a checklist.

### What's still deferred (to Stage 2 widget pass)

- Hover / press / disabled / loading visual states.
- Exact icon set and labels (current labels are placeholders that read clearly; final UX copy is Stage 2).
- Form-field validation rules (numeric stepper limits, character limits, error text).
- Animation timing (sheet open speed, transition curves).
- Keyboard shortcuts beyond `spacebar = pause`.
- Empty-state CTAs at full fidelity (current ones are sketched).
- Toast/notification placement and dismiss timing.
- Tooltips and inline help patterns.
- Confirm-vs-commit threshold tuning (currently a placeholder rule of "confirm above $1000").

These are all real questions but not load-bearing for "align on the menu structure" — which is what the user asked for.

### Top of mind: ambiguities surfaced by the pass

Writing button-by-button forced specifying behaviors that were vague before. Now visible as Open Questions:

- Build Drawer category filters: 5 categories vs. broader "All / Mine / Refine / Other"?
- Multi-select entry on Fleet: long-press on mobile is fine, but what's the desktop equivalent? (Lean: shift-click or checkbox column toggle.)
- Active Research Queue `Cancel` behavior when research is time-gated vs. resource-gated. Tied to the Research-gating Open Question.
- Whether the Body Sheet `Pin` toggle persists across navigation back-stacks or just within the current screen.
- Whether the Tier-Up Modal dismisses to Map (current spec) or returns the player to where they were when they tapped Claim.
- Settings → Saves: cloud-sync UI shape (auto-only with status indicator vs. explicit sync button).

---

## 2026-04-28 — UI Design Intent pass (pre-widget pass)

User flagged that the UI sketch fidelity skipped over the goal of each UI — Purpose lines described what the screen contained, not what its job was for the player or what success/failure looks like. Without that anchor, a widget pass would add controls because they were feasible rather than because they served the screen's job.

**Action:** added a structured **Design Intent** block to each of the 8 destinations in UI_VIEWS.md. Format:

- **Job** — one or two sentences: what is this UI for, who is it for, when do they use it.
- **Primary use cases** — bullet list: what does the player come here to do.
- **Success signals** — bullets: what does it look like when this UI is working.
- **Anti-patterns** — bullets: how would we know this UI has lost its way.

This goes between the destination header and the existing Reached-from / Sections content. It's the anchor for a future widget pass: every button / control / state we add has to serve at least one Primary use case and avoid all Anti-patterns.

**Why these four elements** (and not other product-design templates):
- **Job + use cases** are the JTBD-style anchor — why does the screen exist, what does it solve.
- **Success signals** are testable feel-statements — usable as Stage 2 prototype acceptance criteria.
- **Anti-patterns** name failure modes preemptively, so we can spot them in the prototype rather than discovering them post-launch.
- Skipped: KPIs (premature; we don't have telemetry), personas (one player type at v1), competitive positioning (Anno-in-space already covers it).

Persistent Surfaces (status bar, body sheet, alerts system) deliberately don't get a Design Intent block — they aren't destinations, they're cross-cutting infrastructure that supports all destinations. Their "job" is to be invisible until needed, which doesn't fit the same template.

**Sequencing decision:** doing this *before* the widget pass means widgets get spec'd against goals, not in a vacuum. If we'd done widgets first, we'd be retrofitting goals to justify decisions already made.

---

## 2026-04-28 — Pivot: UX north star (UI_VIEWS expansion + new UX_FLOWS)

### Why we pivoted

User chose to stay in design rather than pivot to a T0 prototype, but redirected the focus: away from balance-tunable mechanics (recipe numbers, ship stats) and toward the **navigable UX north star** — a clear picture of every menu, what fills it, and how players move between menus. Goal is a target the future T0 build aims toward, not a complete game spec.

### What changed

- **UI_VIEWS.md fully rewritten.** Old version was thin (one paragraph per view). New version specs each destination at sketch fidelity: sections, content (populated with T0–T2 examples from our recipe + ship catalog), primary actions, states (empty/loading/normal/problem), mobile adaptation. Heavy depth on the 5 active T0–T2 destinations; light spec on Trade / Research / Milestones until later content drills justify them.
- **Navigation restructured: 9 destinations → 8.**
  - Survey is no longer its own destination — it's a **mode of the Map** (Default / Survey / Routes / Heat). Survey is fundamentally "look at a region of space and pick where to scan," which IS a map; making it a separate destination duplicated the map metaphor.
  - "Industry" renamed to **Production**. Clearer name, especially under the Anno-style framing where the player is a production-chain operator, not an industrialist abstracting goods.
- **Mobile bottom-nav locked (provisionally):** Map / Ops / Production / Fleet / More. Colonies under More by default; promote-at-T1 left as an open question. Reasoning: at T0 these four are constant-use; Colonies is locked. Once unlocked, alert-badging on the More tab should be enough to surface colony attention without reshuffling nav. If playtesting shows that's wrong, dynamic nav comes back on the table.
- **New file: UX_FLOWS.md.** Captures cross-cutting journeys that span multiple screens: FTUE, AFK Return, Alert Resolution, Tier-Up, Buy Ship, Build Recipe, Survey-and-Claim, Route Creation, Earth Prefab Kit, Prestige Incorporation (sketch), plus a Common Micro-Interactions appendix. Each flow is a step-by-step screen-by-screen narration, not pixel-spec.
- **Persistent Surfaces section in UI_VIEWS.md.** The Top Status Bar, Body Detail Sheet, and Alerts System now have their own specs — they cross-cut multiple destinations and need a single source.

### Why these structural choices

- **Survey-as-Map-mode over Survey-as-destination:** Survey is spatial. Spatial = map. Forcing a separate destination meant duplicating the orbital canvas with subtly different rules. Map modes (Default / Survey / Routes / Heat) generalize cleanly to other player needs without inflating the nav.
- **Production over Industry:** "Industry" implies macro-economy abstraction; "Production" implies hands-on chains. Anno players think in chains. Word choice matters for what mental model the menu evokes.
- **Body Detail Sheet as the universal selection result:** instead of every screen having its own per-object panel, selection of a body always opens the same sheet. Fleet's ship selection, Colonies' habitat selection, and Map's body selection share UI. Reduces patterns to learn and lets us iterate the sheet in one place.
- **Cross-cutting flows in their own doc:** screens describe *where things live*; flows describe *how players move*. Mixing them produces docs where you can't find either. Separating means each can be deeper.

### What got lighter spec on purpose

- Trade, Research, Milestones: sketch sections only. They exist in the nav, but content is thin until T3+ drills justify deepening them.
- Pixel-level styling decisions stay deferred to Stage 2 prototype.
- Specialist hulls (probe ships, builder ships) deferred — at T0–T2 surveys are handled by Probe Bay (a building), no specialist ships needed yet.

### Open questions captured (top of mind)

- **Mobile bottom-nav at T1:** promote Colonies into the bottom tab bar (displacing Fleet or Production), or keep under More with strong alert badging?
- **Build footprint:** finite slots per body (forces hard layout choices, Anno-like) vs. unlimited (Paragon-like)? Currently undecided.
- **Build time per recipe:** instant placement (Anno) vs. wall-time construction (Factorio)? Currently wall-time placeholder.
- **Ship delivery time:** instant (v1) vs. wall-time delivery? Currently instant.
- **Tier-up ceremony fidelity:** modal (default) vs. cinematic moment.
- **AFK summary voice:** terse-tactical vs. NPC-flavored. Tied to Notification Taxonomy.
- **Repeat-route UI shape:** segmented 3-button vs. number input.
- **Claim limit:** unlimited at v1 (default) vs. tier-gated.
- **Re-scan cost in Survey:** free time (default) vs. credits vs. consumable.
- **Prefab Kit quantity per tier:** 1-of-1 (default for first kit per tier) vs. unlimited at premium.
- **Notes per body:** v1 feature or deferred?
- **Heat map mode on Map:** justified before T3+ or defer?
- **Persistent bottom strip on desktop:** Map+Ops only, or all destinations?
- **Research gating model:** time-gated, resource-gated, or both?

These are now the inventory of decisions waiting for the next drill or playtest signal.

### What this unblocks

When we narrow to a T0 vertical slice, we know exactly which slice of the menus to build first:

- **Map** in Default mode + Survey mode (skip Routes overlay UI / skip Heat mode).
- **Ops** in its full daily-management form (FTUE depends on this).
- **Production** for one body at a time (no automation rules yet — those are T3+).
- **Fleet** in list view only (skip multi-select, skip maintenance).
- **Trade** for Earth buy/sell only (skip Prefab Kits — those unlock at T1 anyway, skip contracts).
- **Status Bar + Alerts + Body Sheet** as cross-cutting infrastructure.

That's a clear subset to build, with the rest of the menus understood enough that the architecture won't paint into a corner.

---

## 2026-04-28 — Correction: passenger cargo class removed

**User caught:** if pop auto-spawns when life support is met, there's nothing to put in a passenger hold — the passenger cargo class is a phantom design.

**Resolution:** dropped passenger from cargo classes at v1. Two classes only: **solid** and **fluid/gas**. Updated everywhere:
- Cargo class definitions (Recipe section, Resource & Flow Model).
- Content-target hull breakdown (was 4 solid / 4 fluid-gas / 2 passenger / 2 specialist → now 5 / 5 / 2 specialist).
- Ship Catalog opening notes.
- Mock 5 fleet example (Courier-1 → Mixer-1).
- UI_VIEWS Fleet view grouping.
- Combined-hull slot example (was 30 solid + 20 fluid + 10 passenger → now 30 solid + 20 fluid).

**Reserved for later:** if specialist/colonist transport becomes a mechanic (e.g., research crew, dignitaries, T4+ colonization fleets), passenger class can be re-added. Don't author a class until the cargo to put in it exists.

**Why this matters as a pattern:** designs accumulate "future-proofing" promises that look like content. Each phantom commitment is something playtesters or readers expect to find. Strip them when caught — keep the doc honest about what's actually load-bearing today.

---

## 2026-04-28 — Validation: T0–T2 recipe walkthrough

End-to-end trace of the recipe table just drafted. Looking for bootstrap loops, unreachable gates, weird balance, and FTUE alignment.

### Bugs found and fixed in-pass

1. **Habitat Module ingredient bootstrap.** Original recipe had `6 Construction Materials + 2 Habitat Glass`, but Habitat Glass is T2 and Habitat Modules are needed at T1 for colony settling. Fix landed: removed glass from the T1 Habitat Module recipe. Habitat Glass is now a *colony pop-tier need* only (Growing tier and above), not a habitat-build ingredient.
2. **Greenhouse consumed Hydroponic Yield (T2) at T1.** Caught and fixed earlier in the drill: T1 Greenhouse is now `2 Water Ice → 2 Food Pack`. T2 introduces a Hydroponics Bay (Water Ice → Hydroponic Yield) and an upgraded Hydroponic Greenhouse that uses it for higher yield.

### Bootstrap that needs explicit handling (not a bug, a design decision)

- **First Lunar Surface Mine before any local industry exists.** The chain is: Lunar Mine → Aluminum → Construction Materials → Habitat. But you can't run a Lunar Mine without first being on the Moon. Resolution: T1 unlock includes a **Habitat Module purchase from Earth** (one-time prefab kit) that lands the first habitat without local construction. After the first habitat exists, the player can build Lunar Mines and start the local chain. Same pattern probably applies later for the first Mars / Belt foothold; should be a generalized "Earth prefab kit" mechanic gated by tier unlocks. Add this to the Open Questions.

### Gate reachability checks

- **T0 → T1:** Sell 200 Refined Metal + 50 Hydrogen Fuel reserves. Both T0 buildings produce them. ✓
- **T1 → T2:** First habitat reaches Pop 50 + claim 2 NEA surveys. NEA surveys are a T0 capability (Probe Bay). Pop 50 needs Survival pop tier sustained, which needs Water + Oxygen + Food Pack — all T0/T1 producible. ✓
- **T2 → T3:** Local Oxygen production at lunar habitat at break-even (24h no Earth O2 imports) + Comfortable pop tier. Oxygen comes from T0 Electrolyzers placed on Moon. Comfortable needs Textiles drip; Textile Mill is T2. ✓

### Balance spot-checks (placeholder numbers, not tuned)

- 1 Greenhouse at T1: 2 Food Pack / 60s = 120 Food Pack / hour. Per-pop draw: 5 Food Pack / hour. **One greenhouse feeds 24 pop.** Pop 50 needs 2-3 greenhouses for food. Reasonable.
- 1 Greenhouse consumes 2 Water Ice / min = 120 Water Ice / hour. Per-pop water draw: 7.5 / hour. So one greenhouse uses water at ~16× one pop's drink rate. Water demand is dominated by greenhouses, not life support. Implication: ice mining capacity is the early bottleneck, not greenhouses themselves.
- Habitat Assembler 8 min/cycle producing 1 Habitat Module — slow on purpose. Pop growth via Habitat Modules will feel like a deliberate investment, not auto-scaling.
- Distillery: 180s / cycle, 1 Spirits per cycle, drip rate 1 Spirits / pop / 90 min for Affluent tier. 1 Distillery serves 30 pop at Affluent tier. Reasonable.

### FTUE alignment with T0 recipes

The 15-minute FTUE script assumes:
- Probe Bay scan (tutorial-accelerated) ✓
- Small Mine on NEA ✓
- Hauler-1 carrying Iron Ore (or Refined Metal?) to Earth — *the FTUE doesn't say which.* Raw Iron Ore sells for 1, Refined Metal for 12. Selling raw is the simpler first feedback loop; refining adds a step.
  - **Decision pending:** does the FTUE sell raw ore or refined metal at t=6:00? Selling raw is simpler tutorial; selling refined teaches the chain. Lean toward refined to introduce the chain pattern early. Add to Open Questions.

### Things to validate later in playtest, not now

- Whether Carbon Mesh's role (input to Textiles + Furnishings) makes Carbonaceous Ore bottleneck the entire T2 comfort tier. May need a second source.
- Whether Aluminum is over-demanded (used in Construction Materials, Glass Furnace, Furnishings Workshop). May need volume scaling on Lunar Surface Mines.
- Whether the 1h pop-tier settle-in window is too long for Settled (needed early), too short for Affluent (needed late).

### Net assessment

Recipe table is structurally sound after the two fixes. No remaining bootstrap loops. Tier gates are concrete and reachable. Balance is in the right order of magnitude. Ready to move to ship catalog or building specs as the next drill.

---

## 2026-04-28 — Drill: Resource + recipe structural decisions

### Decisions locked (in-conversation, before the table is drafted)

- **Drill target:** resource + recipe master table is the next thing to spec. Chosen because everything downstream of the tier ladder (industry content, colony needs, ship cargo, concrete tier gates) hand-waves until this exists.
- **Scope of this pass: T0–T2 only.** ~15 resources, ~17 recipes. Enough to support Stage 3-4 build. T3+ stays at named-tier-only placeholders. Avoids over-committing to numbers we'll learn from playtesting earlier tiers.
- **Recipe shape: per-cycle batches (Anno-style).** Each building has a cycle time; one cycle consumes an input batch, produces an output batch. Matches the placeholder durations already in the doc (mine cycle 30s, smelt 45s). UI displays cycle time + output/cycle, with derived rate per minute.
- **Storage model: per-body warehouse.** Each celestial body has one logical warehouse shared by all buildings on it. Routes are endpoint-clean (warehouse → ship → warehouse). Reinforces the no-belt-routing non-goal — buildings don't have intra-body logistics.

### Why these structural choices

- **Per-cycle over continuous flow:** flow rates feel realistic but are a nightmare to balance against discrete ship loads and tier-gate quantities. Cycles give us "this batch fills this hauler in 4 cycles" math the player can do in their head.
- **Per-body warehouse over per-building stockpiles:** per-building buffers fight the no-belt-routing non-goal. We want layout-as-decision but at the *which buildings exist on this body* level, not the *how do they connect* level. Anno solves this with road tiles; we solve it by abstracting intra-body logistics to zero distance.
- **T0–T2 scope:** the next vertical slice (Stage 3) is T0 only, and Stage 4's first three slices land on T1–T2. Any work on T3+ recipes is speculative until we see how T0–T2 plays. Better to author shallow then deepen.

### Sub-drill answers (just locked)

- **Colony goods: unpacked Anno-style.** Comfort Goods splits into multiple distinct items (e.g., Textiles, Furnishings, Spirits). Each colony tier introduces meaningfully new production rather than scaling old recipes.
- **Fuel: one resource at v1.** Hydrogen Fuel covers all propulsion through T2. Multi-fuel split deferred to T4+ when long-range drives appear.
- **Cargo class: combined hulls AND specialized hulls coexist.** Combined hulls use **fixed mixed slots** — explicit per-class allocation in the hull spec, e.g., *Combined-1: 30 solid + 20 fluid + 10 passenger*. Player can fill any slot but cannot repurpose between classes. Specialized hulls are single-class at full capacity. Cargo-class enforcement remains strict at the cargo level: a fluid is always a fluid. Why fixed slots over flat penalties: predictable to display, easier to balance, and the slot allocation itself becomes part of hull identity (a "Cislunar Combined" might be 40-solid / 5-fluid for ore-runs-with-a-bit-of-fuel-return, while a "Habitat Tender" is 10-solid / 30-fluid / 10-passenger for colony resupply).
- **First habitat: lunar orbit station.** Closes the open question. Cleaner than surface (no ground/orbit logistics distinction needed yet) and stronger than LEO (justifies the *Lunar Foothold* tier name).

### Implications of the unpacked-goods + per-cycle + per-body choices

- Recipe count for T0–T2 will land closer to ~20 than ~17. Unpacked goods adds maybe 3–5 recipes vs. lumped.
- Colony pop tier ≠ game tier. Within T1 (Lunar Foothold) the colony will have its own internal pop tiers (e.g., basic survival → growth tier 2 → growth tier 3) gated by goods. The game tier ladder is what unlocks regions and ship classes; colony tiers are local growth states.
- Per-body warehouse means a ship route is "Body A warehouse → Body B warehouse." Buildings on a body share stock by simulation rule, not by player-placed pipes. Industry layout is "what to build here," not "how to connect."

---

## 2026-04-28 — Reframe: Anno-in-space, not idle-with-space-skin

### What changed in the docs

- `GAME_DESIGN.md` reframed: working summary now says "incremental production-chain builder," reference games called out as Anno 1800 + Paragon Pioneers, "tier transitions" promoted to signature system (was "orbital logistics").
- "Active survey" demoted to setup-only across both docs. Survey is region-pick + focus + idle scan.
- Tier ladder added: 8 named tiers (T0 Wildcatter → T7 System Corporation) with gate conditions.
- Prestige loop added: *Charter Shares* currency, sandbox mode opt-out, modest multipliers.
- Scope locked: full solar system.
- Session cadence locked: hybrid short + long check-ins.
- Platforms locked: true dual-target — same game, same save, full campaigns possible exclusively on either form factor.
- Placeholder numbers sheet added (durations, prices, storage caps).
- Content targets added (~35 resources, ~50 recipes, 12 ship hulls, ~25 buildings, ~40 research nodes, ~24 events).
- First 15 minutes (FTUE) script added.
- AFK return spec added.
- Failure modes table added — authored, recoverable, never silent.
- Notification taxonomy added (≤3 push/day default budget).
- Performance budget added (mid-range Android 30 FPS minimum, Three.js fallback to Canvas 2D).
- Non-goals section added.
- `UI_VIEWS.md` reconciled to single nav language across form factors. Right-rail inspector pattern killed; bottom sheet is the universal detail surface. Map gestures spec'd. Mobile bottom-nav contents proposed (Map / Ops / Fleet / Colonies / More).

### Why these changes (the reasoning that drove them)

- **The reference games are load-bearing.** "Anno or Paragon Pioneers in space" tells us this is a tier-gated production-chain builder, not an idle game with a space skin. That answer shifted what the signature mechanic *is* (tier transitions, not active survey), which cascaded into demoting survey to setup-only and the entire tier-ladder being the spine of progression.
- **True dual-target collapses two UIs into one.** A player should be able to start on mobile, finish on desktop, or never leave one of them. That kills the desktop right-inspector pattern (because there's no mobile equivalent that isn't a bottom sheet) and forces a single nav language.
- **Hybrid sessions need both ends to work.** Short check-ins demand a great Ops view + push notifications + AFK return modal. Long check-ins demand chain-design tools. The doc now scopes both.
- **Numbers exist so balancing has a target.** Without at least placeholder values, "AFK-friendly but not punishing" is unfalsifiable. Numbers will all be retuned in Stage 3+ — they're anchors, not contracts.
- **Content targets prevent scope ambiguity.** ~50 recipes is a *target*, not a quota. If a tier feels thin, add one; if it feels noisy, cut one. But "we have 12 recipes" should feel obviously wrong against the target.
- **Failure modes need to be authored.** Idle/incremental games that punish silently feel hostile. Every failure has a recovery path; the floor is a one-time-per-run Earth bailout.

### What's still open

- **Carryover ratios for prestige.** Need playtesting to land. Current placeholder: % research, % recipe knowledge, small starting kit.
- **Whether prestige reshuffles the system layout.** Tradeoff: novelty vs. mastery transfer.
- **Survey UX detail.** Region picker is the right shape, but the *fidelity* — how much do data layers feel like discovery vs. a checklist — needs Stage 2 prototyping.
- **Mobile bottom-nav contents.** Current candidate: Map / Ops / Fleet / Colonies / More. Industry-on-mobile under "More" is the riskiest call — Industry is heavy. May need its own slot, displacing Colonies or Fleet.
- **Notification voice.** Terse-tactical ("OXYGEN LOW: First Habitat") vs. NPC-flavored ("Comms from First Habitat: we're getting low on O2").
- **Sandbox mode entry.** Available from start (lowers commitment) vs. unlocked after first prestige (rewards completion). Leaning toward available-from-start with a "scoreboard mode" toggle for prestige earners.

### Things considered and rejected

- **EVE-lite framing.** Earlier doc drift suggested EVE-lite + idle. Rejected: market depth and player-driven economy are explicit non-goals.
- **Active-scan minigame.** Rejected because it tugs against AFK-friendliness and doesn't fit the Anno framing where the active loop is layout, not micro-interaction.
- **Separate desktop and mobile UIs.** Rejected because of true-dual-target. Two UIs means two saves of design effort, two QA passes, and a worse experience for the player who switches devices mid-run.
- **Right-rail inspector as the desktop detail surface.** Rejected for the same reason — bottom sheet is the only detail surface that translates cleanly to mobile.

### Things to verify in Stage 2 prototype

- Bottom-sheet-on-desktop is not actively annoying. (My biggest worry. May need to allow pinning / docking.)
- Industry-under-More on mobile is reachable enough.
- Map gesture disambiguation (tap vs. pan threshold) doesn't frustrate.
- 30 FPS map on a mid-range Android with a moderately developed system is achievable in Canvas 2D.

### Decisions log (terse)

- 2026-04-28: Reference games = Anno 1800 + Paragon Pioneers.
- 2026-04-28: Scope = full solar system, 8 tiers.
- 2026-04-28: Replay = prestige with sandbox opt-out.
- 2026-04-28: Sessions = hybrid short + long.
- 2026-04-28: Platforms = true dual-target, same save.
- 2026-04-28: Survey = setup-only.
- 2026-04-28: Tier ladder = named + gated (v1 commit).
- 2026-04-28: Doc strategy = edit in place + reconcile, with this notes file for session context.

---

## How to use this file

- **Newest entries on top.** Append a new dated section when a design conversation produces decisions or reframings.
- **Capture the why, not just the what.** The docs say what; this file says why.
- **Note rejected ideas.** Future-you will reconsider the same options. Save the trip.
- **Mark verification items.** When a Stage 2/3 prototype answers a worry, strike it through and note the result.
