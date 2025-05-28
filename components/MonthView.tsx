
import React from 'react';
import { Holiday, HolidayType } from '../constants'; // Import HolidayType

interface CalendarGridProps {
  year: number;
  monthIndex: number; // 0-11
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  eventsByDate: Record<string, number>; // Key: 'YYYY-MM-DD', Value: count of events/activities
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
  todayObj.setHours(0,0,0,0);

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
            return <div key={`empty-${index}`} className="h-10 w-9"></div>; // Increased height slightly for dot space
          }

          const currentDateObj = new Date(year, monthIndex, day);
          currentDateObj.setHours(0,0,0,0);
          const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          const isSelected = selectedDate?.getTime() === currentDateObj.getTime();
          const isToday = currentDateObj.getTime() === todayObj.getTime();
          const eventCount = eventsByDate[dateString] || 0;
          const dayOfWeek = currentDateObj.getDay(); // 0 for Sunday, 6 for Saturday
          
          const holidayInfo = holidaysByDate[dateString];

          let cellClasses = `h-10 w-9 flex flex-col items-center justify-center text-sm rounded-full cursor-pointer transition-colors duration-150 relative pt-1 pb-0.5`; // Adjusted padding
          let textClasses = '';
          let hoverClasses = ' hover:bg-gray-100 dark:hover:bg-neutral-700 '; // Default hover

          if (isSelected) {
            // Selected takes precedence for background and text color
            cellClasses += isToday ? ' bg-sky-500 dark:bg-sky-600 ' : ' bg-rose-500 dark:bg-rose-600 ';
            textClasses = ' text-white font-semibold';
          } else {
            // Not selected, check for holiday, then today, then Sunday
            if (holidayInfo) {
              switch (holidayInfo.type) {
                case HolidayType.NATIONAL:
                  textClasses = 'text-orange-600 dark:text-orange-400 font-semibold';
                  break;
                case HolidayType.COMMEMORATIVE:
                  textClasses = 'text-green-600 dark:text-green-400 font-semibold';
                  break;
                case HolidayType.SAINT:
                  textClasses = 'text-blue-600 dark:text-blue-400 font-semibold';
                  break;
                default:
                  textClasses = 'text-gray-700 dark:text-neutral-200';
                  break;
              }
              if (isToday) { // Specific hover for today even if it's a holiday but not selected
                hoverClasses = ' hover:bg-purple-100 dark:hover:bg-purple-700/50 ';
              }
            } else if (isToday) {
              textClasses = ' text-purple-600 dark:text-purple-400 font-semibold';
              hoverClasses = ' hover:bg-purple-100 dark:hover:bg-purple-700/50 ';
            } else if (dayOfWeek === 0) { // Sunday (and not holiday or today)
              textClasses = 'text-red-500 dark:text-red-400';
            } else { // Regular day
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

          const dotColor = isSelected 
            ? 'bg-white' 
            : (isToday && !holidayInfo) ? 'bg-purple-400 dark:bg-purple-500'
            : holidayInfo ? 'bg-gray-500 dark:bg-gray-400'
            : 'bg-rose-400 dark:bg-rose-500';

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
              {eventCount > 0 && (
                <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                  {Array.from({ length: Math.min(eventCount, 3) }).map((_, i) => (
                    <span key={i} className={`h-1 w-1 rounded-full ${dotColor}`}></span>
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
