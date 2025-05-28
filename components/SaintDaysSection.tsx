
import React from 'react';
import { Holiday } from '../constants'; // Reusing Holiday interface for Saint Days

interface SaintDaysSectionProps {
  saintDays: Holiday[]; // Saint days for the current month
  monthName: string;
  year: number;
}

const SaintDaysSection: React.FC<SaintDaysSectionProps> = ({ saintDays, monthName, year }) => {
  if (saintDays.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase text-blue-600 dark:text-blue-400 mb-3 px-1 sm:px-0">
          Dias de Santos Católicos em {monthName} de {year}
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-lg shadow">
          Nenhum dia de santo católico neste mês.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
      <h3 className="text-sm font-semibold uppercase text-blue-600 dark:text-blue-400 mb-4 px-1 sm:px-0">
        Dias de Santos Católicos em {monthName} de {year}
      </h3>
      <div className="space-y-3">
        {saintDays.map(saintDay => {
          const day = parseInt(saintDay.date.split('-')[2], 10);
          return (
            <div key={saintDay.date + '-' + saintDay.name} className="p-3 bg-white dark:bg-neutral-800 rounded-lg shadow">
              <p className="text-sm text-gray-800 dark:text-neutral-100">
                <span className="font-semibold">{String(day).padStart(2, '0')}</span> - {saintDay.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SaintDaysSection;
