import React, { useState, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import PlayersView from './views/PlayersView';
import RecordUseView from './views/RecordUseView';
import SessionsView from './views/SessionsView';
import SettingsView from './views/SettingsView';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('Sessions');

  const renderView = useCallback(() => {
    switch (currentView) {
      case 'Sessions':
        return <SessionsView setCurrentView={setCurrentView} />;
      case 'Players':
        return <PlayersView />;
      case 'Record':
        return <RecordUseView setCurrentView={setCurrentView} />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <SessionsView setCurrentView={setCurrentView} />;
    }
  }, [currentView]);

  return (
    <AppProvider>
      <div className="flex flex-col h-screen font-sans">
        <main className="flex-1 overflow-y-auto pb-20 bg-gray-900 text-gray-100">
          {renderView()}
        </main>
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    </AppProvider>
  );
};

export default App;
