
import React, { useState } from 'react';
import { Patient } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { Stethoscope, Loader2, Sparkles, CheckCircle2, AlertCircle, Search, User } from 'lucide-react';

interface NursingProcessProps {
  patients: Patient[];
}

const NursingProcess: React.FC<NursingProcessProps> = ({ patients }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saeData, setSaeData] = useState<any | null>(null);

  const patient = patients.find(p => p.id === selectedId);

  const generateSAE = async () => {
    if (!patient) return;
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Realize a Sistematização da Assistência de Enfermagem (SAE) para este paciente. 
      Sugira 3 Diagnósticos de Enfermagem (Padrão NANDA) e 2 Intervenções (Padrão NIC) para cada diagnóstico.
      Dados do Paciente: ${JSON.stringify({
        nome: patient.name,
        idade: patient.age,
        diagnostico_medico: patient.diagnosis,
        vitals: patient.vitals,
        mobilidade: patient.mobility,
        lesao: patient.hasLesion ? patient.lesionDescription : 'Não possui',
        alergia: patient.hasAllergy ? patient.allergyDetails : 'Não possui'
      })}`;

      // Fixed: contents should be a string for text prompts
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnoses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nanda: { type: Type.STRING },
                    nic: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        }
      });

      // Fixed: accessing .text directly as a property
      setSaeData(JSON.parse(response.text || '{}'));
    } catch (e) {
      alert("Falha na geração da SAE.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-emerald-600 rounded-3xl text-white shadow-lg">
              <Stethoscope className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">SAE Inteligente</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Assistente de Processo de Enfermagem</p>
           </div>
        </div>

        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecione um Paciente para Prescrição</label>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {patients.filter(p => !p.isTransferred).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => { setSelectedId(p.id); setSaeData(null); }}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left ${selectedId === p.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                   <User className={`w-5 h-5 ${selectedId === p.id ? 'text-emerald-600' : 'text-slate-300'}`} />
                   <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase">{p.medicalRecord}</p>
                   </div>
                </button>
              ))}
           </div>
        </div>

        {patient && (
          <button 
            onClick={generateSAE}
            disabled={analyzing}
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
             {analyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 text-yellow-300" />}
             Gerar Diagnósticos e Cuidados
          </button>
        )}
      </div>

      {saeData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4">
           {saeData.diagnoses.map((d: any, i: number) => (
             <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                   </div>
                   <h4 className="text-xs font-black text-slate-800 leading-tight">{d.nanda}</h4>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-50 flex-1">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cuidados Sugeridos (NIC):</p>
                   <ul className="space-y-2">
                      {d.nic.map((care: string, ci: number) => (
                        <li key={ci} className="text-[10px] font-bold text-slate-600 flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                           <span className="text-emerald-500 font-black">•</span> {care}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default NursingProcess;
