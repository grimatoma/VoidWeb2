import { beforeEach, describe, expect, it } from "vitest";
import { pushAlert, pushLog, tick } from "./sim";
import { fresh, forcePlace } from "../test/helpers";
import { resetRandom } from "../test/setup";

beforeEach(() => resetRandom());

describe("pushAlert dedupe", () => {
  it("collapses a duplicate (same title + bodyId) on a single active alert", () => {
    const s = fresh();
    pushAlert(s, { severity: "warning", title: "stuck", bodyId: "nea_04" });
    pushAlert(s, { severity: "warning", title: "stuck", bodyId: "nea_04" });
    expect(s.alerts).toHaveLength(1);
  });

  it("treats same title with different bodyId as separate alerts", () => {
    const s = fresh();
    pushAlert(s, { severity: "warning", title: "stuck", bodyId: "nea_04" });
    pushAlert(s, { severity: "warning", title: "stuck", bodyId: "moon" });
    expect(s.alerts).toHaveLength(2);
  });

  it("a resolved alert no longer blocks a fresh duplicate from being pushed", () => {
    const s = fresh();
    pushAlert(s, { severity: "warning", title: "stuck", bodyId: "nea_04" });
    s.alerts[0].resolved = true;
    pushAlert(s, { severity: "warning", title: "stuck", bodyId: "nea_04" });
    expect(s.alerts).toHaveLength(2);
    expect(s.alerts[1].resolved).toBeFalsy();
  });
});

describe("pushLog ring buffer", () => {
  it("caps the log at 200 entries by dropping the oldest", () => {
    const s = fresh();
    for (let i = 0; i < 250; i++) pushLog(s, `entry ${i}`);
    expect(s.log).toHaveLength(200);
    expect(s.log[0].text).toBe("entry 50");
    expect(s.log.at(-1)?.text).toBe("entry 249");
  });

  it("stamps each entry with current gameTimeSec", () => {
    const s = fresh();
    s.gameTimeSec = 42;
    pushLog(s, "hello");
    expect(s.log.at(-1)?.ts).toBe(42);
  });
});

describe("storage-cap alerts (95% / 85% hysteresis)", () => {
  it("fires a 'storage at cap' warning when solid usage hits 95%", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.iron_ore = 95; // baseline cap = 100
    tick(s, 1);
    expect(s.alerts.some((a) => !a.resolved && a.title === "NEA-04 storage at cap")).toBe(true);
  });

  it("fires when fluid usage hits 95% (separate cargo-class trigger)", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.hydrogen_fuel = 48; // fluid baseline 50 → 96%
    tick(s, 1);
    expect(s.alerts.some((a) => !a.resolved && a.title === "NEA-04 storage at cap")).toBe(true);
  });

  it("clears the alert only after both cargo classes drop below 85%", () => {
    const s = fresh();
    s.bodies.nea_04.warehouse.iron_ore = 95;
    tick(s, 1);
    // Drop to 90% — still within hysteresis band, alert should persist.
    s.bodies.nea_04.warehouse.iron_ore = 90;
    tick(s, 1);
    expect(s.alerts.some((a) => !a.resolved && a.title === "NEA-04 storage at cap")).toBe(true);
    // Drop to 80% — now under the 85% recovery threshold.
    s.bodies.nea_04.warehouse.iron_ore = 80;
    tick(s, 1);
    expect(s.alerts.some((a) => !a.resolved && a.title === "NEA-04 storage at cap")).toBe(false);
  });

  it("does not fire on Earth (infinite market sink)", () => {
    const s = fresh();
    s.bodies.earth.warehouse.iron_ore = 1_000_000;
    tick(s, 1);
    expect(s.alerts.some((a) => a.title === "Earth Orbit storage at cap")).toBe(false);
  });
});

describe("idle ship alerts — multi-ship", () => {
  it("each idle ship gets its own alert (alerts keyed per ship)", () => {
    const s = fresh();
    s.credits = 100000;
    s.ships.push({
      id: "ship_extra",
      defId: "hauler_1",
      name: "Hauler-2",
      status: "idle",
      locationBodyId: "earth",
      route: null,
    });
    tick(s, 1);
    const idle = s.alerts.filter((a) => !a.resolved && /idle/.test(a.title));
    expect(idle.length).toBe(2);
    expect(idle.some((a) => a.title.startsWith("Hauler-1 idle"))).toBe(true);
    expect(idle.some((a) => a.title.startsWith("Hauler-2 idle"))).toBe(true);
  });
});

describe("tier-gate dedupe across long runs", () => {
  it("emits the T1-ready info alert once across many ticks (regression for repeated banners)", () => {
    const s = fresh();
    forcePlace(s, "nea_04", "small_mine", 0, 0); // unrelated; ensures tick path is exercised
    s.refinedMetalSoldLifetime = 200;
    s.bodies.nea_04.warehouse.hydrogen_fuel = 50;
    for (let i = 0; i < 30; i++) tick(s, 1);
    const matches = s.alerts.filter((a) => a.title === "T1 ready: Lunar Foothold available");
    expect(matches).toHaveLength(1);
  });
});
