import { describe, expect, it } from "vitest";
import { fmtCredits, fmtGameTime, fmtNum, fmtRate, fmtTimeAway, pct } from "./format";

describe("fmtCredits", () => {
  it("formats positive integers with $ and commas", () => {
    expect(fmtCredits(0)).toBe("$0");
    expect(fmtCredits(500)).toBe("$500");
    expect(fmtCredits(1500)).toBe("$1,500");
    expect(fmtCredits(1_234_567)).toBe("$1,234,567");
  });

  it("rounds fractional values", () => {
    expect(fmtCredits(99.4)).toBe("$99");
    expect(fmtCredits(99.6)).toBe("$100");
  });

  it("handles negatives with leading minus", () => {
    expect(fmtCredits(-200)).toBe("-$200");
  });
});

describe("fmtNum", () => {
  it("rounds and adds thousands separators", () => {
    expect(fmtNum(0)).toBe("0");
    expect(fmtNum(1234.567)).toBe("1,235");
    expect(fmtNum(12345)).toBe("12,345");
  });
});

describe("fmtTimeAway", () => {
  it("seconds for sub-minute windows", () => {
    expect(fmtTimeAway(0)).toBe("0s");
    expect(fmtTimeAway(45)).toBe("45s");
  });

  it("minutes/seconds under an hour", () => {
    expect(fmtTimeAway(60)).toBe("1m");
    expect(fmtTimeAway(75)).toBe("1m 15s");
    expect(fmtTimeAway(3599)).toBe("59m 59s");
  });

  it("hours/minutes for >1h", () => {
    expect(fmtTimeAway(3600)).toBe("1h");
    expect(fmtTimeAway(3660)).toBe("1h 1m");
    expect(fmtTimeAway(7320)).toBe("2h 2m");
  });
});

describe("fmtGameTime", () => {
  it("zero-pads HH:MM:SS", () => {
    expect(fmtGameTime(0)).toBe("00:00:00");
    expect(fmtGameTime(61)).toBe("00:01:01");
    expect(fmtGameTime(3661)).toBe("01:01:01");
  });
});

describe("fmtRate", () => {
  it("converts qty per cycleSec to qty/min", () => {
    expect(fmtRate(60, 10)).toBe("10.0/min");
    expect(fmtRate(30, 10)).toBe("20.0/min");
    expect(fmtRate(45, 2)).toBe("2.7/min");
  });
});

describe("pct", () => {
  it("returns em-dash for zero denominator", () => {
    expect(pct(5, 0)).toBe("—");
  });

  it("rounds to whole percent", () => {
    expect(pct(1, 2)).toBe("50%");
    expect(pct(1, 3)).toBe("33%");
    expect(pct(2, 3)).toBe("67%");
  });
});
