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
    <div className="bg-surface rounded-3xl p-5 border border-white/5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm sm:text-base">Weekly Summary</h3>
            <p className="text-gray-400 text-xs">
              This week's progress across all habits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-semibold text-white">
          <TrendingUp className="w-3.5 h-3.5 text-secondary" />
          <span>{percentage}%</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between text-xs font-medium mb-2">
        <span className="text-gray-300 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-secondary" />
          <strong className="text-white font-bold text-sm">{totalCompletedThisWeek}</strong> completed
        </span>
        <span className="text-gray-400">Target: {weeklyTarget} ({habits.length} habits × 7d)</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-[#1c1f26] h-3.5 rounded-full overflow-hidden p-0.5 border border-white/5 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full relative shadow-[0_0_12px_rgba(14,165,233,0.4)]"
        />
      </div>
    </div>
  );
}
