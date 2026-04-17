import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { useCachedProfile } from '../hooks/useCachedProfile';
import { navigateToAddAccount } from '../navigation/navigateRoot';
import { cacheInvalidateUser } from '../services/cache';
import { useAuth } from '../state/auth/AuthContext';

export function ProfileScreen() {
  const { activeAccount, accounts, switchAccount, removeLocalAccount, logoutThisDevice } =
    useAuth();
  const { user, loading, refresh } = useCachedProfile();
  const navigation = useNavigation();

  return (
    <AppScreen scroll>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{loading ? 'Loading…' : user?.email ?? '—'}</Text>
        <Text style={styles.mono}>User id: {activeAccount?.userId ?? '—'}</Text>
      </View>
      <AppButton title="Refresh profile" variant="secondary" onPress={() => void refresh(true)} />
      <Text style={styles.section}>Accounts on this device</Text>
      {accounts.map((a) => (
        <View key={a.userId} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowEmail}>{a.email}</Text>
            <Text style={styles.rowMeta}>{a.userId === activeAccount?.userId ? 'Active' : ''}</Text>
          </View>
          {a.userId !== activeAccount?.userId ? (
            <AppButton
              title="Switch"
              variant="secondary"
              style={styles.smallBtn}
              onPress={() => switchAccount(a.userId)}
            />
          ) : null}
          <AppButton
            title="Remove"
            variant="secondary"
            style={styles.smallBtn}
            onPress={() => {
              cacheInvalidateUser(a.userId);
              removeLocalAccount(a.userId);
            }}
          />
        </View>
      ))}
      <AppButton
        title="Add account"
        variant="secondary"
        onPress={() => navigateToAddAccount(navigation)}
        style={styles.mt}
      />
      <AppButton
        title="Log out (revoke this device)"
        variant="danger"
        onPress={() => void logoutThisDevice()}
        style={styles.mt}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  mono: { marginTop: 10, fontSize: 12, color: '#94a3b8' },
  section: { marginTop: 20, marginBottom: 10, fontSize: 16, fontWeight: '700', color: '#334155' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  rowEmail: { fontWeight: '600', color: '#0f172a' },
  rowMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  smallBtn: { paddingVertical: 8, minHeight: 40, flex: 0, paddingHorizontal: 12 },
  mt: { marginTop: 12 },
});
