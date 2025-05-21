import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('due_date', startOfMonth(currentDate).toISOString())
        .lte('due_date', endOfMonth(currentDate).toISOString());
      
      if (error) throw error;
      return data as Task[];
    },
  });

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getTasksForDay = (date: Date) => {
    return tasks?.filter(task => {
      const taskDate = new Date(task.due_date!);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    }) || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-700">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="px-4 py-2 text-sm font-medium text-gray-700 text-center">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {days.map((day, dayIdx) => {
            const dayTasks = getTasksForDay(day);
            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] p-2 ${
                  !isSameMonth(day, currentDate)
                    ? 'bg-gray-50'
                    : isToday(day)
                    ? 'bg-blue-50'
                    : 'bg-white'
                }`}
              >
                <p className={`text-sm ${
                  isToday(day) ? 'font-bold text-blue-600' : 'text-gray-700'
                }`}>
                  {format(day, 'd')}
                </p>
                <div className="mt-1 space-y-1">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="px-2 py-1 text-xs rounded-md"
                      style={{ backgroundColor: task.color + '33' }}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}