import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Player, PlayerStatus, View, Level, Gender } from '../types';
import Icon from '../components/Icon';
import LevelIndicator, { levelMap } from '../components/LevelIndicator';
import GameCard from '../components/GameCard';
import EditGameForm from '../components/EditGameForm';

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
    isEditingActiveSession: boolean;
}> = ({ selectedPlayers, onAddPlayer, onRemovePlayer, availablePlayers, isEditingActiveSession }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const unselectedPlayers = availablePlayers
        .filter(ap => !selectedPlayers.some(sp => sp?.id === ap.id))
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aIsPlaying = a.status === PlayerStatus.Playing && isEditingActiveSession;
            const bIsPlaying = b.status === PlayerStatus.Playing && isEditingActiveSession;
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
                                    <div className="flex-1 overflow-hidden">
                                        <span className="font-bold text-sm truncate block">{player.name}</span>
                                        <LevelIndicator level={player.level} />
                                    </div>
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
                        const isPlaying = player.status === PlayerStatus.Playing && isEditingActiveSession;
                        const isDisabled = selectedPlayers.filter(p=>p).length >= 4 || isPlaying;

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
                                    <LevelIndicator level={player.level} />
                                </div>
                                {isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded bg-black/20">
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

function getCombinations<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    function comb(temp: T[], start: number) {
        if (temp.length === size) {
            result.push([...temp]);
            return;
        }
        for (let i = start; i < array.length; i++) {
            temp.push(array[i]);
            comb(temp, i + 1);
            temp.pop();
        }
    }
    comb([], 0);
    return result;
}

const RecordUseView: React.FC<{ setCurrentView: (view: View) => void }> = () => {
    const { players, gameUses, addGameUse, presentPlayerIds, pendingGameUse, setPendingGameUse, activeSession, sessions, viewedSessionId } = useAppContext();
    const [selectedPlayers, setSelectedPlayers] = useState<(Player | null)[]>([null, null, null, null]);
    const [notes, setNotes] = useState('');
    const [shuttleId, setShuttleId] = useState(1);
    const [shuttlesUsed, setShuttlesUsed] = useState(1);
    const [message, setMessage] = useState('');
    const [editingGameId, setEditingGameId] = useState<string | null>(null);

    const sessionToView = useMemo(() => sessions.find(s => s.id === viewedSessionId), [sessions, viewedSessionId]);

    const gamesInSession = useMemo(() => {
        if (sessionToView) {
            return gameUses.filter(g => sessionToView.gameUseIds.includes(g.id));
        }
        return [];
    }, [sessionToView, gameUses]);
    
    const { activeGames, finishedGames } = useMemo(() => {
        if (!sessionToView) return { activeGames: [], finishedGames: [] };
        const games = gameUses
            .filter(g => sessionToView.gameUseIds.includes(g.id))
            .sort((a, b) => {
                if(a.isActive && !b.isActive) return -1;
                if(!a.isActive && b.isActive) return 1;
                return b.shuttleSessionId - a.shuttleSessionId;
            });
        return {
            activeGames: games.filter(g => g.isActive),
            finishedGames: games.filter(g => !g.isActive),
        };
    }, [sessionToView, gameUses]);

    const presentPlayersList = useMemo(() => 
        players.filter(p => p.active && presentPlayerIds.has(p.id)), 
        [players, presentPlayerIds]
    );

    const freePlayers = useMemo(() => {
        if (sessionToView && activeSession && sessionToView.id === activeSession.id) {
            return presentPlayersList.filter(p => p.status === PlayerStatus.Free);
        }
        return presentPlayersList; // For historical sessions, all present players are considered 'free' for adding new games
    }, [presentPlayersList, sessionToView, activeSession]);

    useEffect(() => {
        if (pendingGameUse) {
            setSelectedPlayers([...pendingGameUse.players, ...Array(4 - pendingGameUse.players.length).fill(null)]);
            setPendingGameUse(null);
        }
    }, [pendingGameUse, setPendingGameUse]);

    useEffect(() => {
        const nextId = gamesInSession.length > 0
            ? Math.max(0, ...gamesInSession.map(g => g.shuttleSessionId)) + 1
            : 1;
        setShuttleId(nextId);
    }, [gamesInSession]);

    const handleAddPlayer = (player: Player) => {
        if (selectedPlayers.some(p => p?.id === player.id)) return;
        setSelectedPlayers(prev => {
            const newSelection = [...prev];
            const emptySlotIndex = newSelection.findIndex(p => p === null);
            if (emptySlotIndex > -1) {
                newSelection[emptySlotIndex] = player;
            }
            return newSelection;
        });
    };
    
    const handleRemovePlayer = (player: Player, index: number) => {
        setSelectedPlayers(prev => {
            const newSelection = [...prev];
            if (newSelection[index]?.id === player.id) {
                newSelection[index] = null;
            }
            return newSelection;
        });
    };
    
    const handleAutoSelect = () => {
        if (freePlayers.length < 4) {
            setMessage('มีผู้เล่นที่ว่างไม่พอสำหรับสร้างทีม');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        const allPossibleTeams = getCombinations(freePlayers, 4);
        let bestTeams: { team: Player[], diff: number }[] = [];
        let minDiffSoFar = Infinity;

        for (const team of allPossibleTeams) {
            // Fix: Cast `team` to a tuple of Players to ensure correct type inference for destructured player variables.
            const [p1, p2, p3, p4] = team as [Player, Player, Player, Player];
            const l1 = levelMap[p1.level], l2 = levelMap[p2.level], l3 = levelMap[p3.level], l4 = levelMap[p4.level];
            
            const diffs = [
                { diff: Math.abs((l1 + l2) - (l3 + l4)), pairing: [p1, p2, p3, p4] },
                { diff: Math.abs((l1 + l3) - (l2 + l4)), pairing: [p1, p3, p2, p4] },
                { diff: Math.abs((l1 + l4) - (l2 + l3)), pairing: [p1, p4, p2, p3] },
            ];
            
            diffs.sort((a, b) => a.diff - b.diff);
            const bestSplit = diffs[0];

            if (bestSplit.diff < minDiffSoFar) {
                minDiffSoFar = bestSplit.diff;
                bestTeams = [{ team: bestSplit.pairing, diff: bestSplit.diff }];
            } else if (bestSplit.diff === minDiffSoFar) {
                bestTeams.push({ team: bestSplit.pairing, diff: bestSplit.diff });
            }
        }

        if (bestTeams.length > 0) {
            const chosenTeam = bestTeams[Math.floor(Math.random() * bestTeams.length)];
            setSelectedPlayers(chosenTeam.team);
        } else {
            const team = [...freePlayers].sort(() => 0.5 - Math.random()).slice(0, 4);
            setSelectedPlayers([...team, ...Array(4 - team.length).fill(null)]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalPlayers = selectedPlayers.filter((p): p is Player => p !== null);

        if (finalPlayers.length !== 4) {
            setMessage('กรุณาเลือกผู้เล่นให้ครบ 4 คน');
            return;
        }

        if (!sessionToView) {
            setMessage('ไม่มีเซสชั่นที่เลือกไว้');
            return;
        }

        const success = addGameUse({
            players: finalPlayers.map(p => p.id),
            notes,
            shuttleSessionId: shuttleId,
            shuttlesUsed,
        });

        if (success) {
            setMessage('บันทึกเกมเรียบร้อยแล้ว!');
            setSelectedPlayers([null, null, null, null]);
            setNotes('');
            setShuttlesUsed(1);
        } else {
            setMessage('เกิดข้อผิดพลาด: ผู้เล่นบางคนอาจจะกำลังเล่นอยู่');
        }
        
        setTimeout(() => setMessage(''), 3000);
    };

    const finalSelectedPlayers = selectedPlayers.filter((p): p is Player => !!p);

    if (!sessionToView) {
        return (
            <div className="p-4 text-center">
                 <h1 className="text-3xl font-bold mb-4">บันทึกและจัดการเกม</h1>
                 <div className="p-4 bg-yellow-900/50 rounded-lg text-yellow-400">
                    <p>กรุณาเลือกเซสชั่นจากหน้า 'เซสชั่น' เพื่อบันทึกเกม</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-3xl font-bold">บันทึกและจัดการเกม</h1>
            
            <div className="p-3 bg-gray-800 rounded-lg text-center">
                <p className="font-semibold">
                    จัดการเกมสำหรับเซสชั่น: <span className="text-cyan-400">{sessionToView.name}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded-lg space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                     <div className="flex flex-col gap-1">
                        <label htmlFor="shuttleId" className="text-sm font-medium text-gray-300">ID เกม:</label>
                        <input id="shuttleId" type="number" value={shuttleId} onChange={(e) => setShuttleId(Number(e.target.value))} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="shuttlesUsed" className="text-sm font-medium text-gray-300">จำนวนลูก:</label>
                        <input id="shuttlesUsed" type="number" value={shuttlesUsed} min="1" onChange={(e) => setShuttlesUsed(Number(e.target.value))} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center"/>
                    </div>
                    <button type="button" onClick={handleAutoSelect} className="md:col-span-1 col-span-2 flex items-center justify-center gap-2 p-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold transition-colors h-10">
                        <Icon.Wand className="w-5 h-5"/> <span>เลือกอัตโนมัติ</span>
                    </button>
                </div>

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">หรือเลือกด้วยตนเอง</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>
                
                <PlayerPicker 
                    selectedPlayers={selectedPlayers} 
                    onAddPlayer={handleAddPlayer} 
                    onRemovePlayer={handleRemovePlayer} 
                    availablePlayers={presentPlayersList} 
                    disabled={finalSelectedPlayers.length >= 4} 
                    isEditingActiveSession={!!activeSession && activeSession.id === sessionToView.id}
                />

                {freePlayers.length < 4 && finalSelectedPlayers.length < 4 && (
                    <p className="text-center text-yellow-400 bg-yellow-900/50 p-2 rounded-md font-semibold">
                       มีผู้เล่นที่ว่างไม่พอ ({freePlayers.length} คน) สำหรับเริ่มเกมใหม่
                    </p>
                )}

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">หมายเหตุ (ถ้ามี)</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>

                {message && <p className="text-green-400 text-center font-semibold">{message}</p>}
                
                <button 
                    type="submit" 
                    disabled={finalSelectedPlayers.length !== 4}
                    className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-500 transition-colors"
                >
                   บันทึกเกม
                </button>
            </form>

            <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-lg font-semibold">เกมในเซสชั่น</span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <div className="space-y-4">
                {activeGames.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="font-semibold text-xl text-cyan-400">เกมที่กำลังเล่น ({activeGames.length})</h2>
                        {activeGames.map(game => (
                             <div key={game.id}>
                                <GameCard 
                                    game={game} 
                                    onEdit={() => { setEditingGameId(game.id === editingGameId ? null : game.id); }} 
                                />
                                {editingGameId === game.id && (
                                    <div className="mt-2">
                                        <EditGameForm game={game} onCancel={() => setEditingGameId(null)} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {finishedGames.length > 0 && (
                     <div className="space-y-3">
                        <h2 className="font-semibold text-xl text-gray-300">เกมที่จบแล้ว ({finishedGames.length})</h2>
                        {finishedGames.map(game => (
                           <div key={game.id}>
                                <GameCard 
                                    game={game} 
                                    onEdit={() => { setEditingGameId(game.id === editingGameId ? null : game.id); }} 
                                />
                                {editingGameId === game.id && (
                                     <div className="mt-2">
                                        <EditGameForm game={game} onCancel={() => setEditingGameId(null)} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                 {gamesInSession.length === 0 && (
                    <div className="text-center text-gray-400 bg-gray-800 p-6 rounded-lg">
                        <p>ยังไม่มีเกมในเซสชั่นนี้</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default RecordUseView;
