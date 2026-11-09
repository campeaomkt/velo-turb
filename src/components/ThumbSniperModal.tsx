import React, { useState } from 'react';
import { Crosshair, ArrowLeft, X, Check, Upload, Sparkles, HelpCircle, Film, Play } from 'lucide-react';
import { ThumbSniperSettings } from '../types';
import { THUMB_SNIPER_TEMPLATES, ThumbSniperTemplate } from '../data/thumbSniperTemplates';

interface ThumbSniperModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: ThumbSniperSettings;
  onSave: (newSettings: ThumbSniperSettings) => void;
}

export const ThumbSniperModal: React.FC<ThumbSniperModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  // Current view mode: 'overview' | 'editor'
  const [viewMode, setViewMode] = useState<'overview' | 'editor'>('overview');
  const [enabled, setEnabled] = useState(settings?.enabled ?? true);
  const [name, setName] = useState(settings?.name || 'ThumbSniper Principal');
  const [appearanceType, setAppearanceType] = useState<'template' | 'custom'>(settings?.type || 'template');
  const [selectedTemplateId, setSelectedTemplateId] = useState(settings?.templateId || 'ts_01');
  const [customMediaUrl, setCustomMediaUrl] = useState(settings?.customMediaUrl || '');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [pickerSelectedId, setPickerSelectedId] = useState(selectedTemplateId);

  if (!isOpen) return null;

  const currentTemplate =
    THUMB_SNIPER_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    THUMB_SNIPER_TEMPLATES[0];

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomMediaUrl(url);
    }
  };

  const isSpanish = ['ts_05', 'ts_06', 'ts_07', 'ts_08'].includes(selectedTemplateId) || settings?.language === 'es';

  const handleSave = () => {
    const newConfig: ThumbSniperSettings = {
      enabled,
      name,
      type: appearanceType,
      templateId: selectedTemplateId,
      language: isSpanish ? 'es' : 'pt',
      customMediaUrl: customMediaUrl.trim() || undefined,
      headline: currentTemplate.headline,
      subheadline: currentTemplate.subheadline,
      buttonText: currentTemplate.buttonText,
      buttonColor: currentTemplate.buttonColor,
    };
    onSave(newConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans text-slate-800">
        
        {/* VIEW 1: Overview (matching image_217ed8ff.png) */}
        {viewMode === 'overview' && (
          <div className="flex flex-col h-full">
            {/* Top Navigation */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para customização
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Title with target icon and toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-rose-500 flex items-center justify-center text-rose-500 font-bold">
                    <Crosshair className="w-4 h-4 text-rose-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1">
                    ThumbSniper<span className="text-[10px] text-slate-500 align-super">™</span>
                  </h3>
                </div>

                {/* On / Off switch matching screenshot pill */}
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    enabled
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {enabled ? 'on' : 'off'}
                </button>
              </div>

              {/* Info link */}
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold cursor-pointer">
                <HelpCircle className="w-4 h-4" />
                <span>Aprenda sobre ThumbSniper™</span>
              </div>

              {/* Explanatory text */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  O <strong>ThumbSniper™</strong> é acionado quando o visitante dá pausa no vídeo ou tenta sair da página.
                </p>
                <p>
                  Ele exibe um <strong>aviso animado com gatilho de urgência</strong> e uma <strong>mãozinha animada se movimentando (estilo GIF)</strong> induzindo o cliente a clicar e continuar assistindo imediatamente!
                </p>
              </div>

              {/* Big Blue Button: Adicionar / Editar ThumbSniper */}
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                {settings?.enabled ? 'Editar ThumbSniper' : 'Adicionar ThumbSniper'}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: Editor (matching image_f3ee47eb.png) */}
        {viewMode === 'editor' && (
          <div className="flex flex-col h-full">
            {/* Header: < Voltar para ThumbSniper + Cancelar + Criar */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('overview')}
                className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para ThumbSniper
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('overview')}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Criar
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              
              {/* Select */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tipo de Ação
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-1 focus:ring-blue-500"
                    defaultValue="ThumbSniper"
                  >
                    <option value="ThumbSniper">ThumbSniper</option>
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da thumbnail"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Aparência section */}
              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Aparência</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Escolha um template pronto ou faça upload de uma imagem ou GIF para usar como sua ThumbSniper.
                  </p>
                </div>

                {/* Segmented control: Template | Personalizado */}
                <div className="flex rounded-lg border border-blue-500 p-0.5 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setAppearanceType('template')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      appearanceType === 'template'
                        ? 'bg-blue-50 text-blue-600 border border-blue-400 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppearanceType('custom')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      appearanceType === 'custom'
                        ? 'bg-blue-50 text-blue-600 border border-blue-400 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>

                {/* Sub-section: Template mode */}
                {appearanceType === 'template' && (
                  <div
                    onClick={() => {
                      setPickerSelectedId(selectedTemplateId);
                      setShowTemplatePicker(true);
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-800">Selecionar um template</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {currentTemplate ? `Template atual: "${currentTemplate.name}"` : 'Escolha um design de ThumbSniper pronto para começar.'}
                    </p>
                  </div>
                )}

                {/* Sub-section: Personalizado mode */}
                {appearanceType === 'custom' && (
                  <div className="space-y-3">
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50">
                      <Upload className="w-8 h-8 text-blue-500 mb-2" />
                      <span className="text-xs font-bold text-slate-800">
                        Clique para enviar seu próprio GIF animado ou imagem
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        Formatos suportados: .GIF animado, .PNG, .JPG
                      </span>
                      <input
                        type="file"
                        accept="image/gif,image/png,image/jpeg,image/webp"
                        onChange={handleCustomFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Ou cole a URL direta do seu GIF animado:
                      </label>
                      <input
                        type="url"
                        value={customMediaUrl}
                        onChange={(e) => setCustomMediaUrl(e.target.value)}
                        placeholder="https://exemplo.com/meu-gif-animado.gif"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* TEMPLATE PICKER MODAL (matching image_3d394116.png) */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Escolher Template</h3>
              <button
                type="button"
                onClick={() => setShowTemplatePicker(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: 8 Animated Template Cards */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs text-slate-600">
                Escolha um template para o seu Smart ThumbSniper:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {THUMB_SNIPER_TEMPLATES.map((tmpl) => {
                  const isSelected = pickerSelectedId === tmpl.id;
                  const isYellow = tmpl.theme === 'yellow-alert';

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setPickerSelectedId(tmpl.id)}
                      className={`relative rounded-xl p-3.5 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[170px] select-none text-center ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-500/30 scale-[1.02] shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      } ${
                        isYellow
                          ? 'bg-amber-400 text-slate-950'
                          : tmpl.theme === 'navy-red'
                          ? 'bg-slate-900 text-white'
                          : 'bg-zinc-950 text-white'
                      }`}
                    >
                      {/* Check badge if selected */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Header Badge or Stop Icon */}
                      <div className="flex justify-center pt-1">
                        {tmpl.badgeTitle ? (
                          <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">
                            {tmpl.badgeTitle}
                          </span>
                        ) : tmpl.iconType === 'stop' ? (
                          <div className="w-8 h-8 rounded-full border border-red-500/40 bg-red-600/20 text-red-500 flex items-center justify-center font-bold text-sm">
                            ✋
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                            !
                          </div>
                        )}
                      </div>

                      {/* Headline & Subheadline */}
                      <div className="my-2 space-y-0.5">
                        <p className="text-[11px] font-bold leading-tight line-clamp-2">
                          {tmpl.headline}
                        </p>
                        <p className="text-[9px] opacity-80 line-clamp-2">
                          {tmpl.subheadline}
                        </p>
                      </div>

                      {/* Animated CTA button with tapping hand cursor */}
                      <div className="relative pt-1">
                        <div
                          style={{ backgroundColor: tmpl.buttonColor }}
                          className={`w-full py-1.5 px-2 rounded-md text-[10px] font-extrabold uppercase truncate ${
                            tmpl.buttonColor === '#FACC15' ? 'text-slate-950' : 'text-white'
                          }`}
                        >
                          {tmpl.buttonText}
                        </div>

                        {/* Animated Clicking Finger Hand */}
                        <div className="absolute -bottom-1 right-2 pointer-events-none animate-bounce">
                          <span className="text-lg">👆</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
              <button
                type="button"
                onClick={() => setShowTemplatePicker(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplateId(pickerSelectedId);
                  setShowTemplatePicker(false);
                }}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Definir template
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
