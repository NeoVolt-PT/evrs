"use client";

import i18n from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import { useEffect, useState } from "react";

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
      "contradictory_warning": "Contradictory Info Warnings",
      "carbon_offset": "Offset your EV carbon footprint",
      "buy_accessories": "EV Accessories",
      "unit_pref": "Unit Preference:",
      "recent_searches": "Recent Searches:"
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
      "contradictory_warning": "Aviso de Informações Contraditórias",
      "carbon_offset": "Compensar Pegada de Carbono do EV",
      "buy_accessories": "Acessórios para EV",
      "unit_pref": "Preferência de Unidade:",
      "recent_searches": "Pesquisas Recentes:"
    }
  }
  // Others: fr, de, it, es can be added here easily.
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pt", // default to pt as per user's locale preference
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export function Providers({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
