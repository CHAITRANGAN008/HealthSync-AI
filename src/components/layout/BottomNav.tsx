import React from 'react';
import { Home, Activity, Brain, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'aicoach', label: 'AI Coach', icon: Bot },
  { id: 'wellness', label: 'Wellness', icon: Brain },
];

export function BottomNav({ currentTab, setCurrentTab }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-30 px-2 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-emerald-500" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
