import { describe, expect, it, jest } from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Text } from 'react-native';
import { Persistence, parseEnvelope, StorageAdapter } from '@/utils/storage';
import { CommunityEvent } from '@/types';
import { EventCard } from '@/components/EventCard';
import {
  RsvpProvider,
  useRsvps,
  useRsvpActions,
  initialState,
  rsvpReducer,
} from '@/store/RsvpContext';
import { RsvpButton } from '@/components/RsvpButton';
import { columnsForWidth, isUpcoming } from '@/utils/dates';
const now = () => Date.parse('2026-09-21T12:00:00Z');
const event: CommunityEvent = {
  id: 'event-a',
  title: 'Community music',
  category: 'Music',
  startsAt: '2026-09-22T12:00:00Z',
  endsAt: '2026-09-22T14:00:00Z',
  location: 'Dubai',
  description: 'Meet our community.',
  hostId: 'maya',
  baseAttendeeCount: 10,
  attendeePreviewIds: [],
};
function memory() {
  let raw: string | null = null;
  return {
    getItem: async () => raw,
    setItem: async (_key: string, value: string) => {
      raw = value;
    },
  };
}
function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
function CardHarness({ onOpen }: { onOpen: () => void }) {
  const state = useRsvps();
  return (
    <>
      <Text>{state.status}</Text>
      <EventCard
        event={event}
        joined={!!state.joined[event.id]}
        onOpen={onOpen}
        action={<RsvpButton event={event} />}
      />
      <Text>{Object.keys(state.joined).join(',') || 'No joined events'}</Text>
    </>
  );
}
describe('RSVP component and actual persistence', () => {
  it('updates count and selection before the write completes, without navigating', async () => {
    const backing = memory(),
      pending = deferred(),
      onOpen = jest.fn();
    let writes = 0;
    const storage: StorageAdapter = {
      getItem: backing.getItem,
      setItem: async (key, value) => {
        writes++;
        if (writes === 2) await pending.promise;
        await backing.setItem(key, value);
      },
    };
    await render(
      <RsvpProvider storage={storage} now={now}>
        <CardHarness onOpen={onOpen} />
      </RsvpProvider>,
    );
    await screen.findByText('ready');
    expect(screen.getByText('10 attending')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: '+ RSVP' }));
    expect(screen.getByText('11 attending')).toBeTruthy();
    expect(screen.getByRole('button', { selected: true })).toBeDisabled();
    expect(screen.getByText('event-a')).toBeTruthy();
    expect(onOpen).not.toHaveBeenCalled();
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    await fireEvent.press(
      await screen.findByRole('button', { name: '✓ Going · Cancel RSVP' }),
    );
    expect(screen.getByText('10 attending')).toBeTruthy();
    expect(
      await screen.findByRole('button', { name: '+ RSVP', selected: false }),
    ).toBeTruthy();
  });
  it('restores membership in a new provider, then persists and restores removal', async () => {
    const storage = memory();
    let tree = await render(
      <RsvpProvider storage={storage} now={now}>
        <CardHarness onOpen={() => {}} />
      </RsvpProvider>,
    );
    await screen.findByText('ready');
    await fireEvent.press(screen.getByRole('button', { name: '+ RSVP' }));
    await screen.findByRole('button', { name: '✓ Going · Cancel RSVP' });
    await tree.unmount();
    tree = await render(
      <RsvpProvider storage={storage} now={now}>
        <CardHarness onOpen={() => {}} />
      </RsvpProvider>,
    );
    await screen.findByText('ready');
    expect(screen.getByText('event-a')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: '✓ Going · Cancel RSVP' }),
    );
    await screen.findByRole('button', { name: '+ RSVP' });
    await tree.unmount();
    await render(
      <RsvpProvider storage={storage} now={now}>
        <CardHarness onOpen={() => {}} />
      </RsvpProvider>,
    );
    await screen.findByText('ready');
    expect(screen.getByText('No joined events')).toBeTruthy();
  });
  it('rolls back failed writes and supports retry', async () => {
    const backing = memory();
    let fail = false;
    const storage = {
      getItem: backing.getItem,
      setItem: async (k: string, v: string) => {
        if (fail) throw new Error('quota');
        await backing.setItem(k, v);
      },
    };
    await render(
      <RsvpProvider storage={storage} now={now}>
        <CardHarness onOpen={() => {}} />
      </RsvpProvider>,
    );
    await screen.findByText('ready');
    fail = true;
    await fireEvent.press(screen.getByRole('button', { name: '+ RSVP' }));
    await screen.findByText('Your RSVP could not be saved. Please try again.');
    expect(screen.getByText('10 attending')).toBeTruthy();
    fail = false;
    await fireEvent.press(screen.getByRole('button', { name: 'Retry RSVP' }));
    await screen.findByRole('button', { name: '✓ Going · Cancel RSVP' });
    expect(screen.getByText('11 attending')).toBeTruthy();
  });
  it('guards two synchronous actions for the same event', async () => {
    const storage = memory(),
      pending = deferred();
    let writes = 0;
    const adapter = {
      getItem: storage.getItem,
      setItem: async (k: string, v: string) => {
        writes++;
        if (writes > 1) await pending.promise;
        await storage.setItem(k, v);
      },
    };
    function DoublePress() {
      const { toggle } = useRsvpActions();
      const state = useRsvps();
      return (
        <Text
          onPress={() => {
            void toggle(event);
            void toggle(event);
          }}
        >
          {state.status}
        </Text>
      );
    }
    await render(
      <RsvpProvider storage={adapter} now={now}>
        <DoublePress />
      </RsvpProvider>,
    );
    await fireEvent.press(await screen.findByText('ready'));
    await waitFor(() => expect(writes).toBe(2));
    await act(async () => pending.resolve());
    expect(writes).toBe(2);
  });
});
describe('durable queue and boundaries', () => {
  it('does not persist a failed event when a second queued event succeeds', async () => {
    const storage = memory();
    let writes = 0;
    const p = new Persistence(
      {
        getItem: storage.getItem,
        setItem: async (k, v) => {
          writes++;
          if (writes === 2) throw new Error('quota');
          await storage.setItem(k, v);
        },
      },
      now,
    );
    await p.hydrate();
    const first = p.save(event, true),
      second = p.save({ ...event, id: 'event-b' }, true);
    await expect(first).rejects.toThrow('quota');
    await second;
    const restored = await new Persistence(storage, now).hydrate();
    expect(Object.keys(restored.rsvps)).toEqual(['event-b']);
  });
  it('preserves corrupt storage and reports hydration failure', async () => {
    const write = jest.fn(async () => {});
    const p = new Persistence(
      { getItem: async () => 'broken json', setItem: write },
      now,
    );
    await expect(p.hydrate()).rejects.toThrow();
    expect(write).not.toHaveBeenCalled();
    expect(() => parseEnvelope('{"version":2}')).toThrow();
  });
  it('ignores stale acknowledgements', () => {
    const state = rsvpReducer(
      { ...initialState, status: 'ready' },
      { type: 'request', event, joined: true, request: 2 },
    );
    expect(
      rsvpReducer(state, {
        type: 'settle',
        id: event.id,
        request: 1,
        error: 'late',
      }),
    ).toBe(state);
  });
  it('treats ongoing events as upcoming and the exact end as past', () => {
    expect(isUpcoming(event, Date.parse('2026-09-22T13:00:00Z'))).toBe(true);
    expect(isUpcoming(event, Date.parse(event.endsAt ?? ''))).toBe(false);
    expect([767, 768, 769].map(columnsForWidth)).toEqual([1, 2, 2]);
  });
});
