# Void Yield 2 UI Views

The navigable UX north star. Each destination is spec'd at sketch fidelity — Design Intent (job, use cases, success signals, anti-patterns), sections, content, **buttons & navigation** (every control with what it does and where it goes), states, and mobile adaptation. Visual styling and pixel-level chrome (hover states, exact icons, keyboard shortcuts beyond pause, animation timing) is Stage 2's job.

See `GAME_DESIGN.md` for game scope, tier ladder, recipes, and ship catalog. See `UX_FLOWS.md` for the cross-cutting journeys that span multiple screens (FTUE, AFK return, tier-up, etc.). See `DESIGN_NOTES.md` for rationale and rejected alternatives.

## Contents

1. [Global UI Rules](#global-ui-rules)
2. [Navigation Architecture](#navigation-architecture)
3. [Destination 1 — Map](#destination-1--map) (anchor)
4. [Destination 2 — Ops](#destination-2--ops) (daily check-in)
5. [Destination 3 — Production](#destination-3--production) (industry, formerly Industry)
6. [Destination 4 — Fleet](#destination-4--fleet)
7. [Destination 5 — Colonies](#destination-5--colonies)
8. [Destination 6 — Trade](#destination-6--trade) (light spec)
9. [Destination 7 — Research](#destination-7--research) (light spec)
10. [Destination 8 — Milestones](#destination-8--milestones) (light spec)
11. [Persistent Surfaces](#persistent-surfaces) (status bar, body sheet, alerts)
12. [Style Direction](#style-direction)
13. [Open Questions](#open-questions)

---

## Global UI Rules

- The game is menu-heavy and management-first; the orbital map is the emotional centerpiece.
- **One interaction language across both form factors.** Same selection model, same detail surface, same nav. Only layout density adapts.
- Every view exposes: current state, bottleneck, next useful action, risk/warning when relevant.
- Primary actions are explicit buttons, icon buttons, toggles, sliders, segmented controls, or menus — never hidden gestures.
- All screens support AFK/incremental play by showing timers, rates, storage limits, stalled reasons.
- Economy UI uses fixed prices and predictable demand — never speculative graphs.
- **Per-body warehouse model** drives screen design: every body has one shared stockpile; buildings on a body all draw from it; routes go warehouse → ship → warehouse.
- **Confirm-vs-commit rule.** A confirmation dialog appears only when an action is **(irreversible) OR (single-action spend ≥ 25% of current credits) OR (single action affecting >100 units of a finished resource)**. Otherwise, single-tap commit. The third clause catches catastrophic high-wealth misclicks — selling 100 Furnishings prompts even when the player is rich. Irreversible actions: demolish building, accept prestige, abandon a stranded ship, sell-all-of-resource. The 25% rule scales with player wealth — a $3k Hauler-1 prompts when credits are $5k; the same purchase commits silently when credits are $200k.
- **No sub-minute urgency.** No alert/event has a time-pressure window tighter than ~5 minutes real time. Reading an alert at human pace must never change the outcome. There is no Pause control; the design must be readable at human speed (per `GAME_DESIGN.md` Failure Modes corollary).
- **No sim speed control.** Real-time gates pacing. Players cannot fast-forward production, transit, scans, or settle-in. AFK return is the catch-up surface.
- **Voice.** All system-facing text — alerts, AFK summaries, tier-up flavor, banners, build-complete notifications — uses **terse-corporate** voice. Sentence-case, numbers leading, verbs minimal, no NPC characters speaking. Examples: `First Habitat — O2 at 18%, importing recommended` / `T1 ready: Lunar Foothold available` / `Hauler-1 idle at Earth dock`.

---

## Navigation Architecture

Eight destinations. Survey is a **mode of the Map**, not its own destination. Production replaces the old "Industry" name.

| # | Destination | Purpose | T0 use | T1+ use |
|---|-------------|---------|--------|---------|
| 1 | Map | Spatial overview, route planning, body detail entry | Heavy | Heavy |
| 2 | Ops | Alerts, AFK return, daily management hub | Heavy | Heavy |
| 3 | Production | Building chains, recipes, throughput | Heavy | Heavy |
| 4 | Fleet | Ship list, hangar, batch assignment | Medium | Heavy |
| 5 | Colonies | Habitat detail, life support, pop tier needs | None (locked) | Heavy |
| 6 | Trade | Earth buy/sell, Earth Prefab Kits, contracts | Heavy | Medium |
| 7 | Research | Tech tree across 4 branches | Light | Medium |
| 8 | Milestones | Tier ladder progress, prestige preview | Light | Medium |

### Desktop Layout

- **Top status bar** (persistent): credits, key resources, People Capacity, alert count, game time, settings.
- **Left rail** (persistent): all 8 destinations as labeled icons.
- **Center workspace**: the active destination's screen.
- **Bottom strip** (persistent on Map and Ops; collapsible elsewhere): active fleet activity, recent log entries.
- **Detail surface — bottom sheet**: appears when a body, ship, or route is selected. Drag to peek (~25%) / half (~55%) / full (~90%). Can be pinned open on desktop.

### Mobile Layout

- **Top sticky status bar** (compact): credits, fuel, alert count.
- **Bottom tab bar — 5 slots, reshuffles at T1.**
  - **At T0:** **Map / Ops / Production / Fleet / More**. Production is in the bar — early-game is a build-heavy active phase.
  - **At T1+:** **Map / Ops / Colonies / Fleet / More**. Colonies takes Production's slot once Lunar Foothold unlocks. Daily life-support emergencies are higher-frequency than chain optimization; the bar serves the daily/short-check-in axis.
- **"More" sheet contents.** At T0 = Colonies (locked with hint), Trade, Research, Milestones, Settings. At T1+ = Production, Trade, Research, Milestones, Settings.
- Detail surface: same bottom sheet (peek/half/full drag).
- The reshuffle is a one-shot transition on first reaching T1; the new layout persists. Visible nav-change tutorial nudge fires once at T1 unlock ("Colonies is now your daily check-in").

### Detail Surface vs. Full-Screen Rule

A bottom sheet is the universal detail surface: select-an-object surfaces detail in the sheet on both form factors.

Full screens (push, not sheet) are reserved for **editor experiences** where the screen IS the workspace:
- Production chain editor (Production destination)
- Survey region picker (Map's Survey mode)
- Research tree (Research destination)
- Trade order book (Trade destination)
- Tier ladder visual (Milestones destination)

Heuristic: *if the destination is the editor, push a screen; if it's a detail of a selection, push a sheet.*

---

## Destination 1 — Map

### Design Intent

**Job:** Be the player's first answer to *"what's going on right now?"* — the canvas that holds every spatial decision, where every body-level action begins.

**Primary use cases:**
- Glance the network at a high level (where ships are, who's idle, which routes are running good windows).
- Select any body or ship as the entry point to deeper action.
- Plan and dispatch routes.
- Survey new regions and inspect candidate asteroids.

**Success signals:**
- A returning player locates the body they care about in <3 seconds.
- The map *feels alive* — ships move, route arcs pulse on good windows — without becoming visually noisy.
- Tap-to-select works reliably; selection state survives zoom and mode switches.

**Anti-patterns:**
- Becomes wallpaper the player avoids in favor of menus.
- Route arcs unreadable when many routes exist.
- Survey/Routes modes overlap so much that mode-switching feels redundant.

**Reached from:** Default landing screen on app open (after AFK Return modal if applicable). Always one tap away via left rail / bottom nav.

### Sections

1. **Map Mode Selector** (top-left, segmented control): `Default | Survey | Routes`.
2. **Orbital Canvas** (center, dominant): Earth, Moon, surveyed bodies, ships, route arcs.
3. **Body Detail Sheet** (bottom, dismissible): appears when a body or ship is tapped/selected.
4. **Mini Alert Sidebar** (left edge, collapsible on desktop; peek-sheet on mobile): top 3 alerts, tap to jump.
5. **Active Fleet Strip** (below map on desktop; second peek-sheet on mobile): live status of ships in transit.

### Content (T0–T2 examples)

**Default mode:**
- Earth (always visible, anchor)
- Moon (visible from start; route arc to Earth shown)
- Lunar Habitat (after T1 Prefab Kit lands; shown as a docked habitat icon)
- 1–6 NEA claims (named: NEA-04, NEA-12, etc.; each shows a tiny ore/ice/rare-trace indicator)
- Ships in transit shown as small triangles along route arcs
- Route arcs colored by current window: green (good), white (neutral), amber (poor)

**Survey mode:**
- Search regions overlaid on the canvas (Earth-NEA region, Mars approach corridor, etc.)
- Surveyed bodies marked with confidence percentages
- Probe Bay queue indicator (top of map)
- Tap unsurveyed region → opens Survey region picker (full screen)

**Routes mode:**
- Only route arcs and ships visible; bodies dimmed
- Each route arc shows: ship icon, ETA, fuel cost multiplier
- Tap route → route detail sheet (cargo, repeat, automation rules)

### Body Detail Sheet (the universal selection result)

When the player selects any body, the sheet shows:

**Header**
- Body name, type (Earth / Moon / NEA / Mars / Belt-Asteroid)
- Distance/window indicator vs. selected origin
- Action toolbar: `Build Here · Send Ship · Plan Route · Survey · Pin`

**Tabs (segmented, scrollable)** — 4 tabs total
- **Overview** — surveyed resources, body grid size, current pop (if colony), warehouse summary
- **Buildings** — grid view of buildings on this body with rates, stalled reasons, and adjacency bonus indicators (`Smelter · 4 metal/min · +15% from Mine adjacency · OK` / `Smelter · idle · output storage full`)
- **Storage** — full warehouse contents with caps, broken down by storage building (Silo/Tank/Cryo)
- **Activity** — ships currently docked here + active routes touching this body, merged ("what's moving in/out")

### Buttons & Navigation

**Map Mode Selector** (segmented control, top-left of canvas):
- `Default` — bodies + active routes (default view).
- `Survey` — survey regions become tappable overlays.
- `Routes` — bodies dim; route arcs become tappable.

**Mini Alert Sidebar** (left edge):
- Collapse/expand chevron toggle.
- Per alert card: tap card → opens the relevant Body Detail Sheet (or Production for chain stalls). Severity icon is informational only.

**Active Fleet Strip** (below canvas on desktop / peek-sheet on mobile):
- Per ship row: tap → opens Ship Detail Sheet.
- `Show all` link → navigates to **Fleet** destination.

**Body Detail Sheet** (opens on body tap — full spec under Persistent Surfaces).

**Route Detail Sheet** (opens in Routes mode on route tap):
- `Pause Route` / `Resume Route` toggle button.
- `Edit Route` button → opens Route Creation flow in edit mode.
- `Recall Ship` button → calls the ship back to its origin.
- Drag-down or `Close` (X) dismisses.

**Survey Region Picker** (full screen, opens from Survey-mode region tap):
- Region tiles tappable to focus.
- `Probe Focus` segmented control: `Composition` / `Orbit` / `Hazard`.
- Estimated scan time readout (informational).
- `Begin Scan` (primary CTA, bottom).
- `Cancel` / back arrow → returns to Map in Survey mode.

**Navigation out of Map:**
- Body Sheet `Build Here` → **Production** (scoped to selected body).
- Body Sheet `Send Ship` → Route Creation flow (selected body = origin).
- Body Sheet `Plan Route` → Route Creation flow (selected body = destination).
- Body Sheet `Survey` → Survey Region Picker.
- Body Sheet body-name link in storage/buildings → stays on Map but switches selection.
- Active Fleet `Show all` → **Fleet**.
- Alert card tap → varies by alert type (Body Sheet here on Map / **Colonies** for life support / **Production** for chain stalls).

### States

- **Empty (T0 cold open):** Earth + Moon + 1 staked NEA visible. No ships in transit. Tutorial nudge points at the NEA.
- **Loading (post-AFK):** brief spinner over canvas while catch-up resolves.
- **Normal:** typical operations view.
- **Problem:** bodies with critical alerts pulse red; alert sidebar shows count.
- **Disconnected:** if account/cloud sync fails, banner at top — game continues offline.

### Mobile Adaptation

- Top status bar compresses to 3 fields (credits, fuel, alerts). Tap expands to full status drawer.
- Mode selector is a segmented control above the canvas.
- Alert sidebar becomes a left-edge peek sheet — drag right to expand.
- Active fleet strip becomes a bottom-edge peek sheet (between map and bottom tab bar).
- Body sheet drag handles are larger (touch targets ≥44px).
- Pinch zoom and pan; tap-and-hold-<120ms = select; longer hold = context menu.

---

## Destination 2 — Ops

### Design Intent

**Job:** Be the 90-second-check-in screen. A hurried player should be able to keep their operation healthy from this view alone, on either form factor.

**Primary use cases:**
- Skim and resolve critical alerts.
- Read the AFK Return summary on first load after time away.
- Assign idle ships to obvious routes in one tap.
- Trigger emergency imports (oxygen, water, fuel) without leaving Ops.

**Success signals:**
- A player who only ever opens Ops can survive — they may not optimize, but they don't lose progress.
- Top issue is always actionable from here directly, with no required jump to another screen.
- Alerts clear immediately and reliably the moment they're resolved.

**Anti-patterns:**
- Becomes a list-of-everything noise dump.
- Primary actions require drilling to a different screen to actually execute.
- Alerts persist visually after being addressed, training learned helplessness.

**Reached from:** Left rail / bottom nav. After AFK Return modal dismisses, if there are unresolved alerts the modal can deep-link here.

### Sections

1. **Critical Alerts** (top, hero) — at most 3 cards, each with: alert type, body affected, severity icon, primary action button, "Jump to source" link.
2. **AFK Return Summary** (visible only if relevant — typically right after returning) — collapsible card with what happened, what stopped, net resource delta.
3. **Idle Ships** — ships currently with no assignment.
4. **Production Hot List** — 3–5 buildings with the largest stalls or most output.
5. **Resource Bottlenecks** — resources at >85% storage cap or <15% reserve (whichever signals).
6. **Active Routes** — short summary, tap to expand.
7. **Top Action Button** — sticky at bottom: "Resolve top issue."

### Content (T0–T2 examples)

**Critical Alerts:**
- `First Habitat · O2 at 18% · 1.7h reserve · [Import 50 from Earth] [Build Electrolyzer]`
- `Hauler-1 idle at Earth dock · [Auto-assign to NEA-04 → Earth]`
- `NEA-04 storage at cap · Refined Metal full · [Add Hauler] [Sell direct] [Expand storage]`

**AFK Return Summary** (after 4h away):
- Ore mined: +480
- Metals refined: +192
- Sold to Earth: 4 deliveries, +$2,304
- Stalled at: NEA-04 storage full (1h 42m of 4h)
- Top fix: `[Add second Hauler]`

**Idle Ships:** `Hauler-2 · Earth · idle 12m · [Auto-assign] [Manual assign]`

**Production Hot List:**
- `Smelter (NEA-04) · 4.0 metal/min · ok`
- `Lunar Mine (Moon) · idle · no power · [Investigate]`
- `Electrolyzer (Moon) · 1.5 fuel/min · input low`

**Bottlenecks:**
- `Refined Metal (NEA-04) · 118/120 · 98% — sell or expand`
- `Water Ice (Moon) · 8/200 · 4% — risk to life support in ~22m`

**Routes summary:** `3 active · 0 paused · Avg fuel 1.05× · ETA next: 8m 20s`

### Buttons & Navigation

**Critical Alerts** (top hero section, max 3 cards visible):
- Per alert card:
  - Severity icon (informational, not interactive).
  - Alert title and body.
  - **Primary action button** (label varies by alert type — `Import 50 Oxygen` / `Auto-assign to NEA-04` / `Add Hauler` / etc.). Tapping resolves the alert in-place when possible, or deep-links with state pre-filled.
  - `Jump to source` chevron link (right side) — same action as primary if no in-place fix exists.
  - Whole card is also tappable (acts as `Jump to source`).
- `View all (N)` expandable link below the cards if more alerts exist.

**AFK Return Summary card** (visible after returning from ≥60s away):
- Collapsed: header tappable to expand.
- Expanded: detail rows + sticky `Resolve top issue` button (deep-links to worst stall).
- `Dismiss` (X icon top-right) — closes the card for this session; remains accessible via Alert Log.

**Idle Ships section:**
- Per ship row:
  - Ship name + status icon (informational).
  - `Auto-assign` button — system picks highest-value idle route and dispatches.
  - `Manual assign` link → opens Route Creation flow with ship pre-bound.

**Production Hot List section:**
- Per building row: tap → navigates to **Production** with the building's body selected and chain auto-scrolled to the building.

**Resource Bottlenecks section:**
- Per resource row: tap → navigates to **Production** with body selected and resource highlighted in chain.

**Active Routes summary:**
- 1-line summary readout (informational).
- `View all` link → navigates to **Map** in Routes mode.

**Sticky bottom CTA** (above bottom nav on mobile, fixed on desktop):
- `Resolve top issue` button — deep-links to the worst stall.
- Empty state: `All systems nominal — Start new objective?` (links to **Milestones**).

**Navigation out of Ops:**
- Alert primary button → in-place resolution OR deep-link (Trade for imports, Production for builds, Fleet for ships, Colonies for life support).
- Production Hot List / Bottleneck row → **Production** (body and resource pre-selected).
- Idle ship `Manual assign` → Route Creation flow.
- Active Routes `View all` → **Map** (Routes mode).
- Sticky CTA → varies by current top issue.

### States

- **No alerts, all healthy:** "All systems nominal" hero, links to plan-something prompts (claim a new NEA, queue research).
- **Many alerts (>3):** show top 3 + "View all (N)" expandable.
- **Post-AFK:** Return summary at top, alerts below.
- **Tier-up pending:** banner above alerts: "T1 ready — Lunar Foothold can be claimed [Open Milestones]."

### Mobile Adaptation

- This screen is **mobile-first** in feel — vertical card stack.
- Cards full-width, tappable as units.
- Sticky "Resolve top issue" button stays above bottom nav.
- AFK Return summary takes full-screen modal on first open after long absence (see `UX_FLOWS.md`).

---

## Destination 3 — Production

### Design Intent

**Job:** Be the chain-design and build-placement workspace — where players go when they're *optimizing*, not reacting. The "I have time to plan" home.

**Primary use cases:**
- See an entire body's chain end-to-end at a glance.
- Identify and diagnose chain stalls — which input is starving which building.
- Place new buildings via the Build Drawer.
- Configure automation rules (T3+).
- Allocate People Capacity (T1+, when capacity becomes finite).

**Success signals:**
- A stalled chain is visible without inspection — the chain view tells the player which edge is broken.
- The Build Drawer feels like browsing a recipe book, not consulting a tech tree.
- Adding a building is a 3-tap operation in the typical case.

**Anti-patterns:**
- Requires the player to mentally simulate flow to spot bottlenecks.
- Doesn't scale past ~20 buildings on a body without becoming unreadable.
- Build Drawer hides recipes behind unclear or unexplained gates.

**Reached from:** Left rail / bottom nav. Also deep-link from Body Detail Sheet ("Build Here" jumps to Production scoped to that body) and from Ops alerts ("Build to fix").

### Sections

1. **Body Selector** (top) — segmented or dropdown of bodies the player has buildings on (or could build on). Each body's Production view is independent.
2. **Grid Workspace** (main area, dominant) — the body's placement grid (size revealed at survey, e.g., 4×4 / 5×5 / 7×7). Buildings sit on tiles; empty tiles are tappable to place. Adjacency bonuses are visualized on hover/tap (highlighted neighbors with bonus value). This is the *primary* work surface — Production is a workspace, not a browser.
3. **Chain View** (collapsible side panel or toggle) — secondary diagnostic view: inputs → buildings → outputs as a graph. Useful for tracing stalls; not the primary surface.
4. **Building List** (right/below) — tabular list of buildings on this body with rates, status, and inline controls. Synced with grid selection (tap a grid tile → row highlights).
5. **Storage Panel** (right or as a tab) — current warehouse stock with caps, broken down by storage building (Silo / Tank / Cryo).
6. **Build Drawer** (slide-up sheet) — opens when the player taps an empty grid tile or `+ Add Building`. Lists available buildings for this body type, gated by tier.
7. **Automation Rules** (T3+ only) — rules per building or per resource (maintain-stock, surplus-export, prefer-good-windows).

### Content (T0–T2 examples)

**Chain View** (NEA-04 selected, T0):
```
[Small Mine ×2]  →  Iron Ore (84/300)  →  [Smelter ×1]  →  Refined Metal (38/120)
[Ice Mine ×1]    →  Water Ice (12/100)
```

Each node:
- Building name, count
- Resource shows current/cap
- Edges colored: green (flowing), amber (slow), red (stalled)

**Building List** (NEA-04, T0):
| Building | Rate | Status | Controls |
|----------|------|--------|----------|
| Small Mine #1 | 20 ore/min | OK | `Pause · Demolish` |
| Small Mine #2 | 20 ore/min | OK | `Pause · Demolish` |
| Smelter #1 | 8 metal/min | OK | `Pause · Demolish` |

**Storage Panel** (NEA-04, T0):
- Iron Ore: 84/300 (28%)
- Refined Metal: 38/120 (32%)
- Hydrogen Fuel: — (no Electrolyzer here)

**Build Drawer** (NEA-04, T0):
- Available now: Small Mine ($800, 1 slot), Smelter ($1,500, 1 slot, +15% next to Mine), Ice Mine ($900, 1 slot), Electrolyzer ($1,200, 1 slot, +10% next to Ice Mine), Silo ($600, +300 solid cap), Tank ($500, +180 fluid cap)
- Locked behind tier: Lunar Surface Mine (T1), NEA Mine variants (T2), Glass Furnace (T2), Cryo Tank (T2)…
- Each card: cost, grid footprint, prerequisites, output preview, adjacency hint. **Building is instant** on commit — no wall-time.

### Buttons & Navigation

**Body Selector** (top of screen):
- Desktop: dropdown with all bodies the player has buildings on or could build on.
- Mobile: horizontal scrolling chip rail.
- Each entry tappable → switches Production scope (stays on Production).

**`+ Add Building` CTA** (top-right of Building List, or floating on mobile):
- Opens Build Drawer (slide-up sheet).

**Grid Workspace** (main work surface):
- Tap an empty tile → opens Build Drawer scoped to that tile.
- Tap a placed building → opens reasoning panel: rate breakdown, current adjacency bonuses, stall reason (if any). Same panel hosts `Pause` / `Demolish` controls.
- Hover/long-press a building → highlights adjacent tiles and shows the bonus they grant ("+15% from Smelter to your right").
- Drag a building (T2+) → relocate it to another empty tile in the same body. Costs a small fee; preserves cumulative output stats.

**Chain View** (collapsible side panel):
- Tap a building node → opens the same reasoning panel as the grid.
- Tap a resource node → highlights all buildings consuming/producing it on the grid.
- Tap an edge (flow arrow) → opens reasoning panel for that flow (why is it green/amber/red).

**Building List** (right panel or below chain on mobile):
- Per row:
  - `Pause` / `Resume` toggle button.
  - `Demolish` button → opens Confirm Demolish modal (`Confirm` / `Cancel`).
- Row tappable → expands inline detail (cycle time, total output, people cost).

**Build Drawer** (slide-up sheet):
- Category filter chips: `All` / `Mining` / `Refining` / `Storage` / `Life Support` / `Construction`.
- Per recipe card:
  - Cost, grid footprint (1 slot at v1), prereq summary, output preview, adjacency hint (e.g., "+15% next to a Mine").
  - `Build` CTA (primary). Building is **instant on commit** — no wall-time. Disabled when prereqs unmet (or when no empty grid slots available), with hint text below.
- Drag-down or backdrop tap dismisses; `Cancel` button at bottom.

**Storage Panel** (right tab on desktop, peek-sheet on mobile):
- Per resource row: tap → focuses chain view on that resource (highlights producers and consumers).
- `Expand` / `Collapse` chevron per row for input/output detail.

**Automation Rules Panel** (T3+ only):
- `+ Add Rule` button → opens Rule Builder modal.
- Per rule: `Edit` / `Delete` buttons.

**People Capacity Allocation** (T1+ inline header bar):
- Per-recipe slider or numeric input that allocates People Capacity to that building.
- `Auto-distribute` button — system spreads capacity evenly.

**Navigation out of Production:**
- Body selector → switches scope (stays on Production).
- Storage row tap → focuses chain (stays on Production).
- Reasoning panel `Jump to Ops alert` (when stall has matching alert) → **Ops**.
- Building's resource source link (e.g., "needs Iron Ore from NEA-04") → **Map** with NEA-04 selected.
- Recipe card unlock hint `Unlocks at T2` → **Milestones**.

### States

- **Empty body:** "No buildings yet. Tap + to start." with hint about what's typical for body type.
- **Healthy chain:** all edges green.
- **Stalled chain:** at least one edge red; chain view auto-scrolls to highlight stall.
- **Capacity-limited (T1+):** "People Capacity 24/24 used — assign or expand."
- **Tier locked:** drawer shows blurred recipes with tier-gate text ("Unlocks at T2 — NEA Industry").

### Mobile Adaptation

- Body selector is a horizontal scrolling chip rail at top.
- Chain view is the dominant section; building list collapses behind a tab toggle.
- Build Drawer is a full-height bottom sheet with snap points.
- Storage panel is a peek-sheet from the right edge.

---

## Destination 4 — Fleet

### Design Intent

**Job:** Be the ship management table. Routes live on the Map; this is where the player thinks about *ships* — finding them, comparing them, batch-managing them.

**Primary use cases:**
- Find a specific ship (by name, status, or class).
- Reassign a route directly from the ship row.
- Compare hull stats before buying a new ship.
- Batch-recall multiple ships during emergencies.

**Success signals:**
- Idle ships are immediately obvious without filtering.
- Finding a specific ship by name is fast (<2 seconds at any fleet size).
- Hull stats are comparable side-by-side in the Buy Ship modal.

**Anti-patterns:**
- Duplicates Map's route information without adding management leverage.
- Multi-select is hidden or finicky to enter.
- Ship details require modal-on-modal stacking.

**Reached from:** Left rail / bottom nav. Also from Body Sheet ("Send Ship") and Ops idle-ship cards.

### Sections

1. **Ship Hangar Summary** (top) — count of owned ships by family (specialized solid / fluid / combined / specialist).
2. **Ship List** (main area) — tabular list with sort/filter.
3. **Ship Detail Sheet** (bottom sheet on selection) — full ship inspection.
4. **Buy Ship** (CTA top-right) — opens a Trade-flow modal for purchasing.

### Content (T0–T2 examples)

**Ship List columns:**
- Name (Hauler-1, Mixer-1, etc.)
- Family icon (specialized solid / fluid / combined)
- Slots (e.g., "30 solid", "20s + 10f", "25 fluid")
- Status (Idle / Loading / In Transit / Unloading / Maintenance)
- Assignment (route description or "—")
- ETA / Last activity
- Inline action: `Reassign · Pause · Recall`

**Ship Detail Sheet:**
- Hull spec block (capacity, speed, fuel/route, Earth buy price for replacement reference)
- Current cargo manifest (live, updates with route progress)
- Route history (last 10 trips with cargo + fuel cost)
- Maintenance bar (placeholder: not in v1, deferred)

**Buy Ship Modal:**
- Each owned-eligible hull (gated by current tier)
- Side-by-side: hull stats, current owned count, buy CTA
- Cost confirmation, delivery time (placeholder: instant at v1)

### Buttons & Navigation

**Header bar:**
- Hangar Summary readout (counts by family — informational).
- `Buy Ship` CTA → opens Buy Ship modal.

**Filter Bar** (above list):
- Status filter dropdown: `All` / `Idle` / `In Transit` / `Loading` / `Unloading` / `Maintenance` (deferred).
- Family filter dropdown: `All` / `Specialized Solid` / `Specialized Fluid` / `Combined` / `Specialist` (deferred).
- Sort dropdown: `Name` / `Status` / `Capacity` / `ETA`.
- Sort direction toggle (`↑` / `↓`).

**Ship Row** (single-select default):
- Whole row tappable → opens Ship Detail Sheet.
- Inline buttons (right side of row, visible on hover/desktop, always-visible compact on mobile):
  - `Reassign` → opens Route Creation flow with ship pre-bound.
  - `Recall` → calls ship back to last-known dock body.

**Multi-Select Mode:**
- Mobile: long-press any row enters multi-select.
- Desktop: **shift-click any row** enters multi-select (matches mobile pattern in spirit; uses keyboard modifier for desktop).
- Selected count appears at top: `3 selected`.
- Batch action buttons appear in a sticky bar:
  - `Reassign` (batch route assignment).
  - `Recall` (batch recall).
  - `Pause` (placeholder for future maintenance scheduling).
- `Cancel` (X) exits multi-select.

**Ship Detail Sheet** (opens on row tap):
- Hull spec block (read-only).
- Live cargo manifest.
- Route history list (last 10 trips).
- Action toolbar:
  - `Reassign Route` → Route Creation flow.
  - `Recall` → calls back.
  - `Send to Maintenance` (deferred — disabled with tooltip "T3+").
- Drag-down or `Close` (X) dismisses.

**Buy Ship Modal:**
- Per hull card: spec block, owned count, `Buy` CTA.
- `Buy` confirmation popover (per global confirm rule): shows credit deduction, delivery (instant at v1), `Confirm` / `Cancel`. Skipped on small purchases that don't trip the rule.
- `Compare` toggle → switches to side-by-side comparison view of selected hulls.
- `Close` (X) dismisses.

**Navigation out of Fleet:**
- `Reassign` (single or batch) → Route Creation flow → returns to Fleet on confirm.
- `Buy Ship` → Buy Ship modal in-place; or deep-link from Ops alert returns to Ops on confirm.
- Ship Detail action `Send to Maintenance` → deferred; no v1 destination.

### States

- **Empty (T0 cold open):** 1 Hauler-1 + 1 Probe. List shows them.
- **All idle:** banner "N ships idle — auto-assign to top opportunity?"
- **Maintenance pending (deferred):** placeholder, no v1 content.

### Mobile Adaptation

- Ship list rows compress: name, status icon, ETA only.
- Tap row expands inline (no separate sheet for shallow detail).
- Long-press row enters multi-select mode (matches gestures elsewhere).
- "Buy Ship" is a sticky bottom CTA.

---

## Destination 5 — Colonies

### Design Intent

**Job:** Be the pop-and-life-support workspace. The screen the player checks daily once habitats exist — where colony health is read, advanced, and recovered.

**Primary use cases:**
- Check life support reserves at a glance.
- Track progress toward the next pop tier (growth-tier bundle delivery).
- Diagnose shortage causes — "why is oxygen draining?"
- Trigger emergency imports for critical reserves.

**Success signals:**
- Pop-tier progress is the visual hero — the player can answer "what unlocks next?" in <5 seconds.
- Shortages are surfaced *before* they're critical (warning at <25%, not 0%).
- The growth-tier bundle communicates "go produce X more, then come back."

**Anti-patterns:**
- Becomes a debugging tool for "what is eating my water."
- Growth-tier bundle is hidden behind tabs or scrolling.
- Suspended-pop state feels permanent rather than recoverable.

**Reached from:** Left rail / bottom nav (visible but disabled at T0 with hint text). At T1+, also from Map (tap habitat) and Ops alerts.

### Sections

1. **Colony List** (top or left rail-within-screen) — all habitats the player operates.
2. **Selected Colony Detail** (main area) — population, life support, growth tier checklist, buildings nested.
3. **Pop Tier Visual** (compact sidebar or overlay) — current tier with checkmarks for met/unmet needs.
4. **Life Support Bars** (always-visible inside detail) — water / oxygen / food with reserve hours.
5. **Growth-Tier Bundle Tracker** — items the player needs to deliver to advance.

### Content (T0–T2 examples)

**Colony List entry (when first habitat exists):**
- "Lunar Foothold" · Pop 32 / Cap 50 · Tier: Survival · `12% O2 reserve risk`

**Selected Colony Detail (Lunar Foothold, T1, post-Prefab):**
- Population: 32 (capacity 50 from 1 Habitat Module)
- People Capacity: 32 (1:1 with pop at T1)
- Pop tier: **Survival** (next: Settled)
- Continuous needs:
  - Water: 87% (8.4h reserve at current pop)
  - Oxygen: 18% (1.7h reserve — *low*)
  - Food Pack: 64% (5.1h reserve)
- Growth-tier bundle for Settled (one-time):
  - Construction Materials: 3 / 8
  - Habitat Module: 0 / 2
- Suggested fix: `[Import 30 Oxygen now]`

**Pop Tier Visual:**
```
Survival ✓  →  Settled ◐ (4/10 inputs)  →  Growing ○  →  Comfortable ○  →  Affluent ○
```

**Buildings on this colony:** (nested expandable list — same shape as Production's building list)

### Buttons & Navigation

**Colony List** (top of screen):
- Each colony chip: tap → switches selected colony.
- `+` button (when player has Earth Prefab Kits available) → opens Trade scrolled to Prefab Kits tab.

**Selected Colony Detail — header actions:**
- `Build Building Here` → navigates to **Production** scoped to this colony.
- `Inspect Habitat Layout` (informational only at v1; opens 3D viewer if Three.js enabled).

**Life Support Bars** (per resource: water / oxygen / food):
- Bar is informational. Right-side action button:
  - `Import N` button when reserves are pinched (<25%) → deep-links to **Trade** with prefilled order quantity.

**Pop-Tier Visual** (compact):
- Each tier marker tappable → opens popover (or full sheet on mobile) showing requirements and current progress.

**Growth-Tier Bundle Tracker:**
- Per item row:
  - Item name + progress bar (informational).
  - `Send to colony` link (when item is produced elsewhere) → opens Route Creation flow with this colony as destination.
- `Claim` button (visible only when all items met) → opens Confirm Tier-Up modal (`Confirm` consumes bundle + advances pop tier; `Cancel`).

**Buildings list** (nested):
- Same controls as Production's building list (`Pause` / `Resume` / `Demolish`).

**Footer actions** (rare-use, in a `…` menu on mobile):
- `Pause Growth` button → opens confirmation modal (emergency action).
- `Resume Growth` (when paused) → confirmation.

**Navigation out of Colonies:**
- `Build Building Here` → **Production** (scoped here).
- `Import N` on a life support bar → **Trade** (prefilled).
- `Send to colony` on bundle item → Route Creation flow.
- Inspect-shortage tap on a pinched bar → **Production** (resource highlighted).
- Pop-tier marker → stays in Colonies (popover/sheet).
- `+` colony → **Trade** (Prefab Kits).

### States

- **Locked (T0):** screen shows "Unlocks at T1 — Lunar Foothold tier" with progress hint (200 Refined Metal sold + 50 Hydrogen Fuel reserves).
- **Healthy:** all bars green, pop growing, growth-tier checklist progressing.
- **Pinched:** at least one need <25%; pulses amber.
- **Critical:** any need at 0%; pop suspension warning timer visible.
- **Suspended:** habitat displays frozen state; pop displayed as "Suspended (resume by restoring inputs)."

### Mobile Adaptation

- Colony list is a horizontal chip rail at top (most players have 1–3 colonies through T2).
- Detail body fills the rest of the screen.
- Pop tier visual collapses to a single row above the life support bars.
- Growth-tier bundle is a card with a fill bar; tap to expand item-by-item.

---

## Destination 6 — Trade

### Design Intent

**Job:** Be the Earth-side market interface. Where the player buys what they can't yet make, sells what they have to spare, and deploys Earth Prefab Kits to bootstrap new bodies.

**Primary use cases:**
- Emergency life-support imports (oxygen, water, food) when a colony is pinched.
- Bulk sell of stockpiled goods (metals, ore) to convert to credits.
- Buy new ships.
- Buy and deploy Earth Prefab Kits at tier-up moments.

**Success signals:**
- Order completion is 1–2 taps from intent to confirmation.
- ROI on every potential order is obvious — the player isn't doing math in their head.
- Prefab Kits feel like a moment, not a buried row in a table.

**Anti-patterns:**
- Feels like a banking app rather than a market.
- Prices shown without context ("am I making money? losing money?").
- Order placement requires modal-on-modal-on-confirmation.

**Light spec below.** Earth-side market, Earth Prefab Kits, contract list.

**Reached from:** Left rail / More sheet. Also deep-link from Ops "Import from Earth" actions and Buy Ship CTA.

### Sections (sketch)

1. **Earth Market** — fixed buy/sell prices for unlocked resources; buy/sell order entry.
2. **Earth Prefab Kits** — one-time prefab purchases (first habitat, first lunar mine, first Mars foothold). Tier-gated and quantity-limited per run.
3. **Contracts** (post-event) — accept/decline list; deliveries tied to events.
4. **Account** — credits, recent transactions log.

### Content (T0–T2 examples)

**Earth Market table:**
| Resource | Earth Buy | Earth Sell | Owned | Last 24h Net |
|----------|----------:|-----------:|------:|-------------:|
| Iron Ore | 3 | 1 | 84 | +480 |
| Refined Metal | 18 | 12 | 38 | +192 sold |
| Water Ice | 4 | 2 | 12 | — |
| Hydrogen Fuel | 8 | 5 | 120 | — |
| Oxygen | 6 | 3 | 30 | -2 sold |

**Earth Prefab Kits (T1 unlock):**
- Lunar Habitat Module Kit · $8,000 · 1 of 1 available · `[Buy and Drop on Moon]`
- Lunar Surface Mine Kit · $3,500 · 1 of 1 available · `[Buy and Drop on Moon]`

### Buttons & Navigation

**Tab Strip** (top of screen):
- `Earth Market` / `Earth Prefab Kits` / `Contracts` / `Account` segmented tabs.

**Earth Market (table view):**
- Per resource row:
  - Quantity input (numeric stepper with `−` / `+` buttons or typed entry).
  - `Buy` button (uses input qty).
  - `Sell` button (uses input qty).
  - Both buttons disabled when input qty exceeds available (sell) or affordable (buy).
- Confirmation popover (per global confirm rule — fires when spend ≥ 25% of current credits): `Confirm` / `Cancel`.

**Earth Prefab Kits:**
- Per kit card:
  - Cost, "1 of 1 available" indicator.
  - `Buy and Drop` CTA → opens Delivery Target Picker.
- Delivery Target Picker (modal): list of eligible bodies; tap a body → `Confirm Delivery` / `Cancel`.

**Contracts:**
- Per contract row: title, deliverable, deadline, reward.
- `Accept` button → adds contract to active list.
- `Decline` button → dismisses.

**Account section:**
- Recent transactions list (read-only).
- Credits balance display.
- `Export Save` button (links to Settings → Saves).

**Navigation out of Trade:**
- `Buy and Drop` → after confirm, returns to **Map** with the new body's deployment animated.
- `Buy` / `Sell` order confirm → returns to invoking screen if reached via deep-link (Ops alert or Colonies); stays on Trade otherwise.
- `Buy Ship` flow (when reached from Fleet) → returns to **Fleet**.

---

## Destination 7 — Research

### Design Intent

**Job:** Be the strategic-upgrade home. Where the player commits to long-term direction with infrequent, weighty decisions.

**Primary use cases:**
- Queue the next research node to unlock a known bottleneck-relief.
- Review the tree to plan a multi-step strategy.
- Understand prerequisite chains for late-game targets.

**Success signals:**
- The tree's branches communicate strategic identity (Logistics vs. Industry vs. Life Support vs. Exploration).
- A casual player gets value from queuing one node; a strategic player gets value from planning ten.
- ETAs are honest — research time matches what the queue says.

**Anti-patterns:**
- Tree is unreadable at full size; users zoom rather than scan.
- Node prerequisites require multiple taps to surface.
- "Best path" is so obvious that the tree becomes a one-time exercise rather than ongoing strategy.

**Light spec below.** Tech tree across 4 branches: Logistics / Industry / Life Support / Exploration.

**Reached from:** Left rail / More sheet. Also from Milestones when a tier-up unlocks new research.

### Sections (sketch)

1. **Branch Tabs** — Logistics / Industry / Life Support / Exploration.
2. **Tree Visual** — node graph with prerequisites, completed nodes, in-progress, locked.
3. **Active Research Queue** — what's currently researching with ETA.
4. **Node Detail** — on click: cost, prereqs, what unlocks, time.

### Content target

~40 nodes total at full game; ~8 reachable by T2.

### Buttons & Navigation

**Branch Tabs** (top, segmented):
- `Logistics` / `Industry` / `Life Support` / `Exploration`.

**Tree Visual** (main area):
- Each node tappable → opens Node Detail panel (sheet on mobile, side-panel on desktop).
- Visual states (informational): locked / available / in progress / complete.
- Pinch zoom and drag pan; `Reset View` button (top-right) re-centers tree on player's progress.

**Active Research Queue** (sidebar / drawer):
- Per queued node:
  - Node name + time remaining.
  - `Cancel` button (refunds partial resources / time-gating cost — exact rule pending Open Question).

**Node Detail Panel:**
- Read-only: cost, prereqs, what it unlocks, time.
- `Start Research` button — adds node to queue. Disabled when prereqs unmet (with hint).
- Each prereq is a tappable link → focuses tree on that prereq node.
- Each "what it unlocks" item is a tappable link → varies (new recipe → **Production**; new ship → **Trade**; new region → **Map**).

**Navigation out of Research:**
- Prereq link → focuses tree (stays on Research).
- "What it unlocks" link → varies by unlock type.
- Reached-from **Milestones** tier-up: returns to **Milestones** on dismiss.

### Open question

Is research time-gated (research takes wall time), resource-gated (consumes resources to unlock), or both? Decision pending; affects what controls show in Active Research Queue.

---

## Destination 8 — Milestones

### Design Intent

**Job:** Be the tier-progression home and prestige-loop entry point. Where the player sees how far they've come, what unlocks next, and eventually how to incorporate.

**Primary use cases:**
- Check tier gate progress (concrete progress bars on each gate condition).
- Claim a tier-up when ready.
- Preview prestige (T7+) and decide whether to incorporate.

**Success signals:**
- Every visit answers "what's the very next thing that unlocks?" in <5 seconds.
- Gate conditions tie cleanly back to actionable goals on other screens (tap a gate → jump to where you'd act on it).
- The prestige preview makes carryover concrete and motivating.

**Anti-patterns:**
- Becomes a passive stats screen the player ignores.
- Gate progress doesn't link forward — player has to figure out where to act.
- Prestige feels like punishment (loss of progress) rather than reward (carryover gain).

**Light spec below.** Tier ladder progress and prestige preview.

**Reached from:** Left rail / More sheet. Also from Ops banner when tier-up is ready.

### Sections (sketch)

1. **Tier Ladder Visual** — horizontal/vertical strip of T0 → T7, current tier highlighted.
2. **Current Tier Detail** — what's unlocked, what completed milestones look like.
3. **Next-Tier Gate** — concrete progress bars on each gate condition (e.g., "Sell 200 Refined Metal" → 124/200; "Hydrogen Fuel reserves" → 38/50).
4. **Prestige Preview** (T7-only) — Charter Shares earned at this point, what carries over, "Incorporate" CTA.

### Content (T0–T2 examples)

**Current Tier:** T0 — Wildcatter

**Next Tier Gate (T0 → T1 Lunar Foothold):**
- Sell 200 Refined Metal to Earth: **124 / 200** (62%)
- Hydrogen Fuel reserves: **38 / 50** (76%)

**Completed milestones:**
- ✓ First survey (NEA-04)
- ✓ First mine built
- ✓ First refined metal sold

### Buttons & Navigation

**Tier Ladder Visual** (top of screen):
- Each tier marker tappable → scrolls or jumps to that tier's detail (stays on Milestones).
- Visual states (informational): complete / current / locked.

**Current Tier Detail** (read-only block):
- Lists unlocked recipes, hulls, regions for the current tier.
- Each unlocked item tappable → links to where to use it (e.g., a recipe → **Production** Build Drawer with that recipe pre-selected).

**Next-Tier Gate** (per-condition list):
- Per condition row:
  - Title + progress bar (informational).
  - Tap row → deep-links to the screen where the player can act (e.g., "Sell 200 Refined Metal" → **Trade** with metal sell row prefilled; "First habitat reaches Pop 50" → **Colonies**).
- `Claim [Tier Name]` primary CTA (visible only when all gates met) → opens Tier-Up Modal.

**Tier-Up Modal** (full-screen on claim):
- Tier name + flavor text.
- Bullet list of newly unlocked items.
- `Begin` CTA (single primary) → dismisses to **Map** with the new region animated/highlighted.

**Prestige Preview** (T7+ only):
- Charter Shares calculation breakdown (read-only).
- **Charter gallery** — 6–8 hand-authored Charters as picker cards (Mining Charter, Tanker Charter, Logistics Charter, Frontier Charter, Settler Charter, +reserved). Each card shows the modifier set. Player must select one before Incorporate.
- Carryover preview list (modest %: research, recipe knowledge, starter kit options). What's not carried: ships, money, populations, surveyed asteroids, body grid rolls.
- `Incorporate` primary CTA → opens Prestige Incorporation flow (see `UX_FLOWS.md`). Disabled until a Charter is picked.

**Navigation out of Milestones:**
- Gate condition tap → varies (Trade, Production, Colonies, Fleet).
- Unlocked-item link in Current Tier Detail → varies.
- `Claim` → Tier-Up Modal → **Map**.
- `Incorporate` → Prestige flow → new run.

### Open questions

- Tier-up ceremony shape (modal? cinematic moment?). See `UX_FLOWS.md` tier-up flow.
- Whether prestige reshuffles solar layout. Affects prestige preview content.

---

## Persistent Surfaces

Three surfaces appear across multiple destinations and need their own spec. They aren't destinations, so they don't have Design Intent blocks — their job is to be invisible until needed.

### Top Status Bar (always visible)

**Desktop fields (left → right):**
- Credits readout.
- Key resources: Refined Metal, Hydrogen Fuel, Water Ice, Oxygen (context-prioritized — order can shift based on current concerns).
- People Capacity (T1+).
- Alert count badge.
- Game time readout.
- Settings cog icon.

*No Sim Speed control, no Pause button.* Real-time gates pacing. Game time advances continuously while the app is open; AFK return handles catch-up.

**Mobile fields (compressed):**
- Credits, fuel, alert count.
- Tap any field → expands full status drawer (full status bar fields visible in a sheet).

**Buttons & Navigation:**
- Credits readout: tap → opens recent-transactions popover.
- Each resource: tap → opens **Sources & Sinks Popover** (small panel listing all bodies producing/consuming that resource, with rates and storage). Popover has a `View all` link → pushes to the full **Resource Detail screen** (see Persistent Surfaces below). Each popover row tappable → **Production** scoped to that body.
- People Capacity: tap → opens **Capacity Allocation Popover** (per-body breakdown). Each row tappable → **Production** scoped there.
- Alert count badge: tap → expands Map's mini alert sidebar (or pops the alert list as a sheet on mobile).
- Game time: tap → opens calendar/log popover (deferred at v1, placeholder).
- Settings cog: tap → opens **Settings Modal**.

**Settings Modal:**
- Tab strip: `Audio` / `Saves` / `Notifications` / `Account` / `Help` / `Tutorial`.
- Per tab, primary controls (button/toggle list deferred to v2 widget pass — for v1 each tab has a clear primary action):
  - **Audio:** master / SFX / music sliders, mute toggle.
  - **Saves:** `Save Now`, `Export Save` (downloads JSON), `Import Save` (file picker), slot list.
  - **Notifications:** push opt-in toggle, per-alert-type toggles, daily idle reminder toggle.
  - **Account:** anonymous / signed-in state, `Sign In with Email` / `Use Passkey`, `Sign Out`.
  - **Help:** searchable help list (deferred), link to support.
  - **Tutorial:** `Replay Tutorial` button (starts a separate save slot).
- `Close` (X) dismisses.

**Behavior notes (informational, kept brief at this pass):**
- Credit changes flash green/red briefly.
- Alert count badge color reflects max severity present (red > amber > blue).

### Body Detail Sheet (cross-cutting, opens on body select from any screen)

The same sheet appears whenever a body is selected — from Map tap, from Colonies list, from Production's body selector, from a route endpoint in Fleet, or from an alert deep-link.

**Sheet snap heights:** drag handle supports peek (~25% screen) / half (~55%) / full (~90%). On desktop, can be `Pin` toggled to stay open across screen changes.

**Header:**
- Body name + type badge (e.g., "NEA · Surveyed").
- Distance/window indicator vs. selected origin (informational).
- Action toolbar buttons (always visible):
  - `Build Here` → navigates to **Production** scoped to this body.
  - `Send Ship` → opens Route Creation flow with this body as destination.
  - `Plan Route` → opens Route Creation flow with this body as origin.
  - `Survey` → opens Survey Region Picker (or scan launcher if region already known).
  - `Pin` toggle (desktop only) — sheet **persists across navigation back-stacks**. Pinned sheet stays open as the player navigates between destinations, enabling cross-screen analysis (e.g., compare warehouse on NEA-04 while editing chains in Production). Mobile has no equivalent (no persistent sheet across destinations).

**Tab Strip** (segmented, 4 tabs total):
- `Overview` — surveyed resources, body grid size (e.g., "4×4 grid, 12/16 slots used"), current pop (if colony), warehouse summary.
- `Buildings` — grid view + list with same controls as Production's building panel (`Pause` / `Demolish`); shows adjacency bonuses.
- `Storage` — full warehouse contents with caps, broken down by storage building (Silo / Tank / Cryo). Each row tappable → focuses chain on that resource (jumps to Production).
- `Activity` — ships currently docked + active routes touching this body, merged ("what's moving in/out"). Ship rows open Ship Detail Sheet (stacks above body sheet); route rows open Route Detail Sheet.

**Dismiss:**
- Drag-down handle.
- `Close` (X) top-right.
- Tap outside sheet (when at peek/half).

### Resource Detail Screen (cross-cutting, opens from Sources & Sinks Popover)

A full-screen push view that surfaces the entire flow of a single resource across the player's network. Reached from the Top Status Bar's resource popover via `View all`, or from the Resource Bottlenecks section in Ops. Prevents the Colonies-from-becoming-a-debug-tool failure mode flagged in the design review.

**Header:**
- Resource name + class (raw / intermediate / finished) + cargo class (solid / fluid).
- Global rate readout: net production/min, net consumption/min, net surplus or deficit.
- 24h game-time chart: stockpile and rate over time (placeholder at v1).

**Sections (segmented filter at top: `Producers` / `Consumers` / `In Transit`):**
- **Producers:** every body producing this resource, with current rate, contributing buildings, and storage status. Each row tappable → **Production** scoped to that body.
- **Consumers:** every body consuming this resource, with rate and what it's fed into. Each row tappable → **Production** scoped to that body.
- **In Transit:** ships currently carrying this resource (route + ETA + quantity). Each row tappable → Ship Detail Sheet.

**Footer summary:**
- Total cap across all storage buildings holding this resource; usage percentage; tap → links to Storage tab on the body with the highest stockpile.

**Buttons & Navigation:**
- Per row: tap → respective deep-link.
- `Close` / back arrow → returns to invoking screen (popover or Ops).

**Why this surface:** it's the diagnostic answer to "where is my oxygen going?" without forcing the player to bounce through Colonies and Production looking for the leak.

### Alerts System

**Sources:** life support shortages, ships idle, ships stranded, storage at cap, recipe stalled, tier-up ready, event opened, build complete, route arrived.

**Channels (where they appear):**
- Alert count badge in Top Status Bar (always).
- Map's mini alert sidebar (top 3).
- Ops' Critical Alerts hero (top 3).
- Push notification (only critical, opt-in; see Notification Taxonomy in `GAME_DESIGN.md`).

**Severity tiers:**
- **Critical (red):** pop suspension imminent, ship stranded with no fuel reserves.
- **Warning (amber):** need <25%, storage full, idle ship.
- **Info (blue):** tier-up ready, build complete, route arrived.

**Alert Card Buttons & Navigation:**
- Severity icon + title (informational).
- **Primary action button** — label and behavior vary by alert type:
  - Life support low → `Import N [Resource]` → places Trade order, deducts credits, dispatches tanker if available.
  - Idle ship → `Auto-assign to [Best Route]` → system picks highest-value idle route, dispatches.
  - Storage full → `Add Hauler` (opens Buy Ship modal) / `Sell direct` / `Expand storage`.
  - Recipe stalled → `Build [missing input]` → deep-links to Production.
  - Tier-up ready → `Open Milestones` → navigates to **Milestones**.
- `Jump to source` chevron (right side) — deep-link to relevant screen with state pre-populated. Same as primary if no in-place fix exists.
- Whole card tappable (acts as `Jump to source`).
- `Dismiss` (X) — moves to Alert Log without resolving.

**Alert Log** (accessible from Ops):
- Read-only list of dismissed/resolved alerts with timestamps.
- Filter chips: `All` / `Resolved` / `Dismissed`.
- Per row: tap to inspect — shows what fired and how it ended.

---

## Style Direction

(Confirmed from prior decision: Dark Orbital Command for the map, Hybrid Corporate Logistics for management panels. Confirm in Stage 2 prototype.)

Three styles to compare in concepts:

1. **Light Mission Control** — off-white/pale steel UI, dark embedded map, clean NASA telemetry feel.
2. **Dark Orbital Command** — dark navy/graphite UI, cyan route lines, amber warnings, green stable chips. Strongest space-command mood.
3. **Hybrid Corporate Logistics** — dark map/visual core with light management panels, stronger tables and KPIs.

---

## Open Questions

Most v1 UI decisions are resolved (see `DECISIONS.md` R22–R59). Remaining:

- **Fleet maintenance / breakdowns:** deferred placeholder. v1 mechanic or T3+ research unlock?
- **Research gating** (P2 #24): time-gated, resource-gated, or both? Affects Active Research Queue Cancel behavior (#30).
- **Build Drawer category filters** (P2 #28): 5 categories vs. 4 broader. Tune in Stage 2 prototype.

All other open questions from earlier UI states are resolved: mobile T1 nav (R39 promote Colonies), Notes per body (R45 cut), Heat mode (R46 cut), trade order timing (R53 instant), tier-up ceremony (R19 plain modal), persistent bottom strip on desktop (R54 Map+Ops only).

---

## Concept Output Plan

Stage 0 concepts in `concepts/cohesive/` should now target the 5 active T0–T2 destinations × 3 styles = **15 images**:

- `map-{light,dark,hybrid}.png`
- `ops-{light,dark,hybrid}.png`
- `production-{light,dark,hybrid}.png`
- `fleet-{light,dark,hybrid}.png`
- `colonies-{light,dark,hybrid}.png`

Trade / Research / Milestones each get one representative concept in the chosen style after Stage 0 decision gate. Map's Survey and Routes modes each get one concept in the chosen style.

Original exploratory concepts in `concepts/` are preserved.
