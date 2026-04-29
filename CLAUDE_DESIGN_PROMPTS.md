# Void Yield 2 — Claude Design Prompts

Copy-paste prompt set for **Claude Design** (Anthropic Labs, launched April 2026). Generates the full UI surface from the locked spec in `UI_VIEWS.md`, `UX_FLOWS.md`, and `DECISIONS.md`.

## How to use this file

1. **Start a new Claude Design project.** During onboarding, point Claude at the four spec docs (`GAME_DESIGN.md`, `UI_VIEWS.md`, `UX_FLOWS.md`, `DECISIONS.md`) so the design system seeds correctly.
2. **Paste the [Session Preamble](#session-preamble) once at the start of the conversation.** It seeds the visual direction, voice, terminology, and locked interaction rules. Don't re-paste it for follow-up prompts in the same session.
3. **Paste the per-view prompts in any order.** Each is self-contained relative to the preamble. Each ends with a "show me 2–3 variants" instruction, per Claude Design's recommendation that comparing alternatives beats guessing.
4. **For iteration**, the [Iteration Prompts](#iteration-prompts) section has reusable phrasings.
5. **Export when ready** to standalone HTML (best for handoff to Claude Code) or PNG for a concepts library.

## Order of operations (suggested)

Build mocks in this order to match the natural T0 build slice:

1. Session Preamble (once)
2. Map (anchor screen — sets the visual language for the rest)
3. Body Detail Sheet (cross-cutting; gets reused everywhere)
4. Ops (the 90-second-check-in screen)
5. Production
6. Fleet
7. Build Drawer modal
8. Buy Ship modal
9. Trade
10. Colonies (T1+ — mock the full state, locked-state can be a single "Unlocks at T1" placeholder)
11. AFK Return modal
12. Tier-Up modal
13. Survey Region Picker
14. Milestones, Research (light mocks last)

Mobile variants of Map, Ops, Production, Fleet, Colonies are the priority responsive set. Trade, Research, Milestones can ship desktop-first at v1.

---

## Session Preamble

> Paste this once at the start of the Claude Design session.

```
Project: Void Yield 2 — a browser-based incremental production-chain builder set across the solar system. Anno 1800 + Paragon Pioneers in space, with idle throughput. Player runs a private space corporation, surveys asteroids, builds production chains, ships goods, grows colonies, transitions through 8 named tiers (T0 Wildcatter → T7 System Corporation), and eventually prestiges.

DESIGN SYSTEM TO ESTABLISH

Visual direction (locked):
- Map and visual canvas: "Dark Orbital Command" — dark navy/graphite UI, cyan route arcs, amber warning chips, green stable chips, off-white/pale-steel readouts. Strongest space-command mood.
- Management panels (lists, tables, settings): "Hybrid Corporate Logistics" — dark visual core with light management surfaces, strong tables, KPI-style readouts, throughput language. Best candidate for long-session readability.
- Tone: optimistic hard sci-fi. Measured, professional, NASA-industrial. Not gritty, not military, not playful.
- Density: medium-dense. Real management software vibes. Not corporate SaaS bloat, not gamey-cartoon.

Voice (locked — TERSE-CORPORATE):
- Sentence-case. Numbers leading. Verbs minimal. No NPC dialogue, no character voices, no "Welcome back!" warmth.
- Examples (use this style verbatim where relevant):
  - "First Habitat — O2 at 18%, importing recommended"
  - "Hauler-1 idle at Earth dock"
  - "T1 ready: Lunar Foothold available"
  - "NEA-04 storage at cap · Refined Metal full"
  - "+$2,304 net · 4h 12m away"
- AVOID: "OXYGEN LOW!" all-caps shouting, "Hey there!", "Looks like…", any dialogue with characters.

Cross-cutting interaction rules (locked):
- Detail surface = bottom sheet on BOTH desktop and mobile (no right-rail inspector). Drag to peek (~25%) / half (~55%) / full (~90%). Pinnable on desktop.
- Confirm-vs-commit rule: confirmation dialog appears ONLY when an action is (irreversible) OR (single-action spend ≥ 25% of current credits). Otherwise single-tap commit. Don't show confirmation dialogs on routine actions.
- One interaction language across desktop and mobile. Same selection model, same nav, same detail surface. Only layout density adapts.
- Per-body warehouse: every celestial body has ONE shared stockpile; buildings on a body draw from it. Routes go warehouse → ship → warehouse. No belt-routing UI.

Cargo classes (locked at v1):
- Solid (ore, metals, modules) — solid haulers carry these.
- Fluid/gas (water ice, hydrogen fuel, oxygen, spirits) — tankers carry these.
- NO passenger class at v1. Population auto-spawns when life support is met.
- Combined hulls have FIXED MIXED SLOTS (e.g., "30 solid + 20 fluid"). Specialized hulls are single-class at full capacity.

Tier ladder content (T0–T2 has full content; T3+ is named-only):
- T0 Wildcatter — Earth orbit + 1 NEA. Recipes: Small Mine, Ice Mine, Smelter, Electrolyzer, Probe Bay.
- T1 Lunar Foothold — Lunar orbit station habitat. Adds: Lunar Surface Mine, Aluminum Refinery, Construction Yard, Habitat Assembler, Greenhouse, life-support draws.
- T2 NEA Industry — Multiple NEA mining sites. Adds: NEA Mine variants (Nickel/Carbon/Silicates), Hydroponics Bay, Glass Furnace, Carbon Mill, Pressure-Valve Forge, Textile Mill, Furnishings Workshop, Distillery.
- T3+ named-only.

Resources at v1 (T0–T2): Iron Ore, Water Ice, Refined Metal, Hydrogen Fuel, Oxygen, Lunar Regolith, Aluminum, Construction Materials, Food Pack, Habitat Module, Nickel Ore, Carbonaceous Ore, Silicates, Pressure Valves, Habitat Glass, Carbon Mesh, Textiles, Furnishings, Spirits, Hydroponic Yield. (~20 distinct goods.)

Ship hulls at v1 (T0–T2): Hauler-1 (T0 specialized solid, 30 solid slots), Mixer-1 (T0 combined, 20s+10f), Tanker-1 (T1 specialized fluid, 25 fluid), Hauler-2 (T2 specialized solid, 75 solid), Tanker-2 (T2 specialized fluid, 60 fluid), Mixer-2 (T2 combined, 45s+25f).

Navigation (8 destinations):
- Map (anchor — also contains Survey, Routes, Heat modes)
- Ops (daily check-in / alert hub)
- Production (build placement and chain view)
- Fleet (ship list and management)
- Colonies (habitat list, life support, growth tier)
- Trade (Earth market, Earth Prefab Kits, contracts)
- Research (tech tree)
- Milestones (tier ladder, prestige)

Mobile bottom-nav (5 slots): Map / Ops / Production / Fleet / More. Colonies, Trade, Research, Milestones live under "More" until promoted by alert badging.

Persistent surfaces:
- Top status bar: credits, key resources, People Capacity (T1+), alert count, sim speed (Pause/1×/2×/4×), game time, settings cog.
- Body detail sheet: opens on body select from any screen. Tabs: Overview / Buildings / Storage / Ships / Routes / Notes. Action toolbar: Build Here / Send Ship / Plan Route / Survey / Pin.
- Alert system: severity tiers — critical (red, e.g., pop suspension imminent), warning (amber, e.g., need < 25%), info (blue, e.g., tier-up ready). Each alert has a primary action button that resolves in-place when possible.

Audience:
- Primary: solo players, age 25-50, who play Anno-likes or idle games. Comfortable with management UI density. Hybrid session cadence — short check-ins (90s) + long sessions (15-60 min).
- Equally on desktop and mobile. Same player can play exclusively on either.

For every prompt below, please:
1. Generate the requested screen at sketch fidelity.
2. Use the locked voice for any text.
3. Use the locked color direction.
4. When asked for variants, show 2-3 alternatives that explore meaningfully different layout choices — not just color tweaks.

Acknowledge this preamble and ask for the first screen prompt.
```

---

## Per-View Prompts

### 1. Map (anchor screen — Default mode)

```
Generate the Map screen, the anchor of Void Yield 2. This is the player's first answer to "what's going on right now?" — the spatial canvas where every body-level action begins.

LAYOUT (desktop):
- Top status bar: credits ($12,480), key resources (Refined Metal 38, Hydrogen Fuel 120, Water Ice 12, Oxygen 30), alert count (2), sim speed (1× selected, with Pause/1×/2×/4× segmented), game time, settings cog.
- Left rail navigation: 8 icons + labels — Map (selected), Ops, Production, Fleet, Colonies, Trade, Research, Milestones.
- Center workspace: large dark orbital canvas. Earth (anchor, lower-left), Moon (small, near Earth), one NEA labeled "NEA-04" with a small ore/water indicator, ship icons mid-arc on a route arc going from NEA-04 to Earth.
- Map mode selector (top-left of canvas): segmented control with Default (selected) / Survey / Routes / Heat.
- Mini alert sidebar (left edge of canvas, collapsible): 2 alert cards visible: "First Habitat — O2 at 18%, importing recommended" with [Import 50] button, and "NEA-04 storage at cap · Refined Metal full" with [Add Hauler] button.
- Active fleet strip below canvas: 3 ship rows — "Hauler-1 · in transit · NEA-04 → Earth · ETA 8m 20s", "Tanker-1 · idle · Earth dock", "Probe-1 · surveying · NEA-12".
- Sim speed control top-right of canvas.

CONTENT specifics:
- Route arcs: cyan when in good window, white neutral, amber poor. The NEA-04 → Earth arc should be cyan.
- Body labels small but readable. NEA-04 has a dim resource indicator dot.
- Ships on routes: small triangles pointing in direction of travel.
- Status bar: credits flash green when increasing. Alert count badge color: red (critical) when hovered/expanded.

AUDIENCE: management software user comfortable with medium-density UI.

RESPONSIVE: desktop primary (1280–1920 wide). The mobile variant is requested separately.

Show me 2–3 variants exploring different ways to balance the orbital canvas with the management panels — e.g., (a) canvas dominant with thin side panels, (b) canvas + persistent status sidebar, (c) canvas + bottom strip.
```

### 2. Map (mobile)

```
Generate the Map screen for mobile (390px wide reference, portrait).

LAYOUT:
- Top sticky status bar (compressed): credits, fuel, alert count. Tap-to-expand affordance hinted (small chevron).
- Map mode selector (segmented control under status bar): Default / Survey / Routes / Heat.
- Orbital canvas: dominant, fills middle of screen.
- Left edge peek-sheet for alerts: slim drawer showing 1 alert + "tap to expand" handle.
- Bottom-edge peek-sheet for active fleet: slim drawer showing top idle/in-transit ship + handle.
- Bottom tab bar (5 slots): Map (selected) / Ops / Production / Fleet / More.

CONTENT: same Earth + Moon + NEA-04 + Hauler-1 in transit. Single visible alert: "First Habitat — O2 at 18%".

GESTURES (visual hint, not interactive): pinch-to-zoom, drag-to-pan. Tap-and-hold-<120ms = select; longer = context menu.

Show me 2 variants — one with canvas at ~70% screen height, one with canvas at ~85% (richer alerts/fleet drawers vs. more map real estate).
```

### 3. Body Detail Sheet (cross-cutting bottom sheet)

```
Generate the Body Detail Sheet — a bottom sheet that appears when the player taps a body from any screen. This is the universal selection-result surface, used identically on desktop and mobile.

CONTEXT: appears as an overlay sliding up from the bottom of the screen. Drag handle at top. Three snap heights: peek (~25% screen), half (~55%), full (~90%). On desktop, also has a Pin toggle to keep open across screen changes.

LAYOUT (showing the half-height state):
- Top: drag handle, body name "NEA-04" with "Asteroid · Surveyed" badge, distance/window indicator ("Earth window: improving +2%/min").
- Action toolbar (icon buttons + labels, horizontal scroll if needed): Build Here / Send Ship / Plan Route / Survey / Pin.
- Tab strip (segmented, scrollable): Overview / Buildings / Storage / Ships / Routes / Notes.
- Tab content (Overview selected):
  - Surveyed resources block: "Iron: High · Water: Low · Nickel: Medium · Confidence 62%"
  - Warehouse summary: "Iron Ore 84/300 · Refined Metal 38/120"
  - Buildings on body: "2 Small Mines · 1 Smelter"
  - Ships docked: "(none currently)"

VOICE: terse-corporate. No exclamation. Sentence-case where it's labels.

Show me 2 variants — (a) compact information density with smaller type, (b) airy spacing with larger touch targets.
```

### 4. Ops

```
Generate the Ops screen — the 90-second-check-in destination. A hurried player should be able to keep their operation healthy from this view alone, on desktop or mobile.

LAYOUT:
- Top status bar (same as Map).
- Hero section: "Critical Alerts" (max 3 cards visible). Each card shows severity icon (small colored dot, not shouty), title + body in terse-corporate voice, primary action button, and a "jump to source" chevron.
  - Card 1 (red dot): "First Habitat — O2 at 18%, 1.7h reserve" / [Import 50 from Earth] / chevron
  - Card 2 (amber dot): "Hauler-1 idle at Earth dock" / [Auto-assign to NEA-04 → Earth] / chevron
  - Card 3 (amber dot): "NEA-04 storage at cap · Refined Metal full" / [Add Hauler] / chevron
- AFK Return Summary card (collapsible, currently expanded):
  - Header (hero): "+$2,304 net · 4h 12m away"
  - Body bullets: "+480 ore · +192 metals · +24 fuel · 4 deliveries sold"
  - "What stopped" rows: "NEA-04 storage at cap — 1h 42m" / "Hauler-1 idle — 38m"
  - Primary CTA: [Resolve top issue]
- Idle Ships section: 1 row — "Hauler-2 · Earth · idle 12m" with [Auto-assign] and [Manual assign] buttons.
- Production Hot List: 3 rows — "Smelter (NEA-04) · 4.0 metal/min · ok", "Lunar Mine (Moon) · idle · no power · [Investigate]", "Electrolyzer (Moon) · 1.5 fuel/min · input low".
- Resource Bottlenecks: 2 rows — "Refined Metal (NEA-04) · 118/120 · 98%", "Water Ice (Moon) · 8/200 · 4% — risk in ~22m".
- Active Routes summary: "3 active · 0 paused · Avg fuel 1.05× · ETA next: 8m 20s · [View all]"
- Sticky bottom CTA: [Resolve top issue]

VOICE: every line uses terse-corporate. No shouting caps anywhere.

Show me 2-3 variants exploring how to handle the AFK Return Summary's prominence: (a) Summary at top hero position, alerts below; (b) alerts at top, summary as a peek-sheet; (c) summary as a dismissible modal that appears once on app-open and Ops shows alerts directly.
```

### 5. Production

```
Generate the Production screen — the chain-design and build-placement workspace. Where players go when they're optimizing, not reacting.

LAYOUT (desktop):
- Body selector at top: dropdown showing "NEA-04" selected with chevron; nearby bodies as quick-switch chips ("Earth · Moon · NEA-04").
- Main area split: chain view (left, dominant) + building list (right, ~30% width).
- Chain view: visual graph with nodes. Show this chain:
  Small Mine ×2 → Iron Ore (84/300) → Smelter ×1 → Refined Metal (38/120) → Earth route arrow
  Ice Mine ×1 → Water Ice (12/100, low)
  Edges colored: green when flowing, amber when slow, red when stalled. Iron Ore edge to Smelter is green; Water Ice level is low (amber edge to nowhere yet).
- Building list (right):
  - Small Mine #1 · 20 ore/min · ok · [Pause] [Demolish]
  - Small Mine #2 · 20 ore/min · ok · [Pause] [Demolish]
  - Smelter #1 · 8 metal/min · ok · [Pause] [Demolish]
  - Ice Mine #1 · 8 ice/min · ok · [Pause] [Demolish]
  - + Add Building (CTA, prominent, opens Build Drawer)
- Storage Panel as a tab to the right of building list: small bars showing fill levels.

CONTENT specifics:
- Chain nodes are circles or rounded rectangles with a small icon. Resource nodes show current/cap.
- The "+ Add Building" CTA is a primary button.

VOICE: terse-corporate. "ok" lowercase, not "OK" or "GOOD".

Show me 2 variants — (a) horizontal chain flow left-to-right, (b) tree/branching layout that scales better for multi-output buildings like the Electrolyzer (Water Ice → Hydrogen Fuel + Oxygen).
```

### 6. Fleet

```
Generate the Fleet screen — the ship management table.

LAYOUT (desktop):
- Top status bar.
- Hangar Summary readout: "4 ships · 2 specialized solid · 1 specialized fluid · 1 combined".
- Filter bar: status filter (dropdown showing "All"), family filter (dropdown), sort dropdown (by Name), sort direction toggle.
- [Buy Ship] CTA top-right.
- Ship table — 5 rows:
  - Hauler-1 · solid icon · 30 solid · in transit · NEA-04 → Earth · ETA 8m 20s · [Reassign] [Recall]
  - Hauler-2 · solid icon · 75 solid · idle · Earth dock · 12m idle · [Reassign] [Recall]
  - Tanker-1 · fluid icon · 25 fluid · idle · Earth dock · — · [Reassign] [Recall]
  - Mixer-1 · combined icon · 20s+10f · loading · NEA-04 · — · [Reassign] [Recall]
  - Probe-1 · specialist icon · — · surveying · NEA-12 · 3m 40s · [Recall]

CONTENT specifics:
- Status icon colors: cyan for in transit, amber for idle, neutral for loading/unloading.
- Long-press on a row enters multi-select; show a hint at bottom like "Long-press a row for batch actions".

VOICE: terse-corporate.

Show me 2 variants — (a) traditional dense table with inline action buttons, (b) card-based layout with each ship as a small card.
```

### 7. Colonies

```
Generate the Colonies screen for a T1+ player who has 1 habitat established (Lunar Foothold).

LAYOUT:
- Colony list at top: chip rail with "Lunar Foothold" selected. (Only one colony at this stage.)
- Selected colony detail dominant:
  - Header: "Lunar Foothold" / "Population 32 / Cap 50" / Pop Tier: Survival.
  - Pop tier visual (horizontal): Survival ✓ → Settled (in progress, 4/10 inputs) → Growing (locked) → Comfortable (locked) → Affluent (locked).
  - Life support bars (3 rows, vertical):
    - Water · 87% · 8.4h reserve · [stable, green bar] · no action button
    - Oxygen · 18% · 1.7h reserve · [warning, amber bar] · [Import 50]
    - Food Pack · 64% · 5.1h reserve · [stable, green bar] · no action button
  - Effective People Capacity: "32 (1:1 with pop at T1)"
  - Growth-tier bundle (for Settled): two rows with progress bars:
    - Construction Materials: 3 / 8 (filling)
    - Habitat Module: 0 / 2 (empty)
- Action toolbar: [Build Building Here] / [Inspect Habitat Layout]
- Buildings on this colony (collapsible nested list at bottom): Habitat Assembler #1 · 1 module/8min · ok.

CONTENT:
- The "Oxygen low" state should be visually salient — amber bar with subtle pulse, "Import 50" button prominent.

VOICE: terse-corporate, sentence-case.

Show me 2-3 variants — (a) life support bars as the visual hero, (b) pop-tier visual as the visual hero, (c) bundle progress as the visual hero. The variants test which screen layout best communicates "what unlocks next?"
```

### 8. Trade

```
Generate the Trade screen — Earth market, Earth Prefab Kits, contracts, account.

LAYOUT (desktop):
- Top status bar.
- Tab strip: Earth Market (selected) / Earth Prefab Kits / Contracts / Account.
- Earth Market table with columns: Resource / Earth Buy / Earth Sell / Owned / Last 24h Net / Quantity input / [Buy] / [Sell].
- 5 rows:
  - Iron Ore · 3 · 1 · 84 · +480 · [- 0 +] · [Buy] · [Sell]
  - Refined Metal · 18 · 12 · 38 · +192 sold · [- 0 +] · [Buy] · [Sell]
  - Water Ice · 4 · 2 · 12 · — · [- 0 +] · [Buy] · [Sell]
  - Hydrogen Fuel · 8 · 5 · 120 · — · [- 0 +] · [Buy] · [Sell]
  - Oxygen · 6 · 3 · 30 · -2 sold · [- 0 +] · [Buy] · [Sell]

CONTENT:
- Buttons disabled when input qty is invalid (no quantity, or qty exceeds owned for sell, or qty exceeds affordable for buy).
- "Last 24h Net" column is informational only.

Show me 2 variants — (a) one row per resource with all controls inline, (b) clickable resource rows that open a side panel for detailed buy/sell controls.
```

### 9. Research (light)

```
Generate the Research screen — tech tree across 4 branches (Logistics / Industry / Life Support / Exploration).

LAYOUT:
- Top status bar.
- Branch tabs: Logistics (selected) / Industry / Life Support / Exploration.
- Tree visual main area: ~6-8 nodes for the Logistics branch at T0-T2 reachable depth. Some completed (filled), some available (outlined), some locked (grayed). Connecting lines show prerequisites.
- Active Research Queue (right sidebar): currently empty state, "No active research. Tap a node to queue." with subtle nudge.
- [Reset View] button top-right of tree.
- Node detail panel (peek state at right): just header "Tap a node to inspect."

VOICE: terse-corporate.

Show me 2 variants — (a) tree flowing left-to-right with branches laid out cleanly, (b) hub-and-spoke with the current tier at the center.
```

### 10. Milestones (light)

```
Generate the Milestones screen — tier ladder progress and tier-up gate visualizer.

LAYOUT:
- Top status bar.
- Tier ladder visual at top (horizontal strip): T0 Wildcatter (current, highlighted) → T1 Lunar Foothold (next) → T2 NEA Industry (locked) → T3-T7 (compressed locked).
- Current tier detail: "T0 — Wildcatter. Unlocked: ship surveying, basic mining, Earth metal sales."
- Next-Tier Gate section (the visual hero):
  - "T1 Lunar Foothold gate"
  - Sell 200 Refined Metal to Earth: progress bar showing 124/200 (62%) · [Open Trade]
  - Hydrogen Fuel reserves: progress bar showing 38/50 (76%) · [Open Production]
- Completed milestones list (small): ✓ First survey · ✓ First mine built · ✓ First refined metal sold.
- Claim CTA: disabled, "Complete all gates to claim T1".

VOICE: terse-corporate.

Show me 2 variants — (a) horizontal tier ladder + vertical gate progress, (b) vertical tier ladder + horizontal gate progress with prominent claim CTA.
```

---

## Modal Prompts

### 11. AFK Return Modal

```
Generate the AFK Return modal — the most important moment in an idle game. Appears full-screen on app-open after the player has been away ≥60s. Cannot be skipped without acknowledging.

LAYOUT (full-screen modal, dismissible only via primary CTA or Continue):
- Top hero header: "+$2,304 net" in large numerals, "4h 12m away" in smaller subtitle. This is the satisfying number — the dopamine hit.
- "What happened" section: 5 lines, raw counts not credit-normalized:
  - +480 ore mined
  - +192 metals refined
  - +24 fuel produced
  - 4 deliveries sold to Earth
  - 1 event auto-resolved (equipment fault, Smelter)
- "What stopped" section: ranked list of stalls, each tappable for jump-to-fix:
  - NEA-04 storage at cap — 1h 42m  (chevron)
  - Hauler-1 idle — 38m  (chevron)
  - First Habitat O2 low — 12m  (chevron)
- Population delta (T1+ rendering): "+8 pop at First Habitat · 0 suspended"
- Primary CTA at bottom: [Resolve top issue] — full-width or near-full-width.
- Secondary: [Continue] — text link, smaller, dismisses to Ops.

VOICE: terse-corporate. NO "Welcome back!", NO "Hey there!", NO preamble. Just the number, then the facts.

Show me 2 variants — (a) full-screen modal with hero readout dominant, (b) compact modal that's smaller (~75% screen) but more scannable.
```

### 12. Tier-Up Modal

```
Generate the Tier-Up modal — appears when the player taps "Claim T1 Lunar Foothold" from Milestones. Locked at v1 as a plain modal, NOT a cinematic moment.

LAYOUT (full-screen modal):
- Tier name as the hero: "T1 — Lunar Foothold"
- Flavor text (~30-50 words, terse-corporate, NASA-industrial measured tone, NOT character dialogue): "Lunar orbit station online. Habitat module deployed. Local Earth supply line established. Operations cleared to mine lunar regolith and assemble construction materials on-site."
- Newly unlocked items list (sectioned):
  - Recipes: Lunar Surface Mine, Aluminum Refinery, Construction Yard, Habitat Assembler, Greenhouse
  - Ships: Tanker-1 (specialized fluid)
  - Earth Prefab Kits: Lunar Habitat Module Kit, Lunar Surface Mine Kit
- Single primary CTA: [Begin] — full-width.

VOICE: terse-corporate. The flavor text reads as a status briefing, not as story narration.

Show me 2 variants — (a) tier name centered hero with unlocks below in cards, (b) tier name top-left, unlocks as a scannable bulleted list, more "operational briefing" feel.
```

### 13. Buy Ship Modal

```
Generate the Buy Ship modal — opens from Fleet's [Buy Ship] CTA or via deep-link from Ops "Add Hauler" alert.

LAYOUT (modal overlay, ~75% screen on desktop, full-screen on mobile):
- Header: "Buy Ship — Earth Trade"
- Tier-eligible hulls grid (T2 player view — all 6 hulls visible):
  - Hauler-1 · Specialized Solid · 30 solid · 1.0× speed · 1.0× fuel · $3,000 · Owned: 1 · [Buy]
  - Mixer-1 · Combined · 20s + 10f · 0.95× speed · 1.05× fuel · $4,200 · Owned: 1 · [Buy]
  - Tanker-1 · Specialized Fluid · 25 fluid · 0.9× speed · 1.1× fuel · $4,800 · Owned: 1 · [Buy]
  - Hauler-2 · Specialized Solid · 75 solid · 1.1× speed · 1.3× fuel · $9,500 · Owned: 1 · [Buy]
  - Tanker-2 · Specialized Fluid · 60 fluid · 1.0× speed · 1.4× fuel · $11,500 · Owned: 0 · [Buy]
  - Mixer-2 · Combined · 45s + 25f · 1.0× speed · 1.4× fuel · $12,500 · Owned: 0 · [Buy]
- [Compare] toggle that switches view to side-by-side stat comparison.
- Close (X) top-right.

CONTENT:
- Each card has an iconographic representation of slots (e.g., Mixer-1 shows two cargo bays, one labeled "S 20", one "F 10").
- Buy buttons trigger confirm popover only when spend ≥ 25% of current credits (per global confirm rule).

Show me 2 variants — (a) grid of equally-sized cards, (b) larger emphasis on combined hulls (since they're a unique design) with specialized hulls as smaller cards.
```

### 14. Build Drawer (slide-up sheet)

```
Generate the Build Drawer — opens when player taps [+ Add Building] in Production, or [Build Here] from a Body Sheet.

LAYOUT (slide-up sheet from bottom of Production screen):
- Drag handle + title: "Build on NEA-04"
- Category filter chips: All (selected) / Mining / Refining / Life Support / Construction.
- Recipe cards (T0 visible, T1+ shown locked):
  - Small Mine · $800 · 30s build · footprint 1 · "→ 10 Iron Ore / 30s" · [Build]
  - Ice Mine · $900 · 30s build · footprint 1 · "→ 8 Water Ice / 40s" · [Build]
  - Smelter · $1,500 · 90s build · footprint 1 · "5 Iron Ore → 2 Refined Metal / 45s" · [Build]
  - Electrolyzer · $1,200 · 60s build · footprint 1 · "4 Water Ice → 3 H₂ + 1 O₂ / 60s" · [Build]
  - Probe Bay · $2,000 · 120s build · footprint 1 · "Survey time → asteroid data" · [Build]
  - Lunar Surface Mine · LOCKED · "Unlocks at T1 — Lunar Foothold"
  - Refinery (Aluminum) · LOCKED · "Unlocks at T1"
  - (more T1/T2 recipes shown locked, dimmed)
- Cancel button or drag-down to dismiss.

CONTENT:
- Locked recipe cards are dimmed but readable, with the unlock-tier label prominent.
- Each available recipe shows its cycle output as part of the card (the "what you get" preview).

VOICE: terse-corporate.

Show me 2 variants — (a) cards in a grid (more browsable), (b) cards as horizontal-scrolling rows by category (more focused).
```

### 15. Survey Region Picker (full screen)

```
Generate the Survey Region Picker — full-screen workspace that opens when the player switches Map to Survey mode and taps a region. Survey is SETUP-ONLY (no active scanning minigame); the player picks a region + probe focus, then probe time elapses idle.

LAYOUT (full screen):
- Header: "Survey: Near-Earth Search"
- Region map (left, dominant): zoomed view of the search region with tappable region tiles. 3 unsurveyed bodies indicated as "?" markers; 1 surveyed (NEA-04) showing readings.
- Probe focus segmented control (right): Composition (selected) / Orbit / Hazard. Each shows an icon and a one-line explanation.
- Estimated scan time readout: "3m 40s with current focus" (informational).
- Probe Bay queue indicator (top-right): "1 of 1 probe ready"
- [Begin Scan] primary CTA bottom-right (full-width on mobile).
- [Cancel] / back arrow top-left.

CONTENT:
- Surveyed body NEA-04 shows: "Iron: High · Water: Low · Confidence 62%"
- Unsurveyed bodies just show "?" with no readings.

Show me 2 variants — (a) split view 60/40 with map dominant, (b) map full-width with focus selector as a horizontal strip below it.
```

---

## Iteration Prompts

Reusable phrasings for refining mocks. Borrow these verbatim — Claude Design's docs note that specific feedback ("tighten spacing to 8px") works better than vague feedback ("doesn't look right").

### Tightening density

```
The [Production / Fleet / Trade] screen feels too sparse. Tighten the row spacing to ~6-8px between rows, reduce the vertical padding inside cards by ~30%, and use a smaller-but-still-readable font for secondary metadata. Keep primary action buttons at touch-target size (≥44px tappable area).
```

### Voice cleanup

```
Replace any all-caps alert text with sentence-case, terse-corporate voice. Examples: "OXYGEN LOW" → "First Habitat — O2 at 18%, importing recommended". "STORAGE FULL" → "NEA-04 storage at cap". No exclamation marks anywhere except in error states.
```

### Mobile parity

```
Generate the mobile variant of [screen]. Same content, same voice, same actions — but reflow for portrait 390px width. Use the bottom tab nav (Map / Ops / Production / Fleet / More). Detail surfaces become full-height bottom sheets. Touch targets ≥44px. Density slightly lower than desktop but not "spread thin."
```

### Variant exploration

```
Show me 3 variants of [screen] that explore meaningfully different layout choices, not color tweaks. Specifically vary how [the chain view / the alert hero / the colony bars] are positioned relative to the rest of the page. Label each variant with what it optimizes for ("dense scanning", "single-task focus", "comparative browsing", etc.).
```

### Empty / pinched / critical states

```
Generate the [screen]'s problem state, where [shortage X / stall Y / capacity Z is exceeded]. Use amber for warning, red for critical, lowercase descriptors. Keep the primary fix-it button prominent and avoid layout shift compared to the healthy state.
```

### Locked-mode placeholder

```
Generate the locked-state placeholder for the [Colonies / Research] screen at T0. Should clearly communicate "Unlocks at T1 — Lunar Foothold" with a small progress hint ("124/200 metals sold to Earth"). No spinner, no fake-content. The screen should feel anticipated, not broken.
```

### Confirm dialog

```
Generate the standard confirm dialog used when an action is (irreversible) OR (single-action spend ≥ 25% of current credits). Compact modal, single-line title, body shows the action being confirmed and the credit/state cost, two buttons: [Confirm] (primary) and [Cancel] (secondary). Dismissable via Cancel only — NOT by backdrop tap (per accidental-spend prevention).
```

---

## When to ship the mocks back to Claude Code

Once mocks are aligned, Claude Design exports a **handoff bundle**. Pass the bundle to Claude Code along with the locked spec docs (`UI_VIEWS.md`, `UX_FLOWS.md`, `DECISIONS.md`) for implementation. The bundle + docs together let Claude Code build with knowledge of both visual intent and interaction specs without re-deriving them.

Recommended handoff scope for a T0 vertical slice:
- Map (Default mode), Body Detail Sheet, Ops, Production, Fleet (table view), Trade (Earth Market only), Build Drawer, Buy Ship modal.
- Status bar, alert system patterns, confirm dialog.
- Skip for T0 build: Survey Region Picker (full feature is T1+), Colonies (T1+ unlock), Tier-Up modal (only fires at T0→T1 boundary), AFK Return modal (defer until sim runs), Research (light spec sufficient), Milestones (light spec sufficient).
