import { AppText } from '@/components/AppText';
import { strings } from '@/constants/strings';
import { layout } from '@/theme/layout';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Cover } from '@/components/Cover';
import { usePalette, type Palette } from '@/theme/colors';
import { formatDate } from '@/utils/dates';
import { CommunityEvent } from '@/types';
type EventCardProps = {
  event: CommunityEvent;
  joined: boolean;
  onOpen(): void;
  action: React.ReactNode;
};

export const EventCard = memo(function EventCard({
  event,
  joined,
  onOpen,
  action,
}: EventCardProps) {
  const palette = usePalette();
  const styles = createStyles(palette);
  return (
    <View style={[styles.card, styles.containerColor]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.event.view(event.title)}
        onPress={onOpen}
        style={styles.content}
      >
        <Cover uri={event.imageUrl} title={event.title} />
        <AppText variant="category" tone="accent">
          {strings.categories[event.category].toUpperCase()}
        </AppText>
        <AppText variant="cardTitle">{event.title}</AppText>
        <AppText variant="body" tone="muted">
          {formatDate(event.startsAt, event.timeZone)}
        </AppText>
        <AppText variant="body" tone="muted">
          {event.location}
        </AppText>
      </Pressable>
      <AppText tone="muted">
        {strings.event.attending(event.baseAttendeeCount + Number(joined))}
      </AppText>
      {action}
    </View>
  );
});

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    containerColor: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
    },
    card: {
      padding: 14,
      gap: 14,
      borderWidth: 1,
      borderRadius: layout.cardRadius,
    },
    content: { gap: 10 },
  });
