import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { getRecords, deleteRecord } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { Trash2, Loader2, Plus } from 'lucide-react';
import { AddRecordModal } from '@/components/ui/AddRecordModal';

export function Records() {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('waterLogs');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getRecords(activeTab, user.id || "guest");
      setRecords(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeTab]);

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteRecord(activeTab, id, user?.id || "guest");
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { id: 'waterLogs', label: 'Water' },
    { id: 'weightLogs', label: 'Weight' },
    { id: 'bloodPressureLogs', label: 'Blood Pressure' },
    { id: 'bloodSugarLogs', label: 'Blood Sugar' },
    { id: 'heartRateLogs', label: 'Heart Rate' },
    { id: 'oxygenLogs', label: 'SpO2' },
    { id: 'temperatureLogs', label: 'Temperature' },
    { id: 'sleepLogs', label: 'Sleep' },
    { id: 'medicineLogs', label: 'Medicine' },
    { id: 'nutritionLogs', label: 'Nutrition' },
    { id: 'moodLogs', label: 'Mood' },
    { id: 'stressLogs', label: 'Stress' },
  ];

  const renderValue = (record: any) => {
    switch (activeTab) {
      case 'waterLogs': return `${record.amount} ml`;
      case 'weightLogs': return `${record.weight} kg`;
      case 'bloodPressureLogs': return `${record.systolic}/${record.diastolic} mmHg (Pulse: ${record.pulse})`;
      case 'bloodSugarLogs': return `${record.glucoseLevel} mg/dL (${record.measurementType})`;
      case 'heartRateLogs': return `${record.bpm} BPM (${record.measurementType})`;
      case 'oxygenLogs': return `${record.spo2}% SpO2`;
      case 'temperatureLogs': return `${record.temperature}°${record.unit}`;
      case 'sleepLogs': return `Bed: ${record.bedtime}, Wake: ${record.wakeupTime} (Quality: ${record.quality}/10)`;
      case 'medicineLogs': return `${record.medicineName} - ${record.dosage} (${record.frequency})`;
      case 'nutritionLogs': return `${record.mealName} - ${record.calories} kcal`;
      case 'moodLogs': return `Mood: ${record.moodScore}/10`;
      case 'stressLogs': return `Stress: ${record.stressLevel}/10`;
      default: return JSON.stringify(record);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Health Records
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            View and manage your tracking history.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden md:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
        >
          <Plus size={18} /> Add Record
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white dark:bg-emerald-500'
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col p-0 bg-white/50 dark:bg-slate-900/50">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <p>No records found.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-emerald-500 font-medium hover:underline"
              >
                Add your first record
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map(record => (
                <div key={record.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{renderValue(record)}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
                      <span className="whitespace-nowrap">{record.date} {record.time && `at ${record.time}`}</span>
                      {record.notes && <span className="truncate">• {record.notes}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto shrink-0">
                    <button 
                      onClick={() => handleEdit(record)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <span className="text-sm">Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <AddRecordModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }} 
        onSuccess={fetchRecords} 
        initialTab={activeTab}
        editRecord={editingRecord}
      />
    </div>
  );
}
