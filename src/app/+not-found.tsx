import { router } from 'expo-router';
import { Button, Page, StateView } from '@/components/ui';
export default function NotFound() {
  return (
    <Page>
      <StateView
        title="This page wandered off."
        message="There are still plenty of people to meet."
      />
      <Button label="Discover events" onPress={() => router.replace('/')} />
    </Page>
  );
}
