
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import CalendarGrid from './components/MonthView';
import Sidebar from './components/Sidebar';
import CalendarNavHeader from './components/CalendarNavHeader';
import ActivitiesSection from './components/ActivitiesSection';
import HolidaysSection from './components/HolidaysSection';
import SaintDaysSection from './components/SaintDaysSection';
import CommemorativeDatesSection from './components/CommemorativeDatesSection'; // Import new component
import CreateActivityModal from './components/CreateActivityModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import SettingsModal from './components/SettingsModal';
import WelcomeHeader from './components/WelcomeHeader';
import {
    ViewMode, Theme, Activity, Holiday, MOCK_NATIONAL_HOLIDAYS_PT_BR, MOCK_ACTIVITIES, ActivityType, HolidayType,
    MONTH_NAMES_PT, DAY_ABBREVIATIONS_PT, DAY_NAMES_PT, MOCK_SAINT_DAYS_PT_BR, MOCK_COMMEMORATIVE_DATES_PT_BR
} from './constants';
import { MenuIcon, CloseIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from './components/icons';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export interface CalendarFilterOptions {
  showHolidays: boolean;
  showSaintDays: boolean;
  showCommemorativeDates: boolean;
  showEvents: boolean;
  showTasks: boolean;
}

// Initialize Gemini AI
let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    // Handle API key issue, e.g., by disabling API-dependent features or showing a message.
  }
} else {
  console.warn("API_KEY environment variable is not set. API-dependent features will be disabled.");
}


const App = (): JSX.Element => {
  const localizedMonthNames = MONTH_NAMES_PT;
  const localizedDayAbbreviations = DAY_ABBREVIATIONS_PT;
  const localizedDayFullNames = DAY_NAMES_PT;

  const today = new Date();
  today.setHours(0,0,0,0);

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

  const [nationalHolidays, setNationalHolidays] = useState<Holiday[]>(() => {
    const stored = localStorage.getItem('calendarNationalHolidays');
    // Ensure loaded data conforms to Holiday structure, especially the 'type'
    const parsed = stored ? JSON.parse(stored) : MOCK_NATIONAL_HOLIDAYS_PT_BR;
    return parsed.map((h: any) => ({ ...h, type: h.type || HolidayType.NATIONAL }));
  });
  const [commemorativeDates, setCommemorativeDates] = useState<Holiday[]>(() => {
    const stored = localStorage.getItem('calendarCommemorativeDates');
    // Ensure loaded data conforms to Holiday structure
    const parsed = stored ? JSON.parse(stored) : MOCK_COMMEMORATIVE_DATES_PT_BR;
    return parsed.map((cd: any) => ({ ...cd, type: cd.type || HolidayType.COMMEMORATIVE }));
  });
  const [saintDays, setSaintDays] = useState<Holiday[]>(MOCK_SAINT_DAYS_PT_BR);


  const [isLoadingNationalHolidays, setIsLoadingNationalHolidays] = useState<boolean>(false);
  const [isLoadingCommemorativeDates, setIsLoadingCommemorativeDates] = useState<boolean>(false);


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
    localStorage.setItem('calendarNationalHolidays', JSON.stringify(nationalHolidays));
  }, [nationalHolidays]);

  useEffect(() => {
    localStorage.setItem('calendarCommemorativeDates', JSON.stringify(commemorativeDates));
  }, [commemorativeDates]);

  const fetchYearSpecificData = useCallback(async (year: number, type: 'national' | 'commemorative') => {
    if (!ai) {
      console.warn(`Gemini AI not initialized. Cannot fetch ${type} data for ${year}.`);
      return;
    }

    const promptText = type === 'national'
      ? `Forneça uma lista dos feriados nacionais do Brasil para o ano ${year} no formato JSON: [{ "date": "YYYY-MM-DD", "name": "Nome do Feriado" }]. Inclua apenas feriados oficiais e pontos facultativos nacionais reconhecidos federalmente. Não inclua feriados estaduais, municipais ou datas comemorativas comuns que não sejam feriados.`
      : `Forneça uma lista das principais datas comemorativas do Brasil (não feriados) para o ano ${year} no formato JSON: [{ "date": "YYYY-MM-DD", "name": "Nome da Data Comemorativa" }]. Inclua datas como Dia das Mães, Dia dos Pais, Dia das Crianças, etc., mas exclua feriados nacionais. Ordene por data.`;

    try {
      if (type === 'national') setIsLoadingNationalHolidays(true);
      if (type === 'commemorative') setIsLoadingCommemorativeDates(true);

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: promptText,
        config: { responseMimeType: "application/json" },
      });
      
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const rawParsedData: { date: string; name: string; }[] = JSON.parse(jsonStr);
      
      if (Array.isArray(rawParsedData)) {
        const holidayTypeToAssign = type === 'national' ? HolidayType.NATIONAL : HolidayType.COMMEMORATIVE;
        const typedData: Holiday[] = rawParsedData.map(item => ({
          ...item,
          type: holidayTypeToAssign,
        }));

        if (type === 'national') {
          setNationalHolidays(prev => [...prev.filter(h => !h.date.startsWith(String(year))), ...typedData]);
        } else {
          setCommemorativeDates(prev => [...prev.filter(d => !d.date.startsWith(String(year))), ...typedData]);
        }
      } else {
        console.error(`API response for ${type} ${year} is not an array:`, rawParsedData);
      }

    } catch (error) {
      console.error(`Error fetching ${type} data for year ${year}:`, error);
      // Optionally set an error state here to inform the user
    } finally {
      if (type === 'national') setIsLoadingNationalHolidays(false);
      if (type === 'commemorative') setIsLoadingCommemorativeDates(false);
    }
  }, []);


  useEffect(() => {
    const yearStr = String(displayedYear);
    const nationalHolidaysExistForYear = nationalHolidays.some(h => h.date.startsWith(yearStr));
    const commemorativeDatesExistForYear = commemorativeDates.some(d => d.date.startsWith(yearStr));

    if (!nationalHolidaysExistForYear && !isLoadingNationalHolidays) {
      fetchYearSpecificData(displayedYear, 'national');
    }
    if (!commemorativeDatesExistForYear && !isLoadingCommemorativeDates) {
      fetchYearSpecificData(displayedYear, 'commemorative');
    }
  }, [displayedYear, nationalHolidays, commemorativeDates, fetchYearSpecificData, isLoadingNationalHolidays, isLoadingCommemorativeDates]);


  useEffect(() => {
    const htmlElement = document.documentElement;
    if (theme === Theme.DARK) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
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
    if (activityData.id) {
      setActivities(prevActivities =>
        prevActivities.map(act => act.id === activityData.id ? { ...act, ...activityData } as Activity : act)
        .sort((a,b) => {
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
      setActivities(prevActivities => [...prevActivities, newActivity].sort((a,b) => {
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
    setActivityToEdit(activity);
    setIsCreateModalOpen(true);
  };

  const handleDeleteActivityRequest = (activityId: string) => {
    setActivityIdToDelete(activityId);
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
    const mapping: Record<string, number> = {};
    activities.forEach(act => {
      const isVisibleEvent = filterOptions.showEvents && act.activityType === ActivityType.EVENT;
      const isVisibleTask = filterOptions.showTasks && act.activityType === ActivityType.TASK;
      const isVisibleBirthday = act.activityType === ActivityType.BIRTHDAY; // Birthdays always shown if activities are generally visible
      
      if (isVisibleEvent || isVisibleTask || isVisibleBirthday) {
        if (!mapping[act.date]) {
          mapping[act.date] = 0;
        }
        mapping[act.date]++;
      }
    });
    return mapping;
  }, [activities, filterOptions.showEvents, filterOptions.showTasks]);

  const holidaysByDate = useMemo(() => {
    const mapping: Record<string, Holiday> = {};
    const yearStr = String(displayedYear);

    // Apply Saint Days first (lowest priority)
    if (filterOptions.showSaintDays) {
      saintDays.forEach(sd => {
        const [saintMonthStr, saintDayStr] = sd.date.split('-'); // MM-DD format
        const dateStr = `${yearStr}-${saintMonthStr}-${saintDayStr}`;
        // Saint days from MOCK_SAINT_DAYS_PT_BR already have type: HolidayType.SAINT
        if (!mapping[dateStr]) { // Only add if no higher priority item has set this date
             mapping[dateStr] = { ...sd, date: dateStr }; // Ensure date is YYYY-MM-DD
        }
      });
    }
    
    // Apply Commemorative Dates (medium priority)
    if (filterOptions.showCommemorativeDates) {
      commemorativeDates.forEach(cd => {
        // Ensure it's for the current year and has the correct type
        if (cd.date.startsWith(yearStr) && cd.type === HolidayType.COMMEMORATIVE) {
          // Overwrites Saint Day if present
          mapping[cd.date] = cd;
        }
      });
    }

    // Apply National Holidays (highest priority)
    if (filterOptions.showHolidays) {
      nationalHolidays.forEach(hol => {
        // Ensure it's for the current year and has the correct type
        if (hol.date.startsWith(yearStr) && hol.type === HolidayType.NATIONAL) {
          // Overwrites Commemorative or Saint Day if present
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
    }).sort((a,b) => {
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
        // Ensure it's a Saint Day type
        return sd.type === HolidayType.SAINT && (saintMonth - 1) === displayedMonth;
      })
      .map(sd => ({
        date: `${displayedYear}-${sd.date}`, 
        name: sd.name,
        type: HolidayType.SAINT, // Explicitly carry over the type
      }))
      .sort((a, b) => {
        const dayA = parseInt(a.date.split('-')[2], 10);
        const dayB = parseInt(b.date.split('-')[2], 10);
        return dayA - dayB;
      });
  }, [saintDays, displayedYear, displayedMonth, filterOptions.showSaintDays]);


  const mainContentActualPaddingTop = `pt-4`;


  return (
    <div className={`flex h-full font-sans antialiased overflow-hidden ${theme === Theme.DARK ? 'dark' : ''}`}>
      
      <button
        ref={sidebarToggleRef}
        onClick={toggleSidebar} 
        className={`fixed z-50 p-2 rounded-md h-10 w-10 items-center justify-center
                    ${theme === Theme.LIGHT ? 'text-rose-500 hover:bg-rose-50' : 'text-sky-400 hover:bg-sky-500/20'}
                    transition-all duration-300 ${isSidebarOpen ? 'hidden' : 'flex'}`}
        style={{
          top: `calc(env(safe-area-inset-top, 0px) + 0.75rem)`,
          right: `calc(env(safe-area-inset-right, 0px) + 0.75rem)`
        }}
        aria-label="Abrir menu lateral"
        aria-expanded={isSidebarOpen}
        aria-controls="sidebar"
        hidden={isSidebarOpen}
      >
        <MenuIcon className="w-6 h-6" />
      </button>

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

      <main
        className={`relative flex-grow transition-all duration-300 ease-in-out h-full overflow-y-auto 
                   ${isSidebarOpen ? 'blur-sm pointer-events-none' : ''}
                   ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'}`}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${mainContentActualPaddingTop} pb-8`}>
          {username && (
            <WelcomeHeader
              username={username}
              theme={theme}
              className="mb-6" 
            />
          )}

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
                  eventsByDate={eventsByDate} // Pass count of events
                  holidaysByDate={holidaysByDate} 
                  localizedDayAbbreviations={localizedDayAbbreviations}
                  localizedDayFullNames={localizedDayFullNames}
                />
              </div>

              <ActivitiesSection
                selectedDate={selectedDate}
                activities={activities.filter(act => {
                  if (act.activityType === ActivityType.EVENT && !filterOptions.showEvents) return false;
                  if (act.activityType === ActivityType.TASK && !filterOptions.showTasks) return false;
                  // Birthdays are always shown if activities are generally visible, filtering is handled in eventsByDate
                  return true; 
                })}
                onAddActivity={handleOpenCreateModal}
                onEditActivity={handleEditActivity}
                onDeleteActivityRequest={handleDeleteActivityRequest}
              />

              {filterOptions.showHolidays && (
                  <HolidaysSection
                    holidays={holidaysForCurrentMonth}
                    monthName={localizedMonthNames[displayedMonth]}
                    year={displayedYear}
                    isLoading={isLoadingNationalHolidays && nationalHolidays.filter(h => h.date.startsWith(String(displayedYear)) && new Date(h.date + 'T00:00:00').getMonth() === displayedMonth).length === 0}
                  />
              )}
              
              {filterOptions.showCommemorativeDates && (
                <CommemorativeDatesSection
                  commemorativeDates={commemorativeDatesForCurrentMonth}
                  monthName={localizedMonthNames[displayedMonth]}
                  year={displayedYear}
                  isLoading={isLoadingCommemorativeDates && commemorativeDates.filter(cd => cd.date.startsWith(String(displayedYear)) && new Date(cd.date + 'T00:00:00').getMonth() === displayedMonth).length === 0}
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
                      aria-label={`Ano anterior, ${displayedYear -1}`}
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
                          eventsByDate={eventsByDate} // Pass count of events
                          holidaysByDate={holidaysByDate}
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
