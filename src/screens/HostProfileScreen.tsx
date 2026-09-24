import { AppText } from '@/components/AppText';
import { strings } from '@/constants/strings';
import { DataNotice } from '@/components/DataNotice';
import { EventGrid } from '@/components/EventGrid';
import { Avatar } from '@/components/Avatar';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { useEventResource, hostEvents } from '@/hooks/useEventResource';
import { fetchHostProfile } from '@/services/api';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

type HostProfileScreenProps = { id: string };

export function HostProfileScreen({ id }: HostProfileScreenProps) {
  const resource = useEventResource(
    useCallback((signal: AbortSignal) => fetchHostProfile(id, signal), [id]),
    hostEvents,
  );
  if (resource.loading && !resource.data)
    return (
      <Page>
        <StateView title={strings.host.loading} loading />
      </Page>
    );
  if (resource.error)
    return (
      <Page>
        <StateView
          title={strings.host.unavailable}
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
          title={strings.host.notFound}
          message={strings.host.notFoundMessage}
        />
      </Page>
    );
  return (
    <Page scroll={false}>
      <EventGrid
        events={host.events}
        header={
          <View style={styles.header}>
            {resource.warning && (
              <DataNotice retry={resource.retry} loading={resource.loading} />
            )}
            <Avatar name={host.name} uri={host.avatarUrl} />
            <AppText variant="title" accessibilityRole="header">
              {host.name}
            </AppText>
            <AppText variant="body" tone="muted">
              {host.bio}
            </AppText>
            <AppText variant="title" accessibilityRole="header">
              {strings.host.events}
            </AppText>
          </View>
        }
        empty={strings.host.empty}
      />
    </Page>
  );
}

const styles = StyleSheet.create({ header: { gap: 16, paddingBottom: 20 } });
