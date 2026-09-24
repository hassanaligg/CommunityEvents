import { AppText } from '@/components/AppText';
import { strings } from '@/constants/strings';
import { FilterTabs } from '@/components/FilterTabs';
import { layout } from '@/theme/layout';
import { DataNotice } from '@/components/DataNotice';
import { EventGrid } from '@/components/EventGrid';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { useClock } from '@/hooks/useClock';
import { useEventResource, listEvents } from '@/hooks/useEventResource';
import { fetchEvents } from '@/services/api';
import { categories } from '@/types';
import { isUpcoming } from '@/utils/dates';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export function DiscoverScreen() {
  const [category, setCategory] = useState('All');
  const now = useClock();
  const resource = useEventResource(fetchEvents, listEvents);
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
        <StateView title={strings.discover.loading} loading />
      ) : (
        <EventGrid
          events={events}
          empty={
            category === 'All'
              ? strings.discover.empty
              : strings.discover.emptyCategory(
                  strings.categories[
                    category as keyof typeof strings.categories
                  ],
                )
          }
          refreshing={resource.loading}
          onRefresh={resource.retry}
          header={
            <View style={styles.header}>
              <AppText variant="title" accessibilityRole="header">
                {strings.discover.title}
              </AppText>
              <AppText variant="body" tone="muted">
                {strings.discover.subtitle}
              </AppText>
              <FilterTabs
                options={['All', ...categories]}
                selected={category}
                onSelect={setCategory}
                getLabel={(value) =>
                  value === 'All'
                    ? strings.discover.all
                    : strings.categories[
                        value as keyof typeof strings.categories
                      ]
                }
              />
              {resource.warning && (
                <DataNotice retry={resource.retry} loading={resource.loading} />
              )}
              {resource.error && (
                <StateView
                  title={strings.discover.error}
                  message={resource.error}
                  retry={resource.retry}
                />
              )}
              <AppText variant="body" tone="muted">
                {strings.discover.order}
              </AppText>
            </View>
          }
        />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: layout.sectionGap, paddingBottom: 8 },
});
