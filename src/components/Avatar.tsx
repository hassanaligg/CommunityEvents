import { AppText } from '@/components/AppText';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePalette, type Palette } from '@/theme/colors';

type AvatarProps = { name: string; uri?: string };

export function Avatar({ name, uri }: AvatarProps) {
  const [failedUri, setFailedUri] = useState<string>();
  const palette = usePalette();
  const styles = createStyles(palette);
  return (
    <View
      accessibilityLabel={name}
      style={[styles.container, styles.containerColor]}
    >
      <AppText variant="strong">
        {name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)}
      </AppText>
      {uri && failedUri !== uri && (
        <Image
          source={uri}
          accessibilityLabel={name}
          style={styles.image}
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
    containerColor: { backgroundColor: palette.border },
    image: { ...StyleSheet.absoluteFill, borderRadius: 23 },
    container: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
