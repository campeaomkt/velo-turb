import React, { useState } from 'react';
import {
  Video as VideoIcon,
  FolderPlus,
  Upload,
  Search,
  Code,
  Code2,
  PieChart,
  MoreVertical,
  Eye,
  Settings,
  BarChart3,
  Trash2,
  Folder as FolderIcon,
  Play,
  Clock,
  Sparkles,
  Check,
  Flame,
  ArrowRight,
  Filter,
  Crosshair,
} from 'lucide-react';
import { VideoItem, Folder } from '../types';
import { formatTime } from '../utils/embedGenerator';

interface VideoListViewProps {
  videos: VideoItem[];
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (folderName: string) => void;
  onOpenUpload: () => void;
  onOpenEmbed: (video: VideoItem) => void;
  onOpenSimulator: (video: VideoItem) => void;
  onOpenEdit: (video: VideoItem) => void;
  onOpenAnalytics: (video: VideoItem) => void;
  onOpenThumbSniper: (video: VideoItem) => void;
  onDeleteVideo: (videoId: string) => void;
  onRestoreVideo: (videoId: string) => void;
}

export const VideoListView: React.FC<VideoListViewProps> = ({
  videos,
  folders,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  onOpenUpload,
  onOpenEmbed,
  onOpenSimulator,
  onOpenEdit,
  onOpenAnalytics,
  onOpenThumbSniper,
  onDeleteVideo,
  onRestoreVideo,
}) => {
  const [subTab, setSubTab] = useState<'library' | 'top' | 'trash'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showScaleBanner, setShowScaleBanner] = useState(true);

  // Filter videos according to subtab and folder
  const filteredVideos = videos.filter((v) => {
    // Trash tab filter
    if (subTab === 'trash') return v.isTrash;
    if (v.isTrash) return false;

    // Top videos subtab filter
    if (subTab === 'top' && !v.isTop && v.plays < 60000) return false;

    // Folder filter
    if (activeFolderId !== 'all' && v.folderId !== activeFolderId) return false;

    // Search query filter
    if (searchQuery.trim()) {
      return v.title.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner (VTurb style educational / scale banner) */}
      {showScaleBanner && (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-rose-500/20">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Acelerador de VSL</span>
                <span className="text-[10px] bg-rose-600 px-2 py-0.5 rounded-full font-bold">NOVO</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                Pronto para colar nas suas Páginas de Vendas (PVs)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Seus vídeos já contam com <strong>Smart Autoplay</strong>, <strong>Pitch Delay</strong> e proteção anti-download ativos. Clique em <em>"Obter Código da PV"</em> em qualquer vídeo para copiar e colar no Elementor ou HTML.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10 shrink-0 self-end md:self-center">
            <button
              onClick={() => onOpenUpload()}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Fazer Upload de VSL
            </button>
            <button
              onClick={() => setShowScaleBanner(false)}
              className="text-slate-400 hover:text-white p-1.5 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action Bar (Sub-tabs, Search, New Folder, Upload Button) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        
        {/* Sub-tabs: Biblioteca, Top vídeos, Lixeira */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mr-2 sm:mr-4">
            <VideoIcon className="w-4 h-4 text-sky-600" />
            <span>Meus vídeos</span>
          </div>

          <button
            onClick={() => setSubTab('library')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'library'
                ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Biblioteca
          </button>

          <button
            onClick={() => setSubTab('top')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'top'
                ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top vídeos
          </button>

          <button
            onClick={() => setSubTab('trash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'trash'
                ? 'bg-rose-50 text-rose-700 border-b-2 border-rose-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lixeira
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar VSL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50/50"
            />
          </div>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            <span>Nova Pasta</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>

      </div>

      {/* Folders Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
        {folders.map((folder) => {
          const isSelected = activeFolderId === folder.id;
          const count = videos.filter((v) => !v.isTrash && (folder.id === 'all' || v.folderId === folder.id)).length;
          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FolderIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>{folder.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Videos List / Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <VideoIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum vídeo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {subTab === 'trash'
              ? 'Sua lixeira está vazia.'
              : 'Que tal adicionar o seu primeiro vídeo de vendas para gerar o código da sua PV?'}
          </p>
          {subTab !== 'trash' && (
            <button
              onClick={onOpenUpload}
              className="mt-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> Adicionar Primeiro Vídeo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
            >
              {/* Left: Thumbnail & Title & Tags */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                
                {/* Video Thumbnail with Hover Play Button */}
                <div
                  onClick={() => onOpenSimulator(video)}
                  className="relative w-36 sm:w-44 aspect-video rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer group/thumb shadow-sm"
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover/thumb:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform group-hover/thumb:scale-110">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold tabular-nums">
                    {formatTime(video.duration)}
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {video.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {video.description || 'Otimizado com Smart Autoplay e Pitch Delay para alta conversão.'}
                  </p>

                  {/* Metadata Chips / Markers */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
                      <Clock className="w-3 h-3" /> Pitch: {formatTime(video.settings.pitchDelaySeconds || 0)}
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      🎯 {video.retentionAtPitch}% no pitch
                    </span>

                    <span className="font-mono text-slate-600">
                      {video.plays.toLocaleString('pt-BR')} plays
                    </span>

                    <span className="text-slate-400">·</span>

                    <span className="text-slate-500">
                      Taxa de Play: <strong className="text-slate-800">{video.playRate}%</strong>
                    </span>
                  </div>
                </div>

              </div>

              {/* Right: Actions matching VTurb */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                
                {/* PRIMARY ACTION: "Copiar código embed" */}
                <button
                  onClick={() => onOpenEmbed(video)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 transition-transform active:scale-95 cursor-pointer"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Copiar código embed</span>
                </button>

                {/* Pie Chart / Analytics (matching image_096629c1.png) */}
                <button
                  onClick={() => onOpenAnalytics(video)}
                  title="Métricas de Retenção & Conversão"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <PieChart className="w-4 h-4" />
                </button>

                {/* </> Icon button with VTurb tooltip (matching image_096629c1.png) */}
                <div className="relative group/embedbtn">
                  <button
                    onClick={() => onOpenEmbed(video)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/embedbtn:opacity-100 pointer-events-none transition-opacity bg-neutral-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap shadow-md z-30">
                    Copiar código embed
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
                  </div>
                </div>

                {/* Simulator Live Preview */}
                <button
                  onClick={() => onOpenSimulator(video)}
                  title="Testar no Simulador de Página de Vendas"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Edit Player Settings */}
                <button
                  onClick={() => onOpenEdit(video)}
                  title="Configurar Player & Pitch Delay"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* ThumbSniper Button */}
                <div className="relative group/tsbtn">
                  <button
                    onClick={() => onOpenThumbSniper(video)}
                    className="p-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-600 transition-colors cursor-pointer"
                  >
                    <Crosshair className="w-4 h-4 text-rose-600" />
                  </button>
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/tsbtn:opacity-100 pointer-events-none transition-opacity bg-neutral-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap shadow-md z-30">
                    ThumbSniper™
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
                  </div>
                </div>

                {/* Trash/Delete */}
                {video.isTrash ? (
                  <button
                    onClick={() => onRestoreVideo(video.id)}
                    title="Restaurar Vídeo"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-xs font-bold"
                  >
                    Restaurar
                  </button>
                ) : (
                  <button
                    onClick={() => onDeleteVideo(video.id)}
                    title="Mover para Lixeira"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

              </div>

            </div>
          ))}
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-sky-600" /> Nova Pasta
            </h3>
            <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Pasta
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: VSLs de Lançamento 2026"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
