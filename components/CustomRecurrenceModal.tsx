
import React, { useState, useEffect } from 'react';
import { Theme, FrequencyUnit, CustomRecurrenceValues, CUSTOM_RECURRENCE_DAY_ABBREVS_PT, CUSTOM_RECURRENCE_DAY_CODES } from '../constants';
import { ChevronLeftIcon } from './icons'; // Assuming CloseIcon might be better as BackIcon

interface CustomRecurrenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rruleString: string) => void;
    currentTheme: Theme;
    initialActivityDate: string; // YYYY-MM-DD, used to pre-select day for weekly recurrence
    currentRRuleString?: string; // Existing RRULE string if editing
}

const frequencyUnitsPt: { value: FrequencyUnit; label: string }[] = [
    { value: 'day', label: 'dia(s)' },
    { value: 'week', label: 'semana(s)' },
    { value: 'month', label: 'mês(es)' },
    { value: 'year', label: 'ano(s)' },
];

// Helper to get default day for weekly recurrence
const getDefaultDayForWeekly = (startDate: string): string[] => {
    const date = new Date(startDate + 'T00:00:00'); // Ensure local time interpretation
    const dayIndex = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    return [CUSTOM_RECURRENCE_DAY_CODES[dayIndex]];
};


const CustomRecurrenceModal: React.FC<CustomRecurrenceModalProps> = ({
    isOpen,
    onClose,
    onSave,
    currentTheme,
    initialActivityDate,
    currentRRuleString,
}) => {
    const [interval, setInterval] = useState(1);
    const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>('week');
    const [daysOfWeek, setDaysOfWeek] = useState<string[]>(getDefaultDayForWeekly(initialActivityDate)); // SU, MO, etc.
    const [endsOn, setEndsOn] = useState<'never' | 'date' | 'occurrences'>('never');
    const [endDate, setEndDate] = useState(''); // YYYY-MM-DD
    const [occurrences, setOccurrences] = useState(1);

    const [intervalError, setIntervalError] = useState<string | null>(null);
    const [occurrencesError, setOccurrencesError] = useState<string | null>(null);
    const [endDateError, setEndDateError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset errors
            setIntervalError(null);
            setOccurrencesError(null);
            setEndDateError(null);

            if (currentRRuleString) {
                const parts = currentRRuleString.split(';');
                let freq: FrequencyUnit = 'week'; // Default if FREQ is missing or invalid
                let intVal = 1;
                let bydayVal: string[] = [];
                let endConditionVal: 'never' | 'date' | 'occurrences' = 'never';
                let untilDateVal = '';
                let countNumVal = 1;

                parts.forEach(part => {
                    const [key, valStr] = part.split('=', 2);
                    const value = valStr === undefined ? "" : valStr; // Ensure value is a string

                    switch (key) {
                        case 'FREQ':
                            if (value === 'DAILY') freq = 'day';
                            else if (value === 'WEEKLY') freq = 'week';
                            else if (value === 'MONTHLY') freq = 'month';
                            else if (value === 'YEARLY') freq = 'year';
                            break;
                        case 'INTERVAL':
                            const parsedInterval = parseInt(value, 10);
                            if (!isNaN(parsedInterval) && parsedInterval > 0) {
                                intVal = parsedInterval;
                            }
                            break;
                        case 'BYDAY':
                            if (value) {
                                bydayVal = value.split(',').filter(d => CUSTOM_RECURRENCE_DAY_CODES.includes(d));
                            } else {
                                bydayVal = [];
                            }
                            break;
                        case 'UNTIL':
                            endConditionVal = 'date'; // Mark that an UNTIL rule exists
                            // Check for YYYYMMDDTHHMMSSZ format
                            if (value && value.length >= 8 && /^\d{8}T\d{6}Z$/.test(value)) {
                                untilDateVal = `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`;
                            } else {
                                untilDateVal = ""; // Invalid or empty UNTIL value
                            }
                            break;
                        case 'COUNT':
                            endConditionVal = 'occurrences'; // Mark that a COUNT rule exists
                            const parsedCount = parseInt(value, 10);
                            if (!isNaN(parsedCount) && parsedCount > 0) {
                                countNumVal = parsedCount;
                            }
                            break;
                    }
                });
                setFrequencyUnit(freq);
                setInterval(intVal);
                setDaysOfWeek(bydayVal.length > 0 ? bydayVal : getDefaultDayForWeekly(initialActivityDate));
                setEndsOn(endConditionVal);

                if (endConditionVal === 'date') {
                    setEndDate(untilDateVal);
                } else if (endConditionVal === 'occurrences') {
                    setOccurrences(countNumVal);
                }
                // If endConditionVal remained 'never', fields are not set from it.
            } else {
                // Set defaults for new custom rule
                setInterval(1);
                setFrequencyUnit('week');
                setDaysOfWeek(getDefaultDayForWeekly(initialActivityDate));
                setEndsOn('never');
                const today = new Date(initialActivityDate + 'T00:00:00');
                today.setDate(today.getDate() + 7); // Default end date a week later for 'On' option
                setEndDate(today.toISOString().split('T')[0]);
                setOccurrences(1);
            }
        }
    }, [isOpen, currentRRuleString, initialActivityDate]);

    const toggleDayOfWeek = (dayCode: string) => {
        setDaysOfWeek(prev =>
            prev.includes(dayCode) ? prev.filter(d => d !== dayCode) : [...prev, dayCode]
        );
    };

    const validateInputs = (): boolean => {
        let isValid = true;
        if (interval <= 0) {
            setIntervalError("O intervalo deve ser maior que zero.");
            isValid = false;
        } else {
            setIntervalError(null);
        }

        if (endsOn === 'occurrences' && occurrences <= 0) {
            setOccurrencesError("O número de ocorrências deve ser maior que zero.");
            isValid = false;
        } else {
            setOccurrencesError(null);
        }

        if (endsOn === 'date' && !endDate) {
            setEndDateError("Por favor, selecione uma data final.");
            isValid = false;
        } else if (endsOn === 'date' && new Date(endDate + "T23:59:59") < new Date(initialActivityDate + "T00:00:00")) { // Compare end of endDate with start of initialActivityDate
            setEndDateError("A data final não pode ser anterior à data de início da atividade.");
            isValid = false;
        }
        else {
            setEndDateError(null);
        }
        return isValid;
    };

    const handleSave = () => {
        if (!validateInputs()) return;
        if (frequencyUnit === 'week' && daysOfWeek.length === 0) {
            alert("Para repetição semanal, por favor selecione pelo menos um dia da semana.");
            return;
        }

        let rrule = `FREQ=`;
        if (frequencyUnit === 'day') rrule += 'DAILY';
        else if (frequencyUnit === 'week') rrule += 'WEEKLY';
        else if (frequencyUnit === 'month') rrule += 'MONTHLY';
        else if (frequencyUnit === 'year') rrule += 'YEARLY';

        rrule += `;INTERVAL=${interval}`;

        if (frequencyUnit === 'week' && daysOfWeek.length > 0) {
            rrule += `;BYDAY=${daysOfWeek.join(',')}`;
        }

        if (endsOn === 'date' && endDate) {
            const dateObj = new Date(endDate + 'T00:00:00');
            const utcEndDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999));
            rrule += `;UNTIL=${utcEndDate.toISOString().replace(/[-:]|\.\d{3}/g, '')}`;
        } else if (endsOn === 'occurrences' && occurrences > 0) {
            rrule += `;COUNT=${occurrences}`;
        }
        onSave(rrule);
    };

    const baseInputClass = `p-2 border rounded-md text-sm w-full ${currentTheme === Theme.DARK ? 'bg-neutral-700 border-neutral-600 text-white focus:ring-sky-500 focus:border-sky-500' : 'bg-white border-gray-300 text-black focus:ring-rose-500 focus:border-rose-500'}`;
    const errorTextClass = currentTheme === Theme.DARK ? 'text-red-400' : 'text-red-600';

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[60] ${currentTheme === Theme.DARK ? 'bg-black text-white' : 'bg-slate-50 text-black'} max-h-screen`}
            role="dialog" aria-modal="true" aria-labelledby="custom-recurrence-title">
            <div className="flex flex-col h-full" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.0rem)' }}>
                <header className={`flex items-center justify-between p-3 border-b ${currentTheme === Theme.DARK ? 'border-neutral-700' : 'border-gray-200'} flex-shrink-0`}>
                    <button onClick={onClose} className={`p-2 rounded-full ${currentTheme === Theme.DARK ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'}`} aria-label="Voltar">
                        <ChevronLeftIcon className={`w-6 h-6 ${currentTheme === Theme.DARK ? 'text-neutral-300' : 'text-gray-600'}`} />
                    </button>
                    <h2 id="custom-recurrence-title" className="text-xl font-semibold">Repetir Personalizado</h2>
                    <button onClick={handleSave} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${currentTheme === Theme.DARK ? 'bg-sky-600 text-white hover:bg-sky-500' : 'bg-rose-500 text-white hover:bg-rose-600'}`}>
                        Concluir
                    </button>
                </header>

                <main className="flex-grow p-4 space-y-6 overflow-y-auto">
                    {/* Repete a cada */}
                    <section>
                        <label className="block text-sm font-medium mb-1">Repete a cada</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={interval}
                                onChange={e => { setInterval(Math.max(1, parseInt(e.target.value, 10) || 1)); setIntervalError(null); }}
                                min="1"
                                className={`${baseInputClass} w-20 text-center`}
                                aria-label="Intervalo de repetição"
                            />
                            <select value={frequencyUnit} onChange={e => setFrequencyUnit(e.target.value as FrequencyUnit)} className={`${baseInputClass} flex-1`} aria-label="Unidade de frequência">
                                {frequencyUnitsPt.map(unit => (
                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                ))}
                            </select>
                        </div>
                        {intervalError && <p className={`text-xs ${errorTextClass} mt-1`}>{intervalError}</p>}
                    </section>

                    {/* Repete em (para semanas) */}
                    {frequencyUnit === 'week' && (
                        <section>
                            <label className="block text-sm font-medium mb-2">Repete em</label>
                            <div className="flex justify-between space-x-1">
                                {CUSTOM_RECURRENCE_DAY_CODES.map((dayCode, index) => (
                                    <button
                                        key={dayCode}
                                        onClick={() => toggleDayOfWeek(dayCode)}
                                        className={`w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center border transition-colors
                                            ${daysOfWeek.includes(dayCode)
                                                ? (currentTheme === Theme.DARK ? 'bg-sky-500 border-sky-500 text-white' : 'bg-rose-500 border-rose-500 text-white')
                                                : (currentTheme === Theme.DARK ? 'bg-neutral-700 border-neutral-600 hover:bg-neutral-600' : 'bg-white border-gray-300 hover:bg-gray-100')
                                            }`}
                                        aria-pressed={daysOfWeek.includes(dayCode)}
                                        aria-label={CUSTOM_RECURRENCE_DAY_ABBREVS_PT[index]}
                                    >
                                        {CUSTOM_RECURRENCE_DAY_ABBREVS_PT[index]}
                                    </button>
                                ))}
                            </div>
                            {frequencyUnit === 'week' && daysOfWeek.length === 0 && <p className={`text-xs ${errorTextClass} mt-1`}>Selecione pelo menos um dia da semana.</p>}
                        </section>
                    )}

                    {/* Termina em */}
                    <section>
                        <label className="block text-sm font-medium mb-2">Termina em</label>
                        <div className="space-y-3">
                            {/* Nunca */}
                            <div className="flex items-center">
                                <input type="radio" id="endsNever" name="endsOn" value="never" checked={endsOn === 'never'} onChange={() => setEndsOn('never')} className="h-4 w-4 accent-rose-500 dark:accent-sky-500" />
                                <label htmlFor="endsNever" className="ml-2 text-sm">Nunca</label>
                            </div>
                            {/* Em data */}
                            <div className="flex items-center">
                                <input type="radio" id="endsOnDate" name="endsOn" value="date" checked={endsOn === 'date'} onChange={() => setEndsOn('date')} className="h-4 w-4 accent-rose-500 dark:accent-sky-500" />
                                <label htmlFor="endsOnDate" className="ml-2 text-sm mr-2">Em</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => { setEndDate(e.target.value); setEndDateError(null); }}
                                    disabled={endsOn !== 'date'}
                                    className={`${baseInputClass} flex-1 ${endsOn !== 'date' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    aria-label="Data final da repetição"
                                />
                            </div>
                            {endsOn === 'date' && endDateError && <p className={`text-xs ${errorTextClass} ml-6`}>{endDateError}</p>}


                            {/* Após ocorrências */}
                            <div className="flex items-center">
                                <input type="radio" id="endsAfterOccurrences" name="endsOn" value="occurrences" checked={endsOn === 'occurrences'} onChange={() => setEndsOn('occurrences')} className="h-4 w-4 accent-rose-500 dark:accent-sky-500" />
                                <label htmlFor="endsAfterOccurrences" className="ml-2 text-sm mr-2">Após</label>
                                <input
                                    type="number"
                                    value={occurrences}
                                    onChange={e => { setOccurrences(Math.max(1, parseInt(e.target.value, 10) || 1)); setOccurrencesError(null); }}
                                    min="1"
                                    disabled={endsOn !== 'occurrences'}
                                    className={`${baseInputClass} w-20 text-center ${endsOn !== 'occurrences' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    aria-label="Número de ocorrências"
                                />
                                <span className={`ml-2 text-sm ${endsOn !== 'occurrences' ? (currentTheme === Theme.DARK ? 'text-neutral-500' : 'text-gray-400') : ''}`}>ocorrência(s)</span>
                            </div>
                            {endsOn === 'occurrences' && occurrencesError && <p className={`text-xs ${errorTextClass} ml-6`}>{occurrencesError}</p>}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default CustomRecurrenceModal;
