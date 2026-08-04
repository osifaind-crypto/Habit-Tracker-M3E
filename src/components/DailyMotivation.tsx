import React, { useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuoteItem {
  quote: string;
  author: string;
  category?: string;
}

const DEFAULT_QUOTES: QuoteItem[] = [
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "Consistency" },
  { quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "Small Wins" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", category: "Systems" },
  { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun", category: "Habits" },
  { quote: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock", category: "Routine" },
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", category: "Persistence" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "Discipline" },
  { quote: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "Action" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Perseverance" },
  { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: "Start Small" }
];

export function DailyMotivation() {
  const [currentQuote, setCurrentQuote] = useState<QuoteItem>(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return DEFAULT_QUOTES[dayOfYear % DEFAULT_QUOTES.length];
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchNewQuote = async () => {
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch('https://dummyjson.com/quotes/random', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.quote && data.author) {
          setCurrentQuote({ quote: data.quote, author: data.author, category: "Inspiration" });
          setIsLoading(false);
          return;
        }
      }
    } catch {}

    const available = DEFAULT_QUOTES.filter(q => q.quote !== currentQuote.quote);
    const randomIndex = Math.floor(Math.random() * available.length);
    setCurrentQuote(available[randomIndex] || DEFAULT_QUOTES[0]);
    setIsLoading(false);
  };

  return (
    <div className="mb-6 rounded-2xl bg-slate-100/60 dark:bg-[#121824]/60 border border-slate-200/60 dark:border-white/5 p-4 transition-all">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-teal-500 dark:text-cyan-400" />
          <span>Daily Thought</span>
        </div>
        <button
          onClick={fetchNewQuote}
          disabled={isLoading}
          className="p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 transition-colors"
          title="New quote"
          aria-label="Refresh quote"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuote.quote}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}
        >
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
            "{currentQuote.quote}"
          </p>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 font-medium text-right mt-1">
            — {currentQuote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
