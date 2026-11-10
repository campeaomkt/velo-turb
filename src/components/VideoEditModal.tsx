import React, { useState } from 'react';
import {
  Settings,
  Play,
  Sparkles,
  Shield,
  Clock,
  Palette,
  Check,
  Eye,
  X,
  Volume2,
  Link as LinkIcon,
  RotateCcw,
  Crosshair,
  ArrowLeft,
  Upload,
  Layers,
  VolumeX,
} from 'lucide-react';
import { VideoItem, PlayerSettings, Folder } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { formatTime } from '../utils/embedGenerator';
import { ThumbSniperModal } from './ThumbSniperModal';
import { THUMB_SNIPER_TEMPLATES } from '../data/thumbSniperTemplates';

interface VideoEditModalProps {
  video: VideoItem;
  folders: Folder[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVideo: VideoItem) => void;
  onOpenEmbed: (video: VideoItem) => void;
}

export type EditTab = 'style' | 'progress' | 'autoplay' | 'pitch' | 'thumbsniper' | 'cta' | 'security';

export const VideoEditModal: React.FC<VideoEditModalProps> = ({
  video,
  folders,
  isOpen,
  onClose,
  onSave,
  onOpenEmbed,
}) => {
  const [formData, setFormData] = useState<VideoItem>({ ...video });
  // Start on Smart Autoplay as requested by user
  const [activeTab, setActiveTab] = useState<EditTab>('autoplay');
  const [mobileView, setMobileView] = useState<'config' | 'preview'>('config');
  const [showThumbSniperModal, setShowThumbSniperModal] = useState(false);
  const [pitchMinutes, setPitchMinutes] = useState(Math.floor((video.settings.pitchDelaySeconds || 0) / 60));
  const [pitchSeconds, setPitchSeconds] = useState((video.settings.pitchDelaySeconds || 0) % 60);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  const handlePitchChange = (mins: number, secs: number) => {
    setPitchMinutes(mins);
    setPitchSeconds(secs);
    const totalSecs = Math.max(0, mins * 60 + secs);
    updateSetting('pitchDelaySeconds', totalSecs);
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  // Preview Mode for the video player on the right
  const previewMode: 'normal' | 'autoplay' | 'resume' | 'thumbsniper' = (() => {
    if (activeTab === 'autoplay') return 'autoplay';
    if (activeTab === 'progress') return 'resume';
    if (activeTab === 'thumbsniper') return 'thumbsniper';
    return 'normal';
  })();

  const colorPresets = [
    { name: 'Vermelho VTurb', hex: '#E11D48' },
    { name: 'Verde Conversão', hex: '#10B981' },
    { name: 'Azul Escala', hex: '#0284C7' },
    { name: 'Roxo Royal', hex: '#8B5CF6' },
    { name: 'Laranja Fogo', hex: '#F97316' },
    { name: 'Preto Absoluto', hex: '#0F172A' },
  ];

  // Menu items matching VTurb layout in image_cda07bcf.png
  const menuItems = [
    {
      id: 'style' as EditTab,
      name: 'Estilo & Design',
      icon: Palette,
      status: null,
    },
    {
      id: 'progress' as EditTab,
      name: 'Progresso Inteligente',
      icon: RotateCcw,
      status: formData.settings.resumePlayback ? 'On' : 'Off',
    },
    {
      id: 'autoplay' as EditTab,
      name: 'Smart Autoplay™',
      icon: Volume2,
      status: formData.settings.smartAutoplay ? 'On' : 'Off',
    },
    {
      id: 'pitch' as EditTab,
      name: 'Turbo & Pitch Delay',
      icon: Clock,
      status: (formData.settings.pitchDelaySeconds || 0) > 0 ? 'On' : 'Off',
    },
    {
      id: 'thumbsniper' as EditTab,
      name: 'ThumbSniper™',
      icon: Crosshair,
      status: (formData.settings.thumbSniper?.enabled ?? true) ? 'On' : 'Off',
    },
    {
      id: 'cta' as EditTab,
      name: 'Botões de ação',
      icon: LinkIcon,
      status: Boolean(formData.settings.ctaUrl && formData.settings.ctaUrl.trim()) ? 'On' : 'Off',
    },
    {
      id: 'security' as EditTab,
      name: 'Segurança & DRM',
      icon: Shield,
      status: formData.settings.antiDownload ? 'On' : 'Off',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-none sm:rounded-2xl w-full max-w-7xl h-[100dvh] sm:h-[94vh] flex flex-col shadow-2xl border-0 sm:border border-slate-200 overflow-hidden font-sans">
        
        {/* Top Header */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer py-1 px-1.5 sm:px-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              title="Voltar ao vídeo"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar ao vídeo</span>
            </button>
            <div className="h-4 w-px bg-slate-300 hidden sm:block" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-rose-600 font-extrabold shrink-0">VTurb</span>
              <span>•</span>
              <span className="truncate max-w-[130px] sm:max-w-xs md:max-w-md">{formData.title}</span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onOpenEmbed(formData)}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[11px] sm:text-xs border border-rose-200 transition-colors cursor-pointer shrink-0"
            >
              <span className="sm:hidden">Código</span>
              <span className="hidden sm:inline">Obter Código da PV</span>
            </button>
            <button
              onClick={handleSave}
              className="px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <span className="sm:hidden">Salvar</span>
              <span className="hidden sm:inline">Salvar Alterações</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* MOBILE CONTROLS BAR (< lg): View Toggle + Horizontal Chips */}
        <div className="lg:hidden bg-slate-100 border-b border-slate-200 shrink-0">
          {/* View Toggle: Configurar vs Live Preview */}
          <div className="flex items-center p-1.5 bg-slate-200/70 border-b border-slate-200 text-xs">
            <button
              onClick={() => setMobileView('config')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                mobileView === 'config'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configurar</span>
            </button>
            <button
              onClick={() => setMobileView('preview')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                mobileView === 'preview'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pré-visualizar VSL</span>
            </button>
          </div>

          {/* Horizontal Scrolling Chips for Settings Tabs */}
          <div className="flex items-center gap-1.5 px-2.5 py-2 overflow-x-auto no-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              const isOn = item.status === 'On';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    // If user was on preview and taps a tab, allow them to view config
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.status && (
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isOn
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body (VTurb 3-Pane Architecture) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* PANE 1: Left Menu Sidebar (Desktop only lg:flex) */}
          <div className="hidden lg:flex w-64 border-r border-slate-200 bg-slate-50/70 p-4 shrink-0 flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1">
                  Configurações de Vídeo
                </h3>
                <p className="text-[11px] text-slate-500">
                  Edite cada recurso individualmente com pré-visualização ao vivo.
                </p>
              </div>

              {/* Menu list with On/Off Badges */}
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  const isOn = item.status === 'On';

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-white text-blue-600 shadow-sm border border-slate-200/80 ring-1 ring-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>

                      {item.status && (
                        <span
                          className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isOn
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Video Title & Folder Quick Edit */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Nome da VSL
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Pasta
                  </label>
                  <select
                    value={formData.folderId}
                    onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-1 focus:ring-blue-500"
                  >
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 text-[10px] text-slate-400 font-mono">
              VeloTurb Engine v2.5.0
            </div>
          </div>

          {/* PANE 2: Center Dedicated Configuration Form for activeTab */}
          <div className={`flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 bg-white ${
            mobileView === 'preview' ? 'hidden lg:block' : 'block'
          }`}>
            
            {/* 1. SMART AUTOPLAY (Separado individualmente como solicitado!) */}
            {activeTab === 'autoplay' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-amber-500" />
                        Smart Autoplay™ com Faixa de Áudio
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Inicia o vídeo mudo imediatamente e exibe banner animado para o lead clicar e ouvir.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.smartAutoplay}
                        onChange={(e) => updateSetting('smartAutoplay', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>

                {formData.settings.smartAutoplay && (
                  <div className="space-y-4">
                    
                    {/* Modelos / Formatos */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>🎨 Modelo & Formato do Autoplay:</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">6 modelos visuais</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {([
                          { id: 'pill', name: 'Pílula (Clássico)', desc: 'Bordas 100% arredondadas' },
                          { id: 'square', name: 'Quadrado Reto', desc: 'Cantos retos modernos' },
                          { id: 'rounded', name: 'Cantos Suaves', desc: 'Bordas levemente curvas' },
                          { id: 'two_lines', name: 'Duas Linhas', desc: 'Título + Instrução de som' },
                          { id: 'full_width', name: 'Faixa Completa', desc: '100% largura do vídeo' },
                          { id: 'minimal', name: 'Mini Badge', desc: 'Discreto e compacto' },
                        ] as const).map((shape) => {
                          const isSelected = (formData.settings.smartAutoplayShape || 'pill') === shape.id;
                          return (
                            <button
                              key={shape.id}
                              type="button"
                              onClick={() => updateSetting('smartAutoplayShape', shape.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className="text-xs font-bold flex items-center justify-between">
                                <span>{shape.name}</span>
                                {isSelected && <span className="text-blue-600 font-black">✓</span>}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{shape.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Posição no Vídeo */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>📍 Posição no Vídeo:</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formData.settings.smartAutoplayPosition || 'top'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {([
                          { id: 'top', label: 'Topo Centro' },
                          { id: 'center', label: 'Centro da Tela' },
                          { id: 'bottom', label: 'Inferior' },
                          { id: 'top_left', label: 'Topo Esq.' },
                          { id: 'top_right', label: 'Topo Dir.' },
                          { id: 'bottom_left', label: 'Inf. Esq.' },
                          { id: 'bottom_right', label: 'Inf. Dir.' },
                        ] as const).map((pos) => {
                          const isSelected = (formData.settings.smartAutoplayPosition || 'top') === pos.id;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => updateSetting('smartAutoplayPosition', pos.id)}
                              className={`py-2 px-2.5 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {pos.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Opacidade */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          👁️ Opacidade do Banner:
                        </label>
                        <span className="text-xs font-mono font-bold text-blue-600">
                          {formData.settings.smartAutoplayOpacity ?? 100}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="20"
                          max="100"
                          step="5"
                          value={formData.settings.smartAutoplayOpacity ?? 100}
                          onChange={(e) => updateSetting('smartAutoplayOpacity', parseInt(e.target.value, 10))}
                          className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                        <div className="flex items-center gap-1">
                          {[100, 90, 80, 70, 50].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => updateSetting('smartAutoplayOpacity', val)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                                (formData.settings.smartAutoplayOpacity ?? 100) === val
                                  ? 'bg-blue-100 border-blue-400 text-blue-700'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {val}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Texto Principal */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Texto Principal da Faixa de Som:
                      </label>
                      <input
                        type="text"
                        value={formData.settings.smartAutoplayText}
                        onChange={(e) => updateSetting('smartAutoplayText', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-bold bg-white"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          'Seu vídeo já começou! Clique para ouvir áudio',
                          'ATENÇÃO: Clique para ouvir com som 🔊',
                          '¡Tu video ya comenzó! Haz clic para escuchar el audio 🔊',
                          'ATENCIÓN: Haz clic para escuchar con audio 🔊',
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => updateSetting('smartAutoplayText', preset)}
                            className="text-[10px] px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtexto para 2 Linhas */}
                    {formData.settings.smartAutoplayShape === 'two_lines' && (
                      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-amber-950">
                          Segunda Linha (Instrução de Ação para o Lead):
                        </label>
                        <input
                          type="text"
                          value={formData.settings.smartAutoplaySubtext || 'Clique aqui para ativar o áudio 🔊'}
                          onChange={(e) => updateSetting('smartAutoplaySubtext', e.target.value)}
                          placeholder="Ex: Clique aqui para ativar o áudio agora 🔊"
                          className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg bg-white focus:ring-1 focus:ring-amber-500 font-medium"
                        />
                      </div>
                    )}

                    {/* Cor da Faixa */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <span className="text-xs font-bold text-slate-800 block">Cor da Faixa:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {(['yellow', 'black', 'red', 'purple', 'green'] as const).map((theme) => (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => updateSetting('smartAutoplayTheme', theme)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-bold capitalize transition-all cursor-pointer ${
                              formData.settings.smartAutoplayTheme === theme
                                ? 'ring-2 ring-blue-500 ring-offset-1'
                                : 'opacity-70 hover:opacity-100'
                            } ${
                              theme === 'yellow' ? 'bg-amber-400 text-black' :
                              theme === 'black' ? 'bg-slate-900 text-white' :
                              theme === 'red' ? 'bg-rose-600 text-white' :
                              theme === 'purple' ? 'bg-purple-600 text-white' : 'bg-[#65a30d] text-white'
                            }`}
                          >
                            {theme === 'yellow' ? 'Amarelo Atenção' : theme === 'black' ? 'Preto Elegante' : theme === 'red' ? 'Vermelho' : theme === 'purple' ? 'Roxo' : 'Verde Oliva (VTurb)'}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* 2. PROGRESSO INTELIGENTE (Retomada & Fake Progress) */}
            {activeTab === 'progress' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-orange-500" />
                        Retomada Inteligente (Resume Playback)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Exibe o card inteligente quando o lead volta ao site para continuar de onde parou.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.resumePlayback}
                        onChange={(e) => updateSetting('resumePlayback', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>

                {formData.settings.resumePlayback && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    {/* Language Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Idioma do Aviso de Retomada:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            updateSetting('resumePlaybackLanguage', 'pt');
                            updateSetting('resumePlaybackTitle', 'Você já começou a assistir esse vídeo');
                            updateSetting('resumePlaybackContinueText', 'Continuar assistindo?');
                            updateSetting('resumePlaybackRestartText', 'Assistir do início?');
                          }}
                          className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            (formData.settings.resumePlaybackLanguage || 'pt') === 'pt'
                              ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>🇧🇷</span>
                          <span>Português (Brasil)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateSetting('resumePlaybackLanguage', 'es');
                            updateSetting('resumePlaybackTitle', 'Ya has comenzado a ver este video');
                            updateSetting('resumePlaybackContinueText', '¿Continuar viendo?');
                            updateSetting('resumePlaybackRestartText', '¿Ver desde el inicio?');
                          }}
                          className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            formData.settings.resumePlaybackLanguage === 'es'
                              ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>🌎</span>
                          <span>Español (LATAM)</span>
                        </button>
                      </div>
                    </div>

                    {/* Customizable texts */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Título do Card:</label>
                        <input
                          type="text"
                          value={formData.settings.resumePlaybackTitle || (formData.settings.resumePlaybackLanguage === 'es' ? 'Ya has comenzado a ver este video' : 'Você já começou a assistir esse vídeo')}
                          onChange={(e) => updateSetting('resumePlaybackTitle', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Botão Continuar:</label>
                          <input
                            type="text"
                            value={formData.settings.resumePlaybackContinueText || (formData.settings.resumePlaybackLanguage === 'es' ? '¿Continuar viendo?' : 'Continuar assistindo?')}
                            onChange={(e) => updateSetting('resumePlaybackContinueText', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Botão Recomeçar:</label>
                          <input
                            type="text"
                            value={formData.settings.resumePlaybackRestartText || (formData.settings.resumePlaybackLanguage === 'es' ? '¿Ver desde el inicio?' : 'Assistir do início?')}
                            onChange={(e) => updateSetting('resumePlaybackRestartText', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fake Progress Bar */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Barra de Progresso Acelerada (Fake Progress)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Avança visualmente mais rápido no início da VSL para aumentar retenção e prender o lead.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.settings.fakeProgressBar}
                      onChange={(e) => updateSetting('fakeProgressBar', e.target.checked)}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. TURBO & PITCH DELAY */}
            {activeTab === 'pitch' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-rose-600" />
                      Pitch Delay (Revelar Botão de Compra no Tempo Certo)
                    </h4>
                    <p className="text-xs text-rose-800 mt-0.5">
                      Esconde o botão ou oferta na sua PV e só revela no momento exato em que você faz a oferta.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-rose-200">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Minutos</label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={pitchMinutes}
                        onChange={(e) => handlePitchChange(parseInt(e.target.value) || 0, pitchSeconds)}
                        className="w-20 px-2 py-1.5 text-base font-mono font-bold border border-slate-300 rounded-lg text-center"
                      />
                    </div>
                    <span className="text-xl font-bold text-slate-400 mt-5">:</span>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Segundos</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={pitchSeconds}
                        onChange={(e) => handlePitchChange(pitchMinutes, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1.5 text-base font-mono font-bold border border-slate-300 rounded-lg text-center"
                      />
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-xs text-slate-500">Momento de Revelação:</div>
                      <div className="text-base font-mono font-bold text-rose-600">
                        {formData.settings.pitchDelaySeconds}s ({formatTime(formData.settings.pitchDelaySeconds || 0)})
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 rounded-lg border border-rose-200 text-xs text-slate-600 leading-relaxed space-y-1">
                    <p className="font-bold text-slate-800">Como funciona na sua página:</p>
                    <p>
                      Basta colocar a classe <code className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded font-mono font-bold">esconder-pitch</code> ou <code className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded font-mono font-bold">delay</code> no botão da sua página. O player do VeloTurb revelará a oferta automaticamente quando esse tempo for atingido!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. THUMBSNIPER™ */}
            {activeTab === 'thumbsniper' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full border-2 border-rose-500 flex items-center justify-center text-rose-500 bg-rose-50">
                        <Crosshair className="w-4 h-4 text-rose-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          ThumbSniper™
                          <span className="text-[10px] text-slate-500 font-normal">Pausa com Gatilho e Mãozinha 👆</span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          Exibe aviso animado com gatilho de urgência ao pausar o vídeo.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.settings.thumbSniper?.enabled ?? true;
                        updateSetting('thumbSniper', {
                          ...(formData.settings.thumbSniper || {
                            name: 'ThumbSniper Principal',
                            type: 'template',
                            templateId: 'ts_01',
                          }),
                          enabled: !current,
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        (formData.settings.thumbSniper?.enabled ?? true)
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-rose-500 text-white shadow-xs'
                      }`}
                    >
                      {(formData.settings.thumbSniper?.enabled ?? true) ? 'on' : 'off'}
                    </button>
                  </div>
                </div>

                {/* Idioma do ThumbSniper */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Idioma dos Textos do ThumbSniper™:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.settings.thumbSniper || { enabled: true, type: 'template', templateId: 'ts_01' };
                        updateSetting('thumbSniper', {
                          ...current,
                          enabled: true,
                          language: 'pt',
                          headline: 'Este vídeo ficará fora do ar em breve.',
                          subheadline: 'Essa é sua última chance de assistir até o final.',
                          buttonText: 'CONTINUAR ASSISTINDO',
                          buttonColor: current.buttonColor || '#EF4444',
                        });
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        (formData.settings.thumbSniper?.language || 'pt') === 'pt'
                          ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-xs ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🇧🇷</span>
                      <span>Português (Brasil)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.settings.thumbSniper || { enabled: true, type: 'template', templateId: 'ts_05' };
                        updateSetting('thumbSniper', {
                          ...current,
                          enabled: true,
                          language: 'es',
                          headline: '¡Este video saldrá del aire pronto!',
                          subheadline: 'Esta es tu última oportunidad de verlo hasta el final.',
                          buttonText: 'CONTINUAR VIENDO',
                          buttonColor: current.buttonColor || '#DC2626',
                        });
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        formData.settings.thumbSniper?.language === 'es'
                          ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-xs ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🌎</span>
                      <span>Español (LATAM)</span>
                    </button>
                  </div>

                  {/* Textos editáveis */}
                  <div className="pt-2 border-t border-slate-200 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Título / Chamada de Urgência:</label>
                      <input
                        type="text"
                        value={formData.settings.thumbSniper?.headline || 'Este vídeo ficará fora do ar em breve.'}
                        onChange={(e) => {
                          updateSetting('thumbSniper', {
                            ...(formData.settings.thumbSniper || { enabled: true, type: 'template', templateId: 'ts_01' }),
                            headline: e.target.value,
                          });
                        }}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Subtítulo de Alerta:</label>
                      <input
                        type="text"
                        value={formData.settings.thumbSniper?.subheadline || 'Essa é sua última chance de assistir até o final.'}
                        onChange={(e) => {
                          updateSetting('thumbSniper', {
                            ...(formData.settings.thumbSniper || { enabled: true, type: 'template', templateId: 'ts_01' }),
                            subheadline: e.target.value,
                          });
                        }}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Texto do Botão com Mãozinha 👆:</label>
                      <input
                        type="text"
                        value={formData.settings.thumbSniper?.buttonText || 'CONTINUAR ASSISTINDO'}
                        onChange={(e) => {
                          updateSetting('thumbSniper', {
                            ...(formData.settings.thumbSniper || { enabled: true, type: 'template', templateId: 'ts_01' }),
                            buttonText: e.target.value,
                          });
                        }}
                        className="w-full px-3 py-1.5 text-xs font-black uppercase border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Templates de alta conversão */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900">Templates Prontos de Alta Conversão</h5>
                    <span className="text-[10px] text-slate-500 font-mono">8 templates disponíveis</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {THUMB_SNIPER_TEMPLATES.map((tmpl) => {
                      const isSelected = (formData.settings.thumbSniper?.templateId || 'ts_01') === tmpl.id;
                      const isYellow = tmpl.theme === 'yellow-alert';
                      const isSpanishTmpl = ['ts_05', 'ts_06', 'ts_07', 'ts_08'].includes(tmpl.id);

                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => {
                            updateSetting('thumbSniper', {
                              enabled: true,
                              name: tmpl.name,
                              type: 'template',
                              templateId: tmpl.id,
                              language: isSpanishTmpl ? 'es' : 'pt',
                              headline: tmpl.headline,
                              subheadline: tmpl.subheadline,
                              buttonText: tmpl.buttonText,
                              buttonColor: tmpl.buttonColor,
                            });
                          }}
                          className={`relative rounded-xl p-2.5 border cursor-pointer transition-all flex flex-col justify-between min-h-[120px] select-none text-center ${
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-500/30 scale-[1.02] shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                          } ${
                            isYellow
                              ? 'bg-amber-400 text-slate-950'
                              : tmpl.theme === 'navy-red'
                              ? 'bg-slate-900 text-white'
                              : 'bg-zinc-950 text-white'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}

                          <div className="text-[10px] font-bold line-clamp-1">
                            {tmpl.badgeTitle || (tmpl.iconType === 'stop' ? '✋' : '⚠️')}
                          </div>

                          <p className="text-[10px] font-bold leading-tight line-clamp-2 my-1">
                            {tmpl.headline}
                          </p>

                          <div className="relative pt-1">
                            <div
                              style={{ backgroundColor: tmpl.buttonColor }}
                              className={`py-1 px-1.5 rounded text-[9px] font-black uppercase truncate ${
                                tmpl.buttonColor === '#FACC15' ? 'text-slate-950' : 'text-white'
                              }`}
                            >
                              {tmpl.buttonText}
                            </div>
                            <div className="absolute -bottom-1 right-1 text-sm pointer-events-none animate-thumb-tap">
                              👆
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 5. ESTILO & DESIGN */}
            {activeTab === 'style' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-slate-900">
                    Cor Primária de Destaque do Player
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {colorPresets.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => updateSetting('primaryColor', c.hex)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          formData.settings.primaryColor === c.hex
                            ? 'border-slate-900 bg-white shadow-sm ring-2 ring-slate-900/10'
                            : 'border-slate-200 bg-white hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Comportamento dos Controles VSL</h4>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.onlyProgressBar}
                        onChange={(e) => updateSetting('onlyProgressBar', e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>Modo VSL Profissional (apenas barra inferior, sem botões de pausa visíveis)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowPause}
                        onChange={(e) => updateSetting('allowPause', e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>Permitir pausar ao clicar na tela (aciona ThumbSniper)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.hideControls}
                        onChange={(e) => updateSetting('hideControls', e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>Ocultar até mesmo a barra de progresso (Vídeo 100% limpo)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 6. BOTÕES DE AÇÃO */}
            {activeTab === 'cta' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-emerald-950">Botão de Compra da Página de Vendas</h4>
                  <p className="text-[11px] text-emerald-800">
                    Gera o código do botão pulsante pronto para colar na sua PV abaixo do vídeo.
                  </p>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Texto Principal do Botão</label>
                      <input
                        type="text"
                        value={formData.settings.ctaText}
                        onChange={(e) => updateSetting('ctaText', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Texto de Garantia / Segurança</label>
                      <input
                        type="text"
                        value={formData.settings.ctaSubtext}
                        onChange={(e) => updateSetting('ctaSubtext', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Link de Checkout / Compra</label>
                      <input
                        type="url"
                        value={formData.settings.ctaUrl}
                        onChange={(e) => updateSetting('ctaUrl', e.target.value)}
                        placeholder="https://pay.kiwify.com.br/..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. SEGURANÇA & DRM */}
            {activeTab === 'security' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Anti-Download & Bloqueio de Botão Direito</h4>
                      <p className="text-[11px] text-slate-500">
                        Impede que visitantes façam download do vídeo ou inspecionem elementos no código.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.settings.antiDownload}
                      onChange={(e) => updateSetting('antiDownload', e.target.checked)}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Trava de Domínio (Domain Lock)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Permite que o player seja exibido apenas nos seus domínios autorizados.
                  </p>
                  <input
                    type="text"
                    value={formData.settings.domainLock}
                    onChange={(e) => updateSetting('domainLock', e.target.value)}
                    placeholder="meusite.com.br, checkout.meusite.com.br"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            )}

          </div>

          {/* PANE 3: Right Column Live Interactive Player Preview (matching image_fbf8f9ed.png) */}
          <div className={`w-full lg:w-[450px] border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/50 p-3.5 sm:p-5 shrink-0 flex flex-col justify-between overflow-y-auto space-y-4 ${
            mobileView === 'config' ? 'hidden lg:flex' : 'flex'
          }`}>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-rose-600" />
                  Pré-visualização em Tempo Real
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Pitch: {formatTime(formData.settings.pitchDelaySeconds || 0)}
                </span>
              </div>

              {/* The Player with live active overlay */}
              <div className="bg-slate-950 p-2 sm:p-2.5 rounded-2xl border border-slate-800 shadow-2xl relative">
                <VideoPlayer
                  video={formData}
                  isSimulatedSalesPage={true}
                  previewMode={previewMode}
                />
              </div>

              {/* Current Preview Status Indicator */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                <span className="font-semibold text-[10.5px] sm:text-[11px]">
                  {activeTab === 'autoplay' && 'Pré-visualizando Smart Autoplay™ ao vivo'}
                  {activeTab === 'progress' && 'Pré-visualizando Retomada Inteligente ao vivo'}
                  {activeTab === 'thumbsniper' && 'Pré-visualizando ThumbSniper™ ao vivo'}
                  {activeTab !== 'autoplay' && activeTab !== 'progress' && activeTab !== 'thumbsniper' && 'Pré-visualizando Player VSL em tempo real'}
                </span>
              </div>
            </div>

            {/* Video Stats Footer */}
            <div className="p-3 sm:p-3.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-600 shadow-xs">
              <div className="flex justify-between items-center">
                <span>Duração Total:</span>
                <strong className="font-mono text-slate-900">{formatTime(formData.duration)}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Pitch da Oferta:</span>
                <strong className="font-mono text-rose-600">{formatTime(formData.settings.pitchDelaySeconds || 0)}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Retenção Estimada:</span>
                <strong className="font-mono text-emerald-600">{formData.retentionAtPitch}%</strong>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </div>

      </div>

      {/* ThumbSniper Dedicated Modal if requested */}
      {showThumbSniperModal && (
        <ThumbSniperModal
          isOpen={showThumbSniperModal}
          settings={formData.settings.thumbSniper}
          onClose={() => setShowThumbSniperModal(false)}
          onSave={(newSniperSettings) => {
            updateSetting('thumbSniper', newSniperSettings);
            setShowThumbSniperModal(false);
          }}
        />
      )}
    </div>
  );
};
