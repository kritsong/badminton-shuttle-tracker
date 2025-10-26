const KEY = 'badminton-app-v1';

export function loadLocalState<T = any>(): T {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {} as T; }
}

export function saveLocalState<T = any>(s: T) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

