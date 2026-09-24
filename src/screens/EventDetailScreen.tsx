import { DataNotice } from '@/components/DataNotice';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { fetchEventDetails } from '@/services/api';
import { currentUser } from '@/types';
import { useResource } from '@/hooks/useResource';
import { useRsvps } from '@/store/RsvpContext';
import { RsvpButton } from '@/components/RsvpButton';
import {
  Avatar,
  Body,
  Button,
  Cover,
  Page,
  StateView,
  Title,
  usePalette,
} from '@/components/ui';
import { formatDate } from '@/utils/dates';

export function EventDetailScreen({ id }: { id: string }) {
  const state = useRsvps(),
    p = usePalette();
  const resource = useResource(
    useCallback((signal: AbortSignal) => fetchEventDetails(id, signal), [id]),
  );
  const event = resource.data;
  if (resource.loading && !event)
    return (
      <Page>
        <StateView title="Loading event…" loading />
      </Page>
    );
  if (resource.error && !event)
    return (
      <Page>
        <StateView
          title="Event unavailable"
          message={resource.error}
          retry={resource.retry}
        />
        {state.joined[id] && (
          <>
            <Title>{state.joined[id].title}</Title>
            <Body>Saved RSVP. Full details are unavailable right now.</Body>
            <RsvpButton event={state.joined[id]} />
          </>
        )}
      </Page>
    );
  if (!event)
    return (
      <Page>
        {resource.warning && (
          <DataNotice retry={resource.retry} loading={resource.loading} />
        )}
        <StateView
          title="Event not found"
          message="This event does not exist. Explore other gatherings instead."
        />
        <Button label="Discover events" onPress={() => router.replace('/')} />
      </Page>
    );
  const preview = [
    ...event.attendeePreview,
    ...(state.joined[id] ? [currentUser] : []),
  ];
  const count = event.baseAttendeeCount + Number(!!state.joined[id]);
  return (
    <Page>
      {resource.error && (
        <StateView
          title="Showing saved event"
          message={resource.error}
          retry={resource.retry}
        />
      )}
      {resource.warning && (
        <DataNotice retry={resource.retry} loading={resource.loading} />
      )}
      <Cover uri={event.imageUrl} title={event.title} />
      <Text style={{ color: p.accent, fontWeight: '700' }}>
        {event.category}
      </Text>
      <Title>{event.title}</Title>
      <Body>{formatDate(event.startsAt, event.timeZone)}</Body>
      <Body>{event.location}</Body>
      <RsvpButton event={event} />
      <Title>About this gathering</Title>
      <Body>{event.description}</Body>
      <Avatar name={event.host.name} uri={event.host.avatarUrl} />
      <Title>Hosted by {event.host.name}</Title>
      <Body>{event.host.bio}</Body>
      <Button
        label="Meet your host"
        onPress={() =>
          router.push({ pathname: '/host/[id]', params: { id: event.hostId } })
        }
      />
      <Title>{count} attending</Title>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {preview.map((a) => (
          <Avatar key={a.id} name={a.name} uri={a.avatarUrl} />
        ))}
      </View>
      <Body>
        {count === 0
          ? 'Be the first to join.'
          : `Attendee preview${count > preview.length ? ` · and ${count - preview.length} others` : ''}`}
      </Body>
    </Page>
  );
}
