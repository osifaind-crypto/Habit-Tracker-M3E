import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = '#06b6d4',
  trackColor,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const offset = circumference - clampedProgress * circumference;
  const isComplete = clampedProgress === 1;

  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 900);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  return (
    <motion.div 
      initial={{ scale: 0.85, opacity: 0 }}
      animate={
        justCompleted
          ? { scale: [1, 1.12, 0.98, 1.05, 1], opacity: 1 }
          : isComplete
          ? { scale: [1, 1.04, 1], opacity: 1 }
          : { scale: 1, opacity: 1 }
      }
      transition={
        justCompleted
          ? { duration: 0.8, ease: 'easeInOut' }
          : isComplete
          ? { duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
          : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
      }
      className="relative flex items-center justify-center flex-shrink-0" 
      style={{ width: size, height: size }}
    >
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.25, 0.65, 0.25], scale: [0.92, 1.08, 0.92] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/30 via-cyan-500/30 to-indigo-500/30 blur-md pointer-events-none"
        />
      )}
      <svg className="transform -rotate-90 w-full h-full overflow-visible relative z-10">
        <defs>
          <linearGradient id="geminiProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor || 'currentColor'}
          strokeWidth={strokeWidth}
          className="text-slate-200/80 dark:text-[#1c2230] transition-colors duration-300"
        />
        {/* Progress with Framer Motion draw-in stroke animation */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#geminiProgressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.1,
          }}
          strokeLinecap="round"
          filter="url(#ringGlow)"
          className="drop-shadow-md"
        />
      </svg>
      <motion.div 
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        className="absolute flex flex-col items-center justify-center text-center z-10"
      >
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
          {Math.round(clampedProgress * 100)}%
        </span>
      </motion.div>
    </motion.div>
  );
}
