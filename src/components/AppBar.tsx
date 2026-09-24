import { AppText } from '@/components/AppText';
import { strings } from '@/constants/strings';
import { layout } from '@/theme/layout';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePalette, type Palette } from '@/theme/colors';

type AppBarProps = {
  title: string;
  showBack?: boolean;
};

export function AppBar({ title, showBack = false }: AppBarProps) {
  const palette = usePalette();
  const styles = createStyles(palette);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.content}>
        {showBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.goBack}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/');
            }}
            style={({ pressed }) => [
              styles.back,
              {
                opacity: pressed ? 0.6 : 1,
                backgroundColor: palette.appBarButton,
              },
            ]}
          >
            <View
              accessible={false}
              style={[styles.backIcon, styles.backIconColor]}
            />
          </Pressable>
        )}
        <View style={styles.heading}>
          <AppText variant="brand" tone="onAppBar">
            {strings.branding.name}
          </AppText>
          <AppText
            accessibilityRole="header"
            numberOfLines={1}
            variant="appBarTitle"
            tone="onAppBar"
          >
            {title}
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: { backgroundColor: palette.appBar },
    backIconColor: { borderColor: palette.onAppBar },
    heading: { flex: 1, gap: 2 },
    backIcon: {
      width: 12,
      height: 12,
      borderLeftWidth: 2.5,
      borderBottomWidth: 2.5,
      transform: [{ rotate: '45deg' }],
      marginLeft: 5,
    },
    content: {
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      minHeight: 72,
      paddingHorizontal: layout.pagePadding,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    back: {
      borderRadius: 24,
      minWidth: layout.minTouchSize,
      minHeight: layout.minTouchSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
