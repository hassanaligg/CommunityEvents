import { DataNotice } from '@/components/DataNotice';
import { EventGrid } from '@/components/EventGrid';
import { Body, Button, Page, StateView, Title } from '@/components/ui';
import { useClock } from '@/hooks/useClock';
import { useResource } from '@/hooks/useResource';
import { fetchEvents } from '@/services/api';
import { categories } from '@/types';
import { isUpcoming } from '@/utils/dates';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

export function DiscoverScreen() {
  const [category, setCategory] = useState('All'),
    now = useClock();
  const resource = useResource(fetchEvents);
  const events = (resource.data ?? [])
    .filter((e) => category === 'All' || e.category === category)
    .sort(
      (a, b) =>
        Number(isUpcoming(b, now)) - Number(isUpcoming(a, now)) ||
        Date.parse(a.startsAt) - Date.parse(b.startsAt) ||
        a.id.localeCompare(b.id),
    );
  return (
    <Page scroll={false}>
      {resource.loading && !resource.data ? (
        <StateView title="Finding your next gathering…" loading />
      ) : (
        <EventGrid
          events={events}
          empty={
            category === 'All'
              ? 'No events available'
              : `No ${category.toLowerCase()} events`
          }
          refreshing={resource.loading}
          onRefresh={resource.retry}
          header={
            <View style={{ gap: 20, paddingBottom: 8 }}>
              <Title>Find your people.</Title>
              <Body>
                Small moments. New connections. Something for everyone.
              </Body>
              <View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {['All', ...categories].map((c) => (
                    <Button
                      key={c}
                      label={c}
                      selected={c === category}
                      onPress={() => setCategory(c)}
                    />
                  ))}
                </ScrollView>
              </View>
              {resource.warning && (
                <DataNotice retry={resource.retry} loading={resource.loading} />
              )}
              {resource.error && (
                <StateView
                  title="Could not load events"
                  message={resource.error}
                  retry={resource.retry}
                />
              )}
              <Body>Upcoming gatherings first · past events follow</Body>
            </View>
          }
        />
      )}
    </Page>
  );
}
