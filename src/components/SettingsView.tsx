import React, { useState, useEffect } from 'react';
import { Settings, Server, Globe, Check, ShieldCheck, Key, RefreshCw, AlertCircle } from 'lucide-react';
import { DEFAULT_BUNNY_CDN_HOSTNAME } from '../utils/urlDetector';

export const SettingsView: React.FC = () => {
  const [userName, setUserName] = useState('Campeão MKT');
  const [userEmail, setUserEmail] = useState('campeao.mkt.user@gmail.com');
  const [bunnyCdnHostname, setBunnyCdnHostname] = useState(DEFAULT_BUNNY_CDN_HOSTNAME);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load backend configuration
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.bunnyCdnHostname) {
          setBunnyCdnHostname(data.bunnyCdnHostname);
        }
      })
      .catch((err) => {
        console.warn('Erro ao carregar config do backend:', err);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bunnyCdnHostname: bunnyCdnHostname.trim() || DEFAULT_BUNNY_CDN_HOSTNAME,
        }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Falha ao salvar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          Configurações da Conta & Bunny Stream CDN
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Gerencie informações da sua conta e o CDN Hostname do Bunny Stream para entrega adaptativa HLS (.m3u8).
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Profile Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>Perfil do Produtor / Afiliado</span>
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

        {/* Bunny Stream CDN Hostname Section */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Bunny Stream CDN Hostname</span>
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold">
              HLS (.m3u8) Adaptativo
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              CDN Hostname da Biblioteca Bunny (BUNNY_CDN_HOSTNAME)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={bunnyCdnHostname}
                onChange={(e) => setBunnyCdnHostname(e.target.value)}
                placeholder="ex: vz-802485-cdn.b-cdn.net"
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                Como funciona a conversão inteligente do VeloTurb:
              </p>
              <p className="text-[11px] leading-relaxed">
                Quando você cola qualquer link do tipo <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900">player.mediadelivery.net/play/802485/&lt;VIDEO_ID&gt;</code>, o VeloTurb extrai automaticamente o ID do vídeo e gera o fluxo HLS correto:
              </p>
              <div className="p-2 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
                https://{bunnyCdnHostname || 'SEU-CDN-HOSTNAME'}/&lt;VIDEO_ID&gt;/playlist.m3u8
              </div>
              <p className="text-[10px] text-slate-500">
                E a thumbnail correspondente em: <code>https://{bunnyCdnHostname || 'SEU-CDN-HOSTNAME'}/&lt;VIDEO_ID&gt;/thumbnail.jpg</code>
              </p>
            </div>
          </div>
        </div>

        {/* Protection & Anti-Download */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Segurança & Proteção Anti-Cópia</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
              <span className="font-bold text-emerald-950 block">Proteção contra Download</span>
              <span className="text-[11px] text-emerald-800">Bloqueio de botão direito, inspect e extensão de download</span>
            </div>
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl">
              <span className="font-bold text-blue-950 block">CORS e Streaming Seguro</span>
              <span className="text-[11px] text-blue-800">Suporte a Access-Control-Allow-Origin: * em todas as rotas</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            {saved && (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Configurações salvas no servidor com sucesso!
              </>
            )}
          </span>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};
