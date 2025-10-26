import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Player, GameUse, Gender, PlayerStatus } from '../types';
import Icon from './Icon';

const getGenderIcon = (gender: Gender) => {
    switch (gender) {
        case Gender.Male: return <Icon.Male className="w-5 h-5" />;
        case Gender.Female: return <Icon.Female className="w-5 h-5" />;
        default: return <Icon.User className="w-5 h-5" />;
    }
};

const PlayerPicker: React.FC<{
    selectedPlayers: (Player | null)[];
    onAddPlayer: (player: Player) => void;
    onRemovePlayer: (player: Player, index: number) => void;
    availablePlayers: Player[];
    disabled: boolean;
    allowPlayingPlayers?: boolean;
    allowDuplicates?: boolean;
}> = ({ selectedPlayers, onAddPlayer, onRemovePlayer, availablePlayers, disabled, allowPlayingPlayers = false, allowDuplicates = false }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const unselectedPlayers = availablePlayers
        .filter(ap => allowDuplicates ? true : !selectedPlayers.some(sp => sp?.id === ap.id))
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aIsPlaying = a.status === PlayerStatus.Playing;
            const bIsPlaying = b.status === PlayerStatus.Playing;
            if (aIsPlaying && !bIsPlaying) return 1;
            if (!aIsPlaying && bIsPlaying) return -1;
            return a.name.localeCompare(b.name);
        });

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg mb-2">ทีมที่เลือก (แตะเพื่อเอาออก)</h3>
                <div className="grid grid-cols-2 gap-2">
                    {selectedPlayers.map((player, index) => {
                         const teamClass = index < 2 
                            ? 'bg-red-900/50 ring-red-500' 
                            : 'bg-blue-900/50 ring-blue-500';
                        if (player) {
                            return (
                                <button key={`${player.id}-${index}`} type="button" onClick={() => onRemovePlayer(player, index)} className={`p-2 rounded-lg text-left transition-colors ring-1 ${teamClass} flex items-center gap-2`}>
                                    <span className={player.gender === Gender.Male ? 'text-blue-400' : player.gender === Gender.Female ? 'text-pink-400' : 'text-gray-400'}>
                                        {getGenderIcon(player.gender)}
                                    </span>
                                    <span className="flex-1 truncate font-bold text-sm">{player.name}</span>
                                </button>
                            );
                        }
                        const team = index < 2 ? 'ทีมแดง' : 'ทีมน้ำเงิน';
                        const position = index < 2 ? index + 1 : index - 1;
                        return (
                            <div key={`placeholder-${index}`} className="p-3 rounded text-center border-2 border-dashed border-gray-600 text-gray-500 flex items-center justify-center h-14">
                               {team} {position}
                            </div>
                        );
                    })}
                </div>
            </div>
             <div>
                <h3 className="font-semibold text-lg mb-2">ผู้เล่นที่พร้อมเล่น (แตะเพื่อเพิ่ม)</h3>
                 <input
                    type="text"
                    placeholder="ค้นหาผู้เล่น..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 mb-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 bg-gray-900 rounded">
                    {unselectedPlayers.map(player => {
                        const isPlaying = player.status === PlayerStatus.Playing;
                        const isDisabled = disabled || (isPlaying && !allowPlayingPlayers);

                        return (
                            <button
                                key={player.id}
                                type="button"
                                onClick={() => onAddPlayer(player)}
                                disabled={isDisabled}
                                className={`p-2 rounded text-left transition-colors relative flex items-center gap-2 ${isDisabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <span className={`mt-0.5 ${player.gender === Gender.Male ? 'text-blue-400' : player.gender === Gender.Female ? 'text-pink-400' : 'text-gray-400'}`}>
                                    {getGenderIcon(player.gender)}
                                </span>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate text-sm">{player.name}</p>
                                </div>
                                {isPlaying && (
                                    <div className={`absolute inset-0 flex items-center justify-center rounded ${!allowPlayingPlayers ? 'bg-black/20' : ''}`}>
                                        <span className="text-xs bg-red-500/90 text-white px-2 py-1 rounded-full font-bold tracking-wide">IN COURT</span>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
             </div>
        </div>
    );
};


const EditGameForm: React.FC<{ game: GameUse; onCancel: () => void }> = ({ game, onCancel }) => {
    const { updateGameUse, getPlayerById, presentPlayerIds, players } = useAppContext();
    
    const initialPlayers = useMemo(() => {
        // Create a map for quick lookups
        const playerMap = new Map(players.map(p => [p.id, p]));
        return game.players.map(id => playerMap.get(id)).filter((p): p is Player => !!p)
    }, [game.players, players]);
    
    const [currentPlayers, setCurrentPlayers] = useState<(Player | null)[]>(
        [...initialPlayers, ...Array(4 - initialPlayers.length).fill(null)]
    );

    const [shuttleId, setShuttleId] = useState(game.shuttleSessionId);
    const [shuttlesUsed, setShuttlesUsed] = useState(game.shuttlesUsed || 1);
    const [notes, setNotes] = useState(game.notes || '');
    const [error, setError] = useState('');

    const availablePlayersForEdit = useMemo(() => {
        return players.filter(p => p.active && presentPlayerIds.has(p.id));
    }, [players, presentPlayerIds]);


    const handleAddPlayer = (player: Player) => {
        const emptySlotIndex = currentPlayers.findIndex(p => p === null);
        if (emptySlotIndex !== -1) {
            const newPlayers = [...currentPlayers];
            newPlayers[emptySlotIndex] = player;
            setCurrentPlayers(newPlayers);
        }
    };

    const handleRemovePlayer = (_player: Player, index: number) => {
        const newPlayers = [...currentPlayers];
        newPlayers[index] = null;
        setCurrentPlayers(newPlayers);
    };

    const handleUpdate = () => {
        const finalPlayers = currentPlayers.filter((p): p is Player => !!p);
        if (finalPlayers.length !== 4) {
            setError('กรุณาเลือกผู้เล่นให้ครบ 4 คน');
            return;
        }
        updateGameUse(game.id, {
            players: finalPlayers.map(p => p.id),
            shuttleSessionId: shuttleId,
            shuttlesUsed,
            notes,
        });
        onCancel();
    };

    const finalSelectedPlayers = currentPlayers.filter((p): p is Player => !!p);

    return (
        <div className="bg-gray-700 p-4 rounded-lg space-y-4 border-2 border-cyan-500">
            <h3 className="font-bold text-xl text-center">แก้ไขเกมที่ {game.shuttleSessionId}</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">ID เกม</label>
                    <input type="number" value={shuttleId} onChange={e => setShuttleId(Number(e.target.value))} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">จำนวนลูก</label>
                    <input type="number" min="1" value={shuttlesUsed} onChange={e => setShuttlesUsed(Number(e.target.value))} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600"/>
                </div>
            </div>
            <PlayerPicker 
                selectedPlayers={currentPlayers} 
                onAddPlayer={handleAddPlayer}
                onRemovePlayer={handleRemovePlayer}
                availablePlayers={availablePlayersForEdit} 
                disabled={finalSelectedPlayers.length >= 4} 
                allowPlayingPlayers={true}
                allowDuplicates={true} 
            />
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">หมายเหตุ</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600"/>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
            <div className="flex gap-2">
                <button onClick={onCancel} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500">ยกเลิก</button>
                <button onClick={handleUpdate} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500">บันทึกการเปลี่ยนแปลง</button>
            </div>
        </div>
    );
};

export default EditGameForm;
