"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useUnit } from "@/components/Providers";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { unit, toggleUnit } = useUnit();

  const changeLanguage = (lng: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("evrs_lang", lng);
      document.documentElement.lang = lng;
    }
    i18n.changeLanguage(lng);
  };

  return (
    <header className="w-full border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          EVRS <span className="text-primary hidden sm:inline">| by NeoVolt-PT</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={toggleUnit}
            title={t("unit_toggle_tooltip")}
            className="flex px-3 py-1 rounded bg-background border border-border hover:bg-border/50 transition font-medium"
          >
            {unit.toUpperCase()}
          </button>

          <div className="flex bg-background border border-border rounded overflow-hidden">
            <button
              type="button"
              onClick={() => changeLanguage("en")}
              className={`px-3 py-1 ${i18n.language === "en" ? "bg-primary text-primary-foreground" : "hover:bg-border/50"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => changeLanguage("pt")}
              className={`px-3 py-1 ${i18n.language === "pt" ? "bg-primary text-primary-foreground" : "hover:bg-border/50"}`}
            >
              PT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
