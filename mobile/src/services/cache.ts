type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();
const DEFAULT_TTL_MS = 60_000;

export function cacheGet<T>(key: string): T | null {
  const e = store.get(key) as Entry<T> | undefined;
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    store.delete(key);
    return null;
  }
  return e.value;
}

export function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheInvalidatePrefix(prefix: string): void {
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) {
      store.delete(k);
    }
  }
}

export function cacheInvalidateUser(userId: string): void {
  cacheInvalidatePrefix(`me:${userId}`);
  cacheInvalidatePrefix(`sessions:${userId}`);
}
