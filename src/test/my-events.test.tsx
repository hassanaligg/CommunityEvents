import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { MyEventsScreen } from '@/screens/MyEventsScreen';
import { DiscoverScreen } from '@/screens/DiscoverScreen';
import { RsvpProvider } from '@/store/RsvpContext';
import { CommunityEvent } from '@/types';
import { parseEnvelope, STORAGE_KEY } from '@/utils/storage';
import * as api from '@/services/api';
import { strings } from '@/constants/strings';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn() },
}));
jest.mock('@/hooks/useClock', () => ({
  useClock: () => Date.parse('2026-09-24T12:00:00Z'),
}));
jest.mock(
  'react-native-safe-area-context',
  () =>
    jest.requireActual<
      typeof import('react-native-safe-area-context/jest/mock')
    >('react-native-safe-area-context/jest/mock').default,
);

const future: CommunityEvent = {
  id: 'future',
  title: 'Upcoming gathering',
  category: 'Music',
  startsAt: '2026-10-01T14:00:00Z',
  location: 'Dubai',
  hostId: 'maya',
  baseAttendeeCount: 10,
};
const past: CommunityEvent = {
  ...future,
  id: 'past',
  title: 'Previous gathering',
  startsAt: '2026-09-20T14:00:00Z',
};
function saved(events: CommunityEvent[]) {
  let raw = JSON.stringify({
    version: 1,
    seed: '2026-09-24T12:00:00Z',
    rsvps: Object.fromEntries(events.map((e) => [e.id, e])),
  });
  return {
    getItem: async (_key: string) => raw,
    setItem: jest.fn(async (_key: string, value: string) => {
      raw = value;
    }),
  };
}
const press = (element: Parameters<typeof fireEvent.press>[0]) =>
  act(async () => {
    fireEvent.press(element);
  });

afterEach(() => {
  jest.restoreAllMocks();
});

describe('My Events screen', () => {
  it('renders saved Upcoming/Past lists and persists cancellation across remounts', async () => {
    const storage = saved([future, past]);
    const fetch = jest.spyOn(api, 'fetchEvents');
    let tree = await render(
      <RsvpProvider storage={storage}>
        <MyEventsScreen />
      </RsvpProvider>,
    );
    await screen.findByText(future.title);
    expect(screen.queryByText(past.title)).toBeNull();
    expect(screen.getByText('11 attending')).toBeTruthy();
    await press(screen.getByRole('button', { name: 'Past' }));
    await screen.findByText(past.title);
    expect(screen.queryByText(future.title)).toBeNull();
    await press(screen.getByRole('button', { name: strings.rsvp.cancel }));
    await screen.findByText('No past RSVPs');
    await waitFor(async () =>
      expect(
        parseEnvelope(await storage.getItem(STORAGE_KEY)).rsvps.past,
      ).toBeUndefined(),
    );
    await tree.unmount();
    tree = await render(
      <RsvpProvider storage={storage}>
        <MyEventsScreen />
      </RsvpProvider>,
    );
    await screen.findByText(future.title);
    await press(screen.getByRole('button', { name: 'Past' }));
    expect(screen.getByText('No past RSVPs')).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refreshes title, count and dates, moves events between tabs and persists the changes', async () => {
    const storage = saved([future]);
    const updated = {
      ...future,
      title: 'Rescheduled gathering',
      startsAt: past.startsAt,
      baseAttendeeCount: 30,
    };
    jest
      .spyOn(api, 'fetchEvents')
      .mockResolvedValue({ data: [updated, past], usingFallback: false });
    const tree = await render(
      <RsvpProvider storage={storage}>
        <MyEventsScreen />
      </RsvpProvider>,
    );
    await screen.findByText(future.title);
    await press(screen.getByRole('button', { name: strings.myEvents.refresh }));
    await screen.findByText('No upcoming RSVPs');
    await press(screen.getByRole('button', { name: 'Past' }));
    await screen.findByText(updated.title);
    expect(screen.getByText('31 attending')).toBeTruthy();
    expect(screen.queryByText(past.title)).toBeNull();
    expect(parseEnvelope(await storage.getItem(STORAGE_KEY)).rsvps).toEqual({
      future: updated,
    });
    await tree.unmount();
    await render(
      <RsvpProvider storage={storage}>
        <MyEventsScreen />
      </RsvpProvider>,
    );
    await press(screen.getByRole('button', { name: 'Past' }));
    await screen.findByText(updated.title);
  });

  it('keeps saved data on offline fallback, then retries with live data', async () => {
    const storage = saved([future]);
    const updated = { ...future, title: 'Live gathering' };
    jest
      .spyOn(api, 'fetchEvents')
      .mockResolvedValueOnce({
        data: [{ ...future, title: 'Old demo event' }],
        usingFallback: true,
      })
      .mockResolvedValueOnce({ data: [updated], usingFallback: false });
    await render(
      <RsvpProvider storage={storage}>
        <MyEventsScreen />
      </RsvpProvider>,
    );
    await screen.findByText(future.title);
    await press(screen.getByRole('button', { name: strings.myEvents.refresh }));
    await screen.findByText(strings.myEvents.refreshFailed);
    expect(screen.getByText(future.title)).toBeTruthy();
    expect(storage.setItem).not.toHaveBeenCalled();
    await press(screen.getByRole('button', { name: strings.myEvents.refresh }));
    await screen.findByText(updated.title);
    expect(screen.queryByText(strings.myEvents.refreshFailed)).toBeNull();
  });

  it('preserves membership and snapshots when the live list omits a saved event', async () => {
    const storage = saved([future]);
    jest
      .spyOn(api, 'fetchEvents')
      .mockResolvedValue({ data: [], usingFallback: false });
    await render(
      <RsvpProvider storage={storage}>
        <MyEventsScreen />
      </RsvpProvider>,
    );
    await screen.findByText(future.title);
    await press(screen.getByRole('button', { name: strings.myEvents.refresh }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: strings.myEvents.refresh }),
      ).toBeEnabled(),
    );
    expect(screen.getByText(future.title)).toBeTruthy();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('preserves saved details and shows a retryable error when refreshed data cannot be stored', async () => {
    const storage = saved([future]);
    storage.setItem.mockRejectedValueOnce(new Error('quota'));
    const updated = { ...future, title: 'Updated gathering' };
    jest
      .spyOn(api, 'fetchEvents')
      .mockResolvedValue({ data: [updated], usingFallback: false });
    await render(
      <RsvpProvider storage={storage}>
        <MyEventsScreen />
      </RsvpProvider>,
    );
    await screen.findByText(future.title);
    await press(screen.getByRole('button', { name: strings.myEvents.refresh }));
    await screen.findByText(strings.errors.syncSaved);
    expect(screen.getByText(future.title)).toBeTruthy();
    expect(
      parseEnvelope(await storage.getItem(STORAGE_KEY)).rsvps.future,
    ).toEqual(future);
    await press(screen.getByRole('button', { name: strings.myEvents.refresh }));
    await screen.findByText(updated.title);
    expect(screen.queryByText(strings.errors.syncSaved)).toBeNull();
  });

  it('synchronizes saved RSVPs after refreshing Discover', async () => {
    const storage = saved([future]);
    const updated = { ...future, title: 'Fresh from Discover' };
    const fetch = jest
      .spyOn(api, 'fetchEvents')
      .mockResolvedValueOnce({ data: [future], usingFallback: false })
      .mockResolvedValueOnce({ data: [updated], usingFallback: false });
    const tree = await render(
      <RsvpProvider storage={storage}>
        <DiscoverScreen />
      </RsvpProvider>,
    );
    await screen.findByText(future.title);
    // Pull-to-refresh exercises the same live-result synchronization as initial loading.
    const { FlatList } =
      jest.requireActual<typeof import('react-native')>('react-native');
    await act(async () => {
      fireEvent(tree.UNSAFE_getByType(FlatList), 'refresh');
    });
    await screen.findByText(updated.title);
    expect(fetch).toHaveBeenCalledTimes(2);
    await tree.rerender(
      <RsvpProvider storage={storage}>
        <MyEventsScreen />
      </RsvpProvider>,
    );
    await screen.findByText(updated.title);
    expect(
      parseEnvelope(await storage.getItem(STORAGE_KEY)).rsvps.future?.title,
    ).toBe(updated.title);
  });
});
