import React, { useState } from 'react';
import { Target, Sparkles, Clock, Volume2, TrendingUp, Check, ShieldCheck, Zap } from 'lucide-react';

export const ConversionsView: React.FC = () => {
  const [pixelMeta, setPixelMeta] = useState('1492083921092');
  const [pixelTikTok, setPixelTikTok] = useState('');
  const [trackEvents, setTrackEvents] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Target className="w-5 h-5 text-rose-600" />
          Central de Conversão & Pixels de VSL
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Aumente o Play Rate, a retenção de tela e envie eventos de 'ViewContent' e 'PitchReached' diretamente para seus pixels de anúncios.
        </p>
      </div>

      {/* Grid of Conversion Engines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Smart Autoplay Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Smart Autoplay Dinâmico</h3>
              <span className="text-[11px] text-emerald-600 font-semibold">+68% Taxa de Play em Celulares</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Navegadores bloqueiam reprodução automática com áudio. O VeloTurb inicia o vídeo mudo imediatamente e destaca a faixa pulsante para o lead ativar o som com 1 toque.
          </p>
        </div>

        {/* Pitch Delay Engine */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pitch Delay Inteligente</h3>
              <span className="text-[11px] text-rose-600 font-semibold">Evita rejeição de preço antes do tempo</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Esconde o botão de compra, depoimentos e garantias até que o vídeo atinja o momento crucial da sua oferta, revelando com transição suave.
          </p>
        </div>

        {/* Fake Progress Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Barra de Progresso Falsa</h3>
              <span className="text-[11px] text-purple-600 font-semibold">+37% Retenção nos primeiros 3 minutos</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Utiliza algoritmo de aceleração inicial para que o lead sinta que o vídeo passará rápido, combatendo a tentação de fechar a aba.
          </p>
        </div>

        {/* Resume Playback */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Retomada Inteligente (Resume)</h3>
              <span className="text-[11px] text-sky-600 font-semibold">Recuperação de leads quentes</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Armazena no navegador do visitante o ponto exato onde ele parou. Ao retornar, o lead não precisa rever a introdução inteira.
          </p>
        </div>

      </div>

      {/* Pixels Tracking Integration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-600" />
          Rastreamento de Pixels e Disparos de Conversão
        </h3>
        <p className="text-xs text-slate-500">
          O player do VeloTurb dispara automaticamente eventos para o Meta Pixel e TikTok quando o lead atinge 25%, 50%, 75% e 100% da VSL, além do evento especial <strong>PitchRevealed</strong> para criar públicos de remarketing ultra-qualificados!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ID do Meta Pixel (Facebook / Instagram)
            </label>
            <input
              type="text"
              value={pixelMeta}
              onChange={(e) => setPixelMeta(e.target.value)}
              placeholder="Ex: 129482910482910"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ID do TikTok Pixel
            </label>
            <input
              type="text"
              value={pixelTikTok}
              onChange={(e) => setPixelTikTok(e.target.value)}
              placeholder="Ex: C891290349821"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={trackEvents}
              onChange={(e) => setTrackEvents(e.target.checked)}
              className="w-4 h-4 accent-rose-600 rounded"
            />
            <span>Disparar evento padrão 'fbq("trackCustom", "VSL_PitchReached")' automaticamente</span>
          </label>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            {saved ? '✓ Salvo!' : 'Salvar Pixels'}
          </button>
        </div>
      </div>

    </div>
  );
};
