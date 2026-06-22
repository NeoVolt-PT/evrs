"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { t } = useTranslation();
  const [brandCount, setBrandCount] = useState<number | null>(null);
  const [modelCount, setModelCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all brands to count distinct ones (Supabase count doesn't do DISTINCT)
        const { data: brandsData, error: brandsError } = await supabase
          .from("vehicles")
          .select("brand");

        if (brandsError) throw brandsError;

        if (brandsData) {
          // Count unique brands using Set
          const uniqueBrands = new Set(brandsData.map((v: { brand: string }) => v.brand));
          setBrandCount(uniqueBrands.size);
        }

        // Count distinct brand+model combinations (unique models)
        const { data: modelsData, error: modelsError } = await supabase
          .from("vehicles")
          .select("brand, model");

        if (modelsError) throw modelsError;

        if (modelsData) {
          // Count unique brand+model pairs
          const uniqueModels = new Set(
            modelsData.map((v: { brand: string; model: string }) => `${v.brand}|${v.model}`)
          );
          setModelCount(uniqueModels.size);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center p-8 bg-background text-foreground mt-12 mb-24">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {t("title_main")} <span className="text-primary">{t("title_sub")}</span>
        </h1>
        <p className="text-xl text-gray-400">
          {t("description")}
        </p>

        {/* Stats Cards */}
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex flex-col items-center p-4 bg-card/50 border border-border rounded-xl min-w-[140px]">
            <span className="text-3xl font-bold text-primary">
              {brandCount !== null ? brandCount : "—"}
            </span>
            <span className="text-sm text-gray-400 mt-1">{t("brands")}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-card/50 border border-border rounded-xl min-w-[140px]">
            <span className="text-3xl font-bold text-primary">
              {modelCount !== null ? modelCount : "—"}
            </span>
            <span className="text-sm text-gray-400 mt-1">{t("models")}</span>
          </div>
        </div>
        
        <SearchBar />
      </div>
    </main>
  );
}