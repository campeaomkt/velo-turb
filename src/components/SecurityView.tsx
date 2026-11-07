import React, { useState } from 'react';
import { ShieldCheck, Lock, Globe, Key, AlertTriangle, Check, Copy } from 'lucide-react';

export const SecurityView: React.FC = () => {
  const [domainLock, setDomainLock] = useState('meusite.com.br\ncheckout.meusite.com.br\npagamento.kiwify.com.br');
  const [antiDownloadEnabled, setAntiDownloadEnabled] = useState(true);
  const [blockInspect, setBlockInspect] = useState(true);
  const [dynamicWatermark, setDynamicWatermark] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-600" />
          Segurança & Proteção Anti-Pirataria de VSL
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Proteja suas cartas de vendas em vídeo contra downloads ilegais, concorrentes e incorporações não autorizadas.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Domain Lock (Trava de Domínio) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Trava de Domínio (Domain Lock)</h3>
          </div>
          <p className="text-xs text-slate-500">
            Impedir que outras pessoas copiem o código da sua página e exibam o seu vídeo em sites de concorrentes. Se um domínio não autorizado tentar carregar o player, ele será bloqueado.
          </p>
          <textarea
            rows={3}
            value={domainLock}
            onChange={(e) => setDomainLock(e.target.value)}
            placeholder="Digite um domínio por linha (ex: meusite.com.br)"
            className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
          <span className="text-[11px] text-slate-400">Insira um domínio por linha sem 'https://' ou use '*' para liberar todos.</span>
        </div>

        {/* Toggles */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900">Bloqueio de Download & Botão Direito</span>
              <p className="text-xs text-slate-500">
                Desabilita o menu de contexto do navegador, impossibilitando salvar o vídeo ou inspecionar o link MP4.
              </p>
            </div>
            <input
              type="checkbox"
              checked={antiDownloadEnabled}
              onChange={(e) => setAntiDownloadEnabled(e.target.checked)}
              className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900">Bloqueio de Atalhos de Inspecionar (F12 / Ctrl+U)</span>
              <p className="text-xs text-slate-500">
                Impede atalhos comuns usados por copiadores para tentar capturar a estrutura da sua página.
              </p>
            </div>
            <input
              type="checkbox"
              checked={blockInspect}
              onChange={(e) => setBlockInspect(e.target.checked)}
              className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900">Marca D'água Dinâmica DRM</span>
              <p className="text-xs text-slate-500">
                Exibe discretamente o IP e ID do visitante em posições aleatórias, desencorajando gravações de tela de celular.
              </p>
            </div>
            <input
              type="checkbox"
              checked={dynamicWatermark}
              onChange={(e) => setDynamicWatermark(e.target.checked)}
              className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-emerald-600 font-semibold">
            {savedSuccess && '✓ Configurações de segurança atualizadas com sucesso!'}
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
          >
            Salvar Regras de Segurança
          </button>
        </div>

      </div>
    </div>
  );
};
