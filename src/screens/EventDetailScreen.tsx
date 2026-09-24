import { AppText } from '@/components/AppText';
import { strings } from '@/constants/strings';
import { DataNotice } from '@/components/DataNotice';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { fetchEventDetails } from '@/services/api';
import { currentUser } from '@/types';
import { useEventResource, detailEvents } from '@/hooks/useEventResource';
import { useRsvps } from '@/store/RsvpContext';
import { RsvpButton } from '@/components/RsvpButton';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Cover } from '@/components/Cover';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { formatDate } from '@/utils/dates';

type EventDetailScreenProps = { id: string };

export function EventDetailScreen({ id }: EventDetailScreenProps) {
  const state = useRsvps();
  const resource = useEventResource(
    useCallback((signal: AbortSignal) => fetchEventDetails(id, signal), [id]),
    detailEvents,
  );
  const event = resource.data;
  if (resource.loading && !event)
    return (
      <Page>
        <StateView title={strings.event.loading} loading />
      </Page>
    );
  if (resource.error && !event)
    return (
      <Page>
        <StateView
          title={strings.event.unavailable}
          message={resource.error}
          retry={resource.retry}
        />
        {state.joined[id] && (
          <>
            <AppText variant="title" accessibilityRole="header">
              {state.joined[id].title}
            </AppText>
            <AppText variant="body" tone="muted">
              {strings.event.savedDetails}
            </AppText>
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
          title={strings.event.notFound}
          message={strings.event.notFoundMessage}
        />
        <Button
          label={strings.common.discoverEvents}
          onPress={() => router.replace('/')}
        />
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
          title={strings.event.saved}
          message={resource.error}
          retry={resource.retry}
        />
      )}
      {resource.warning && (
        <DataNotice retry={resource.retry} loading={resource.loading} />
      )}
      <Cover uri={event.imageUrl} title={event.title} />
      <AppText variant="strong" tone="accent">
        {strings.categories[event.category]}
      </AppText>
      <AppText variant="title" accessibilityRole="header">
        {event.title}
      </AppText>
      <AppText variant="body" tone="muted">
        {formatDate(event.startsAt, event.timeZone)}
      </AppText>
      <AppText variant="body" tone="muted">
        {event.location}
      </AppText>
      <RsvpButton event={event} />
      <AppText variant="title" accessibilityRole="header">
        {strings.event.about}
      </AppText>
      <AppText variant="body" tone="muted">
        {event.description}
      </AppText>
      <Avatar name={event.host.name} uri={event.host.avatarUrl} />
      <AppText variant="title" accessibilityRole="header">
        {strings.event.hostedBy(event.host.name)}
      </AppText>
      <AppText variant="body" tone="muted">
        {event.host.bio}
      </AppText>
      <Button
        label={strings.event.meetHost}
        onPress={() =>
          router.push({ pathname: '/host/[id]', params: { id: event.hostId } })
        }
      />
      <AppText variant="title" accessibilityRole="header">
        {strings.event.attending(count)}
      </AppText>
      <View style={styles.attendees}>
        {preview.map((a) => (
          <Avatar key={a.id} name={a.name} uri={a.avatarUrl} />
        ))}
      </View>
      <AppText variant="body" tone="muted">
        {count === 0
          ? strings.event.firstAttendee
          : strings.event.attendeePreview(count - preview.length)}
      </AppText>
    </Page>
  );
}

const styles = StyleSheet.create({
  attendees: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
