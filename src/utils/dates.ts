import { format, parseISO, isSameDay, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { Habit, CompletionRecord } from '../types';

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const isCompletedToday = (habitId: string, completions: CompletionRecord[]) => {
  const today = getTodayStr();
  return completions.some(c => c.habitId === habitId && c.date === today);
};

export const calculateStreak = (habitId: string, completions: CompletionRecord[]): number => {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (habitCompletions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  let currentDate = today;

  // Check if completed today or yesterday to maintain a streak
  const hasCompletedToday = habitCompletions.some(c => c.date === format(today, 'yyyy-MM-dd'));
  const hasCompletedYesterday = habitCompletions.some(c => c.date === format(subDays(today, 1), 'yyyy-MM-dd'));

  if (!hasCompletedToday && !hasCompletedYesterday) {
    return 0; // Streak broken
  }

  let dateToCheck = hasCompletedToday ? today : subDays(today, 1);

  while (true) {
    const dateStr = format(dateToCheck, 'yyyy-MM-dd');
    if (habitCompletions.some(c => c.date === dateStr)) {
      streak++;
      dateToCheck = subDays(dateToCheck, 1);
    } else {
      break;
    }
  }

  return streak;
};

export const getWeeklyHistory = (completions: CompletionRecord[], date: Date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
  const days = eachDayOfInterval({ start, end });

  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const completedHabits = completions.filter(c => c.date === dateStr).map(c => c.habitId);
    return {
      date: day,
      dateStr,
      completedHabits,
    };
  });
};
