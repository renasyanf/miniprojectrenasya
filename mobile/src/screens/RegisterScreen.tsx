import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { authApi } from '../api/authApi';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AppTextField } from '../components/AppTextField';
import { ApiError } from '../api/http';
import type { RootStackParamList } from '../navigation/types';

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setBusy(true);
    try {
      await authApi.register(email.trim(), password);
      navigation.navigate('Login');
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
      <Text style={styles.title}>Register</Text>
      <AppTextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <AppTextField
        label="Password (min 6)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <AppButton title="Create account" onPress={() => void onSubmit()} loading={busy} />
      <AppButton
        title="Back to sign in"
        variant="secondary"
        onPress={() => navigation.navigate('Login')}
        style={styles.mt}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 20 },
  err: { color: '#dc2626', marginBottom: 12 },
  mt: { marginTop: 12 },
});
