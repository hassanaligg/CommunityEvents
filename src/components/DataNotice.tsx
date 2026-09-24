import { AppText } from '@/components/AppText';
import { strings } from '@/constants/strings';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { usePalette, type Palette } from '@/theme/colors';

type DataNoticeProps = {
  retry(): void;
  loading: boolean;
};

export function DataNotice({ retry, loading }: DataNoticeProps) {
  const palette = usePalette();
  const styles = createStyles(palette);
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.container, styles.containerColor]}
    >
      <AppText variant="caption" tone="muted" style={styles.message}>
        {strings.errors.demoNotice}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          loading ? strings.common.retrying : strings.common.retry
        }
        accessibilityState={{ disabled: loading, busy: loading }}
        disabled={loading}
        onPress={retry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
      >
        {loading && <ActivityIndicator size="small" color={palette.accent} />}
        <AppText variant="captionStrong" tone="accent">
          {loading ? strings.common.retryingLabel : strings.common.retry}
        </AppText>
      </Pressable>
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    containerColor: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
    },
    message: { flex: 1 },
    retryButton: {
      minHeight: 44,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pressed: { opacity: 0.6 },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingLeft: 12,
      paddingRight: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
  });
