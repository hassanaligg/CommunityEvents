import { strings } from '@/constants/strings';
import { AppBar } from '@/components/AppBar';
import { AppText } from '@/components/AppText';
import { usePalette, type Palette } from '@/theme/colors';
import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
export default function TabsLayout() {
  const palette = usePalette();
  const styles = createStyles(palette);
  return (
    <Tabs
      screenOptions={{
        header: ({ options }) => (
          <AppBar title={options.title ?? strings.navigation.discover} />
        ),
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: styles.container,
        tabBarLabel: ({ children, color, position }) => (
          <AppText
            variant={position === 'beside-icon' ? 'tabLabelBeside' : 'tabLabel'}
            numberOfLines={1}
            style={[
              position === 'beside-icon' && styles.labelBeside,
              { color },
            ]}
          >
            {children}
          </AppText>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.navigation.discover,
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>◎</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="my-events"
        options={{
          title: strings.navigation.myEvents,
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>♡</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      backgroundColor: palette.surface,
      borderTopColor: palette.border,
    },
    tabIcon: { fontSize: 22 },
    labelBeside: { marginStart: 5, marginEnd: 12 },
  });
