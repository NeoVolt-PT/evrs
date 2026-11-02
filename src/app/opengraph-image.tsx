import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "EVRS | Electric Vehicle Real Range & Reliability Global Tracker";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.22), transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.22), transparent 50%)",
          color: "#fafafa",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 20px",
            borderRadius: "9999px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "#10b981",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          ⚡ EVRS • BY NEOVOLT-PT
        </div>

        <div
          style={{
            fontSize: 66,
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>EV Real Range & Reliability</span>
          <span style={{ color: "#10b981" }}>0–100 Global Race Index</span>
        </div>

        <div
          style={{
            fontSize: 26,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "850px",
            marginBottom: 44,
          }}
        >
          Real-world autonomy, battery health, NHTSA safety reports & owner telemetry at www.neovolt.app
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "12px 24px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10b981",
              color: "#34d399",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            🟢 Positives
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: "9999px",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              border: "1px solid #3b82f6",
              color: "#60a5fa",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            🔵 Real Range
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: "9999px",
              backgroundColor: "rgba(249, 115, 22, 0.2)",
              border: "1px solid #f97316",
              color: "#fb923c",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            🟠 Battery
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: "9999px",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              border: "1px solid #ef4444",
              color: "#f87171",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            🔴 Mechanical
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
