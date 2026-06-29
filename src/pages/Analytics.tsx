import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { getRecords } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';

export function Analytics() {
  const { user } = useAppContext();
  const [weightData, setWeightData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const weights = await getRecords('weightLogs', user.id);
        const sortedWeights = weights.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10); // Last 10 records
        const formattedWeights = sortedWeights.map((w: any) => {
           const d = new Date(w.date);
           return {
             month: `${d.getDate()}/${d.getMonth()+1}`,
             weight: w.weight
           }
        });
        setWeightData(formattedWeights);

        const sleeps = await getRecords('sleepLogs', user.id);
        const sortedSleeps = sleeps.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7); // Last 7 records
        const formattedSleeps = sortedSleeps.map((s: any) => {
           const d = new Date(s.date);
           return {
             day: `${d.getDate()}/${d.getMonth()+1}`,
             hours: s.duration || 0,
             quality: s.quality === 'Good' ? 90 : s.quality === 'Fair' ? 70 : 50
           }
        });
        setSleepData(formattedSleeps);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Analytics & Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Track your long-term progress and health trends.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Weight Progress (kg)</h2>
          <div className="h-80 w-full">
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400 text-sm">No weight data available</div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sleep Duration vs Quality</h2>
          <div className="h-80 w-full">
            {sleepData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'rgba(51, 65, 85, 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="hours" name="Hours Slept" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar yAxisId="right" dataKey="quality" name="Quality Score" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400 text-sm">No sleep data available</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          const latestWeight = weightData[weightData.length - 1]?.weight || 70; // fallback to 70kg
          const heightInMeters = 1.75; // assume 1.75m as default
          const bmi = (latestWeight / (heightInMeters * heightInMeters)).toFixed(1);
          
          let bmiCategory = "Normal";
          if (Number(bmi) < 18.5) bmiCategory = "Underweight";
          if (Number(bmi) >= 25) bmiCategory = "Overweight";
          if (Number(bmi) >= 30) bmiCategory = "Obese";

          // Mifflin-St Jeor Equation (assuming 25 age, male for BMR)
          const bmr = (10 * latestWeight + 6.25 * (heightInMeters * 100) - 5 * 25 + 5).toFixed(0);
          const dailyCal = (Number(bmr) * 1.55).toFixed(0);
          const idealWeight = (22 * (heightInMeters * heightInMeters)).toFixed(1);
          const waterReq = (latestWeight * 35 / 1000).toFixed(1); // 35ml per kg

          return (
            <>
              <Card>
                <div className="text-sm text-slate-500 mb-1">Body Mass Index (BMI)</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-end gap-2">
                  {bmi} <span className="text-sm font-medium text-emerald-500 mb-1">{bmiCategory}</span>
                </div>
              </Card>
              <Card>
                <div className="text-sm text-slate-500 mb-1">Basal Metabolic Rate</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{bmr} <span className="text-sm font-normal text-slate-500">kcal/day</span></div>
              </Card>
              <Card>
                <div className="text-sm text-slate-500 mb-1">Target Daily Calories</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{dailyCal} <span className="text-sm font-normal text-slate-500">kcal</span></div>
              </Card>
              <Card>
                <div className="text-sm text-slate-500 mb-1">Ideal Weight & Water</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white flex justify-between items-center text-sm">
                   <span>{idealWeight} kg</span>
                   <span className="text-blue-500">{waterReq} L/day</span>
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );
}
