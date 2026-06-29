import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { X, Loader2 } from 'lucide-react';
import { addRecord, updateRecord } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTab?: string;
  editRecord?: any;
}

export function AddRecordModal({ isOpen, onClose, onSuccess, initialTab = 'waterLogs', editRecord = null }: AddRecordModalProps) {
  const { user } = useAppContext();
  const [type, setType] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Generic form data state
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      if (editRecord) {
        setType(initialTab);
        setFormData(editRecord);
      } else {
        setType(initialTab);
        setFormData({});
      }
      setError('');
      setSuccess(false);
    }
  }, [isOpen, editRecord, initialTab]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate Data
      if (type === 'waterLogs' && (formData.amount <= 0 || !formData.amount)) throw new Error("Water amount must be greater than 0");
      if (type === 'weightLogs' && (formData.weight <= 20 || !formData.weight)) throw new Error("Weight must be greater than 20 kg");
      if (type === 'heartRateLogs' && (formData.bpm < 30 || formData.bpm > 220 || !formData.bpm)) throw new Error("Heart rate must be between 30 and 220 BPM");
      if (type === 'bloodSugarLogs' && (formData.glucoseLevel <= 0 || !formData.glucoseLevel)) throw new Error("Blood sugar must be positive");
      if (type === 'bloodPressureLogs') {
         if (!formData.systolic || !formData.diastolic) throw new Error("Both systolic and diastolic values are required");
         if (formData.systolic <= formData.diastolic) throw new Error("Systolic must be greater than diastolic");
      }
      if (type === 'sleepLogs') {
         if (!formData.bedtime || !formData.wakeupTime) throw new Error("Bedtime and wakeup time are required");
         // Basic calculation to set duration (dummy calculation here as full duration logic requires date parsing)
         const bd = new Date(`2000-01-01T${formData.bedtime}`);
         let wd = new Date(`2000-01-01T${formData.wakeupTime}`);
         if (wd < bd) wd = new Date(`2000-01-02T${formData.wakeupTime}`);
         const diffHrs = (wd.getTime() - bd.getTime()) / (1000 * 60 * 60);
         if (diffHrs < 0 || diffHrs > 24) throw new Error("Invalid sleep duration");
         formData.duration = diffHrs;
      }
      
      // Add current date/time if not provided
      const dataToSave = { ...formData };
      if (!dataToSave.date) {
        dataToSave.date = new Date().toISOString().split('T')[0];
      }
      if (!dataToSave.time && type !== 'weightLogs' && type !== 'sleepLogs' && type !== 'nutritionLogs') {
        dataToSave.time = new Date().toTimeString().split(' ')[0].substring(0, 5);
      }

      if (editRecord) {
        await updateRecord(type, editRecord.id, dataToSave, user?.id || "guest");
      } else {
        await addRecord(type, dataToSave, user?.id || "guest");
      }
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setFormData({});
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (type) {
      case 'waterLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Amount (ml)</label>
              <input required type="number" name="amount" value={formData.amount || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input type="text" name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </>
        );
      case 'weightLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input required type="number" step="0.1" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input type="text" name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </>
        );
      case 'bloodPressureLogs':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Systolic</label>
                <input required type="number" name="systolic" value={formData.systolic || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Diastolic</label>
                <input required type="number" name="diastolic" value={formData.diastolic || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pulse</label>
              <input required type="number" name="pulse" value={formData.pulse || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </>
        );
      case 'bloodSugarLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Glucose Level (mg/dL)</label>
              <input required type="number" name="glucoseLevel" value={formData.glucoseLevel || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Measurement Type</label>
              <select name="measurementType" value={formData.measurementType || 'Fasting'} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                <option value="Fasting">Fasting</option>
                <option value="Post-meal">Post-meal</option>
                <option value="Random">Random</option>
              </select>
            </div>
          </>
        );
      case 'heartRateLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">BPM</label>
              <input required type="number" name="bpm" value={formData.bpm || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Measurement Type (e.g. Resting)</label>
              <input required type="text" name="measurementType" value={formData.measurementType || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </>
        );
      case 'oxygenLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">SpO2 (%)</label>
              <input required type="number" max="100" name="spo2" value={formData.spo2 || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </>
        );
      case 'temperatureLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Temperature</label>
              <input required type="number" step="0.1" name="temperature" value={formData.temperature || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select name="unit" value={formData.unit || 'C'} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                <option value="C">Celsius</option>
                <option value="F">Fahrenheit</option>
              </select>
            </div>
          </>
        );
      case 'sleepLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Bedtime (e.g. 22:30)</label>
              <input required type="time" name="bedtime" value={formData.bedtime || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Wakeup Time (e.g. 06:30)</label>
              <input required type="time" name="wakeupTime" value={formData.wakeupTime || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quality (1-10)</label>
              <input required type="number" min="1" max="10" name="quality" value={formData.quality || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </>
        );
      case 'medicineLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Medicine Name</label>
              <input required type="text" name="medicineName" value={formData.medicineName || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dosage</label>
                <input required type="text" name="dosage" value={formData.dosage || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <input required type="text" name="frequency" value={formData.frequency || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input type="text" name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </>
        );
      case 'nutritionLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Meal Name</label>
              <input required type="text" name="mealName" value={formData.mealName || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Calories (kcal)</label>
                <input required type="number" name="calories" value={formData.calories || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Protein (g)</label>
                <input type="number" name="protein" value={formData.protein || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
              </div>
            </div>
          </>
        );
      case 'moodLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Mood Score (1-10)</label>
              <input required type="number" min="1" max="10" name="moodScore" value={formData.moodScore || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input type="text" name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </>
        );
      case 'stressLogs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Stress Level (1-10)</label>
              <input required type="number" min="1" max="10" name="stressLevel" value={formData.stressLevel || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Triggers / Notes</label>
              <input type="text" name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
            </div>
          </>
        );
      default:
        return (
          <p className="text-sm text-slate-500">Form fields for {type} are coming soon.</p>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Add Health Record</h2>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">Record saved successfully!</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Record Type</label>
            <select 
              value={type} 
              onChange={(e) => { setType(e.target.value); setFormData({}); }}
              className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="waterLogs">Water Intake</option>
              <option value="weightLogs">Weight</option>
              <option value="bloodPressureLogs">Blood Pressure</option>
              <option value="bloodSugarLogs">Blood Sugar</option>
              <option value="heartRateLogs">Heart Rate</option>
              <option value="oxygenLogs">Oxygen (SpO2)</option>
              <option value="temperatureLogs">Temperature</option>
              <option value="sleepLogs">Sleep</option>
              <option value="medicineLogs">Medicine</option>
              <option value="nutritionLogs">Nutrition</option>
              <option value="moodLogs">Mood</option>
              <option value="stressLogs">Stress</option>
            </select>
          </div>

          <div className="space-y-4 text-slate-900 dark:text-white">
            {renderFormFields()}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors mt-6"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            Save Record
          </button>
        </form>
      </Card>
    </div>
  );
}
