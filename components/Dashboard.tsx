
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Patient } from '../types';
import { 
  Printer, 
  Activity, 
  Sparkles, 
  Loader2, 
  FileText, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  Sofa, 
  Bed, 
  Lightbulb, 
  Stethoscope,
  PieChart as PieChartIcon,
  BarChart3,
  MapPin,
  Clock
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { SPECIALTIES } from '../constants';

interface DashboardProps {
  patients: Patient[];
}

const Dashboard: React.FC<DashboardProps> = ({ patients }) => {
  const [aiAnalysis, setAiAnalysis] = useState<{ summary: string; improvements: string[] }>({ summary: '', improvements: [] });
  const [loadingAi, setLoadingAi] = useState(false);
  const lastAnalyzedCount = useRef<number>(-1);

  // Performance: Cálculo de estatísticas memoizado
  const active = useMemo(() => patients.filter(p => !p.isTransferred), [patients]);
  
  const stats = useMemo(() => {
    const counts = {
      total: active.length,
      internados: active.filter(p => p.status === 'Internado').length,
      observacao: active.filter(p => p.status === 'Observação').length,
      reavaliacao: active.filter(p => p.status === 'Reavaliação').length,
      pendencias: active.filter(p => p.pendencies !== 'Nenhuma' || !p.hasBracelet || !p.hasBedIdentification).length,
      macas: active.filter(p => p.situation === 'Maca').length,
      cadeiras: active.filter(p => p.situation === 'Cadeira').length,
      gargalos: active.filter(p => p.pendencies === 'Sem prescrição médica' || p.pendencies === 'Aguardando exames laboratoriais').length
    };
    return counts;
  }, [active]);

  const specialtyData = useMemo(() => {
    return SPECIALTIES.map(s => ({
      name: s,
      value: active.filter(p => p.specialty === s).length
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [active]);

  const statusPieData = useMemo(() => [
    { name: 'Internados', value: stats.internados, color: '#2563eb' },
    { name: 'Observação', value: stats.observacao, color: '#4f46e5' },
    { name: 'Reavaliação', value: stats.reavaliacao, color: '#f59e0b' }
  ], [stats]);

  const generateAiSummary = async () => {
    if (active.length === lastAnalyzedCount.current || active.length === 0) return;
    setLoadingAi(true);
    lastAnalyzedCount.current = active.length;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise objetivamente esta unidade hospitalar para um gestor de enfermagem:
      INDICADORES:
      - Total de Pacientes: ${stats.total}
      - Status: ${stats.internados} Internados, ${stats.observacao} em Obs, ${stats.reavaliacao} em Reaval.
      - Acomodação: ${stats.macas} em Macas, ${stats.cadeiras} em Cadeiras.
      - Pendências Gerais: ${stats.pendencias}.
      - Gargalos de Fluxo (Exames/Prescrição): ${stats.gargalos}.
      
      Gere um JSON com o seguinte formato:
      {
        "summary": "Um relatório técnico e claro (parágrafo único) resumindo a gravidade da ocupação e fluxos.",
        "improvements": ["Sugestão 1 breve de agilidade", "Sugestão 2 breve", "Sugestão 3 breve"]
      }
      Seja técnico e use os números fornecidos na análise.`;

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
      console.error("Falha ao gerar resumo IA", e);
      setAiAnalysis({ 
        summary: 'Unidade operando com carga elevada. Necessária revisão imediata do giro de leitos e pendências laboratoriais para reduzir superlotação.', 
        improvements: ['Priorizar reavaliações médicas', 'Resolver pendências de AIH', 'Otimizar altas de pacientes em cadeiras'] 
      });
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => generateAiSummary(), 1000);
    return () => clearTimeout(timer);
  }, [active.length]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER DA PÁGINA */}
      <div className="flex justify-between items-center no-print">
         <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Painel Gerencial HospFlow</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitoramento de Fluxo e Ocupação em Tempo Real</p>
         </div>
         <button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl flex items-center gap-2 shadow-xl hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-widest">
            <Printer className="w-5 h-5" /> Imprimir Relatório A4
         </button>
      </div>

      {/* PRIMEIRO PAINEL: CARDS DE OCUPAÇÃO */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 no-print">
        {[
          { label: 'Ocupação Total', val: stats.total, color: 'bg-slate-900 text-white', icon: Users },
          { label: 'Internados', val: stats.internados, color: 'bg-blue-600 text-white', icon: Bed },
          { label: 'Observações', val: stats.observacao, color: 'bg-indigo-600 text-white', icon: Activity },
          { label: 'Reavaliações', val: stats.reavaliacao, color: 'bg-amber-500 text-white', icon: Clock },
          { label: 'Pendências', val: stats.pendencias, color: 'bg-red-600 text-white', icon: AlertCircle }
        ].map(card => (
          <div key={card.label} className={`${card.color} p-5 rounded-[2rem] shadow-lg flex flex-col items-center text-center transition-transform hover:scale-[1.02]`}>
             <card.icon className="w-6 h-6 mb-2 opacity-60" />
             <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">{card.label}</p>
             <h3 className="text-3xl font-black">{card.val}</h3>
          </div>
        ))}
      </div>

      {/* SEGUNDO PAINEL: GRÁFICOS E NÚMEROS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Gráfico de Especialidades */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <BarChart3 className="w-4 h-4 text-blue-600" />
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pacientes por Especialidade</h4>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={specialtyData} layout="vertical">
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" hide />
                       <Tooltip cursor={{fill: 'transparent'}} />
                       <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {specialtyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#94a3b8'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                 {specialtyData.map((s, i) => (
                   <div key={s.name} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                      <span className="text-[9px] font-black text-slate-500 uppercase truncate max-w-[120px]">{s.name}</span>
                      <span className="text-xs font-black text-blue-700">{s.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Gráfico de Status (Ocupação Geral) */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-4 h-4 text-indigo-600" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Geral da Unidade</h4>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={statusPieData}
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {statusPieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                 {statusPieData.map(s => (
                   <div key={s.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                      <div className="flex-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase">{s.name}</p>
                         <p className="text-sm font-black text-slate-800">{s.value} Pacientes ({stats.total > 0 ? ((s.value/stats.total)*100).toFixed(0) : 0}%)</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* TERCEIRO PAINEL: ANÁLISE DE GESTÃO INTELIGENTE (IA) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm no-print">
         <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Análise de Gestão Inteligente</h3>
         </div>
         
         {loadingAi ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processando dados clínicos e operacionais...</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-4">
                  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Relatório Situacional Objetivo</p>
                     <p className="text-blue-900 text-sm font-bold leading-relaxed">
                        {aiAnalysis.summary}
                     </p>
                  </div>
                  
                  {/* Detalhamento de Gargalos em Cards Pequenos */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Em Macas</p>
                        <p className="text-lg font-black text-slate-800">{stats.macas}</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Em Cadeiras</p>
                        <p className="text-lg font-black text-amber-600">{stats.cadeiras}</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Gargalos Críticos</p>
                        <p className="text-lg font-black text-red-600">{stats.gargalos}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                     <Lightbulb className="w-5 h-5 text-emerald-600" />
                     <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Propostas de Melhoria & Agilidade</h4>
                  </div>
                  <ul className="space-y-3 flex-1">
                     {aiAnalysis.improvements.map((tip, i) => (
                       <li key={i} className="text-[10px] font-bold text-emerald-900 flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-emerald-100/50">
                          <span className="text-emerald-500 font-black">•</span> {tip}
                       </li>
                     ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-emerald-100 text-center">
                     <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">HospFlow IA • Gestão Baseada em Dados</p>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* --- RELATÓRIO PDF PARA IMPRESSÃO (A4 FORMATADO) --- */}
      <div className="hidden print:block bg-white text-slate-950 p-0 font-sans">
        <style>{`
          @page { size: A4; margin: 15mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .print-header { border-bottom: 5px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .print-title { font-size: 24px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: -1px; }
          .print-stats-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 10px; margin-bottom: 30px; }
          .print-stat-card { border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; text-align: center; }
          .print-stat-card p { font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
          .print-stat-card h3 { font-size: 18px; font-weight: 900; color: #0f172a; }
          .print-section-title { font-size: 11px; font-weight: 900; color: #1e40af; text-transform: uppercase; margin-bottom: 12px; border-left: 4px solid #1e40af; padding-left: 10px; }
          .print-intro { font-size: 10px; line-height: 1.5; color: #334155; margin-bottom: 25px; text-align: justify; }
          .print-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .print-table th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 9px; text-transform: uppercase; font-weight: 900; }
          .print-table td { border: 1px solid #e2e8f0; padding: 8px; font-size: 9px; font-weight: 600; }
          .print-footer { position: fixed; bottom: 0; left: 0; right: 0; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; }
          .creator-logo { display: flex; items-center gap: 8px; }
        `}</style>
        
        <div className="print-header">
           <div className="flex items-center gap-3">
              <Activity className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="print-title leading-none">HospFlow</h1>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Relatório Gerencial de Unidade</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Emissão</p>
              <p className="font-bold text-xs">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
           </div>
        </div>

        <div className="print-intro">
           O presente documento consolida os indicadores operacionais e clínicos da unidade assistencial, processados digitalmente pelo sistema HospFlow. Este relatório visa fornecer subsídios para a coordenação de enfermagem e diretoria clínica na gestão do fluxo de pacientes, identificação de gargalos de atendimento e priorização de recursos físicos.
        </div>

        <h4 className="print-section-title">Consolidado de Ocupação Atual</h4>
        <div className="print-stats-grid">
           <div className="print-stat-card">
              <p>Ocupação Total</p>
              <h3>{stats.total}</h3>
           </div>
           <div className="print-stat-card">
              <p>Pacientes Internados</p>
              <h3>{stats.internados}</h3>
           </div>
           <div className="print-stat-card">
              <p>Em Observação</p>
              <h3>{stats.observacao}</h3>
           </div>
           <div className="print-stat-card">
              <p>Em Reavaliação</p>
              <h3>{stats.reavaliacao}</h3>
           </div>
           <div className="print-stat-card">
              <p>Em Macas</p>
              <h3>{stats.macas}</h3>
           </div>
           <div className="print-stat-card">
              <p>Em Cadeiras</p>
              <h3>{stats.cadeiras}</h3>
           </div>
           <div className="print-stat-card">
              <p>Pendências Ativas</p>
              <h3>{stats.pendencias}</h3>
           </div>
           <div className="print-stat-card">
              <p>Gargalos de Fluxo</p>
              <h3>{stats.gargalos}</h3>
           </div>
        </div>

        <h4 className="print-section-title">Distribuição por Especialidade</h4>
        <table className="print-table">
           <thead>
              <tr>
                 <th>Especialidade Médica</th>
                 <th style={{ textAlign: 'center' }}>Total de Pacientes</th>
                 <th style={{ textAlign: 'center' }}>Representatividade (%)</th>
              </tr>
           </thead>
           <tbody>
              {specialtyData.map(s => (
                <tr key={s.name}>
                   <td>{s.name.toUpperCase()}</td>
                   <td style={{ textAlign: 'center' }}>{s.value}</td>
                   <td style={{ textAlign: 'center' }}>{((s.value / stats.total) * 100).toFixed(1)}%</td>
                </tr>
              ))}
           </tbody>
        </table>

        <h4 className="print-section-title">Análise de Gestão Inteligente (IA)</h4>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
           <p className="text-[10px] font-bold text-slate-800 leading-relaxed mb-4">
              {aiAnalysis.summary}
           </p>
           <p className="text-[9px] font-black text-blue-800 uppercase mb-2">Propostas de Melhoria Estratégica:</p>
           <ul className="space-y-1">
              {aiAnalysis.improvements.map((tip, i) => (
                <li key={i} className="text-[9px] font-bold text-slate-600">• {tip}</li>
              ))}
           </ul>
        </div>

        <div className="print-footer">
           <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">
              <p>Documento auditado digitalmente pela plataforma HospFlow Assistencial.</p>
              <p>Relatório de uso restrito à equipe multidisciplinar e gestão.</p>
           </div>
           <div className="creator-logo">
              <div className="text-right">
                 <span className="block text-[10px] font-black text-slate-900 uppercase leading-none">Marcos</span>
                 <span className="block text-[10px] font-black text-emerald-600 uppercase mt-1 leading-none">Araújo</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                 <Stethoscope className="w-6 h-6 text-emerald-600" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
