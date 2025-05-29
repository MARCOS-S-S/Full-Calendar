
import { useState, useEffect, useMemo } from 'react';
import {
    Activity, Holiday, MOCK_NATIONAL_HOLIDAYS_PT_BR, MOCK_ACTIVITIES, ActivityType, HolidayType,
    RecurrenceOption, CalendarFilterOptions, MONTH_NAMES_PT, CUSTOM_RECURRENCE_DAY_CODES,
    MOCK_COMMEMORATIVE_DATES_PT_BR, MOCK_SAINT_DAYS_PT_BR // Added imports
} from '../constants';
import { parseRruleString } from '../utils/rruleUtils'; // Ensure this path is correct

export interface EventDateInfo {
    colors: string[];
    count: number;
}

export const useCalendarData = (
    displayedYear: number,
    displayedMonth: number,
    selectedDate: Date | null,
    filterOptions: CalendarFilterOptions
) => {
    const [activities, setActivities] = useState<Activity[]>(() => {
        const storedActivities = localStorage.getItem('calendarActivities');
        return storedActivities ? JSON.parse(storedActivities) : MOCK_ACTIVITIES;
    });

    const [nationalHolidays, setNationalHolidays] = useState<Holiday[]>(MOCK_NATIONAL_HOLIDAYS_PT_BR);
    const [commemorativeDates, setCommemorativeDates] = useState<Holiday[]>(() => {
        // For MOCK_COMMEMORATIVE_DATES_PT_BR, ensure dates are for the current year or a wide range
        // This logic is simplified; a real app might fetch or generate these dynamically
        return MOCK_COMMEMORATIVE_DATES_PT_BR;
    });
    const [saintDays, setSaintDays] = useState<Holiday[]>(MOCK_SAINT_DAYS_PT_BR);

    useEffect(() => {
        localStorage.setItem('calendarActivities', JSON.stringify(activities));
    }, [activities]);

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
            const isVisibleBirthday = activity.activityType === ActivityType.BIRTHDAY; // Birthdays are always shown if activities are shown

            if (!isVisibleEvent && !isVisibleTask && !isVisibleBirthday) {
                return;
            }

            if (!mapping[dateStr]) {
                mapping[dateStr] = { colors: [], count: 0 };
            }
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
            if (!parsedRule) return; // If rule is simple and handled by direct match or unparseable custom

            let currentDateForIteration = new Date(originalActivityDate);
            let occurrencesGenerated = 0; // Counts main iteration steps, not BYDAY expansions
            const maxOccurrencesFromRule = parsedRule.count;
            const maxIterationLimit = 700;
            let iterationCount = 0;

            while (iterationCount < maxIterationLimit) {
                iterationCount++;

                if (parsedRule.until && currentDateForIteration.getTime() > parsedRule.until.getTime()) break;
                // Optimization: if current iteration date is far beyond the view and no UNTIL, break.
                if (!parsedRule.until && currentDateForIteration.getFullYear() > viewEndDate.getFullYear() + 1 && !parsedRule.count) break;


                if (parsedRule.freq === 'WEEKLY' && parsedRule.byday && parsedRule.byday.length > 0) {
                    const ruleDaysJs = parsedRule.byday.map(d => rruleDayToJsDay[d]).sort((a, b) => a - b);
                    const currentIterDayOfWeek = currentDateForIteration.getDay();

                    for (const targetDayJs of ruleDaysJs) {
                        let potentialDate = new Date(currentDateForIteration);
                        potentialDate.setDate(potentialDate.getDate() + (targetDayJs - currentIterDayOfWeek));
                        potentialDate.setHours(originalActivityDate.getHours(), originalActivityDate.getMinutes(), originalActivityDate.getSeconds(), originalActivityDate.getMilliseconds());

                        if (potentialDate.getTime() < originalActivityDate.getTime()) continue; // Don't go before original start
                        if (parsedRule.until && potentialDate.getTime() > parsedRule.until.getTime()) continue;

                        // Crucial check for COUNT: only add if we haven't exceeded the count from *main* iterations
                        if (maxOccurrencesFromRule && occurrencesGenerated >= maxOccurrencesFromRule && potentialDate.getTime() > currentDateForIteration.getTime()) {
                            // If we are over the main count, only allow byday instances that fall on the *current* main iteration date
                            // or if the byday processing is for the *last valid* main iteration step.
                            // This logic can be tricky. Simplification: if count is met, we largely stop generating *new* byday instances from this point.
                            if (occurrencesGenerated >= maxOccurrencesFromRule) continue;
                        }


                        if (potentialDate >= viewStartDate && potentialDate <= viewEndDate) {
                            // Add if it's not the original date (already added), or if it IS the original date but part of a multi-day BYDAY rule
                            if (potentialDate.getTime() !== originalActivityDate.getTime() || (parsedRule.byday && parsedRule.byday.length > 1 && parsedRule.byday.includes(CUSTOM_RECURRENCE_DAY_CODES[originalActivityDate.getDay()]))) {
                                addActivityToMapping(act, new Date(potentialDate));
                            } else if (potentialDate.getTime() === originalActivityDate.getTime() && !(originalActivityDate >= viewStartDate && originalActivityDate <= viewEndDate)) {
                                // Original was out of view, but its BYDAY instance (which is the same date) IS in view
                                addActivityToMapping(act, new Date(potentialDate));
                            }
                        }
                    }
                } else { // DAILY, MONTHLY, YEARLY, or WEEKLY without BYDAY
                    if (currentDateForIteration.getTime() >= originalActivityDate.getTime()) {
                        if (currentDateForIteration >= viewStartDate && currentDateForIteration <= viewEndDate) {
                            if (currentDateForIteration.getTime() !== originalActivityDate.getTime() || !(originalActivityDate >= viewStartDate && originalActivityDate <= viewEndDate)) {
                                addActivityToMapping(act, new Date(currentDateForIteration));
                            }
                        }
                    }
                }

                // Increment occurrencesGenerated *after* processing the current main iteration step (currentDateForIteration).
                // This means if COUNT=1, only the original or its BYDAY variants are shown.
                if (currentDateForIteration.getTime() >= originalActivityDate.getTime()) {
                    occurrencesGenerated++;
                    if (maxOccurrencesFromRule && occurrencesGenerated >= maxOccurrencesFromRule) break;
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
                        const targetMonthLoop = tempAdvDate.getMonth();
                        tempAdvDate.setDate(initialMonthlyDay);
                        if (tempAdvDate.getMonth() !== targetMonthLoop) {
                            // Landed in a different month (e.g. Feb 30 -> Mar 2), so go to last day of intended month
                            tempAdvDate.setDate(0); // Last day of previous month (which is our target month)
                        }
                        break;
                    case 'YEARLY':
                        const initialYearlyMonth = originalActivityDate.getMonth();
                        const initialYearlyDay = originalActivityDate.getDate();
                        tempAdvDate.setDate(1);
                        tempAdvDate.setMonth(initialYearlyMonth);
                        tempAdvDate.setFullYear(tempAdvDate.getFullYear() + interval);
                        const targetYearMonthLoop = tempAdvDate.getMonth(); // Should be the same as initialYearlyMonth
                        tempAdvDate.setDate(initialYearlyDay);
                        if (tempAdvDate.getMonth() !== targetYearMonthLoop) {
                            tempAdvDate.setDate(0); // Correct for leap year differences or month length
                        }
                        break;
                    default: advanced = false; break;
                }

                if (!advanced || tempAdvDate.getTime() <= currentDateForIteration.getTime()) break;
                currentDateForIteration = new Date(tempAdvDate);
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
                if (!mapping[dateStr]) { // Prioritize National/Commemorative if they overlap
                    mapping[dateStr] = { ...sd, date: dateStr, type: HolidayType.SAINT };
                }
            });
        }

        if (filterOptions.showCommemorativeDates) {
            commemorativeDates.forEach(cd => {
                if (cd.date.startsWith(yearStr) && cd.type === HolidayType.COMMEMORATIVE) {
                    mapping[cd.date] = cd; // Commemorative can overwrite Saint Day
                }
            });
        }

        if (filterOptions.showHolidays) {
            nationalHolidays.forEach(hol => {
                if (hol.date.startsWith(yearStr) && hol.type === HolidayType.NATIONAL) {
                    mapping[hol.date] = hol; // National holidays have highest priority
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
                date: `${displayedYear}-${sd.date}`, // Ensure YYYY-MM-DD format
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
        const rruleDayToJsDay: { [key: string]: number } = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };


        const addActivityInstanceToList = (activity: Activity, instanceDateString: string, isRecurrence: boolean) => {
            if (activity.activityType === ActivityType.EVENT && !filterOptions.showEvents) return;
            if (activity.activityType === ActivityType.TASK && !filterOptions.showTasks) return;

            // Ensure unique ID for recurring instances on the same day if multiple BYDAY rules match
            const instanceId = isRecurrence ? `${activity.id}-recur-${instanceDateString}-${Date.now()}-${Math.random()}` : activity.id;

            // Avoid adding exact duplicate entries (e.g., from BYDAY matching original and also the original being added)
            if (activitiesOccurringOnSelectedDate.some(a => a.id === activity.id && a.date === instanceDateString && !isRecurrence)) { // If original already added
                if (isRecurrence && activity.recurrenceRule && parseRruleString(activity.recurrenceRule)?.byday?.length) {
                    // If this is a BYDAY recurrence of the original, on the same day, let it through
                    // but it needs a unique ID to differentiate if displayed.
                    // The `instanceId` logic above should handle this.
                } else {
                    return;
                }
            }
            // Check if an instance from this specific activity (even if different recurrence of it) is already added for the day
            if (activitiesOccurringOnSelectedDate.some(a => a.id.startsWith(`${activity.id}-recur-${instanceDateString}`))) {
                // This is to prevent adding the same byday instance multiple times if logic re-evaluates.
                // However, different BYDAY rules for the same activity *should* list if they fall on the same day.
                // The unique instanceId should cover this.
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
                if (!parsedRule) return;

                let currentDateForIteration = new Date(originalActivityDateLocal);
                let occurrencesGenerated = 0;
                const maxOccurrencesFromRule = parsedRule.count;
                const maxIterationLimit = 700;
                let iterationCount = 0;

                while (iterationCount < maxIterationLimit) {
                    iterationCount++;

                    if (parsedRule.until && currentDateForIteration.getTime() > parsedRule.until.getTime()) break;

                    // Optimization for selected date view
                    let margin = 0;
                    if (parsedRule.freq === 'DAILY') margin = 2 * 24 * 60 * 60 * 1000; // Check a bit around the date
                    else if (parsedRule.freq === 'WEEKLY') margin = 8 * 24 * 60 * 60 * 1000;
                    else if (parsedRule.freq === 'MONTHLY') margin = 32 * 24 * 60 * 60 * 1000;
                    else if (parsedRule.freq === 'YEARLY') margin = 367 * 24 * 60 * 60 * 1000;
                    if (currentDateForIteration.getTime() > targetDateLocal.getTime() + margin && !parsedRule.count && !parsedRule.until) break;
                    if (currentDateForIteration.getTime() < targetDateLocal.getTime() - margin && !parsedRule.count && !parsedRule.until && parsedRule.freq !== 'WEEKLY') break; // Don't break too early for weekly due to BYDAY


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

                            if (maxOccurrencesFromRule && occurrencesGenerated >= maxOccurrencesFromRule && potentialDate.getTime() > currentDateForIteration.getTime()) continue;


                            if (potentialDate.toISOString().split('T')[0] === selectedDateString) {
                                // Add if it's not the original (already added non-recurrently)
                                // OR if it IS the original but its BYDAY rule explicitly includes this day
                                // (this ensures that if original non-recurring was filtered out, its valid BYDAY instance is shown)
                                if (potentialDate.getTime() !== originalActivityDateLocal.getTime() || act.date !== selectedDateString || (parsedRule.byday.includes(CUSTOM_RECURRENCE_DAY_CODES[originalActivityDateLocal.getDay()]))) {
                                    addActivityInstanceToList(act, selectedDateString, true);
                                    // No break here, allow multiple BYDAY matches on the same date to be listed if rules imply it.
                                    // foundOnThisIterationStep = true; // This might prevent multiple valid BYDAY entries on same selected day
                                }
                            }
                        }
                        if (currentDateForIteration.toISOString().split('T')[0] === selectedDateString && foundOnThisIterationStep) {
                            // if a BYDAY on this iteration's main date was the selected date, no need to check further main dates for *this* activity.
                            // break; // This might be too aggressive if a later main iteration step also lands on selectedDate
                        }

                    } else { // DAILY, MONTHLY, YEARLY, or WEEKLY without BYDAY
                        if (currentDateForIteration.getTime() >= originalActivityDateLocal.getTime()) {
                            if (currentDateForIteration.toISOString().split('T')[0] === selectedDateString) {
                                if (currentDateForIteration.getTime() !== originalActivityDateLocal.getTime() || act.date !== selectedDateString) {
                                    addActivityInstanceToList(act, selectedDateString, true);
                                    foundOnThisIterationStep = true;
                                }
                            }
                        }
                    }

                    // If selected date is found via non-BYDAY rule, and it's the current iteration date, we can stop for this activity.
                    if (foundOnThisIterationStep && currentDateForIteration.toISOString().split('T')[0] === selectedDateString) break;

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
                            const initialMonthlyDayList = originalActivityDateLocal.getDate();
                            tempAdvDate.setDate(1);
                            tempAdvDate.setMonth(tempAdvDate.getMonth() + interval);
                            const targetMonthMList = tempAdvDate.getMonth();
                            tempAdvDate.setDate(initialMonthlyDayList);
                            if (tempAdvDate.getMonth() !== targetMonthMList) {
                                tempAdvDate.setDate(0);
                            }
                            break;
                        case 'YEARLY':
                            const initialYearlyMonthList = originalActivityDateLocal.getMonth();
                            const initialYearlyDayList = originalActivityDateLocal.getDate();
                            tempAdvDate.setDate(1);
                            tempAdvDate.setMonth(initialYearlyMonthList);
                            tempAdvDate.setFullYear(tempAdvDate.getFullYear() + interval);
                            const targetYearMonthYList = tempAdvDate.getMonth();
                            tempAdvDate.setDate(initialYearlyDayList);
                            if (tempAdvDate.getMonth() !== targetYearMonthYList) {
                                tempAdvDate.setDate(0);
                            }
                            break;
                        default: advanced = false; break;
                    }
                    if (!advanced || tempAdvDate.getTime() <= currentDateForIteration.getTime()) break;
                    currentDateForIteration = new Date(tempAdvDate);
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
    }, [activities, selectedDate, filterOptions.showEvents, filterOptions.showTasks, displayedYear, displayedMonth]); // Added year/month for context

    return {
        activities,
        setActivities,
        nationalHolidays,
        setNationalHolidays,
        commemorativeDates,
        setCommemorativeDates,
        saintDays,
        setSaintDays,
        eventsByDate,
        holidaysByDate,
        holidaysForCurrentMonth,
        commemorativeDatesForCurrentMonth,
        saintDaysForCurrentMonth,
        activitiesForSelectedDateView,
    };
};
