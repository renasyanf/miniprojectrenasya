import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: { mode?: 'addAccount' } | undefined;
  Register: undefined;
  Main: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  Sessions: undefined;
};
