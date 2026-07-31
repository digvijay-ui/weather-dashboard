import { describe, expect, it } from "vitest";

import { formatForecastDate } from "./weatherFormat";

describe("formatForecastDate", () => {
  it("formats a valid ISO date", () => {
    expect(formatForecastDate("2026-02-03")).toBe("Tue, Feb 3");
  });

  it("returns a safe fallback for an invalid date", () => {
    expect(formatForecastDate("not-a-date")).toBe("Invalid date");
  });
});
