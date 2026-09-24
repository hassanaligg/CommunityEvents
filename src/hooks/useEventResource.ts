import { useCallback } from 'react';
import { useResource } from './useResource';
import { useRsvpActions } from '@/store/RsvpContext';
import { CommunityEvent, EventDetail, FetchResult, HostProfile } from '@/types';

// Only live responses may replace saved snapshots; fallback samples can be older.
export function useEventResource<T>(
  loader: (signal: AbortSignal) => Promise<FetchResult<T>>,
  selectEvents: (data: T) => readonly CommunityEvent[],
) {
  const { sync } = useRsvpActions();
  return useResource(
    useCallback(
      async (signal: AbortSignal) => {
        const result = await loader(signal);
        if (!signal.aborted && !result.usingFallback)
          await sync(selectEvents(result.data));
        return result;
      },
      [loader, selectEvents, sync],
    ),
  );
}

export const listEvents = (events: CommunityEvent[]) => events;
export const detailEvents = (event: EventDetail | undefined) =>
  event ? [event] : [];
export const hostEvents = (host: HostProfile | undefined) => host?.events ?? [];
