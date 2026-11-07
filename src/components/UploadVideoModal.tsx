import React, { useState } from 'react';
import { Upload, Film, Link as LinkIcon, Check, X, Sparkles, Server, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { VideoItem, Folder } from '../types';

interface UploadVideoModalProps {
  folders: Folder[];
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newVideo: VideoItem) => void;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  folders,
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url' | 'templates'>('file');
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [folderId, setFolderId] = useState(folders[0]?.id || 'all');
  const [pitchDelaySec, setPitchDelaySec] = useState(15);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setUploadError(null);
    }
  };

  const handleTemplateSelect = (tmpl: { title: string; url: string; pitch: number; folder: string }) => {
    setTitle(tmpl.title);
    setVideoUrl(tmpl.url);
    setPitchDelaySec(tmpl.pitch);
    setFolderId(tmpl.folder);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    let finalVideoUrl = videoUrl;

    // If uploading a real file, send to backend /api/upload
    if (activeTab === 'file' && selectedFile) {
      setIsUploading(true);
      setUploadProgress(15);

      try {
        const formData = new FormData();
        formData.append('video', selectedFile);

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
        }, 300);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error('Falha no upload do servidor.');
        }

        const data = await response.json();
        finalVideoUrl = data.url;
      } catch (err: any) {
        console.error(err);
        // Fallback to local object URL if backend has an issue
        finalVideoUrl = URL.createObjectURL(selectedFile);
      } finally {
        setIsUploading(false);
      }
    }

    if (!finalVideoUrl.trim() && !selectedFile) {
      setUploadError('Por favor, selecione um arquivo de vídeo ou insira uma URL.');
      return;
    }

    const newVideo: VideoItem = {
      id: `vt_vsl_${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim() || 'Minha VSL de Vendas',
      folderId: folderId,
      videoUrl: finalVideoUrl,
      thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
      duration: 480, // 8 min default
      plays: 0,
      views: 0,
      playRate: 100,
      pitchTime: pitchDelaySec,
      retentionAtPitch: 68.0,
      createdAt: new Date().toISOString().split('T')[0],
      settings: {
        primaryColor: '#E11D48',
        smartAutoplay: true,
        smartAutoplayText: 'Seu vídeo já começou! Clique para ouvir áudio 🔊',
        smartAutoplayTheme: 'yellow',
        fakeProgressBar: true,
        fakeProgressSpeed: 'fast',
        onlyProgressBar: true, // Modo VSL Profissional
        hideControls: false,
        allowPause: true,
        resumePlayback: true,
        speedControl: true,
        antiDownload: true,
        domainLock: '*',
        pitchDelaySeconds: pitchDelaySec,
        pulsingCta: true,
        ctaText: 'SIM! QUERO GARANTIR MINHA VAGA COM DESCONTO',
        ctaSubtext: 'Acesso imediato • Compra 100% Segura • Garantia de 7 Dias',
        ctaUrl: 'https://seusite.com.br/checkout',
        showWatermark: false,
      },
    };

    onUploadSuccess(newVideo);
    onClose();
  };

  const templates = [
    {
      title: 'VSL Oferta Direta - Nicho Saúde e Bem-Estar',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      pitch: 15,
      folder: 'fld_vsl_core',
    },
    {
      title: 'VSL Perpétua - Infoproduto Finanças & Renda',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      pitch: 20,
      folder: 'fld_webinar',
    },
    {
      title: 'Vídeo Rápido de Downsell - R$ 27',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      pitch: 10,
      folder: 'fld_upsell',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospedar Nova VSL</h3>
              <p className="text-xs text-slate-500">
                Envio direto do computador ou conexão com Bunny.net / Cloudflare R2 / AWS S3.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Method Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-rose-600" />
              1. Enviar MP4 do Computador (Nativo)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              2. Bunny.net / Cloudflare / CDN
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'templates' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Modelos
            </button>
          </div>

          {/* TAB 1: Real Local MP4 Upload */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-rose-50/20 group">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 text-center">
                  {selectedFile ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  ) : (
                    'Clique para selecionar o arquivo MP4 ou arraste aqui'
                  )}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Hospedagem direta no servidor VeloTurb com streaming rápido
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {isUploading && (
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      Enviando vídeo para o servidor...
                    </span>
                    <span className="font-mono">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Direct CDN URL (Bunny, Cloudflare, S3) */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Link direto do vídeo (Bunny Stream / Cloudflare R2 / AWS S3)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://video.bunnycdn.com/play/... ou https://pub-xxx.r2.dev/vsl.mp4"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                💡 <strong>Dica:</strong> Cole qualquer link direto que termine em <code>.mp4</code> ou link do Bunny Stream. O VeloTurb cuidará de todo o player e do Pitch Delay!
              </p>
            </div>
          )}

          {/* TAB 3: Ready templates */}
          {activeTab === 'templates' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Vídeos de teste para validar sua página de vendas agora:
              </label>
              {templates.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleTemplateSelect(tmpl)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    videoUrl === tmpl.url
                      ? 'border-rose-600 bg-rose-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{tmpl.title}</h5>
                    <p className="text-[11px] text-slate-500">Pitch test aos {tmpl.pitch}s · Otimizado para PVs</p>
                  </div>
                  {videoUrl === tmpl.url && (
                    <Check className="w-4 h-4 text-rose-600" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Video Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome da VSL
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: VSL Principal - Nicho Black 2026"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
            />
          </div>

          {/* Folder & Pitch Delay */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pasta
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pitch Delay Inicial (Segundos)
              </label>
              <input
                type="number"
                min="0"
                value={pitchDelaySec}
                onChange={(e) => setPitchDelaySec(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {activeTab === 'file' ? 'Arquivo hospedado localmente' : 'URL externa segura'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading || (!selectedFile && !videoUrl.trim())}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Hospedando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Concluir & Gerar Código da PV
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
