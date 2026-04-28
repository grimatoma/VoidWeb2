# Design Notes (Informal)

This is an informal log of design decisions and the reasoning behind them. It exists so that if a session crashes or context is lost, the *why* behind the docs survives. Less formal than `GAME_DESIGN.md` or `UI_VIEWS.md`. Append-only — newest at the top.

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
