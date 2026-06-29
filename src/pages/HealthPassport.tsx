import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { QrCode, FileText, Printer, Share2, Download, Shield } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export function HealthPassport() {
  const { user } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAction = (action: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`${action} successful!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Health Passport
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Securely share your medical summary with healthcare providers.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="col-span-1 lg:col-span-4 flex flex-col items-center py-10 relative overflow-hidden text-center">
          <div className="w-40 h-40 bg-white border-4 border-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-xl relative group">
            <QrCode size={120} className="text-slate-800" />
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                <Download size={16} /> Save
              </button>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-1">{user?.name || 'Guest User'}</h2>
          <p className="text-slate-500 mb-6">Blood Type: O+ | Age: 28</p>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
            <Shield size={16} /> Verified Patient Profile
          </div>
        </Card>

        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          <Card className="flex-1">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="text-blue-500" /> Medical Summary
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Allergies</p>
                  <p className="font-medium">Penicillin, Peanuts</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Chronic Conditions</p>
                  <p className="font-medium">Mild Asthma</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Emergency Contact</p>
                  <p className="font-medium">Jane Doe (Wife)</p>
                  <p className="text-sm text-slate-500">+1 234 567 8900</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Primary Care Physician</p>
                  <p className="font-medium">Dr. Smith</p>
                  <p className="text-sm text-slate-500">City Hospital</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Medications</p>
                <div className="flex gap-2 mt-2">
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm">Albuterol Inhaler</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm">Vitamin D3</span>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => handleAction('PDF Download')}
              disabled={isGenerating}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-500 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download size={24} />
              <span className="font-medium">Download PDF</span>
            </button>
            <button 
              onClick={() => handleAction('Print Document')}
              disabled={isGenerating}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-500 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Printer size={24} />
              <span className="font-medium">Print Passport</span>
            </button>
            <button 
              onClick={() => handleAction('Share Link Generated')}
              disabled={isGenerating}
              className="bg-slate-900 dark:bg-emerald-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Share2 size={24} />
              <span className="font-medium">Secure Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
