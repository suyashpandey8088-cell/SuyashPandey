import { ImageResponse } from "next/og";

export const alt =
  "Suyash Pandey — Candidate for Student Council President, NIAT. Your Voice. Our Campus. Our Future.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card, composed from the same tokens as the site:
 * warm ivory, deep plum, champagne rule.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FAF8F3",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -160,
            top: -140,
            width: 560,
            height: 560,
            borderRadius: 9999,
            backgroundColor: "#F4F0FA",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 92,
            bottom: 92,
            width: 220,
            height: 220,
            borderRadius: 9999,
            border: "1px solid #D9BFA0",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 9999,
              border: "1px solid #D9BFA0",
              color: "#443451",
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            SP
          </div>
          <div
            style={{
              display: "flex",
              color: "#443451",
              fontSize: 20,
              letterSpacing: 7,
              textTransform: "uppercase",
            }}
          >
            Suyash Pandey
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#443451",
              fontSize: 84,
              lineHeight: 1.02,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Your Voice. Our Campus.
          </div>
          <div
            style={{
              display: "flex",
              color: "#76639A",
              fontSize: 84,
              lineHeight: 1.02,
              letterSpacing: -2,
            }}
          >
            Our Future.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, width: 180, backgroundColor: "#D9BFA0" }} />
          <div
            style={{
              display: "flex",
              marginTop: 22,
              color: "#77737D",
              fontSize: 19,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Candidate for Student Council President · NIAT
          </div>
        </div>
      </div>
    ),
    size,
  );
}
