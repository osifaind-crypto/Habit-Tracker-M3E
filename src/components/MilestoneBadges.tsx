import React, { useState } from 'react';
import { Habit, CompletionRecord } from '../types';
import { calculateStreak } from '../utils/dates';
import { MILESTONES, Milestone } from './MilestoneModal';
import { Award, Lock, Sparkles, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MilestoneBadgesProps {
  habits: Habit[];
  completions: CompletionRecord[];
}

export function MilestoneBadges({ habits, completions }: MilestoneBadgesProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Calculate highest streaks per habit and overall unlocked milestones
  const habitStreaks = habits.map(h => ({
    habit: h,
    streak: calculateStreak(h.id, completions),
  }));

  const maxStreak = habitStreaks.reduce((max, hs) => Math.max(max, hs.streak), 0);

  // Unlocked milestone check
  const unlockedDays = new Set<number>();
  habitStreaks.forEach(hs => {
    MILESTONES.forEach(m => {
      if (hs.streak >= m.days) {
        unlockedDays.add(m.days);
      }
    });
  });

  return (
    <div className="bg-surface rounded-3xl p-6 border border-white/5 shadow-xl relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Streak Badges</h3>
            <p className="text-gray-400 text-xs">
              {unlockedDays.size} of {MILESTONES.length} unlocked • Best Streak: {maxStreak}d
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
        {MILESTONES.map(m => {
          const isUnlocked = unlockedDays.has(m.days);
          // Find habits that achieved this
          const qualifyingHabits = habitStreaks.filter(hs => hs.streak >= m.days);

          return (
            <motion.button
              key={m.days}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMilestone(m)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center relative focus:outline-none ${
                isUnlocked
                  ? `${m.badgeBg} shadow-md`
                  : 'bg-[#181a21] border-white/5 text-gray-600 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-1.5 relative ${
                  isUnlocked ? 'bg-white/10' : 'bg-white/5'
                }`}
              >
                <span>{m.icon}</span>
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </div>
              <span className={`text-[11px] font-bold truncate w-full ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                {m.title}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {m.days} days
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Detail Popover / Modal when badge clicked */}
      <AnimatePresence>
        {selectedMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMilestone(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative w-full max-w-xs bg-[#1a1c23] rounded-2xl p-5 shadow-2xl border border-white/10 text-center"
            >
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-3 border shadow-lg"
                style={{
                  backgroundColor: `${selectedMilestone.color}20`,
                  borderColor: `${selectedMilestone.color}40`,
                }}
              >
                {selectedMilestone.icon}
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{selectedMilestone.title}</h4>
              <p className="text-xs text-primary font-semibold mb-3">
                {selectedMilestone.days}-Day Streak Milestone
              </p>

              <div className="text-xs text-gray-300 bg-surface p-3 rounded-xl mb-4 border border-white/5">
                {unlockedDays.has(selectedMilestone.days) ? (
                  <div className="space-y-1">
                    <p className="text-emerald-400 font-medium flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Badge Unlocked!
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Achieved with:{' '}
                      <span className="text-white font-medium">
                        {habitStreaks
                          .filter(hs => hs.streak >= selectedMilestone.days)
                          .map(hs => hs.habit.title)
                          .join(', ')}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    Reach a <span className="text-white font-semibold">{selectedMilestone.days}-day streak</span> on any habit to unlock this badge.
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedMilestone(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
