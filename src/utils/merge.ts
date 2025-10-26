// src/utils/merge.ts
type WithId = { id: string; updatedAt?: string };
const newer = (a?: string, b?: string) => (new Date(a || 0).getTime() - new Date(b || 0).getTime()) < 0;

export function mergeByUpdatedAt<T extends WithId>(local: T[], remote: T[]): T[] {
  const byId = new Map<string, T>();
  for (const r of remote) byId.set(r.id, r);
  for (const l of local) {
    const r = byId.get(l.id);
    if (!r) byId.set(l.id, l);
    else if (newer(r.updatedAt, l.updatedAt)) byId.set(l.id, l); // keep newer
  }
  return Array.from(byId.values());
}

