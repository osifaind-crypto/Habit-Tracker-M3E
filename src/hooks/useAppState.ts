import { useState, useEffect } from 'react';
import { Habit, CompletionRecord, AppData } from '../types';

const STORAGE_KEY = 'habit-tracker-data';

const defaultData: AppData = {
  habits: [
    {
      id: '1',
      title: 'Drink Water',
      description: 'Drink 8 glasses of water',
      category: 'Health',
      frequency: 'daily',
      priority: 'high',
      color: '#0ea5e9', // Sky blue
      createdAt: Date.now(),
    },
    {
      id: '2',
      title: 'Read 10 Pages',
      category: 'Learning',
      frequency: 'daily',
      priority: 'medium',
      color: '#8b5cf6', // Violet
      createdAt: Date.now(),
    }
  ],
  completions: [],
};

export const useAppState = () => {
  const [data, setData] = useState<AppData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse local storage data', e);
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setData(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, ...updates } : h),
    }));
  };

  const deleteHabit = (id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id),
      completions: prev.completions.filter(c => c.habitId !== id),
    }));
  };

  const reorderHabits = (newHabits: Habit[]) => {
    setData(prev => ({
      ...prev,
      habits: newHabits,
    }));
  };

  const toggleCompletion = (habitId: string, date: string) => {
    setData(prev => {
      const exists = prev.completions.some(c => c.habitId === habitId && c.date === date);
      if (exists) {
        return {
          ...prev,
          completions: prev.completions.filter(c => !(c.habitId === habitId && c.date === date)),
        };
      } else {
        return {
          ...prev,
          completions: [...prev.completions, { habitId, date }],
        };
      }
    });
  };

  const importData = (importedData: AppData) => {
    setData(importedData);
  };

  const clearData = () => {
    setData({ habits: [], completions: [] });
  };

  return {
    data,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    toggleCompletion,
    importData,
    clearData,
  };
};
