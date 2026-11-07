import React, { useState } from 'react';
import { Folder as FolderIcon, X, Check, ArrowRight, Plus } from 'lucide-react';
import { Folder, VideoItem } from '../types';

interface MoveVideoModalProps {
  isOpen: boolean;
  videosToMove: VideoItem[];
  folders: Folder[];
  currentFolderId?: string;
  onClose: () => void;
  onConfirmMove: (videoIds: string[], targetFolderId: string) => void;
  onCreateFolder?: (name: string) => void;
}

export const MoveVideoModal: React.FC<MoveVideoModalProps> = ({
  isOpen,
  videosToMove,
  folders,
  currentFolderId,
  onClose,
  onConfirmMove,
  onCreateFolder,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    currentFolderId && currentFolderId !== 'all' ? currentFolderId : 'root'
  );
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  if (!isOpen || videosToMove.length === 0) return null;

  const validFolders = folders.filter((f) => f.id !== 'all');

  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !onCreateFolder) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  const handleConfirm = () => {
    const videoIds = videosToMove.map((v) => v.id);
    onConfirmMove(videoIds, selectedFolderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {videosToMove.length === 1 ? 'Mover Vídeo para Pasta' : `Mover ${videosToMove.length} Vídeos para Pasta`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha a pasta de destino para organizar suas VSLs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video(s) Preview Strip */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3 overflow-x-auto text-xs">
          <span className="font-semibold text-slate-600 shrink-0">Item(s):</span>
          {videosToMove.slice(0, 3).map((v) => (
            <span
              key={v.id}
              className="bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md font-medium truncate max-w-[220px] shrink-0 shadow-2xs"
            >
              {v.title}
            </span>
          ))}
          {videosToMove.length > 3 && (
            <span className="text-slate-500 font-semibold shrink-0">
              +{videosToMove.length - 3} outros
            </span>
          )}
        </div>

        {/* Folder Selection List */}
        <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Selecione a Pasta de Destino:
          </label>

          <div className="space-y-2">
            {/* Raiz da Biblioteca (Sem Pasta) */}
            <div
              onClick={() => setSelectedFolderId('root')}
              className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                selectedFolderId === 'root'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                  <FolderIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Raiz da Biblioteca (Sem pasta)</div>
                  <div className="text-[11px] text-slate-500">Vídeos soltos na listagem principal</div>
                </div>
              </div>
              {selectedFolderId === 'root' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Pastas Criadas */}
            {validFolders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              const isCurrent = currentFolderId === folder.id;

              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Blue Folder Icon exactly matching image_3cb5e0ce.png */}
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FolderIcon className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{folder.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                            Pasta atual
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {folder.videoCount ?? 0} {folder.videoCount === 1 ? 'vídeo' : 'vídeos'}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Create New Folder Option */}
          {onCreateFolder && (
            <div className="pt-2">
              {!showNewFolderInput ? (
                <button
                  type="button"
                  onClick={() => setShowNewFolderInput(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Criar nova pasta e mover para lá
                </button>
              ) : (
                <form onSubmit={handleCreateNewFolder} className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Nome da nova pasta..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewFolderInput(false)}
                    className="px-2 py-2 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Mover {videosToMove.length > 1 ? `(${videosToMove.length})` : ''}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
