import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import { CategoryManager, CategoryDef } from '../utils/categories';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Tag } from 'lucide-react';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  initialData?: Habit;
}

const COLORS = [
  '#8b5cf6', // Violet
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

export function HabitFormModal({ isOpen, onClose, onSave, initialData }: HabitFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Custom Category State
  const [categories, setCategories] = useState<CategoryDef[]>([]);
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  useEffect(() => {
    if (isOpen) {
      const allCat = CategoryManager.getCategories();
      setCategories(allCat);

      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setCategory(initialData.category);
        setColor(initialData.color);
        setFrequency(initialData.frequency);
        setPriority(initialData.priority || 'medium');
      } else {
        setTitle('');
        setDescription('');
        const defaultCat = allCat[0]?.name || 'Health';
        setCategory(defaultCat);
        setColor(allCat[0]?.color || COLORS[0]);
        setFrequency('daily');
        setPriority('medium');
      }
      setIsAddingCustomCategory(false);
      setNewCatName('');
    }
  }, [initialData, isOpen]);

  const handleSelectCategory = (cat: CategoryDef) => {
    setCategory(cat.name);
    setColor(cat.color);
  };

  const handleAddCustomCategory = () => {
    if (!newCatName.trim()) return;
    const created = CategoryManager.addCategory({
      name: newCatName.trim(),
      icon: newCatIcon || '',
      color: color,
    });
    setCategories(CategoryManager.getCategories());
    setCategory(created.name);
    setIsAddingCustomCategory(false);
    setNewCatName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      color,
      frequency,
      priority,
    });
    onClose();
  };

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md m3-elevation-5 rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {initialData ? 'Edit Habit' : 'New Habit'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Drink Water"
                  className="w-full bg-slate-100 dark:bg-[#1c1f26] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              {/* Category Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-gray-400">Category</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                    className="text-xs text-teal-600 dark:text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Custom
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map(cat => {
                    const isSelected = category.toLowerCase() === cat.name.toLowerCase();
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                          isSelected
                            ? 'bg-cyan-500/20 text-slate-900 dark:text-white border-cyan-500 shadow-sm'
                            : 'bg-slate-100 dark:bg-[#1c1f26] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:bg-slate-200/60 dark:hover:bg-white/5'
                        }`}
                        style={isSelected ? { borderColor: cat.color, backgroundColor: `${cat.color}25` } : {}}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {isAddingCustomCategory && (
                  <div className="p-3 bg-slate-100 dark:bg-[#1c1f26] rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tag (optional)"
                        value={newCatIcon}
                        onChange={e => setNewCatIcon(e.target.value)}
                        className="w-16 bg-white dark:bg-[#13151b] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1.5 text-center text-sm text-slate-900 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="New category name"
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#13151b] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="w-full py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      Add Category
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">Priority</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-xl text-sm font-medium transition-colors border ${
                        priority === p 
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold' 
                          : 'bg-slate-100 dark:bg-[#1c1f26] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">Theme Color</label>
                <div className="flex gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 hover:brightness-110 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 focus:outline-none"
                >
                  {initialData ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

