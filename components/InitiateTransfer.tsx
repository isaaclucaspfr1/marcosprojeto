
import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { 
  Search, 
  User, 
  MapPin, 
  ChevronRight, 
  ArrowRightLeft, 
  X, 
  CheckCircle2, 
  FileText,
  Activity,
  ShieldAlert,
  Syringe,
  Accessibility
} from 'lucide-react';

interface InitiateTransferProps {
  patients: Patient[];
  onUpdatePatient: (id: string, updates: Partial<Patient>) => void;
  onCancel: () => void;
}

const InitiateTransfer: React.FC<InitiateTransferProps> = ({ patients, onUpdatePatient, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sector, setSector] = useState('');
  const [bed, setBed] = useState('');

  // Filtrar pacientes que ainda não têm transferência solicitada e não foram transferidos
  const eligiblePatients = useMemo(() => {
    return patients
      .filter(p => !p.isTransferred && !p.isTransferRequested)
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.medicalRecord.includes(searchTerm)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [patients, searchTerm]);

  const handleConfirm = () => {
    if (!selectedPatient || !sector || !bed) {
      alert("Por favor, preencha todos os campos da transferência.");
      return;
    }

    onUpdatePatient(selectedPatient.id, {
      isTransferRequested: true,
      transferDestinationSector: sector.toUpperCase(),
      transferDestinationBed: bed,
      status: 'Internado' // Mantém internado até o técnico finalizar
    });

    alert(`Solicitação de transferência para ${selectedPatient.name} enviada com sucesso!`);
    window.dispatchEvent(new CustomEvent('change-view', { detail: 'TRANSFERS' }));
  };

  if (selectedPatient) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in zoom-in duration-300">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-blue-700 p-8 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{selectedPatient.name}</h3>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Prontuário: {selectedPatient.medicalRecord}</p>
              </div>
            </div>
            <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Espelho de Dados do Paciente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dados Clínicos</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700"><span className="text-slate-400 uppercase text-[9px]">Diagnóstico:</span> {selectedPatient.diagnosis}</p>
                  <p className="text-xs font-bold text-slate-700"><span className="text-slate-400 uppercase text-[9px]">Especialidade:</span> {selectedPatient.specialty}</p>
                  <p className="text-xs font-bold text-slate-700"><span className="text-slate-400 uppercase text-[9px]">Mobilidade:</span> {selectedPatient.mobility}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status & Segurança</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase">{selectedPatient.situation}</span>
                  {selectedPatient.hasAllergy && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-[9px] font-black uppercase">Alergia</span>}
                  {selectedPatient.hasLesion && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[9px] font-black uppercase">Lesão</span>}
                  {selectedPatient.disabilities && selectedPatient.disabilities.length > 0 && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase">Deficiência</span>}
                </div>
              </div>
            </div>

            {/* Formulário de Transferência */}
            <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-blue-100 space-y-6">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Destino da Transferência</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Setor de Destino</label>
                  <input 
                    required
                    type="text" 
                    placeholder="EX: CLÍNICA CIRÚRGICA" 
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-800 uppercase"
                    value={sector}
                    onChange={e => setSector(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leito</label>
                  <input 
                    required
                    type="text" 
                    inputMode="numeric"
                    placeholder="APENAS NÚMERO" 
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-800 text-center text-lg"
                    value={bed}
                    onChange={e => setBed(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setSelectedPatient(null)} 
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Confirmar Solicitação
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por Nome do Paciente ou Prontuário..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={onCancel} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {eligiblePatients.map(p => (
          <button 
            key={p.id} 
            onClick={() => setSelectedPatient(p)}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-800 uppercase group-hover:text-blue-600 transition-colors">{p.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prontuário: {p.medicalRecord} • Setor: {p.corridor}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
          </button>
        ))}

        {eligiblePatients.length === 0 && searchTerm && (
          <div className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
            Nenhum paciente encontrado para a busca.
          </div>
        )}
        
        {eligiblePatients.length === 0 && !searchTerm && (
          <div className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
            Aguardando busca de pacientes...
          </div>
        )}
      </div>
    </div>
  );
};

export default InitiateTransfer;
