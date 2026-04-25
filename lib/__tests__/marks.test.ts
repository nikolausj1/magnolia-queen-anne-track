import { describe, it, expect } from "vitest";
import { parseTime, parseDistance, compareMarks } from "@/lib/marks";

describe("parseTime", () => {
  it("parses leading-colon seconds", () => {
    expect(parseTime(":18")).toBe(18);
    expect(parseTime(":18.78")).toBe(18.78);
    expect(parseTime(":08")).toBe(8);
  });

  it("parses bare seconds", () => {
    expect(parseTime("11.9")).toBe(11.9);
    expect(parseTime("9.85")).toBe(9.85);
  });

  it("parses minutes:seconds", () => {
    expect(parseTime("1:19")).toBe(79);
    expect(parseTime("2:30")).toBe(150);
  });

  it("parses minutes:seconds with fractional seconds", () => {
    expect(parseTime("1:19.45")).toBe(79.45);
  });

  it("throws on unparseable input", () => {
    expect(() => parseTime("nope")).toThrow();
    expect(() => parseTime("1:bad")).toThrow();
  });
});

describe("parseDistance", () => {
  it("parses feet and inches", () => {
    expect(parseDistance("6'4\"")).toBe(76);
    expect(parseDistance("33'8\"")).toBe(404);
    expect(parseDistance("13'00\"")).toBe(156);
  });

  it("handles feet only", () => {
    expect(parseDistance("6'")).toBe(72);
  });

  it("handles inches only", () => {
    expect(parseDistance("11\"")).toBe(11);
  });

  it("throws on unparseable input", () => {
    expect(() => parseDistance("nope")).toThrow();
    expect(() => parseDistance("")).toThrow();
  });
});

describe("compareMarks", () => {
  it("sorts time events ascending (faster first)", () => {
    const sorted = ["12.3", "11.9", "13.0"].sort((a, b) =>
      compareMarks(a, b, "100m"),
    );
    expect(sorted).toEqual(["11.9", "12.3", "13.0"]);
  });

  it("sorts jumps descending (longer first)", () => {
    const sorted = ["6'4\"", "7'0\"", "5'10\""].sort((a, b) =>
      compareMarks(a, b, "Long jump"),
    );
    expect(sorted).toEqual(["7'0\"", "6'4\"", "5'10\""]);
  });

  it("sorts throws descending (longer first)", () => {
    const sorted = ["33'8\"", "40'2\"", "28'6\""].sort((a, b) =>
      compareMarks(a, b, "Shot put"),
    );
    expect(sorted).toEqual(["40'2\"", "33'8\"", "28'6\""]);
  });
});
