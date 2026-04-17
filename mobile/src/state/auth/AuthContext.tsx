import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { authApi } from '../../api/authApi';
import { cacheInvalidateUser } from '../../services/cache';

const STORAGE_KEY = 'multi_account_auth_v1';

export type StoredAccount = {
  userId: string;
  email: string;
  accessToken: string;
  deviceId: string;
  sessionId: string;
};

type State = {
  accounts: StoredAccount[];
  activeUserId: string | null;
  hydrated: boolean;
};

type Action =
  | { type: 'hydrate'; payload: Pick<State, 'accounts' | 'activeUserId'> }
  | { type: 'login'; payload: StoredAccount }
  | { type: 'setActive'; userId: string }
  | { type: 'removeAccount'; userId: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        accounts: action.payload.accounts,
        activeUserId: action.payload.activeUserId,
        hydrated: true,
      };
    case 'login': {
      const others = state.accounts.filter(
        (a) => a.userId !== action.payload.userId,
      );
      return {
        ...state,
        accounts: [...others, action.payload],
        activeUserId: action.payload.userId,
      };
    }
    case 'setActive':
      return { ...state, activeUserId: action.userId };
    case 'removeAccount': {
      const accounts = state.accounts.filter(
        (a) => a.userId !== action.userId,
      );
      let activeUserId = state.activeUserId;
      if (activeUserId === action.userId) {
        activeUserId = accounts[0]?.userId ?? null;
      }
      return { ...state, accounts, activeUserId };
    }
    default:
      return state;
  }
}

const initialState: State = {
  accounts: [],
  activeUserId: null,
  hydrated: false,
};

type AuthContextValue = {
  hydrated: boolean;
  accounts: StoredAccount[];
  activeAccount: StoredAccount | null;
  loginWithPassword: (
    email: string,
    password: string,
    deviceId: string,
    deviceName: string,
  ) => Promise<void>;
  switchAccount: (userId: string) => void;
  removeLocalAccount: (userId: string) => void;
  logoutThisDevice: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (!raw) {
          dispatch({ type: 'hydrate', payload: { accounts: [], activeUserId: null } });
          return;
        }
        const parsed = JSON.parse(raw) as {
          accounts: StoredAccount[];
          activeUserId: string | null;
        };
        dispatch({
          type: 'hydrate',
          payload: {
            accounts: parsed.accounts ?? [],
            activeUserId: parsed.activeUserId ?? null,
          },
        });
      } catch {
        dispatch({ type: 'hydrate', payload: { accounts: [], activeUserId: null } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const payload = {
      accounts: state.accounts,
      activeUserId: state.activeUserId,
    };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [state.accounts, state.activeUserId, state.hydrated]);

  const activeAccount = useMemo(() => {
    if (!state.activeUserId) return null;
    return state.accounts.find((a) => a.userId === state.activeUserId) ?? null;
  }, [state.accounts, state.activeUserId]);

  const loginWithPassword = useCallback(
    async (email: string, password: string, deviceId: string, deviceName: string) => {
      const data = await authApi.login(email, password, deviceId, deviceName);
      dispatch({
        type: 'login',
        payload: {
          userId: data.user.id,
          email: data.user.email,
          accessToken: data.accessToken,
          deviceId: data.deviceId,
          sessionId: data.sessionId,
        },
      });
      cacheInvalidateUser(data.user.id);
    },
    [],
  );

  const switchAccount = useCallback((userId: string) => {
    dispatch({ type: 'setActive', userId });
  }, []);

  const removeLocalAccount = useCallback((userId: string) => {
    cacheInvalidateUser(userId);
    dispatch({ type: 'removeAccount', userId });
  }, []);

  const logoutThisDevice = useCallback(async () => {
    const acc = activeAccount;
    if (!acc) return;
    try {
      await authApi.revokeSession(acc.accessToken, acc.sessionId);
    } catch {
      // still drop local session if network fails
    }
    cacheInvalidateUser(acc.userId);
    dispatch({ type: 'removeAccount', userId: acc.userId });
  }, [activeAccount]);

  const value = useMemo<AuthContextValue>(
    () => ({
      hydrated: state.hydrated,
      accounts: state.accounts,
      activeAccount,
      loginWithPassword,
      switchAccount,
      removeLocalAccount,
      logoutThisDevice,
    }),
    [
      state.hydrated,
      state.accounts,
      activeAccount,
      loginWithPassword,
      switchAccount,
      removeLocalAccount,
      logoutThisDevice,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
