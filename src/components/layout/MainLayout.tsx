import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { QuickCreateModal } from '@/components/ui/QuickCreateModal';

interface MainLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export function MainLayout({ children, currentTab, setCurrentTab }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  return (
    <div className="flex h-screen w-full font-sans bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 overflow-hidden relative">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
      />
      
      <div className="flex-1 ml-0 lg:ml-[220px] flex flex-col relative z-10 overflow-hidden">
        <Topbar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto h-full flex flex-col gap-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Global FAB */}
      <button
        onClick={() => setIsQuickCreateOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 md:hidden lg:flex"
      >
        <Plus size={24} />
      </button>
      
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Quick Create Menu */}
      <QuickCreateModal 
        isOpen={isQuickCreateOpen} 
        onClose={() => setIsQuickCreateOpen(false)} 
      />
    </div>
  );
}
