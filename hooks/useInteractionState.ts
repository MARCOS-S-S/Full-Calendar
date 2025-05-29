import { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, Activity, CalendarFilterOptions } from '../constants';

export const useInteractionState = () => {
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
            if (!localStorage.getItem('calendarTheme')) { // Only apply if user hasn't set a theme manually
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

    const handleFilterChange = (option: keyof CalendarFilterOptions) => {
        setFilterOptions(prev => ({ ...prev, [option]: !prev[option] }));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(prevIsOpen => !prevIsOpen);
    };

    const handleOpenCreateModal = (activity?: Activity | null) => {
        setActivityToEdit(activity || null);
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setActivityToEdit(null);
    };

    const handleEditActivity = (activity: Activity, allActivities: Activity[]) => {
        const originalId = activity.id.includes('-recur-') ? activity.id.split('-recur-')[0] : activity.id;
        const baseActivity = allActivities.find(act => act.id === originalId);

        if (baseActivity) {
            setActivityToEdit({
                ...baseActivity,
                date: activity.date, // Use the instance's date for the form
                id: baseActivity.id, // Keep original ID for saving logic
            });
        } else {
            setActivityToEdit(activity); // Fallback, should ideally always find baseActivity
        }
        setIsCreateModalOpen(true);
    };


    const handleDeleteActivityRequest = (activityId: string) => {
        const originalId = activityId.includes('-recur-') ? activityId.split('-recur-')[0] : activityId;
        setActivityIdToDelete(originalId);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleCancelDelete = () => {
        setIsConfirmDeleteModalOpen(false);
        setActivityIdToDelete(null);
    };

    const handleOpenSettingsModal = (category: string) => {
        setCurrentSettingsCategory(category);
        setIsSettingsModalOpen(true);
        setIsSidebarOpen(false); // Close sidebar when opening settings
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

    return {
        isSidebarOpen,
        sidebarRef,
        sidebarToggleRef,
        toggleSidebar,
        theme,
        handleThemeChange,
        username,
        filterOptions,
        handleFilterChange,
        isCreateModalOpen,
        activityToEdit,
        handleOpenCreateModal,
        handleCloseCreateModal,
        handleEditActivity,
        isConfirmDeleteModalOpen,
        activityIdToDelete,
        handleDeleteActivityRequest,
        handleCancelDelete,
        setActivityIdToDelete, // Expose for use in confirm delete
        setIsConfirmDeleteModalOpen, // Expose for use in confirm delete
        isSettingsModalOpen,
        currentSettingsCategory,
        handleOpenSettingsModal,
        handleCloseSettingsModal,
        handleSaveSettings,
    };
};
