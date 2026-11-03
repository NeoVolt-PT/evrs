"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useUnit } from "@/components/Providers";

function FlagIcon({ code }: { code: string }) {
  if (code === "pt") {
    // Half Portugal (left/top-left) + Half Brazil (right/bottom-right)
    return (
      <svg viewBox="0 0 24 16" className="w-5 h-3.5 rounded-[2px] shadow-sm shrink-0 overflow-hidden">
        <defs>
          <clipPath id="ptHalf">
            <polygon points="0,0 24,0 0,16" />
          </clipPath>
          <clipPath id="brHalf">
            <polygon points="24,0 24,16 0,16" />
          </clipPath>
        </defs>
        {/* Portugal Half */}
        <g clipPath="url(#ptHalf)">
          <rect x="0" y="0" width="9.5" height="16" fill="#006600" />
          <rect x="9.5" y="0" width="14.5" height="16" fill="#ff0000" />
          <circle cx="9.5" cy="8" r="3" fill="#ffcc00" />
        </g>
        {/* Brazil Half */}
        <g clipPath="url(#brHalf)">
          <rect x="0" y="0" width="24" height="16" fill="#009c3b" />
          <polygon points="12,2.2 21.5,8 12,13.8 2.5,8" fill="#ffdf00" />
          <circle cx="12" cy="8" r="3.2" fill="#002776" />
        </g>
        <line x1="0" y1="16" x2="24" y2="0" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" />
      </svg>
    );
  }

  if (code === "en") {
    // Half USA (top-left) + Half UK (bottom-right)
    return (
      <svg viewBox="0 0 24 16" className="w-5 h-3.5 rounded-[2px] shadow-sm shrink-0 overflow-hidden">
        <defs>
          <clipPath id="usHalf">
            <polygon points="0,0 24,0 0,16" />
          </clipPath>
          <clipPath id="ukHalf">
            <polygon points="24,0 24,16 0,16" />
          </clipPath>
        </defs>
        {/* USA Half */}
        <g clipPath="url(#usHalf)">
          <rect width="24" height="16" fill="#b22234" />
          <rect y="2.4" width="24" height="1.8" fill="#ffffff" />
          <rect y="6" width="24" height="1.8" fill="#ffffff" />
          <rect y="9.6" width="24" height="1.8" fill="#ffffff" />
          <rect y="13.2" width="24" height="1.8" fill="#ffffff" />
          <rect width="11" height="8.5" fill="#3c3b6e" />
        </g>
        {/* UK Half */}
        <g clipPath="url(#ukHalf)">
          <rect width="24" height="16" fill="#012169" />
          <path d="M0,0 L24,16 M24,0 L0,16" stroke="#ffffff" strokeWidth="3" />
          <path d="M0,0 L24,16 M24,0 L0,16" stroke="#c8102e" strokeWidth="1.5" />
          <path d="M12,0 V16 M0,8 H24" stroke="#ffffff" strokeWidth="4.5" />
          <path d="M12,0 V16 M0,8 H24" stroke="#c8102e" strokeWidth="2.5" />
        </g>
        <line x1="0" y1="16" x2="24" y2="0" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" />
      </svg>
    );
  }

  if (code === "fr") {
    return (
      <svg viewBox="0 0 24 16" className="w-5 h-3.5 rounded-[2px] shadow-sm shrink-0 overflow-hidden">
        <rect x="0" y="0" width="8" height="16" fill="#002395" />
        <rect x="8" y="0" width="8" height="16" fill="#ffffff" />
        <rect x="16" y="0" width="8" height="16" fill="#ed2939" />
      </svg>
    );
  }

  if (code === "es") {
    return (
      <svg viewBox="0 0 24 16" className="w-5 h-3.5 rounded-[2px] shadow-sm shrink-0 overflow-hidden">
        <rect x="0" y="0" width="24" height="4" fill="#aa151b" />
        <rect x="0" y="4" width="24" height="8" fill="#f1bf00" />
        <rect x="0" y="12" width="24" height="4" fill="#aa151b" />
      </svg>
    );
  }

  // DE
  return (
    <svg viewBox="0 0 24 16" className="w-5 h-3.5 rounded-[2px] shadow-sm shrink-0 overflow-hidden">
      <rect x="0" y="0" width="24" height="5.33" fill="#000000" />
      <rect x="0" y="5.33" width="24" height="5.33" fill="#dd0000" />
      <rect x="0" y="10.66" width="24" height="5.34" fill="#ffce00" />
    </svg>
  );
}

const LANGUAGES = [
  { code: "pt", label: "PT", name: "Português" },
  { code: "en", label: "EN", name: "English" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "es", label: "ES", name: "Español" },
  { code: "de", label: "DE", name: "Deutsch" },
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
              <FlagIcon code={currentLang.code} />
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
              <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-card border border-border shadow-xl overflow-hidden py-1 z-50">
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
                        <FlagIcon code={l.code} />
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

