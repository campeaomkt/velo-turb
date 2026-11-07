import React, { useState } from 'react';
import { Upload, Film, Link as LinkIcon, Check, X, Sparkles, AlertCircle, Loader2, PlayCircle, Globe, ShieldCheck } from 'lucide-react';
import { VideoItem, Folder } from '../types';
import { detectAndNormalizeVideoUrl, DEFAULT_BUNNY_CDN_HOSTNAME, NormalizedVideoUrlResult } from '../utils/urlDetector';

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
  const [activeTab, setActiveTab] = useState<'bunny' | 'file' | 'templates'>('bunny');
  const [title, setTitle] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [customCdnHost, setCustomCdnHost] = useState(DEFAULT_BUNNY_CDN_HOSTNAME);
  const [folderId, setFolderId] = useState(folders[0]?.id || 'all');
  const [pitchDelaySec, setPitchDelaySec] = useState(15);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time URL normalization & Bunny Stream detection
  const normalized: NormalizedVideoUrlResult | null = videoUrlInput.trim()
    ? detectAndNormalizeVideoUrl(videoUrlInput, customCdnHost)
    : null;

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

  const handleTemplateSelect = (tmpl: {
    title: string;
    url: string;
    pitch: number;
    folder: string;
    type?: 'hls' | 'mp4';
    thumb?: string;
    libraryId?: string;
    videoId?: string;
  }) => {
    setTitle(tmpl.title);
    setVideoUrlInput(tmpl.url);
    setPitchDelaySec(tmpl.pitch);
    setFolderId(tmpl.folder);
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    let finalVideoUrl = videoUrlInput.trim();
    let finalThumbnail = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80';
    let videoType: 'hls' | 'mp4' = 'mp4';
    let bunnyVideoId: string | undefined;
    let bunnyLibraryId: string | undefined;

    // Tab 1: Bunny Stream / CDN URL
    if (activeTab === 'bunny') {
      if (!finalVideoUrl) {
        setUploadError('Por favor, insira o link do Bunny Stream ou CDN.');
        return;
      }

      const res = detectAndNormalizeVideoUrl(finalVideoUrl, customCdnHost);
      if (!res.isValid) {
        setUploadError(res.error || 'Use uma URL pública https.');
        return;
      }

      finalVideoUrl = res.src;
      videoType = res.type;
      if (res.poster) finalThumbnail = res.poster;
      if (res.videoId) bunnyVideoId = res.videoId;
      if (res.libraryId) bunnyLibraryId = res.libraryId;
    }

    // Tab 2: Upload MP4 from Computer
    if (activeTab === 'file') {
      if (!selectedFile) {
        setUploadError('Por favor, selecione um arquivo de vídeo do seu computador.');
        return;
      }

      setIsUploading(true);
      setUploadProgress(20);

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
        const currentOrigin = window.location.origin;
        finalVideoUrl = data.absoluteUrl || (data.url.startsWith('http') ? data.url : `${currentOrigin}${data.url}`);
        videoType = 'mp4';
      } catch (err: any) {
        console.error(err);
        setIsUploading(false);
        setUploadError('Use uma URL pública https. O navegador bloqueia arquivos locais em páginas de vendas externas.');
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Tab 3: Template selection
    if (activeTab === 'templates') {
      const res = detectAndNormalizeVideoUrl(finalVideoUrl, customCdnHost);
      if (res.isValid) {
        finalVideoUrl = res.src;
        videoType = res.type;
        if (res.poster) finalThumbnail = res.poster;
        if (res.videoId) bunnyVideoId = res.videoId;
        if (res.libraryId) bunnyLibraryId = res.libraryId;
      }
    }

    const newVideo: VideoItem = {
      id: `vt_vsl_${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim() || 'Minha VSL de Alta Conversão',
      folderId: folderId,
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbnail,
      videoType: videoType,
      bunnyVideoId: bunnyVideoId,
      bunnyLibraryId: bunnyLibraryId,
      bunnyCdnHostname: customCdnHost,
      duration: 540,
      plays: 0,
      views: 0,
      playRate: 100,
      pitchTime: pitchDelaySec,
      retentionAtPitch: 70.0,
      createdAt: new Date().toISOString().split('T')[0],
      settings: {
        primaryColor: '#E11D48',
        smartAutoplay: true,
        smartAutoplayText: 'Seu vídeo já começou! Clique para ouvir áudio 🔊',
        smartAutoplayTheme: 'yellow',
        fakeProgressBar: true,
        fakeProgressSpeed: 'fast',
        onlyProgressBar: true,
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
        thumbSniper: {
          enabled: true,
          type: 'template',
          templateId: 'ts_01',
        },
      },
    };

    // Save to backend database for standalone player embeds
    try {
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo),
      });
    } catch (e) {
      console.warn('Backend video sync warn:', e);
    }

    onUploadSuccess(newVideo);
    onClose();
  };

  const templates = [
    {
      title: 'VSL Teclado Nord Stage - Pack Audio Evolution (Bunny Stream Library 802485)',
      url: 'https://player.mediadelivery.net/play/802485/a818fa3d-82ba-4162-81d0-9a8ad66f0d1f',
      pitch: 15,
      folder: 'fld_vsl_core',
      type: 'hls' as const,
      thumb: 'https://vz-802485-cdn.b-cdn.net/a818fa3d-82ba-4162-81d0-9a8ad66f0d1f/thumbnail.jpg',
      libraryId: '802485',
      videoId: 'a818fa3d-82ba-4162-81d0-9a8ad66f0d1f',
    },
    {
      title: 'VSL Oferta Direta - Nicho Saúde e Bem-Estar',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      pitch: 15,
      folder: 'fld_vsl_core',
      type: 'mp4' as const,
    },
    {
      title: 'VSL Perpétua - Infoproduto Finanças & Renda',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      pitch: 20,
      folder: 'fld_webinar',
      type: 'mp4' as const,
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
                Bunny Stream (.m3u8 adaptativo), Cloudflare R2 ou envio nativo MP4.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
              onClick={() => setActiveTab('bunny')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'bunny' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              1. Bunny Stream / CDN (HLS & MP4)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'file' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-rose-600" />
              2. Enviar MP4 Local
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'templates' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Modelos
            </button>
          </div>

          {/* TAB 1: Bunny Stream / CDN URL with Real-time Auto Normalization */}
          {activeTab === 'bunny' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Link do Bunny Stream ou CDN Direto
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    Aceita link de player, playlist.m3u8 ou .mp4
                  </span>
                </div>
                <input
                  type="text"
                  value={videoUrlInput}
                  onChange={(e) => {
                    setVideoUrlInput(e.target.value);
                    setUploadError(null);
                  }}
                  placeholder="https://player.mediadelivery.net/play/802485/... ou playlist.m3u8"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                />
              </div>

              {/* Automatic Bunny Stream Detection Box */}
              {normalized && normalized.isValid && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-900">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {normalized.type === 'hls' ? 'Bunny Stream HLS Detectado!' : 'Vídeo MP4 Válido'}
                    </span>
                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {normalized.type.toUpperCase()}
                    </span>
                  </div>

                  {normalized.videoId && (
                    <div className="text-[11px] text-emerald-800 space-y-0.5 pt-1">
                      <p><strong>Video ID:</strong> <code className="bg-emerald-100 px-1 rounded">{normalized.videoId}</code></p>
                      {normalized.libraryId && (
                        <p><strong>Library ID:</strong> <code className="bg-emerald-100 px-1 rounded">{normalized.libraryId}</code></p>
                      )}
                      <p className="truncate"><strong>URL Convertida (.m3u8):</strong> <span className="font-mono text-[10px]">{normalized.src}</span></p>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection of blob / localhost with Portuguese requirement message */}
              {normalized && !normalized.isValid && normalized.error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Use uma URL pública https</strong>
                    <p className="text-[11px] mt-0.5">{normalized.error}</p>
                  </div>
                </div>
              )}

              {/* CDN Hostname Configuration accordion */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-semibold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    Hostname CDN Bunny Stream:
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    BUNNY_CDN_HOSTNAME
                  </span>
                </div>
                <input
                  type="text"
                  value={customCdnHost}
                  onChange={(e) => setCustomCdnHost(e.target.value)}
                  placeholder="ex: vz-802485-cdn.b-cdn.net"
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  O link do player Bunny é convertido automaticamente para <code>https://{customCdnHost || 'SEU-CDN'}/&lt;VIDEO_ID&gt;/playlist.m3u8</code>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Real Local MP4 Upload */}
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
                  Hospedagem com streaming HTTP 206 Range e suporte a CORS
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

          {/* TAB 3: Ready templates */}
          {activeTab === 'templates' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Selecione um vídeo pronto para validar a PV agora:
              </label>
              {templates.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleTemplateSelect(tmpl)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    videoUrlInput === tmpl.url
                      ? 'border-rose-600 bg-rose-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {tmpl.type === 'hls' && (
                        <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                          HLS 9min
                        </span>
                      )}
                      {tmpl.title}
                    </h5>
                    <p className="text-[11px] text-slate-500">Pitch test aos {tmpl.pitch}s · Otimizado para PVs</p>
                  </div>
                  {videoUrlInput === tmpl.url && (
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
              placeholder="Ex: VSL Teclado Nord Stage - Nicho Black"
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
              {activeTab === 'bunny' ? 'Streaming HLS adaptativo' : activeTab === 'file' ? 'Arquivo MP4' : 'Modelo pronto'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading || (activeTab === 'file' ? !selectedFile : !videoUrlInput.trim())}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
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
