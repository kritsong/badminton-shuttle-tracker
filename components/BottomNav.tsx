
import React from 'react';
import { View } from '../types';
import Icon from './Icon';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: 'Sessions', label: 'เซสชั่น', icon: <Icon.Clock /> },
  { view: 'Players', label: 'ผู้เล่น', icon: <Icon.Users /> },
  { view: 'Record', label: 'บันทึก', icon: <Icon.PlusCircle /> },
  { view: 'Settings', label: 'ตั้งค่า', icon: <Icon.Settings /> },
];

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg">
      <div className="flex justify-around max-w-2xl mx-auto">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 ${
              currentView === item.view ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
