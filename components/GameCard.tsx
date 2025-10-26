import React from 'react';
import { GameUse, Gender } from '../types';
import { useAppContext } from '../context/AppContext';
import Icon from './Icon';
import LevelIndicator from './LevelIndicator';

const getGenderIcon = (gender: Gender) => {
    switch (gender) {
        case Gender.Male: return <Icon.Male className="w-5 h-5" />;
        case Gender.Female: return <Icon.Female className="w-5 h-5" />;
        default: return <Icon.User className="w-5 h-5" />;
    }
};

const GameCard: React.FC<{
    game: GameUse;
    onEdit?: (game: GameUse) => void;
}> = ({ game, onEdit }) => {
    const { getPlayerById, endGameUse } = useAppContext();
    return (
         <div key={game.id} className="bg-gray-800 p-3 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-cyan-400">เกมที่ {game.shuttleSessionId}</h3>
                     <div className="flex items-center gap-1 text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded-full">
                        <Icon.Shuttle className="w-4 h-4" />
                        <span>x {game.shuttlesUsed || 1}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(game.timestamp).toLocaleTimeString('th-TH')}</span>
                    {onEdit && <button onClick={() => onEdit(game)} className="text-gray-400 hover:text-white"><Icon.Edit className="w-5 h-5"/></button>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-sm">
                {game.players.map(playerId => {
                    const player = getPlayerById(playerId);
                    if (!player) return <div key={playerId} className="bg-gray-700/50 p-1.5 rounded">Unknown Player</div>;
                    
                    const teamClass = game.players.indexOf(playerId) < 2 ? 'bg-red-900/30' : 'bg-blue-900/30';

                    return (
                        <div key={playerId} className={`flex items-center gap-2 p-1.5 rounded ${teamClass}`}>
                            <span className={player.gender === Gender.Male ? 'text-blue-400' : player.gender === Gender.Female ? 'text-pink-400' : 'text-gray-400'}>
                                {getGenderIcon(player.gender)}
                            </span>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate font-semibold text-sm">{player.name}</p>
                                <LevelIndicator level={player.level} />
                            </div>
                        </div>
                    )
                })}
            </div>
            {game.isActive ? (
                <button
                    onClick={() => endGameUse(game.id)}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    จบเกม
                </button>
            ) : (
                <div className="text-center text-sm text-green-400 p-2 bg-green-900/30 rounded-md font-semibold">
                    จบแล้ว
                </div>
            )}
        </div>
    );
}

export default GameCard;