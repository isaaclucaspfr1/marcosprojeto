
import React, { useMemo } from 'react';
import { Patient } from '../types';
import { Eraser, Trash2, Calendar, AlertTriangle } from 'lucide-react';

interface ClearDataViewProps {
  patients: Patient[];
  onDeletePatients: (ids: string[]) => void;
}

const ClearDataView: React.FC<ClearDataViewProps> = ({ patients, onDeletePatients }) => {
  const months = useMemo(() => {
    const map: Record<string, string[]> = {};
    patients.forEach(p => {
      const date = new Date(p.createdAt);
      const key = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      if(!map[key]) map[key] = [];
      map[key].push(p.id);
    });
    return Object.entries(map).sort((a,b) => b[0].localeCompare(a[0]));
  }, [patients]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2.5rem] flex items-start gap-6">
         <div className="p-4 bg-amber-100 text-amber-600 rounded-3xl">
            <AlertTriangle className="w-10 h-10" />
         </div>
         <div>
            <h3 className="text-xl font-black text-amber-900 uppercase tracking-tighter">Zona de Limpeza</h3>
            <p className="text-amber-800 font-medium leading-relaxed">Apague registros antigos para manter o sistema ágil. Esta ação é irreversível.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {months.map(([month, ids]) => (
           <div key={month} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-red-400 transition-all">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                    <Calendar className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-black text-slate-800 capitalize">{month}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ids.length} Registros</p>
                 </div>
              </div>
              <button onClick={() => { if(confirm(`Deseja apagar TODOS os ${ids.length} registros de ${month}?`)) onDeletePatients(ids); }} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                 <Trash2 className="w-5 h-5" />
              </button>
           </div>
         ))}
         {months.length === 0 && (
           <div className="col-span-full py-20 bg-white border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300">
              <Eraser className="w-12 h-12 mb-2 opacity-10" />
              <p className="font-bold uppercase tracking-widest">Nenhum dado acumulado.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default ClearDataView;
