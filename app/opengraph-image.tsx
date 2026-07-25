import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0f12",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            backgroundColor: "#dc2626",
            marginBottom: 32,
            fontSize: 48,
          }}
        >
          📄
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>{SITE_NAME}</div>
        <div style={{ display: "flex", fontSize: 32, color: "#a1a1aa", marginTop: 16 }}>
          Free PDF tools that run entirely in your browser
        </div>
      </div>
    ),
    { ...size }
  );
}
