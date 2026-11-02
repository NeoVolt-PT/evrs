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
      "eco_affiliates_title": "EV Partners & Tools",
      "in_preparation": "In preparation.",
      "adsense_placeholder": "Sponsored EV Partner",
      "rights_reserved": "All rights reserved. EVRS Project.",
      "unit_toggle_tooltip": "Switch distance unit (KM / MILES)",
      "evrs_index_title": "EVRS Reliability & Range Index",
      "evrs_index_subtitle": "Composite 0–100 score based on report volume, positives, real range, and critical issues",
      "index_tier_critical": "CRITICAL RISK",
      "index_tier_moderate": "BALANCED / RANGE",
      "index_tier_optimal": "OPTIMAL RELIABILITY",
      "data_confidence": "Data Confidence",
      "confidence_low": "Low Volume",
      "confidence_medium": "Moderate Volume",
      "confidence_high": "High Volume",
      "critical_issues": "Critical (Battery & Mechanical)",
      "verdict_title": "EVRS Original Analytical Verdict",
      "verdict_summary": "Based on {{total}} analyzed reports for {{vehicle}}, the EVRS Index stands at {{score}}/100 ({{tier}}). Positive feedback accounts for {{posPct}}% of reports, Real Range analysis represents {{rangePct}}%, and Critical alerts (Battery & Mechanical) represent {{critPct}}%.",
      "verdict_range_note": "Verified real-world range reports indicate an estimated average autonomy of {{range}} under real driving conditions.",
      "partner_section_title": "Recommended EV Tools & Accessories",
      "partner_badge": "Partner / Affiliate",
      "partner_accessories_title": "EV Chargers & Accessories for {{vehicle}}",
      "partner_accessories_desc": "Compare top-rated Level 2 home wallboxes, Type 2 / CCS adapters, and accessories compatible with your EV.",
      "partner_accessories_cta": "View EV Accessories →",
      "partner_vin_title": "Buying a Used {{vehicle}}? Check Battery & History",
      "partner_vin_desc": "Verify mileage rollbacks, past accidents, and official recall records before purchasing a used electric vehicle.",
      "partner_vin_cta": "Check Vehicle History →",
      "partner_charging_title": "Smart EV Route & Charging Planner",
      "partner_charging_desc": "Plan long-distance trips with live weather, battery degradation, and fast-charger occupancy data.",
      "partner_charging_cta": "Explore Route Planner →",
      "sponsor_slot_title": "Advertise on EVRS | Reach EV Owners",
      "sponsor_slot_desc": "Promote your EV product, charging network, or insurance directly to electric vehicle researchers.",
      "sponsor_slot_cta": "Partner with NeoVolt-PT →",
      "affiliate_disclosure": "Transparency Disclosure: EVRS is an independent project by NeoVolt-PT. Some links to EV tools and accessories are partner/affiliate links that help support our servers at zero cost to you.",
      "methodology_title": "How the EVRS Global Index Works",
      "methodology_subtitle": "Independent telemetry, owner reports, and public safety data aggregated into a single 0–100 reliability gauge.",
      "methodology_card1_title": "1. Multi-Source Legal Aggregation",
      "methodology_card1_desc": "Our daily automated pipeline analyzes public NHTSA safety complaints, official EV testing channels, and global owner communities.",
      "methodology_card2_title": "2. AI Categorization & Range Extraction",
      "methodology_card2_desc": "Every report is classified into Positives, Real Range, Battery, or Mechanical issues, extracting real-world km/miles autonomy figures.",
      "methodology_card3_title": "3. Bayesian 0–100 Race Gauge Index",
      "methodology_card3_desc": "Scores are weighted by data volume and category severity—penalizing critical battery/mechanical faults while rewarding verified range and reliability.",
      "hero_live_badge": "LIVE GLOBAL EV TELEMETRY • DAILY AI & NHTSA UPDATES",
      "faq_title": "Frequently Asked Questions (EV Range & Reliability)",
      "faq_q1": "Why does real-world EV range differ from WLTP or EPA ratings?",
      "faq_a1": "Official WLTP and EPA cycles are tested in controlled lab temperatures at moderate speeds. Real-world highway driving (120 km/h / 75 mph), winter heating, battery aging, and elevation changes typically reduce autonomy by 15% to 30%. EVRS aggregates real owner and road-test reports so you know what to expect before buying.",
      "faq_q2": "How is the 0–100 EVRS Race Gauge Index calculated?",
      "faq_a2": "The EVRS Index uses a volume-weighted Bayesian formula combining Positive owner feedback (+1.0), verified Real Range tests (+0.85), Mechanical issues (0.0), and high-severity Battery alerts (-0.15). Vehicles with higher report counts earn a High Volume confidence badge.",
      "faq_q3": "What should I check before buying a used electric car?",
      "faq_a3": "Always inspect State of Health (SoH) battery diagnostics, fast-charging (DCFC) session stability, suspension/drive-unit noise, and official NHTSA/EU safety recalls—all of which are tracked per model in EVRS."
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
      "eco_affiliates_title": "Parceiros & Ferramentas EV",
      "in_preparation": "Em preparação.",
      "adsense_placeholder": "Parceiro Patrocinado EV",
      "rights_reserved": "Todos os direitos reservados. Projeto EVRS.",
      "unit_toggle_tooltip": "Alternar unidade de distância (KM / MILHAS)",
      "evrs_index_title": "Índice EVRS de Fiabilidade e Autonomia",
      "evrs_index_subtitle": "Pontuação composta de 0 a 100 baseada no volume de dados, positivos, autonomia real e problemas críticos",
      "index_tier_critical": "RISCO CRÍTICO",
      "index_tier_moderate": "EQUILIBRADO / AUTONOMIA",
      "index_tier_optimal": "FIABILIDADE ÓTIMA",
      "data_confidence": "Confiança dos Dados",
      "confidence_low": "Volume Baixo",
      "confidence_medium": "Volume Moderado",
      "confidence_high": "Volume Elevado",
      "critical_issues": "Críticos (Bateria e Mecânica)",
      "verdict_title": "Veredito Analítico Original EVRS",
      "verdict_summary": "Com base em {{total}} relatórios analisados para {{vehicle}}, o Índice EVRS é de {{score}}/100 ({{tier}}). O feedback positivo representa {{posPct}}% dos registos, a análise de Autonomia Real representa {{rangePct}}% e os alertas Críticos (Bateria e Mecânica) representam {{critPct}}%.",
      "verdict_range_note": "Os relatórios verificados indicam uma autonomia real média estimada de {{range}} em condições reais de condução.",
      "partner_section_title": "Ferramentas e Acessórios EV Recomendados",
      "partner_badge": "Parceiro / Afiliado",
      "partner_accessories_title": "Carregadores e Acessórios EV para {{vehicle}}",
      "partner_accessories_desc": "Compare wallboxes domésticas Nível 2, cabos Tipo 2 / CCS e acessórios compatíveis com o seu veículo elétrico.",
      "partner_accessories_cta": "Ver Acessórios EV →",
      "partner_vin_title": "Vai comprar um {{vehicle}} usado? Verifique Bateria e Histórico",
      "partner_vin_desc": "Confirme histórico de acidentes, quilometragem real e campanhas de recall oficiais antes de comprar um EV usado.",
      "partner_vin_cta": "Verificar Histórico →",
      "partner_charging_title": "Planeador Inteligente de Rotas e Carregamento",
      "partner_charging_desc": "Planeie viagens longas com dados em tempo real de meteorologia, degradação da bateria e ocupação de carregadores rápidos.",
      "partner_charging_cta": "Explorar Planeador →",
      "sponsor_slot_title": "Anuncie no EVRS | Alcance Condutores de EV",
      "sponsor_slot_desc": "Promova o seu produto EV, rede de carregamento ou seguro diretamente junto de compradores e entusiastas de elétricos.",
      "sponsor_slot_cta": "Parceria com NeoVolt-PT →",
      "affiliate_disclosure": "Nota de Transparência: O EVRS é um projeto independente da NeoVolt-PT. Alguns links para ferramentas e acessórios são links de afiliados/parceiros que ajudam a manter os nossos servidores sem qualquer custo adicional para si.",
      "methodology_title": "Como Funciona o Índice Global EVRS",
      "methodology_subtitle": "Telemetria independente, relatos de proprietários e dados públicos de segurança agregados num único manómetro de fiabilidade de 0 a 100.",
      "methodology_card1_title": "1. Agregação Legal Multi-Fonte",
      "methodology_card1_desc": "O nosso pipeline diário analisa queixas oficiais de segurança (NHTSA), canais oficiais de testes EV e comunidades globais de proprietários.",
      "methodology_card2_title": "2. Categorização IA e Extração de Autonomia",
      "methodology_card2_desc": "Cada relatório é classificado em Positivos, Autonomia Real, Bateria ou Mecânica, extraindo valores reais em km/milhas.",
      "methodology_card3_title": "3. Índice Bayesiano 0–100 em Manómetro de Corrida",
      "methodology_card3_desc": "A pontuação pondera o volume de dados e a gravidade de cada categoria — penalizando falhas críticas de bateria/mecânica e premiando autonomia e fiabilidade comprovadas.",
      "hero_live_badge": "TELEMETRIA EV GLOBAL EM TEMPO REAL • ATUALIZAÇÃO DIÁRIA IA & NHTSA",
      "faq_title": "Perguntas Frequentes (Autonomia Real e Fiabilidade EV)",
      "faq_q1": "Porque é que a autonomia real de um EV difere dos valores WLTP ou EPA?",
      "faq_a1": "Os ciclos oficiais WLTP e EPA são medidos em laboratório a temperaturas amenas. Em autoestrada (120 km/h), no inverno ou com o uso do ar condicionado, a autonomia real pode variar entre 15% a 30%. O EVRS agrega testes de estrada e relatos reais para mostrar a autonomia verdadeira.",
      "faq_q2": "Como é calculado o Índice EVRS de 0 a 100 no Manómetro?",
      "faq_a2": "O Índice EVRS utiliza uma fórmula Bayesiana ponderada pelo volume de dados, combinando relatos Positivos (+1.0), testes de Autonomia Real (+0.85), falhas Mecânicas (0.0) e alertas críticos de Bateria (-0.15).",
      "faq_q3": "O que devo verificar antes de comprar um carro elétrico usado?",
      "faq_a3": "Verifique sempre o estado de saúde da bateria (SoH), estabilidade em carregamento rápido DC, histórico de recalls oficiais e eventuais ruídos na transmissão/suspensão — todos monitorizados por marca e modelo no EVRS."
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



