import { AppBar } from '@/components/AppBar';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { RsvpProvider, useRsvps, useRsvpActions } from '@/store/RsvpContext';
import { Button, Page, StateView, usePalette } from '@/components/ui';
export function ErrorBoundary({ retry }: { retry: () => void }) {
  return (
    <Page>
      <StateView
        title="Something went wrong"
        message="Please try opening this screen again."
      />
      <Button label="Try again" onPress={retry} />
    </Page>
  );
}
function HydrationGate({ children }: { children: ReactNode }) {
  const state = useRsvps(),
    actions = useRsvpActions();
  if (state.status !== 'ready')
    return (
      <>
        <AppBar title="Community events" />
        <Page>
          <StateView
            title={
              state.status === 'loading'
                ? 'Getting things ready…'
                : 'Saved events unavailable'
            }
            loading={state.status === 'loading'}
            message={state.error}
            retry={state.status === 'error' ? actions.retry : undefined}
          />
        </Page>
      </>
    );
  return children;
}
export default function RootLayout() {
  const p = usePalette();
  return (
    <RsvpProvider>
      <View style={{ flex: 1, backgroundColor: p.appBar }}>
        {/* Keep status-bar control here; native Stack overrides conflict with iOS Expo Go. */}
        <StatusBar style="light" hidden={false} />
        <HydrationGate>
          <Stack
            screenOptions={{
              header: ({ options }) => (
                <AppBar title={options.title ?? 'Community events'} showBack />
              ),
              contentStyle: { backgroundColor: p.background },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="event/[id]"
              options={{ title: 'Event details' }}
            />
            <Stack.Screen
              name="host/[id]"
              options={{ title: 'Host profile' }}
            />
            <Stack.Screen
              name="+not-found"
              options={{ title: 'Page not found' }}
            />
          </Stack>
        </HydrationGate>
      </View>
    </RsvpProvider>
  );
}
