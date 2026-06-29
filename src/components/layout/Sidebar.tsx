import React from 'react';
import { Home, Activity, Brain, Bot, PieChart, Settings, LogOut, Droplet, Cloud, X, Pill, Trophy, FileText, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  onOpenQuickCreate: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'records', label: 'Health Records', icon: Activity },
  { id: 'ai-coach', label: 'AI Health Coach', icon: Bot },
  { id: 'analytics', label: 'Analytics & Reports', icon: PieChart },
  { id: 'medicine', label: 'Medicine & Reminders', icon: Pill },
  { id: 'challenges', label: 'Challenges & XP', icon: Trophy },
  { id: 'grocery', label: 'AI Grocery List', icon: ShoppingBag },
  { id: 'wellness', label: 'Mental Wellness', icon: Brain },
  { id: 'air-quality', label: 'Air Pollution', icon: Cloud },
  { id: 'passport', label: 'Health Passport', icon: FileText },
];

  export function Sidebar({ currentTab, setCurrentTab, isMobileMenuOpen, setIsMobileMenuOpen, onOpenQuickCreate }: SidebarProps) {
  return (
    <aside className={cn(
      "w-64 lg:w-[220px] h-screen fixed left-0 top-0 border-r border-white/30 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col p-6 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0",
      isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">HealthSync AI</span>
        </div>
        {setIsMobileMenuOpen && (
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 space-y-1 overflow-y-auto pb-4 hide-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
              currentTab === item.id 
                ? "bg-slate-900 dark:bg-emerald-500 text-white shadow-md shadow-slate-900/10 dark:shadow-emerald-500/20" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        <button 
          onClick={onOpenQuickCreate}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="bg-white/20 p-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          Create Log
        </button>
      </div>
    </aside>
  );
}
