"use client";

import { useTranslation } from "react-i18next";
import { useUnit } from "@/components/Providers";

export interface GaugeReportItem {
  type: string;
  contradictory_info?: boolean;
  estimated_range_km?: number | null;
}

interface RaceGaugeProps {
  vehicleName: string;
  reports: GaugeReportItem[];
  averageRangeKm: number | null;
}

export default function RaceGauge({ vehicleName, reports, averageRangeKm }: RaceGaugeProps) {
  const { t } = useTranslation();
  const { formatRangeKm } = useUnit();

  const total = reports.length;
  if (total === 0) return null;

  let positivesCount = 0;
  let realRangeCount = 0;
  let batteryCount = 0;
  let mechanicalCount = 0;
  let contradictoryCount = 0;

  for (const r of reports) {
    if (r.type === "Positives") positivesCount++;
    else if (r.type === "Real Range") realRangeCount++;
    else if (r.type === "Battery") batteryCount++;
    else if (r.type === "Mechanical") mechanicalCount++;
    if (r.contradictory_info) contradictoryCount++;
  }

  const criticalCount = batteryCount + mechanicalCount;

  // Bayesian Volume-Weighted EVRS 0-100 Score
  const weightedPoints =
    1.0 * positivesCount +
    0.85 * realRangeCount -
    0.15 * batteryCount -
    0.1 * contradictoryCount;

  const rawRatio = Math.max(0, Math.min(1, weightedPoints / total));
  const priorWeight = 3;
  const priorBaseline = 50;
  const score = Math.max(
    0,
    Math.min(100, Math.round((priorBaseline * priorWeight + rawRatio * 100 * total) / (priorWeight + total)))
  );

  let tierLabel = t("index_tier_optimal");
  let tierColorClass = "text-emerald-400 border-emerald-500/40 bg-emerald-950/40";
  let needleColor = "#10b981";

  if (score < 40) {
    tierLabel = t("index_tier_critical");
    tierColorClass = "text-red-400 border-red-500/40 bg-red-950/40";
    needleColor = "#ef4444";
  } else if (score < 70) {
    tierLabel = t("index_tier_moderate");
    tierColorClass = "text-blue-400 border-blue-500/40 bg-blue-950/40";
    needleColor = "#3b82f6";
  }

  let confidenceLabel = t("confidence_low");
  if (total >= 15) confidenceLabel = t("confidence_high");
  else if (total >= 5) confidenceLabel = t("confidence_medium");

  const posPct = Math.round((positivesCount / total) * 100);
  const rangePct = Math.round((realRangeCount / total) * 100);
  const critPct = Math.round((criticalCount / total) * 100);

  const needleAngleDeg = -120 + (score / 100) * 240;
  const ticks = [0, 20, 40, 60, 80, 100];

  return (
    <section className="mb-8 p-6 bg-card border border-border rounded-2xl shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏁 {t("evrs_index_title")}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t("evrs_index_subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs rounded-full bg-background border border-border text-gray-300">
            {t("data_confidence")}: <strong className="text-white">{confidenceLabel}</strong> ({total})
          </span>
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${tierColorClass}`}>
            {tierLabel}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 260 195" className="w-full max-w-[270px] overflow-visible">
            <defs>
              <linearGradient id="evrsRaceGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="32%" stopColor="#f97316" />
                <stop offset="65%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
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
              stroke="url(#evrsRaceGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="385"
              strokeDashoffset={385 - (score / 100) * 385}
              filter="url(#gaugeGlow)"
              style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />

            <path
              d="M 59 166 A 82 82 0 1 1 201 166"
              fill="none"
              stroke="url(#evrsRaceGradient)"
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
                    {tick}
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
              y="162"
              textAnchor="middle"
              className="fill-white text-3xl font-mono font-extrabold tracking-tight"
            >
              {score}
            </text>
            <text
              x="130"
              y="180"
              textAnchor="middle"
              className="fill-gray-400 text-[10px] font-mono uppercase tracking-widest"
            >
              / 100 INDEX
            </text>
          </svg>
        </div>
        <div className="md:col-span-7 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                {t("type_positives")}
              </span>
              <span className="text-gray-300 font-mono">
                {positivesCount} ({posPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-border">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${posPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-blue-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
                {t("type_real_range")}
              </span>
              <span className="text-gray-300 font-mono">
                {realRangeCount} ({rangePct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-border">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${rangePct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-red-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 inline-block"></span>
                {t("critical_issues")}
              </span>
              <span className="text-gray-300 font-mono">
                {criticalCount} ({critPct}%) — {t("type_battery")}: {batteryCount} | {t("type_mechanical")}: {mechanicalCount}
              </span>
            </div>
            <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-border">
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-700" style={{ width: `${critPct}%` }} />
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-background/70 border border-border/80 text-xs text-gray-300 leading-relaxed">
            <strong className="text-primary block mb-1 uppercase tracking-wider text-[11px]">
              {t("verdict_title")}
            </strong>
            <p>
              {t("verdict_summary", {
                total,
                vehicle: vehicleName,
                score,
                tier: tierLabel,
                posPct,
                rangePct,
                critPct,
              })}
              {averageRangeKm !== null && (
                <>
                  {" "}
                  {t("verdict_range_note", { range: formatRangeKm(averageRangeKm) })}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
