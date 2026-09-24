import { AppText } from '@/components/AppText';
import { Pressable, StyleSheet } from 'react-native';
import { usePalette, type Palette } from '@/theme/colors';
import { layout } from '@/theme/layout';

type ButtonProps = {
  label: string;
  onPress(): void;
  disabled?: boolean;
  selected?: boolean;
};

export function Button({
  label,
  onPress,
  disabled = false,
  selected = false,
}: ButtonProps) {
  const palette = usePalette();
  const styles = createStyles(palette);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        (disabled || pressed) && styles.dimmed,
        selected ? styles.selected : styles.unselected,
      ]}
    >
      <AppText variant="button" tone={selected ? 'onAccent' : 'accent'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    selected: { borderColor: palette.accent, backgroundColor: palette.accent },
    unselected: {
      borderColor: palette.accent,
      backgroundColor: palette.surface,
    },
    dimmed: { opacity: 0.6 },
    button: {
      minHeight: layout.minTouchSize,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: layout.buttonRadius,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
