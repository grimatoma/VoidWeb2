import { beforeEach, describe, expect, it } from "vitest";
import {
  abandonProspecting,
  createInitialSurvey,
  generateField,
  setFocus,
  stakeCandidate,
  startFieldSweep,
  startProspecting,
  tickSurvey,
} from "./survey";
import { resetRandom } from "../test/setup";

beforeEach(() => resetRandom());

describe("createInitialSurvey", () => {
  it("starts idle with probe ready and zero candidates", () => {
    const s = createInitialSurvey();
    expect(s.phase).toBe("idle");
    expect(s.candidates).toHaveLength(0);
    expect(s.probeReady).toBe(true);
  });
});

describe("generateField", () => {
  it("seeds 14 deterministic candidates", () => {
    const a = generateField(42);
    const b = generateField(42);
    expect(a).toHaveLength(14);
    expect(b).toHaveLength(14);
    expect(a[0].fx).toBeCloseTo(b[0].fx, 9);
    expect(a[0].hiddenYield).toEqual(b[0].hiddenYield);
  });

  it("different seeds produce different layouts", () => {
    const a = generateField(1);
    const b = generateField(2);
    const samePos = a.every((c, i) => c.fx === b[i].fx && c.fy === b[i].fy);
    expect(samePos).toBe(false);
  });

  it("every candidate has fx, fy in roughly [-1, 1]", () => {
    for (const c of generateField(7)) {
      expect(c.fx).toBeGreaterThan(-1.5);
      expect(c.fx).toBeLessThan(1.5);
      expect(c.fy).toBeGreaterThan(-1.5);
      expect(c.fy).toBeLessThan(1.5);
    }
  });
});

describe("startFieldSweep", () => {
  it("populates candidates and enters field phase", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 100);
    expect(s.phase).toBe("field");
    expect(s.candidates.length).toBeGreaterThan(0);
    expect(s.fieldElapsed).toBe(0);
  });

  it("resets prospecting state if a new sweep starts", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 100);
    s.prospectingId = s.candidates[0].id;
    s.prospectingElapsed = 30;
    startFieldSweep(s, 200);
    expect(s.prospectingId).toBeNull();
    expect(s.prospectingElapsed).toBe(0);
  });
});

describe("tickSurvey — field phase", () => {
  it("raises field-elapsed monotonically until completion", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 1);
    tickSurvey(s, 60);
    expect(s.fieldElapsed).toBe(60);
    expect(s.phase).toBe("field");
    tickSurvey(s, 1000);
    expect(s.fieldElapsed).toBe(s.fieldDuration);
    expect(s.phase).toBe("complete");
  });

  it("resolves at least one composition band by 50% sweep", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 1);
    tickSurvey(s, s.fieldDuration * 0.6);
    const anyResolved = s.candidates.some((c) => Object.keys(c.resolvedYields).length > 0);
    expect(anyResolved).toBe(true);
  });

  it("does not exceed 0.5 confidence during field phase alone", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 1);
    tickSurvey(s, s.fieldDuration);
    for (const c of s.candidates) {
      expect(c.confidence).toBeLessThanOrEqual(0.5 + 1e-9);
    }
  });
});

describe("startProspecting + tickSurvey — prospecting phase", () => {
  it("rises confidence past 0.5 toward 1.0", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 1);
    tickSurvey(s, s.fieldDuration);
    startProspecting(s, s.candidates[0].id, "composition");
    tickSurvey(s, s.prospectingDuration / 2);
    const c = s.candidates[0];
    expect(c.confidence).toBeGreaterThan(0.7);
    expect(c.confidence).toBeLessThan(1);
  });

  it("resolves grid roll at ~80% confidence", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 1);
    tickSurvey(s, s.fieldDuration);
    startProspecting(s, s.candidates[0].id, "composition");
    tickSurvey(s, s.prospectingDuration);
    const c = s.candidates[0];
    expect(c.confidence).toBeGreaterThanOrEqual(1 - 1e-9);
    expect(c.resolvedGrid).not.toBeNull();
  });

  it("hazards show at full confidence regardless of focus", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 1);
    tickSurvey(s, s.fieldDuration);
    startProspecting(s, s.candidates[0].id, "composition");
    tickSurvey(s, s.prospectingDuration);
    const c = s.candidates[0];
    expect(c.resolvedHazards).toEqual(c.hiddenHazards);
  });

  it("phase flips back to complete when prospecting finishes", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 1);
    tickSurvey(s, s.fieldDuration);
    startProspecting(s, s.candidates[0].id);
    tickSurvey(s, s.prospectingDuration);
    expect(s.phase).toBe("complete");
  });
});

describe("commands", () => {
  it("setFocus updates focus", () => {
    const s = createInitialSurvey();
    setFocus(s, "hazard");
    expect(s.focus).toBe("hazard");
  });

  it("stakeCandidate marks candidate as staked", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 1);
    const id = s.candidates[0].id;
    stakeCandidate(s, id);
    expect(s.candidates[0].staked).toBe(true);
  });

  it("abandonProspecting resets prospecting state", () => {
    const s = createInitialSurvey();
    startFieldSweep(s, 1);
    startProspecting(s, s.candidates[0].id);
    abandonProspecting(s);
    expect(s.prospectingId).toBeNull();
    expect(s.prospectingElapsed).toBe(0);
    // Phase falls back to field (sweep not yet complete) or complete (if it was)
    expect(["field", "complete"]).toContain(s.phase);
  });
});
