import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { cacheGet, cacheSet } from '../services/cache';
import { useAuth } from '../state/auth/AuthContext';
import type { UserDto } from '../types/api';

export function useCachedProfile() {
  const { activeAccount } = useAuth();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (force = false) => {
      if (!activeAccount) {
        setUser(null);
        return;
      }
      const key = `me:${activeAccount.userId}`;
      if (!force) {
        const cached = cacheGet<UserDto>(key);
        if (cached) {
          setUser(cached);
          return;
        }
      }
      setLoading(true);
      try {
        const u = await authApi.me(activeAccount.accessToken);
        cacheSet(key, u);
        setUser(u);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    },
    [activeAccount],
  );

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  return { user, loading, error, refresh };
}
