import { DataNotice } from '@/components/DataNotice';
import { EventGrid } from '@/components/EventGrid';
import { Avatar, Body, Page, StateView, Title } from '@/components/ui';
import { useResource } from '@/hooks/useResource';
import { fetchHostProfile } from '@/services/api';
import { useCallback } from 'react';
import { View } from 'react-native';

export function HostProfileScreen({ id }: { id: string }) {
  const resource = useResource(
    useCallback((signal: AbortSignal) => fetchHostProfile(id, signal), [id]),
  );
  if (resource.loading && !resource.data)
    return (
      <Page>
        <StateView title="Loading host…" loading />
      </Page>
    );
  if (resource.error)
    return (
      <Page>
        <StateView
          title="Host unavailable"
          message={resource.error}
          retry={resource.retry}
        />
      </Page>
    );
  const host = resource.data;
  if (!host)
    return (
      <Page>
        {resource.warning && (
          <DataNotice retry={resource.retry} loading={resource.loading} />
        )}
        <StateView
          title="Host not found"
          message="This profile is unavailable."
        />
      </Page>
    );
  return (
    <Page scroll={false}>
      <EventGrid
        events={host.events}
        header={
          <View style={{ gap: 16, paddingBottom: 20 }}>
            {resource.warning && (
              <DataNotice retry={resource.retry} loading={resource.loading} />
            )}
            <Avatar name={host.name} uri={host.avatarUrl} />
            <Title>{host.name}</Title>
            <Body>{host.bio}</Body>
            <Title>Hosted gatherings</Title>
          </View>
        }
        empty="No hosted events"
      />
    </Page>
  );
}
