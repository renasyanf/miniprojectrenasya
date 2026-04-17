import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { navigateToAddAccount } from '../navigation/navigateRoot';
import { useAuth } from '../state/auth/AuthContext';
import { useCachedProfile } from '../hooks/useCachedProfile';

export function HomeScreen() {
  const { activeAccount, accounts } = useAuth();
  const { user } = useCachedProfile();
  const navigation = useNavigation();

  return (
    <AppScreen scroll>
      <Text style={styles.title}>Home</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Signed in as</Text>
        <Text style={styles.cardValue}>{user?.email ?? activeAccount?.email ?? '—'}</Text>
        <Text style={styles.hint}>
          {accounts.length} account{accounts.length === 1 ? '' : 's'} on this device
        </Text>
      </View>
      <Text style={styles.section}>Quick actions</Text>
      <AppButton
        title="Add another account"
        variant="secondary"
        onPress={() => navigateToAddAccount(navigation)}
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
    marginBottom: 20,
  },
  cardLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  hint: { marginTop: 8, fontSize: 13, color: '#64748b' },
  section: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 10 },
});
