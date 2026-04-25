import { describe, it, expect } from "vitest";
import { eventSortKey } from "@/lib/display";

describe("eventSortKey", () => {
  it("orders running events numerically per the canonical list", () => {
    expect(eventSortKey("50m")).toBeLessThan(eventSortKey("100m"));
    expect(eventSortKey("100m")).toBeLessThan(eventSortKey("200m"));
    expect(eventSortKey("200m")).toBeLessThan(eventSortKey("Long Jump"));
  });

  it("places throws after jumps", () => {
    expect(eventSortKey("Long Jump")).toBeLessThan(eventSortKey("Shot Put"));
    expect(eventSortKey("Shot Put")).toBeLessThan(eventSortKey("Javelin"));
  });

  it("returns max safe integer for unknown events", () => {
    expect(eventSortKey("Mystery Event")).toBe(Number.MAX_SAFE_INTEGER);
  });
});
