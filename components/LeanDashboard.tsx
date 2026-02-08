
import React from 'react';
import { LeanPatient, LeanSpecialty } from '../types';
import { LEAN_SPECIALTIES } from '../constants';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Printer, Download, Activity, AlertCircle, Clock, X } from 'lucide-react';

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

      {/* Relatório Impressão */}
      <div className="hidden print:block p-10">
         <h1 className="text-2xl font-black border-b-2 border-slate-900 pb-2 mb-8 uppercase text-center">Monitoramento Lean Hospitalar - {unit}</h1>
         <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border p-4 rounded-xl">
               <p className="font-black text-xs uppercase mb-2">Resumo Geral</p>
               <p>Total Monitorados: {patients.length}</p>
               <p>Gargalo Atual: {gargalo?.name} ({gargalo?.val.toFixed(0)}m)</p>
            </div>
            <div className="border p-4 rounded-xl">
               <p className="font-black text-xs uppercase mb-2">Desempenho por Especialidade</p>
               {specAvgs.map(s => <p key={s.name}>{s.name}: {s.avg} min</p>)}
            </div>
         </div>
         <p className="text-[10px] text-center text-slate-400 italic">Relatório gerado automaticamente pelo sistema HospFlow IA.</p>
      </div>
    </div>
  );
};

export default LeanDashboard;
