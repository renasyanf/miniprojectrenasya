import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

/** Tab screens call this with their navigation object; parent is the root stack. */
export function navigateToAddAccount(nav: unknown) {
  const parent = (nav as { getParent: () => unknown }).getParent() as
    | NativeStackNavigationProp<RootStackParamList>
    | undefined;
  parent?.navigate('Login', { mode: 'addAccount' });
}
