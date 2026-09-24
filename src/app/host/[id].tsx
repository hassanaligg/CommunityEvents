import { strings } from '@/constants/strings';
import { useLocalSearchParams } from 'expo-router';
import { HostProfileScreen } from '@/screens/HostProfileScreen';
import { validId } from '@/utils/validation';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
export default function Route() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  return validId(id) ? (
    <HostProfileScreen key={id} id={id} />
  ) : (
    <Page>
      <StateView
        title={strings.errors.invalidLink}
        message={strings.errors.invalidLinkMessage}
      />
    </Page>
  );
}
