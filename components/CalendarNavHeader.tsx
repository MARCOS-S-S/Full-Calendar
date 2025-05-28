
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { Theme } from '../constants';

interface CalendarNavHeaderProps {
  displayedMonth: number; // 0-11
  displayedYear: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  localizedMonthNames: string[];
  currentTheme: Theme;
}

const CalendarNavHeader: React.FC<CalendarNavHeaderProps> = ({
  displayedMonth,
  displayedYear,
  onPreviousMonth,
  onNextMonth,
  localizedMonthNames,
  currentTheme,
}) => {
  const titleColorClass = currentTheme === Theme.DARK ? "text-neutral-100" : "text-gray-800";
  const accentColorClass = currentTheme === Theme.DARK ? "text-sky-400" : "text-rose-500";
  const buttonHoverBgClass = currentTheme === Theme.DARK ? "dark:hover:bg-neutral-700" : "hover:bg-gray-200";
  const buttonIconColorClass = currentTheme === Theme.DARK ? "dark:text-sky-400" : "text-rose-500";


  return (
    <div className="flex items-center justify-between py-4 px-2 sm:px-0 mb-2">
      <button
        onClick={onPreviousMonth}
        className={`p-2 rounded-full ${buttonHoverBgClass} ${buttonIconColorClass}`}
        aria-label="Mês anterior"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <h2 className={`text-2xl font-bold text-center mx-4 ${titleColorClass}`}>
        {localizedMonthNames[displayedMonth]} <span className={accentColorClass}>{displayedYear}</span>
      </h2>
      <button
        onClick={onNextMonth}
        className={`p-2 rounded-full ${buttonHoverBgClass} ${buttonIconColorClass}`}
        aria-label="Próximo mês"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default CalendarNavHeader;
