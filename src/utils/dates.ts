import { format, parseISO, isSameDay, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { Habit, CompletionRecord } from '../types';

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const isCompletedToday = (habitId: string, completions: CompletionRecord[]) => {
  const today = getTodayStr();
  return completions.some(c => c.habitId === habitId && c.date === today);
};

export const calculateStreak = (habitId: string, completions: CompletionRecord[]): number => {
  return getStreakStartDate(habitId, completions).streak;
};

export const getStreakStartDate = (habitId: string, completions: CompletionRecord[]): { streak: number; startDate: Date | null; formattedStartDate: string | null } => {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (habitCompletions.length === 0) return { streak: 0, startDate: null, formattedStartDate: null };

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

  const hasCompletedToday = habitCompletions.some(c => c.date === todayStr);
  const hasCompletedYesterday = habitCompletions.some(c => c.date === yesterdayStr);

  if (!hasCompletedToday && !hasCompletedYesterday) {
    return { streak: 0, startDate: null, formattedStartDate: null };
  }

  let streak = 0;
  let dateToCheck = hasCompletedToday ? today : subDays(today, 1);
  let startDate: Date | null = null;

  while (true) {
    const dateStr = format(dateToCheck, 'yyyy-MM-dd');
    if (habitCompletions.some(c => c.date === dateStr)) {
      streak++;
      startDate = dateToCheck;
      dateToCheck = subDays(dateToCheck, 1);
    } else {
      break;
    }
  }

  return {
    streak,
    startDate,
    formattedStartDate: startDate ? format(startDate, 'MMM d, yyyy') : null,
  };
};

export const calculateConsistencyScore = (habit: Habit, completions: CompletionRecord[]): number => {
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const uniqueCompletionDays = new Set(habitCompletions.map(c => c.date)).size;

  const today = new Date();
  const createdDate = habit.createdAt ? new Date(habit.createdAt) : today;

  const startMs = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate()).getTime();
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const totalDays = Math.max(1, Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
  return Math.min(100, Math.round((uniqueCompletionDays / totalDays) * 100));
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
