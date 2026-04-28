# Void Yield 2 UX Flows

Cross-cutting journeys that span multiple screens. Each flow walks step-by-step through which screens, which actions, and what state changes — sketch fidelity, not pixel-spec.

See `UI_VIEWS.md` for screen-by-screen specs and `GAME_DESIGN.md` for game scope and content.

## Contents

1. [First-Time User Experience (FTUE)](#first-time-user-experience-ftue)
2. [AFK Return](#afk-return)
3. [Alert Resolution](#alert-resolution)
4. [Tier-Up](#tier-up)
5. [Buy Ship](#buy-ship)
6. [Build Recipe](#build-recipe)
7. [Survey and Claim](#survey-and-claim)
8. [Route Creation](#route-creation)
9. [Earth Prefab Kit (Drop a Foothold)](#earth-prefab-kit-drop-a-foothold)
10. [Prestige Incorporation](#prestige-incorporation) (sketch)
11. [Common Micro-Interactions](#common-micro-interactions)

---

## First-Time User Experience (FTUE)

**Goal:** by t=15:00 the player understands and is executing the loop unaided. Tutorial is skippable.

**Anchors:** Map screen, Body Detail Sheet, Production overlay, Trade screen.

### Step-by-step

| Time | Screen | Player action | System action |
|------|--------|---------------|---------------|
| t=0:00 | Map (cold open) | — | Drops player into Earth orbit. Earth + Moon + 1 staked NEA visible. Tutorial overlay highlights NEA-04 with "Tap to inspect" hint. |
| t=0:15 | Map → Body Sheet | Tap NEA-04 | Body Sheet opens at half-height. Tutorial highlights "Survey" action. |
| t=0:30 | Body Sheet → tutorial-accelerated scan | Tap "Survey" | 30s scan with progress ring (real-time scans are 4 min; first one is sped up). Reveals iron + water readings. |
| t=1:00 | Body Sheet (post-scan) | Sees readings | Tutorial highlights "Build Here" action. |
| t=2:00 | Body Sheet → Production overlay | Tap "Build Here" → tap "Small Mine" in Build Drawer | Building placed, mining begins. Tutorial dismisses overlay back to Body Sheet. |
| t=2:30 | Body Sheet | Sees Iron Ore counter ticking | Tutorial overlay: "Now refine it." Highlights Build Here again. |
| t=3:00 | Build Drawer | Tap "Smelter" | Smelter placed alongside mine on NEA-04. Per-body warehouse means ore feeds Smelter automatically. |
| t=4:00 | Map | Tutorial: "Ship the metal to Earth" | Highlights Hauler-1 (visible at Earth dock). |
| t=4:30 | Map → Route Creation flow | Tap Hauler-1 → "Send Ship" → tap NEA-04 → "Confirm" | Route arc draws, Hauler launches. |
| t=6:30 | Map | Hauler arrives Earth, auto-sells | $ ticks up. Banner: "First sale! +$24." |
| t=8:00 | — | Tutorial: "Earn enough to buy a second ship" | Banner persists; player free to act. |
| t=10:00 | Trade | Player taps Trade in nav (or tutorial highlights it) | Buy a second Hauler-1 for $3,000. |
| t=12:00 | Map / Ops | Banner: "Reach $10k to unlock Lunar Foothold (T1)" | Tutorial overlay ends. |
| t=15:00 | Any | Free play | — |

### State changes

- `tutorial.step` advances through ~10 named milestones; saves persist on each.
- Tutorial is skippable from a corner button at any step. Skipping fast-forwards `tutorial.step = done` and removes overlays.
- Replaying tutorial: reachable from Settings, restarts a separate save slot.

### Open questions

- Is the t=0:30 30-second tutorial-accelerated scan honest enough? Or should we just say "Sample scan" and skip the timer entirely?
- Is the FTUE first sale Refined Metal (current draft) or raw Ore? Refined teaches the chain pattern; raw is faster first feedback. Pending.

---

## AFK Return

**Goal:** the most important moment in an idle game. Fast, honest summary of what happened, with one-tap path to fix the worst stall.

**Anchors:** AFK Return Modal (full-screen), Ops, deep-link targets.

### Step-by-step

| Step | Surface | Content / Action |
|------|---------|------------------|
| 1 | App-open detection | If `now - last_active > 60s`, run catch-up sim. Show modal once catch-up resolves. |
| 2 | AFK Return Modal | Full-screen modal. Cannot be skipped without acknowledging (single dismiss). |
| 3 | Modal — Header (the satisfying number) | `+$2,304 net · 4h 12m away` as a hero readout. (Capped at 24h with caveat note "AFK simulation capped at 24h.") |
| 4 | Modal — What happened | Raw resource deltas as the body. Examples: `+480 ore · +192 metals · +24 fuel · 4 deliveries sold · 1 event auto-resolved`. Top ~5 lines, raw counts not credit-normalized — keeps the player honest about storage state. |
| 5 | Modal — What stopped | Ranked list of stalls with duration. e.g.:<br>• `NEA-04 storage at cap — 1h 42m`<br>• `Hauler-1 idle — 38m`<br>• `First Habitat O2 low — 12m`<br>Each row tappable for jump-to-fix. |
| 6 | Modal — Population delta (T1+ only) | `+8 pop at First Habitat · 0 suspended` |
| 7 | Modal — Primary CTA | Single button: `Resolve top issue` — deep-links to the worst stall (typically jumps to the relevant body's sheet on Map, with the alert pre-selected). |
| 8 | Modal — Dismiss | `Continue` — closes modal, drops player on Ops. |
| 9 | Ops | Critical alerts surface remaining stalls. AFK Return summary card persists at top of Ops for the current session. |

### Voice (locked: terse-corporate)

- Header is the satisfying number ($ delta) with time away as context. No "Welcome back!" or "While you were away…" preamble.
- Body uses sentence-case, terse phrasing. Numbers leading; verbs minimal.
- Stall lines name the body and the problem in 4–6 words: `NEA-04 storage at cap`, not `Hey! Your storage at NEA-04 is full!`

### Capping rules

- AFK earnings capped at min(storage cap, route capacity, fuel availability) per resource.
- 24h soft cap on simulated catch-up. Beyond 24h, modal shows: "Capped at 24h. Time has passed but operations were idle." No earnings beyond cap.
- Events that fire during AFK can either auto-resolve (most) or pause-on-return (few; rare events that need explicit player attention).

### State changes

- `afk.last_summary` persists for the current session so the player can re-read it from Ops.
- AFK summary is also written to the Event Log (Ops sub-screen).

### Open questions

*Resolved 2026-04-28: delta units = $ headline + raw counts in body. Voice = terse-corporate (see DECISIONS.md R-21, R-18).*

---

## Alert Resolution

**Goal:** every alert has a primary action that resolves it in one or two taps. No alert is purely informational without a path forward.

**Anchors:** Alert source (Ops or Map sidebar), deep-link target screen.

### Generic pattern

1. Alert fires (e.g., "Oxygen low at First Habitat").
2. Surfaces in: status bar badge, Map mini sidebar, Ops Critical Alerts.
3. Each alert card has:
   - **Primary action button** — resolves in-place when possible.
   - **Jump to source** link — deep-links to the relevant screen with state pre-populated.
4. On resolution, alert clears across all surfaces.
5. Dismissed alerts go to the Alert Log (Ops sub-screen).

### Specific examples

#### Oxygen low at First Habitat

- Primary: `[Import 50 Oxygen from Earth]` — places a Trade order with prefilled quantity, deducts credits, tanker auto-dispatched if available.
- Secondary: `[Build Electrolyzer]` — deep-links to Production scoped to First Habitat with Electrolyzer pre-selected in Build Drawer.
- Jump: opens Colonies → First Habitat detail.

#### Hauler-1 idle (no route)

- Primary: `[Auto-assign to NEA-04 → Earth]` — system picks the highest-value idle route; ship dispatches.
- Secondary: `[Manual assign]` — opens Route Creation flow with this ship pre-bound.
- Jump: opens Fleet → Hauler-1 detail.

#### NEA-04 storage full (Refined Metal at cap)

- Primary: `[Add Hauler]` — opens Buy Ship flow with cheapest-eligible solid hauler highlighted.
- Secondary: `[Sell direct]` — exports current stockpile via cheapest available route.
- Tertiary: `[Expand storage]` — deep-links to Production with storage upgrade selected.
- Jump: opens Map → NEA-04 → Storage tab.

#### Tier-up ready (T0 → T1 Lunar Foothold)

- Primary: `[Open Milestones]` — jumps to Milestones; Tier-Up flow takes over.
- This is an **info** alert, not critical, but always presents prominently when met.

### Open questions

*Resolved 2026-04-28: confirmation follows the global confirm rule — fires only when an action is irreversible OR single-action spend ≥ 25% of current credits. Auto-assign and small Trade orders commit silently.*

---

## Tier-Up

**Goal:** make tier transitions feel earned without disrupting the running game.

**Anchors:** Milestones screen, optional cinematic moment.

### Step-by-step

| Step | Surface | Content / Action |
|------|---------|------------------|
| 1 | Background | All gate conditions met for T(N) → T(N+1). Sim still running. |
| 2 | Status bar | Banner appears: "T(N+1) ready — [tier name] can be claimed." Banner persists until Milestones is opened. |
| 3 | Ops | Tier-up alert sits at top of Critical Alerts list. Primary: `[Open Milestones]`. |
| 4 | Milestones screen | Player navigates here. Next-Tier Gate section shows all bars at 100% with green checks. Single CTA: "**Claim [Tier Name]**". |
| 5 | Tier-Up Modal | Full-screen modal (or large overlay) with: tier name + flavor text, list of newly unlocked items (recipes, ship hulls, regions), single "Begin" CTA. |
| 6 | Post-claim | Modal dismisses to Map, which now shows the newly unlocked region (e.g., Moon's surface as build-able after T1). Sim resumes. |

### State changes

- `player.current_tier` advances.
- New recipes, hulls, and Earth Prefab Kits unlock in their respective screens.
- New tier gate (T(N+1) → T(N+2)) starts tracking.
- Achievement-style log entry written.

### Locked: plain modal at v1

*Resolved 2026-04-28: Tier-up is a plain modal (tier name, flavor text, list of newly unlocked items, single `Begin` CTA). No cinematic pause/zoom at v1. Cinematic is a Stage 2 polish candidate — adding an animated backdrop later doesn't break the flow.*

*Voice of tier-up flavor text follows the global terse-corporate voice (see Notification Taxonomy in `GAME_DESIGN.md`). Each tier gets ~30–50 words of measured, NASA-industrial copy — not character dialogue.*

---

## Buy Ship

**Goal:** straightforward purchase from Earth with a clear stat compare.

**Anchors:** Trade screen (or Fleet's "Buy Ship" CTA), Fleet screen post-purchase.

### Step-by-step

| Step | Surface | Action |
|------|---------|--------|
| 1 | Fleet → "Buy Ship" CTA | Opens Buy Ship modal. Or: Trade → Earth Prefab Kits / Ships tab. |
| 2 | Buy Ship modal | Lists tier-eligible hulls (Hauler-1, Mixer-1 at T0; +Tanker-1 at T1; +Hauler-2/Tanker-2/Mixer-2 at T2). Each card: spec block, owned count, price, "Buy" CTA. |
| 3 | Player taps "Buy" | Per global confirm rule — if spend ≥ 25% current credits, confirmation popover with credit-deduction preview (`Confirm` / `Cancel`); otherwise commits silently. |
| 4 | Commit | Credits deducted; ship spawns at Earth dock; ship appears in Fleet list with status `Idle`. (Instant delivery at v1.) |
| 5 | Modal dismisses to Fleet | New ship is highlighted briefly (selection state). |

### State changes

- `player.credits -= price`
- `fleet.ships += new ship at Earth, status=idle`

### Variations

- If launched from Ops "Add Hauler" alert primary, modal pre-selects the cheapest-eligible solid hauler.
- If launched from a route-creation flow that needs more capacity, modal pre-selects the cargo class needed.

### Open questions

- Delivery time for ship purchases: instant (v1 default) vs. wall-time delivery (more realistic, friction at scale).
- Should buying a second copy of the same hull be one-tap "+1" rather than full modal? Likely yes for v2.

---

## Build Recipe

**Goal:** place a building on a body in 2–3 taps, with chain context visible.

**Anchors:** Body Sheet (entry), Production overlay or full screen.

### Step-by-step (from Map)

| Step | Surface | Action |
|------|---------|--------|
| 1 | Map | Player taps a body. Body Sheet opens. |
| 2 | Body Sheet | Player taps "Build Here." |
| 3 | Build Drawer (slide-up sheet) | Lists tier-eligible recipes for this body type, grouped by category (Mining / Refining / Life Support / Construction). Each card: cost, build time, footprint, prerequisites, output preview. |
| 4 | Player taps a recipe card | Card expands inline showing input chain: "Needs: Iron Ore (you produce 20/min on this body) — chain OK" or "Needs: Aluminum (no source on this body) — import needed." |
| 5 | Player taps "Build" CTA | Credits deducted; building goes into Build queue with timer (T0 Smelter = 90s build time placeholder). |
| 6 | Building completes | Notification (in-app), building added to body's chain, starts producing. |

### Step-by-step (from Production)

Skip steps 1–2; player is already on Production with body selected. Tap "+ Add Building" → Build Drawer. Same from there.

### State changes

- `player.credits -= recipe.cost`
- `body.buildings += new building (status=building)`
- After build time: `body.buildings[N].status = active`, recipe begins.

### Open questions

- Footprint: is body capacity finite (limited slots per body) or unlimited? Anno has finite road tiles; Paragon has infinite. Lean toward finite (forces hard choices); placeholder cap could be 8–16 buildings per body, scaling by body type.
- Build time: instant (Anno-style placement) vs. wall-time (Factorio-style construction)? Currently placeholder wall-time. Decision pending.

---

## Survey and Claim

**Goal:** discover an asteroid worth mining, with enough information to commit.

**Anchors:** Map's Survey mode, Survey region picker (full screen), Body Sheet.

### Step-by-step

| Step | Surface | Action |
|------|---------|--------|
| 1 | Map | Player switches to Survey mode (top-left selector). Map dims; search regions overlay. |
| 2 | Survey mode | Player taps a region (e.g., "Near-Earth Search"). |
| 3 | Survey region picker (full screen) | Region map zoomed; candidate count ("3 unsurveyed bodies in this region"). Probe focus selector: Composition / Orbit / Hazard. Scan time estimate per focus. |
| 4 | Player picks focus, taps "Begin Scan" | Probe Bay queues the scan. Scan time elapses idle (player can return to Map). |
| 5 | Scan completes (notification) | Body Sheet opens with discovered readings (low/medium/high for each resource). |
| 6 | Player decides: Claim, Re-scan, or Move on | "Claim" stakes the body (unlimited claims at v1; limited later). "Re-scan" reveals next data layer (Purity, Depth, Hazards). "Move on" returns to Map. |
| 7 | Claimed body | Now appears as a buildable destination across all screens (Production body selector, route endpoints, etc.). |

### State changes

- `survey.queue += scan task (region, focus, eta)`
- On complete: `surveyed_bodies += this body, with readings`
- On claim: `claimed_bodies += this body`, build/route options enabled.

### Open questions

- Re-scan cost: free (just time) vs. credits per re-scan vs. requires probe consumable. Default: just time.
- Claim limit: unlimited at v1 vs. limited per tier. Limited would force prioritization but adds friction. Default: unlimited at v1, revisit if claims feel meaningless.

---

## Route Creation

**Goal:** assign a ship to a route in 3–4 taps.

**Anchors:** Map (selection origin), route detail sheet (confirm).

### Step-by-step (canonical)

| Step | Surface | Action |
|------|---------|--------|
| 1 | Map | Player taps a body (e.g., NEA-04). Body Sheet opens. |
| 2 | Body Sheet | Player taps "Plan Route." |
| 3 | Route Sheet (replaces Body Sheet) | Origin = NEA-04 (locked). Player picks Destination (defaults to Earth or last-used). Player picks Cargo (auto-fills with NEA-04's exportable resource). Player picks Ship (defaults to closest idle compatible ship). |
| 4 | Route Sheet — preview | Shows: ETA (e.g., 8m 20s), fuel cost (1.12×), capacity utilization (e.g., 30/30 solid slots), good-window indicator. |
| 5 | Player taps "Confirm" | Ship dispatches; route arc draws on map. |
| 6 | Optional repeat config | "Repeat: once / 3× / continuous" toggle. Continuous routes auto-dispatch the same ship on the same route after each unload. |

### Variations

- **From Fleet:** select ship → "Assign Route" → opens same Route Sheet with ship pre-bound; player picks origin/destination/cargo.
- **From Ops idle-ship alert:** "Auto-assign" picks the highest-value idle route automatically; "Manual assign" opens this flow.

### Cargo class enforcement

- Ship picker grays out hulls that can't carry the chosen cargo.
- For combined hulls, capacity preview shows breakdown: "Mixer-1 — 20 solid + 0 fluid used."
- If the user selects a multi-cargo route (T2+), cargo picker becomes a multi-select.

### State changes

- `routes += new route (origin, destination, cargo, ship_id, repeat_mode)`
- Ship status: `idle → loading → in_transit → unloading → idle (or repeat)`.

### Open questions

- Repeat config UI: 3-button segment vs. number input. 3-button is faster but less expressive.
- Window-based depart-now-vs-wait: is this a v1 feature or T3+ (when automation rules can prefer good windows)? Default: v1 shows window indicator but doesn't enforce wait; player choice.

---

## Earth Prefab Kit (Drop a Foothold)

**Goal:** the one-time mechanism for establishing a presence on a new body before local industry exists.

**Anchors:** Trade screen, Map (delivery target).

### Step-by-step

| Step | Surface | Action |
|------|---------|--------|
| 1 | Tier-up flow | T(N+1) tier unlocks new Earth Prefab Kits (e.g., T1 unlocks Lunar Habitat Module Kit + Lunar Surface Mine Kit). |
| 2 | Trade → Earth Prefab Kits tab | Lists available kits with cost and "1 of 1 available" indicator. |
| 3 | Player taps "Buy and Drop" on a kit | Modal asks for delivery target (e.g., "Drop on: Moon"). Confirms credit cost + delivery time (placeholder: 2 min). |
| 4 | Player confirms | Credits deducted. Delivery vessel auto-launches from Earth (visualized on Map as a unique kit-delivery icon). |
| 5 | Delivery arrives | Notification: "Lunar Habitat Module deployed on Moon." Body now has a habitat (or first mine, etc.) — buildable / inhabitable. |
| 6 | Post-delivery | Kit is consumed (no longer available in Trade). To deploy more on the same body, player must build locally via Production. |

### State changes

- `player.credits -= kit.cost`
- `prefab_kits.consumed += this kit`
- Body state: gains the kit's content (habitat / mine / etc.) as a fully-built building.

### Open questions

- Quantity per tier: 1-of-1 hand-authored per kit vs. unlimited at high credit cost. Lean toward 1-of-1 for the *first* of each kit type per tier (forces using local industry to scale); unlimited later kits at premium price as an emergency option.
- Should Prefab Kits be visible-but-locked at lower tiers, so the player anticipates them? Probably yes — drives forward momentum.

---

## Prestige Incorporation

**Sketch only.** Detailed flow when prestige economy is drilled.

**Goal:** end a run, claim Charter Shares, start a new run with carryover.

### Steps

1. T7 endgame milestone bundle complete.
2. Milestones screen unlocks "Incorporate" CTA.
3. Player reviews Charter Shares calculation: peak throughput × colony tier sum × unlocked recipes.
4. Confirm modal lists carryover (% research, % recipe knowledge, starter kit options).
5. Confirm starts a new run with carryover applied; old run archived.
6. Sandbox-mode opt-out: "Continue building in this run as Sandbox" — disables further Charter accumulation but lets the player keep playing without resetting.

### Open questions

- Whether the solar system layout is reshuffled or preserved on prestige.
- Exact carryover ratios and Charter Shares formula.
- Sandbox unlock gating (free from start, or after first prestige).

---

## Common Micro-Interactions

These are too small to deserve their own flow but worth listing as expected behaviors.

| Interaction | Behavior |
|-------------|----------|
| Pause sim | Status bar pause button or spacebar (desktop). All catch-up resumes when unpaused; AFK timer doesn't tick during pause. |
| Sim speed change | 1× / 2× / 4× toggles in status bar. 4× has a subtle visual frame indicator (route arcs animate faster) so the player remembers it's on. |
| Switch map mode | Top-left segmented control on Map. Persists per session. |
| Open settings | Cog icon in status bar (top-right). Opens a modal: audio, save management, notifications, account, help, tutorial replay. |
| Save management | Settings → Saves. Supports manual save, auto-save status (last save N min ago), import/export, slot switching. |
| Notification permission ask | First time a critical-tier alert is about to fire AND the player has shown engagement (>30 min total play). Not on first launch. |
| PWA install prompt | After session 2, if not yet installed and platform supports. Single dismissible banner. |
| Empty-resource fallback | Any list view that's empty shows what would unlock content (e.g., Colonies at T0: "Unlocks at T1 — Lunar Foothold (gate progress: 124/200 metals sold)"). |

---

## Open Questions Across Flows

Aggregated for visibility:

- **FTUE first sale:** raw Ore vs. Refined Metal at t=6:30.
- **AFK summary voice:** terse-tactical vs. NPC-flavored. Tied to Notification Taxonomy.
- **AFK delta units:** raw resource units vs. credit-normalized.
- **Tier-up ceremony fidelity:** modal vs. cinematic moment.
- **Tier-up flavor text length and voice.**
- **Build time per recipe:** instant vs. wall-time. Currently wall-time placeholder.
- **Build footprint:** finite slots per body vs. unlimited.
- **Re-scan cost in Survey:** free time vs. credits vs. consumable.
- **Claim limit:** unlimited at v1 vs. tier-gated.
- **Ship delivery time:** instant vs. wall-time.
- **Repeat-route UI shape:** segmented control vs. number input.
- **Window-based departure rules:** v1 vs. T3+ automation only.
- **Prefab Kit quantity per tier:** 1-of-1 vs. unlimited at premium.
- **Prefab Kit visibility at lower tiers:** locked-and-shown vs. hidden until unlock.
