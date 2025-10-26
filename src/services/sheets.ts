// src/services/sheets.ts
import { Player, Session, GameUse, Settings, Gender, Level, PlayerStatus } from '../../types';

const BASE_URL = import.meta.env.VITE_SHEETS_URL as string | undefined;
const API_SECRET = (import.meta.env.VITE_SHEETS_SECRET as string | undefined) || '';
const SITE_KEY = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined) || '';

type Entity = 'players' | 'sessions' | 'gameuses' | 'settings';
type Row = Record<string, unknown>;

const DEFAULT_SETTINGS: Settings = {
  currency: 'THB',
  courtFee: 70,
  shuttlePrice: 25,
  enableAutoSelect: true,
};

const ensureConfigured = () => {
  if (!BASE_URL) {
    throw new Error('Sheets URL not configured. Set VITE_SHEETS_URL in your environment.');
  }
  return BASE_URL;
};

const toBool = (v: unknown) => v === true || String(v) === 'true';
const toNum = (v: unknown, d = 0) => Number(v ?? d);
const toStr = (v: unknown, d = '') => String(v ?? d);
const parseJSON = <T>(v: unknown, fallback: T): T => {
  try {
    if (typeof v !== 'string') {
      return (v as T) ?? fallback;
    }
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
};

const toGender = (value: unknown): Gender => {
  const str = String(value ?? '');
  return (Object.values(Gender) as string[]).includes(str as Gender) ? (str as Gender) : Gender.Other;
};

const toLevel = (value: unknown): Level => {
  const str = String(value ?? '');
  return (Object.values(Level) as string[]).includes(str as Level) ? (str as Level) : Level.Beginner;
};

const toStatus = (value: unknown): PlayerStatus => {
  const str = String(value ?? '');
  return (Object.values(PlayerStatus) as string[]).includes(str as PlayerStatus)
    ? (str as PlayerStatus)
    : PlayerStatus.Free;
};

async function captchaToken(action: string) {
  if (!SITE_KEY) return '';
  // @ts-ignore
  const grecaptcha = (window as any).grecaptcha;
  await grecaptcha?.ready?.();
  return await grecaptcha.execute(SITE_KEY, { action });
}

async function apiGet(entity: Entity) {
  const url = new URL(ensureConfigured());
  url.searchParams.set('entity', entity);
  if (API_SECRET) url.searchParams.set('secret', API_SECRET);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'GET failed');
  return data.rows as Row[];
}

async function apiPost(entity: Entity, data: Row | Row[], action = 'write') {
  const body: any = { entity, data };
  const token = await captchaToken(action);
  if (token) body.captchaToken = token;

  const url = new URL(ensureConfigured());
  if (API_SECRET) url.searchParams.set('secret', API_SECRET);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'POST failed');
  return json.rows ?? null;
}

export const isSheetsConfigured = Boolean(BASE_URL);

export const SheetsAPI = {
  // ---- READ ----
  getPlayers: async (): Promise<Player[]> =>
    (await apiGet('players')).map(r => ({
      id: toStr(r.id),
      name: toStr(r.name),
      gender: toGender(r.gender),
      level: toLevel(r.level),
      active: toBool(r.active),
      status: toStatus(r.status),
      visitCount: toNum(r.visitCount),
      shuttleCount: toNum(r.shuttleCount),
    })),
  getSessions: async (): Promise<Session[]> =>
    (await apiGet('sessions')).map(r => ({
      id: toStr(r.id),
      name: toStr(r.name),
      startTime: toStr(r.startTime),
      endTime: r.endTime ? toStr(r.endTime) : undefined,
      gameUseIds: parseJSON<string[]>(r.gameUseIds, []),
      totalCost: toNum(r.totalCost),
      currency: toStr(r.currency, 'THB'),
      isClosed: toBool(r.isClosed),
      presentPlayerIds: parseJSON<string[]>(r.presentPlayerIds, []),
      paymentStatus: parseJSON<Record<string, boolean>>(r.paymentStatus, {}),
    })),
  getGameUses: async (): Promise<GameUse[]> =>
    (await apiGet('gameuses')).map(r => ({
      id: toStr(r.id),
      timestamp: toStr(r.timestamp),
      shuttleSessionId: toNum(r.shuttleSessionId),
      shuttlesUsed: toNum(r.shuttlesUsed),
      players: parseJSON<string[]>(r.players, []),
      playerGenderMix: toStr(r.playerGenderMix),
      avgLevel: toNum(r.avgLevel),
      notes: r.notes ? toStr(r.notes) : undefined,
      isActive: toBool(r.isActive),
      score1: r.score1 ? toStr(r.score1) : undefined,
      score2: r.score2 ? toStr(r.score2) : undefined,
    })),
  getSettings: async (): Promise<Settings> => {
    const rows = await apiGet('settings');
    const r = (rows[0] || {}) as Row;
    return {
      currency: toStr(r.currency, DEFAULT_SETTINGS.currency),
      shuttlePrice: toNum(r.shuttlePrice, DEFAULT_SETTINGS.shuttlePrice),
      courtFee: toNum(r.courtFee, DEFAULT_SETTINGS.courtFee),
      enableAutoSelect: toBool(r.enableAutoSelect),
    };
  },

  // ---- WRITE (UPSERT) ----
  upsertPlayers: (rows: any[]) => apiPost('players', rows),
  upsertSessions: (rows: any[]) =>
    apiPost(
      'sessions',
      rows.map(s => ({
        ...s,
        presentPlayerIds: Array.isArray(s.presentPlayerIds)
          ? s.presentPlayerIds
          : Array.from(new Set(s.presentPlayerIds || [])),
      }))
    ),
  upsertGameUses: (rows: any[]) => apiPost('gameuses', rows),
  upsertSettings: (row: any) => apiPost('settings', { ...row, id: row?.id || 'default' }),
};
