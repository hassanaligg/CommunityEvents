import { AppText } from '@/components/AppText';
import { strings } from '@/constants/strings';
import { FilterTabs } from '@/components/FilterTabs';
import { layout } from '@/theme/layout';
import { EventGrid } from '@/components/EventGrid';
import { Button } from '@/components/Button';
import { Page } from '@/components/Page';
import { useClock } from '@/hooks/useClock';
import { useRsvps, useRsvpActions } from '@/store/RsvpContext';
import { fetchEvents } from '@/services/api';
import { isUpcoming } from '@/utils/dates';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

export function MyEventsScreen() {
  const state = useRsvps();
  const { sync } = useRsvpActions();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string>();
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const refresh = async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setRefreshing(true);
    setRefreshError(undefined);
    try {
      const result = await fetchEvents(controller.signal);
      if (controller.signal.aborted) return;
      if (result.usingFallback) throw new Error('Live events unavailable');
      await sync(result.data);
    } catch {
      if (!controller.signal.aborted)
        setRefreshError(strings.myEvents.refreshFailed);
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setRefreshing(false);
    }
  };
  const [tab, setTab] = useState('Upcoming');
  const now = useClock();
  const events = Object.values(state.joined)
    .filter((e) => isUpcoming(e, now) === (tab === 'Upcoming'))
    .sort((a, b) =>
      tab === 'Upcoming'
        ? Date.parse(a.startsAt) - Date.parse(b.startsAt)
        : Date.parse(b.startsAt) - Date.parse(a.startsAt),
    );
  return (
    <Page scroll={false}>
      <EventGrid
        events={events}
        refreshing={refreshing}
        onRefresh={() => {
          void refresh();
        }}
        empty={strings.myEvents.empty(
          tab === 'Upcoming'
            ? strings.myEvents.upcoming
            : strings.myEvents.past,
        )}
        header={
          <View style={styles.header}>
            <AppText variant="title" accessibilityRole="header">
              {strings.myEvents.title}
            </AppText>
            <AppText variant="body" tone="muted">
              {strings.myEvents.subtitle}
            </AppText>
            <Button
              label={
                refreshing
                  ? strings.myEvents.refreshing
                  : strings.myEvents.refresh
              }
              disabled={refreshing}
              onPress={() => {
                void refresh();
              }}
            />
            {(refreshError || state.syncError) && (
              <AppText tone="error" accessibilityRole="alert">
                {refreshError || state.syncError}
              </AppText>
            )}
            <FilterTabs
              options={['Upcoming', 'Past']}
              selected={tab}
              onSelect={setTab}
              getLabel={(value) =>
                value === 'Upcoming'
                  ? strings.myEvents.upcoming
                  : strings.myEvents.past
              }
            />
            {Object.keys(state.pending).length > 0 && (
              <AppText variant="body" tone="muted">
                {strings.myEvents.saving}
              </AppText>
            )}
          </View>
        }
        footer={
          <Button
            label={strings.common.discoverEvents}
            onPress={() => router.navigate('/')}
          />
        }
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: layout.sectionGap, paddingBottom: 8 },
});
