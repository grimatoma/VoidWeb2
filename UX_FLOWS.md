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
10. [Prestige Incorporation](#prestige-incorporation)
11. [Quests (Daily / Weekly)](#quests-daily--weekly)
12. [Common Micro-Interactions](#common-micro-interactions)

---

## First-Time User Experience (FTUE)

**Goal:** by t=15:00 the player understands and is executing the loop unaided. Tutorial is skippable.

**Anchors:** Map screen, Body Detail Sheet, Production overlay, Trade screen.

### Step-by-step

| Time | Screen | Player action | System action |
|------|--------|---------------|---------------|
| t=-0:15 | Company-name modal | (Optional rename, defaults `VOID YIELD CO.`) | One-line modal: "Name your corporation — `VOID YIELD CO.` (renameable later)." Single CTA: `Begin operations`. Skippable; defaults retained. (R63) |
| t=0:00 | Map (cold open) | — | Drops player into Earth orbit. Earth + Moon + 1 staked NEA visible. Earth-orbit home base shows a 4×4 starter grid. Tutorial overlay highlights NEA-04 with "Tap to inspect" hint. |
| t=0:15 | Map → Body Sheet | Tap NEA-04 | Body Sheet opens at half-height. Tutorial highlights "Survey" action. |
| t=0:30 | Body Sheet → tutorial-accelerated scan | Tap "Survey" | 30s scan with progress ring (real-time scans are 4 min; first one is sped up). **Reveals iron + water readings AND a 4×4 grid for NEA-04.** |
| t=1:30 | Body Sheet (post-scan) | Sees readings + grid | Tutorial highlights "Build Here" action. |
| t=2:00 | Body Sheet → Production (NEA-04 grid) | Tap "Build Here" → tap empty grid tile → tap "Small Mine" in Build Drawer | Building placed instantly on grid. Mining begins immediately. Tutorial dismisses back to Body Sheet. |
| t=2:30 | Body Sheet | Sees Iron Ore counter ticking | Tutorial overlay: "Ship the ore to Earth." Highlights Hauler-1. |
| t=2:45 | Map → Route Creation flow | Tap Hauler-1 → "Send Ship" → tap NEA-04 → "Confirm" | Route arc draws (NEA-04 → Earth, raw Iron Ore). Hauler launches. |
| t=4:30 | Map | Hauler arrives Earth, auto-sells | $ ticks up. Banner: `First sale: +Iron Ore × 30 sold for $30` (raw price). First feedback loop closes. |
| t=5:30 | Body Sheet (NEA-04) | Tutorial nudges player | "Place a second Mine — your grid has space." Tutorial highlights another empty tile. Player places second Small Mine. |
| t=6:00 | Build Drawer | Tap "Smelter" | Smelter placed adjacent to a Mine on the grid. **Compare moment:** banner reads `Smelter +15% from Mine adjacency · Refining 5 ore → 2 metal worth 12 each. Way more than 5 ore at 1 each.` Pedagogy by comparison. |
| t=7:30 | Map | Tutorial: "Now ship the refined metal" | Highlights Hauler-1 again. Player sets up route NEA-04 → Earth carrying Refined Metal. |
| t=8:00 | Map | Hauler arrives Earth, auto-sells | $ ticks up significantly: `+Refined Metal × 12 sold for $144`. The chain pattern lands. |
| t=9:30 | Trade | Tutorial highlights Trade | Buy a second Hauler-1 for $3,000. |
| t=11:00 | Map → second survey | Manual survey of a second NEA | No acceleration. Real 4-min scan. Player learns the real pace and grid-roll variance — second NEA might roll 3×4 (tight) or 5×5 (rare big find). |
| t=13:00 | Map / Ops | Banner: "Sell 200 Refined Metal to unlock Lunar Foothold (T1) · 124/200 sold" | Tutorial overlay ends. Concrete production gate (not credit threshold) — reinforces "content gates not paywalls" pillar. (R64) |
| t=15:00 | Any | Free play | Player knows: survey-with-grid-reveal, place, mine, refine, ship, sell. Placement matters. |

### State changes

- `tutorial.step` advances through ~10 named milestones; saves persist on each.
- Tutorial is skippable from a corner button at any step. Skipping fast-forwards `tutorial.step = done` and removes overlays.
- Replaying tutorial: reachable from Settings, restarts a separate save slot.

### Open questions

- Is the t=0:30 30-second tutorial-accelerated scan honest enough? Or should we just say "Sample scan" and skip the timer entirely?

*Resolved 2026-04-28: FTUE first sale is raw Iron Ore at t=4:30; Smelter introduced at t=6:00 as a compare moment ("look how much more"). See R35 in DECISIONS.md.*

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
- **24h hard cap** on simulated catch-up (R31). Beyond 24h, modal shows: `Capped at 24h · time has passed but operations were idle.` No earnings beyond cap. Daily check-in is the implicit contract.
- AFK events fire under the **hybrid event metric** (R32): foreground events accumulate per active-play minute when the app is open; AFK-return events have their own budget. Most auto-resolve and surface as a single line in the modal ("Solar storm at NEA-04 — auto-resolved, output 4% lower for the storm window"); rare ones gate on return ("Rescue request pending player attention").

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
| 6 | Post-claim | Modal dismisses to **Map**, which now shows the newly unlocked region (e.g., Moon's surface as build-able after T1) animated/highlighted. The new-region reveal IS the payoff (R57 — tier-up is treated as a chapter break). Sim continues running (no Pause control exists; nothing was suspended during the modal). |

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

*Resolved 2026-04-28: ship delivery is instant at v1 (R50); wall-time delivery deferred to higher tiers as economic friction.*

- Should buying a second copy of the same hull be one-tap "+1" rather than full modal? Likely yes for v2.

---

## Build Recipe

**Goal:** place a building on a body in 2–3 taps, with chain context visible.

**Anchors:** Body Sheet (entry), Production overlay or full screen.

### Step-by-step (from Map)

| Step | Surface | Action |
|------|---------|--------|
| 1 | Map | Player taps a body. Body Sheet opens. |
| 2 | Body Sheet | Player taps "Build Here." Production opens scoped to that body, showing its grid. |
| 3 | Production grid | Player taps an empty grid tile. Build Drawer (slide-up sheet) opens for that tile. |
| 4 | Build Drawer | Lists tier-eligible buildings for this body type, grouped by category (Mining / Refining / Storage / Life Support / Construction). Each card: cost, grid footprint (1 slot), prerequisites, output preview, **adjacency hint** (e.g., "+15% next to a Mine"). |
| 5 | Player taps a building card | Card expands inline showing input chain status: "Needs: Iron Ore (you produce 20/min on this body) — chain OK" or "Needs: Aluminum (no source on this body) — import needed." |
| 6 | Player taps "Build" CTA | Credits deducted; **building placed instantly** on the selected tile (R33 — no wall-time). Production resumes immediately. Adjacency bonuses apply on placement. |

### Step-by-step (from Production)

Skip steps 1–2; player is already on Production with body selected. Tap an empty grid tile or `+ Add Building` → Build Drawer. Same from there.

### State changes

- `player.credits -= building.cost`
- `body.buildings += new building (status=active, slot=tile, adjacency_bonus=computed)`
- Placement applies adjacency to neighbors immediately.

### Open questions

*Resolved 2026-04-28: build is instant placement (R33); body grids are survey-rolled per body type (R29 — see Survey-and-Claim flow). Storage uses dedicated Silo / Tank / Cryo buildings on the grid (R41).*

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
| 5 | Scan completes (notification) | Body Sheet opens with discovered readings (low/medium/high for each resource) **and the body's grid size, rolled within its body-type range** (R29 — e.g., NEAs roll 3×4 to 5×5; lunar habitats 5×5 to 7×7). The grid roll is the discovery beat: a 5×5 NEA is a meaningful early-game find; a 3×4 is "just enough for a starter mine." |
| 6 | Player decides: Claim, Re-scan, or Move on | "Claim" stakes the body (unlimited claims at v1, R49). "Re-scan" reveals next data layer (Purity, Depth, Hazards) — free, just takes more time (R48). "Move on" returns to Map. |
| 7 | Claimed body | Now appears as a buildable destination across all screens (Production body selector with the rolled grid, route endpoints, etc.). |

### State changes

- `survey.queue += scan task (region, focus, eta)`
- On complete: `surveyed_bodies += this body, with readings + grid_size (rolled)`
- On claim: `claimed_bodies += this body`, build/route options enabled.

### Open questions

*Resolved 2026-04-28: re-scan is free (R48); claim limit is unlimited at v1 (R49); body grid sizes roll at survey within a body-type range (R29). Range tuning per body type is P0 #2c, deferred to playtest.*

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
| 4 | (Optional) Add stop | Player taps `+ Add stop` to insert intermediate destinations. Up to **3 stops total** (R42 — multi-stop available from T0). For each added stop, picker shows pickup/dropoff cargo per leg. Combined hulls (Mixer-1) shine here: ore from NEA-04 → drop to lunar habitat → pick up oxygen → return to Earth in one assignment. |
| 5 | Route Sheet — preview | Shows: ETA per leg + total (e.g., 8m 20s + 3m 10s + 4m 40s = 16m 10s total), fuel cost (1.12×), capacity utilization per leg (e.g., 30/30 solid leg 1; 0 solid + 20 fluid leg 2), good-window indicator per leg. |
| 6 | Player taps "Confirm" | Ship dispatches; route arc draws on map (multi-leg if applicable). |
| 7 | Optional repeat config | `once / 3× / continuous` segmented toggle (R51). Continuous routes auto-dispatch the same ship on the same multi-leg route after each unload at the final stop. |

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

*Resolved 2026-04-28: repeat config is 3-button segmented (R51); window-based departure shows the indicator but doesn't enforce wait at v1 (R52); multi-stop routes available from T0 with up to 3 stops per route (R42).*

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

*Resolved 2026-04-28: kits are 1-of-1 hand-authored per kit per tier (R37). Each tier unlocks specific kits (T1 = Lunar Habitat + Lunar Surface Mine; T4 = Mars Foothold; etc.); each buyable once per tier per kit-type. After that, the player must build locally — forces local-industry scaling. The "I just bought my Mars foothold" moment is the load-bearing emotional beat.*

- Should Prefab Kits be visible-but-locked at lower tiers, so the player anticipates them? Probably yes — drives forward momentum.

---

## Prestige Incorporation

**Goal:** end a run, claim Charter Shares, start a new run with **mechanical variety via Charter pick** (R44) — not just multiplied numbers.

**Anchors:** Milestones screen, Prestige Incorporation modal, fresh-run cold open.

### Step-by-step

| Step | Surface | Action |
|------|---------|--------|
| 1 | Background | Player completes the **System Corporation Declaration** milestone (final T7 milestone). All prior T7 milestones may or may not be complete — Declaration is the gate. |
| 2 | Status bar | Banner: `Incorporate available · System Corporation Declaration complete`. Player can ignore (continue T7 destination play, R36) or proceed. |
| 3 | Milestones | Player taps `Incorporate` CTA. Prestige Preview surfaces: Charter Shares calculation, Charter gallery, carryover preview. |
| 4 | Charter Gallery | Player browses 6–8 hand-authored Charters as picker cards. Each card shows the modifier set (e.g., `Mining Charter · ore yields +25% · refinery costs +50%`). Player **must select one** before continuing. |
| 5 | Confirm modal | Confirm modal lists: chosen Charter (with full modifier readout), carryover (modest % research, % recipe knowledge, small Charter-Share-purchasable starting kit), and what's not carried (ships, money, populations, surveyed asteroids, body grid rolls). |
| 6 | Player confirms | Old run archived (still browsable from Settings → Saves). New run starts at T0 with the chosen Charter active and carryover applied. |
| 7 | Fresh cold open | New run drops the player at the modified T0 cold-open. Charter modifiers apply from turn one (e.g., Mining Charter run starts with ore yields already +25%). |
| Optional | Mid-confirm | "Continue this run as Sandbox" — disables further Charter Shares accumulation but lets the player keep playing without resetting. |

### State changes

- `runs.archived += {old_run_state}`
- `prestige.charter_active = chosen_charter_id`
- `prestige.charter_shares += earned_amount`
- `runs.current = new_run_state with carryover applied`

### Voice (terse-corporate)

The Confirm modal copy follows the locked terse-corporate voice. Examples:
- Header: `Incorporate · charter shares earned: 142`
- Charter card title: `Mining Charter`
- Charter card body: `ore yields +25% · refinery costs +50%`
- Confirm CTA: `Begin charter`
- Cancel: `Continue as sandbox` / `Back`

### Open questions

*Resolved 2026-04-28: prestige model is Charter pick + modest carryover (R44). Charter v1 catalog ~6–8 hand-authored. Mining / Tanker / Logistics / Frontier / Settler examples drafted in `GAME_DESIGN.md`.*

- Exact carryover ratios (% research, % recipe knowledge) — playtest territory.
- Whether the solar system layout reshuffles per prestige (P3) — tradeoff: novelty vs. mastery transfer.
- Charter catalog beyond v1 ~6–8 (P3) — expansion territory.
- Sandbox-mode entry gating: free from start vs. unlocked after first prestige (P3 — lean: free from start with a "scoreboard mode" toggle for prestige earners).

---

## Quests (Daily / Weekly)

**Goal:** give players a reason to open the app daily and a reason to think about the week ahead. Hand-authored content (R40), parameterized by current state.

**Anchors:** Ops daily-quest card, Milestones weekly-arc preview, Quest Detail Sheet.

### Step-by-step (daily)

| Step | Surface | Action |
|------|---------|--------|
| 1 | Daily reset | At 00:00 player local time, daily quest pool rolls. 1 daily selected from the v1 hand-authored template pool (8–12 templates covering T0–T2; full ~30–50 target deferred to Stage 4 playtest signal — R66), parameterized by current state (resource name, body name, count). Examples: `Sell 50 Refined Metal today` / `Build first Greenhouse on a NEA` / `Run 3 routes through Lunar Habitat`. |
| 2 | Ops | Daily-quest card surfaces at top of Ops with title + progress bar + reward (`+$200, +1 Charter Shares preview`). Tappable to open Quest Detail Sheet. |
| 3 | Player gets going | Player tackles the quest passively (by playing normally) or actively (deliberately steering toward the goal). Progress updates in real time. |
| 4 | Completion | Quest marked complete; reward auto-credits; brief banner (`Daily quest done · +$200, +1 Charter Shares preview`). |
| 5 | Already done | Card collapses to a single-line summary (`Daily quest complete · resets in 14h 22m`). |

### Step-by-step (weekly arc)

| Step | Surface | Action |
|------|---------|--------|
| 1 | Weekly reset | At 00:00 Monday player local time, weekly arc rolls. 1 arc selected from the v1 hand-authored arc pool (2 arcs covering T0–T2; full ~5–8 target deferred to Stage 4 playtest signal — R66), tier-gated. Example: `Reach Comfortable pop tier on First Habitat by Sunday`. |
| 2 | Ops + Milestones | Weekly arc card surfaces in Ops (collapsed below daily) and Milestones (full progress block). |
| 3 | Player works toward goal | Multi-day commitment. Progress visible across the week. |
| 4 | Completion | Reward = larger Charter Shares preview drip + occasional one-shot unlock (cosmetic, sandbox toggle, etc.). |
| 5 | Failure | If not completed by reset, arc archives without reward. No penalty. Next arc rolls. |

### State changes

- `quests.daily_active = {template_id, params, progress, reward, reset_at}`
- `quests.weekly_active = {arc_id, progress, reward, deadline}`
- On complete: `player.charter_shares_preview += reward`, `player.credits += credits_reward`

### Open questions

*Resolved 2026-04-28: hand-authored daily templates (~30–50) + hand-authored weekly arcs (~5–8). Reward shape: dailies = small credits + small Charter Shares preview drip; weeklies = larger Charter Shares preview + occasional unlocks (R40).*

- Daily reset clock anchor: player local 00:00 vs. 24h-since-claim. Default: player local for predictability.
- Weekly arc difficulty curve: tier-aligned, exact pacing needs playtest.

---

## Common Micro-Interactions

These are too small to deserve their own flow but worth listing as expected behaviors.

| Interaction | Behavior |
|-------------|----------|
| Switch map mode | Top-left segmented control on Map (`Default` / `Survey` / `Routes`). Persists per session. |
| Open settings | Cog icon in status bar (top-right). Opens a modal: audio, save management, notifications, account, help, tutorial replay. |
| Save management | Settings → Saves. Supports manual save, auto-save status (last save N min ago), import/export, slot switching. Cloud sync auto-only with status indicator (R55). |
| Notification permission ask | First time a critical-tier alert is about to fire AND the player has shown engagement (>30 min total play). Not on first launch. |
| PWA install prompt | After session 2, if not yet installed and platform supports. Single dismissible banner. |
| Empty-resource fallback | Any list view that's empty shows what would unlock content (e.g., Colonies at T0: "Unlocks at T1 — Lunar Foothold (gate progress: 124/200 metals sold)"). |
| No Pause / no Sim Speed | Real-time gates pacing. There is no time-stop or fast-forward control (R22, R34). All alerts and events are designed to be readable at human pace (no sub-minute urgency, per `GAME_DESIGN.md` Failure Modes corollary). |

---

## Open Questions Across Flows

Most flow-level open questions are resolved (see `DECISIONS.md` R22–R59 for the resolution log). Remaining items are deferred to playtest or strategic late-game:

- **Tier-up flavor text length and voice tuning** (P3): voice locked terse-corporate (R18); specific copy still authored.
- **Daily quest reset clock** (P2): player local 00:00 vs. 24h-since-claim. Default: player local.
- **Weekly arc difficulty curve** (P3): tier-aligned, exact pacing needs playtest.
- **Prefab Kit visibility at lower tiers** (P2): locked-and-shown vs. hidden until unlock — drives forward momentum if shown.
- **One-tap "+1" repeat-buy for ships** (v2): nice-to-have UX polish.

All other flow-level questions previously listed (FTUE first sale, AFK voice/units, build time/footprint, re-scan cost, claim limit, ship delivery, repeat UI, window rules, Prefab Kit quantity) are resolved.
