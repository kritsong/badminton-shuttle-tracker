import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { Player, GameUse, Session, Settings, Gender, Level, PlayerStatus, PendingGameUse, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialPlayers: Player[] = [
  { id: '1', name: 'Anna Chen', gender: Gender.Female, level: Level.Advanced, active: true, status: PlayerStatus.Free, visitCount: 15, shuttleCount: 19 },
  { id: '2', name: 'Bee', gender: Gender.Female, level: Level.Intermediate, active: true, status: PlayerStatus.Free, visitCount: 25, shuttleCount: 31 },
  { id: '3', name: 'Dom', gender: Gender.Male, level: Level.Advanced, active: true, status: PlayerStatus.Free, visitCount: 22, shuttleCount: 28 },
  { id: '4', name: 'Keng', gender: Gender.Male, level: Level.Intermediate, active: true, status: PlayerStatus.Free, visitCount: 18, shuttleCount: 23 },
  { id: '5', name: 'Pak', gender: Gender.Male, level: Level.Beginner, active: true, status: PlayerStatus.Free, visitCount: 5, shuttleCount: 6 },
  { id: '6', name: 'Mint', gender: Gender.Female, level: Level.Pro, active: true, status: PlayerStatus.Free, visitCount: 30, shuttleCount: 38 },
  { id: '7', name: 'Art', gender: Gender.Male, level: Level.Pro, active: true, status: PlayerStatus.Free, visitCount: 45, shuttleCount: 56 },
  { id: '8', name: 'Cherry', gender: Gender.Female, level: Level.Intermediate, active: true, status: PlayerStatus.Free, visitCount: 12, shuttleCount: 15 },
  { id: '9', name: 'Golf', gender: Gender.Male, level: Level.Advanced, active: true, status: PlayerStatus.Free, visitCount: 33, shuttleCount: 41 },
  { id: '10', name: 'Fah', gender: Gender.Female, level: Level.Expert, active: true, status: PlayerStatus.Free, visitCount: 28, shuttleCount: 35 },
  { id: '11', name: 'Ice', gender: Gender.Male, level: Level.Beginner, active: true, status: PlayerStatus.Free, visitCount: 3, shuttleCount: 4 },
  { id: '12', name: 'Jane', gender: Gender.Female, level: Level.Novice, active: true, status: PlayerStatus.Free, visitCount: 8, shuttleCount: 10 },
  { id: '13', name: 'Lek', gender: Gender.Male, level: Level.Intermediate, active: true, status: PlayerStatus.Free, visitCount: 19, shuttleCount: 24 },
  { id: '14', name: 'Mew', gender: Gender.Female, level: Level.Advanced, active: true, status: PlayerStatus.Free, visitCount: 21, shuttleCount: 26 },
  { id: '15', name: 'Noom', gender: Gender.Male, level: Level.Expert, active: true, status: PlayerStatus.Free, visitCount: 35, shuttleCount: 44 },
  { id: '16', name: 'Opal', gender: Gender.Female, level: Level.Beginner, active: true, status: PlayerStatus.Free, visitCount: 2, shuttleCount: 3 },
  { id: '17', name: 'Poom', gender: Gender.Male, level: Level.Pro, active: true, status: PlayerStatus.Free, visitCount: 50, shuttleCount: 63 },
  { id: '18', name: 'Queen', gender: Gender.Female, level: Level.Intermediate, active: true, status: PlayerStatus.Free, visitCount: 14, shuttleCount: 18 },
  { id: '19', name: 'Rit', gender: Gender.Male, level: Level.Novice, active: true, status: PlayerStatus.Free, visitCount: 9, shuttleCount: 11 },
  { id: '20', name: 'Som', gender: Gender.Female, level: Level.Advanced, active: true, status: PlayerStatus.Free, visitCount: 24, shuttleCount: 30 },
  { id: '21', name: 'Ton', gender: Gender.Male, level: Level.Intermediate, active: true, status: PlayerStatus.Free, visitCount: 17, shuttleCount: 21 },
  { id: '22', name: 'Un', gender: Gender.Female, level: Level.Expert, active: true, status: PlayerStatus.Free, visitCount: 29, shuttleCount: 36 },
  { id: '23', name: 'Vee', gender: Gender.Male, level: Level.Beginner, active: true, status: PlayerStatus.Free, visitCount: 6, shuttleCount: 8 },
  { id: '24', name: 'Wan', gender: Gender.Female, level: Level.Pro, active: true, status: PlayerStatus.Free, visitCount: 40, shuttleCount: 50 },
  { id: '25', name: 'X', gender: Gender.Male, level: Level.Advanced, active: true, status: PlayerStatus.Free, visitCount: 26, shuttleCount: 33 },
  { id: '26', name: 'Ying', gender: Gender.Female, level: Level.Intermediate, active: true, status: PlayerStatus.Free, visitCount: 11, shuttleCount: 14 },
  { id: '27', name: 'Zen', gender: Gender.Male, level: Level.Novice, active: true, status: PlayerStatus.Free, visitCount: 7, shuttleCount: 9 },
  { id: '28', name: 'Aom', gender: Gender.Female, level: Level.Advanced, active: true, status: PlayerStatus.Free, visitCount: 23, shuttleCount: 29 },
  { id: '29', name: 'Boy', gender: Gender.Male, level: Level.Expert, active: true, status: PlayerStatus.Free, visitCount: 31, shuttleCount: 39 },
  { id: '30', name: 'Cake', gender: Gender.Female, level: Level.Beginner, active: true, status: PlayerStatus.Free, visitCount: 4, shuttleCount: 5 },
];

const initialSettings: Settings = {
    currency: 'THB',
    courtFee: 70,
    shuttlePrice: 25,
    enableAutoSelect: true,
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage`, error);
        return defaultValue;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => loadFromStorage('badminton_players', initialPlayers));
  const [gameUses, setGameUses] = useState<GameUse[]>(() => loadFromStorage('badminton_gameUses', []));
  const [sessions, setSessions] = useState<Session[]>(() => loadFromStorage('badminton_sessions', []));
  const [settings, setSettings] = useState<Settings>(() => loadFromStorage('badminton_settings', initialSettings));
  
  const [pendingGameUse, setPendingGameUse] = useState<PendingGameUse | null>(null);
  const [presentPlayerIds, setPresentPlayerIds] = useState<Set<string>>(new Set());
  const [viewedSessionId, setViewedSessionId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('badminton_players', JSON.stringify(players)); }, [players]);
  useEffect(() => { localStorage.setItem('badminton_gameUses', JSON.stringify(gameUses)); }, [gameUses]);
  useEffect(() => { localStorage.setItem('badminton_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('badminton_settings', JSON.stringify(settings)); }, [settings]);
  
  const activeSession = useMemo(() => sessions.find(s => !s.isClosed) || null, [sessions]);

  useEffect(() => {
    const sessionToView = sessions.find(s => s.id === viewedSessionId);
    if (sessionToView) {
      setPresentPlayerIds(new Set(sessionToView.presentPlayerIds));
    } else if (activeSession) {
      setViewedSessionId(activeSession.id);
      setPresentPlayerIds(new Set(activeSession.presentPlayerIds));
    } else {
      setPresentPlayerIds(new Set());
    }
  }, [viewedSessionId, sessions, activeSession]);


  const getPlayerById = (id: string) => players.find(p => p.id === id);

  const addPlayer = (playerData: Omit<Player, 'id' | 'active' | 'status' | 'visitCount' | 'shuttleCount'>) => {
    const newPlayer: Player = { ...playerData, id: crypto.randomUUID(), active: true, status: PlayerStatus.Free, visitCount: 0, shuttleCount: 0 };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };
  
  const togglePresentPlayer = (playerId: string) => {
    if (!viewedSessionId) return;

    const newPresentPlayerIds = new Set(presentPlayerIds);
    if (newPresentPlayerIds.has(playerId)) {
        newPresentPlayerIds.delete(playerId);
    } else {
        newPresentPlayerIds.add(playerId);
    }
    setPresentPlayerIds(newPresentPlayerIds);

    setSessions(prevSessions => prevSessions.map(s => {
        if (s.id === viewedSessionId) {
            return { ...s, presentPlayerIds: Array.from(newPresentPlayerIds) };
        }
        return s;
    }));
  };

  const togglePlayerPaymentStatus = (playerId: string, sessionId: string) => {
    setSessions(prevSessions => prevSessions.map(s => {
      if (s.id === sessionId) {
        const newPaymentStatus = { ...s.paymentStatus };
        newPaymentStatus[playerId] = !newPaymentStatus[playerId];
        return { ...s, paymentStatus: newPaymentStatus };
      }
      return s;
    }));
  };

  const addGameUse = (gameUseData: { players: string[]; notes?: string; shuttleSessionId: number; shuttlesUsed: number; }): boolean => {
    if (!viewedSessionId) return false;

    const sessionToUpdate = sessions.find(s => s.id === viewedSessionId);
    if (!sessionToUpdate) return false;

    const gamePlayers = gameUseData.players.map(getPlayerById).filter((p): p is Player => !!p);
    if(gamePlayers.length !== 4) return false;

    const isForActiveSession = activeSession && activeSession.id === viewedSessionId;

    if (isForActiveSession && gamePlayers.some(p => p.status === PlayerStatus.Playing)) {
        alert("ผู้เล่นบางคนกำลังเล่นอยู่");
        return false;
    }

    const maleCount = gamePlayers.filter(p => p.gender === Gender.Male).length;
    const femaleCount = gamePlayers.filter(p => p.gender === Gender.Female).length;
    
    const levelMap: Record<Level, number> = { [Level.Beginner]: 1, [Level.Novice]: 2, [Level.Intermediate]: 3, [Level.Advanced]: 4, [Level.Expert]: 5, [Level.Pro]: 6 };
    const totalLevel = gamePlayers.reduce((acc, p) => acc + levelMap[p.level], 0);

    const newGameUse: GameUse = {
      ...gameUseData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      playerGenderMix: `${maleCount}M/${femaleCount}F`,
      avgLevel: parseFloat((totalLevel / 4).toFixed(1)),
      isActive: isForActiveSession, // New games in old sessions are finished by default
    };

    setGameUses(prev => [...prev, newGameUse]);
    setSessions(prev => prev.map(s => {
        if (s.id === viewedSessionId) {
            return { ...s, gameUseIds: [...s.gameUseIds, newGameUse.id] };
        }
        return s;
    }));

    const shuttleContribution = gameUseData.shuttlesUsed / 4;
    const playerIdsToUpdate = new Set(gameUseData.players);

    setPlayers(prevPlayers => prevPlayers.map(p => {
        if (playerIdsToUpdate.has(p.id)) {
            const updatedPlayer = { ...p };
            updatedPlayer.shuttleCount = (p.shuttleCount || 0) + shuttleContribution;
            if (isForActiveSession) {
                updatedPlayer.status = PlayerStatus.Playing;
            }
            return updatedPlayer;
        }
        return p;
    }));
    
    return true;
  };

  const updateGameUse = (gameId: string, updates: { players: string[]; notes?: string; shuttleSessionId: number; shuttlesUsed: number; }) => {
    const gameToUpdate = gameUses.find(g => g.id === gameId);
    if (!gameToUpdate) return;

    const isForActiveSession = activeSession && sessions.find(s => s.id === activeSession.id)?.gameUseIds.includes(gameId);

    const oldPlayerIds = new Set(gameToUpdate.players);
    const newPlayerIdsSet = new Set(updates.players);
    
    const oldShuttleContribution = (gameToUpdate.shuttlesUsed || 1) / 4;
    const newShuttleContribution = (updates.shuttlesUsed || 1) / 4;

    setPlayers(prevPlayers => prevPlayers.map(p => {
        const wasInGame = oldPlayerIds.has(p.id);
        const isInNewGame = newPlayerIdsSet.has(p.id);

        if (!wasInGame && !isInNewGame) {
            return p; // No changes for this player
        }

        const updatedPlayer = { ...p };

        // Adjust shuttle count
        let shuttleCountAdjustment = 0;
        if (wasInGame) shuttleCountAdjustment -= oldShuttleContribution;
        if (isInNewGame) shuttleCountAdjustment += newShuttleContribution;
        
        if (shuttleCountAdjustment !== 0) {
            updatedPlayer.shuttleCount = (p.shuttleCount || 0) + shuttleCountAdjustment;
        }

        // Adjust status for active session games
        if (isForActiveSession) {
            if (wasInGame && !isInNewGame) updatedPlayer.status = PlayerStatus.Free;
            if (!wasInGame && isInNewGame) updatedPlayer.status = PlayerStatus.Playing;
        }
        
        return updatedPlayer;
    }));

    setGameUses(prevGameUses => {
        return prevGameUses.map(g => {
            if (g.id === gameId) {
                const gamePlayers = updates.players.map(getPlayerById).filter((p): p is Player => !!p);
                const maleCount = gamePlayers.filter(p => p.gender === Gender.Male).length;
                const femaleCount = gamePlayers.filter(p => p.gender === Gender.Female).length;
                const levelMap: Record<Level, number> = { [Level.Beginner]: 1, [Level.Novice]: 2, [Level.Intermediate]: 3, [Level.Advanced]: 4, [Level.Expert]: 5, [Level.Pro]: 6 };
                const totalLevel = gamePlayers.reduce((acc, p) => acc + levelMap[p.level], 0);

                return {
                    ...g,
                    players: updates.players,
                    notes: updates.notes,
                    shuttleSessionId: updates.shuttleSessionId,
                    shuttlesUsed: updates.shuttlesUsed,
                    playerGenderMix: `${maleCount}M/${femaleCount}F`,
                    avgLevel: parseFloat((totalLevel / 4).toFixed(1)),
                };
            }
            return g;
        });
    });
  };

  const updateGameScores = (gameId: string, scores: { score1?: string, score2?: string }) => {
    setGameUses(prev => prev.map(g => {
        if (g.id === gameId) {
            return { ...g, score1: scores.score1, score2: scores.score2 };
        }
        return g;
    }));
  };

  const endGameUse = (gameUseId: string, scores?: { score1?: string, score2?: string }) => {
    const gameToEnd = gameUses.find(g => g.id === gameUseId);
    if (!gameToEnd || !gameToEnd.isActive) return;
    
    const isForActiveSession = activeSession && sessions.find(s => s.id === activeSession.id)?.gameUseIds.includes(gameUseId);

    setGameUses(prev => prev.map(g => {
        if (g.id === gameUseId) {
            const updatedGame: GameUse = { ...g, isActive: false };
            if (scores) {
                updatedGame.score1 = scores.score1;
                updatedGame.score2 = scores.score2;
            }
            return updatedGame;
        }
        return g;
    }));

    if (isForActiveSession) {
        const playerIdsToUpdate = new Set(gameToEnd.players);
        setPlayers(prevPlayers => prevPlayers.map(p =>
            playerIdsToUpdate.has(p.id) ? { ...p, status: PlayerStatus.Free } : p
        ));
    }
  };


  const startNewSession = () => {
    if (activeSession) return;
    const newSession: Session = {
      id: crypto.randomUUID(),
      name: `เซสชั่น - ${new Date().toLocaleDateString('th-TH')}`,
      startTime: new Date().toISOString(),
      gameUseIds: [],
      totalCost: 0,
      currency: settings.currency,
      isClosed: false,
      presentPlayerIds: [],
      paymentStatus: {},
    };
    
    setSessions(prev => [...prev, newSession]);
    setViewedSessionId(newSession.id);
    setPresentPlayerIds(new Set());
  };

  const closeActiveSession = () => {
    if (!activeSession) return;
    
    gameUses.forEach(gu => {
        if(activeSession.gameUseIds.includes(gu.id) && gu.isActive) {
            endGameUse(gu.id);
        }
    });

    const presentPlayerIdsForCost = Array.from(presentPlayerIds);
    setPlayers(prevPlayers => 
        prevPlayers.map(p => 
            presentPlayerIdsForCost.includes(p.id) ? { ...p, visitCount: (p.visitCount || 0) + 1 } : p
        )
    );

    const closedSession: Session = {
      ...activeSession,
      endTime: new Date().toISOString(),
      isClosed: true,
      presentPlayerIds: presentPlayerIdsForCost,
    };
    
    setSessions(prev => prev.map(s => s.id === activeSession.id ? closedSession : s));
  };

  const updateSession = (sessionId: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
            return { ...s, ...updates };
        }
        return s;
    }));
  };
  
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value: AppContextType = { 
      players, addPlayer, updatePlayer, 
      gameUses, addGameUse, updateGameUse, updateGameScores, endGameUse,
      sessions, activeSession, startNewSession, closeActiveSession, updateSession,
      settings, updateSettings,
      pendingGameUse, setPendingGameUse,
      getPlayerById,
      presentPlayerIds, togglePresentPlayer,
      togglePlayerPaymentStatus,
      viewedSessionId, setViewedSessionId
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};