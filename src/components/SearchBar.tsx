"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

const KNOWN_BRANDS = [
  "Mercedes-Benz",
  "Aston Martin",
  "Lucid Motors",
  "Tesla",
  "Nissan",
  "Chevrolet",
  "Ford",
  "Volkswagen",
  "Audi",
  "Porsche",
  "Hyundai",
  "Kia",
  "BMW",
  "Rivian",
  "Lucid",
  "Polestar",
  "Volvo",
  "MG",
  "BYD",
  "Peugeot",
  "Renault",
  "Fiat",
  "Jaguar",
  "Mini",
  "Smart",
  "Toyota",
  "Subaru",
  "Skoda",
  "Cupra",
  "Dacia",
  "Honda",
  "Lexus",
  "Mazda",
  "Omoda",
  "XPeng",
  "Nio",
  "Zeekr"
].sort((a, b) => b.length - a.length); // Sort descending to match longer names first

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const { t } = useTranslation();
  const router = useRouter();

  let parsedBrand = "";
  let parsedModel = "";

  if (query.trim()) {
    const lowerQuery = query.toLowerCase().trim();
    let foundBrand = "";
    
    for (const brand of KNOWN_BRANDS) {
      if (lowerQuery.startsWith(brand.toLowerCase())) {
        foundBrand = brand;
        break;
      }
    }

    if (foundBrand) {
      parsedBrand = foundBrand;
      // Extrai o resto da string mantendo o casing original para o modelo
      parsedModel = query.slice(foundBrand.length).trim();
    } else {
      // Fallback: A primeira palavra é a marca, o resto é o modelo
      const parts = query.trim().split(" ");
      parsedBrand = parts[0];
      parsedModel = parts.slice(1).join(" ");
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBrand || parsedModel) {
      const searchParams = new URLSearchParams();
      if (parsedBrand) searchParams.set("brand", parsedBrand);
      if (parsedModel) searchParams.set("model", parsedModel);
      
      router.push(`/results?${searchParams.toString()}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input 
          type="text" 
          className="block w-full p-4 pl-12 text-lg text-foreground bg-card border border-border rounded-xl focus:ring-primary focus:border-primary placeholder-gray-500 transition-all outline-none"
          placeholder={t("search_placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required 
        />
        <button 
          type="submit" 
          className="text-primary-foreground absolute right-2.5 bottom-2.5 bg-primary hover:bg-emerald-600 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-6 py-2 transition-colors"
        >
          {t("search_btn")}
        </button>
      </form>
      
      {/* Search breakdown visualization for User Feedback */}
      {query && (
        <div className="mt-4 p-4 rounded-lg bg-card/50 border border-border/50 text-sm flex gap-6 text-gray-300 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <span className="opacity-50 block text-xs uppercase tracking-wider mb-1">{t("detected_brand")}</span>
            <span className="font-semibold text-white text-base">{parsedBrand || "—"}</span>
          </div>
          <div className="w-px bg-border/50"></div>
          <div>
            <span className="opacity-50 block text-xs uppercase tracking-wider mb-1">{t("detected_model")}</span>
            <span className="font-semibold text-white text-base">{parsedModel || "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}