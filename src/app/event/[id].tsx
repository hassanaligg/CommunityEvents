import { strings } from '@/constants/strings';
import { useLocalSearchParams } from 'expo-router';
import { EventDetailScreen } from '@/screens/EventDetailScreen';
import { validId } from '@/utils/validation';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
export default function Route() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  return validId(id) ? (
    <EventDetailScreen key={id} id={id} />
  ) : (
    <Page>
      <StateView
        title={strings.errors.invalidLink}
        message={strings.errors.invalidLinkMessage}
      />
    </Page>
  );
}
