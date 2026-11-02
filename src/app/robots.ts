import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.neovolt.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/results", "/about", "/contact"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
