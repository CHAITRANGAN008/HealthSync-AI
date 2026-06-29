import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';

type UserContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: any | null;
  loading: boolean;
  loginAsGuest: () => void;
  logout: () => void;
  clearLocalData: () => void;
};

const AppContext = createContext<UserContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  
  useEffect(() => {
    // Check local storage for guest
    const isGuest = localStorage.getItem('healthsync_is_guest');
    if (isGuest === 'true') {
      setUser({
        id: "guest",
        name: "Guest User",
        healthScore: 0,
        streak: 0,
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.isAnonymous ? "Guest User" : firebaseUser.displayName || "User",
          healthScore: 0,
          streak: 0,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const loginAsGuest = () => {
    localStorage.setItem('healthsync_is_guest', 'true');
    setUser({
      id: "guest",
      name: "Guest User",
      healthScore: 0,
      streak: 0,
    });
  };

  const logout = async () => {
    if (user?.id === 'guest') {
      const confirmLogout = window.confirm("Do you want to leave Guest Mode?");
      if (confirmLogout) {
        localStorage.removeItem('healthsync_is_guest');
        setUser(null);
      }
    } else {
      await signOut(auth);
      setUser(null);
    }
  };

  const clearLocalData = () => {
    const confirmClear = window.confirm("Are you sure you want to clear all local data?");
    if (confirmClear) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('healthsync_')) {
          localStorage.removeItem(key);
        }
      });
      alert("Local data cleared.");
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex items-center justify-center">
          Loading HealthSync AI...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex items-center justify-center">
          <div className="text-center space-y-6 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-sm w-full">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to HealthSync AI</h1>
            <p className="text-slate-500">Please choose how you would like to continue.</p>
            <div className="space-y-4 pt-4">
              <button 
                onClick={loginAsGuest}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ theme, toggleTheme, user, loading, loginAsGuest, logout, clearLocalData }}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
          {children}
        </div>
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
