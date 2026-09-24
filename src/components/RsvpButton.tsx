import { AppText } from '@/components/AppText';
import { strings } from '@/constants/strings';
import { StyleSheet, View } from 'react-native';
import { CommunityEvent } from '@/types';
import { Button } from '@/components/Button';
import { useRsvpActions, useRsvps } from '@/store/RsvpContext';
type RsvpButtonProps = { event: CommunityEvent };

export function RsvpButton({ event }: RsvpButtonProps) {
  const state = useRsvps(),
    actions = useRsvpActions();
  const selected = !!state.joined[event.id],
    pending = !!state.pending[event.id];
  return (
    <View style={styles.container}>
      <Button
        label={
          pending
            ? selected
              ? strings.rsvp.savingJoined
              : strings.rsvp.savingJoin
            : selected
              ? strings.rsvp.cancel
              : strings.rsvp.join
        }
        selected={selected}
        disabled={pending || state.status !== 'ready'}
        onPress={() => {
          void actions.toggle(event);
        }}
      />
      {state.errors[event.id] && (
        <>
          <AppText accessibilityRole="alert" tone="error">
            {state.errors[event.id]}
          </AppText>
          <Button
            label={strings.rsvp.retry}
            onPress={() => {
              void actions.toggle(event);
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
});
