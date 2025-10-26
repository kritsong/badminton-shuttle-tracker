
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Session } from '../types';

const HistoryView: React.FC = () => {
    const { sessions, gameUses } = useAppContext();
    const closedSessions = sessions.filter(s => s.isClosed).sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const exportToCSV = (session: Session) => {
        const sessionGames = gameUses.filter(gu => session.gameUseIds.includes(gu.id));
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "GameID,ShuttleSessionID,Timestamp,Players,AvgLevel,GenderMix\n";

        sessionGames.forEach(game => {
            const playersStr = `"${game.players.join(', ')}"`;
            const row = [game.id, game.shuttleSessionId, game.timestamp, playersStr, game.avgLevel, game.playerGenderMix].join(",");
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `session_${session.name.replace(/ /g, "_")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-3xl font-bold">ประวัติเซสชั่น</h1>

            {closedSessions.length > 0 ? (
                <div className="space-y-4">
                    {closedSessions.map(session => (
                        <div key={session.id} className="bg-gray-800 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-semibold">{session.name}</h2>
                                    <p className="text-xs text-gray-400">
                                        {new Date(session.startTime).toLocaleDateString('th-TH')}
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-cyan-400">
                                    {session.totalCost.toFixed(2)} {session.currency}
                                </p>
                            </div>
                            <div className="text-sm text-gray-300 mt-2">
                                <p>จำนวนเกม: {session.gameUseIds.length}</p>
                                {session.endTime && <p>ระยะเวลา: {Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} นาที</p>}
                            </div>
                             <button onClick={() => exportToCSV(session)} className="text-xs mt-3 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded">
                                Export CSV
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-400">ไม่มีเซสชั่นที่ปิดแล้วในประวัติ</p>
                </div>
            )}
        </div>
    );
};

export default HistoryView;
