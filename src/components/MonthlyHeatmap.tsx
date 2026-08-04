import React, { useState } from 'react';
import { Habit, CompletionRecord } from '../types';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isFuture,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Plus, Flame, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MonthlyHeatmapProps {
  habits: Habit[];
  completions: CompletionRecord[];
  onSelectDate: (dateStr: string) => void;
}

export const MonthlyHeatmap: React.FC<MonthlyHeatmapProps> = ({
  habits,
  completions,
  onSelectDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate });
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleCurrentMonth = () => setCurrentMonth(new Date());

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Helper for heatmap cell color intensity
  const getCellGlowStyle = (percentage: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) {
      return 'bg-slate-100/50 dark:bg-[#121620]/40 text-slate-400 dark:text-gray-600 border-transparent opacity-40';
    }
    if (percentage === 0) {
      return 'bg-slate-100 dark:bg-[#182030] text-slate-600 dark:text-gray-400 border-slate-200/60 dark:border-white/5 hover:border-slate-400 dark:hover:border-cyan-500/40';
    }
    if (percentage < 0.35) {
      return 'bg-teal-500/20 dark:bg-cyan-500/20 text-teal-700 dark:text-cyan-300 border-teal-500/30 hover:bg-teal-500/30';
    }
    if (percentage < 0.7) {
      return 'bg-teal-500/40 dark:bg-cyan-500/45 text-teal-900 dark:text-cyan-200 border-teal-500/50 hover:bg-teal-500/50';
    }
    if (percentage < 1) {
      return 'bg-teal-500/70 dark:bg-cyan-500/75 text-white border-teal-400 shadow-sm shadow-teal-500/20 hover:brightness-110';
    }
    // 100% completion glow
    return 'bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-500 text-white border-cyan-300 shadow-md shadow-cyan-500/40 font-bold hover:scale-105';
  };

  return (
    <div className="bg-white dark:bg-[#121824] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors relative">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 dark:bg-cyan-500/20 text-teal-600 dark:text-cyan-400 rounded-2xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg flex items-center gap-2">
              Heatmap Calendar
              <Sparkles className="w-4 h-4 text-teal-500 dark:text-cyan-400" />
            </h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs">
              Click any date cell to backdate or view logs
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#1c2230] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 border border-slate-200/80 dark:border-white/5"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-slate-800 dark:text-white min-w-[120px] text-center px-2">
            {format(currentMonth, 'MMMM yyyy')}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#1c2230] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 border border-slate-200/80 dark:border-white/5"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleCurrentMonth}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-500/10 dark:bg-cyan-500/20 text-teal-600 dark:text-cyan-400 hover:bg-teal-500/20 transition-all border border-teal-500/20"
          >
            Today
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-xs font-semibold text-slate-400 dark:text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Heatmap Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {daysInGrid.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrMonth = isSameMonth(day, currentMonth);
          const isTodayCell = dateStr === todayStr;

          // Calculate completions for this day
          const dayCompletions = completions.filter(c => c.date === dateStr);
          const completedCount = habits.filter(h => dayCompletions.some(c => c.habitId === h.id)).length;
          const totalHabits = habits.length;
          const percentage = totalHabits === 0 ? 0 : completedCount / totalHabits;

          const cellGlowClass = getCellGlowStyle(percentage, isCurrMonth);

          return (
            <div key={dateStr} className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectDate(dateStr)}
                onMouseEnter={() => setHoveredDateStr(dateStr)}
                onMouseLeave={() => setHoveredDateStr(null)}
                className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 sm:p-2 border transition-all cursor-pointer relative overflow-hidden ${cellGlowClass}`}
                style={{
                  boxShadow: isTodayCell
                    ? '0 0 0 2px rgba(20, 184, 166, 0.8), 0 0 12px rgba(20, 184, 166, 0.4)'
                    : undefined,
                }}
              >
                {/* Date Number */}
                <span className={`text-xs sm:text-sm font-semibold leading-none ${isTodayCell ? 'underline font-extrabold' : ''}`}>
                  {format(day, 'd')}
                </span>

                {/* Completion Indicator Dot / Count */}
                {isCurrMonth && habits.length > 0 && (
                  <div className="flex items-center justify-center gap-0.5">
                    {completedCount > 0 ? (
                      <span className="text-[10px] font-bold tracking-tight opacity-90">
                        {completedCount}/{totalHabits}
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/10" />
                    )}
                  </div>
                )}
              </motion.button>

              {/* Tooltip on Hover */}
              {hoveredDateStr === dateStr && isCurrMonth && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none w-48 bg-slate-900 dark:bg-[#1a202c] text-white p-2.5 rounded-2xl shadow-2xl border border-slate-700 dark:border-white/10 text-xs space-y-1.5 animate-fade-in">
                  <div className="font-bold text-teal-400 border-b border-white/10 pb-1 flex justify-between items-center">
                    <span>{format(day, 'MMM d, yyyy')}</span>
                    <span className="text-[10px] text-gray-300 font-normal">Click to log</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Completed:</span>
                    <span className="font-semibold text-white">{completedCount} of {totalHabits} ({Math.round(percentage * 100)}%)</span>
                  </div>
                  {completedCount > 0 && (
                    <div className="pt-1 text-[11px] text-teal-300 truncate flex items-center">
                      <Check className="w-3 h-3 inline mr-1 shrink-0" />
                      <span className="truncate">{habits.filter(h => dayCompletions.some(c => c.habitId === h.id)).map(h => h.title).join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <span>Completion intensity:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-[#182030] border border-slate-300 dark:border-white/10" title="0%" />
            <span className="w-3 h-3 rounded-md bg-teal-500/20 dark:bg-cyan-500/20 border border-teal-500/30" title="1-33%" />
            <span className="w-3 h-3 rounded-md bg-teal-500/50 dark:bg-cyan-500/50 border border-teal-500/50" title="34-66%" />
            <span className="w-3 h-3 rounded-md bg-teal-500/80 dark:bg-cyan-500/80" title="67-99%" />
            <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-teal-500 to-indigo-500 shadow-sm" title="100%" />
          </div>
        </div>

        <button
          onClick={() => onSelectDate(todayStr)}
          className="flex items-center gap-1 text-teal-600 dark:text-cyan-400 font-semibold hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Backdate Past Habit
        </button>
      </div>
    </div>
  );
};
