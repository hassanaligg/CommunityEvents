import { useLocalSearchParams } from 'expo-router';
import { EventDetailScreen } from '@/screens/EventDetailScreen';
import { validId } from '@/utils/validation';
import { Page, StateView } from '@/components/ui';
export default function Route() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  return validId(id) ? (
    <EventDetailScreen key={id} id={id} />
  ) : (
    <Page>
      <StateView
        title="Invalid link"
        message="This link has an invalid identifier."
      />
    </Page>
  );
}
