
import React from 'react';
import { Theme } from '../constants';

export interface WelcomeHeaderProps {
  username: string;
  theme: Theme;
  className?: string; // Para receber classes de posicionamento de App.tsx
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ username, theme, className }) => {
  if (!username) {
    return null;
  }

  const getCurrentGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return 'Bom dia';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };

  const greeting = getCurrentGreeting();
  const textColorClass = theme === Theme.DARK ? 'text-neutral-300' : 'text-gray-700';
  const nameColorClass = theme === Theme.DARK ? 'text-sky-400' : 'text-rose-500';
  // bgColorClass agora é usado para o fundo do card flutuante
  const bgColorClass = theme === Theme.DARK ? 'bg-black' : 'bg-slate-50';

  // Classes base para o componente, incluindo novos estilos para o "card"
  // Removido: text-center, mb-6
  // Adicionado: px-4 (padding horizontal), rounded-md, shadow-sm
  const baseStyleClasses = `py-3 px-4 text-xl ${textColorClass} ${bgColorClass} transition-colors duration-300 rounded-md shadow-sm`;

  return (
    <div
        className={`${baseStyleClasses} ${className || ''}`} // Combina estilos base com classes passadas (para posicionamento)
        aria-live="polite"
    >
      {greeting}, <span className={`font-semibold ${nameColorClass}`}>{username}</span>!
    </div>
  );
};

export default WelcomeHeader;
