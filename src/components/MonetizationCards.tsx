"use client";

import { useTranslation } from "react-i18next";
import { trackEvent } from "@/lib/analytics";

interface MonetizationCardsProps {
  brand?: string | null;
  model?: string | null;
}

export default function MonetizationCards({ brand, model }: MonetizationCardsProps) {
  const { t, i18n } = useTranslation();

  const vehicleLabel = [brand, model && model !== "General" ? model : ""].filter(Boolean).join(" ") || "EV";
  const amazonDomain = i18n.language === "pt" ? "https://www.amazon.es" : "https://www.amazon.com";
  const amazonTag = process.env.NEXT_PUBLIC_AMAZON_TAG || "neovoltpt-21";
  const accessoriesQuery = encodeURIComponent(`${vehicleLabel} EV charger wallbox accessories`);
  const accessoriesUrl = `${amazonDomain}/s?k=${accessoriesQuery}&tag=${amazonTag}`;

  const vinCheckUrl =
    process.env.NEXT_PUBLIC_VIN_PARTNER_URL ||
    "https://www.carvertical.com";

  const routePlannerUrl =
    process.env.NEXT_PUBLIC_CHARGING_PARTNER_URL ||
    "https://abetterrouteplanner.com";

  return (
    <section className="my-8 p-5 bg-card/60 border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          ⚡ {t("partner_section_title")}
        </h3>
        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded bg-primary/15 text-primary border border-primary/30">
          {t("partner_badge")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href={accessoriesUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() =>
            trackEvent("click_affiliate_partner", {
              partner: "amazon_ev_accessories",
              vehicle: vehicleLabel,
              placement: "results_cards",
            })
          }
          className="group p-4 rounded-xl bg-background border border-border hover:border-primary transition flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-emerald-400 block mb-1">
              🔌 {t("partner_accessories_title", { vehicle: vehicleLabel })}
            </span>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t("partner_accessories_desc")}
            </p>
          </div>
          <span className="mt-3 text-xs font-semibold text-primary group-hover:underline inline-block">
            {t("partner_accessories_cta")}
          </span>
        </a>

        <a
          href={vinCheckUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() =>
            trackEvent("click_affiliate_partner", {
              partner: "carvertical_vin_check",
              vehicle: vehicleLabel,
              placement: "results_cards",
            })
          }
          className="group p-4 rounded-xl bg-background border border-border hover:border-blue-400 transition flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-blue-400 block mb-1">
              🛡️ {t("partner_vin_title", { vehicle: vehicleLabel })}
            </span>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t("partner_vin_desc")}
            </p>
          </div>
          <span className="mt-3 text-xs font-semibold text-blue-400 group-hover:underline inline-block">
            {t("partner_vin_cta")}
          </span>
        </a>

        <a
          href={routePlannerUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() =>
            trackEvent("click_affiliate_partner", {
              partner: "abrp_route_planner",
              vehicle: vehicleLabel,
              placement: "results_cards",
            })
          }
          className="group p-4 rounded-xl bg-background border border-border hover:border-orange-400 transition flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-orange-400 block mb-1">
              🗺️ {t("partner_charging_title")}
            </span>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t("partner_charging_desc")}
            </p>
          </div>
          <span className="mt-3 text-xs font-semibold text-orange-400 group-hover:underline inline-block">
            {t("partner_charging_cta")}
          </span>
        </a>
      </div>
    </section>
  );
}

