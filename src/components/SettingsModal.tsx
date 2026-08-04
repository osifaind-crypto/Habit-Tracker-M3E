import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Upload, AlertTriangle } from 'lucide-react';
import { AppData } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onImport: (data: AppData) => void;
  onClear: () => void;
}

export function SettingsModal({ isOpen, onClose, data, onImport, onClear }: SettingsModalProps) {
  
  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && Array.isArray(imported.habits) && Array.isArray(imported.completions)) {
          onImport(imported);
          onClose();
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to read backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      onClear();
      onClose();
    }
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface rounded-3xl p-6 shadow-2xl border border-white/5"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1c1f26] border border-white/5">
                <h3 className="text-white font-medium mb-2">Data Backup</h3>
                <p className="text-sm text-gray-400 mb-4">Export your habits and history to a file, or restore from a previous backup.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl transition-colors font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl transition-colors font-medium text-sm cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <h3 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h3>
                <p className="text-sm text-red-400/80 mb-4">Permanently delete all habits and history. This action cannot be undone.</p>
                <button
                  onClick={handleClear}
                  className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors text-sm"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
