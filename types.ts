export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum Level {
  Beginner = 'Beginner',       // มือใหม่
  Novice = 'Novice',           // เริ่มต้น
  Intermediate = 'Intermediate', // ปานกลาง
  Advanced = 'Advanced',       // ชำนาญ
  Expert = 'Expert',           // เชี่ยวชาญ
  Pro = 'Pro',               // มืออาชีพ
}

export enum PlayerStatus {
    Free = 'Free',
    Playing = 'Playing',
}

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  level: Level;
  active: boolean;
  status: PlayerStatus;
  visitCount: number;
  shuttleCount: number;
}

export interface GameUse {
  id: string;
  timestamp: string;
  shuttleSessionId: number;
  shuttlesUsed: number;
  players: string[]; // Array of 4 Player IDs
  playerGenderMix: string;
  avgLevel: number;
  notes?: string;
  isActive: boolean;
  score1?: string;
  score2?: string;
}

export interface Session {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  gameUseIds: string[];
  totalCost: number;
  currency: string;
  isClosed: boolean;
  presentPlayerIds: string[];
  paymentStatus: Record<string, boolean>; // Key: playerId, Value: hasPaid
}

export interface Settings {
  currency: string;
  shuttlePrice: number;
  courtFee: number;
  enableAutoSelect: boolean;
}

export type View = 'Sessions' | 'Players' | 'Record' | 'Settings';

export interface PendingGameUse {
  players: Player[];
}

export interface AppContextType {
  players: Player[];
  addPlayer: (player: Omit<Player, 'id' | 'active' | 'status' | 'visitCount' | 'shuttleCount'>) => void;
  updatePlayer: (player: Player) => void;
  gameUses: GameUse[];
  addGameUse: (gameUseData: { players: string[]; notes?: string; shuttleSessionId: number; shuttlesUsed: number; }) => boolean;
  updateGameUse: (gameId: string, updates: { players: string[]; notes?: string; shuttleSessionId: number; shuttlesUsed: number; }) => void;
  updateGameScores: (gameId: string, scores: { score1?: string, score2?: string }) => void;
  endGameUse: (gameUseId: string, scores?: { score1?: string, score2?: string }) => void;
  sessions: Session[];
  activeSession: Session | null;
  startNewSession: () => void;
  closeActiveSession: () => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  pendingGameUse: PendingGameUse | null;
  setPendingGameUse: (data: PendingGameUse | null) => void;
  getPlayerById: (id: string) => Player | undefined;
  presentPlayerIds: Set<string>;
  togglePresentPlayer: (playerId: string) => void;
  togglePlayerPaymentStatus: (playerId: string, sessionId: string) => void;
  viewedSessionId: string | null;
  setViewedSessionId: (sessionId: string | null) => void;
}