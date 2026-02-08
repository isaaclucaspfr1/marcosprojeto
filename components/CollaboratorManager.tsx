
import React, { useState, useMemo } from 'react';
import { Collaborator, Role, User as AuthUser } from '../types';
import { 
  UserPlus, 
  RotateCcw, 
  UserMinus, 
  Search, 
  X, 
  ShieldCheck, 
  Stethoscope, 
  Briefcase, 
  UserSearch, 
  AlertCircle, 
  CheckCircle2,
  FileText,
  Filter,
  ArrowDownAZ,
  Printer,
  ChevronLeft
} from 'lucide-react';

interface CollaboratorManagerProps {
  user: AuthUser;
  collaborators: Collaborator[];
  onUpdate: (c: Collaborator[]) => void;
  onCancel: () => void;
}

const CollaboratorManager: React.FC<CollaboratorManagerProps> = ({ user, collaborators, onUpdate, onCancel }) => {
  const [view, setView] = useState<'LIST' | 'NEW' | 'RESET' | 'DELETE' | 'CONSULT'>('LIST');
  const [search, setSearch] = useState('');
  const [found, setFound] = useState<Collaborator | null>(null);
  
  // Form New
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [role, setRole] = useState<Role>('tecnico');

  const isCoord = user.role === 'coordenacao' || user.username === '5669';
  const isNurse = user.role === 'enfermeiro';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if(!/^\d+$/.test(login)) return alert("O usuário (login) deve ser numérico.");
    
    if (collaborators.some(c => c.login === login && !c.isDeleted)) {
      alert("Este usuário já está cadastrado.");
      return;
    }

    const newCollab: Collaborator = { 
      id: crypto.randomUUID(), 
      name, 
      login, 
      password: '1234', 
      role, 
      failedAttempts: 0, 
      isBlocked: false, 
      isDeleted: false 
    };
    onUpdate([...collaborators, newCollab]);
    setView('LIST');
    reset();
    alert("Colaborador cadastrado com sucesso! Senha padrão: 1234");
  };

  const reset = () => { setName(''); setLogin(''); setFound(null); setSearch(''); };

  const handleSearch = () => {
    const f = collaborators.find(c => c.login === search && !c.isDeleted);
    if(f) setFound(f);
    else alert("Usuário não encontrado.");
  };

  const getStatusDisplay = (collab: Collaborator) => {
    if (collab.isDeleted) return { text: 'Excluído', color: 'text-red-600', bg: 'bg-red-50', icon: UserMinus };
    if (collab.isBlocked) return { text: 'Bloqueado', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle };
    return { text: 'Ativo', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 };
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex justify-between items-center mb-10 no-print">
         <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Gestão de Equipes</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              {isCoord ? 'Módulo Administrativo' : 'Módulo de Supervisão'}
            </p>
         </div>
         <button onClick={onCancel} className="p-3 bg-slate-100 rounded-2xl transition-transform active:scale-90"><X /></button>
      </div>

      {view === 'LIST' && (
        <div className="animate-in zoom-in duration-300">
           <div className={`grid grid-cols-1 gap-4 ${isCoord ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
               {isCoord && (
                 <button onClick={() => setView('NEW')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col items-center group">
                    <div className="p-4 rounded-2xl bg-blue-600 text-white mb-4 group-hover:scale-110 transition-transform">
                       <UserPlus className="w-8 h-8" />
                    </div>
                    <span className="font-black text-slate-700 uppercase tracking-widest text-[10px]">Cadastrar Novo</span>
                 </button>
               )}
               
               {(isCoord || isNurse) && (
                 <button onClick={() => setView('RESET')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col items-center group">
                    <div className="p-4 rounded-2xl bg-orange-500 text-white mb-4 group-hover:scale-110 transition-transform">
                       <RotateCcw className="w-8 h-8" />
                    </div>
                    <span className="font-black text-slate-700 uppercase tracking-widest text-[10px]">Resetar Senha</span>
                 </button>
               )}

               {isCoord && (
                 <button onClick={() => setView('DELETE')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all flex flex-col items-center group">
                    <div className="p-4 rounded-2xl bg-red-600 text-white mb-4 group-hover:scale-110 transition-transform">
                       <UserMinus className="w-8 h-8" />
                    </div>
                    <span className="font-black text-slate-700 uppercase tracking-widest text-[10px]">Excluir Usuário</span>
                 </button>
               )}

               <button onClick={() => setView('CONSULT')} className={`bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col items-center group ${!isCoord && !isNurse ? 'col-span-full' : ''}`}>
                  <div className="p-4 rounded-2xl bg-indigo-600 text-white mb-4 group-hover:scale-110 transition-transform">
                     <UserSearch className="w-8 h-8" />
                  </div>
                  <span className="font-black text-slate-700 uppercase tracking-widest text-[10px]">Consultar Usuário</span>
               </button>
           </div>
        </div>
      )}

      {view === 'NEW' && isCoord && (
        <form onSubmit={handleCreate} className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 max-w-xl mx-auto space-y-6 animate-in slide-in-from-right-4">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><UserPlus className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-800">Novo Cadastro</h3>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input required placeholder="Ex: João Silva" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase" value={name} onChange={e => setName(e.target.value.toUpperCase())} />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificação / Login (Só Números)</label>
              <input required placeholder="Digite o número" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono focus:ring-2 focus:ring-blue-500 text-lg" value={login} onChange={e => setLogin(e.target.value.replace(/\D/g, ''))} />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil Assistencial</label>
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                {[
                  { id: 'tecnico', label: 'Técnico', icon: Stethoscope },
                  { id: 'enfermeiro', label: 'Enfermeiro', icon: ShieldCheck },
                  { id: 'coordenacao', label: 'Coordenação', icon: Briefcase }
                ].map(p => (
                  <button key={p.id} type="button" onClick={() => setRole(p.id as Role)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${role === p.id ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:bg-slate-200/50'}`}>
                    <p.icon className="w-4 h-4" /> {p.label}
                  </button>
                ))}
              </div>
           </div>
           <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setView('LIST')} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest">Cancelar</button>
              <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase text-[10px] tracking-widest">Salvar Cadastro</button>
           </div>
        </form>
      )}

      {(view === 'RESET' || view === 'DELETE' || view === 'CONSULT') && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 max-w-xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                 {view === 'RESET' ? <RotateCcw className="text-orange-500" /> : (view === 'DELETE' ? <UserMinus className="text-red-500" /> : <UserSearch className="text-indigo-600" />)}
                 {view === 'RESET' ? 'Resetar Senha' : (view === 'DELETE' ? 'Excluir Usuário' : 'Consultar Colaborador')}
              </h3>
              <button onClick={() => setView('LIST')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digite o número do usuário para consultar</label>
              <div className="flex gap-2">
                 <input placeholder="Ex: 456" className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono focus:ring-2 focus:ring-slate-900 text-lg outline-none" value={search} onChange={e => setSearch(e.target.value.replace(/\D/g, ''))} />
                 <button onClick={handleSearch} className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                 </button>
              </div>
           </div>
           
           {found && (
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-800 text-lg leading-tight">{found.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{found.role} • ID: {found.login}</p>
                  </div>
                  
                  {(() => {
                    const status = getStatusDisplay(found);
                    return (
                      <div className={`px-4 py-2 rounded-xl border-2 ${status.bg} ${status.color} flex items-center gap-2 shadow-sm`}>
                        <status.icon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-tight">{status.text}</span>
                      </div>
                    );
                  })()}
                </div>

                {view === 'RESET' && (isCoord || isNurse) && (
                  <div className="pt-4 border-t border-slate-200">
                     <p className="text-xs font-medium text-slate-500 mb-4 bg-orange-50 p-3 rounded-xl border border-orange-100">
                        <strong>Ação:</strong> A senha retornará para o padrão <b>1234</b> e o usuário será <b>desbloqueado</b> para novo acesso.
                     </p>
                     <button onClick={() => { 
                       onUpdate(collaborators.map(c => c.id === found.id ? {...c, password: '1234', isBlocked: false, failedAttempts: 0} : c)); 
                       setView('LIST'); reset(); alert("Senha resetada e usuário desbloqueado!"); 
                     }} className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                        <RotateCcw className="w-4 h-4" /> Confirmar Reset
                     </button>
                  </div>
                )}

                {view === 'DELETE' && isCoord && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-medium text-red-500 mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
                      <strong>Aviso:</strong> O usuário será removido da base de dados ativa.
                    </p>
                    <button onClick={() => { 
                      onUpdate(collaborators.map(c => c.id === found.id ? {...c, isDeleted: true} : c)); 
                      setView('LIST'); reset(); alert("Usuário excluído com sucesso!"); 
                    }} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                      <UserMinus className="w-4 h-4" /> Confirmar Exclusão
                    </button>
                  </div>
                )}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default CollaboratorManager;
