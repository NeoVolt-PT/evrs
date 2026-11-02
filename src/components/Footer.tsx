"use client";

import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-border bg-card mt-12 py-8 text-sm">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-semibold text-white mb-4">EVRS</h3>
          <p className="text-gray-400">
            {t("description")}
          </p>
        </div>
        
        {/* Placeholder Google AdSense */}
        <div className="border border-dashed border-border rounded flex items-center justify-center p-4 bg-background/50 h-24">
          <span className="text-gray-500">{t("adsense_placeholder")}</span>
        </div>

        {/* Affiliate / Carbon Offset Placeholder */}
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-white mb-2">{t("eco_affiliates_title")}</h3>
          <p className="text-gray-400 italic">{t("in_preparation")}</p>
        </div>
      </div>
      <div className="text-center text-gray-500 mt-8 pt-4 border-t border-border/50">
        &copy; {new Date().getFullYear()} NeoVolt-PT. {t("rights_reserved")}
      </div>
    </footer>
  );
}
