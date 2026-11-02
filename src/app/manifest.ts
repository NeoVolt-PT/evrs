import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EVRS | Electric Vehicle Real Range & Reliability Tracker",
    short_name: "EVRS",
    description:
      "Global Electric Vehicle real-world range, battery reliability, and mechanical issue tracker with a 0–100 telemetry index.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#10b981",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

