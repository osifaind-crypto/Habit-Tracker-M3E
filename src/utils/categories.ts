export interface CategoryDef {
  id: string;
  name: string;
  icon: string; // Emoji or Lucide icon key
  color: string;
}

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'health', name: 'Health', icon: '❤️', color: '#10b981' },
  { id: 'fitness', name: 'Fitness', icon: '🏋️', color: '#ef4444' },
  { id: 'learning', name: 'Learning', icon: '📚', color: '#8b5cf6' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', color: '#0ea5e9' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧘', color: '#ec4899' },
  { id: 'finance', name: 'Finance', icon: '💰', color: '#f59e0b' },
  { id: 'personal', name: 'Personal', icon: '👤', color: '#6366f1' },
];

const CUSTOM_CATEGORIES_KEY = 'habit-tracker-custom-categories';

export class CategoryManager {
  static getCategories(): CategoryDef[] {
    try {
      const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
      if (stored) {
        const custom: CategoryDef[] = JSON.parse(stored);
        return [...DEFAULT_CATEGORIES, ...custom];
      }
    } catch (e) {
      console.error('Failed to parse custom categories', e);
    }
    return DEFAULT_CATEGORIES;
  }

  static addCategory(category: Omit<CategoryDef, 'id'>): CategoryDef {
    const categories = this.getCategories();
    const newCategory: CategoryDef = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, '-'),
    };
    
    // Check if category name already exists
    const existing = categories.find(c => c.name.toLowerCase() === newCategory.name.toLowerCase());
    if (existing) return existing;

    const customOnly = categories.filter(c => !DEFAULT_CATEGORIES.some(d => d.id === c.id));
    customOnly.push(newCategory);
    
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customOnly));
    return newCategory;
  }

  static getCategoryByName(name: string): CategoryDef {
    const categories = this.getCategories();
    const found = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    return found || {
      id: 'other',
      name: name || 'General',
      icon: '📌',
      color: '#8b5cf6',
    };
  }
}
