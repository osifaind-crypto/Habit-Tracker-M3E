import { Habit, CompletionRecord } from '../types';
import { calculateStreak, isCompletedToday } from '../utils/dates';
import { CategoryManager } from '../utils/categories';
import { motion } from 'motion/react';
import { Check, Flame, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface HabitCardProps {
  key?: React.Key;
  habit: Habit;
  completions: CompletionRecord[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, completions, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const completed = isCompletedToday(habit.id, completions);
  const streak = calculateStreak(habit.id, completions);
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
      className={`relative rounded-3xl p-4 sm:p-5 flex items-center gap-4 transition-colors duration-300 ${
        completed ? 'bg-surface-hover' : 'bg-surface'
      }`}
      style={{
        boxShadow: completed ? `0 0 15px -5px ${habit.color}40` : 'none',
        border: `1px solid ${completed ? `${habit.color}50` : 'transparent'}`,
      }}
    >
      <button
        onClick={onToggle}
        className="shrink-0 flex items-center justify-center rounded-full transition-all duration-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: completed ? habit.color : '#2a2d36',
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
        <h3 className="text-lg font-semibold truncate text-white">
          {habit.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
          <span className="flex items-center gap-1 font-medium text-gray-300 truncate">
            <span>{categoryDef.icon}</span>
            <span>{habit.category}</span>
          </span>
          <span>•</span>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            habit.priority === 'high' ? 'bg-red-500/20 text-red-400' :
            habit.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
            'bg-emerald-500/20 text-emerald-400'
          }`}>
            {habit.priority || 'medium'}
          </span>
          {streak > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-orange-400 font-medium">
                <Flame className="w-4 h-4" />
                {streak}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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
              className="absolute right-0 top-full mt-2 w-36 bg-[#1c1f26] rounded-xl shadow-xl z-20 overflow-hidden border border-white/10"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit();
                }}
                className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/5 transition-colors text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/5 transition-colors text-red-400 text-sm"
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
