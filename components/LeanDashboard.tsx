
import React from 'react';
import { LeanPatient, LeanSpecialty } from '../types';
import { LEAN_SPECIALTIES } from '../constants';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Printer, Download, Activity, AlertCircle, Clock, X, Stethoscope, Sparkles } from 'lucide-react';

interface LeanDashboardProps {
  patients: LeanPatient[];
  unit: string;
  onCancel: () => void;
}

const LeanDashboard: React.FC<LeanDashboardProps> = ({ patients, unit, onCancel }) => {
  const calculateWait = (start?: string, end?: string) => {
    if(!start || !end) return 0;
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  };

  const specAvgs = LEAN_SPECIALTIES.map(s => {
    const list = patients.filter(p => p.specialty === s);
    const total = list.reduce((acc, p) => acc + calculateWait(p.receptionTime, p.dischargeTime || p.hospitalizationTime || new Date().toISOString()), 0);
    return { name: s, avg: list.length > 0 ? Math.round(total / list.length) : 0 };
  }).filter(s => s.avg > 0);

  const getGargalo = () => {
    const processes = [
      { name: 'Triagem', val: patients.reduce((acc, p) => acc + calculateWait(p.receptionTime, p.triageStartTime), 0) / patients.filter(p => p.triageStartTime).length || 0 },
      { name: 'Médico', val: patients.reduce((acc, p) => acc + calculateWait(p.mdStartTime, p.mdEndTime), 0) / patients.filter(p => p.mdEndTime).length || 0 },
      { name: 'Exames', val: patients.reduce((acc, p) => acc + calculateWait(p.mdEndTime, p.labTime || p.ctTime || p.xrayTime), 0) / patients.filter(p => p.labTime || p.ctTime || p.xrayTime).length || 0 }
    ];
    return processes.sort((a,b) => b.val - a.val)[0];
  };

  const gargalo = getGargalo();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center no-print bg-white p-6 rounded-3xl border shadow-sm">
         <div className="flex items-center gap-4">
            <Activity className="w-10 h-10 text-indigo-600" />
            <div>
               <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Gestão Estratégica Lean</h2>
               <p className="text-xs text-slate-400 font-bold">{unit}</p>
            </div>
         </div>
         <div className="flex gap-3">
            <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase flex items-center gap-2">
               <Download className="w-4 h-4" /> Gerar Dados Lean
            </button>
            <button onClick={onCancel} className="p-3 bg-slate-100 rounded-2xl"><X /></button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Tempo Médio por Especialidade (min)</h4>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={specAvgs}>
                     <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                     <YAxis fontSize={10} axisLine={false} tickLine={false} />
                     <Tooltip contentStyle={{borderRadius:'16px', border:'none'}} />
                     <Bar dataKey="avg" radius={[6,6,0,0]}>
                        {specAvgs.map((e,i) => <Cell key={i} fill={e.avg > 180 ? '#ef4444' : '#6366f1'} />)}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden">
            <AlertCircle className="absolute -top-6 -right-6 w-32 h-32 text-white/5 opacity-10" />
            <div className="relative">
               <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Análise de Gargalo Principal</h4>
               {gargalo && gargalo.val > 0 ? (
                 <>
                   <p className="text-4xl font-black mb-2 uppercase tracking-tighter">{gargalo.name}</p>
                   <p className="text-slate-400 font-bold mb-6">Tempo de espera médio em {gargalo.val.toFixed(0)} minutos.</p>
                   <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                      <Clock className="w-6 h-6 text-yellow-400" />
                      <p className="text-[10px] font-bold text-white/80 leading-relaxed uppercase">Otimização recomendada para redução do LEAD TIME total.</p>
                   </div>
                 </>
               ) : (
                 <p className="text-slate-400 italic">Aguardando dados suficientes...</p>
               )}
            </div>
         </div>
      </div>

      {/* Tabela Resumo em Atendimento */}
      <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm">
         <div className="p-6 border-b bg-slate-50">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Painel de Processos (Em Atendimento)</h4>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 border-b">
                  <tr>
                     <th className="p-4 text-[10px] font-black uppercase text-slate-400">Paciente</th>
                     <th className="p-4 text-[10px] font-black uppercase text-slate-400">Triagem</th>
                     <th className="p-4 text-[10px] font-black uppercase text-slate-400">Atend. Médico</th>
                     <th className="p-4 text-[10px] font-black uppercase text-slate-400">Total Atual</th>
                  </tr>
               </thead>
               <tbody className="divide-y">
                  {patients.filter(p => !p.dischargeTime && !p.hospitalizationTime).map(p => {
                    const total = calculateWait(p.receptionTime, new Date().toISOString());
                    const triage = calculateWait(p.receptionTime, p.triageStartTime);
                    const md = calculateWait(p.mdStartTime, p.mdEndTime);
                    return (
                      <tr key={p.id}>
                         <td className="p-4 font-bold text-slate-800">{p.name}</td>
                         <td className={`p-4 font-bold ${triage > 60 ? 'text-red-600' : 'text-slate-600'}`}>{triage}m</td>
                         <td className={`p-4 font-bold ${md > 60 ? 'text-red-600' : 'text-slate-600'}`}>{md}m</td>
                         <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{total}m</span></td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {/* Relatório Impressão Padronizado */}
      <div className="hidden print:block bg-white text-slate-900 p-0 font-sans" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '15mm' }}>
         <style>{`
           @page { size: A4; margin: 0; }
           body { background: white !important; -webkit-print-color-adjust: exact; }
           .print-header { border-bottom: 4px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
           .print-title { color: #1e3a8a; font-size: 36px; font-weight: 900; text-transform: uppercase; line-height: 1; letter-spacing: -1px; }
           .print-footer { border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; }
         `}</style>

         <div className="print-header">
            <div className="flex items-center gap-4">
               <Activity className="w-14 h-14 text-[#1e3a8a]" />
               <h1 className="print-title">HospFlow</h1>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monitoramento Lean Hospitalar</p>
               <p className="font-bold text-sm text-slate-900">{unit}</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border border-slate-200 p-6 rounded-[2rem] bg-slate-50/30">
               <p className="font-black text-[10px] uppercase text-slate-500 mb-4 tracking-widest">Resumo Geral</p>
               <div className="space-y-2">
                  <div className="flex justify-between border-b pb-1"><span className="text-[10px] font-bold uppercase text-slate-400">Total Monitorados</span><span className="font-black text-blue-900">{patients.length}</span></div>
                  <div className="flex justify-between border-b pb-1"><span className="text-[10px] font-bold uppercase text-slate-400">Gargalo Atual</span><span className="font-black text-red-600 uppercase text-[10px]">{gargalo?.name}</span></div>
                  <div className="flex justify-between pb-1"><span className="text-[10px] font-bold uppercase text-slate-400">Tempo Médio Gargalo</span><span className="font-black text-slate-800">{gargalo?.val.toFixed(0)} min</span></div>
               </div>
            </div>
            <div className="border border-slate-200 p-6 rounded-[2rem] bg-slate-50/30">
               <p className="font-black text-[10px] uppercase text-slate-500 mb-4 tracking-widest">Desempenho por Especialidade</p>
               <div className="space-y-1">
                  {specAvgs.map(s => (
                    <div key={s.name} className="flex justify-between text-[9px] font-bold border-b border-slate-100 pb-1">
                       <span className="text-slate-600 uppercase">{s.name}</span>
                       <span className="text-blue-800">{s.avg} min</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] mb-8">
            <div className="flex items-center gap-3 mb-4">
               <Clock className="w-5 h-5 text-yellow-400" />
               <h4 className="text-[10px] font-black uppercase tracking-widest">Análise de Eficiência Operacional</h4>
            </div>
            <p className="text-xs font-bold leading-relaxed text-blue-100 italic">
               O processo de {gargalo?.name} foi identificado como o principal ponto de retenção do fluxo, com média de {gargalo?.val.toFixed(0)} minutos. Recomenda-se revisão imediata dos protocolos de {gargalo?.name} para otimização do Lead Time total da unidade.
            </p>
         </div>

         <footer className="print-footer">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               HospFlow • Gestão Estratégica Lean
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

export default LeanDashboard;
