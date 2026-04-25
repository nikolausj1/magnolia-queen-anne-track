import { describe, it, expect, vi } from "vitest";
import type { Athlete } from "@/lib/data";
import { buildDisplayMap, eventSortKey } from "@/lib/display";

const a = (id: string, firstName: string, lastInitial?: string): Athlete => ({
  id,
  firstName,
  lastInitial,
});

describe("buildDisplayMap", () => {
  it("renders unique first names plain", () => {
    const map = buildDisplayMap([a("waverly-h", "Waverly", "H.")]);
    expect(map.get("waverly-h")).toBe("Waverly");
  });

  it("appends last initials when first name collides", () => {
    const map = buildDisplayMap([
      a("samantha-f", "Samantha", "F."),
      a("samantha-s", "Samantha", "S."),
    ]);
    expect(map.get("samantha-f")).toBe("Samantha F.");
    expect(map.get("samantha-s")).toBe("Samantha S.");
  });

  it("falls back to plain firstName and warns when colliding athlete has no lastInitial", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const map = buildDisplayMap([
      a("samantha-f", "Samantha", "F."),
      a("samantha-s", "Samantha", "S."),
      a("samantha", "Samantha"),
    ]);
    expect(map.get("samantha")).toBe("Samantha");
    expect(map.get("samantha-f")).toBe("Samantha F.");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("treats first-name match case-insensitively", () => {
    const map = buildDisplayMap([
      a("charlie-h", "Charlie", "H."),
      a("charlie-g", "charlie", "G."),
    ]);
    expect(map.get("charlie-h")).toBe("Charlie H.");
    expect(map.get("charlie-g")).toBe("charlie G.");
  });
});

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
