import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AppTextField } from '../components/AppTextField';
import { ApiError } from '../api/http';
import type { RootStackParamList } from '../navigation/types';
import { getDeviceDisplayName, getOrCreateDeviceId } from '../services/deviceIdentity';
import { useAuth } from '../state/auth/AuthContext';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const mode = (route.params as RootStackParamList['Login'] | undefined)?.mode;
  const { loginWithPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setBusy(true);
    try {
      const deviceId = await getOrCreateDeviceId();
      const deviceName = getDeviceDisplayName();
      await loginWithPassword(email.trim(), password, deviceId, deviceName);
      if (mode === 'addAccount') {
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen scroll>
      <Text style={styles.title}>{mode === 'addAccount' ? 'Add account' : 'Sign in'}</Text>
      <Text style={styles.sub}>
        JWT session is created per login; the same install keeps one stable device id for
        multi-device tracking.
      </Text>
      <AppTextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <AppTextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <AppButton title="Continue" onPress={() => void onSubmit()} loading={busy} />
      {mode !== 'addAccount' ? (
        <AppButton
          title="Create account"
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
          style={styles.mt}
        />
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  sub: { fontSize: 15, color: '#64748b', marginBottom: 20, lineHeight: 22 },
  err: { color: '#dc2626', marginBottom: 12 },
  mt: { marginTop: 12 },
});
