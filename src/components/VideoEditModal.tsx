import React, { useState } from 'react';
import { Settings, Play, Sparkles, Shield, Clock, Palette, Check, Eye, X, Volume2, Link as LinkIcon, RotateCcw, Crosshair, Upload } from 'lucide-react';
import { VideoItem, PlayerSettings, Folder, ThumbSniperSettings } from '../types';
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

export const VideoEditModal: React.FC<VideoEditModalProps> = ({
  video,
  folders,
  isOpen,
  onClose,
  onSave,
  onOpenEmbed,
}) => {
  const [formData, setFormData] = useState<VideoItem>({ ...video });
  const [activeTab, setActiveTab] = useState<'conversion' | 'design' | 'thumbsniper' | 'cta' | 'security'>('conversion');
  const [showThumbSniperModal, setShowThumbSniperModal] = useState(false);
  const [pitchMinutes, setPitchMinutes] = useState(Math.floor((video.settings.pitchDelaySeconds || 0) / 60));
  const [pitchSeconds, setPitchSeconds] = useState((video.settings.pitchDelaySeconds || 0) % 60);
  const [previewResumePrompt, setPreviewResumePrompt] = useState(false);

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

  const colorPresets = [
    { name: 'Vermelho VTurb', hex: '#E11D48' },
    { name: 'Verde Conversão', hex: '#10B981' },
    { name: 'Azul Escala', hex: '#0284C7' },
    { name: 'Roxo Royal', hex: '#8B5CF6' },
    { name: 'Laranja Fogo', hex: '#F97316' },
    { name: 'Preto Absoluto', hex: '#0F172A' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-rose-600" />
              Configurar Player & Conversão
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize o player VSL, configure o Pitch Delay e ative as proteções anti-pirataria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenEmbed(formData)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition-colors"
            >
              Obter Código da PV
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (2 Columns: Controls on left, Live Player Preview on right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          
          {/* LEFT COLUMN: Configuration Tabs & Inputs */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Title & Folder Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Vídeo / VSL
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pasta
                </label>
                <select
                  value={formData.folderId}
                  onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Config Sub-Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('conversion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'conversion' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Conversão & Pitch
              </button>
              <button
                onClick={() => setActiveTab('thumbsniper')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'thumbsniper' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5 text-rose-300" />
                <span>ThumbSniper™</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">NOVO</span>
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'design' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> Design & Cores
              </button>
              <button
                onClick={() => setActiveTab('cta')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'cta' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Botão de Compra CTA
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'security' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Segurança & DRM
              </button>
            </div>

            {/* TAB CONTENT: Conversion */}
            {activeTab === 'conversion' && (
              <div className="space-y-4">
                
                {/* Pitch Delay Settings */}
                <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-rose-600" />
                        Pitch Delay (Tempo para Revelar a Oferta na PV)
                      </h4>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        O botão de compra ou a seção de checkout só aparecerão neste exato momento.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-rose-200">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500">Minutos</label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={pitchMinutes}
                        onChange={(e) => handlePitchChange(parseInt(e.target.value) || 0, pitchSeconds)}
                        className="w-20 px-2 py-1 text-sm font-mono font-bold border border-slate-300 rounded text-center"
                      />
                    </div>
                    <span className="text-lg font-bold text-slate-400 mt-3">:</span>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500">Segundos</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={pitchSeconds}
                        onChange={(e) => handlePitchChange(pitchMinutes, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm font-mono font-bold border border-slate-300 rounded text-center"
                      />
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-[11px] text-slate-500">Total calculado:</div>
                      <div className="text-sm font-mono font-bold text-rose-600">
                        {formData.settings.pitchDelaySeconds} segundos
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Autoplay Settings */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-slate-700" />
                        Smart Autoplay com Faixa de Áudio
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Inicia o vídeo mudo imediatamente e exibe banner animado para o lead clicar e ouvir.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.settings.smartAutoplay}
                      onChange={(e) => updateSetting('smartAutoplay', e.target.checked)}
                      className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                    />
                  </div>

                  {formData.settings.smartAutoplay && (
                    <div className="pt-3 border-t border-slate-200 space-y-4">
                      
                      {/* Model / Shape Chooser (image_17189bc4.png request) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <span>🎨 Modelo & Formato do Autoplay:</span>
                          </label>
                          <span className="text-[10px] text-slate-500 font-medium">6 opções visuais</span>
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
                                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-rose-50/80 border-rose-500 text-rose-950 ring-1 ring-rose-500/20 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div className="text-[11px] font-bold flex items-center justify-between">
                                  <span>{shape.name}</span>
                                  {isSelected && <span className="text-rose-600 font-black">✓</span>}
                                </div>
                                <div className="text-[9.5px] text-slate-500 mt-0.5 line-clamp-1">{shape.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Position Grid Chooser */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <span>📍 Posição no Vídeo:</span>
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formData.settings.smartAutoplayPosition || 'top'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5">
                          {([
                            { id: 'top', label: 'Topo Centro' },
                            { id: 'center', label: 'Centro' },
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
                                className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {pos.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Opacity Control (Slider & Fast Buttons) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <span>👁️ Opacidade do Banner:</span>
                          </label>
                          <span className="text-xs font-mono font-bold text-rose-600">
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
                            className="flex-1 accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                          <div className="flex items-center gap-1">
                            {[100, 90, 80, 70, 50].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => updateSetting('smartAutoplayOpacity', val)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                                  (formData.settings.smartAutoplayOpacity ?? 100) === val
                                    ? 'bg-rose-100 border-rose-400 text-rose-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {val}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Headline Text */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Texto Principal da Faixa de Som
                        </label>
                        <input
                          type="text"
                          value={formData.settings.smartAutoplayText}
                          onChange={(e) => updateSetting('smartAutoplayText', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 font-bold"
                        />
                      </div>

                      {/* Optional Subtext for two_lines model */}
                      {(formData.settings.smartAutoplayShape === 'two_lines') && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                          <label className="block text-[11px] font-bold text-amber-950">
                            Segunda Linha (Instrução de Ação para o Lead):
                          </label>
                          <input
                            type="text"
                            value={formData.settings.smartAutoplaySubtext || 'Clique aqui para ativar o áudio 🔊'}
                            onChange={(e) => updateSetting('smartAutoplaySubtext', e.target.value)}
                            placeholder="Ex: Clique aqui para ativar o áudio agora 🔊"
                            className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg bg-white focus:ring-1 focus:ring-amber-500 font-medium"
                          />
                          <div className="flex flex-wrap gap-1">
                            {[
                              'Clique aqui para ativar o áudio 🔊',
                              'Toque na tela para ouvir agora 🔊',
                              'Haz clic para escuchar el audio 🔊',
                              'Toca para escuchar con volumen alto 🔊',
                            ].map((subPreset) => (
                              <button
                                key={subPreset}
                                type="button"
                                onClick={() => updateSetting('smartAutoplaySubtext', subPreset)}
                                className="text-[9.5px] px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-900 hover:bg-amber-100/50 cursor-pointer"
                              >
                                {subPreset}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Presets PT & ES */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Modelos Prontos de Frases (PT / ES):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Seu vídeo já começou! Clique para ouvir áudio',
                            'ATENÇÃO: Clique para ouvir com som 🔊',
                            '¡Tu video ya comenzó! Haz clic para escuchar el audio 🔊',
                            'ATENCIÓN: Haz clic para escuchar con audio 🔊',
                            'O áudio está mutado. Clique para ativar o som',
                            'Assista com som antes que saia do ar! 🔊',
                          ].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => updateSetting('smartAutoplayText', preset)}
                              className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                formData.settings.smartAutoplayText === preset
                                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Theme */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-600 font-semibold">Cor da Faixa:</span>
                        {(['yellow', 'black', 'red', 'purple'] as const).map((theme) => (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => updateSetting('smartAutoplayTheme', theme)}
                            className={`px-2.5 py-1 text-[11px] rounded font-bold capitalize transition-all cursor-pointer ${
                              formData.settings.smartAutoplayTheme === theme
                                ? 'ring-2 ring-rose-500 ring-offset-1'
                                : 'opacity-70 hover:opacity-100'
                            } ${
                              theme === 'yellow' ? 'bg-amber-400 text-black' :
                              theme === 'black' ? 'bg-slate-900 text-white' :
                              theme === 'red' ? 'bg-rose-600 text-white' : 'bg-purple-600 text-white'
                            }`}
                          >
                            {theme === 'yellow' ? 'Amarelo Atenção' : theme === 'black' ? 'Preto Elegante' : theme === 'red' ? 'Vermelho' : 'Roxo'}
                          </button>
                        ))}
                      </div>

                      {/* Live Preview Box of the Autoplay Banner */}
                      <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 border border-slate-800">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>PRÉ-VISUALIZAÇÃO AO VIVO DO BANNER:</span>
                          <span>Opacidade: {formData.settings.smartAutoplayOpacity ?? 100}%</span>
                        </div>
                        <div className="relative h-20 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden border border-slate-800/80">
                          <div
                            style={{
                              opacity: (formData.settings.smartAutoplayOpacity ?? 100) / 100,
                              backgroundColor:
                                formData.settings.smartAutoplayTheme === 'black' ? '#09090B' :
                                formData.settings.smartAutoplayTheme === 'red' ? '#E11D48' :
                                formData.settings.smartAutoplayTheme === 'purple' ? '#8B5CF6' : '#FACC15',
                              color: formData.settings.smartAutoplayTheme === 'yellow' ? '#000000' : '#FFFFFF',
                              borderRadius:
                                formData.settings.smartAutoplayShape === 'square' ? '0px' :
                                formData.settings.smartAutoplayShape === 'rounded' ? '12px' :
                                formData.settings.smartAutoplayShape === 'full_width' ? '0px' :
                                formData.settings.smartAutoplayShape === 'two_lines' ? '14px' :
                                formData.settings.smartAutoplayShape === 'minimal' ? '8px' : '9999px',
                              width: formData.settings.smartAutoplayShape === 'full_width' ? '100%' : 'auto',
                            }}
                            className={`px-4 py-2 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg ${
                              formData.settings.smartAutoplayShape === 'two_lines' ? 'flex-col text-center py-2.5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>🔇</span>
                              <span>{formData.settings.smartAutoplayText || 'Seu vídeo já começou! Clique para ouvir áudio'}</span>
                              <span>🔊</span>
                            </div>
                            {formData.settings.smartAutoplayShape === 'two_lines' && (
                              <div className="text-[10.5px] opacity-90 font-medium">
                                {formData.settings.smartAutoplaySubtext || 'Clique aqui para ativar o áudio 🔊'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* Fake Progress Bar */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Barra de Progresso Falsa (Fake Progress Bar)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Avança mais rápido no início para dar sensação de brevidade e aumentar retenção.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.settings.fakeProgressBar}
                      onChange={(e) => updateSetting('fakeProgressBar', e.target.checked)}
                      className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Resume Playback (Card Laranja de Retomada Inteligente - image_8f1ffac5.png) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                        Retomada Inteligente (Resume Playback)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Quando o lead sai e volta ao site, exibe aviso para continuar de onde parou ou recomeçar.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.resumePlayback}
                        onChange={(e) => updateSetting('resumePlayback', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  {formData.settings.resumePlayback && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      
                      {/* Language Selection: PT-BR vs ES-LATAM */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
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
                            className={`p-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              (formData.settings.resumePlaybackLanguage || 'pt') === 'pt'
                                ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                            className={`p-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              formData.settings.resumePlaybackLanguage === 'es'
                                ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>🌎</span>
                            <span>Español (LATAM)</span>
                          </button>
                        </div>
                      </div>

                      {/* Visual Preview of the Card matching image_8f1ffac5.png */}
                      <div className="p-3 bg-slate-900 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                          <span>PRÉ-VISUALIZAÇÃO DO AVISO:</span>
                          <button
                            type="button"
                            onClick={() => setPreviewResumePrompt(!previewResumePrompt)}
                            className="text-orange-400 hover:text-orange-300 underline font-bold cursor-pointer"
                          >
                            {previewResumePrompt ? 'Fechar no Player' : 'Testar no Player ao Lado'}
                          </button>
                        </div>

                        <div className="bg-[#EB6B09] rounded-xl p-4 text-white text-center shadow-lg border border-orange-400/30">
                          <h5 className="font-extrabold text-sm sm:text-base leading-snug mb-3 drop-shadow-xs">
                            {formData.settings.resumePlaybackLanguage === 'es'
                              ? 'Ya has comenzado a ver este video'
                              : 'Você já começou a assistir esse vídeo'}
                          </h5>
                          <div className="flex items-center justify-center gap-4 text-xs font-bold">
                            <div className="flex items-center gap-1.5 opacity-95">
                              <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                                <Play className="w-2.5 h-2.5 fill-white text-white ml-0.2" />
                              </div>
                              <span>
                                {formData.settings.resumePlaybackLanguage === 'es'
                                  ? '¿Continuar viendo?'
                                  : 'Continuar assistindo?'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-95">
                              <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                                <RotateCcw className="w-2.5 h-2.5 text-white" />
                              </div>
                              <span>
                                {formData.settings.resumePlaybackLanguage === 'es'
                                  ? '¿Ver desde el inicio?'
                                  : 'Assistir do início?'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT: ThumbSniper™ (matching image_5ab05cef.png, image_217ed8ff.png, image_f3ee47eb.png, image_3d394116.png) */}
            {activeTab === 'thumbsniper' && (
              <div className="space-y-4">
                
                {/* Status & Toggle Header */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full border-2 border-rose-500 flex items-center justify-center text-rose-500 bg-rose-50">
                        <Crosshair className="w-4 h-4 text-rose-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          ThumbSniper™
                          <span className="text-[10px] text-slate-500 font-normal">Pausa com Gatilho e Mãozinha Animada</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Exibe aviso animado estilo GIF com gatilho de urgência ao pausar o vídeo.
                        </p>
                      </div>
                    </div>

                    {/* Toggle button on/off matching screenshot image_217ed8ff.png */}
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

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowThumbSniperModal(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Abrir Editor Completo do ThumbSniper™</span>
                    </button>
                    <span className="text-[11px] text-slate-500">
                      Template atual: <strong className="text-slate-800">{formData.settings.thumbSniper?.templateId || 'ts_01'}</strong>
                    </span>
                  </div>
                </div>

                {/* Language Selector for ThumbSniper (matching Resume Playback UX) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1.5">
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
                  </div>

                  {/* Editable Text Fields for ThumbSniper */}
                  <div className="pt-2 border-t border-slate-200 space-y-2.5">
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-0.5">Título / Chamada de Urgência:</label>
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
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-0.5">Subtítulo de Alerta:</label>
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
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-0.5">Texto do Botão com Mãozinha 👆:</label>
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

                {/* Templates Quick Chooser (with moving hand indicator) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900">Templates Prontos de Alta Conversão</h5>
                    <span className="text-[10px] text-slate-500 font-mono">8 templates disponíveis (PT e ES)</span>
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

                {/* Custom GIF / Image Section */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h5 className="text-xs font-bold text-slate-900">Ou use seu próprio GIF animado / imagem</h5>
                  <p className="text-[11px] text-slate-500">
                    Se você já tem uma animação personalizada de pausa, cole a URL abaixo:
                  </p>
                  <input
                    type="url"
                    value={formData.settings.thumbSniper?.customMediaUrl || ''}
                    onChange={(e) => {
                      updateSetting('thumbSniper', {
                        ...(formData.settings.thumbSniper || {
                          enabled: true,
                          name: 'Custom ThumbSniper',
                          type: 'custom',
                          templateId: 'ts_01',
                        }),
                        type: 'custom',
                        templateId: formData.settings.thumbSniper?.templateId || 'ts_01',
                        customMediaUrl: e.target.value,
                      });
                    }}
                    placeholder="https://exemplo.com/meu-gif-animado.gif"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

              </div>
            )}

            {/* TAB CONTENT: Design */}
            {activeTab === 'design' && (
              <div className="space-y-4">
                {/* Accent Color */}
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          formData.settings.primaryColor === c.hex
                            ? 'border-slate-900 bg-white shadow-sm ring-2 ring-slate-900/10'
                            : 'border-slate-200 bg-white hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="color"
                        value={formData.settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-xs text-slate-600">{formData.settings.primaryColor}</span>
                    </div>
                  </div>
                </div>

                {/* Player Controls Toggle */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Estilo dos Controles do Player</h4>
                  
                  {/* Highlighted VSL Professional Mode option */}
                  <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                        🔥 Modo VSL Profissional (Apenas Barra de Progresso)
                      </span>
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        Oculta botões de play, pause, volume, tempo decorrido e tela cheia. O visitante vê apenas o vídeo rodando e a barra de progresso sutil na base, impedindo que saiba a duração ou desista antes da oferta.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.settings.onlyProgressBar ?? true}
                      onChange={(e) => updateSetting('onlyProgressBar', e.target.checked)}
                      className="w-5 h-5 accent-rose-600 rounded cursor-pointer shrink-0 mt-1"
                    />
                  </div>

                  <div className="space-y-2 text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowPause}
                        onChange={(e) => updateSetting('allowPause', e.target.checked)}
                        className="w-4 h-4 accent-rose-600 rounded"
                      />
                      <span>Permitir pausar ao clicar no vídeo (desmarcado = VSL contínua sem pausa)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.speedControl}
                        onChange={(e) => updateSetting('speedControl', e.target.checked)}
                        className="w-4 h-4 accent-rose-600 rounded"
                      />
                      <span>Exibir seletor de velocidade (1.25x / 1.5x)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.hideControls}
                        onChange={(e) => updateSetting('hideControls', e.target.checked)}
                        className="w-4 h-4 accent-rose-600 rounded"
                      />
                      <span>Ocultar até mesmo a barra de progresso (Vídeo 100% limpo)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CTA Button */}
            {activeTab === 'cta' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-emerald-950">Configuração do Botão de Compra da PV</h4>
                  <p className="text-[11px] text-emerald-800">
                    Defina o link e texto para gerar o botão pronto para colar na sua página.
                  </p>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Texto Principal do Botão</label>
                      <input
                        type="text"
                        value={formData.settings.ctaText}
                        onChange={(e) => updateSetting('ctaText', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Texto Abaixo do Botão (Garantia)</label>
                      <input
                        type="text"
                        value={formData.settings.ctaSubtext}
                        onChange={(e) => updateSetting('ctaSubtext', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Link de Checkout / Compra</label>
                      <input
                        type="url"
                        value={formData.settings.ctaUrl}
                        onChange={(e) => updateSetting('ctaUrl', e.target.value)}
                        placeholder="https://pay.kiwify.com.br/..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Security */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Anti-Download & Bloqueio de Botão Direito</h4>
                      <p className="text-[11px] text-slate-500">
                        Impede que usuários façam download do vídeo ou inspecionem elementos.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.settings.antiDownload}
                      onChange={(e) => updateSetting('antiDownload', e.target.checked)}
                      className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Trava de Domínio (Domain Lock)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Permite que o player seja exibido apenas nos seus sites oficiais. Digite separados por vírgula.
                  </p>
                  <input
                    type="text"
                    value={formData.settings.domainLock}
                    onChange={(e) => updateSetting('domainLock', e.target.value)}
                    placeholder="meusite.com.br, checkout.meusite.com.br"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Live Interactive Player Preview */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-600" />
                Pré-visualização em Tempo Real
              </span>
              <span className="text-[11px] text-slate-500">
                Pitch: {formatTime(formData.settings.pitchDelaySeconds || 0)}
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-inner">
              <VideoPlayer
                video={formData}
                isSimulatedSalesPage={true}
                forceShowResumePrompt={previewResumePrompt}
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Duração Total:</span>
                <strong className="font-mono">{formatTime(formData.duration)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Pitch da Oferta:</span>
                <strong className="font-mono text-rose-600">{formatTime(formData.settings.pitchDelaySeconds || 0)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Retenção Estimada:</span>
                <strong className="font-mono text-emerald-600">{formData.retentionAtPitch}%</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-transform active:scale-95"
            >
              Salvar Alterações
            </button>
          </div>
        </div>

      </div>

      {/* ThumbSniper Dedicated Modal (matching image_217ed8ff.png, image_f3ee47eb.png, image_3d394116.png) */}
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
