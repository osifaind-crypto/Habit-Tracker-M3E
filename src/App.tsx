import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useAppState } from './hooks/useAppState';
import { getTodayStr, calculateStreak } from './utils/dates';
import { HabitCard } from './components/HabitCard';
import { ProgressRing } from './components/ProgressRing';
import { HabitFormModal } from './components/HabitFormModal';
import { SettingsModal } from './components/SettingsModal';
import { WeeklyHeatmap } from './components/WeeklyHeatmap';
import { MilestoneModal, MILESTONES, Milestone } from './components/MilestoneModal';
import { MilestoneBadges } from './components/MilestoneBadges';
import { WeeklySummary } from './components/WeeklySummary';
import { Habit } from './types';
import { Plus, Settings, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

type SortOption = 'date' | 'name' | 'priority';

export default function App() {
  const { data, addHabit, updateHabit, deleteHabit, toggleCompletion, importData, clearData } = useAppState();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  
  const [activeMilestone, setActiveMilestone] = useState<{ milestone: Milestone; habitTitle: string } | null>(null);

  const todayStr = getTodayStr();
  
  const handleOpenForm = (habit?: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
    } else {
      addHabit(habitData);
    }
  };

  const handleToggleCompletion = (habitId: string) => {
    const wasCompleted = data.completions.some(c => c.habitId === habitId && c.date === todayStr);
    
    // Create preview completions state to check streak after toggle
    const updatedCompletions = wasCompleted
      ? data.completions.filter(c => !(c.habitId === habitId && c.date === todayStr))
      : [...data.completions, { habitId, date: todayStr }];

    toggleCompletion(habitId, todayStr);

    if (!wasCompleted) {
      const targetHabit = data.habits.find(h => h.id === habitId);
      const newStreak = calculateStreak(habitId, updatedCompletions);

      // Check if new streak hits a milestone badge threshold
      const matchedMilestone = MILESTONES.find(m => m.days === newStreak);
      if (matchedMilestone && targetHabit) {
        setActiveMilestone({
          milestone: matchedMilestone,
          habitTitle: targetHabit.title,
        });
      }

      // Check for daily completion celebration (if all habits done today)
      const total = data.habits.length;
      const current = data.habits.filter(h => 
        updatedCompletions.some(c => c.habitId === h.id && c.date === todayStr)
      ).length;
      
      if (current === total && total > 0 && !matchedMilestone) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // Calculate today's progress
  const todayCompletions = data.habits.filter(h => 
    data.completions.some(c => c.habitId === h.id && c.date === todayStr)
  ).length;
  const progress = data.habits.length === 0 ? 0 : todayCompletions / data.habits.length;

  const sortedHabits = useMemo(() => {
    return [...data.habits].sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'priority') {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        // If priority is missing on older data, default to medium
        const scoreA = priorityScore[a.priority || 'medium'];
        const scoreB = priorityScore[b.priority || 'medium'];
        return scoreB - scoreA; // Descending: High first
      } else {
        // default to 'date' (createdAt descending)
        return b.createdAt - a.createdAt;
      }
    });
  }, [data.habits, sortBy]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-gray-400 font-medium mb-1">{format(new Date(), 'EEEE, MMMM do')}</p>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              Habits <Sparkles className="w-6 h-6 text-primary" />
            </h1>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-12 h-12 rounded-full bg-surface hover:bg-surface-hover flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5 shadow-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 space-y-8">
        {/* Weekly Completion Summary Bar */}
        <section>
          <WeeklySummary completions={data.completions} habits={data.habits} />
        </section>

        {/* Progress & Heatmap Section */}
        <section className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
          <div className="bg-surface rounded-3xl p-6 flex flex-col items-center justify-center border border-white/5 shadow-xl relative overflow-hidden">
             {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
            <h3 className="text-gray-400 font-medium mb-4 w-full text-center">Daily Goal</h3>
            <ProgressRing progress={progress} size={140} strokeWidth={12} />
            <p className="text-sm text-gray-400 mt-4 font-medium">
              {todayCompletions} of {data.habits.length} completed
            </p>
          </div>
          <WeeklyHeatmap completions={data.completions} habits={data.habits} />
        </section>

        {/* Milestone Badges Section */}
        <section>
          <MilestoneBadges habits={data.habits} completions={data.completions} />
        </section>

        {/* Habits List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Today's Tasks</h2>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-surface border border-white/10 text-gray-300 text-sm rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors hover:bg-surface-hover"
              >
                <option value="date">Latest</option>
                <option value="name">Name</option>
                <option value="priority">Priority</option>
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedHabits.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 px-6 bg-surface rounded-3xl border border-white/5 border-dashed"
                >
                  <div className="w-16 h-16 bg-[#1c1f26] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-white font-medium mb-2">No habits yet</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Start building a better routine by adding your first habit today.</p>
                  <button
                    onClick={() => handleOpenForm()}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Habit
                  </button>
                </motion.div>
              ) : (
                sortedHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    completions={data.completions}
                    onToggle={() => handleToggleCompletion(habit.id)}
                    onEdit={() => handleOpenForm(habit)}
                    onDelete={() => deleteHabit(habit.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* FAB */}
      <button
        onClick={() => handleOpenForm()}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary hover:bg-primary/90 text-white rounded-full shadow-[0_8px_30px_rgb(139,92,246,0.3)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
        style={{ zIndex: 40 }}
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Modals */}
      <HabitFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveHabit}
        initialData={editingHabit}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        data={data}
        onImport={importData}
        onClear={clearData}
      />

      <MilestoneModal
        isOpen={!!activeMilestone}
        onClose={() => setActiveMilestone(null)}
        milestone={activeMilestone?.milestone || null}
        habitTitle={activeMilestone?.habitTitle || ''}
      />
    </div>
  );
}
