import React, { useState, useMemo, useEffect } from 'react';
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
import { MonthlyHeatmap } from './components/MonthlyHeatmap';
import { HistoricalLogModal } from './components/HistoricalLogModal';
import { DailyMotivation } from './components/DailyMotivation';
import { Habit, CompletionRecord } from './types';
import { Plus, Settings, Sparkles, CheckCircle2, BarChart3, Flame, Target, TrendingUp, Sun, Moon, GripVertical, Eye, EyeOff, SlidersHorizontal, ArrowUp, ArrowDown, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { format } from 'date-fns';

type ViewMode = 'tasks' | 'summaries';

interface SummarySectionConfig {
  id: string;
  name: string;
  visible: boolean;
}

const DEFAULT_SUMMARY_SECTIONS: SummarySectionConfig[] = [
  { id: 'metrics', name: 'Key Metrics Overview', visible: true },
  { id: 'monthly_heatmap', name: 'Monthly Activity Overview', visible: true },
  { id: 'weekly_summary', name: 'Weekly Progress Bar', visible: true },
  { id: 'weekly_heatmap', name: 'Weekly Heatmap Grid', visible: true },
  { id: 'milestones', name: 'Milestone Badges', visible: true },
];

function HabitListItem({
  habit,
  completions,
  onToggle,
  onEdit,
  onDelete,
}: {
  key?: React.Key;
  habit: Habit;
  completions: CompletionRecord[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={habit}
      id={habit.id}
      dragControls={dragControls}
      dragListener={false}
      className="relative select-none"
      whileDrag={{ scale: 1.02, zIndex: 50, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
    >
      <HabitCard
        habit={habit}
        completions={completions}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
}

export default function App() {
  const { data, addHabit, updateHabit, deleteHabit, reorderHabits, toggleCompletion, importData, clearData } = useAppState();
  
  const [activeTab, setActiveTab] = useState<ViewMode>('tasks');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  
  // Customizable Summaries Layout State
  const [summarySections, setSummarySections] = useState<SummarySectionConfig[]>(() => {
    try {
      const saved = localStorage.getItem('summaries_layout_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_SUMMARY_SECTIONS;
  });
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  useEffect(() => {
    localStorage.setItem('summaries_layout_config', JSON.stringify(summarySections));
  }, [summarySections]);

  const toggleSectionVisibility = (id: string) => {
    setSummarySections(prev => prev.map(sec => sec.id === id ? { ...sec, visible: !sec.visible } : sec));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= summarySections.length) return;
    const updated = [...summarySections];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setSummarySections(updated);
  };

  const resetSummaryLayout = () => {
    setSummarySections(DEFAULT_SUMMARY_SECTIONS);
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activeMilestone, setActiveMilestone] = useState<{ milestone: Milestone; habitTitle: string } | null>(null);
  const [historicalLogDate, setHistoricalLogDate] = useState<string | null>(null);

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

  const handleToggleCompletionForDate = (habitId: string, targetDate: string = todayStr) => {
    const wasCompleted = data.completions.some(c => c.habitId === habitId && c.date === targetDate);
    
    // Create preview completions state to check streak after toggle
    const updatedCompletions = wasCompleted
      ? data.completions.filter(c => !(c.habitId === habitId && c.date === targetDate))
      : [...data.completions, { habitId, date: targetDate }];

    toggleCompletion(habitId, targetDate);

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

      // Check for completion celebration if targeting today
      if (targetDate === todayStr) {
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
    }
  };

  const handleToggleCompletion = (habitId: string) => {
    handleToggleCompletionForDate(habitId, todayStr);
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

  const renderSummaryWidget = (id: string) => {
    switch (id) {
      case 'metrics':
        return (
          <section key="metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#121824] rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
              <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-cyan-400 rounded-xl w-fit mb-2">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{data.habits.length}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Active Habits</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121824] rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{totalCompletionsCount}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Total Done</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121824] rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
              <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl w-fit mb-2">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{bestStreak}d</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Best Streak</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121824] rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
              <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {Math.round(progress * 100)}%
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Today's Rate</p>
              </div>
            </div>
          </section>
        );
      case 'monthly_heatmap':
        return (
          <section key="monthly_heatmap">
            <MonthlyHeatmap
              habits={data.habits}
              completions={data.completions}
              onSelectDate={(dateStr) => setHistoricalLogDate(dateStr)}
            />
          </section>
        );
      case 'weekly_summary':
        return (
          <section key="weekly_summary">
            <WeeklySummary completions={data.completions} habits={data.habits} />
          </section>
        );
      case 'weekly_heatmap':
        return (
          <section key="weekly_heatmap">
            <WeeklyHeatmap
              completions={data.completions}
              habits={data.habits}
              onSelectDate={(dateStr) => setHistoricalLogDate(dateStr)}
            />
          </section>
        );
      case 'milestones':
        return (
          <section key="milestones">
            <MilestoneBadges habits={data.habits} completions={data.completions} />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 pb-32 transition-colors duration-300 relative overflow-hidden">
      {/* Subtle Ambient Wash */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10 animate-gemini-glow" />

      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-semibold tracking-wide uppercase">{format(new Date(), 'EEEE, MMMM do')}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 flex items-center gap-2">
              <span className="text-slate-900 dark:text-white">Habit Tracker</span>
              <Sparkles className="w-5 h-5 text-teal-500 dark:text-cyan-400 opacity-80" />
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              className="w-10 h-10 rounded-xl bg-white dark:bg-[#121824] hover:bg-slate-100 dark:hover:bg-[#1a2333] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200/80 dark:border-white/10 active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Settings Button */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-[#121824] hover:bg-slate-100 dark:hover:bg-[#1a2333] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200/80 dark:border-white/10 active:scale-95"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
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
              {/* Daily Motivation Quote */}
              <DailyMotivation />

              {/* Tasks List Header */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Today's Tasks</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {data.habits.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 px-6 bg-white dark:bg-[#121824] rounded-3xl border border-slate-200/80 dark:border-white/5 border-dashed"
                    >
                      <div className="w-16 h-16 bg-slate-100 dark:bg-[#1c1f26] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-teal-500 dark:text-gray-500" />
                      </div>
                      <h3 className="text-slate-900 dark:text-white font-medium mb-2">No habits yet</h3>
                      <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 max-w-xs mx-auto">Start building a better routine by adding your first habit today.</p>
                      <button
                        onClick={() => handleOpenForm()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 text-white px-6 py-3 rounded-full font-medium hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
                      >
                        <Plus className="w-5 h-5" />
                        Create Habit
                      </button>
                    </motion.div>
                  ) : (
                    <Reorder.Group
                      axis="y"
                      values={data.habits}
                      onReorder={(newOrder) => {
                        reorderHabits(newOrder);
                      }}
                      className="space-y-3"
                    >
                      {data.habits.map(habit => (
                        <HabitListItem
                          key={habit.id}
                          habit={habit}
                          completions={data.completions}
                          onToggle={() => handleToggleCompletion(habit.id)}
                          onEdit={() => handleOpenForm(habit)}
                          onDelete={() => deleteHabit(habit.id)}
                        />
                      ))}
                    </Reorder.Group>
                  )}
                </div>
              </section>

              {/* Daily Goal Card */}
              <section className="bg-white dark:bg-[#121824] rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
                <div className="absolute top-1/2 left-12 -translate-y-1/2 w-32 h-32 bg-cyan-500/15 rounded-full blur-[50px] pointer-events-none" />
                
                <div className="flex-shrink-0">
                  <ProgressRing progress={progress} size={130} strokeWidth={12} />
                </div>

                <div className="text-center sm:text-left flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-cyan-400 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-cyan-500/15 border border-teal-500/20 dark:border-cyan-500/20 mb-2">
                    <Target className="w-3.5 h-3.5" /> Daily Focus
                  </span>
                  <h3 className="text-xl font-bold tracking-tight mb-1">
                    {progress === 1 ? 'All Tasks Complete!' : `${todayCompletions} of ${data.habits.length} Tasks Done`}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-3">
                    {data.habits.length === 0
                      ? 'No habits created yet. Add your first task to get started!'
                      : progress === 1
                      ? 'Fantastic job! You achieved 100% of your goals for today.'
                      : `${data.habits.length - todayCompletions} remaining today. Keep building your daily momentum!`}
                  </p>
                  
                  {data.habits.length > 0 && (
                    <div className="w-full bg-slate-100 dark:bg-[#1c2230] h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
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
              className="space-y-6"
            >
              {/* Header with Edit Layout Toggle */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Summaries & Analytics</h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Personalize your reports and stats layout</p>
                </div>
                <div className="flex items-center gap-2">
                  {isEditingLayout && (
                    <button
                      onClick={resetSummaryLayout}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
                      title="Reset to default layout"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditingLayout(!isEditingLayout)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 ${
                      isEditingLayout
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white dark:bg-[#121824] text-slate-700 dark:text-gray-300 border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {isEditingLayout ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
                        <span>Edit Layout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Layout Editor Panel (when editing) */}
              {isEditingLayout && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-teal-500/5 dark:bg-cyan-500/5 border border-teal-500/20 dark:border-cyan-500/20 space-y-3"
                >
                  <div className="text-xs font-semibold text-teal-800 dark:text-cyan-300 flex items-center justify-between">
                    <span>Customize Widgets & Order</span>
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-normal">Drag or use arrows to reorder, toggle eye to show/hide</span>
                  </div>

                  <Reorder.Group
                    axis="y"
                    values={summarySections}
                    onReorder={setSummarySections}
                    className="space-y-2"
                  >
                    {summarySections.map((sec, idx) => (
                      <Reorder.Item
                        key={sec.id}
                        value={sec}
                        id={sec.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all border ${
                          sec.visible
                            ? 'bg-white dark:bg-[#121824] border-slate-200 dark:border-white/10'
                            : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GripVertical className="w-4 h-4 text-slate-400 dark:text-gray-500 cursor-grab active:cursor-grabbing" />
                          <span className={`text-xs font-medium ${sec.visible ? 'text-slate-800 dark:text-gray-200' : 'text-slate-600 dark:text-gray-300'}`}>
                            {sec.name}
                          </span>
                          {!sec.visible && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <EyeOff className="w-3 h-3" />
                              Hidden
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveSection(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 text-slate-500 dark:text-gray-400"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveSection(idx, 'down')}
                            disabled={idx === summarySections.length - 1}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 text-slate-500 dark:text-gray-400"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleSectionVisibility(sec.id)}
                            className={`p-1.5 rounded-md transition-colors ${
                              sec.visible
                                ? 'text-teal-600 dark:text-cyan-400 hover:bg-teal-50 dark:hover:bg-cyan-950/40'
                                : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                            }`}
                            title={sec.visible ? 'Hide section' : 'Show section'}
                          >
                            {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </motion.div>
              )}

              {/* Render active summary sections in user defined order */}
              <div className="space-y-8">
                {summarySections
                  .filter(sec => sec.visible)
                  .map(sec => renderSummaryWidget(sec.id))}

                {summarySections.every(sec => !sec.visible) && (
                  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                    <EyeOff className="w-8 h-8 text-slate-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">All summary widgets are hidden</p>
                    <button
                      onClick={resetSummaryLayout}
                      className="mt-3 text-xs font-semibold text-teal-600 dark:text-cyan-400 hover:underline"
                    >
                      Reset layout to show default widgets
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Pill-Shaped Bottom Navigation Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[92vw]">
        <nav className="bg-white/90 dark:bg-[#121824]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-1.5 rounded-full shadow-lg flex items-center gap-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-teal-500/15 text-teal-700 dark:text-cyan-300 font-semibold'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tasks</span>
            {data.habits.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'tasks' ? 'bg-teal-500/20 text-teal-700 dark:text-cyan-300' : 'bg-slate-200 dark:bg-[#1c1f26] text-slate-600 dark:text-gray-400'
              }`}>
                {todayCompletions}/{data.habits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('summaries')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'summaries'
                ? 'bg-teal-500/15 text-teal-700 dark:text-cyan-300 font-semibold'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Summaries</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-0.5" />

          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs px-3.5 py-2 rounded-full shadow-sm active:scale-95 transition-all"
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

      <HistoricalLogModal
        isOpen={!!historicalLogDate}
        dateStr={historicalLogDate}
        onClose={() => setHistoricalLogDate(null)}
        habits={data.habits}
        completions={data.completions}
        onToggleCompletion={handleToggleCompletionForDate}
        onSelectDate={(newDate) => setHistoricalLogDate(newDate)}
      />
    </div>
  );
}

