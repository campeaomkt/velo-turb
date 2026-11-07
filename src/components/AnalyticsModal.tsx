import React from 'react';
import { BarChart3, TrendingUp, Users, Play, Clock, X, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { VideoItem } from '../types';
import { formatTime } from '../utils/embedGenerator';

interface AnalyticsModalProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onOpenEmbed: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  video,
  isOpen,
  onClose,
  onOpenEmbed,
}) => {
  if (!isOpen) return null;

  // Generate a realistic retention curve data points
  const pointsCount = 20;
  const retentionPoints = Array.from({ length: pointsCount }, (_, idx) => {
    const progress = idx / (pointsCount - 1);
    // Typical VSL decay: sharp drop in first 10%, steady decline, slight bump near pitch
    const pitchPos = (video.settings.pitchDelaySeconds || 60) / (video.duration || 300);
    let val = 100 * Math.exp(-progress * 0.9);
    if (Math.abs(progress - pitchPos) < 0.08) {
      val += 4; // slight curiosity bump before pitch
    }
    return {
      percent: Math.min(100, Math.max(10, Math.round(val))),
      time: Math.round(progress * video.duration),
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-rose-100 text-rose-600">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Métricas de Conversão & Retenção do Vídeo
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {video.title} · Pitch aos <strong className="text-slate-800">{formatTime(video.settings.pitchDelaySeconds || 0)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEmbed}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Obter Código para PV
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Key Metrics KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total de Plays
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1 tabular-nums">
                {video.plays.toLocaleString('pt-BR')}
              </div>
              <span className="text-[11px] text-emerald-600 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +14.2% esta semana
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Taxa de Play (Play Rate)
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1 tabular-nums">
                {video.playRate}%
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {video.views.toLocaleString('pt-BR')} visualizações de página
              </span>
            </div>

            <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200">
              <span className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider block">
                Retenção no Pitch ({formatTime(video.settings.pitchDelaySeconds || 0)})
              </span>
              <div className="text-2xl font-black text-rose-600 font-mono mt-1 tabular-nums">
                {video.retentionAtPitch}%
              </div>
              <span className="text-[11px] text-rose-700 block mt-1">
                Leads qualificados que viram a oferta
              </span>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block">
                Taxa de Conversão da PV
              </span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1 tabular-nums">
                8.4%
              </div>
              <span className="text-[11px] text-emerald-700 block mt-1">
                Cliques no botão de checkout
              </span>
            </div>
          </div>

          {/* Retention Curve Chart */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Gráfico de Retenção da VSL (% de Audiência ao Longo do Tempo)
                </h4>
                <p className="text-xs text-slate-500">
                  Identifique o momento exato em que os visitantes abandonam ou se engajam com sua oferta.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-1 bg-rose-500 rounded-full inline-block" /> Curva de Retenção
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                  <span className="w-2.5 h-2.5 bg-rose-600 rounded-full inline-block" /> Momento do Pitch
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="relative pt-6 pb-2">
              <div className="h-44 flex items-end gap-1.5 sm:gap-2 px-2 border-b border-l border-slate-200">
                {retentionPoints.map((pt, i) => {
                  const isNearPitch = Math.abs(pt.time - (video.settings.pitchDelaySeconds || 0)) < (video.duration / pointsCount);
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center group relative h-full justify-end"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20">
                        {pt.percent}% aos {formatTime(pt.time)}
                      </div>

                      {/* Pitch Marker Indicator */}
                      {isNearPitch && (
                        <div className="absolute top-0 text-[10px] font-bold text-rose-600 -translate-y-4 flex flex-col items-center">
                          <span>PITCH</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                        </div>
                      )}

                      <div
                        style={{ height: `${pt.percent}%` }}
                        className={`w-full rounded-t transition-all group-hover:brightness-110 ${
                          isNearPitch
                            ? 'bg-rose-500 ring-2 ring-rose-400'
                            : 'bg-gradient-to-t from-slate-300 to-slate-400 group-hover:from-rose-400 group-hover:to-rose-500'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Time axis */}
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-2 px-2">
                <span>00:00 (Início)</span>
                <span className="text-rose-600 font-bold">
                  {formatTime(video.settings.pitchDelaySeconds || 0)} (Pitch)
                </span>
                <span>{formatTime(video.duration)} (Fim)</span>
              </div>
            </div>

            {/* Actionable Insights */}
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
              <span className="text-amber-600 font-bold text-sm">💡</span>
              <p>
                <strong>Dica de Alta Escala:</strong> Sua retenção nos primeiros 30 segundos está em 82% (excelente gancho inicial). Experimente ativar o <em>Smart Autoplay com Faixa Amarela</em> para elevar o Play Rate para +75% no tráfego mobile.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
