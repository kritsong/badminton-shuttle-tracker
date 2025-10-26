import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useRef } from 'react';
import { Player, GameUse, Session, Settings, Gender, Level, PlayerStatus, PendingGameUse, AppContextType } from '../types';
import { SheetsAPI, isSheetsConfigured } from '../src/services/sheets';

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialPlayers: Player[] = [];

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
  const [sheetsStatus, setSheetsStatus] = useState<'disabled' | 'loading' | 'ready'>(isSheetsConfigured ? 'loading' : 'disabled');
  const skipSheetsSyncRef = useRef(!isSheetsConfigured);

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

  useEffect(() => {
    if (!isSheetsConfigured) return;
    let cancelled = false;

    skipSheetsSyncRef.current = true;
    setSheetsStatus('loading');

    (async () => {
      try {
        const [remotePlayers, remoteSessions, remoteGameUses, remoteSettings] = await Promise.all([
          SheetsAPI.getPlayers(),
          SheetsAPI.getSessions(),
          SheetsAPI.getGameUses(),
          SheetsAPI.getSettings(),
        ]);

        if (cancelled) return;

        const hasRemoteData = remotePlayers.length > 0 || remoteSessions.length > 0 || remoteGameUses.length > 0;
        if (hasRemoteData) {
          setPlayers(remotePlayers);
          setSessions(remoteSessions);
          setGameUses(remoteGameUses);
        }

        if (remoteSettings) {
          setSettings(prev => ({ ...prev, ...remoteSettings }));
        }
      } catch (error) {
        console.error('Failed to load data from Google Sheets', error);
      } finally {
        if (!cancelled) {
          skipSheetsSyncRef.current = false;
          setSheetsStatus('ready');
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isSheetsConfigured || sheetsStatus !== 'ready' || skipSheetsSyncRef.current) return;
    const now = new Date().toISOString();
    SheetsAPI.upsertPlayers(players.map(player => ({ ...player, updatedAt: now })))
      .catch(error => console.error('Failed to sync players to Google Sheets', error));
  }, [players, sheetsStatus]);

  useEffect(() => {
    if (!isSheetsConfigured || sheetsStatus !== 'ready' || skipSheetsSyncRef.current) return;
    const now = new Date().toISOString();
    SheetsAPI.upsertSessions(sessions.map(session => ({ ...session, updatedAt: now })))
      .catch(error => console.error('Failed to sync sessions to Google Sheets', error));
  }, [sessions, sheetsStatus]);

  useEffect(() => {
    if (!isSheetsConfigured || sheetsStatus !== 'ready' || skipSheetsSyncRef.current) return;
    const now = new Date().toISOString();
    SheetsAPI.upsertGameUses(gameUses.map(game => ({ ...game, updatedAt: now })))
      .catch(error => console.error('Failed to sync game uses to Google Sheets', error));
  }, [gameUses, sheetsStatus]);

  useEffect(() => {
    if (!isSheetsConfigured || sheetsStatus !== 'ready' || skipSheetsSyncRef.current) return;
    const now = new Date().toISOString();
    SheetsAPI.upsertSettings({ ...settings, updatedAt: now })
      .catch(error => console.error('Failed to sync settings to Google Sheets', error));
  }, [settings, sheetsStatus]);


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
