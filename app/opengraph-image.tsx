import { ImageResponse } from "next/og";

export const alt =
  "Magnolia CC Youth Track & Field · Queen Anne Quicksters · Seattle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #0B1F3A 0%, #061224 60%, #000000 100%)",
          color: "#FFFFFF",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 24,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Two Teams · One Community
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            <span>Magnolia CC</span>
            <span style={{ color: "#C8102E" }}>Queen Anne Quicksters</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 28,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <div style={{ display: "flex" }}>Youth Track &amp; Field · Seattle</div>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.6)" }}>
            magnoliaqueenannetrackandfield.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
