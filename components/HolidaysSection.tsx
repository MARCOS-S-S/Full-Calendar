
import React from 'react';
import { Holiday } from '../constants';

interface HolidaysSectionProps {
  holidays: Holiday[]; // Holidays for the current month
  monthName: string; // Already localized from App.tsx
  year: number;
  isLoading: boolean;
}

const HolidaysSection: React.FC<HolidaysSectionProps> = ({ holidays, monthName, year, isLoading }) => {
  const sectionTitle = `Feriados Nacionais em ${monthName} de ${year}`;

  if (isLoading) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
        <h3 className="text-sm font-semibold uppercase text-yellow-600 dark:text-yellow-500 mb-4 px-1 sm:px-0">
          {sectionTitle}
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-lg shadow">
          Carregando feriados...
        </div>
      </div>
    );
  }
  
  if (holidays.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase text-yellow-600 dark:text-yellow-500 mb-3 px-1 sm:px-0">
          {sectionTitle}
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-lg shadow">
          Nenhum feriado nacional neste mês ou dados não disponíveis.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
      <h3 className="text-sm font-semibold uppercase text-yellow-600 dark:text-yellow-500 mb-4 px-1 sm:px-0">
        {sectionTitle}
      </h3>
      <div className="space-y-3">
        {holidays.map(holiday => {
          const day = parseInt(holiday.date.split('-')[2], 10);
          return (
            <div key={holiday.date} className="p-3 bg-white dark:bg-neutral-800 rounded-lg shadow">
              <p className="text-sm text-gray-800 dark:text-neutral-100">
                <span className="font-semibold">{String(day).padStart(2, '0')}</span> - {holiday.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HolidaysSection;
