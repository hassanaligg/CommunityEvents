import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Cover, usePalette } from '@/components/ui';
import { formatDate } from '@/utils/dates';
import { CommunityEvent } from '@/types';
export const EventCard = memo(function EventCard({
  event,
  joined,
  onOpen,
  action,
}: {
  event: CommunityEvent;
  joined: boolean;
  onOpen(): void;
  action: React.ReactNode;
}) {
  const p = usePalette();
  return (
    <View
      style={{
        padding: 14,
        gap: 14,
        backgroundColor: p.surface,
        borderWidth: 1,
        borderColor: p.border,
        borderRadius: 24,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${event.title}`}
        onPress={onOpen}
        style={{ gap: 10 }}
      >
        <Cover uri={event.imageUrl} title={event.title} />
        <Text
          style={{
            color: p.accent,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 1,
          }}
        >
          {event.category.toUpperCase()}
        </Text>
        <Text
          style={{
            fontSize: 22,
            lineHeight: 28,
            fontWeight: '700',
            color: p.text,
          }}
        >
          {event.title}
        </Text>
        <Body>{formatDate(event.startsAt, event.timeZone)}</Body>
        <Body>{event.location}</Body>
      </Pressable>
      <Text style={{ color: p.muted }}>
        {event.baseAttendeeCount + Number(joined)} attending
      </Text>
      {action}
    </View>
  );
});
