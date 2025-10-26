import React, { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Player, Gender, Level, View, PlayerStatus } from '../types';
import Icon from '../components/Icon';
import LevelIndicator from '../components/LevelIndicator';

interface AutoSelectViewProps {
  setCurrentView: (view: View) => void;
}

const getGenderIcon = (gender: Gender) => {
    switch (gender) {
        case Gender.Male: return <Icon.Male className="w-5 h-5" />;
        case Gender.Female: return <Icon.Female className="w-5 h-5" />;
        default: return <Icon.User className="w-5 h-5" />;
    }
};

const AutoSelectView: React.FC<AutoSelectViewProps> = ({ setCurrentView }) => {
  const { players, addGameUse, presentPlayerIds, gameUses, activeSession } = useAppContext();
  const [genderFilter, setGenderFilter] = useState<'Any' | 'Male' | 'Female' | 'Mixed'>('Any');
  const [levelFilter, setLevelFilter] = useState<Level | 'Any'>('Any');
  const [suggestedPlayers, setSuggestedPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState('');

  const getFilteredPlayers = useCallback(() => {
    let filtered = players.filter(p => p.active && p.status === PlayerStatus.Free && presentPlayerIds.has(p.id));
    if (levelFilter !== 'Any') {
      filtered = filtered.filter(p => p.level === levelFilter);
    }
    return filtered;
  }, [players, levelFilter, presentPlayerIds]);

  const suggestTeam = () => {
    const availablePlayers = getFilteredPlayers();
    let team: Player[] = [];
    setSuggestedPlayers([]);
    setMessage('');

    if (availablePlayers.length < 4) {
      setMessage('มีผู้เล่นที่ว่างไม่พอสำหรับสร้างทีม (จากผู้เล่นที่มาวันนี้)');
      return;
    }
    
    const shuffled = [...availablePlayers].sort(() => 0.5 - Math.random());
    
    if (genderFilter === 'Mixed') {
        const males = shuffled.filter(p => p.gender === Gender.Male);
        const females = shuffled.filter(p => p.gender === Gender.Female);
        if (males.length >= 2 && females.length >= 2) {
            team = [...males.slice(0, 2), ...females.slice(0, 2)];
        } else {
            team = shuffled.slice(0, 4);
        }
    } else if (genderFilter === 'Male' || genderFilter === 'Female') {
        const genderedPlayers = shuffled.filter(p => p.gender === genderFilter);
        if(genderedPlayers.length >= 4) {
            team = genderedPlayers.slice(0, 4);
        } else {
             team = shuffled.slice(0, 4);
        }
    } else { // Any
        team = shuffled.slice(0, 4);
    }
    
    setSuggestedPlayers(team);
  };

  const handleStartGame = () => {
    if (suggestedPlayers.length === 4) {
      const gamesInSession = activeSession ? gameUses.filter(g => activeSession.gameUseIds.includes(g.id)) : [];
      const shuttleSessionId = gamesInSession.length > 0 ? Math.max(...gamesInSession.map(g => g.shuttleSessionId)) + 1 : 1;
      const success = addGameUse({ 
          players: suggestedPlayers.map(p => p.id), 
          shuttleSessionId,
          shuttlesUsed: 1,
      });
      if(success) {
        setMessage('เริ่มเกมแล้ว!');
        setSuggestedPlayers([]);
        setTimeout(() => {
            setMessage('');
            setCurrentView('Record');
        }, 2000);
      } else {
        setMessage('เกิดข้อผิดพลาดในการเริ่มเกม');
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">เลือกผู้เล่นอัตโนมัติ</h1>

      <div className="bg-gray-800 p-4 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">ตัวกรอง (จากผู้เล่นที่มาวันนี้)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">เพศ</label>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value as any)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600">
              <option value="Any">ทั้งหมด</option>
              <option value="Male">ชาย</option>
              <option value="Female">หญิง</option>
              <option value="Mixed">ผสม</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">ระดับฝีมือ</label>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value as any)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600">
              <option value="Any">ทั้งหมด</option>
              {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <button onClick={suggestTeam} className="w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-500">
          แนะนำ 4 คน
        </button>
      </div>

      {message && <p className="text-center text-yellow-400">{message}</p>}

      {suggestedPlayers.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">ทีมที่แนะนำ</h2>
          <div className="grid grid-cols-2 gap-2">
            {suggestedPlayers.map(p => (
              <div key={p.id} className="bg-gray-700 p-3 rounded flex flex-col justify-between">
                <p className="font-medium truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={p.gender === Gender.Male ? 'text-blue-400' : p.gender === Gender.Female ? 'text-pink-400' : 'text-gray-400'}>
                        {getGenderIcon(p.gender)}
                    </span>
                    <LevelIndicator level={p.level} />
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={handleStartGame}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500"
          >
            เริ่มเกมด้วยทีมนี้
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoSelectView;