"use client";

import { useTranslation } from "react-i18next";

export interface CountryMeasureStat {
  country: string;
  count: number;
}

interface IncentivesGaugeProps {
  countryStats: CountryMeasureStat[];
  totalMeasures: number;
  selectedCountry: string;
  onSelectCountry?: (country: string) => void;
}

export default function IncentivesGauge({
  countryStats,
  totalMeasures,
  selectedCountry,
  onSelectCountry,
}: IncentivesGaugeProps) {
  const { t } = useTranslation();

  if (totalMeasures === 0 || countryStats.length === 0) return null;

  const activeStat =
    selectedCountry !== "All"
      ? countryStats.find((c) => c.country.toLowerCase() === selectedCountry.toLowerCase()) ||
        countryStats[0]
      : countryStats[0];

  const activeCount = activeStat ? activeStat.count : 0;
  const activeCountryName = activeStat ? activeStat.country : selectedCountry;

  const pct = Math.max(0, Math.min(100, Math.round((activeCount / totalMeasures) * 100)));

  let needleColor = "#10b981";
  let badgeClass = "text-emerald-400 border-emerald-500/40 bg-emerald-950/40";
  if (pct < 15) {
    needleColor = "#ef4444";
    badgeClass = "text-red-400 border-red-500/40 bg-red-950/40";
  } else if (pct < 30) {
    needleColor = "#3b82f6";
    badgeClass = "text-blue-400 border-blue-500/40 bg-blue-950/40";
  }

  const needleAngleDeg = -120 + (pct / 100) * 240;
  const ticks = [0, 20, 40, 60, 80, 100];

  return (
    <section className="mb-8 p-6 bg-card border border-border rounded-2xl shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {t("incentives_gauge_title")}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {t("incentives_gauge_subtitle", { total: totalMeasures })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badgeClass}`}>
            {selectedCountry !== "All"
              ? t("incentives_gauge_selected_country", { country: activeCountryName })
              : t("incentives_gauge_top_country", { country: activeCountryName })}
            : {activeCount}/{totalMeasures} ({pct}%)
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 260 195" className="w-full max-w-[270px] overflow-visible">
            <defs>
              <linearGradient id="incentivesRaceGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="32%" stopColor="#f97316" />
                <stop offset="65%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="incGaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <path
              d="M 50.3 171 A 92 92 0 1 1 209.7 171"
              fill="none"
              stroke="#27272a"
              strokeWidth="16"
              strokeLinecap="round"
            />

            <path
              d="M 50.3 171 A 92 92 0 1 1 209.7 171"
              fill="none"
              stroke="url(#incentivesRaceGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="385"
              strokeDashoffset={385 - (pct / 100) * 385}
              filter="url(#incGaugeGlow)"
              style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />

            <path
              d="M 59 166 A 82 82 0 1 1 201 166"
              fill="none"
              stroke="url(#incentivesRaceGradient)"
              strokeWidth="2"
              strokeOpacity="0.35"
              strokeDasharray="4 4"
            />

            {ticks.map((tick) => {
              const deg = -120 + (tick / 100) * 240;
              const rad = ((deg - 90) * Math.PI) / 180;
              const x1 = 130 + Math.cos(rad) * 72;
              const y1 = 125 + Math.sin(rad) * 72;
              const x2 = 130 + Math.cos(rad) * 63;
              const y2 = 125 + Math.sin(rad) * 63;
              const tx = 130 + Math.cos(rad) * 51;
              const ty = 125 + Math.sin(rad) * 51;
              return (
                <g key={tick}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#71717a" strokeWidth="2" />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-400 text-[10px] font-mono font-semibold"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}

            <g
              transform={`translate(130, 125) rotate(${needleAngleDeg})`}
              style={{ transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              <polygon points="-3.5,12 0,-78 3.5,12" fill={needleColor} />
              <circle cx="0" cy="0" r="9" fill="#18181b" stroke={needleColor} strokeWidth="3" />
            </g>

            <text
              x="130"
              y="160"
              textAnchor="middle"
              className="fill-white text-3xl font-mono font-extrabold tracking-tight"
            >
              {pct}%
            </text>
            <text
              x="130"
              y="178"
              textAnchor="middle"
              className="fill-gray-400 text-[10px] font-mono uppercase tracking-widest"
            >
              {activeCountryName} ({activeCount}/{totalMeasures})
            </text>
          </svg>
        </div>

        <div className="md:col-span-7 space-y-3">
          <div className="max-h-[210px] overflow-y-auto pr-1 space-y-2.5">
            {countryStats.slice(0, 8).map((item) => {
              const itemPct = Math.round((item.count / totalMeasures) * 100);
              const isSelected =
                selectedCountry.toLowerCase() === item.country.toLowerCase();
              return (
                <div
                  key={item.country}
                  onClick={() => onSelectCountry && onSelectCountry(item.country)}
                  className={`cursor-pointer p-2 rounded-lg border transition ${
                    isSelected
                      ? "bg-purple-950/30 border-purple-500/60"
                      : "bg-background/40 border-border/60 hover:border-border"
                  }`}
                >
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-white">
                      {item.country}
                    </span>
                    <span className="text-gray-300 font-mono">
                      {item.count} / {totalMeasures} ({itemPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(4, itemPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 p-3.5 rounded-xl bg-background/70 border border-border/80 text-xs text-gray-300 leading-relaxed">
            <strong className="text-primary block mb-1 uppercase tracking-wider text-[11px]">
              {t("incentives_verdict_title")}
            </strong>
            <p>
              {t("incentives_verdict_summary", {
                country: activeCountryName,
                count: activeCount,
                total: totalMeasures,
                pct,
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
