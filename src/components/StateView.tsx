import { AppText } from '@/components/AppText';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { usePalette } from '@/theme/colors';
import { strings } from '@/constants/strings';
import { Button } from './Button';

type StateViewProps = {
  title: string;
  message?: string;
  loading?: boolean;
  retry?: () => void;
};

export function StateView({ title, message, loading, retry }: StateViewProps) {
  const palette = usePalette();
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {loading && (
        <ActivityIndicator
          color={palette.accent}
          accessibilityLabel={strings.common.loading}
        />
      )}
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      {message && (
        <AppText variant="body" tone="muted">
          {message}
        </AppText>
      )}
      {retry && <Button label={strings.common.tryAgain} onPress={retry} />}
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 28, gap: 16 } });
