
import React from 'react';
import { Holiday } from '../constants';

interface CommemorativeDatesSectionProps {
  commemorativeDates: Holiday[];
  monthName: string;
  year: number;
  // isLoading prop removed
}

const CommemorativeDatesSection: React.FC<CommemorativeDatesSectionProps> = ({ commemorativeDates, monthName, year }) => {
  const sectionTitle = `Datas Comemorativas em ${monthName} de ${year}`;

  // isLoading condition removed

  if (commemorativeDates.length === 0) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
        <h3 className="text-sm font-semibold uppercase text-green-600 dark:text-green-400 mb-3 px-1 sm:px-0">
          {sectionTitle}
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-lg shadow">
          Nenhuma data comemorativa principal para este mês.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
      <h3 className="text-sm font-semibold uppercase text-green-600 dark:text-green-400 mb-4 px-1 sm:px-0">
        {sectionTitle}
      </h3>
      <div className="space-y-3">
        {commemorativeDates.map(item => {
          const day = parseInt(item.date.split('-')[2], 10);
          return (
            <div key={item.date + '-' + item.name} className="p-3 bg-white dark:bg-neutral-800 rounded-lg shadow">
              <p className="text-sm text-gray-800 dark:text-neutral-100">
                <span className="font-semibold">{String(day).padStart(2, '0')}</span> - {item.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommemorativeDatesSection;
