import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kronos — Entrepreneur OS",
    short_name: "Kronos",
    description:
      "Track time, capital, skills, and recharge across every brand and project.",
    start_url: "/",
    display: "standalone",
    background_color: "#141210",
    theme_color: "#141210",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
