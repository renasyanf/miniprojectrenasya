import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { cacheGet, cacheSet } from '../services/cache';
import { useAuth } from '../state/auth/AuthContext';
import type { SessionDto } from '../types/api';

const SESSIONS_TTL_MS = 45_000;

export function useCachedSessions() {
  const { activeAccount } = useAuth();
  const [sessions, setSessions] = useState<SessionDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (force = false) => {
      if (!activeAccount) {
        setSessions(null);
        return;
      }
      const key = `sessions:${activeAccount.userId}`;
      if (!force) {
        const cached = cacheGet<SessionDto[]>(key);
        if (cached) {
          setSessions(cached);
          return;
        }
      }
      setLoading(true);
      try {
        const list = await authApi.sessions(activeAccount.accessToken);
        cacheSet(key, list, SESSIONS_TTL_MS);
        setSessions(list);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    },
    [activeAccount],
  );

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  return { sessions, loading, error, refresh };
}
