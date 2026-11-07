import React from 'react';
import { ThumbSniperSettings } from '../types';
import { THUMB_SNIPER_TEMPLATES } from '../data/thumbSniperTemplates';
import { AlertCircle, AlertTriangle, Info, Play } from 'lucide-react';

interface ThumbSniperOverlayProps {
  settings?: ThumbSniperSettings;
  onResume: () => void;
}

export const ThumbSniperOverlay: React.FC<ThumbSniperOverlayProps> = ({
  settings,
  onResume,
}) => {
  if (!settings || !settings.enabled) return null;

  const currentTemplate =
    THUMB_SNIPER_TEMPLATES.find((t) => t.id === settings.templateId) ||
    THUMB_SNIPER_TEMPLATES[0];

  const headline = settings.headline || currentTemplate.headline;
  const subheadline = settings.subheadline || currentTemplate.subheadline;
  const buttonText = settings.buttonText || currentTemplate.buttonText;
  const buttonColor = settings.buttonColor || currentTemplate.buttonColor;
  const isCustom = settings.type === 'custom' && settings.customMediaUrl;

  const isYellowAlert = currentTemplate.theme === 'yellow-alert';

  return (
    <div
      onClick={onResume}
      className="absolute inset-0 z-40 bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 cursor-pointer select-none animate-in fade-in duration-200"
    >
      {/* ThumbSniper Animated Card */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onResume();
        }}
        className={`relative max-w-sm sm:max-w-md w-full rounded-2xl p-6 sm:p-7 shadow-2xl border transition-transform hover:scale-[1.02] text-center overflow-hidden ${
          isYellowAlert
            ? 'bg-amber-400 text-slate-950 border-amber-300'
            : currentTemplate.theme === 'navy-red'
            ? 'bg-slate-900 text-white border-rose-500/30'
            : 'bg-zinc-950 text-white border-zinc-800'
        }`}
      >
        {isCustom ? (
          <div className="relative">
            <img
              src={settings.customMediaUrl}
              alt="ThumbSniper Custom"
              className="w-full h-auto max-h-60 object-contain rounded-xl mx-auto shadow-lg"
            />
            {/* Animated Hand Cursor overlay on custom image/GIF */}
            <div className="absolute bottom-4 right-1/4 animate-thumb-tap pointer-events-none">
              <span className="text-3xl sm:text-4xl filter drop-shadow-lg">👆</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Icon / Badge */}
            <div className="flex justify-center items-center">
              {currentTemplate.badgeTitle ? (
                <span
                  className={`text-xs font-black tracking-widest px-3 py-1 rounded-full uppercase ${
                    isYellowAlert
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-red-600/90 text-white animate-pulse'
                  }`}
                >
                  {currentTemplate.badgeTitle}
                </span>
              ) : currentTemplate.iconType === 'stop' ? (
                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 animate-pulse">
                  <span className="text-2xl font-bold">✋</span>
                </div>
              ) : currentTemplate.iconType === 'alert' ? (
                <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg animate-bounce">
                  <AlertTriangle className="w-7 h-7 text-black stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                  <Info className="w-7 h-7 text-white" />
                </div>
              )}
            </div>

            {/* Headline */}
            <h3
              className={`text-sm sm:text-base font-extrabold leading-tight tracking-tight uppercase ${
                isYellowAlert ? 'text-slate-950' : 'text-white'
              }`}
            >
              {headline}
            </h3>

            {/* Subheadline */}
            <p
              className={`text-xs font-medium leading-relaxed max-w-xs mx-auto ${
                isYellowAlert ? 'text-slate-900' : 'text-zinc-300'
              }`}
            >
              {subheadline}
            </p>

            {/* Pulsing Button with Animated Moving / Clicking Hand Cursor */}
            <div className="relative pt-2 inline-block w-full">
              <button
                type="button"
                style={{ backgroundColor: buttonColor }}
                className={`w-full py-3 sm:py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-white/20 animate-pulse ${
                  buttonColor === '#FACC15' ? 'text-slate-950 font-black' : 'text-white'
                }`}
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>{buttonText}</span>
              </button>

              {/* Animated Clicking Hand (GIF Style Moving Finger) */}
              <div className="absolute -bottom-2 right-6 sm:right-10 pointer-events-none animate-thumb-tap">
                <span className="text-3xl sm:text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  👆
                </span>
              </div>
            </div>

          </div>
        )}

        <div className="mt-3 text-[10px] text-zinc-400 font-mono">
          Clique em qualquer lugar para retomar a apresentação
        </div>
      </div>

      <style>{`
        @keyframes thumbTap {
          0% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-8px) scale(1.1); }
          50% { transform: translateY(2px) scale(0.92); }
          70% { transform: translateY(-4px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-thumb-tap {
          animation: thumbTap 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
