# 03 — UI North Star

This document is the canonical source for page structure, menu groups, and core interactions.

## UX Principles

- Desktop is map-first; mobile is task-first.
- One primary action per panel/card.
- Warnings must include direct remediation CTAs.
- Keep verb language explicit: Assign, Import, Upgrade, Optimize, Automate.

## Navigation

### Desktop
1. Command
2. Survey
3. Fleet & Routes
4. Industry
5. Colonies
6. Market
7. Research & Automation
8. Objectives
9. Logs
10. Settings

### Mobile
1. Ops
2. Map
3. Fleet
4. Colony
5. More

## Page Specs

### Command (Mission Control)
**Purpose:** operational heartbeat.

- **Menu groups:**
  - Top bar: credits/resources/people capacity/alerts.
  - Bottleneck rail: ranked blockers.
  - Live map: bodies, routes, moving ships.
  - Context panel: selected entity details.
  - Quick strip: recent events + fast commands.
- **Core actions:** `Assign Ship`, `Create Route`, `Buy Fuel`, `Resolve Alert`.

### Survey
**Purpose:** discover and evaluate prospects.

- **Menu groups:** search viewport, candidate list, probe controls, discovery timeline.
- **Core actions:** `Launch Probe`, `Focus Scan`, `Commit Survey`, `Bookmark Prospect`.

### Fleet & Routes
**Purpose:** maximize transport reliability and utilization.

- **Menu groups:** fleet table, route timeline, template queue, readiness/maintenance.
- **Core actions:** `Buy Ship`, `Plan Route`, `Assign Cargo`, `Set Repeat Route`, `Optimize Fuel`.

### Industry
**Purpose:** maintain production continuity and throughput.

- **Menu groups:** chain graph, facility cards, IO buffers, shortage diagnosis.
- **Core actions:** `Build Facility`, `Set Recipe`, `Upgrade Tier`, `Prioritize Output`, `Request Import`.

### Colonies
**Purpose:** sustain life support and unlock growth tiers.

- **Menu groups:** population/tier header, life support meters, tier checklist, risk trend.
- **Core actions:** `Import Essentials`, `Allocate Workforce`, `Start Upgrade`, `Set Emergency Protocol`.

### Market
**Purpose:** stabilize cashflow and cover supply gaps.

- **Menu groups:** buy/sell board, contract board, budget forecast.
- **Core actions:** `Sell Batch`, `Buy Materials`, `Accept Contract`.

### Research & Automation
**Purpose:** unlock leverage and remove repetitive micromanagement.

- **Menu groups:** research lanes, rule builder/list, ROI panel.
- **Core actions:** `Start Research`, `Queue Research`, `Create Rule`, `Enable/Disable Automation`.

## Standardized Critical-Alert Interaction

All critical warnings use the same ladder:
1. Detect
2. Diagnose
3. Act
4. Verify

This standard applies across logistics, industry, and colonies.
