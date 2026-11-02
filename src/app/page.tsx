"use client";

import { useEffect, useState } from "react";
import SearchBar, { VehicleOption } from "@/components/SearchBar";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

interface RankedVehicle extends VehicleOption {
  count: number;
  createdAt?: string;
}

export default function Home() {
  const { t } = useTranslation();
  const [brandCount, setBrandCount] = useState<number | null>(null);
  const [modelCount, setModelCount] = useState<number | null>(null);
  const [reportCount, setReportCount] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [topVehicles, setTopVehicles] = useState<RankedVehicle[]>([]);
  const [latestVehicles, setLatestVehicles] = useState<RankedVehicle[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [vehiclesRes, reportsRes] = await Promise.all([
          supabase
            .from("vehicles")
            .select("id, brand, model, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("reports")
            .select("vehicle_id, created_at")
            .order("created_at", { ascending: false }),
        ]);

        if (vehiclesRes.error) throw vehiclesRes.error;

        const modelsData = vehiclesRes.data || [];
        const reportsData = reportsRes.data || [];

        if (!reportsRes.error) {
          setReportCount(reportsData.length);
        }

        // Count reports per vehicle_id and track latest report timestamp
        const countByVehicleId = new Map<string, number>();
        const latestReportByVehicleId = new Map<string, string>();
        for (const r of reportsData as { vehicle_id: string; created_at?: string }[]) {
          countByVehicleId.set(r.vehicle_id, (countByVehicleId.get(r.vehicle_id) || 0) + 1);
          if (r.created_at && !latestReportByVehicleId.has(r.vehicle_id)) {
            latestReportByVehicleId.set(r.vehicle_id, r.created_at);
          }
        }

        if (modelsData.length > 0) {
          const uniqueBrands = new Set(modelsData.map((v: { brand: string }) => v.brand));
          setBrandCount(uniqueBrands.size);

          const aggregatedMap = new Map<string, RankedVehicle>();
          for (const v of modelsData as { id: string; brand: string; model: string; created_at?: string }[]) {
            const key = `${v.brand.toLowerCase()}|${v.model.toLowerCase()}`;
            const vCount = countByVehicleId.get(v.id) || 0;
            const vLatest = latestReportByVehicleId.get(v.id) || v.created_at || "";

            const existing = aggregatedMap.get(key);
            if (!existing) {
              aggregatedMap.set(key, {
                brand: v.brand,
                model: v.model,
                count: vCount,
                createdAt: vLatest,
              });
            } else {
              existing.count += vCount;
              if (vLatest > (existing.createdAt || "")) {
                existing.createdAt = vLatest;
              }
            }
          }

          const allAggregated = Array.from(aggregatedMap.values());
          setModelCount(allAggregated.length);

          // Sort by count descending for SearchBar autocomplete and Top Vehicles section
          const sortedByCount = [...allAggregated].sort(
            (a, b) => b.count - a.count || a.brand.localeCompare(b.brand)
          );
          setVehicles(sortedByCount);
          setTopVehicles(sortedByCount.filter((v) => v.count > 0).slice(0, 16));

          // Sort by newest timestamp descending for Latest Brands & Models section
          const sortedByLatest = [...allAggregated].sort((a, b) =>
            (b.createdAt || "").localeCompare(a.createdAt || "")
          );
          setLatestVehicles(sortedByLatest.slice(0, 16));
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center px-6 py-10 bg-transparent text-foreground mt-6 mb-20">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Live Telemetry Pulse Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono tracking-wider uppercase shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {t("hero_live_badge")}
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          {t("title_main")}{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            {t("title_sub")}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          {t("description")}
        </p>

        {/* Stats Cards */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-2">
          <div className="glow-card flex flex-col items-center p-5 bg-card/80 backdrop-blur border border-border rounded-2xl min-w-[155px]">
            <span className="text-3xl md:text-4xl font-mono font-extrabold text-emerald-400">
              {brandCount !== null ? brandCount : "—"}
            </span>
            <span className="text-xs uppercase tracking-wider text-gray-400 mt-1.5 font-semibold">
              🏭 {t("brands")}
            </span>
          </div>
          <div className="glow-card flex flex-col items-center p-5 bg-card/80 backdrop-blur border border-border rounded-2xl min-w-[155px]">
            <span className="text-3xl md:text-4xl font-mono font-extrabold text-blue-400">
              {modelCount !== null ? modelCount : "—"}
            </span>
            <span className="text-xs uppercase tracking-wider text-gray-400 mt-1.5 font-semibold">
              🚗 {t("models")}
            </span>
          </div>
          {reportCount !== null && (
            <div className="glow-card flex flex-col items-center p-5 bg-card/80 backdrop-blur border border-border rounded-2xl min-w-[155px]">
              <span className="text-3xl md:text-4xl font-mono font-extrabold text-orange-400">
                {reportCount}
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-400 mt-1.5 font-semibold">
                📊 {t("reports_stat")}
              </span>
            </div>
          )}
        </div>
        
        <SearchBar vehicles={vehicles} />

        {topVehicles.length > 0 && (
          <div className="pt-6 text-left space-y-6">
            <div>
              <h2 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-3 text-center">
                🔥 {t("browse_vehicles")}
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                {topVehicles.map((v) => {
                  const params = new URLSearchParams({ brand: v.brand });
                  const hasSpecificModel =
                    v.model && v.model !== "General" && v.model !== "Unknown" && v.model !== "Multiple";
                  if (hasSpecificModel) {
                    params.set("model", v.model);
                  }
                  const displayModel = hasSpecificModel ? ` ${v.model}` : "";
                  return (
                    <Link
                      key={`top-${v.brand}-${v.model}`}
                      href={`/results?${params.toString()}`}
                      onClick={() =>
                        trackEvent("search_vehicle", {
                          brand: v.brand,
                          model: v.model || "All",
                          source: "home_top_vehicles",
                        })
                      }
                      className="px-3 py-1.5 text-xs rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <span>
                        <strong className="text-white">{v.brand}</strong>
                        {displayModel && <span className="text-gray-300">{displayModel}</span>}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-primary/15 text-primary border border-primary/30">
                        {v.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {latestVehicles.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <h2 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-3 text-center">
                  🆕 {t("latest_vehicles")}
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {latestVehicles.map((v) => {
                    const params = new URLSearchParams({ brand: v.brand });
                    const hasSpecificModel =
                      v.model && v.model !== "General" && v.model !== "Unknown" && v.model !== "Multiple";
                    if (hasSpecificModel) {
                      params.set("model", v.model);
                    }
                    const displayModel = hasSpecificModel ? ` ${v.model}` : "";
                    return (
                      <Link
                        key={`latest-${v.brand}-${v.model}`}
                        href={`/results?${params.toString()}`}
                        onClick={() =>
                          trackEvent("search_vehicle", {
                            brand: v.brand,
                            model: v.model || "All",
                            source: "home_latest_vehicles",
                          })
                        }
                        className="px-3 py-1.5 text-xs rounded-full bg-card/70 border border-border hover:border-blue-400 hover:text-blue-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>
                          <strong className="text-gray-200">{v.brand}</strong>
                          {displayModel && <span className="text-gray-400">{displayModel}</span>}
                        </span>
                        {v.count > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            {v.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Original Editorial & Methodology Section for SEO and User Trust */}
        <section className="pt-12 mt-8 border-t border-border/60 text-left space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white">{t("methodology_title")}</h2>
            <p className="text-sm text-gray-400 mt-1">{t("methodology_subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glow-card p-5 rounded-2xl bg-card/70 border border-border">
              <h3 className="text-sm font-semibold text-emerald-400 mb-1.5">
                {t("methodology_card1_title")}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t("methodology_card1_desc")}
              </p>
            </div>
            <div className="glow-card p-5 rounded-2xl bg-card/70 border border-border">
              <h3 className="text-sm font-semibold text-blue-400 mb-1.5">
                {t("methodology_card2_title")}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t("methodology_card2_desc")}
              </p>
            </div>
            <div className="glow-card p-5 rounded-2xl bg-card/70 border border-border">
              <h3 className="text-sm font-semibold text-orange-400 mb-1.5">
                {t("methodology_card3_title")}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t("methodology_card3_desc")}
              </p>
            </div>
          </div>
        </section>

        {/* SEO FAQ Section */}
        <section className="pt-10 text-left space-y-4">
          <h2 className="text-xl font-bold text-white text-center mb-4">
            {t("faq_title")}
          </h2>
          <div className="space-y-3">
            <details className="group p-4 rounded-xl bg-card/60 border border-border">
              <summary className="cursor-pointer font-semibold text-sm text-white flex items-center justify-between">
                <span>{t("faq_q1")}</span>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2.5 text-xs text-gray-400 leading-relaxed">{t("faq_a1")}</p>
            </details>
            <details className="group p-4 rounded-xl bg-card/60 border border-border">
              <summary className="cursor-pointer font-semibold text-sm text-white flex items-center justify-between">
                <span>{t("faq_q2")}</span>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2.5 text-xs text-gray-400 leading-relaxed">{t("faq_a2")}</p>
            </details>
            <details className="group p-4 rounded-xl bg-card/60 border border-border">
              <summary className="cursor-pointer font-semibold text-sm text-white flex items-center justify-between">
                <span>{t("faq_q3")}</span>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2.5 text-xs text-gray-400 leading-relaxed">{t("faq_a3")}</p>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}
