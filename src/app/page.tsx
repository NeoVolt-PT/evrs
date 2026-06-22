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
        // Get distinct brand count
        const { count: brands, error: brandErr } = await supabase
          .from("vehicles")
          .select("brand", { count: "exact", head: true });

        // Get total model count
        const { count: models, error: modelErr } = await supabase
          .from("vehicles")
          .select("id", { count: "exact", head: true });

        if (!brandErr && brands !== null) setBrandCount(brands);
        if (!modelErr && models !== null) setModelCount(models);
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
            <span className="text-sm text-gray-400 mt-1">Marcas</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-card/50 border border-border rounded-xl min-w-[140px]">
            <span className="text-3xl font-bold text-primary">
              {modelCount !== null ? modelCount : "—"}
            </span>
            <span className="text-sm text-gray-400 mt-1">Modelos</span>
          </div>
        </div>
        
        <SearchBar />
      </div>
    </main>
  );
}