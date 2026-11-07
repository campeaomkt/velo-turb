import React, { useState } from 'react';
import { Settings, User, Globe, Bell, Check, Server } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [appName, setAppName] = useState('VeloTurb');
  const [userName, setUserName] = useState('Campeão MKT');
  const [userEmail, setUserEmail] = useState('campeao.mkt.user@gmail.com');
  const [cdnDomain, setCdnDomain] = useState('fast.veloturbcdn.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          Configurações da Conta & Player
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Gerencie informações da sua conta, CDN de entrega rápida e preferências do player.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Perfil do Produtor / Afiliado
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome de Exibição</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail de Acesso</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Infraestrutura de Streaming & CDN
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Domínio da CDN de Distribuição (Zero Buffering)
            </label>
            <input
              type="text"
              value={cdnDomain}
              onChange={(e) => setCdnDomain(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Servidores edge no Brasil (São Paulo e Rio de Janeiro) para carregamento instantâneo.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-emerald-600 font-semibold">
            {saved && '✓ Configurações salvas com sucesso!'}
          </span>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};
