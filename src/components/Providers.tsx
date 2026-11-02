"use client";

import i18n from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import { createContext, useContext, useEffect, useState } from "react";

export type DistanceUnit = "km" | "miles";

interface UnitContextValue {
  unit: DistanceUnit;
  toggleUnit: () => void;
  formatRangeKm: (rangeKm: number) => string;
}

const UnitContext = createContext<UnitContextValue>({
  unit: "km",
  toggleUnit: () => {},
  formatRangeKm: (rangeKm: number) => `${Math.round(rangeKm)} km`,
});

export function useUnit() {
  return useContext(UnitContext);
}

const resources = {
  en: {
    translation: {
      "title_main": "EV Real Range & Reliability",
      "title_sub": "Global Tracker",
      "description": "Search for real-world range, reliability, and issues of electric vehicles.",
      "search_placeholder": "e.g. Tesla Model 3, Hyundai Ioniq 5...",
      "search_btn": "Search",
      "detected_brand": "Detected Brand",
      "detected_model": "Detected Model",
      "total_reports": "Total Reports Found",
      "collection_date": "Data Collection Date",
      "contradictory_warning": "Contradictory Info Warning",
      "carbon_offset": "Offset your EV carbon footprint",
      "buy_accessories": "EV Accessories",
      "unit_pref": "Unit Preference:",
      "recent_searches": "Recent Searches:",
      "brands": "Brands",
      "models": "Models",
      "reports_stat": "Reports",
      "browse_vehicles": "Available Vehicles in Database",
      "search_results": "Search Results",
      "new_search": "← New Search",
      "fallback_notice": "No reports found for the specific model {{model}}. Showing all results for brand {{brand}}.",
      "loading_reports": "Searching reports in the global database...",
      "loading": "Loading...",
      "error_prefix": "Error",
      "supabase_env_error": "CRITICAL ERROR: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL) are not configured!",
      "no_reports_title": "No reports found for this vehicle.",
      "no_reports_subtitle": "Our agents haven't found occurrences yet or the entered model does not match any record.",
      "reports_found": "{{count}} reports found",
      "sorted_by_date": "Sorted by date (newest first)",
      "show_original_source": "View original source",
      "hide_original_source": "Hide original source",
      "original_source_title": "Original Source",
      "iframe_fallback_question": "Did the page not load properly?",
      "open_new_tab": "Open in a new tab",
      "filter_by_category": "Filter by category:",
      "filter_all": "All",
      "type_real_range": "Real Range",
      "type_battery": "Battery",
      "type_mechanical": "Mechanical",
      "type_positives": "Positives",
      "avg_real_range": "Estimated Real Range",
      "eco_affiliates_title": "Eco & Affiliates",
      "in_preparation": "In preparation.",
      "adsense_placeholder": "[ Google AdSense Placeholder ]",
      "rights_reserved": "All rights reserved. EVRS Project.",
      "unit_toggle_tooltip": "Switch distance unit (KM / MILES)"
    }
  },
  pt: {
    translation: {
      "title_main": "Autonomia e Fiabilidade EV",
      "title_sub": "Rastreador Global",
      "description": "Pesquise dados reais de autonomia, fiabilidade e problemas de veículos elétricos.",
      "search_placeholder": "ex. Tesla Model 3, Hyundai Ioniq 5...",
      "search_btn": "Pesquisar",
      "detected_brand": "Marca Detetada",
      "detected_model": "Modelo Detetado",
      "total_reports": "Relatórios Encontrados",
      "collection_date": "Data de Recolha",
      "contradictory_warning": "Aviso de Informação Contraditória",
      "carbon_offset": "Compensar Pegada de Carbono do EV",
      "buy_accessories": "Acessórios para EV",
      "unit_pref": "Preferência de Unidade:",
      "recent_searches": "Pesquisas Recentes:",
      "brands": "Marcas",
      "models": "Modelos",
      "reports_stat": "Relatórios",
      "browse_vehicles": "Veículos Disponíveis na Base de Dados",
      "search_results": "Resultados da Pesquisa",
      "new_search": "← Nova Pesquisa",
      "fallback_notice": "Não encontrámos relatórios para o modelo específico {{model}}, a apresentar todos os resultados para a marca {{brand}}.",
      "loading_reports": "A procurar relatórios na base de dados global...",
      "loading": "A carregar...",
      "error_prefix": "Erro",
      "supabase_env_error": "ERRO CRÍTICO: As variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL) não estão configuradas na Vercel!",
      "no_reports_title": "Nenhum relatório encontrado para este veículo.",
      "no_reports_subtitle": "Os nossos agentes ainda não encontraram ocorrências ou o modelo inserido não corresponde a nenhum registo.",
      "reports_found": "{{count}} relatórios encontrados",
      "sorted_by_date": "Ordenados por data (mais recentes primeiro)",
      "show_original_source": "Ver fonte original",
      "hide_original_source": "Ocultar fonte original",
      "original_source_title": "Fonte Original",
      "iframe_fallback_question": "A página não carregou corretamente?",
      "open_new_tab": "Abrir num novo separador",
      "filter_by_category": "Filtrar por categoria:",
      "filter_all": "Todos",
      "type_real_range": "Autonomia Real",
      "type_battery": "Bateria",
      "type_mechanical": "Mecânica",
      "type_positives": "Positivos",
      "avg_real_range": "Autonomia Real Estimada",
      "eco_affiliates_title": "Eco & Afiliados",
      "in_preparation": "Em preparação.",
      "adsense_placeholder": "[ Espaço Google AdSense ]",
      "rights_reserved": "Todos os direitos reservados. Projeto EVRS.",
      "unit_toggle_tooltip": "Alternar unidade de distância (KM / MILHAS)"
    }
  }
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: "pt",
      fallbackLng: "en",
      interpolation: { escapeValue: false }
    });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [, setLang] = useState<string>(i18n.language || "pt");
  const [unit, setUnit] = useState<DistanceUnit>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("evrs_unit");
      if (saved === "km" || saved === "miles") return saved;
    }
    return "km";
  });

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      window.localStorage.setItem("evrs_lang", lng);
      document.documentElement.lang = lng;
      setLang(lng);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    const savedLang = window.localStorage.getItem("evrs_lang");
    if ((savedLang === "en" || savedLang === "pt") && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    } else {
      document.documentElement.lang = i18n.language || "pt";
    }

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  const toggleUnit = () => {
    setUnit((prev) => {
      const next = prev === "km" ? "miles" : "km";
      if (typeof window !== "undefined") {
        window.localStorage.setItem("evrs_unit", next);
      }
      return next;
    });
  };

  const formatRangeKm = (rangeKm: number) => {
    if (unit === "miles") {
      return `${Math.round(rangeKm * 0.621371)} mi`;
    }
    return `${Math.round(rangeKm)} km`;
  };

  return (
    <I18nextProvider i18n={i18n}>
      <UnitContext.Provider
        value={{
          unit,
          toggleUnit,
          formatRangeKm,
        }}
      >
        {children}
      </UnitContext.Provider>
    </I18nextProvider>
  );
}



