import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ShoppingBag, CheckCircle2, Sparkles, RefreshCcw } from 'lucide-react';

const INITIAL_GROCERIES = [
  { id: '1', name: 'Spinach', category: 'Produce', checked: false, reason: 'High in iron for energy' },
  { id: '2', name: 'Salmon', category: 'Meat & Seafood', checked: false, reason: 'Omega-3 for heart health' },
  { id: '3', name: 'Quinoa', category: 'Pantry', checked: true, reason: 'Complex carbs for sustained energy' },
  { id: '4', name: 'Almonds', category: 'Pantry', checked: false, reason: 'Healthy fats and magnesium' },
  { id: '5', name: 'Avocado', category: 'Produce', checked: false, reason: 'Good for cholesterol levels' },
  { id: '6', name: 'Greek Yogurt', category: 'Dairy', checked: true, reason: 'Probiotics and protein' },
];

export function Grocery() {
  const [groceries, setGroceries] = useState(INITIAL_GROCERIES);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleItem = (id: string) => {
    setGroceries(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGroceries([
        { id: '7', name: 'Blueberries', category: 'Produce', checked: false, reason: 'Antioxidants for brain health' },
        { id: '8', name: 'Chicken Breast', category: 'Meat & Seafood', checked: false, reason: 'Lean protein for muscle repair' },
        { id: '9', name: 'Sweet Potatoes', category: 'Produce', checked: false, reason: 'Vitamin A and fiber' },
        { id: '10', name: 'Chia Seeds', category: 'Pantry', checked: false, reason: 'Omega-3 and fiber' },
        ...INITIAL_GROCERIES.filter(g => !g.checked)
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  const categories = Array.from(new Set(groceries.map(g => g.category)));

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
            AI Grocery List <Sparkles className="text-amber-500" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Smart recommendations based on your health goals and nutrition logs.
          </p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-500 text-white px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 font-bold"
        >
          {isGenerating ? <RefreshCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {isGenerating ? 'Analyzing...' : 'Generate New List'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          {categories.map(category => (
            <Card key={category} className="p-0 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                {category}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {groceries.filter(g => g.category === category).map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id)}
                    className="p-4 sm:px-6 flex items-start gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                      {item.checked && <CheckCircle2 size={16} />}
                    </div>
                    <div>
                      <p className={`font-bold text-lg transition-all ${item.checked ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                        {item.name}
                      </p>
                      <p className={`text-sm mt-1 flex items-center gap-1 ${item.checked ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        <Sparkles size={12} /> {item.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        
        <div className="col-span-1 lg:col-span-4">
          <Card className="sticky top-6 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShoppingBag className="text-emerald-500" /> List Summary
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total Items</span>
                <span className="font-bold text-xl">{groceries.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Checked</span>
                <span className="font-bold text-xl text-emerald-500">{groceries.filter(g => g.checked).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Remaining</span>
                <span className="font-bold text-xl text-orange-500">{groceries.filter(g => !g.checked).length}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Based on your recent logs, you need more Vitamin D and Magnesium. We've added Almonds and Salmon to help.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
