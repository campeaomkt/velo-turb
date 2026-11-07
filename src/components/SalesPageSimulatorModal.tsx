import React, { useState } from 'react';
import { Smartphone, Monitor, ShieldCheck, CheckCircle2, Lock, ArrowRight, RotateCcw, Volume2, Sparkles, X } from 'lucide-react';
import { VideoItem } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { formatTime } from '../utils/embedGenerator';

interface SalesPageSimulatorModalProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onOpenEmbedModal: () => void;
}

export const SalesPageSimulatorModal: React.FC<SalesPageSimulatorModalProps> = ({
  video,
  isOpen,
  onClose,
  onOpenEmbedModal,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [pitchRevealed, setPitchRevealed] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  if (!isOpen) return null;

  const handlePitchReached = () => {
    setPitchRevealed(true);
  };

  const handleForcePitch = () => {
    setPitchRevealed(true);
  };

  const handleResetSimulation = () => {
    setPitchRevealed(false);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
        
        {/* Simulator Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Simulador de Página de Vendas (PV)</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Veja como seus leads verão a página com Smart Autoplay e Pitch Delay
            </span>
          </div>

          {/* Device and Action Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setDevice('desktop')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  device === 'desktop' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  device === 'mobile' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Celular (Mobile)
              </button>
            </div>

            <button
              onClick={handleResetSimulation}
              title="Reiniciar Simulação"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reiniciar</span>
            </button>

            <button
              onClick={onOpenEmbedModal}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Obter Código para Copiar
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Simulator Viewport Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 flex justify-center items-start">
          <div
            className={`transition-all duration-300 bg-white text-slate-900 shadow-2xl rounded-2xl overflow-hidden min-h-[85vh] ${
              device === 'mobile' ? 'w-[400px] border-4 border-slate-800 my-2' : 'w-full max-w-4xl my-2'
            }`}
          >
            {/* Top Sales Page Urgency Bar */}
            <div className="bg-rose-600 text-white text-center py-2 px-3 text-xs font-bold tracking-wide flex items-center justify-center gap-2">
              <span className="animate-pulse">🔥</span>
              <span>ATENÇÃO: Devido à alta demanda, esta apresentação sairá do ar hoje à meia-noite!</span>
            </div>

            {/* Sales Page Hero Content */}
            <div className="px-5 sm:px-10 pt-8 pb-12 text-center max-w-3xl mx-auto">
              
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                Apresentação Exclusiva em Vídeo
              </span>

              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 mt-4 leading-tight tracking-tight">
                Como Escalar Suas Vendas com o <span className="text-rose-600 underline decoration-rose-300">Novo Protocolo de Alta Conversão</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 mt-3 max-w-xl mx-auto">
                Assista até o final antes que a concorrência descubra esta mesma estratégia.
              </p>

              {/* Player Container */}
              <div className="mt-6 mb-4">
                <VideoPlayer
                  key={resetKey}
                  video={video}
                  isSimulatedSalesPage={true}
                  onPitchReached={handlePitchReached}
                />
              </div>

              {/* Pitch Status Banner for Marketers in Simulator */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg text-xs border border-slate-200 mt-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${pitchRevealed ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                  <span className="text-slate-700">
                    {pitchRevealed ? (
                      <strong className="text-emerald-700">Oferta Revelada! (Lead chegou ao Pitch)</strong>
                    ) : (
                      <span>Aguardando segundo {video.settings.pitchDelaySeconds}s ({formatTime(video.settings.pitchDelaySeconds || 0)}) para revelar a oferta...</span>
                    )}
                  </span>
                </div>

                {!pitchRevealed && (
                  <button
                    onClick={handleForcePitch}
                    className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 text-[11px] transition-colors"
                  >
                    Testar Revelação Agora
                  </button>
                )}
              </div>

              {/* PITCH DELAY SECTION (Hidden until pitch time!) */}
              {pitchRevealed ? (
                <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Vagas Abertas por Tempo Limitado
                    </span>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">
                      Acesso Imediato ao Programa Completo
                    </h2>

                    <div className="my-4 flex items-center justify-center gap-3">
                      <span className="text-slate-400 line-through text-lg">De R$ 997</span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600">Por apenas 12x de R$ 29,70</span>
                    </div>

                    <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
                      Ou R$ 297 à vista no PIX com desconto especial liberado pelo vídeo.
                    </p>

                    {/* Animated Pulsing CTA Button */}
                    <a
                      href={video.settings.ctaUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full max-w-lg py-4 px-6 rounded-xl font-extrabold text-base sm:text-lg text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/40 border-2 border-emerald-300 transition-transform active:scale-95 animate-pulse uppercase tracking-wide cursor-pointer"
                    >
                      {video.settings.ctaText || 'QUERO GARANTIR MINHA VAGA COM 50% DE DESCONTO'}
                    </a>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" /> Compra 100% Criptografada
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Garantia Incondicional de 7 Dias
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Acesso Imediato
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-center text-xs text-slate-400 italic">
                  [O botão de compra e a seção de checkout estão ocultos e surgirão automaticamente no momento do Pitch]
                </div>
              )}

              {/* Social Proof & Guarantee Badges */}
              <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-base font-bold text-slate-900">+12.400</div>
                  <div className="text-xs text-slate-500">Alunos formados</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-base font-bold text-slate-900">4.9 / 5.0</div>
                  <div className="text-xs text-slate-500">Avaliação média</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-base font-bold text-slate-900">7 Dias</div>
                  <div className="text-xs text-slate-500">Garantia total</div>
                </div>
              </div>

            </div>

            {/* Sales Page Footer */}
            <div className="bg-slate-100 border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
              <p>© 2026 Todos os direitos reservados. Este site não é afiliado ao Facebook ou Google.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
