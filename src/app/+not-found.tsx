import { strings } from '@/constants/strings';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
export default function NotFound() {
  return (
    <Page>
      <StateView
        title={strings.errors.pageNotFound}
        message={strings.errors.pageNotFoundMessage}
      />
      <Button
        label={strings.common.discoverEvents}
        onPress={() => router.replace('/')}
      />
    </Page>
  );
}
