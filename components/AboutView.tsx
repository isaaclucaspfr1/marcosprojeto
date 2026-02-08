import React, { useState } from 'react';
import { Info, Mail, Send, ArrowLeft, Activity, User, ShieldCheck, HeartPulse, Stethoscope, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';

interface AboutViewProps {
  user: UserType;
  onBack: () => void;
}

const MarcosAraujoLogo = () => (
  <div className="flex flex-col items-center">
    <div className="relative group">
      {/* Brilho de fundo suave */}
      <div className="absolute -inset-2 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
      
      {/* Container da Logo */}
      <div className="relative w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm overflow-visible">
        {/* Estetoscópio Verde Central */}
        <Stethoscope className="w-10 h-10 text-emerald-600" />
        
        {/* Símbolo de IA Dourado (Pequeno lateral) */}
        <div className="absolute -top-1 -right-1 bg-amber-50 p-1.5 rounded-lg border border-amber-200 shadow-sm animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
      </div>
    </div>
    <div className="mt-3 text-center">
      <span className="block text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Marcos</span>
      <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1 leading-none">Araújo</span>
    </div>
  </div>
);

const AboutView: React.FC<AboutViewProps> = ({ user, onBack }) => {
  const [feedback, setFeedback] = useState({ name: user.name, username: user.username, text: '' });
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Sugestão/Reclamação HospFlow - ${feedback.name}`);
    const body = encodeURIComponent(`Nome: ${feedback.name}\nUsuário: ${feedback.username}\n\nMensagem:\n${feedback.text}`);
    window.location.href = `mailto:marcosaraujo.hob@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Seção Principal: Sobre o App */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <Info className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-black tracking-tighter uppercase">Sobre o HospFlow</h2>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tecnologia a serviço da vida</p>
        </div>
        
        <div className="p-8 space-y-6 text-slate-700 leading-relaxed font-medium">
          <p>
            O <strong>HospFlow</strong> foi concebido como uma solução estratégica para enfrentar um dos maiores desafios da gestão hospitalar moderna: a superlotação e o atendimento em corredores.
          </p>
          <p>
            Sua <strong>intenção principal</strong> é agilizar o cadastro e o monitoramento de pacientes que aguardam leitos fixos, transformando o corredor em um ambiente assistencial rastreável, seguro e organizado. Através de uma interface intuitiva, o aplicativo permite que o <strong>enfermeiro</strong> tenha uma visão holística da sua ala e que o <strong>técnico de enfermagem (fluxista ou escalado)</strong> execute suas tarefas com precisão digital, eliminando gargalos de papelada.
          </p>
          <p>
            Para a <strong>coordenação</strong>, o HospFlow atua como um painel de controle em tempo real, permitindo identificar instantaneamente a carga de pacientes por especialidade, gerenciar transferências críticas e monitorar pendências de segurança do paciente (AIH, pulseiras e identificação de leito).
          </p>
          
          <div className="pt-10 border-t border-slate-100">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-12">
                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-center">
                         <Activity className="w-10 h-10 text-blue-600" />
                      </div>
                      <p className="text-[10px] font-black text-blue-800 text-center mt-2 uppercase tracking-widest">HospFlow</p>
                   </div>
                   
                   <div className="h-16 w-px bg-slate-100 hidden md:block"></div>
                   
                   <MarcosAraujoLogo />
                </div>
                
                <div className="text-center md:text-right">
                   <p className="text-sm font-black text-slate-900 mb-1">Desenvolvido por Marcos Araújo</p>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Coren-MG 1299417</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Seção: Sugestões e Reclamações */}
      <div className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-300 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Mail className="w-6 h-6 text-slate-400" />
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Sugestões e Reclamações</h3>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input required type="text" className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none" value={feedback.name} onChange={e => setFeedback({...feedback, name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input required type="text" className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none" value={feedback.username} onChange={e => setFeedback({...feedback, username: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sua Mensagem</label>
            <textarea required rows={4} placeholder="Digite aqui sua sugestão ou reclamação..." className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={feedback.text} onChange={e => setFeedback({...feedback, text: e.target.value})} />
          </div>

          <div className="flex gap-4">
             <button type="button" onClick={onBack} className="flex-1 py-4 bg-slate-200 text-slate-700 font-bold rounded-2xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95">
                <ArrowLeft className="w-4 h-4" /> Voltar
             </button>
             <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 active:scale-95 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {sent ? 'Abrindo E-mail...' : 'Encaminhar Mensagem'}
             </button>
          </div>
        </form>
        <p className="text-center mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           Destinatário: marcosaraujo.hob@gmail.com
        </p>
      </div>
    </div>
  );
};

export default AboutView;