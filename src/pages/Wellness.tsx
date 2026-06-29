import React, { useState, Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Brain, Wind, Smile, Meh, Frown, Play, Loader2 } from 'lucide-react';

const BreathingExercise = React.lazy(() => 
  import('@/components/wellness/BreathingExercise').then(module => ({ default: module.BreathingExercise }))
);

export function Wellness() {
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);

  const moods = [
    { id: 'great', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { id: 'okay', icon: Meh, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'bad', icon: Frown, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Mental Wellness
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Take a moment for yourself. Track your mood and practice mindfulness.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-center items-center py-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">How are you feeling today?</h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setActiveMood(mood.id)}
                className={`p-4 sm:p-6 rounded-3xl transition-all duration-300 flex flex-col items-center gap-2 sm:gap-3 ${
                  activeMood === mood.id 
                    ? `scale-105 sm:scale-110 shadow-lg ${mood.bg} border-2 border-white/20` 
                    : 'bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 opacity-60 hover:opacity-100 border-2 border-transparent'
                }`}
              >
                <mood.icon className={mood.color} size={48} strokeWidth={1.5} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize">{mood.id}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col items-center py-10 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setIsBreathingOpen(true)}>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500"></div>
          
          <div className="relative z-10 flex flex-col items-center h-full justify-center">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-6 shadow-sm">
              <Wind size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Breathing Exercise</h2>
            <p className="text-slate-500 text-sm mb-8 text-center max-w-[240px]">
              Immersive, guided breathing sessions to reset your nervous system.
            </p>
            
            <button 
              className="px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Play size={18} className="fill-current" /> Start Session
            </button>
          </div>
        </Card>
      </div>
      
      {isBreathingOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading Breathing Session...</p>
          </div>
        }>
          <BreathingExercise isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
