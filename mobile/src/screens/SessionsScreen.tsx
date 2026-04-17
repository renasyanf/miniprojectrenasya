import { Alert, StyleSheet, Text, View } from 'react-native';
import { authApi } from '../api/authApi';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { ApiError } from '../api/http';
import { useCachedSessions } from '../hooks/useCachedSessions';
import { cacheInvalidateUser } from '../services/cache';
import { useAuth } from '../state/auth/AuthContext';

export function SessionsScreen() {
  const { activeAccount } = useAuth();
  const { sessions, loading, error, refresh } = useCachedSessions();

  async function revoke(id: string) {
    if (!activeAccount) return;
    if (id === activeAccount.sessionId) {
      Alert.alert('Use Profile', 'Use “Log out (revoke this device)” for the current session.');
      return;
    }
    try {
      await authApi.revokeSession(activeAccount.accessToken, id);
      cacheInvalidateUser(activeAccount.userId);
      await refresh(true);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to revoke';
      Alert.alert('Error', msg);
    }
  }

  return (
    <AppScreen scroll>
      <Text style={styles.title}>Device sessions</Text>
      <Text style={styles.sub}>
        Each login creates a server session row. Revoking marks it inactive so the JWT stops
        working.
      </Text>
      <AppButton
        title="Refresh list"
        variant="secondary"
        onPress={() => void refresh(true)}
        loading={loading}
      />
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {(sessions ?? []).map((s) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.device}>{s.deviceName}</Text>
          <Text style={styles.meta}>Device id: {s.deviceId}</Text>
          <Text style={styles.meta}>
            {s.isActive ? 'Active' : 'Revoked'} · {s.id === activeAccount?.sessionId ? 'This device' : 'Other'}
          </Text>
          <AppButton
            title="Revoke"
            variant="danger"
            style={styles.revoke}
            onPress={() => void revoke(s.id)}
            disabled={!s.isActive}
          />
        </View>
      ))}
      {!loading && sessions && sessions.length === 0 ? (
        <Text style={styles.empty}>No sessions returned.</Text>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  sub: { fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
  err: { color: '#dc2626', marginVertical: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  device: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  meta: { fontSize: 13, color: '#64748b', marginTop: 4 },
  revoke: { marginTop: 12 },
  empty: { color: '#64748b', marginTop: 8 },
});
