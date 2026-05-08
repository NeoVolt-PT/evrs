"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function Header() {
  const { t, i18n } = useTranslation();
  const [unit, setUnit] = useState<"km" | "miles">("km");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUnit = localStorage.getItem("evrs_unit") as "km" | "miles" | null;
    if (savedUnit) setUnit(savedUnit);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const toggleUnit = () => {
    const newUnit = unit === "km" ? "miles" : "km";
    setUnit(newUnit);
    localStorage.setItem("evrs_unit", newUnit);
  };

  return (
    <header className="w-full border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tight">
          EVRS <span className="text-primary hidden sm:inline">| by NeoVolt-PT</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {mounted && (
            <button 
              onClick={toggleUnit}
              className="hidden sm:flex px-3 py-1 rounded bg-background border border-border hover:bg-border/50 transition"
            >
              {unit.toUpperCase()}
            </button>
          )}

          <div className="flex bg-background border border-border rounded overflow-hidden">
            <button 
              onClick={() => changeLanguage("en")}
              className={`px-3 py-1 ${i18n.language === "en" ? "bg-primary text-primary-foreground" : "hover:bg-border/50"}`}
            >
              EN
            </button>
            <button 
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