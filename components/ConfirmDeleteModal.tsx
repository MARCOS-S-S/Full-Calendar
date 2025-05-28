
import React from 'react';
import { Theme } from '../constants';
import { CloseIcon, TrashIcon } from './icons';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  theme: Theme;
  itemName?: string; // This will be a hardcoded Portuguese string from App.tsx
  // t prop removed
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, theme, itemName }) => {
  if (!isOpen) return null;

  const bgColor = theme === Theme.DARK ? 'bg-neutral-800' : 'bg-white';
  const textColor = theme === Theme.DARK ? 'text-neutral-100' : 'text-gray-900';
  const subTextColor = theme === Theme.DARK ? 'text-neutral-400' : 'text-gray-600';
  const borderColor = theme === Theme.DARK ? 'border-neutral-700' : 'border-gray-300';

  const cancelButtonClasses = theme === Theme.DARK
    ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-100"
    : "bg-gray-200 hover:bg-gray-300 text-gray-700";

  const confirmButtonClasses = theme === Theme.DARK
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-red-500 hover:bg-red-600 text-white";


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-delete-title" aria-describedby="confirm-delete-description">
      <div className={`rounded-lg shadow-xl w-full max-w-md ${bgColor}`}>
        <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
          <h3 id="confirm-delete-title" className={`text-lg font-semibold ${textColor}`}>Confirmar Exclusão</h3>
          <button onClick={onClose} className={`p-1 rounded-full hover:${theme === Theme.DARK ? 'bg-neutral-700' : 'bg-gray-100'}`} aria-label="Fechar">
            <CloseIcon className={`w-5 h-5 ${subTextColor}`} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${theme === Theme.DARK ? 'bg-red-800/50' : 'bg-red-100'} sm:mx-0 sm:h-10 sm:w-10`}>
                <TrashIcon className="h-6 w-6 text-red-500 dark:text-red-400" />
            </div>
            <div id="confirm-delete-description" className="mt-0 text-left">
                 <p className={`text-md ${textColor}`}>
                    {`Tem certeza de que deseja excluir est${itemName === "atividade" ? "a" : "e"} ${itemName || "item"}?`}
                </p>
                <p className={`mt-1 text-sm ${subTextColor}`}>
                    Esta ação não pode ser desfeita.
                </p>
            </div>
          </div>
        </div>
        <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t ${borderColor}`}>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              theme === Theme.DARK ? 'focus:ring-offset-neutral-800 focus:ring-red-500' : 'focus:ring-offset-white focus:ring-red-500'
            } sm:ml-3 sm:w-auto sm:text-sm ${confirmButtonClasses}`}
          >
            Sim, Excluir
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              theme === Theme.DARK ? `border-neutral-600 focus:ring-offset-neutral-800 focus:ring-neutral-500 ${cancelButtonClasses}` : `border-gray-300 focus:ring-offset-white focus:ring-indigo-500 ${cancelButtonClasses}`
            } sm:mt-0 sm:w-auto sm:text-sm`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;