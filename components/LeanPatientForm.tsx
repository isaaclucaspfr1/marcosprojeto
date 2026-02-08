
import React, { useState } from 'react';
import { LeanPatient, LeanSpecialty } from '../types';
import { LEAN_SPECIALTIES } from '../constants';
import { Save, X, Activity, Clock } from 'lucide-react';

interface LeanPatientFormProps {
  onSave: (p: LeanPatient) => void;
  onCancel: () => void;
  initialData?: LeanPatient;
}

const LeanPatientForm: React.FC<LeanPatientFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<LeanPatient>>(initialData || {
    name: '',
    age: 0,
    medicalRecord: '',
    receptionTime: new Date().toISOString()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData as LeanPatient,
      id: formData.id || crypto.randomUUID(),
      createdAt: formData.createdAt || new Date().toISOString()
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-300">
        <div className="bg-blue-600 p-8 text-white flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Activity className="w-10 h-10" />
              <h3 className="text-2xl font-black">Cadastro Fluxo Lean</h3>
           </div>
           <button type="button" onClick={onCancel}><X className="w-8 h-8" /></button>
        </div>

        <div className="p-8 space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Paciente</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Idade</label>
                <input required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.age || ''} onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prontuário</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.medicalRecord} onChange={e => setFormData({ ...formData, medicalRecord: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recepção</label>
                <input required type="datetime-local" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.receptionTime?.slice(0,16)} onChange={e => setFormData({ ...formData, receptionTime: new Date(e.target.value).toISOString() })} />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Início Triagem', key: 'triageStartTime' },
                { label: 'Início Atend. Médico', key: 'mdStartTime' },
                { label: 'Fim Atend. Médico', key: 'mdEndTime' },
                { label: 'Coleta Laboratório', key: 'labTime' },
                { label: 'Tomografia', key: 'ctTime' },
                { label: 'Raio-X', key: 'xrayTime' },
                { label: 'Medicação', key: 'medicationTime' },
                { label: 'Reavaliação Médica', key: 'reevaluationTime' },
                { label: 'Alta', key: 'dischargeTime' },
                { label: 'Internação', key: 'hospitalizationTime' }
              ].map(field => (
                <div key={field.key} className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {field.label}
                   </label>
                   <input 
                      type="datetime-local" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
                      value={(formData as any)[field.key]?.slice(0,16) || ''} 
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value ? new Date(e.target.value).toISOString() : undefined })} 
                   />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidade</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.specialty || ''} onChange={e => setFormData({ ...formData, specialty: e.target.value as LeanSpecialty })}>
                  <option value="">Selecione...</option>
                  {LEAN_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
           </div>
        </div>

        <div className="bg-slate-50 p-8 border-t flex justify-end gap-4">
           <button type="button" onClick={onCancel} className="px-8 py-3 text-slate-600 font-bold">Cancelar</button>
           <button type="submit" className="px-10 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-xl flex items-center gap-2">
              <Save className="w-5 h-5" /> Salvar Fluxo
           </button>
        </div>
      </form>
    </div>
  );
};

export default LeanPatientForm;
