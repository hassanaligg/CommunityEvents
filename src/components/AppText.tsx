import { Text, type TextProps } from 'react-native';
import { usePalette } from '@/theme/colors';
import { typography } from '@/theme/typography';

export type AppTextProps = TextProps & {
  variant?: keyof typeof typography;
  tone?:
    | 'default'
    | 'muted'
    | 'accent'
    | 'error'
    | 'onAppBar'
    | 'onPlaceholder'
    | 'onAccent';
};

export function AppText({
  variant = 'default',
  tone = 'default',
  style,
  ...props
}: AppTextProps) {
  const palette = usePalette();
  const colors = {
    default: palette.text,
    muted: palette.muted,
    accent: palette.accent,
    error: palette.error,
    onAppBar: palette.onAppBar,
    onPlaceholder: palette.onPlaceholder,
    onAccent: palette.background,
  };
  return (
    <Text
      {...props}
      style={[typography[variant], { color: colors[tone] }, style]}
    />
  );
}
