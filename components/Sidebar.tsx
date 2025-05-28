
import React from 'react';
import { ViewMode, Theme } from '../constants';
import { CalendarFilterOptions } from '../App';
import { CogIcon, CloseIcon, UserGroupIcon } from './icons'; // Added CloseIcon and UserGroupIcon

// SVG Icons (remain unchanged, only their labels/titles might be translated via parent)
const MonthlyCalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
  </svg>
);

const YearlyCalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

interface SidebarProps {
  currentViewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterOptions: CalendarFilterOptions;
  onFilterChange: (option: keyof CalendarFilterOptions) => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onOpenSettingsModal: (category: string) => void;
  onRequestClose: () => void; // New prop for closing the sidebar
}

const Sidebar: React.FC<SidebarProps> = ({
  currentViewMode,
  onViewModeChange,
  filterOptions,
  onFilterChange,
  currentTheme,
  onThemeChange,
  onOpenSettingsModal,
  onRequestClose, // New prop
}) => {

  const navItemBaseStyle = "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors duration-150";
  const navItemInactiveStyle = "text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-gray-800 dark:hover:text-white";
  const navItemActiveStyle = currentTheme === Theme.LIGHT ? "bg-rose-500 text-white" : "bg-sky-600 dark:bg-sky-600 text-white";

  const filterItemStyle = "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-150 hover:bg-gray-200 dark:hover:bg-neutral-700";
  const filterItemDisabledStyle = "opacity-50 cursor-not-allowed";

  const filters: Array<{ key: keyof CalendarFilterOptions; label: string; disabled?: boolean }> = [
    { key: 'showHolidays', label: "Feriados nacionais" },
    { key: 'showSaintDays', label: "Dias de Santos Católicos" }, // New filter
    { key: 'showCommemorativeDates', label: "Datas comemorativas" },
    { key: 'showEvents', label: "Eventos" },
    { key: 'showTasks', label: "Tarefas" },
  ];
  
  // This padding is for the main content area below the header/close button.
  // The close button will be positioned absolutely within the overall sidebar padding.
  const sidebarContentPaddingTop = 'pt-16'; 

  return (
    <aside
      id="sidebar-content" 
      className={`relative w-64 bg-gray-100 dark:bg-neutral-900 ${sidebarContentPaddingTop} px-4 pb-4 space-y-6 text-black dark:text-white flex-shrink-0 h-full overflow-y-auto border-l border-gray-200 dark:border-neutral-800`}
      aria-label="Menu Lateral de Navegação"
    >
      <button
        onClick={onRequestClose}
        className={`absolute top-4 right-4 z-10 p-2 rounded-md
                    ${currentTheme === Theme.LIGHT ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-neutral-200 bg-neutral-800 hover:bg-neutral-700'}
                    transition-colors duration-150`}
        aria-label="Fechar menu lateral"
        aria-controls="sidebar"
        aria-expanded="true"
      >
        <CloseIcon className="w-6 h-6" />
      </button>

      {/* Theme Toggle Switch - content starts below the absolute positioned button, respecting pt-16 */}
      <div className="mb-6"> {/* This div and subsequent items will be pushed down by pt-16 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">
            {currentTheme === Theme.LIGHT ? "Modo escuro" : "Modo claro"}
          </span>
          <label htmlFor="theme-toggle-switch" className="relative inline-flex items-center cursor-pointer" title={currentTheme === Theme.LIGHT ? "Ativar modo escuro" : "Ativar modo claro"}>
            <input
              type="checkbox"
              id="theme-toggle-switch"
              className="sr-only peer"
              checked={currentTheme === Theme.DARK}
              onChange={() => onThemeChange(currentTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)}
              aria-label={currentTheme === Theme.LIGHT ? "Ativar modo escuro" : "Ativar modo claro"}
            />
            <div className={`w-11 h-6 rounded-full peer
              ${currentTheme === Theme.DARK ? 
                'bg-sky-600 peer-focus:ring-sky-500' : 
                'bg-gray-200 dark:bg-neutral-700 peer-focus:ring-rose-500 dark:peer-focus:ring-sky-500'
              }
              peer-focus:outline-none peer-focus:ring-2
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
              after:bg-white after:border-gray-300 dark:after:border-neutral-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
              peer-checked:after:translate-x-full peer-checked:after:border-white`}
            >
            </div>
          </label>
        </div>
      </div>

      <nav className="space-y-1">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            onViewModeChange(ViewMode.MONTHLY);
          }}
          onKeyDown={(e) => e.key === 'Enter' && onViewModeChange(ViewMode.MONTHLY)}
          className={`${navItemBaseStyle} ${currentViewMode === ViewMode.MONTHLY ? navItemActiveStyle : navItemInactiveStyle}`}
          aria-pressed={currentViewMode === ViewMode.MONTHLY}
          aria-label="Mudar para visualização mensal"
        >
          <MonthlyCalendarIcon className="h-5 w-5" />
          <span>Mensal</span>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            onViewModeChange(ViewMode.YEARLY);
          }}
          onKeyDown={(e) => e.key === 'Enter' && onViewModeChange(ViewMode.YEARLY)}
          className={`${navItemBaseStyle} ${currentViewMode === ViewMode.YEARLY ? navItemActiveStyle : navItemInactiveStyle}`}
          aria-pressed={currentViewMode === ViewMode.YEARLY}
          aria-label="Mudar para visualização anual"
        >
          <YearlyCalendarIcon className="h-5 w-5" />
          <span>Anual</span>
        </div>
      </nav>

      <div>
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Mostrar no calendário</h3>
        <div className="space-y-2">
          {filters.map(filter => (
            <label
              key={filter.key}
              htmlFor={`filter-${filter.key}`}
              className={`${filterItemStyle} group ${filter.disabled ? filterItemDisabledStyle : ''}`}
              aria-disabled={filter.disabled}
            >
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-150 ${
                filterOptions[filter.key] && !filter.disabled
                  ? (currentTheme === Theme.LIGHT ? 'bg-rose-500 border-rose-500' : 'bg-sky-600 border-sky-600')
                  : 'border-gray-400 dark:border-neutral-500 group-hover:border-gray-500 dark:group-hover:border-neutral-400'
              }`}>
                {filterOptions[filter.key] && !filter.disabled && <CheckIcon className="w-3 h-3 text-white" />}
              </div>
              <input
                type="checkbox"
                id={`filter-${filter.key}`}
                checked={filterOptions[filter.key]}
                onChange={() => !filter.disabled && onFilterChange(filter.key)}
                disabled={filter.disabled}
                className="sr-only"
                aria-labelledby={`filter-label-${filter.key}`}
              />
              <span id={`filter-label-${filter.key}`}>{filter.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Configurações</h3>
        <div className="space-y-1">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenSettingsModal('General')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenSettingsModal('General'); }}
            className={`${navItemBaseStyle} ${navItemInactiveStyle}`}
            aria-haspopup="dialog"
            aria-label="Abrir configurações gerais"
          >
            <CogIcon className="h-5 w-5"/>
            <span>Geral</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenSettingsModal('Account')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenSettingsModal('Account'); }}
            className={`${navItemBaseStyle} ${navItemInactiveStyle}`}
            aria-haspopup="dialog"
            aria-label="Abrir configurações da conta"
          >
            <UserGroupIcon className="h-5 w-5"/>
            <span>Conta</span>
          </div>
          {/* Add other settings items here later */}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
