import React from 'react';
import { CompletionRecord, Habit } from '../types';
import { getWeeklyHistory } from '../utils/dates';
import { CalendarCheck2, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface WeeklySummaryProps {
  completions: CompletionRecord[];
  habits: Habit[];
}

export function WeeklySummary({ completions, habits }: WeeklySummaryProps) {
  const weekData = getWeeklyHistory(completions);
  
  // Total completions for this week
  const totalCompletedThisWeek = weekData.reduce((acc, day) => acc + day.completedHabits.length, 0);
  
  // Target completions for the week = total active habits * 7
  const weeklyTarget = (habits.length || 1) * 7;
  const percentage = Math.min(100, Math.round((totalCompletedThisWeek / weeklyTarget) * 100));

  return (
    <div className="m3-card-asymmetric bg-white dark:bg-[#121824] p-5 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/10 dark:bg-cyan-500/20 text-teal-600 dark:text-cyan-400 rounded-xl">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">Weekly Summary</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs">
              This week's progress across all habits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs font-semibold text-slate-800 dark:text-white">
          <TrendingUp className="w-3.5 h-3.5 text-teal-500 dark:text-cyan-400" />
          <span>{percentage}%</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between text-xs font-medium mb-2">
        <span className="text-slate-600 dark:text-gray-300 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-teal-500 dark:text-cyan-400" />
          <strong className="text-slate-900 dark:text-white font-bold text-sm">{totalCompletedThisWeek}</strong> completed
        </span>
        <span className="text-slate-400 dark:text-gray-400">Target: {weeklyTarget} ({habits.length} habits × 7d)</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-100 dark:bg-[#1c2230] h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-white/5 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 rounded-full relative shadow-[0_0_12px_rgba(20,184,166,0.4)]"
        />
      </div>
    </div>
  );
}
