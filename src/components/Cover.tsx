import { AppText } from '@/components/AppText';
import { strings } from '@/constants/strings';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePalette, type Palette } from '@/theme/colors';

type CoverProps = { uri?: string; title: string };

export function Cover({ uri, title }: CoverProps) {
  const [failedUri, setFailedUri] = useState<string>();
  const palette = usePalette();
  const styles = createStyles(palette);
  return (
    <View style={[styles.container, styles.containerColor]}>
      <View style={styles.placeholder}>
        <AppText variant="coverTitle" tone="onPlaceholder">
          {strings.branding.coverTitle}
        </AppText>
        <AppText tone="onPlaceholder" style={styles.subtitle}>
          {strings.branding.coverSubtitle}
        </AppText>
      </View>
      {uri && failedUri !== uri && (
        <Image
          source={uri}
          accessibilityLabel={title}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          onError={() => setFailedUri(uri)}
        />
      )}
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    containerColor: { backgroundColor: palette.placeholder },
    subtitle: { marginTop: 10 },
    container: {
      aspectRatio: 1.9,
      overflow: 'hidden',
      borderRadius: 18,
    },
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
  });
