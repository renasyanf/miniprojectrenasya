import { Platform } from 'react-native';
import Constants from 'expo-constants';

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function inferExpoHostBaseUrl(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } })
      .manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0];
  if (!host) {
    return null;
  }

  return `http://${host}:3000`;
}

/**
 * Set EXPO_PUBLIC_API_URL for physical devices (LAN IP of your machine), e.g.
 * EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv?.trim()) {
    return trimTrailingSlash(fromEnv);
  }

  const fromExpoHost = inferExpoHostBaseUrl();
  if (fromExpoHost) {
    return fromExpoHost;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}
