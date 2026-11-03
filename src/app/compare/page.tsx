"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import {
  getCanonicalVehicleKey,
  isValidCarBrandAndModel,
  normalizeVehicleIdentity,
} from "@/lib/validBrands";
import RaceGauge, { GaugeReportItem } from "@/components/RaceGauge";
import MonetizationCards from "@/components/MonetizationCards";

interface VehicleEntry {
  key: string;
  brand: string;
  model: string;
  ids: string[];
}

const COMPARE_LABELS: Record<
  string,
  {
    title: string;
    subtitle: string;
    selectA: string;
    selectB: string;
    vs: string;
  }
> = {
  pt: {
    title: "Comparador Lado-a-Lado de VEs",
    subtitle: "Compare o Índice EVRS 0–100, autonomia real e fiabilidade entre dois modelos elétricos",
    selectA: "Selecionar Veículo A",
    selectB: "Selecionar Veículo B",
    vs: "VS",
  },
  en: {
    title: "Side-by-Side EV Comparison",
    subtitle: "Compare the 0–100 EVRS Index, real-world range, and reliability between two electric models",
    selectA: "Select Vehicle A",
    selectB: "Select Vehicle B",
    vs: "VS",
  },
  fr: {
    title: "Comparateur Côte à Côte de VE",
    subtitle: "Comparez l'Indice EVRS 0–100, l'autonomie réelle et la fiabilité entre deux modèles",
    selectA: "Sélectionner Véhicule A",
    selectB: "Sélectionner Véhicule B",
    vs: "VS",
  },
  es: {
    title: "Comparador Lado a Lado de EV",
    subtitle: "Compare el Índice EVRS 0–100, autonomía real y fiabilidad entre dos modelos eléctricos",
    selectA: "Seleccionar Vehículo A",
    selectB: "Seleccionar Vehículo B",
    vs: "VS",
  },
  de: {
    title: "Direktvergleich von Elektroautos",
    subtitle: "Vergleichen Sie den 0–100 EVRS-Index, reale Reichweite und Zuverlässigkeit zweier Modelle",
    selectA: "Fahrzeug A wählen",
    selectB: "Fahrzeug B wählen",
    vs: "VS",
  },
};

export default function ComparePage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "pt").slice(0, 2).toLowerCase();
  const l = COMPARE_LABELS[lang] || COMPARE_LABELS.pt;

  const [vehicles, setVehicles] = useState<VehicleEntry[]>([]);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  const [reportsA, setReportsA] = useState<GaugeReportItem[]>([]);
  const [reportsB, setReportsB] = useState<GaugeReportItem[]>([]);
  const [rangeA, setRangeA] = useState<number | null>(null);
  const [rangeB, setRangeB] = useState<number | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      const { data } = await supabase
        .from("vehicles")
        .select("id, brand, model")
        .order("brand", { ascending: true });

      if (!data) return;

      const map = new Map<string, VehicleEntry>();
      for (const v of data as { id: string; brand: string; model: string }[]) {
        if (!isValidCarBrandAndModel(v.brand, v.model)) continue;
        const canonical = normalizeVehicleIdentity(v.brand, v.model);
        const key = getCanonicalVehicleKey(canonical.brand, canonical.model);
        const existing = map.get(key);
        if (!existing) {
          map.set(key, {
            key,
            brand: canonical.brand,
            model: canonical.model,
            ids: [v.id],
          });
        } else {
          existing.ids.push(v.id);
        }
      }

      const list = Array.from(map.values());
      setVehicles(list);
      if (list.length >= 2) {
        const defaultA = list.find((x) => x.brand === "Tesla" && x.model === "Model 3") || list[0];
        const defaultB = list.find((x) => x.brand === "Hyundai" && x.model === "Ioniq 5") || list[1];
        setSelectedA(defaultA.key);
        setSelectedB(defaultB.key);
      }
    }
    loadVehicles();
  }, []);

  useEffect(() => {
    async function fetchForVehicle(
      key: string,
      setRep: (r: GaugeReportItem[]) => void,
      setRng: (n: number | null) => void
    ) {
      const entry = vehicles.find((v) => v.key === key);
      if (!entry) return;
      const { data } = await supabase
        .from("reports")
        .select("type, contradictory_info, estimated_range_km")
        .in("vehicle_id", entry.ids);

      const reps = (data || []) as GaugeReportItem[];
      setRep(reps);
      const validRanges = reps
        .map((r) => (typeof r.estimated_range_km === "number" ? r.estimated_range_km : null))
        .filter((n): n is number => n !== null && n > 0);
      setRng(
        validRanges.length > 0
          ? validRanges.reduce((a, b) => a + b, 0) / validRanges.length
          : null
      );
    }

    if (selectedA && vehicles.length > 0) fetchForVehicle(selectedA, setReportsA, setRangeA);
    if (selectedB && vehicles.length > 0) fetchForVehicle(selectedB, setReportsB, setRangeB);
  }, [selectedA, selectedB, vehicles]);

  const entryA = vehicles.find((v) => v.key === selectedA);
  const entryB = vehicles.find((v) => v.key === selectedB);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 mt-4 mb-16 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2.5">
            <svg
              className="w-7 h-7 text-white shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 3v18M7 3l-4 4M7 3l4 4" />
              <path d="M17 21V3M17 21l-4-4M17 21l4-4" />
            </svg>
            <span>{l.title}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">{l.subtitle}</p>
        </div>
        <Link href="/" className="px-4 py-2 border border-border rounded-lg bg-card hover:bg-border transition text-sm">
          {t("new_search")}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-card/70 p-5 rounded-2xl border border-border">
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
            {l.selectA}
          </label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full p-3 rounded-xl bg-background border border-border text-white text-sm outline-none focus:border-primary"
          >
            {vehicles.map((v) => (
              <option key={`a-${v.key}`} value={v.key}>
                {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1 text-center font-mono font-extrabold text-primary text-lg">
          {l.vs}
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1.5">
            {l.selectB}
          </label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full p-3 rounded-xl bg-background border border-border text-white text-sm outline-none focus:border-blue-400"
          >
            {vehicles.map((v) => (
              <option key={`b-${v.key}`} value={v.key}>
                {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {entryA && (
        <div>
          <h2 className="text-xl font-bold text-emerald-400 mb-2">
            🅰️ {entryA.brand} {entryA.model}
          </h2>
          <RaceGauge
            vehicleName={`${entryA.brand} ${entryA.model}`}
            reports={reportsA}
            averageRangeKm={rangeA}
          />
        </div>
      )}

      {entryB && (
        <div>
          <h2 className="text-xl font-bold text-blue-400 mb-2">
            🅱️ {entryB.brand} {entryB.model}
          </h2>
          <RaceGauge
            vehicleName={`${entryB.brand} ${entryB.model}`}
            reports={reportsB}
            averageRangeKm={rangeB}
          />
        </div>
      )}

      <MonetizationCards brand={entryA?.brand} model={entryA?.model} />
    </main>
  );
}
