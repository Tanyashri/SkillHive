
import React, { useState } from 'react';
import { Match, User } from '../types';
import { XIcon } from './icons';

interface SchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (matchId: string, dateTime: string) => void;
  match: Match;
  partner?: User;
}

const SchedulerModal: React.FC<SchedulerModalProps> = ({ isOpen, onClose, onSchedule, match, partner }) => {
  const [dateTime, setDateTime] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateTime) {
      onSchedule(match.id, dateTime);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 animate-pop-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule Session</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a date and time to schedule your learning session with <span className="font-semibold">{partner?.name}</span>.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="session-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date and Time
                </label>
                <input
                  type="datetime-local"
                  id="session-time"
                  name="session-time"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchedulerModal;
