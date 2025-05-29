import React from 'react';
import { Activity } from '../constants';
import ActivityItem from './ActivityItem';
import { PlusIcon } from './icons';

interface ActivitiesSectionProps {
  selectedDate: Date;
  activities: Activity[];
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivityRequest: (activityId: string) => void;
}

const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  selectedDate,
  activities,
  onAddActivity,
  onEditActivity,
  onDeleteActivityRequest,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSelectedDateToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate();

  const titleText = isSelectedDateToday
    ? "HOJE"
    : selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' });

  const filteredActivities = activities.filter(act => {
    const actDateParts = act.date.split('-');
    const actDate = new Date(parseInt(actDateParts[0]), parseInt(actDateParts[1]) - 1, parseInt(actDateParts[2]));
    actDate.setHours(0, 0, 0, 0);
    return actDate.getTime() === selectedDate.getTime();
  });

  const activitiesCountText = filteredActivities.length > 0
    ? `${filteredActivities.length} ${filteredActivities.length === 1 ? "Atividade" : "Atividades"}`
    : "Nenhuma atividade";

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
      {filteredActivities.length > 0 ? (
        <div className="space-y-0">
          {filteredActivities.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onEdit={onEditActivity}
              onDeleteRequest={onDeleteActivityRequest}
            />
          ))}
        </div>
      ) : (
        // A "caixa de diálogo" foi removida substituindo o JSX anterior por null
        null
      )}
    </div>
  );
};

export default ActivitiesSection;