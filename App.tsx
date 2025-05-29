
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import CalendarGrid from './components/MonthView';
import Sidebar from './components/Sidebar';
import CalendarNavHeader from './components/CalendarNavHeader';
import ActivitiesSection from './components/ActivitiesSection';
import HolidaysSection from './components/HolidaysSection';
import SaintDaysSection from './components/SaintDaysSection';
import CommemorativeDatesSection from './components/CommemorativeDatesSection';
import CreateActivityModal from './components/CreateActivityModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import SettingsModal from './components/SettingsModal';
import WelcomeHeader from './components/WelcomeHeader';
import {
  ViewMode, Theme, Activity, Holiday, MOCK_NATIONAL_HOLIDAYS_PT_BR, MOCK_ACTIVITIES, ActivityType, HolidayType,
  MONTH_NAMES_PT, DAY_ABBREVIATIONS_PT, DAY_NAMES_PT, MOCK_SAINT_DAYS_PT_BR, MOCK_COMMEMORATIVE_DATES_PT_BR,
  RecurrenceOption, CustomRecurrenceValues, FrequencyUnit, CUSTOM_RECURRENCE_DAY_CODES
} from './constants';
import { MenuIcon, CloseIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from './components/icons';

export interface CalendarFilterOptions {
  showHolidays: boolean;
  showSaintDays: boolean;
  showCommemorativeDates: boolean;
  showEvents: boolean;
  showTasks: boolean;
}

export interface EventDateInfo {
  colors: string[];
  count: number;
}

interface ParsedRrule {
  freq?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  byday?: string[]; // SU, MO, TU, WE, TH, FR, SA
  until?: Date; // Date object in UTC
  count?: number;
}

const parseRruleString = (rruleString: string): ParsedRrule | null => {
  if (!rruleString || !rruleString.startsWith('FREQ=')) return null;

  const parsed: ParsedRrule = {};
  const parts = rruleString.split(';');
  parts.forEach(part => {
    const [key, value] = part.split('=');
    if (!value) return;
    switch (key) {
      case 'FREQ':
        parsed.freq = value as ParsedRrule['freq'];
        break;
      case 'INTERVAL':
        parsed.interval = parseInt(value, 10);
        break;
      case 'BYDAY':
        parsed.byday = value.split(',');
        break;
      case 'UNTIL': // Expects YYYYMMDDTHHMMSSZ
        const year = parseInt(value.substring(0, 4), 10);
        const month = parseInt(value.substring(4, 6), 10) - 1; // JS months are 0-indexed
        const day = parseInt(value.substring(6, 8), 10);
        const hour = parseInt(value.substring(9, 11), 10);
        const minute = parseInt(value.substring(11, 13), 10);
        const second = parseInt(value.substring(13, 15), 10);
        parsed.until = new Date(Date.UTC(year, month, day, hour, minute, second));
        break;
      case 'COUNT':
        parsed.count = parseInt(value, 10);
        break;
    }
  });
  if (!parsed.interval) parsed.interval = 1;
  return parsed;
};


const App = (): JSX.Element => {
  const localizedMonthNames = MONTH_NAMES_PT;
  const localizedDayAbbreviations = DAY_ABBREVIATIONS_PT;
  const localizedDayFullNames = DAY_NAMES_PT;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MONTHLY);
  const [displayedYear, setDisplayedYear] = useState<number>(today.getFullYear());
  const [displayedMonth, setDisplayedMonth] = useState<number>(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('calendarTheme');
    if (storedTheme) {
      return storedTheme as Theme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return Theme.DARK;
    }
    return Theme.LIGHT;
  });

  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('calendarUsername') || '';
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const storedActivities = localStorage.getItem('calendarActivities');
    return storedActivities ? JSON.parse(storedActivities) : MOCK_ACTIVITIES;
  });

  const [nationalHolidays, setNationalHolidays] = useState<Holiday[]>(MOCK_NATIONAL_HOLIDAYS_PT_BR);
  const [commemorativeDates, setCommemorativeDates] = useState<Holiday[]>(MOCK_COMMEMORATIVE_DATES_PT_BR);
  const [saintDays, setSaintDays] = useState<Holiday[]>(MOCK_SAINT_DAYS_PT_BR);

  const [filterOptions, setFilterOptions] = useState<CalendarFilterOptions>(() => {
    const storedFilters = localStorage.getItem('calendarFilterOptions');
    return storedFilters ? JSON.parse(storedFilters) : {
      showHolidays: true,
      showSaintDays: true,
      showCommemorativeDates: true,
      showEvents: true,
      showTasks: true,
    };
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState<boolean>(false);
  const [activityIdToDelete, setActivityIdToDelete] = useState<string | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [currentSettingsCategory, setCurrentSettingsCategory] = useState<string>('');

  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const themeColorMetaTag = document.getElementById('theme-color-meta') as HTMLMetaElement | null;

    if (theme === Theme.DARK) {
      htmlElement.classList.add('dark');
      if (themeColorMetaTag) {
        themeColorMetaTag.content = '#000000';
      }
    } else {
      htmlElement.classList.remove('dark');
      if (themeColorMetaTag) {
        themeColorMetaTag.content = '#FFFFFF';
      }
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('calendarActivities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('calendarFilterOptions', JSON.stringify(filterOptions));
  }, [filterOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        sidebarToggleRef.current &&
        !sidebarToggleRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('calendarTheme')) {
        setTheme(e.matches ? Theme.DARK : Theme.LIGHT);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('calendarTheme', newTheme);
  };

  const handlePreviousMonth = () => {
    setDisplayedMonth(prevMonth => {
      if (prevMonth === 0) {
        setDisplayedYear(prevYear => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  const handleNextMonth = () => {
    setDisplayedMonth(prevMonth => {
      if (prevMonth === 11) {
        setDisplayedYear(prevYear => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  };

  const handleDateSelect = (date: Date) => {
    if (selectedDate && date.getTime() === selectedDate.getTime()) {
      handleOpenCreateModal();
    } else {
      setSelectedDate(date);
      if (date.getFullYear() !== displayedYear || date.getMonth() !== displayedMonth) {
        setDisplayedYear(date.getFullYear());
        setDisplayedMonth(date.getMonth());
      }
    }
  };

  const handleFilterChange = (option: keyof CalendarFilterOptions) => {
    setFilterOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prevIsOpen => !prevIsOpen);
  };

  const handleOpenCreateModal = () => {
    setActivityToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setActivityToEdit(null);
  };

  const handleSaveActivity = (activityData: Omit<Activity, 'id'> & { id?: string }) => {
    if (activityData.id && !activityData.id.startsWith('temp-')) {
      setActivities(prevActivities =>
        prevActivities.map(act => act.id === activityData.id ? { ...act, ...activityData } as Activity : act)
          .sort((a, b) => {
            const aTime = a.isAllDay ? "00:00" : a.startTime || "00:00";
            const bTime = b.isAllDay ? "00:00" : b.startTime || "00:00";
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            return aTime.localeCompare(bTime);
          })
      );
    } else {
      const newActivity: Activity = {
        ...activityData,
        id: String(Date.now() + Math.random()),
      } as Activity;
      setActivities(prevActivities => [...prevActivities, newActivity].sort((a, b) => {
        const aTime = a.isAllDay ? "00:00" : a.startTime || "00:00";
        const bTime = b.isAllDay ? "00:00" : b.startTime || "00:00";
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        return aTime.localeCompare(bTime);
      }));
    }
    setIsCreateModalOpen(false);
    setActivityToEdit(null);
  };

  const handleEditActivity = (activity: Activity) => {
    const originalId = activity.id.includes('-recur-') ? activity.id.split('-recur-')[0] : activity.id;
    const baseActivity = activities.find(act => act.id === originalId);

    if (baseActivity) {
      setActivityToEdit({
        ...baseActivity,
        date: activity.date,
        id: baseActivity.id,
      });
    } else {
      setActivityToEdit(activity);
    }
    setIsCreateModalOpen(true);
  };

  const handleDeleteActivityRequest = (activityId: string) => {
    const originalId = activityId.includes('-recur-') ? activityId.split('-recur-')[0] : activityId;
    setActivityIdToDelete(originalId);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleConfirmDeleteActivity = () => {
    if (activityIdToDelete) {
      setActivities(prevActivities => prevActivities.filter(act => act.id !== activityIdToDelete));
    }
    setIsConfirmDeleteModalOpen(false);
    setActivityIdToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteModalOpen(false);
    setActivityIdToDelete(null);
  };

  const handleOpenSettingsModal = (category: string) => {
    setCurrentSettingsCategory(category);
    setIsSettingsModalOpen(true);
    setIsSidebarOpen(false);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  const handleSaveSettings = (newConfig: { theme?: Theme; username?: string }) => {
    if (newConfig.theme && newConfig.theme !== theme) {
      handleThemeChange(newConfig.theme);
    }
    if (newConfig.username !== undefined) {
      setUsername(newConfig.username);
      if (newConfig.username) {
        localStorage.setItem('calendarUsername', newConfig.username);
      } else {
        localStorage.removeItem('calendarUsername');
      }
    }
    handleCloseSettingsModal();
  };

  const eventsByDate = useMemo(() => {
    const mapping: Record<string, EventDateInfo> = {};
    const viewStartDate = new Date(displayedYear, displayedMonth, 1);
    viewStartDate.setHours(0, 0, 0, 0);
    const viewEndDate = new Date(displayedYear, displayedMonth + 1, 0);
    viewEndDate.setHours(23, 59, 59, 999);

    const addActivityToMapping = (activity: Activity, date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const isVisibleEvent = filterOptions.showEvents && activity.activityType === ActivityType.EVENT;
      const isVisibleTask = filterOptions.showTasks && activity.activityType === ActivityType.TASK;
      const isVisibleBirthday = activity.activityType === ActivityType.BIRTHDAY;

      if (!isVisibleEvent && !isVisibleTask && !isVisibleBirthday) {
        return;
      }

      if (!mapping[dateStr]) {
        mapping[dateStr] = { colors: [], count: 0 };
      }
      // Avoid duplicate color dots if multiple instances of the same base activity fall on the same day due to aggressive iteration
      if (!mapping[dateStr].colors.includes(activity.categoryColor) || mapping[dateStr].colors.length < 3) {
        mapping[dateStr].colors.push(activity.categoryColor);
      }
      mapping[dateStr].count++;
    };

    const rruleDayToJsDay: { [key: string]: number } = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

    activities.forEach(act => {
      const originalActivityDate = new Date(act.date + 'T00:00:00');
      if (isNaN(originalActivityDate.getTime())) return;

      originalActivityDate.setHours(
        act.startTime ? parseInt(act.startTime.split(':')[0]) : 0,
        act.startTime ? parseInt(act.startTime.split(':')[1]) : 0,
        0, 0
      );


      if (originalActivityDate >= viewStartDate && originalActivityDate <= viewEndDate) {
        addActivityToMapping(act, originalActivityDate);
      }

      if (!act.recurrenceRule || act.recurrenceRule === RecurrenceOption.NONE) return;

      const parsedRule = parseRruleString(act.recurrenceRule);
      let simpleRuleType: RecurrenceOption | null = null;
      Object.values(RecurrenceOption).forEach(val => {
        if (val === act.recurrenceRule) simpleRuleType = val as RecurrenceOption;
      });

      if (parsedRule) { // Custom RRULE
        let currentDateForIteration = new Date(originalActivityDate);
        let occurrencesGenerated = 0;
        const maxOccurrencesFromRule = parsedRule.count;
        const maxIterationLimit = 700; // Safety limit for total iterations
        let iterationCount = 0;

        while (iterationCount < maxIterationLimit) {
          iterationCount++;

          if (maxOccurrencesFromRule && occurrencesGenerated >= maxOccurrencesFromRule) break;
          // If currentDateForIteration is already past UNTIL or far beyond view, break.
          if (parsedRule.until && currentDateForIteration.getTime() > parsedRule.until.getTime()) break;
          if (currentDateForIteration.getFullYear() > viewEndDate.getFullYear() + 2) break; // Optimization

          // Check instances from this iteration step
          if (parsedRule.freq === 'WEEKLY' && parsedRule.byday && parsedRule.byday.length > 0) {
            const ruleDaysJs = parsedRule.byday.map(d => rruleDayToJsDay[d]).sort((a, b) => a - b);
            const currentIterDayOfWeek = currentDateForIteration.getDay();

            for (const targetDayJs of ruleDaysJs) {
              let potentialDate = new Date(currentDateForIteration);
              potentialDate.setDate(potentialDate.getDate() + (targetDayJs - currentIterDayOfWeek));
              // Restore original time of day from originalActivityDate
              potentialDate.setHours(originalActivityDate.getHours(), originalActivityDate.getMinutes(), originalActivityDate.getSeconds(), originalActivityDate.getMilliseconds());


              if (potentialDate.getTime() < originalActivityDate.getTime()) continue;
              if (parsedRule.until && potentialDate.getTime() > parsedRule.until.getTime()) continue;
              // Check COUNT against occurrencesGenerated *before* adding,
              // but ensure this instance itself is part of the count.
              if (maxOccurrencesFromRule && occurrencesGenerated >= maxOccurrencesFromRule && potentialDate.getTime() > currentDateForIteration.getTime()) {
                // If count is met, only allow instances from the *current* iteration step's primary date, not future ones derived from BYDAY.
                // This needs to be tied to when occurrencesGenerated is incremented.
              }


              if (potentialDate >= viewStartDate && potentialDate <= viewEndDate) {
                // Avoid adding the original date again if it was already handled by the initial check outside this loop
                if (potentialDate.getTime() !== originalActivityDate.getTime() ||
                  (potentialDate.getTime() === originalActivityDate.getTime() && parsedRule.byday && !parsedRule.byday.includes(CUSTOM_RECURRENCE_DAY_CODES[originalActivityDate.getDay()])) ||
                  (potentialDate.getTime() === originalActivityDate.getTime() && parsedRule.byday && parsedRule.byday.length > 1) // if byday includes original but also others
                ) {
                  addActivityToMapping(act, new Date(potentialDate));
                } else if (potentialDate.getTime() === originalActivityDate.getTime() && !(originalActivityDate >= viewStartDate && originalActivityDate <= viewEndDate)) {
                  // If original was NOT in view but its BYDAY recurrence IS the original date and IS in view
                  addActivityToMapping(act, new Date(potentialDate));
                }
              }
            }
          } else { // DAILY, MONTHLY, YEARLY, or WEEKLY without BYDAY
            if (currentDateForIteration.getTime() >= originalActivityDate.getTime()) {
              if (currentDateForIteration >= viewStartDate && currentDateForIteration <= viewEndDate) {
                // Avoid adding the original date again if it was already handled by the initial check
                if (currentDateForIteration.getTime() !== originalActivityDate.getTime() || !(originalActivityDate >= viewStartDate && originalActivityDate <= viewEndDate)) {
                  addActivityToMapping(act, new Date(currentDateForIteration));
                }
              }
            }
          }

          // Increment occurrencesGenerated *after* processing the current iteration step (currentDateForIteration).
          // This counts how many primary recurrence steps we've taken.
          if (currentDateForIteration.getTime() >= originalActivityDate.getTime()) {
            occurrencesGenerated++;
            if (maxOccurrencesFromRule && occurrencesGenerated >= maxOccurrencesFromRule) break; // Check count limit immediately after increment
          }

          // Advance currentDateForIteration for the next cycle
          const interval = parsedRule.interval || 1;
          const tempAdvDate = new Date(currentDateForIteration);
          let advanced = true;

          switch (parsedRule.freq) {
            case 'DAILY': tempAdvDate.setDate(tempAdvDate.getDate() + interval); break;
            case 'WEEKLY': tempAdvDate.setDate(tempAdvDate.getDate() + (7 * interval)); break;
            case 'MONTHLY':
              const initialMonthlyDay = originalActivityDate.getDate();
              tempAdvDate.setDate(1);
              tempAdvDate.setMonth(tempAdvDate.getMonth() + interval);
              const targetMonth = tempAdvDate.getMonth();
              tempAdvDate.setDate(initialMonthlyDay);
              if (tempAdvDate.getMonth() !== targetMonth) {
                tempAdvDate.setMonth(targetMonth + 1); tempAdvDate.setDate(0);
              }
              break;
            case 'YEARLY':
              const initialYearlyMonth = originalActivityDate.getMonth();
              const initialYearlyDay = originalActivityDate.getDate();
              tempAdvDate.setDate(1);
              tempAdvDate.setMonth(initialYearlyMonth);
              tempAdvDate.setFullYear(tempAdvDate.getFullYear() + interval);
              const targetYearMonth = tempAdvDate.getMonth();
              tempAdvDate.setDate(initialYearlyDay);
              if (tempAdvDate.getMonth() !== targetYearMonth) {
                tempAdvDate.setMonth(targetYearMonth + 1); tempAdvDate.setDate(0);
              }
              break;
            default: advanced = false; break;
          }

          if (!advanced || tempAdvDate.getTime() <= currentDateForIteration.getTime()) break;
          currentDateForIteration.setTime(tempAdvDate.getTime());
        }
      } else if (simpleRuleType && simpleRuleType !== RecurrenceOption.CUSTOM) {
        let currentDate = new Date(originalActivityDate);
        const maxRecurrenceYear = displayedYear + 2;

        switch (simpleRuleType) {
          case RecurrenceOption.DAILY: currentDate.setDate(currentDate.getDate() + 1); break;
          case RecurrenceOption.WEEKLY: currentDate.setDate(currentDate.getDate() + 7); break;
          case RecurrenceOption.MONTHLY:
            const dayOfMonth = currentDate.getDate();
            currentDate.setMonth(currentDate.getMonth() + 1);
            if (currentDate.getDate() !== dayOfMonth) currentDate.setDate(0);
            break;
          case RecurrenceOption.YEARLY: currentDate.setFullYear(currentDate.getFullYear() + 1); break;
          default: return;
        }

        while (currentDate.getFullYear() < maxRecurrenceYear && currentDate <= viewEndDate) {
          if (currentDate >= viewStartDate) {
            addActivityToMapping(act, new Date(currentDate));
          }
          switch (simpleRuleType) {
            case RecurrenceOption.DAILY: currentDate.setDate(currentDate.getDate() + 1); break;
            case RecurrenceOption.WEEKLY: currentDate.setDate(currentDate.getDate() + 7); break;
            case RecurrenceOption.MONTHLY:
              const dayOfMonth = originalActivityDate.getDate();
              currentDate.setMonth(currentDate.getMonth() + 1);
              if (currentDate.getDate() !== dayOfMonth) currentDate.setDate(0);
              break;
            case RecurrenceOption.YEARLY: currentDate.setFullYear(currentDate.getFullYear() + 1); break;
          }
          if (currentDate.getTime() <= originalActivityDate.getTime() && simpleRuleType !== RecurrenceOption.DAILY) {
            break;
          }
        }
      }
    });
    return mapping;
  }, [activities, filterOptions.showEvents, filterOptions.showTasks, displayedYear, displayedMonth]);


  const holidaysByDate = useMemo(() => {
    const mapping: Record<string, Holiday> = {};
    const yearStr = String(displayedYear);

    if (filterOptions.showSaintDays) {
      saintDays.forEach(sd => {
        const [saintMonthStr, saintDayStr] = sd.date.split('-');
        const dateStr = `${yearStr}-${saintMonthStr}-${saintDayStr}`;
        if (!mapping[dateStr]) {
          mapping[dateStr] = { ...sd, date: dateStr };
        }
      });
    }

    if (filterOptions.showCommemorativeDates) {
      commemorativeDates.forEach(cd => {
        if (cd.date.startsWith(yearStr) && cd.type === HolidayType.COMMEMORATIVE) {
          mapping[cd.date] = cd;
        }
      });
    }

    if (filterOptions.showHolidays) {
      nationalHolidays.forEach(hol => {
        if (hol.date.startsWith(yearStr) && hol.type === HolidayType.NATIONAL) {
          mapping[hol.date] = hol;
        }
      });
    }
    return mapping;
  }, [
    displayedYear,
    nationalHolidays,
    saintDays,
    commemorativeDates,
    filterOptions.showHolidays,
    filterOptions.showSaintDays,
    filterOptions.showCommemorativeDates
  ]);

  const holidaysForCurrentMonth = useMemo(() => {
    if (!filterOptions.showHolidays) return [];
    return nationalHolidays.filter(holiday => {
      const holidayDate = new Date(holiday.date + 'T00:00:00');
      return holiday.type === HolidayType.NATIONAL && holidayDate.getFullYear() === displayedYear && holidayDate.getMonth() === displayedMonth;
    }).sort((a, b) => {
      const dayA = parseInt(a.date.split('-')[2], 10);
      const dayB = parseInt(b.date.split('-')[2], 10);
      return dayA - dayB;
    });
  }, [nationalHolidays, displayedYear, displayedMonth, filterOptions.showHolidays]);

  const commemorativeDatesForCurrentMonth = useMemo(() => {
    if (!filterOptions.showCommemorativeDates) return [];
    return commemorativeDates.filter(cd => {
      const cdDate = new Date(cd.date + 'T00:00:00');
      return cd.type === HolidayType.COMMEMORATIVE && cdDate.getFullYear() === displayedYear && cdDate.getMonth() === displayedMonth;
    }).sort((a, b) => {
      const dayA = parseInt(a.date.split('-')[2], 10);
      const dayB = parseInt(b.date.split('-')[2], 10);
      return dayA - dayB;
    });
  }, [commemorativeDates, displayedYear, displayedMonth, filterOptions.showCommemorativeDates]);

  const saintDaysForCurrentMonth = useMemo(() => {
    if (!filterOptions.showSaintDays) return [];
    return saintDays
      .filter(sd => {
        const [saintMonthStr] = sd.date.split('-');
        const saintMonth = parseInt(saintMonthStr, 10);
        return sd.type === HolidayType.SAINT && (saintMonth - 1) === displayedMonth;
      })
      .map(sd => ({
        date: `${displayedYear}-${sd.date}`,
        name: sd.name,
        type: HolidayType.SAINT,
      }))
      .sort((a, b) => {
        const dayA = parseInt(a.date.split('-')[2], 10);
        const dayB = parseInt(b.date.split('-')[2], 10);
        return dayA - dayB;
      });
  }, [saintDays, displayedYear, displayedMonth, filterOptions.showSaintDays]);

  const activitiesForSelectedDateView = useMemo(() => {
    if (!selectedDate) return [];

    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const targetDateLocal = new Date(selectedDateString + 'T00:00:00');
    const activitiesOccurringOnSelectedDate: Activity[] = [];

    const LOCAL_CUSTOM_RECURRENCE_DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

    const addActivityInstanceToList = (activity: Activity, instanceDateString: string, isRecurrence: boolean) => {
      if (activity.activityType === ActivityType.EVENT && !filterOptions.showEvents) return;
      if (activity.activityType === ActivityType.TASK && !filterOptions.showTasks) return;

      const instanceId = isRecurrence ? `${activity.id}-recur-${instanceDateString}-${Date.now()}` : activity.id; // Add timestamp for uniqueness
      if (activitiesOccurringOnSelectedDate.some(a => a.id === instanceId && a.date === instanceDateString)) {
        return;
      }

      activitiesOccurringOnSelectedDate.push({
        ...activity,
        date: instanceDateString,
        id: instanceId,
      });
    };

    activities.forEach(act => {
      const originalActivityDateLocal = new Date(act.date + 'T00:00:00');
      if (isNaN(originalActivityDateLocal.getTime())) return;

      originalActivityDateLocal.setHours(
        act.startTime ? parseInt(act.startTime.split(':')[0]) : 0,
        act.startTime ? parseInt(act.startTime.split(':')[1]) : 0,
        0, 0
      );


      if (act.date === selectedDateString) {
        addActivityInstanceToList(act, selectedDateString, false);
      }

      if (act.recurrenceRule && act.recurrenceRule !== RecurrenceOption.NONE) {
        const parsedRule = parseRruleString(act.recurrenceRule);
        let simpleRuleType: RecurrenceOption | null = null;
        Object.values(RecurrenceOption).forEach(val => {
          if (val === act.recurrenceRule) simpleRuleType = val as RecurrenceOption;
        });

        const rruleDayToJsDay: { [key: string]: number } = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

        if (parsedRule) { // Custom RRULE
          let currentDateForIteration = new Date(originalActivityDateLocal);
          let occurrencesGenerated = 0;
          const maxOccurrencesFromRule = parsedRule.count;
          const maxIterationLimit = 700;
          let iterationCount = 0;

          while (iterationCount < maxIterationLimit) {
            iterationCount++;

            if (maxOccurrencesFromRule && occurrencesGenerated >= maxOccurrencesFromRule) break;
            if (parsedRule.until && currentDateForIteration.getTime() > parsedRule.until.getTime()) break;

            let margin = 0; // Approximation for optimization break
            if (parsedRule.freq === 'WEEKLY') margin = 7 * 24 * 60 * 60 * 1000;
            else if (parsedRule.freq === 'MONTHLY') margin = 31 * 24 * 60 * 60 * 1000;
            else if (parsedRule.freq === 'YEARLY') margin = 366 * 24 * 60 * 60 * 1000;
            if (currentDateForIteration.getTime() > targetDateLocal.getTime() + margin && currentDateForIteration.toISOString().split('T')[0] !== selectedDateString) {
              break;
            }

            let foundOnThisIterationStep = false;

            if (parsedRule.freq === 'WEEKLY' && parsedRule.byday && parsedRule.byday.length > 0) {
              const ruleDaysJs = parsedRule.byday.map(d => rruleDayToJsDay[d]).sort((a, b) => a - b);
              const currentIterDayOfWeek = currentDateForIteration.getDay();

              for (const targetDayJs of ruleDaysJs) {
                let potentialDate = new Date(currentDateForIteration);
                potentialDate.setDate(potentialDate.getDate() + (targetDayJs - currentIterDayOfWeek));
                potentialDate.setHours(originalActivityDateLocal.getHours(), originalActivityDateLocal.getMinutes(), originalActivityDateLocal.getSeconds(), originalActivityDateLocal.getMilliseconds());

                if (potentialDate.getTime() < originalActivityDateLocal.getTime()) continue;
                if (parsedRule.until && potentialDate.getTime() > parsedRule.until.getTime()) continue;
                // Check count for byday instance
                if (maxOccurrencesFromRule && occurrencesGenerated >= maxOccurrencesFromRule && potentialDate.getTime() > currentDateForIteration.getTime()) continue;


                if (potentialDate.toISOString().split('T')[0] === selectedDateString) {
                  if (potentialDate.getTime() !== originalActivityDateLocal.getTime() || act.date !== selectedDateString) {
                    addActivityInstanceToList(act, selectedDateString, true);
                    foundOnThisIterationStep = true;
                    break;
                  } else if (potentialDate.getTime() === originalActivityDateLocal.getTime() && act.date === selectedDateString) {
                    // Already added by the non-recurring check, but ensure it respects BYDAY if it's the original
                    if (parsedRule.byday.includes(LOCAL_CUSTOM_RECURRENCE_DAY_CODES[originalActivityDateLocal.getDay()])) {
                      // It's the original date AND it matches a BYDAY rule.
                      // addActivityInstanceToList handles duplicates.
                      foundOnThisIterationStep = true; // To break outer loop if found.
                      break;
                    }
                  }
                }
              }
            } else {
              if (currentDateForIteration.getTime() >= originalActivityDateLocal.getTime()) {
                if (currentDateForIteration.toISOString().split('T')[0] === selectedDateString) {
                  if (currentDateForIteration.getTime() !== originalActivityDateLocal.getTime() || act.date !== selectedDateString) {
                    addActivityInstanceToList(act, selectedDateString, true);
                    foundOnThisIterationStep = true;
                  }
                }
              }
            }

            if (foundOnThisIterationStep) break;

            if (currentDateForIteration.getTime() >= originalActivityDateLocal.getTime()) {
              occurrencesGenerated++;
              if (maxOccurrencesFromRule && occurrencesGenerated >= maxOccurrencesFromRule) break;
            }

            const interval = parsedRule.interval || 1;
            const tempAdvDate = new Date(currentDateForIteration);
            let advanced = true;
            switch (parsedRule.freq) {
              case 'DAILY': tempAdvDate.setDate(tempAdvDate.getDate() + interval); break;
              case 'WEEKLY': tempAdvDate.setDate(tempAdvDate.getDate() + (7 * interval)); break;
              case 'MONTHLY':
                const initialMonthlyDay = originalActivityDateLocal.getDate();
                tempAdvDate.setDate(1);
                tempAdvDate.setMonth(tempAdvDate.getMonth() + interval);
                const targetMonthM = tempAdvDate.getMonth();
                tempAdvDate.setDate(initialMonthlyDay);
                if (tempAdvDate.getMonth() !== targetMonthM) {
                  tempAdvDate.setMonth(targetMonthM + 1); tempAdvDate.setDate(0);
                }
                break;
              case 'YEARLY':
                const initialYearlyMonth = originalActivityDateLocal.getMonth();
                const initialYearlyDay = originalActivityDateLocal.getDate();
                tempAdvDate.setDate(1);
                tempAdvDate.setMonth(initialYearlyMonth);
                tempAdvDate.setFullYear(tempAdvDate.getFullYear() + interval);
                const targetYearMonthY = tempAdvDate.getMonth();
                tempAdvDate.setDate(initialYearlyDay);
                if (tempAdvDate.getMonth() !== targetYearMonthY) {
                  tempAdvDate.setMonth(targetYearMonthY + 1); tempAdvDate.setDate(0);
                }
                break;
              default: advanced = false; break;
            }
            if (!advanced || tempAdvDate.getTime() <= currentDateForIteration.getTime()) break;
            currentDateForIteration.setTime(tempAdvDate.getTime());
          }
        } else if (simpleRuleType && simpleRuleType !== RecurrenceOption.CUSTOM) {
          let currentDate = new Date(originalActivityDateLocal);
          const maxSimpleIterations = 500;
          let iter = 0;

          while (iter < maxSimpleIterations) {
            if (iter > 0 || currentDate.getTime() === originalActivityDateLocal.getTime()) {
              switch (simpleRuleType) {
                case RecurrenceOption.DAILY: currentDate.setDate(currentDate.getDate() + 1); break;
                case RecurrenceOption.WEEKLY: currentDate.setDate(currentDate.getDate() + 7); break;
                case RecurrenceOption.MONTHLY:
                  const day = originalActivityDateLocal.getDate();
                  currentDate.setMonth(currentDate.getMonth() + 1); // Add month first
                  currentDate.setDate(day); // Then set day
                  if (currentDate.getDate() !== day) currentDate.setDate(0); // Adjust if day rolled over month
                  break;
                case RecurrenceOption.YEARLY:
                  const yearMonth = originalActivityDateLocal.getMonth();
                  const yearDay = originalActivityDateLocal.getDate();
                  currentDate.setFullYear(currentDate.getFullYear() + 1, yearMonth, yearDay);
                  if (currentDate.getMonth() !== yearMonth || currentDate.getDate() !== yearDay) currentDate.setDate(0);
                  break;
                default: iter = maxSimpleIterations; break;
              }
            }
            if (currentDate.toISOString().split('T')[0] === selectedDateString) {
              if (currentDate.getTime() !== originalActivityDateLocal.getTime() || act.date !== selectedDateString) {
                addActivityInstanceToList(act, selectedDateString, true);
              }
              break;
            }
            if (currentDate.getTime() > targetDateLocal.getTime() && iter > 0) break;
            if (currentDate.getFullYear() > originalActivityDateLocal.getFullYear() + 5 && iter > 0) break;
            iter++;
            if (iter === 0 && currentDate.getTime() !== originalActivityDateLocal.getTime()) { // If first check was not original, increment iter
              iter++;
            }
          }
        }
      }
    });

    return activitiesOccurringOnSelectedDate.sort((a, b) => {
      const aTime = a.isAllDay ? "00:00" : a.startTime || "00:00";
      const bTime = b.isAllDay ? "00:00" : b.startTime || "00:00";
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      return aTime.localeCompare(bTime);
    });
  }, [activities, selectedDate, filterOptions.showEvents, filterOptions.showTasks]);


  return (
    <div className={`flex h-full font-sans antialiased overflow-hidden ${theme === Theme.DARK ? 'dark' : ''}`}>

      {/* Sidebar (permanece com posicionamento fixo/transform) */}
      <div
        ref={sidebarRef}
        id="sidebar"
        className={`fixed z-20 transform transition-transform duration-300 ease-in-out 
                  ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
                  w-64 shadow-lg`}
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          bottom: 'env(safe-area-inset-bottom, 0px)',
          right: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <Sidebar
          currentViewMode={viewMode}
          onViewModeChange={(mode) => { setViewMode(mode); setIsSidebarOpen(false); }}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          currentTheme={theme}
          onThemeChange={(newTheme) => { handleThemeChange(newTheme); }}
          onOpenSettingsModal={(category) => { handleOpenSettingsModal(category); }}
          onRequestClose={toggleSidebar}
        />
      </div>

      {/* Conteúdo Principal que rola */}
      <main
        className={`relative flex-grow transition-all duration-300 ease-in-out h-full overflow-y-scroll 
                  ${isSidebarOpen ? 'blur-sm pointer-events-none' : ''}
                  ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'}`}
        style={{
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Cabeçalho Combinado: Mensagem de Boas-vindas e Botão do Sidebar */}
        <div
          className="flex justify-between items-center w-full px-3 sm:px-4 lg:px-6 mb-6"
          style={{
            paddingTop: `calc(env(safe-area-inset-top, 0px) + 0.75rem)`,
          }}
        >
          {/* Wrapper da Mensagem de Boas-vindas - ocupa o espaço disponível */}
          <div className="flex-grow min-w-0 pr-4">
            {username && (
              <WelcomeHeader
                username={username}
                theme={theme}
              />
            )}
          </div>

          {/* Botão de Alternância do Sidebar - largura fixa, não encolhe */}
          <button
            ref={sidebarToggleRef}
            onClick={toggleSidebar}
            className={`p-2 rounded-md h-10 w-10 flex items-center justify-center flex-shrink-0
                        ${theme === Theme.LIGHT ? 'text-rose-500 hover:bg-rose-50' : 'text-sky-400 hover:bg-sky-500/20'}
                        transition-all duration-300 ${isSidebarOpen ? 'hidden' : ''}`}
            aria-label="Abrir menu lateral"
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
            hidden={isSidebarOpen}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo principal abaixo do cabeçalho combinado */}
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8`}>
          {/* WelcomeHeader foi movido para cima */}

          {viewMode === ViewMode.MONTHLY && (
            <div className="max-w-3xl mx-auto">
              <CalendarNavHeader
                displayedMonth={displayedMonth}
                displayedYear={displayedYear}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
                localizedMonthNames={localizedMonthNames}
                currentTheme={theme}
              />

              <div className="my-6">
                <CalendarGrid
                  year={displayedYear}
                  monthIndex={displayedMonth}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  eventsByDate={eventsByDate}
                  holidaysByDate={holidaysByDate}
                  localizedDayAbbreviations={localizedDayAbbreviations}
                  localizedDayFullNames={localizedDayFullNames}
                />
              </div>

              <ActivitiesSection
                selectedDate={selectedDate}
                activities={activitiesForSelectedDateView}
                onAddActivity={handleOpenCreateModal}
                onEditActivity={handleEditActivity}
                onDeleteActivityRequest={handleDeleteActivityRequest}
                currentTheme={theme}
              />

              {filterOptions.showHolidays && (
                <HolidaysSection
                  holidays={holidaysForCurrentMonth}
                  monthName={localizedMonthNames[displayedMonth]}
                  year={displayedYear}
                />
              )}

              {filterOptions.showCommemorativeDates && (
                <CommemorativeDatesSection
                  commemorativeDates={commemorativeDatesForCurrentMonth}
                  monthName={localizedMonthNames[displayedMonth]}
                  year={displayedYear}
                />
              )}

              {filterOptions.showSaintDays && (
                <SaintDaysSection
                  saintDays={saintDaysForCurrentMonth}
                  monthName={localizedMonthNames[displayedMonth]}
                  year={displayedYear}
                />
              )}
            </div>
          )}

          {viewMode === ViewMode.YEARLY && (
            <div>
              <h1 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-neutral-100">
                Calendário Interativo <span className="text-rose-500 dark:text-sky-400">{displayedYear}</span>
              </h1>
              <div className="flex justify-center items-center mb-10 space-x-4">
                <button
                  onClick={() => setDisplayedYear(y => y - 1)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 text-rose-500 dark:text-rose-400"
                  aria-label={`Ano anterior, ${displayedYear - 1}`}
                >
                  <ChevronLeftIcon className="w-7 h-7" />
                </button>
                <button
                  onClick={() => setDisplayedYear(today.getFullYear())}
                  className={`px-4 py-2 text-sm font-medium rounded-md 
                                ${theme === Theme.DARK ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  aria-label="Ir para o ano atual"
                >
                  Ano Atual
                </button>
                <button
                  onClick={() => setDisplayedYear(y => y + 1)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 text-rose-500 dark:text-rose-400"
                  aria-label={`Próximo ano, ${displayedYear + 1}`}
                >
                  <ChevronRightIcon className="w-7 h-7" />
                </button>
              </div>
              {[displayedYear].map(year => (
                <section key={year} className="mb-16">
                  <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700 dark:text-neutral-200">
                    {year}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {localizedMonthNames.map((monthName, monthIdx) => (
                      <div key={`${year}-${monthIdx}`} className="bg-white dark:bg-neutral-800 p-3 shadow-lg rounded-lg hover:shadow-xl transition-shadow">
                        <h3 className="text-md font-semibold text-center mb-3 text-rose-500 dark:text-sky-400">
                          {monthName}
                        </h3>
                        <CalendarGrid
                          year={year}
                          monthIndex={monthIdx}
                          selectedDate={selectedDate}
                          onDateSelect={(date) => {
                            handleDateSelect(date);
                            setViewMode(ViewMode.MONTHLY);
                          }}
                          eventsByDate={eventsByDate} // This needs to be calculated per month for yearly view
                          holidaysByDate={holidaysByDate} // This also needs to be calculated per month for yearly view
                          localizedDayAbbreviations={localizedDayAbbreviations}
                          localizedDayFullNames={localizedDayFullNames}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <CreateActivityModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSave={handleSaveActivity}
          selectedDate={selectedDate}
          currentTheme={theme}
          activityToEdit={activityToEdit}
        />
        <ConfirmDeleteModal
          isOpen={isConfirmDeleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDeleteActivity}
          theme={theme}
          itemName={"atividade"}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={handleCloseSettingsModal}
          onSave={handleSaveSettings}
          currentTheme={theme}
          currentUsername={username}
          categoryName={currentSettingsCategory}
        />
      </main>
    </div>
  );
};

export default App;
