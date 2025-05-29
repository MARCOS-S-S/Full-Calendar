
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ViewMode, Activity, HolidayType, Theme, // Added Theme
  MONTH_NAMES_PT, DAY_ABBREVIATIONS_PT, DAY_NAMES_PT
} from './constants';
import { MenuIcon, CloseIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from './components/icons'; // PlusIcon might be needed if Add button remains visible
import { useInteractionState } from './hooks/useInteractionState';
import { useCalendarData } from './hooks/useCalendarData';

// EventDateInfo and CalendarFilterOptions are now managed or utilized within the hooks or passed directly.
// If EventDateInfo is only used by CalendarGrid, it can be defined there or imported from useCalendarData if exposed.


const App = (): JSX.Element => {
  const localizedMonthNames = MONTH_NAMES_PT;
  const localizedDayAbbreviations = DAY_ABBREVIATIONS_PT;
  const localizedDayFullNames = DAY_NAMES_PT;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Core Navigation State - remains in App.tsx
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MONTHLY);
  const [displayedYear, setDisplayedYear] = useState<number>(today.getFullYear());
  const [displayedMonth, setDisplayedMonth] = useState<number>(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const {
    isSidebarOpen, sidebarRef, sidebarToggleRef, toggleSidebar,
    theme, handleThemeChange, username,
    filterOptions, handleFilterChange,
    isCreateModalOpen, activityToEdit, handleOpenCreateModal, handleCloseCreateModal, handleEditActivity,
    isConfirmDeleteModalOpen, activityIdToDelete, handleDeleteActivityRequest, handleCancelDelete,
    setActivityIdToDelete, setIsConfirmDeleteModalOpen, // For confirm delete logic
    isSettingsModalOpen, currentSettingsCategory, handleOpenSettingsModal, handleCloseSettingsModal, handleSaveSettings
  } = useInteractionState();

  const {
    activities, setActivities,
    // nationalHolidays, commemorativeDates, saintDays, // Not directly used in App.tsx render, managed by useCalendarData
    eventsByDate, holidaysByDate,
    holidaysForCurrentMonth, commemorativeDatesForCurrentMonth, saintDaysForCurrentMonth,
    activitiesForSelectedDateView
  } = useCalendarData(displayedYear, displayedMonth, selectedDate, filterOptions);


  // Navigation Handlers - remain in App.tsx or could be moved to a useCalendarNavigation hook
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
      handleOpenCreateModal(); // Opens modal with null activityToEdit for new entry
    } else {
      setSelectedDate(date);
      if (date.getFullYear() !== displayedYear || date.getMonth() !== displayedMonth) {
        setDisplayedYear(date.getFullYear());
        setDisplayedMonth(date.getMonth());
      }
    }
  };

  // Activity CRUD operations - adapt to use setters from hooks
  const handleSaveActivity = (activityData: Omit<Activity, 'id'> & { id?: string }) => {
    if (activityData.id && !activityData.id.startsWith('temp-')) {
      setActivities(prevActivities =>
        prevActivities.map(act => act.id === activityData.id ? { ...act, ...activityData } as Activity : act)
          .sort((a, b) => { // Keep sorting logic
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
    handleCloseCreateModal();
  };

  const handleConfirmDeleteActivity = () => {
    if (activityIdToDelete) {
      setActivities(prevActivities => prevActivities.filter(act => act.id !== activityIdToDelete));
    }
    setIsConfirmDeleteModalOpen(false);
    setActivityIdToDelete(null);
  };

  const memoizedEditActivityHandler = useCallback((activity: Activity) => {
    handleEditActivity(activity, activities);
  }, [activities, handleEditActivity]);


  return (
    <div className={`flex h-full font-sans antialiased overflow-hidden ${theme === Theme.DARK ? 'dark' : ''}`}>
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
          onViewModeChange={(mode) => { setViewMode(mode); toggleSidebar(); }} // Close sidebar on mode change
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          onOpenSettingsModal={handleOpenSettingsModal}
          onRequestClose={toggleSidebar}
        />
      </div>

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
        <div
          className="flex justify-between items-center w-full px-3 sm:px-4 lg:px-6 mb-6"
          style={{
            paddingTop: `calc(env(safe-area-inset-top, 0px) + 0.75rem)`,
          }}
        >
          <div className="flex-grow min-w-0 pr-4">
            {username && (
              <WelcomeHeader
                username={username}
                theme={theme}
              />
            )}
          </div>
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

        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8`}>
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
                onAddActivity={() => handleOpenCreateModal(null)}
                onEditActivity={memoizedEditActivityHandler}
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
                  onClick={() => {
                    const currentActualDate = new Date();
                    setDisplayedYear(currentActualDate.getFullYear());
                    setDisplayedMonth(currentActualDate.getMonth());
                    setSelectedDate(currentActualDate);
                  }}
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
              {/* For yearly view, eventsByDate and holidaysByDate would ideally be calculated dynamically per month
                  or the CalendarGrid component would need to be adapted to fetch/calculate this for its specific month.
                  For simplicity, we pass the currently calculated ones, which might not be accurate for all months in yearly view
                  unless displayedYear is the one they are calculated for.
                  A more robust solution would involve recalculating these within the map or enhancing useCalendarData.
              */}
              {[displayedYear].map(year => ( // This only shows one year, the current displayedYear
                <section key={year} className="mb-16">
                  <h2 className="text-2xl font-semibold text-center mb-8 text-gray-700 dark:text-neutral-200">
                    {year}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                            setSelectedDate(date);
                            setDisplayedYear(date.getFullYear());
                            setDisplayedMonth(date.getMonth());
                            setViewMode(ViewMode.MONTHLY); // Switch to monthly view on date select from yearly
                          }}
                          // These props will be for the *currently displayed month in App.tsx*, not for each month in the year view.
                          // This is a simplification. For accurate dots in yearly view, this data needs to be specific to each month grid.
                          eventsByDate={eventsByDate}
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
          selectedDate={selectedDate || today} // Fallback selectedDate to today if null
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
