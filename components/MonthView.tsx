
import React from 'react';
import { Holiday, HolidayType } from '../constants'; // Import HolidayType
import { EventDateInfo } from '../App'; // Import the EventDateInfo interface

interface CalendarGridProps {
  year: number;
  monthIndex: number; // 0-11
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  eventsByDate: Record<string, EventDateInfo>; // Updated to use EventDateInfo
  holidaysByDate: Record<string, Holiday>; // Key: 'YYYY-MM-DD', Value: Holiday object with type
  localizedDayAbbreviations: string[];
  localizedDayFullNames: string[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  monthIndex,
  selectedDate,
  onDateSelect,
  eventsByDate,
  holidaysByDate,
  localizedDayAbbreviations,
  localizedDayFullNames,
}) => {
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // 0 for Sunday
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const dayCells: (number | null)[] = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    dayCells.push(day);
  }

  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white dark:bg-neutral-800 p-4 shadow rounded-lg">
      <div className="grid grid-cols-7 gap-x-1 gap-y-2 text-center mb-3">
        {localizedDayAbbreviations.map((abbr, idx) => (
          <div
            key={`day-header-${idx}`}
            className="text-xs font-semibold text-rose-600 dark:text-sky-500"
            aria-label={localizedDayFullNames[idx]}
          >
            {abbr}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-x-1 gap-y-1 text-center">
        {dayCells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-10 w-9"></div>;
          }

          const currentDateObj = new Date(year, monthIndex, day);
          currentDateObj.setHours(0, 0, 0, 0);
          const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          const isSelected = selectedDate?.getTime() === currentDateObj.getTime();
          const isToday = currentDateObj.getTime() === todayObj.getTime();

          const eventDetails = eventsByDate[dateString];
          const activityColors = eventDetails ? eventDetails.colors : [];
          const eventCount = eventDetails ? eventDetails.count : 0;

          const dayOfWeek = currentDateObj.getDay(); // 0 for Sunday, 6 for Saturday
          const holidayInfo = holidaysByDate[dateString];

          let cellClasses = `h-10 w-9 flex flex-col items-center justify-center text-sm rounded-full cursor-pointer transition-colors duration-150 relative pt-1 pb-0.5`;
          let textClasses = '';
          let hoverClasses = ' hover:bg-gray-100 dark:hover:bg-neutral-700 ';

          if (isSelected) {
            // Sempre usar azul para seleção, independentemente de ser 'hoje' ou não.
            cellClasses += ' bg-sky-500 dark:bg-sky-600 ';
            textClasses = ' text-white font-semibold';
          } else {
            // Estilos para dias não selecionados (hoje, feriados, etc.)
            if (holidayInfo) {
              switch (holidayInfo.type) {
                case HolidayType.NATIONAL:
                  textClasses = 'text-orange-600 dark:text-orange-400 font-semibold';
                  break;
                case HolidayType.COMMEMORATIVE:
                  textClasses = 'text-green-600 dark:text-green-400 font-semibold';
                  break;
                case HolidayType.SAINT:
                  textClasses = 'text-blue-600 dark:text-blue-400 font-semibold'; // Mantém azul para dias de santo não selecionados
                  break;
                default:
                  textClasses = 'text-gray-700 dark:text-neutral-200';
                  break;
              }
              if (isToday) { // Se for um feriado E também hoje (mas não selecionado)
                hoverClasses = ' hover:bg-purple-100 dark:hover:bg-purple-700/50 ';
              }
            } else if (isToday) { // Se for apenas hoje (e não selecionado)
              textClasses = ' text-purple-600 dark:text-purple-400 font-semibold';
              hoverClasses = ' hover:bg-purple-100 dark:hover:bg-purple-700/50 ';
            } else if (dayOfWeek === 0) { // Domingo não selecionado
              textClasses = 'text-red-500 dark:text-red-400';
            } else { // Dia normal não selecionado
              textClasses = 'text-gray-700 dark:text-neutral-200';
            }
            cellClasses += hoverClasses;
          }

          const specialDayName = holidayInfo ? holidayInfo.name : '';
          let baseAriaLabel = isToday ? `Hoje, dia ${day}` : `Dia ${day}`;
          if (specialDayName) {
            baseAriaLabel += `, ${specialDayName}`;
          }
          if (eventCount > 0) {
            baseAriaLabel += `, Possui ${eventCount} ${eventCount === 1 ? 'atividade' : 'atividades'}`;
          }

          return (
            <div
              key={`day-${day}`}
              className={cellClasses.trim()}
              onClick={() => onDateSelect(currentDateObj)}
              role="button"
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              title={specialDayName || `Selecionar data ${day}`}
              aria-label={baseAriaLabel}
            >
              <span className={textClasses}>{day}</span>
              {activityColors.length > 0 && (
                <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex space-x-0.5" aria-hidden="true">
                  {activityColors.slice(0, 3).map((color, i) => (
                    <span
                      key={i}
                      className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : color}`} // Se selecionado, bolinhas brancas, senão usa a cor da atividade
                    ></span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
