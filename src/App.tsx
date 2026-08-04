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
import { Plus, Settings, Sparkles, Filter, CheckCircle2, BarChart3, Flame, Award, Target, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

type SortOption = 'date' | 'name' | 'priority';
type ViewMode = 'tasks' | 'summaries';

export default function App() {
  const { data, addHabit, updateHabit, deleteHabit, toggleCompletion, importData, clearData } = useAppState();
  
  const [activeTab, setActiveTab] = useState<ViewMode>('tasks');
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

  // Calculate summary stats
  const totalCompletionsCount = data.completions.length;
  const bestStreak = useMemo(() => {
    if (data.habits.length === 0) return 0;
    return Math.max(...data.habits.map(h => calculateStreak(h.id, data.completions)), 0);
  }, [data.habits, data.completions]);

  const sortedHabits = useMemo(() => {
    return [...data.habits].sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'priority') {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        const scoreA = priorityScore[a.priority || 'medium'];
        const scoreB = priorityScore[b.priority || 'medium'];
        return scoreB - scoreA;
      } else {
        return b.createdAt - a.createdAt;
      }
    });
  }, [data.habits, sortBy]);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-6 pt-10 pb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{format(new Date(), 'EEEE, MMMM do')}</p>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              Habits <Sparkles className="w-6 h-6 text-primary" />
            </h1>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-11 h-11 rounded-2xl bg-surface hover:bg-surface-hover flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' ? (
            <motion.div
              key="tasks-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Tasks List Header & Filter */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Today's Tasks</h2>
                    <p className="text-xs text-gray-400">Check off your habits as you complete them</p>
                  </div>

                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none bg-surface border border-white/10 text-gray-300 text-xs font-medium rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors hover:bg-surface-hover"
                    >
                      <option value="date">Latest</option>
                      <option value="name">Name</option>
                      <option value="priority">Priority</option>
                    </select>
                    <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
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

              {/* Daily Goal Card */}
              <section className="bg-surface rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
                <div className="absolute top-1/2 left-12 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
                
                <div className="flex-shrink-0">
                  <ProgressRing progress={progress} size={130} strokeWidth={12} />
                </div>

                <div className="text-center sm:text-left flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                    <Target className="w-3.5 h-3.5" /> Daily Focus
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                    {progress === 1 ? '🎉 All Tasks Complete!' : `${todayCompletions} of ${data.habits.length} Tasks Done`}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    {data.habits.length === 0
                      ? 'No habits created yet. Add your first task to get started!'
                      : progress === 1
                      ? 'Fantastic job! You achieved 100% of your goals for today.'
                      : `${data.habits.length - todayCompletions} remaining today. Keep building your daily momentum!`}
                  </p>
                  
                  {data.habits.length > 0 && (
                    <div className="w-full bg-[#1c1f26] h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(progress * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="summaries-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Overview Metrics Cards */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col justify-between">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl w-fit mb-2">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tracking-tight">{data.habits.length}</p>
                    <p className="text-xs text-gray-400 font-medium">Active Habits</p>
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col justify-between">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tracking-tight">{totalCompletionsCount}</p>
                    <p className="text-xs text-gray-400 font-medium">Total Done</p>
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col justify-between">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-2">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tracking-tight">{bestStreak}d</p>
                    <p className="text-xs text-gray-400 font-medium">Best Streak</p>
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col justify-between">
                  <div className="p-2 bg-secondary/10 text-secondary rounded-xl w-fit mb-2">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {Math.round(progress * 100)}%
                    </p>
                    <p className="text-xs text-gray-400 font-medium">Today's Rate</p>
                  </div>
                </div>
              </section>

              {/* Weekly Completion Summary Bar */}
              <section>
                <WeeklySummary completions={data.completions} habits={data.habits} />
              </section>

              {/* Heatmap Section */}
              <section>
                <WeeklyHeatmap completions={data.completions} habits={data.habits} />
              </section>

              {/* Milestone Badges Section */}
              <section>
                <MilestoneBadges habits={data.habits} completions={data.completions} />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Pill-Shaped Bottom Navigation Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[92vw]">
        <nav className="bg-[#16181d]/95 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Today's Tasks</span>
            {data.habits.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'tasks' ? 'bg-white/20 text-white' : 'bg-[#1c1f26] text-gray-400'
              }`}>
                {todayCompletions}/{data.habits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('summaries')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'summaries'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Summaries</span>
          </button>

          <div className="h-5 w-px bg-white/10 mx-0.5" />

          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs px-3.5 py-2.5 rounded-full shadow-md hover:brightness-110 active:scale-95 transition-all"
            title="Create new habit"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </nav>
      </div>

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

