
import React, { useState } from 'react';
import { Patient, Corridor } from '../types';
import { CORRIDORS } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, Sparkles, Printer, ClipboardList, ChevronRight, Activity, Stethoscope } from 'lucide-react';

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

      {/* Versão para Impressão Padronizada */}
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
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Passagem de Plantão Inteligente</p>
               <p className="font-bold text-sm text-slate-900">{selectedCorridor} • {new Date().toLocaleString('pt-BR')}</p>
            </div>
         </div>

         <div className="whitespace-pre-wrap text-sm leading-loose text-slate-800 font-medium bg-slate-50 p-8 rounded-[2rem] border border-slate-100 min-h-[150mm]">
            {summary}
         </div>

         <footer className="print-footer">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               HospFlow • Continuidade da Assistência
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

export default ShiftHandover;
