"use client";

import { useTranslation } from "react-i18next";
import {
  COUNTRY_ANNUAL_INVESTMENT,
  localizeCountryName,
  AnnualInvestmentPoint,
} from "@/lib/defaultIncentives";

const LABELS: Record<
  string,
  {
    title: string;
    subtitle: string;
    budgetLabel: string;
    grantLabel: string;
    millionsUnit: string;
    perVehicle: string;
  }
> = {
  pt: {
    title: "Investimento Público & Apoio Anual à Eletrificação",
    subtitle: "Evolução anual do orçamento de incentivos e apoio máximo por veículo (2022–2026)",
    budgetLabel: "Orçamento / Investimento Anual",
    grantLabel: "Apoio Máx. / Veículo",
    millionsUnit: "M€",
    perVehicle: "/ EV",
  },
  en: {
    title: "Public EV Investment & Annual Support by Year",
    subtitle: "Annual evolution of electrification incentive budgets and max grant per vehicle (2022–2026)",
    budgetLabel: "Annual Investment Budget",
    grantLabel: "Max Grant / Vehicle",
    millionsUnit: "M€",
    perVehicle: "/ EV",
  },
  fr: {
    title: "Investissement Public & Aides Annuelles par Année",
    subtitle: "Évolution annuelle du budget des aides et bonus maximal par véhicule (2022–2026)",
    budgetLabel: "Budget d'Investissement Annuel",
    grantLabel: "Aide Max / Véhicule",
    millionsUnit: "M€",
    perVehicle: "/ VE",
  },
  es: {
    title: "Inversión Pública y Apoyo Anual por Año",
    subtitle: "Evolución anual del presupuesto de incentivos y ayuda máxima por vehículo (2022–2026)",
    budgetLabel: "Presupuesto de Inversión Anual",
    grantLabel: "Ayuda Máx. / Vehículo",
    millionsUnit: "M€",
    perVehicle: "/ EV",
  },
  de: {
    title: "Öffentliche Investitionen & Jährliche EV-Förderung",
    subtitle: "Jährliche Entwicklung des Förderbudgets und maximale Prämie pro Fahrzeug (2022–2026)",
    budgetLabel: "Jährliches Förderbudget",
    grantLabel: "Max. Prämie / Fahrzeug",
    millionsUnit: "Mio. €",
    perVehicle: "/ EV",
  },
};

export default function CountryInvestmentChart({ country }: { country: string }) {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "pt").slice(0, 2).toLowerCase();
  const l = LABELS[lang] || LABELS.pt;

  const series: AnnualInvestmentPoint[] =
    COUNTRY_ANNUAL_INVESTMENT[country] || [
      { year: 2022, budgetMillionsEur: 120, maxGrantEur: 4000 },
      { year: 2023, budgetMillionsEur: 160, maxGrantEur: 4000 },
      { year: 2024, budgetMillionsEur: 210, maxGrantEur: 4500 },
      { year: 2025, budgetMillionsEur: 260, maxGrantEur: 4500 },
      { year: 2026, budgetMillionsEur: 300, maxGrantEur: 4500 },
    ];

  const maxBudget = Math.max(...series.map((s) => s.budgetMillionsEur), 1);
  const localizedCountry = localizeCountryName(country, lang);

  return (
    <div className="mt-4 p-5 rounded-2xl bg-card/80 border border-purple-500/30 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            📊 {l.title} — <span className="text-purple-300">{localizedCountry}</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{l.subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
            {l.budgetLabel}
          </span>
          <span className="flex items-center gap-1.5 text-purple-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
            {l.grantLabel}
          </span>
        </div>
      </div>

      {/* Bar Chart Grid by Year */}
      <div className="grid grid-cols-5 gap-3 items-end pt-4 pb-2 px-2 bg-background/60 rounded-xl border border-border/60">
        {series.map((point) => {
          const heightPct = Math.max(12, Math.round((point.budgetMillionsEur / maxBudget) * 100));
          return (
            <div key={point.year} className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-purple-300 mb-1">
                €{point.maxGrantEur.toLocaleString()} {l.perVehicle}
              </span>
              <div className="w-full max-w-[54px] h-28 bg-zinc-900/90 rounded-t-lg flex items-end justify-center p-1 border-b border-border">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-300 transition-all duration-700 flex items-start justify-center pt-1"
                  style={{ height: `${heightPct}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-950 drop-shadow">
                    {point.budgetMillionsEur}
                    {l.millionsUnit}
                  </span>
                </div>
              </div>
              <span className="mt-2 text-xs font-mono font-bold text-gray-200">
                {point.year}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
