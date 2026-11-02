import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600; // Refresh sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.neovolt.app";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("brand, model")
      .order("brand", { ascending: true });

    if (vehicles && vehicles.length > 0) {
      const seenBrands = new Set<string>();
      const seenModels = new Set<string>();

      for (const v of vehicles) {
        const brand = (v.brand || "").trim();
        const model = (v.model || "").trim();
        if (!brand) continue;

        if (!seenBrands.has(brand.toLowerCase())) {
          seenBrands.add(brand.toLowerCase());
          const brandParams = new URLSearchParams({ brand });
          entries.push({
            url: `${baseUrl}/results?${brandParams.toString()}`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
          });
        }

        if (
          model &&
          model !== "General" &&
          model !== "Unknown" &&
          model !== "Multiple"
        ) {
          const modelKey = `${brand.toLowerCase()}|${model.toLowerCase()}`;
          if (!seenModels.has(modelKey)) {
            seenModels.add(modelKey);
            const modelParams = new URLSearchParams({ brand, model });
            entries.push({
              url: `${baseUrl}/results?${modelParams.toString()}`,
              lastModified: now,
              changeFrequency: "weekly",
              priority: 0.8,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Sitemap generation fallback:", err);
  }

  return entries;
}
