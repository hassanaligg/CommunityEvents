import { usePalette, type Palette } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PageProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function Page({ children, scroll = true }: PageProps) {
  const palette = usePalette();
  const styles = createStyles(palette);
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.page, styles.fill]}>{children}</View>
  );
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      {content}
    </SafeAreaView>
  );
}
const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    fill: { flex: 1 },
    page: {
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingTop: layout.pagePadding,
      paddingHorizontal: layout.pagePadding,
      gap: layout.sectionGap,
    },
  });
