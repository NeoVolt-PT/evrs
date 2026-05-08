"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import Link from "next/link";

function ResultsContent() {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand");
  const model = searchParams.get("model");
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReports() {
      if (!brand) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Find vehicle ID first
        let query = supabase.from("vehicles").select("id").ilike("brand", brand);
        
        // If model is provided, try to match it or use it as a filter
        if (model && model.trim() !== "") {
           query = query.ilike("model", `%${model}%`);
        }

        const { data: vehicleData, error: vehicleError } = await query;

        if (vehicleError) throw vehicleError;
        
        if (!vehicleData || vehicleData.length === 0) {
          setReports([]);
          return;
        }

        const vehicleIds = vehicleData.map(v => v.id);

        // Fetch reports for those vehicles
        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select("*")
          .in("vehicle_id", vehicleIds)
          .order("created_at", { ascending: false });

        if (reportsError) throw reportsError;

        setReports(reportsData || []);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [brand, model]);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Resultados da Pesquisa
          </h1>
          <p className="text-gray-400 text-lg">
            {brand} {model && <span className="opacity-75">{model}</span>}
          </p>
        </div>
        <Link href="/" className="px-4 py-2 border border-border rounded-lg bg-card hover:bg-border transition text-sm">
          ← Nova Pesquisa
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">A procurar relatórios na base de dados global...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200">
          Erro: {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card/30">
          <p className="text-gray-400">Nenhum relatório encontrado para este veículo.</p>
          <p className="text-sm text-gray-500 mt-2">Os nossos agentes ainda não encontraram ocorrências ou o modelo inserido não corresponde a nenhum registo.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between text-sm text-gray-400 border-b border-border pb-4">
            <span>{reports.length} relatórios encontrados</span>
            <span>Ordenados por data (mais recentes primeiro)</span>
          </div>
          
          {reports.map((report) => (
            <div key={report.id} className="p-5 bg-card border border-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  report.type === 'Real Range' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                  report.type === 'Battery' ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' :
                  report.type === 'Mechanical' ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                  'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50'
                }`}>
                  {report.type}
                </span>
                <span className="text-xs text-gray-500">{new Date(report.report_date).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-200">{report.description}</p>
              
              {report.source_link && (
                <div className="mt-4 pt-3 border-t border-border/50 text-xs">
                  <a href={report.source_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    Ver fonte original 
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function ResultsPage() {
  return (
    <main className="max-w-4xl mx-auto p-8 mt-8 w-full">
      <Suspense fallback={
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">A carregar...</p>
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </main>
  );
}