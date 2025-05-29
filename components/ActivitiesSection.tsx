
import React, { useState, useEffect } from 'react';
import { Activity, Theme } from '../constants'; // Added Theme
import ActivityItem from './ActivityItem';
import { PlusIcon } from './icons';

interface ActivitiesSectionProps {
  selectedDate: Date;
  activities: Activity[]; // This is pre-filtered by type from App.tsx
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivityRequest: (activityId: string) => void;
  currentTheme: Theme; // Added currentTheme
}

const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  selectedDate,
  activities, // This `activities` prop is already filtered by type from App.tsx
  onAddActivity,
  onEditActivity,
  onDeleteActivityRequest,
  currentTheme,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>([]);
  const [draggedItemOriginalIndex, setDraggedItemOriginalIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);

  useEffect(() => {
    // Filter the already type-filtered activities for the specific selectedDate
    const dateString = selectedDate.toISOString().split('T')[0];
    const dailyActivities = activities.filter(act => act.date === dateString);
    // The `activities` prop is already sorted by App.tsx's logic.
    // This `dailyActivities` list is what will be reorderable locally.
    setDisplayedActivities(dailyActivities);

    // Reset drag states when activities prop or selected date changes to ensure fresh state
    setDraggedItemOriginalIndex(null);
    setDragOverItemIndex(null);
  }, [activities, selectedDate]);

  const isSelectedDateToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate();

  const titleText = isSelectedDateToday
    ? "HOJE"
    : selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' });

  const activitiesCountText = displayedActivities.length > 0
    ? `${displayedActivities.length} ${displayedActivities.length === 1 ? "Atividade" : "Atividades"}`
    : "Nenhuma atividade";


  const handleDragStart = (index: number) => {
    setDraggedItemOriginalIndex(index);
  };

  const handleDragEnter = (index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (draggedItemOriginalIndex !== null && draggedItemOriginalIndex !== index) {
      setDragOverItemIndex(index);
    }
  };

  const handleDragOverEvents = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedItemOriginalIndex === null || draggedItemOriginalIndex === targetIndex) {
      // Do nothing if not dragging or dropping on itself
      setDraggedItemOriginalIndex(null);
      setDragOverItemIndex(null);
      return;
    }

    const newActivities = [...displayedActivities];
    const [draggedItem] = newActivities.splice(draggedItemOriginalIndex, 1);
    newActivities.splice(targetIndex, 0, draggedItem);

    setDisplayedActivities(newActivities);
    setDraggedItemOriginalIndex(null);
    setDragOverItemIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItemOriginalIndex(null);
    setDragOverItemIndex(null);
  };

  const handleDragLeave = () => {
    // Clears the drag-over visual cue if the mouse leaves an item without dropping
    // and is not immediately entering another valid droppable item.
    setDragOverItemIndex(null);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4 px-1 sm:px-0">
        <h3 className="text-sm font-semibold uppercase text-rose-500 dark:text-rose-400">
          {titleText}
          <span className="text-gray-500 dark:text-neutral-400 ml-2 normal-case font-normal">
            {activitiesCountText}
          </span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={onAddActivity}
            className="p-1.5 rounded-full text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20"
            aria-label="Adicionar nova atividade"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {displayedActivities.length > 0 ? (
        <div>
          {displayedActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id} // Keep using activity.id for React's key prop
              activity={activity}
              onEdit={onEditActivity}
              onDeleteRequest={onDeleteActivityRequest}
              index={index} // Pass the current index in the displayedActivities array
              isDragging={draggedItemOriginalIndex === index}
              isDragOver={dragOverItemIndex === index && draggedItemOriginalIndex !== null && draggedItemOriginalIndex !== index}
              handleDragStart={handleDragStart}
              handleDragEnter={handleDragEnter}
              handleDragOverEvents={handleDragOverEvents}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleDragLeave={handleDragLeave}
              currentTheme={currentTheme}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-lg shadow">
          Nenhuma atividade agendada para este dia.
        </div>
      )}
    </div>
  );
};

export default ActivitiesSection;
