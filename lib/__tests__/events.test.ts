import { describe, it, expect } from "vitest";
import { categorizeEvent } from "@/lib/events";

describe("categorizeEvent", () => {
  it("classifies jumps", () => {
    expect(categorizeEvent("Long jump")).toBe("jumping");
    expect(categorizeEvent("High jump")).toBe("jumping");
    expect(categorizeEvent("Triple jump")).toBe("jumping");
  });

  it("classifies throws", () => {
    expect(categorizeEvent("Shot put")).toBe("throwing");
    expect(categorizeEvent("Discus")).toBe("throwing");
    expect(categorizeEvent("Discus throw")).toBe("throwing");
    expect(categorizeEvent("Javelin")).toBe("throwing");
  });

  it("classifies running events as the default", () => {
    expect(categorizeEvent("100m")).toBe("running");
    expect(categorizeEvent("200m")).toBe("running");
    expect(categorizeEvent("800m")).toBe("running");
    expect(categorizeEvent("Mile")).toBe("running");
    expect(categorizeEvent("Hurdles")).toBe("running");
  });

  it("is case insensitive", () => {
    expect(categorizeEvent("LONG JUMP")).toBe("jumping");
    expect(categorizeEvent("shot put")).toBe("throwing");
  });
});
