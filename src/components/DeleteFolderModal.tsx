import React from 'react';
import { Trash2, AlertTriangle, X, Folder as FolderIcon } from 'lucide-react';
import { Folder } from '../types';

interface DeleteFolderModalProps {
  isOpen: boolean;
  folder: Folder | null;
  videoCount: number;
  onClose: () => void;
  onConfirmDelete: (folderId: string) => void;
}

export const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  isOpen,
  folder,
  videoCount,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !folder) return null;

  const handleDelete = () => {
    onConfirmDelete(folder.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Apagar Pasta</h3>
              <p className="text-xs text-slate-500">Confirmação de exclusão</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FolderIcon className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{folder.name}</h4>
              <p className="text-xs text-slate-500">
                Contém {videoCount} {videoCount === 1 ? 'vídeo' : 'vídeos'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Seus vídeos estão seguros:</strong> Os {videoCount}{' '}
              {videoCount === 1 ? 'vídeo desta pasta não será excluído' : 'vídeos desta pasta não serão excluídos'}.
              Eles serão automaticamente movidos para a <strong>raiz da sua Biblioteca</strong>.
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Deseja realmente apagar a pasta <strong>"{folder.name}"</strong>?
          </p>
        </div>

        {/* Actions */}
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
            onClick={handleDelete}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sim, Apagar Pasta</span>
          </button>
        </div>

      </div>
    </div>
  );
};
