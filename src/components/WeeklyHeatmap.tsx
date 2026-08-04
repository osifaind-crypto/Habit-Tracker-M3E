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
    <div className="bg-surface rounded-3xl p-6 border border-white/5">
      <h3 className="text-white font-medium mb-6">This Week's Activity</h3>
      <div className="flex justify-between items-end h-32 gap-2">
        {weekData.map((day, i) => {
          const isToday = day.dateStr === todayStr;
          const totalHabits = habits.length || 1; // avoid div by 0
          const completedCount = day.completedHabits.length;
          const percentage = completedCount / totalHabits;
          
          // Determine color intensity based on completion percentage
          let bgClass = 'bg-[#1c1f26]';
          if (percentage > 0) bgClass = 'bg-primary/20';
          if (percentage >= 0.5) bgClass = 'bg-primary/50';
          if (percentage >= 1) bgClass = 'bg-primary shadow-[0_0_15px_-5px_rgba(139,92,246,0.5)]';

          return (
            <div key={day.dateStr} className="flex flex-col items-center flex-1 gap-3">
              <div 
                className={`w-full max-w-[2rem] rounded-full transition-all duration-500 relative flex items-end ${bgClass}`}
                style={{ height: '100%', minHeight: '8px', border: isToday ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
              >
                {/* Visual bar filling up */}
                <div 
                   className="w-full bg-white/20 rounded-full transition-all duration-500 absolute bottom-0"
                   style={{ height: `${percentage * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${isToday ? 'text-white' : 'text-gray-500'}`}>
                {format(day.date, 'EE').charAt(0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
