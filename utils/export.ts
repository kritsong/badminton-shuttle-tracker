import { Player, Session, GameUse } from '../types';

function formatCSVField(data: any): string {
    if (data === null || data === undefined) {
        return '';
    }
    if (Array.isArray(data)) {
        // "item1;item2;item3"
        return `"${data.join(';')}"`;
    }
    if (typeof data === 'object') {
        // "{""key"":""value""}"
        return `"${JSON.stringify(data).replace(/"/g, '""')}"`;
    }
    const stringData = String(data);
    if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
        return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
}

function convertToCSV<T extends Record<string, any>>(data: T[], headers: (keyof T)[]): string {
    const headerRow = headers.join(',') + '\r\n';
    const bodyRows = data.map(row => {
        return headers.map(header => formatCSVField(row[header])).join(',');
    }).join('\r\n');
    return headerRow + bodyRows;
}

export function downloadCSV(csvString: string, filename: string): void {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportPlayers(players: Player[]): void {
    const headers: (keyof Player)[] = ['id', 'name', 'gender', 'level', 'active', 'status', 'visitCount', 'shuttleCount'];
    const csv = convertToCSV(players.map(p => ({
        ...p,
        status: p.status || 'Free',
        visitCount: p.visitCount || 0,
        shuttleCount: p.shuttleCount || 0,
    })), headers);
    downloadCSV(csv, 'badminton_players.csv');
}

export function exportSessions(sessions: Session[]): void {
    const headers: (keyof Session)[] = ['id', 'name', 'startTime', 'endTime', 'gameUseIds', 'totalCost', 'currency', 'isClosed', 'presentPlayerIds', 'paymentStatus'];
    const csv = convertToCSV(sessions, headers);
    downloadCSV(csv, 'badminton_sessions.csv');
}

export function exportGameUses(gameUses: GameUse[]): void {
    const headers: (keyof GameUse)[] = ['id', 'timestamp', 'shuttleSessionId', 'shuttlesUsed', 'players', 'playerGenderMix', 'avgLevel', 'notes', 'isActive', 'score1', 'score2'];
    const csv = convertToCSV(gameUses, headers);
    downloadCSV(csv, 'badminton_games.csv');
}