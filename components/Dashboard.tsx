
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Patient, Role } from '../types';
import { 
  Printer, 
  Activity, 
  Sparkles, 
  Loader2, 
  Users, 
  AlertCircle, 
  Bed, 
  Lightbulb, 
  PieChart as PieChartIcon,
  BarChart3,
  Clock,
  TrendingUp,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { SPECIALTIES } from '../constants';

interface DashboardProps {
  patients: Patient[];
  role?: Role;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, role }) => {
  const [aiAnalysis, setAiAnalysis] = useState<{ summary: string; improvements: string[] }>({ summary: '', improvements: [] });
  const [loadingAi, setLoadingAi] = useState(false);
  const lastAnalyzedCount = useRef<number>(-1);

  const isAuthorizedToPrint = role === 'enfermeiro' || role === 'coordenacao';

  const active = useMemo(() => patients.filter(p => !p.isTransferred), [patients]);
  
  const stats = useMemo(() => {
    return {
      total: active.length,
      internados: active.filter(p => p.status === 'Internado').length,
      observacao: active.filter(p => p.status === 'Observação').length,
      reavaliacao: active.filter(p => p.status === 'Reavaliação').length,
      pendencias: active.filter(p => p.pendencies !== 'Nenhuma' || !p.hasBracelet || !p.hasBedIdentification).length,
      macas: active.filter(p => p.situation === 'Maca').length,
      cadeiras: active.filter(p => p.situation === 'Cadeira').length,
      gargalos: active.filter(p => p.pendencies === 'Sem prescrição médica' || p.pendencies === 'Aguardando exames laboratoriais').length
    };
  }, [active]);

  const specialtyData = useMemo(() => {
    return SPECIALTIES.map(s => ({
      name: s,
      pacientes: active.filter(p => p.specialty === s).length
    })).filter(d => d.pacientes > 0).sort((a, b) => b.pacientes - a.pacientes);
  }, [active]);

  const statusPieData = useMemo(() => [
    { name: 'Internados', value: stats.internados, color: '#1e40af' },
    { name: 'Observação', value: stats.observacao, color: '#4f46e5' },
    { name: 'Reavaliação', value: stats.reavaliacao, color: '#f59e0b' }
  ].filter(d => d.value > 0), [stats]);

  // Fix: Added useCallback to React imports and defined generateAiSummary using it.
  const generateAiSummary = useCallback(async () => {
    if (active.length === lastAnalyzedCount.current || active.length === 0) return;
    setLoadingAi(true);
    lastAnalyzedCount.current = active.length;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise objetivamente esta unidade hospitalar para um gestor de enfermagem:
      INDICADORES ATUAIS:
      - Total de Pacientes no Setor: ${stats.total}
      - Perfil de Status: ${stats.internados} Internados, ${stats.observacao} em Observação, ${stats.reavaliacao} em Reavaliação.
      - Acomodação Crítica: ${stats.macas} em Macas, ${stats.cadeiras} em Cadeiras.
      - Pendências de Segurança/Fluxo: ${stats.pendencias}.
      - Gargalos Operacionais: ${stats.gargalos}.
      
      Forneça um JSON estruturado:
      {
        "summary": "Resumo técnico (um parágrafo) sobre a carga de trabalho e segurança do paciente.",
        "improvements": ["Ação 1 de fluxo", "Ação 2 de segurança", "Ação 3 operacional"]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
      });
      setAiAnalysis(JSON.parse(response.text || '{}'));
    } catch (e) {
      setAiAnalysis({ summary: 'Análise estratégica temporariamente indisponível.', improvements: [] });
    } finally {
      setLoadingAi(false);
    }
  }, [active.length, stats]);

  useEffect(() => {
    const timer = setTimeout(() => generateAiSummary(), 2000);
    return () => clearTimeout(timer);
  }, [active.length, generateAiSummary]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center no-print">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
               <TrendingUp className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Gestão Operacional HospFlow</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dashboards e Indicadores em Tempo Real</p>
            </div>
         </div>
         {isAuthorizedToPrint && (
           <button onClick={() => window.print()} className="px-6 py-4 bg-slate-950 text-white font-black rounded-2xl flex items-center gap-3 shadow-2xl hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-widest">
              <Printer className="w-5 h-5" /> Imprimir Relatório
           </button>
         )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 no-print">
        {[
          { label: 'Ocupação', val: stats.total, color: 'bg-slate-900 text-white', icon: Users },
          { label: 'Internados', val: stats.internados, color: 'bg-blue-800 text-white', icon: Bed },
          { label: 'Obs.', val: stats.observacao, color: 'bg-indigo-600 text-white', icon: Activity },
          { label: 'Reaval.', val: stats.reavaliacao, color: 'bg-amber-500 text-white', icon: Clock },
          { label: 'Críticos', val: stats.pendencias, color: 'bg-red-600 text-white', icon: AlertCircle }
        ].map(card => (
          <div key={card.label} className={`${card.color} p-6 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center transition-all hover:-translate-y-1`}>
             <card.icon className="w-6 h-6 mb-2 opacity-40" />
             <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">{card.label}</p>
             <h3 className="text-3xl font-black">{card.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <BarChart3 className="w-5 h-5 text-blue-600" />
                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Demanda por Especialidade</h4>
              </div>
           </div>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={specialtyData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} fontSize={10} fontWeight={900} textAnchor="end" tick={{ fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="pacientes" radius={[0, 8, 8, 0]} barSize={20}>
                       {specialtyData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 0 ? '#1e40af' : '#64748b'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Distribuição de Status</h4>
           </div>
           <div className="h-[250px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={statusPieData} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                       {statusPieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl no-print">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Sparkles className="w-48 h-48" />
         </div>
         <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Análise Estratégica IA</h3>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Processamento Avançado de Fluxo Assistencial</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
                  <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-3">Relatório Situacional</p>
                  {loadingAi ? (
                    <div className="flex items-center gap-3 text-slate-500 py-4">
                       <Loader2 className="w-6 h-6 animate-spin" />
                       <p className="text-sm font-bold animate-pulse">PROCESSANDO DADOS DA UNIDADE...</p>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-slate-100 leading-relaxed italic">"{aiAnalysis.summary || 'Aguardando indicadores para análise...'}"</p>
                  )}
               </div>
               <div className="space-y-4">
                  <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-3 ml-2">Sugestões de Agilidade</p>
                  {aiAnalysis.improvements.map((tip, i) => (
                    <div key={i} className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 flex items-center gap-3 transition-transform hover:scale-105">
                       <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0" />
                       <p className="text-[11px] font-black text-emerald-100 uppercase leading-tight">{tip}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Relatório Impresso Padronizado (HospFlow Estilo Consolidado) */}
      <div className="hidden print:block bg-white text-slate-900 p-0 font-sans" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '15mm' }}>
        <style>{`
          @page { size: A4; margin: 0; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .print-header { border-bottom: 4px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .print-title { color: #1e3a8a; font-size: 36px; font-weight: 900; text-transform: uppercase; line-height: 1; letter-spacing: -1px; }
          .print-card { border: 1.5px solid #cbd5e1; border-radius: 20px; padding: 20px; text-align: center; background: #f8fafc !important; }
          .print-footer { border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; }
        `}</style>
        
        <div className="print-header">
          <div className="flex items-center gap-4">
            <Activity className="w-14 h-14 text-[#1e3a8a]" />
            <h1 className="print-title">HospFlow</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Indicadores Operacionais e de Fluxo</p>
            <p className="font-bold text-sm text-slate-900">{new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>

        <section className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Ocupação Total', val: stats.total },
            { label: 'Internados', val: stats.internados },
            { label: 'Observação', val: stats.observacao },
            { label: 'Pendências Críticas', val: stats.pendencias }
          ].map(card => (
            <div key={card.label} className="print-card">
              <p className="text-[8px] font-black uppercase text-slate-500 mb-1">{card.label}</p>
              <h3 className="text-2xl font-black text-blue-900">{card.val}</h3>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-2 gap-10 mb-10">
          <div className="border border-slate-200 rounded-[2.5rem] p-8 bg-slate-50/20">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">Volume por Especialidade</h4>
            <div className="space-y-3">
              {specialtyData.map(s => (
                <div key={s.name} className="flex justify-between items-center text-[11px] font-bold border-b border-slate-100 pb-2">
                  <span className="text-slate-600 uppercase">{s.name}</span>
                  <span className="text-blue-800 font-black">{s.pacientes}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-slate-200 rounded-[2.5rem] p-8 bg-slate-50/20">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">Status dos Pacientes (%)</h4>
            <div className="space-y-6">
              {statusPieData.map(s => (
                <div key={s.name} className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase">{s.name}</p>
                       <p className="text-[11px] font-black text-slate-800">{s.value} Pac.</p>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full" style={{ backgroundColor: s.color, width: `${(s.value/stats.total)*100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="bg-slate-900 text-white p-10 rounded-[2.5rem] flex-1">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-widest">Parecer de Inteligência Assistencial</h3>
          </div>
          <div className="space-y-8">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <p className="text-[9px] font-black text-blue-400 uppercase mb-3 tracking-widest">Análise Situacional IA</p>
              <p className="text-[12px] font-bold text-white/90 leading-relaxed text-justify italic">"{aiAnalysis.summary || "Relatório em processamento..."}"</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-emerald-400 uppercase mb-4 tracking-widest ml-1">Estratégias de Resolução de Fluxo</p>
              <div className="grid grid-cols-3 gap-4">
                {aiAnalysis.improvements.map((tip, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 text-[9px] font-black text-emerald-100 uppercase text-center leading-tight">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="print-footer">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            HospFlow • Sistema de Gestão Inteligente
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center justify-center w-10 h-10">
              <div className="relative">
                <Stethoscope className="w-7 h-7 text-emerald-600" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <span className="text-[7px] font-black text-slate-900 mt-0.5">MA</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
