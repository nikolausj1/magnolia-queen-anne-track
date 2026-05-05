import { describe, it, expect } from "vitest";
import {
  parseTime,
  parseDistance,
  compareMarks,
  formatTime,
  formatDistance,
  formatMark,
} from "@/lib/marks";

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

  it("accepts fractional inches", () => {
    expect(parseDistance("30'2.5\"")).toBe(362.5);
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

describe("formatTime", () => {
  it("pads sub-minute times with leading colon and 2-digit hundredths", () => {
    expect(formatTime(":17")).toBe(":17.00");
    expect(formatTime(":17.81")).toBe(":17.81");
    expect(formatTime(":08.77")).toBe(":08.77");
    expect(formatTime(":08")).toBe(":08.00");
  });

  it("formats minute+ times as M:SS.HH with 2-digit seconds", () => {
    expect(formatTime("1:46")).toBe("1:46.00");
    expect(formatTime("8:01.00")).toBe("8:01.00");
    expect(formatTime("2:55.65")).toBe("2:55.65");
    expect(formatTime("1:5")).toBe("1:05.00");
  });

  it("rounds half-up to hundredths", () => {
    expect(formatTime(":17.815")).toBe(":17.82");
  });

  it("returns input unchanged when unparseable", () => {
    expect(formatTime("nope")).toBe("nope");
  });
});

describe("formatDistance", () => {
  it("always includes inches with a space separator", () => {
    expect(formatDistance("6'")).toBe("6' 0\"");
    expect(formatDistance("47'7\"")).toBe("47' 7\"");
    expect(formatDistance("8'11\"")).toBe("8' 11\"");
    expect(formatDistance("13'00\"")).toBe("13' 0\"");
  });

  it("rounds fractional inches to integers", () => {
    expect(formatDistance("30'2.5\"")).toBe("30' 3\"");
  });

  it("returns input unchanged when unparseable", () => {
    expect(formatDistance("nope")).toBe("nope");
  });
});

describe("formatMark", () => {
  it("dispatches to the right formatter by event category", () => {
    expect(formatMark(":17.81", "100m")).toBe(":17.81");
    expect(formatMark("1:46", "800m")).toBe("1:46.00");
    expect(formatMark("6'", "Long Jump")).toBe("6' 0\"");
    expect(formatMark("47'7\"", "Javelin")).toBe("47' 7\"");
  });
});
