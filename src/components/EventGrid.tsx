import { RsvpButton } from '@/components/RsvpButton';
import { StateView } from '@/components/StateView';
import { strings } from '@/constants/strings';
import { useRsvps } from '@/store/RsvpContext';
import { columnsForWidth, layout } from '@/theme/layout';
import { CommunityEvent } from '@/types';
import { router } from 'expo-router';
import { ReactElement } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { EventCard } from './EventCard';
type EventGridProps = {
  events: CommunityEvent[];
  header?: ReactElement;
  footer?: ReactElement;
  empty?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function EventGrid({
  events,
  header,
  footer,
  empty = strings.grid.empty,
  refreshing = false,
  onRefresh,
}: EventGridProps) {
  const { width } = useWindowDimensions();
  const state = useRsvps();
  const columns = columnsForWidth(width);
  return (
    <FlatList
      style={styles.list}
      key={columns}
      numColumns={columns}
      data={events}
      showsVerticalScrollIndicator={false}
      keyExtractor={(e) => e.id}
      contentContainerStyle={styles.content}
      columnWrapperStyle={columns === 2 ? styles.row : undefined}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={
        <StateView title={empty} message={strings.grid.emptyMessage} />
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <View
          style={columns === 2 ? styles.twoColumnItem : styles.oneColumnItem}
        >
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

const styles = StyleSheet.create({
  twoColumnItem: { width: '48.5%' },
  oneColumnItem: { width: '100%' },
  list: { flex: 1 },
  content: { gap: layout.gridGap, paddingBottom: 24 },
  row: { gap: layout.gridGap },
});
