"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useUnit } from "@/components/Providers";

const LANGUAGES = [
  { code: "pt", label: "PT", name: "Português", flag: "🇵🇹" },
  { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
  { code: "fr", label: "FR", name: "Français", flag: "🇫🇷" },
  { code: "es", label: "ES", name: "Español", flag: "🇪🇸" },
  { code: "de", label: "DE", name: "Deutsch", flag: "🇩🇪" },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const { unit, toggleUnit } = useUnit();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = (i18n.language || "pt").slice(0, 2).toLowerCase();
  const currentLang =
    LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <header className="w-full border-b border-border bg-card relative z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          EVRS <span className="text-primary hidden sm:inline">| by NeoVolt-PT</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          <Link
            href="/results?brand=Incentives"
            className="px-2.5 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-500/40 hover:bg-purple-900/50 transition text-xs font-semibold"
          >
            {t("nav_incentives")}
          </Link>
          <Link
            href="/about"
            className="text-gray-300 hover:text-primary transition font-medium"
          >
            {t("nav_about")}
          </Link>
          <Link
            href="/contact"
            className="text-gray-300 hover:text-primary transition font-medium"
          >
            {t("nav_contact")}
          </Link>

          <button
            type="button"
            onClick={toggleUnit}
            title={t("unit_toggle_tooltip")}
            className="flex px-3 py-1 rounded bg-background border border-border hover:bg-border/50 transition font-medium"
          >
            {unit.toUpperCase()}
          </button>

          {/* Language Dropdown with Flags & Initials */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-background border border-border hover:border-primary/60 transition font-semibold text-xs sm:text-sm cursor-pointer"
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <svg
                className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-card border border-border shadow-xl overflow-hidden py-1 z-50">
                {LANGUAGES.map((l) => {
                  const isActive = l.code === currentLang.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => changeLanguage(l.code)}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                        isActive
                          ? "bg-primary/20 text-primary font-bold"
                          : "text-gray-200 hover:bg-border/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base leading-none">{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      <span className="text-[11px] text-gray-400">{l.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

