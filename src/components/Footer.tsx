"use client";

import { useTranslation } from "react-i18next";
import { trackEvent } from "@/lib/analytics";

export default function Footer() {
  const { t, i18n } = useTranslation();

  const amazonDomain = i18n.language === "pt" ? "https://www.amazon.es" : "https://www.amazon.com";
  const amazonTag = process.env.NEXT_PUBLIC_AMAZON_TAG || "neovoltpt-21";

  return (
    <footer className="w-full border-t border-border bg-card mt-12 py-8 text-sm">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-semibold text-white mb-3">EVRS | by NeoVolt-PT</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Direct EV Sponsor / Partner Slot */}
        <div className="border border-border rounded-xl p-4 bg-background/60 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-primary font-semibold block mb-1">
              {t("adsense_placeholder")}
            </span>
            <h4 className="font-semibold text-white text-xs mb-1">
              {t("sponsor_slot_title")}
            </h4>
            <p className="text-xs text-gray-400">
              {t("sponsor_slot_desc")}
            </p>
          </div>
          <a
            href="mailto:filmfer@gmail.com?subject=EVRS%20Sponsorship%20Inquiry"
            onClick={() =>
              trackEvent("click_affiliate_partner", {
                partner: "direct_sponsor_inquiry",
                placement: "footer",
              })
            }
            className="mt-3 text-xs font-semibold text-primary hover:underline inline-block"
          >
            {t("sponsor_slot_cta")}
          </a>
        </div>

        {/* Curated EV Affiliate & Partner Links */}
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-white mb-1">{t("eco_affiliates_title")}</h3>
          <a
            href={`${amazonDomain}/s?k=EV+Level+2+Charger+Type+2+Cable&tag=${amazonTag}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackEvent("click_affiliate_partner", {
                partner: "amazon_ev_accessories",
                placement: "footer",
              })
            }
            className="text-xs text-gray-300 hover:text-primary transition"
          >
            🔌 {t("buy_accessories")} (Wallbox & Type 2 / CCS) →
          </a>
          <a
            href="https://www.carvertical.com"
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackEvent("click_affiliate_partner", {
                partner: "carvertical_vin_check",
                placement: "footer",
              })
            }
            className="text-xs text-gray-300 hover:text-primary transition"
          >
            🛡️ {t("partner_vin_cta")}
          </a>
          <a
            href="https://abetterrouteplanner.com"
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackEvent("click_affiliate_partner", {
                partner: "abrp_route_planner",
                placement: "footer",
              })
            }
            className="text-xs text-gray-300 hover:text-primary transition"
          >
            🗺️ {t("partner_charging_title")} →
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 pt-4 border-t border-border/50 text-center space-y-2">
        <p className="text-[11px] text-gray-500 max-w-3xl mx-auto">
          {t("affiliate_disclosure")}
        </p>
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} NeoVolt-PT. {t("rights_reserved")}
        </p>
      </div>
    </footer>
  );
}

