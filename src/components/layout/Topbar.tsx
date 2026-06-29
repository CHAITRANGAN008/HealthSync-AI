import React, { useState } from 'react';
import { Bell, Search, Sun, Moon, User, LogOut, Trash2, ShieldAlert, Menu } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export function Topbar({ toggleMobileMenu }: { toggleMobileMenu?: () => void }) {
  const { theme, toggleTheme, user, logout, clearLocalData } = useAppContext();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="h-[80px] shrink-0 sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-2 md:gap-4">
        {toggleMobileMenu && (
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white hidden sm:block">
          Welcome, {user.name.split(' ')[0]}!
        </h1>
        <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-xs md:text-sm flex items-center gap-1 md:gap-2">
          🔥 {user.streak} Day
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 relative">
        <div className="hidden lg:block relative w-64 mr-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 dark:text-slate-300 transition-shadow backdrop-blur-md"
          />
        </div>

        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 md:pr-4 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm shrink-0">
              <User size={16} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:inline">{user.name}</span>
          </button>

          {profileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50">
                <div className="text-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-2xl">
                    <User />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    {user.name}
                    {user.id === 'guest' && <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full font-semibold">GUEST</span>}
                  </h3>
                  <div className="flex items-center justify-center gap-3 mt-2 text-sm text-slate-500">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{user.healthScore || 0}</span> Score
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Lvl 1</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{user.streak || 0}</span> Streak
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      clearLocalData();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                    Clear Local Data
                  </button>
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <LogOut size={16} />
                    {user.id === 'guest' ? 'Leave Guest Mode' : 'Log Out'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
