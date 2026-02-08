
import React, { useState, useMemo, useDeferredValue } from 'react';
import { Patient, Role } from '../types';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  ArrowRightLeft, 
  UserCheck, 
  User, 
  ExternalLink, 
  Hospital, 
  CheckCircle, 
  CheckSquare, 
  Square, 
  Trash2, 
  Trash,
  X,
  Send
} from 'lucide-react';

interface TransferManagerProps {
  role: Role;
  patients: Patient[];
  onUpdatePatient: (id: string, updates: Partial<Patient>) => void;
  onDeletePatients?: (ids: string[]) => void;
  historyView?: boolean;
}

const TransferManager: React.FC<TransferManagerProps> = ({ role, patients, onUpdatePatient, onDeletePatients, historyView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Estados para o modal de destino externo
  const [destinationModal, setDestinationModal] = useState<Patient | null>(null);
  const [destinationInput, setDestinationInput] = useState('');
  
  const isAuthorizedToDelete = role === 'enfermeiro' || role === 'coordenacao';

  const currentList = useMemo(() => {
    let base = historyView ? patients.filter(p => p.isTransferred) : patients.filter(p => p.isTransferRequested && !p.isTransferred);
    const lowerSearch = deferredSearch.toLowerCase();
    return base
      .filter(p => p.name.toLowerCase().includes(lowerSearch) || p.medicalRecord.includes(lowerSearch))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [historyView, patients, deferredSearch]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentList.length && currentList.length > 0) setSelectedIds([]);
    else setSelectedIds(currentList.map(p => p.id));
  };

  const handleBulkDelete = () => {
    if (!onDeletePatients || selectedIds.length === 0) return;
    if (confirm(`Deseja excluir permanentemente os ${selectedIds.length} registros selecionados do histórico?`)) {
      onDeletePatients(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleFinishTransfer = (p: Patient) => {
    if (p.status === 'Transferência Externa') {
      setDestinationModal(p);
      setDestinationInput('');
      return;
    }
    
    // Processamento normal para outros status
    onUpdatePatient(p.id, { 
      isTransferred: true, 
      transferredAt: new Date().toISOString()
    });

    window.dispatchEvent(new CustomEvent('change-view', { detail: 'FINALIZED_PATIENTS' }));
  };

  const confirmExternalTransfer = () => {
    if (!destinationModal || !destinationInput.trim()) {
      alert("Por favor, informe o destino da transferência.");
      return;
    }

    onUpdatePatient(destinationModal.id, { 
      isTransferred: true, 
      transferredAt: new Date().toISOString(), 
      transferDestinationBed: destinationInput.toUpperCase() 
    });

    setDestinationModal(null);
    setDestinationInput('');
    
    // Redireciona para Pacientes Finalizados conforme solicitado
    window.dispatchEvent(new CustomEvent('change-view', { detail: 'FINALIZED_PATIENTS' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm no-print">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder={historyView ? "Pesquisar nos finalizados..." : "Filtrar transferências..."} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        {historyView && isAuthorizedToDelete && (
          <div className="flex items-center gap-2">
            <button onClick={toggleSelectAll} className={`p-3 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase transition-all ${selectedIds.length === currentList.length && currentList.length > 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <CheckSquare className="w-5 h-5" /> Todos
            </button>
            {selectedIds.length > 0 && (
               <button onClick={handleBulkDelete} className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 shadow-lg active:scale-95 border border-red-500">
                  <Trash2 className="w-5 h-5" />
               </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentList.map(p => {
          const isSelected = selectedIds.includes(p.id);
          return (
            <div key={p.id} className={`bg-white p-5 rounded-3xl border shadow-sm relative group ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-100'}`} onClick={() => historyView && isAuthorizedToDelete && toggleSelect(p.id)}>
               {historyView && isAuthorizedToDelete && (
                 <div className={`absolute top-4 right-4 p-1.5 rounded-lg transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                    {isSelected ? <CheckCircle className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                 </div>
               )}
               <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-2xl ${historyView ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                     <User className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-black text-slate-800 uppercase line-clamp-1">{p.name}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.medicalRecord}</p>
                  </div>
               </div>
               <div className={`p-4 rounded-2xl border mb-4 space-y-2 ${historyView ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                     <Hospital className={`w-3.5 h-3.5 ${historyView ? 'text-emerald-500' : 'text-orange-500'}`} />
                     <p className={`text-[9px] font-black uppercase ${historyView ? 'text-emerald-600' : 'text-orange-600'}`}>{historyView ? 'Finalizado em' : 'Destino Setorial'}</p>
                  </div>
                  <div className="flex justify-between items-center font-bold text-xs">
                     <span className="text-slate-700 truncate">{p.transferDestinationSector || p.status}</span>
                     <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg">L: {p.transferDestinationBed || 'Pendente'}</span>
                  </div>
               </div>
               {!historyView && (
                 <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onUpdatePatient(p.id, { isTransferRequested: false }); }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button onClick={(e) => { e.stopPropagation(); handleFinishTransfer(p); }} className="flex-1 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95">Finalizar</button>
                 </div>
               )}
               {historyView && (
                 <div className="pt-2 border-t border-slate-50 text-[9px] font-black text-slate-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3 h-3 text-emerald-500" /> {new Date(p.transferredAt!).toLocaleString('pt-BR')}
                    </div>
                    <span className="text-blue-600 opacity-60">ID: {p.id.slice(0,8)}</span>
                 </div>
               )}
            </div>
          )})}
      </div>

      {/* MODAL PARA DESTINO DE TRANSFERÊNCIA EXTERNA */}
      {destinationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in duration-300">
              <div className="bg-red-600 p-8 text-white text-center relative">
                 <button onClick={() => setDestinationModal(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                 </button>
                 <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Hospital className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tight">Transferência Externa</h3>
                 <p className="text-red-100 text-[10px] font-black uppercase tracking-widest mt-2">{destinationModal.name}</p>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Para onde o paciente foi? (Destino)</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="EX: HSC, CERSAN, HOSPITAL X" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-black text-slate-800 uppercase text-lg text-center"
                      value={destinationInput}
                      onChange={e => setDestinationInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && confirmExternalTransfer()}
                    />
                 </div>
                 
                 <div className="flex flex-col gap-3">
                    <button 
                      onClick={confirmExternalTransfer}
                      className="w-full py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl hover:bg-red-700 transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center justify-center gap-3"
                    >
                       <CheckCircle2 className="w-6 h-6" /> Concluir e Finalizar
                    </button>
                    <button 
                      onClick={() => setDestinationModal(null)}
                      className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
                    >
                       Cancelar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {currentList.length === 0 && (
        <div className="py-24 text-center text-slate-300 font-black uppercase text-xs flex flex-col items-center gap-4">
          <div className="p-6 bg-slate-50 rounded-full">
            <User className="w-12 h-12 opacity-10" />
          </div>
          Nenhum registro para exibir no momento.
        </div>
      )}
    </div>
  );
};

export default TransferManager;
