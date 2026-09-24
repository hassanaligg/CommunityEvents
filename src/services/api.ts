import catalog from '@/data/events.json';
import { CommunityEvent, EventDetail, FetchResult, HostProfile } from '@/types';
import {
  parseDetail,
  parseEvents,
  parseHost,
  validId,
} from '@/utils/validation';

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://dgm45.wiremockapi.cloud'
).replace(/\/+$/, '');
export const REQUEST_TIMEOUT_MS = 15_000;

// Shared HTTP checks; each function below owns its validation and fallback.
async function fetchJson(
  path: string,
  signal?: AbortSignal,
  allowMissing = false,
): Promise<unknown> {
  if (signal?.aborted) throw new Error('Request cancelled.');
  const controller = new AbortController();
  let rejectRequest!: (error: Error) => void;
  const interrupted = new Promise<never>((_, reject) => {
    rejectRequest = reject;
  });
  const cancel = () => {
    rejectRequest(new Error('Request cancelled.'));
    controller.abort();
  };
  signal?.addEventListener('abort', cancel);
  const timer = setTimeout(() => {
    rejectRequest(new Error('Request timed out.'));
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(`${API_URL}${path}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (response.status === 404 && allowMissing) return undefined;
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data: unknown = await response.json();
        return data;
      })(),
      interrupted,
    ]);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export async function fetchEvents(
  signal?: AbortSignal,
): Promise<FetchResult<CommunityEvent[]>> {
  try {
    const data = parseEvents(await fetchJson('/api/events', signal));
    return { data, usingFallback: false };
  } catch (error) {
    if (signal?.aborted) throw error;
    return { data: parseEvents(catalog), usingFallback: true };
  }
}

export async function fetchEventDetails(
  id: string,
  signal?: AbortSignal,
): Promise<FetchResult<EventDetail | undefined>> {
  if (!validId(id)) return { data: undefined, usingFallback: false };
  try {
    const raw = await fetchJson(
      `/api/events/${encodeURIComponent(id)}`,
      signal,
      true,
    );
    if (raw === undefined) return { data: undefined, usingFallback: false };
    const data = parseDetail(raw);
    if (data.id !== id) throw new Error('Wrong event returned.');
    return { data, usingFallback: false };
  } catch (error) {
    if (signal?.aborted) throw error;
    const sample = catalog.find((event) => event.id === id);
    if (!sample) throw new Error('Event unavailable. Please try again.');
    return { data: parseDetail(sample), usingFallback: true };
  }
}

export async function fetchHostProfile(
  id: string,
  signal?: AbortSignal,
): Promise<FetchResult<HostProfile | undefined>> {
  if (!validId(id)) return { data: undefined, usingFallback: false };
  try {
    const raw = await fetchJson(
      `/api/hosts/${encodeURIComponent(id)}`,
      signal,
      true,
    );
    if (raw === undefined) return { data: undefined, usingFallback: false };
    const data = parseHost(raw);
    if (data.id !== id) throw new Error('Wrong host returned.');
    return { data, usingFallback: false };
  } catch (error) {
    if (signal?.aborted) throw error;
    const events = catalog.filter((event) => event.hostId === id);
    const host = events[0]?.host;
    if (!host) throw new Error('Host unavailable. Please try again.');
    return { data: parseHost({ ...host, events }), usingFallback: true };
  }
}
