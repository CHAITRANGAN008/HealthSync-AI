import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { getRecords, deleteRecord } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { Bell, Clock, Plus, Trash2, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { AddRecordModal } from '@/components/ui/AddRecordModal';

export function Medicine() {
  const { user } = useAppContext();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMedicines = async () => {
    try {
      const data = await getRecords('medicineLogs', user?.id || "guest");
      setMedicines(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchMedicines();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this medicine?")) return;
    await deleteRecord('medicineLogs', id, user?.id || "guest");
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Medicine & Reminders
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Never miss a dose. Track your active medications.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden md:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
        >
          <Plus size={18} /> Add Medicine
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicines.map(med => (
          <Card key={med.id} className="relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                <Bell size={24} />
              </div>
              <button 
                onClick={() => handleDelete(med.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <h3 className="font-bold text-lg mb-1">{med.medicineName}</h3>
            <p className="text-slate-500 text-sm mb-4">{med.dosage}</p>
            
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <Clock size={16} className="text-emerald-500" />
              {med.frequency}
            </div>
            
            {med.notes && (
              <p className="mt-4 text-xs text-slate-400 italic">Note: {med.notes}</p>
            )}
          </Card>
        ))}

        {medicines.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
            <CalendarIcon size={48} className="mb-4 opacity-20" />
            <p>No medicines tracked.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 text-emerald-500 font-medium md:hidden">
              Add Medicine
            </button>
          </div>
        )}
      </div>

      <AddRecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMedicines} 
        initialTab="medicineLogs"
      />
    </div>
  );
}
