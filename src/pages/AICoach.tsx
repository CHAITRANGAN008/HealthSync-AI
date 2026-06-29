import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Bot, User, Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { getRecords } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function AICoach() {
  const { user } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm HealthSync AI, your personal wellness coach. I can help you with meal planning, workout suggestions, symptom checking, or mental wellness exercises. What would you like to focus on today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userDataContext, setUserDataContext] = useState('');

  useEffect(() => {
    // Fetch all records to build context
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const [water, weight, bp, bs, hr, ox, temp, sleep, nutrition, mood, stress] = await Promise.all([
          getRecords('waterLogs', user.id),
          getRecords('weightLogs', user.id),
          getRecords('bloodPressureLogs', user.id),
          getRecords('bloodSugarLogs', user.id),
          getRecords('heartRateLogs', user.id),
          getRecords('oxygenLogs', user.id),
          getRecords('temperatureLogs', user.id),
          getRecords('sleepLogs', user.id),
          getRecords('nutritionLogs', user.id),
          getRecords('moodLogs', user.id),
          getRecords('stressLogs', user.id)
        ]);

        const recent = (arr: any[]) => (arr.length > 0 ? JSON.stringify(arr[0]) : "None");
        
        const contextStr = `
          User Profile Context for Personalization:
          - Recent Water: ${recent(water)}
          - Recent Weight: ${recent(weight)}
          - Recent BP: ${recent(bp)}
          - Recent Blood Sugar: ${recent(bs)}
          - Recent Heart Rate: ${recent(hr)}
          - Recent SpO2: ${recent(ox)}
          - Recent Sleep: ${recent(sleep)}
          - Recent Nutrition: ${recent(nutrition)}
          - Recent Mood: ${recent(mood)}
          - Recent Stress: ${recent(stress)}
          
          Based on this context, provide personalized advice. E.g., if protein is low, suggest high protein foods. If sleep is low, suggest sleep hygiene.
        `;
        setUserDataContext(contextStr);
      } catch (err) {
        console.error("Failed to fetch context for AI", err);
      }
    };
    fetchUserData();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(1), // omit initial greeting
          context: userDataContext
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please ensure the GEMINI_API_KEY is configured in the environment." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Network error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Analyze my latest health data",
    "Generate a vegan meal plan",
    "How to improve sleep?",
    "Calculate my BMI"
  ];

  return (
    <div className="h-full flex flex-col">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
            <Bot className="text-emerald-500" />
            AI Health Coach
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Powered by Gemini. Ask anything about your health and wellness journey.
          </p>
        </div>
      </header>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-white/50 dark:bg-slate-900/50">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={cn(
                "flex gap-4 max-w-[80%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                msg.role === 'user' 
                  ? "bg-gradient-to-tr from-emerald-400 to-blue-500 text-white"
                  : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === 'user'
                  ? "bg-emerald-500 text-white rounded-tr-sm"
                  : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[80%] mr-auto">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-emerald-500" />
                <span className="text-sm text-slate-500">Analyzing data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
          {messages.length === 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI coach..."
              disabled={isLoading}
              className="w-full pl-6 pr-14 py-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white shadow-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-2">
             <span className="text-[10px] text-slate-400">Disclaimer: I am an AI. Please consult a doctor for medical conditions.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
