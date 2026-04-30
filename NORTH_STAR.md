# NORTH_STAR.md — VoidYield 2

The load-bearing pitch document. Where GAME.md is the spec, this is the *fantasy* — the answer to "what is this game *for*, and who is it *for*?" When other docs drift on player-fantasy questions, this is the tiebreaker. When they drift on mechanics, GAME.md is.

---

## 1. The Pitch

A cozy, cumulative space-industry game where you turn your first asteroid mine into a solar-system corporation. You hand-place factories on small grids, route ships between bodies, and watch colonies grow from tents to networked cities. **Anno's chain-design rigor with Paragon Pioneers' calm tactility, in space** — playable in 5-minute glances or 60-minute sessions, on your phone or your desk, and you never lose a run to a missed alarm.

## 2. The Player Fantasy

You are the founder of **VOID YIELD CO.** — a small, optimistic mining outfit that grows into the backbone of human industry from low Earth orbit to Saturn.

The fantasy is *competent expansion*. Every shift you've done your part. Every check-in you've left things stronger. Every layout decision you've quietly improved on. You don't fight; you don't speculate; you don't grind; you build — and what you build keeps building when you're not there.

It is, deliberately, **the calmest possible space-empire fantasy**. The drama is internal: a Comfortable colony rolling over to Affluent at 3 a.m. while you slept; a Mixer-1 you laid out six hours ago finally completing its first round-trip with cargo from three bodies; the small thrill of *I knew that smelter would pay off*.

It is for the player who liked Anno but wanted the cycles to keep ticking after they put the game down. Who liked Universal Paperclips but wanted hands. Who likes Paragon Pioneers' clean, slow, warm aesthetic and wants more of *that* feeling, longer.

## 3. Reference Games

**Paragon Pioneers (primary — visual AND gameplay).** PP nails the texture we want: warm, rounded, mobile-first chunkiness; small grids that reward careful placement; chains that the player learns by *building*, not reading; a UI that prefers tapped tiles to dropdown forests. We borrow PP's *layout-as-decision*, its *bottom-sheet detail surface*, its *one-screen-at-a-time-feels-fine* density. The *vibe* of VoidYield 2 is "Paragon Pioneers, in space, with a corporate spine."

**Anno 1800 (secondary — gameplay).** Anno locks the loop shape: per-cycle batch recipes; tier-gated population that demands progressively richer goods; content gates that are *built*, not bought. The Anno DNA tells us when a tier is "real" — when the recipes the previous tier produced become *ingredients* for the next.

**What we are explicitly NOT.** Not Factorio (no belts, no train logistics, no combinator math). Not EVE (no markets, no PvP, no scarcity-as-design). Not idle gachas (no rolls, no pity, no FOMO). Not Universal Paperclips (no narrative cliff, no narrowing). Not Stellaris/4X (no diplomacy, no narrative branching, no civilizations).

## 4. The Gameplay Journey

The shape of "what you do" at four time scales. Each scale has its own pacing, its own surface, its own dopamine.

### 5–15 min — the daily tilt

Open the app. The **Ops** screen shows what needs you. An idle ship is sitting at NEA-04; you assign it a route. Oxygen at First Habitat hit 30%; you tap *import from Earth* and the alert clears. A daily quest is half-complete; you nudge a building's recipe and call it done. The AFK Return summary headlines **+$2,304 net · 4h 12m away**; the detail tells you what stopped (storage filled at 67% of away time — add a Silo next time). You close the app feeling like the universe got a little tidier on your watch.

This is the lens for *most* sessions. Five to fifteen minutes is the floor the design holds — every Ops view should have at least one meaningful one-tap action.

### 30–60 min — the layout session

You sit down. Production opens; the lunar habitat grid is pulled up; you're three Construction Materials short of unlocking the Habitat Glass chain. You delete an Aluminum Refinery you never use, drop a Glass Furnace next to your existing Silicates Mine for the +30% adjacency bonus, route a Mixer-1 to ferry the new Glass home. You set up a Maintain-Stock automation rule on Hydrogen Fuel because the lunar tank keeps draining at 2 a.m. You finish wanting to make one more move.

This is the **chain-design** lens. Production is the hero surface; the player is composing.

### ~5 h — the campaign session

You're tier-up shopping. T2 → T3 means either a Comfortable colony (settle-in 2h — you'll set it and walk) or two Growing colonies (faster, but harder to coordinate). You commit to the multi-colony path because you have three NEAs surveyed and three habitats deployed. You spend half the session laying out two new chains, half watching the timers and prodding bottlenecks. The tier-up modal arrives at hour 4:48; you stay for the new-region reveal — Cislunar Network unlocks, the rare-trace NEAs light up, and you start surveying for the next puzzle.

This is the **strategic** lens. Time horizon is the next gate; the player is engineering toward it.

### Full run — Wildcatter to System Corporation, 15–30 h to first prestige

The arc is **eight tiers**: T0 Wildcatter → T1 Lunar Foothold → T2 NEA Industry → T3 Cislunar Network → T4 Martian Reach → T5 Belt Operations → T6 Jovian Frontier → T7 System Corporation. Each tier is an unlocked region and a paradigm-shifting capability — first colony, fluid hulls, route automation, local shipbuilding, bulk haulers, long-range drives, endgame.

T7 is a **destination**, not a transition: 5–10 hours of unique content (Saturnian moons, outer-system probes, named milestones — *First IPO*, *Charter Signed*, *System Corporation Declaration*) before you choose to incorporate. Prestige is a **chapter break**, not a reset — you pick a Charter (Mining, Tanker, Logistics, Frontier, Settler, …) that mechanically modifies your next run, keep a sliver of research and recipe knowledge, and start over with new emphasis. Sandbox mode is always available for players who want to stay and build forever.

A full run is a season. Five to ten hours per "act" of the run, sustained over weeks of daily tilts.

## 5. The Six Core Systems

These are the six things the player learns to play, in roughly the order they unlock. **Each is a peer** — none is "main loop, others are accessories." A run that ignores any of them feels off.

### Surveying & Discovery

Every region is a search problem. Probes scan asteroids; data layers reveal composition, grid size, anchor resources. Surveying is **setup, not minigame** — you pick where to look, then the probe runs idle. Rare-trace NEAs (T3+) are uncommon (~15–20% of NEAs) and have to be hunted. Discovery is the engine of replay variety: every run rolls different grid sizes, different richness, different surprises.

This system is what makes the world feel *known* by you specifically. By hour 10 you remember NEA-04 as *the rich one* and NEA-12 as *the rocky 3×4 disappointment*.

### Production & Layout

Each body is a small grid (3×4 NEA → 7×7+ lunar habitat → Mars colony). You hand-place buildings; layouts have texture from **15–35% adjacency bonuses** within a 2-tile collaboration radius. Storage takes grid space, so deciding *what to omit* is a real choice. Recipes are per-cycle batches, Anno-style — every chain is countable, every bottleneck readable.

This is the **handcraft** system. The thing the player *makes*.

### Logistics & Fleet

Routes between bodies, up to 3 stops per route from T0. Specialized vs. combined hulls (Hauler / Tanker / Mixer). Cargo classes (solid, fluid/gas) with strict enforcement. Fuel is a per-body inventory, not flavor — a tank that runs dry strands ships. Window timing matters but never punishes (no sub-minute urgency anywhere; no Pause control needed).

This is the **circulation** system. The veins.

### Colonies & Population

Pop auto-spawns when life support is met, then climbs through six tiers — Survival, Settled, Growing, Comfortable, Affluent, Networked — each demanding richer goods (Pressure Valves, Textiles, Spirits, Comms Modules, Sensor Arrays) and granting more **People Capacity**, the staffing that gates concurrent buildings. Settle-in windows are tier-scaled (5 min → 8 h) so early dopamine is fast and late tiers build tension. AFK earns at most one tier transition per return — *the night the colony rolled over* is preserved as a moment, not collapsed into a single 24h leap.

This is the **patience** system. The thing that grows on its own when you treat it well.

### Expansion & Tier Progression

Eight named tiers from Wildcatter to System Corporation, gated by **content-built-not-bought** milestones with primary + alternate-fulfillment paths so a stuck chain doesn't park progress. Each tier unlocks a region and a paradigm-shifting capability. Tier transitions are the headline moments of a run — the *new region animated in* on the map is the dopamine hit a player chases for hours.

This is the **spine**. The reason a run has a shape.

### Automation & Prestige

From T3 onward, **Maintain-Stock** and **Surplus-Export** rules let the player offload dispatch micro. Each body needs an Automation Hub building to host rules; rules have throttles, optional window-preference toggles, and visible state. Late-game (T7+), **Incorporate** lets the player pick a **Charter** that mechanically reshapes the next run — not a flat multiplier, a *different game*. Modest carryover (research, recipes) keeps mastery; nothing essential transfers.

This is the **mastery** system. The reward for graduating from manual to architectural play, and the loop's open ending.

## 6. Visual & Interaction Language

**Aesthetic anchor: Paragon Pioneers + NASA documentary.** Soft, rounded, slightly chunky tiles. Warm sunlight on lunar regolith, cool steel-blue on Earth-orbit interiors, amber accent (`#D4A843`) and dark navy (`#0D1B3E`) per the locked palette. Buildings read at thumbnail size on a phone. Grids feel like *boards* — you want to hover before you place. The map is the emotional centerpiece: a stylized solar system, transfer windows colored as soft arcs (good / neutral / poor windows), bodies as readable silhouettes, no procedural shader fireworks.

**Single interaction language across desktop and mobile.** No right-rail-inspector pattern (lives on neither well); detail is always a **bottom sheet**. One nav language scales from 5-button mobile to 8-destination desktop. Map gestures are the same: tap to select, two-finger to pan/zoom, long-press for context. A player can start on mobile, finish on desktop — same save, same UI vocabulary. **True dual-target.**

**Animation budget: tiny, deliberate.** Buildings don't loop animations. Tiles snap on placement with a soft chunk. Route arcs draw in once. Tier-up plays a still-image modal, not a cinematic. Restraint is the visual signal of *this game respects your time*.

**Sound budget: low, unobtrusive.** Ambient room tone per body type (lunar quiet, NEA hum, orbital station whir). UI clicks are dry, not sparkly. No music track that demands attention; if one plays, it loops in long, slow phases — closer to a documentary score than a game OST.

**Mobile-first ergonomics.** Touch targets ≥44 px. Bottom sheet at 25% peek shows only the most useful summary; expanded sheet covers half-screen. Dense lists scroll at 60 FPS even on a 3-year-old phone. The PWA installs with one tap, and works backgrounded — your colony grows whether the app is foreground, backgrounded, or closed.

## 7. What Makes It Unique

- **vs. Anno:** AFK-friendly. Anno's chains stop when you close the game. Ours don't.
- **vs. EVE:** No markets, no PvP, no losing your ship to someone else's design. You play against the puzzle, not other players.
- **vs. Factorio:** No belt-routing micro. Layouts are decisions about *what*, not *how to wire*. The pleasure of placement without the friction of plumbing.
- **vs. idle gachas:** No rolls, no pity timers, no FOMO. Numbers go up because *you built the thing*, not because the slot machine landed.
- **vs. Universal Paperclips:** Has hands, not just numbers. The fantasy is *running* a corporation, not the philosophical end of one. Paperclips' arc closes; ours opens (and reopens, via Charters).
- **vs. Stellaris / 4X:** Smaller. Quieter. No diplomacy, no narrative branching, no civilizations to outwit. The game is the corporation; the universe is its workshop.
- **vs. Paragon Pioneers itself:** Bigger arc, bigger time horizons, deeper systems (automation, prestige, hybrid sessions), and a setting players haven't seen in this genre before.

**The actual differentiator:** *we are the only Anno-in-space, idle-friendly, true-dual-target, freemium-lite-ethical game.* Each ingredient exists in someone else's catalog; the **combination** is open.

## 8. Monetization Stance

**Freemium-lite.** The whole game is playable free, top to bottom, all 8 tiers, all base Charters, every system. No paywalled content, no time-gated unlocks, no energy meters, no ads in core flow. **We sell texture, not progress.**

### What we will sell

- **Cosmetics.** Alternate corp insignia, tile re-skins (e.g., a "Soviet Industrial" alternate visual mode, a "Retro Pulp Sci-Fi" mode), map themes. Visible to the player, invisible to the simulation.
- **Convenience.** Premium tier for passive cloud-save sync (free has local + manual export); 2nd save slot for parallel runs; fast-import from a previous run's seed.
- **Sandbox tools.** A *creative pack* that unlocks free placement, infinite credits, debug overlays — for the player who wants to design rather than play.
- **Supporter packs / scenarios.** One-shot purchases that unlock a hand-authored scenario (a fixed seed, a specific Charter pre-applied, a narrative wrapper). The closest thing to "DLC" we plan to ship.
- **Charter expansions.** Once the v1 catalog of ~6–8 Charters is exhausted, additional Charter packs are a natural expansion vector. Each pack adds new mechanical variety to a prestige run.

### What we will not sell

- **Speed.** No "skip the timer" buttons, no "instant complete" for buildings, no XP boosts. Speeding up an idle game is *selling pain we deliberately designed in*.
- **Power.** No ore-yield boosts, no extra automation slot purchases, no "unlock T3 early" packs. The progression curve is the game.
- **Loot boxes, rolls, gachas, mystery packs.** The opposite of cozy.
- **Notification spam.** Push budget is ≤3/day default, user-tunable down to zero. No engagement-baiting reminders.
- **Player data resale.** Telemetry is opt-in, anonymized, and stays in-house.

### The ethical floor

If removing the IAP would make the free game obviously worse, **we don't ship the IAP**. Free play is the product; paid play is grace notes.

This stance is a public commitment, not an internal aspiration. NORTH_STAR.md is checked into the repo. If a future build violates it, the contradiction is in the changelog.

## 9. Visual Concept Art Brief

Eight scenes, ranked by priority for downstream concept art. Each is a single composition; the brief describes camera, subject, mood, and execution notes. Style anchor throughout: **Paragon Pioneers + NASA documentary**.

### 1. First Asteroid — cold open hero shot

Three-quarter view of a small NEA, regolith brown-grey. Two soft yellow lights from a Small Mine and a Smelter. A **Hauler-1** (white-and-amber, snub-nosed) drifting away at lower-right; exhaust a thin pale-blue line back toward Earth (visible at upper-left as a soft blue circle). Mood: small, hopeful, *just-starting*. PP-style chunkiness — buildings read as toys, not industrial photographs.

**Use:** Steam capsule / Kickstarter hero / app-store screenshot 1.

### 2. The Lunar Foothold — first-time-somewhere

Three-quarter isometric of a 7×7 lunar habitat grid mid-build. Three Habitat Modules clustered with tube-walkways; a Greenhouse (translucent green-tinted dome) at one corner; a Refinery and a Construction Yard mid-cycle (small steam puff). Lunar surface mid-grey-tan. **Earth as a high-contrast blue-and-white shape rising at the horizon.** Population dot-counter overlaid in the corner reading 38 / 50. Mood: *the first time you feel like you're somewhere*.

**Use:** Steam screenshot 2 / app-store screenshot 2.

### 3. The Map — calmest commander view

Top-down stylized solar system. Earth, Moon, NEA cluster, Mars (barely visible at the edge). **Three route arcs draw between bodies** — one green (good window), one amber (neutral), one faded red ("Hauler-2 stranded — fuel: 0"). Soft star-field background, no procedural noise. UI overlay: time-of-game-day, an alert badge, the player's credits readout. Mood: *the calmest possible commander view*.

**Use:** Steam screenshot 3 / hero image for press articles.

### 4. The Bottom Sheet — mobile hero

Phone in hand, mid-tap on a Pop-Tier modal mid-Comfortable rollover — *the 3 a.m. tier-up moment*. Background blurred but enough city-light to convey *night, alone, satisfying*. UI on phone shows the modal headline `Lunar Habitat → Comfortable · +24 People Capacity` with a quiet `Continue` CTA. Mood: *what the daily tilt feels like*.

**Use:** App-store hero screenshot, Instagram/TikTok 1:1 anchor.

### 5. Mid-game Mars Foothold — we made it here

Mars surface mid-foreground, brick-red-and-rust palette. A first **non-Earth shipyard** built on Phobos at upper-left (a small angular truss + a half-finished hull silhouette). Two Maintenance Shops + a Sensor Lab nestled into the Martian habitat grid. A Tanker-2 in transit, lit warmly against the dark sky. Mood: *we made it here*.

**Use:** Steam screenshot 4 / Charter-pick screen background option.

### 6. Endgame Cislunar Network — automation banner

Node-graph view of the cislunar region — Earth at center, Moon, four NEAs all wired to a single Comms Module in the middle of the canvas. Faint pulse animations on the wires (call out as *animated in mock; static for art*). Below the graph, a UI panel showing **five active Maintain-Stock rules**, each ticking. Mood: *the network became larger than your attention, and it's fine*.

**Use:** T3 unlock teaching banner / press article on automation system.

### 7. The Saturn Plateau — quiet, vast, almost done

Wide-shot of Saturn's rings. A **Helium-3 extraction platform** mid-foreground (a long thin truss, drifting through the C-ring). A probe-class ship leaving frame at the upper-right. Palette: pale gold rings, deep blue gas-giant gradient. UI overlay: a single milestone bar — *Helium-3 Reserve: 4,200 / 5,000 t* — and the corner reads *Year 12*. Mood: *quiet, vast, almost done*.

**Use:** End-of-trailer beat / T7 unlock cinematic still / Charter-pick screen background option.

### 8. The 5-Star Reviewer — the player

Stylized illustrated portrait of a player at a cluttered desk: a phone propped on a stack of textbooks, a window streetscape behind, a small smile. Pull-quote overlay using the *Success Signal* line. Optional but powerful as a marketing asset.

**Use:** Steam page mid-fold / app-store screenshot 5 / Kickstarter video card.

## 10. Success Signal

A 5-star review we hope to read on the App Store / Steam in the year after launch:

> ★★★★★ — "I open it twice a day on the bus and once at night before bed. Some weeks I'll sit down and play for an hour, lay out a colony, set some routes, and feel like I made progress on something. Most days I'll just check on the corp, deal with one alert, and put it away. It's the only idle-style game I've kept playing past month one. The fact that it doesn't yell at me, or charge me to skip waiting, or push notifications I didn't ask for — that's the whole product. Bought the cosmetic pack, didn't need to. Will buy the next one."
>
> — *Ravi, Kickstarter backer #2,847*

If that review is what we get, NORTH_STAR has held.

If we get the opposite — *"fun for a week then it just became another idle that wanted my time and money"* — we got it wrong somewhere in §8 (Monetization) or §4 (Journey). Both are check-points we revisit at every milestone.

---

## How this doc relates to the others

- **GAME.md** — the spec. Mechanics, numbers, screens, flows. When this doc and GAME.md drift on *a mechanic*, GAME.md wins.
- **NORTH_STAR.md (this file)** — the fantasy. When they drift on *who is this game for, what does it feel like, what do we sell*, this file wins.
- **DECISIONS.md** — the resolution log. Every Pending → Resolved trail.
- **DESIGN_NOTES.md** — the why-trail. The reasoning behind decisions, plus rejected alternatives.
- **BALANCE.xlsx** — the math reference. Designer-facing balance tables extracted from GAME.md Part I.

NORTH_STAR is read first by anyone joining the project and last by anyone defending a feature. If a feature can't be defended back to a paragraph in this file, it doesn't belong in v1.
