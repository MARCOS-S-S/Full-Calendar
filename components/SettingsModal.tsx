
import React, { useState, useEffect } from 'react';
import { Theme, DAY_NAMES_PT } from '../constants'; // Import DAY_NAMES_PT for week start options
import { CloseIcon } from './icons';
// SUPPORTED_LANGUAGES import removed

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSettings: { theme?: Theme; username?: string }) => void; 
  currentTheme: Theme;
  currentUsername: string; // Added to receive current username
  categoryName: string;
  // t prop removed
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTheme,
  currentUsername,
  categoryName,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme);
  const [usernameInput, setUsernameInput] = useState<string>(currentUsername);
  // selectedLanguage state removed

  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(currentTheme);
      setUsernameInput(currentUsername); 
    }
  }, [isOpen, currentTheme, currentUsername]);

  if (!isOpen) return null;

  const bgColor = selectedTheme === Theme.DARK ? 'bg-neutral-800' : 'bg-white';
  const textColor = selectedTheme === Theme.DARK ? 'text-neutral-100' : 'text-gray-900';
  const subTextColor = selectedTheme === Theme.DARK ? 'text-neutral-400' : 'text-gray-500';
  const borderColor = selectedTheme === Theme.DARK ? 'border-neutral-700' : 'border-gray-300';
  const closeButtonHoverBg = selectedTheme === Theme.DARK ? 'hover:bg-neutral-700' : 'hover:bg-gray-100';
  const inputBgColor = selectedTheme === Theme.DARK ? 'bg-neutral-700' : 'bg-white';
  const inputBorderColor = selectedTheme === Theme.DARK ? 'border-neutral-600' : 'border-gray-300';
  const inputFocusRingColor = selectedTheme === Theme.DARK ? 'focus:ring-sky-500 focus:border-sky-500' : 'focus:ring-rose-500 focus:border-rose-500';

  const primaryButtonClass = selectedTheme === Theme.DARK
    ? 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 focus:ring-offset-neutral-800'
    : 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-500 focus:ring-offset-white';

  const secondaryButtonClass = selectedTheme === Theme.DARK
    ? 'border-neutral-600 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 focus:ring-neutral-500 focus:ring-offset-neutral-800'
    : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-indigo-500 focus:ring-offset-white';

  const handleSaveChanges = () => {
    onSave({ theme: selectedTheme, username: usernameInput }); 
  };

  const displayCategoryName = categoryName === 'General' ? "Configurações Gerais"
                             : categoryName === 'Account' ? "Configurações da Conta"
                             : `Configurações de ${categoryName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className={`rounded-lg shadow-xl w-full max-w-lg ${bgColor} ${textColor} flex flex-col max-h-[90vh]`}>
        <header className={`flex items-center justify-between p-4 border-b ${borderColor} flex-shrink-0`}>
          <h2 id="settings-modal-title" className="text-xl font-semibold">
            {displayCategoryName}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full ${closeButtonHoverBg}`}
            aria-label="Fechar"
          >
            <CloseIcon className={`w-5 h-5 ${subTextColor}`} />
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {categoryName === 'General' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="username-input" className={`block text-sm font-medium mb-1.5 ${textColor}`}>Seu Nome/Apelido</label>
                <input
                  id="username-input"
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Digite seu nome ou apelido"
                  className={`w-full p-2.5 border rounded-md shadow-sm text-sm ${inputBgColor} ${inputBorderColor} ${textColor} ${inputFocusRingColor} focus:outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500`}
                />
                <p className={`mt-1.5 text-xs ${subTextColor}`}>Este nome será usado na mensagem de boas-vindas.</p>
              </div>
              <div>
                <label htmlFor="theme-select" className={`block text-sm font-medium mb-1.5 ${textColor}`}>Tema da Aplicação</label>
                <select
                    id="theme-select"
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value as Theme)}
                    className={`w-full p-2.5 border rounded-md shadow-sm text-sm ${inputBgColor} ${inputBorderColor} ${textColor} ${inputFocusRingColor} focus:outline-none`}
                >
                  <option value={Theme.LIGHT}>Tema Claro</option>
                  <option value={Theme.DARK}>Tema Escuro</option>
                </select>
                 <p className={`mt-1.5 text-xs ${subTextColor}`}>Escolha a aparência do calendário. As alterações são aplicadas imediatamente.</p>
              </div>
              {/* Language selection removed */}
              <div>
                <label htmlFor="default-view-select" className={`block text-sm font-medium mb-1.5 ${textColor}`}>Visualização Padrão do Calendário</label>
                <select
                    id="default-view-select"
                    className={`w-full p-2.5 border rounded-md shadow-sm text-sm ${inputBgColor} ${inputBorderColor} ${textColor} ${inputFocusRingColor} focus:outline-none`}
                    defaultValue="MONTHLY" // Placeholder - make this functional later
                >
                  <option value="MONTHLY">Mensal</option>
                  <option value="YEARLY">Anual</option>
                </select>
                <p className={`mt-1.5 text-xs ${subTextColor}`}>Escolha como o calendário aparece inicialmente ao ser aberto.</p>
              </div>
               <div>
                <label htmlFor="start-day-select" className={`block text-sm font-medium mb-1.5 ${textColor}`}>Semana Começa Em</label>
                <select
                    id="start-day-select"
                    className={`w-full p-2.5 border rounded-md shadow-sm text-sm ${inputBgColor} ${inputBorderColor} ${textColor} ${inputFocusRingColor} focus:outline-none`}
                    defaultValue="0" // Placeholder - make this functional later (Sunday = 0, Monday = 1)
                >
                  <option value="0">{DAY_NAMES_PT[0]}</option> {/* Sunday */}
                  <option value="1">{DAY_NAMES_PT[1]}</option> {/* Monday */}
                </select>
                <p className={`mt-1.5 text-xs ${subTextColor}`}>Defina o primeiro dia da sua semana nas visualizações do calendário.</p>
              </div>
            </div>
          )}
          {categoryName === 'Account' && (
            <div className="space-y-6">
              <p className={`${subTextColor}`}>
                As configurações da sua conta (como e-mail, senha, etc.) serão exibidas aqui. Esta seção é um espaço reservado.
              </p>
              {/* Placeholder for future account settings fields like:
              <div>
                <label htmlFor="account-email" className={`block text-sm font-medium mb-1.5 ${textColor}`}>E-mail</label>
                <input id="account-email" type="email" disabled value="usuario@exemplo.com" className={`w-full p-2.5 border rounded-md shadow-sm text-sm ${inputBgColor} ${inputBorderColor} ${textColor} ${inputFocusRingColor} focus:outline-none read-only:opacity-70`} />
              </div>
              <div>
                <label htmlFor="account-password" className={`block text-sm font-medium mb-1.5 ${textColor}`}>Senha</label>
                <button className={`px-3 py-1.5 text-sm rounded-md ${secondaryButtonClass}`}>Alterar Senha</button>
              </div>
              */}
            </div>
          )}
          {categoryName !== 'General' && categoryName !== 'Account' && (
             <p className={`${subTextColor}`}>{`As configurações para ${categoryName} serão exibidas aqui. Esta seção é um espaço reservado.`}</p>
          )}
        </div>
        <footer className={`px-4 py-3 sm:px-6 flex flex-row-reverse border-t ${borderColor} flex-shrink-0`}>
            <button
                type="button"
                onClick={handleSaveChanges}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${primaryButtonClass}`}
            >
                Salvar Alterações
            </button>
            <button
                type="button"
                onClick={onClose}
                className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm ${secondaryButtonClass}`}

            >
                Cancelar
            </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
