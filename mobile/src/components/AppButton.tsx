import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

type Props = PressableProps &
  PropsWithChildren<{
    title?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
  }>;

export function AppButton({
  title,
  children,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...rest
}: Props) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      style={(state) => [
        styles.base,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isDanger && styles.danger,
        (disabled || loading) && styles.disabled,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? '#fff' : '#1e293b'} />
      ) : (
        <Text
          style={[
            styles.label,
            (isPrimary || isDanger) && styles.labelOnDark,
            variant === 'secondary' && styles.labelMuted,
          ]}
        >
          {title ?? children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: { backgroundColor: '#2563eb' },
  secondary: { backgroundColor: '#e2e8f0' },
  danger: { backgroundColor: '#dc2626' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.9 },
  label: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  labelOnDark: { color: '#fff' },
  labelMuted: { color: '#1e293b' },
});
