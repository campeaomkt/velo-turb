import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface ResumePlaybackOverlayProps {
  language?: 'pt' | 'es';
  customTitle?: string;
  customContinueText?: string;
  customRestartText?: string;
  savedSeconds?: number;
  onContinue: () => void;
  onRestart: () => void;
}

export const ResumePlaybackOverlay: React.FC<ResumePlaybackOverlayProps> = ({
  language = 'pt',
  customTitle,
  customContinueText,
  customRestartText,
  savedSeconds,
  onContinue,
  onRestart,
}) => {
  const isEs = language === 'es';

  const title = customTitle || (isEs ? 'Ya has comenzado a ver este video' : 'Você já começou a assistir esse vídeo');
  const continueText = customContinueText || (isEs ? '¿Continuar viendo?' : 'Continuar assistindo?');
  const restartText = customRestartText || (isEs ? '¿Ver desde el inicio?' : 'Assistir do início?');

  const formattedSavedTime = savedSeconds
    ? `${Math.floor(savedSeconds / 60)}:${(Math.floor(savedSeconds % 60)).toString().padStart(2, '0')}`
    : '';

  return (
    <div className="absolute inset-0 z-45 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200 select-none">
      {/* Orange Card matching image_8f1ffac5.png */}
      <div className="w-full max-w-xl aspect-16/10 sm:aspect-video rounded-2xl bg-[#EB6B09] text-white flex flex-col items-center justify-center p-6 sm:p-10 shadow-2xl border border-amber-400/20 text-center relative overflow-hidden group">
        
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-black/10 pointer-events-none" />

        {/* Main Title */}
        <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug max-w-md drop-shadow-md mb-8 sm:mb-12">
          {title}
        </h3>

        {/* Two Options Side by Side */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 w-full max-w-md">
          
          {/* Button 1: Continuar assistindo? */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onContinue();
            }}
            className="flex items-center gap-3 group/btn cursor-pointer transition-transform hover:scale-105 active:scale-95 text-left"
          >
            {/* Outlined Circle with Play Arrow */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white flex items-center justify-center shrink-0 group-hover/btn:bg-white/20 transition-colors shadow-lg">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-extrabold text-white tracking-tight block">
                {continueText}
              </span>
              {formattedSavedTime && (
                <span className="text-[11px] text-amber-100 font-medium block">
                  {isEs ? `Desde el minuto ${formattedSavedTime}` : `Parou em ${formattedSavedTime}`}
                </span>
              )}
            </div>
          </button>

          {/* Button 2: Assistir do início? */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRestart();
            }}
            className="flex items-center gap-3 group/btn cursor-pointer transition-transform hover:scale-105 active:scale-95 text-left"
          >
            {/* Outlined Circle with Counter-clockwise Arrow */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white flex items-center justify-center shrink-0 group-hover/btn:bg-white/20 transition-colors shadow-lg">
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-extrabold text-white tracking-tight block">
                {restartText}
              </span>
              <span className="text-[11px] text-amber-100 font-medium block">
                {isEs ? 'Reiniciar desde 00:00' : 'Voltar ao 00:00'}
              </span>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};
