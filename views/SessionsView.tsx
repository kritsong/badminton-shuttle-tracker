import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Player, Session, View } from '../types';
import Icon from '../components/Icon';

const SessionCard: React.FC<{
    session: Session;
    isExpanded: boolean;
    onToggle: () => void;
    setCurrentView: (view: View) => void;
}> = ({ session, isExpanded, onToggle, setCurrentView }) => {
    const { 
        settings, getPlayerById, gameUses,
        togglePlayerPaymentStatus, setViewedSessionId,
        closeActiveSession, activeSession
    } = useAppContext();

    const gamesInSession = useMemo(() => {
        return gameUses.filter(g => session.gameUseIds.includes(g.id));
    }, [session, gameUses]);

    const presentPlayers = useMemo(() => {
        return session.presentPlayerIds
            .map(id => getPlayerById(id))
            .filter((p): p is Player => !!p)
            .sort((a,b) => a.name.localeCompare(b.name));
    }, [session.presentPlayerIds, getPlayerById]);
    
    const totalCost = useMemo(() => {
        const totalShuttles = gamesInSession.reduce((acc, game) => acc + (game.shuttlesUsed || 1), 0);
        const totalShuttleCost = totalShuttles * settings.shuttlePrice;
        const totalCourtFee = presentPlayers.length * settings.courtFee;
        return totalCourtFee + totalShuttleCost;
    }, [presentPlayers.length, gamesInSession, settings.courtFee, settings.shuttlePrice]);

    const handleManagePlayers = () => {
        setViewedSessionId(session.id);
        setCurrentView('Players');
    };

    const handleManageGames = () => {
        setViewedSessionId(session.id);
        setCurrentView('Record');
    };

    const isSessionActive = activeSession?.id === session.id;

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700/60 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-3 py-2 text-left flex flex-wrap gap-x-3 gap-y-1 items-center justify-between bg-gray-800 hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center gap-2 min-w-0">
                    {isSessionActive && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>}
                    <span className="font-semibold text-sm sm:text-base truncate">{session.name}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(session.startTime).toLocaleDateString('th-TH')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                    <span>{presentPlayers.length} คน</span>
                    <span className="text-gray-500">•</span>
                    <span>{gamesInSession.length} เกม</span>
                    <span className="text-gray-500">•</span>
                    <span className="font-semibold text-cyan-400">{totalCost.toFixed(0)} {session.currency}</span>
                    <Icon.ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isExpanded && (
                <div className="px-3 py-3 border-t border-gray-700 space-y-4 text-sm">
                    {/* Session Actions */}
                     <div className="flex flex-wrap gap-2">
                        <button onClick={handleManagePlayers} className="flex-1 bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-500 text-xs sm:text-sm flex items-center justify-center gap-2 min-w-[120px]">
                            <Icon.Users className="w-4 h-4" />
                            <span>ผู้เล่น</span>
                        </button>
                        <button onClick={handleManageGames} className="flex-1 bg-green-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-green-500 text-xs sm:text-sm flex items-center justify-center gap-2 min-w-[120px]">
                            <Icon.Shuttle className="w-4 h-4" />
                            <span>เกม/ลูก</span>
                        </button>
                        {isSessionActive && (
                            <button onClick={closeActiveSession} className="flex-1 bg-red-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-red-500 text-xs sm:text-sm flex items-center justify-center gap-2 min-w-[120px]">
                                <Icon.Clock className="w-4 h-4" />
                                <span>ปิดเซสชั่น</span>
                            </button>
                        )}
                    </div>

                    {/* Cost Summary */}
                    {presentPlayers.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-200">สรุปค่าใช้จ่าย ({presentPlayers.length} คน)</h4>
                            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                {presentPlayers.map(player => {
                                    const gamesPlayedCount = gamesInSession.filter(g => g.players.includes(player.id)).length;
                                    const shuttleCountForPlayer = gamesInSession.reduce((acc, game) => {
                                        if (game.players.includes(player.id)) {
                                            return acc + (game.shuttlesUsed || 1);
                                        }
                                        return acc;
                                    }, 0);
                                    const playerCost = settings.courtFee + (shuttleCountForPlayer * settings.shuttlePrice / 4);
                                    const hasPaid = session.paymentStatus[player.id] || false;
                                    return (
                                        <div key={player.id} className={`px-2 py-1.5 rounded-md flex items-center gap-3 ${hasPaid ? 'bg-green-900/40' : 'bg-gray-700/80'}`}>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-sm truncate">{player.name}</p>
                                                <p className="text-xs text-gray-400 truncate">เล่น {gamesPlayedCount} เกม • ลูก {Math.round(shuttleCountForPlayer)}</p>
                                            </div>
                                            <span className="font-semibold text-sm text-cyan-300 whitespace-nowrap">{playerCost.toFixed(0)} {settings.currency}</span>
                                            <button onClick={() => togglePlayerPaymentStatus(player.id, session.id)} className={`text-[11px] font-semibold py-1 px-2 rounded-full whitespace-nowrap ${hasPaid ? 'bg-green-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-100'}`}>
                                                {hasPaid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const SessionsView: React.FC<{ setCurrentView: (view: View) => void }> = ({ setCurrentView }) => {
    const { sessions, activeSession, startNewSession, viewedSessionId, setViewedSessionId } = useAppContext();
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(viewedSessionId);

    useEffect(() => {
        // Automatically expand the viewed session when it changes from another tab
        setExpandedSessionId(viewedSessionId);
    }, [viewedSessionId]);

    const handleToggle = (sessionId: string) => {
        const newExpandedId = expandedSessionId === sessionId ? null : sessionId;
        setExpandedSessionId(newExpandedId);
        // Also set the global viewed session for context in other tabs
        setViewedSessionId(newExpandedId);
    };

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => {
            if (a.id === activeSession?.id) return -1;
            if (b.id === activeSession?.id) return 1;
            return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        });
    }, [sessions, activeSession]);

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold">เซสชั่น</h1>
                 {!activeSession && (
                    <button onClick={startNewSession} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500">เริ่มเซสชั่นใหม่</button>
                 )}
            </div>

            <div className="space-y-4">
                {sortedSessions.map(session => (
                    <SessionCard 
                        key={session.id} 
                        session={session} 
                        isExpanded={expandedSessionId === session.id} 
                        onToggle={() => handleToggle(session.id)}
                        setCurrentView={setCurrentView}
                    />
                ))}
                 {sessions.length === 0 && !activeSession && (
                     <div className="text-center py-10 text-gray-400">
                        <p>ไม่มีเซสชั่นในประวัติ</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default SessionsView;
