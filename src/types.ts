export type Frequency = 'daily' | 'weekly';
export type Priority = 'low' | 'medium' | 'high';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: string;
  frequency: Frequency;
  priority: Priority;
  color: string;
  createdAt: number;
}

export interface CompletionRecord {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface AppData {
  habits: Habit[];
  completions: CompletionRecord[];
}
