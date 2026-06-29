import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "rounded-3xl border border-white/40 bg-white/60 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] p-6 dark:bg-slate-900/60 dark:border-white/10 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
