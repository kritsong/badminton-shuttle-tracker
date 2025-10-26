import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Player, Gender, Level, PlayerStatus } from '../types';
import Icon from '../components/Icon';

const levelTranslations: Record<Level, string> = {
    [Level.Beginner]: 'มือใหม่',
    [Level.Novice]: 'เริ่มต้น',
    [Level.Intermediate]: 'ปานกลาง',
    [Level.Advanced]: 'ชำนาญ',
    [Level.Expert]: 'เชี่ยวชาญ',
    [Level.Pro]: 'มืออาชีพ',
};

const PlayerForm: React.FC<{ onSave: (player: Omit<Player, 'id' | 'active' | 'status' | 'visitCount' | 'shuttleCount'>) => void; onCancel: () => void; existingPlayer?: Player }> = ({ onSave, onCancel, existingPlayer }) => {
    const { updatePlayer } = useAppContext();
    const [name, setName] = useState(existingPlayer?.name || '');
    const [gender, setGender] = useState<Gender>(existingPlayer?.gender || Gender.Male);
    const [level, setLevel] = useState<Level>(existingPlayer?.level || Level.Intermediate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        if (existingPlayer) {
            updatePlayer({ ...existingPlayer, name, gender, level });
            onCancel(); // Close form after editing
        } else {
            onSave({ name, gender, level });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded-lg space-y-4">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อผู้เล่น"
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="grid grid-cols-2 gap-4">
                <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {Object.values(Level).map(l => <option key={l} value={l}>{levelTranslations[l]}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">ยกเลิก</button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded">บันทึก</button>
            </div>
        </form>
    );
};

const PlayerCard: React.FC<{ player: Player; isPresent: boolean; onEdit: () => void; canToggle: boolean; }> = ({ player, isPresent, onEdit, canToggle }) => {
    const { togglePresentPlayer } = useAppContext();

    const getGenderStyle = (gender: Gender) => {
        switch (gender) {
            case Gender.Male: return { icon: <Icon.Male />, color: 'text-blue-400' };
            case Gender.Female: return { icon: <Icon.Female />, color: 'text-pink-400' };
            default: return { icon: <Icon.User />, color: 'text-gray-400' };
        }
    };

    return (
        <div 
            onClick={() => canToggle && togglePresentPlayer(player.id)}
            className={`bg-gray-800 p-3 rounded-lg flex items-center transition-all border-2 ${isPresent ? 'border-cyan-500' : 'border-transparent'} ${!canToggle ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-700 cursor-pointer'}`}
            aria-disabled={!canToggle}
            role="button"
            tabIndex={canToggle ? 0 : -1}
        >
            <div className="flex-1 flex items-center gap-3">
                <span className={getGenderStyle(player.gender).color}>
                    {React.cloneElement(getGenderStyle(player.gender).icon, { className: 'w-6 h-6' })}
                </span>
                <div>
                    <p className="font-bold text-lg flex items-center gap-2">
                        {player.name}
                        {player.status === PlayerStatus.Playing && <span className="text-xs bg-red-500 px-2 py-1 rounded-full">กำลังเล่น</span>}
                    </p>
                    <p className="text-sm text-gray-400">มาแล้ว {player.visitCount || 0} ครั้ง • ใช้ไป {Math.round(player.shuttleCount || 0)} ลูก</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                    className="text-gray-400 hover:text-white p-1"
                    aria-label={`Edit ${player.name}`}
                >
                    <Icon.Edit className="w-5 h-5" />
                </button>
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isPresent ? 'bg-cyan-500' : 'bg-gray-600 border border-gray-500'}`}>
                    {isPresent && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
            </div>
        </div>
    );
};


const PlayersView: React.FC = () => {
    const { players, addPlayer, presentPlayerIds, sessions, viewedSessionId } = useAppContext();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'frequency'>('name');

    const sessionToView = useMemo(() => sessions.find(s => s.id === viewedSessionId), [sessions, viewedSessionId]);

    const handleSavePlayer = (playerData: Omit<Player, 'id'|'active'|'status'|'visitCount'|'shuttleCount'>) => {
        addPlayer(playerData);
        setShowAddForm(false);
    }

    const { presentPlayers, absentPlayers } = useMemo(() => {
        const filtered = players
            .filter(p => p.active)
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const sorter = (a: Player, b: Player) => {
            if (sortBy === 'frequency') {
                return (b.visitCount || 0) - (a.visitCount || 0);
            }
            return a.name.localeCompare(b.name);
        };
        
        const present = filtered.filter(p => presentPlayerIds.has(p.id)).sort(sorter);
        const absent = filtered.filter(p => !presentPlayerIds.has(p.id)).sort(sorter);

        return { presentPlayers: present, absentPlayers: absent };
    }, [players, searchTerm, sortBy, presentPlayerIds]);

    const handleEditClick = (player: Player) => {
        setEditingPlayerId(prevId => (prevId === player.id ? null : player.id));
        setShowAddForm(false);
    };
    
    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">ผู้เล่น</h1>
                <button onClick={() => { setShowAddForm(!showAddForm); setEditingPlayerId(null); }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2">
                    <Icon.PlusCircle className="w-5 h-5"/>
                    <span>{showAddForm ? 'ปิด' : 'เพิ่ม'}</span>
                </button>
            </div>

            {sessionToView ? (
                <div className="p-3 bg-gray-800 rounded-lg text-center">
                    <p className="font-semibold">
                        จัดการรายชื่อผู้เล่นสำหรับเซสชั่น: <span className="text-cyan-400">{sessionToView.name}</span>
                    </p>
                </div>
            ) : (
                <div className="p-3 bg-yellow-900/50 rounded-lg text-center text-yellow-400">
                    <p>กรุณาเลือกเซสชั่นจากหน้า 'เซสชั่น' ก่อน</p>
                </div>
            )}
            
            {showAddForm && <PlayerForm onSave={handleSavePlayer} onCancel={() => setShowAddForm(false)} />}

            <div className="p-4 bg-gray-800 rounded-lg space-y-4">
                 <input
                    type="text"
                    placeholder="ค้นหาผู้เล่น..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="flex gap-2">
                    <button onClick={() => setSortBy('name')} className={`flex-1 py-2 px-4 text-sm font-semibold rounded ${sortBy === 'name' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}>เรียงตามชื่อ</button>
                    <button onClick={() => setSortBy('frequency')} className={`flex-1 py-2 px-4 text-sm font-semibold rounded ${sortBy === 'frequency' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}>เรียงตามความถี่</button>
                </div>
            </div>
            
            <div className="space-y-4">
                {presentPlayers.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="font-semibold text-lg text-cyan-400">ผู้เล่นในเซสชั่น ({presentPlayers.length})</h2>
                        {presentPlayers.map(player => (
                             <div key={player.id}>
                                <PlayerCard player={player} isPresent={true} onEdit={() => handleEditClick(player)} canToggle={!!sessionToView} />
                                {editingPlayerId === player.id && (
                                    <div className="pt-1">
                                        <PlayerForm 
                                            existingPlayer={player} 
                                            onSave={() => {}} 
                                            onCancel={() => setEditingPlayerId(null)} 
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {presentPlayers.length > 0 && absentPlayers.length > 0 && (
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">ผู้เล่นทั้งหมด</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>
                )}

                {absentPlayers.length > 0 && (
                     <div className="space-y-3">
                        {presentPlayers.length === 0 && <h2 className="font-semibold text-lg text-gray-300">ผู้เล่นทั้งหมด ({absentPlayers.length})</h2>}
                        {absentPlayers.map(player => (
                           <div key={player.id}>
                                <PlayerCard player={player} isPresent={false} onEdit={() => handleEditClick(player)} canToggle={!!sessionToView} />
                                {editingPlayerId === player.id && (
                                     <div className="pt-1">
                                        <PlayerForm 
                                            existingPlayer={player} 
                                            onSave={() => {}} 
                                            onCancel={() => setEditingPlayerId(null)} 
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayersView;