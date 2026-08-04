import { getWeeklyHistory } from '../utils/dates';
import { Habit, CompletionRecord } from '../types';
import { format } from 'date-fns';

interface WeeklyHeatmapProps {
  completions: CompletionRecord[];
  habits: Habit[];
}

export function WeeklyHeatmap({ completions, habits }: WeeklyHeatmapProps) {
  const weekData = getWeeklyHistory(completions);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-white dark:bg-[#121824] rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors">
      <h3 className="text-slate-900 dark:text-white font-medium mb-6">This Week's Activity</h3>
      <div className="flex justify-between items-end h-32 gap-2">
        {weekData.map((day) => {
          const isToday = day.dateStr === todayStr;
          const totalHabits = habits.length || 1; // avoid div by 0
          const completedCount = day.completedHabits.length;
          const percentage = completedCount / totalHabits;
          
          // Determine color intensity based on completion percentage
          let bgClass = 'bg-slate-100 dark:bg-[#1c2230]';
          if (percentage > 0) bgClass = 'bg-teal-500/20 dark:bg-cyan-500/20';
          if (percentage >= 0.5) bgClass = 'bg-teal-500/50 dark:bg-cyan-500/50';
          if (percentage >= 1) bgClass = 'bg-gradient-to-t from-teal-500 to-cyan-500 shadow-[0_0_15px_-3px_rgba(20,184,166,0.5)]';

          return (
            <div key={day.dateStr} className="flex flex-col items-center flex-1 gap-3">
              <div 
                className={`w-full max-w-[2rem] rounded-full transition-all duration-500 relative flex items-end ${bgClass}`}
                style={{ height: '100%', minHeight: '8px', border: isToday ? '1.5px solid rgba(20, 184, 166, 0.6)' : 'none' }}
              >
                {/* Visual bar filling up */}
                <div 
                   className="w-full bg-teal-500/30 dark:bg-cyan-400/30 rounded-full transition-all duration-500 absolute bottom-0"
                   style={{ height: `${percentage * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${isToday ? 'text-teal-600 dark:text-cyan-400 font-bold' : 'text-slate-400 dark:text-gray-500'}`}>
                {format(day.date, 'EE').charAt(0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
