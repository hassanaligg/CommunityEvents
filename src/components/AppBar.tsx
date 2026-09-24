import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePalette } from './ui';

export function AppBar({
  title,
  showBack = false,
}: {
  title: string;
  showBack?: boolean;
}) {
  const p = usePalette();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: p.appBar }}
    >
      <View style={styles.content}>
        {showBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/');
            }}
            style={({ pressed }) => [
              styles.back,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <View
              accessible={false}
              style={{
                width: 12,
                height: 12,
                borderLeftWidth: 2.5,
                borderBottomWidth: 2.5,
                borderColor: p.onAppBar,
                transform: [{ rotate: '45deg' }],
                marginLeft: 5,
              }}
            />
          </Pressable>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: p.onAppBar, fontSize: 12, letterSpacing: 2 }}>
            GATHER
          </Text>
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            style={{ color: p.onAppBar, fontSize: 20, fontWeight: '700' }}
          >
            {title}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    minHeight: 72,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
