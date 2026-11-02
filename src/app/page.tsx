"use client";

import { useEffect, useState } from "react";
import SearchBar, { VehicleOption } from "@/components/SearchBar";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const { t } = useTranslation();
  const [brandCount, setBrandCount] = useState<number | null>(null);
  const [modelCount, setModelCount] = useState<number | null>(null);
  const [reportCount, setReportCount] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: modelsData, error: modelsError } = await supabase
          .from("vehicles")
          .select("brand, model")
          .order("brand", { ascending: true });

        if (modelsError) throw modelsError;

        if (modelsData) {
          const uniqueBrands = new Set(modelsData.map((v: { brand: string }) => v.brand));
          setBrandCount(uniqueBrands.size);

          const uniqueModelsMap = new Map<string, VehicleOption>();
          for (const v of modelsData as VehicleOption[]) {
            const key = `${v.brand}|${v.model}`;
            if (!uniqueModelsMap.has(key)) {
              uniqueModelsMap.set(key, v);
            }
          }
          setModelCount(uniqueModelsMap.size);
          setVehicles(Array.from(uniqueModelsMap.values()));
        }

        const { count, error: reportsError } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true });

        if (!reportsError && count !== null) {
          setReportCount(count);
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
        <div className="flex flex-wrap items-center justify-center gap-6 mt-2">
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
          {reportCount !== null && (
            <div className="flex flex-col items-center p-4 bg-card/50 border border-border rounded-xl min-w-[140px]">
              <span className="text-3xl font-bold text-primary">
                {reportCount}
              </span>
              <span className="text-sm text-gray-400 mt-1">{t("reports_stat")}</span>
            </div>
          )}
        </div>
        
        <SearchBar vehicles={vehicles} />

        {vehicles.length > 0 && (
          <div className="pt-6 text-left">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-3 text-center">
              {t("browse_vehicles")}
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {vehicles.slice(0, 16).map((v) => {
                const params = new URLSearchParams({ brand: v.brand });
                if (v.model && v.model !== "General" && v.model !== "Unknown" && v.model !== "Multiple") {
                  params.set("model", v.model);
                }
                const displayModel =
                  v.model && v.model !== "General" && v.model !== "Unknown" && v.model !== "Multiple"
                    ? ` ${v.model}`
                    : "";
                return (
                  <Link
                    key={`${v.brand}-${v.model}`}
                    href={`/results?${params.toString()}`}
                    className="px-3 py-1.5 text-xs rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    {v.brand}
                    {displayModel}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
