import { AppBar } from '@/components/AppBar';
import { usePalette } from '@/components/ui';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
export default function TabsLayout() {
  const p = usePalette();
  return (
    <Tabs
      screenOptions={{
        header: ({ options }) => <AppBar title={options.title ?? 'Discover'} />,
        tabBarActiveTintColor: p.accent,
        tabBarInactiveTintColor: p.muted,
        tabBarStyle: { backgroundColor: p.surface, borderTopColor: p.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>◎</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="my-events"
        options={{
          title: 'My Events',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>♡</Text>
          ),
        }}
      />
    </Tabs>
  );
}
