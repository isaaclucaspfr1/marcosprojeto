
import React, { useState } from 'react';
import { LeanPatient } from '../types';
import { Search, User, Edit2, Trash2, X, Activity } from 'lucide-react';
import LeanPatientForm from './LeanPatientForm';

interface LeanPatientListProps {
  patients: LeanPatient[];
  onUpdate: (p: LeanPatient[]) => void;
  onCancel: () => void;
}

const LeanPatientList: React.FC<LeanPatientListProps> = ({ patients, onUpdate, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<LeanPatient | null>(null);

  const filtered = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.medicalRecord.includes(searchTerm));

  const handleDelete = (id: string) => {
    if(confirm('Excluir este monitoramento?')) {
      onUpdate(patients.filter(p => p.id !== id));
    }
  };

  const handleSave = (updated: LeanPatient) => {
    onUpdate(patients.map(p => p.id === updated.id ? updated : p));
    setEditing(null);
  };

  if (editing) return <LeanPatientForm initialData={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
           <input placeholder="Buscar no Lean..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={onCancel} className="p-3 bg-slate-100 rounded-2xl text-slate-600"><X className="w-6 h-6" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                   <User className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-black text-slate-800 line-clamp-1">{p.name}</h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.medicalRecord}</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                   <p className="text-[8px] font-black text-slate-400 uppercase">Entrada</p>
                   <p className="text-xs font-bold text-slate-700">{new Date(p.receptionTime).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                   <p className="text-[8px] font-black text-slate-400 uppercase">Status</p>
                   <p className="text-xs font-bold text-blue-600">{p.dischargeTime || p.hospitalizationTime ? 'Finalizado' : 'Em Curso'}</p>
                </div>
             </div>
             <div className="flex gap-2 border-t border-slate-50 pt-4">
                <button onClick={() => setEditing(p)} className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2">
                   <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                   <Trash2 className="w-5 h-5" />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeanPatientList;
