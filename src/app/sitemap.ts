import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import {
  getCanonicalVehicleKey,
  isValidCarBrandAndModel,
  normalizeVehicleIdentity,
} from "@/lib/validBrands";

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
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/results?brand=Incentives`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
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
        if (!isValidCarBrandAndModel(v.brand, v.model)) continue;
        const { brand, model } = normalizeVehicleIdentity(v.brand, v.model);

        const brandKey = brand.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!seenBrands.has(brandKey)) {
          seenBrands.add(brandKey);
          const brandParams = new URLSearchParams({ brand });
          entries.push({
            url: `${baseUrl}/results?${brandParams.toString()}`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
          });
        }

        const modelKey = getCanonicalVehicleKey(brand, model);
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
  } catch (err) {
    console.error("Sitemap generation fallback:", err);
  }

  return entries;
}

