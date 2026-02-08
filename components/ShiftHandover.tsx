
import React, { useState } from 'react';
import { Patient, Corridor } from '../types';
import { CORRIDORS } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, Sparkles, Printer, ClipboardList, ChevronRight } from 'lucide-react';

interface ShiftHandoverProps {
  patients: Patient[];
}

const ShiftHandover: React.FC<ShiftHandoverProps> = ({ patients }) => {
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor>(CORRIDORS[0]);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<string>('');

  const corridorPatients = patients.filter(p => !p.isTransferred && p.corridor === selectedCorridor);

  const generateHandover = async () => {
    if (corridorPatients.length === 0) return;
    setGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Gere um relatório formal e técnico de Passagem de Plantão de Enfermagem para os seguintes pacientes do ${selectedCorridor}. 
      Agrupe por gravidade e destaque pendências críticas (exames, dietas suspensas, falta de pulseira). 
      Seja conciso mas profissional.
      Dados: ${JSON.stringify(corridorPatients.map(p => ({
        nome: p.name,
        idade: p.age,
        diag: p.diagnosis,
        status: p.status,
        vitals: p.vitals,
        pendencias: p.pendencies,
        observacoes: p.notes
      })))}`;

      // Fixed: contents should be a string for text prompts
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      // Fixed: accessing .text directly as a property
      setSummary(response.text || '');
    } catch (e) {
      alert("Falha ao gerar resumo inteligente.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-lg">
              <ClipboardList className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Passagem de Plantão Inteligente</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Resumo Consolidado por Corredor</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecione o Corredor</label>
              <select 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-slate-700"
                value={selectedCorridor}
                onChange={e => { setSelectedCorridor(e.target.value as Corridor); setSummary(''); }}
              >
                {CORRIDORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
           <button 
             onClick={generateHandover} 
             disabled={generating || corridorPatients.length === 0}
             className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
           >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-yellow-300" />}
              Gerar Relatório IA
           </button>
        </div>

        {corridorPatients.length === 0 && (
          <div className="p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
             <p className="text-slate-400 font-bold uppercase text-xs">Nenhum paciente ativo neste corredor.</p>
          </div>
        )}
      </div>

      {summary && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in duration-300">
           <div className="bg-slate-900 p-6 text-white flex justify-between items-center no-print">
              <h3 className="font-black uppercase tracking-widest text-xs">Relatório Consolidado - IA</h3>
              <button onClick={() => window.print()} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                 <Printer className="w-5 h-5" />
              </button>
           </div>
           <div className="p-8 md:p-12">
              <div className="prose prose-slate max-w-none whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-sm">
                 {summary}
              </div>
           </div>
           <div className="p-6 bg-slate-50 border-t flex justify-center no-print">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 Sempre revise os dados antes de assinar a passagem de plantão.
              </p>
           </div>
        </div>
      )}

      {/* Versão para Impressão */}
      <div className="hidden print:block fixed inset-0 bg-white p-12 z-[9999]">
         <div className="border-b-4 border-slate-900 pb-4 mb-8 flex justify-between items-end">
            <div>
               <h1 className="text-3xl font-black uppercase">Passagem de Plantão</h1>
               <p className="font-bold text-slate-500 uppercase text-xs">{selectedCorridor} • Emitido por HospFlow IA</p>
            </div>
            <p className="text-xs font-bold text-slate-400">{new Date().toLocaleString()}</p>
         </div>
         <div className="whitespace-pre-wrap text-sm leading-loose">
            {summary}
         </div>
      </div>
    </div>
  );
};

export default ShiftHandover;
