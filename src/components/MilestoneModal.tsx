import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, X, Flame, Zap, Trophy, Rocket, Crown, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface Milestone {
  days: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  badgeBg: string;
}

export function renderMilestoneIcon(days: number, className: string = 'w-6 h-6') {
  switch (days) {
    case 3:
      return <Flame className={className} />;
    case 7:
      return <Zap className={className} />;
    case 14:
      return <Sparkles className={className} />;
    case 30:
      return <Trophy className={className} />;
    case 50:
      return <Rocket className={className} />;
    case 100:
      return <Crown className={className} />;
    default:
      return <Award className={className} />;
  }
}

export const MILESTONES: Milestone[] = [
  { days: 3, title: 'Spark Starter', description: '3 Day Streak Achieved', icon: 'Flame', color: '#f59e0b', badgeBg: 'bg-amber-500/10 border-amber-500/30' },
  { days: 7, title: 'Week Warrior', description: '7 Day Streak Achieved', icon: 'Zap', color: '#3b82f6', badgeBg: 'bg-blue-500/10 border-blue-500/30' },
  { days: 14, title: 'Fortnight Focus', description: '14 Day Streak Achieved', icon: 'Sparkles', color: '#8b5cf6', badgeBg: 'bg-violet-500/10 border-violet-500/30' },
  { days: 30, title: 'Monthly Master', description: '30 Day Streak Achieved', icon: 'Trophy', color: '#10b981', badgeBg: 'bg-emerald-500/10 border-emerald-500/30' },
  { days: 50, title: 'Unstoppable Force', description: '50 Day Streak Achieved', icon: 'Rocket', color: '#ec4899', badgeBg: 'bg-pink-500/10 border-pink-500/30' },
  { days: 100, title: 'Centurion Legend', description: '100 Day Streak Achieved', icon: 'Crown', color: '#eab308', badgeBg: 'bg-yellow-500/10 border-yellow-500/30' },
];

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone | null;
  habitTitle: string;
}

export function MilestoneModal({ isOpen, onClose, milestone, habitTitle }: MilestoneModalProps) {
  if (!milestone) return null;

  const triggerCelebrationConfetti = () => {
    const end = Date.now() + 1500;
    const colors = [milestone.color, '#ffffff', '#8b5cf6', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  React.useEffect(() => {
    if (isOpen) {
      triggerCelebrationConfetti();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 m3-scrim"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm m3-elevation-5 rounded-3xl p-6 text-center overflow-hidden"
          >
            {/* Background glow behind badge */}
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] pointer-events-none"
              style={{ backgroundColor: `${milestone.color}35` }}
            />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-4 pb-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl shadow-2xl border mb-6 relative"
                style={{
                  backgroundColor: `${milestone.color}15`,
                  borderColor: `${milestone.color}50`,
                  boxShadow: `0 0 30px ${milestone.color}40`,
                }}
              >
                {renderMilestoneIcon(milestone.days, "w-10 h-10")}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-lg"
                >
                  <Award className="w-4 h-4" />
                </motion.div>
              </motion.div>

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Milestone Unlocked!
              </span>

              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                {milestone.title}
              </h2>
              
              <p className="text-gray-300 text-sm font-medium mb-1">
                {milestone.days} Day Streak for <span className="text-white font-semibold">{habitTitle}</span>
              </p>

              <p className="text-gray-400 text-xs mb-6">
                Consistency is key! Keep up the momentum.
              </p>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2"
                style={{
                  backgroundColor: milestone.color,
                  boxShadow: `0 8px 20px -5px ${milestone.color}60`,
                }}
              >
                <CheckCircle2 className="w-5 h-5" />
                Awesome, Keep Going!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
