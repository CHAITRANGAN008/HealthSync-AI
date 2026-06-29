import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Trophy, Flame, Star, Target, CheckCircle2, ChevronRight, Droplet, Apple, Moon, Activity, Brain, Heart, Globe, Award, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { getRecords, addRecord, updateRecord } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  { id: 'hydration', name: 'Hydration', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'nutrition', name: 'Nutrition', icon: Apple, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'sleep', name: 'Sleep', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'activity', name: 'Activity', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'mental', name: 'Mental Wellness', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'lifestyle', name: 'Healthy Lifestyle', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'environmental', name: 'Environmental', icon: Globe, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { id: 'ultimate', name: 'Ultimate', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const ALL_CHALLENGES = [
  // Hydration
  { id: 'hyd_1', category: 'hydration', title: '7-Day Hydration Challenge', description: 'Meet your daily water goal for 7 consecutive days.', difficulty: 'Medium', durationDays: 7, xpReward: 150, badge: 'Silver', target: 7, unit: 'days' },
  { id: 'hyd_2', category: 'hydration', title: '30-Day Hydration Master', description: 'Stay perfectly hydrated for a whole month.', difficulty: 'Hard', durationDays: 30, xpReward: 500, badge: 'Gold', target: 30, unit: 'days' },
  { id: 'hyd_3', category: 'hydration', title: 'Drink 3L Water Challenge', description: 'Drink at least 3 liters of water today.', difficulty: 'Easy', durationDays: 1, xpReward: 50, badge: 'Bronze', target: 3000, unit: 'ml' },
  { id: 'hyd_4', category: 'hydration', title: 'No Sugary Drinks Challenge', description: 'Replace all sugary drinks with water today.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Silver', target: 1, unit: 'day' },
  { id: 'hyd_5', category: 'hydration', title: 'Morning Water Habit Challenge', description: 'Drink 500ml of water right after waking up.', difficulty: 'Easy', durationDays: 1, xpReward: 50, badge: 'Bronze', target: 500, unit: 'ml' },
  
  // Nutrition
  { id: 'nut_1', category: 'nutrition', title: 'Eat 5 Fruits & Veggies Daily', description: 'Log at least 5 servings of fruits or vegetables today.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Silver', target: 5, unit: 'servings' },
  { id: 'nut_2', category: 'nutrition', title: 'Healthy Breakfast Challenge', description: 'Log a nutritious breakfast containing protein and fiber.', difficulty: 'Easy', durationDays: 1, xpReward: 50, badge: 'Bronze', target: 1, unit: 'meal' },
  { id: 'nut_3', category: 'nutrition', title: 'No Junk Food Challenge', description: 'Avoid fast food and processed snacks for 3 days.', difficulty: 'Medium', durationDays: 3, xpReward: 150, badge: 'Silver', target: 3, unit: 'days' },
  { id: 'nut_4', category: 'nutrition', title: 'High Protein Week', description: 'Hit your protein target for 7 straight days.', difficulty: 'Hard', durationDays: 7, xpReward: 300, badge: 'Gold', target: 7, unit: 'days' },
  { id: 'nut_5', category: 'nutrition', title: 'Fiber Boost Challenge', description: 'Consume 25g+ of fiber today.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Silver', target: 25, unit: 'grams' },
  { id: 'nut_6', category: 'nutrition', title: 'Vitamin C Week', description: 'Ensure adequate Vitamin C intake daily for a week.', difficulty: 'Medium', durationDays: 7, xpReward: 200, badge: 'Silver', target: 7, unit: 'days' },
  { id: 'nut_7', category: 'nutrition', title: 'Iron Rich Diet Challenge', description: 'Incorporate iron-rich foods in your meals today.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Bronze', target: 1, unit: 'day' },
  { id: 'nut_8', category: 'nutrition', title: 'Healthy Snacking Challenge', description: 'Swap unhealthy snacks with nuts or fruits for 5 days.', difficulty: 'Medium', durationDays: 5, xpReward: 200, badge: 'Silver', target: 5, unit: 'days' },
  { id: 'nut_9', category: 'nutrition', title: 'Balanced Plate Challenge', description: 'Log a meal with 50% veggies, 25% protein, 25% carbs.', difficulty: 'Hard', durationDays: 1, xpReward: 150, badge: 'Gold', target: 1, unit: 'meal' },
  { id: 'nut_10', category: 'nutrition', title: 'Home Cooked Meals Challenge', description: 'Eat only home-cooked meals for 7 days.', difficulty: 'Hard', durationDays: 7, xpReward: 400, badge: 'Platinum', target: 7, unit: 'days' },

  // Sleep
  { id: 'slp_1', category: 'sleep', title: '7-Day Better Sleep', description: 'Sleep at least 7.5 hours each night for a week.', difficulty: 'Medium', durationDays: 7, xpReward: 250, badge: 'Silver', target: 7, unit: 'days' },
  { id: 'slp_2', category: 'sleep', title: 'Sleep Before 11 PM', description: 'Log your sleep time before 11 PM.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Bronze', target: 1, unit: 'night' },
  { id: 'slp_3', category: 'sleep', title: 'Wake Up Early Challenge', description: 'Wake up before 6 AM and log your status.', difficulty: 'Hard', durationDays: 1, xpReward: 150, badge: 'Silver', target: 1, unit: 'morning' },
  { id: 'slp_4', category: 'sleep', title: '8 Hours Sleep Challenge', description: 'Get a full 8 hours of sleep tonight.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Bronze', target: 8, unit: 'hours' },
  { id: 'slp_5', category: 'sleep', title: 'Digital Detox Before Bed', description: 'No screens 1 hour before sleep.', difficulty: 'Medium', durationDays: 1, xpReward: 120, badge: 'Silver', target: 1, unit: 'night' },

  // Activity
  { id: 'act_1', category: 'activity', title: 'Walk 10,000 Steps', description: 'Achieve 10,000 steps in a single day.', difficulty: 'Medium', durationDays: 1, xpReward: 150, badge: 'Silver', target: 10000, unit: 'steps' },
  { id: 'act_2', category: 'activity', title: 'Walk 5 km Daily', description: 'Cover a distance of 5km for 3 consecutive days.', difficulty: 'Hard', durationDays: 3, xpReward: 300, badge: 'Gold', target: 3, unit: 'days' },
  { id: 'act_3', category: 'activity', title: 'Take Stairs Challenge', description: 'Opt for stairs instead of elevators today.', difficulty: 'Easy', durationDays: 1, xpReward: 50, badge: 'Bronze', target: 1, unit: 'day' },
  { id: 'act_4', category: 'activity', title: 'Stretch Every Morning', description: 'Complete a 10-minute morning stretch routine for 5 days.', difficulty: 'Medium', durationDays: 5, xpReward: 200, badge: 'Silver', target: 5, unit: 'days' },
  { id: 'act_5', category: 'activity', title: 'Stand Every Hour', description: 'Stand up and move for 2 mins every hour during work.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Bronze', target: 8, unit: 'hours' },
  { id: 'act_6', category: 'activity', title: 'Weekend Outdoor Activity', description: 'Spend at least 60 mins doing an outdoor physical activity.', difficulty: 'Easy', durationDays: 2, xpReward: 150, badge: 'Silver', target: 60, unit: 'mins' },

  // Mental Wellness
  { id: 'men_1', category: 'mental', title: '7-Day Meditation', description: 'Meditate for at least 10 minutes every day for a week.', difficulty: 'Hard', durationDays: 7, xpReward: 350, badge: 'Gold', target: 7, unit: 'days' },
  { id: 'men_2', category: 'mental', title: 'Daily Gratitude Journal', description: 'Log your mood and something you are grateful for.', difficulty: 'Easy', durationDays: 1, xpReward: 50, badge: 'Bronze', target: 1, unit: 'entry' },
  { id: 'men_3', category: 'mental', title: 'Smile More Challenge', description: 'Log a "Happy" or "Great" mood today.', difficulty: 'Easy', durationDays: 1, xpReward: 50, badge: 'Bronze', target: 1, unit: 'day' },
  { id: 'men_4', category: 'mental', title: 'No Stress Week', description: 'Keep your stress levels below 4 (Low) for 7 days.', difficulty: 'Hard', durationDays: 7, xpReward: 400, badge: 'Platinum', target: 7, unit: 'days' },
  { id: 'men_5', category: 'mental', title: 'Deep Breathing Challenge', description: 'Complete a guided breathing session.', difficulty: 'Easy', durationDays: 1, xpReward: 80, badge: 'Bronze', target: 1, unit: 'session' },
  { id: 'men_6', category: 'mental', title: 'Positive Thinking Challenge', description: 'Reframe 3 negative thoughts today.', difficulty: 'Medium', durationDays: 1, xpReward: 120, badge: 'Silver', target: 3, unit: 'thoughts' },
  { id: 'men_7', category: 'mental', title: 'Screen-Free 1 Hour Challenge', description: 'Stay completely away from screens for 1 hour during the day.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Silver', target: 60, unit: 'mins' },

  // Healthy Lifestyle
  { id: 'lif_1', category: 'lifestyle', title: 'No Sugar Challenge', description: 'Consume zero added sugar today.', difficulty: 'Medium', durationDays: 1, xpReward: 150, badge: 'Silver', target: 1, unit: 'day' },
  { id: 'lif_2', category: 'lifestyle', title: 'No Soft Drinks Challenge', description: 'Avoid all carbonated soft drinks for 5 days.', difficulty: 'Medium', durationDays: 5, xpReward: 200, badge: 'Silver', target: 5, unit: 'days' },
  { id: 'lif_3', category: 'lifestyle', title: 'No Fast Food Challenge', description: 'Avoid fast food for 14 days.', difficulty: 'Hard', durationDays: 14, xpReward: 400, badge: 'Gold', target: 14, unit: 'days' },
  { id: 'lif_4', category: 'lifestyle', title: 'Healthy Living 30 Days', description: 'Log all primary health metrics daily for a month.', difficulty: 'Hard', durationDays: 30, xpReward: 1000, badge: 'Diamond', target: 30, unit: 'days' },
  { id: 'lif_5', category: 'lifestyle', title: 'Maintain Health Score Above 85', description: 'Keep your Overall Health Score >= 85 for a week.', difficulty: 'Hard', durationDays: 7, xpReward: 500, badge: 'Platinum', target: 7, unit: 'days' },
  { id: 'lif_6', category: 'lifestyle', title: 'Improve BMI Challenge', description: 'Log weight data showing progress towards a healthier BMI.', difficulty: 'Hard', durationDays: 30, xpReward: 600, badge: 'Diamond', target: 1, unit: 'goal' },
  { id: 'lif_7', category: 'lifestyle', title: 'Consistency Challenge', description: 'Check-in and log at least 1 record for 10 consecutive days.', difficulty: 'Medium', durationDays: 10, xpReward: 300, badge: 'Gold', target: 10, unit: 'days' },
  { id: 'lif_8', category: 'lifestyle', title: 'Daily Health Check-in Challenge', description: 'Log all basic vitals (BP, HR, Weight) today.', difficulty: 'Medium', durationDays: 1, xpReward: 150, badge: 'Silver', target: 3, unit: 'vitals' },

  // Environmental
  { id: 'env_1', category: 'environmental', title: 'Check AQI Daily', description: 'Review your local air quality before outdoor activities.', difficulty: 'Easy', durationDays: 1, xpReward: 50, badge: 'Bronze', target: 1, unit: 'check' },
  { id: 'env_2', category: 'environmental', title: 'Wear Mask on Poor AQI Days', description: 'Protect your lungs when air quality is low.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Silver', target: 1, unit: 'day' },
  { id: 'env_3', category: 'environmental', title: 'Reduce Outdoor Exposure Challenge', description: 'Stay indoors during peak pollution hours.', difficulty: 'Medium', durationDays: 1, xpReward: 100, badge: 'Silver', target: 1, unit: 'day' },
  { id: 'env_4', category: 'environmental', title: 'Eco Walking Challenge', description: 'Walk or bike instead of driving for short trips today.', difficulty: 'Medium', durationDays: 1, xpReward: 150, badge: 'Silver', target: 1, unit: 'trip' },
  { id: 'env_5', category: 'environmental', title: 'Green Living Challenge', description: 'Spend 30 mins in a park or green space.', difficulty: 'Easy', durationDays: 1, xpReward: 80, badge: 'Bronze', target: 30, unit: 'mins' },

  // Ultimate
  { id: 'ult_1', category: 'ultimate', title: '30-Day Transformation Challenge', description: 'Hit all daily goals (Sleep, Water, Steps, Calories) for 30 days.', difficulty: 'Hard', durationDays: 30, xpReward: 2000, badge: 'Diamond', target: 30, unit: 'days' },
  { id: 'ult_2', category: 'ultimate', title: '90-Day Healthy Lifestyle Challenge', description: 'Maintain consistent health tracking and good scores for 3 months.', difficulty: 'Hard', durationDays: 90, xpReward: 5000, badge: 'Diamond', target: 90, unit: 'days' },
  { id: 'ult_3', category: 'ultimate', title: 'Health Champion Challenge', description: 'Reach Level 10 and maintain an Excellent Wellness Index.', difficulty: 'Hard', durationDays: 1, xpReward: 1000, badge: 'Platinum', target: 1, unit: 'goal' },
  { id: 'ult_4', category: 'ultimate', title: 'Perfect Week Challenge', description: 'Achieve 100% of your targets for 7 consecutive days.', difficulty: 'Hard', durationDays: 7, xpReward: 800, badge: 'Gold', target: 7, unit: 'days' },
  { id: 'ult_5', category: 'ultimate', title: 'All Goals Completed Challenge', description: 'Complete every single daily goal today.', difficulty: 'Medium', durationDays: 1, xpReward: 300, badge: 'Silver', target: 1, unit: 'day' },
];

export function Challenges() {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [joinedChallenges, setJoinedChallenges] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shareModalData, setShareModalData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        challengesData, waterLogs, sleepLogs, nutLogs, moodLogs, stressLogs
      ] = await Promise.all([
        getRecords('userChallenges', user.id),
        getRecords('waterLogs', user.id),
        getRecords('sleepLogs', user.id),
        getRecords('nutritionLogs', user.id),
        getRecords('moodLogs', user.id),
        getRecords('stressLogs', user.id),
      ]);

      setJoinedChallenges(challengesData);

      // Aggregate XP from completed challenges
      let xp = 0;
      challengesData.forEach((c: any) => {
        if (c.status === 'completed') {
          xp += c.xpReward;
        }
      });
      setTotalXP(xp);
      setUserLevel(Math.floor(xp / 500) + 1);

      // Process raw logs to update challenge progress dynamically
      const todayWater = waterLogs.filter((l: any) => l.date === today).reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0);
      const todaySleep = sleepLogs.filter((l: any) => l.date === today).reduce((sum: number, l: any) => sum + (Number(l.duration) || 0), 0);
      const todayNut = nutLogs.filter((l: any) => l.date === today);
      const todayMood = moodLogs.filter((l: any) => l.date === today);
      
      const todayStressLogs = stressLogs.filter((l: any) => l.date === today);
      const todayStress = todayStressLogs.length > 0 
        ? todayStressLogs.reduce((sum: number, l: any) => sum + (Number(l.stressLevel) || 0), 0) / todayStressLogs.length 
        : -1;

      // Auto-update progress for active challenges
      updateActiveChallengesProgress(challengesData, { todayWater, todaySleep, todayNut, todayMood, todayStress, allWater: waterLogs });
      
    } catch (err) {
      console.error('Error fetching challenges', err);
    }
    setLoading(false);
  };

  const updateActiveChallengesProgress = async (activeList: any[], metrics: any) => {
    let updated = false;
    for (const challenge of activeList) {
      if (challenge.status === 'completed') continue;

      let newProgress = challenge.progress;
      let targetMet = false;

      // Dynamic calculation logic based on actual health data
      switch (challenge.challengeId) {
        case 'hyd_3': // 3L Water
          newProgress = metrics.todayWater;
          if (newProgress >= 3000) targetMet = true;
          break;
        case 'slp_4': // 8 Hours Sleep
          newProgress = metrics.todaySleep;
          if (newProgress >= 8) targetMet = true;
          break;
        case 'hyd_5': // Morning Water
          if (metrics.todayWater >= 500) { newProgress = 500; targetMet = true; }
          break;
        case 'men_3': // Smile More
          if (metrics.todayMood.some((m: any) => m.mood === 'Happy' || m.mood === 'Great')) {
            newProgress = 1; targetMet = true;
          }
          break;
        case 'men_4': // No Stress Week (Simplified for demo)
          if (metrics.todayStress > 0 && metrics.todayStress < 5) {
             newProgress += 1;
             // Ensure it only adds once per day by checking last update time in a real app
          }
          break;
        case 'nut_2': // Healthy Breakfast
           if (metrics.todayNut.some((n: any) => n.mealType === 'Breakfast' && (n.notes?.toLowerCase().includes('protein') || n.notes?.toLowerCase().includes('healthy')))) {
             newProgress = 1; targetMet = true;
           }
           break;
        default:
          break;
      }

      if (newProgress >= challenge.target || targetMet) {
        newProgress = challenge.target;
        challenge.status = 'completed';
        challenge.completedAt = new Date().toISOString();
        updated = true;
        
        await updateRecord('userChallenges', challenge.id, {
          progress: newProgress,
          status: 'completed',
          completedAt: challenge.completedAt
        }, user.id);
        
        // Trigger completion effects
        triggerConfetti();
      } else if (newProgress !== challenge.progress) {
        await updateRecord('userChallenges', challenge.id, {
          progress: newProgress
        }, user.id);
        updated = true;
      }
    }
    
    if (updated) {
      fetchData(); // Refresh UI
    }
  };

  const handleJoin = async (challengeDef: any) => {
    try {
      const newChallenge = {
        challengeId: challengeDef.id,
        title: challengeDef.title,
        category: challengeDef.category,
        xpReward: challengeDef.xpReward,
        badge: challengeDef.badge,
        target: challengeDef.target,
        unit: challengeDef.unit,
        progress: 0,
        status: 'active',
        joinedAt: new Date().toISOString(),
      };
      
      await addRecord('userChallenges', newChallenge, user.id);
      fetchData();
      
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6']
      });
    } catch (err) {
      console.error('Error joining challenge', err);
    }
  };

  const handleManualProgress = async (activeChallenge: any) => {
    // For demo/prototyping of challenges we can't fully automate yet
    let newProgress = activeChallenge.progress + 1;
    let status = 'active';
    let completedAt = null;
    
    if (newProgress >= activeChallenge.target) {
      newProgress = activeChallenge.target;
      status = 'completed';
      completedAt = new Date().toISOString();
      triggerConfetti();
    }
    
    await updateRecord('userChallenges', activeChallenge.id, {
      progress: newProgress,
      status,
      completedAt
    }, user.id);
    
    fetchData();
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const activeJoined = joinedChallenges.filter(c => c.status === 'active');
  const completedJoined = joinedChallenges.filter(c => c.status === 'completed');
  
  const availableChallenges = ALL_CHALLENGES.filter(
    c => !joinedChallenges.find(jc => jc.challengeId === c.id) && (activeTab === 'all' || c.category === activeTab)
  );

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Easy') return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
    if (diff === 'Medium') return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
  };

  const getBadgeIcon = (badge: string) => {
    switch(badge) {
      case 'Bronze': return '🥉';
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      case 'Platinum': return '💠';
      case 'Diamond': return '💎';
      default: return '🏅';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Health Challenges
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Push your limits, earn badges, and level up your health.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Star size={20} className="fill-white" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total XP</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{totalXP.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Trophy size={20} className="fill-white" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Current Level</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Level {userLevel}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300",
            activeTab === 'all' 
              ? "bg-slate-900 text-white dark:bg-emerald-500 shadow-md scale-105" 
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
        >
          All Challenges
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2",
              activeTab === cat.id 
                ? "bg-slate-900 text-white dark:bg-emerald-500 shadow-md scale-105" 
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
          >
            <cat.icon size={16} />
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Active Challenges */}
          {activeJoined.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Flame className="text-orange-500 fill-orange-500" /> Active Challenges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeJoined.map(challenge => {
                  const def = ALL_CHALLENGES.find(c => c.id === challenge.challengeId);
                  if (!def) return null;
                  const cat = CATEGORIES.find(c => c.id === def.category);
                  const Icon = cat?.icon || Target;
                  const progressPct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
                  
                  return (
                    <Card key={challenge.id} className="relative overflow-hidden group border-2 border-transparent hover:border-emerald-500/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-2 rounded-lg", cat?.bg, cat?.color)}>
                            <Icon size={18} />
                          </div>
                          <span className={cn("text-xs font-bold px-2 py-1 rounded-lg border", getDifficultyColor(def.difficulty))}>
                            {def.difficulty}
                          </span>
                        </div>
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                          <Star size={12} className="fill-amber-500" /> +{challenge.xpReward} XP
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">{challenge.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 line-clamp-2">{def.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-slate-600 dark:text-slate-300 font-mono text-xs">
                            {typeof challenge.progress === 'number' && challenge.progress % 1 !== 0 ? challenge.progress.toFixed(1) : challenge.progress} / {challenge.target} {challenge.unit}
                          </span>
                          <span className="text-emerald-500 font-bold">{progressPct}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out relative" 
                            style={{ width: `${progressPct}%` }}
                          >
                            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Manual Progress Button for elements that need manual logging */}
                      <button 
                        onClick={() => handleManualProgress(challenge)}
                        className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                      >
                        Update Progress Manually
                      </button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Challenges */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Target className="text-blue-500" /> Available Challenges
            </h2>
            
            {availableChallenges.length === 0 ? (
              <div className="text-center py-12 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <Target className="mx-auto text-slate-400 mb-3" size={32} />
                <p className="text-slate-500 dark:text-slate-400 font-medium">You've joined all challenges in this category!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {availableChallenges.map((challenge, idx) => {
                    const cat = CATEGORIES.find(c => c.id === challenge.category);
                    const Icon = cat?.icon || Target;
                    
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={challenge.id}
                      >
                        <Card className="relative h-full flex flex-col hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className={cn("p-1.5 rounded-lg", cat?.bg, cat?.color)}>
                                <Icon size={16} />
                              </div>
                              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider", getDifficultyColor(challenge.difficulty))}>
                                {challenge.difficulty}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg flex items-center gap-1">
                              <Globe size={12} className="opacity-50" /> {challenge.durationDays} {challenge.durationDays === 1 ? 'Day' : 'Days'}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{challenge.title}</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 flex-1">{challenge.description}</p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Reward</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-amber-500 text-sm">+{challenge.xpReward} XP</span>
                                <span title={`${challenge.badge} Badge`} className="text-lg">{getBadgeIcon(challenge.badge)}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleJoin(challenge)}
                              className="px-4 py-2 bg-slate-900 dark:bg-emerald-500 text-white rounded-xl font-medium hover:scale-105 active:scale-95 transition-transform text-xs flex items-center gap-1 shadow-md shadow-slate-900/20 dark:shadow-emerald-500/20"
                            >
                              Join <ChevronRight size={14} />
                            </button>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Completed / Stats */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Trophy size={100} />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Trophy className="text-amber-400" size={20} /> Achievement Wall
              </h3>
              <p className="text-slate-400 text-xs mb-6">Your completed challenges and earned badges.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm border border-white/10">
                  <p className="text-xs text-slate-300 mb-1">Completed</p>
                  <p className="text-2xl font-bold">{completedJoined.length}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm border border-white/10">
                  <p className="text-xs text-slate-300 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {joinedChallenges.length > 0 ? Math.round((completedJoined.length / joinedChallenges.length) * 100) : 0}%
                  </p>
                </div>
              </div>

              {completedJoined.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Badges</h4>
                  {completedJoined.slice(0, 5).map(challenge => {
                    const def = ALL_CHALLENGES.find(c => c.id === challenge.challengeId);
                    return (
                      <div key={challenge.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getBadgeIcon(def?.badge || 'Bronze')}</span>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[150px]">{challenge.title}</p>
                            <p className="text-[10px] text-emerald-400 font-medium">+{challenge.xpReward} XP</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShareModalData(challenge)}
                          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-slate-300 hover:text-white"
                          title="Share Achievement"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/5">
                  <Award size={32} className="mx-auto text-slate-500 mb-2 opacity-50" />
                  <p className="text-sm text-slate-400">Complete challenges to earn badges!</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold flex items-center gap-2">
                <Flame size={18} /> Daily Streak
              </h3>
              <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold">12 Days</span>
            </div>
            <p className="text-sm text-emerald-100 mb-4">You're on fire! Keep logging data to maintain your streak.</p>
            <div className="flex justify-between items-center bg-white/10 rounded-xl p-3">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-emerald-200">{day}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                    i < 5 ? "bg-white text-emerald-600" : "bg-white/20 text-emerald-100"
                  )}>
                    {i < 5 ? <CheckCircle2 size={12} /> : '-'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShareModalData(null)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-center"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-5xl mb-4 shadow-lg shadow-amber-500/30">
                {getBadgeIcon(ALL_CHALLENGES.find(c => c.id === shareModalData.challengeId)?.badge || 'Bronze')}
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Challenge Completed!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
                I just completed the <span className="font-bold text-slate-900 dark:text-white">{shareModalData.title}</span> challenge on HealthSync!
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Reward Earned</p>
                <p className="text-xl font-bold text-amber-500">+{shareModalData.xpReward} XP</p>
              </div>
              
              <button 
                onClick={() => setShareModalData(null)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-md shadow-emerald-500/20"
              >
                Awesome!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
