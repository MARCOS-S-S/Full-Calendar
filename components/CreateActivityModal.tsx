
import React, { useState, useEffect, useRef } from 'react';
import { Activity, ActivityType, Theme, RecurrenceOption, RECURRENCE_OPTIONS_PT, CustomRecurrenceValues } from '../constants';
import { CloseIcon, ClockIcon, LocationMarkerIcon, BellIcon, DocumentTextIcon, SparklesIcon, ArrowPathIcon, GlobeAltIcon, UserGroupIcon, PaperClipIcon, ChevronLeftIcon } from './icons';
import CustomRecurrenceModal from './CustomRecurrenceModal'; // Import the new modal

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Omit<Activity, 'id'> & { id?: string }) => void;
  selectedDate: Date;
  currentTheme: Theme;
  activityToEdit?: Activity | null;
}

const activityTypeColors: Record<ActivityType, string> = {
  [ActivityType.EVENT]: 'bg-rose-500',
  [ActivityType.TASK]: 'bg-sky-500',
  [ActivityType.BIRTHDAY]: 'bg-amber-500',
};

const colorOptions = [
  { name: 'Rosa', value: 'bg-rose-500' },
  { name: 'Céu', value: 'bg-sky-500' },
  { name: 'Verde-azulado', value: 'bg-teal-500' },
  { name: 'Âmbar', value: 'bg-amber-500' },
  { name: 'Roxo', value: 'bg-purple-500' },
  { name: 'Verde', value: 'bg-green-500' },
];

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTimeForInput = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const isCustomRRule = (rule?: string): boolean => {
  return !!rule && rule.startsWith('FREQ=');
};


const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  currentTheme,
  activityToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<ActivityType>(ActivityType.EVENT);
  const [isAllDay, setIsAllDay] = useState(true);

  const [startDate, setStartDate] = useState(formatDateForInput(selectedDate));
  const [startTime, setStartTime] = useState(formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 1, 0, 0, 0))));

  const [endDate, setEndDate] = useState(formatDateForInput(selectedDate));
  const [endTime, setEndTime] = useState(formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 2, 0, 0, 0))));

  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [categoryColor, setCategoryColor] = useState<string>(activityTypeColors[ActivityType.EVENT]);
  const [userHasPickedColor, setUserHasPickedColor] = useState<boolean>(false);

  const [recurrenceRule, setRecurrenceRule] = useState<string>(RecurrenceOption.NONE);
  const [isRecurrencePickerOpen, setIsRecurrencePickerOpen] = useState(false);
  const recurrencePickerRef = useRef<HTMLDivElement>(null);
  const recurrenceButtonRef = useRef<HTMLButtonElement>(null);

  const [isCustomRecurrenceModalOpen, setIsCustomRecurrenceModalOpen] = useState(false);


  useEffect(() => {
    if (isOpen) {
      setTitleError(null);
      if (activityToEdit) {
        setTitle(activityToEdit.title);
        setActivityType(activityToEdit.activityType);
        setIsAllDay(activityToEdit.isAllDay);
        setStartDate(activityToEdit.date); // This is the instance date for editing
        setStartTime(activityToEdit.startTime || formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 1, 0, 0, 0))));

        const parsedStartDate = new Date(activityToEdit.date + 'T' + (activityToEdit.startTime || '00:00'));
        setEndDate(activityToEdit.isAllDay ? activityToEdit.date : (activityToEdit.endTime ? activityToEdit.date : formatDateForInput(new Date(parsedStartDate.getTime() + 60 * 60 * 1000))));
        setEndTime(activityToEdit.isAllDay ? formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 2, 0, 0, 0))) : (activityToEdit.endTime || formatTimeForInput(new Date(parsedStartDate.getTime() + 60 * 60 * 1000))));

        setLocation(activityToEdit.location || '');
        setDescription(activityToEdit.description || '');
        setCategoryColor(activityToEdit.categoryColor);
        setUserHasPickedColor(true);
        setRecurrenceRule(activityToEdit.recurrenceRule || RecurrenceOption.NONE);
      } else {
        // New activity
        const initialDate = new Date(selectedDate);
        setTitle('');
        setActivityType(ActivityType.EVENT);
        setIsAllDay(true);
        setStartDate(formatDateForInput(initialDate));
        setStartTime(formatTimeForInput(new Date(initialDate.setHours(Math.min(23, initialDate.getHours() + 1), 0, 0, 0))));
        setEndDate(formatDateForInput(initialDate));
        setEndTime(formatTimeForInput(new Date(initialDate.setHours(Math.min(23, initialDate.getHours() + 2), 0, 0, 0))));
        setLocation('');
        setDescription('');
        setCategoryColor(activityTypeColors[ActivityType.EVENT]);
        setUserHasPickedColor(false);
        setRecurrenceRule(RecurrenceOption.NONE);
      }
      setIsRecurrencePickerOpen(false);
      setIsCustomRecurrenceModalOpen(false);
    }
  }, [isOpen, selectedDate, activityToEdit]);

  useEffect(() => {
    if (isOpen && !activityToEdit && !userHasPickedColor) {
      setCategoryColor(activityTypeColors[activityType]);
    }
  }, [isOpen, activityType, activityToEdit, userHasPickedColor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isRecurrencePickerOpen &&
        recurrencePickerRef.current &&
        !recurrencePickerRef.current.contains(event.target as Node) &&
        recurrenceButtonRef.current &&
        !recurrenceButtonRef.current.contains(event.target as Node)
      ) {
        setIsRecurrencePickerOpen(false);
      }
    };

    if (isRecurrencePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRecurrencePickerOpen]);


  const handleSave = () => {
    if (!title.trim()) {
      setTitleError("O título é obrigatório.");
      return;
    }
    setTitleError(null);

    // If editing a recurring event instance, we need the original activity's start date for the recurrence rule.
    // The `activityToEdit.date` might be the instance's date, not the original series start.
    // However, RRULEs are typically defined relative to the *first* occurrence.
    // For simplicity now, the `startDate` field IS the main date for the activity being saved.
    // If it's an edit of a series, `activityToEdit.id` is the original ID. `startDate` here should be `activityToEdit.date` from the series.

    let activityDateToSave = startDate;
    if (activityToEdit && activityToEdit.id && !activityToEdit.id.includes('-recur-')) {
      // If we are editing the original definition of a recurring event
      activityDateToSave = activityToEdit.date;
    } else if (activityToEdit && activityToEdit.id && activityToEdit.id.includes('-recur-')) {
      // If we are editing an instance that was generated (this path should ideally lead to editing the series or this instance only)
      // For now, editing an instance means editing the whole series based on its original definition.
      // We'd need to find the original activity to get its original start date if the RRULE needs to be re-evaluated from scratch.
      // This simplified model assumes the RRULE is self-contained and the `startDate` is for THIS instance.
      // The `App.tsx` handles saving based on original ID if it's an edit.
    }


    const activityData: Omit<Activity, 'id'> & { id?: string } = {
      id: activityToEdit ? (activityToEdit.id.includes('-recur-') ? activityToEdit.id.split('-recur-')[0] : activityToEdit.id) : undefined,
      title: title.trim(),
      activityType,
      date: activityDateToSave, // This should be the original start date of the series for the RRULE.
      isAllDay,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      categoryColor,
      recurrenceRule: recurrenceRule === RecurrenceOption.NONE ? undefined : recurrenceRule,
    };
    onSave(activityData);
    onClose(); // Ensure modal closes after save
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (titleError && e.target.value.trim()) {
      setTitleError(null);
    }
  };

  const handleRecurrenceOptionSelect = (option: RecurrenceOption | string) => {
    if (option === RecurrenceOption.CUSTOM) {
      setIsCustomRecurrenceModalOpen(true);
    } else {
      setRecurrenceRule(option as string);
    }
    setIsRecurrencePickerOpen(false);
  };

  const handleCustomRecurrenceSave = (customRule: string) => {
    setRecurrenceRule(customRule);
    setIsCustomRecurrenceModalOpen(false);
  };


  const inputBaseClass = "w-full bg-transparent border-b py-2 focus:outline-none text-sm";
  const inputBorderClass = currentTheme === Theme.LIGHT ? "border-gray-300 focus:border-rose-500" : "border-neutral-700 focus:border-sky-500";
  const iconColorClass = currentTheme === Theme.LIGHT ? "text-gray-500" : "text-neutral-400";
  const textColorClass = currentTheme === Theme.LIGHT ? "text-gray-700" : "text-neutral-200";
  const placeholderColorClass = currentTheme === Theme.LIGHT ? "placeholder-gray-400" : "placeholder-neutral-500";
  const sectionBorderClass = currentTheme === Theme.LIGHT ? "border-gray-200" : "border-neutral-700";
  const errorTextColorClass = currentTheme === Theme.LIGHT ? "text-red-600" : "text-red-400";
  const pickerBgColor = currentTheme === Theme.LIGHT ? 'bg-white' : 'bg-neutral-800';
  const pickerTextColor = currentTheme === Theme.LIGHT ? 'text-gray-800' : 'text-neutral-100';
  const pickerBorderColor = currentTheme === Theme.LIGHT ? 'border-gray-300' : 'border-neutral-700';
  const radioSelectedColor = currentTheme === Theme.LIGHT ? 'border-rose-500 bg-rose-500' : 'border-sky-500 bg-sky-500';
  const radioUnselectedColor = currentTheme === Theme.LIGHT ? 'border-gray-400' : 'border-neutral-500';

  const displayedRecurrenceText = isCustomRRule(recurrenceRule) ? "Regra Personalizada" : recurrenceRule;


  if (!isOpen) return null;
  if (isCustomRecurrenceModalOpen) {
    return (
      <CustomRecurrenceModal
        isOpen={isCustomRecurrenceModalOpen}
        onClose={() => setIsCustomRecurrenceModalOpen(false)}
        onSave={handleCustomRecurrenceSave}
        currentTheme={currentTheme}
        initialActivityDate={startDate} // Pass the current start date of the activity
        currentRRuleString={isCustomRRule(recurrenceRule) ? recurrenceRule : undefined}
      />
    );
  }


  return (
    <div
      className={`fixed inset-0 z-50 ${currentTheme === Theme.DARK ? 'bg-black text-white' : 'bg-slate-50 text-black'} max-h-screen`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-activity-title"
    >
      <div
        className="flex flex-col h-full" // Removed overflow-y-auto, will be on main
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.0rem)' }} // Reduced top padding
      >
        <header className={`flex items-center justify-between p-3 border-b ${sectionBorderClass} flex-shrink-0`}>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${currentTheme === Theme.DARK ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'}`}
            aria-label="Fechar"
          >
            <CloseIcon className={`w-6 h-6 ${currentTheme === Theme.DARK ? 'text-neutral-300' : 'text-gray-600'}`} />
          </button>
          <div className="flex-grow mx-3">
            <input
              id="create-activity-title"
              type="text"
              placeholder="Adicionar título"
              value={title}
              onChange={handleTitleChange}
              className={`w-full text-xl font-semibold bg-transparent focus:outline-none ${placeholderColorClass} ${currentTheme === Theme.DARK ? 'text-white' : 'text-black'}`}
              aria-required="true"
              aria-invalid={!!titleError}
              aria-describedby={titleError ? "title-error-message" : undefined}
            />
            {titleError && (
              <p id="title-error-message" className={`text-xs ${errorTextColorClass} mt-1`}>
                {titleError}
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md ${currentTheme === Theme.DARK ? 'bg-sky-600 text-white hover:bg-sky-500' : 'bg-rose-500 text-white hover:bg-rose-600'} flex-shrink-0`}
          >
            {activityToEdit ? "Atualizar" : "Salvar"}
          </button>
        </header>

        <main className="flex-grow p-4 space-y-5 overflow-y-auto">
          <div className="flex space-x-2">
            {[ActivityType.EVENT, ActivityType.TASK, ActivityType.BIRTHDAY].map(type => (
              <button
                key={type}
                onClick={() => {
                  setActivityType(type);
                }}
                className={`px-4 py-2 text-sm rounded-full border ${activityType === type
                    ? (currentTheme === Theme.DARK ? 'bg-sky-500 border-sky-500 text-white' : 'bg-rose-500 border-rose-500 text-white')
                    : (currentTheme === Theme.DARK ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100')
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className={`py-3 border-b ${sectionBorderClass}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <ClockIcon className={`w-5 h-5 mr-3 ${iconColorClass}`} />
                <span className={textColorClass}>Dia inteiro</span>
              </div>
              <label htmlFor="all-day-toggle" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="all-day-toggle" className="sr-only peer" checked={isAllDay} onChange={() => setIsAllDay(!isAllDay)} aria-label="Alternar status de evento de dia inteiro" />
                <div className={`w-11 h-6 rounded-full peer ${currentTheme === Theme.DARK ? 'bg-neutral-700 peer-checked:bg-sky-600' : 'bg-gray-200 peer-checked:bg-rose-500'} peer-focus:outline-none peer-focus:ring-2 ${currentTheme === Theme.DARK ? 'peer-focus:ring-sky-500' : 'peer-focus:ring-rose-500'} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${currentTheme === Theme.DARK ? 'peer-checked:after:border-white' : ''} peer-checked:after:translate-x-full`}></div>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input aria-label="Data de início" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputBaseClass} ${inputBorderClass} flex-1 ${textColorClass}`} />
              {!isAllDay && <input aria-label="Hora de início" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={`${inputBaseClass} ${inputBorderClass} w-28 ${textColorClass}`} />}
            </div>
            {!isAllDay && (
              <div className="flex items-center space-x-2 mt-2">
                <input aria-label="Data de término" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputBaseClass} ${inputBorderClass} flex-1 ${textColorClass}`} />
                <input aria-label="Hora de término" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={`${inputBaseClass} ${inputBorderClass} w-28 ${textColorClass}`} />
              </div>
            )}
          </div>

          <div className={`flex items-center py-3 border-b ${sectionBorderClass}`}>
            <GlobeAltIcon className={`w-5 h-5 mr-3 ${iconColorClass}`} />
            <span className={textColorClass}>Horário Padrão de Brasília (Espaço reservado)</span>
          </div>

          <div className={`py-3 border-b ${sectionBorderClass} relative`}>
            <button
              ref={recurrenceButtonRef}
              onClick={() => setIsRecurrencePickerOpen(!isRecurrencePickerOpen)}
              className={`flex items-center w-full text-left ${textColorClass} hover:opacity-80`}
              aria-haspopup="listbox"
              aria-expanded={isRecurrencePickerOpen}
              aria-controls="recurrence-options-list"
            >
              <ArrowPathIcon className={`w-5 h-5 mr-3 ${iconColorClass}`} />
              <span>{displayedRecurrenceText}</span>
            </button>
            {isRecurrencePickerOpen && (
              <div
                ref={recurrencePickerRef}
                id="recurrence-options-list"
                className={`absolute left-0 right-0 mt-2 p-3 rounded-lg shadow-xl z-10 ${pickerBgColor} ${pickerBorderColor} border`}
                role="listbox"
              >
                {RECURRENCE_OPTIONS_PT.map(optionValue => (
                  <div
                    key={optionValue}
                    role="option"
                    aria-selected={recurrenceRule === optionValue || (optionValue === RecurrenceOption.CUSTOM && isCustomRRule(recurrenceRule))}
                    onClick={() => handleRecurrenceOptionSelect(optionValue)}
                    className={`flex items-center p-2.5 rounded-md cursor-pointer ${pickerTextColor} ${currentTheme === Theme.LIGHT ? 'hover:bg-gray-100' : 'hover:bg-neutral-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${(recurrenceRule === optionValue || (optionValue === RecurrenceOption.CUSTOM && isCustomRRule(recurrenceRule)))
                        ? radioSelectedColor : radioUnselectedColor}`
                    }>
                      {(recurrenceRule === optionValue || (optionValue === RecurrenceOption.CUSTOM && isCustomRRule(recurrenceRule))) &&
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <span>{optionValue === RecurrenceOption.CUSTOM && isCustomRRule(recurrenceRule) ? displayedRecurrenceText : optionValue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className={`py-3 border-b ${sectionBorderClass}`}>
            <div className="flex items-center mb-2">
              <UserGroupIcon className={`w-5 h-5 mr-3 ${iconColorClass}`} />
              <span className={textColorClass}>Adicionar pessoas (Espaço reservado)</span>
            </div>
          </div>

          <div className={`flex items-center py-3 border-b ${sectionBorderClass}`}>
            <LocationMarkerIcon className={`w-5 h-5 mr-3 ${iconColorClass}`} />
            <input
              type="text"
              placeholder="Adicionar local"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`${inputBaseClass} ${inputBorderClass} ${placeholderColorClass} ${textColorClass}`}
            />
          </div>

          <div className={`py-3 border-b ${sectionBorderClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BellIcon className={`w-5 h-5 mr-3 ${iconColorClass}`} />
                <span className={textColorClass}>30 minutos antes (Espaço reservado)</span>
              </div>
            </div>
          </div>

          <div className={`py-3 border-b ${sectionBorderClass}`}>
            <div className="flex items-center mb-2">
              <SparklesIcon className={`w-5 h-5 mr-3 ${iconColorClass}`} />
              <span className={textColorClass}>{activityToEdit ? "Cor da atividade" : "Cor padrão"}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  title={color.name}
                  aria-label={color.name}
                  onClick={() => {
                    setCategoryColor(color.value);
                    setUserHasPickedColor(true);
                  }}
                  className={`w-8 h-8 rounded-full ${color.value} ${categoryColor === color.value ? (currentTheme === Theme.DARK ? 'ring-2 ring-offset-2 ring-offset-black ring-sky-400' : 'ring-2 ring-offset-2 ring-offset-slate-50 ring-rose-500') : ''}`}
                />
              ))}
            </div>
          </div>

          <div className={`flex items-start py-3 border-b ${sectionBorderClass}`}>
            <DocumentTextIcon className={`w-5 h-5 mr-3 mt-1 flex-shrink-0 ${iconColorClass}`} />
            <textarea
              placeholder="Adicionar descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputBaseClass} ${inputBorderClass} ${placeholderColorClass} ${textColorClass} resize-none`}
            />
          </div>

          <div className={`flex items-center py-3`}>
            <PaperClipIcon className={`w-5 h-5 mr-3 ${iconColorClass}`} />
            <span className={textColorClass}>Adicionar anexo do Google Drive (Espaço reservado)</span>
          </div>
        </main>
        {/* Footer removed, save button moved to header */}
      </div>
    </div>
  );
};

export default CreateActivityModal;
