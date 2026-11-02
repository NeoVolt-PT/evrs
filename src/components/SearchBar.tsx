"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export interface VehicleOption {
  brand: string;
  model: string;
}

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

const BRAND_ALIASES: Record<string, string> = {
  "vw": "Volkswagen",
  "mercedes": "Mercedes-Benz",
  "mercedes benz": "Mercedes-Benz",
  "chevy": "Chevrolet",
  "lucid motors": "Lucid",
  "škoda": "Skoda",
};

const MODEL_TO_BRAND: Record<string, { brand: string; model: string }> = {
  "model 3": { brand: "Tesla", model: "Model 3" },
  "model y": { brand: "Tesla", model: "Model Y" },
  "model s": { brand: "Tesla", model: "Model S" },
  "model x": { brand: "Tesla", model: "Model X" },
  "cybertruck": { brand: "Tesla", model: "Cybertruck" },
  "ioniq 5": { brand: "Hyundai", model: "Ioniq 5" },
  "ioniq 6": { brand: "Hyundai", model: "Ioniq 6" },
  "ioniq 9": { brand: "Hyundai", model: "Ioniq 9" },
  "kona electric": { brand: "Hyundai", model: "Kona Electric" },
  "ev3": { brand: "Kia", model: "EV3" },
  "ev6": { brand: "Kia", model: "EV6" },
  "ev9": { brand: "Kia", model: "EV9" },
  "niro ev": { brand: "Kia", model: "Niro EV" },
  "id.3": { brand: "Volkswagen", model: "ID.3" },
  "id.4": { brand: "Volkswagen", model: "ID.4" },
  "id.7": { brand: "Volkswagen", model: "ID.7" },
  "id. buzz": { brand: "Volkswagen", model: "ID. Buzz" },
  "mustang mach-e": { brand: "Ford", model: "Mustang Mach-E" },
  "mach-e": { brand: "Ford", model: "Mustang Mach-E" },
  "f-150 lightning": { brand: "Ford", model: "F-150 Lightning" },
  "r1t": { brand: "Rivian", model: "R1T" },
  "r1s": { brand: "Rivian", model: "R1S" },
  "r2": { brand: "Rivian", model: "R2" },
  "seal": { brand: "BYD", model: "Seal" },
  "dolphin": { brand: "BYD", model: "Dolphin" },
  "atto 3": { brand: "BYD", model: "Atto 3" },
  "seagull": { brand: "BYD", model: "Seagull" },
  "ex30": { brand: "Volvo", model: "EX30" },
  "ex90": { brand: "Volvo", model: "EX90" },
  "taycan": { brand: "Porsche", model: "Taycan" },
  "macan ev": { brand: "Porsche", model: "Macan EV" },
  "bolt ev": { brand: "Chevrolet", model: "Bolt EV" },
  "bolt euv": { brand: "Chevrolet", model: "Bolt EUV" },
  "equinox ev": { brand: "Chevrolet", model: "Equinox EV" },
  "blazer ev": { brand: "Chevrolet", model: "Blazer EV" },
  "leaf": { brand: "Nissan", model: "Leaf" },
  "ariya": { brand: "Nissan", model: "Ariya" },
  "i4": { brand: "BMW", model: "i4" },
  "ix": { brand: "BMW", model: "iX" },
  "i5": { brand: "BMW", model: "i5" },
  "q4 e-tron": { brand: "Audi", model: "Q4 e-tron" },
  "q8 e-tron": { brand: "Audi", model: "Q8 e-tron" },
  "zoe": { brand: "Renault", model: "Zoe" },
  "megane e-tech": { brand: "Renault", model: "Megane E-Tech" },
  "scenic e-tech": { brand: "Renault", model: "Scenic E-Tech" },
  "enyaq": { brand: "Skoda", model: "Enyaq" },
  "born": { brand: "Cupra", model: "Born" },
};

function isSpecificModel(model?: string): boolean {
  if (!model) return false;
  const m = model.trim().toLowerCase();
  return !["general", "unknown", "multiple", "n/a", "none", "all", "ev", ""].includes(m);
}

export default function SearchBar({ vehicles = [] }: { vehicles?: VehicleOption[] }) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  let parsedBrand = "";
  let parsedModel = "";

  if (query.trim()) {
    const trimmed = query.trim();
    const lowerQuery = trimmed.toLowerCase();

    let matchedAliasKey = "";
    for (const alias of Object.keys(BRAND_ALIASES).sort((a, b) => b.length - a.length)) {
      if (lowerQuery === alias || lowerQuery.startsWith(alias + " ")) {
        matchedAliasKey = alias;
        break;
      }
    }

    if (matchedAliasKey) {
      parsedBrand = BRAND_ALIASES[matchedAliasKey];
      parsedModel = trimmed.slice(matchedAliasKey.length).trim();
    } else {
      let foundBrand = "";
      const allKnownBrands = Array.from(
        new Set([...KNOWN_BRANDS, ...vehicles.map((v) => v.brand)])
      ).sort((a, b) => b.length - a.length);

      for (const brand of allKnownBrands) {
        const lowerBrand = brand.toLowerCase();
        if (lowerQuery === lowerBrand || lowerQuery.startsWith(lowerBrand + " ")) {
          foundBrand = brand;
          break;
        }
      }

      if (foundBrand) {
        parsedBrand = foundBrand;
        parsedModel = trimmed.slice(foundBrand.length).trim();
      } else if (MODEL_TO_BRAND[lowerQuery]) {
        parsedBrand = MODEL_TO_BRAND[lowerQuery].brand;
        parsedModel = MODEL_TO_BRAND[lowerQuery].model;
      } else {
        // Check if query matches a specific model in our database vehicles list
        const dbModelMatch = vehicles.find(
          (v) => isSpecificModel(v.model) && v.model.toLowerCase() === lowerQuery
        );
        if (dbModelMatch) {
          parsedBrand = dbModelMatch.brand;
          parsedModel = dbModelMatch.model;
        } else {
          const parts = trimmed.split(/\s+/);
          parsedBrand = BRAND_ALIASES[parts[0].toLowerCase()] || parts[0];
          parsedModel = parts.slice(1).join(" ");
        }
      }
    }
  }

  const matchingSuggestions = query.trim()
    ? vehicles
        .filter((v) => {
          if (!isSpecificModel(v.model)) return false;
          const full = `${v.brand} ${v.model}`.trim().toLowerCase();
          return full.includes(query.trim().toLowerCase());
        })
        .slice(0, 8)
    : [];

  const navigateToResults = (brand: string, model: string) => {
    trackEvent("search_vehicle", {
      brand: brand || "Unknown",
      model: model && model !== "General" ? model : "All",
    });
    const searchParams = new URLSearchParams();
    if (brand) searchParams.set("brand", brand);
    if (model && model !== "General") searchParams.set("model", model);
    router.push(`/results?${searchParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBrand || parsedModel) {
      setShowSuggestions(false);
      navigateToResults(parsedBrand, parsedModel);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 relative">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input 
          type="text" 
          className="block w-full p-4 pl-12 pr-32 text-lg text-foreground bg-card border border-border rounded-xl focus:ring-primary focus:border-primary placeholder-gray-500 transition-all outline-none"
          placeholder={t("search_placeholder")}
          value={query}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          required 
        />
        <button 
          type="submit" 
          className="text-primary-foreground absolute right-2.5 bottom-2.5 bg-primary hover:bg-emerald-600 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-6 py-2 transition-colors"
        >
          {t("search_btn")}
        </button>
      </form>

      {showSuggestions && matchingSuggestions.length > 0 && (
        <div className="mt-2 w-full rounded-xl bg-card border border-border shadow-lg overflow-hidden text-left z-20">
          {matchingSuggestions.map((item) => {
            const label = item.model && item.model !== "General" ? `${item.brand} ${item.model}` : item.brand;
            return (
              <button
                key={`${item.brand}|${item.model}`}
                type="button"
                onMouseDown={() => {
                  setQuery(label);
                  setShowSuggestions(false);
                  navigateToResults(item.brand, item.model);
                }}
                className="w-full px-4 py-2.5 text-sm text-gray-200 hover:bg-border/60 flex items-center justify-between transition-colors"
              >
                <span>
                  <strong className="text-white">{item.brand}</strong>{" "}
                  {item.model && item.model !== "General" && <span className="text-gray-400">{item.model}</span>}
                </span>
                <span className="text-xs text-primary">→</span>
              </button>
            );
          })}
        </div>
      )}
      
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