import { RsvpButton } from '@/components/RsvpButton';
import { StateView } from '@/components/ui';
import { useRsvps } from '@/store/RsvpContext';
import { CommunityEvent } from '@/types';
import { columnsForWidth } from '@/utils/dates';
import { router } from 'expo-router';
import { ReactElement } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { EventCard } from './EventCard';
export function EventGrid({
  events,
  header,
  footer,
  empty = 'No events yet',
  refreshing = false,
  onRefresh,
}: {
  events: CommunityEvent[];
  header?: ReactElement;
  footer?: ReactElement;
  empty?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const { width } = useWindowDimensions(),
    state = useRsvps(),
    columns = columnsForWidth(width);
  return (
    <FlatList
      style={{ flex: 1 }}
      key={columns}
      numColumns={columns}
      data={events}
      keyExtractor={(e) => e.id}
      contentContainerStyle={{ gap: 18, paddingBottom: 24 }}
      columnWrapperStyle={columns === 2 ? { gap: 18 } : undefined}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={
        <StateView
          title={empty}
          message="Try another category or discover something new to join."
        />
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <View style={{ width: columns === 2 ? '48.5%' : '100%' }}>
          <EventCard
            event={item}
            joined={!!state.joined[item.id]}
            onOpen={() =>
              router.push({ pathname: '/event/[id]', params: { id: item.id } })
            }
            action={<RsvpButton event={item} />}
          />
        </View>
      )}
    />
  );
}
