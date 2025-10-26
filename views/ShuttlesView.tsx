
import React from 'react';
import { useAppContext } from '../context/AppContext';

const GamesView: React.FC = () => {
    const { gameUses, endGameUse, getPlayerById } = useAppContext();
    const activeGames = gameUses.filter(g => g.isActive);

    const getPlayerName = (id: string): string => getPlayerById(id)?.name || 'Unknown';

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-3xl font-bold">เกมที่กำลังเล่น</h1>
            
            {activeGames.length > 0 ? (
                <div className="space-y-3">
                    {activeGames.map(game => (
                        <div key={game.id} className="bg-gray-800 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold text-lg text-cyan-400">ลูกที่ {game.shuttleSessionId}</h2>
                                <span className="text-xs text-gray-400">{new Date(game.timestamp).toLocaleTimeString('th-TH')}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                {game.players.map(playerId => <p key={playerId} className="truncate">{getPlayerName(playerId)}</p>)}
                            </div>
                            <button
                                onClick={() => endGameUse(game.id)}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                จบเกม
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-400 text-lg">ไม่มีเกมที่กำลังเล่นอยู่</p>
                </div>
            )}
        </div>
    );
};

export default GamesView;
