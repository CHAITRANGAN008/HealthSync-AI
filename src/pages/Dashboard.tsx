import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Activity, Droplet, Moon, Heart, Flame, Target } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRecords } from '@/lib/api';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { user } = useAppContext();
  
  const [hydration, setHydration] = useState(0);
  const [sleep, setSleep] = useState({ hours: 0, minutes: 0 });
  const [heartRate, setHeartRate] = useState(0);
  const [bloodSugar, setBloodSugar] = useState(0);
  const [spo2, setSpo2] = useState(0);
  const [nutrition, setNutrition] = useState<any[]>([]);
  const [stress, setStress] = useState("Low");
  
  const [activityData, setActivityData] = useState<any[]>([]);
  
  const [healthData, setHealthData] = useState<{
    score: number;
    bioAge: number | null;
    wellnessIndex: string;
    breakdowns: any[];
    completionPercentage: number;
    isEnoughData: boolean;
    aiExplanation: string;
  }>({
    score: 0,
    bioAge: null,
    wellnessIndex: '',
    breakdowns: [],
    completionPercentage: 0,
    isEnoughData: false,
    aiExplanation: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const [
          weightLogs, waterLogs, sleepLogs, nutLogs, bpLogs,
          bsLogs, hrLogs, oxLogs, tempLogs, moodLogs, stressLogs
        ] = await Promise.all([
          getRecords('weightLogs', user.id),
          getRecords('waterLogs', user.id),
          getRecords('sleepLogs', user.id),
          getRecords('nutritionLogs', user.id),
          getRecords('bloodPressureLogs', user.id),
          getRecords('bloodSugarLogs', user.id),
          getRecords('heartRateLogs', user.id),
          getRecords('oxygenLogs', user.id),
          getRecords('temperatureLogs', user.id),
          getRecords('moodLogs', user.id),
          getRecords('stressLogs', user.id)
        ]);

        let metrics: any[] = [];
        let totalWeight = 0;

        // 1. BMI (10%)
        if (weightLogs.length > 0) {
          const w = Number(weightLogs[0].weight);
          const h = Number(user.height) || 1.75;
          const bmi = w / (h * h);
          let s = 25, t = "Poor BMI";
          if (bmi >= 18.5 && bmi <= 24.9) { s = 100; t = "Healthy BMI"; }
          else if (bmi >= 25 && bmi <= 29.9) { s = 75; t = "Slightly Overweight"; }
          else if (bmi >= 30 && bmi <= 34.9) { s = 50; t = "Overweight"; }
          metrics.push({ name: 'BMI', score: s, weight: 10, text: t });
          totalWeight += 10;
        }

        // 2. Water (15%)
        const todayWater = waterLogs.filter((log: any) => log.date === today);
        const totalWaterAmount = todayWater.reduce((sum: number, log: any) => sum + (Number(log.amount) || 0), 0);
        const hydrationLiters = totalWaterAmount / 1000;
        setHydration(hydrationLiters);
        
        if (todayWater.length > 0) {
          let s = 25, t = "Low Water Intake";
          if (hydrationLiters >= 2.5) { s = 100; t = "Excellent Hydration"; }
          else if (hydrationLiters >= 1.5) { s = 75; t = "Good Hydration"; }
          else if (hydrationLiters >= 1) { s = 50; t = "Fair Hydration"; }
          metrics.push({ name: 'Water', score: s, weight: 15, text: t });
          totalWeight += 15;
        }

        // 3. Sleep (20%)
        if (sleepLogs.length > 0) {
          const hrs = Number(sleepLogs[0].duration) || 7;
          setSleep({ hours: Math.floor(hrs), minutes: Math.round((hrs - Math.floor(hrs)) * 60) });
          let s = 25, t = "Poor Sleep";
          if (hrs >= 7 && hrs <= 9) { s = 100; t = "Excellent Sleep"; }
          else if (hrs >= 6 || hrs > 9) { s = 75; t = "Good Sleep"; }
          else if (hrs >= 5) { s = 50; t = "Fair Sleep"; }
          metrics.push({ name: 'Sleep', score: s, weight: 20, text: t });
          totalWeight += 20;
        }

        // 4. Nutrition (20%)
        const todayNut = nutLogs.filter((log: any) => log.date === today);
        setNutrition(todayNut);
        if (todayNut.length > 0) {
          const cals = todayNut.reduce((sum: number, n: any) => sum + (Number(n.calories) || 0), 0);
          let s = 25, t = "Poor Nutrition";
          if (cals >= 1800 && cals <= 2200) { s = 100; t = "Optimal Nutrition"; }
          else if (cals >= 1500 && cals <= 2500) { s = 75; t = "Good Nutrition"; }
          else if (cals > 0) { s = 50; t = "Fair Nutrition"; }
          metrics.push({ name: 'Nutrition', score: s, weight: 20, text: t });
          totalWeight += 20;
        }

        // 5. Blood Pressure (10%)
        if (bpLogs.length > 0) {
          const sys = Number(bpLogs[0].systolic);
          const dia = Number(bpLogs[0].diastolic);
          let s = 50, t = "High Blood Pressure";
          if (sys < 120 && dia < 80) { s = 100; t = "Optimal Blood Pressure"; }
          else if (sys <= 129 && dia < 80) { s = 90; t = "Normal Blood Pressure"; }
          else if (sys <= 139 || dia <= 89) { s = 75; t = "Elevated Blood Pressure"; }
          metrics.push({ name: 'BP', score: s, weight: 10, text: t });
          totalWeight += 10;
        }

        // 6. Blood Sugar (10%)
        if (bsLogs.length > 0) {
          const glucose = Number(bsLogs[0].glucoseLevel);
          setBloodSugar(glucose);
          let s = 50, t = "High Blood Sugar";
          if (glucose < 100) { s = 100; t = "Normal Blood Sugar"; }
          else if (glucose <= 125) { s = 75; t = "Elevated Blood Sugar"; }
          metrics.push({ name: 'Blood Sugar', score: s, weight: 10, text: t });
          totalWeight += 10;
        }

        // 7. Heart Rate (5%)
        if (hrLogs.length > 0) {
          const hr = Number(hrLogs[0].bpm);
          setHeartRate(hr);
          let s = 50, t = "Abnormal Heart Rate";
          if (hr >= 60 && hr <= 80) { s = 100; t = "Optimal Heart Rate"; }
          else if (hr >= 81 && hr <= 100) { s = 75; t = "Normal Heart Rate"; }
          metrics.push({ name: 'Heart Rate', score: s, weight: 5, text: t });
          totalWeight += 5;
        }

        // 8. SpO2 (5%)
        if (oxLogs.length > 0) {
          const oxygen = Number(oxLogs[0].spo2);
          setSpo2(oxygen);
          let s = 50, t = "Low Oxygen";
          if (oxygen >= 95) { s = 100; t = "Normal Oxygen"; }
          else if (oxygen >= 90) { s = 75; t = "Fair Oxygen"; }
          metrics.push({ name: 'SpO2', score: s, weight: 5, text: t });
          totalWeight += 5;
        }

        // 9. Body Temp (2%)
        if (tempLogs.length > 0) {
          const temp = Number(tempLogs[0].temperature);
          let s = 50, t = "Abnormal Temperature";
          if (temp >= 36.1 && temp <= 37.2) { s = 100; t = "Normal Temperature"; }
          else if (temp >= 35.5 && temp <= 37.5) { s = 75; t = "Fair Temperature"; }
          metrics.push({ name: 'Temperature', score: s, weight: 2, text: t });
          totalWeight += 2;
        }

        // 10. Stress (3%)
        if (stressLogs.length > 0) {
          const stressLevel = Number(stressLogs[0].stressLevel);
          if (stressLevel >= 8) setStress("High");
          else if (stressLevel >= 5) setStress("Medium");
          else setStress("Low");
          
          let s = 25, t = "High Stress";
          if (stressLevel <= 4) { s = 100; t = "Low Stress"; }
          else if (stressLevel <= 7) { s = 75; t = "Moderate Stress"; }
          metrics.push({ name: 'Stress', score: s, weight: 3, text: t });
          totalWeight += 3;
        }

        let finalScore = 0;
        let finalBreakdowns: any[] = [];

        if (totalWeight > 0) {
          let scoreSum = 0;
          metrics.forEach(m => {
            const effectiveWeight = m.weight / totalWeight;
            const points = m.score * effectiveWeight;
            scoreSum += points;
            finalBreakdowns.push({
              text: m.text,
              points: points,
              isPositive: m.score >= 75
            });
          });
          
          finalScore = Math.round(scoreSum);
          
          let roundedSum = 0;
          finalBreakdowns = finalBreakdowns.map(b => {
            const r = Math.round(b.points);
            roundedSum += r;
            return { ...b, points: r };
          });
          
          const diff = finalScore - roundedSum;
          if (diff !== 0 && finalBreakdowns.length > 0) {
            finalBreakdowns[0].points += diff; 
          }
        }

        const goodMetrics = metrics.filter(m => m.score >= 75).map(m => m.name);
        const badMetrics = metrics.filter(m => m.score < 75).map(m => m.name);

        let aiExplanation = "Your Health Score is dynamically calculated based on your latest records. ";
        if (goodMetrics.length > 0) {
          aiExplanation += `It is positively impacted by your ${goodMetrics.slice(0, 2).join(' and ').toLowerCase()}. `;
        }
        if (badMetrics.length > 0) {
          aiExplanation += `Consider improving your ${badMetrics.slice(0, 2).join(' and ').toLowerCase()} to increase your score.`;
        }
        if (goodMetrics.length === 0 && badMetrics.length === 0) {
          aiExplanation = "Keep logging your data to get deeper insights into your health and wellness trends.";
        }

        let estimatedBioAge: number | null = null;
        if (user.age) {
          const realAge = Number(user.age);
          if (finalScore > 0) {
            estimatedBioAge = realAge + (80 - finalScore) / 5;
          } else {
            estimatedBioAge = realAge;
          }
        }

        let wellnessIndex = "Needs Improvement";
        if (finalScore >= 90) wellnessIndex = "Excellent";
        else if (finalScore >= 80) wellnessIndex = "Very Good";
        else if (finalScore >= 70) wellnessIndex = "Good";
        else if (finalScore >= 60) wellnessIndex = "Fair";

        setHealthData({
          score: finalScore,
          bioAge: estimatedBioAge,
          wellnessIndex: wellnessIndex,
          breakdowns: finalBreakdowns.sort((a, b) => b.points - a.points),
          completionPercentage: totalWeight,
          isEnoughData: totalWeight >= 30,
          aiExplanation
        });

        // Process past 7 days calories for chart
        const past7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });
        
        const chartData = past7Days.map(date => {
          const dayNuts = nutLogs.filter((log: any) => log.date === date);
          const cals = dayNuts.reduce((sum: number, n: any) => sum + (Number(n.calories) || 0), 0);
          return {
             name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
             calories: cals
          };
        });
        setActivityData(chartData);

      } catch (err) {
        console.error("Error fetching data for dashboard", err);
      }
    };
    
    fetchData();
    
    // Add event listener to recalculate when a new record is added
    const handleRecordAdded = () => {
      fetchData();
    };
    window.addEventListener('record-added', handleRecordAdded);
    return () => window.removeEventListener('record-added', handleRecordAdded);
    
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="col-span-1 lg:col-span-4 flex flex-col items-center justify-between py-8">
          <div className="text-center mb-6">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Overall Health Score</h3>
            <p className="text-xs text-slate-400 mt-1">Profile Completion: {healthData.completionPercentage}%</p>
          </div>
          
          {healthData.isEnoughData ? (
            <>
              <div className="w-[140px] h-[140px] rounded-full bg-[conic-gradient(#10b981_88%,#e2e8f0_0)] dark:bg-[conic-gradient(#10b981_88%,#334155_0)] flex items-center justify-center relative">
                <div className="absolute w-[115px] h-[115px] bg-white dark:bg-slate-900 rounded-full"></div>
                <div className="relative z-10 text-[32px] font-extrabold text-slate-900 dark:text-white">
                  {healthData.score}
                </div>
              </div>
              
              <div className="mt-8 w-full space-y-3 px-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Biological Age</span>
                  <span className="font-bold text-slate-900 dark:text-white">{healthData.bioAge !== null ? `${healthData.bioAge.toFixed(1)} Years` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Wellness Index</span>
                  <span className="font-bold text-emerald-500">{healthData.wellnessIndex}</span>
                </div>
                <div className="text-[10px] text-center text-slate-400 mt-4 px-2">
                  This is an estimated wellness age and not a medical diagnosis. Add your age in Settings to calculate.
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center mt-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Activity size={32} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Complete more health logs to calculate your personalized Health Score.
              </p>
              <p className="text-xs text-slate-400 mt-3 font-semibold text-amber-500">
                Minimum 30% completion required.
              </p>
            </div>
          )}
        </Card>

        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          <Card className="bg-slate-900 text-white border-0 dark:bg-slate-950 p-6 flex flex-col h-full min-h-[280px]">
            <div className="flex justify-between items-start mb-6">
              <div className="pr-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-[12px] font-bold inline-block">HEALTH INSIGHT</span>
                  <span className="text-xs text-slate-400 hidden sm:inline-block">Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold mb-2">Score Analysis</h2>
                <p className="text-slate-400 text-sm max-w-2xl">{healthData.aiExplanation}</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest">Score Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {healthData.breakdowns.length > 0 ? (
                  healthData.breakdowns.map((b, idx) => (
                    <div key={idx} className="bg-white/10 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200 truncate pr-2">{b.text}</span>
                      <span className={cn("font-bold shrink-0", b.isPositive ? "text-emerald-400" : "text-amber-400")}>
                        +{b.points}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-sm text-slate-500 italic">No score breakdown available yet. Log data to see insights.</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-1 shadow-sm">
          <span className="text-2xl mb-1">❤️</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Heart Rate</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">{heartRate || '--'} <span className="text-sm font-normal text-slate-400">BPM</span></span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-1 shadow-sm">
          <span className="text-2xl mb-1">🩸</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Blood Sugar</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">{bloodSugar || '--'} <span className="text-sm font-normal text-slate-400">mg/dL</span></span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-1 shadow-sm">
          <span className="text-2xl mb-1">💨</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">SpO2</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">{spo2 || '--'} <span className="text-sm font-normal text-slate-400">%</span></span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="col-span-1 lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity Overview</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Calories
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-1 lg:col-span-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Today's Nutrition Plan</h2>
          
          <div className="space-y-4">
            {nutrition.length > 0 ? (
              nutrition.map((meal, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-xl">
                    🥣
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{meal.mealName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Calories: {meal.calories} | Protein: {meal.protein}g</p>
                  </div>
                  <div className="text-emerald-500 font-bold text-sm">Done</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No meals logged today. Add one from the records tab!</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

