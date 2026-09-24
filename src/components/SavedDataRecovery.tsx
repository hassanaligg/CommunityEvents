import { useState } from 'react';
import { AppText } from './AppText';
import { Button } from './Button';
import { strings } from '@/constants/strings';
import { useRsvpActions } from '@/store/RsvpContext';

export function SavedDataRecovery() {
  const [confirming, setConfirming] = useState(false);
  const actions = useRsvpActions();
  if (!confirming)
    return (
      <Button
        label={strings.errors.reset}
        onPress={() => setConfirming(true)}
      />
    );
  return (
    <>
      <AppText variant="body" accessibilityRole="alert">
        {strings.errors.resetWarning}
      </AppText>
      <Button
        label={strings.errors.resetCancel}
        onPress={() => setConfirming(false)}
      />
      <Button
        label={strings.errors.resetConfirm}
        onPress={() => {
          setConfirming(false);
          actions.reset();
        }}
      />
    </>
  );
}
