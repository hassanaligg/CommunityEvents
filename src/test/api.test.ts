import { afterEach, describe, expect, it, jest } from '@jest/globals';
import catalog from '@/data/events.json';
import {
  fetchEvents,
  fetchEventDetails,
  fetchHostProfile,
} from '@/services/api';
import { parseDetail, parseEvents, parseHost } from '@/utils/validation';

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}
const detail = catalog[0]!;
const host = {
  ...detail.host,
  events: catalog.filter((e) => e.hostId === detail.hostId),
};
afterEach(() => {
  jest.restoreAllMocks();
});

describe('fetch functions', () => {
  it('loads and validates the three endpoints', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response(catalog))
      .mockResolvedValueOnce(response(detail))
      .mockResolvedValueOnce(response(host));
    expect((await fetchEvents()).data[0]?.startsAt).toBe(detail.date);
    const event = await fetchEventDetails('event-1');
    expect(event.usingFallback).toBe(false);
    expect(event.data?.attendeePreview[0]?.name).toBe('Sam Lee');
    expect(
      (await fetchHostProfile('maya')).data?.events.map((e) => e.id),
    ).toEqual(host.events.map((e) => e.id));
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      'https://dgm45.wiremockapi.cloud/api/events',
      'https://dgm45.wiremockapi.cloud/api/events/event-1',
      'https://dgm45.wiremockapi.cloud/api/hosts/maya',
    ]);
  });
  it('returns marked sample data for all three APIs on HTTP failure', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => response({}, 503));
    for (const result of [
      await fetchEvents(),
      await fetchEventDetails('event-1'),
      await fetchHostProfile('maya'),
    ]) {
      expect(result.usingFallback).toBe(true);
      expect(result.data).toBeDefined();
    }
  });
  it('retries normally and does not cache a previous API result', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(response([]))
      .mockRejectedValueOnce(new Error('offline'));
    expect((await fetchEvents()).usingFallback).toBe(true);
    expect(await fetchEvents()).toEqual({ data: [], usingFallback: false });
    expect((await fetchEvents()).data).toHaveLength(7);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it('preserves valid empty lists and resource 404 responses', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response({}, 404))
      .mockResolvedValueOnce(response({}, 404));
    expect(await fetchEvents()).toEqual({ data: [], usingFallback: false });
    expect(await fetchEventDetails('event-1')).toEqual({
      data: undefined,
      usingFallback: false,
    });
    expect(await fetchHostProfile('maya')).toEqual({
      data: undefined,
      usingFallback: false,
    });
  });
  it('falls back on invalid JSON, malformed data and mismatched IDs', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('{'))
      .mockResolvedValueOnce(response({ not: 'an array' }))
      .mockResolvedValueOnce(response(catalog[1]))
      .mockResolvedValueOnce(response({ ...host, id: 'other' }));
    expect((await fetchEvents()).usingFallback).toBe(true);
    expect((await fetchEvents()).usingFallback).toBe(true);
    expect((await fetchEventDetails('event-1')).usingFallback).toBe(true);
    expect((await fetchHostProfile('maya')).usingFallback).toBe(true);
  });
  it('does not use fallback for cancelled requests', async () => {
    const controller = new AbortController();
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => {
        controller.abort();
        throw new Error('cancelled');
      });
    await expect(fetchEvents(controller.signal)).rejects.toThrow();
    await expect(fetchEvents(controller.signal)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('reports unavailable resources when neither API nor samples can supply them', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    await expect(fetchEventDetails('new-event')).rejects.toThrow(
      'Event unavailable',
    );
    await expect(fetchHostProfile('new-host')).rejects.toThrow(
      'Host unavailable',
    );
  });
  it('rejects malformed route IDs without making a request', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch');
    expect((await fetchEventDetails('../invalid')).data).toBeUndefined();
    expect((await fetchHostProfile('')).data).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
it('rejects duplicate IDs, malformed dates and inconsistent profiles', () => {
  expect(() => parseEvents([detail, detail])).toThrow();
  expect(() => parseEvents([{ ...detail, date: 'tomorrow' }])).toThrow();
  expect(() =>
    parseDetail({ ...detail, host: { ...detail.host, id: 'wrong' } }),
  ).toThrow();
  expect(() => parseHost({ ...host, events: catalog })).toThrow();
});
