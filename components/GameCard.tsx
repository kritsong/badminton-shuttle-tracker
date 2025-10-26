import React from 'react';
import { GameUse, Gender } from '../types';
import { useAppContext } from '../context/AppContext';
import Icon from './Icon';

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
         <div key={game.id} className="bg-gray-800 px-3 py-2 rounded-lg space-y-2">
            <div className="flex justify-between items-center gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-cyan-400 whitespace-nowrap">เกม {game.shuttleSessionId}</span>
                    <span className="flex items-center gap-1 whitespace-nowrap bg-gray-700/60 px-2 py-0.5 rounded-full text-gray-200">
                        <Icon.Shuttle className="w-3.5 h-3.5" />
                        x {game.shuttlesUsed || 1}
                    </span>
                    <span className="text-gray-400 truncate">
                        {game.players.map((playerId, index) => {
                            const player = getPlayerById(playerId);
                            if (!player) return 'Unknown';
                            const prefix = index === 2 ? ' | ' : index === 0 || index === 2 ? '' : ', ';
                            const marker = index === 2 ? 'vs ' : '';
                            return `${prefix}${marker}${player.name}`;
                        }).join('')}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                    {!game.isActive && (
                        <span className="text-green-400 font-semibold">จบแล้ว</span>
                    )}
                    <span className="text-gray-500">{new Date(game.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                    {onEdit && (
                        <button onClick={() => onEdit(game)} className="text-gray-400 hover:text-white">
                            <Icon.Edit className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            {game.isActive && (
                <button
                    onClick={() => endGameUse(game.id)}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 rounded transition-colors text-sm"
                >
                    จบเกม
                </button>
            )}
        </div>
    );
}

export default GameCard;
