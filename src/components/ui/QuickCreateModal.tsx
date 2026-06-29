import React, { useState } from 'react';
import { Card } from './Card';
import { X, Droplet, Scale, Moon, Activity, Droplets, HeartPulse, Stethoscope, Thermometer, Smile, Brain, Apple, Pill } from 'lucide-react';
import { AddRecordModal } from './AddRecordModal';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { id: 'waterLogs', label: 'Water Intake', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'weightLogs', label: 'Weight', icon: Scale, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'sleepLogs', label: 'Sleep', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'bloodPressureLogs', label: 'Blood Pressure', icon: Activity, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'bloodSugarLogs', label: 'Blood Sugar', icon: Droplets, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'heartRateLogs', label: 'Heart Rate', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'oxygenLogs', label: 'SpO₂', icon: Stethoscope, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'temperatureLogs', label: 'Body Temp', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'moodLogs', label: 'Mood', icon: Smile, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'stressLogs', label: 'Stress', icon: Brain, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'nutritionLogs', label: 'Nutrition', icon: Apple, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'medicineLogs', label: 'Medicine', icon: Pill, color: 'text-teal-500', bg: 'bg-teal-500/10' },
];

export function QuickCreateModal({ isOpen, onClose }: QuickCreateModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  if (!isOpen && !selectedType) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !selectedType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-2xl p-6 md:p-8 hide-scrollbar"
            >
              <button 
                onClick={onClose} 
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-2">
                  Quick Create Log
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Add today's health records
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => setSelectedType(action.id)}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", action.bg, action.color)}>
                        <Icon size={24} />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-lg">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddRecordModal
        isOpen={!!selectedType}
        onClose={() => {
          setSelectedType(null);
        }}
        onSuccess={() => {
          setSelectedType(null);
          onClose();
        }}
        initialTab={selectedType || 'waterLogs'}
      />
    </>
  );
}
