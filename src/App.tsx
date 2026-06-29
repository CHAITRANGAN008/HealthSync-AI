import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AICoach } from './pages/AICoach';
import { Analytics } from './pages/Analytics';
import { Wellness } from './pages/Wellness';
import { Records } from './pages/Records';
import { AirQuality } from './pages/AirQuality';
import { Medicine } from './pages/Medicine';
import { Challenges } from './pages/Challenges';
import { Grocery } from './pages/Grocery';
import { HealthPassport } from './pages/HealthPassport';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'records':
        return <Records />;
      case 'ai-coach':
      case 'aicoach':
        return <AICoach />;
      case 'analytics':
        return <Analytics />;
      case 'air-quality':
        return <AirQuality />;
      case 'wellness':
        return <Wellness />;
      case 'medicine':
        return <Medicine />;
      case 'challenges':
        return <Challenges />;
      case 'grocery':
        return <Grocery />;
      case 'passport':
        return <HealthPassport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderContent()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
