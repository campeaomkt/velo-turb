import React, { useState } from 'react';
import {
  Video as VideoIcon,
  FolderPlus,
  Upload,
  Search,
  Code2,
  PieChart,
  MoreVertical,
  Trash2,
  Folder as FolderIcon,
  Play,
  Clock,
  Flame,
  ArrowLeft,
  ArrowLeftRight,
  UserPlus,
  Edit2,
  ExternalLink,
  Crosshair,
  Check,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { VideoItem, Folder } from '../types';
import { MoveVideoModal } from './MoveVideoModal';
import { DeleteFolderModal } from './DeleteFolderModal';

interface VideoListViewProps {
  videos: VideoItem[];
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (folderName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveVideos: (videoIds: string[], targetFolderId: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onOpenUpload: (preselectedFolderId?: string) => void;
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
  onDeleteFolder,
  onMoveVideos,
  onRenameFolder,
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
  
  // Folder Creation Modal
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Folder Rename Modal
  const [renamingFolder, setRenamingFolder] = useState<Folder | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Folder Deletion Modal
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  // Move Video(s) Modal
  const [videosToMove, setVideosToMove] = useState<VideoItem[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetDefaultFolder, setMoveTargetDefaultFolder] = useState<string | undefined>(undefined);

  // Checkbox Selection for batch actions
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Current folder object if inside a folder
  const currentFolder = folders.find((f) => f.id === activeFolderId && f.id !== 'all');
  const isInsideFolder = !!currentFolder && subTab === 'library';

  const validFolders = folders.filter((f) => f.id !== 'all');

  // Filtered videos based on active view and search
  const displayedVideos = videos.filter((v) => {
    // Trash filter
    if (subTab === 'trash') return v.isTrash;
    if (v.isTrash) return false;

    // Top videos filter
    if (subTab === 'top') {
      if (!v.isTop && v.plays < 50000) return false;
    }

    // Inside a specific folder
    if (isInsideFolder) {
      return v.folderId === currentFolder.id;
    }

    // In Root Library view: Show root videos (where folderId === 'all' or empty, or all videos if no folder)
    if (subTab === 'library') {
      // If user clicked a specific folder in sidebar, filter to that
      if (activeFolderId !== 'all') {
        return v.folderId === activeFolderId;
      }
      // When at root Biblioteca, show videos that are in root
      // (folders are shown at the top of the table as folder rows, matching image_3cb5e0ce.png!)
    }

    // Search query filter
    if (searchQuery.trim()) {
      return v.title.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  // Filtered folders for root view
  const displayedFolders = validFolders.filter((f) => {
    if (isInsideFolder || subTab !== 'library') return false;
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Checkbox helpers
  const allCurrentVideoIds = displayedVideos.map((v) => v.id);
  const isAllSelected =
    allCurrentVideoIds.length > 0 && allCurrentVideoIds.every((id) => selectedVideoIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedVideoIds([]);
    } else {
      setSelectedVideoIds(allCurrentVideoIds);
    }
  };

  const toggleSelectVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedVideoIds.includes(id)) {
      setSelectedVideoIds(selectedVideoIds.filter((item) => item !== id));
    } else {
      setSelectedVideoIds([...selectedVideoIds, id]);
    }
  };

  // Folder creation submit
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  // Folder rename submit
  const handleRenameFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim() || !renamingFolder || !onRenameFolder) return;
    onRenameFolder(renamingFolder.id, renameValue.trim());
    setRenamingFolder(null);
    setRenameValue('');
  };

  // Action helpers
  const handleOpenMoveModalForSingle = (video: VideoItem) => {
    setVideosToMove([video]);
    setMoveTargetDefaultFolder(video.folderId);
    setShowMoveModal(true);
    setActiveMenuId(null);
  };

  const handleOpenMoveModalForBatch = () => {
    const selected = videos.filter((v) => selectedVideoIds.includes(v.id));
    if (selected.length === 0) return;
    setVideosToMove(selected);
    setShowMoveModal(true);
  };

  const handleOpenMoveModalForFolderDestination = (targetFolder: Folder) => {
    // Choose videos from library to move into this folder
    const availableVideos = videos.filter((v) => !v.isTrash && v.folderId !== targetFolder.id);
    if (availableVideos.length === 0) {
      alert('Todos os vídeos já estão nesta pasta ou não há outros vídeos disponíveis.');
      return;
    }
    setVideosToMove(availableVideos);
    setMoveTargetDefaultFolder(targetFolder.id);
    setShowMoveModal(true);
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-4" onClick={() => setActiveMenuId(null)}>
      
      {/* Top Header & Sub-Tabs Bar (matching image_3cb5e0ce.png) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        
        {/* Left: Meus Vídeos + Sub-tabs */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm shrink-0">
            {/* Blue camera icon matching image_3cb5e0ce.png */}
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <VideoIcon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-base font-extrabold tracking-tight">Meus vídeos</span>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Sub-tabs with blue active underline */}
          <div className="flex items-center gap-1 sm:gap-4 text-xs font-semibold">
            <button
              onClick={() => {
                setSubTab('library');
                onSelectFolder('all');
              }}
              className={`py-2 px-1 relative transition-colors cursor-pointer ${
                subTab === 'library' && !isInsideFolder
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Biblioteca</span>
              {subTab === 'library' && !isInsideFolder && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                setSubTab('top');
                onSelectFolder('all');
              }}
              className={`py-2 px-1 relative transition-colors cursor-pointer ${
                subTab === 'top'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Top vídeos</span>
              {subTab === 'top' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                setSubTab('trash');
                onSelectFolder('all');
              }}
              className={`py-2 px-1 relative transition-colors cursor-pointer ${
                subTab === 'trash'
                  ? 'text-rose-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Lixeira</span>
              {subTab === 'trash' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Right Controls: Search, Nova Pasta Button, Upload Button */}
        <div className="flex items-center gap-2.5">
          {/* Search Input with Search Icon Button */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Pesquisar vídeos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-64 pl-3.5 pr-9 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            <button
              type="button"
              className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Button: Nova Pasta (white background with border, folder+ icon) */}
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <FolderPlus className="w-4 h-4 text-slate-600" />
            <span>Nova Pasta</span>
          </button>

          {/* Button: Upload (solid blue #0066FF) */}
          <button
            onClick={() => onOpenUpload(isInsideFolder ? currentFolder.id : undefined)}
            className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Upload</span>
          </button>
        </div>

      </div>

      {/* Breadcrumb Navigation when inside a Folder */}
      {isInsideFolder && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60 border border-blue-200/60 px-5 py-3 rounded-2xl">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onSelectFolder('all')}
              className="flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Biblioteca</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#0066FF] text-white flex items-center justify-center shadow-2xs">
                <FolderIcon className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-extrabold text-slate-900 text-sm">{currentFolder.name}</span>
              <span className="text-[11px] text-slate-500 font-medium">
                ({displayedVideos.length} {displayedVideos.length === 1 ? 'vídeo' : 'vídeos'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Quick action: Add video inside this folder */}
            <button
              onClick={() => onOpenUpload(currentFolder.id)}
              className="px-3 py-1.5 rounded-lg bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3 h-3 stroke-[2.5]" />
              <span>Adicionar Vídeo Aqui</span>
            </button>

            {/* Quick action: Move videos from library into this folder */}
            <button
              onClick={() => handleOpenMoveModalForFolderDestination(currentFolder)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeftRight className="w-3 h-3 text-slate-500" />
              <span>Mover Vídeos para Cá</span>
            </button>

            {/* Delete folder */}
            <button
              onClick={() => setFolderToDelete(currentFolder)}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
              title="Apagar esta pasta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container (matching image_3cb5e0ce.png) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 items-center px-5 py-3 border-b border-slate-100 text-xs font-bold text-slate-500 select-none bg-slate-50/40">
          <div className="col-span-1 flex items-center gap-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          <div className="col-span-6 sm:col-span-6 flex items-center gap-1 text-slate-700">
            <span>Nome</span>
            <span className="text-[10px] text-slate-400">↕</span>
          </div>
          <div className="col-span-2 hidden sm:flex items-center gap-1 text-slate-600">
            <span>Criado em</span>
            <span className="text-[10px] text-slate-400">↕</span>
          </div>
          <div className="col-span-1 hidden sm:flex items-center gap-1 text-slate-600">
            <span>Plays</span>
            <span className="text-[10px] text-slate-400">↕</span>
          </div>
          <div className="col-span-5 sm:col-span-2 text-right pr-2 text-slate-600">
            <span>Ações</span>
          </div>
        </div>

        {/* Empty State */}
        {displayedFolders.length === 0 && displayedVideos.length === 0 && (
          <div className="p-14 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              {isInsideFolder ? <FolderOpen className="w-7 h-7" /> : <VideoIcon className="w-7 h-7" />}
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {isInsideFolder ? 'Esta pasta está vazia' : 'Nenhum vídeo ou pasta encontrado'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isInsideFolder
                ? 'Adicione uma nova VSL ou mova vídeos existentes da sua Biblioteca para cá.'
                : subTab === 'trash'
                ? 'Sua lixeira está vazia.'
                : 'Crie uma nova pasta ou faça upload do seu primeiro vídeo para começar.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onOpenUpload(isInsideFolder ? currentFolder.id : undefined)}
                className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold transition-transform active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isInsideFolder ? 'Adicionar Vídeo Nesta Pasta' : 'Fazer Upload de Vídeo'}</span>
              </button>
              {isInsideFolder && (
                <button
                  onClick={() => handleOpenMoveModalForFolderDestination(currentFolder)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mover Vídeos para Cá</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rows List */}
        <div className="divide-y divide-slate-100">
          
          {/* FOLDERS ROWS (matching image_3cb5e0ce.png Row 1: PASTA TESTE) */}
          {displayedFolders.map((folder) => {
            const folderVideos = videos.filter((v) => !v.isTrash && v.folderId === folder.id);
            const folderPlays = folderVideos.reduce((acc, v) => acc + v.plays, 0);

            return (
              <div
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-blue-50/30 transition-colors group cursor-pointer"
              >
                {/* Checkbox */}
                <div className="col-span-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Blue Folder Icon + Folder Name */}
                <div className="col-span-6 sm:col-span-6 flex items-center gap-3 min-w-0 pr-2">
                  {/* Exact Blue Folder Icon from image_3cb5e0ce.png */}
                  <div className="w-8 h-8 rounded-lg bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <FolderIcon className="w-4 h-4 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate block">
                      {folder.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {folderVideos.length} {folderVideos.length === 1 ? 'vídeo' : 'vídeos'}
                    </span>
                  </div>
                </div>

                {/* Criado em */}
                <div className="col-span-2 hidden sm:block text-xs text-slate-600 font-medium">
                  07/11/2026
                </div>

                {/* Plays */}
                <div className="col-span-1 hidden sm:block text-xs font-mono font-bold text-slate-700">
                  {folderPlays.toLocaleString('pt-BR')}
                </div>

                {/* Actions (matching image_3cb5e0ce.png folder actions: user, move, 3-dots) */}
                <div
                  className="col-span-5 sm:col-span-2 flex items-center justify-end gap-1.5 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Share / Team icon */}
                  <button
                    type="button"
                    title="Compartilhar pasta"
                    onClick={() => alert(`Pasta "${folder.name}" compartilhada com seu time.`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>

                  {/* Move/Transfer icon: Mover vídeos para cá */}
                  <button
                    type="button"
                    title="Mover vídeos para esta pasta"
                    onClick={() => handleOpenMoveModalForFolderDestination(folder)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>

                  {/* 3-dots menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === folder.id ? null : folder.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === folder.id && (
                      <div className="absolute right-0 top-8 z-30 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs animate-in fade-in duration-100">
                        <button
                          onClick={() => {
                            onSelectFolder(folder.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>Abrir Pasta</span>
                        </button>
                        <button
                          onClick={() => {
                            onOpenUpload(folder.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <span>Adicionar Vídeo Aqui</span>
                        </button>
                        <button
                          onClick={() => handleOpenMoveModalForFolderDestination(folder)}
                          className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                          <span>Mover Vídeos para Cá</span>
                        </button>
                        <button
                          onClick={() => {
                            setRenamingFolder(folder);
                            setRenameValue(folder.name);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Renomear Pasta</span>
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={() => {
                            setFolderToDelete(folder);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Apagar Pasta</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}

          {/* VIDEOS ROWS (matching image_3cb5e0ce.png Row 2: MINI VSL DEDILHADOS...) */}
          {displayedVideos.map((video) => {
            const isChecked = selectedVideoIds.includes(video.id);

            return (
              <div
                key={video.id}
                className={`grid grid-cols-12 items-center px-5 py-3.5 hover:bg-slate-50/70 transition-colors group ${
                  isChecked ? 'bg-blue-50/30' : ''
                }`}
              >
                {/* Checkbox */}
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleSelectVideo(video.id, e as any)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Video Thumbnail + Title */}
                <div className="col-span-6 sm:col-span-6 flex items-center gap-3 min-w-0 pr-2">
                  {/* Thumbnail with mini play icon overlay matching image_3cb5e0ce.png */}
                  <div
                    onClick={() => onOpenSimulator(video)}
                    className="relative w-12 h-8 rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer group/thumb shadow-2xs"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-85 group-hover/thumb:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <span
                      onClick={() => onOpenSimulator(video)}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block cursor-pointer"
                    >
                      {video.title}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span>VSL</span>
                      <span>·</span>
                      <span>Pitch: {Math.floor((video.settings.pitchDelaySeconds || 0) / 60)}m</span>
                      {video.settings.thumbSniper?.enabled && (
                        <>
                          <span>·</span>
                          <span className="text-amber-600 font-semibold">ThumbSniper ativo</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Criado em */}
                <div className="col-span-2 hidden sm:block text-xs text-slate-600 font-medium">
                  {video.createdAt || '07/11/2026'}
                </div>

                {/* Plays */}
                <div className="col-span-1 hidden sm:block text-xs font-mono font-bold text-slate-700">
                  {video.plays.toLocaleString('pt-BR')}
                </div>

                {/* Actions (matching image_3cb5e0ce.png video actions: piechart, embed </>, 3-dots) */}
                <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-1.5 relative">
                  {/* Analytics Icon */}
                  <button
                    type="button"
                    title="Métricas de retenção e plays"
                    onClick={() => onOpenAnalytics(video)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <PieChart className="w-4 h-4" />
                  </button>

                  {/* Embed Code Icon </> */}
                  <button
                    type="button"
                    title="Copiar código embed para PV"
                    onClick={() => onOpenEmbed(video)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Code2 className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  {/* 3-dots menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === video.id ? null : video.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === video.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 z-30 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs animate-in fade-in duration-100"
                      >
                        {/* Mover para pasta (Explicit User Request!) */}
                        <button
                          onClick={() => handleOpenMoveModalForSingle(video)}
                          className="w-full text-left px-3.5 py-2 font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>Mover para Pasta...</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenEdit(video);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Configurar Player & Pitch</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenThumbSniper(video);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Crosshair className="w-3.5 h-3.5 text-rose-500" />
                          <span>ThumbSniper™</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenSimulator(video);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ver no Simulador de PV</span>
                        </button>

                        <div className="my-1 border-t border-slate-100" />

                        {video.isTrash ? (
                          <button
                            onClick={() => {
                              onRestoreVideo(video.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 font-medium text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Restaurar da Lixeira</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onDeleteVideo(video.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Mover para Lixeira</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Floating Batch Actions Bar when 1 or more items are selected */}
      {selectedVideoIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <span className="text-xs font-bold font-mono bg-blue-600 px-2 py-0.5 rounded-full">
            {selectedVideoIds.length} {selectedVideoIds.length === 1 ? 'selecionado' : 'selecionados'}
          </span>

          <button
            onClick={handleOpenMoveModalForBatch}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Mover para Pasta</span>
          </button>

          <button
            onClick={() => {
              selectedVideoIds.forEach((id) => onDeleteVideo(id));
              setSelectedVideoIds([]);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Selecionados</span>
          </button>

          <button
            onClick={() => setSelectedVideoIds([])}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕ Limpar
          </button>
        </div>
      )}

      {/* MODAL: Nova Pasta */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Criar Nova Pasta</h3>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateFolderSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Nome da Pasta
                </label>
                <input
                  type="text"
                  placeholder="Ex: PASTA TESTE, VSL Hot..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Renomear Pasta */}
      {renamingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Renomear Pasta</h3>
              <button
                onClick={() => setRenamingFolder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRenameFolderSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Novo Nome
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingFolder(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Mover Vídeo(s) para Pasta */}
      <MoveVideoModal
        isOpen={showMoveModal}
        videosToMove={videosToMove}
        folders={folders}
        currentFolderId={moveTargetDefaultFolder}
        onClose={() => {
          setShowMoveModal(false);
          setVideosToMove([]);
        }}
        onConfirmMove={(videoIds, targetFolderId) => {
          onMoveVideos(videoIds, targetFolderId);
          setSelectedVideoIds([]);
        }}
        onCreateFolder={(name) => {
          onCreateFolder(name);
        }}
      />

      {/* MODAL: Apagar Pasta */}
      <DeleteFolderModal
        isOpen={!!folderToDelete}
        folder={folderToDelete}
        videoCount={
          folderToDelete
            ? videos.filter((v) => !v.isTrash && v.folderId === folderToDelete.id).length
            : 0
        }
        onClose={() => setFolderToDelete(null)}
        onConfirmDelete={(folderId) => {
          onDeleteFolder(folderId);
        }}
      />

    </div>
  );
};
