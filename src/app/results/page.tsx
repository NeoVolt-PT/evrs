"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { useUnit } from "@/components/Providers";
import RaceGauge from "@/components/RaceGauge";
import IncentivesGauge, { CountryMeasureStat } from "@/components/IncentivesGauge";
import MonetizationCards from "@/components/MonetizationCards";
import {
  CURATED_INCENTIVES,
  detectCountryFromReport,
  isIncentiveText,
  localizeCountryName,
} from "@/lib/defaultIncentives";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

const clientTranslationCache = new Map<string, string>();

interface ReportItem {
  id: string;
  vehicle_id: string;
  type: string;
  description: string;
  description_pt?: string;
  description_en?: string;
  source_link?: string | null;
  report_date: string;
  language_original?: string;
  contradictory_info?: boolean;
  estimated_range_km?: number | null;
  vehicle_brand?: string;
  vehicle_model?: string;
  model_pt?: string;
  model_en?: string;
  country?: string;
}

const EV_KEYWORD_REGEX =
  /(\*\*[^*]+\*\*|(?:€|\$|£)\s*\d+(?:[.,]\d+)?(?:\s*(?:mil|k|billion|million|B|M))?|\b\d+(?:[.,]\d+)?\s*(?:km\/h|km|miles|mi|kWh|kW|mph|%|°C|°F|V|A|Wh\/km|mi\/kWh|years|anos|ans|años|Jahre|months|meses|mois|Monate|NOK|RMB)\b|\b(?:real[- ]world range|range|autonomia|autonomía|autonomie|Reichweite|battery|bateria|batería|batterie|batteries|Batterie|fast[- ]charging|supercharger|charging|carregamento|carga|recharge|Laden|Schnellladen|degradation|degradação|degradación|dégradation|WLTP|EPA|LFP|NMC|BMS|ICCU|12V|heat pump|bomba de calor|pompe à chaleur|Wärmepumpe|recall|rappel|Rückruf|software|logiciel|OTA|inverter|inversor|onduleur|Wechselrichter|motor|moteur|Motor|suspension|suspensão|suspensión|Fahrwerk|brakes|travões|frenos|freins|Bremsen|efficiency|eficiência|eficiencia|efficacité|Effizienz|consumption|consumo|consommation|Verbrauch|winter|inverno|invierno|hiver|Winter|highway|autoestrada|autopista|autoroute|Autobahn|AWD|RWD|FWD|NACS|CCS|Type 2|regenerative braking|regeneração|state of health|SoH|thermal|warranty|garantia|garantía|garantie|Garantie|reliability|fiabilidade|fiabilidad|fiabilité|Zuverlässigkeit|Fundo Ambiental|ISV|IUC|IVA|VAT|tax credit|subsidy|subsidies|incentive|incentives|rebate|rebates|discount|discounts|apoio|incentivo|desconto|isenção|Plan MOVES|Bonus Écologique|Leasing Social|Förderung|Kaufprämie|ayuda|subvención)\b)/gi;

function renderHighlightedText(text: string) {
  const parts = text.split(EV_KEYWORD_REGEX);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <span
          key={idx}
          className="text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded"
        >
          {part.slice(2, -2)}
        </span>
      );
    }
    if (EV_KEYWORD_REGEX.test(part)) {
      EV_KEYWORD_REGEX.lastIndex = 0;
      return (
        <span
          key={idx}
          className="text-primary font-semibold bg-primary/10 px-1 py-0.5 rounded"
        >
          {part}
        </span>
      );
    }
    EV_KEYWORD_REGEX.lastIndex = 0;
    return <span key={idx}>{part}</span>;
  });
}

function getExpandedContextText(
  report: ReportItem,
  lang: string,
  formattedRange: string | null
): string | null {
  if ((report.description || "").length >= 240) return null;

  const vehicleName = [
    report.vehicle_brand,
    report.vehicle_model &&
    !["General", "Unknown", "Multiple"].includes(report.vehicle_model)
      ? report.vehicle_model
      : "",
  ]
    .filter(Boolean)
    .join(" ") || "EV";

  const shortLang = (lang || "pt").slice(0, 2).toLowerCase();

  if (report.type === "Real Range") {
    if (shortLang === "pt")
      return `Análise complementar para ${vehicleName}: Este registo foca-se no desempenho de **autonomia** e **eficiência** energética em utilização real${formattedRange ? ` (estimativa registada de **${formattedRange}**)` : ""}. Em comparação com os ciclos **WLTP** e **EPA**, fatores como velocidade em **autoestrada**, climatização e gestão térmica da **bateria** influenciam diretamente o **consumo** final.`;
    if (shortLang === "fr")
      return `Analyse complémentaire pour ${vehicleName} : Ce rapport évalue l'**autonomie** réelle et l'**efficacité** énergétique en conditions réelles${formattedRange ? ` (estimation enregistrée de **${formattedRange}**)` : ""}. Par rapport aux normes **WLTP** et **EPA**, la conduite sur **autoroute** et la gestion thermique de la **batterie** influencent directement la **consommation**.`;
    if (shortLang === "es")
      return `Análisis complementario para ${vehicleName}: Este informe evalúa la **autonomía** real y la **eficiencia** energética en conducción práctica${formattedRange ? ` (estimación registrada de **${formattedRange}**)` : ""}. Frente a los ciclos **WLTP** y **EPA**, la velocidad en **autopista** y la gestión térmica de la **batería** influyen directamente en el **consumo**.`;
    if (shortLang === "de")
      return `Ergänzende Analyse für ${vehicleName}: Dieser Bericht bewertet die reale **Reichweite** und **Effizienz** unter Praxisbedingungen${formattedRange ? ` (erfasster Wert von **${formattedRange}**)` : ""}. Im Vergleich zu **WLTP** und **EPA** beeinflussen **Autobahn**-Geschwindigkeit und das Thermomanagement der **Batterie** direkt den **Verbrauch**.`;
    return `Additional telemetry context for ${vehicleName}: This report evaluates **real-world range** and energy **efficiency** under practical driving conditions${formattedRange ? ` (recorded estimate of **${formattedRange}**)` : ""}. Compared to official **WLTP** and **EPA** ratings, **highway** speeds, cabin heating, and **battery** thermal management directly impact net **consumption**.`;
  }

  if (report.type === "Battery") {
    if (shortLang === "pt")
      return `Análise complementar para ${vehicleName}: Este alerta incide sobre o sistema de **bateria** de alta tensão, células **LFP** / **NMC**, curva de **carregamento** rápido ou gestão eletrónica **BMS** / **12V**. Recomenda-se monitorizar o estado de saúde (**SoH**), estabilidade em postos **CCS** e eventuais atualizações de **software** (**OTA**) ou campanhas de **recall**.`;
    if (shortLang === "fr")
      return `Analyse complémentaire pour ${vehicleName} : Ce rapport porte sur le système de **batterie** haute tension, la courbe de **recharge** rapide, le **BMS** ou la batterie **12V**. Il est conseillé de vérifier l'état de santé (**SoH**), les mises à jour **OTA** et les campagnes de **rappel**.`;
    if (shortLang === "es")
      return `Análisis complementario para ${vehicleName}: Este aviso se centra en el sistema de **batería** de alta tensión, la curva de **carga** rápida, la gestión **BMS** o el sistema auxiliar de **12V**. Se recomienda supervisar el estado de salud (**SoH**) y las actualizaciones **OTA**.`;
    if (shortLang === "de")
      return `Ergänzende Analyse für ${vehicleName}: Dieser Bericht betrifft die Hochvolt-**Batterie**, das **Schnellladen**, das **BMS** oder das **12V**-Bordnetz. Es wird empfohlen, den Gesundheitszustand (**SoH**), **OTA**-**Software**-Updates und eventuelle **Rückruf**-Aktionen zu prüfen.`;
    return `Additional telemetry context for ${vehicleName}: This report highlights high-voltage **battery** behavior, **fast-charging** stability, **BMS** management, or **12V** auxiliary system performance. Owners and buyers should verify State of Health (**SoH**) diagnostics, **OTA** **software** updates, and any applicable **recall** bulletins.`;
  }

  if (report.type === "Mechanical") {
    if (shortLang === "pt")
      return `Análise complementar para ${vehicleName}: Este registo documenta componentes de **fiabilidade** física, incluindo **motor** elétrico, **inversor**, **suspensão**, direção ou sistema de **travões**. A verificação preventiva durante o período de **garantia** ajuda a mitigar custos de manutenção inesperados.`;
    if (shortLang === "fr")
      return `Analyse complémentaire pour ${vehicleName} : Cet enregistrement documente la **fiabilité** mécanique, notamment le **moteur** électrique, l'**onduleur**, la **suspension** ou les **freins**. Une vérification sous **garantie** est recommandée.`;
    if (shortLang === "es")
      return `Análisis complementario para ${vehicleName}: Este registro documenta componentes de **fiabilidad** mecánica, como el **motor** eléctrico, **inversor**, **suspensión** o **frenos**. Se recomienda una revisión preventiva durante la **garantía**.`;
    if (shortLang === "de")
      return `Ergänzende Analyse für ${vehicleName}: Dieser Eintrag dokumentiert die mechanische **Zuverlässigkeit** wie Elektro-**Motor**, **Wechselrichter**, **Fahrwerk** oder **Bremsen**. Eine rechtzeitige Prüfung innerhalb der **Garantie** wird empfohlen.`;
    return `Additional telemetry context for ${vehicleName}: This entry documents physical **reliability** and hardware components such as the drive **motor**, **inverter**, **suspension**, steering, or **brakes**. Proactive inspection under factory **warranty** is recommended to prevent long-term wear issues.`;
  }

  if (report.type === "Incentives") {
    const countryLabel = localizeCountryName(
      report.country || report.vehicle_brand || "Global",
      shortLang
    );
    if (shortLang === "pt")
      return `Enquadramento em ${countryLabel}: Esta medida integra o pacote de **incentivos**, **descontos** diretos ou benefícios fiscais (**ISV**, **IUC**, **IVA** ou **Fundo Ambiental**) aplicáveis à aquisição de veículos elétricos e instalação de postos de **carregamento**.`;
    if (shortLang === "fr")
      return `Contexte réglementaire (${countryLabel}) : Cette mesure fait partie des **Bonus Écologique**, exonérations fiscales ou aides à la **recharge** visant à accélérer l'adoption des véhicules électriques.`;
    if (shortLang === "es")
      return `Contexto normativo (${countryLabel}): Esta medida forma parte del paquete de **ayuda**, **subvención** (**Plan MOVES**), deducciones fiscales o ayudas de **carga** aplicables a vehículos eléctricos.`;
    if (shortLang === "de")
      return `Politischer Rahmen (${countryLabel}): Diese Maßnahme gehört zu den nationalen **Förderung**-Programmen, **Kaufprämie**-Rabatten, Steuerbefreiungen oder Zuschüssen für **Laden**-Infrastruktur.`;
    return `Policy context in ${countryLabel}: This measure is part of the national **incentives**, purchase **rebates**, **tax credit** exemptions, or **charging** infrastructure grants aimed at accelerating electric vehicle adoption.`;
  }

  if (shortLang === "pt")
    return `Análise complementar para ${vehicleName}: Os indicadores deste relato destacam positivamente a **fiabilidade**, conforto de condução, **eficiência** elétrica e integração de **software** do veículo, contribuindo favoravelmente para a pontuação global no Índice EVRS.`;
  if (shortLang === "fr")
    return `Analyse complémentaire pour ${vehicleName} : Ce retour souligne positivement la **fiabilité**, le confort de conduite, l'**efficacité** électrique et le **logiciel** du véhicule dans l'Indice EVRS.`;
  if (shortLang === "es")
    return `Análisis complementario para ${vehicleName}: Este informe destaca positivamente la **fiabilidad**, la **eficiencia** eléctrica y el **software** del vehículo en el Índice EVRS.`;
  if (shortLang === "de")
    return `Ergänzende Analyse für ${vehicleName}: Dieser Bericht hebt die **Zuverlässigkeit**, die elektrische **Effizienz** und die **Software**-Integration des Fahrzeugs im EVRS-Index positiv hervor.`;
  return `Additional telemetry context for ${vehicleName}: This report highlights positive owner satisfaction, driving dynamics, electrical **efficiency**, and **software** integration, contributing favorably to the vehicle's overall **reliability** score in the EVRS Index.`;
}

const DATE_LOCALES: Record<string, string> = {
  pt: "pt-PT",
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
};

function ReportCard({ report }: { report: ReportItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, i18n } = useTranslation();
  const { formatRangeKm } = useUnit();
  const rawLang = (i18n.language || "pt").slice(0, 2).toLowerCase();
  const lang = ["pt", "en", "fr", "es", "de"].includes(rawLang) ? rawLang : "pt";

  const hasStaticTranslation =
    (lang === "pt" && Boolean(report.description_pt)) ||
    (lang === "en" && Boolean(report.description_en));

  const initialText =
    lang === "pt" && report.description_pt
      ? report.description_pt
      : lang === "en" && report.description_en
      ? report.description_en
      : report.description || "";

  const cacheKey = `${lang}:${report.id}`;
  const [, setTranslationTick] = useState(0);

  useEffect(() => {
    if (hasStaticTranslation || !report.description) {
      return;
    }
    const origLang = (report.language_original || "EN").slice(0, 2).toLowerCase();
    if (lang === origLang) {
      return;
    }
    if (clientTranslationCache.has(cacheKey)) {
      return;
    }

    let cancelled = false;
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: report.description, targetLang: lang }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.translatedText) {
          clientTranslationCache.set(cacheKey, data.translatedText);
          setTranslationTick((v) => v + 1);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [lang, cacheKey, hasStaticTranslation, report.id, report.description, report.language_original]);

  const activeTranslated = clientTranslationCache.get(cacheKey);
  const origLangCode = (report.language_original || "EN").slice(0, 2).toLowerCase();

  const displayedDescription = hasStaticTranslation
    ? initialText
    : activeTranslated && lang !== origLangCode
    ? activeTranslated
    : initialText;

  const localizedModel =
    lang === "pt" && report.model_pt
      ? report.model_pt
      : lang === "en" && report.model_en
      ? report.model_en
      : report.vehicle_model;

  const localizedBrand =
    report.type === "Incentives" && report.country && report.vehicle_brand === report.country
      ? localizeCountryName(report.country, lang)
      : report.vehicle_brand;

  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        const videoId =
          urlObj.searchParams.get("v") ||
          (urlObj.hostname.includes("youtu.be") ? urlObj.pathname.slice(1) : "");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      return `/api/source-preview?url=${encodeURIComponent(url)}`;
    } catch {
      return `/api/source-preview?url=${encodeURIComponent(url)}`;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "Real Range") return t("type_real_range");
    if (type === "Battery") return t("type_battery");
    if (type === "Mechanical") return t("type_mechanical");
    if (type === "Positives") return t("type_positives");
    if (type === "Incentives") return t("type_incentives");
    return type;
  };

  const showModelBadge =
    localizedModel &&
    localizedModel !== "General" &&
    localizedModel !== "Unknown" &&
    localizedModel !== "Multiple";

  return (
    <div className="p-5 bg-card border border-border rounded-lg">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            report.type === "Real Range" ? "bg-blue-900/30 text-blue-400 border border-blue-900/50" :
            report.type === "Battery" ? "bg-orange-900/30 text-orange-400 border border-orange-900/50" :
            report.type === "Mechanical" ? "bg-red-900/30 text-red-400 border border-red-900/50" :
            report.type === "Incentives" ? "bg-purple-900/30 text-purple-300 border border-purple-500/50" :
            "bg-emerald-900/30 text-emerald-400 border border-emerald-900/50"
          }`}>
            {getTypeLabel(report.type)}
          </span>
          {report.country && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-950/50 text-purple-200 border border-purple-500/40">
              🌍 {localizeCountryName(report.country, lang)}
            </span>
          )}
          {(localizedBrand || showModelBadge) && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-background text-gray-300 border border-border">
              {localizedBrand}{showModelBadge ? ` — ${localizedModel}` : ""}
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
          {new Date(report.report_date).toLocaleDateString(DATE_LOCALES[lang] || "pt-PT")}
        </span>
      </div>
      <div className="space-y-2.5 text-sm md:text-base leading-relaxed">
        <p className="text-gray-100">
          {renderHighlightedText(displayedDescription)}
        </p>
        {(() => {
          const extraContext = getExpandedContextText(
            report,
            i18n.language,
            typeof report.estimated_range_km === "number" && report.estimated_range_km > 0
              ? formatRangeKm(report.estimated_range_km)
              : null
          );
          return extraContext ? (
            <p className="text-xs md:text-sm text-gray-300 border-l-2 border-primary/40 pl-3 py-0.5">
              {renderHighlightedText(extraContext)}
            </p>
          ) : null;
        })()}
      </div>
      
      {report.source_link && (
        <div className="mt-4 pt-3 border-t border-border/50 text-xs">
          <button 
            type="button"
            onClick={() => {
              const nextState = !isExpanded;
              setIsExpanded(nextState);
              if (nextState) {
                trackEvent("view_original_source", {
                  brand: report.vehicle_brand || "Unknown",
                  model: report.vehicle_model || "All",
                  category: report.type,
                  source_url: report.source_link,
                });
              }
            }}
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
  const { t, i18n } = useTranslation();
  const { formatRangeKm } = useUnit();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [averageRangeKm, setAverageRangeKm] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fallbackActive, setFallbackActive] = useState(false);

  const isGlobalIncentivesMode = (brand || "").toLowerCase() === "incentives";

  useEffect(() => {
    async function fetchReports() {
      if (!brand) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setFallbackActive(false);
      setAverageRangeKm(null);
      setSelectedType(isGlobalIncentivesMode ? "Incentives" : "All");
      setSelectedCountry(model && isGlobalIncentivesMode ? model : "All");

      try {
        if (isGlobalIncentivesMode) {
          // Fetch all vehicles & reports to extract policy/discount/incentive measures across countries
          const [vRes, rRes] = await Promise.all([
            supabase.from("vehicles").select("id, brand, model"),
            supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(300),
          ]);

          const vMap = new Map(
            ((vRes.data || []) as { id: string; brand: string; model: string }[]).map((v) => [v.id, v])
          );

          const dbIncentives: ReportItem[] = [];
          for (const r of (rRes.data || []) as ReportItem[]) {
            const v = vMap.get(r.vehicle_id);
            const combinedText = `${v?.brand || ""} ${v?.model || ""} ${r.description || ""}`;
            if (r.type === "Incentives" || v?.brand === "Incentives" || isIncentiveText(combinedText)) {
              const detectedCountry = detectCountryFromReport(combinedText, v?.model);
              dbIncentives.push({
                ...r,
                type: "Incentives",
                vehicle_brand: v?.brand === "Incentives" ? detectedCountry : v?.brand,
                vehicle_model: v?.brand === "Incentives" ? "" : v?.model,
                country: detectedCountry,
              });
            }
          }

          const mergedIncentives = [...CURATED_INCENTIVES, ...dbIncentives];
          setReports(mergedIncentives);
          return;
        }

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

        const vehicleIds = matchedVehicles.map((v) => v.id);
        const vehicleMap = new Map(matchedVehicles.map((v) => [v.id, v]));

        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select("*")
          .in("vehicle_id", vehicleIds)
          .order("created_at", { ascending: false });

        if (reportsError) throw reportsError;

        const enrichedReports: ReportItem[] = (reportsData || []).map((r: ReportItem) => {
          const vehicle = vehicleMap.get(r.vehicle_id);
          const isInc = r.type === "Incentives" || isIncentiveText(r.description || "");
          const country = isInc
            ? detectCountryFromReport(r.description || "", vehicle?.model)
            : undefined;
          return {
            ...r,
            type: isInc ? "Incentives" : r.type,
            vehicle_brand: vehicle?.brand,
            vehicle_model: vehicle?.model,
            country,
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
  }, [brand, model, isGlobalIncentivesMode]);

  const getCategoryLabel = (type: string) => {
    if (type === "Real Range") return t("type_real_range");
    if (type === "Battery") return t("type_battery");
    if (type === "Mechanical") return t("type_mechanical");
    if (type === "Positives") return t("type_positives");
    if (type === "Incentives") return t("type_incentives");
    return type;
  };

  const getCategoryFilterClasses = (type: string, isSelected: boolean) => {
    switch (type) {
      case "Real Range":
        return isSelected
          ? "bg-blue-500/30 text-blue-200 border-blue-400 ring-2 ring-blue-500/40"
          : "bg-blue-900/30 text-blue-400 border-blue-900/50 hover:bg-blue-900/50";
      case "Battery":
        return isSelected
          ? "bg-orange-500/30 text-orange-200 border-orange-400 ring-2 ring-orange-500/40"
          : "bg-orange-900/30 text-orange-400 border-orange-900/50 hover:bg-orange-900/50";
      case "Mechanical":
        return isSelected
          ? "bg-red-500/30 text-red-200 border-red-400 ring-2 ring-red-500/40"
          : "bg-red-900/30 text-red-400 border-red-900/50 hover:bg-red-900/50";
      case "Incentives":
        return isSelected
          ? "bg-purple-500/30 text-purple-200 border-purple-400 ring-2 ring-purple-500/40"
          : "bg-purple-900/30 text-purple-300 border-purple-500/50 hover:bg-purple-900/50";
      default:
        return isSelected
          ? "bg-emerald-500/30 text-emerald-200 border-emerald-400 ring-2 ring-emerald-500/40"
          : "bg-emerald-900/30 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/50";
    }
  };

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

  const isIncentivesCategorySelected =
    isGlobalIncentivesMode || selectedType === "Incentives";

  const incentiveReports = reports.filter((r) => r.type === "Incentives");
  const countryMap = new Map<string, number>();
  for (const r of incentiveReports) {
    const c = r.country || "Global";
    countryMap.set(c, (countryMap.get(c) || 0) + 1);
  }
  const countryStats: CountryMeasureStat[] = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));

  const filteredReports = reports.filter((r) => {
    const matchesType = selectedType === "All" || r.type === selectedType;
    if (!matchesType) return false;
    if (isIncentivesCategorySelected && selectedCountry !== "All") {
      return (r.country || "Global").toLowerCase() === selectedCountry.toLowerCase();
    }
    return true;
  });

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isGlobalIncentivesMode ? t("incentives_page_title") : t("search_results")}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            {!isGlobalIncentivesMode && (
              <p className="text-gray-400 text-lg">
                {brand} {model && !fallbackActive && <span className="opacity-75">{model}</span>}
              </p>
            )}
            {averageRangeKm !== null && !isIncentivesCategorySelected && (
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
          {isIncentivesCategorySelected ? (
            <IncentivesGauge
              countryStats={countryStats}
              totalMeasures={incentiveReports.length}
              selectedCountry={selectedCountry}
              onSelectCountry={(country) => setSelectedCountry(country)}
            />
          ) : (
            <RaceGauge
              vehicleName={[brand, model && !fallbackActive ? model : ""].filter(Boolean).join(" ")}
              reports={reports}
              averageRangeKm={averageRangeKm}
            />
          )}
          {!isGlobalIncentivesMode && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-card/50 border border-border rounded-xl">
              <span className="text-xs font-medium text-gray-400 mr-1">
                {t("filter_by_category")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedType("All");
                  setSelectedCountry("All");
                  trackEvent("filter_category", { category: "All", brand: brand || "" });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  selectedType === "All"
                    ? "bg-white/15 text-white border-white/50 ring-2 ring-white/20"
                    : "bg-card text-gray-300 border-border hover:bg-border/50"
                }`}
              >
                {t("filter_all")} ({reports.length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setSelectedType(cat.key);
                    setSelectedCountry("All");
                    trackEvent("filter_category", { category: cat.key, brand: brand || "" });
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${getCategoryFilterClasses(
                    cat.key,
                    selectedType === cat.key
                  )}`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          )}

          {isIncentivesCategorySelected && countryStats.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-card/50 border border-purple-500/30 rounded-xl">
              <span className="text-xs font-medium text-purple-300 mr-1">
                🌍 {t("incentives_filter_country")}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCountry("All")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  selectedCountry === "All"
                    ? "bg-purple-500/30 text-purple-100 border-purple-400 ring-2 ring-purple-500/40"
                    : "bg-card text-gray-300 border-border hover:bg-border/50"
                }`}
              >
                {t("incentives_all_countries")} ({incentiveReports.length})
              </button>
              {countryStats.map((c) => (
                <button
                  key={c.country}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(c.country);
                    trackEvent("filter_category", {
                      category: "Incentives_Country",
                      country: c.country,
                    });
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    selectedCountry.toLowerCase() === c.country.toLowerCase()
                      ? "bg-purple-500/30 text-purple-100 border-purple-400 ring-2 ring-purple-500/40"
                      : "bg-purple-900/20 text-purple-300 border-purple-800/50 hover:bg-purple-900/40"
                  }`}
                >
                  {localizeCountryName(c.country, i18n.language)} ({c.count})
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between text-sm text-gray-400 border-b border-border pb-4">
            <span>{t("reports_found", { count: filteredReports.length })}</span>
            <span>{t("sorted_by_date")}</span>
          </div>
          
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}

          <MonetizationCards brand={brand} model={!fallbackActive ? model : null} />
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