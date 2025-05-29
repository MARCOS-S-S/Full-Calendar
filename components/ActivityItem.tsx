
import React, { useState, useRef, useEffect } from 'react';
import { Activity, Theme } from '../constants'; // Added Theme
import { ClockIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from './icons';

interface ActivityItemProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDeleteRequest: (activityId: string) => void;
  index: number;
  isDragging: boolean;
  isDragOver: boolean;
  handleDragStart: (index: number) => void;
  handleDragEnter: (index: number, event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOverEvents: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (droppedOnIndex: number) => void;
  handleDragEnd: () => void;
  handleDragLeave: () => void;
  currentTheme: Theme;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  onEdit,
  onDeleteRequest,
  index,
  isDragging,
  isDragOver,
  handleDragStart,
  handleDragEnter,
  handleDragOverEvents,
  handleDrop,
  handleDragEnd,
  handleDragLeave,
  currentTheme
}) => {
  const displayTime = activity.isAllDay ? "Dia inteiro" : activity.startTime;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const dragOverRingClass = isDragOver
    ? (currentTheme === Theme.DARK ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-black' : 'ring-2 ring-rose-500 ring-offset-2 ring-offset-slate-50')
    : '';

  const draggingStyles = isDragging
    ? 'opacity-50 cursor-grabbing scale-105 shadow-xl'
    : 'cursor-grab';

  return (
    <div
      draggable="true"
      onDragStart={(e) => {
        // You can set custom drag image here if needed: e.dataTransfer.setDragImage(...)
        handleDragStart(index);
      }}
      onDragEnter={(e) => handleDragEnter(index, e)}
      onDragOver={handleDragOverEvents}
      onDrop={(e) => {
        e.preventDefault(); // Crucial for drop to work
        handleDrop(index);
      }}
      onDragEnd={handleDragEnd}
      onDragLeave={handleDragLeave}
      className={`flex items-start p-3 bg-white dark:bg-neutral-800 rounded-lg shadow relative mb-3 transition-all duration-150 
                  ${draggingStyles}
                  ${dragOverRingClass}`}
      aria-roledescription="Item de atividade arrastável"
    >
      <div className={`w-1.5 h-auto self-stretch absolute left-0 top-0 bottom-0 rounded-l-lg ${activity.categoryColor}`}></div>
      <div className="ml-4 flex-grow flex items-center">
        <div className="flex-grow">
          <h4 className="text-sm font-medium text-gray-800 dark:text-neutral-100">{activity.title}</h4>
          <div className="flex items-center text-xs text-gray-500 dark:text-neutral-400 mt-1">
            <ClockIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span>{displayTime}</span>
            {activity.location && (
              <span className="ml-2 pl-2 border-l border-gray-200 dark:border-neutral-700 truncate" title={activity.location}>
                {activity.location}
              </span>
            )}
          </div>
          {activity.description && (
            <p className="text-xs text-gray-600 dark:text-neutral-300 mt-1 italic truncate">
              {activity.description}
            </p>
          )}
        </div>
        <div className="relative ml-2 self-start" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 p-1"
            aria-label={`Opções para ${activity.title}`}
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <MoreVerticalIcon className="w-5 h-5" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-neutral-700 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5 dark:ring-neutral-600">
              <button
                onClick={() => { onEdit(activity); setIsMenuOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-600"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => { onDeleteRequest(activity.id); setIsMenuOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-600"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
