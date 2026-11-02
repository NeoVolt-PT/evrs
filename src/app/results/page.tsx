"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { useUnit } from "@/components/Providers";
import Link from "next/link";

interface ReportItem {
  id: string;
  vehicle_id: string;
  type: string;
  description: string;
  source_link?: string | null;
  report_date: string;
  language_original?: string;
  contradictory_info?: boolean;
  estimated_range_km?: number | null;
  vehicle_brand?: string;
  vehicle_model?: string;
}

function ReportCard({ report }: { report: ReportItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, i18n } = useTranslation();
  const { formatRangeKm } = useUnit();

  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("reddit.com")) {
        urlObj.hostname = "www.redditmedia.com";
        urlObj.searchParams.set("embed", "true");
        return urlObj.toString();
      }
      const blockedDomains = ["insideevs.com", "electrek.co", "cleantechnica.com"];
      if (blockedDomains.some((d) => urlObj.hostname.includes(d))) {
        return `https://corsproxy.io/?${encodeURIComponent(url)}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "Real Range") return t("type_real_range");
    if (type === "Battery") return t("type_battery");
    if (type === "Mechanical") return t("type_mechanical");
    if (type === "Positives") return t("type_positives");
    return type;
  };

  const showModelBadge =
    report.vehicle_model &&
    report.vehicle_model !== "General" &&
    report.vehicle_model !== "Unknown" &&
    report.vehicle_model !== "Multiple";

  return (
    <div className="p-5 bg-card border border-border rounded-lg">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            report.type === "Real Range" ? "bg-blue-900/30 text-blue-400 border border-blue-900/50" :
            report.type === "Battery" ? "bg-orange-900/30 text-orange-400 border border-orange-900/50" :
            report.type === "Mechanical" ? "bg-red-900/30 text-red-400 border border-red-900/50" :
            "bg-emerald-900/30 text-emerald-400 border border-emerald-900/50"
          }`}>
            {getTypeLabel(report.type)}
          </span>
          {(report.vehicle_brand || showModelBadge) && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-background text-gray-300 border border-border">
              {report.vehicle_brand}{showModelBadge ? ` ${report.vehicle_model}` : ""}
            </span>
          )}
          {typeof report.estimated_range_km === "number" && report.estimated_range_km > 0 && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/15 text-primary border border-primary/40">
              ⚡ {formatRangeKm(report.estimated_range_km)}
            </span>
          )}
          {report.contradictory_info && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-900/50">
              ⚠️ {t("contradictory_warning")}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(report.report_date).toLocaleDateString(i18n.language === "en" ? "en-US" : "pt-PT")}
        </span>
      </div>
      <p className="text-gray-200">{report.description}</p>
      
      {report.source_link && (
        <div className="mt-4 pt-3 border-t border-border/50 text-xs">
          <button 
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:underline flex items-center gap-1"
          >
            {isExpanded ? t("hide_original_source") : t("show_original_source")}
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {isExpanded && report.source_link && (
        <div className="mt-4 w-full rounded-md overflow-hidden border border-border bg-black/20 flex flex-col">
          <div className="relative w-full" style={{ height: "600px", overflow: "auto" }}>
            <iframe 
              src={getEmbedUrl(report.source_link)} 
              className="absolute inset-0 w-full h-[1500px] bg-white/5"
              style={{ border: "none" }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation"
              title={t("original_source_title")}
              loading="lazy"
            />
          </div>
          <div className="bg-card p-3 text-center text-xs text-gray-400 border-t border-border flex items-center justify-center gap-2">
            <span>{t("iframe_fallback_question")}</span>
            <a href={report.source_link} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline flex items-center gap-1">
              {t("open_new_tab")}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand");
  const model = searchParams.get("model");
  const { t } = useTranslation();
  const { formatRangeKm } = useUnit();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [averageRangeKm, setAverageRangeKm] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    async function fetchReports() {
      if (!brand) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setFallbackActive(false);
      setAverageRangeKm(null);
      setSelectedType("All");
      try {
        let query = supabase.from("vehicles").select("id, brand, model").ilike("brand", brand);
        
        if (model && model.trim() !== "") {
           query = query.ilike("model", `%${model}%`);
        }

        const { data: vehicleData, error: vehicleError } = await query;

        if (vehicleError) throw vehicleError;
        
        let matchedVehicles: { id: string; brand: string; model: string }[] = [];

        if (!vehicleData || vehicleData.length === 0) {
          if (model && model.trim() !== "") {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("vehicles")
              .select("id, brand, model")
              .ilike("brand", brand);
              
            if (fallbackError) throw fallbackError;
            
            if (fallbackData && fallbackData.length > 0) {
              setFallbackActive(true);
              matchedVehicles = fallbackData;
            } else {
              setReports([]);
              return;
            }
          } else {
            setReports([]);
            return;
          }
        } else {
          matchedVehicles = vehicleData;
        }

        const vehicleIds = matchedVehicles.map(v => v.id);
        const vehicleMap = new Map(matchedVehicles.map(v => [v.id, v]));

        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select("*")
          .in("vehicle_id", vehicleIds)
          .order("created_at", { ascending: false });

        if (reportsError) throw reportsError;

        const enrichedReports: ReportItem[] = (reportsData || []).map((r: ReportItem) => {
          const vehicle = vehicleMap.get(r.vehicle_id);
          return {
            ...r,
            vehicle_brand: vehicle?.brand,
            vehicle_model: vehicle?.model,
          };
        });

        setReports(enrichedReports);

        const { data: statsData } = await supabase
          .from("stats")
          .select("average_range_km")
          .in("vehicle_id", vehicleIds);

        const statRanges = (statsData || [])
          .map((s: { average_range_km: number | null }) =>
            s.average_range_km !== null ? Number(s.average_range_km) : null
          )
          .filter((val): val is number => val !== null && !Number.isNaN(val) && val > 0);

        if (statRanges.length > 0) {
          setAverageRangeKm(statRanges.reduce((acc, v) => acc + v, 0) / statRanges.length);
        } else {
          const reportRanges = enrichedReports
            .map((r) => (typeof r.estimated_range_km === "number" ? r.estimated_range_km : null))
            .filter((val): val is number => val !== null && val > 0);
          if (reportRanges.length > 0) {
            setAverageRangeKm(reportRanges.reduce((acc, v) => acc + v, 0) / reportRanges.length);
          }
        }
      } catch (err: unknown) {
        console.error(err);
        let errorMsg = "Failed to fetch reports";
        if (err instanceof Error) {
          errorMsg = err.message;
        } else if (typeof err === "object" && err !== null) {
          const errObj = err as { message?: string; details?: string };
          errorMsg = errObj.message || errObj.details || JSON.stringify(err);
        }
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
        if (supabaseUrl === "https://placeholder.supabase.co") {
          errorMsg += " | __SUPABASE_ENV_ERROR__";
        }
        
        setError(errorMsg);
        fetch("/api/report-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ errorMessage: errorMsg, context: "ResultsPage Supabase Query" }),
        }).catch(() => {});
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [brand, model]);

  const getCategoryLabel = (type: string) => {
    if (type === "Real Range") return t("type_real_range");
    if (type === "Battery") return t("type_battery");
    if (type === "Mechanical") return t("type_mechanical");
    if (type === "Positives") return t("type_positives");
    return type;
  };

  // Build category counts strictly from the categories present in the current search results
  const categoryCounts = new Map<string, number>();
  for (const r of reports) {
    if (r.type) {
      categoryCounts.set(r.type, (categoryCounts.get(r.type) || 0) + 1);
    }
  }

  const availableCategories = Array.from(categoryCounts.entries()).map(([key, count]) => ({
    key,
    label: getCategoryLabel(key),
    count,
  }));

  const filteredReports =
    selectedType === "All" ? reports : reports.filter((r) => r.type === selectedType);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("search_results")}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-gray-400 text-lg">
              {brand} {model && !fallbackActive && <span className="opacity-75">{model}</span>}
            </p>
            {averageRangeKm !== null && (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-primary/15 text-primary border border-primary/40">
                ⚡ {t("avg_real_range")}: {formatRangeKm(averageRangeKm)}
              </span>
            )}
          </div>
        </div>
        <Link href="/" className="px-4 py-2 border border-border rounded-lg bg-card hover:bg-border transition text-sm">
          {t("new_search")}
        </Link>
      </div>

      {fallbackActive && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-lg text-yellow-200 text-sm">
          {t("fallback_notice", { model, brand })}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">{t("loading_reports")}</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200">
          {t("error_prefix")}: {error.replace("__SUPABASE_ENV_ERROR__", t("supabase_env_error"))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card/30">
          <p className="text-gray-400">{t("no_reports_title")}</p>
          <p className="text-sm text-gray-500 mt-2">{t("no_reports_subtitle")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 p-3 bg-card/50 border border-border rounded-xl">
            <span className="text-xs font-medium text-gray-400 mr-1">
              {t("filter_by_category")}
            </span>
            <button
              type="button"
              onClick={() => setSelectedType("All")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                selectedType === "All"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-gray-300 border-border hover:bg-border/50"
              }`}
            >
              {t("filter_all")} ({reports.length})
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedType(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  selectedType === cat.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-gray-300 border-border hover:bg-border/50"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          <div className="flex justify-between text-sm text-gray-400 border-b border-border pb-4">
            <span>{t("reports_found", { count: filteredReports.length })}</span>
            <span>{t("sorted_by_date")}</span>
          </div>
          
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </>
  );
}

export default function ResultsPage() {
  const { t } = useTranslation();

  return (
    <main className="max-w-4xl mx-auto p-8 mt-8 w-full">
      <Suspense fallback={
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">{t("loading")}</p>
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </main>
  );
}