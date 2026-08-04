import { Habit, CompletionRecord } from '../types';
import { calculateStreak, isCompletedToday, getStreakStartDate, calculateConsistencyScore } from '../utils/dates';
import { CategoryManager } from '../utils/categories';
import { motion, AnimatePresence, DragControls } from 'motion/react';
import { Check, Flame, MoreVertical, Edit2, Trash2, Calendar, ChevronDown, TrendingUp, GripVertical } from 'lucide-react';
import React, { useState } from 'react';

interface HabitCardProps {
  key?: React.Key;
  habit: Habit;
  completions: CompletionRecord[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  dragControls?: DragControls;
}

export function HabitCard({ habit, completions, onToggle, onEdit, onDelete, dragControls }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isStreakExpanded, setIsStreakExpanded] = useState(false);
  const completed = isCompletedToday(habit.id, completions);
  const streakInfo = getStreakStartDate(habit.id, completions);
  const isHotStreak = streakInfo.streak > 3;
  const consistencyScore = calculateConsistencyScore(habit, completions);
  const categoryDef = CategoryManager.getCategoryByName(habit.category);

  return (
    <motion.div
      layout
      transition={{
        layout: { type: 'spring', damping: 25, stiffness: 280 },
        opacity: { duration: 0.2 },
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={`relative rounded-3xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-300 shadow-sm dark:shadow-xl ${
        completed
          ? 'bg-slate-100/80 dark:bg-[#182030]'
          : 'bg-white dark:bg-[#121824]'
      }`}
      style={{
        boxShadow: completed ? `0 0 18px -4px ${habit.color}35` : undefined,
        border: `1px solid ${completed ? `${habit.color}60` : 'rgba(148, 163, 184, 0.15)'}`,
      }}
    >
      {dragControls && (
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="shrink-0 p-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-gray-600 dark:hover:text-gray-300 opacity-40 hover:opacity-100 transition-opacity touch-none -ml-1"
          title="Drag handle to reorder priority"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      <button
        onClick={onToggle}
        className="shrink-0 flex items-center justify-center rounded-full transition-all duration-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: completed ? habit.color : 'rgba(148, 163, 184, 0.2)',
        }}
      >
        <motion.div
          initial={false}
          animate={{ scale: completed ? 1 : 0, opacity: completed ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Check className="w-6 h-6 text-white" />
        </motion.div>
      </button>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold truncate text-slate-900 dark:text-white">
          {habit.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-gray-400 flex-wrap">
          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-gray-300 truncate">
            <span>{categoryDef.icon}</span>
            <span>{habit.category}</span>
          </span>
          <span>•</span>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            habit.priority === 'high' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
            habit.priority === 'medium' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
            'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }`}>
            {habit.priority || 'medium'}
          </span>
          {streakInfo.streak > 0 && (
            <>
              <span>•</span>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStreakExpanded(!isStreakExpanded);
                  }}
                  className={`streak-badge flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs transition-all cursor-pointer border active:scale-95 ${
                    isHotStreak
                      ? 'text-amber-500 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20'
                  }`}
                  title={isHotStreak ? "Hot streak! (>3 days) Click to view streak start date" : "Click to view streak start date"}
                >
                  <div className="relative flex items-center justify-center">
                    {isHotStreak && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
                        <span className="absolute w-1 h-1 rounded-full bg-amber-300 flame-spark-1" />
                        <span className="absolute w-1 h-1 rounded-full bg-orange-400 flame-spark-2" />
                        <span className="absolute w-1 h-1 rounded-full bg-yellow-200 flame-spark-3" />
                      </div>
                    )}
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        isHotStreak
                          ? 'text-amber-400 fill-amber-400/40 animate-flame-flicker'
                          : 'text-amber-500 dark:text-amber-400 fill-amber-400/20'
                      }`}
                    />
                  </div>
                  <span>{streakInfo.streak}d</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isStreakExpanded ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isStreakExpanded && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsStreakExpanded(false);
                        }}
                      />
                      <motion.div
                        initial={{ opacity: 0, scaleY: 0.85, scaleX: 0.95, y: -8 }}
                        animate={{ opacity: 1, scaleY: 1, scaleX: 1, y: 0 }}
                        exit={{ opacity: 0, scaleY: 0.85, scaleX: 0.95, y: -8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="streak-detail-view origin-top-left absolute left-0 top-full mt-2 z-30 min-w-[190px] bg-white dark:bg-[#1c1f26] border border-amber-500/30 rounded-2xl p-3 shadow-2xl text-xs text-slate-800 dark:text-gray-200 space-y-1.5 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 pb-1.5 border-b border-slate-200 dark:border-white/10">
                          <div className="relative flex items-center justify-center">
                            {isHotStreak && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
                                <span className="absolute w-1 h-1 rounded-full bg-amber-300 flame-spark-1" />
                                <span className="absolute w-1 h-1 rounded-full bg-orange-400 flame-spark-2" />
                              </div>
                            )}
                            <Flame
                              className={`w-4 h-4 ${
                                isHotStreak
                                  ? 'text-amber-400 fill-amber-400/40 animate-flame-flicker'
                                  : 'text-amber-500 dark:text-amber-400 fill-amber-400/20'
                              }`}
                            />
                          </div>
                          <span>Streak Overview</span>
                          {isHotStreak && (
                            <span className="ml-auto text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Hot 🔥
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-gray-300 pt-0.5">
                          <span className="text-slate-400 dark:text-gray-400">Current Streak:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{streakInfo.streak} {streakInfo.streak === 1 ? 'day' : 'days'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-gray-300">
                          <span className="text-slate-400 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                            Started on:
                          </span>
                          <span className="font-semibold text-amber-600 dark:text-amber-300">{streakInfo.formattedStartDate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-gray-300 pt-1 border-t border-slate-200 dark:border-white/10">
                          <span className="text-slate-400 dark:text-gray-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                            Consistency:
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{consistencyScore}%</span>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-[#1c1f26] text-slate-800 dark:text-gray-200 rounded-xl shadow-xl z-20 overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit();
                }}
                className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-red-500 dark:text-red-400 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
