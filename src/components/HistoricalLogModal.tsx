import React from 'react';
import { Habit, CompletionRecord } from '../types';
import { format, parseISO, addDays, subDays, isFuture } from 'date-fns';
import { X, Check, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Flame, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryManager } from '../utils/categories';

interface HistoricalLogModalProps {
  isOpen: boolean;
  dateStr: string | null;
  onClose: () => void;
  habits: Habit[];
  completions: CompletionRecord[];
  onToggleCompletion: (habitId: string, dateStr: string) => void;
  onSelectDate: (dateStr: string) => void;
}

export const HistoricalLogModal: React.FC<HistoricalLogModalProps> = ({
  isOpen,
  dateStr,
  onClose,
  habits,
  completions,
  onToggleCompletion,
  onSelectDate,
}) => {
  if (!isOpen || !dateStr) return null;

  const parsedDate = parseISO(dateStr);
  const formattedHeader = format(parsedDate, 'EEEE, MMMM d, yyyy');
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
  const isFutureDate = isFuture(parsedDate) && !isToday;

  const handlePrevDay = () => {
    const prev = subDays(parsedDate, 1);
    onSelectDate(format(prev, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const next = addDays(parsedDate, 1);
    onSelectDate(format(next, 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    onSelectDate(format(new Date(), 'yyyy-MM-dd'));
  };

  // Get completions for this specific date
  const dayCompletions = completions.filter(c => c.date === dateStr);
  const completedCount = habits.filter(h => dayCompletions.some(c => c.habitId === h.id)).length;
  const totalHabits = habits.length;
  const percentage = totalHabits === 0 ? 0 : Math.round((completedCount / totalHabits) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 m3-scrim"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg m3-elevation-5 rounded-3xl p-6 z-10 max-h-[90vh] flex flex-col transition-colors"
        >
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/10 dark:bg-cyan-500/20 text-teal-600 dark:text-cyan-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-teal-600 dark:text-cyan-400 uppercase tracking-wider">
                  {isToday ? 'Today' : 'Historical Log'}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {formattedHeader}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Date Switcher Bar */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-[#1c2230] p-2 rounded-2xl mb-5 border border-slate-200/80 dark:border-white/5">
            <button
              onClick={handlePrevDay}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Day</span>
            </button>

            {!isToday && (
              <button
                onClick={handleToday}
                className="text-xs font-bold text-teal-600 dark:text-cyan-400 hover:underline px-2 py-1"
              >
                Jump to Today
              </button>
            )}

            <button
              onClick={handleNextDay}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95"
            >
              <span>Next Day</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day Progress Banner */}
          <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-indigo-500/10 p-4 rounded-2xl border border-teal-500/20 mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
                {isFutureDate ? 'Future Date (Planning ahead)' : 'Backdated Activity Summary'}
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {completedCount} of {totalHabits} Habits Completed ({percentage}%)
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {percentage}%
            </div>
          </div>

          {/* List of Habits to Toggle for this Date */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {habits.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">
                No habits created yet. Add habits first from the main view.
              </p>
            ) : (
              habits.map(habit => {
                const isCompleted = dayCompletions.some(c => c.habitId === habit.id);
                const categoryDef = CategoryManager.getCategoryByName(habit.category);

                return (
                  <div
                    key={habit.id}
                    onClick={() => onToggleCompletion(habit.id, dateStr)}
                    className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer border transition-all active:scale-[0.99] ${
                      isCompleted
                        ? 'bg-teal-500/10 dark:bg-teal-500/15 border-teal-500/30'
                        : 'bg-slate-50 dark:bg-[#182030] border-slate-200/80 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#1c2638]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                        }`}
                        style={{ backgroundColor: isCompleted ? habit.color : undefined }}
                      >
                        <Check className={`w-5 h-5 transition-transform ${isCompleted ? 'scale-100' : 'scale-0'}`} />
                      </div>

                      <div className="min-w-0">
                        <h4 className={`text-sm font-semibold truncate ${
                          isCompleted ? 'text-slate-900 dark:text-white line-through opacity-80' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {habit.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                          <span>{categoryDef.icon} {habit.category}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                    }`}>
                      {isCompleted ? 'Done' : 'Pending'}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer Note */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="flex items-center gap-1 text-amber-500">
              <Flame className="w-4 h-4 fill-amber-400/20" /> Streaks & stats auto-update instantly
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white font-semibold rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
