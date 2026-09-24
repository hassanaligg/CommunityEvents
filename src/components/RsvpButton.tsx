import { View, Text } from 'react-native';
import { CommunityEvent } from '@/types';
import { Button, usePalette } from '@/components/ui';
import { useRsvpActions, useRsvps } from '@/store/RsvpContext';
export function RsvpButton({ event }: { event: CommunityEvent }) {
  const state = useRsvps(),
    actions = useRsvpActions(),
    p = usePalette();
  const selected = !!state.joined[event.id],
    pending = !!state.pending[event.id];
  return (
    <View style={{ gap: 8 }}>
      <Button
        label={
          pending
            ? selected
              ? '✓ Going · Saving…'
              : '+ RSVP · Saving…'
            : selected
              ? '✓ Going · Cancel RSVP'
              : '+ RSVP'
        }
        selected={selected}
        disabled={pending || state.status !== 'ready'}
        onPress={() => {
          void actions.toggle(event);
        }}
      />
      {state.errors[event.id] && (
        <>
          <Text accessibilityRole="alert" style={{ color: p.error }}>
            {state.errors[event.id]}
          </Text>
          <Button
            label="Retry RSVP"
            onPress={() => {
              void actions.toggle(event);
            }}
          />
        </>
      )}
    </View>
  );
}
