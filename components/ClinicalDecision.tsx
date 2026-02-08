
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BrainCircuit, 
  Loader2, 
  Sparkles, 
  ChevronRight, 
  ArrowRightLeft, 
  User, 
  AlertCircle, 
  X,
  ShieldAlert,
  Activity,
  AlertTriangle,
  History,
  MapPin,
  CheckCircle2,
  Accessibility,
  Users,
  Layout
} from 'lucide-react';

interface ClinicalDecisionProps {
  patients: Patient[];
  onUpdatePatient: (id: string, updates: Partial<Patient>) => void;
}

const ClinicalDecision: React.FC<ClinicalDecisionProps> = ({ patients, onUpdatePatient }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [prioritizedList, setPrioritizedList] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [transferModal, setTransferModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sector, setSector] = useState('');
  const [bed, setBed] = useState('');

  // Filtro base: Apenas internados/observação/reavaliação que NÃO pediram transferência ainda
  const getEligible = (filterType: 'all' | 'chairs') => {
    let base = patients.filter(p => 
      !p.isTransferred && 
      !p.isTransferRequested && 
      p.status !== 'Transferência UPA' && 
      p.status !== 'Transferência Externa'
    );

    if (filterType === 'chairs') {
      return base.filter(p => p.situation === 'Cadeira');
    }
    return base;
  };

  const performAnalysis = async (filterType: 'all' | 'chairs') => {
    const eligible = getEligible(filterType);
    
    if (eligible.length === 0) {
        alert(filterType === 'chairs' ? "Não há pacientes em cadeiras para analisar no momento." : "Não há pacientes elegíveis para análise clínica.");
        setShowFilterModal(false);
        return;
    }

    setAnalyzing(true);
    setShowFilterModal(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contextInfo = filterType === 'chairs' ? "FOCO: Pacientes aguardando em CADEIRAS." : "FOCO: Todos os pacientes da unidade.";
      
      const prompt = `Aja como um preceptor de enfermagem experiente, criterioso e humanizado. 
      Analise minuciosamente estes pacientes para priorizar a transferência do corredor para leitos de enfermaria.
      ${contextInfo}
      Critérios críticos: Idade avançada, Gravidade do Diagnóstico, Mobilidade (acamados têm prioridade), Presença de Lesões, Deficiências e Observações Clínicas.
      Exclua qualquer viés puramente numérico; use pensamento clínico crítico.
      Forneça um escore de 0 a 100 e um parecer humanizado e técnico para cada um.
      
      Dados dos Pacientes: ${JSON.stringify(eligible.map(p => ({ 
        id: p.id, 
        nome: p.name, 
        sexo: p.sex,
        idade: p.age, 
        diag: p.diagnosis, 
        mob: p.mobility, 
        lesao: p.hasLesion ? p.lesionDescription : 'Não',
        deficiencias: p.disabilities,
        situacao: p.situation,
        obs: p.notes 
      })))}`;

      // Fixed: contents should be a string for text prompts
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                priorityScore: { type: Type.NUMBER },
                clinicalInsight: { type: Type.STRING }
              },
              required: ["id", "priorityScore", "clinicalInsight"]
            }
          }
        }
      });

      // Fixed: accessing .text directly as a property
      const analysis = JSON.parse(response.text || '[]');
      const enriched = analysis.map((a: any) => {
        const p = eligible.find(p => p.id === a.id);
        return { ...p, ...a };
      }).sort((a: any, b: any) => b.priorityScore - a.priorityScore);

      setPrioritizedList(enriched);
    } catch (e) {
      console.error(e);
      alert("Falha na análise clínica inteligente.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTransfer = () => {
    if (selectedPatient && sector && bed) {
      onUpdatePatient(selectedPatient.id, {
        isTransferRequested: true,
        transferDestinationSector: sector.toUpperCase(),
        transferDestinationBed: bed
      });
      setTransferModal(false);
      setSelectedPatient(null);
      setSector('');
      setBed('');
      alert("Transferência solicitada via Decisão Clínica.");
    } else {
        alert("Preencha setor e leito.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Estilizado */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-inner">
              <BrainCircuit className="w-10 h-10 text-blue-400" />
           </div>
           <div>
              <h2 className="text-2xl font-black tracking-tighter">Preceptor Virtual</h2>
              <p className="text-blue-200/60 font-black uppercase text-[10px] tracking-[0.3em]">Decisão Clínica e Priorização</p>
           </div>
        </div>
        <button 
          onClick={() => setShowFilterModal(true)} 
          disabled={analyzing} 
          className="bg-white text-blue-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-50 active:scale-95 flex items-center gap-2 shadow-xl disabled:opacity-50"
        >
           {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />}
           Processar Prioridades
        </button>
      </div>

      {/* Modal de Escolha de Filtro */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-8 text-white text-center">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <BrainCircuit className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight">Análise de Prioridade</h3>
               <p className="text-slate-400 text-xs font-bold uppercase mt-2">Deseja analisar quais pacientes?</p>
            </div>
            <div className="p-8 space-y-4">
               <button 
                 onClick={() => performAnalysis('all')}
                 className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl flex items-center gap-4 hover:border-blue-500 hover:bg-blue-50 transition-all group"
               >
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                     <Users className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                     <p className="font-black text-slate-800 text-sm uppercase">Todos os pacientes</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Analisa todos os pacientes cadastrados na unidade.</p>
                  </div>
               </button>

               <button 
                 onClick={() => performAnalysis('chairs')}
                 className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl flex items-center gap-4 hover:border-amber-500 hover:bg-amber-50 transition-all group"
               >
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600 group-hover:scale-110 transition-transform">
                     <Activity className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                     <p className="font-black text-slate-800 text-sm uppercase">Em cadeiras</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Foca apenas nos pacientes aguardando em cadeiras.</p>
                  </div>
               </button>

               <button 
                 onClick={() => setShowFilterModal(false)}
                 className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600"
               >
                  Cancelar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista Estilo PatientList */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prioritizedList.map((p, idx) => (
          <div 
            key={p.id} 
            className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${p.hasAllergy ? 'border-purple-300 bg-purple-50/10' : 'border-slate-100'}`} 
            onClick={() => setSelectedPatient(p)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl flex flex-col items-center justify-center ${p.priorityScore > 80 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                   <span className="text-[10px] font-black leading-none mb-1">PRIOR.</span>
                   <span className="text-lg font-black leading-none">{idx + 1}</span>
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-slate-800 group-hover:text-blue-600 truncate uppercase">{p.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prontuário: {p.medicalRecord}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {(!p.hasBracelet || !p.hasBedIdentification) && <AlertTriangle className="w-5 h-5 text-red-600" />}
                {p.hasAllergy && <ShieldAlert className="w-5 h-5 text-purple-600" />}
                {p.hasLesion && <Activity className="w-5 h-5 text-orange-600" />}
                {p.disabilities && p.disabilities.length > 0 && <Accessibility className="w-5 h-5 text-emerald-600" />}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-slate-500 border-t border-slate-100 pt-3">
              <span className="truncate max-w-[70%]">{p.specialty}</span>
              <span className="flex items-center gap-1 text-blue-600">Ver Parecer IA <ChevronRight className="w-3 h-3" /></span>
            </div>
          </div>
        ))}

        {prioritizedList.length === 0 && !analyzing && (
           <div className="col-span-full py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
              <User className="w-16 h-16 opacity-10 mb-4" />
              <p className="font-black uppercase tracking-widest text-xs text-center">Inicie o processamento para priorizar pacientes</p>
           </div>
        )}
      </div>

      {/* Modal de Detalhes Completo com Fluxo de Transferência */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200 border border-slate-200">
            <div className={`p-8 text-white flex justify-between items-start ${selectedPatient.hasAllergy ? 'bg-purple-600' : 'bg-blue-700'}`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
                  <User className="w-10 h-10" />
                </div>
                <div>
                   <h3 className="text-2xl font-black tracking-tight uppercase">{selectedPatient.name}</h3>
                   <p className="text-white/80 font-bold uppercase text-[10px] tracking-widest">
                     {selectedPatient.sex} • {selectedPatient.age} anos • Prontuário: {selectedPatient.medicalRecord}
                   </p>
                </div>
              </div>
              <button onClick={() => { setSelectedPatient(null); setTransferModal(false); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="p-8 space-y-8">
               {/* Parecer IA em destaque */}
               <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-3xl space-y-3 shadow-inner">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600 fill-blue-600" />
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Parecer Clínico Humanizado</p>
                  </div>
                  <p className="text-blue-900 font-bold leading-relaxed italic">
                    "{selectedPatient.clinicalInsight}"
                  </p>
                  <div className="flex items-center gap-1.5 pt-2">
                     <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${selectedPatient.priorityScore}%` }}></div>
                     </div>
                     <span className="text-[10px] font-black text-blue-600 uppercase">{selectedPatient.priorityScore}% PRIORIDADE</span>
                  </div>
               </div>

               {/* Grid de Informações Básicas */}
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Atual</p>
                      <p className="font-bold text-slate-800 text-sm uppercase">{selectedPatient.corridor}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidade</p>
                      <p className="font-bold text-slate-800 text-sm uppercase">{selectedPatient.specialty}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobilidade</p>
                      <p className="font-bold text-slate-800 text-sm uppercase">{selectedPatient.mobility}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Situação</p>
                      <p className="font-bold text-slate-800 text-sm uppercase">{selectedPatient.situation}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Atual</p>
                      <p className="font-bold text-blue-600 text-sm uppercase">{selectedPatient.status}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Segurança</p>
                      <p className={`font-bold text-sm uppercase ${!selectedPatient.hasBracelet || !selectedPatient.hasBedIdentification ? 'text-red-600' : 'text-emerald-600'}`}>
                        {(!selectedPatient.hasBracelet || !selectedPatient.hasBedIdentification) ? 'Pendências Detectadas' : 'Identificado'}
                      </p>
                    </div>
                 </div>
               </div>

               {/* Diagnóstico e Deficiências */}
               <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnóstico Principal</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold uppercase text-slate-700">
                      {selectedPatient.diagnosis.toUpperCase() || 'SEM DIAGNÓSTICO INFORMADO.'}
                    </div>
                  </div>

                  {selectedPatient.disabilities && selectedPatient.disabilities.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deficiências Identificadas</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.disabilities.map((d: string) => (
                          <span key={d} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPatient.notes && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações Adicionais</p>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold uppercase text-slate-700">
                        {selectedPatient.notes.toUpperCase()}
                      </div>
                    </div>
                  )}
               </div>

               {/* Área de Ação: Transferência */}
               <div className="pt-6 border-t border-slate-100 space-y-4">
                  {!transferModal ? (
                    <button 
                      onClick={() => setTransferModal(true)} 
                      className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase text-xs tracking-widest"
                    >
                      <ArrowRightLeft className="w-6 h-6" />
                      Solicitar Transferência Imediata
                    </button>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-indigo-100 space-y-6 animate-in slide-in-from-bottom-4">
                       <div className="flex items-center gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                          <h4 className="text-xs font-black text-indigo-900 uppercase">Configurar Destino</h4>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Setor de Destino</label>
                             <input 
                               placeholder="Ex: CLÍNICA MÉDICA" 
                               className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase" 
                               value={sector} 
                               onChange={e => setSector(e.target.value.toUpperCase())} 
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leito</label>
                             <input 
                               placeholder="Nº" 
                               className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center font-bold" 
                               value={bed} 
                               onChange={e => setBed(e.target.value)} 
                             />
                          </div>
                       </div>

                       <div className="flex gap-3">
                          <button 
                            onClick={() => setTransferModal(false)} 
                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl uppercase text-[10px] tracking-widest"
                          >
                             Voltar
                          </button>
                          <button 
                            onClick={handleTransfer} 
                            className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest active:scale-95"
                          >
                             <CheckCircle2 className="w-4 h-4" /> Confirmar e Enviar
                          </button>
                       </div>
                    </div>
                  )}
                  <button 
                    onClick={() => setSelectedPatient(null)} 
                    className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl transition-all uppercase text-[10px] tracking-widest"
                  >
                    Fechar Detalhes
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalDecision;
