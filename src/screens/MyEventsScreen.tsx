import { EventGrid } from '@/components/EventGrid';
import { Body, Button, Page, Title } from '@/components/ui';
import { useClock } from '@/hooks/useClock';
import { useRsvps } from '@/store/RsvpContext';
import { isUpcoming } from '@/utils/dates';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export function MyEventsScreen() {
  const state = useRsvps(),
    [tab, setTab] = useState('Upcoming'),
    now = useClock();
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
        empty={`No ${tab.toLowerCase()} RSVPs`}
        header={
          <View style={{ gap: 20, paddingBottom: 8 }}>
            <Title>Your next good memory.</Title>
            <Body>All the gatherings you’ve joined, in one place.</Body>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {['Upcoming', 'Past'].map((t) => (
                <Button
                  key={t}
                  label={t}
                  selected={t === tab}
                  onPress={() => setTab(t)}
                />
              ))}
            </View>
            {Object.keys(state.pending).length > 0 && (
              <Body>Saving your RSVP changes…</Body>
            )}
          </View>
        }
        footer={
          <Button
            label="Discover events"
            onPress={() => router.navigate('/')}
          />
        }
      />
    </Page>
  );
}
