"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ReportCard({ report }: { report: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('reddit.com')) {
        urlObj.hostname = 'www.redditmedia.com';
        urlObj.searchParams.set('embed', 'true');
        return urlObj.toString();
      }
      // For sites that block iframes (like insideevs.com), use a CORS proxy to strip X-Frame-Options
      const blockedDomains = ['insideevs.com', 'electrek.co', 'cleantechnica.com'];
      if (blockedDomains.some(d => urlObj.hostname.includes(d))) {
        return `https://corsproxy.io/?${encodeURIComponent(url)}`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="p-5 bg-card border border-border rounded-lg">
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
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:underline flex items-center gap-1"
          >
            {isExpanded ? 'Ocultar fonte original' : 'Ver fonte original'}
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {isExpanded && report.source_link && (
        <div className="mt-4 w-full rounded-md overflow-hidden border border-border bg-black/20 flex flex-col">
          <div className="relative w-full" style={{ height: '600px', overflow: 'auto' }}>
            <iframe 
              src={getEmbedUrl(report.source_link)} 
              className="absolute inset-0 w-full h-[1500px] bg-white/5"
              style={{ border: 'none' }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation"
              title="Fonte Original"
              loading="lazy"
            />
          </div>
          <div className="bg-card p-3 text-center text-xs text-gray-400 border-t border-border flex items-center justify-center gap-2">
            <span>A página não carregou corretamente?</span>
            <a href={report.source_link} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline flex items-center gap-1">
              Abrir num novo separador
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand");
  const model = searchParams.get("model");
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    async function fetchReports() {
      if (!brand) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setFallbackActive(false);
      try {
        // Find vehicle ID first
        let query = supabase.from("vehicles").select("id").ilike("brand", brand);
        
        // If model is provided, try to match it or use it as a filter
        if (model && model.trim() !== "") {
           query = query.ilike("model", `%${model}%`);
        }

        const { data: vehicleData, error: vehicleError } = await query;

        if (vehicleError) throw vehicleError;
        
        let vehicleIds: string[] = [];

        if (!vehicleData || vehicleData.length === 0) {
          if (model && model.trim() !== "") {
            // Fallback to searching only by brand
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("vehicles")
              .select("id")
              .ilike("brand", brand);
              
            if (fallbackError) throw fallbackError;
            
            if (fallbackData && fallbackData.length > 0) {
              setFallbackActive(true);
              vehicleIds = fallbackData.map(v => v.id);
            } else {
              setReports([]);
              return;
            }
          } else {
            setReports([]);
            return;
          }
        } else {
          vehicleIds = vehicleData.map(v => v.id);
        }

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
        // Extract real error message from Supabase object or network error
        let errorMsg = "Failed to fetch reports";
        if (err instanceof Error) {
          errorMsg = err.message;
        } else if (typeof err === "object" && err !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorMsg = (err as any).message || (err as any).details || JSON.stringify(err);
        }
        
        // Verifica se estamos a usar o placeholder
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        if (supabaseUrl === 'https://placeholder.supabase.co') {
          errorMsg += " | ERRO CRÍTICO: As variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL) não estão configuradas na Vercel!";
        }
        
        setError(errorMsg);
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
            {brand} {model && !fallbackActive && <span className="opacity-75">{model}</span>}
          </p>
        </div>
        <Link href="/" className="px-4 py-2 border border-border rounded-lg bg-card hover:bg-border transition text-sm">
          ← Nova Pesquisa
        </Link>
      </div>

      {fallbackActive && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-lg text-yellow-200 text-sm">
          Não encontrámos relatórios para o modelo específico {model}, a apresentar todos os resultados para a marca {brand}.
        </div>
      )}

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
            <ReportCard key={report.id} report={report} />
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