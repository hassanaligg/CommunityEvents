import { strings } from '@/constants/strings';
import { AppBar } from '@/components/AppBar';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { RsvpProvider, useRsvps, useRsvpActions } from '@/store/RsvpContext';
import { Button } from '@/components/Button';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { SavedDataRecovery } from '@/components/SavedDataRecovery';
import { usePalette, type Palette } from '@/theme/colors';
type ErrorBoundaryProps = { retry: () => void };

type HydrationGateProps = { children: ReactNode };

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <Page>
      <StateView
        title={strings.errors.unexpected}
        message={strings.errors.reopen}
      />
      <Button label={strings.common.tryAgain} onPress={retry} />
    </Page>
  );
}
function HydrationGate({ children }: HydrationGateProps) {
  const state = useRsvps(),
    actions = useRsvpActions();
  if (state.status !== 'ready')
    return (
      <>
        <AppBar title={strings.navigation.community} />
        <Page>
          <StateView
            title={
              state.status === 'loading'
                ? strings.errors.preparing
                : strings.errors.savedUnavailable
            }
            loading={state.status === 'loading'}
            message={state.error}
            retry={state.status === 'error' ? actions.retry : undefined}
          />
          {state.status === 'error' && <SavedDataRecovery />}
        </Page>
      </>
    );
  return children;
}
export default function RootLayout() {
  const palette = usePalette();
  const styles = createStyles(palette);
  return (
    <RsvpProvider>
      <View style={styles.container}>
        {/* Keep status-bar control here; native Stack overrides conflict with iOS Expo Go. */}
        <StatusBar style="light" hidden={false} />
        <HydrationGate>
          <Stack
            screenOptions={{
              header: ({ options }) => (
                <AppBar
                  title={options.title ?? strings.navigation.community}
                  showBack
                />
              ),
              contentStyle: styles.screen,
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="event/[id]"
              options={{ title: strings.navigation.details }}
            />
            <Stack.Screen
              name="host/[id]"
              options={{ title: strings.navigation.host }}
            />
            <Stack.Screen
              name="+not-found"
              options={{ title: strings.navigation.notFound }}
            />
          </Stack>
        </HydrationGate>
      </View>
    </RsvpProvider>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.appBar },
    screen: { backgroundColor: palette.background },
  });
